import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { EVENTS } from '../dist/content/events/index.js';
import { createInitialState } from '../dist/content/initial-state.js';
import { eventGatesPass, gateAlternatives } from '../dist/narrative/event-gates.js';

const veteranReport = JSON.parse(fs.readFileSync('analysis/T5.1/canon-30-34.json', 'utf8'));
const parityEvidence = JSON.parse(fs.readFileSync('analysis/T5.1/canon-30-34-parity-evidence.json', 'utf8'));
const migrationHandoff = JSON.parse(fs.readFileSync('analysis/T5.1/canon-30-34-migration-handoff.json', 'utf8'));
const traceability = JSON.parse(fs.readFileSync('analysis/2026-09-11/t1/principal-traceability.json', 'utf8'));
const event = EVENTS.find(row => row.id === 'EVT_30_CON_001');
const reportRow = veteranReport.principals.find(row => row.canonicalId === 'EVT_30_CON_001');
const canonical = traceability.scenes.find(row => row.canonicalId === 'EVT_30_CON_001');
const evidence = parityEvidence.events.EVT_30_CON_001;

function state30() {
  const state = createInitialState(3034001);
  state.age = 30;
  state.phase = '30_34';
  state.professional.initializedAt30 = true;
  return state;
}

test('EVT_30_CON_001 usa el OR canónico sin reclamar identidad verificada', () => {
  assert.ok(event, 'EVT_30_CON_001 must remain present in the active catalog');
  assert.ok(reportRow, 'EVT_30_CON_001 must remain represented in the T5.1 reconciliation');

  assert.equal(reportRow.status, 'needs_reimplementation');
  assert.equal(event.canonStatus, 'technical_adaptation');
  assert.ok(event.tags?.includes('t51_canonical_reimplementation'));
  assert.equal(event.tags?.includes('t51_trigger_approximation'), false);
  assert.equal(event.tags?.includes('t51_unmodelled_club_renewal_proxy'), false);
  assert.equal(event.tags?.includes('t51_verified_same_identity'), false);

  assert.deepEqual(event.gates, []);
  assert.deepEqual(gateAlternatives(event), [
    [{ path: 'contract.monthsRemaining', op: 'lte', value: 18 }],
    [{ path: 'facts.clubWantsRenewal', op: 'eq', value: true }]
  ]);
  assert.equal(event.text.title, 'Uno más o tres');

  assert.deepEqual(event.choices.map(choice => choice.id), ['A', 'B', 'C', 'D']);
  const labels = event.choices.map(choice => choice.label.toLowerCase());
  assert.match(labels[0], /un año/);
  assert.match(labels[0], /libertad/);
  assert.match(labels[1], /tres años/);
  assert.match(labels[1], /seguridad/);
  assert.match(labels[2], /dos años/);
  assert.match(labels[2], /cláusula de salida/);
  assert.match(labels[3], /no firmar/);
  assert.match(labels[3], /mercado/);
});

test('EVT_30_CON_001 entra por la rama contractual <=18 meses', () => {
  const state = state30();
  state.contract.monthsRemaining = 18;
  state.professional.institutionalTrust = 0;
  state.professional.roleSecurity = 0;
  state.professional.contractPower = 100;
  assert.equal(eventGatesPass(state, event), true);
});

test('EVT_30_CON_001 entra por intención real de renovación más allá de 18 meses', () => {
  const state = state30();
  state.contract.monthsRemaining = 24;
  state.professional.institutionalTrust = 80;
  state.professional.roleSecurity = 75;
  state.professional.contractPower = 45;
  assert.equal(eventGatesPass(state, event), true);
});

test('EVT_30_CON_001 falla cerrado si ninguna rama canónica es cierta', () => {
  const state = state30();
  state.contract.monthsRemaining = 24;
  state.professional.institutionalTrust = 10;
  state.professional.roleSecurity = 10;
  state.professional.contractPower = 95;
  assert.equal(eventGatesPass(state, event), false);
});

