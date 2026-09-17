import test from 'node:test';
import assert from 'node:assert/strict';
import { EVENTS } from '../dist/content/events/index.js';
import { createInitialState } from '../dist/content/initial-state.js';
import { resolveChoiceInPlace } from '../dist/narrative/resolver.js';
import { scheduleEvent } from '../dist/narrative/scheduler.js';
import { advanceWorldDayInPlace } from '../dist/simulation/world-simulator.js';
import { contractEmploymentStatus, respondToOffer } from '../dist/simulation/offers.js';

const WEIGHTS = { loyalty: 7, home: 7, team: 5, mentor: 4, family: 4, continuity: 5 };
function loyalChoice(event) {
  let best = -Infinity;
  let bestIndex = Math.floor((event.choices.length - 1) / 2);
  for (let i = 0; i < event.choices.length; i++) {
    const choice = event.choices[i];
    const haystack = [...choice.intentTags, choice.label].join(' ').toLowerCase();
    let score = 0;
    for (const [token, weight] of Object.entries(WEIGHTS)) if (haystack.includes(token)) score += weight;
    if (score > best && score > 0) { best = score; bestIndex = i; }
  }
  return event.choices[bestIndex].id;
}
function employment(state) {
  return {
    club: state.club,
    ownerClub: state.professional.ownerClub,
    registrationClub: state.professional.registrationClub,
    salary: Number(state.contract.salaryMonthly),
    appearances: Number(state.sport.appearances ?? 0)
  };
}
function sameEmployer(a, b) {
  return a.club === b.club && a.ownerClub === b.ownerClub && a.registrationClub === b.registrationClub && a.salary === b.salary;
}

test('T5-QA-028: expired contract must not remain an ordinary registered playing zombie for a full year', () => {
  const state = createInitialState(512000);
  let firstZero = null;
  let zeroDays = 0;
  let guard = 0;

  while (guard++ < 3000 && zeroDays < 365) {
    if (state.market?.pending) respondToOffer(state, state.market.pending.id, 'reject');
    const scheduled = scheduleEvent(state, EVENTS, { qa: true });
    if (scheduled) resolveChoiceInPlace(state, scheduled.event, loyalChoice(scheduled.event), true);
    advanceWorldDayInPlace(state);

    if (Number(state.contract.monthsRemaining) !== 0) continue;
    if (!firstZero) firstZero = { date: state.date, ...employment(state) };
    if (sameEmployer(employment(state), firstZero) && contractEmploymentStatus(state) === 'expired_pending_resolution') zeroDays += 1;
    else break;
  }

  assert.ok(firstZero, 'reproduction invalid: loyal/512000 never reached contract expiry');
  const now = employment(state);
  const zombie = zeroDays >= 365
    && sameEmployer(now, firstZero)
    && now.appearances > firstZero.appearances
    && contractEmploymentStatus(state) === 'expired_pending_resolution';

  assert.equal(
    zombie,
    false,
    `T5-QA-028: contract expired on ${firstZero.date} but after ${zeroDays} days player is still registered to ${now.registrationClub} with same employer/salary and added ${now.appearances - firstZero.appearances} appearances`
  );
});
