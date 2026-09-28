import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { createInitialState } from "../dist/content/initial-state.js";
import { clubById } from "../dist/catalog/football/index.js";
import {
  CURRENT_FOOTBALL_CATALOG_VERSION,
  PRE_FOOTBALL_CATALOG_VERSION,
  footballCatalogVersionOf,
  migrateFootballCatalogVersionInPlace,
  migrateFootballStateReferencesExplicitlyInPlace
} from "../dist/save/football-catalog-version.js";
import { inspectFootballCatalogSaveReferences } from "../dist/save/football-catalog-reference-validation.js";
import { loadSave, serializeSave } from "../dist/save/save.js";
import { recordOfficialMatchInPlace } from "../dist/simulation/match-model.js";

function parsed(state) {
  return JSON.parse(serializeSave(state));
}

test("new careers and serialized saves carry the active football catalog version", () => {
  const state = createInitialState(94001);
  assert.equal(state.footballCatalogVersion, CURRENT_FOOTBALL_CATALOG_VERSION);
  assert.equal(parsed(state).footballCatalogVersion, CURRENT_FOOTBALL_CATALOG_VERSION);
});

test("pre-V2 schema-8 save stays pre-catalog on load and re-save", () => {
  const raw = fs.readFileSync("examples/save-v08-seed-424242.json", "utf8");
  const original = JSON.parse(raw);
  assert.equal(original.footballCatalogVersion, undefined);

  const restored = loadSave(raw);
  assert.deepEqual(restored, original);
  assert.equal(restored.footballCatalogVersion, undefined);
  assert.equal(footballCatalogVersionOf(restored.footballCatalogVersion), PRE_FOOTBALL_CATALOG_VERSION);
  assert.deepEqual(JSON.parse(serializeSave(restored)), original);
});

test("pre-V2 compatibility load does not touch RNG", () => {
  const raw = fs.readFileSync("examples/save-v08-seed-424242.json", "utf8");
  const original = JSON.parse(raw);
  assert.deepEqual(loadSave(raw).rngState, original.rngState);
});

test("known prior V2 catalog version is preserved until an explicit migration is requested", () => {
  const state = createInitialState(94004);
  state.footballCatalogVersion = "world-v2-a1-2026-09-28";
  const restored = loadSave(JSON.stringify(state));
  assert.equal(restored.footballCatalogVersion, "world-v2-a1-2026-09-28");
  assert.equal(restored.club, "UDV");
});

test("unknown future catalog version fails with an actionable compatibility error", () => {
  const raw = parsed(createInitialState(94005));
  raw.footballCatalogVersion = "world-v99-2099-01-01";
  assert.throws(
    () => loadSave(JSON.stringify(raw)),
    /footballCatalogVersion|versión de catálogo no compatible/
  );
});

test("invalid current-V2 namespace identity fails closed at save boundary", () => {
  const raw = parsed(createInitialState(94006));
  for (const path of [
    ["club"],
    ["professional","ownerClub"],
    ["professional","registrationClub"],
    ["world","ownerClub"]
  ]) {
    const target = structuredClone(raw);
    let cursor = target;
    for (let i = 0; i < path.length - 1; i += 1) cursor = cursor[path[i]];
    cursor[path.at(-1)] = "ESP_FAKE_CLUB_999";
    assert.throws(
      () => loadSave(JSON.stringify(target)),
      /unknown football catalog namespace identity/,
      path.join(".")
    );
  }
});

test("pre-catalog synthetic and opaque historical identities remain loadable", () => {
  for (const legacyClub of ["Foreign_3_10", "Loan_3_14", "Aurora CF", "Destino", "Development Club"]) {
    const state = createInitialState(94007);
    delete state.footballCatalogVersion;
    state.club = legacyClub;
    state.professional.ownerClub = legacyClub;
    state.professional.registrationClub = legacyClub;
    state.world.ownerClub = legacyClub;
    state.professional.route = legacyClub.startsWith("Foreign_") ? "abroad" : "domestic";
    state.flags.ABROAD_ROUTE = legacyClub.startsWith("Foreign_");
    state.flags.LOAN_ACTIVE = false;
    assert.doesNotThrow(() => loadSave(JSON.stringify(state)), legacyClub);
  }
});

test("current V2 permits explicit legacy provenance but never persisted narrative aliases", () => {
  const base = {
    footballCatalogVersion: CURRENT_FOOTBALL_CATALOG_VERSION,
    club: "ESP_MADRID",
    professional: { ownerClub: "ESP_MADRID", registrationClub: "ESP_MADRID" },
    world: { ownerClub: "ESP_MADRID" }
  };
  assert.equal(
    inspectFootballCatalogSaveReferences({ ...base, history: [{ club: "Aurora CF" }] }),
    null
  );
  assert.equal(
    inspectFootballCatalogSaveReferences({ ...base, history: [{ club: "BIG_CLUB" }] })?.path,
    "history[0].club"
  );
});

