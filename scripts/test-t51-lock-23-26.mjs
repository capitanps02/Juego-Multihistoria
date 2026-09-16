import fs from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { NPC_EVENT_KNOWLEDGE_RULES } from '../dist/catalog/npc-knowledge-rules.js';
import { createInitialState } from '../dist/content/initial-state.js';
import { EVENTS } from '../dist/content/events/index.js';
import { EVENTS_23_26 } from '../dist/content/events/23_26/index.js';
import { getNpcKnowledgeRecord, npcKnows } from '../dist/core/npc-knowledge.js';
import { eventGatesPass } from '../dist/narrative/event-gates.js';
import { expireDueSeedsInPlace, resolveChoiceInPlace } from '../dist/narrative/resolver.js';
import { GameSession } from '../dist/session/game-session.js';
import { contentIdentity } from '../dist/session/content-identity.js';
import {
  CONTENT_MIGRATION_ROUTES,
  T51_B1A_CONTENT_IDENTITY,
  T51_T510_CONTENT_IDENTITY,
  T51_T511_CONTENT_IDENTITY,
  T51_PRS_CONTENT_IDENTITY,
  T51_EUR_ELIGIBILITY_CONTENT_IDENTITY,
  T51_LOCK_CONTENT_IDENTITY,
  applyMigrationRouteInPlace,
  findMigrationPath,
  findMigrationRoute
} from '../dist/session/content-migration.js';
import { PRE_T51_CONTENT_IDENTITY } from '../dist/session/pre-t51-legacy-registry.js';

const ID = 'EVT_23_LOCK_001';
const TARGET_IDENTITY = '8767c7098aab0114a94dd72863a67053117b7ace7ab05cb3b38eaeb904c203af';
const F_FIXTURE = JSON.parse(fs.readFileSync(
  `qa/fixtures/t5.1/post-t51-sources/${T51_EUR_ELIGIBILITY_CONTENT_IDENTITY}.json`,
  'utf8'
));

function lockEvent() {
  const rows = EVENTS_23_26.filter(event => event.id === ID);
  assert.equal(rows.length, 1, 'LOCK23 must have exactly one active definition');
  return rows[0];
}

function state23(seed = 51140) {
  const state = createInitialState(seed);
  state.age = 23;
  state.phase = '23_26';
  state.club = 'UDV';
  return state;
}

function relation(state, npcId) {
  const row = state.relationships.find(candidate => candidate.npcId === npcId);
  assert.ok(row, `missing relationship ${npcId}`);
  return row;
}

function effectPaths(event) {
  return event.outcomes.flatMap(outcome => outcome.effects ?? []).map(effect =>
    effect.kind === 'flag' ? `flags.${effect.flag}` : effect.path
  );
}

test('LOCK23 activates the canonical scene identity and four decisions', () => {
  const event = lockEvent();
  assert.equal(event.text.title, 'Las cuatro de la mañana');
  assert.deepEqual(event.choices.map(choice => choice.label), [
    'Cubrirle',
    'Negarte pero no avisar a nadie',
    'Decirle que admita el retraso y ofrecer acompañarlo',
    'Avisar al capitán para que gestione antes de que llegue al técnico'
  ]);
  assert.equal(event.canonStatus, 'verified');
  assert.deepEqual(event.seedsRead, ['SEED_TEAMMATE_COVER']);
  assert.deepEqual(event.seedsWrite ?? [], []);
  assert.deepEqual(event.npcRefs ?? [], [], 'the requester must not be assigned an invented NPC identity');
});

test('LOCK23 uses captain/star affinity OR prior teammate-cover seed with threshold 60', () => {
  const event = lockEvent();
  assert.deepEqual(event.gates ?? [], []);
  assert.deepEqual(event.gateAlternatives, [
    [{ path: 'facts.lockerCaptainAffinity', op: 'gte', value: 60 }],
    [{ path: 'facts.lockerStarAffinity', op: 'gte', value: 60 }],
    [{ path: 'flags.HAS_SEED_TEAMMATE_COVER', op: 'eq', value: true }]
  ]);

  const state = state23();
  relation(state, 'NPC_PLR_10').affinity = 40;
  relation(state, 'NPC_PLR_12').affinity = 99;
  state.flags.HAS_SEED_TEAMMATE_COVER = false;
  assert.equal(eventGatesPass(state, event), false, 'arbitrary teammate affinity cannot satisfy the slot route');

  relation(state, 'NPC_PLR_10').affinity = 60;
  assert.equal(eventGatesPass(state, event), true, 'certified captain at threshold opens the scene');

  state.club = 'ATL';
  assert.equal(eventGatesPass(state, event), false, 'old-club captain must fail closed after a club change');

  state.club = 'UDV';
  relation(state, 'NPC_PLR_10').affinity = 40;
  state.flags.HAS_SEED_TEAMMATE_COVER = true;
  assert.equal(eventGatesPass(state, event), true, 'historical cover seed remains an independent route');
});

