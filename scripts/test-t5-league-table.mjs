import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState } from '../dist/content/initial-state.js';
import { recordOfficialMatchInPlace } from '../dist/simulation/match-model.js';
import { getLeagueStandingContext } from '../dist/simulation/league-table.js';
import { getSportContext } from '../dist/simulation/sport-context.js';
import { loadSave, serializeSave } from '../dist/save/save.js';

function matchDayState(seed = 9800) {
  const state = createInitialState(seed);
  state.date = '2026-08-05';
  state.runtime.day = 35;
  state.runtime.seasonDay = 35;
  return state;
}

function addWeek(state) {
  state.date = new Date(Date.parse(state.date + 'T00:00:00Z') + 7 * 86400000).toISOString().slice(0, 10);
  state.runtime.day += 7;
  state.runtime.seasonDay += 7;
}

function playWeeks(state, weeks, appeared = true) {
  for (let week = 0; week < weeks; week += 1) {
    if (week > 0) addWeek(state);
    const row = recordOfficialMatchInPlace(state, { appeared, debutOccurred: false, injuryUnavailable: false });
    assert.ok(row?.result);
  }
}

function expectedClubPoints(rows, club) {
  let points = 0;
  let gf = 0;
  let ga = 0;
  let wins = 0;
  let draws = 0;
  let losses = 0;
  for (const row of rows.filter(r => r.club === club && r.result)) {
    const forGoals = row.homeAway === 'home' ? row.result.homeGoals : row.result.awayGoals;
    const againstGoals = row.homeAway === 'home' ? row.result.awayGoals : row.result.homeGoals;
    gf += forGoals;
    ga += againstGoals;
    if (forGoals > againstGoals) { wins++; points += 3; }
    else if (forGoals === againstGoals) { draws++; points += 1; }
    else losses++;
  }
  return { points, gf, ga, wins, draws, losses };
}

test('league table/1 current club row is built from persisted authoritative results', () => {
  const state = matchDayState(9801);
  playWeeks(state, 6);
  const before = structuredClone(state);
  const standing = getLeagueStandingContext(state);

  assert.equal(standing.status, 'authoritative');
  assert.ok(standing.table);
  assert.ok(standing.teamCount >= 20);
  assert.equal(standing.matchesPlayed, 6);
  assert.ok(standing.currentPosition >= 1 && standing.currentPosition <= standing.teamCount);

  const current = standing.table.find(row => row.club === state.professional.registrationClub);
  const expected = expectedClubPoints(state.world.sportMatchModel.fixtures, state.professional.registrationClub);
  assert.ok(current);
  assert.equal(current.points, expected.points);
  assert.equal(current.goalsFor, expected.gf);
  assert.equal(current.goalsAgainst, expected.ga);
  assert.equal(current.wins, expected.wins);
  assert.equal(current.draws, expected.draws);
  assert.equal(current.losses, expected.losses);
  assert.equal(current.played, 6);
  assert.equal(standing.points, expected.points);
  assert.equal(standing.race.gapToLeader >= 0, true);
  assert.equal(standing.race.gapToEurope >= 0, true);
  assert.equal(standing.race.gapToSafety >= 0, true);

  const sport = getSportContext(state);
  assert.deepEqual(sport.currentStanding, standing);
  assert.equal(sport.availability.currentStanding, 'known');
  assert.deepEqual(state, before, 'standing read must not mutate state or RNG');
});

test('league table/2 aggregate role/form/reputation proxies cannot change standings', () => {
  const a = matchDayState(9802);
  const b = matchDayState(9802);
  a.sport.roleScore = 1;
  a.sport.form = 1;
  a.reputation.prestige = 1;
  b.sport.roleScore = 99;
  b.sport.form = 99;
  b.reputation.prestige = 99;
  playWeeks(a, 5, false);
  playWeeks(b, 5, true);

  const ta = getLeagueStandingContext(a);
  const tb = getLeagueStandingContext(b);
  assert.deepEqual(ta, tb);
  assert.deepEqual(a.rngState, b.rngState);
});

test('league table/3 missing historical club result fails the entire table closed', () => {
  const state = matchDayState(9803);
  playWeeks(state, 4);
  delete state.world.sportMatchModel.fixtures[1].result;
  delete state.world.sportMatchModel.fixtures[1].stats;
  state.world.sportMatchModel.milestones.firstGoal = null;

  const standing = getLeagueStandingContext(state);
  assert.equal(standing.status, 'unavailable');
  assert.equal(standing.table, null);
  assert.equal(standing.currentPosition, null);
  assert.equal(getSportContext(state).currentStanding, null);
  assert.equal(getSportContext(state).availability.currentStanding, 'unavailable');
});

test('league table/4 transfer scopes standings to the new registration club', () => {
  const state = matchDayState(9804);
  playWeeks(state, 5);
  const oldStanding = getLeagueStandingContext(state);
  assert.equal(oldStanding.status, 'authoritative');

  state.professional.registrationClub = 'NEW_CLUB';
  state.club = 'NEW_CLUB';
  const after = getLeagueStandingContext(state);
  assert.equal(after.status, 'unavailable');
  assert.equal(after.matchesPlayed, null);
});

test('league table/5 standing is save/load stable and consumes zero RNG', () => {
  const state = matchDayState(9805);
  playWeeks(state, 7);
  const beforeRng = structuredClone(state.rngState);
  const a = getLeagueStandingContext(state);
  const b = getLeagueStandingContext(state);
  assert.deepEqual(a, b);
  assert.deepEqual(state.rngState, beforeRng);

  const restored = loadSave(serializeSave(state));
  assert.deepEqual(getLeagueStandingContext(restored), a);
  assert.deepEqual(restored.rngState, state.rngState);
});
