import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { EVENTS } from '../dist/content/events/index.js';
import { createInitialState } from '../dist/content/initial-state.js';
import { eventGatesPass, gateAlternatives } from '../dist/narrative/event-gates.js';

const veteranReport = JSON.parse(fs.readFileSync('analysis/T5.1/canon-30-34.json', 'utf8'));
const event = EVENTS.find(row => row.id === 'EVT_30_CON_001');
const reportRow = veteranReport.principals.find(row => row.canonicalId === 'EVT_30_CON_001');

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
