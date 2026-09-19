import test from 'node:test';
import assert from 'node:assert/strict';
import { EVENTS } from '../dist/content/events/index.js';
import { createInitialState } from '../dist/content/initial-state.js';
import { resolveChoiceInPlace } from '../dist/narrative/resolver.js';
import { scheduleEvent } from '../dist/narrative/scheduler.js';
import { advanceWorldDayInPlace } from '../dist/simulation/world-simulator.js';
import { respondToOffer } from '../dist/simulation/offers.js';
import { closeCareer } from '../dist/simulation/late-career-engine.js';

function chooseAlternating(event, decisionIndex) {
  const choices = event.choices;
  const index = decisionIndex % 2 === 0 ? 0 : choices.length - 1;
  return choices[index].id;
}

test('T5-QA-LC-001: contradictory/518000 no longer deadlocks after voluntary retirement continuation', () => {
  const state = createInitialState(518000);
  let decisions = 0;
  const maxDays = 14000;

  for (let days = 0; days < maxDays; days++) {
    if (state.market?.pending) respondToOffer(state, state.market.pending.id, 'accept');
    const scheduled = scheduleEvent(state, EVENTS, { qa: true });
    if (scheduled) {
      const choiceId = chooseAlternating(scheduled.event, decisions++);
      resolveChoiceInPlace(state, scheduled.event, choiceId, true);
    }
    if (state.flags.EARLY_RETIRED_30_34 && state.retirement.status !== 'closed') {
      closeCareer(state, 'early_retirement_30_34', 'early_retirement');
    }
    if (state.retirement.status === 'closed') break;
    advanceWorldDayInPlace(state);
    if (state.age >= 55) break;
  }

  assert.equal(state.retirement.status, 'closed',
    `known contradictory/518000 path must close; final age=${state.age}, status=${state.retirement.status}`);
  assert.ok(state.history.length > 0);
});
