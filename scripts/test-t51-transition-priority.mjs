import assert from 'node:assert/strict';
import test from 'node:test';
import { createInitialState } from '../dist/content/initial-state.js';
import { scheduleEvent } from '../dist/narrative/scheduler.js';
import { MANDATORY_TRANSITION_GRACE_DAYS, withMandatoryTransitionPriority } from '../dist/narrative/transition-priority.js';

function event(id, overrides = {}) {
  return {
    id,
    ageWindow: [30, 30],
    phase: '30_34',
    family: 'team',
    gates: [],
    cooldown: 0,
    repeatable: false,
    weight: 1,
    text: { title: id, body: id },
    intel: { visible: [], uncertain: [] },
    choices: [{ id: 'A', label: 'Continuar', intentTags: ['continue'], outcomeIds: ['O'] }],
    outcomes: [{ id: 'O', baseWeight: 1, effects: [], messages: ['ok'] }],
    ...overrides
  };
}

function boundaryState(seed = 12345) {
  const state = createInitialState(seed);
  state.age = 30;
  state.phase = '30_34';
  state.date = '2038-07-01';
  state.season = '2038-39';
  state.runtime.seasonDay = 0;
  state.runtime.daysSinceNarrative = 999;
  state.runtime.eventsThisSeason = 0;
  return state;
}

function historyRow(state, id = 'EVT_FILL') {
  return {
    eventId: id,
    date: state.date,
    season: state.season,
    choiceId: 'A',
    outcomeId: 'O',
    club: state.club,
    snapshot: { age: state.age, family: 'team' },
    salience: 1,
    visibility: 'private'
  };
}

test('mandatory transition preempts ordinary candidates without consuming narrative RNG', () => {
  const state = boundaryState();
  const mandatory = withMandatoryTransitionPriority(event('EVT_TRANSITION'));
  const ordinary = event('EVT_ORDINARY', { weight: 999 });
  const rngBefore = structuredClone(state.rngState.narrative);
  const scheduled = scheduleEvent(state, [ordinary, mandatory], { qa: true });
  assert.equal(scheduled?.event.id, mandatory.id);
  assert.deepEqual(state.rngState.narrative, rngBefore);
  assert.equal(scheduled?.debug, undefined, 'priority scheduling must not fabricate an RNG draw');
});

test('mandatory transition bypasses narrative rhythm and period budget only', () => {
  const state = boundaryState();
  state.runtime.daysSinceNarrative = 0;
  state.history.push(historyRow(state));
  const mandatory = withMandatoryTransitionPriority(event('EVT_TRANSITION_BUDGET'));
  const scheduled = scheduleEvent(state, [mandatory]);
  assert.equal(scheduled?.event.id, mandatory.id);
});

test('mandatory transition still respects gates, cooldown, seen and choice eligibility', () => {
  const cases = [
    event('EVT_GATE', { gates: [{ path: 'flags.NEVER_TRUE_FOR_TEST', op: 'eq', value: true }] }),
    event('EVT_CHOICE', { choices: [{ id: 'A', label: 'Bloqueada', intentTags: [], outcomeIds: ['O'], eligibility: [{ path: 'flags.NEVER_TRUE_FOR_TEST', op: 'eq', value: true }] }] })
  ].map(withMandatoryTransitionPriority);

  for (const candidate of cases) {
    const state = boundaryState();
    const rngBefore = structuredClone(state.rngState.narrative);
    assert.equal(scheduleEvent(state, [candidate]), null);
    assert.deepEqual(state.rngState.narrative, rngBefore);
  }

  {
    const state = boundaryState();
    const candidate = withMandatoryTransitionPriority(event('EVT_COOLDOWN'));
    state.eventCooldowns[candidate.id] = 3;
    assert.equal(scheduleEvent(state, [candidate]), null);
  }

  {
    const state = boundaryState();
    const candidate = withMandatoryTransitionPriority(event('EVT_SEEN'));
    state.flags[`SEEN_${candidate.id}`] = true;
    assert.equal(scheduleEvent(state, [candidate]), null);
  }
});

test('priority applies only to exact phase-boundary age and grace window', () => {
  const candidate = withMandatoryTransitionPriority(event('EVT_WINDOW'));

  const outsideGrace = boundaryState();
  outsideGrace.runtime.seasonDay = MANDATORY_TRANSITION_GRACE_DAYS + 1;
  outsideGrace.runtime.daysSinceNarrative = 0;
  assert.equal(scheduleEvent(outsideGrace, [candidate]), null, 'outside grace it must fall back to ordinary rhythm');

  const wrongAge = boundaryState();
  wrongAge.age = 31;
  wrongAge.runtime.daysSinceNarrative = 0;
  const age31 = withMandatoryTransitionPriority(event('EVT_NOT_BOUNDARY', { ageWindow: [31, 31] }));
  assert.equal(scheduleEvent(wrongAge, [age31]), null, 'non-boundary ages must never get transition priority');
});

test('multiple eligible mandatory transitions fail closed without RNG', () => {
  const state = boundaryState();
  const a = withMandatoryTransitionPriority(event('EVT_TRANSITION_A'));
  const b = withMandatoryTransitionPriority(event('EVT_TRANSITION_B'));
  const rngBefore = structuredClone(state.rngState.narrative);
  assert.throws(() => scheduleEvent(state, [a, b]), /Ambiguous mandatory transition priority/);
  assert.deepEqual(state.rngState.narrative, rngBefore);
});

test('unmarked events preserve ordinary weighted scheduling and RNG semantics', () => {
  const candidates = [event('EVT_NORMAL_A'), event('EVT_NORMAL_B')];
  let observed = false;

  // Age-30 ordinary windows intentionally skip one period depending on narrative seed.
  // Search a small deterministic seed range so this regression tests the weighted path
  // itself instead of accidentally pinning the scheduler's separate seasonal-skip policy.
  for (let seed = 1; seed <= 100; seed++) {
    const state = boundaryState(seed);
    const before = state.rngState.narrative.draws;
    const scheduled = scheduleEvent(state, candidates, { qa: true });
    if (!scheduled) continue;

    assert.equal(state.rngState.narrative.draws, before + 1);
    assert.equal(typeof scheduled.debug?.rngDraw, 'number');
    assert.ok(['EVT_NORMAL_A', 'EVT_NORMAL_B'].includes(scheduled.event.id));
    observed = true;
    break;
  }

  assert.equal(observed, true, 'expected at least one seed with an open ordinary period budget');
});
