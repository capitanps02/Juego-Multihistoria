import test from 'node:test';
import assert from 'node:assert/strict';
import { EVENTS } from '../dist/content/events/index.js';
import { createInitialState } from '../dist/content/initial-state.js';
import { offerBridgeEligible, offerBridgeSpec } from '../dist/narrative/offer-bridge.js';
import { careerTerms } from '../dist/simulation/offers.js';

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

test('EVT_32_HOME_001 consumes only a real UDV offer and never grants captaincy by state proxy', () => {
  const event = byId('EVT_32_HOME_001');
  assert.deepEqual(offerBridgeSpec(event)?.choiceActions, { A:'accept', B:'counter', C:'counter', D:'defer' });
  assert.ok(event.tags?.includes('t51_offer_authority_bridge'));

  const state = veteranState(32, 7);
  state.professional.homePull = 70;
  pendingOffer(state, { club:'UDV', ownerClub:'UDV', registrationClub:'UDV', route:'home', months:24 });
  assert.equal(offerBridgeEligible(state, event), true);
  assert.equal(JSON.stringify(event).includes('setCaptain'), false);
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
});

test('EVT_31_MKT_001 stays outside offerBridge while runtime can persist only one pending offer', () => {
  const event = byId('EVT_31_MKT_001');
  assert.equal(offerBridgeSpec(event), undefined);
  assert.ok(event.tags?.includes('t51_shared_authority_guard'));
  assert.equal(allEffects(event).some(authorityOwnedEffect), false);
});
