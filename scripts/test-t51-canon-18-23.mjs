import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const audit = JSON.parse(fs.readFileSync('analysis/T5.1/canon-18-23.json', 'utf8'));
const current = JSON.parse(fs.readFileSync('analysis/T5.1/canon-18-23-current-state.json', 'utf8'));
const cards18 = JSON.parse(fs.readFileSync('analysis/T5.1/canon-18-20-cards.json', 'utf8'));
const conditionals = JSON.parse(fs.readFileSync('analysis/T5.1/canon-18-23-conditionals.json', 'utf8'));
const certification = JSON.parse(fs.readFileSync('analysis/T5.1/canon-18-20-conditional-certification.json', 'utf8'));
const boundaries = JSON.parse(fs.readFileSync('analysis/T5.1/canon-18-20-architecture-boundaries.json', 'utf8'));
const saveBoundary = JSON.parse(fs.readFileSync('analysis/T5.1/canon-18-23-save-boundary.json', 'utf8'));
const allowed = new Set(['verified_same_identity','approved_alias','needs_reimplementation','canonical_missing','engine_only_noncanonical','requires_manual_review']);

test('T51 18-23 fija alcance e inventario sin entrar en 23-26', () => {
  assert.deepEqual(audit.scope.owned, ['inicio', '18_20', '20_23']);
  assert.deepEqual(audit.scope.excluded, ['23_26']);
  assert.equal(audit.scope.engine.structuredTotal, 95);
  assert.equal(audit.scope.canonicalPrincipals, 63);
  assert.equal(audit.principal20_23.length, 33);
  assert.equal(audit.conditionals.length, 32);
  assert.equal(current.scope.runtimeStructuredEvents, 95);
  assert.equal(current.scope.canonicalConditionals, 32);
});

test('T51 no crea aliases silenciosos y usa solo estados aprobados', () => {
  assert.deepEqual(audit.approvedAliases, []);
  assert.equal(current.principalReconciliation.approved_alias, 0);
  assert.equal(current.conditionalReconciliation.approved_alias, 0);
  for (const row of [...audit.principal20_23, ...audit.engineOnly20_23, ...cards18.cards, ...conditionals.phase18_20, ...conditionals.phase20_23Canonical, ...conditionals.phase20_23EngineOnly, ...certification.cards]) {
    assert.equal(allowed.has(row.status), true, `${row.engineId ?? row.canonicalId}: estado no permitido`);
  }
});

test('T51 consolida principales 21/36/6/0 y seis engine-only', () => {
  assert.equal(current.principalReconciliation.verified_same_identity, 21);
  assert.equal(current.principalReconciliation.needs_reimplementation, 36);
  assert.equal(current.principalReconciliation.canonical_missing, 6);
  assert.equal(current.principalReconciliation.requires_manual_review, 0);
  assert.equal(current.principalReconciliation.engine_only_noncanonical, 6);
  assert.equal(audit.engineOnly20_23.length, 6);
});

test('T51 cierra las 14 tarjetas semánticas 18-20 y conserva 13 dimensiones', () => {
  assert.equal(cards18.summary.reviewed, 14);
  assert.equal(cards18.summary.verified_same_identity, 5);
  assert.equal(cards18.summary.needs_reimplementation, 9);
  assert.equal(cards18.summary.requires_manual_review, 0);
  assert.deepEqual(cards18.identityDimensions, audit.identityDimensions);
  assert.equal(audit.identityDimensions.length, 13);
  for (const row of cards18.cards) assert.deepEqual(Object.keys(row.dimensions), audit.identityDimensions, `${row.canonicalId}: dimensiones incompletas`);
});

