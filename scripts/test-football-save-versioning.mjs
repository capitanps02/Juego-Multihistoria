import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { createInitialState } from "../dist/content/initial-state.js";
import { loadSave, serializeSave, CURRENT_SCHEMA_VERSION } from "../dist/save/save.js";
import {
  CURRENT_FOOTBALL_CATALOG_VERSION,
  PRE_FOOTBALL_CATALOG_VERSION,
  footballCatalogVersionOf,
  migrateFootballClubReferenceExplicitly
} from "../dist/save/football-catalog-version.js";

test("DB-A4 new careers persist an independent football catalog version", () => {
  const state = createInitialState(404);
  assert.equal(state.schemaVersion, CURRENT_SCHEMA_VERSION);
  assert.equal(state.footballCatalogVersion, CURRENT_FOOTBALL_CATALOG_VERSION);

  const serialized = JSON.parse(serializeSave(state));
  assert.equal(serialized.schemaVersion, 8);
  assert.equal(serialized.footballCatalogVersion, CURRENT_FOOTBALL_CATALOG_VERSION);
});

test("DB-A4 pre-catalog schema-8 saves load and re-save without silent catalog upgrade", () => {
  const raw = fs.readFileSync("examples/save-v08-seed-424242.json", "utf8");
  const original = JSON.parse(raw);
  assert.equal(original.footballCatalogVersion, undefined);

  const loaded = loadSave(raw);
  assert.deepEqual(loaded, original);
  assert.equal(loaded.footballCatalogVersion, undefined);
  assert.equal(footballCatalogVersionOf(loaded.footballCatalogVersion), PRE_FOOTBALL_CATALOG_VERSION);

  const reserialized = JSON.parse(serializeSave(loaded));
  assert.deepEqual(reserialized, original);
});

test("DB-A4 pre-catalog load does not touch RNG streams", () => {
  const raw = fs.readFileSync("examples/save-v08-seed-424242.json", "utf8");
  const original = JSON.parse(raw);
  const loaded = loadSave(raw);
  assert.deepEqual(loaded.rngState, original.rngState);
});

test("DB-A4 supported catalog metadata is preserved rather than normalized", () => {
  const state = createInitialState(405);
  state.footballCatalogVersion = "world-v2-a1-2026-09-28";

  const loaded = loadSave(JSON.stringify(state));
  assert.equal(loaded.footballCatalogVersion, "world-v2-a1-2026-09-28");
  assert.equal(footballCatalogVersionOf(loaded.footballCatalogVersion), "world-v2-a1-2026-09-28");
});

test("DB-A4 unsupported catalog versions fail closed", () => {
  const state = createInitialState(406);
  state.footballCatalogVersion = "world-v99-future";
  assert.throws(
    () => loadSave(JSON.stringify(state)),
    error => error?.code === "INVALID_SAVE" && error?.path === "footballCatalogVersion"
  );
});

test("DB-A4 explicit ID migration never guesses from names or positions", () => {
  assert.equal(
    migrateFootballClubReferenceExplicitly("ESP_MADRID", { ESP_MADRID: "ESP_BARCELONA" }),
    "ESP_BARCELONA"
  );
  assert.equal(
    migrateFootballClubReferenceExplicitly("Aurora CF", { ESP_MADRID: "ESP_BARCELONA" }),
    "Aurora CF"
  );
  assert.throws(
    () => migrateFootballClubReferenceExplicitly("ESP_MADRID", { ESP_MADRID: null }),
    /tombstoned/
  );
  assert.throws(
    () => migrateFootballClubReferenceExplicitly("ESP_MADRID", { ESP_MADRID: "ESP_FAKE_CLUB_999" }),
    /not a current football identity/
  );
});
