import test from 'node:test';
import assert from 'node:assert/strict';
import { catalogIdentity, comparableSimulationConfig, eventCareerRates, reportCareerCount, sameStringSet, sampleKeys, setDiff } from './t6-report-utils.mjs';

function report(overrides = {}) {
  return {
    configuration: {
      profiles: ['a', 'b'],
      samplingDesign: 'paired_profile_seed_v1',
      baseSeed: 10,
      totalRequested: 2,
      cohortCount: 1,
      maxAge: 55,
      maxDays: 14000,
      rareCareerRate: 0.01,
      longGapDays: 180,
      longSeedDays: 730,
      catalogFingerprint: 'abc',
      catalogFingerprintAlgorithm: 'sha256-json-events-v1'
    },
    metrics: {
      sample: { careersInShard: 2 },
      eventOccurrences: { E1: 3 },
      choiceOccurrences: { 'E1/A': 2 },
      coverage: {
        events: { missing: ['E2'] },
        choices: { missing: ['E1/B', 'E2/A'] }
      },
      schedulerExposure: {
        events: [
          { eventId: 'E1', selectedCareers: 2 },
          { eventId: 'E2', selectedCareers: 1 }
        ]
      }
    },
    sampleKeys: ['a:1', 'b:1'],
    results: [
      { profile: 'a', seed: 1, sequence: [{ eventId: 'E1' }, { eventId: 'E1' }] },
      { profile: 'b', seed: 1, sequence: [{ eventId: 'E1' }, { eventId: 'E2' }] }
    ],
    ...overrides
  };
}

test('catalog identity reconstructs exact event and choice ID sets', () => {
  const identity = catalogIdentity(report());
  assert.deepEqual(identity.eventIds, ['E1', 'E2']);
  assert.deepEqual(identity.choiceIds, ['E1/A', 'E1/B', 'E2/A']);
  assert.equal(identity.semanticFingerprint, 'abc');
});

test('event career rates count reachability once per career, not occurrences', () => {
  const rates = eventCareerRates(report());
  assert.equal(rates.E1, 1);
  assert.equal(rates.E2, 0.5);
});

test('compact reports preserve sample keys and event career reach from aggregate metrics', () => {
  const compact = report({ results: undefined });
  assert.equal(reportCareerCount(compact), 2);
  assert.deepEqual([...sampleKeys(compact)].sort(), ['a:1', 'b:1']);
  assert.deepEqual(eventCareerRates(compact), { E1: 1, E2: 0.5 });
});

test('sample and configuration helpers preserve paired comparison denominators', () => {
  const value = report();
  assert.equal(reportCareerCount(value), 2);
  assert.deepEqual([...sampleKeys(value)].sort(), ['a:1', 'b:1']);
  assert.deepEqual(setDiff(new Set(['a', 'b']), new Set(['b'])), ['a']);
  assert.equal(sameStringSet(new Set(['x', 'y']), new Set(['y', 'x'])), true);
  assert.equal(sameStringSet(new Set(['x']), new Set(['y'])), false);
  assert.deepEqual(comparableSimulationConfig(value), {
    profiles: ['a', 'b'],
    samplingDesign: 'paired_profile_seed_v1',
    baseSeed: 10,
    totalRequested: 2,
    cohortCount: 1,
    maxAge: 55,
    maxDays: 14000,
    rareCareerRate: 0.01,
    longGapDays: 180,
    longSeedDays: 730
  });
});

test('sampling design differences make simulation configs non-identical', () => {
  const paired = comparableSimulationConfig(report());
  const legacy = comparableSimulationConfig(report({
    configuration: { ...report().configuration, samplingDesign: undefined, cohortCount: undefined }
  }));
  assert.notDeepEqual(paired, legacy);
});
