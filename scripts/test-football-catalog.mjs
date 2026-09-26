import test from "node:test";
import assert from "node:assert/strict";
import {
  EUROPEAN_CLUBS,
  EUROPEAN_DIVISIONS,
  EUROPEAN_FOOTBALL_CATALOG_VERSION,
  clubById,
  clubsForCountry,
  clubsForDivision,
  divisionById
} from "../dist/catalog/football/index.js";

const EXPECTED_COUNTRY_COUNTS = Object.freeze({
  ESP: 62,
  ENG: 68,
  ITA: 40,
  DEU: 36,
  FRA: 36,
  PRT: 36,
  NLD: 38,
  BEL: 32
});

test("European football catalog has the expected first-wave scope", () => {
  assert.equal(EUROPEAN_CLUBS.length, 348);
  assert.equal(EUROPEAN_DIVISIONS.length, 18);
  assert.equal(EUROPEAN_FOOTBALL_CATALOG_VERSION, "europe-v1-2026-09-26");
  for (const [countryCode, count] of Object.entries(EXPECTED_COUNTRY_COUNTS)) {
    assert.equal(clubsForCountry(countryCode).length, count, countryCode);
  }
});

test("club and division identities are unique, stable and structurally valid", () => {
  assert.equal(new Set(EUROPEAN_CLUBS.map(club => club.id)).size, EUROPEAN_CLUBS.length);
  assert.equal(new Set(EUROPEAN_CLUBS.map(club => club.name)).size, EUROPEAN_CLUBS.length);
  assert.equal(new Set(EUROPEAN_DIVISIONS.map(division => division.id)).size, EUROPEAN_DIVISIONS.length);
  assert.ok(clubById("ESP_MADRID"));
  assert.equal(clubById("ESP_MADRID").city, "Madrid");
  assert.equal(clubById("ESP_MADRID").id.includes("_D1"), false);

  for (const division of EUROPEAN_DIVISIONS) {
    assert.equal(divisionById(division.id), division);
    assert.equal(clubsForDivision(division.id).length, division.clubCount, division.id);
  }

  for (const club of EUROPEAN_CLUBS) {
    const division = divisionById(club.divisionId);
    assert.ok(division, club.divisionId);
    assert.equal(club.countryCode, division.countryCode);
    assert.equal(club.country, division.country);
    assert.equal(club.tier, division.tier);
    assert.ok(club.city.length > 1);
    assert.ok(club.name.includes(club.city));
    assert.ok(club.shortName.length <= 22, `${club.id} shortName=${club.shortName}`);
    assert.equal(club.clearanceStatus, "working_name_unchecked");
    assert.ok(Object.isFrozen(club), club.id);
    assert.ok(Object.isFrozen(club.archetypes), club.id);
    for (const field of ["prestige","financialPower","youthQuality","developmentBias","pressure","internationalAttraction"]) {
      assert.ok(Number.isInteger(club[field]), `${club.id} ${field}`);
      assert.ok(club[field] >= 0 && club[field] <= 100, `${club.id} ${field}`);
    }
  }
  assert.ok(Object.isFrozen(EUROPEAN_CLUBS));
  assert.ok(Object.isFrozen(EUROPEAN_DIVISIONS));
});

test("working names avoid obvious official club identities", () => {
  const forbidden = [
    "real madrid",
    "fc barcelona",
    "atletico de madrid",
    "athletic club",
    "manchester united",
    "manchester city",
    "liverpool fc",
    "arsenal",
    "chelsea",
    "tottenham hotspur",
    "west ham united",
    "juventus",
    "inter milan",
    "ac milan",
    "bayern munich",
    "borussia dortmund",
    "paris saint-germain",
    "olympique de marseille",
    "benfica",
    "sporting clube",
    "ajax"
  ];
  for (const club of EUROPEAN_CLUBS) {
    const normalized = club.name.toLowerCase();
    for (const identity of forbidden) {
      assert.equal(normalized.includes(identity), false, `${club.name} resembles ${identity}`);
    }
  }
});

test("fictional division labels avoid current official competition brands", () => {
  const forbidden = [
    "laliga",
    "la liga",
    "premier league",
    "championship",
    "league one",
    "serie a",
    "serie b",
    "bundesliga",
    "ligue 1",
    "eredivisie",
    "primeira liga",
    "jupiler"
  ];
  for (const division of EUROPEAN_DIVISIONS) {
    const normalized = division.name.toLowerCase();
    for (const identity of forbidden) {
      assert.equal(normalized.includes(identity), false, `${division.name} resembles ${identity}`);
    }
  }
});

test("catalog exposes no real-club equivalence field", () => {
  for (const club of EUROPEAN_CLUBS) {
    for (const key of Object.keys(club)) {
      assert.equal(/real.?club|official.?club|source.?club|inspired.?by/i.test(key), false, `${club.id} leaks ${key}`);
    }
  }
});
