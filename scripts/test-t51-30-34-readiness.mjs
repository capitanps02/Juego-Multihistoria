import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const readiness = JSON.parse(fs.readFileSync('analysis/T5.1/canon-30-34-implementation-readiness.json', 'utf8'));
const audit = JSON.parse(fs.readFileSync('analysis/T5.1/canon-30-34.json', 'utf8'));
const freeze = JSON.parse(fs.readFileSync('qa/fixtures/t5.1/pre-t51-content-manifest.json', 'utf8'));
const seedLifecycle = JSON.parse(fs.readFileSync('analysis/T5.1/canon-30-34-seed-lifecycle.json', 'utf8'));
const migrationHandoff = JSON.parse(fs.readFileSync('analysis/T5.1/canon-30-34-migration-handoff.json', 'utf8'));
const parityEvidence = JSON.parse(fs.readFileSync('analysis/T5.1/canon-30-34-parity-evidence.json', 'utf8'));
const indexSource = fs.readFileSync('src/content/events/30_34/index.ts', 'utf8');
const eventGateSource = fs.readFileSync('src/narrative/event-gates.ts', 'utf8');
const renewalFactSource = fs.readFileSync('src/simulation/club-contract-intent.ts', 'utf8');
const seedCatalogSource = fs.readFileSync('src/catalog/seeds.ts', 'utf8');

const byStatus = status => readiness.events.filter(event => event.status === status);
const ids = rows => rows.map(row => row.canonicalId).sort();

test('T5.1 30-34 readiness queda anclado al freeze pre-T5.1 y declara el target actual sin apropiarse del route', () => {
  assert.equal(readiness.phase, '30_34');
  assert.equal(readiness.baselineFreeze.status, 'closed');
  assert.equal(readiness.baselineFreeze.contentIdentity, freeze.contentIdentity);
  assert.equal(readiness.baselineFreeze.contentIdentity, '2e07efd2ea99c4e9ec4c2b20ae89664204f76db2c55a72d567208799c01bccff');
  assert.equal(readiness.currentTarget.contentIdentity, migrationHandoff.observedTargetContentIdentity);
  assert.equal(readiness.currentTarget.workstreamMayRegisterRoute, false);
  assert.equal(readiness.currentTarget.freezeStatus, 'pending_coordination_integration');
});

test('T5.1 30-34 audit, readiness y migration handoff comparten el lineage vigente', () => {
  const migrationDependency = audit.globalDependencies.find(row => row.id === 'DEP_T51_EVENT_ID_MIGRATION');
  assert.ok(migrationDependency);
  assert.match(migrationDependency.description, new RegExp(migrationHandoff.sourceContentIdentity));
  assert.match(migrationDependency.description, new RegExp(migrationHandoff.observedTargetContentIdentity));
  assert.equal(audit.integrationStatus.contentMigrationSourceIdentity, migrationHandoff.sourceContentIdentity);
  assert.equal(audit.integrationStatus.targetContentIdentity, migrationHandoff.observedTargetContentIdentity);
  assert.match(audit.integrationStatus.contentMigrationTargetFreeze, new RegExp(migrationHandoff.observedTargetContentIdentity));
  assert.equal(readiness.base, `main@${audit.integrationStatus.syncedBaselineMain}`);
  assert.equal(audit.globalDependencies.some(row => row.id === 'DEP_T51_T510_TEST_LINEAGE_STALENESS'), false);
  assert.equal(audit.integrationStatus.sharedT510Test, 'resolved_in_main_lineage_aware');
});

test('T5.1 30-34 parity evidence usa el mismo source/target que el handoff vigente', () => {
  const contract = parityEvidence.events.EVT_30_CON_001;
  assert.ok(contract);
  assert.equal(contract.dimensions.saveContinuity.sourceContentIdentity, migrationHandoff.sourceContentIdentity);
  assert.equal(contract.dimensions.saveContinuity.targetContentIdentity, migrationHandoff.observedTargetContentIdentity);
  assert.equal(contract.dimensions.saveContinuity.routeRegistrationOwner, 'coordination/integration');
  assert.equal(contract.dimensions.saveContinuity.targetFreezeRequired, true);
});

test('T5.1 30-34 parity evidence no materializa SEED_LAST_PEAK_CONTRACT sin definición runtime', () => {
  const contract = parityEvidence.events.EVT_30_CON_001;
  assert.deepEqual(contract.dimensions.seeds.missingOrUnclassified, ['SEED_LAST_PEAK_CONTRACT']);
  assert.equal(seedCatalogSource.includes('SEED_LAST_PEAK_CONTRACT'), false);
  assert.equal(contract.promotionAllowed, false);
});

test('T5.1 30-34 readiness particiona exactamente los 50 principales en 27/18/4 + 1 addition', () => {
  assert.equal(readiness.events.length, 50);
  assert.equal(new Set(readiness.events.map(event => event.canonicalId)).size, 50);
  assert.equal(readiness.summary.totalCanonicalPrincipals, 50);
  assert.equal(byStatus('stable_semantics_implemented_shared_parity_gap').length, 27);
  assert.equal(byStatus('shifted_identity_requires_migration').length, 18);
  assert.equal(byStatus('canonical_missing_requires_coordinated_addition').length, 4);\n  assert.equal(byStatus('canonical_addition_implemented_shared_parity_gap').length, 1);
  assert.equal(readiness.summary.verifiedSameIdentity, 0);
  assert.equal(readiness.summary.approvedAliases, 0);
  assert.equal(readiness.summary.safeStableIdSetComplete, true);
});

