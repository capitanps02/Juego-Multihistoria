import test from "node:test";
import assert from "node:assert/strict";
import {
  EUROPEAN_CLUBS,
  EUROPEAN_DIVISIONS,
  EUROPEAN_FOOTBALL_CATALOG_VERSION
} from "../dist/catalog/football/index.js";

test("European football catalog has the expected first-wave scope", () => {
  assert.equal(EUROPEAN_CLUBS.length, 348);
  assert.equal(EUROPEAN_DIVISIONS.length, 18);
  assert.equal(EUROPEAN_FOOTBALL_CATALOG_VERSION, "europe-v1-2026-09-26");
});

test("club and division identities are unique and structurally valid", () => {
  assert.equal(new Set(EUROPEAN_CLUBS.map(club => club.id)).size, EUROPEAN_CLUBS.length);
  assert.equal(new Set(EUROPEAN_CLUBS.map(club => club.name)).size, EUROPEAN_CLUBS.length);
  assert.equal(new Set(EUROPEAN_DIVISIONS.map(division => division.id)).size, EUROPEAN_DIVISIONS.length);

  for (const division of EUROPEAN_DIVISIONS) {
    assert.equal(
      EUROPEAN_CLUBS.filter(club => club.divisionId === division.id).length,
      division.clubCount,
      division.id
    );
  }

  for (const club of EUROPEAN_CLUBS) {
    assert.ok(club.city.length > 1);
    assert.ok(club.name.includes(club.city));
    assert.equal(club.clearanceStatus, "working_name_unchecked");
    for (const field of ["prestige","financialPower","youthQuality","developmentBias","pressure","internationalAttraction"]) {
      assert.ok(Number.isInteger(club[field]), `${club.id} ${field}`);
      assert.ok(club[field] >= 0 && club[field] <= 100, `${club.id} ${field}`);
    }
  }
});

test("working names avoid obvious official identities", () => {
  const forbidden = [
    "real madrid",
    "fc barcelona",
    "manchester united",
    "manchester city",
    "liverpool fc",
    "arsenal",
    "chelsea",
    "juventus",
    "inter milan",
    "ac milan",
    "bayern",
    "paris saint-germain",
    "psg"
  ];
  for (const club of EUROPEAN_CLUBS) {
    const normalized = club.name.toLowerCase();
    for (const identity of forbidden) {
      assert.equal(normalized.includes(identity), false, `${club.name} resembles ${identity}`);
    }
  }
});
