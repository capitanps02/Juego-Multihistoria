import test from 'node:test';
import assert from 'node:assert/strict';
import { EVENTS } from '../dist/content/events/index.js';
import { createInitialState } from '../dist/content/initial-state.js';
import { offerBridgeEligible, offerBridgeSpec } from '../dist/narrative/offer-bridge.js';
import { careerTerms, respondToOffer } from '../dist/simulation/offers.js';

const byId = id => {
  const event = EVENTS.find(row => row.id === id);
  assert.ok(event, `${id} must exist in active catalog`);
  return event;
};

const authorityOwnedEffect = effect => {
  if (effect?.kind === 'flag') return ['ABROAD_ROUTE','LOAN_ACTIVE','BIG_CLUB'].includes(effect.flag);
  const path = effect?.path;
  if (typeof path !== 'string') return false;
  return path === 'club'
    || path === 'tier'
    || path === 'world.ownerClub'
    || path === 'professional.ownerClub'
    || path === 'professional.registrationClub'
    || path === 'professional.leagueTier'
    || path === 'professional.clubPrestigeTier'
    || path === 'professional.clubPrestigeScore'
    || path === 'professional.route'
    || path.startsWith('contract.');
};

const allEffects = event => [
  ...event.choices.flatMap(choice => [...(choice.immediateEffects ?? []), ...(choice.hiddenCosts ?? [])]),
  ...event.outcomes.flatMap(outcome => outcome.effects ?? [])
];

function veteranState(age, month = 7) {
  const state = createInitialState(3034007 + age);
  state.age = age;
  state.phase = '30_34';
  state.date = `203${age - 30}-` + String(month).padStart(2, '0') + '-01';
  state.professional.initializedAt30 = true;
  return state;
}

function pendingOffer(state, termsPatch, reason = 'Oferta veterana') {
  const before = careerTerms(state);
  state.market = {
    version: 1,
    sequence: 1,
    history: [],
    pending: {
      id: 'offer:test-30-34',
      date: state.date,
      reason,
      before,
      terms: { ...before, ...termsPatch }
    }
  };
}

const narrativeSource = (eventId, choiceId) => ({
  kind: 'narrative_choice',
  historyIndex: 0,
  eventId,
  choiceId
});

test('30-34 active catalog never mutates CareerOffer-owned state from narrative effects', () => {
  for (const event of EVENTS.filter(row => row.phase === '30_34')) {
    const forbidden = allEffects(event).filter(authorityOwnedEffect);
    assert.deepEqual(forbidden, [], `${event.id} contains authority-owned narrative effects`);
  }
});

test('EVT_31_HOME_001 consumes only a real UDV offer and maps every choice explicitly', () => {
  const event = byId('EVT_31_HOME_001');
  assert.deepEqual(offerBridgeSpec(event)?.choiceActions, { A:'accept', B:'defer', C:'counter', D:'reject' });
  assert.ok(event.tags?.includes('t51_offer_authority_bridge'));

  const state = veteranState(31, 7);
  state.professional.homePull = 70;
  pendingOffer(state, { club:'UDV', ownerClub:'UDV', registrationClub:'UDV', route:'home', months:24 });
  assert.equal(offerBridgeEligible(state, event), true);

  state.market.pending.terms.club = 'Otro Club';
  state.market.pending.terms.ownerClub = 'Otro Club';
  state.market.pending.terms.registrationClub = 'Otro Club';
  assert.equal(offerBridgeEligible(state, event), false);
});

test('EVT_32_HOME_001 consumes only a real UDV offer and rejects another destination', () => {
  const event = byId('EVT_32_HOME_001');
  assert.deepEqual(offerBridgeSpec(event)?.choiceActions, { A:'accept', B:'counter', C:'counter', D:'defer' });
  assert.ok(event.tags?.includes('t51_offer_authority_bridge'));

  const state = veteranState(32, 7);
  state.professional.homePull = 70;
  pendingOffer(state, { club:'UDV', ownerClub:'UDV', registrationClub:'UDV', route:'home', months:24 });
  assert.equal(offerBridgeEligible(state, event), true);
  assert.equal(JSON.stringify(event).includes('setCaptain'), false);

  state.market.pending.terms.club = 'Otro Club';
  state.market.pending.terms.ownerClub = 'Otro Club';
  state.market.pending.terms.registrationClub = 'Otro Club';
  assert.equal(offerBridgeEligible(state, event), false);
});

