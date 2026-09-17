import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState } from '../dist/content/initial-state.js';
import { EVENTS_18_20 as BASE_EVENTS_18_20 } from '../dist/content/events/18_20/canonical-events.js';
import { applyAge18MarketOfferBridges } from '../dist/content/events/18_20/t51-age18-market-offer-bridges.js';
import { eligibleChoices } from '../dist/narrative/choice-eligibility.js';
import { offerBridgeEligible, offerBridgeSpec } from '../dist/narrative/offer-bridge.js';
import { loadSave, serializeSave } from '../dist/save/save.js';
import {
  AGE18_JAN_OFFER_MONTH_DAY,
  AGE18_SUMMER_OFFER_MONTH_DAY,
  materializeAge18MarketOfferInPlace
} from '../dist/simulation/early-career-market.js';
import { careerOfferKind, careerTerms, respondToOffer } from '../dist/simulation/offers.js';

const REPAIRED = applyAge18MarketOfferBridges(BASE_EVENTS_18_20);
const JAN = REPAIRED.find(event => event.id === 'EVT_18_JAN_001');
const SUM = REPAIRED.find(event => event.id === 'EVT_18_SUM_001');
assert.ok(JAN && SUM);

function rngSnapshot(state) {
  return structuredClone(state.rngState);
}

function findState({ date, expectedKind, setup = () => {}, limit = 4096 }) {
  for (let seed = 1; seed <= limit; seed++) {
    const state = createInitialState(seed);
    state.date = date;
    setup(state);
    const rng = rngSnapshot(state);
    const before = careerTerms(state);
    const kind = materializeAge18MarketOfferInPlace(state);
    assert.deepEqual(state.rngState, rng, 'age-18 materialisation must consume zero RNG draws');
    assert.deepEqual(careerTerms(state), before, 'proposal materialisation must not mutate live CareerTerms');
    if (kind === expectedKind) return state;
  }
  throw new Error(`No deterministic ${expectedKind} producer case found within ${limit} seeds`);
}

function januaryLoanState() {
  return findState({
    date: `2027-${AGE18_JAN_OFFER_MONTH_DAY}`,
    expectedKind: 'loan',
    setup(state) {
      state.sport.roleScore = 20;
      state.sport.appearances = 0;
      state.reputation.marketHeat = 8;
      state.flags.OFFICIAL_DEBUT = false;
    }
  });
}

function januaryTransferState() {
  return findState({
    date: `2027-${AGE18_JAN_OFFER_MONTH_DAY}`,
    expectedKind: 'transfer',
    setup(state) {
      state.sport.roleScore = 64;
      state.sport.appearances = 8;
      state.reputation.marketHeat = 62;
      state.flags.OFFICIAL_DEBUT = true;
    }
  });
}

function summerRenewalState() {
  return findState({
    date: `2027-${AGE18_SUMMER_OFFER_MONTH_DAY}`,
    expectedKind: 'renewal',
    setup(state) {
      state.reputation.marketHeat = 10;
      state.sport.appearances = 2;
      state.flags.OFFICIAL_DEBUT = true;
    }
  });
}

function summerTransferState() {
  return findState({
    date: `2027-${AGE18_SUMMER_OFFER_MONTH_DAY}`,
    expectedKind: 'transfer',
    setup(state) {
      state.reputation.marketHeat = 72;
      state.sport.appearances = 12;
      state.sport.roleScore = 62;
      state.flags.OFFICIAL_DEBUT = true;
    }
  });
}

function ids(choices) {
  return choices.map(choice => choice.id).sort();
}

function termMutation(effect) {
  if (!effect) return false;
  if (effect.kind === 'flag') return ['LOAN_ACTIVE', 'ABROAD_ROUTE', 'BIG_CLUB'].includes(effect.flag);
  if (effect.kind !== 'set') return false;
  return [
    'club', 'tier', 'contract.monthsRemaining', 'contract.salaryMonthly', 'contract.releaseClause',
    'professional.ownerClub', 'professional.registrationClub', 'professional.leagueTier',
    'professional.clubPrestigeTier', 'professional.clubPrestigeScore', 'professional.route', 'world.ownerClub'
  ].includes(effect.path);
}

test('age-18 producer is deterministic, detached and preserves pending offer through save/load', () => {
  const a = januaryLoanState();
  const seed = a.rngState.narrative.seed;
  const beforeOffer = structuredClone(a.market.pending);
  const restored = loadSave(serializeSave(a));
  assert.deepEqual(restored.market.pending, beforeOffer);
  assert.equal(careerOfferKind(restored.market.pending), 'loan');
  assert.equal(restored.market.pending.terms.ownerClub, 'UDV');
  assert.notEqual(restored.market.pending.terms.registrationClub, 'UDV');

  const b = januaryLoanState();
  assert.equal(b.rngState.narrative.seed, seed);
  assert.deepEqual(b.market.pending, beforeOffer);
});

