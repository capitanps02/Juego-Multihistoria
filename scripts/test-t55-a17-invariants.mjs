import test from 'node:test';
import assert from 'node:assert/strict';

import { createInitialState } from '../dist/content/initial-state.js';
import {
  evaluateNarrativeGuard,
  narrativeGuardsPass
} from '../dist/narrative/narrative-guards.js';
import { scheduleEvent } from '../dist/narrative/scheduler.js';
import { resolveCurrentCoach } from '../dist/simulation/npc-authority.js';
import { certifyCoachChangeInPlace } from '../dist/simulation/coach-change-authority.js';
import {
  careerTerms,
  proposeCareerChange,
  respondToOffer
} from '../dist/simulation/offers.js';
import {
  recordNationalFinalSquadInPlace,
  recordNationalPreselectionInPlace
} from '../dist/simulation/national-team-authority.js';
import { recordOfficialMatchInPlace } from '../dist/simulation/match-model.js';
import { advanceWorldDayInPlace } from '../dist/simulation/world-simulator.js';
import { closeCareer } from '../dist/simulation/late-career-engine.js';
import { loadSave, serializeSave } from '../dist/save/save.js';

function event(id, overrides = {}) {
  return {
    id,
    ageWindow: [18, 18],
    phase: '18_20',
    family: 'press',
    gates: [],
    cooldown: 0,
    repeatable: false,
    weight: 100,
    text: { title: id, body: 'A17 fixture' },
    intel: { visible: [], uncertain: [] },
    choices: [{ id: 'OK', label: 'Seguir', intentTags: [], outcomeIds: ['OK_OUT'] }],
    outcomes: [{ id: 'OK_OUT', baseWeight: 1, effects: [], messages: ['ok'] }],
    ...overrides
  };
}

function matchDayState(seed = 17001) {
  const state = createInitialState(seed);
  state.date = '2026-08-05';
  state.runtime.day = 35;
  state.runtime.seasonDay = 35;
  return state;
}

function appearedMatchState(predicate = () => true) {
  for (let seed = 17000; seed < 19000; seed += 1) {
    const state = matchDayState(seed);
    const row = recordOfficialMatchInPlace(state, {
      appeared: true,
      debutOccurred: false,
      injuryUnavailable: false
    });
    if (row && predicate(row)) return { state, row };
  }
  throw new Error('No deterministic A17 match fixture found');
}

test('A17/T17.1-2 legacy post-match scene fails closed without a factual appearance and opens with one', () => {
  const noMatch = createInitialState(17001);
  const scene = event('EVT_18_PRS_001');
  assert.equal(narrativeGuardsPass(noMatch, scene), false);

  const { state, row } = appearedMatchState();
  assert.equal(row.player.appeared, true);
  assert.equal(narrativeGuardsPass(state, scene), true);

  state.date = '2026-08-13';
  assert.equal(narrativeGuardsPass(state, scene), false, 'appearance older than seven days must not satisfy post-match prose');
});

test('A17/T17.3 recent-start guard requires a factual start, not merely an appearance', () => {
  const substitute = appearedMatchState(row => !row.player.started);
  const starter = appearedMatchState(row => row.player.started);

  assert.equal(evaluateNarrativeGuard(substitute.state, { id: 'requiresRecentStart' }).pass, false);
  assert.equal(evaluateNarrativeGuard(starter.state, { id: 'requiresRecentStart' }).pass, true);
});

test('A17/T17.4 recent-goal guard requires a factual goal in persisted player stats', () => {
  const noGoal = appearedMatchState(row => (row.stats?.goals ?? 0) === 0);
  const scorer = appearedMatchState(row => (row.stats?.goals ?? 0) > 0);

  assert.equal(evaluateNarrativeGuard(noGoal.state, { id: 'requiresRecentGoal' }).pass, false);
  assert.equal(evaluateNarrativeGuard(scorer.state, { id: 'requiresRecentGoal' }).pass, true);
});

test('A17/T17.5-6 fired coach is not current even when historical NPC state remains present', () => {
  const state = createInitialState(17005);
  assert.equal(resolveCurrentCoach(state), 'NPC_CCH_01');
  assert.equal(evaluateNarrativeGuard(state, { id: 'requiresCurrentCoach', npcId: 'NPC_CCH_01' }).pass, true);

  certifyCoachChangeInPlace(state, 'security_firing', {
    previousCoachNpcId: 'NPC_CCH_01',
    newCoachNpcId: null
  });
  assert.equal(state.npcs.find(npc => npc.id === 'NPC_CCH_01')?.careerState, 'active', 'historical NPC state remains intact');
  assert.equal(resolveCurrentCoach(state), null);
  assert.equal(evaluateNarrativeGuard(state, { id: 'requiresCurrentCoach', npcId: 'NPC_CCH_01' }).pass, false);

  certifyCoachChangeInPlace(state, 'canonical_change', { newCoachNpcId: 'NPC_CCH_01' });
  assert.equal(resolveCurrentCoach(state), 'NPC_CCH_01');
});

