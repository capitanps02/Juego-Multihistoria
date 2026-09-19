import fs from 'node:fs';
import { buildT6Diagnostics } from './t6-diagnostics-core.mjs';

const [reportPath] = process.argv.slice(2);
if (!reportPath) throw new Error('usage: node scripts/t6-diagnose-report.mjs <t6-report.json>');
const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
const diagnostics = buildT6Diagnostics(report, {
  minChoiceSamples: Number(process.env.T6_DIAG_MIN_CHOICE_SAMPLES ?? 30),
  dominantChoiceShare: Number(process.env.T6_DIAG_DOMINANT_CHOICE_SHARE ?? 0.9),
  minFallbackDecisions: Number(process.env.T6_DIAG_MIN_FALLBACK_DECISIONS ?? 30),
  fallbackRate: Number(process.env.T6_DIAG_FALLBACK_RATE ?? 0.5),
  seedLiveEndRate: Number(process.env.T6_DIAG_SEED_LIVE_END_RATE ?? 0.5),
  signatureUniquenessRate: Number(process.env.T6_DIAG_SIGNATURE_UNIQUENESS_RATE ?? 0.5),
  closureConcentrationRate: Number(process.env.T6_DIAG_CLOSURE_CONCENTRATION_RATE ?? 0.8),
  minMarketCareers: Number(process.env.T6_DIAG_MIN_MARKET_CAREERS ?? 30),
  marketDecisionAbsoluteReview: Number(process.env.T6_DIAG_MARKET_DECISION_ABSOLUTE ?? 50),
  marketMedianMultiplier: Number(process.env.T6_DIAG_MARKET_MEDIAN_MULTIPLIER ?? 10)
});

const output = process.env.T6_DIAGNOSTICS_OUTPUT;
if (output) fs.writeFileSync(output, JSON.stringify(diagnostics, null, 2) + '\n');
console.log(JSON.stringify(diagnostics, null, 2));
