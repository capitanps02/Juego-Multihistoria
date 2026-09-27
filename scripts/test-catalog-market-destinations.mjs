import test from "node:test";
import assert from "node:assert/strict";
import { clubById, nearestDivisionForCountry } from "../dist/catalog/football/index.js";
import { selectMarketDestination } from "../dist/catalog/football/market-destination.js";

test("market destination selector is deterministic and always returns a catalog club", () => {
  const input = { countryCode: "ESP", leagueTier: 3, roll: 123456789, profile: "balanced" };
  const a = selectMarketDestination(input);
  const b = selectMarketDestination(input);
  assert.equal(a.id, b.id);
  assert.equal(clubById(a.id), a);
  assert.equal(a.countryCode, "ESP");
});

test("development, balanced and ambitious profiles remain inside the requested country context", () => {
  for (const profile of ["development", "balanced", "ambitious"]) {
    for (const [countryCode, tier] of [["ESP", 3], ["ENG", 1], ["ARG", 1], ["JPN", 1], ["MAR", 1]]) {
      const club = selectMarketDestination({
        countryCode,
        leagueTier: tier,
        roll: 99887766,
        profile
      });
      assert.equal(club.countryCode, countryCode, `${countryCode}/${profile}`);
      assert.ok(clubById(club.id));
    }
  }
});

test("market selector respects explicit club exclusions", () => {
  const first = selectMarketDestination({
    countryCode: "ESP",
    leagueTier: 2,
    roll: 1,
    profile: "balanced"
  });
  const second = selectMarketDestination({
    countryCode: "ESP",
    leagueTier: 2,
    roll: 1,
    profile: "balanced",
    excludeClubIds: [first.id]
  });
  assert.notEqual(second.id, first.id);
});

test("unrepresented live tier uses nearest catalog division without changing the requested career tier", () => {
  const nearest = nearestDivisionForCountry("ESP", 4);
  assert.ok(nearest);
  assert.equal(nearest.id, "ESP_D3");
  const club = selectMarketDestination({
    countryCode: "ESP",
    leagueTier: 4,
    roll: 20260926,
    profile: "development"
  });
  assert.equal(club.divisionId, "ESP_D3");
  assert.equal(club.countryCode, "ESP");
});

test("different deterministic rolls can address the candidate pool without synthetic destination IDs", () => {
  const ids = new Set();
  for (let roll = 0; roll < 64; roll += 1) {
    const club = selectMarketDestination({
      countryCode: "ESP",
      leagueTier: 3,
      roll,
      profile: "balanced"
    });
    assert.doesNotMatch(club.id, /^(Development|Domestic|Summer|Foreign|Loan)_/);
    ids.add(club.id);
  }
  assert.ok(ids.size >= 6);
});
