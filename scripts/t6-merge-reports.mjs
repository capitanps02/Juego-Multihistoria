import fs from 'node:fs';
import crypto from 'node:crypto';
import { EVENTS } from '../dist/content/events/index.js';
import { aggregateT6Results } from './t6-metrics.mjs';
import { marketCadenceMetrics } from './t6-market-metrics.mjs';
import { pairedCohortMetrics } from './t6-paired-metrics.mjs';

const files = process.argv.slice(2);
if (!files.length) throw new Error('usage: node scripts/t6-merge-reports.mjs <report1.json> [report2.json ...]');

const reports = files.map(file => ({ file, report: JSON.parse(fs.readFileSync(file, 'utf8')) }));
for (const { file, report } of reports) {
  if (report.kind !== 'T6-balance-observability') throw new Error(`not a T6 observability report:${file}`);
  if (report.reportVersion !== 1) throw new Error(`unsupported reportVersion:${file}:${report.reportVersion}`);
  if (!Array.isArray(report.results)) throw new Error(`report without raw results required for merge:${file}`);
}

const first = reports[0].report.configuration;
const stableFields = [
  'buildLabel', 'catalogFingerprint', 'catalogShape', 'samplingDesign', 'baseSeed', 'totalRequested', 'cohortCount', 'shardCount',
  'maxAge', 'maxDays', 'rareCareerRate', 'longGapDays', 'longSeedDays'
];
for (const { file, report } of reports.slice(1)) {
  for (const field of stableFields) {
    if (JSON.stringify(report.configuration[field]) !== JSON.stringify(first[field])) {
      throw new Error(`incompatible configuration:${field}:${files[0]}!=${file}`);
    }
  }
  if (JSON.stringify(report.configuration.profiles) !== JSON.stringify(first.profiles)) {
    throw new Error(`incompatible profiles:${files[0]}!=${file}`);
  }
}

const currentCatalogFingerprint = crypto.createHash('sha256').update(JSON.stringify(EVENTS)).digest('hex');
if (first.catalogFingerprint && first.catalogFingerprint !== currentCatalogFingerprint) {
  throw new Error(`catalog fingerprint mismatch: reports=${first.catalogFingerprint} current=${currentCatalogFingerprint}; merge using the build that produced the shards`);
}

const shardIndices = reports.map(({ report }) => report.configuration.shardIndex);
if (new Set(shardIndices).size !== shardIndices.length) throw new Error('duplicate shardIndex in input reports');
const results = reports.flatMap(({ report }) => report.results);
const careerKeys = results.map(result => `${result.profile}:${result.seed}`);
if (new Set(careerKeys).size !== careerKeys.length) throw new Error('duplicate profile/seed career across reports');

const expectedShards = new Set(Array.from({ length: first.shardCount }, (_, index) => index));
const suppliedShards = new Set(shardIndices);
const missingShards = [...expectedShards].filter(index => !suppliedShards.has(index));
const complete = missingShards.length === 0;
if (!complete && process.env.T6_ALLOW_PARTIAL_MERGE !== '1') {
  throw new Error(`incomplete shard set; missing:${missingShards.join(',')} (set T6_ALLOW_PARTIAL_MERGE=1 for diagnostic partial merge)`);
}

const observedCohorts = new Set(results
  .map(result => result.cohortIndex)
  .filter(value => Number.isInteger(value)));
const aggregateConfig = {
  totalRequested: first.totalRequested,
  rareCareerRate: first.rareCareerRate,
  longGapDays: first.longGapDays,
  longSeedDays: first.longSeedDays
};
const metrics = aggregateT6Results(results, EVENTS, aggregateConfig);
metrics.marketCadence = marketCadenceMetrics(results);
metrics.pairedComparison = pairedCohortMetrics(results, first.profiles ?? []);
const includeResults = process.env.T6_MERGE_OMIT_RESULTS !== '1';
const merged = {
  reportVersion: 1,
  kind: 'T6-balance-observability',
  generatedAt: new Date().toISOString(),
  configuration: {
    ...first,
    shardIndex: null,
    cohortCountInShard: observedCohorts.size || null,
    careersInShard: results.length,
    mergedShards: [...suppliedShards].sort((a, b) => a - b),
    missingShards,
    complete,
    rawResultsIncluded: includeResults
  },
  sampleKeys: careerKeys,
  metrics,
  ...(includeResults ? { results } : {})
};

const output = process.env.T6_MERGED_OUTPUT;
if (output) fs.writeFileSync(output, JSON.stringify(merged, null, 2) + '\n');
console.log(JSON.stringify(merged, null, 2));
