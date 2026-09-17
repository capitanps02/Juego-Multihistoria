import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { EVENTS } from '../dist/content/events/index.js';
import { createInitialState } from '../dist/content/initial-state.js';
import { eventGatesPass } from '../dist/narrative/event-gates.js';
import { offerBridgeSpec } from '../dist/narrative/offer-bridge.js';
import { narrativeConditionRoot } from '../dist/simulation/club-contract-intent.js';
import { LOCKER_LEADERSHIP_ASSIGNMENTS } from '../dist/simulation/locker-leadership.js';
import { careerTerms, getActiveCareerOffers, getEligibleCareerOffers } from '../dist/simulation/offers.js';
import { certifyPlayerClubLeadershipInPlace } from '../dist/simulation/player-leadership-authority.js';

const authorityDebt = JSON.parse(fs.readFileSync('analysis/T5.1/canon-30-34-authority-debt.json', 'utf8'));

const byId = id => {
  const event = EVENTS.find(row => row.id === id);
  assert.ok(event, `${id} must exist in active catalog`);
  return event;
};

function veteranState(age = 33) {
  const state = createInitialState(330034 + age);
  state.age = age;
  state.phase = '30_34';
  state.professional.initializedAt30 = true;
  return state;
}

test('authority-debt registry covers every currently classified 30-34 scene blocker exactly once', () => {
  const expected = [
    'EVT_30_CAP_001',
    'EVT_30_FORM_001',
    'EVT_31_FINAL_001',
    'EVT_31_MKT_001',
    'EVT_31_RETURN_001',
    'EVT_31_ROLE_001',
    'EVT_32_CON_001',
    'EVT_32_FAN_001',
    'EVT_32_NAT_001',
    'EVT_33_BODY_001',
    'EVT_33_MKT_001'
  ];
  const actual = authorityDebt.scenes.map(scene => scene.eventId).sort();
  assert.equal(new Set(actual).size, actual.length, 'authority debt must not duplicate scene ids');
  assert.deepEqual(actual, expected.sort());
  assert.equal(authorityDebt.sourceMainSha, 'fa3c8bae524fef62e4eb9802e895df88588998c4');
});

test('formal CareerTerms cannot yet prove the minutes-based renewal clause asserted by EVT_32_CON_001', () => {
  const state = createInitialState(320032);
  const terms = careerTerms(state);

  assert.equal(Object.hasOwn(terms, 'renewalByMinutes'), false);
  assert.equal(Object.hasOwn(terms, 'renewalMinutesThreshold'), false);
  assert.equal(Object.hasOwn(terms, 'automaticRenewal'), false);

  const event = byId('EVT_32_CON_001');
  assert.equal(event.canonStatus, 'technical_adaptation');
  assert.ok(offerBridgeSpec(event), 'the scene may consume a formal offer without claiming clause parity');
});

test('shared market authority exposes at most the single persisted pending CareerOffer', () => {
  const state = createInitialState(313133);
  assert.deepEqual(getActiveCareerOffers(state), []);
  assert.deepEqual(getEligibleCareerOffers(state), []);

  const before = careerTerms(state);
  state.market = {
    version: 1,
    sequence: 1,
    history: [],
    pending: {
      id: 'offer:single-authority-proof',
      date: state.date,
      reason: 'Oferta formal',
      before,
      terms: { ...before, months: 12 }
    }
  };

  const active = getActiveCareerOffers(state);
  const eligible = getEligibleCareerOffers(state);
  assert.equal(active.length, 1);
  assert.equal(eligible.length, 1);
  assert.equal(active[0].id, 'offer:single-authority-proof');
  assert.equal(eligible[0].id, 'offer:single-authority-proof');
  assert.equal(Array.isArray(state.market.pending), false);
});

test('plural eligible-offer read API does not imply persisted multi-offer authority', () => {
  const state = veteranState(31);
  const before = careerTerms(state);
  state.market = {
    version: 1,
    sequence: 4,
    history: [],
    pending: {
      id: 'offer:only-persisted-candidate',
      date: state.date,
      reason: 'Oferta formal exacta',
      before,
      terms: {
        ...before,
        club: 'ELITE_A',
        ownerClub: 'ELITE_A',
        registrationClub: 'ELITE_A',
        months: 12
      }
    }
  };

  const eligible = getEligibleCareerOffers(state);
  assert.equal(eligible.length, 1, 'eligible API is plural-shaped but backed by the singleton pending field');
  assert.equal(eligible[0].id, 'offer:only-persisted-candidate');
  assert.equal(narrativeConditionRoot(state).facts.pendingCareerOffer?.id, 'offer:only-persisted-candidate');
  assert.equal(Object.hasOwn(state.market, 'offers'), false, 'no persisted simultaneous-offer collection exists');
});

