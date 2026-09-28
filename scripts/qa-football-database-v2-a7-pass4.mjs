import assert from "node:assert/strict";
import fs from "node:fs";
import crypto from "node:crypto";
import { createInitialState } from "../dist/content/initial-state.js";
import { advanceWorldDayInPlace } from "../dist/simulation/world-simulator.js";
import { respondToOffer } from "../dist/simulation/offers.js";
import { loadSave, serializeSave } from "../dist/save/save.js";

function settlePendingOffer(state) {
  const pending = state.market?.pending;
  if (pending) respondToOffer(state, pending.id, "reject");
}

function advance(state, days) {
  for (let day = 0; day < days; day += 1) {
    settlePendingOffer(state);
    advanceWorldDayInPlace(state);
  }
  settlePendingOffer(state);
  return state;
}

function digest(state) {
  return crypto.createHash("sha256").update(serializeSave(state)).digest("hex");
}

const sourceAudit = [
  "src/catalog/football/fixture-opponent.ts",
  "src/catalog/football/market-destination.ts",
  "src/catalog/football/narrative-club-alias.ts"
].map(path => fs.readFileSync(path, "utf8")).join("\n");
assert.doesNotMatch(sourceAudit, /Math\.random|rngState|GameStateRng|\.rng\.(?:next|float|int)\b/);

const seeds = [1, 42, 777, 94001, 424242, 20260928];
let replayCases = 0;
let multiRunCases = 0;

for (const seed of seeds) {
  const continuous = advance(createInitialState(seed), 180);

  let replay = advance(createInitialState(seed), 90);
  const beforeSaveRng = structuredClone(replay.rngState);
  replay = loadSave(serializeSave(replay));
  assert.deepEqual(replay.rngState, beforeSaveRng, `save/load RNG shift seed=${seed}`);
  advance(replay, 90);

  assert.deepEqual(replay, continuous, `save/load replay mismatch seed=${seed}`);
  replayCases += 1;

  const hashes = [];
  for (let run = 0; run < 3; run += 1) {
    hashes.push(digest(advance(createInitialState(seed), 180)));
  }
  assert.equal(new Set(hashes).size, 1, `multi-run nondeterminism seed=${seed}`);
  assert.equal(hashes[0], digest(continuous), `hash mismatch seed=${seed}`);
  multiRunCases += 1;
}

const zeroActionA = advance(createInitialState(31337), 240);
const zeroActionB = advance(createInitialState(31337), 240);
assert.deepEqual(zeroActionA, zeroActionB, "zero-action continuation diverged");
assert.deepEqual(zeroActionA.rngState, zeroActionB.rngState, "zero-action RNG diverged");

console.log("DB-A7 — PASS 4 RNG / DETERMINISM");
console.log("SOURCE RNG AUDIT: PASS");
console.log("UNAUTHORIZED CATALOG RNG DRAWS: 0");
console.log("SAVE/LOAD REPLAY CASES:", replayCases, "PASS");
console.log("MULTI-RUN CASES:", multiRunCases, "PASS");
console.log("ZERO ACTION: PASS");