test('A17/T17.6b coach-change prose needs certified chronology and identity, not COACH_FIRED alone', () => {
  const state = createInitialState(17006);
  state.flags.COACH_FIRED = true;
  const scene = event('CEVT_18_CCH_01');
  assert.equal(narrativeGuardsPass(state, scene), false, 'legacy firing flag alone cannot certify Montalban left');

  certifyCoachChangeInPlace(state, 'security_firing');
  assert.equal(narrativeGuardsPass(state, scene), false, 'generic chronology still cannot name a previous coach');

  certifyCoachChangeInPlace(state, 'canonical_change', { previousCoachNpcId: 'NPC_CCH_01' });
  assert.equal(narrativeGuardsPass(state, scene), true);
});

test('A17/T17.7-8 rejected loan/transfer offer cannot mutate current club or become a completed move', () => {
  const state = createInitialState(17007);
  const before = structuredClone(careerTerms(state));
  const offer = proposeCareerChange(state, 'A17 loan-style offer', draft => {
    draft.club = 'A17 Destination';
    draft.professional.registrationClub = 'A17 Destination';
    draft.professional.ownerClub = before.ownerClub;
    draft.flags.LOAN_ACTIVE = true;
  });
  assert.ok(offer);
  assert.equal(state.club, before.club, 'creating an offer must not move the player');

  const decision = respondToOffer(state, offer.id, 'reject');
  assert.equal(decision.accepted, false);
  assert.deepEqual(careerTerms(state), before);
  assert.equal(state.market.history.at(-1)?.accepted, false);
});

test('A17/T17.9 completed transfer synchronizes club authority and narrative current-club guard', () => {
  const state = createInitialState(17009);
  const offer = proposeCareerChange(state, 'A17 transfer', draft => {
    draft.club = 'A17 Destination';
    draft.contract.salaryMonthly += 1000;
  });
  assert.ok(offer);

  respondToOffer(state, offer.id, 'accept');
  assert.equal(state.club, 'A17 Destination');
  assert.equal(state.professional.registrationClub, 'A17 Destination');
  assert.equal(state.professional.ownerClub, 'A17 Destination');
  assert.equal(state.world.ownerClub, 'A17 Destination');
  assert.equal(evaluateNarrativeGuard(state, { id: 'requiresCurrentClub', club: 'A17 Destination' }).pass, true);
});

test('A17/T17.11b legacy offer prose cannot be scheduled from marketHeat alone', () => {
  const state = createInitialState(17010);
  state.age = 28;
  state.phase = '26_30';
  state.reputation.marketHeat = 100;
  const scene = event('CEVT_28_MKT_01', { ageWindow: [28, 28], phase: '26_30', family: 'market' });
  assert.equal(narrativeGuardsPass(state, scene), false);

  const offer = proposeCareerChange(state, 'A17 real offer', draft => {
    draft.club = 'A17 Offer Club';
  });
  assert.ok(offer);
  assert.equal(narrativeGuardsPass(state, scene), true);

  respondToOffer(state, offer.id, 'reject');
  assert.equal(narrativeGuardsPass(state, scene), false);
});

test('A17/T17.11 transfer-offer guard requires a real eligible pending offer', () => {
  const state = createInitialState(17011);
  assert.equal(evaluateNarrativeGuard(state, { id: 'requiresTransferOffer' }).pass, false);

  const offer = proposeCareerChange(state, 'A17 factual transfer', draft => {
    draft.club = 'A17 Transfer Club';
  });
  assert.ok(offer);
  assert.equal(evaluateNarrativeGuard(state, { id: 'requiresTransferOffer' }).pass, true);

  respondToOffer(state, offer.id, 'reject');
  assert.equal(evaluateNarrativeGuard(state, { id: 'requiresTransferOffer' }).pass, false);
});

