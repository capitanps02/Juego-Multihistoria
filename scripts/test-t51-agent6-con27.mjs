import assert from 'node:assert/strict';
import test from 'node:test';
import { createInitialState } from '../dist/content/initial-state.js';
import { EVENTS_26_30 } from '../dist/content/events/26_30/index.js';
import { T519_STAGED_CONTRACT_PRINCIPAL_EVENTS_27 } from '../dist/content/events/26_30/t519-staged-contract-principal-events.js';
import { offerBridgeEligible, offerDispositionForChoice } from '../dist/narrative/offer-bridge.js';
import { careerTerms, respondToOffer } from '../dist/simulation/offers.js';

const event = T519_STAGED_CONTRACT_PRINCIPAL_EVENTS_27[0];

function state27(seed = 61901) {
  const state = createInitialState(seed);
  state.age = 27;
  state.phase = '26_30';
  state.professional.initializedAt26 = true;
  state.professional.contractPower = 65;
  state.reputation.marketHeat = 58;
  return state;
}

function installRenewal(state, releaseClause = 8_000_000) {
  const before = careerTerms(state);
  const terms = {
    ...before,
    months: 48,
    salary: before.salary + 10_000,
    releaseClause
  };
  state.market.pending = { id: `offer:renewal:${releaseClause ?? 'none'}`, date: state.date, reason: 'Renovación de contrato', before, terms };
  return state.market.pending;
}

function installTransfer(state) {
  const before = careerTerms(state);
  const terms = {
    ...before,
    club: 'Rival Elite FC', ownerClub: 'Rival Elite FC', registrationClub: 'Rival Elite FC',
    months: 48, salary: before.salary + 15_000, releaseClause: 12_000_000
  };
  state.market.pending = { id: 'offer:transfer:27', date: state.date, reason: 'Oferta exterior', before, terms };
  return state.market.pending;
}

function source(choiceId) {
  return { kind: 'narrative_choice', historyIndex: 0, eventId: event.id, choiceId };
}

test('Agent6 CON27 preserves the canonical release-clause decision surface', () => {
  assert.equal(event.id, 'EVT_27_CON_001');
  assert.equal(event.text.title, 'La cláusula que sí puede pagarse');
  assert.deepEqual(event.choices.map(choice => choice.label), [
    'Aceptar la cláusula',
    'Pedir una cifra menor y renunciar a salario',
    'Preferir no tener cláusula y negociar',
    'Añadir ventana temporal de activación'
  ]);
  assert.deepEqual(event.choices.map(choice => offerDispositionForChoice(event, choice.id)), [
    'accept', 'counter', 'counter', 'counter'
  ]);
});

test('Agent6 CON27 requires high contract power plus a compatible renewal with a real clause', () => {
  const valid = state27();
  installRenewal(valid);
  assert.equal(offerBridgeEligible(valid, event), true);

  const lowPower = state27(61902);
  lowPower.professional.contractPower = 64;
  installRenewal(lowPower);
  assert.equal(offerBridgeEligible(lowPower, event), false);

  const noClause = state27(61903);
  installRenewal(noClause, null);
  assert.equal(offerBridgeEligible(noClause, event), false);

  const transfer = state27(61904);
  installTransfer(transfer);
  assert.equal(offerBridgeEligible(transfer, event), false);

  const stale = state27(61905);
  installRenewal(stale);
  stale.contract.salaryMonthly += 1;
  assert.equal(offerBridgeEligible(stale, event), false);
});

test('Agent6 CON27 accept applies exact pending terms and every counter preserves current terms', () => {
  for (const choiceId of ['ACCEPT_CLAUSE', 'COUNTER_LOWER_CLAUSE', 'COUNTER_NO_CLAUSE', 'COUNTER_WINDOW']) {
    const state = state27(61910 + choiceId.length);
    const offer = structuredClone(installRenewal(state));
    const before = careerTerms(state);
    const disposition = offerDispositionForChoice(event, choiceId);
    assert.ok(disposition);
    const decision = respondToOffer(state, offer.id, disposition, source(choiceId));
    if (choiceId === 'ACCEPT_CLAUSE') {
      assert.equal(decision.accepted, true);
      assert.deepEqual(careerTerms(state), offer.terms);
    } else {
      assert.equal(decision.accepted, false);
      assert.deepEqual(careerTerms(state), before);
    }
    assert.equal(decision.source?.disposition, disposition);
  }
});

test('Agent6 CON27 eligibility is read-only and candidate is active', () => {
  const state = state27(61930);
  installRenewal(state);
  const before = structuredClone(state);
  assert.equal(offerBridgeEligible(state, event), true);
  assert.deepEqual(state, before);
  assert.equal(EVENTS_26_30.some(candidate => candidate.id === 'EVT_27_CON_001'), true);
});
