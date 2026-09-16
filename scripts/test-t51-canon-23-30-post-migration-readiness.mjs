import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const manifest = JSON.parse(fs.readFileSync('analysis/T5.1/canon-23-30-post-migration-readiness.json', 'utf8'));
const audit = JSON.parse(fs.readFileSync('analysis/T5.1/canon-23-30.json', 'utf8'));
const readiness = JSON.parse(fs.readFileSync('analysis/T5.1/canon-23-26-implementation-readiness.json', 'utf8'));
const migration = JSON.parse(fs.readFileSync('analysis/T5.1/canon-23-30-migration-handoff.json', 'utf8'));

const sorted = values => [...values].sort();
const unique = values => new Set(values).size === values.length;
const phase23 = manifest.batches['T5.10_T5.14_23_26'];
const phase26 = manifest.batches['T5.15_T5.21_26_30'];

test('23-26 execution split stays exactly aligned with integrated readiness', () => {
  const local = readiness.events.filter(row => row.status === 'content_ready_waiting_identity').map(row => row.id);
  const blocked = readiness.events.filter(row => row.status === 'cross_workstream_dependency').map(row => row.id);
  assert.equal(local.length, 10);
  assert.equal(blocked.length, 5);
  assert.deepEqual(sorted(phase23.sceneLevelAfterMigration), sorted(local));
  assert.deepEqual(sorted(phase23.crossWorkstreamBlocked.map(row => row.id)), sorted(blocked));
  assert.match(phase23.state, /migration_mechanism_ready/);
});

test('T5.10-T5.14 proposed small batches partition all 15 pending principals exactly once', () => {
  const proposed = phase23.proposedSmallBatches.flatMap(row => row.events);
  const pending = audit.blocks['23_26'].needs_reimplementation;
  assert.equal(proposed.length, 15);
  assert.equal(unique(proposed), true);
  assert.deepEqual(sorted(proposed), sorted(pending));
  assert.deepEqual(phase23.proposedSmallBatches.map(row => row.id), [
    'T5.10', 'T5.11', 'T5.12', 'T5.13', 'T5.14'
  ]);
});

test('first three scene-level batches are exact-id distinct-scene migration cases', () => {
  const collisions = new Set(migration.principals.exactIdSemanticCollision.ids);
  const firstThree = phase23.proposedSmallBatches.slice(0, 3);
  const ids = firstThree.flatMap(row => row.events);
  assert.equal(ids.length, 10);
  assert.ok(ids.every(id => collisions.has(id)));
  assert.ok(firstThree.every(row => /clear canonical SEEN and cooldown/.test(row.routeAction)));
});

test('26-30 exact-id repairs and fresh canon classes are derived from the audit', () => {
  const phase = audit.blocks['26_30'];
  const candidateCanon = phase.requires_manual_review_candidates.map(row => row.canonicalId);
  const candidateLegacy = phase.requires_manual_review_candidates.map(row => row.engineId);

  assert.equal(phase.needs_reimplementation.length, 25);
  assert.deepEqual(sorted(phase26.exactIdReimplementations), sorted(phase.needs_reimplementation));

  const fresh = [...phase.canonical_missing, ...candidateCanon];
  assert.equal(fresh.length, 26);
  assert.deepEqual(sorted(phase26.canonicalFreshWithoutLegacyInheritance), sorted(fresh));

  const legacy = [...phase.engine_only_noncanonical, ...candidateLegacy];
  assert.equal(legacy.length, 26);
  assert.deepEqual(sorted(phase26.legacyHistoryOnly), sorted(legacy));
});

test('explicit non-mappings remain non-aliases', () => {
  const expected = audit.blocks['26_30'].requires_manual_review_candidates.map(row => ({
    canonicalId: row.canonicalId,
    legacyId: row.engineId
  }));
  assert.deepEqual(phase26.explicitNonMappings, expected);
  assert.deepEqual(manifest.globalInvariants.approvedAliases, []);
  assert.equal(manifest.globalInvariants.noSilentAliases, true);
});

