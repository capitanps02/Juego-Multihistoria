import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { EVENTS } from '../dist/content/events/index.js';

const report = JSON.parse(fs.readFileSync('analysis/2026-09-15/T5.1-reconciliation.json', 'utf8'));
const veteranReport = JSON.parse(fs.readFileSync('analysis/T5.1/canon-30-34.json', 'utf8'));
const principalSource = fs.readFileSync('src/content/events/30_34/principal-events.ts', 'utf8');
const conditionalSource = fs.readFileSync('src/content/events/30_34/conditional-events.ts', 'utf8');
const indexSource = fs.readFileSync('src/content/events/30_34/index.ts', 'utf8');
const overrideSource = fs.readFileSync('src/content/events/30_34/canonical-reimplementations.ts', 'utf8');
const state34Source = fs.readFileSync('src/simulation/state34-classifier.ts', 'utf8');
const schedulerSource = fs.readFileSync('src/narrative/scheduler.ts', 'utf8');
const byId = new Map(EVENTS.map(event => [event.id, event]));

const reimplementedIds = [
  'EVT_30_CON_001','EVT_30_BODY_001','EVT_30_MKT_001','EVT_30_NAT_001',
  'EVT_30_FAM_001','EVT_30_MED_001','EVT_30_FORM_001','EVT_30_CAP_001',
  'EVT_31_MED_001','EVT_31_MKT_001','EVT_31_HOME_001','EVT_31_AGT_001'
];

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

test('T5.1 30-34 no presenta reimplementaciones parciales como canon verificado', () => {
  assert.match(indexSource, /canonStatus:"technical_adaptation"/);
  assert.match(indexSource, /t51_canonical_reimplementation/);
  for (const id of reimplementedIds) {
    const event = byId.get(id);
    assert.ok(event, `${id}: falta del catálogo final`);
    assert.equal(event.canonStatus, 'technical_adaptation', `${id}: no debe declararse verificado antes de paridad completa`);
    assert.ok(event.tags?.includes('t51_canonical_reimplementation'), `${id}: falta etiqueta de reimplementación`);
    assert.equal(event.tags?.includes('t51_verified_same_identity'), false, `${id}: conserva etiqueta de verificación prematura`);
  }
});

test('T5.1 30-34 conserva las opciones canónicas del segundo lote estable de edad 31', () => {
  const cases = [
    ['EVT_31_MED_001', 'La operación y agosto', ['Operarte ya','Posponer hasta invierno','Seguir conservador sin fecha','Operarte solo con un plan de retorno por escrito']],
    ['EVT_31_MKT_001', 'Dos años de estrella o uno de élite', ['Dos años como figura','Un año en el gigante','Pedir al gigante opción automática por minutos','Esperar mercado y arriesgar ambas']],
    ['EVT_31_HOME_001', 'Valdoria llama con 31', ['Volver ahora','Decir que todavía no es el momento','Pedir contrato corto y objetivos','Ayudar al club de otra forma sin fichar']],
    ['EVT_31_AGT_001', 'Es el último gran contrato', ['Seguir estrategia de agencia','Contratar asesor externo para comparar','Negociar tú las variables deportivas y dejar dinero a la agencia','Cambiar de agente antes de firmar']]
  ];
  for (const [id,title,labels] of cases) {
    const event=byId.get(id);
    assert.ok(event, `${id}: no alcanzable en inventario`);
    assert.equal(event.text.title,title);
    assert.deepEqual(event.ageWindow,[31,31]);
    assert.deepEqual(event.choices.map(choice=>choice.label),labels);
    assert.ok(event.tags?.includes('t51_trigger_approximation'), `${id}: el trigger aproximado debe quedar explícito`);
  }
  assert.match(overrideSource,/flags\.HAS_SEED_CHRONIC_BODY/);
  assert.match(overrideSource,/reputation\.marketHeat/);
  assert.match(overrideSource,/professional\.homePull/);
  assert.match(overrideSource,/contract\.monthsRemaining/);
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
  assert.match(principalSource, /"professional\.retirementDistance"\s*,\s*"op"\s*:\s*"gte"\s*,\s*"value"\s*:\s*30/);
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
