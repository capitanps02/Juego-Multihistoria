import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../dist/content/initial-state.js";
import { EVENTS_18_20 } from "../dist/content/events/index.js";
import { resolveChoice } from "../dist/narrative/resolver.js";

const CASES = [
  { alias: "NEW_CLUB", eventId: "EVT_19_JAN_001", choiceId: "FORCE_EXIT" },
  { alias: "DEVELOPMENT_CLUB", eventId: "EVT_19_JAN_001", choiceId: "CLEAR_ROLE_LOWER" },
  { alias: "HIGHER_CLUB", eventId: "EVT_19_JAN_001", choiceId: "LEVEL_JUMP" },
  { alias: "BIG_CLUB", eventId: "CEVT_19_BIG_01", choiceId: "ACCEPT_MODEL" },
  { alias: "DEVELOPMENT_CLUB_2", eventId: "CEVT_19_RETURN_01", choiceId: "NEW_LOAN" },
  { alias: "FOREIGN_DEV_CLUB", eventId: "CEVT_19_ABROAD_01", choiceId: "VISIT" }
];

function eventById(id) {
  const event = EVENTS_18_20.find(row => row.id === id);
  assert.ok(event, id);
  return event;
}

function stateFor(seed) {
  const state = createInitialState(seed);
  state.age = 19;
  state.phase = "18_20";
  state.date = "2027-01-15";
  state.season = "2026-27";
  state.flags.BIG_CLUB_INTEREST = true;
  state.flags.LOAN_RETURN = true;
  state.flags.FOREIGN_DEV_INTEREST = true;
  state.reputation.marketHeat = 80;
  return state;
}

function aliasWasPersisted(state, alias) {
  return state.club === alias
    || state.world.ownerClub === alias
    || state.professional.ownerClub === alias
    || state.professional.registrationClub === alias;
}

function findAliasCase(spec, start = 91000, limit = 2000) {
  const event = eventById(spec.eventId);
  for (let offset = 0; offset < limit; offset += 1) {
    const seed = start + offset;
    const state = stateFor(seed);
    const beforeNarrative = structuredClone(state.rngState.narrative);
    const beforeFootball = structuredClone(state.rngState.football);
    const result = resolveChoice(state, event, spec.choiceId);
    if (!aliasWasPersisted(result.state, spec.alias)) continue;

    const replay = resolveChoice(state, event, spec.choiceId);
    return {
      ...spec,
      seed,
      outcomeId: result.outcomeId,
      narrativeDrawDelta: result.state.rngState.narrative.draws - beforeNarrative.draws,
      footballUnchanged: JSON.stringify(result.state.rngState.football) === JSON.stringify(beforeFootball),
      replayOutcomeStable: replay.outcomeId === result.outcomeId,
      replayRngStable: JSON.stringify(replay.state.rngState) === JSON.stringify(result.state.rngState),
      tier: result.state.tier,
      club: result.state.club,
      ownerClub: result.state.world.ownerClub
    };
  }
  throw new Error(`No persisted-alias baseline found for ${spec.alias}`);
}

function baselineRows() {
  return CASES.map((spec, index) => findAliasCase(spec, 91000 + index * 2500));
}

if (process.argv.includes("--emit")) {
  console.log(JSON.stringify(baselineRows(), null, 2));
} else {
  test("DB-A3 canonical 18-20 content physically retains all six V2 narrative aliases", () => {
    const serialized = JSON.stringify(EVENTS_18_20);
    for (const { alias } of CASES) assert.match(serialized, new RegExp(alias));
  });

  test("DB-A3 alias-producing choices preserve narrative/football RNG baseline and deterministic outcome", () => {
    const rows = baselineRows();
    assert.equal(rows.length, 6);
    for (const row of rows) {
      assert.equal(row.narrativeDrawDelta, 1, `${row.alias} narrative draw count`);
      assert.equal(row.footballUnchanged, true, `${row.alias} football RNG`);
      assert.equal(row.replayOutcomeStable, true, `${row.alias} replay outcome`);
      assert.equal(row.replayRngStable, true, `${row.alias} replay RNG`);
    }
  });
}
