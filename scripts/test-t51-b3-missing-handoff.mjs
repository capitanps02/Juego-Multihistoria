import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const handoff = JSON.parse(fs.readFileSync('analysis/T5.1/canon-20-23-b3-missing-handoff.json', 'utf8'));
const plan = JSON.parse(fs.readFileSync('analysis/T5.1/canon-18-23-repair-plan.json', 'utf8'));
const current = JSON.parse(fs.readFileSync('analysis/T5.1/canon-18-23-current-state.json', 'utf8'));
const sorted = xs => [...xs].sort();

const principals = ['EVT_20_BRIDGE_001','EVT_20_MATCH_003','EVT_20_JAN_001','EVT_21_MKT_001','EVT_21_SOC_001','EVT_21_PRS_002'];
const conditionals = ['CEVT_20_RIVAS_01','CEVT_20_VELA_01','CEVT_20_PAULA_01','CEVT_20_NANO_01','CEVT_20_MONT_01','CEVT_20_ADR_01','CEVT_21_BIGCLUB_01','CEVT_21_LOAN_01','CEVT_21_AGENT_02','CEVT_21_INJ_01','CEVT_22_UDV_01','CEVT_22_BRUNO_02','CEVT_22_ADR_02','CEVT_22_SOC_02','CEVT_22_SHOCK_01'];
const hardExternal = ['CEVT_20_RIVAS_01','CEVT_20_VELA_01','CEVT_20_NANO_01','CEVT_20_MONT_01','CEVT_20_ADR_01','CEVT_21_BIGCLUB_01','CEVT_22_UDV_01','CEVT_22_ADR_02','CEVT_22_SHOCK_01'];

test('B3 handoff is pinned, audit-only and exactly 6+15 canonical missing IDs', () => {
  assert.equal(handoff.baselineMainSha, current.latestMainSha);
  assert.equal(handoff.runtimeAllowedInPr10, false);
  assert.equal(handoff.summary.principalCanonicalMissing, 6);
  assert.equal(handoff.summary.conditionalCanonicalMissing, 15);
  assert.equal(handoff.summary.total, 21);
  assert.equal(handoff.summary.approved_alias, 0);
  assert.equal(handoff.summary.requires_manual_review, 0);
  assert.deepEqual(sorted(handoff.principalRows.map(x => x.canonicalId)), sorted(principals));
  assert.deepEqual(sorted(handoff.conditionalRows.map(x => x.canonicalId)), sorted(conditionals));
  assert.equal(handoff.principalRows.every(x => x.status === 'canonical_missing'), true);
  assert.equal(handoff.conditionalRows.every(x => x.status === 'canonical_missing'), true);
});

test('canonical-missing principals carry canonical trigger/options plus dependency and save action', () => {
  for (const row of handoff.principalRows) {
    assert.ok(row.canonicalTitle?.length > 3, `${row.canonicalId}: missing title`);
    assert.ok(row.canonicalTrigger?.length > 8, `${row.canonicalId}: missing trigger`);
    assert.ok(row.canonicalOptions?.length > 8, `${row.canonicalId}: missing options`);
    assert.ok(row.requiredFacts?.length > 8, `${row.canonicalId}: missing required facts`);
    assert.ok(row.readiness?.length > 8, `${row.canonicalId}: missing readiness`);
    assert.ok(row.dependency?.length > 8, `${row.canonicalId}: missing dependency`);
    assert.ok(row.saveRisk?.includes('contentIdentity'), `${row.canonicalId}: missing save boundary`);
    assert.ok(row.action?.length > 8, `${row.canonicalId}: missing action`);
  }
});

test('external-world callbacks fail closed instead of inventing cosmetic flags', () => {
  assert.equal(handoff.policy.syntheticCosmeticFlagsForbidden, true);
  assert.equal(handoff.policy.externalFactsMustHaveRealCausalWriters, true);
  assert.ok(handoff.externalWorldFactRule.rule.includes('stable causal writer'));
  for (const id of hardExternal) {
    const row = handoff.conditionalRows.find(x => x.canonicalId === id);
    assert.ok(row, `${id}: missing`);
    assert.equal(row.readiness, 'blocked_external_world_fact', `${id}: must remain blocked until causal writer exists`);
  }
});

test('design lineage candidates are not aliases and old runtime shells stay historical truth', () => {
  assert.equal(handoff.policy.designLineageIsNotAlias, true);
  assert.equal(handoff.policy.oldHistoryIdsRemainHistoricalTruth, true);
  const withCandidates = handoff.conditionalRows.filter(x => x.legacyCandidate);
  assert.ok(withCandidates.length >= 5);
  for (const row of withCandidates) assert.notEqual(row.legacyCandidate, row.canonicalId);
});

test('repair plan exposes B3 exact IDs and acceptance evidence', () => {
  const b3 = plan.implementationBatches.find(x => x.id === 'B3_CANONICAL_MISSING');
  assert.ok(b3);
  assert.equal(b3.runtimeAllowedInPr10, false);
  assert.equal(b3.principalNewDefinitions, 6);
  assert.equal(b3.conditionalNewDefinitions, 15);
  assert.deepEqual(sorted(b3.principalIds), sorted(principals));
  assert.deepEqual(sorted(b3.conditionalIds), sorted(conditionals));
  assert.equal(b3.acceptanceEvidence, 'analysis/T5.1/canon-20-23-b3-missing-handoff.json');
});
