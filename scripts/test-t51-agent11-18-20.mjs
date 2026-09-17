import assert from 'node:assert/strict';
import test from 'node:test';
import { createInitialState } from '../dist/content/initial-state.js';
import { EVENTS_18_20 as BASE_EVENTS_18_20 } from '../dist/content/events/18_20/canonical-events.js';
import { EVENTS_18_20 } from '../dist/content/events/index.js';
import { eventGatesPass, gateAlternatives } from '../dist/narrative/event-gates.js';
import { T51_B1B_PUBLIC_HEAT_SUFFICIENT } from '../dist/content/events/18_20/t51-b1b-local-repairs.js';
import { applyMigrationRouteInPlace } from '../dist/session/content-migration.js';

const claraId = 'EVT_18_PRS_002';
const summerId = 'EVT_19_SUM_001';
const repairedIds = [claraId, summerId];
const claraBase = BASE_EVENTS_18_20.find(event => event.id === claraId);
const claraActive = EVENTS_18_20.find(event => event.id === claraId);
const summerBase = BASE_EVENTS_18_20.find(event => event.id === summerId);
const summerActive = EVENTS_18_20.find(event => event.id === summerId);

assert.ok(claraBase, `missing frozen base ${claraId}`);
assert.ok(claraActive, `missing active ${claraId}`);
assert.ok(summerBase, `missing frozen base ${summerId}`);
assert.ok(summerActive, `missing active ${summerId}`);

function state() {
  const value = createInitialState(424242);
  value.flags.CLARA_CONTACTED = false;
  value.reputation.mediaHeat = 0;
  return value;
}

test('B1b keeps the frozen EVT_18_PRS_002 definition untouched', () => {
  assert.deepEqual(claraBase.gates, [{ path: 'flags.CLARA_CONTACTED', op: 'eq', value: true }]);
  assert.equal(gateAlternatives(claraBase), undefined);
});

test('B1b active definition expresses Clara-channel OR sufficient PUBLIC_HEAT', () => {
  assert.deepEqual(claraActive.gates, []);
  assert.deepEqual(gateAlternatives(claraActive), [
    [{ path: 'flags.CLARA_CONTACTED', op: 'eq', value: true }],
    [{ path: 'reputation.mediaHeat', op: 'gte', value: T51_B1B_PUBLIC_HEAT_SUFFICIENT }]
  ]);
});

test('Clara channel alone reaches EVT_18_PRS_002 at low public heat', () => {
  const s = state();
  s.flags.CLARA_CONTACTED = true;
  assert.equal(eventGatesPass(s, claraActive), true);
});

test('sufficient public heat reaches EVT_18_PRS_002 without prior Clara contact', () => {
  const s = state();
  s.reputation.mediaHeat = T51_B1B_PUBLIC_HEAT_SUFFICIENT;
  assert.equal(eventGatesPass(s, claraActive), true);
});

test('EVT_18_PRS_002 fails closed when neither canonical route exists', () => {
  const s = state();
  s.reputation.mediaHeat = T51_B1B_PUBLIC_HEAT_SUFFICIENT - 1;
  assert.equal(eventGatesPass(s, claraActive), false);
});

test('Clara reachability evaluation consumes no RNG and mutates no state', () => {
  const s = state();
  s.flags.CLARA_CONTACTED = true;
  const before = structuredClone(s);
  assert.equal(eventGatesPass(s, claraActive), true);
  assert.deepEqual(s, before);
});

test('B1b changes only reachability metadata for EVT_18_PRS_002', () => {
  const stripGates = event => {
    const copy = structuredClone(event);
    delete copy.gateAlternatives;
    copy.gates = [];
    return copy;
  };
  assert.deepEqual(stripGates(claraActive), stripGates(claraBase));
});

test('B1b keeps the frozen EVT_19_SUM_001 definition untouched', () => {
  assert.deepEqual(summerBase.gates, []);
  assert.equal(gateAlternatives(summerBase), undefined);
});

test('EVT_19_SUM_001 is eligible through gates only when there is no acute injury', () => {
  const healthy = state();
  healthy.body.acuteInjury = false;
  assert.equal(eventGatesPass(healthy, summerActive), true);

  const injured = state();
  injured.body.acuteInjury = true;
  assert.equal(eventGatesPass(injured, summerActive), false);
});

test('undefined acute-injury state is treated as no active acute injury', () => {
  const s = state();
  delete s.body.acuteInjury;
  assert.equal(eventGatesPass(s, summerActive), true);
});

test('B1b changes only gates for EVT_19_SUM_001', () => {
  const stripGates = event => {
    const copy = structuredClone(event);
    copy.gates = [];
    return copy;
  };
  assert.deepEqual(stripGates(summerActive), stripGates(summerBase));
  assert.deepEqual(summerActive.gates, [{ path: 'body.acuteInjury', op: 'neq', value: true }]);
});

test('same-scene migration semantics preserve prior completion and prevent duplicate repaired scenes', () => {
  const migration = {
    sourceContentIdentity: 'source-agent11',
    targetContentIdentity: 'target-agent11',
    schedulerMappings: repairedIds.map(eventId => ({
      kind: 'same_scene',
      legacyEventId: eventId,
      canonicalEventId: eventId
    })),
    seedOriginMappings: []
  };
  const s = state();
  for (const eventId of repairedIds) {
    s.flags[`SEEN_${eventId}`] = false;
    s.history.push({
      eventId,
      date: '2026-06-15',
      season: s.season,
      choiceId: 'LEGACY_CHOICE',
      outcomeId: 'LEGACY_OUTCOME',
      club: s.club,
      snapshot: { age: s.age, family: 'legacy' },
      salience: 60,
      visibility: 'private'
    });
  }
  const historyBefore = structuredClone(s.history);
  const rngBefore = structuredClone(s.rngState);
  applyMigrationRouteInPlace(s, migration);
  assert.deepEqual(s.history, historyBefore);
  assert.deepEqual(s.rngState, rngBefore);
  for (const eventId of repairedIds) assert.equal(s.flags[`SEEN_${eventId}`], true);
});