test('EVT_30_CON_001 mantiene paridad demostrada de información y opciones con B1051', () => {
  assert.ok(canonical);
  assert.equal(canonical.sourceBlock, 'B1051');
  assert.equal(canonical.sourceFields['Ventana / disparador'], 'Contrato <=18 meses o club quiere renovar.');
  assert.equal(canonical.sourceFields['Información que ve el jugador'], 'Duración, salario, bonus, cláusulas y rol comunicado.');
  assert.equal(canonical.sourceFields['Información imperfecta'], 'No sabes cómo estará tu cuerpo a los 33 ni si el mercado seguirá abierto el próximo verano.');
  assert.equal(event.intel.visible[0], 'Conoces duración, salario, bonus, cláusulas y el rol comunicado en cada fórmula.');
  assert.equal(event.intel.uncertain[0], canonical.sourceFields['Información imperfecta']);
  assert.deepEqual(event.choices.map(choice => choice.label), [
    'Un año y libertad',
    'Tres años y seguridad',
    'Dos años con salario intermedio y cláusula de salida',
    'No firmar todavía y escuchar mercado'
  ]);
  assert.equal(evidence.dimensions.visibleKnowledge.status, 'semantic_parity_demonstrated');
  assert.equal(evidence.dimensions.uncertainty.status, 'semantic_parity_demonstrated');
  assert.equal(evidence.dimensions.choices.status, 'exact_labels_demonstrated');
});

test('EVT_30_CON_001 no oculta la seed canónica aún no modelada', () => {
  assert.match(canonical.sourceFields['Memoria / semillas'], /SEED_AGE30_CONTRACT/);
  assert.match(canonical.sourceFields['Memoria / semillas'], /SEED_LAST_PEAK_CONTRACT/);
  assert.deepEqual(event.seedsWrite, ['SEED_AGE30_CONTRACT']);
  assert.equal(JSON.stringify(EVENTS).includes('SEED_LAST_PEAK_CONTRACT'), false);
  assert.equal(evidence.dimensions.seeds.status, 'canonical_reference_missing_in_runtime');
  assert.deepEqual(evidence.dimensions.seeds.missingOrUnclassified, ['SEED_LAST_PEAK_CONTRACT']);
});

test('EVT_30_CON_001 conserva explícitas las adaptaciones de outcome no prescritas por canon', () => {
  const primaryWeights = event.outcomes.filter(outcome => outcome.id.endsWith('__PRIMARY')).map(outcome => outcome.baseWeight);
  const secondaryWeights = event.outcomes.filter(outcome => outcome.id.endsWith('__SECONDARY')).map(outcome => outcome.baseWeight);
  assert.deepEqual(new Set(primaryWeights), new Set([55]));
  assert.deepEqual(new Set(secondaryWeights), new Set([45]));
  assert.doesNotMatch(canonical.sourceFields['Resolución interna'], /\b55\b|\b45\b/);
  assert.equal(evidence.dimensions.resolution.status, 'semantic_coverage_but_probability_parity_unproven');
  assert.equal(evidence.dimensions.hiddenState.status, 'mapping_unproven');
});

test('EVT_30_CON_001 no inventa conocimiento NPC y sigue bloqueado por continuidad de save', () => {
  assert.deepEqual(event.npcRefs ?? [], []);
  assert.equal(evidence.dimensions.npcKnowledge.status, 'no_explicit_named_npc_dependency_in_canonical_source');
  assert.ok(migrationHandoff.currentBatch.exactIdSemanticCollisions.includes('EVT_30_CON_001'));
  const mapping = migrationHandoff.currentBatch.schedulerMappingsCandidate.find(row => row.canonicalEventId === 'EVT_30_CON_001');
  assert.ok(mapping);
  assert.equal(mapping.kind, 'distinct_scene');
  assert.equal(mapping.clearCanonicalSeen, true);
  assert.equal(mapping.clearCanonicalCooldown, true);
  assert.equal(evidence.dimensions.saveContinuity.status, 'blocked_pending_registered_content_migration');
  assert.equal(evidence.promotionAllowed, false);
  assert.equal(evidence.blockingReasons.length, 4);
  assert.equal(evidence.decision, 'Keep needs_reimplementation / technical_adaptation. Do not promote to verified_same_identity.');
});
