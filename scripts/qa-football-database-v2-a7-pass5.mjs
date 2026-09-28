import assert from "node:assert/strict";
import { simulateCareer } from "../dist/simulation/career-simulator.js";
import { classifyFootballClubReference, clubById } from "../dist/catalog/football/index.js";
import { CURRENT_FOOTBALL_CATALOG_VERSION } from "../dist/save/football-catalog-version.js";
import { inspectFootballCatalogSaveReferences } from "../dist/save/football-catalog-reference-validation.js";
import { serializeSave } from "../dist/save/save.js";

const count = Math.max(1, Number(process.env.DB_A7_CAREERS ?? 600));
const baseSeed = Number(process.env.DB_A7_BASE_SEED ?? 7600000);
const progressEvery = Math.max(1, Number(process.env.DB_A7_PROGRESS_EVERY ?? 25));

const metrics = {
  careers: 0,
  closed: 0,
  crashes: 0,
  invalidReferences: 0,
  syntheticLeaks: 0,
  invalidOpponents: 0,
  maxSaveBytes: 0,
  maxHistory: 0,
  maxFixtures: 0,
  maxPlayerActionFacts: 0
};

const identityKeys = new Set(["club","ownerClub","registrationClub","clubId"]);

function scanFreshV2References(value) {
  const leaks = [];
  const seen = new Set();
  function visit(node, path = "state") {
    if (node === null || typeof node !== "object") return;
    if (seen.has(node)) return;
    seen.add(node);
    if (Array.isArray(node)) {
      for (let i = 0; i < node.length; i += 1) visit(node[i], `${path}[${i}]`);
      return;
    }
    for (const [key, child] of Object.entries(node)) {
      const childPath = `${path}.${key}`;
      if (identityKeys.has(key) && typeof child === "string") {
        const kind = classifyFootballClubReference(child).kind;
        if (kind === "legacy_compat" || kind === "narrative_alias" || kind === "invalid") {
          leaks.push({ path: childPath, value: child, kind });
        }
      }
      if (key === "opponentClubId" && child !== undefined && child !== null) {
        const kind = classifyFootballClubReference(child).kind;
        if (kind !== "catalog") leaks.push({ path: childPath, value: child, kind });
      }
      if (child !== null && typeof child === "object") visit(child, childPath);
    }
  }
  visit(value);
  return leaks;
}

for (let i = 0; i < count; i += 1) {
  const seed = baseSeed + i;
  try {
    const result = simulateCareer({ seed, untilRetirement: true, maxAge: 55, microfeeds: true });
    const state = result.state;
    metrics.careers += 1;

    assert.equal(state.footballCatalogVersion, CURRENT_FOOTBALL_CATALOG_VERSION, `seed ${seed}: catalog version`);
    assert.equal(state.retirement.status, "closed", `seed ${seed}: career did not close`);
    metrics.closed += 1;

    const issue = inspectFootballCatalogSaveReferences(state);
    if (issue) {
      metrics.invalidReferences += 1;
      throw new Error(`seed ${seed}: ${issue.path}: ${issue.reason}`);
    }

    const leaks = scanFreshV2References(state);
    if (leaks.length > 0) {
      metrics.syntheticLeaks += leaks.length;
      throw new Error(`seed ${seed}: fresh-V2 identity leak ${JSON.stringify(leaks.slice(0, 5))}`);
    }

    for (const fixture of state.world?.sportMatchModel?.fixtures ?? []) {
      if (fixture.opponentClubId !== undefined) {
        if (!clubById(fixture.opponentClubId)) {
          metrics.invalidOpponents += 1;
          throw new Error(`seed ${seed}: invalid opponent ${fixture.opponentClubId}`);
        }
      }
    }

    const raw = serializeSave(state);
    metrics.maxSaveBytes = Math.max(metrics.maxSaveBytes, Buffer.byteLength(raw));
    metrics.maxHistory = Math.max(metrics.maxHistory, state.history?.length ?? 0);
    metrics.maxFixtures = Math.max(metrics.maxFixtures, state.world?.sportMatchModel?.fixtures?.length ?? 0);
    metrics.maxPlayerActionFacts = Math.max(metrics.maxPlayerActionFacts, state.playerActions?.facts?.length ?? 0);

    if ((i + 1) % progressEvery === 0 || i + 1 === count) {
      console.log("DB-A7 LONG CAREER PROGRESS", JSON.stringify({
        completed: i + 1,
        total: count,
        baseSeed,
        crashes: metrics.crashes,
        invalidReferences: metrics.invalidReferences,
        syntheticLeaks: metrics.syntheticLeaks,
        invalidOpponents: metrics.invalidOpponents,
        maxSaveBytes: metrics.maxSaveBytes
      }));
    }
  } catch (error) {
    metrics.crashes += 1;
    console.error("DB-A7 long-career failure", { seed, error: String(error?.stack ?? error) });
    process.exitCode = 1;
    break;
  }
}

console.log("DB-A7 — PASS 5 LONG CAREERS");
console.log(JSON.stringify(metrics, null, 2));
if (metrics.careers !== count || metrics.closed !== count || metrics.crashes !== 0 ||
    metrics.invalidReferences !== 0 || metrics.syntheticLeaks !== 0 || metrics.invalidOpponents !== 0) {
  process.exitCode = 1;
}
