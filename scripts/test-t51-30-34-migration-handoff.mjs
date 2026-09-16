import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { EVENTS } from '../dist/content/events/index.js';
import { contentIdentity } from '../dist/session/content-identity.js';
import { CONTENT_MIGRATION_ROUTES, LEGACY_CONTENT_SOURCES, findMigrationPath } from '../dist/session/content-migration.js';
import { PRE_T51_CONTENT_IDENTITY } from '../dist/session/pre-t51-legacy-registry.js';

const handoff = JSON.parse(fs.readFileSync('analysis/T5.1/canon-30-34-migration-handoff.json', 'utf8'));
const readiness = JSON.parse(fs.readFileSync('analysis/T5.1/canon-30-34-implementation-readiness.json', 'utf8'));
const audit = JSON.parse(fs.readFileSync('analysis/T5.1/canon-30-34.json', 'utf8'));

const sorted = values => [...values].sort();
const stableIds = sorted(readiness.events.filter(event => event.status === 'stable_semantics_implemented_shared_parity_gap').map(event => event.canonicalId));
const shiftedIds = sorted(readiness.events.filter(event => event.status === 'shifted_identity_requires_migration').map(event => event.canonicalId));
const missingIds = sorted(readiness.events.filter(event => event.status === 'canonical_missing_requires_coordinated_addition').map(event => event.canonicalId));

test('T5.1 30-34 migration handoff usa la última fuente upstream congelada y un target runtime actual', async () => {
  assert.notEqual(handoff.sourceContentIdentity, PRE_T51_CONTENT_IDENTITY);
  const source = LEGACY_CONTENT_SOURCES[handoff.sourceContentIdentity];
  assert.ok(source, `Fuente upstream no congelada: ${handoff.sourceContentIdentity}`);
  const fixturePath = `qa/fixtures/t5.1/post-t51-sources/${handoff.sourceContentIdentity}.json`;
  assert.equal(fs.existsSync(fixturePath), true, `Falta fixture post-T5.1 para ${handoff.sourceContentIdentity}`);
  const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
  assert.equal(fixture.contentIdentity, handoff.sourceContentIdentity);
  const upstreamPath = findMigrationPath(PRE_T51_CONTENT_IDENTITY, handoff.sourceContentIdentity, CONTENT_MIGRATION_ROUTES);
  assert.ok(upstreamPath, 'La fuente del handoff debe ser alcanzable desde PRE_T51 por un lineage único');
  assert.ok(upstreamPath.length > 0);
  assert.equal(upstreamPath.at(-1).targetContentIdentity, handoff.sourceContentIdentity);
  assert.equal(handoff.observedTargetContentIdentity, await contentIdentity(EVENTS));
  assert.notEqual(handoff.observedTargetContentIdentity, handoff.sourceContentIdentity);
  assert.equal(handoff.consumer.workstreamMayRegisterRoute, false);
});

test('T5.1 30-34 current route candidate cubre exactamente las 27 colisiones estables', () => {
  assert.deepEqual(sorted(handoff.currentBatch.exactIdSemanticCollisions), stableIds);
  assert.equal(handoff.currentBatch.exactIdSemanticCollisions.length, 27);
  assert.equal(handoff.currentBatch.schedulerMappingsCandidate.length, 27);
  assert.deepEqual(sorted(handoff.currentBatch.schedulerMappingsCandidate.map(mapping => mapping.canonicalEventId)), stableIds);
});

test('T5.1 30-34 current route no aprueba same_scene y libera SEEN/cooldown de cada exact-ID collision', () => {
  assert.deepEqual(handoff.invariants.approvedSameSceneMappings, []);
  assert.deepEqual(handoff.invariants.approvedAliases, []);
  assert.deepEqual(handoff.currentBatch.sameSceneMappings, []);
  for (const mapping of handoff.currentBatch.schedulerMappingsCandidate) {
    assert.equal(mapping.kind, 'distinct_scene');
    assert.equal(mapping.legacyEventId, mapping.canonicalEventId);
    assert.equal(mapping.clearCanonicalSeen, true, `${mapping.legacyEventId}: SEEN debe liberarse`);
    assert.equal(mapping.clearCanonicalCooldown, true, `${mapping.legacyEventId}: cooldown debe liberarse`);
  }
});

