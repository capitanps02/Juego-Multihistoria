import assert from 'node:assert/strict';
import test from 'node:test';
import { createInitialState } from '../dist/content/initial-state.js';
import { offerBridgeEligible, offerBridgeSpec, offerDispositionForChoice, selectOfferBridgeEvent } from '../dist/narrative/offer-bridge.js';
import { resolveChoice } from '../dist/narrative/resolver.js';
import { careerOfferKind, careerTerms, getEligibleRenewalOffers, getEligibleTransferOffers, respondToOffer } from '../dist/simulation/offers.js';
import { T513_STAGED_OFFER_PRINCIPAL_EVENTS_23_25 } from '../dist/content/events/23_26/t513-staged-offer-principal-events.js';

const byId = id => {
  const event = T513_STAGED_OFFER_PRINCIPAL_EVENTS_23_25.find(row => row.id === id);
  assert.ok(event, `missing ${id}`);
  return event;
};

const MKT23 = byId('EVT_23_MKT_001');
const CON23 = byId('EVT_23_CON_001');
const CON25 = byId('EVT_25_CON_001');

function stateAt(age, date, seed = 61300) {
  const state = createInitialState(seed);
  state.age = age;
  state.phase = '23_26';
  state.date = date;
  state.contract.monthsRemaining = 18;
  state.professional.nationalStanding = 55;
  state.reputation.marketHeat = 60;
  return state;
}

function installTransfer(state) {
  const before = careerTerms(state);
  const terms = {
    ...before,
    club: 'Superior FC',
    ownerClub: 'Superior FC',
    registrationClub: 'Superior FC',
    leagueTier: Math.max(1, before.leagueTier - 1),
    tier: Math.max(1, before.leagueTier - 1),
    prestigeTier: Math.min(5, before.prestigeTier + 2),
    prestigeScore: Math.min(100, before.prestigeScore + 25),
    months: 48,
    salary: before.salary + 12000,
    loan: false,
    route: 'domestic'
  };
  state.market.pending = { id: 'offer:transfer', date: state.date, reason: 'Oferta formal exterior', before, terms };
  return state.market.pending;
}

function installRenewal(state) {
  const before = careerTerms(state);
  const terms = {
    ...before,
    months: 48,
    salary: before.salary + 8000,
    releaseClause: Math.max(1000000, before.salary * 120)
  };
  state.market.pending = { id: 'offer:renewal', date: state.date, reason: 'Renovación de contrato', before, terms };
  return state.market.pending;
}

function source(event, choiceId) {
  return { kind: 'narrative_choice', historyIndex: 0, eventId: event.id, choiceId };
}

test('Agent6 T5.13 stages the exact canonical offer-scene choices and maps every choice', () => {
  assert.deepEqual(MKT23.choices.map(choice => choice.label), [
    'Aceptar el salto',
    'Rechazar y proteger un rol alto actual',
    'Pedir cláusula de cesión o salida si no alcanzas ciertos minutos',
    'Esperar a que salga el competidor antes de firmar'
  ]);
  assert.deepEqual(CON23.choices.map(choice => choice.label), [
    'Firmar por seguridad',
    'Pedir cláusula más baja a cambio de menor salario',
    'Pedir duración menor con salario parecido',
    'Rechazar y asumir el riesgo del contrato restante'
  ]);
  assert.deepEqual(CON25.choices.map(choice => choice.label), [
    'Renovar ya',
    'Esperar al verano',
    'Firmar solo si añaden una salida razonable',
    'Acordar verbalmente continuar negociando sin firmar'
  ]);
  for (const event of [MKT23, CON23, CON25]) {
    const spec = offerBridgeSpec(event);
    assert.ok(spec);
    assert.deepEqual(Object.keys(spec.choiceActions).sort(), event.choices.map(choice => choice.id).sort());
  }
});

test('Agent6 offer bridge classifies transfer and renewal through CareerOffer authority', () => {
  const transferState = stateAt(23, '2026-07-10', 61301);
  const transfer = installTransfer(transferState);
  assert.equal(careerOfferKind(transfer), 'transfer');
  assert.equal(getEligibleTransferOffers(transferState).length, 1);
  assert.equal(getEligibleRenewalOffers(transferState).length, 0);
  assert.equal(offerBridgeEligible(transferState, MKT23), true);
  assert.equal(offerBridgeEligible(transferState, CON23), false);
  assert.equal(selectOfferBridgeEvent(transferState, [MKT23, CON23])?.id, MKT23.id);

  const renewalState = stateAt(23, '2026-07-10', 61302);
  const renewal = installRenewal(renewalState);
  assert.equal(careerOfferKind(renewal), 'renewal');
  assert.equal(getEligibleRenewalOffers(renewalState).length, 1);
  assert.equal(getEligibleTransferOffers(renewalState).length, 0);
  assert.equal(offerBridgeEligible(renewalState, MKT23), false);
  assert.equal(offerBridgeEligible(renewalState, CON23), true);
  assert.equal(selectOfferBridgeEvent(renewalState, [MKT23, CON23])?.id, CON23.id);
});

