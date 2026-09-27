import test from 'node:test';
import assert from 'node:assert/strict';
import { marketCadenceMetrics } from './t6-market-metrics.mjs';

function career(profile, seed, marketDecisions, decisions = 100, marketTelemetry = null) {
  return { profile, seed, marketDecisions, decisions, retirementAge: 42, finalAge: 43, closureType: 'normal', marketTelemetry };
}

test('market cadence reports distribution, profile slices and reproducible extremes', () => {
  const metrics = marketCadenceMetrics([
    career('loyal', 1, 8, 100),
    career('loyal', 2, 10, 100),
    career('risk', 1, 6, 120),
    career('risk', 2, 484, 160)
  ]);

  assert.equal(metrics.careersObserved, 4);
  assert.equal(metrics.invalidCount, 0);
  assert.equal(metrics.decisionsPerCareer.p50, 8);
  assert.equal(metrics.decisionsPerCareer.max, 484);
  assert.equal(metrics.byProfile.loyal.decisionsPerCareer.mean, 9);
  assert.equal(metrics.byProfile.risk.decisionsPerCareer.max, 484);
  assert.equal(metrics.topExamples[0].profile, 'risk');
  assert.equal(metrics.topExamples[0].seed, 2);
  assert.equal(metrics.topExamples[0].marketDecisions, 484);
  assert.equal(metrics.topExamples[0].versusMedian, 60.5);
  assert.ok(metrics.marketPerNarrativeDecision.max > 3);
});

test('market telemetry aggregates cause, timing and logical reoffers', () => {
  const repeatedSource = [{ reason: 'Renovación de contrato', before: { months: 0, club: 'A' }, count: 3 }];
  const metrics = marketCadenceMetrics([
    career('loyal', 1, 4, 100, {
      bySegment: { '20_23': 3, '23_26': 1 },
      byReason: { 'Renovación de contrato': 3, 'Continuidad de la cesión': 1 },
      byAction: { reject: 4 },
      accepted: 0,
      rejected: 4,
      uniqueOfferIds: 4,
      duplicateOfferIds: 0,
      uniqueLogicalSourceStates: 2,
      repeatedLogicalSourceOffers: 2,
      maxOffersFromSameSourceState: 3,
      topRepeatedSourceStates: repeatedSource,
      uniqueExactOfferVariants: 4,
      repeatedExactOfferVariants: 0,
      maxExactOfferVariantRepeats: 1,
      uniqueOfferDates: 4,
      maxDecisionsSameDate: 1,
      firstOfferDate: '2028-01-01',
      lastOfferDate: '2030-01-01'
    }),
    career('risk', 1, 3, 100, {
      bySegment: { '20_23': 2, '23_26': 1 },
      byReason: { 'Renovación de contrato': 2, 'Traspaso': 1 },
      byAction: { accept: 3 },
      accepted: 3,
      rejected: 0,
      uniqueOfferIds: 3,
      duplicateOfferIds: 0,
      uniqueLogicalSourceStates: 3,
      repeatedLogicalSourceOffers: 0,
      maxOffersFromSameSourceState: 1,
      topRepeatedSourceStates: [],
      uniqueExactOfferVariants: 3,
      repeatedExactOfferVariants: 0,
      maxExactOfferVariantRepeats: 1,
      uniqueOfferDates: 2,
      maxDecisionsSameDate: 2,
      firstOfferDate: '2028-02-01',
      lastOfferDate: '2029-02-01'
    })
  ]);

  assert.equal(metrics.careersWithTelemetry, 2);
  assert.deepEqual(metrics.telemetry.bySegment, { '20_23': 5, '23_26': 2 });
  assert.equal(metrics.telemetry.byReason['Renovación de contrato'], 5);
  assert.equal(metrics.telemetry.byAction.reject, 4);
  assert.equal(metrics.telemetry.byAction.accept, 3);
  assert.equal(metrics.telemetry.accepted, 3);
  assert.equal(metrics.telemetry.rejected, 4);
  assert.equal(metrics.telemetry.duplicateOfferIds.max, 0);
  assert.equal(metrics.telemetry.repeatedLogicalSourceOffers.max, 2);
  assert.equal(metrics.telemetry.maxOffersFromSameSourceState.max, 3);
  assert.equal(metrics.telemetry.repeatedExactOfferVariants.max, 0);
  assert.equal(metrics.telemetry.uniqueOfferDates.p50, 2);
  assert.equal(metrics.telemetry.maxDecisionsSameDate.max, 2);
  assert.equal(metrics.telemetry.decisionsPerOfferDate.max, 1.5);
  assert.equal(metrics.topExamples[0].marketTelemetry.topRepeatedSourceStates[0].count, 3);
});

test('market cadence preserves zero medians without infinite ratios', () => {
  const metrics = marketCadenceMetrics([
    career('a', 1, 0, 0),
    career('b', 1, 0, 100),
    career('c', 1, 12, 100)
  ]);
  assert.equal(metrics.decisionsPerCareer.p50, 0);
  assert.equal(metrics.maxVersusMedian, null);
  assert.equal(metrics.topExamples[0].versusMedian, null);
  assert.equal(metrics.marketPerNarrativeDecision.max, 0.12);
});

test('invalid market counts are excluded and counted', () => {
  const metrics = marketCadenceMetrics([
    career('a', 1, undefined),
    career('b', 2, -1),
    career('c', 3, 7)
  ]);
  assert.equal(metrics.careersObserved, 1);
  assert.equal(metrics.invalidCount, 2);
  assert.equal(metrics.decisionsPerCareer.p50, 7);
});