test('T5.1 30-34 current route no reescribe origen histórico de seeds', () => {
  assert.deepEqual(handoff.currentBatch.seedOriginMappingsCandidate, []);
  assert.equal(handoff.invariants.seedHistoricalOriginRewriteAuthorized, false);
});

test('T5.1 30-34 los 18 shifted quedan fuera de la ruta actual y sin alias same-scene', () => {
  const pairs = handoff.futureShiftedIdentityWork.pairs;
  assert.equal(pairs.length, 18);
  assert.deepEqual(sorted(pairs.map(pair => pair.canonicalId)), shiftedIds);
  assert.equal(pairs.every(pair => pair.sameSceneMigrationAllowed === false), true);
  const mappedLegacy = new Set(handoff.currentBatch.schedulerMappingsCandidate.map(mapping => mapping.legacyEventId));
  assert.equal(pairs.some(pair => mappedLegacy.has(pair.legacyCandidateId) && pair.canonicalId !== pair.legacyCandidateId), false);
});

test('T5.1 30-34 documenta la doble colisión especial de EVT_31_TEAM_001', () => {
  const pair = handoff.futureShiftedIdentityWork.pairs.find(row => row.canonicalId === 'EVT_31_TEAM_001');
  assert.ok(pair);
  assert.equal(pair.legacyCandidateId, 'EVT_31_MENT_001');
  assert.equal(pair.sameSceneMigrationAllowed, false);
  assert.match(pair.specialCase, /already occupied/);
  assert.ok(handoff.futureShiftedIdentityWork.pairs.some(row => row.canonicalId === 'EVT_31_SQUAD_001' && row.legacyCandidateId === 'EVT_31_TEAM_001'));
});

test('T5.1 30-34 los cinco missing empiezan sin herencia legacy', () => {
  assert.deepEqual(sorted(handoff.futureCanonicalMissingWork.ids), missingIds);
  assert.equal(handoff.futureCanonicalMissingWork.ids.length, 5);
  assert.match(handoff.futureCanonicalMissingWork.migrationRule, /starts unseen/);
});

test('T5.1 30-34 engine-only no se retira anticipadamente en la ruta de este PR', () => {
  const expected = sorted(audit.engineOnly.map(row => row.engineId));
  assert.deepEqual(sorted(handoff.engineOnlyCurrentBatch.ids), expected);
  assert.equal(handoff.engineOnlyCurrentBatch.ids.length, 5);
  assert.equal(handoff.engineOnlyCurrentBatch.status, 'keep_active_pending_canonical_decision');
  assert.match(handoff.engineOnlyCurrentBatch.earlyRetirementException, /EVT_33_RET_001/);
});

test('T5.1 30-34 handoff conserva invariantes fuertes de migración', () => {
  assert.equal(handoff.invariants.unknownIdentityAccepted, false);
  assert.equal(handoff.invariants.legacyDefinitionScheduled, false);
  assert.equal(handoff.invariants.legacyHistoryRewrittenAsCanonical, false);
  assert.equal(handoff.invariants.legacyPendingReboundToNewDefinition, false);
  assert.equal(handoff.invariants.legacySeenSuppressesNonEquivalentCanonical, false);
  assert.equal(handoff.invariants.legacyCooldownSuppressesNonEquivalentCanonical, false);
  assert.equal(handoff.invariants.migrationConsumesRng, false);
  assert.equal(handoff.invariants.migrationSchedulesEvents, false);
  assert.ok(handoff.requiredCurrentRouteAssertions.includes('double migration is a no-op'));
  assert.ok(handoff.requiredCurrentRouteAssertions.includes('registered edge extends the existing upstream lineage without shortcut or ambiguity'));
});
