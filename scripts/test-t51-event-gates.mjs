import assert from 'node:assert/strict';
import test from 'node:test';
import { createInitialState } from '../dist/content/initial-state.js';
import { EVENTS_18_20 } from '../dist/content/events/index.js';
import { ambiguousEvent } from '../dist/content/events/18_20/helpers.js';
import { scheduleEvent } from '../dist/narrative/scheduler.js';
import { eventGatesPass } from '../dist/narrative/event-gates.js';
import { closeLeagueObjectiveInPlace, recordOfficialMatchInPlace } from '../dist/simulation/match-model.js';
import { loadSave, serializeSave } from '../dist/save/save.js';

function fixtureEvent() {
  return {
    id: 'T51_EVENT_GATE_OR',
    ageWindow: [18, 18],
    phase: '18_20',
    family: 'press',
    gates: [{ path: 'flags.COMMON_PREREQUISITE', op: 'eq', value: true }],
    gateAlternatives: [
      [{ path: 'flags.ROUTE_A', op: 'eq', value: true }],
      [
        { path: 'reputation.mediaHeat', op: 'gte', value: 20 },
        { path: 'flags.RECENT_CONFLICT', op: 'eq', value: true }
      ]
    ],
    cooldown: 0,
    repeatable: false,
    weight: 100,
    text: { title: 'OR gate fixture', body: 'Fixture para contrato OR de reachability.' },
    intel: { visible: [], uncertain: [] },
    choices: [{ id: 'OK', label: 'Seguir', intentTags: [], outcomeIds: ['OK_OUT'] }],
    outcomes: [{ id: 'OK_OUT', baseWeight: 1, effects: [], messages: ['ok'] }]
  };
}

function ambiguousFixture(gateAlternatives) {
  return ambiguousEvent({
    id: 'T51_AMBIGUOUS_HELPER_OR',
    ageWindow: [18, 18],
    family: 'press',
    title: 'Helper OR fixture',
    body: 'Fixture para comprobar propagación del contrato OR.',
    visible: [],
    uncertain: [],
    gates: [{ path: 'flags.COMMON_PREREQUISITE', op: 'eq', value: true }],
    ...(gateAlternatives !== undefined ? { gateAlternatives } : {}),
    cooldown: 0,
    weight: 100,
    choices: [{
      id: 'OK',
      label: 'Seguir',
      intentTags: ['fixture'],
      primaryMessage: 'ok',
      secondaryMessage: 'ok'
    }]
  });
}

function sched(state, event) {
  state.runtime.daysSinceNarrative = 999;
  return scheduleEvent(state, [event], { ignoreRhythmGate: true });
}

function active18(id) {
  const event = EVENTS_18_20.find(candidate => candidate.id === id);
  assert.ok(event, `missing active 18-20 event ${id}`);
  return event;
}

function emptyMilestones(overrides = {}) {
  return {
    firstMatchSquadCall: null,
    firstBench: null,
    firstAppearance: null,
    firstStart: null,
    firstFullMatch: null,
    firstGoal: null,
    ...overrides
  };
}

function installSportStore(state, { fixtures = [], milestones = {}, objectiveStatus = 'open' } = {}) {
  state.world.sportMatchModel = {
    version: 1,
    fixtures,
    milestones: emptyMilestones(milestones),
    objective: objectiveStatus === null ? null : {
      season: state.season,
      club: state.professional.registrationClub,
      kind: 'league_campaign',
      status: objectiveStatus,
      resolvedAt: objectiveStatus === 'closed' ? state.date : null,
      outcome: objectiveStatus === 'closed' ? 'fixture-test' : null
    }
  };
}

function currentDebutFixture(state, { minute = 78, scoreHome = 1, scoreAway = 1 } = {}) {
  const club = state.professional.registrationClub;
  return {
    id: `fixture:${state.season}:${state.date}:${club}`,
    date: state.date,
    season: state.season,
    competition: 'league',
    club,
    opponent: 'SIM_OPP_TEST',
    homeAway: 'home',
    official: true,
    player: {
      calledUp: true,
      onBench: true,
      started: false,
      appeared: true,
      minutes: 90 - minute,
      debut: true,
      injuryUnavailable: false
    },
    decisionContext: {
      kind: 'debut_substitution',
      minute,
      scoreHome,
      scoreAway
    }
  };
}

test('legacy event without gateAlternatives keeps flat AND behavior', () => {
  const state = createInitialState(424242);
  const event = fixtureEvent();
  delete event.gateAlternatives;
  state.flags.COMMON_PREREQUISITE = true;
  assert.equal(eventGatesPass(state, event), true);
  state.flags.COMMON_PREREQUISITE = false;
  assert.equal(eventGatesPass(state, event), false);
});

