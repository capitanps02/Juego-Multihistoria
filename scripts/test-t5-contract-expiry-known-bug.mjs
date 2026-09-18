import test from 'node:test';
import assert from 'node:assert/strict';
import { EVENTS } from '../dist/content/events/index.js';
import { createInitialState } from '../dist/content/initial-state.js';
import { resolveChoiceInPlace } from '../dist/narrative/resolver.js';
import { scheduleEvent } from '../dist/narrative/scheduler.js';
import { loadSave, serializeSave } from '../dist/save/save.js';
import { advanceWorldDayInPlace } from '../dist/simulation/world-simulator.js';
import {
  contractEmploymentStatus,
  getActiveCareerOffers,
  getEligibleCareerOffers,
  proposeCareerChange,
  respondToOffer
} from '../dist/simulation/offers.js';

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
  return a.club === b.club
    && a.ownerClub === b.ownerClub
    && a.registrationClub === b.registrationClub
    && a.salary === b.salary;
}

function rejectAllActiveOffers(state) {
  for (const offer of getActiveCareerOffers(state)) respondToOffer(state, offer.id, 'reject');
}

function advanceLoyalUntilExpiry(state, maxDays = 3000) {
  for (let day = 0; day < maxDays; day += 1) {
    rejectAllActiveOffers(state);
    const scheduled = scheduleEvent(state, EVENTS, { qa: true });
    if (scheduled) resolveChoiceInPlace(state, scheduled.event, loyalChoice(scheduled.event), true);
    advanceWorldDayInPlace(state);
    if (Number(state.contract.monthsRemaining) === 0) return state;
  }
  throw new Error('reproduction invalid: loyal/512000 never reached contract expiry');
}

test('T5-QA-028a: expired contract must not remain an ordinary registered playing zombie for a full year', () => {
  const state = createInitialState(512000);
  advanceLoyalUntilExpiry(state);

  const firstZero = { date: state.date, ...employment(state) };
  let zeroDays = 0;

  while (zeroDays < 365) {
    rejectAllActiveOffers(state);
    advanceWorldDayInPlace(state);

    if (
      Number(state.contract.monthsRemaining) === 0
      && sameEmployer(employment(state), firstZero)
      && contractEmploymentStatus(state) === 'expired_pending_resolution'
    ) {
      zeroDays += 1;
      continue;
    }
    break;
  }

  const now = employment(state);
  const zombie = zeroDays >= 365
    && sameEmployer(now, firstZero)
    && now.appearances > firstZero.appearances
    && contractEmploymentStatus(state) === 'expired_pending_resolution';

  assert.equal(
    zombie,
    false,
    `T5-QA-028a: contract expired on ${firstZero.date} but after ${zeroDays} days player is still registered to ${now.registrationClub} with same employer/salary and added ${now.appearances - firstZero.appearances} appearances`
  );
});

test('T5-QA-028b: a new 1→0 expiry becomes real unattached employment and survives save/load without RNG drift', () => {
  const state = createInitialState(512000);
  advanceLoyalUntilExpiry(state);

  assert.equal(
    contractEmploymentStatus(state),
    'unattached',
    'a newly observed natural expiry must become authoritative unattached employment, not legacy expired_pending_resolution'
  );

  const beforeRng = structuredClone(state.rngState);
  const restored = loadSave(serializeSave(state));

  assert.equal(contractEmploymentStatus(restored), 'unattached');
  assert.deepEqual(restored.rngState, beforeRng, 'save/load at expiry must not consume or rewrite RNG');
  assert.equal(Number(restored.contract.monthsRemaining), 0);
});

test('T5-QA-028c: unattached player cannot accumulate ordinary old-club appearances and only a formal accepted offer re-employs', () => {
  const state = createInitialState(512000);
  advanceLoyalUntilExpiry(state);
  assert.equal(contractEmploymentStatus(state), 'unattached');

  const oldEmployment = employment(state);
  for (let day = 0; day < 120; day += 1) {
    rejectAllActiveOffers(state);
    advanceWorldDayInPlace(state);
  }

  assert.equal(
    Number(state.sport.appearances ?? 0),
    oldEmployment.appearances,
    'unattached player must not keep adding official appearances for the former club'
  );

  rejectAllActiveOffers(state);
  const rngBeforeOffer = structuredClone(state.rngState);
  proposeCareerChange(state, 'QA formal re-employment', draft => {
    draft.club = 'QA_REEMPLOY_FC';
    draft.professional.ownerClub = 'QA_REEMPLOY_FC';
    draft.professional.registrationClub = 'QA_REEMPLOY_FC';
    draft.contract.monthsRemaining = 24;
    draft.contract.salaryMonthly = Math.max(1000, oldEmployment.salary + 1000);
  });

  const reemploymentOffer = getEligibleCareerOffers(state).find(offer => offer.reason === 'QA formal re-employment');
  assert.ok(reemploymentOffer, 'formal CareerOffer authority must be able to represent re-employment');
  respondToOffer(state, reemploymentOffer.id, 'accept');

  assert.notEqual(contractEmploymentStatus(state), 'unattached');
  assert.equal(state.club, 'QA_REEMPLOY_FC');
  assert.equal(state.professional.ownerClub, 'QA_REEMPLOY_FC');
  assert.equal(state.professional.registrationClub, 'QA_REEMPLOY_FC');
  assert.ok(Number(state.contract.monthsRemaining) > 0);
  assert.deepEqual(state.rngState, rngBeforeOffer, 'formal re-employment offer generation/acceptance must consume 0 RNG');
});

test('T5-QA-028d: loyal/512000 expiry boundary is deterministic', () => {
  const a = createInitialState(512000);
  const b = createInitialState(512000);
  advanceLoyalUntilExpiry(a);
  advanceLoyalUntilExpiry(b);

  assert.equal(a.date, b.date);
  assert.deepEqual(employment(a), employment(b));
  assert.deepEqual(a.rngState, b.rngState);
  assert.equal(contractEmploymentStatus(a), contractEmploymentStatus(b));
});


test('T5-QA-028e: persisted employment authority cannot claim active club employment at zero months', () => {
  for (const status of ['contracted', 'loaned']) {
    const state = createInitialState(status === 'contracted' ? 512101 : 512102);
    state.contract.monthsRemaining = 0;
    state.contract.salaryMonthly = 4200;
    state.professional.route = status === 'loaned' ? 'loan' : 'home';
    state.flags.LOAN_ACTIVE = status === 'loaned';
    state.employment = {
      version: 1,
      status,
      since: state.date,
      previous: null
    };
    const before = structuredClone(state);

    assert.throws(
      () => serializeSave(state),
      error => error?.code === 'INVALID_SAVE',
      `${status} with zero contract months must fail closed before persistence`
    );
    assert.throws(
      () => loadSave(JSON.stringify(state)),
      error => error?.code === 'INVALID_SAVE',
      `${status} with zero contract months must fail closed before gameplay`
    );
    assert.deepEqual(state, before, 'employment validation must be read-only');
  }
});
