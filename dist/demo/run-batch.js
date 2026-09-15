import { getCanonCoverageAll } from "../catalog/canon-coverage.js";
import { runBatch } from "../simulation/batch.js";
import { simulateCareer } from "../simulation/career-simulator.js";
import { validateBuild } from "../validation/build-validation.js";
const errors = validateBuild().filter(x => x.level === "error");
if (errors.length)
    throw new Error(`Build validation failed:\n${JSON.stringify(errors, null, 2)}`);
const a = simulateCareer({ seed: 424242, days: 2922 });
const b = simulateCareer({ seed: 424242, days: 2922 });
if (a.signature !== b.signature)
    throw new Error("Reproducibility failure: same seed generated different careers/final state.");
const report = runBatch({ runs: 100, days: 2922, startSeed: 900000, includeHashes: true });
console.log(JSON.stringify({ reproducible: true, reproducibilitySignature: a.signature, canonCoverage: getCanonCoverageAll(), report }, null, 2));