test('route A alone satisfies the OR alternatives when common gates pass', () => {
  const state = createInitialState(424242);
  const event = fixtureEvent();
  state.flags.COMMON_PREREQUISITE = true;
  state.flags.ROUTE_A = true;
  assert.equal(eventGatesPass(state, event), true);
  assert.ok(sched(state, event));
});

test('route B is internally AND: partial route does not satisfy the event', () => {
  const state = createInitialState(424242);
  const event = fixtureEvent();
  state.flags.COMMON_PREREQUISITE = true;
  state.reputation.mediaHeat = 25;
  state.flags.RECENT_CONFLICT = false;
  assert.equal(eventGatesPass(state, event), false);
  assert.equal(sched(state, event), null);

  state.flags.RECENT_CONFLICT = true;
  assert.equal(eventGatesPass(state, event), true);
  assert.ok(sched(state, event));
});

test('common flat gates remain mandatory even when one alternative route passes', () => {
  const state = createInitialState(424242);
  const event = fixtureEvent();
  state.flags.COMMON_PREREQUISITE = false;
  state.flags.ROUTE_A = true;
  assert.equal(eventGatesPass(state, event), false);
  assert.equal(sched(state, event), null);
});

test('explicit empty alternatives fail closed instead of widening reachability', () => {
  const state = createInitialState(424242);
  const event = fixtureEvent();
  state.flags.COMMON_PREREQUISITE = true;
  event.gateAlternatives = [];
  assert.equal(eventGatesPass(state, event), false);
  assert.equal(sched(state, event), null);
});

test('evaluating event alternatives does not mutate the event definition', () => {
  const state = createInitialState(424242);
  const event = fixtureEvent();
  state.flags.COMMON_PREREQUISITE = true;
  state.flags.ROUTE_A = true;
  const before = structuredClone(event);
  assert.equal(eventGatesPass(state, event), true);
  assert.deepEqual(event, before);
});

test('18-20 ambiguousEvent propagates gateAlternatives into scheduler reachability', () => {
  const alternatives = [
    [{ path: 'flags.ROUTE_A', op: 'eq', value: true }],
    [{ path: 'flags.ROUTE_B', op: 'eq', value: true }]
  ];
  const event = ambiguousFixture(alternatives);
  assert.deepEqual(event.gateAlternatives, alternatives);

  const state = createInitialState(424242);
  state.flags.COMMON_PREREQUISITE = true;
  state.flags.ROUTE_B = true;
  assert.equal(eventGatesPass(state, event), true);
  assert.ok(sched(state, event));
});

test('18-20 ambiguousEvent keeps legacy serialized shape when OR routes are absent', () => {
  const event = ambiguousFixture(undefined);
  assert.equal(Object.prototype.hasOwnProperty.call(event, 'gateAlternatives'), false);
});

test('#124 EVT_18_MATCH_001 rejects coarse debut/proxy state and requires produced 78 minute 1-1 debut context', () => {
  const event = active18('EVT_18_MATCH_001');
  const state = createInitialState(12401);
  state.flags.OFFICIAL_DEBUT = true;
  state.sport.roleScore = 100;
  state.sport.form = 100;

  assert.equal(eventGatesPass(state, event), false, 'legacy debut and elite role/form must not fabricate live context');

  installSportStore(state, { fixtures: [currentDebutFixture(state, { minute: 74 })] });
  assert.equal(eventGatesPass(state, event), false, 'wrong produced minute must stay ineligible');

  installSportStore(state, { fixtures: [currentDebutFixture(state)] });
  assert.equal(eventGatesPass(state, event), true, 'canonical produced fixture context should enable the scene');
});

test('#124 EVT_18_PRS_001 requires local attention plus official debut OR first real match squad call', () => {
  const event = active18('EVT_18_PRS_001');
  const state = createInitialState(12402);
  state.flags.FIRST_TEAM_ATTENTION = true;
  state.flags.OFFICIAL_DEBUT = false;
  state.flags.PRESEASON_FIRST_TEAM_CALL = true;
  state.sport.roleScore = 100;

  assert.equal(eventGatesPass(state, event), false, 'preseason call/attention/role proxies must not count as a real match call');

  state.flags.OFFICIAL_DEBUT = true;
  assert.equal(eventGatesPass(state, event), true, 'official debut is an accepted causal route');

  state.flags.OFFICIAL_DEBUT = false;
  installSportStore(state, { milestones: { firstMatchSquadCall: 'fixture:first-real-call' } });
  assert.equal(eventGatesPass(state, event), true, 'persisted first real match squad call is the second accepted route');

  state.flags.FIRST_TEAM_ATTENTION = false;
  assert.equal(eventGatesPass(state, event), false, 'local attention remains a shared prerequisite');
});

