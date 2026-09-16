import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const report = JSON.parse(fs.readFileSync('analysis/T5.1/canon-23-30.json', 'utf8'));
const conditionals = JSON.parse(fs.readFileSync('analysis/T5.1/canon-23-30-conditionals.json', 'utf8'));
const handoff = JSON.parse(fs.readFileSync('analysis/T5.1/canon-23-30-migration-handoff.json', 'utf8'));

const sorted = (values) => [...values].sort();
const unique = (values) => new Set(values).size === values.length;

const candidateCanon = report.blocks['26_30'].requires_manual_review_candidates.map((row) => row.canonicalId);
const candidateEngine = report.blocks['26_30'].requires_manual_review_candidates.map((row) => row.engineId);

test('T51 23-30 migration handoff is deliberately zero-alias', () => {
  assert.deepEqual(handoff.invariants.approvedSameSceneMappings, []);
  assert.deepEqual(handoff.invariants.approvedAliases, []);
  assert.equal(handoff.invariants.legacyHistoryRewrittenAsCanonical, false);
  assert.equal(handoff.invariants.legacyPendingReboundToNewDefinition, false);
  assert.equal(handoff.invariants.legacySeenSuppressesNonEquivalentCanonical, false);
  assert.equal(handoff.invariants.legacyCooldownSuppressesNonEquivalentCanonical, false);
  assert.equal(handoff.invariants.migrationConsumesRng, false);
  assert.equal(handoff.invariants.migrationSchedulesEvents, false);
});

test('principal migration classes are derived exactly from the integrated audit', () => {
  const collisions = [
    ...report.blocks['23_26'].needs_reimplementation,
    ...report.blocks['26_30'].needs_reimplementation,
  ];
  assert.equal(collisions.length, 40);
  assert.deepEqual(sorted(handoff.principals.exactIdSemanticCollision.ids), sorted(collisions));

  const canonicalWithoutLegacy = [
    ...report.blocks['26_30'].canonical_missing,
    ...candidateCanon,
  ];
  assert.equal(canonicalWithoutLegacy.length, 26);
  assert.deepEqual(
    sorted([
      ...handoff.principals.canonicalWithoutLegacyInheritance.canonicalMissingIds,
      ...handoff.principals.canonicalWithoutLegacyInheritance.unapprovedCandidateCanonicalIds,
    ]),
    sorted(canonicalWithoutLegacy),
  );

  const legacyKeepHistory = [
    ...report.blocks['26_30'].engine_only_noncanonical,
    ...candidateEngine,
  ];
  assert.equal(legacyKeepHistory.length, 26);
  assert.deepEqual(
    sorted([
      ...handoff.principals.legacyKeepHistoryOnly.engineOnlyIds,
      ...handoff.principals.legacyKeepHistoryOnly.unapprovedCandidateLegacyIds,
    ]),
    sorted(legacyKeepHistory),
  );

  assert.deepEqual(
    sorted(handoff.principals.verifiedSameIdentity.ids),
    sorted(report.blocks['23_26'].verified_same_identity),
  );
});

test('all four title/lineage candidates remain explicit non-mappings', () => {
  assert.deepEqual(
    handoff.principals.explicitNonMappings.map(({ canonicalId, legacyId }) => ({ canonicalId, engineId: legacyId })),
    report.blocks['26_30'].requires_manual_review_candidates,
  );
  assert.ok(handoff.principals.explicitNonMappings.every((row) => row.sameSceneMigrationAllowed === false));
});

test('all exact-id callbacks that require rewrite are treated as semantic collisions', () => {
  const exactIds = conditionals.records
    .filter((row) => row.identityDisposition === 'exact_id')
    .map((row) => row.canonicalId);
  assert.equal(exactIds.length, 25);
  assert.deepEqual(sorted(handoff.conditionals.exactIdSemanticCollisionIds), sorted(exactIds));
  assert.deepEqual(handoff.conditionals.safeDirectSameSceneMappings, []);
});

test('exact-id semantic collisions protect both seen and cooldown provenance', () => {
  assert.match(handoff.principals.exactIdSemanticCollision.migrationAction, /cooldown/i);
  assert.match(handoff.conditionals.migrationAction, /cooldown/i);
  assert.match(handoff.principals.canonicalWithoutLegacyInheritance.migrationAction, /cooldown/i);
  assert.ok(handoff.requiredMigrationAssertions.some((line) => /eventCooldowns/.test(line)));
});

test('age-26 seed chronology changes future producers without rewriting historical origins', () => {
  const moves = handoff.age26SeedChronology.originMoves;
  assert.equal(moves.length, 11);
  assert.equal(unique(moves.map((row) => row.seed)), true);
  assert.ok(moves.every((row) => row.newMinAge === 26));
  assert.ok(moves.every((row) => row.historicalOriginRewriteAuthorized === false));
  assert.deepEqual(handoff.age26SeedChronology.canonicalChain, [
    'EVT_26_EUR_001',
    'SEED_BIG_GAME_BENCH',
    'EVT_26_FINAL_001',
    'SEED_FINAL_BENCH',
  ]);
});

test('T5.3 callback debt is recorded as a dependency, not silently patched', () => {
  const debt = handoff.t53Dependency.textualNpcMentionsMissingRefs;
  assert.equal(handoff.t53Dependency.integrationStatus, 'not_integrated_at_handoff_time');
  assert.equal(debt.length, 10);
  assert.equal(unique(debt), true);
  assert.ok(debt.includes('CEVT_29_RECORD_02'));
  assert.match(handoff.t53Dependency.rule, /Do not add npcRefs/);
});

test('handoff summary remains internally consistent', () => {
  assert.equal(handoff.summary.verifiedSameIdentityPrincipals, handoff.principals.verifiedSameIdentity.ids.length);
  assert.equal(handoff.summary.exactIdSemanticCollisionPrincipals, handoff.principals.exactIdSemanticCollision.ids.length);
  assert.equal(
    handoff.summary.canonicalPrincipalsWithoutLegacyInheritance,
    handoff.principals.canonicalWithoutLegacyInheritance.canonicalMissingIds.length +
      handoff.principals.canonicalWithoutLegacyInheritance.unapprovedCandidateCanonicalIds.length,
  );
  assert.equal(
    handoff.summary.legacyPrincipalsKeepHistoryOnly,
    handoff.principals.legacyKeepHistoryOnly.engineOnlyIds.length +
      handoff.principals.legacyKeepHistoryOnly.unapprovedCandidateLegacyIds.length,
  );
  assert.equal(handoff.summary.exactIdSemanticCollisionConditionals, handoff.conditionals.exactIdSemanticCollisionIds.length);
  assert.equal(handoff.summary.age26SeedOriginMoves, handoff.age26SeedChronology.originMoves.length);
  assert.equal(handoff.summary.t53TextualNpcMentionDebtInRange, handoff.t53Dependency.textualNpcMentionsMissingRefs.length);
});