test("historical fixture rows may predate opponentClubId across supported catalog generations", () => {
  const older = {
    footballCatalogVersion: "world-v2-a1-2026-09-28",
    club: "ESP_MADRID",
    professional: { ownerClub: "ESP_MADRID", registrationClub: "ESP_MADRID" },
    world: {
      ownerClub: "ESP_MADRID",
      sportMatchModel: { fixtures: [{ club: "Aurora CF", opponent: "SIM_OPP_TEST" }] }
    }
  };
  assert.equal(inspectFootballCatalogSaveReferences(older), null);

  const current = structuredClone(older);
  current.footballCatalogVersion = CURRENT_FOOTBALL_CATALOG_VERSION;
  assert.equal(inspectFootballCatalogSaveReferences(current), null);
});

test("fixture opponent catalog ID survives save/load and invalid opponent IDs are rejected", () => {
  const state = createInitialState(94008);
  state.date = "2026-08-05";
  state.runtime.day = 35;
  state.runtime.seasonDay = 35;
  const row = recordOfficialMatchInPlace(state, {
    appeared: true,
    debutOccurred: false,
    injuryUnavailable: false
  });
  assert.ok(row?.opponentClubId);
  assert.ok(clubById(row.opponentClubId));

  const raw = parsed(state);
  const restored = loadSave(JSON.stringify(raw));
  const restoredRow = restored.world.sportMatchModel.fixtures[0];
  assert.equal(restoredRow.opponentClubId, row.opponentClubId);
  assert.equal(restoredRow.opponent, row.opponent);

  raw.world.sportMatchModel.fixtures[0].opponentClubId = "ESP_FAKE_CLUB_999";
  assert.throws(
    () => loadSave(JSON.stringify(raw)),
    /opponentClubId|unknown football catalog namespace identity/
  );
});

test("explicit state migration preserves owner/registration separation and is idempotent", () => {
  const state = createInitialState(94009);
  state.footballCatalogVersion = "world-v2-a1-2026-09-28";
  state.club = "ESP_MADRID";
  state.professional.registrationClub = "ESP_MADRID";
  state.professional.ownerClub = "ESP_BARCELONA";
  state.world.ownerClub = "ESP_BARCELONA";
  state.history.push({
    eventId: "EVT_MIGRATION_PROBE",
    date: state.date,
    season: state.season,
    choiceId: "A",
    outcomeId: "A_PRIMARY",
    club: "ESP_MADRID",
    snapshot: {},
    salience: 50,
    visibility: "private"
  });
  state.npcs[0].club = "ESP_BARCELONA";

  const mapping = {
    ESP_MADRID: "ESP_VALENCIA",
    ESP_BARCELONA: "ESP_SEVILLA"
  };
  const changes = migrateFootballStateReferencesExplicitlyInPlace(state, mapping);
  assert.ok(changes >= 6);
  assert.equal(state.club, "ESP_VALENCIA");
  assert.equal(state.professional.registrationClub, "ESP_VALENCIA");
  assert.equal(state.professional.ownerClub, "ESP_SEVILLA");
  assert.equal(state.world.ownerClub, "ESP_SEVILLA");
  assert.notEqual(state.professional.ownerClub, state.professional.registrationClub);
  assert.equal(state.history[0].club, "ESP_VALENCIA");
  assert.equal(state.npcs[0].club, "ESP_SEVILLA");
  assert.equal(migrateFootballStateReferencesExplicitlyInPlace(state, mapping), 0);
});

test("catalog-version migration is explicit/idempotent and pre-V2 upgrade refuses guessing", () => {
  const v2 = createInitialState(94010);
  v2.footballCatalogVersion = "world-v2-a1-2026-09-28";
  assert.equal(migrateFootballCatalogVersionInPlace(v2), true);
  assert.equal(v2.footballCatalogVersion, CURRENT_FOOTBALL_CATALOG_VERSION);
  assert.equal(migrateFootballCatalogVersionInPlace(v2), false);

  const legacy = createInitialState(94011);
  delete legacy.footballCatalogVersion;
  assert.throws(
    () => migrateFootballCatalogVersionInPlace(legacy),
    /audited explicit legacy manifest/
  );
});

test("save/load replay preserves identity authorities and RNG state", () => {
  const state = createInitialState(94012);
  state.club = "ESP_MADRID";
  state.professional.ownerClub = "ESP_MADRID";
  state.professional.registrationClub = "ESP_MADRID";
  state.world.ownerClub = "ESP_MADRID";
  state.professional.leagueTier = 1;
  state.professional.route = "domestic";
  state.tier = 1;
  const beforeRng = structuredClone(state.rngState);

  const restored = loadSave(serializeSave(state));
  assert.equal(restored.club, "ESP_MADRID");
  assert.equal(restored.professional.ownerClub, "ESP_MADRID");
  assert.equal(restored.professional.registrationClub, "ESP_MADRID");
  assert.equal(restored.world.ownerClub, "ESP_MADRID");
  assert.equal(restored.footballCatalogVersion, CURRENT_FOOTBALL_CATALOG_VERSION);
  assert.deepEqual(restored.rngState, beforeRng);
});