import assert from 'node:assert/strict';
import test from 'node:test';
import { createInitialState } from '../dist/content/initial-state.js';
import { ambiguousEvent } from '../dist/content/events/18_20/helpers.js';
import { eventGatesPass, withAlternativeGates } from '../dist/narrative/event-gates.js';
import { scheduleEvent } from '../dist/narrative/scheduler.js';

const flagIs = (flag, value = true) => ({ path: `flags.${flag}`, op: 'eq', value });

function baseEvent(overrides = {}) {
  return {
    id: 'T51_OR_GATE_FIXTURE',
    ageWindow: [18, 18],
    phase: '18_20',
    family: 'press',
    gates: [],
    cooldown: 0,
    repeatable: false,
    weight: 100,
    tags: ['hard_deadline'],
    text: { title: 'OR gate fixture', body: 'Fixture de rutas causales alternativas.' },
    intel: { visible: [], uncertain: [] },
    choices: [
      { id: 'A', label: 'A', intentTags: [], outcomeIds: ['A_OUT'] },
      { id: 'B', label: 'B', intentTags: [], outcomeIds: ['B_OUT'] }
    ],
    outcomes: [
      { id: 'A_OUT', baseWeight: 1, effects: [], messages: ['A'] },
      { id: 'B_OUT', baseWeight: 1, effects: [], messages: ['B'] }
    ],
    ...overrides
  };
}

function state() {
  return createInitialState(123456);
}

test('historical AND-only events keep their exact gate semantics', () => {
  const s = state();
  const event = baseEvent({ gates: [flagIs('COMMON')] });
  assert.equal(eventGatesPass(s, event), false);
  s.flags.COMMON = true;
  assert.equal(eventGatesPass(s, event), true);
});

test('either alternative causal route can unlock the event', () => {
  const event = withAlternativeGates(baseEvent(), [
    [flagIs('ROUTE_A')],
    [flagIs('ROUTE_B')]
  ]);
  const a = state();
  a.flags.ROUTE_A = true;
  assert.equal(eventGatesPass(a, event), true);
  const b = state();
  b.flags.ROUTE_B = true;
  assert.equal(eventGatesPass(b, event), true);
  assert.equal(eventGatesPass(state(), event), false);
});

test('common gates remain mandatory even when one OR route passes', () => {
  const event = withAlternativeGates(baseEvent({ gates: [flagIs('COMMON')] }), [
    [flagIs('ROUTE_A')],
    [flagIs('ROUTE_B')]
  ]);
  const s = state();
  s.flags.ROUTE_A = true;
  assert.equal(eventGatesPass(s, event), false);
  s.flags.COMMON = true;
  assert.equal(eventGatesPass(s, event), true);
});

test('conditions inside one alternative group are conjunctive', () => {
  const event = withAlternativeGates(baseEvent(), [
    [flagIs('A1'), flagIs('A2')],
    [flagIs('B1')]
  ]);
  const partial = state();
  partial.flags.A1 = true;
  assert.equal(eventGatesPass(partial, event), false);
  partial.flags.A2 = true;
  assert.equal(eventGatesPass(partial, event), true);
});

test('malformed opt-in OR data fails closed instead of widening reachability', () => {
  const s = state();
  assert.equal(eventGatesPass(s, { ...baseEvent(), gateAny: [] }), false);
  assert.equal(eventGatesPass(s, { ...baseEvent(), gateAny: [[]] }), false);
});

test('OR gate evaluation itself consumes no RNG and mutates no state', () => {
  const s = state();
  s.flags.ROUTE_A = true;
  const event = withAlternativeGates(baseEvent(), [[flagIs('ROUTE_A')], [flagIs('ROUTE_B')]]);
  const before = structuredClone(s);
  for (let i = 0; i < 20; i++) assert.equal(eventGatesPass(s, event), true);
  assert.deepEqual(s, before);
});

test('scheduler applies OR semantics before weighted selection', () => {
  const event = withAlternativeGates(baseEvent(), [[flagIs('ROUTE_A')], [flagIs('ROUTE_B')]]);
  assert.equal(scheduleEvent(state(), [event], { ignoreRhythmGate: true }), null);
  const s = state();
  s.flags.ROUTE_B = true;
  const scheduled = scheduleEvent(s, [event], { ignoreRhythmGate: true });
  assert.equal(scheduled?.event.id, event.id);
});

test('withAlternativeGates is immutable and explicit for direct event modules', () => {
  const original = baseEvent();
  const gateAny = [[flagIs('A')], [flagIs('B')]];
  const wrapped = withAlternativeGates(original, gateAny);
  assert.equal('gateAny' in original, false);
  assert.deepEqual(wrapped.gateAny, gateAny);
  assert.notEqual(wrapped, original);
});

test('ambiguousEvent propagates alternative causal routes for 18-20 consumers', () => {
  const gateAny = [[flagIs('PHOTO')], [flagIs('EXPOSURE'), flagIs('RECENT_CONFLICT')]];
  const event = ambiguousEvent({
    id: 'T51_HELPER_OR', ageWindow: [18, 19], family: 'conditional',
    title: 'Helper OR', body: 'Fixture.', visible: [], uncertain: [], gateAny,
    choices: [
      { id: 'ONE', label: 'One', intentTags: [], primaryMessage: 'one', secondaryMessage: 'one2' },
      { id: 'TWO', label: 'Two', intentTags: [], primaryMessage: 'two', secondaryMessage: 'two2' }
    ]
  });
  assert.deepEqual(event.gateAny, gateAny);
  const s = state();
  s.flags.EXPOSURE = true;
  s.flags.RECENT_CONFLICT = true;
  assert.equal(eventGatesPass(s, event), true);
});
