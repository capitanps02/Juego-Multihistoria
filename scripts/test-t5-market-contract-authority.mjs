import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState } from '../dist/content/initial-state.js';
import { loadSave, serializeSave } from '../dist/save/save.js';
import { narrativeConditionRoot } from '../dist/simulation/club-contract-intent.js';
import {
  careerOfferKind,
  careerTerms,
  contractEmploymentStatus,
  eligibleCareerOfferKind,
  getActiveCareerOffers,
  getEligibleLoanOffers,
  getEligibleRenewalOffers,
  getEligibleTransferOffers,
  proposeCareerChange,
  respondToOffer
} from '../dist/simulation/offers.js';

function rngSnapshot(state) {
  return structuredClone(state.rngState);
}

test('formal offer queries are detached, deterministic and distinguish renewal/transfer/loan', () => {
  const renewal = createInitialState(301);
  const rng = rngSnapshot(renewal);
  proposeCareerChange(renewal, 'Renovación de contrato', draft => {
    draft.contract.monthsRemaining = 30;
    draft.contract.salaryMonthly += 500;
  });
  assert.equal(careerOfferKind(renewal.market.pending), 'renewal');
  assert.equal(eligibleCareerOfferKind(renewal), 'renewal');
  assert.equal(narrativeConditionRoot(renewal).facts.pendingCareerOfferKind, 'renewal');
  assert.equal(getEligibleRenewalOffers(renewal).length, 1);
  assert.equal(getEligibleTransferOffers(renewal).length, 0);
  assert.equal(getEligibleLoanOffers(renewal).length, 0);
  const detached = getActiveCareerOffers(renewal);
  detached[0].terms.salary = 1;
  assert.notEqual(renewal.market.pending.terms.salary, 1);
  assert.deepEqual(renewal.rngState, rng);

  const transfer = createInitialState(302);
  proposeCareerChange(transfer, 'Propuesta de mercado', draft => {
    draft.club = 'Destino FC';
    draft.contract.salaryMonthly = 5000;
  });
  assert.equal(careerOfferKind(transfer.market.pending), 'transfer');
  assert.equal(eligibleCareerOfferKind(transfer), 'transfer');
  assert.equal(narrativeConditionRoot(transfer).facts.pendingCareerOfferKind, 'transfer');
  assert.equal(getEligibleTransferOffers(transfer).length, 1);

  const loan = createInitialState(303);
  proposeCareerChange(loan, 'Cesión', draft => {
    draft.club = 'Development Club';
    draft.professional.ownerClub = 'UDV';
    draft.professional.registrationClub = 'Development Club';
    draft.professional.route = 'loan';
    draft.flags.LOAN_ACTIVE = true;
  });
  assert.equal(careerOfferKind(loan.market.pending), 'loan');
  assert.equal(eligibleCareerOfferKind(loan), 'loan');
  assert.equal(narrativeConditionRoot(loan).facts.pendingCareerOfferKind, 'loan');
  assert.equal(getEligibleLoanOffers(loan).length, 1);
});

test('eligible queries fail closed when live CareerTerms no longer match the offer baseline', () => {
  const state = createInitialState(308);
  const rng = rngSnapshot(state);
  proposeCareerChange(state, 'Propuesta de mercado', draft => {
    draft.club = 'Destino FC';
    draft.contract.salaryMonthly = 5000;
  });
  assert.equal(getActiveCareerOffers(state).length, 1, 'the pending proposal remains inspectable');
  assert.equal(getEligibleTransferOffers(state).length, 1);
  assert.equal(eligibleCareerOfferKind(state), 'transfer');
  assert.equal(narrativeConditionRoot(state).facts.pendingCareerOfferKind, 'transfer');
  state.contract.salaryMonthly += 1;
  assert.equal(getActiveCareerOffers(state).length, 1, 'read-only active query does not erase stale evidence');
  assert.equal(getEligibleTransferOffers(state).length, 0, 'stale proposal is not eligible for narrative acceptance');
  assert.equal(eligibleCareerOfferKind(state), null, 'stale pending offer has no eligible semantic kind');
  assert.equal(narrativeConditionRoot(state).facts.pendingCareerOfferKind, null, 'narrative gates fail closed on stale offer');
  assert.throws(() => respondToOffer(state, state.market.pending.id, 'accept'), /condiciones han cambiado/);
  assert.deepEqual(state.rngState, rng);
});

test('pending formal offer survives save/load without mutating its terms or RNG', () => {
  const state = createInitialState(307);
  proposeCareerChange(state, 'Propuesta de mercado', draft => {
    draft.club = 'Destino FC';
    draft.contract.salaryMonthly = 5000;
  });
  const before = structuredClone(state.market.pending);
  const rng = rngSnapshot(state);
  const restored = loadSave(serializeSave(state));
  assert.deepEqual(restored.market.pending, before);
  assert.deepEqual(restored.rngState, rng);
  assert.equal(getEligibleTransferOffers(restored).length, 1);
  assert.equal(narrativeConditionRoot(restored).facts.pendingCareerOfferKind, 'transfer');
});

