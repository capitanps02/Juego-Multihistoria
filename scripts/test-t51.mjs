import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const report = JSON.parse(fs.readFileSync('analysis/2026-09-15/T5.1-reconciliation.json', 'utf8'));

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

test('T5.1 deja los condicionales como conteo hasta disponer de inventario canónico', () => {
  assert.equal(report.conditionalReconciliation.status, 'count_only_not_semantically_reconciled');
});
