import test from 'node:test';
import assert from 'node:assert/strict';
import { GameSession, SESSION_VERSION } from '../dist/session/game-session.js';
import { EVENTS } from '../dist/content/events/index.js';
import { EventIndex } from '../dist/narrative/event-index.js';
import { contentIdentity } from '../dist/session/content-identity.js';
import { PRE_T51_CONTENT_IDENTITY } from '../dist/session/pre-t51-legacy-registry.js';

const clone = value => structuredClone(value);
let commandSeq = 0;
const command = (s, type, extra = {}) => ({
  type,
  commandId: `migration-cmd-${++commandSeq}`,
  expectedRevision: s.getView().revision,
  ...extra
});
const errorCode = code => error => error?.code === code;

async function pending(session) {
  for (let i = 0; i < 200; i++) {
    const view = session.getView();
    if (view.screen === 'decision') return view.decision;
    if (view.screen === 'offer') {
      await session.dispatch(command(session, 'offer', { offerId: view.offer.id, action: 'accept' }));
      continue;
    }
    if (view.screen === 'result') {
      await session.dispatch(command(session, 'acknowledge'));
      continue;
    }
    assert.notEqual(view.screen, 'epilogue');
    await session.dispatch(command(session, 'continue'));
  }
  throw new Error('No decision within bounded migration test horizon');
}

function downgradeToV2(snapshot) {
  const next = clone(snapshot);
  next.sessionVersion = 2;
  delete next.decisionProvenance;
  if (next.pendingDecision) delete next.pendingDecision.provenance;
  return next;
}

async function sourceWithPending(seed = 701) {
  const session = await GameSession.create(seed, { sessionId: `migration-${seed}` });
  const decision = await pending(session);
  const snapshot = session.exportSnapshot();
  assert.equal(snapshot.contentIdentity, PRE_T51_CONTENT_IDENTITY, 'main ya no coincide con el freeze pre-T5.1');
  return { session, decision, snapshot };
}

async function sourceWithResolved(seed = 702, acknowledge = true) {
  const { session, decision } = await sourceWithPending(seed);
  const choose = command(session, 'choose', { pendingInstanceId: decision.instanceId, choiceId: decision.choices[0].id });
  await session.dispatch(choose);
  if (acknowledge) await session.dispatch(command(session, 'acknowledge'));
  return { session, snapshot: session.exportSnapshot(), choose };
}

async function targetWithMutation(eventId, mutate) {
  const events = clone(EVENTS);
  const event = events.find(row => row.id === eventId);
  assert.ok(event, `target event ${eventId} missing`);
  mutate(event);
  return { events, identity: await contentIdentity(events) };
}

function route(sourceIdentity, targetIdentity, extra = {}) {
  return { sourceContentIdentity: sourceIdentity, targetContentIdentity: targetIdentity, ...extra };
}

test('current v2 snapshot upgrades to Session v3 provenance without changing game/RNG truth', async () => {
  const { snapshot } = await sourceWithResolved(710);
  const old = downgradeToV2(snapshot);
  const beforeState = clone(old.state);
  const resumed = await GameSession.resume(old);
  const after = resumed.exportSnapshot();
  assert.equal(after.sessionVersion, SESSION_VERSION);
  assert.equal(after.sessionVersion, 3);
  assert.equal(after.contentIdentity, PRE_T51_CONTENT_IDENTITY);
  assert.equal(after.decisionProvenance.length, after.state.history.length);
  assert.ok(after.decisionProvenance.every(row => row.sourceContentIdentity === PRE_T51_CONTENT_IDENTITY));
  assert.deepEqual(after.state, beforeState);
});

test('unknown source identity is rejected explicitly and migration remains read-only', async () => {
  const { snapshot } = await sourceWithResolved(711);
  const old = downgradeToV2(snapshot);
  old.contentIdentity = 'f'.repeat(64);
  let commits = 0;
  await assert.rejects(
    GameSession.migrateAndResume(old, { commit: async () => { commits++; } }),
    errorCode('CONTENT_MIGRATION_UNSUPPORTED')
  );
  assert.equal(commits, 0);
});

