import assert from 'node:assert/strict';
import test from 'node:test';
import { createInitialState } from '../dist/content/initial-state.js';
import { EVENTS_18_20 as BASE_EVENTS_18_20 } from '../dist/content/events/18_20/canonical-events.js';
import { EVENTS_18_20 } from '../dist/content/events/index.js';
import { eventGatesPass, gateAlternatives } from '../dist/narrative/event-gates.js';
import { T51_B1B_PUBLIC_HEAT_SUFFICIENT } from '../dist/content/events/18_20/t51-b1b-local-repairs.js';

const id = 'EVT_18_PRS_002';
const base = BASE_EVENTS_18_20.find(event => event.id === id);
const active = EVENTS_18_20.find(event => event.id === id);

assert.ok(base, `missing frozen base ${id}`);
assert.ok(active, `missing active ${id}`);

function state() {
  const value = createInitialState(424242);
  value.flags.CLARA_CONTACTED = false;
  value.reputation.mediaHeat = 0;
  return value;
}

test('B1b keeps the frozen EVT_18_PRS_002 definition untouched', () => {
  assert.deepEqual(base.gates, [{ path: 'flags.CLARA_CONTACTED', op: 'eq', value: true }]);
  assert.equal(gateAlternatives(base), undefined);
});

test('B1b active definition expresses Clara-channel OR sufficient PUBLIC_HEAT', () => {
  assert.deepEqual(active.gates, []);
  assert.deepEqual(gateAlternatives(active), [
    [{ path: 'flags.CLARA_CONTACTED', op: 'eq', value: true }],
    [{ path: 'reputation.mediaHeat', op: 'gte', value: T51_B1B_PUBLIC_HEAT_SUFFICIENT }]
  ]);
});

test('Clara channel alone reaches EVT_18_PRS_002 at low public heat', () => {
  const s = state();
  s.flags.CLARA_CONTACTED = true;
  assert.equal(eventGatesPass(s, active), true);
});

test('sufficient public heat reaches EVT_18_PRS_002 without prior Clara contact', () => {
  const s = state();
  s.reputation.mediaHeat = T51_B1B_PUBLIC_HEAT_SUFFICIENT;
  assert.equal(eventGatesPass(s, active), true);
});

test('EVT_18_PRS_002 fails closed when neither canonical route exists', () => {
  const s = state();
  s.reputation.mediaHeat = T51_B1B_PUBLIC_HEAT_SUFFICIENT - 1;
  assert.equal(eventGatesPass(s, active), false);
});

test('B1b reachability evaluation consumes no RNG and mutates no state', () => {
  const s = state();
  s.flags.CLARA_CONTACTED = true;
  const before = structuredClone(s);
  assert.equal(eventGatesPass(s, active), true);
  assert.deepEqual(s, before);
});

test('B1b changes only reachability metadata for EVT_18_PRS_002', () => {
  const stripGates = event => {
    const copy = structuredClone(event);
    delete copy.gateAlternatives;
    copy.gates = [];
    return copy;
  };
  assert.deepEqual(stripGates(active), stripGates(base));
});