test('multi-offer veteran scenes remain outside offerBridge while market authority is single-offer', () => {
  for (const id of ['EVT_31_MKT_001', 'EVT_33_MKT_001']) {
    const event = byId(id);
    assert.equal(offerBridgeSpec(event), undefined, `${id} must not pretend one pending offer proves a multi-offer scene`);
    assert.equal(event.canonStatus, 'technical_adaptation');
  }
});

test('shared locker leadership currently has no authoritative 30_34 slot assignment', () => {
  assert.equal(
    LOCKER_LEADERSHIP_ASSIGNMENTS.some(assignment => assignment.phases.includes('30_34')),
    false,
    'a future authoritative 30_34 assignment must force this blocker to be reviewed rather than silently ignored'
  );

  const state = veteranState(30);
  state.professional.lockerPower = 100;
  state.professional.roleSecurity = 100;
  const root = narrativeConditionRoot(state);
  assert.equal(root.facts.lockerCaptainAffinity, null);
  assert.equal(root.facts.lockerStarAffinity, null);
  assert.equal(byId('EVT_30_CAP_001').canonStatus, 'technical_adaptation');
});

test('leadership narrative facts ignore influence, captaincy flags and seeds', () => {
  const state = veteranState();
  state.professional.lockerPower = 100;
  state.professional.successionPressure = 100;
  state.flags.CAPTAINCY_WINDOW = true;
  state.flags.HAS_SEED_CAPTAINCY_STYLE = true;
  state.flags.HAS_SEED_CAPTAIN_HANDOVER = true;
  const before = structuredClone(state);

  const root = narrativeConditionRoot(state);
  assert.deepEqual(root.facts.playerClubLeadership, {
    currentRole: null,
    hasCertifiedMainCaptainHistory: false
  });
  assert.deepEqual(state, before, 'leadership fact projection must be read-only and consume no RNG');
});

test('EVT_33_CAP_001 fails closed on succession pressure until current main-club captaincy is certified', () => {
  const state = veteranState();
  state.professional.successionPressure = 100;
  state.professional.lockerPower = 100;
  const event = byId('EVT_33_CAP_001');

  assert.ok(event.tags?.includes('t51_leadership_authority_required'));
  assert.ok(event.gates.some(g =>
    g.path === 'facts.playerClubLeadership.currentRole'
    && g.op === 'eq'
    && g.value === 'captain'
  ));
  assert.equal(eventGatesPass(state, event), false);

  certifyPlayerClubLeadershipInPlace(state, 'captain', 'TEST_FORMAL_APPOINTMENT', 'ACCEPT');
  assert.equal(eventGatesPass(state, event), true);
});

test('EVT_33_CAP_001 does not collapse captain-group or secondary-captain authority into main captaincy', () => {
  for (const role of ['captain_group', 'secondary_captain']) {
    const state = veteranState();
    state.professional.successionPressure = 100;
    certifyPlayerClubLeadershipInPlace(state, role, 'EVT_25_CAP_001', role === 'captain_group' ? 'A' : 'C');
    assert.equal(eventGatesPass(state, byId('EVT_33_CAP_001')), false, `${role} must not satisfy main-captain gate`);
  }
});

test('EVT_33_CAP_001 loses current captain authority immediately after a club change', () => {
  const state = veteranState();
  state.professional.successionPressure = 100;
  certifyPlayerClubLeadershipInPlace(state, 'captain', 'TEST_FORMAL_APPOINTMENT', 'ACCEPT');
  assert.equal(eventGatesPass(state, byId('EVT_33_CAP_001')), true);

  state.club = 'NEW_CLUB';
  assert.equal(narrativeConditionRoot(state).facts.playerClubLeadership.currentRole, null);
  assert.equal(eventGatesPass(state, byId('EVT_33_CAP_001')), false);
});
