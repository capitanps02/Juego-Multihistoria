import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../dist/content/initial-state.js";
import { clubById } from "../dist/catalog/football/index.js";
import {
  CURRENT_FOOTBALL_CATALOG_VERSION,
  SUPPORTED_FOOTBALL_CATALOG_VERSIONS
} from "../dist/save/football-catalog-version.js";
import { loadSave, serializeSave } from "../dist/save/save.js";
import { recordOfficialMatchInPlace } from "../dist/simulation/match-model.js";

function parsed(state) {
  return JSON.parse(serializeSave(state));
}

test("new careers and serialized saves carry the active football catalog version", () => {
  const state = createInitialState(94001);
  assert.equal(state.footballCatalogVersion, CURRENT_FOOTBALL_CATALOG_VERSION);
  const raw = parsed(state);
  assert.equal(raw.footballCatalogVersion, CURRENT_FOOTBALL_CATALOG_VERSION);
});

test("serializeSave stamps the current catalog version without mutating an old in-memory state", () => {
  const state = createInitialState(94002);
  delete state.footballCatalogVersion;
  const before = structuredClone(state);
  const raw = JSON.parse(serializeSave(state));
  assert.equal(raw.footballCatalogVersion, CURRENT_FOOTBALL_CATALOG_VERSION);
  assert.deepEqual(state, before);
});

test("pre-V2 save without footballCatalogVersion loads and normalizes to current", () => {
  const raw = parsed(createInitialState(94003));
  delete raw.footballCatalogVersion;
  const restored = loadSave(JSON.stringify(raw));
  assert.equal(restored.footballCatalogVersion, CURRENT_FOOTBALL_CATALOG_VERSION);
  assert.equal(JSON.parse(serializeSave(restored)).footballCatalogVersion, CURRENT_FOOTBALL_CATALOG_VERSION);
});

test("known prior catalog versions normalize by stable identity, never visible-name matching", () => {
  for (const version of SUPPORTED_FOOTBALL_CATALOG_VERSIONS) {
    const raw = parsed(createInitialState(94004));
    raw.footballCatalogVersion = version;
    raw.club = "UDV";
    raw.professional.ownerClub = "UDV";
    raw.professional.registrationClub = "UDV";
    raw.world.ownerClub = "UDV";
    const restored = loadSave(JSON.stringify(raw));
    assert.equal(restored.club, "UDV");
    assert.equal(restored.footballCatalogVersion, CURRENT_FOOTBALL_CATALOG_VERSION);
  }
});

test("unknown future catalog version fails with an actionable compatibility error", () => {
  const raw = parsed(createInitialState(94005));
  raw.footballCatalogVersion = "world-v99-2099-01-01";
  assert.throws(
    () => loadSave(JSON.stringify(raw)),
    /footballCatalogVersion: versión de catálogo no compatible/
  );
});

test("invalid V2 namespace identity fails closed at save boundary", () => {
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

test("historical synthetic and display-like club identities remain loadable compatibility data", () => {
  for (const legacyClub of ["Foreign_3_10", "Loan_3_14", "Aurora CF", "Destino", "Development Club"]) {
    const raw = parsed(createInitialState(94007));
    raw.club = legacyClub;
    raw.professional.ownerClub = legacyClub;
    raw.professional.registrationClub = legacyClub;
    raw.world.ownerClub = legacyClub;
    raw.professional.route = legacyClub.startsWith("Foreign_") ? "abroad" : "domestic";
    raw.flags.ABROAD_ROUTE = legacyClub.startsWith("Foreign_");
    raw.flags.LOAN_ACTIVE = false;
    assert.doesNotThrow(() => loadSave(JSON.stringify(raw)), legacyClub);
  }
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
  assert.equal(restored.footballCatalogVersion, CURRENT_FOOTBALL_CATALOG_VERSION);

  raw.world.sportMatchModel.fixtures[0].opponentClubId = "ESP_FAKE_CLUB_999";
  assert.throws(
    () => loadSave(JSON.stringify(raw)),
    /opponentClubId debe ser un ID de catálogo válido|unknown opponent catalog id/
  );
});

test("save/load replay preserves identity authorities and RNG state", () => {
  const state = createInitialState(94009);
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
