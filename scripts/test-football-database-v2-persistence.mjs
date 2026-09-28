import test from "node:test";
import assert from "node:assert/strict";

import { createInitialState } from "../dist/content/initial-state.js";
import {
  FOOTBALL_CATALOG_VERSION,
  clubById
} from "../dist/catalog/football/index.js";
import { loadSave, serializeSave } from "../dist/save/save.js";
import { assertGameState } from "../dist/save/validation.js";

test("A4 new careers persist the active football catalog version", () => {
  const state = createInitialState(44001);
  assert.equal(state.schemaVersion, 8);
  assert.equal(state.footballCatalogVersion, FOOTBALL_CATALOG_VERSION);

  const beforeRng = structuredClone(state.rngState);
  const raw = serializeSave(state);
  const loaded = loadSave(raw);

  assert.equal(loaded.footballCatalogVersion, FOOTBALL_CATALOG_VERSION);
  assert.deepEqual(loaded.rngState, beforeRng);
  assertGameState(loaded);
});

test("A4 historical schema-8 saves without catalog marker remain legacy-readable", () => {
  const state = createInitialState(44002);
  delete state.footballCatalogVersion;
  state.club = "Foreign_2_07";
  state.tier = 2;
  state.professional.ownerClub = "Foreign_2_07";
  state.professional.registrationClub = "Foreign_2_07";
  state.professional.leagueTier = 2;
  state.professional.route = "abroad";
  state.world.ownerClub = "Foreign_2_07";
  state.flags.ABROAD_ROUTE = true;

  const before = structuredClone(state);
  const raw = serializeSave(state);
  const loaded = loadSave(raw);

  assert.equal(loaded.footballCatalogVersion, undefined);
  assert.equal(loaded.club, "Foreign_2_07");
  assert.equal(loaded.professional.ownerClub, "Foreign_2_07");
  assert.equal(loaded.professional.registrationClub, "Foreign_2_07");
  assert.equal(loaded.world.ownerClub, "Foreign_2_07");
  assert.deepEqual(loaded.rngState, before.rngState);
});

test("A4 legacy opaque display identities stay loadable only on unmarked historical saves", () => {
  const legacy = createInitialState(44003);
  delete legacy.footballCatalogVersion;
  legacy.club = "Destino FC";
  legacy.professional.ownerClub = "Destino FC";
  legacy.professional.registrationClub = "Destino FC";
  legacy.world.ownerClub = "Destino FC";

  assert.doesNotThrow(() => assertGameState(legacy));
  const loaded = loadSave(serializeSave(legacy));
  assert.equal(loaded.club, "Destino FC");
  assert.equal(loaded.footballCatalogVersion, undefined);

  const v2 = structuredClone(legacy);
  v2.footballCatalogVersion = FOOTBALL_CATALOG_VERSION;
  assert.throws(() => assertGameState(v2), /referencia de club legacy_compat no permitida en new_production/);
});

test("A4 V2-native saves reject synthetic legacy club producers", () => {
  for (const legacyId of [
    "SIM_OPP_1_2",
    "Development_3_01",
    "Domestic_2_03",
    "Summer_2_04",
    "Foreign_2_07",
    "Loan_3_09",
    "Club 2 · 4",
    "Aurora CF"
  ]) {
    const state = createInitialState(44004);
    state.club = legacyId;
    state.professional.ownerClub = legacyId;
    state.professional.registrationClub = legacyId;
    state.world.ownerClub = legacyId;
    assert.throws(
      () => assertGameState(state),
      /referencia de club legacy_compat no permitida en new_production/,
      legacyId
    );
  }
});

test("A4 narrative aliases are never legal persisted club identities", () => {
  for (const alias of [
    "NEW_CLUB",
    "DEVELOPMENT_CLUB",
    "DEVELOPMENT_CLUB_2",
    "HIGHER_CLUB",
    "BIG_CLUB",
    "FOREIGN_DEV_CLUB"
  ]) {
    const state = createInitialState(44005);
    state.club = alias;
    state.professional.ownerClub = alias;
    state.professional.registrationClub = alias;
    state.world.ownerClub = alias;
    assert.throws(() => assertGameState(state), /narrative_alias no permitida/, alias);

    delete state.footballCatalogVersion;
    assert.throws(() => assertGameState(state), /narrative_alias no permitida/, alias);
  }
});

test("A4 unknown V2-like catalog identities fail closed", () => {
  const state = createInitialState(44006);
  state.club = "ESP_FAKE_CLUB_999";
  state.professional.ownerClub = "ESP_FAKE_CLUB_999";
  state.professional.registrationClub = "ESP_FAKE_CLUB_999";
  state.world.ownerClub = "ESP_FAKE_CLUB_999";
  assert.throws(() => assertGameState(state), /invalid no permitida en new_production/);
});

test("A4 catalog identities and UDV remain valid on V2-native saves", () => {
  const state = createInitialState(44007);
  const catalogClub = clubById("ESP_MADRID");
  assert.ok(catalogClub);

  state.club = catalogClub.id;
  state.professional.ownerClub = catalogClub.id;
  state.professional.registrationClub = catalogClub.id;
  state.professional.leagueTier = catalogClub.tier;
  state.world.ownerClub = catalogClub.id;
  state.tier = catalogClub.tier;
  assert.doesNotThrow(() => assertGameState(state));

  state.club = "UDV";
  state.professional.ownerClub = "UDV";
  state.professional.registrationClub = "UDV";
  state.world.ownerClub = "UDV";
  assert.doesNotThrow(() => assertGameState(state));
});

test("A4 unsupported football catalog version fails before save use", () => {
  const state = createInitialState(44008);
  state.footballCatalogVersion = "world-v2-future-2099-01-01";
  assert.throws(() => assertGameState(state), /versión de catálogo no compatible/);
  assert.throws(() => loadSave(JSON.stringify(state)), /versión de catálogo no compatible/);
});

test("A4 validation is read-only and consumes zero RNG draws", () => {
  const state = createInitialState(44009);
  const before = structuredClone(state);
  for (let index = 0; index < 100; index += 1) assertGameState(state);
  assert.deepEqual(state, before);
});