test('exact-ID semantic collision keeps completed history/journal on legacy fingerprint and frees canonical seen state', async () => {
  const { snapshot } = await sourceWithResolved(712);
  const legacy = downgradeToV2(snapshot);
  const legacyHistory = clone(legacy.state.history);
  const legacyJournal = clone(legacy.journal);
  const legacyRng = clone(legacy.state.rngState);
  const eventId = legacy.state.history[0].eventId;
  const { events, identity } = await targetWithMutation(eventId, event => { event.text.body += ' · canonical rewrite'; });
  const migrationRoute = route(legacy.contentIdentity, identity, {
    schedulerMappings: [{ kind: 'distinct_scene', legacyEventId: eventId, canonicalEventId: eventId, clearCanonicalSeen: true, clearCanonicalCooldown: true }]
  });
  let commits = 0;
  const migrated = await GameSession.migrateAndResume(legacy, { events, migrationRoutes: [migrationRoute], commit: async () => { commits++; } });
  const after = migrated.exportSnapshot();
  assert.equal(commits, 0);
  assert.equal(after.contentIdentity, identity);
  assert.deepEqual(after.state.history, legacyHistory);
  assert.deepEqual(after.journal, legacyJournal);
  assert.deepEqual(after.state.rngState, legacyRng);
  assert.equal(after.decisionProvenance[0].sourceContentIdentity, PRE_T51_CONTENT_IDENTITY);
  assert.equal(after.state.flags[`SEEN_${eventId}`], false);
  assert.equal(after.state.eventCooldowns[eventId], undefined);
  const resumed = await GameSession.resume(clone(after), { events, migrationRoutes: [migrationRoute] });
  assert.deepEqual(resumed.exportSnapshot(), after);
});

test('pending exact-ID collision preserves the definition already shown and post-resolution does not suppress the repaired scene', async () => {
  const { decision, snapshot } = await sourceWithPending(713);
  const legacy = downgradeToV2(snapshot);
  const eventId = legacy.pendingDecision.event.id;
  const oldLabel = decision.choices[0].label;
  const { events, identity } = await targetWithMutation(eventId, event => {
    event.text.body += ' · new canon';
    event.choices[0].label += ' [new canon]';
  });
  const migrationRoute = route(legacy.contentIdentity, identity, {
    schedulerMappings: [{ kind: 'distinct_scene', legacyEventId: eventId, canonicalEventId: eventId, clearCanonicalSeen: true, clearCanonicalCooldown: true }]
  });
  const migrated = await GameSession.migrateAndResume(legacy, { events, migrationRoutes: [migrationRoute] });
  const view = migrated.getView();
  assert.equal(view.screen, 'decision');
  assert.equal(view.decision.choices[0].label, oldLabel);
  assert.notEqual(view.decision.choices[0].label, events.find(e => e.id === eventId).choices[0].label);
  const beforeRng = clone(migrated.exportSnapshot().state.rngState);
  await migrated.dispatch(command(migrated, 'choose', { pendingInstanceId: view.decision.instanceId, choiceId: view.decision.choices[0].id }));
  const after = migrated.exportSnapshot();
  assert.equal(after.state.history.at(-1).eventId, eventId);
  assert.equal(after.decisionProvenance.at(-1).sourceContentIdentity, PRE_T51_CONTENT_IDENTITY);
  assert.equal(after.state.flags[`SEEN_${eventId}`], false);
  assert.ok(after.state.rngState.narrative.draws >= beforeRng.narrative.draws, 'la elección puede consumir RNG, la migración no');
});

test('retired technical event remains historical evidence and is absent from the active scheduler', async () => {
  const { snapshot } = await sourceWithResolved(714);
  const legacy = downgradeToV2(snapshot);
  const retiredId = legacy.state.history[0].eventId;
  const events = clone(EVENTS).filter(event => event.id !== retiredId);
  const identity = await contentIdentity(events);
  const migrationRoute = route(legacy.contentIdentity, identity);
  const migrated = await GameSession.migrateAndResume(legacy, { events, migrationRoutes: [migrationRoute] });
  assert.equal(migrated.exportSnapshot().state.history[0].eventId, retiredId);
  assert.equal(migrated.exportSnapshot().decisionProvenance[0].sourceContentIdentity, PRE_T51_CONTENT_IDENTITY);
  assert.equal(new EventIndex(events).events.some(event => event.id === retiredId), false);
});