test('EVT_32_CON_001 requires the authoritative one-year renewal offer', () => {
  const event = byId('EVT_32_CON_001');
  assert.deepEqual(offerBridgeSpec(event)?.choiceActions, { A:'accept', B:'counter', C:'counter', D:'reject' });
  assert.ok(event.tags?.includes('t51_offer_authority_bridge'));

  const state = veteranState(32, 7);
  state.contract.monthsRemaining = 10;
  const before = careerTerms(state);
  pendingOffer(state, { club:before.club, ownerClub:before.ownerClub, registrationClub:before.registrationClub, months:12 }, 'Renovación de contrato');
  assert.equal(offerBridgeEligible(state, event), true);

  state.market.pending.reason = 'Traspaso';
  assert.equal(offerBridgeEligible(state, event), false);

  state.market.pending.reason = 'Renovación de contrato';
  state.market.pending.terms.months = 24;
  assert.equal(offerBridgeEligible(state, event), false);
});

test('EVT_31_MKT_001 stays outside offerBridge while runtime can persist only one pending offer', () => {
  const event = byId('EVT_31_MKT_001');
  assert.equal(offerBridgeSpec(event), undefined);
  assert.ok(event.tags?.includes('t51_shared_authority_guard'));
  assert.equal(allEffects(event).some(authorityOwnedEffect), false);
});

test('counter and defer close a veteran offer without applying CareerTerms and persist exact provenance', () => {
  for (const [disposition, eventId, choiceId] of [
    ['counter', 'EVT_31_HOME_001', 'C'],
    ['defer', 'EVT_31_HOME_001', 'B']
  ]) {
    const state = veteranState(31, 7);
    state.professional.homePull = 70;
    pendingOffer(state, { club:'UDV', ownerClub:'UDV', registrationClub:'UDV', route:'home', months:24 });
    const before = careerTerms(state);
    const offerId = state.market.pending.id;
    const decision = respondToOffer(state, offerId, disposition, narrativeSource(eventId, choiceId));
    assert.deepEqual(careerTerms(state), before);
    assert.equal(state.market.pending, null);
    assert.equal(decision.accepted, false);
    assert.equal(decision.action, 'reject');
    assert.deepEqual(decision.source, { ...narrativeSource(eventId, choiceId), disposition });
  }
});

test('accept applies exactly the pending CareerOffer terms and records narrative provenance', () => {
  const state = veteranState(31, 7);
  state.professional.homePull = 70;
  pendingOffer(state, { club:'UDV', ownerClub:'UDV', registrationClub:'UDV', route:'home', months:24, salary:7777 });
  const expected = structuredClone(state.market.pending.terms);
  const offerId = state.market.pending.id;
  const decision = respondToOffer(state, offerId, 'accept', narrativeSource('EVT_31_HOME_001', 'A'));
  assert.deepEqual(careerTerms(state), expected);
  assert.equal(state.market.pending, null);
  assert.equal(decision.accepted, true);
  assert.deepEqual(decision.source, { ...narrativeSource('EVT_31_HOME_001', 'A'), disposition:'accept' });
});

test('persisted pending veteran offer remains authoritative after structured-clone save/restore', () => {
  const state = veteranState(32, 7);
  state.contract.monthsRemaining = 10;
  const before = careerTerms(state);
  pendingOffer(state, { club:before.club, ownerClub:before.ownerClub, registrationClub:before.registrationClub, months:12 }, 'Renovación de contrato');
  const restored = structuredClone(state);
  const event = byId('EVT_32_CON_001');
  assert.equal(offerBridgeEligible(restored, event), true);
  const offerId = restored.market.pending.id;
  const expected = structuredClone(restored.market.pending.terms);
  const decision = respondToOffer(restored, offerId, 'accept', narrativeSource('EVT_32_CON_001', 'A'));
  assert.deepEqual(careerTerms(restored), expected);
  assert.equal(decision.offer.id, offerId);
  assert.equal(decision.source.eventId, 'EVT_32_CON_001');
  assert.equal(decision.source.choiceId, 'A');
});
