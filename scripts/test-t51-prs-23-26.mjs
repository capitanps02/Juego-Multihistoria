import fs from 'node:fs';
import assert from 'node:assert/strict';
import test from 'node:test';
import { createInitialState } from '../dist/content/initial-state.js';
import { EVENTS_23_26 } from '../dist/content/events/23_26/index.js';
import { eventGatesPass } from '../dist/narrative/event-gates.js';
import { GameSession } from '../dist/session/game-session.js';
import { contentIdentity } from '../dist/session/content-identity.js';
import {
  CONTENT_MIGRATION_ROUTES,
  T51_B1A_CONTENT_IDENTITY,
  T51_T510_CONTENT_IDENTITY,
  T51_T511_CONTENT_IDENTITY,
  T51_PRS_CONTENT_IDENTITY,
  T51_EUR_ELIGIBILITY_CONTENT_IDENTITY,
  T51_PRS_CAUSAL_CONTENT_IDENTITY,
  applyMigrationRouteInPlace,
  findMigrationPath,
  findMigrationRoute
} from '../dist/session/content-migration.js';
import { PRE_T51_CONTENT_IDENTITY } from '../dist/session/pre-t51-legacy-registry.js';

const ID = 'EVT_23_PRS_001';
const TARGET_IDENTITY = '88751a2107c035826162968991e3a1808b2f4573afa3a3a20a3efa376fa8af1f';
const D_FIXTURE = JSON.parse(fs.readFileSync(`qa/fixtures/t5.1/post-t51-sources/${T51_T511_CONTENT_IDENTITY}.json`, 'utf8'));
const E_FIXTURE = JSON.parse(fs.readFileSync(`qa/fixtures/t5.1/post-t51-sources/${T51_PRS_CONTENT_IDENTITY}.json`, 'utf8'));
const F_FIXTURE = JSON.parse(fs.readFileSync(`qa/fixtures/t5.1/post-t51-sources/${T51_EUR_ELIGIBILITY_CONTENT_IDENTITY}.json`, 'utf8'));
const G_FIXTURE = JSON.parse(fs.readFileSync(`qa/fixtures/t5.1/post-t51-sources/${T51_PRS_CAUSAL_CONTENT_IDENTITY}.json`, 'utf8'));

const press = () => {
  const rows = EVENTS_23_26.filter(event => event.id === ID);
  assert.equal(rows.length, 1, 'PRS must have exactly one active definition');
  return rows[0];
};
const labels = event => event.choices.map(choice => choice.label);
const effectPaths = event => event.outcomes.flatMap(outcome => outcome.effects ?? []).map(effect => effect.kind === 'flag' ? `flags.${effect.flag}` : effect.path);

function prsState(seed = 51121, stance = 'role_guarantees') {
  const state = createInitialState(seed);
  state.age = 23;
  state.phase = '23_26';
  state.professional.initializedAt23 = true;
  state.professional.roleScoreAt23 = 70;
  state.sport.roleScore = 55;
  state.professional.roleSecurity = 55;
  state.seeds.push({
    id: 'SEED_ELITE_ROLE_BARGAIN',
    state: 'dormant',
    intensity: 55,
    originEvent: 'EVT_23_BRIDGE_001',
    originSeason: state.season,
    npcRefs: [],
    payload: { stance }
  });
  return state;
}

test('PRS activates the canonical four decisions without changing contract authority', () => {
  const event = press();
  assert.equal(event.text.title, 'Decisión técnica');
  assert.deepEqual(labels(event), [
    'Autorizar la filtración',
    'Pedir una reunión interna primero',
    'Declarar públicamente que competirás sin entrar en detalles',
    'Guardar silencio y esperar tres partidos'
  ]);
  assert.equal(event.canonStatus, 'verified');
  assert.deepEqual(event.seedsRead, ['SEED_FIRST_LEAK', 'SEED_ELITE_ROLE_BARGAIN']);
  assert.deepEqual(event.seedsWrite ?? [], []);
});

