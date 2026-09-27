import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../dist/content/initial-state.js";
import {
  recordOfficialMatchInPlace,
  scheduledLeagueFixtures
} from "../dist/simulation/match-model.js";

function matchDayState(seed = 19001) {
  const state = createInitialState(seed);
  state.date = "2026-08-05";
  state.runtime.day = 35;
  state.runtime.seasonDay = 35;
  return state;
}

function hashString(value) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function avalanche32(value) {
  let x = value >>> 0;
  x ^= x >>> 16;
  x = Math.imul(x, 0x7feb352d);
  x ^= x >>> 15;
  x = Math.imul(x, 0x846ca68b);
  x ^= x >>> 16;
  return x >>> 0;
}

function producer(seed, fixtureId, channel) {
  return avalanche32(hashString(`${seed}|${fixtureId}|${channel}`));
}

function fixtureFingerprint(state, date) {
  return avalanche32(hashString(
    `${state.season}|${date}|${state.professional.registrationClub}|${state.professional.leagueTier}`
  ));
}

function goalCount(roll) {
  const goals = [0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 3, 3, 4, 5];
  return goals[roll % goals.length];
}

function baselineExpectedResult(state, fixture) {
  const seed = state.rngState.football.seed;
  const clubGoals = goalCount(producer(seed, fixture.id, "club-goals"));
  const opponentGoals = goalCount(producer(seed, fixture.id, "opponent-goals"));
  const homeGoals = fixture.homeAway === "home" ? clubGoals : opponentGoals;
  const awayGoals = fixture.homeAway === "home" ? opponentGoals : clubGoals;
  const halfTimeHomeGoals = homeGoals === 0
    ? 0
    : producer(seed, fixture.id, "ht-home") % (homeGoals + 1);
  const halfTimeAwayGoals = awayGoals === 0
    ? 0
    : producer(seed, fixture.id, "ht-away") % (awayGoals + 1);
  return {
    homeGoals,
    awayGoals,
    halfTimeHomeGoals,
    halfTimeAwayGoals,
    outcome: clubGoals > opponentGoals ? "win" : clubGoals < opponentGoals ? "loss" : "draw"
  };
}

/**
 * DB-A3 baseline:
 * fixture identity enrichment is allowed to change opponent/opponentClubId only.
 * It must not change fixture id, home/away, match result authority or any RNG state.
 */
test("DB-A3 fixture identity changes must preserve fixture/result/RNG authority", () => {
  for (const seed of [1, 42, 777, 19001, 424242]) {
    const state = matchDayState(seed);
    const beforeRng = structuredClone(state.rngState);
    const expectedId = `fixture:${state.season}:${state.date}:${state.professional.registrationClub}`;
    const expectedHomeAway = fixtureFingerprint(state, state.date) % 2 === 0 ? "home" : "away";

    const row = recordOfficialMatchInPlace(state, {
      appeared: true,
      debutOccurred: false,
      injuryUnavailable: false
    });

    assert.ok(row, `seed ${seed} should record a fixture`);
    assert.equal(row.id, expectedId, `seed ${seed} fixture id`);
    assert.equal(row.homeAway, expectedHomeAway, `seed ${seed} home/away`);
    assert.deepEqual(row.result, baselineExpectedResult(state, row), `seed ${seed} result authority`);
    assert.deepEqual(state.rngState, beforeRng, `seed ${seed} RNG state`);
  }
});

test("DB-A3 scheduled fixture projection stays read-only", () => {
  for (const seed of [5, 99, 19004]) {
    const state = createInitialState(seed);
    const before = structuredClone(state);
    const fixtures = scheduledLeagueFixtures(state, 70);
    assert.ok(fixtures.length > 0);
    assert.deepEqual(state, before);
  }
});

test("DB-A3 baseline fixture projection is deterministic for identical state", () => {
  const a = createInitialState(19006);
  const b = structuredClone(a);
  assert.deepEqual(scheduledLeagueFixtures(a, 70), scheduledLeagueFixtures(b, 70));
});
