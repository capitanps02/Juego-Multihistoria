import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../dist/content/initial-state.js";
import {
  recordOfficialMatchInPlace,
  scheduledLeagueFixtures
} from "../dist/simulation/match-model.js";
import {
  clubById,
  divisionById
} from "../dist/catalog/football/index.js";
import {
  resolveFixtureDivision,
  selectFixtureOpponent
} from "../dist/catalog/football/fixture-opponent.js";
import { loadSave, serializeSave } from "../dist/save/save.js";

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

function goalCount(roll) {
  const goals = [0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 3, 3, 4, 5];
  return goals[roll % goals.length];
}

function legacyExpectedResult(state, fixture) {
  const seed = state.rngState.football.seed;
  const clubGoals = goalCount(producer(seed, fixture.id, "club-goals"));
  const opponentGoals = goalCount(producer(seed, fixture.id, "opponent-goals"));
  const homeGoals = fixture.homeAway === "home" ? clubGoals : opponentGoals;
  const awayGoals = fixture.homeAway === "home" ? opponentGoals : clubGoals;
  const halfTimeHomeGoals = homeGoals === 0 ? 0 : producer(seed, fixture.id, "ht-home") % (homeGoals + 1);
  const halfTimeAwayGoals = awayGoals === 0 ? 0 : producer(seed, fixture.id, "ht-away") % (awayGoals + 1);
  return {
    homeGoals,
    awayGoals,
    halfTimeHomeGoals,
    halfTimeAwayGoals,
    outcome: clubGoals > opponentGoals ? "win" : clubGoals < opponentGoals ? "loss" : "draw"
  };
}

test("catalog fixtures replace SIM_OPP for canonical UDV without consuming RNG", () => {
  const state = matchDayState(19001);
  const beforeRng = structuredClone(state.rngState);
  const row = recordOfficialMatchInPlace(state, {
    appeared: true,
    debutOccurred: false,
    injuryUnavailable: false
  });
  assert.ok(row);
  assert.equal(row.opponent.startsWith("SIM_OPP_"), false);
  assert.ok(row.opponentClubId);
  const opponent = clubById(row.opponentClubId);
  assert.ok(opponent);
  assert.equal(opponent.name, row.opponent);
  assert.equal(opponent.divisionId, "ESP_D3");
  assert.deepEqual(state.rngState, beforeRng);
});

test("catalog opponent swap preserves legacy fixture result authority exactly", () => {
  for (const seed of [1, 42, 777, 19002, 424242]) {
    const state = matchDayState(seed);
    const row = recordOfficialMatchInPlace(state, {
      appeared: true,
      debutOccurred: false,
      injuryUnavailable: false
    });
    assert.ok(row?.result);
    assert.deepEqual(row.result, legacyExpectedResult(state, row), `seed ${seed}`);
  }
});

test("catalog club plays a different club from its exact division", () => {
  const state = matchDayState(19003);
  state.club = "ESP_MADRID";
  state.professional.ownerClub = "ESP_MADRID";
  state.professional.registrationClub = "ESP_MADRID";
  state.professional.leagueTier = 1;
  state.professional.route = "domestic";
  state.tier = 1;

  const row = recordOfficialMatchInPlace(state, {
    appeared: true,
    debutOccurred: false,
    injuryUnavailable: false
  });
  assert.ok(row?.opponentClubId);
  assert.notEqual(row.opponentClubId, "ESP_MADRID");
  assert.equal(clubById(row.opponentClubId)?.divisionId, "ESP_D1");
});

test("synthetic abroad clubs keep one stable foreign league context", () => {
  const a = resolveFixtureDivision("Foreign_1_07", 1, "abroad", true);
  const b = resolveFixtureDivision("Foreign_1_07", 1, "abroad", true);
  assert.ok(a && b);
  assert.equal(a.id, b.id);
  assert.notEqual(a.countryCode, "ESP");

  const first = selectFixtureOpponent({
    registrationClub: "Foreign_1_07",
    leagueTier: 1,
    route: "abroad",
    abroad: true,
    selectionFingerprint: 123
  });
  const second = selectFixtureOpponent({
    registrationClub: "Foreign_1_07",
    leagueTier: 1,
    route: "abroad",
    abroad: true,
    selectionFingerprint: 456
  });
  assert.equal(first.divisionId, a.id);
  assert.equal(second.divisionId, a.id);
  assert.equal(first.countryCode, second.countryCode);
});

test("scheduled projections expose catalog opponents and are read-only", () => {
  const state = createInitialState(19004);
  const before = structuredClone(state);
  const fixtures = scheduledLeagueFixtures(state, 70);
  assert.ok(fixtures.length > 0);
  for (const fixture of fixtures) {
    assert.ok(fixture.opponentClubId);
    assert.ok(clubById(fixture.opponentClubId));
    assert.equal(fixture.opponent.startsWith("SIM_OPP_"), false);
  }
  assert.deepEqual(state, before);
});

test("new opponent catalog id survives save/load while historical rows without it remain valid", () => {
  const state = matchDayState(19005);
  const row = recordOfficialMatchInPlace(state, {
    appeared: true,
    debutOccurred: false,
    injuryUnavailable: false
  });
  assert.ok(row?.opponentClubId);

  const restored = loadSave(serializeSave(state));
  assert.equal(restored.world.sportMatchModel.fixtures[0].opponentClubId, row.opponentClubId);

  const historical = JSON.parse(serializeSave(state));
  delete historical.world.sportMatchModel.fixtures[0].opponentClubId;
  assert.doesNotThrow(() => loadSave(JSON.stringify(historical)));
});

test("division fallback is explicit for synthetic tiers deeper than current catalog coverage", () => {
  assert.equal(resolveFixtureDivision("UDV", 4, "home", false)?.id, "ESP_D3");
  const foreign = resolveFixtureDivision("Foreign_4_01", 4, "abroad", true);
  assert.ok(foreign);
  assert.notEqual(foreign.countryCode, "ESP");
  assert.ok(divisionById(foreign.id));
});
