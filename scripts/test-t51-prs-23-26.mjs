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
  applyMigrationRouteInPlace,
  findMigrationPath,
  findMigrationRoute
} from '../dist/session/content-migration.js';
import { PRE_T51_CONTENT_IDENTITY } from '../dist/session/pre-t51-legacy-registry.js';

const ID = 'EVT_23_PRS_001';
const TARGET_IDENTITY = '88751a2107c035826162968991e3a1808b2f4573afa3a3a20a3efa376fa8af1f';
const D_FIXTURE = JSON.parse(fs.readFileSync(`qa/fixtures/t5.1/post-t51-sources/${T51_T511_CONTENT_IDENTITY}.json`, 'utf8'));
const E_FIXTURE = JSON.parse(fs.readFileSync(`qa/fixtures/t5.1/post-t51-sources/${T51_PRS_CONTENT_IDENTITY}.json`, 'utf8'));

const press = () => {
  const rows = EVENTS_23_26.filter(event => event.id === ID);
  assert.equal(rows.length, 1, 'PRS must have exactly one active definition');
  return rows[0];
};
const labels = event => event.choices.map(choice => choice.label);
const effectPaths = event => event.outcomes.flatMap(outcome => outcome.effects ?? []).map(effect => effect.kind === 'flag' ? `flags.${effect.flag}` : effect.path);

test('PRS activates the exact canonical identity and four decisions', () => {
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

test('PRS requires a real role decline after the prior elite-role bargain', () => {
  const event = press();
  assert.deepEqual(event.gates, [
    { path: 'sport.roleScore', op: 'lte', value: 48 },
    { path: 'professional.roleSecurity', op: 'lte', value: 55 },
    { path: 'flags.HAS_SEED_ELITE_ROLE_BARGAIN', op: 'eq', value: true }
  ]);
  const state = createInitialState(51121);
  state.age = 23;
  state.phase = '23_26';
  state.sport.roleScore = 40;
  state.professional.roleSecurity = 42;
  state.flags.HAS_SEED_ELITE_ROLE_BARGAIN = false;
  assert.equal(eventGatesPass(state, event), false);
  state.flags.HAS_SEED_ELITE_ROLE_BARGAIN = true;
  assert.equal(eventGatesPass(state, event), true);
  state.sport.roleScore = 70;
  assert.equal(eventGatesPass(state, event), false);
  state.sport.roleScore = 40;
  state.professional.roleSecurity = 75;
  assert.equal(eventGatesPass(state, event), false);
});

test('PRS treats the minutes promise as an attributed claim and never mutates contract or market authority', () => {
  const event = press();
  assert.match(event.text.body, /según su versión/i);
  assert.match(event.intel.visible.join(' '), /no existe una garantía contractual de minutos/i);
  assert.match(event.intel.uncertain.join(' '), /tampoco puedes demostrar/i);
  assert.ok(effectPaths(event).every(path => !path.startsWith('contract.') && path !== 'club' && !path.startsWith('market.')));
  assert.ok(event.outcomes.every(outcome => (outcome.seedTransitions ?? []).length === 0));
});

test('PRS frozen E catalog preserves only the adjacent D -> E migration edge', async () => {
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

test('D -> E preserves historical truth and releases only PRS scheduler suppression', () => {
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