test('T5.1 30-34 readiness: los 27 estables coinciden con la implementación auditada', () => {
  const stable = ids(byStatus('stable_semantics_implemented_shared_parity_gap'));
  assert.deepEqual(stable, [...audit.implementationProgress.stableIdReimplemented].sort());
  for (const event of byStatus('stable_semantics_implemented_shared_parity_gap')) {
    assert.equal(event.engineId, event.canonicalId, `${event.canonicalId}: un estable no puede apuntar a otro ID`);
    assert.ok(event.dependencies.includes('PARITY'));
  }
});

test('T5.1 30-34 readiness: los 18 desplazados se derivan del inventario estricto y exigen migración', () => {
  const expected = audit.principals
    .filter(event => event.status === 'needs_reimplementation' && event.engineId && event.engineId !== event.canonicalId)
    .map(event => event.canonicalId)
    .sort();
  const shifted = byStatus('shifted_identity_requires_migration');
  assert.equal(expected.length, 18);
  assert.deepEqual(ids(shifted), expected);
  assert.equal(shifted.every(event => event.dependencies.includes('CONTENT_IDENTITY_MIGRATION')), true);
  assert.equal(readiness.events.find(event => event.canonicalId === 'EVT_30_BRIDGE_001').dependencies.includes('BRIDGE_PRIORITY'), true);
});

test('T5.1 30-34 readiness: los cuatro missing restantes coinciden con el audit y no inventan engineId', () => {
  const expected = audit.principals.filter(event => event.status === 'canonical_missing').map(event => event.canonicalId).sort();
  const missing = byStatus('canonical_missing_requires_coordinated_addition');
  assert.deepEqual(ids(missing), expected);
  assert.equal(missing.length, 4);
  assert.equal(missing.every(event => event.engineId === null), true);
  assert.equal(missing.every(event => event.dependencies.includes('COORDINATED_ADDITION')), true);
});

test('T5.1 30-34 readiness conserva tres writers missing y registra el writer canónico ya implementado', () => {
  const expected = new Map([
    ['SEED_ROLE_COMMUNICATION', 'EVT_30_CCH_001'],
    ['SEED_FALSE_ULTIMATUM', 'EVT_30_PRS_001'],
    ['SEED_NATIONAL_ABSENCE', 'EVT_30_NAT_002'],
    ['SEED_SPECIALIST_BIGCLUB', 'EVT_30_JAN_001']
  ]);

  assert.equal(readiness.summary.canonicalMissingWithOrphanSeedWriterOwnership, 3);
  assert.equal(readiness.seedWriterBatch.withoutRuntimeProducer, 3);
  assert.equal(readiness.seedWriterBatch.mappings.length, 3);
  assert.equal(seedLifecycle.orphanCanonicalMappings.length, 3);\n  assert.deepEqual(seedLifecycle.resolvedCanonicalWriters.map(row => row.seed), ['SEED_ROLE_COMMUNICATION']);

  for (const mapping of readiness.seedWriterBatch.mappings) {
    assert.equal(expected.get(mapping.seed), mapping.canonicalEventId, `${mapping.seed}: writer canónico inesperado`);
    const event = readiness.events.find(row => row.canonicalId === mapping.canonicalEventId);
    assert.ok(event);
    assert.equal(event.status, 'canonical_missing_requires_coordinated_addition');
    assert.ok(event.dependencies.includes('CANONICAL_SEED_WRITER'));
    assert.equal(event.writesSeed, mapping.seed);
  }

  const communication = readiness.events.find(event => event.canonicalId === 'EVT_30_CCH_001');\n  assert.equal(communication.status, 'canonical_addition_implemented_shared_parity_gap');\n  assert.equal(communication.engineId, 'EVT_30_CCH_001');\n  assert.equal(communication.writesSeed, 'SEED_ROLE_COMMUNICATION');\n\n  const role = readiness.events.find(event => event.canonicalId === 'EVT_31_ROLE_001');
  assert.ok(role.dependencies.includes('SPORT_AUTHORITY'));
  assert.equal(role.dependencies.includes('CANONICAL_SEED_WRITER'), false);
});

test('T5.1 30-34 readiness consume OR gates y el hecho causal de renovación ya disponibles', () => {
  assert.match(eventGateSource, /gateAlternatives/);
  assert.match(eventGateSource, /alternatives\.some/);
  assert.match(renewalFactSource, /clubWantsRenewal/);
  assert.match(readiness.architectureEvidence.orGates, /EVT_30_CON_001 consumes it directly/);
  assert.match(readiness.architectureEvidence.renewalIntent, /facts\.clubWantsRenewal/);

  const contract = readiness.events.find(event => event.canonicalId === 'EVT_30_CON_001');
  assert.ok(contract);
  assert.deepEqual(contract.dependencies, ['PARITY']);
  assert.match(indexSource, /facts\.clubWantsRenewal/);
  assert.doesNotMatch(indexSource, /preserveUnmodelledTriggerBranches/);

  const dependencyIds = audit.globalDependencies.map(dependency => dependency.id);
  assert.equal(dependencyIds.includes('DEP_T51_RENEWAL_INTENT_FACT'), false);
  assert.equal(dependencyIds.includes('DEP_T51_OR_GATES'), false);
  assert.equal(audit.integrationStatus.sharedOrGateContract, 'available_in_main');
  assert.equal(audit.integrationStatus.renewalIntentFact, 'available_in_main_and_consumed');
});

test('T5.1 30-34 readiness no convierte deuda en canon verificado ni alias aprobado', () => {
  const allowed = new Set([
    'stable_semantics_implemented_shared_parity_gap',
    'shifted_identity_requires_migration',
    'canonical_missing_requires_coordinated_addition'
  ]);
  assert.equal(readiness.events.every(event => allowed.has(event.status)), true);
  assert.equal(readiness.events.some(event => event.status === 'verified_same_identity'), false);
  assert.equal(readiness.events.some(event => event.status === 'approved_alias'), false);
});