test('LOCK23 teammate-cover route expires when origin-club scope is left', () => {
  const state = state23(51145);
  state.date = '2031-10-01';
  relation(state, 'NPC_PLR_10').affinity = 40;
  state.seeds.push({
    id: 'SEED_TEAMMATE_COVER',
    state: 'active',
    intensity: 50,
    originEvent: 'EVT_20_LOCK_002',
    originSeason: state.season,
    npcRefs: [],
    payload: { __t52OriginClub: state.club },
    lastTouchedDate: state.date
  });
  state.flags.HAS_SEED_TEAMMATE_COVER = true;

  assert.equal(eventGatesPass(state, lockEvent()), true, 'the live origin-club memory can enable LOCK23');

  state.club = 'ATL';
  expireDueSeedsInPlace(state);
  const seed = state.seeds.find(item => item.id === 'SEED_TEAMMATE_COVER');
  assert.equal(seed?.state, 'expired');
  assert.equal(seed?.payload.__t52TerminalReason, 'club_scope');
  assert.equal(state.flags.HAS_SEED_TEAMMATE_COVER, false);
  assert.equal(eventGatesPass(state, lockEvent()), false, 'the old dressing-room debt cannot leak into a new club');
});

test('LOCK23 does not fabricate a crime, contract, offer or new historical seed', () => {
  const event = lockEvent();
  assert.match(event.intel.visible.join(' '), /no hay un delito ni una situación de seguridad en curso/i);
  assert.ok(effectPaths(event).every(path => !path.startsWith('contract.') && !path.startsWith('market.') && path !== 'club'));
  assert.ok(event.outcomes.every(outcome => (outcome.seedTransitions ?? []).length === 0));
});

test('LOCK23 captain escalation is the only dynamic knowledge rule and is outcome-scoped', () => {
  const rules = NPC_EVENT_KNOWLEDGE_RULES.filter(rule => rule.eventId === ID);
  assert.deepEqual(rules, [{
    eventId: ID,
    choiceIds: ['D'],
    outcomeIds: ['D__PRIMARY', 'D__SECONDARY'],
    npcIds: [],
    targetSlots: ['captain'],
    source: 'informed',
    certainty: 100,
    memory: 'strong',
    relationshipMemory: true
  }]);
});

test('LOCK23 choice D informs only the authoritative captain and records the resolved recipient', () => {
  const state = state23(51141);
  relation(state, 'NPC_PLR_10').affinity = 70;
  assert.equal(npcKnows(state, 'NPC_PLR_10', ID), false);
  assert.equal(npcKnows(state, 'NPC_PLR_12', ID), false);

  resolveChoiceInPlace(state, lockEvent(), 'D');

  assert.equal(npcKnows(state, 'NPC_PLR_10', ID), true);
  assert.equal(npcKnows(state, 'NPC_PLR_12', ID), false);
  const record = getNpcKnowledgeRecord(state, 'NPC_PLR_10', ID);
  assert.ok(record);
  assert.equal(record.source, 'informed');
  assert.equal(record.choiceId, 'D');
  assert.ok(['D__PRIMARY', 'D__SECONDARY'].includes(record.outcomeId));
  assert.deepEqual(state.history.at(-1)?.snapshot.npcRefs, ['NPC_PLR_10']);
});

test('LOCK23 non-escalation choices do not make the captain omniscient', () => {
  const state = state23(51142);
  relation(state, 'NPC_PLR_10').affinity = 70;
  resolveChoiceInPlace(state, lockEvent(), 'B');
  assert.equal(npcKnows(state, 'NPC_PLR_10', ID), false);
  assert.deepEqual(state.history.at(-1)?.snapshot.npcRefs, []);
});

