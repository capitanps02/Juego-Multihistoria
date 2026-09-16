import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const handoff = JSON.parse(fs.readFileSync('analysis/T5.1/canon-20-23-b2-handoff.json', 'utf8'));
const plan = JSON.parse(fs.readFileSync('analysis/T5.1/canon-18-23-repair-plan.json', 'utf8'));
const current = JSON.parse(fs.readFileSync('analysis/T5.1/canon-18-23-current-state.json', 'utf8'));

const principalIds = [
  'EVT_20_LIFE_001','EVT_20_MKT_001','EVT_20_MED_001','EVT_20_AGT_001','EVT_20_ABR_001','EVT_20_STATUS_001','EVT_20_CCH_001','EVT_20_LOCK_001','EVT_20_LOCK_002','EVT_20_BRUNO_001',
  'EVT_21_MONEY_001','EVT_21_AGT_001','EVT_21_NAT_001','EVT_21_IMG_001','EVT_21_CAP_001','EVT_21_PRS_001','EVT_21_MED_001','EVT_21_RIV_001','EVT_21_CCH_002',
  'EVT_22_CON_001','EVT_22_LOCK_001','EVT_22_HOME_001','EVT_22_MKT_001','EVT_22_MED_001','EVT_22_TACT_001','EVT_22_DDL_001','EVT_22_CON_002'
];
const conditionalIds = ['CEVT_21_ABR_01','CEVT_21_MEDIA_01','CEVT_22_FREE_01'];
const dimensions = ['identity','trigger','context','playerKnowledge','uncertainty','options','cost','immediateConsequences','deferredConsequences','seeds','npcs','futureContinuity','saveCompatibility'];
const sorted = xs => [...xs].sort();

test('B2 handoff preserves its semantic analysis baseline while the workstream tracks current main separately', () => {
  assert.equal(handoff.runtimeAllowedInPr10, false);
  assert.equal(handoff.baselineMainSha, 'ddf46fed010521c5969bac26e29920945793f709');
  assert.equal(current.latestMainSha, plan.baseline.mainSha);
  assert.notEqual(handoff.baselineMainSha, current.latestMainSha);
  assert.equal(handoff.summary.principalNeedsReimplementation, 27);
  assert.equal(handoff.summary.conditionalNeedsReimplementation, 3);
  assert.equal(handoff.summary.total, 30);
  assert.equal(handoff.summary.approved_alias, 0);
  assert.equal(handoff.summary.requires_manual_review, 0);
});

test('B2 names exactly the 27 principal and 3 conditional rewrites', () => {
  assert.deepEqual(sorted(handoff.principalRows.map(x => x.canonicalId)), sorted(principalIds));
  assert.deepEqual(sorted(handoff.conditionalRows.map(x => x.canonicalId)), sorted(conditionalIds));
  assert.equal(new Set(handoff.principalRows.map(x => x.canonicalId)).size, 27);
  assert.equal(new Set(handoff.conditionalRows.map(x => x.canonicalId)).size, 3);
  assert.equal(handoff.principalRows.every(x => x.engineId === x.canonicalId && x.status === 'needs_reimplementation'), true);
  assert.equal(handoff.conditionalRows.every(x => x.engineId === x.canonicalId && x.status === 'needs_reimplementation'), true);
});

test('every B2 row is backed by a complete 13-dimension profile and actionable semantic evidence', () => {
  assert.deepEqual(handoff.identityDimensions, dimensions);
  for (const row of [...handoff.principalRows, ...handoff.conditionalRows]) {
    const profile = handoff.dimensionProfiles[row.dimensionProfile];
    assert.ok(profile, `${row.canonicalId}: missing dimension profile`);
    assert.deepEqual(Object.keys(profile), dimensions, `${row.canonicalId}: incomplete 13D profile`);
    assert.ok(row.canonicalTrigger?.length > 8, `${row.canonicalId}: missing trigger`);
    assert.ok(row.canonicalOptions?.length > 8, `${row.canonicalId}: missing canonical choices`);
    assert.ok(row.keyGap?.length > 8, `${row.canonicalId}: missing semantic gap`);
    assert.ok(row.saveRisk?.length > 8, `${row.canonicalId}: missing save risk`);
    assert.ok(row.action?.length > 8, `${row.canonicalId}: missing action`);
  }
});

test('B2 same-ID rewrites cannot silently reinterpret legacy pending/history', () => {
  assert.equal(handoff.batchPolicy.sameIdDoesNotAuthorizeHistoryRewrite, true);
  assert.equal(handoff.batchPolicy.eachEventsChangeRequiresAdjacentContentIdentityMigration, true);
  assert.equal(handoff.batchPolicy.legacyPendingUsesExactStoredOrFingerprintDefinition, true);
  assert.equal(handoff.batchPolicy.migrationConsumesRng, false);
  assert.ok(handoff.batchPolicy.requiredTests.includes('pending_legacy'));
  assert.ok(handoff.batchPolicy.requiredTests.includes('determinism'));
});

test('repair plan exposes the exact B2 handoff instead of count-only planning', () => {
  const b2 = plan.implementationBatches.find(x => x.id === 'B2_20_23_SCENE_SPECIFIC_REWRITES');
  assert.ok(b2);
  assert.equal(b2.runtimeAllowedInPr10, false);
  assert.equal(b2.principalCandidates, 27);
  assert.equal(b2.conditionalCandidates, 3);
  assert.deepEqual(sorted(b2.principalIds), sorted(principalIds));
  assert.deepEqual(sorted(b2.conditionalIds), sorted(conditionalIds));
  assert.equal(b2.acceptanceEvidence, 'analysis/T5.1/canon-20-23-b2-handoff.json');
});
