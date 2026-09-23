import test from 'node:test';
import assert from 'node:assert/strict';
import { aggregateT6Results, stats } from './t6-metrics.mjs';

const events = [
  { id: 'E1', phase: '18_20', family: 'sport', choices: [{ id: 'A' }, { id: 'B' }] },
  { id: 'E2', phase: '20_23', family: 'agent', choices: [{ id: 'A' }, { id: 'B' }] },
  { id: 'E3', phase: '20_23', family: 'media', choices: [{ id: 'A' }] }
];

function result(overrides = {}) {
  return {
    profile: 'ambitious',
    seed: 1,
    closed: true,
    retirementAge: 36,
    closureType: 'normal',
    finalAge: 36,
    days: 100,
    decisions: 2,
    fallbackDecisions: 1,
    fallbackRate: 0.5,
    eventsBySegment: { '18_20': 1, '20_23': 1, '23_26': 0, '26_30': 0, '30_34': 0, '34_plus': 0 },
    eventsByFamily: { sport: 1, agent: 1 },
    choiceOccurrences: { 'E1/A': 1, 'E2/B': 1 },
    narrativeGaps: [30],
    narrativeGapsBySegment: { '18_20': [], '20_23': [30], '23_26': [], '26_30': [], '30_34': [], '34_plus': [] },
    terminalGapDays: 10,
    historyEvents: 2,
    sequence: [
      { eventId: 'E1', choiceId: 'A', outcomeId: 'OA', phase: '18_20', usedFallback: false, semanticScore: 8 },
      { eventId: 'E2', choiceId: 'B', outcomeId: 'OB', phase: '20_23', usedFallback: true, semanticScore: 0 }
    ],
    candidateExposure: {
      E1: { ticks: 3, weightSum: 6, maxWeight: 3 },
      E2: { ticks: 2, weightSum: 2, maxWeight: 1.5 },
      E3: { ticks: 4, weightSum: 1, maxWeight: 0.5 }
    },
    candidatePoolSizes: [2, 3],
    seedLifecycle: [
      { id: 'S1', state: 'resolved', originDate: '2026-01-01', observedEndDate: '2026-02-10', observedLifetimeDays: 40, liveAtCareerEnd: false, consumedBy: 'E2' },
      { id: 'S2', state: 'active', originDate: '2026-01-01', observedEndDate: '2028-03-01', observedLifetimeDays: 790, liveAtCareerEnd: true, consumedBy: null }
    ],
    openSeeds: ['S2'],
    epilogues: ['END_A'],
    marketDecisions: 1,
    structuralAnomalies: [],
    signature: 'sig-a',
    ...overrides
  };
}

test('stats returns stable nearest-rank percentiles', () => {
  assert.deepEqual(stats([]), { count: 0, min: null, p50: null, p90: null, p95: null, p99: null, max: null, mean: null });
  const summary = stats([1, 2, 3, 4]);
  assert.equal(summary.p50, 2);
  assert.equal(summary.p95, 4);
  assert.equal(summary.mean, 2.5);
});

test('aggregate reports coverage, fallback, scheduler exposure and seed lifetime without mutating inputs', () => {
  const r1 = result();
  const r2 = result({
    profile: 'health-first',
    seed: 2,
    fallbackRate: 0,
    fallbackDecisions: 0,
    choiceOccurrences: { 'E1/B': 1 },
    eventsBySegment: { '18_20': 1, '20_23': 0, '23_26': 0, '26_30': 0, '30_34': 0, '34_plus': 0 },
    eventsByFamily: { sport: 1 },
    narrativeGaps: [],
    narrativeGapsBySegment: { '18_20': [], '20_23': [], '23_26': [], '26_30': [], '30_34': [], '34_plus': [] },
    terminalGapDays: 20,
    sequence: [{ eventId: 'E1', choiceId: 'B', outcomeId: 'OB', phase: '18_20', usedFallback: false, semanticScore: 10 }],
    candidateExposure: { E1: { ticks: 1, weightSum: 4, maxWeight: 4 } },
    candidatePoolSizes: [1],
    seedLifecycle: [{ id: 'S1', state: 'active', originDate: '2026-01-01', observedEndDate: '2026-03-02', observedLifetimeDays: 60, liveAtCareerEnd: true, consumedBy: null }],
    openSeeds: ['S1'],
    epilogues: ['END_B'],
    signature: 'sig-b'
  });
  const snapshot = JSON.stringify([r1, r2]);
  const metrics = aggregateT6Results([r1, r2], events, { totalRequested: 2, rareCareerRate: 0.6, longGapDays: 15, longSeedDays: 730 });

  assert.equal(metrics.coverage.events.seen, 2);
  assert.deepEqual(metrics.coverage.events.missing, ['E3']);
  assert.equal(metrics.coverage.choices.seen, 3);
  assert.deepEqual(metrics.coverage.choices.missing, ['E2/A', 'E3/A']);
  assert.equal(metrics.signatures.unique, 2);
  assert.equal(metrics.semanticSelection.byProfile.ambitious.rate, 0.5);
  assert.equal(metrics.semanticSelection.byProfile['health-first'].rate, 0);
  assert.equal(metrics.semanticSelection.bySegment['20_23'].rate, 1);
  assert.equal(metrics.semanticSelection.byEvent[0].eventId, 'E2');
  assert.equal(metrics.semanticSelection.byEvent[0].rate, 1);
  assert.equal(metrics.narrativeGaps.bySegment['20_23'].p95, 30);
  assert.equal(metrics.narrativeGaps.longGapExamples.length, 2);

  const exposureE1 = metrics.schedulerExposure.events.find(row => row.eventId === 'E1');
  const exposureE3 = metrics.schedulerExposure.events.find(row => row.eventId === 'E3');
  assert.equal(exposureE1.candidateTicks, 4);
  assert.equal(exposureE1.selectedOccurrences, 2);
  assert.equal(exposureE1.selectionPerCandidateTick, 0.5);
  assert.equal(exposureE3.candidateTicks, 4);
  assert.equal(exposureE3.candidateButNeverSelected, true);
  assert.equal(metrics.schedulerExposure.candidateButNeverSelectedCount, 1);
  assert.equal(metrics.schedulerExposure.neverCandidateCount, 0);
  assert.equal(metrics.schedulerExposure.candidatePoolSize.p50, 2);

  const seedS1 = metrics.seedLifecycle.seeds.find(row => row.seedId === 'S1');
  const seedS2 = metrics.seedLifecycle.seeds.find(row => row.seedId === 'S2');
  assert.equal(seedS1.instances, 2);
  assert.equal(seedS1.careers, 2);
  assert.equal(seedS1.liveEndCareers, 1);
  assert.equal(seedS1.lifetimeDays.p95, 60);
  assert.equal(seedS2.lifetimeDays.p95, 790);
  assert.equal(metrics.seedLifecycle.longLivedExamples.length, 1);
  assert.equal(metrics.seedLifecycle.longLivedExamples[0].seedId, 'S2');
  assert.equal(JSON.stringify([r1, r2]), snapshot);
});