test('Agent6 MKT23 accept applies exact pending terms; reject/counter/defer preserve current terms', () => {
  for (const choiceId of ['ACCEPT_JUMP', 'REJECT_ROLE', 'COUNTER_EXIT', 'DEFER_COMPETITOR']) {
    const state = stateAt(23, '2026-07-10', 61310 + choiceId.length);
    const offer = structuredClone(installTransfer(state));
    const before = careerTerms(state);
    const disposition = offerDispositionForChoice(MKT23, choiceId);
    assert.ok(disposition);
    const decision = respondToOffer(state, offer.id, disposition, source(MKT23, choiceId));
    if (choiceId === 'ACCEPT_JUMP') {
      assert.equal(decision.accepted, true);
      assert.deepEqual(careerTerms(state), offer.terms);
    } else {
      assert.equal(decision.accepted, false);
      assert.deepEqual(careerTerms(state), before);
    }
    assert.equal(decision.source?.disposition, disposition);
  }
});

test('Agent6 CON23 counters do not edit terms and CON25 preserves two distinct defer decisions', () => {
  for (const choiceId of ['COUNTER_CLAUSE', 'COUNTER_DURATION', 'REJECT_RISK']) {
    const state = stateAt(23, '2026-07-10', 61330 + choiceId.length);
    const offer = installRenewal(state);
    const before = careerTerms(state);
    const disposition = offerDispositionForChoice(CON23, choiceId);
    assert.ok(disposition);
    respondToOffer(state, offer.id, disposition, source(CON23, choiceId));
    assert.deepEqual(careerTerms(state), before);
  }

  assert.equal(offerDispositionForChoice(CON25, 'WAIT_SUMMER'), 'defer');
  assert.equal(offerDispositionForChoice(CON25, 'VERBAL_CONTINUE'), 'defer');
  assert.notEqual('WAIT_SUMMER', 'VERBAL_CONTINUE');
});

test('Agent6 CON25 requires a real renewal, 12-30 months and relevant national/market standing', () => {
  const valid = stateAt(25, '2026-03-10', 61350);
  installRenewal(valid);
  assert.equal(offerBridgeEligible(valid, CON25), true);

  const transfer = stateAt(25, '2026-03-10', 61351);
  installTransfer(transfer);
  assert.equal(offerBridgeEligible(transfer, CON25), false);

  const tooLong = stateAt(25, '2026-03-10', 61352);
  tooLong.contract.monthsRemaining = 36;
  installRenewal(tooLong);
  assert.equal(offerBridgeEligible(tooLong, CON25), false);

  const noStanding = stateAt(25, '2026-03-10', 61353);
  noStanding.professional.nationalStanding = 20;
  noStanding.reputation.marketHeat = 20;
  installRenewal(noStanding);
  assert.equal(offerBridgeEligible(noStanding, CON25), false);
});

test('Agent6 formal offer scene outcomes do not directly mutate CareerTerms or pending offer', () => {
  const state = stateAt(25, '2026-03-10', 61360);
  installRenewal(state);
  state.seeds.push({
    id: 'SEED_CONTRACT_CEILING', state: 'active', intensity: 55,
    originEvent: 'EVT_23_CON_001', originSeason: state.season - 2,
    npcRefs: [], payload: { historical: true }, lastTouchedDate: state.date
  });
  state.flags.HAS_SEED_CONTRACT_CEILING = true;
  const beforeTerms = careerTerms(state);
  const beforePending = structuredClone(state.market.pending);
  const result = resolveChoice(state, CON25, 'VERBAL_CONTINUE');
  assert.deepEqual(careerTerms(result.state), beforeTerms);
  assert.deepEqual(result.state.market.pending, beforePending);
  const memory = result.state.seeds.find(seed => seed.id === 'SEED_CONTRACT_CEILING' && !['resolved', 'expired'].includes(seed.state));
  assert.equal(memory?.originEvent, 'EVT_23_CON_001', 'existing historical origin must be preserved');
  assert.equal(memory?.payload.verbalExpectation, true);
  assert.equal(memory?.payload.signed, false);
});

test('Agent6 offer-kind eligibility is read-only and consumes zero RNG', () => {
  const state = stateAt(23, '2026-07-10', 61370);
  installTransfer(state);
  const before = structuredClone(state);
  offerBridgeEligible(state, MKT23);
  offerBridgeEligible(state, CON23);
  selectOfferBridgeEvent(state, [MKT23, CON23]);
  assert.deepEqual(state, before);
});