test('producer attempts only on the one authoritative date in each age-18 market window', () => {
  for (const date of ['2027-01-07', '2027-01-09', '2027-06-03', '2027-06-05']) {
    const state = createInitialState(77);
    state.date = date;
    state.sport.roleScore = 20;
    state.reputation.marketHeat = 70;
    state.sport.appearances = 10;
    state.flags.OFFICIAL_DEBUT = true;
    const rng = rngSnapshot(state);
    assert.equal(materializeAge18MarketOfferInPlace(state), null, `${date} must not reroll the window`);
    assert.equal(state.market.pending, null);
    assert.deepEqual(state.rngState, rng);
  }
});

test('January bridge exposes only the formal action matching the one real proposal', () => {
  const loan = januaryLoanState();
  assert.equal(offerBridgeEligible(loan, JAN), true);
  assert.deepEqual(ids(eligibleChoices(loan, JAN)), ['LOAN', 'STAY_WITH_ROLE', 'WAIT_DEADLINE']);
  assert.deepEqual(offerBridgeSpec(JAN).choiceActions, {
    STAY_WITH_ROLE: 'reject', LOAN: 'accept', TRANSFER: 'accept', WAIT_DEADLINE: 'defer'
  });

  const transfer = januaryTransferState();
  assert.equal(offerBridgeEligible(transfer, JAN), true);
  assert.deepEqual(ids(eligibleChoices(transfer, JAN)), ['STAY_WITH_ROLE', 'TRANSFER', 'WAIT_DEADLINE']);
});

test('Summer bridge distinguishes renewal from a real exit offer without synthetic availability flags', () => {
  const renewal = summerRenewalState();
  assert.equal(offerBridgeEligible(renewal, SUM), true);
  assert.deepEqual(ids(eligibleChoices(renewal, SUM)), ['FLEXIBILITY', 'STABILITY', 'WAIT']);
  assert.deepEqual(offerBridgeSpec(SUM).choiceActions, {
    STABILITY: 'accept', FLEXIBILITY: 'counter', WAIT: 'defer', REQUEST_EXIT: 'accept'
  });

  const transfer = summerTransferState();
  assert.equal(offerBridgeEligible(transfer, SUM), true);
  assert.deepEqual(ids(eligibleChoices(transfer, SUM)), ['REQUEST_EXIT', 'WAIT']);
});

test('staged JAN/SUM bridge definitions contain no narrative CareerTerms mutation', () => {
  for (const event of [JAN, SUM]) {
    for (const choice of event.choices) {
      assert.equal((choice.immediateEffects ?? []).some(termMutation), false, `${event.id}/${choice.id} immediate effect mutates CareerTerms`);
    }
    for (const outcome of event.outcomes) {
      assert.equal(outcome.effects.some(termMutation), false, `${event.id}/${outcome.id} outcome mutates CareerTerms`);
    }
  }
});

test('accepting a staged January loan applies exact formal terms once and preserves UDV ownership', () => {
  const state = januaryLoanState();
  const offer = structuredClone(state.market.pending);
  const before = careerTerms(state);
  assert.equal(careerOfferKind(offer), 'loan');
  assert.deepEqual(careerTerms(state), before);
  respondToOffer(state, offer.id, 'accept');
  assert.equal(state.market.pending, null);
  assert.equal(state.club, offer.terms.club);
  assert.equal(state.professional.registrationClub, offer.terms.registrationClub);
  assert.equal(state.professional.ownerClub, 'UDV');
  assert.equal(state.flags.LOAN_ACTIVE, true);
  assert.equal(state.market.history.at(-1).accepted, true);
});

test('summer signing does not overlap the active-loan lifecycle', () => {
  const state = createInitialState(901);
  state.date = `2027-${AGE18_SUMMER_OFFER_MONTH_DAY}`;
  state.club = 'Development_4_01';
  state.tier = 4;
  state.professional.ownerClub = 'UDV';
  state.professional.registrationClub = 'Development_4_01';
  state.professional.leagueTier = 4;
  state.professional.route = 'loan';
  state.flags.LOAN_ACTIVE = true;
  const before = structuredClone(state);
  assert.equal(materializeAge18MarketOfferInPlace(state), null);
  assert.equal(state.market.pending, null);
  assert.deepEqual(state.rngState, before.rngState);
});
