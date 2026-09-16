import assert from 'node:assert/strict';
import test from 'node:test';
import { createInitialState } from '../dist/content/initial-state.js';
import { scheduleEvent } from '../dist/narrative/scheduler.js';
import { chooseForProfile } from './t6-profiles.mjs';

function eligibilityFixture() {
  return {
    id: 'T6_CHOICE_ELIGIBILITY',
    ageWindow: [18, 18],
    phase: '18_20',
    family: 'market',
    gates: [],
    cooldown: 0,
    repeatable: false,
    weight: 100,
    text: { title: 'Eligibility', body: 'T6 scheduler contract fixture.' },
    intel: { visible: [], uncertain: [] },
    choices: [
      {
        id: 'SAFE',
        label: 'Take the safe option',
        intentTags: ['safety'],
        outcomeIds: ['SAFE_OUT']
      },
      {
        id: 'BLOCKED_HIGH_SCORE',
        label: 'Take the elite opportunity',
        intentTags: ['elite', 'ambition'],
        outcomeIds: ['BLOCKED_OUT'],
        eligibility: [{ path: 'flags.T6_ELITE_AVAILABLE', op: 'eq', value: true }]
      }
    ],
    outcomes: [
      { id: 'SAFE_OUT', baseWeight: 1, effects: [], messages: ['safe'] },
      { id: 'BLOCKED_OUT', baseWeight: 1, effects: [], messages: ['elite'] }
    ]
  };
}

const profile = {
  id: 'eligibility-probe',
  offer: 'accept',
  fallback: 'first',
  weights: { elite: 100, ambition: 50, safety: 1 }
};

function scheduleFixture(state, event) {
  return scheduleEvent(state, [event], { ignoreRhythmGate: true });
}

test('T6 profile selection scores only choices materialized as eligible by the scheduler', () => {
  const state = createInitialState(616161);
  state.flags.T6_ELITE_AVAILABLE = false;
  const event = eligibilityFixture();

  const scheduled = scheduleFixture(state, event);
  assert.ok(scheduled);
  assert.deepEqual(scheduled.event.choices.map(choice => choice.id), ['SAFE']);
  assert.deepEqual(event.choices.map(choice => choice.id), ['SAFE', 'BLOCKED_HIGH_SCORE']);

  const selected = chooseForProfile(profile, scheduled.event, 0);
  assert.equal(selected.choiceId, 'SAFE');
  assert.equal(selected.score, 1);
});

test('T6 profile selection can choose the high-score option once the scheduler exposes it', () => {
  const state = createInitialState(616161);
  state.flags.T6_ELITE_AVAILABLE = true;
  const event = eligibilityFixture();

  const scheduled = scheduleFixture(state, event);
  assert.ok(scheduled);
  assert.deepEqual(scheduled.event.choices.map(choice => choice.id), ['SAFE', 'BLOCKED_HIGH_SCORE']);

  const selected = chooseForProfile(profile, scheduled.event, 0);
  assert.equal(selected.choiceId, 'BLOCKED_HIGH_SCORE');
  assert.equal(selected.score, 150);
});
