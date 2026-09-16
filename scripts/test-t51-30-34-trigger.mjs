import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { EVENTS } from '../dist/content/events/index.js';

const veteranReport = JSON.parse(fs.readFileSync('analysis/T5.1/canon-30-34.json', 'utf8'));
const event = EVENTS.find(row => row.id === 'EVT_30_CON_001');
const reportRow = veteranReport.principals.find(row => row.canonicalId === 'EVT_30_CON_001');

test('EVT_30_CON_001 preserves the unmodelled club-renewal trigger branch without claiming verification', () => {
  assert.ok(event, 'EVT_30_CON_001 must remain present in the active catalog');
  assert.ok(reportRow, 'EVT_30_CON_001 must remain represented in the T5.1 reconciliation');

  assert.equal(reportRow.status, 'needs_reimplementation');
  assert.equal(event.canonStatus, 'technical_adaptation');
  assert.ok(event.tags?.includes('t51_canonical_reimplementation'));
  assert.ok(event.tags?.includes('t51_trigger_approximation'));
  assert.ok(event.tags?.includes('t51_unmodelled_club_renewal_proxy'));
  assert.equal(event.tags?.includes('t51_verified_same_identity'), false);

  // Canon: contract <=18 months OR club wants to renew. The current state model has no
  // explicit signal for the second branch, so gating only on monthsRemaining creates a
  // false negative. Until that state exists, this scene deliberately stays ungated and
  // remains an approximation rather than a verified canonical identity.
  assert.deepEqual(event.gates, []);
  assert.equal(event.text.title, 'Uno más o tres');

  // This gate test protects the four canonical decision branches semantically instead
  // of freezing punctuation/UX copy while the scene is still needs_reimplementation.
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
