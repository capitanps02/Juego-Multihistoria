import test from 'node:test';
import assert from 'node:assert/strict';
import { compareMarketCadenceReports } from './t6-market-comparison-core.mjs';

function report(sampleKeys, mean, p50, p95, max, profileMean, maxVersusMedian, samplingDesign = 'paired_profile_seed_v1') {
  return {
    configuration: { samplingDesign },
    sampleKeys,
    metrics: {
      marketCadence: {
        careersObserved: sampleKeys.length,
        decisionsPerCareer: { mean, p50, p95, max },
        marketPerNarrativeDecision: { mean: mean / 100, p95: p95 / 100, max: max / 100 },
        maxVersusMedian,
        byProfile: {
          loyal: {
            decisionsPerCareer: { mean: profileMean, p95: profileMean },
            marketPerNarrativeDecision: { mean: profileMean / 100 }
          }
        },
        topExamples: [{ profile: 'loyal', seed: 1, marketDecisions: max }]
      }
    }
  };
}

test('market comparison preserves paired-sample comparability and deltas', () => {
  const baseline = report(['a:1', 'b:1'], 8, 8, 12, 14, 9, 1.75);
  const candidate = report(['b:1', 'a:1'], 9, 9, 15, 40, 12, 4.444);
  const result = compareMarketCadenceReports(baseline, candidate);

  assert.equal(result.available, true);
  assert.equal(result.comparability.exactSample, true);
  assert.equal(result.comparability.sameSamplingDesign, true);
  assert.equal(result.overall.decisionsPerCareer.mean.delta, 1);
  assert.equal(result.overall.decisionsPerCareer.max.delta, 26);
  assert.equal(result.byProfile[0].profile, 'loyal');
  assert.equal(result.byProfile[0].decisionsPerCareerMean.delta, 3);
});

test('market comparison surfaces sample/design mismatch rather than hiding it', () => {
  const baseline = report(['a:1', 'b:1'], 8, 8, 12, 14, 9, 1.75);
  const candidate = report(['a:1', 'b:2'], 8, 8, 12, 14, 9, 1.75, 'legacy_per_profile_seed');
  const result = compareMarketCadenceReports(baseline, candidate);
  assert.equal(result.comparability.exactSample, false);
  assert.equal(result.comparability.sameSamplingDesign, false);
});

test('market comparison reports unavailable for legacy reports without cadence metrics', () => {
  const result = compareMarketCadenceReports({ metrics: {} }, { metrics: {} });
  assert.equal(result.available, false);
});
