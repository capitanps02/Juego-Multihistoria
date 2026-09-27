import assert from "node:assert/strict";
import path from "node:path";
import { pathToFileURL } from "node:url";

const candidateRoot = path.resolve(process.argv[2] ?? process.cwd());
const importFrom = async rel => import(pathToFileURL(path.join(candidateRoot, rel)).href);

const { createInitialState } = await importFrom("dist/content/initial-state.js");
const { materializeAge18MarketOfferInPlace } = await importFrom("dist/simulation/early-career-market.js");
const {
  executePlayerActionInPlace,
  transferRequestExternalMarketThreshold,
  addPlayerActionDays
} = await importFrom("dist/player-actions/index.js");

const clone = value => structuredClone(value);
const N = 1000;

function prep(seed) {
  const state = createInitialState(seed);
  state.date = "2027-06-04";
  state.age = 18;
  state.flags.OFFICIAL_DEBUT = true;
  state.sport.appearances = 3;
  state.reputation.marketHeat = 40;
  return state;
}

function requestTransfer(state) {
  const beforeMarket = clone(state.market);
  const beforeRng = clone(state.rngState);
  const result = executePlayerActionInPlace(state, {
    actionId: "PA_REQUEST_TRANSFER",
    optionId: "REQUEST"
  });
  assert.equal(result.ok, true, `transfer request failed: ${result.code ?? ""}`);
  assert.deepEqual(state.market, beforeMarket, "request transfer created/mutated market state immediately");
  assert.deepEqual(state.rngState, beforeRng, "request transfer consumed RNG");
  return result;
}

const counts = {
  baseline: { transfer: 0, renewal: 0, none: 0 },
  requested: { transfer: 0, renewal: 0, none: 0 }
};
let changedOutcome = 0;

for (let seed = 1; seed <= N; seed += 1) {
  const base = prep(seed);
  const without = clone(base);
  const withRequest = clone(base);

  requestTransfer(withRequest);

  assert.equal(transferRequestExternalMarketThreshold(without, 38), 38);
  assert.equal(transferRequestExternalMarketThreshold(withRequest, 38), 50);

  const beforeWithoutRng = clone(without.rngState);
  const beforeWithRng = clone(withRequest.rngState);

  const a = materializeAge18MarketOfferInPlace(without) ?? "none";
  const b = materializeAge18MarketOfferInPlace(withRequest) ?? "none";

  counts.baseline[a] += 1;
  counts.requested[b] += 1;
  if (a !== b) changedOutcome += 1;

  assert.deepEqual(without.rngState, beforeWithoutRng, "baseline market producer unexpectedly mutated RNG state");
  assert.deepEqual(withRequest.rngState, beforeWithRng, "requested market producer unexpectedly mutated RNG state");
}

// Repeated request must not stack causal strength.
const repeated = prep(424242);
requestTransfer(repeated);
assert.equal(transferRequestExternalMarketThreshold(repeated, 38), 50);
repeated.date = addPlayerActionDays(repeated.date, 90);
requestTransfer(repeated);
assert.equal(
  transferRequestExternalMarketThreshold(repeated, 38),
  50,
  "repeated transfer requests stacked market threshold"
);
assert.equal(repeated.market?.pending ?? null, null, "repeated request created an offer immediately");

assert.ok(counts.requested.transfer < N, "transfer request guarantees a transfer offer");
assert.ok(counts.requested.transfer >= counts.baseline.transfer, "transfer request unexpectedly reduces transfer opportunities");

console.log(JSON.stringify({
  gate: "A6 MARKET EXPLOIT PROBE",
  seeds: N,
  counts,
  changedOutcome,
  baselineTransferRate: counts.baseline.transfer / N,
  requestedTransferRate: counts.requested.transfer / N,
  thresholdBaseline: 38,
  thresholdRequested: 50,
  repeatedRequestThreshold: transferRequestExternalMarketThreshold(repeated, 38),
  immediateSyntheticOffers: 0,
  result: "PASS"
}, null, 2));
