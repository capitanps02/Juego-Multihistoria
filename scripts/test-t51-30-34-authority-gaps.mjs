import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { EVENTS } from '../dist/content/events/index.js';
import { createInitialState } from '../dist/content/initial-state.js';
import { eventGatesPass } from '../dist/narrative/event-gates.js';
import { offerBridgeSpec } from '../dist/narrative/offer-bridge.js';
import { narrativeConditionRoot } from '../dist/simulation/club-contract-intent.js';
import { LOCKER_LEADERSHIP_ASSIGNMENTS } from '../dist/simulation/locker-leadership.js';
import { careerTerms, getActiveCareerOffers, getEligibleCareerOffers, proposeCareerChange } from '../dist/simulation/offers.js';
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
  assert.equal(authorityDebt.sourceMainSha, '5f4d14bca4d696cfafadb58b64034c7cd40cc147');
});

test('C005 exact sport gaps stay explicit after the shared weekly match-model upgrade', () => {
  const expected = new Map([
    ['EVT_30_FORM_001', 'blocked_missing_sport_history_authority'],
    ['EVT_31_RETURN_001', 'blocked_missing_authority'],
    ['EVT_31_ROLE_001', 'canonical_missing_and_sport_blocked'],
    ['EVT_32_FAN_001', 'blocked_missing_authority'],
    ['EVT_32_NAT_001', 'blocked_missing_authority']
  ]);

  for (const [eventId, status] of expected) {
    const row = authorityDebt.scenes.find(scene => scene.eventId === eventId);
    assert.ok(row, `${eventId}: missing authority-debt row`);
    assert.equal(row.status, status, `${eventId}: blocker status changed; review C005 explicitly`);
    assert.ok((row.missingFacts ?? []).length > 0, `${eventId}: exact missing facts must remain enumerated`);
  }

  for (const id of ['EVT_30_FORM_001', 'EVT_31_RETURN_001', 'EVT_32_FAN_001', 'EVT_32_NAT_001']) {
    assert.equal(byId(id).canonStatus, 'technical_adaptation', `${id}: do not promote while exact sport authority is missing`);
  }
  assert.equal(EVENTS.some(event => event.id === 'EVT_31_ROLE_001'), false, 'EVT_31_ROLE_001 remains a coordinated canonical-missing addition');
});

test('aggregate veteran proxies do not fabricate match/squad production beyond the new fixture calendar', () => {
  const state = veteranState(32);
  state.sport.form = 100;
  state.sport.roleScore = 100;
  state.professional.nationalStanding = 100;
  state.professional.roleSecurity = 100;
  state.flags.RECOVERING_INJURY = true;
  state.flags.FINAL_CONTEXT = true;

  const before = structuredClone(state);
  const root = narrativeConditionRoot(state);

  assert.equal(root.facts.sport.currentCompetition, 'league', 'the new calendar legitimately exposes the next scheduled league competition');
  assert.ok(root.facts.sport.nextFixture, 'the new calendar legitimately exposes a scheduled league fixture');
  assert.equal(typeof root.facts.sport.hoursToNextFixture, 'number');

  for (const [label, value] of [
    ['sport.previousFixture', root.facts.sport.previousFixture],
    ['sport.currentSquadStatus', root.facts.sport.currentSquadStatus],
    ['match.competition', root.facts.match.competition],
    ['match.opponent', root.facts.match.opponent],
    ['match.result', root.facts.match.result],
    ['match.playerCalledUp', root.facts.match.playerCalledUp],
    ['match.playerOnBench', root.facts.match.playerOnBench],
    ['match.playerStarted', root.facts.match.playerStarted],
    ['match.playerAppeared', root.facts.match.playerAppeared],
    ['match.minutes', root.facts.match.minutes],
    ['match.goals', root.facts.match.goals]
  ]) {
    assert.equal(value, null, `${label} must stay unavailable without a persisted current/previous match row or unsupported result/goal model`);
  }

  assert.deepEqual(state, before, 'authority projection must remain read-only and consume no RNG');
});

test('new weekly fixture facts do not certify the two previously protected scene claims', () => {
  const finalDebt = authorityDebt.scenes.find(scene => scene.eventId === 'EVT_31_FINAL_001');
  const bodyDebt = authorityDebt.scenes.find(scene => scene.eventId === 'EVT_33_BODY_001');
  assert.equal(finalDebt?.status, 'partial_guard_insufficient_after_match_model');
  assert.equal(bodyDebt?.status, 'partial_guard_insufficient_after_match_model');
  assert.match(finalDebt.risk, /ordinary scheduled league fixture/i);
  assert.match(bodyDebt.risk, /144\/168-hour league gap/i);
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

test('EVT_32_RICH_001 consumes only explicit formal late-rich offer context', () => {
  const event = byId('EVT_32_RICH_001');
  assert.equal(event.canonStatus, 'technical_adaptation');
  assert.ok(event.tags?.includes('t51_rich_offer_authority_required'));
  assert.equal(event.tags?.includes('t51_shifted_prepared'), false, 'active canonical scene must not remain labelled prepared');
  assert.ok(event.gates.some(g =>
    g.path === 'facts.pendingCareerOffer.context.kind'
    && g.op === 'eq'
    && g.value === 'late_rich_offer'
  ));
  assert.deepEqual(['A','B','C','D'].map(id => offerBridgeSpec(event)?.choiceActions[id]), ['accept','reject','counter','defer']);

  const ordinary = veteranState(32);
  proposeCareerChange(ordinary, 'Oferta internacional enorme', draft => {
    draft.club = 'Very Rich FC';
    draft.professional.route = 'abroad';
    draft.flags.ABROAD_ROUTE = true;
    draft.contract.monthsRemaining = 36;
    draft.contract.salaryMonthly = 999999;
  });
  assert.equal(eventGatesPass(ordinary, event), false, 'salary/route alone must not fabricate rich-offer authority');

  const rich = veteranState(32);
  proposeCareerChange(rich, 'Oferta internacional de final de carrera', draft => {
    draft.club = 'Global City FC';
    draft.professional.route = 'abroad';
    draft.flags.ABROAD_ROUTE = true;
    draft.contract.monthsRemaining = 36;
    draft.contract.salaryMonthly = 25000;
  }, {
    kind: 'late_rich_offer',
    housing: 'Vivienda familiar incluida.',
    calendar: 'Calendario doméstico concentrado.',
    commercialRole: 'Embajador internacional.'
  });
  assert.equal(narrativeConditionRoot(rich).facts.pendingCareerOffer?.context?.kind, 'late_rich_offer');
  assert.equal(eventGatesPass(rich, event), true);
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
