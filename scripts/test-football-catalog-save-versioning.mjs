import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import { FOOTBALL_CLUBS } from "../dist/catalog/football/index.js";
import { createInitialState } from "../dist/content/initial-state.js";
import { executePlayerActionInPlace } from "../dist/player-actions/index.js";
import {
  CURRENT_FOOTBALL_CATALOG_VERSION,
  PRE_FOOTBALL_CATALOG_VERSION,
  footballCatalogVersionOf,
  migrateFootballClubReferenceExplicitly
} from "../dist/save/football-catalog-version.js";
import { loadSave, serializeSave } from "../dist/save/save.js";

const invalid = error => error?.code === "INVALID_SAVE";

test("DB-A4 new saves persist catalog version independently from schemaVersion", () => {
  const state = createInitialState(9401);
  assert.equal(state.schemaVersion, 8);
  assert.equal(state.footballCatalogVersion, CURRENT_FOOTBALL_CATALOG_VERSION);
  const parsed = JSON.parse(serializeSave(state));
  assert.equal(parsed.schemaVersion, 8);
  assert.equal(parsed.footballCatalogVersion, CURRENT_FOOTBALL_CATALOG_VERSION);
});

test("DB-A4 missing metadata remains exact pre-catalog compatibility and is not auto-upgraded", () => {
  const raw = fs.readFileSync("examples/save-v08-seed-424242.json", "utf8");
  const original = JSON.parse(raw);
  assert.equal(Object.prototype.hasOwnProperty.call(original, "footballCatalogVersion"), false);

  const loaded = loadSave(raw);
  assert.equal(Object.prototype.hasOwnProperty.call(loaded, "footballCatalogVersion"), false);
  assert.equal(footballCatalogVersionOf(loaded.footballCatalogVersion), PRE_FOOTBALL_CATALOG_VERSION);
  assert.deepEqual(loaded, original);
  assert.deepEqual(JSON.parse(serializeSave(loaded)), original);
});

test("DB-A4 pre-catalog active legacy identities remain loadable without heuristic migration", () => {
  const state = createInitialState(9402);
  delete state.footballCatalogVersion;
  state.club = "Aurora CF";
  state.professional.ownerClub = "Aurora CF";
  state.professional.registrationClub = "Aurora CF";
  state.world.ownerClub = "Aurora CF";

  const loaded = loadSave(JSON.stringify(state));
  assert.equal(loaded.club, "Aurora CF");
  assert.equal(loaded.professional.ownerClub, "Aurora CF");
  assert.equal(loaded.professional.registrationClub, "Aurora CF");
  assert.equal(Object.prototype.hasOwnProperty.call(loaded, "footballCatalogVersion"), false);
});

test("DB-A4 current V2 active state rejects legacy and unknown V2-shaped identities", () => {
  for (const invalidClub of ["Aurora CF", "ESP_FAKE_CLUB_999", "BIG_CLUB"]) {
    const state = createInitialState(9403);
    state.club = invalidClub;
    state.professional.ownerClub = invalidClub;
    state.professional.registrationClub = invalidClub;
    state.world.ownerClub = invalidClub;
    assert.throws(() => loadSave(JSON.stringify(state)), invalid, invalidClub);
  }
});

test("DB-A4 current V2 historical provenance may retain explicit legacy compatibility IDs", () => {
  const state = createInitialState(9404);
  state.history.push({
    eventId: "LEGACY_EVENT",
    choiceId: "A",
    outcomeId: "O1",
    date: state.date,
    season: state.season,
    club: "Aurora CF",
    snapshot: {},
    salience: 1,
    visibility: "private"
  });
  const loaded = loadSave(serializeSave(state));
  assert.equal(loaded.history.at(-1).club, "Aurora CF");

  state.history[0].club = "BIG_CLUB";
  assert.throws(() => serializeSave(state), invalid);
});

test("DB-A4 ownerClub and registrationClub remain independent during a loan", () => {
  const owner = FOOTBALL_CLUBS[0].id;
  const registration = FOOTBALL_CLUBS.find(club => club.id !== owner).id;
  const state = createInitialState(9405);
  state.club = registration;
  state.professional.ownerClub = owner;
  state.professional.registrationClub = registration;
  state.professional.route = "loan";
  state.world.ownerClub = owner;
  state.flags.LOAN_ACTIVE = true;
  state.employment.status = "loaned";

  const loaded = loadSave(serializeSave(state));
  assert.equal(loaded.club, registration);
  assert.equal(loaded.professional.ownerClub, owner);
  assert.equal(loaded.professional.registrationClub, registration);
  assert.notEqual(loaded.professional.ownerClub, loaded.professional.registrationClub);
});

test("DB-A4 rejects unsupported catalog versions without changing schemaVersion", () => {
  const state = createInitialState(9406);
  state.footballCatalogVersion = "world-v999-future";
  assert.throws(() => loadSave(JSON.stringify(state)), invalid);
  assert.equal(state.schemaVersion, 8);
});

test("DB-A4 Player Actions club-scoped facts validate as V2 references", () => {
  const state = createInitialState(9407);
  const result = executePlayerActionInPlace(state, {
    actionId: "PA_COACH_TALK",
    optionId: "MORE_MINUTES",
    targetId: "NPC_CCH_01"
  });
  assert.equal(result.ok, true);
  const fact = state.playerActions.facts.find(row => row.kind === "request_more_minutes");
  assert.equal(fact.payload.club, "UDV");
  assert.doesNotThrow(() => serializeSave(state));

  fact.payload.club = "ESP_FAKE_CLUB_999";
  assert.throws(() => serializeSave(state), invalid);
});

test("DB-A4 explicit future migration primitive maps only exact IDs and honors tombstones", () => {
  const target = FOOTBALL_CLUBS[0].id;
  assert.equal(migrateFootballClubReferenceExplicitly("OLD_EXACT_ID", { OLD_EXACT_ID: target }), target);
  assert.equal(migrateFootballClubReferenceExplicitly("UNMAPPED", { OLD_EXACT_ID: target }), "UNMAPPED");
  assert.throws(
    () => migrateFootballClubReferenceExplicitly("OLD_REMOVED", { OLD_REMOVED: null }),
    /tombstoned/
  );
  assert.throws(
    () => migrateFootballClubReferenceExplicitly("OLD_BAD", { OLD_BAD: "BIG_CLUB" }),
    /not a current football identity/
  );
});