test('migration collision counts preserve the integrated handoff', () => {
  assert.equal(manifest.summary.principalReimplementations, migration.summary.exactIdSemanticCollisionPrincipals);
  assert.equal(manifest.summary.canonicalPrincipalsMissingOrUnapprovedFresh, migration.summary.canonicalPrincipalsWithoutLegacyInheritance);
  assert.equal(manifest.summary.legacyPrincipalIdsHistoryOnly, migration.summary.legacyPrincipalsKeepHistoryOnly);
  assert.equal(manifest.summary.exactIdConditionalCollisions, migration.summary.exactIdSemanticCollisionConditionals);
  assert.equal(manifest.summary.age26FutureSeedOriginMoves, migration.summary.age26SeedOriginMoves);
  assert.equal(manifest.summary.t53NpcRefDebtCallbacks, migration.summary.t53TextualNpcMentionDebtInRange);
  assert.deepEqual(manifest.conditionalExecution.safeSameSceneMappings, []);
});

test('integrated migration mechanism requires a route with exact-id isolation in each changed target', () => {
  assert.equal(manifest.integrationState.sessionContentMigration, 'integrated_mechanism_route_required_per_changed_target_identity');
  assert.match(manifest.integrationState.sessionContentMigrationGate, /PRE_T51_CONTENT_IDENTITY -> target contentIdentity route/);
  assert.ok(manifest.releaseGate.requiredBeforeFirstActive23_30DefinitionChange.some(x => /registers a pre-T5.1 -> target contentIdentity route/.test(x)));
  assert.ok(manifest.releaseGate.requiredBeforeFirstActive23_30DefinitionChange.some(x => /clears canonical SEEN and cooldown/.test(x)));
  assert.equal(manifest.globalInvariants.legacyHistoryRewritten, false);
  assert.equal(manifest.globalInvariants.legacySeedOriginRewritten, false);
  assert.equal(manifest.globalInvariants.legacySeenOrCooldownSuppressesDistinctCanonicalScene, false);
});

test('integrated T5.3 boundary is explicit and never inferred from refs or seeds', () => {
  assert.equal(manifest.integrationState.t53NpcKnowledge, 'integrated');
  assert.equal(manifest.conditionalExecution.t53NowIntegrated, true);
  assert.equal(manifest.globalInvariants.npcRefsImpliesKnowledge, false);
  assert.equal(manifest.globalInvariants.seedPresenceImpliesNpcKnowledge, false);
});

test('seed policy keeps the canonical handoff counts and historical provenance rule', () => {
  assert.equal(manifest.seedPolicy.ownerSeedCount, 59);
  assert.equal(manifest.seedPolicy.withoutConsumer, 30);
  assert.equal(manifest.seedPolicy.openEnded, 35);
  assert.equal(manifest.seedPolicy.age26OriginMoves, 11);
  assert.match(manifest.seedPolicy.rule, /existing SeedInstance\.originEvent remains historical/);
  assert.equal(manifest.globalInvariants.artificialSeedClosureAllowed, false);
});

test('QA seed-read ratchet snapshot is a unique 14-pair external dependency', () => {
  const pairs = manifest.qaSeedReadRatchet.pairs;
  assert.equal(manifest.qaSeedReadRatchet.sourcePr, 32);
  assert.equal(manifest.qaSeedReadRatchet.integrationStatus, 'open_not_in_main_at_manifest_time');
  assert.equal(pairs.length, 14);
  assert.equal(unique(pairs.map(row => `${row.eventId}::${row.seedId}`)), true);
  assert.ok(pairs.every(row => /^CEVT_(23|24|25)_/.test(row.eventId)));
  assert.match(manifest.qaSeedReadRatchet.meaning, /adding new undeclared seed reads is not/);
});

test('protected coordination trackers stay outside this workstream', () => {
  assert.deepEqual(manifest.releaseGate.protectedFiles, [
    'project/PLAN_PASADAS.md',
    'analysis/2026-09-11/plan-seguimiento.json'
  ]);
});
