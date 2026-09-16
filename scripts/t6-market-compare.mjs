import fs from 'node:fs';
import { compareMarketCadenceReports } from './t6-market-comparison-core.mjs';

const [baselinePath, candidatePath] = process.argv.slice(2);
if (!baselinePath || !candidatePath) {
  throw new Error('usage: node scripts/t6-market-compare.mjs <baseline.json> <candidate.json>');
}

const baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
const candidate = JSON.parse(fs.readFileSync(candidatePath, 'utf8'));
const comparison = {
  reportVersion: 1,
  kind: 'T6-market-cadence-comparison',
  generatedAt: new Date().toISOString(),
  baseline: baselinePath,
  candidate: candidatePath,
  ...compareMarketCadenceReports(baseline, candidate)
};

const output = process.env.T6_MARKET_COMPARE_OUTPUT;
if (output) fs.writeFileSync(output, JSON.stringify(comparison, null, 2) + '\n');
console.log(JSON.stringify(comparison, null, 2));
