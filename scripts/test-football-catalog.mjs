import test from "node:test";
import assert from "node:assert/strict";
import {
  FOOTBALL_CLUBS,
  FOOTBALL_DIVISIONS,
  FOOTBALL_CATALOG_VERSION,
  assertLoadableFootballClubReference,
  assertNewFootballClubReference,
  classifyFootballClubReference,
  clubById,
  clubsForCountry,
  clubsForDivision,
  divisionById,
  divisionsForCountry,
  inspectFootballCatalog,
  isLoadableFootballClubReference,
  isNewFootballClubReference,
  nearestDivisionForCountry
} from "../dist/catalog/football/index.js";

const EXPECTED_COUNTRY_COUNTS = Object.freeze({
  ESP: 62, ENG: 68, ITA: 40, DEU: 36, FRA: 36, PRT: 36, NLD: 38, BEL: 32,
  USA: 30, MEX: 18, ARG: 30, JPN: 20, CHN: 16, TUR: 18, NOR: 16, MAR: 16, ZAF: 16
});

const EXPECTED_CONFEDERATION_COUNTS = Object.freeze({
  UEFA: 382, CONCACAF: 48, CONMEBOL: 30, AFC: 36, CAF: 32
});

test("world football catalog keeps the first-wave structural scope", () => {
  assert.equal(FOOTBALL_CLUBS.length, 528);
  assert.equal(FOOTBALL_DIVISIONS.length, 27);
  assert.equal(FOOTBALL_CATALOG_VERSION, "world-v2-a2-2026-09-28");

  for (const [countryCode, count] of Object.entries(EXPECTED_COUNTRY_COUNTS)) {
    assert.equal(clubsForCountry(countryCode).length, count, countryCode);
    assert.ok(Object.isFrozen(clubsForCountry(countryCode)), countryCode);
    assert.ok(divisionsForCountry(countryCode).length > 0, countryCode);
  }

  for (const [confederation, count] of Object.entries(EXPECTED_CONFEDERATION_COUNTS)) {
    assert.equal(FOOTBALL_CLUBS.filter(club => club.confederation === confederation).length, count, confederation);
  }
});

test("catalog integrity inspector is clean and indexes are stable", () => {
  assert.deepEqual(inspectFootballCatalog(), []);
  assert.equal(new Set(FOOTBALL_CLUBS.map(club => club.id)).size, FOOTBALL_CLUBS.length);
  assert.equal(new Set(FOOTBALL_DIVISIONS.map(division => division.id)).size, FOOTBALL_DIVISIONS.length);

  for (const stableId of [
    "ESP_MADRID","USA_NEW_YORK","MEX_CIUDAD_DE_MEXICO","ARG_BUENOS_AIRES",
    "JPN_TOKYO","CHN_BEIJING","TUR_ISTANBUL","NOR_OSLO","MAR_CASABLANCA","ZAF_JOHANNESBURG"
  ]) {
    assert.ok(clubById(stableId), stableId);
    assert.equal(/_D\d/.test(stableId), false);
  }

  for (const division of FOOTBALL_DIVISIONS) {
    assert.equal(divisionById(division.id), division);
    assert.equal(clubsForDivision(division.id).length, division.clubCount, division.id);
    assert.ok(Object.isFrozen(clubsForDivision(division.id)), division.id);
  }

  assert.equal(nearestDivisionForCountry("ESP", 1)?.id, "ESP_D1");
  assert.equal(nearestDivisionForCountry("ESP", 9)?.id, "ESP_D3");
});

test("reference classifier separates V2 production from compatibility", () => {
  assert.equal(classifyFootballClubReference("ESP_MADRID").kind, "catalog");
  assert.equal(classifyFootballClubReference("UDV").kind, "canonical_special");

  for (const alias of [
    "NEW_CLUB","DEVELOPMENT_CLUB","DEVELOPMENT_CLUB_2","HIGHER_CLUB","BIG_CLUB","FOREIGN_DEV_CLUB"
  ]) {
    assert.equal(classifyFootballClubReference(alias).kind, "narrative_alias", alias);
    assert.equal(isLoadableFootballClubReference(alias), true, alias);
    assert.equal(isNewFootballClubReference(alias), false, alias);
  }

  for (const legacy of [
    "Aurora CF","SIM_OPP_3_02","SIM_OPP_TEST","Development_4_29","Domestic_2_01",
    "Summer_2_12","Foreign_1_02","Loan_3_14","Club 3 · 4"
  ]) {
    assert.equal(classifyFootballClubReference(legacy).kind, "legacy_compat", legacy);
    assert.equal(isLoadableFootballClubReference(legacy), true, legacy);
    assert.equal(isNewFootballClubReference(legacy), false, legacy);
    assert.doesNotThrow(() => assertLoadableFootballClubReference(legacy, "legacy"));
    assert.throws(() => assertNewFootballClubReference(legacy, "new"), /new V2 production requires/);
  }

  assert.equal(isNewFootballClubReference("ESP_MADRID"), true);
  assert.equal(isNewFootballClubReference("UDV"), true);
  assert.doesNotThrow(() => assertNewFootballClubReference("ESP_MADRID"));
  assert.doesNotThrow(() => assertNewFootballClubReference("UDV"));
});

test("unknown club identities fail closed for load and new V2 production", () => {
  const invalid = "ESP_FAKE_CLUB_999";
  assert.equal(classifyFootballClubReference(invalid).kind, "invalid");
  assert.equal(isLoadableFootballClubReference(invalid), false);
  assert.equal(isNewFootballClubReference(invalid), false);
  assert.throws(() => assertLoadableFootballClubReference(invalid, "state.club"), /unknown football club identity/);
  assert.throws(() => assertNewFootballClubReference(invalid, "state.club"), /new V2 production requires/);
});

test("club and division metadata remain immutable and bounded", () => {
  for (const division of FOOTBALL_DIVISIONS) {
    assert.ok(Number.isInteger(division.strength), division.id);
    assert.ok(division.strength >= 0 && division.strength <= 100, division.id);
    assert.ok(Object.isFrozen(division), division.id);
  }

  for (const club of FOOTBALL_CLUBS) {
    const division = divisionById(club.divisionId);
    assert.ok(division, club.divisionId);
    assert.equal(club.countryCode, division.countryCode);
    assert.equal(club.country, division.country);
    assert.equal(club.confederation, division.confederation);
    assert.equal(club.tier, division.tier);
    assert.ok(club.city.length > 1);
    assert.ok(club.name.length > 1);
    assert.ok(club.shortName.length > 0 && club.shortName.length <= 22, club.id);
    assert.equal(club.clearanceStatus, "working_name_unchecked");
    assert.ok(Object.isFrozen(club), club.id);
    assert.ok(Object.isFrozen(club.archetypes), club.id);
    for (const field of ["prestige","financialPower","youthQuality","developmentBias","pressure","internationalAttraction"]) {
      assert.ok(Number.isInteger(club[field]), `${club.id} ${field}`);
      assert.ok(club[field] >= 0 && club[field] <= 100, `${club.id} ${field}`);
    }
  }
});

test("catalog exposes no real-club equivalence field", () => {
  for (const club of FOOTBALL_CLUBS) {
    for (const key of Object.keys(club)) {
      assert.equal(/real.?club|official.?club|source.?club|inspired.?by/i.test(key), false, `${club.id} leaks ${key}`);
    }
  }
});