test('A17/T17.12 international-callup guard requires published selection authority, not reputation', () => {
  const state = createInitialState(17012);
  state.professional.nationalStanding = 100;
  state.professional.nationalCaps = 80;
  state.flags.NATIONAL_CALLED = true;
  assert.equal(evaluateNarrativeGuard(state, { id: 'requiresInternationalCallup' }).pass, false);

  state.flags.NATIONAL_TOURNAMENT_CYCLE = true;
  const source = { kind: 'simulation_publication', producerId: 'a17-test' };
  const preliminary = recordNationalPreselectionInPlace(state, {
    cycleId: 'a17-cycle',
    tournamentId: 'a17-tournament',
    membership: 'selected',
    source
  });
  assert.ok(preliminary);
  assert.equal(evaluateNarrativeGuard(state, { id: 'requiresInternationalCallup', stage: 'preliminary' }).pass, true);
  assert.equal(evaluateNarrativeGuard(state, { id: 'requiresInternationalCallup' }).pass, false);

  const final = recordNationalFinalSquadInPlace(state, {
    cycleId: 'a17-cycle',
    membership: 'selected',
    role: 'rotation',
    source
  });
  assert.ok(final);
  assert.equal(evaluateNarrativeGuard(state, { id: 'requiresInternationalCallup' }).pass, true);
});

test('A17/T17.13 injury guard reads the same canonical availability inputs as sports-core', () => {
  const state = createInitialState(17013);
  assert.equal(evaluateNarrativeGuard(state, { id: 'requiresInjury' }).pass, false);

  state.body.acuteInjury = true;
  assert.equal(evaluateNarrativeGuard(state, { id: 'requiresInjury' }).pass, true);
  state.body.acuteInjury = false;

  state.flags.RECOVERING_INJURY = true;
  assert.equal(evaluateNarrativeGuard(state, { id: 'requiresInjury' }).pass, true);
  state.flags.RECOVERING_INJURY = false;

  state.world.injuryWeeksRemaining = 2;
  assert.equal(evaluateNarrativeGuard(state, { id: 'requiresInjury' }).pass, true);
});

test('A17/T17.19-20 closed retirement blocks weekly player simulation and active narrative', () => {
  const state = createInitialState(17019);
  state.retirement.status = 'closed';
  state.retirement.closedDate = state.date;
  state.retirement.reason = 'a17-test';
  state.retirement.closureType = 'a17-test';
  state.flags.RETIRED = true;
  const beforeAppearances = state.sport.appearances;
  const beforeMatchStore = structuredClone(state.world.sportMatchModel ?? null);

  for (let i = 0; i < 14; i += 1) advanceWorldDayInPlace(state);

  assert.equal(state.sport.appearances, beforeAppearances);
  assert.deepEqual(state.world.sportMatchModel ?? null, beforeMatchStore);

  state.runtime.daysSinceNarrative = 999;
  assert.equal(scheduleEvent(state, [event('A17_ACTIVE_SCENE')], { ignoreRhythmGate: true }), null);

  const postCareer = event('A17_POST_CAREER', { tags: ['post_career'] });
  assert.equal(scheduleEvent(state, [postCareer], { ignoreRhythmGate: true })?.event.id, 'A17_POST_CAREER');
});

test('A17/T17.17-18 retirement decision and announcement survive save/load', () => {
  const decided = createInitialState(17017);
  decided.retirement.status = 'decided';
  decided.retirement.decidedDate = decided.date;
  decided.retirement.decisionAge = decided.age;
  decided.retirement.reason = 'a17-consider';
  decided.flags.RETIREMENT_DECISION_CONTEXT = true;
  const decidedReloaded = loadSave(serializeSave(decided));
  assert.equal(decidedReloaded.retirement.status, 'decided');
  assert.equal(decidedReloaded.retirement.decidedDate, decided.date);

  decided.retirement.status = 'announced';
  decided.retirement.announcedDate = decided.date;
  decided.flags.RETIREMENT_DECISION_CONTEXT = false;
  decided.flags.RETIREMENT_ANNOUNCED = true;
  decided.flags.RETIREMENT_WAS_ANNOUNCED = true;
  const announcedReloaded = loadSave(serializeSave(decided));
  assert.equal(announcedReloaded.retirement.status, 'announced');
  assert.equal(announcedReloaded.retirement.announcedDate, decided.date);
});

test('A17/T17.21 announced retirement can close into a terminal state with reachable epilogue', () => {
  const state = createInitialState(17021);
  state.age = 35;
  state.phase = '34_plus';
  state.retirement.status = 'announced';
  state.retirement.decidedDate = state.date;
  state.retirement.announcedDate = state.date;
  state.retirement.decisionAge = state.age;
  state.retirement.reason = 'voluntary';
  state.flags.RETIREMENT_ANNOUNCED = true;
  state.flags.RETIREMENT_WAS_ANNOUNCED = true;

  closeCareer(state, 'voluntary', 'planned_last_match');

  assert.equal(state.retirement.status, 'closed');
  assert.equal(state.flags.RETIRED, true);
  assert.equal(state.epilogue.generated, true);
});
