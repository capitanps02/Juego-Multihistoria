import assert from 'node:assert/strict';
import test from 'node:test';
import { createInitialState } from '../dist/content/initial-state.js';
import { scheduleEvent } from '../dist/narrative/scheduler.js';
import { chooseForProfile, T6_PROFILES } from './t6-profiles.mjs';

function fixtureEvent() {
  return {
    id: 'T6_CHOICE_ELIGIBILITY',
    ageWindow: [18, 18],
    phase: '18_20',
    family: 'market',
    gates: [],
    cooldown: 0,
    repeatable: false,
    weight: 100,
    text: { title: 'T6 eligibility', body: 'Regression fixture.' },
    intel: { visible: [], uncertain: [] },
    choices: [
      {
        id: 'STAY',
        label: 'Seguir con el equipo',
        intentTags: ['loyalty', 'team'],
        outcomeIds: ['STAY_OUT']
      },
      {
        id: 'CASH',
        label: 'Aceptar el gran contrato',
        intentTags: ['money', 'salary', 'contract'],
        outcomeIds: ['CASH_OUT'],
        eligibility: [{ path: 'flags.T6_MONEY_ROUTE', op: 'eq', value: true }]
      }
    ],
    outcomes: [
      { id: 'STAY_OUT', baseWeight: 1, effects: [], messages: ['stay'] },
      { id: 'CASH_OUT', baseWeight: 1, effects: [], messages: ['cash'] }
    ]
  };
}

function schedule(state, event) {
  return scheduleEvent(state, [event], { ignoreRhythmGate: true });
}

const moneyFirst = T6_PROFILES.find(profile => profile.id === 'money-first');

test('T6 selector only sees choices materialized as eligible by the production scheduler', () => {
  assert.ok(moneyFirst);
  const state = createInitialState(610001);
  state.flags.T6_MONEY_ROUTE = false;
  const event = fixtureEvent();

  const scheduled = schedule(state, event);
  assert.ok(scheduled);
  assert.deepEqual(scheduled.event.choices.map(choice => choice.id), ['STAY']);

  const selected = chooseForProfile(moneyFirst, scheduled.event, 0);
  assert.equal(selected.choiceId, 'STAY');
  assert.deepEqual(event.choices.map(choice => choice.id), ['STAY', 'CASH'], 'canonical event must remain untouched');
});

test('T6 selector can choose the semantically preferred choice once production marks it eligible', () => {
  assert.ok(moneyFirst);
  const state = createInitialState(610001);
  state.flags.T6_MONEY_ROUTE = true;
  const event = fixtureEvent();

  const scheduled = schedule(state, event);
  assert.ok(scheduled);
  assert.deepEqual(scheduled.event.choices.map(choice => choice.id), ['STAY', 'CASH']);

  const selected = chooseForProfile(moneyFirst, scheduled.event, 0);
  assert.equal(selected.choiceId, 'CASH');
  assert.equal(selected.usedFallback, false);
  assert.ok(selected.score > 0);
});
