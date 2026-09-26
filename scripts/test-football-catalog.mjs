import test from "node:test";
import assert from "node:assert/strict";
import {
  FOOTBALL_CLUBS,
  FOOTBALL_DIVISIONS,
  FOOTBALL_CATALOG_VERSION,
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
  BEL: 32,
  USA: 30,
  MEX: 18,
  ARG: 30,
  JPN: 20,
  CHN: 16,
  TUR: 18,
  NOR: 16,
  MAR: 16,
  ZAF: 16
});

const EXPECTED_CONFEDERATION_COUNTS = Object.freeze({
  UEFA: 382,
  CONCACAF: 48,
  CONMEBOL: 30,
  AFC: 36,
  CAF: 32
});

test("world football catalog has the expected first-wave scope", () => {
  assert.equal(FOOTBALL_CLUBS.length, 528);
  assert.equal(FOOTBALL_DIVISIONS.length, 27);
  assert.equal(FOOTBALL_CATALOG_VERSION, "world-v1-2026-09-26");

  for (const [countryCode, count] of Object.entries(EXPECTED_COUNTRY_COUNTS)) {
    assert.equal(clubsForCountry(countryCode).length, count, countryCode);
  }

  for (const [confederation, count] of Object.entries(EXPECTED_CONFEDERATION_COUNTS)) {
    assert.equal(
      FOOTBALL_CLUBS.filter(club => club.confederation === confederation).length,
      count,
      confederation
    );
  }
});

test("club and division identities are unique, stable and structurally valid", () => {
  assert.equal(new Set(FOOTBALL_CLUBS.map(club => club.id)).size, FOOTBALL_CLUBS.length);
  assert.equal(new Set(FOOTBALL_CLUBS.map(club => club.name)).size, FOOTBALL_CLUBS.length);
  assert.equal(new Set(FOOTBALL_DIVISIONS.map(division => division.id)).size, FOOTBALL_DIVISIONS.length);

  for (const stableId of ["ESP_MADRID","USA_NEW_YORK","MEX_CIUDAD_DE_MEXICO","ARG_BUENOS_AIRES","JPN_TOKYO","CHN_BEIJING","TUR_ISTANBUL","NOR_OSLO","MAR_CASABLANCA","ZAF_JOHANNESBURG"]) {
    assert.ok(clubById(stableId), stableId);
    assert.equal(/_D\d/.test(stableId), false);
  }

  for (const division of FOOTBALL_DIVISIONS) {
    assert.equal(divisionById(division.id), division);
    assert.equal(clubsForDivision(division.id).length, division.clubCount, division.id);
    assert.ok(Number.isInteger(division.strength), division.id);
    assert.ok(division.strength >= 0 && division.strength <= 100, division.id);
  }

  for (const club of FOOTBALL_CLUBS) {
    const division = divisionById(club.divisionId);
    assert.ok(division, club.divisionId);
    assert.equal(club.countryCode, division.countryCode);
    assert.equal(club.country, division.country);
    assert.equal(club.confederation, division.confederation);
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
  assert.ok(Object.isFrozen(FOOTBALL_CLUBS));
  assert.ok(Object.isFrozen(FOOTBALL_DIVISIONS));
});

test("game-design league strength keeps distinct football markets distinct", () => {
  assert.equal(divisionById("ENG_D1").strength, 92);
  assert.equal(divisionById("ESP_D1").strength, 88);
  assert.equal(divisionById("ARG_D1").strength, 75);
  assert.equal(divisionById("TUR_D1").strength, 73);
  assert.equal(divisionById("USA_D1").strength, 68);
  assert.equal(divisionById("JPN_D1").strength, 69);
  assert.equal(divisionById("CHN_D1").strength, 60);
  assert.equal(divisionById("NOR_D1").strength, 61);
  assert.equal(divisionById("MAR_D1").strength, 58);
  assert.equal(divisionById("ZAF_D1").strength, 55);
});

test("working names avoid obvious official club identities", () => {
  const forbidden = [
    "real madrid","fc barcelona","atletico de madrid","athletic club",
    "manchester united","manchester city","liverpool fc","arsenal","chelsea","tottenham hotspur",
    "juventus","inter milan","ac milan","bayern munich","borussia dortmund","paris saint-germain",
    "benfica","sporting clube","ajax",
    "inter miami","la galaxy","new york city fc",
    "club america","chivas","monterrey",
    "boca juniors","river plate","racing club",
    "urawa reds","kashima antlers","vissel kobe",
    "beijing guoan","shanghai port",
    "galatasaray","fenerbahce","besiktas",
    "rosenborg","bodo/glimt",
    "wydad","raja casablanca",
    "kaizer chiefs","orlando pirates","mamelodi sundowns"
  ];
  for (const club of FOOTBALL_CLUBS) {
    const normalized = club.name.toLowerCase();
    for (const identity of forbidden) {
      assert.equal(normalized.includes(identity), false, `${club.name} resembles ${identity}`);
    }
  }
});

test("fictional division labels avoid current official competition brands", () => {
  const forbidden = [
    "laliga","la liga","premier league","championship","league one","serie a","serie b",
    "bundesliga","ligue 1","eredivisie","primeira liga","jupiler",
    "major league soccer","mls","liga mx","liga profesional",
    "j1 league","j1","chinese super league","csl","süper lig","super lig",
    "eliteserien","botola","premiership"
  ];
  for (const division of FOOTBALL_DIVISIONS) {
    const normalized = division.name.toLowerCase();
    for (const identity of forbidden) {
      assert.equal(normalized.includes(identity), false, `${division.name} resembles ${identity}`);
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