test('#124 EVT_18_SOC_001 rejects PUBLIC_HEAT when an authoritative fixture is inside 24h', () => {
  const event = active18('EVT_18_SOC_001');
  const state = createInitialState(12403);
  state.date = '2026-09-01';
  state.runtime.day = 0;
  state.reputation.mediaHeat = 50;

  assert.equal(eventGatesPass(state, event), false, 'same-day fixture must block the social scene despite high heat');

  state.runtime.day = 1;
  assert.equal(eventGatesPass(state, event), true, 'real calendar gap plus subsequent training should enable the scene');
});

test('#124 EVT_18_END_001 requires last four league fixtures and an open produced objective', () => {
  const event = active18('EVT_18_END_001');
  const state = createInitialState(12404);
  state.date = '2027-05-10';
  state.runtime.day = 1;
  installSportStore(state, { objectiveStatus: 'open' });

  assert.equal(eventGatesPass(state, event), true, 'three remaining league fixtures with open objective should be eligible');

  installSportStore(state, { objectiveStatus: 'closed' });
  assert.equal(eventGatesPass(state, event), false, 'closed objective must block the scene');

  state.date = '2027-04-01';
  state.runtime.day = 1;
  installSportStore(state, { objectiveStatus: 'open' });
  assert.equal(eventGatesPass(state, event), false, 'calendar month alone must not stand in for the last-four-fixtures fact');
});


function producerMatchDayState(seed, date = '2026-08-05', runtimeDay = 35) {
  const state = createInitialState(seed);
  state.date = date;
  state.runtime.day = runtimeDay;
  state.runtime.seasonDay = runtimeDay;
  return state;
}

test('#124 producer-backed MATCH truth is reachable, read-only and save/resume stable', () => {
  const event = active18('EVT_18_MATCH_001');
  let produced = null;

  for (let seed = 8800; seed < 10000; seed += 1) {
    const state = producerMatchDayState(seed);
    recordOfficialMatchInPlace(state, {
      appeared: true,
      debutOccurred: true,
      injuryUnavailable: false
    });
    if (eventGatesPass(state, event)) {
      produced = state;
      break;
    }
  }

  assert.ok(produced, 'directed seeds should produce the canonical factual debut context');
  const before = structuredClone(produced);
  assert.equal(eventGatesPass(produced, event), true);
  assert.deepEqual(produced, before, 'eligibility read must not mutate producer-owned state');

  const restored = loadSave(serializeSave(produced));
  assert.equal(eventGatesPass(restored, event), true, 'save/resume must preserve factual MATCH eligibility');
  assert.deepEqual(restored.world.sportMatchModel, produced.world.sportMatchModel);
  assert.deepEqual(restored.rngState, produced.rngState);
});

test('#124 producer-backed first real squad call can unlock PRS without debut or preseason proxy', () => {
  const event = active18('EVT_18_PRS_001');
  let produced = null;

  for (let seed = 12420; seed < 13000; seed += 1) {
    const state = producerMatchDayState(seed);
    state.flags.FIRST_TEAM_ATTENTION = true;
    state.flags.OFFICIAL_DEBUT = false;
    state.flags.PRESEASON_FIRST_TEAM_CALL = false;
    const match = recordOfficialMatchInPlace(state, {
      appeared: false,
      debutOccurred: false,
      injuryUnavailable: false
    });
    if (match?.player.calledUp && !match.player.appeared) {
      produced = state;
      break;
    }
  }

  assert.ok(produced, 'directed seeds should produce a called-up-but-unused official fixture');
  assert.equal(eventGatesPass(produced, event), true);
  assert.equal(produced.flags.OFFICIAL_DEBUT, false);
  assert.equal(produced.flags.PRESEASON_FIRST_TEAM_CALL, false);
  assert.ok(produced.world.sportMatchModel.milestones.firstMatchSquadCall);

  const restored = loadSave(serializeSave(produced));
  assert.equal(eventGatesPass(restored, event), true, 'save/resume must preserve first-real-call eligibility');
});

test('#124 producer-backed END truth uses remaining fixtures plus the real objective lifecycle', () => {
  const event = active18('EVT_18_END_001');
  const state = producerMatchDayState(12440, '2027-05-12', 315);
  const match = recordOfficialMatchInPlace(state, {
    appeared: false,
    debutOccurred: false,
    injuryUnavailable: false
  });
  assert.ok(match);
  assert.equal(eventGatesPass(state, event), true, 'real late-season fixture + open objective should enable END');

  closeLeagueObjectiveInPlace(state, 'safe');
  assert.equal(eventGatesPass(state, event), false, 'closing the produced objective must immediately fail closed');

  const restored = loadSave(serializeSave(state));
  assert.equal(eventGatesPass(restored, event), false, 'closed-objective truth must survive save/resume');
});
