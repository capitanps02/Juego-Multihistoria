import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const report = JSON.parse(fs.readFileSync('analysis/2026-09-15/T5.1-reconciliation.json', 'utf8'));
const veteranReport = JSON.parse(fs.readFileSync('analysis/T5.1/canon-30-34.json', 'utf8'));
const principalSource = fs.readFileSync('src/content/events/30_34/principal-events.ts', 'utf8');
const conditionalSource = fs.readFileSync('src/content/events/30_34/conditional-events.ts', 'utf8');
const state34Source = fs.readFileSync('src/simulation/state34-classifier.ts', 'utf8');
const schedulerSource = fs.readFileSync('src/narrative/scheduler.ts', 'utf8');

test('T5.1 no convierte coincidencias de título en aliases silenciosos', () => {
  assert.equal(report.counts.canonicalPrincipals, 254);
  assert.equal(report.counts.literalIdMatches, 167);
  assert.equal(report.counts.unresolvedPrincipalIds, 87);
  assert.equal(report.counts.enginePrincipals, 254);
  assert.equal(report.counts.engineConditionals, 134);
  assert.equal(report.unresolved.filter(row => row.candidates.length > 0).length, 7);
  assert.equal(report.unresolved.filter(row => row.status === 'title_candidate_ambiguous').length, 0);
  assert.deepEqual(report.aliases, []);
  assert.equal(report.noSilentAliases, true);
});

test('T5.1 deja los condicionales globales como conteo hasta disponer de inventario canónico', () => {
  assert.equal(report.conditionalReconciliation.status, 'count_only_not_semantically_reconciled');
});

test('T5.1 30-34 clasifica todo el inventario sin aliases silenciosos', () => {
  assert.equal(veteranReport.scope, '30_34');
  assert.equal(veteranReport.counts.canonicalPrincipals, 50);
  assert.equal(veteranReport.counts.enginePrincipals, 50);
  assert.equal(veteranReport.principals.length, 50);
  assert.equal(veteranReport.counts.needsReimplementation, 45);
  assert.equal(veteranReport.counts.canonicalMissing, 5);
  assert.equal(veteranReport.counts.approvedAliases, 0);
  assert.equal(veteranReport.counts.verifiedSameIdentity, 0);
  assert.equal(veteranReport.engineOnly.length, 5);
  assert.equal(veteranReport.counts.engineOnlyNoncanonical, 5);
  assert.equal((principalSource.match(/\{id:"EVT_/g) ?? []).length, 50);

  const statuses = new Set(['verified_same_identity', 'approved_alias', 'needs_reimplementation', 'canonical_missing', 'requires_manual_review']);
  for (const event of veteranReport.principals) assert.equal(statuses.has(event.status), true, `${event.canonicalId}: status inválido`);

  const missing = veteranReport.principals.filter(event => event.status === 'canonical_missing').map(event => event.canonicalId).sort();
  assert.deepEqual(missing, ['EVT_30_CCH_001', 'EVT_30_JAN_001', 'EVT_30_NAT_002', 'EVT_30_PRS_001', 'EVT_31_ROLE_001'].sort());
});

test('T5.1 30-34 no presenta escenas genéricas como canon verificado', () => {
  assert.doesNotMatch(principalSource, /verified:true/);
  assert.match(principalSource, /canonStatus:r\.verified\?"verified":"technical_adaptation"/);
});

test('T5.1 30-34 mantiene condicionales en revisión hasta inventario canónico', () => {
  assert.equal(veteranReport.conditionals.status, 'requires_manual_review');
  assert.equal(veteranReport.conditionals.events.length, 26);
  assert.equal(veteranReport.counts.conditionalsRequiresManualReview, 26);
  assert.equal((conditionalSource.match(/\{id:"CEVT_/g) ?? []).length, 26);
  assert.equal(veteranReport.conditionals.events.every(event => event.status === 'requires_manual_review'), true);
  assert.equal(veteranReport.conditionals.crossTypeWarnings[0].canonicalPrincipalId, 'EVT_30_NAT_002');
});

test('T5.1 30-34 no introduce retirada terminal automática por edad', () => {
  assert.equal(veteranReport.policy.ageDoesNotForceRetirement, true);
  assert.doesNotMatch(principalSource, /if\s*\([^)]*\bage\b[^)]*(?:>=|>|===?)/);
  assert.match(principalSource, /"professional\.retirementDistance", "op": "gte", "value": 30/);
  assert.match(principalSource, /flag\("EARLY_RETIRED_30_34",true\)/);
  assert.match(state34Source, /terminal:state\.flags\.EARLY_RETIRED_30_34===true/);
  assert.match(state34Source, /STATE34_WORLD_ELITE/);
  assert.match(state34Source, /STATE34_REINVENTED_CREATOR/);
  assert.match(state34Source, /STATE34_BODY_MANAGED/);
});

test('T5.1 30-34 caracteriza el bloqueo de prioridad del puente veterano', () => {
  const dependency = veteranReport.globalDependencies.find(dep => dep.id === 'DEP_T51_BRIDGE_PRIORITY');
  assert.ok(dependency);
  assert.match(principalSource, /EVT_30_IDN_001/);
  assert.match(schedulerSource, /if\(age>=30&&age<=33\)/);
  assert.match(schedulerSource, /cap:code===skipped\?0:1/);
  const budgetLine = schedulerSource.match(/const budgetExempt=.*?;\n/s)?.[0] ?? '';
  assert.doesNotMatch(budgetLine, /EVT_30_IDN_001/);
});

test('T5.1 30-34 documenta por qué renombrar IDs desplazados requiere migración', () => {
  const dependency = veteranReport.globalDependencies.find(dep => dep.id === 'DEP_T51_EVENT_ID_MIGRATION');
  assert.ok(dependency);
  assert.match(schedulerSource, /state\.flags\[`SEEN_\$\{event\.id\}`\]/);
  assert.match(schedulerSource, /state\.eventCooldowns\[event\.id\]/);
});
