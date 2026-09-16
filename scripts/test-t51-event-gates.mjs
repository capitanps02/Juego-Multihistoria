import assert from 'node:assert/strict';
import test from 'node:test';
import { createInitialState } from '../dist/content/initial-state.js';
import { ambiguousEvent } from '../dist/content/events/18_20/helpers.js';
import { scheduleEvent } from '../dist/narrative/scheduler.js';
import { eventGatesPass } from '../dist/narrative/event-gates.js';

function fixtureEvent() {
  return {
    id: 'T51_EVENT_GATE_OR',
    ageWindow: [18, 18],
    phase: '18_20',
    family: 'press',
    gates: [{ path: 'flags.COMMON_PREREQUISITE', op: 'eq', value: true }],
    gateAlternatives: [
      [{ path: 'flags.ROUTE_A', op: 'eq', value: true }],
      [
        { path: 'reputation.mediaHeat', op: 'gte', value: 20 },
        { path: 'flags.RECENT_CONFLICT', op: 'eq', value: true }
      ]
    ],
    cooldown: 0,
    repeatable: false,
    weight: 100,
    text: { title: 'OR gate fixture', body: 'Fixture para contrato OR de reachability.' },
    intel: { visible: [], uncertain: [] },
    choices: [{ id: 'OK', label: 'Seguir', intentTags: [], outcomeIds: ['OK_OUT'] }],
    outcomes: [{ id: 'OK_OUT', baseWeight: 1, effects: [], messages: ['ok'] }]
  };
}

function sched(state, event) {
  state.runtime.daysSinceNarrative = 999;
  return scheduleEvent(state, [event], { ignoreRhythmGate: true });
}

test('legacy event without gateAlternatives keeps flat AND behavior', () => {
  const state = createInitialState(424242);
  const event = fixtureEvent();
  delete event.gateAlternatives;
  state.flags.COMMON_PREREQUISITE = true;
  assert.equal(eventGatesPass(state, event), true);
  state.flags.COMMON_PREREQUISITE = false;
  assert.equal(eventGatesPass(state, event), false);
});

test('route A alone satisfies the OR alternatives when common gates pass', () => {
  const state = createInitialState(424242);
  const event = fixtureEvent();
  state.flags.COMMON_PREREQUISITE = true;
  state.flags.ROUTE_A = true;
  assert.equal(eventGatesPass(state, event), true);
  assert.ok(sched(state, event));
});

test('route B is internally AND: partial route does not satisfy the event', () => {
  const state = createInitialState(424242);
  const event = fixtureEvent();
  state.flags.COMMON_PREREQUISITE = true;
  state.reputation.mediaHeat = 25;
  state.flags.RECENT_CONFLICT = false;
  assert.equal(eventGatesPass(state, event), false);
  assert.equal(sched(state, event), null);

  state.flags.RECENT_CONFLICT = true;
  assert.equal(eventGatesPass(state, event), true);
  assert.ok(sched(state, event));
});

test('common flat gates remain mandatory even when one alternative route passes', () => {
  const state = createInitialState(424242);
  const event = fixtureEvent();
  state.flags.COMMON_PREREQUISITE = false;
  state.flags.ROUTE_A = true;
  assert.equal(eventGatesPass(state, event), false);
  assert.equal(sched(state, event), null);
});

test('explicit empty alternatives fail closed instead of widening reachability', () => {
  const state = createInitialState(424242);
  const event = fixtureEvent();
  state.flags.COMMON_PREREQUISITE = true;
  event.gateAlternatives = [];
  assert.equal(eventGatesPass(state, event), false);
  assert.equal(sched(state, event), null);
});

test('an empty inner route also fails closed', () => {
  const state = createInitialState(424242);
  const event = fixtureEvent();
  state.flags.COMMON_PREREQUISITE = true;
  event.gateAlternatives = [[]];
  assert.equal(eventGatesPass(state, event), false);
  assert.equal(sched(state, event), null);
});

test('evaluating event alternatives does not mutate event, state or RNG', () => {
  const state = createInitialState(424242);
  const event = fixtureEvent();
  state.flags.COMMON_PREREQUISITE = true;
  state.flags.ROUTE_A = true;
  const eventBefore = structuredClone(event);
  const stateBefore = structuredClone(state);
  for (let i = 0; i < 20; i++) assert.equal(eventGatesPass(state, event), true);
  assert.deepEqual(event, eventBefore);
  assert.deepEqual(state, stateBefore);
});

test('ambiguousEvent propagates gateAlternatives for 18-20 canonical consumers', () => {
  const gateAlternatives = [
    [{ path: 'flags.PHOTO', op: 'eq', value: true }],
    [
      { path: 'reputation.mediaHeat', op: 'gte', value: 20 },
      { path: 'flags.RECENT_CONFLICT', op: 'eq', value: true }
    ]
  ];
  const event = ambiguousEvent({
    id: 'T51_HELPER_OR', ageWindow: [18, 19], family: 'press', title: 'Helper OR',
    body: 'Fixture.', visible: [], uncertain: [], gateAlternatives,
    choices: [
      { id: 'ONE', label: 'Uno', intentTags: [], primaryMessage: 'uno', secondaryMessage: 'uno2' },
      { id: 'TWO', label: 'Dos', intentTags: [], primaryMessage: 'dos', secondaryMessage: 'dos2' }
    ]
  });
  assert.deepEqual(event.gateAlternatives, gateAlternatives);
  const state = createInitialState(424242);
  state.reputation.mediaHeat = 25;
  state.flags.RECENT_CONFLICT = true;
  assert.equal(eventGatesPass(state, event), true);
  assert.ok(sched(state, event));
});
