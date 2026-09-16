import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildDeferredConsequenceReport, temporalFeasibility } from './audit-t52-deferred.mjs';

test('deferred chain: later consumer before finite seed expiry is feasible', () => {
  const result = temporalFeasibility([18, 26], [18, 20], [23, 26]);
  assert.equal(result.feasible, true);
  assert.equal(result.kind, 'strictly_deferred');
  assert.equal(result.earliestProducerAge, 18);
  assert.equal(result.earliestConsumptionAge, 23);
});

test('deferred chain: consumer starting after seed max age is impossible', () => {
  assert.deepEqual(
    temporalFeasibility([18, 20], [18, 20], [21, 23]),
    { feasible: false, reason: 'consumer_after_seed_expiry' }
  );
});

test('deferred chain: a consumer window entirely before the producer cannot consume that instance', () => {
  assert.deepEqual(
    temporalFeasibility([18, null], [23, 26], [18, 20]),
    { feasible: false, reason: 'consumer_window_before_producer' }
  );
});

test('deferred chain: producer starting after finite seed expiry is impossible', () => {
  assert.deepEqual(
    temporalFeasibility([18, 20], [21, 23], [21, 23]),
    { feasible: false, reason: 'producer_after_seed_expiry' }
  );
});

test('deferred chain: overlapping producer and consumer windows remain valid', () => {
  const result = temporalFeasibility([18, null], [18, 23], [20, 26]);
  assert.equal(result.feasible, true);
  assert.equal(result.kind, 'overlap_or_same_window');
  assert.equal(result.earliestConsumptionAge, 20);
});

test('choice eligibility using HAS_SEED_* is counted as a runtime deferred consumer', () => {
  const seed = { id: 'SEED_SYNTHETIC_CHOICE', ageWindow: [18, 26] };
  const producer = {
    id: 'EVT_SYNTH_PRODUCER',
    phase: 'rise',
    family: 'sport',
    ageWindow: [18, 20],
    choices: [],
    outcomes: [{
      id: 'CREATE_OUT',
      seedTransitions: [{ action: 'create', seedId: seed.id }]
    }]
  };
  const consumer = {
    id: 'EVT_SYNTH_CONSUMER',
    phase: 'prime',
    family: 'sport',
    ageWindow: [23, 26],
    choices: [{
      id: 'SEED_ONLY_OPTION',
      eligibility: [{ path: 'flags.HAS_SEED_SYNTHETIC_CHOICE', op: 'eq', value: true }]
    }],
    outcomes: []
  };

  const report = buildDeferredConsequenceReport([producer, consumer], [seed]);
  const row = report.rows[0];

  assert.equal(row.runtimeConsumerCount, 1);
  assert.equal(row.runtimeConsumers[0].eventId, consumer.id);
  assert.equal(row.runtimeConsumers[0].context, 'choice:SEED_ONLY_OPTION');
  assert.equal(row.strictDeferredPairCount, 1);
  assert.equal(row.impossibleRuntimeChain, false);
  assert.deepEqual(row.metadataOnlyReaders, []);
});

test('choice eligibility detects a producer→consumer chain that is only available after seed expiry', () => {
  const seed = { id: 'SEED_SYNTHETIC_EXPIRED_CHOICE', ageWindow: [18, 20] };
  const producer = {
    id: 'EVT_SYNTH_PRODUCER_EXP',
    phase: 'rise',
    family: 'sport',
    ageWindow: [18, 20],
    choices: [],
    outcomes: [{
      id: 'CREATE_OUT',
      seedTransitions: [{ action: 'create', seedId: seed.id }]
    }]
  };
  const consumer = {
    id: 'EVT_SYNTH_CONSUMER_EXP',
    phase: 'prime',
    family: 'sport',
    ageWindow: [21, 23],
    choices: [{
      id: 'TOO_LATE_OPTION',
      eligibility: [{ path: 'flags.HAS_SEED_SYNTHETIC_EXPIRED_CHOICE', op: 'eq', value: true }]
    }],
    outcomes: []
  };

  const report = buildDeferredConsequenceReport([producer, consumer], [seed]);
  assert.deepEqual(report.impossibleRuntimeChains, [seed.id]);
  assert.equal(report.rules.hardPass, false);
  assert.equal(report.rows[0].unreachableEdges[0].reason, 'consumer_after_seed_expiry');
});

test('event gateAlternatives using HAS_SEED_* are counted as runtime deferred consumers', () => {
  const seed = { id: 'SEED_SYNTHETIC_OR_ROUTE', ageWindow: [18, 26] };
  const producer = {
    id: 'EVT_SYNTH_OR_PRODUCER',
    phase: 'rise',
    family: 'team',
    ageWindow: [18, 20],
    choices: [],
    outcomes: [{
      id: 'CREATE_OUT',
      seedTransitions: [{ action: 'create', seedId: seed.id }]
    }]
  };
  const consumer = {
    id: 'EVT_SYNTH_OR_CONSUMER',
    phase: 'prime',
    family: 'team',
    ageWindow: [23, 26],
    gates: [],
    gateAlternatives: [
      [{ path: 'flags.HAS_SEED_SYNTHETIC_OR_ROUTE', op: 'eq', value: true }],
      [{ path: 'sport.form', op: 'gte', value: 80 }]
    ],
    choices: [],
    outcomes: []
  };

  const report = buildDeferredConsequenceReport([producer, consumer], [seed]);
  const row = report.rows[0];

  assert.equal(row.runtimeConsumerCount, 1);
  assert.equal(row.runtimeConsumers[0].eventId, consumer.id);
  assert.equal(row.runtimeConsumers[0].context, 'gateAlternative:0');
  assert.equal(row.strictDeferredPairCount, 1);
  assert.equal(row.impossibleRuntimeChain, false);
});

test('event gateAlternatives detect a seed route that exists only after seed expiry', () => {
  const seed = { id: 'SEED_SYNTHETIC_OR_EXPIRED', ageWindow: [18, 20] };
  const producer = {
    id: 'EVT_SYNTH_OR_PRODUCER_EXP',
    phase: 'rise',
    family: 'team',
    ageWindow: [18, 20],
    choices: [],
    outcomes: [{
      id: 'CREATE_OUT',
      seedTransitions: [{ action: 'create', seedId: seed.id }]
    }]
  };
  const consumer = {
    id: 'EVT_SYNTH_OR_CONSUMER_EXP',
    phase: 'prime',
    family: 'team',
    ageWindow: [21, 23],
    gateAlternatives: [
      [{ path: 'flags.HAS_SEED_SYNTHETIC_OR_EXPIRED', op: 'eq', value: true }]
    ],
    choices: [],
    outcomes: []
  };

  const report = buildDeferredConsequenceReport([producer, consumer], [seed]);
  assert.deepEqual(report.impossibleRuntimeChains, [seed.id]);
  assert.equal(report.rules.hardPass, false);
  assert.equal(report.rows[0].runtimeConsumers[0].context, 'gateAlternative:0');
  assert.equal(report.rows[0].unreachableEdges[0].reason, 'consumer_after_seed_expiry');
});

test('current catalog deferred audit has no structurally impossible runtime chain', () => {
  const report = JSON.parse(fs.readFileSync('analysis/T5.2/deferred-consequences.json', 'utf8'));
  assert.equal(report.rules.noUnknownReferences, true);
  assert.equal(report.rules.noImpossibleRuntimeChains, true, JSON.stringify(report.impossibleRuntimeChains));
  assert.equal(report.rules.hardPass, true);
  assert.equal(report.summary.catalogSeeds, 210);
  assert.equal(report.impossibleRuntimeChains.length, 0);
});