test('PRS trigger requires exact age-23 guarantee provenance plus a material relative role drop', () => {
  const event = press();
  assert.deepEqual(event.gates, [
    { path: 'facts.roleGuaranteeAt23', op: 'eq', value: true },
    { path: 'facts.roleDropSince23', op: 'gte', value: 15 },
    { path: 'professional.roleSecurity', op: 'lte', value: 55 }
  ]);

  const state = prsState();
  assert.equal(eventGatesPass(state, event), true, '70 -> 55 is the exact 15-point threshold');

  state.sport.roleScore = 56;
  assert.equal(eventGatesPass(state, event), false, '14-point drop must stay below the technical threshold');

  state.sport.roleScore = 54;
  assert.equal(eventGatesPass(state, event), true, '16-point drop remains eligible');

  state.professional.roleSecurity = 56;
  assert.equal(eventGatesPass(state, event), false, 'role crisis must still be present');
});

test('PRS rejects the other three bridge stances even when the same seed id and role drop exist', () => {
  const event = press();
  for (const [index, stance] of ['security_over_role', 'wait_market', 'agent_listens'].entries()) {
    const state = prsState(51130 + index, stance);
    assert.equal(eventGatesPass(state, event), false, stance);
  }
});

test('PRS rejects generic HAS_SEED flag, wrong origin and missing age-23 snapshot', () => {
  const event = press();

  const generic = createInitialState(51140);
  generic.age = 23;
  generic.phase = '23_26';
  generic.professional.initializedAt23 = true;
  generic.professional.roleScoreAt23 = 75;
  generic.sport.roleScore = 40;
  generic.professional.roleSecurity = 40;
  generic.flags.HAS_SEED_ELITE_ROLE_BARGAIN = true;
  assert.equal(eventGatesPass(generic, event), false, 'flag presence is not historical provenance');

  const wrongOrigin = prsState(51141);
  wrongOrigin.seeds.at(-1).originEvent = 'EVT_FAKE_SOURCE';
  assert.equal(eventGatesPass(wrongOrigin, event), false, 'same seed id from another source is insufficient');

  const noSnapshot = prsState(51142);
  noSnapshot.professional.initializedAt23 = false;
  assert.equal(eventGatesPass(noSnapshot, event), false, 'without the authoritative 23 snapshot roleDropSince23 fails closed');
});

test('PRS accepts historical guarantee evidence after the seed becomes terminal', () => {
  const event = press();
  const state = prsState(51143);
  const seed = state.seeds.at(-1);
  seed.state = 'resolved';
  seed.consumedBy = 'LATER_EVENT';
  assert.equal(eventGatesPass(state, event), true);
  seed.state = 'expired';
  assert.equal(eventGatesPass(state, event), true);
});

test('PRS treats the minutes promise as an attributed claim and never mutates contract or market authority', () => {
  const event = press();
  assert.match(event.text.body, /según su versión/i);
  assert.match(event.intel.visible.join(' '), /no existe una garantía contractual de minutos/i);
  assert.match(event.intel.uncertain.join(' '), /tampoco puedes demostrar/i);
  assert.ok(effectPaths(event).every(path => !path.startsWith('contract.') && path !== 'club' && !path.startsWith('market.')));
  assert.ok(event.outcomes.every(outcome => (outcome.seedTransitions ?? []).length === 0));
});

