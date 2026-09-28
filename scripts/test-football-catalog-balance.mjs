import test from "node:test";
import assert from "node:assert/strict";
import {
  FOOTBALL_CLUBS,
  FOOTBALL_DIVISIONS,
  FOOTBALL_CATALOG_VERSION,
  clubsForCountry,
  clubsForDivision,
  divisionsForCountry
} from "../dist/catalog/football/index.js";

const METRICS = [
  "prestige",
  "financialPower",
  "youthQuality",
  "developmentBias",
  "pressure",
  "internationalAttraction"
];

const range = (rows, key) => [
  Math.min(...rows.map(row => row[key])),
  Math.max(...rows.map(row => row[key]))
];

test("A2 catalog version identifies selector-affecting balance", () => {
  assert.equal(FOOTBALL_CATALOG_VERSION, "world-v2-a2-2026-09-28");
});

test("adjacent divisions in the same country do not invert football hierarchy", () => {
  const countries = [...new Set(FOOTBALL_DIVISIONS.map(division => division.countryCode))];

  for (const countryCode of countries) {
    const divisions = [...divisionsForCountry(countryCode)].sort((a, b) => a.tier - b.tier);
    for (let index = 0; index < divisions.length - 1; index += 1) {
      const upper = divisions[index];
      const lower = divisions[index + 1];
      const upperClubs = clubsForDivision(upper.id);
      const lowerClubs = clubsForDivision(lower.id);

      assert.ok(upper.strength > lower.strength, `${countryCode} strength tier ${upper.tier}/${lower.tier}`);

      for (const metric of METRICS) {
        const [upperMin] = range(upperClubs, metric);
        const [, lowerMax] = range(lowerClubs, metric);
        assert.ok(
          upperMin > lowerMax,
          `${countryCode} ${metric}: tier ${upper.tier} min=${upperMin} must exceed tier ${lower.tier} max=${lowerMax}`
        );
      }
    }
  }
});

test("league-strength anchors remain differentiated", () => {
  const strength = id => FOOTBALL_DIVISIONS.find(division => division.id === id)?.strength;
  assert.equal(strength("ENG_D1"), 92);
  assert.equal(strength("ESP_D1"), 88);
  assert.equal(strength("ARG_D1"), 75);
  assert.equal(strength("TUR_D1"), 73);
  assert.equal(strength("JPN_D1"), 69);
  assert.equal(strength("USA_D1"), 68);
  assert.equal(strength("NOR_D1"), 61);
  assert.equal(strength("CHN_D1"), 60);
  assert.equal(strength("MAR_D1"), 58);
  assert.equal(strength("ZAF_D1"), 55);
});

test("all eight design archetypes exist without one swallowing the catalog", () => {
  const counts = new Map();
  for (const club of FOOTBALL_CLUBS) {
    assert.ok(club.archetypes.length >= 1 && club.archetypes.length <= 2, club.id);
    assert.equal(new Set(club.archetypes).size, club.archetypes.length, club.id);
    for (const archetype of club.archetypes) counts.set(archetype, (counts.get(archetype) ?? 0) + 1);
  }

  const expected = [
    "continental","development","selling","historic",
    "high_pressure","community","technical","physical"
  ];
  for (const archetype of expected) {
    assert.ok((counts.get(archetype) ?? 0) >= 20, `${archetype} underrepresented`);
    assert.ok((counts.get(archetype) ?? 0) <= FOOTBALL_CLUBS.length * 0.60, `${archetype} dominates catalog`);
  }
});

test("continental profile is reserved for credible first-division clubs", () => {
  const continental = FOOTBALL_CLUBS.filter(club => club.archetypes.includes("continental"));
  assert.ok(continental.length >= 20);
  for (const club of continental) {
    assert.equal(club.tier, 1, club.id);
    assert.ok(club.prestige >= 80, `${club.id} prestige=${club.prestige}`);
    assert.ok(club.internationalAttraction >= 76, `${club.id} international=${club.internationalAttraction}`);
  }
});

test("selling and community profiles correspond to plausible resource contexts", () => {
  const selling = FOOTBALL_CLUBS.filter(club => club.archetypes.includes("selling"));
  const community = FOOTBALL_CLUBS.filter(club => club.archetypes.includes("community"));
  assert.ok(selling.length >= 20);
  assert.ok(community.length >= 20);

  const avg = (rows, key) => rows.reduce((sum, row) => sum + row[key], 0) / rows.length;
  assert.ok(avg(selling, "developmentBias") >= 65);
  assert.ok(avg(selling, "youthQuality") >= 65);
  assert.ok(avg(community, "pressure") < avg(FOOTBALL_CLUBS, "pressure"));
  assert.ok(avg(community, "financialPower") < avg(FOOTBALL_CLUBS, "financialPower"));
});

test("country indexes still cover every club exactly once after calibration", () => {
  const countries = [...new Set(FOOTBALL_DIVISIONS.map(division => division.countryCode))];
  const indexed = countries.flatMap(countryCode => [...clubsForCountry(countryCode)]);
  assert.equal(indexed.length, FOOTBALL_CLUBS.length);
  assert.equal(new Set(indexed.map(club => club.id)).size, FOOTBALL_CLUBS.length);
});