test('loan start keeps parent club through save/load and accepted return is deterministic', () => {
  let state = createInitialState(304);
  const rngBefore = rngSnapshot(state);
  proposeCareerChange(state, 'Cesión', draft => {
    draft.club = 'Development Club';
    draft.professional.ownerClub = 'UDV';
    draft.professional.registrationClub = 'Development Club';
    draft.professional.route = 'loan';
    draft.flags.LOAN_ACTIVE = true;
    draft.contract.monthsRemaining = 12;
  });
  const start = structuredClone(state.market.pending);
  assert.equal(careerOfferKind(start), 'loan');
  respondToOffer(state, start.id, 'accept');
  assert.equal(state.club, 'Development Club');
  assert.equal(state.professional.ownerClub, 'UDV');
  assert.equal(state.professional.registrationClub, 'Development Club');
  assert.equal(state.world.ownerClub, 'UDV');
  assert.equal(state.flags.LOAN_ACTIVE, true);
  assert.deepEqual(state.rngState, rngBefore);

  state = loadSave(serializeSave(state));
  assert.equal(state.club, 'Development Club');
  assert.equal(state.professional.ownerClub, 'UDV');
  assert.equal(state.professional.registrationClub, 'Development Club');
  assert.equal(state.world.ownerClub, 'UDV');
  assert.equal(state.flags.LOAN_ACTIVE, true);

  const returnRng = rngSnapshot(state);
  proposeCareerChange(state, 'Retorno de cesión', draft => {
    draft.club = 'UDV';
    draft.professional.registrationClub = 'UDV';
    draft.professional.route = 'home';
    draft.flags.LOAN_ACTIVE = false;
    draft.contract.monthsRemaining = 24;
  });
  const back = structuredClone(state.market.pending);
  assert.equal(careerOfferKind(back), 'loan_return');
  respondToOffer(state, back.id, 'accept');
  assert.equal(state.club, 'UDV');
  assert.equal(state.professional.ownerClub, 'UDV');
  assert.equal(state.professional.registrationClub, 'UDV');
  assert.equal(state.flags.LOAN_ACTIVE, false);
  assert.deepEqual(state.rngState, returnRng);

  const restoredReturn = loadSave(serializeSave(state));
  assert.equal(restoredReturn.club, 'UDV');
  assert.equal(restoredReturn.professional.ownerClub, 'UDV');
  assert.equal(restoredReturn.professional.registrationClub, 'UDV');
  assert.equal(restoredReturn.flags.LOAN_ACTIVE, false);
});

test('loan permanent conversion moves ownership only through accepted CareerOffer', () => {
  const state = createInitialState(305);
  state.club = 'Loan Club';
  state.professional.ownerClub = 'Parent Club';
  state.professional.registrationClub = 'Loan Club';
  state.world.ownerClub = 'Parent Club';
  state.professional.route = 'loan';
  state.flags.LOAN_ACTIVE = true;
  const before = careerTerms(state);

  proposeCareerChange(state, 'Conversión permanente de cesión', draft => {
    draft.professional.ownerClub = 'Loan Club';
    draft.world.ownerClub = 'Loan Club';
    draft.professional.route = 'domestic';
    draft.flags.LOAN_ACTIVE = false;
    draft.contract.monthsRemaining = 24;
  });
  const offer = structuredClone(state.market.pending);
  assert.equal(careerOfferKind(offer), 'loan_conversion');
  assert.deepEqual(careerTerms(state), before, 'proposal must not change live terms');
  respondToOffer(state, offer.id, 'accept');
  assert.equal(state.club, 'Loan Club');
  assert.equal(state.professional.ownerClub, 'Loan Club');
  assert.equal(state.professional.registrationClub, 'Loan Club');
  assert.equal(state.world.ownerClub, 'Loan Club');
  assert.equal(state.flags.LOAN_ACTIVE, false);

  const restored = loadSave(serializeSave(state));
  assert.equal(restored.professional.ownerClub, 'Loan Club');
  assert.equal(restored.professional.registrationClub, 'Loan Club');
  assert.equal(restored.flags.LOAN_ACTIVE, false);
});

test('zero-month contract is explicitly unresolved; dormant free_agent route alone is not a transition authority', () => {
  const state = createInitialState(306);
  state.contract.monthsRemaining = 7;
  assert.equal(contractEmploymentStatus(state), 'active_contract');
  state.contract.monthsRemaining = 6;
  assert.equal(contractEmploymentStatus(state), 'expiring');
  state.contract.monthsRemaining = 0;
  assert.equal(contractEmploymentStatus(state), 'expired_pending_resolution');
  assert.equal(state.club, 'UDV');
  assert.equal(state.professional.ownerClub, 'UDV');
  state.professional.route = 'free_agent';
  assert.equal(contractEmploymentStatus(state), 'expired_pending_resolution');
  assert.equal(state.club, 'UDV', 'route token alone must not silently detach the player from the current employer');
});