test('historical frozen E catalog preserves only the adjacent D -> E migration edge', async () => {
  const actualIdentity = await contentIdentity(E_FIXTURE.events);
  assert.equal(actualIdentity, TARGET_IDENTITY);
  assert.equal(actualIdentity, T51_PRS_CONTENT_IDENTITY);
  assert.equal(findMigrationRoute(PRE_T51_CONTENT_IDENTITY, actualIdentity, CONTENT_MIGRATION_ROUTES), undefined);
  assert.equal(findMigrationRoute(T51_B1A_CONTENT_IDENTITY, actualIdentity, CONTENT_MIGRATION_ROUTES), undefined);
  assert.equal(findMigrationRoute(T51_T510_CONTENT_IDENTITY, actualIdentity, CONTENT_MIGRATION_ROUTES), undefined);

  const path = findMigrationPath(PRE_T51_CONTENT_IDENTITY, actualIdentity, CONTENT_MIGRATION_ROUTES);
  assert.ok(path);
  assert.deepEqual(path.map(route => [route.sourceContentIdentity, route.targetContentIdentity]), [
    [PRE_T51_CONTENT_IDENTITY, T51_B1A_CONTENT_IDENTITY],
    [T51_B1A_CONTENT_IDENTITY, T51_T510_CONTENT_IDENTITY],
    [T51_T510_CONTENT_IDENTITY, T51_T511_CONTENT_IDENTITY],
    [T51_T511_CONTENT_IDENTITY, actualIdentity]
  ]);
  const route = findMigrationRoute(T51_T511_CONTENT_IDENTITY, actualIdentity, CONTENT_MIGRATION_ROUTES);
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

test('historical D -> E preserves truth and releases only PRS scheduler suppression', () => {
  const route = findMigrationRoute(T51_T511_CONTENT_IDENTITY, TARGET_IDENTITY, CONTENT_MIGRATION_ROUTES);
  assert.ok(route);
  const state = createInitialState(51122);
  state.age = 23;
  state.phase = '23_26';
  state.flags.SEEN_EVT_23_PRS_001 = true;
  state.eventCooldowns[ID] = 900;
  state.seeds.push({
    id: 'SEED_ELITE_ROLE_BARGAIN', state: 'dormant', intensity: 55,
    originEvent: 'EVT_23_BRIDGE_001', originSeason: state.season,
    npcRefs: [], payload: { stance: 'role_guarantees' }
  });
  state.history.push({
    eventId: ID, date: '2026-11-01', season: state.season, choiceId: 'LEGACY', outcomeId: 'LEGACY_OUT',
    club: state.club, snapshot: { age: 23, family: 'press' }, salience: 70, visibility: 'public'
  });
  const historyBefore = structuredClone(state.history);
  const seedsBefore = structuredClone(state.seeds);
  const rngBefore = structuredClone(state.rngState);
  applyMigrationRouteInPlace(state, route);
  assert.deepEqual(state.history, historyBefore);
  assert.deepEqual(state.seeds, seedsBefore);
  assert.deepEqual(state.rngState, rngBefore);
  assert.equal(state.flags.SEEN_EVT_23_PRS_001, false);
  assert.equal(Object.hasOwn(state.eventCooldowns, ID), false);
});

test('real frozen D snapshot reaches frozen E semantics with no RNG drift', async () => {
  const session = await GameSession.create(51123, { sessionId: 't511-prs-d', events: D_FIXTURE.events });
  const before = session.exportSnapshot();
  const stateBefore = structuredClone(before.state);
  const rngBefore = structuredClone(before.state.rngState);
  const route = findMigrationRoute(T51_T511_CONTENT_IDENTITY, T51_PRS_CONTENT_IDENTITY, CONTENT_MIGRATION_ROUTES);
  assert.ok(route);
  const migratedState = structuredClone(before.state);
  applyMigrationRouteInPlace(migratedState, route);
  assert.deepEqual(migratedState, stateBefore);
  assert.deepEqual(migratedState.rngState, rngBefore);
});


test('PRS causal G is the unique adjacent successor of F', async () => {
  const actualIdentity = await contentIdentity(G_FIXTURE.events);
  assert.equal(actualIdentity, T51_PRS_CAUSAL_CONTENT_IDENTITY);
  const route = findMigrationRoute(T51_EUR_ELIGIBILITY_CONTENT_IDENTITY, actualIdentity, CONTENT_MIGRATION_ROUTES);
  assert.ok(route);
  assert.deepEqual(route.schedulerMappings ?? [], [{
    kind: 'same_scene',
    legacyEventId: ID,
    canonicalEventId: ID
  }]);
  assert.deepEqual(route.seedOriginMappings ?? [], []);
  for (const old of [PRE_T51_CONTENT_IDENTITY, T51_B1A_CONTENT_IDENTITY, T51_T510_CONTENT_IDENTITY, T51_T511_CONTENT_IDENTITY, T51_PRS_CONTENT_IDENTITY]) {
    assert.equal(findMigrationRoute(old, actualIdentity, CONTENT_MIGRATION_ROUTES), undefined, `no shortcut from ${old}`);
  }
  const path = findMigrationPath(PRE_T51_CONTENT_IDENTITY, actualIdentity, CONTENT_MIGRATION_ROUTES);
  assert.deepEqual(path?.map(row => [row.sourceContentIdentity, row.targetContentIdentity]), [
    [PRE_T51_CONTENT_IDENTITY, T51_B1A_CONTENT_IDENTITY],
    [T51_B1A_CONTENT_IDENTITY, T51_T510_CONTENT_IDENTITY],
    [T51_T510_CONTENT_IDENTITY, T51_T511_CONTENT_IDENTITY],
    [T51_T511_CONTENT_IDENTITY, T51_PRS_CONTENT_IDENTITY],
    [T51_PRS_CONTENT_IDENTITY, T51_EUR_ELIGIBILITY_CONTENT_IDENTITY],
    [T51_EUR_ELIGIBILITY_CONTENT_IDENTITY, T51_PRS_CAUSAL_CONTENT_IDENTITY]
  ]);
});

test('F -> G preserves PRS seen/cooldown, history, seeds and RNG', () => {
  const route = findMigrationRoute(T51_EUR_ELIGIBILITY_CONTENT_IDENTITY, T51_PRS_CAUSAL_CONTENT_IDENTITY, CONTENT_MIGRATION_ROUTES);
  assert.ok(route);
  const state = createInitialState(51151);
  state.age = 23;
  state.phase = '23_26';
  state.flags.SEEN_EVT_23_PRS_001 = true;
  state.eventCooldowns[ID] = 777;
  state.seeds.push({ id: 'SEED_ELITE_ROLE_BARGAIN', state: 'resolved', intensity: 55, originEvent: 'EVT_23_BRIDGE_001', originSeason: state.season, npcRefs: [], payload: { stance: 'role_guarantees' } });
  state.history.push({ eventId: ID, date: '2027-01-10', season: state.season, choiceId: 'B', outcomeId: 'B_PRIMARY', club: state.club, snapshot: { age: 23, family: 'press' }, salience: 70, visibility: 'public' });
  const before = { history: structuredClone(state.history), seeds: structuredClone(state.seeds), rng: structuredClone(state.rngState) };
  applyMigrationRouteInPlace(state, route);
  assert.deepEqual(state.history, before.history);
  assert.deepEqual(state.seeds, before.seeds);
  assert.deepEqual(state.rngState, before.rng);
  assert.equal(state.flags.SEEN_EVT_23_PRS_001, true);
  assert.equal(state.eventCooldowns[ID], 777);
});

test('real frozen F snapshot migrates to G without RNG drift', async () => {
  assert.equal(await contentIdentity(F_FIXTURE.events), T51_EUR_ELIGIBILITY_CONTENT_IDENTITY);
  const sessionF = await GameSession.create(51152, { sessionId: 't511-prs-f-g', events: F_FIXTURE.events });
  const before = sessionF.exportSnapshot();
  const rngBefore = structuredClone(before.state.rngState);
  const historyBefore = structuredClone(before.state.history);
  const migrated = await GameSession.migrateAndResume(before, { events: G_FIXTURE.events });
  const after = migrated.exportSnapshot();
  assert.equal(after.contentIdentity, T51_PRS_CAUSAL_CONTENT_IDENTITY);
  assert.deepEqual(after.state.rngState, rngBefore);
  assert.deepEqual(after.state.history, historyBefore);
});
