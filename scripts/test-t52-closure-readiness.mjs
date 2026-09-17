import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildClosureReadinessReport } from './audit-t52-closure-readiness.mjs';
import { validateSeedClosureClassifications } from './t52-seed-closure-classifications.mjs';

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

function classification(disposition, extra = {}) {
  return {
    seedId: 'SEED_FIXTURE_CLOSURE',
    owner: 't51/fixture',
    disposition,
    rationale: 'Canonical owner explicitly approved this disposition with sufficient evidence.',
    evidenceRefs: ['owner-audit.md#seed-fixture'],
    ...extra
  };
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

test('closure classification: verified canonical chain is accepted only through explicit owner entry', () => {
  const report = buildClosureReadinessReport({
    ...fixture(),
    classifications: [classification('canonical_chain', {
      producerEventId: 'EVT_PRODUCER',
      consumerEventId: 'EVT_CONSUMER'
    })]
  });
  const row = report.rows[0];
  assert.equal(report.rules.classificationRegistryValid, true);
  assert.equal(report.summary.canonicalClosureClassified, 1);
  assert.equal(report.summary.canonicalClosurePending, 0);
  assert.equal(report.rules.canonicalClosureComplete, true);
  assert.equal(row.canonicalClosure, 'canonical_chain');
  assert.equal(row.nextAction, 'canonical_closure_classified');
  assert.equal(row.canonicalClosureEvidence.producerEventId, 'EVT_PRODUCER');
});

test('closure classification: technical-adaptation endpoint cannot be certified as canonical chain', () => {
  const report = buildClosureReadinessReport({
    ...fixture({ consumerStatus: 'technical_adaptation' }),
    classifications: [classification('canonical_chain', {
      producerEventId: 'EVT_PRODUCER',
      consumerEventId: 'EVT_CONSUMER'
    })]
  });
  assert.equal(report.rules.classificationRegistryValid, false);
  assert.equal(report.rules.structuralPass, false);
  assert.equal(report.summary.canonicalClosureClassified, 0);
  assert.equal(report.classificationRegistry.errors[0].code, 'canonical_chain_not_verified');
});

test('closure classification: owner mismatch fails closed', () => {
  const bad = classification('canonical_chain', {
    owner: 't51/wrong-owner',
    producerEventId: 'EVT_PRODUCER',
    consumerEventId: 'EVT_CONSUMER'
  });
  const report = buildClosureReadinessReport({ ...fixture(), classifications: [bad] });
  assert.equal(report.rules.structuralPass, false);
  assert.equal(report.classificationRegistry.errors[0].code, 'owner_mismatch');
});

test('closure classification: finite age expiry can be owner-classified when runtime evidence supports the basis', () => {
  const report = buildClosureReadinessReport({
    ...fixture(),
    classifications: [classification('canonical_expiry', { expiryBasis: 'age' })]
  });
  assert.equal(report.rules.classificationRegistryValid, true);
  assert.equal(report.rows[0].canonicalClosure, 'canonical_expiry');
  assert.equal(report.rows[0].canonicalClosureEvidence.expiryBasis, 'age');
});

test('closure classification: unsupported expiry basis fails closed', () => {
  const report = buildClosureReadinessReport({
    ...fixture(),
    classifications: [classification('canonical_expiry', { expiryBasis: 'club' })]
  });
  assert.equal(report.rules.classificationRegistryValid, false);
  assert.equal(report.classificationRegistry.errors[0].code, 'canonical_expiry_basis_not_supported_by_runtime_evidence');
});

test('closure classification: club/season expiry cannot be certified from scope metadata alone', () => {
  const scoped = fixture();
  scoped.lifecycle.seeds[0].scope.club = 'origin_club';
  const report = buildClosureReadinessReport({
    ...scoped,
    classifications: [classification('canonical_expiry', { expiryBasis: 'club' })],
    scopeProofs: []
  });
  assert.equal(report.rows[0].clubScoped, true);
  assert.equal(report.rules.classificationRegistryValid, false);
  assert.equal(report.rules.structuralPass, false);
  assert.equal(report.classificationRegistry.errors[0].code, 'canonical_expiry_scope_proof_required');
});

test('closure classification: a matching registered scope proof unlocks club expiry validation', () => {
  const scoped = fixture();
  scoped.lifecycle.seeds[0].scope.club = 'origin_club';
  const evidence = buildClosureReadinessReport({ ...scoped, scopeProofs: [] });
  const result = validateSeedClosureClassifications(
    [classification('canonical_expiry', { expiryBasis: 'club' })],
    evidence.rows,
    {
      scopeProofs: [{
        seedId: 'SEED_FIXTURE_CLOSURE',
        scope: 'origin_club',
        proofType: 'scope_expiry_blocks_consumer'
      }]
    }
  );
  assert.equal(result.valid, true, JSON.stringify(result.errors));
  assert.equal(result.accepted.length, 1);
});

test('closure classification: build report consumes the integrated scope proof registry by default', () => {
  const scoped = fixture();
  scoped.lifecycle.seeds[0].id = 'SEED_PRIVATE_CHAT';
  scoped.lifecycle.seeds[0].scope.club = 'origin_club';
  scoped.handoff.ownership[0].seeds = ['SEED_PRIVATE_CHAT'];
  scoped.deferred.rows[0].id = 'SEED_PRIVATE_CHAT';
  const report = buildClosureReadinessReport({
    ...scoped,
    classifications: [{
      seedId: 'SEED_PRIVATE_CHAT',
      owner: 't51/fixture',
      disposition: 'canonical_expiry',
      expiryBasis: 'club',
      rationale: 'Canonical owner explicitly approved club-scope expiry with integrated continuity evidence.',
      evidenceRefs: ['analysis/T5.2/SCOPE_PROOFS.md#seed_private_chat']
    }]
  });
  assert.equal(report.summary.integratedScopeProofs > 0, true);
  assert.equal(report.rules.classificationRegistryValid, true, JSON.stringify(report.classificationRegistry.errors));
  assert.equal(report.rows[0].canonicalClosure, 'canonical_expiry');
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
  assert.equal(report.rules.classificationRegistryValid, true, JSON.stringify(report.classificationRegistry.errors));
  assert.equal(report.rules.structuralPass, true);
  assert.equal(report.summary.canonicalClosureClassified, report.classificationRegistry.accepted);
  assert.equal(report.summary.canonicalClosureClassified + report.summary.canonicalClosurePending, 210);
  assert.equal(report.rules.canonicalClosureComplete, report.summary.canonicalClosurePending === 0);
  assert.equal(report.summary.integratedScopeProofs > 0, true);
  assert.equal(report.summary.simulationConsumerSeeds, 15);
  assert.equal(Object.values(report.summary.topologyCounts).reduce((sum, value) => sum + value, 0), 210);
  assert.equal(Object.values(report.ownerSummary).reduce((sum, value) => sum + value.total, 0), 210);
  assert.equal(Object.values(report.ownerSummary).reduce((sum, value) => sum + value.closureClassified, 0), report.summary.canonicalClosureClassified);
});