test('T51 reconoce B1a como same-scene certificado con migración explícita', () => {
  const ids = ['EVT_18_MED_001','EVT_18_TEAM_001','EVT_18_MATCH_002'];
  assert.deepEqual(current.principalCertificationB1a.promotedIds, ids);
  assert.equal(current.principalCertificationB1a.mergeCommit, 'f05667453a1e40d5a4af635e8b9b787bbecdb726');
  for (const id of ids) {
    const card = cards18.cards.find(row => row.canonicalId === id);
    assert.equal(card?.status, 'verified_same_identity', `${id}: B1a debe quedar verified`);
    assert.equal(card?.dimensions.playerKnowledge, 'same', `${id}: intel canónica no certificada`);
    assert.equal(card?.dimensions.uncertainty, 'same', `${id}: incertidumbre canónica no certificada`);
    assert.equal(card?.dimensions.saveCompatibility, 'explicit_content_migration_integrated', `${id}: falta evidencia de migración`);
  }
});

test('T51 consolida condicionales en 5 verified, 12 reimplement, 15 missing y 0 manual', () => {
  assert.equal(conditionals.summary.canonicalConditionals, 32);
  assert.equal(certification.summary.reviewed, 7);
  assert.equal(certification.summary.verified_same_identity, 5);
  assert.equal(certification.summary.needs_reimplementation, 2);
  assert.equal(certification.summary.requires_manual_review, 0);
  assert.equal(current.conditionalReconciliation.verified_same_identity, 5);
  assert.equal(current.conditionalReconciliation.needs_reimplementation, 12);
  assert.equal(current.conditionalReconciliation.canonical_missing, 15);
  assert.equal(current.conditionalReconciliation.requires_manual_review, 0);
  assert.equal(current.conditionalReconciliation.engine_only_noncanonical, 15);
});

test('T51 mantiene los tres exact-ID 20-23 como reimplementation', () => {
  const exact = conditionals.phase20_23Canonical.filter(row => row.engineId !== null);
  assert.deepEqual(exact.map(row => row.canonicalId).sort(), ['CEVT_21_ABR_01', 'CEVT_21_MEDIA_01', 'CEVT_22_FREE_01']);
  assert.equal(exact.every(row => row.status === 'needs_reimplementation'), true);
  assert.equal(exact.every(row => String(row.saveRisk).includes('high_pending_same_id_collision')), true);
});

test('T51 reconoce freeze y Session v3 multigeneración sin relajar contentIdentity', () => {
  assert.equal(current.preT51Freeze.status, 'resolved');
  assert.equal(current.preT51Freeze.contentIdentity, '2e07efd2ea99c4e9ec4c2b20ae89664204f76db2c55a72d567208799c01bccff');
  assert.equal(saveBoundary.preT51Freeze.contentIdentity, current.preT51Freeze.contentIdentity);
  assert.equal(saveBoundary.sessionMigration.runtimeIntegrated, true);
  assert.equal(saveBoundary.sessionMigration.sessionVersion, 3);
  assert.equal(current.integratedSessionContentMigration.status, 'integrated_and_multigeneration');
  assert.equal(current.integratedSessionContentMigration.multigenerationCommit, 'fe06a5c9d61632ea4491dc6df95788154884177a');
});

test('T51 reconoce choice eligibility y event gate alternatives integrados', () => {
  const choice = boundaries.boundaries.find(x => x.id === 'CHOICE_ELIGIBILITY');
  const orGate = boundaries.boundaries.find(x => x.id === 'EVENT_GATE_OR_OR_DERIVED_FACT');
  assert.equal(choice?.status, 'resolved_integrated');
  assert.equal(choice?.integratedCommit, '76699f93e19e1ac9e17b42ccfaea011d92630fb6');
  assert.equal(orGate?.status, 'resolved_integrated');
  assert.equal(orGate?.integratedCommit, '291e34bfd8bb7c529182a2664564c63ff33eee19');
  assert.deepEqual(boundaries.knownSharedArchitectureBlockersRemaining, []);
  assert.equal(current.integratedChoiceEligibility.status, 'integrated');
  assert.equal(current.integratedEventGateAlternatives.status, 'integrated');
});

test('T51 conserva las 13 dimensiones mínimas de identidad', () => {
  assert.deepEqual(audit.identityDimensions, ['identity','trigger','context','playerKnowledge','uncertainty','options','cost','immediateConsequences','deferredConsequences','seeds','npcs','futureContinuity','saveCompatibility']);
});
