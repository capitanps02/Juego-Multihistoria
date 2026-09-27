import test from 'node:test';
import assert from 'node:assert/strict';
import { pairedCohortMetrics } from './t6-paired-metrics.mjs';

function career(profile, seed, {
  signature,
  events,
  choices,
  epilogues,
  retirementAge,
  closureType
}) {
  return {
    profile,
    seed,
    signature,
    retirementAge,
    closureType,
    epilogues,
    sequence: events.map((eventId, index) => ({ eventId, choiceId: choices[index] }))
  };
}

test('paired metrics compare strategy divergence within one shared seed', () => {
  const results = [
    career('a', 10, { signature: 's1', events: ['E1', 'E2'], choices: ['A', 'A'], epilogues: ['END_A'], retirementAge: 40, closureType: 'planned' }),
    career('b', 10, { signature: 's2', events: ['E1', 'E3'], choices: ['B', 'A'], epilogues: ['END_A', 'END_B'], retirementAge: 42, closureType: 'planned' }),
    career('c', 10, { signature: 's1', events: ['E1', 'E2'], choices: ['A', 'A'], epilogues: ['END_A'], retirementAge: 41, closureType: 'no_match' })
  ];

  const metrics = pairedCohortMetrics(results, ['a', 'b', 'c']);
  assert.equal(metrics.cohortsObserved, 1);
  assert.equal(metrics.completeCohorts, 1);
  assert.equal(metrics.incompleteCohortCount, 0);
  assert.equal(metrics.aggregateUsesCompleteCohortsOnly, true);
  assert.equal(metrics.pairComparisons, 3);
  assert.equal(metrics.uniqueSignaturesPerCohort.p50, 2);
  assert.equal(metrics.retirementAgeSpread.p50, 2);
  assert.ok(Math.abs(metrics.eventSetJaccardDistance.mean - 0.444) < 0.001);
  assert.ok(Math.abs(metrics.choiceSetJaccardDistance.mean - 0.667) < 0.001);
  assert.ok(Math.abs(metrics.epilogueSetJaccardDistance.mean - 0.333) < 0.001);
  assert.ok(Math.abs(metrics.closureDisagreementRate - 2 / 3) < 1e-12);
});

test('missing retirement ages do not become synthetic age zero', () => {
  const results = [
    career('a', 11, { signature: 's1', events: ['E1'], choices: ['A'], epilogues: [], retirementAge: null, closureType: null }),
    career('b', 11, { signature: 's2', events: ['E1'], choices: ['B'], epilogues: [], retirementAge: 42, closureType: 'planned' }),
    career('c', 11, { signature: 's3', events: ['E1'], choices: ['C'], epilogues: [], retirementAge: undefined, closureType: null })
  ];
  const metrics = pairedCohortMetrics(results, ['a', 'b', 'c']);
  assert.equal(metrics.retirementAgeSpread.count, 0);
  assert.equal(metrics.cohortExamples[0].retirementAgeSpread, null);
});

test('incomplete cohorts remain diagnostic examples but do not contaminate divergence aggregates', () => {
  const complete = [
    career('a', 19, { signature: 'same', events: ['E1'], choices: ['A'], epilogues: ['END'], retirementAge: 40, closureType: 'planned' }),
    career('b', 19, { signature: 'same', events: ['E1'], choices: ['A'], epilogues: ['END'], retirementAge: 40, closureType: 'planned' }),
    career('c', 19, { signature: 'same', events: ['E1'], choices: ['A'], epilogues: ['END'], retirementAge: 40, closureType: 'planned' })
  ];
  const incomplete = [
    career('a', 20, { signature: 'x', events: ['X1'], choices: ['A'], epilogues: ['X'], retirementAge: 20, closureType: 'x' }),
    career('b', 20, { signature: 'y', events: ['Y1'], choices: ['B'], epilogues: ['Y'], retirementAge: 60, closureType: 'y' })
  ];

  const metrics = pairedCohortMetrics([...complete, ...incomplete], ['a', 'b', 'c']);
  assert.equal(metrics.completeCohorts, 1);
  assert.equal(metrics.incompleteCohortCount, 1);
  assert.deepEqual(metrics.incompleteCohorts[0].profiles, ['a', 'b']);
  assert.equal(metrics.pairComparisons, 3);
  assert.equal(metrics.uniqueSignaturesPerCohort.p50, 1);
  assert.equal(metrics.eventSetJaccardDistance.mean, 0);
  assert.equal(metrics.choiceSetJaccardDistance.mean, 0);
  assert.equal(metrics.epilogueSetJaccardDistance.mean, 0);
  assert.equal(metrics.retirementAgeSpread.p50, 0);
  assert.equal(metrics.closureDisagreementRate, 0);
  assert.equal(metrics.cohortExamples.find(row => row.seed === 20).includedInAggregate, false);
});

test('paired metrics surface incomplete cohorts instead of treating them as valid pairs', () => {
  const results = [
    career('a', 20, { signature: 's1', events: ['E1'], choices: ['A'], epilogues: [], retirementAge: 40, closureType: 'planned' }),
    career('b', 20, { signature: 's2', events: ['E1'], choices: ['B'], epilogues: [], retirementAge: 41, closureType: 'planned' })
  ];

  const metrics = pairedCohortMetrics(results, ['a', 'b', 'c']);
  assert.equal(metrics.completeCohorts, 0);
  assert.equal(metrics.incompleteCohortCount, 1);
  assert.deepEqual(metrics.incompleteCohorts[0].profiles, ['a', 'b']);
  assert.equal(metrics.pairComparisons, 0);
  assert.equal(metrics.eventSetJaccardDistance.count, 0);
});

test('duplicate profile rows invalidate a cohort', () => {
  const duplicate = career('a', 30, { signature: 's1', events: ['E1'], choices: ['A'], epilogues: [], retirementAge: 40, closureType: 'planned' });
  const metrics = pairedCohortMetrics([duplicate, { ...duplicate }], ['a']);
  assert.equal(metrics.completeCohorts, 0);
  assert.equal(metrics.incompleteCohorts[0].hasDuplicateProfiles, true);
  assert.equal(metrics.pairComparisons, 0);
});
