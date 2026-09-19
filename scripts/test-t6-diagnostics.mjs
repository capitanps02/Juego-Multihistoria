import test from 'node:test';
import assert from 'node:assert/strict';
import { buildT6Diagnostics } from './t6-diagnostics-core.mjs';

function report() {
  return {
    kind: 'T6-balance-observability',
    configuration: { buildLabel: 'synthetic', catalogFingerprint: 'fp', samplingDesign: 'paired_profile_seed_v1' },
    metrics: {
      sample: { careersInShard: 100 },
      pairedComparison: { cohortsObserved: 10, completeCohorts: 10, incompleteCohortCount: 0, incompleteCohorts: [] },
      marketCadence: {
        careersObserved: 100,
        decisionsPerCareer: { p50: 8, p95: 14, max: 484 },
        maxVersusMedian: 60.5,
        topExamples: [
          { profile: 'loyal', seed: 512000, marketDecisions: 484, narrativeDecisions: 164, marketPerNarrativeDecision: 484 / 164, versusMedian: 60.5 }
        ]
      },
      careersNotClosed: [{ profile: 'a', seed: 1, finalAge: 55 }],
      structuralAnomalies: [{ profile: 'b', seed: 2, issue: 'negative_salary' }],
      coverage: { events: { missing: ['E_NEVER', 'E_STARVED'] } },
      schedulerExposure: {
        events: [
          { eventId: 'E_NEVER', neverCandidateInSample: true, candidateButNeverSelected: false, candidateTicks: 0, candidateCareers: 0 },
          { eventId: 'E_STARVED', neverCandidateInSample: false, candidateButNeverSelected: true, candidateTicks: 50, candidateCareers: 20, maxCandidateWeight: 4 }
        ]
      },
      choiceConcentration: [
        { eventId: 'E_DOM', total: 50, dominantChoice: 'A', dominantShare: 0.96, distinctChoicesSeen: 1, totalChoicesDefined: 3 }
      ],
      semanticSelection: {
        byEvent: [{ eventId: 'E_TAGS', decisions: 40, fallbacks: 30, rate: 0.75, phase: '23_26' }]
      },
      narrativeGaps: {
        longGapThresholdDays: 180,
        bySegment: { '30_34': { count: 20, p95: 240, mean: 100 } }
      },
      seedLifecycle: {
        longSeedThresholdDays: 730,
        seeds: [{ seedId: 'S_LONG', careers: 20, careerRate: 0.2, liveEndRateAmongObservedCareers: 0.8, lifetimeDays: { p95: 900 }, consumers: {} }]
      },
      signatures: { unique: 30, duplicateGroups: [{ signature: 'x', count: 10 }] },
      closureTypes: { dominant: 85, other: 15 }
    }
  };
}

test('diagnostics classify reproducible technical and balance signals without mutating input', () => {
  const value = report();
  const snapshot = JSON.stringify(value);
  const diagnostics = buildT6Diagnostics(value);
  const types = new Set(diagnostics.signals.map(signal => signal.type));

  assert.equal(types.has('career_not_closed'), true);
  assert.equal(types.has('structural_anomaly'), true);
  assert.equal(types.has('never_candidate_in_sample'), true);
  assert.equal(types.has('candidate_never_selected'), true);
  assert.equal(types.has('choice_concentration_review'), true);
  assert.equal(types.has('semantic_fallback_review'), true);
  assert.equal(types.has('narrative_gap_review'), true);
  assert.equal(types.has('long_lived_seed_review'), true);
  assert.equal(types.has('career_convergence_review'), true);
  assert.equal(types.has('closure_concentration_review'), true);
  assert.equal(types.has('market_cadence_review'), true);
  assert.equal(types.has('paired_cohort_incomplete'), false);
  assert.equal(diagnostics.source.samplingDesign, 'paired_profile_seed_v1');
  assert.equal(diagnostics.source.completeCohorts, 10);
  const marketSignal = diagnostics.signals.find(signal => signal.type === 'market_cadence_review');
  assert.equal(marketSignal.ownerHint, 'qa/market');
  assert.equal(marketSignal.evidence.effectiveThreshold, 80);
  assert.equal(marketSignal.evidence.examples[0].seed, 512000);
  assert.equal(JSON.stringify(value), snapshot);
});

test('diagnostics flag incomplete paired cohorts as tooling defects', () => {
  const value = report();
  value.metrics.pairedComparison = {
    cohortsObserved: 10,
    completeCohorts: 9,
    incompleteCohortCount: 1,
    incompleteCohorts: [{ seed: 610004, profiles: ['a', 'b'], hasDuplicateProfiles: false }]
  };
  const diagnostics = buildT6Diagnostics(value);
  const signal = diagnostics.signals.find(row => row.type === 'paired_cohort_incomplete');
  assert.ok(signal);
  assert.equal(signal.ownerHint, 'qa/tooling');
  assert.equal(signal.evidence.completeCohorts, 9);
  assert.equal(signal.evidence.incompleteCohorts[0].seed, 610004);
});

test('diagnostics keep small-sample concentration and market cadence below review thresholds', () => {
  const value = report();
  value.metrics.choiceConcentration[0].total = 5;
  value.metrics.semanticSelection.byEvent[0].decisions = 5;
  value.metrics.marketCadence.careersObserved = 15;
  const diagnostics = buildT6Diagnostics(value);
  const types = new Set(diagnostics.signals.map(signal => signal.type));
  assert.equal(types.has('choice_concentration_review'), false);
  assert.equal(types.has('semantic_fallback_review'), false);
  assert.equal(types.has('market_cadence_review'), false);
});

test('choice coverage does not suppress a strong concentration signal', () => {
  const value = report();
  value.metrics.choiceConcentration[0].distinctChoicesSeen = 3;
  value.metrics.choiceConcentration[0].totalChoicesDefined = 3;
  const diagnostics = buildT6Diagnostics(value);
  const signal = diagnostics.signals.find(row => row.type === 'choice_concentration_review' && row.subject === 'E_DOM');
  assert.ok(signal);
  assert.equal(signal.evidence.dominantShare, 0.96);
  assert.equal(signal.evidence.distinctChoicesSeen, 3);
});

test('diagnostic thresholds are descriptive and overridable', () => {
  const value = report();
  const diagnostics = buildT6Diagnostics(value, {
    closureConcentrationRate: 0.9,
    signatureUniquenessRate: 0.2,
    marketDecisionAbsoluteReview: 500,
    marketMedianMultiplier: 100
  });
  const types = new Set(diagnostics.signals.map(signal => signal.type));
  assert.equal(types.has('closure_concentration_review'), false);
  assert.equal(types.has('career_convergence_review'), false);
  assert.equal(types.has('market_cadence_review'), false);
});