test('pending retired technical event resolves from frozen legacy definition and never re-enters the active scheduler', async () => {
  const { snapshot } = await sourceWithPending(719);
  const legacy = downgradeToV2(snapshot);
  const retiredId = legacy.pendingDecision.event.id;
  const frozenEvent = clone(legacy.pendingDecision.event);
  const events = clone(EVENTS).filter(event => event.id !== retiredId);
  const identity = await contentIdentity(events);
  const migrationRoute = route(legacy.contentIdentity, identity);
  const rngBefore = clone(legacy.state.rngState);

  const migrated = await GameSession.migrateAndResume(legacy, { events, migrationRoutes: [migrationRoute] });
  const afterMigration = migrated.exportSnapshot();
  assert.equal(afterMigration.contentIdentity, identity);
  assert.deepEqual(afterMigration.state.rngState, rngBefore);
  assert.deepEqual(afterMigration.pendingDecision.event, frozenEvent);
  assert.equal(afterMigration.pendingDecision.provenance.sourceContentIdentity, PRE_T51_CONTENT_IDENTITY);
  assert.equal(new EventIndex(events).events.some(event => event.id === retiredId), false);

  const view = migrated.getView();
  assert.equal(view.screen, 'decision');
  await migrated.dispatch(command(migrated, 'choose', {
    pendingInstanceId: view.decision.instanceId,
    choiceId: view.decision.choices[0].id
  }));
  const resolved = migrated.exportSnapshot();
  assert.equal(resolved.state.history.at(-1).eventId, retiredId);
  assert.equal(resolved.decisionProvenance.at(-1).sourceContentIdentity, PRE_T51_CONTENT_IDENTITY);
  assert.equal(resolved.pendingDecision, null);

  await migrated.dispatch(command(migrated, 'acknowledge'));
  await migrated.dispatch(command(migrated, 'continue', { maxDays: 30 }));
  const later = migrated.exportSnapshot();
  assert.notEqual(later.pendingDecision?.event.id, retiredId);
  assert.equal(new EventIndex(events).events.some(event => event.id === retiredId), false);
});

test('tampered legacy pending definition is rejected before content identity changes', async () => {
  const { snapshot } = await sourceWithPending(715);
  const legacy = downgradeToV2(snapshot);
  const pendingId = legacy.pendingDecision.event.id;
  const { events, identity } = await targetWithMutation(EVENTS.find(e => e.id !== pendingId).id, event => { event.text.body += ' · unrelated target change'; });
  const migrationRoute = route(legacy.contentIdentity, identity);
  legacy.pendingDecision.event.text.title += ' [tampered]';
  await assert.rejects(
    GameSession.migrateAndResume(legacy, { events, migrationRoutes: [migrationRoute] }),
    errorCode('INVALID_SAVE')
  );
  assert.equal(legacy.contentIdentity, PRE_T51_CONTENT_IDENTITY);
});

