import assert from 'node:assert/strict';
import test from 'node:test';
import { createInitialState } from '../dist/content/initial-state.js';
import { EVENTS_18_20 } from '../dist/content/events/index.js';
import { eventGatesPass, gateAlternatives } from '../dist/narrative/event-gates.js';
import { getSportContext } from '../dist/simulation/sport-context.js';

const IDS = [
  'EVT_18_MATCH_001',
  'EVT_18_PRS_001',
  'EVT_18_SOC_001',
  'EVT_18_END_001'
];

function event(id) {
  const value = EVENTS_18_20.find(item => item.id === id);
  assert.ok(value, `missing ${id}`);
  return value;
}

function state(seed = 12400) {
  const value = createInitialState(seed);
  value.age = 18;
  value.phase = '18_20';
  value.date = '2026-09-01';
  value.season = '2026-27';
  value.runtime.day = 1;
  return value;
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

function installStore(value, { fixtures = [], milestones = {}, objectiveStatus = 'open' } = {}) {
  value.world.sportMatchModel = {
    version: 1,
    fixtures,
    milestones: emptyMilestones(milestones),
    objective: objectiveStatus === null ? null : {
      season: value.season,
      club: value.professional.registrationClub,
      kind: 'league_campaign',
      status: objectiveStatus,
      resolvedAt: objectiveStatus === 'closed' ? value.date : null,
      outcome: objectiveStatus === 'closed' ? 'resolved' : null
    }
  };
}

function currentDebutFixture(value, overrides = {}) {
  const club = value.professional.registrationClub;
  return {
    id: `fixture:${value.season}:${value.date}:${club}`,
    date: value.date,
    season: value.season,
    competition: 'league',
    club,
    opponent: 'SIM_OPP_3_01',
    homeAway: 'home',
    official: true,
    player: {
      calledUp: true,
      onBench: true,
      started: false,
      appeared: true,
      minutes: 12,
      debut: true,
      injuryUnavailable: false,
      ...(overrides.player ?? {})
    },
    decisionContext: overrides.decisionContext ?? {
      kind: 'debut_substitution',
      minute: 78,
      scoreHome: 1,
      scoreAway: 1
    }
  };
}

test('#124 MATCH consumes the persisted canonical debut context, not OFFICIAL_DEBUT alone', () => {
  const scene = event('EVT_18_MATCH_001');
  const proxyOnly = state(12401);
  proxyOnly.flags.OFFICIAL_DEBUT = true;
  proxyOnly.sport.roleScore = 99;
  proxyOnly.sport.form = 99;
  assert.equal(eventGatesPass(proxyOnly, scene), false, 'legacy debut/role/form proxies cannot open the scene');

  const authoritative = state(12402);
  authoritative.flags.OFFICIAL_DEBUT = false;
  const fixture = currentDebutFixture(authoritative);
  installStore(authoritative, { fixtures: [fixture], milestones: { firstMatchSquadCall: fixture.id, firstAppearance: fixture.id } });
  assert.equal(eventGatesPass(authoritative, scene), true, 'persisted 78 minute 1-1 debut context opens the scene');

  const wrongContext = state(12403);
  const wrongFixture = currentDebutFixture(wrongContext, {
    decisionContext: { kind: 'debut_substitution', minute: 74, scoreHome: 1, scoreAway: 1 }
  });
  installStore(wrongContext, { fixtures: [wrongFixture] });
  assert.equal(eventGatesPass(wrongContext, scene), false, 'a real debut with a different decision minute must not open this scene');
});

test('#124 PRS requires local attention plus debut OR first real squad call', () => {
  const scene = event('EVT_18_PRS_001');

  const attentionOnly = state(12410);
  attentionOnly.flags.FIRST_TEAM_ATTENTION = true;
  installStore(attentionOnly);
  assert.equal(eventGatesPass(attentionOnly, scene), false);

  const debut = state(12411);
  debut.flags.FIRST_TEAM_ATTENTION = true;
  debut.flags.OFFICIAL_DEBUT = true;
  installStore(debut);
  assert.equal(eventGatesPass(debut, scene), true, 'attention + real debut is a valid route');

  const call = state(12412);
  call.flags.FIRST_TEAM_ATTENTION = true;
  installStore(call, { milestones: { firstMatchSquadCall: 'fixture:2026-27:2026-08-25:UDV' } });
  assert.equal(eventGatesPass(call, scene), true, 'attention + persisted first squad call is a valid route');

  const noAttention = state(12413);
  installStore(noAttention, { milestones: { firstMatchSquadCall: 'fixture:2026-27:2026-08-25:UDV' } });
  assert.equal(eventGatesPass(noAttention, scene), false, 'sporting fact alone does not replace local attention');
});

test('#124 SOC rejects a match inside 24h and requires a real next training date', () => {
  const scene = event('EVT_18_SOC_001');

  const matchDay = state(12420);
  matchDay.reputation.mediaHeat = 20;
  matchDay.runtime.day = 7;
  assert.equal(getSportContext(matchDay).hoursToNextFixture, 0);
  assert.equal(eventGatesPass(matchDay, scene), false, 'same-day official match is inside the unsafe window');

  const safe = state(12421);
  safe.reputation.mediaHeat = 20;
  safe.runtime.day = 1;
  const facts = getSportContext(safe);
  assert.ok(facts.hoursToNextFixture >= 24);
  assert.ok(facts.nextTrainingDate);
  assert.equal(eventGatesPass(safe, scene), true, 'safe fixture distance plus produced training date opens the scene');

  const noTraining = state(12422);
  noTraining.date = '2027-06-15';
  noTraining.season = '2027-28';
  noTraining.reputation.mediaHeat = 20;
  noTraining.runtime.day = 1;
  assert.equal(getSportContext(noTraining).nextTrainingDate, null);
  assert.equal(eventGatesPass(noTraining, scene), false, 'absence of a produced training date fails closed');
});

test('#124 END requires 1-4 remaining league fixtures and an open objective', () => {
  const scene = event('EVT_18_END_001');

  const closingRun = state(12430);
  closingRun.date = '2027-05-10';
  closingRun.runtime.day = 1;
  installStore(closingRun, { objectiveStatus: 'open' });
  const closingFacts = getSportContext(closingRun);
  assert.ok(closingFacts.remainingLeagueMatches >= 1 && closingFacts.remainingLeagueMatches <= 4,
    `test fixture should be in final four, got ${closingFacts.remainingLeagueMatches}`);
  assert.equal(eventGatesPass(closingRun, scene), true);

  const closed = structuredClone(closingRun);
  installStore(closed, { objectiveStatus: 'closed' });
  assert.equal(eventGatesPass(closed, scene), false, 'closed objective cannot schedule the open-objective decision');

  const finished = state(12431);
  finished.date = '2027-06-01';
  finished.runtime.day = 1;
  installStore(finished, { objectiveStatus: 'open' });
  assert.equal(getSportContext(finished).remainingLeagueMatches, 0);
  assert.equal(eventGatesPass(finished, scene), false, 'zero fixtures remaining is already too late');

  const tooEarly = state(12432);
  tooEarly.date = '2027-04-01';
  tooEarly.runtime.day = 1;
  installStore(tooEarly, { objectiveStatus: 'open' });
  assert.ok(getSportContext(tooEarly).remainingLeagueMatches > 4);
  assert.equal(eventGatesPass(tooEarly, scene), false, 'more than four league fixtures remaining is too early');
});

test('#124 active gates contain no forbidden sport/month/season-resolution proxies', () => {
  const forbidden = new Set([
    'sport.roleScore',
    'sport.form',
    'rel.NPC_CCH_01.trust',
    'world.udvSeasonResolved',
    'month'
  ]);
  for (const id of IDS) {
    const scene = event(id);
    const all = [...scene.gates, ...(gateAlternatives(scene) ?? []).flat()];
    for (const gate of all) {
      assert.equal(forbidden.has(gate.path), false, `${id} still depends on forbidden proxy ${gate.path}`);
    }
  }
});
