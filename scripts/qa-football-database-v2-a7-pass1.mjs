import assert from "node:assert/strict";
import * as football from "../dist/catalog/football/index.js";

const required = [
  "FOOTBALL_CLUBS",
  "FOOTBALL_DIVISIONS",
  "inspectFootballCatalog",
  "inspectFootballCatalogData",
  "classifyFootballClubReference",
  "isLoadableFootballClubReference",
  "isNewFootballClubReference"
];

for (const name of required) {
  assert.ok(name in football, `DB-A7 Pass 1 requires final A1 API export: ${name}`);
}

const {
  FOOTBALL_CLUBS,
  FOOTBALL_DIVISIONS,
  inspectFootballCatalog,
  inspectFootballCatalogData,
  classifyFootballClubReference,
  isLoadableFootballClubReference,
  isNewFootballClubReference
} = football;

function cloneCatalog() {
  return {
    clubs: FOOTBALL_CLUBS.map(club => ({ ...club, archetypes: [...club.archetypes] })),
    divisions: FOOTBALL_DIVISIONS.map(division => ({ ...division }))
  };
}

function expectIssue(label, mutate, pattern) {
  const data = cloneCatalog();
  mutate(data);
  const issues = inspectFootballCatalogData(data.clubs, data.divisions);
  assert.ok(
    issues.some(issue => pattern.test(`${issue.path}: ${issue.reason}`)),
    `${label} was not rejected: ${JSON.stringify(issues)}`
  );
}

assert.deepEqual(inspectFootballCatalog(), [], "active catalog must be structurally clean");

assert.equal(new Set(FOOTBALL_CLUBS.map(club => club.id)).size, FOOTBALL_CLUBS.length, "club IDs must be unique");
assert.equal(new Set(FOOTBALL_DIVISIONS.map(row => row.id)).size, FOOTBALL_DIVISIONS.length, "division IDs must be unique");

for (const club of FOOTBALL_CLUBS) {
  assert.equal(typeof club.name, "string");
  assert.ok(club.name.trim().length > 0, `${club.id}: invalid name`);
  assert.equal(typeof club.shortName, "string");
  assert.ok(club.shortName.length >= 1 && club.shortName.length <= 22, `${club.id}: invalid shortName`);
  assert.ok(Number.isInteger(club.tier) && club.tier >= 1, `${club.id}: invalid tier`);
  for (const field of ["prestige","financialPower","youthQuality","developmentBias","pressure","internationalAttraction"]) {
    assert.ok(Number.isInteger(club[field]) && club[field] >= 0 && club[field] <= 100, `${club.id}: invalid ${field}`);
  }
}

expectIssue("duplicate club ID", ({ clubs }) => { clubs[1].id = clubs[0].id; }, /duplicate club id/);
expectIssue("invalid division", ({ clubs }) => { clubs[0].divisionId = "ESP_D99"; }, /unknown division/);
expectIssue("invalid country", ({ clubs }) => { clubs[0].countryCode = "XXX"; }, /unknown country code|country mismatch/);
expectIssue("invalid tier", ({ clubs }) => { clubs[0].tier = 0; }, /invalid tier|division tier mismatch/);
expectIssue("invalid archetype", ({ clubs }) => { clubs[0].archetypes = ["wizard"]; }, /invalid archetype/);
expectIssue("invalid clearance", ({ clubs }) => { clubs[0].clearanceStatus = "approved"; }, /invalid clearance status/);

const referenceCases = [
  ["ESP_MADRID", "catalog", true, true],
  ["UDV", "canonical_special", true, true],
  ["NEW_CLUB", "narrative_alias", false, false],
  ["DEVELOPMENT_CLUB_2", "narrative_alias", false, false],
  ["Aurora CF", "legacy_compat", true, false],
  ["SIM_OPP_3_02", "legacy_compat", true, false],
  ["Development_4_29", "legacy_compat", true, false],
  ["Foreign_1_02", "legacy_compat", true, false],
  ["Loan_3_14", "legacy_compat", true, false],
  ["Club 3 · 4", "legacy_compat", true, false],
  ["ESP_FAKE_CLUB_999", "invalid", false, false]
];

for (const [value, kind, loadable, newProduction] of referenceCases) {
  assert.equal(classifyFootballClubReference(value).kind, kind, value);
  assert.equal(isLoadableFootballClubReference(value), loadable, `${value}: historical read`);
  assert.equal(isNewFootballClubReference(value), newProduction, `${value}: new production`);
}

console.log("DB-A7 — PASS 1 STRUCTURAL HARNESS");
console.log("CATALOG STRUCTURE: PASS");
console.log("REFERENCE INTEGRITY: PASS");
console.log("INVALID INJECTION: PASS");
console.log("NEW PRODUCTION: PASS");
