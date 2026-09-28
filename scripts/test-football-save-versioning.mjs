import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { createInitialState } from "../dist/content/initial-state.js";
import { loadSave, serializeSave, CURRENT_SCHEMA_VERSION } from "../dist/save/save.js";
import {
  CURRENT_FOOTBALL_CATALOG_VERSION,
  PRE_FOOTBALL_CATALOG_VERSION,
  footballCatalogVersionOf,
  migrateFootballCatalogVersionInPlace,
  migrateFootballClubReferenceExplicitly,
  migrateFootballStateReferencesExplicitlyInPlace
} from "../dist/save/football-catalog-version.js";
import { inspectFootballCatalogSaveReferences } from "../dist/save/football-catalog-reference-validation.js";

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

test("DB-A4 explicit state migration preserves owner/registration semantics and is idempotent", () => {
  const state = createInitialState(407);
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
  state.playerActions = {
    version: 1,
    sequence: 0,
    history: [],
    cooldowns: {},
    facts: [{
      factId: "fact:migration-probe",
      kind: "request_transfer",
      createdDate: state.date,
      source: { kind: "player_action", executionId: "action:probe", actionId: "PA_REQUEST_TRANSFER", optionId: "REQUEST" },
      payload: { club: "ESP_MADRID" }
    }]
  };

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
  assert.equal(state.playerActions.facts[0].payload.club, "ESP_VALENCIA");
  assert.equal(migrateFootballStateReferencesExplicitlyInPlace(state, mapping), 0);
});

test("DB-A4 catalog-version migration is explicit, idempotent and refuses pre-V2 guessing", () => {
  const v2 = createInitialState(408);
  v2.footballCatalogVersion = "world-v2-a1-2026-09-28";
  assert.equal(migrateFootballCatalogVersionInPlace(v2), true);
  assert.equal(v2.footballCatalogVersion, CURRENT_FOOTBALL_CATALOG_VERSION);
  assert.equal(migrateFootballCatalogVersionInPlace(v2), false);

  const legacy = createInitialState(409);
  delete legacy.footballCatalogVersion;
  assert.throws(
    () => migrateFootballCatalogVersionInPlace(legacy),
    /require an audited explicit legacy manifest/
  );
});

test("DB-A4 older V2 saves may retain historical fixtures without opponentClubId", () => {
  const probe = {
    footballCatalogVersion: "world-v2-a1-2026-09-28",
    club: "ESP_MADRID",
    professional: { ownerClub: "ESP_MADRID", registrationClub: "ESP_MADRID" },
    world: {
      ownerClub: "ESP_MADRID",
      sportMatchModel: {
        fixtures: [{ club: "Aurora CF", opponent: "SIM_OPP_TEST" }]
      }
    }
  };
  assert.equal(inspectFootballCatalogSaveReferences(probe), null);
});

test("DB-A4 historical fixture rows may omit opponentClubId; present IDs fail closed", () => {
  const probe = {
    footballCatalogVersion: CURRENT_FOOTBALL_CATALOG_VERSION,
    club: "ESP_MADRID",
    professional: { ownerClub: "ESP_MADRID", registrationClub: "ESP_MADRID" },
    world: {
      ownerClub: "ESP_MADRID",
      sportMatchModel: {
        fixtures: [{ club: "Aurora CF", opponent: "SIM_OPP_TEST" }]
      }
    }
  };
  assert.equal(inspectFootballCatalogSaveReferences(probe), null);
  probe.world.sportMatchModel.fixtures[0].opponentClubId = "ESP_FAKE_CLUB_999";
  const issue = inspectFootballCatalogSaveReferences(probe);
  assert.equal(issue?.path, "world.sportMatchModel.fixtures[0].opponentClubId");
});

test("DB-A4 current V2 keeps historical legacy provenance but rejects persisted aliases", () => {
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
  const issue = inspectFootballCatalogSaveReferences({ ...base, history: [{ club: "BIG_CLUB" }] });
  assert.equal(issue?.path, "history[0].club");
});

test("DB-A4 current Player Action club facts cannot persist legacy synthetic identities", () => {
  const probe = {
    footballCatalogVersion: CURRENT_FOOTBALL_CATALOG_VERSION,
    club: "ESP_MADRID",
    professional: { ownerClub: "ESP_MADRID", registrationClub: "ESP_MADRID" },
    world: { ownerClub: "ESP_MADRID" },
    playerActions: {
      facts: [{ payload: { club: "Aurora CF" } }]
    }
  };
  const issue = inspectFootballCatalogSaveReferences(probe);
  assert.equal(issue?.path, "playerActions.facts[0].payload.club");
});