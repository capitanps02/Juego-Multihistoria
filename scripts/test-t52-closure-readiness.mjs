import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildClosureReadinessReport } from './audit-t52-closure-readiness.mjs';

function fixture({ producerStatus = 'verified', consumerStatus = 'verified', consumerKind = 'condition' } = {}) {
  const seedId = 'SEED_FIXTURE_CLOSURE';
  const lifecycle = {
    summary: { catalogSeeds: 1 },
    seeds: [{
      id: seedId,
      description: 'fixture',
      ageWindow: [18, 30],
      scope: { club: 'career', season: 'career' },
      runtimeCreateEvents: ['EVT_PRODUCER'],
      lifecycle: {
        hasRuntimeProducer: true,
        hasExplicitTerminalTransition: false,
        finiteAgeWindow: true,
        explicitExpiryAssignments: 0,
        openEndedWithoutTerminalTransition: false
      }
    }]
  };
  const handoff = {
    ownership: [{ owner: 't51/fixture', seeds: [seedId] }]
  };
  const simulation = consumerKind === 'simulation';
  const deferred = {
    rows: [{
      id: seedId,
      runtimeConsumerCount: 1,
      runtimeEventConsumerCount: simulation ? 0 : 1,
      runtimeSimulationConsumerCount: simulation ? 1 : 0,
      runtimeEventConsumers: simulation ? [] : [{ eventId: 'EVT_CONSUMER', kind: consumerKind }],
      feasiblePairCount: 1,
      strictDeferredPairCount: 1,
      feasiblePairs: [{
        producerEventId: 'EVT_PRODUCER',
        consumerEventId: simulation ? '@simulation:fixture' : 'EVT_CONSUMER',
        consumerKind,
        feasible: true,
        kind: 'strictly_deferred'
      }],
      proofObligations: { clubContinuity: false, seasonContinuity: false },
      impossibleRuntimeChain: false
    }]
  };
  const events = [
    { id: 'EVT_PRODUCER', canonStatus: producerStatus },
    { id: 'EVT_CONSUMER', canonStatus: consumerStatus }
  ];
  return { lifecycle, handoff, deferred, events };
}

test('closure readiness: verified producer and verified event consumer produce verified feasible evidence without auto-closing canon', () => {
  const report = buildClosureReadinessReport(fixture());
  const row = report.rows[0];
  assert.equal(row.topology, 'producer_consumer_feasible');
  assert.equal(row.verifiedFeasiblePairCount, 1);
  assert.deepEqual(row.verifiedProducerEventIds, ['EVT_PRODUCER']);
  assert.deepEqual(row.verifiedRuntimeEventConsumerIds, ['EVT_CONSUMER']);
  assert.equal(row.canonicalClosure, 'requires_owner_classification');
  assert.equal(row.nextAction, 'owner_classify_final_canonical_disposition');
  assert.equal(report.rules.structuralPass, true);
  assert.equal(report.rules.canonicalClosureComplete, false);
});

test('closure readiness: technical adaptation endpoint is not promoted to verified canonical evidence', () => {
  const report = buildClosureReadinessReport(fixture({ consumerStatus: 'technical_adaptation' }));
  const row = report.rows[0];
  assert.equal(row.topology, 'producer_consumer_feasible');
  assert.equal(row.verifiedFeasiblePairCount, 0);
  assert.deepEqual(row.verifiedRuntimeEventConsumerIds, []);
  assert.equal(row.nextAction, 'upgrade_runtime_endpoints_to_verified_canonical_evidence');
});

test('closure readiness: simulation-only consequence remains runtime evidence, not final canonical disposition', () => {
  const report = buildClosureReadinessReport(fixture({ consumerKind: 'simulation' }));
  const row = report.rows[0];
  assert.equal(row.topology, 'producer_consumer_feasible');
  assert.equal(row.runtimeSimulationConsumerCount, 1);
  assert.equal(row.runtimeEventConsumerCount, 0);
  assert.equal(row.verifiedFeasiblePairCount, 0);
  assert.equal(row.nextAction, 'verify_simulation_effect_is_sufficient_canonical_consequence');
});

test('closure readiness: real catalog is covered 210/210 without structurally impossible chains', () => {
  const report = JSON.parse(fs.readFileSync('analysis/T5.2/closure-readiness.json', 'utf8'));
  assert.equal(report.summary.catalogSeeds, 210);
  assert.equal(report.summary.rows, 210);
  assert.equal(report.rules.exactCoverage, true);
  assert.equal(report.rules.noUnknownOwners, true);
  assert.equal(report.rules.noMissingDeferredRows, true);
  assert.equal(report.rules.noImpossibleRuntimeChains, true, JSON.stringify(report.impossibleRuntimeChains));
  assert.equal(report.rules.structuralPass, true);
  assert.equal(report.rules.canonicalClosureComplete, false);
  assert.equal(report.summary.canonicalClosureClassified, 0);
  assert.equal(report.summary.canonicalClosurePending, 210);
  assert.equal(report.summary.simulationConsumerSeeds, 15);
  assert.equal(Object.values(report.summary.topologyCounts).reduce((sum, value) => sum + value, 0), 210);
  assert.equal(Object.values(report.ownerSummary).reduce((sum, value) => sum + value.total, 0), 210);
});
