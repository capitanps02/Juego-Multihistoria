import assert from "node:assert/strict";
import { FOOTBALL_CLUBS, FOOTBALL_DIVISIONS, clubById } from "../dist/catalog/football/index.js";
import { selectFixtureOpponent } from "../dist/catalog/football/fixture-opponent.js";
import {
  selectForeignMarketDestination,
  selectMarketDestination
} from "../dist/catalog/football/market-destination.js";

const profiles = ["development","balanced","ambitious"];
let fixtureSelections = 0;
let marketSelections = 0;
let foreignSelections = 0;

for (let i = 0; i < 12000; i += 1) {
  const source = FOOTBALL_CLUBS[i % FOOTBALL_CLUBS.length];
  const fingerprint = Math.imul(i + 1, 2654435761) >>> 0;
  const context = {
    registrationClub: source.id,
    leagueTier: source.tier,
    route: "domestic",
    abroad: false,
    selectionFingerprint: fingerprint
  };
  const a = selectFixtureOpponent(context);
  const b = selectFixtureOpponent(context);
  assert.deepEqual(a, b, `fixture replay ${i}`);
  assert.ok(clubById(a.clubId), `unknown fixture opponent ${a.clubId}`);
  assert.notEqual(a.clubId, source.id, `self fixture ${source.id}`);
  fixtureSelections += 1;
}

for (let i = 0; i < 12000; i += 1) {
  const source = FOOTBALL_CLUBS[i % FOOTBALL_CLUBS.length];
  const profile = profiles[i % profiles.length];
  const request = {
    countryCode: source.countryCode,
    leagueTier: source.tier,
    roll: Math.imul(i + 17, 2246822519) >>> 0,
    profile,
    excludeClubIds: [source.id]
  };
  const a = selectMarketDestination(request);
  const b = selectMarketDestination(request);
  assert.equal(a.id, b.id, `market replay ${i}`);
  assert.ok(clubById(a.id), `invalid market destination ${a.id}`);
  assert.notEqual(a.id, source.id, `self transfer ${source.id}`);
  assert.equal(a.countryCode, source.countryCode, `domestic country drift ${i}`);
  marketSelections += 1;
}

for (let i = 0; i < 12000; i += 1) {
  const source = FOOTBALL_CLUBS[i % FOOTBALL_CLUBS.length];
  const request = {
    leagueTier: source.tier,
    roll: Math.imul(i + 31, 3266489917) >>> 0,
    profile: profiles[(i + 1) % profiles.length],
    excludeClubIds: [source.id]
  };
  const a = selectForeignMarketDestination(request);
  const b = selectForeignMarketDestination(request);
  assert.equal(a.id, b.id, `foreign replay ${i}`);
  assert.ok(clubById(a.id), `invalid foreign destination ${a.id}`);
  assert.notEqual(a.id, source.id, `foreign self transfer ${source.id}`);
  assert.notEqual(a.countryCode, "ESP", `foreign selector returned ESP at ${i}`);
  foreignSelections += 1;
}

assert.ok(FOOTBALL_DIVISIONS.length > 0);
console.log("DB-A7 — PASS 3 STRESS");
console.log("FIXTURE STRESS:", fixtureSelections, "PASS");
console.log("MARKET STRESS:", marketSelections, "PASS");
console.log("FOREIGN MARKET STRESS:", foreignSelections, "PASS");
console.log("INVALID DESTINATIONS: 0");
console.log("SELF TRANSFERS: 0");
