import fs from 'node:fs';
import assert from 'node:assert/strict';
import test from 'node:test';
import { createInitialState } from '../dist/content/initial-state.js';
import { EVENTS_23_26 } from '../dist/content/events/23_26/index.js';
import { eventGatesPass } from '../dist/narrative/event-gates.js';
import { contentIdentity } from '../dist/session/content-identity.js';
import {
  CONTENT_MIGRATION_ROUTES,
  T51_B1A_CONTENT_IDENTITY,
  T51_T510_CONTENT_IDENTITY,
  T51_T511_CONTENT_IDENTITY,
  T51_PRS_CONTENT_IDENTITY,
  T51_EUR_ELIGIBILITY_CONTENT_IDENTITY,
  applyMigrationRouteInPlace,
  findMigrationPath,
  findMigrationRoute
} from '../dist/session/content-migration.js';
import { PRE_T51_CONTENT_IDENTITY } from '../dist/session/pre-t51-legacy-registry.js';

const euro = () => {
  const rows = EVENTS_23_26.filter(event => event.id === 'EVT_23_EUR_001');
  assert.equal(rows.length, 1, 'EVT_23_EUR_001 must have exactly one active definition');
  return rows[0];
};

test('T5.11b EUR eligibility fails closed once continental registration is already resolved', () => {
  const event = euro();
  assert.deepEqual(event.gates, [
    { path: 'flags.CONTINENTAL_CONTEXT', op: 'eq', value: true },
    { path: 'flags.CONTINENTAL_REGISTERED', op: 'eq', value: false },
    { path: 'professional.roleSecurity', op: 'lte', value: 70 }
  ]);
  const state = createInitialState(511201);
  state.age = 23;
  state.phase = '23_26';
  state.date = '2026-08-20';
  state.flags.CONTINENTAL_CONTEXT = true;
  state.professional.roleSecurity = 45;
  state.flags.CONTINENTAL_REGISTERED = false;
  assert.equal(eventGatesPass(state, event), true);
  state.flags.CONTINENTAL_REGISTERED = true;
  assert.equal(eventGatesPass(state, event), false);
});

test('T5.11b creates only the adjacent E to F same-scene route', async () => {
  const fixturePath = `qa/fixtures/t5.1/post-t51-sources/${T51_EUR_ELIGIBILITY_CONTENT_IDENTITY}.json`;
  const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
  assert.equal(await contentIdentity(fixture.events), T51_EUR_ELIGIBILITY_CONTENT_IDENTITY);
  const route = findMigrationRoute(T51_PRS_CONTENT_IDENTITY, T51_EUR_ELIGIBILITY_CONTENT_IDENTITY, CONTENT_MIGRATION_ROUTES);
  assert.ok(route);
  assert.deepEqual(route.seedOriginMappings ?? [], []);
  assert.deepEqual(route.schedulerMappings, [{
    kind: 'same_scene',
    legacyEventId: 'EVT_23_EUR_001',
    canonicalEventId: 'EVT_23_EUR_001'
  }]);
  assert.equal(findMigrationRoute(PRE_T51_CONTENT_IDENTITY, T51_EUR_ELIGIBILITY_CONTENT_IDENTITY, CONTENT_MIGRATION_ROUTES), undefined);
  assert.equal(findMigrationRoute(T51_T511_CONTENT_IDENTITY, T51_EUR_ELIGIBILITY_CONTENT_IDENTITY, CONTENT_MIGRATION_ROUTES), undefined);
  const path = findMigrationPath(PRE_T51_CONTENT_IDENTITY, T51_EUR_ELIGIBILITY_CONTENT_IDENTITY, CONTENT_MIGRATION_ROUTES);
  assert.ok(path);
  assert.deepEqual(path.map(edge => [edge.sourceContentIdentity, edge.targetContentIdentity]), [
    [PRE_T51_CONTENT_IDENTITY, T51_B1A_CONTENT_IDENTITY],
    [T51_B1A_CONTENT_IDENTITY, T51_T510_CONTENT_IDENTITY],
    [T51_T510_CONTENT_IDENTITY, T51_T511_CONTENT_IDENTITY],
    [T51_T511_CONTENT_IDENTITY, T51_PRS_CONTENT_IDENTITY],
    [T51_PRS_CONTENT_IDENTITY, T51_EUR_ELIGIBILITY_CONTENT_IDENTITY]
  ]);
});

test('E to F migration never replays a completed EUR scene and preserves cooldown, history and RNG', () => {
  const route = findMigrationRoute(T51_PRS_CONTENT_IDENTITY, T51_EUR_ELIGIBILITY_CONTENT_IDENTITY, CONTENT_MIGRATION_ROUTES);
  assert.ok(route);
  const state = createInitialState(511202);
  state.age = 23;
  state.phase = '23_26';
  state.flags.SEEN_EVT_23_EUR_001 = true;
  state.eventCooldowns.EVT_23_EUR_001 = 777;
  state.history.push({
    eventId: 'EVT_23_EUR_001', date: '2026-08-21', season: state.season,
    choiceId: 'B', outcomeId: 'B_PRIMARY', club: state.club,
    snapshot: { age: 23, family: 'sport' }, salience: 70, visibility: 'private'
  });
  const historyBefore = structuredClone(state.history);
  const rngBefore = structuredClone(state.rngState);
  applyMigrationRouteInPlace(state, route);
  assert.equal(state.flags.SEEN_EVT_23_EUR_001, true);
  assert.equal(state.eventCooldowns.EVT_23_EUR_001, 777);
  assert.deepEqual(state.history, historyBefore);
  assert.deepEqual(state.rngState, rngBefore);
});

test('E to F migration leaves unseen EUR available under the repaired eligibility without mutating RNG', () => {
  const route = findMigrationRoute(T51_PRS_CONTENT_IDENTITY, T51_EUR_ELIGIBILITY_CONTENT_IDENTITY, CONTENT_MIGRATION_ROUTES);
  assert.ok(route);
  const state = createInitialState(511203);
  state.age = 23;
  state.phase = '23_26';
  state.flags.SEEN_EVT_23_EUR_001 = false;
  const rngBefore = structuredClone(state.rngState);
  applyMigrationRouteInPlace(state, route);
  assert.equal(state.flags.SEEN_EVT_23_EUR_001, false);
  assert.deepEqual(state.rngState, rngBefore);
});
