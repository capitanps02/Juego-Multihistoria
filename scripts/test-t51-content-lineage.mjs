import test from 'node:test';
import assert from 'node:assert/strict';
import { GameSession } from '../dist/session/game-session.js';
import { contentIdentity } from '../dist/session/content-identity.js';
import {
  buildActiveEventEvidence,
  findMigrationPath
} from '../dist/session/content-migration.js';

const clone = value => structuredClone(value);
let seq = 0;
const command = (session, type, extra = {}) => ({
  type,
  commandId: `lineage-${++seq}`,
  expectedRevision: session.getView().revision,
  ...extra
});
const errorCode = code => error => error?.code === code;

function eventVariant(marker) {
  return {
    id: 'EVT_T51_LINEAGE_001',
    ageWindow: [18, null],
    phase: '18_20',
    family: 'life',
    gates: [],
    exclusions: [],
    cooldown: 99999,
    repeatable: false,
    weight: 1_000_000,
    tags: ['hard_deadline'],
    text: { title: `Lineage ${marker}`, body: `Canonical content ${marker}.` },
    intel: { visible: [`visible-${marker}`], uncertain: [] },
    choices: [{ id: 'CONTINUE', label: `Continue ${marker}`, intentTags: [], outcomeIds: ['DONE'] }],
    outcomes: [{ id: 'DONE', baseWeight: 1, effects: [], messages: [`resolved-${marker}`] }],
    seedsRead: [],
    seedsWrite: [],
    npcRefs: []
  };
}

async function catalog(marker) {
  const events = [eventVariant(marker)];
  const identity = await contentIdentity(events);
  const evidence = await buildActiveEventEvidence(events, identity);
  return { marker, events, identity, evidence };
}

function source(catalogValue) {
  return {
    contentIdentity: catalogValue.identity,
    engineBuild: '0.8.0-t2.5',
    sessionVersions: [3],
    events: catalogValue.evidence
  };
}

function route(from, to) {
  return {
    sourceContentIdentity: from.identity,
    targetContentIdentity: to.identity,
    schedulerMappings: [{
      kind: 'distinct_scene',
      legacyEventId: 'EVT_T51_LINEAGE_001',
      canonicalEventId: 'EVT_T51_LINEAGE_001',
      clearCanonicalSeen: true,
      clearCanonicalCooldown: true
    }]
  };
}

async function pending(session) {
  for (let i = 0; i < 8; i++) {
    const view = session.getView();
    if (view.screen === 'decision') return view.decision;
    if (view.screen === 'result') {
      await session.dispatch(command(session, 'acknowledge'));
      continue;
    }
    if (view.screen === 'offer') {
      await session.dispatch(command(session, 'offer', { offerId: view.offer.id, action: 'reject' }));
      continue;
    }
    await session.dispatch(command(session, 'continue', { maxDays: 2 }));
  }
  throw new Error('No lineage decision scheduled');
}

async function resolveOne(session) {
  const decision = await pending(session);
  await session.dispatch(command(session, 'choose', {
    pendingInstanceId: decision.instanceId,
    choiceId: decision.choices[0].id
  }));
  await session.dispatch(command(session, 'acknowledge'));
  return decision;
}

const A = await catalog('A');
const B = await catalog('B');
const C = await catalog('C');
const routes = [route(A, B), route(B, C)];
const sources = {
  [A.identity]: source(A),
  [B.identity]: source(B)
};

test('unique lineage path resolves A -> B -> C and ignores cycles', () => {
  const cycle = { sourceContentIdentity: B.identity, targetContentIdentity: A.identity };
  const path = findMigrationPath(A.identity, C.identity, [...routes, cycle]);
  assert.deepEqual(path?.map(row => [row.sourceContentIdentity, row.targetContentIdentity]), [
    [A.identity, B.identity],
    [B.identity, C.identity]
  ]);
});

test('missing or ambiguous migration lineage fails closed', () => {
  assert.equal(findMigrationPath(A.identity, C.identity, [routes[0]]), undefined);
  const direct = { sourceContentIdentity: A.identity, targetContentIdentity: C.identity };
  assert.equal(findMigrationPath(A.identity, C.identity, [...routes, direct]), undefined);
});

