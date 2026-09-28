import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../dist/content/initial-state.js";
import { EVENTS_18_20 } from "../dist/content/events/index.js";
import { clubById } from "../dist/catalog/football/index.js";
import { resolveChoice } from "../dist/narrative/resolver.js";
import { assertGameState } from "../dist/save/validation.js";

function eventById(id) {
  const event = EVENTS_18_20.find(row => row.id === id);
  assert.ok(event, id);
  return event;
}

function age19State(seed = 91001) {
  const state = createInitialState(seed);
  state.age = 19;
  state.phase = "18_20";
  state.date = "2027-01-15";
  state.season = "2026-27";
  return state;
}

function assertCatalogClubState(state, expectedTier) {
  const club = clubById(state.club);
  assert.ok(club, state.club);
  assert.equal(club.countryCode, "ESP");
  assert.equal(state.professional.registrationClub, club.id);
  assert.equal(state.professional.leagueTier, expectedTier);
  assert.equal(state.tier, expectedTier);
  assert.doesNotMatch(state.club, /^(NEW_CLUB|DEVELOPMENT_CLUB|HIGHER_CLUB|BIG_CLUB)$/);
  assertGameState(state);
}

for (const [choiceId, expectedTier] of [
  ["CLEAR_ROLE_LOWER", null],
  ["LEVEL_JUMP", 2],
  ["FORCE_EXIT", null]
]) {
  test(`EVT_19_JAN_001/${choiceId} materializes canonical alias to a catalog club without extra RNG`, () => {
    const event = eventById("EVT_19_JAN_001");
    const state = age19State(91000 + choiceId.length);
    const beforeNarrative = structuredClone(state.rngState.narrative);
    const beforeFootball = structuredClone(state.rngState.football);
    const result = resolveChoice(state, event, choiceId);
    const next = result.state;
    const tier = expectedTier ?? next.tier;

    assert.equal(next.rngState.narrative.draws, beforeNarrative.draws + 1);
    assert.deepEqual(next.rngState.football, beforeFootball);
    assertCatalogClubState(next, tier);

    const replay = resolveChoice(state, event, choiceId).state;
    assert.equal(replay.club, next.club);
    assert.deepEqual(replay.rngState, next.rngState);
  });
}

test("CEVT_18_RELEG_01/EXIT materializes NEW_CLUB through catalog", () => {
  const event = eventById("CEVT_18_RELEG_01");
  const state = age19State(91021);
  state.flags.UDV_RELEGATED = true;
  const before = structuredClone(state.rngState);
  const next = resolveChoice(state, event, "EXIT").state;
  assert.equal(next.rngState.narrative.draws, before.narrative.draws + 1);
  assert.deepEqual(next.rngState.football, before.football);
  assertCatalogClubState(next, next.tier);
});

test("CEVT_19_BIG_01/ACCEPT_MODEL materializes BIG_CLUB and leaves a valid save state", () => {
  const event = eventById("CEVT_19_BIG_01");
  const state = age19State(91031);
  state.flags.BIG_CLUB_INTEREST = true;
  state.reputation.marketHeat = 80;
  const before = structuredClone(state.rngState);
  const next = resolveChoice(state, event, "ACCEPT_MODEL").state;
  assert.equal(next.rngState.narrative.draws, before.narrative.draws + 1);
  assert.deepEqual(next.rngState.football, before.football);
  assertCatalogClubState(next, 1);
});

test("legacy alias definitions remain physically present in canonical content", () => {
  const january = eventById("EVT_19_JAN_001");
  const serialized = JSON.stringify(january);
  assert.match(serialized, /DEVELOPMENT_CLUB/);
  assert.match(serialized, /HIGHER_CLUB/);
  assert.match(serialized, /NEW_CLUB/);
});