test('mixed legacy and current history remains valid across migration, command commit and strict resume', async () => {
  const { snapshot } = await sourceWithResolved(716);
  const legacy = downgradeToV2(snapshot);
  const synthetic = clone(EVENTS[0]);
  synthetic.id = 'EVT_T51_MIGRATION_CURRENT_001';
  synthetic.phase = legacy.state.phase;
  synthetic.ageWindow = [legacy.state.age, null];
  synthetic.gates = [];
  synthetic.exclusions = [];
  delete synthetic.timeWindow;
  synthetic.cooldown = 0;
  synthetic.repeatable = false;
  synthetic.weight = 1_000_000;
  synthetic.text = { title: 'Current catalog marker', body: 'Synthetic directed migration test event.' };
  synthetic.choices = [{ id: 'CONTINUE', label: 'Continue', intentTags: [], outcomeIds: ['DONE'] }];
  synthetic.outcomes = [{ id: 'DONE', baseWeight: 1, effects: [], messages: ['Current event resolved.'] }];
  synthetic.seedsRead = [];
  synthetic.seedsWrite = [];
  synthetic.npcRefs = [];
  const events = [synthetic];
  const identity = await contentIdentity(events);
  const migrationRoute = route(legacy.contentIdentity, identity);
  const migrated = await GameSession.migrateAndResume(legacy, { events, migrationRoutes: [migrationRoute] });
  const beforeLegacyCount = migrated.exportSnapshot().state.history.length;
  const decision = await pending(migrated);
  assert.equal(migrated.exportSnapshot().pendingDecision.event.id, synthetic.id);
  await migrated.dispatch(command(migrated, 'choose', { pendingInstanceId: decision.instanceId, choiceId: decision.choices[0].id }));
  const mixed = migrated.exportSnapshot();
  assert.equal(mixed.state.history.length, beforeLegacyCount + 1);
  assert.equal(mixed.decisionProvenance[0].sourceContentIdentity, PRE_T51_CONTENT_IDENTITY);
  assert.equal(mixed.decisionProvenance.at(-1).sourceContentIdentity, identity);
  const resumed = await GameSession.resume(clone(mixed), { events, migrationRoutes: [migrationRoute] });
  assert.deepEqual(resumed.exportSnapshot(), mixed);
});

test('migration preserves seeds, NPC state, market, receipts and RNG and is idempotent once current', async () => {
  const { snapshot } = await sourceWithResolved(717, false);
  const legacy = downgradeToV2(snapshot);
  const unchanged = {
    seeds: clone(legacy.state.seeds),
    npcs: clone(legacy.state.npcs),
    relationships: clone(legacy.state.relationships),
    market: clone(legacy.state.market),
    receipts: clone(legacy.receipts),
    rng: clone(legacy.state.rngState),
    pendingResult: clone(legacy.pendingResult)
  };
  const eventId = legacy.state.history[0].eventId;
  const { events, identity } = await targetWithMutation(EVENTS.find(e => e.id !== eventId).id, event => { event.text.body += ' · target only'; });
  const migrationRoute = route(legacy.contentIdentity, identity);
  const first = await GameSession.migrateAndResume(legacy, { events, migrationRoutes: [migrationRoute] });
  const migrated = first.exportSnapshot();
  assert.deepEqual(migrated.state.seeds, unchanged.seeds);
  assert.deepEqual(migrated.state.npcs, unchanged.npcs);
  assert.deepEqual(migrated.state.relationships, unchanged.relationships);
  assert.deepEqual(migrated.state.market, unchanged.market);
  assert.deepEqual(migrated.receipts, unchanged.receipts);
  assert.deepEqual(migrated.state.rngState, unchanged.rng);
  assert.deepEqual(migrated.pendingResult, unchanged.pendingResult);
  const second = await GameSession.migrateAndResume(clone(migrated), { events, migrationRoutes: [migrationRoute] });
  assert.deepEqual(second.exportSnapshot(), migrated);
});

test('legacy committed command receipt still replays without duplicate effect after migration', async () => {
  const { session, decision } = await sourceWithPending(718);
  const choose = { type: 'choose', commandId: 'stable-choice-receipt', expectedRevision: session.getView().revision, pendingInstanceId: decision.instanceId, choiceId: decision.choices[0].id };
  await session.dispatch(choose);
  const source = session.exportSnapshot();
  const legacy = downgradeToV2(source);
  const eventId = legacy.state.history[0].eventId;
  const { events, identity } = await targetWithMutation(EVENTS.find(e => e.id !== eventId).id, event => { event.text.body += ' · target identity'; });
  const migrationRoute = route(legacy.contentIdentity, identity);
  const migrated = await GameSession.migrateAndResume(legacy, { events, migrationRoutes: [migrationRoute] });
  const before = migrated.exportSnapshot();
  const replay = await migrated.dispatch(choose);
  assert.equal(replay.replayed, true);
  assert.deepEqual(migrated.exportSnapshot(), before);
});
