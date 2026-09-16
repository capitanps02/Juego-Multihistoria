import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { temporalFeasibility } from './audit-t52-deferred.mjs';

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

test('current catalog deferred audit has no structurally impossible runtime chain', () => {
  const report = JSON.parse(fs.readFileSync('analysis/T5.2/deferred-consequences.json', 'utf8'));
  assert.equal(report.rules.noUnknownReferences, true);
  assert.equal(report.rules.noImpossibleRuntimeChains, true, JSON.stringify(report.impossibleRuntimeChains));
  assert.equal(report.rules.hardPass, true);
  assert.equal(report.summary.catalogSeeds, 210);
  assert.equal(report.impossibleRuntimeChains.length, 0);
});