test('LOCK23 creates only the adjacent EUR-F -> LOCK-G migration edge', async () => {
  const actualIdentity = await contentIdentity(EVENTS);
  assert.equal(actualIdentity, TARGET_IDENTITY);
  assert.equal(actualIdentity, T51_LOCK_CONTENT_IDENTITY);

  assert.equal(findMigrationRoute(PRE_T51_CONTENT_IDENTITY, actualIdentity, CONTENT_MIGRATION_ROUTES), undefined);
  assert.equal(findMigrationRoute(T51_B1A_CONTENT_IDENTITY, actualIdentity, CONTENT_MIGRATION_ROUTES), undefined);
  assert.equal(findMigrationRoute(T51_T510_CONTENT_IDENTITY, actualIdentity, CONTENT_MIGRATION_ROUTES), undefined);
  assert.equal(findMigrationRoute(T51_T511_CONTENT_IDENTITY, actualIdentity, CONTENT_MIGRATION_ROUTES), undefined);
  assert.equal(findMigrationRoute(T51_PRS_CONTENT_IDENTITY, actualIdentity, CONTENT_MIGRATION_ROUTES), undefined);

  const path = findMigrationPath(PRE_T51_CONTENT_IDENTITY, actualIdentity, CONTENT_MIGRATION_ROUTES);
  assert.ok(path);
  assert.deepEqual(path.map(route => [route.sourceContentIdentity, route.targetContentIdentity]), [
    [PRE_T51_CONTENT_IDENTITY, T51_B1A_CONTENT_IDENTITY],
    [T51_B1A_CONTENT_IDENTITY, T51_T510_CONTENT_IDENTITY],
    [T51_T510_CONTENT_IDENTITY, T51_T511_CONTENT_IDENTITY],
    [T51_T511_CONTENT_IDENTITY, T51_PRS_CONTENT_IDENTITY],
    [T51_PRS_CONTENT_IDENTITY, T51_EUR_ELIGIBILITY_CONTENT_IDENTITY],
    [T51_EUR_ELIGIBILITY_CONTENT_IDENTITY, actualIdentity]
  ]);

  const route = findMigrationRoute(T51_EUR_ELIGIBILITY_CONTENT_IDENTITY, actualIdentity, CONTENT_MIGRATION_ROUTES);
  assert.ok(route);
  assert.deepEqual(route.seedOriginMappings ?? [], []);
  assert.deepEqual(route.schedulerMappings ?? [], [{
    kind: 'distinct_scene',
    legacyEventId: ID,
    canonicalEventId: ID,
    clearCanonicalSeen: true,
    clearCanonicalCooldown: true
  }]);
});

test('F -> G preserves historical truth and releases only LOCK23 scheduler suppression', () => {
  const route = findMigrationRoute(T51_EUR_ELIGIBILITY_CONTENT_IDENTITY, TARGET_IDENTITY, CONTENT_MIGRATION_ROUTES);
  assert.ok(route);
  const state = state23(51143);
  state.flags.SEEN_EVT_23_LOCK_001 = true;
  state.flags.SEEN_EVT_23_PRS_001 = true;
  state.eventCooldowns[ID] = 900;
  state.eventCooldowns.EVT_23_PRS_001 = 700;
  state.seeds.push({
    id: 'SEED_TEAMMATE_COVER', state: 'dormant', intensity: 55,
    originEvent: 'EVT_20_LOCK_002', originSeason: state.season,
    npcRefs: [], payload: { stance: 'kept_private' }
  });
  state.history.push({
    eventId: ID, date: '2026-10-01', season: state.season, choiceId: 'LEGACY', outcomeId: 'LEGACY_OUT',
    club: state.club, snapshot: { age: 23, family: 'team' }, salience: 70, visibility: 'private'
  });

  const historyBefore = structuredClone(state.history);
  const seedsBefore = structuredClone(state.seeds);
  const rngBefore = structuredClone(state.rngState);
  applyMigrationRouteInPlace(state, route);

  assert.deepEqual(state.history, historyBefore);
  assert.deepEqual(state.seeds, seedsBefore);
  assert.deepEqual(state.rngState, rngBefore);
  assert.equal(state.flags.SEEN_EVT_23_LOCK_001, false);
  assert.equal(Object.hasOwn(state.eventCooldowns, ID), false);
  assert.equal(state.flags.SEEN_EVT_23_PRS_001, true);
  assert.equal(state.eventCooldowns.EVT_23_PRS_001, 700);
});

test('real frozen EUR-F snapshot migrates to LOCK-G with no RNG drift', async () => {
  const session = await GameSession.create(51144, { sessionId: 't511-lock-f', events: F_FIXTURE.events });
  const before = session.exportSnapshot();
  assert.equal(before.contentIdentity, T51_EUR_ELIGIBILITY_CONTENT_IDENTITY);
  const stateBefore = structuredClone(before.state);
  const rngBefore = structuredClone(before.state.rngState);

  const migrated = await GameSession.migrateAndResume(before);
  const after = migrated.exportSnapshot();

  assert.equal(after.contentIdentity, TARGET_IDENTITY);
  assert.deepEqual(after.state, stateBefore);
  assert.deepEqual(after.state.rngState, rngBefore);
});
