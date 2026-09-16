import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const report = JSON.parse(fs.readFileSync('analysis/T5.1/canon-23-30.json', 'utf8'));
const conditionals = JSON.parse(fs.readFileSync('analysis/T5.1/canon-23-30-conditionals.json', 'utf8'));
const src23 = fs.readFileSync('src/content/events/23_26/principal-events.ts', 'utf8');
const src26 = fs.readFileSync('src/content/events/26_30/principal-events.ts', 'utf8');

const ids = (src) => [...src.matchAll(/\{id:\"(EVT_[^\"]+)\"/g)].map((match) => match[1]);
const unique = (values) => new Set(values).size === values.length;

const candidateCanon = report.blocks['26_30'].requires_manual_review_candidates.map((row) => row.canonicalId);
const candidateEngine = report.blocks['26_30'].requires_manual_review_candidates.map((row) => row.engineId);

test('T51 23-30 inventory is complete and disjoint', () => {
  assert.equal(report.summary.canonicalPrincipals, 91);
  assert.equal(report.summary.enginePrincipals, 91);
  assert.equal(report.summary.engineConditionals, 44);

  const canonical23 = [...report.blocks['23_26'].verified_same_identity,...report.blocks['23_26'].needs_reimplementation];
  assert.equal(canonical23.length, 40);
  assert.equal(unique(canonical23), true);

  const canonical26 = [...report.blocks['26_30'].needs_reimplementation,...report.blocks['26_30'].canonical_missing,...candidateCanon];
  assert.equal(canonical26.length, 51);
  assert.equal(unique(canonical26), true);

  const engine26 = [...report.blocks['26_30'].needs_reimplementation,...report.blocks['26_30'].engine_only_noncanonical,...candidateEngine];
  assert.equal(engine26.length, 51);
  assert.equal(unique(engine26), true);
});

test('T51 report matches current engine principal counts', () => {
  const engine23Ids = ids(src23);
  const engine26Ids = ids(src26);
  assert.equal(engine23Ids.length, 40);
  assert.equal(engine26Ids.length, 51);
  assert.equal(unique(engine23Ids), true);
  assert.equal(unique(engine26Ids), true);
});

test('T51 keeps principal aliases explicit and unapproved', () => {
  assert.deepEqual(report.approvedAliases, []);
  assert.equal(report.noSilentAliases, true);
  assert.deepEqual(report.blocks['26_30'].requires_manual_review_candidates, [
    { canonicalId: 'EVT_26_BRIDGE_001', engineId: 'EVT_26_IDN_001' },
    { canonicalId: 'EVT_27_STAR_001', engineId: 'EVT_28_TEAM_001' },
    { canonicalId: 'EVT_27_AWARD_001', engineId: 'EVT_28_GALA_001' },
    { canonicalId: 'EVT_28_RICH_001', engineId: 'EVT_29_MKT_001' },
  ]);
});

test('T51 consumes the authoritative 44-callback planning review instead of count-only manual review', () => {
  assert.equal(report.conditionalReconciliation.status,'planning_review_complete_runtime_not_reconciled');
  assert.equal(report.conditionalReconciliation.canonicalCallbacks,44);
  assert.equal(report.conditionalReconciliation.runtimeCertifiedFull,0);
  assert.equal(report.conditionalReconciliation.artifact,'analysis/T5.1/canon-23-30-conditionals.json');
  assert.equal(conditionals.records.length,44);
  assert.equal(conditionals.summary.planningReviewed,44);
  assert.equal(conditionals.summary.runtimeCertifiedFull,0);
  assert.ok(!JSON.stringify(report).includes('sin inventario fuente canónico'));
});

test('T51 captures the EVT_27_MED_001 semantic collision', () => {
  assert.match(src26, /EVT_27_MED_001[^\n]+title:\"La final y el isquio\"/);
  assert.ok(report.blocks['26_30'].needs_reimplementation.includes('EVT_27_MED_001'));
  const finding = report.highRiskFindings.find((row) => row.id === 'EVT_27_MED_001');
  assert.equal(finding?.status, 'needs_reimplementation');
  assert.match(finding?.canonical ?? '', /La cirugía puede esperar/);
});

test('T51 workstream does not plan edits to protected coordination files', () => {
  for (const path of report.protectedFiles) assert.equal(report.changedFilesPlanned.includes(path), false, `${path} must remain untouched`);
});