test('A save can jump to C through the unique path without RNG or history rewrite', async () => {
  const sessionA = await GameSession.create(8101, { events: A.events, sessionId: 'lineage-a-c' });
  await resolveOne(sessionA);
  const before = sessionA.exportSnapshot();
  const rng = clone(before.state.rngState);
  const history = clone(before.state.history);
  const journal = clone(before.journal);

  const migrated = await GameSession.migrateAndResume(before, {
    events: C.events,
    migrationRoutes: routes,
    contentSources: sources
  });
  const after = migrated.exportSnapshot();
  assert.equal(after.contentIdentity, C.identity);
  assert.deepEqual(after.state.rngState, rng);
  assert.deepEqual(after.state.history, history);
  assert.deepEqual(after.journal, journal);
  assert.equal(after.decisionProvenance[0].sourceContentIdentity, A.identity);
  assert.equal(after.state.flags.SEEN_EVT_T51_LINEAGE_001, false);

  const strict = await GameSession.resume(clone(after), {
    events: C.events,
    migrationRoutes: routes,
    contentSources: sources
  });
  assert.deepEqual(strict.exportSnapshot(), after);
});

test('save created on intermediate catalog B migrates to C only with B source evidence', async () => {
  const sessionB = await GameSession.create(8102, { events: B.events, sessionId: 'lineage-b-c' });
  await resolveOne(sessionB);
  const snapshotB = sessionB.exportSnapshot();
  const rng = clone(snapshotB.state.rngState);

  const migrated = await GameSession.migrateAndResume(snapshotB, {
    events: C.events,
    migrationRoutes: routes,
    contentSources: sources
  });
  assert.equal(migrated.exportSnapshot().contentIdentity, C.identity);
  assert.equal(migrated.exportSnapshot().decisionProvenance[0].sourceContentIdentity, B.identity);
  assert.deepEqual(migrated.exportSnapshot().state.rngState, rng);

  await assert.rejects(
    GameSession.migrateAndResume(snapshotB, {
      events: C.events,
      migrationRoutes: routes,
      contentSources: { [A.identity]: source(A) }
    }),
    errorCode('CONTENT_MIGRATION_UNSUPPORTED')
  );
});

test('pending A decision survives to C and post-resolution applies the full lineage', async () => {
  const sessionA = await GameSession.create(8103, { events: A.events, sessionId: 'lineage-pending' });
  const decision = await pending(sessionA);
  const original = sessionA.exportSnapshot();
  const oldLabel = decision.choices[0].label;
  const rng = clone(original.state.rngState);

  const migrated = await GameSession.migrateAndResume(original, {
    events: C.events,
    migrationRoutes: routes,
    contentSources: sources
  });
  const migratedView = migrated.getView();
  assert.equal(migratedView.decision.choices[0].label, oldLabel);
  assert.equal(migrated.exportSnapshot().pendingDecision.provenance.sourceContentIdentity, A.identity);
  assert.deepEqual(migrated.exportSnapshot().state.rngState, rng);

  await migrated.dispatch(command(migrated, 'choose', {
    pendingInstanceId: migratedView.decision.instanceId,
    choiceId: migratedView.decision.choices[0].id
  }));
  const resolved = migrated.exportSnapshot();
  assert.equal(resolved.decisionProvenance.at(-1).sourceContentIdentity, A.identity);
  assert.equal(resolved.state.flags.SEEN_EVT_T51_LINEAGE_001, false);
});

test('mixed A and B decision provenance validates after migration to C', async () => {
  const sessionA = await GameSession.create(8104, { events: A.events, sessionId: 'lineage-mixed' });
  await resolveOne(sessionA);

  const onB = await GameSession.migrateAndResume(sessionA.exportSnapshot(), {
    events: B.events,
    migrationRoutes: routes,
    contentSources: sources
  });
  await resolveOne(onB);
  const mixedB = onB.exportSnapshot();
  assert.deepEqual(mixedB.decisionProvenance.map(row => row.sourceContentIdentity), [A.identity, B.identity]);

  const onC = await GameSession.migrateAndResume(mixedB, {
    events: C.events,
    migrationRoutes: routes,
    contentSources: sources
  });
  const mixedC = onC.exportSnapshot();
  assert.equal(mixedC.contentIdentity, C.identity);
  assert.deepEqual(mixedC.decisionProvenance.map(row => row.sourceContentIdentity), [A.identity, B.identity]);
  assert.equal(mixedC.state.history.length, 2);
});
