import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const plan = JSON.parse(fs.readFileSync('analysis/T5.1/canon-18-23-repair-plan.json', 'utf8'));
const current = JSON.parse(fs.readFileSync('analysis/T5.1/canon-18-23-current-state.json', 'utf8'));
const unique = xs => new Set(xs).size === xs.length;

test('repair plan is pinned to the effective reconciled counts and current audit base', () => {
  assert.equal(plan.baseline.mainSha, current.latestMainSha);
  assert.equal(plan.principalStatus.canonicalTotal, 63);
  assert.equal(plan.principalStatus.verified_same_identity, 21);
  assert.equal(plan.principalStatus.needs_reimplementation, 36);
  assert.equal(plan.principalStatus.canonical_missing, 6);
  assert.equal(plan.principalStatus.requires_manual_review, 0);
  assert.equal(plan.conditionalStatus.canonicalTotal, 32);
  assert.equal(plan.conditionalStatus.verified_same_identity, 5);
  assert.equal(plan.conditionalStatus.needs_reimplementation, 12);
  assert.equal(plan.conditionalStatus.canonical_missing, 15);
  assert.equal(plan.conditionalStatus.requires_manual_review, 0);
  assert.equal(plan.principalStatus.needs_reimplementation, current.principalReconciliation.needs_reimplementation);
  assert.equal(plan.conditionalStatus.needs_reimplementation, current.conditionalReconciliation.needs_reimplementation);
});

test('all known shared architecture blockers are resolved; 36 principal repairs remain content work', () => {
  assert.deepEqual(plan.principalKnownSharedContractBlockers.choiceEligibility, []);
  assert.deepEqual(plan.principalKnownSharedContractBlockers.eventGateOrOrDerivedFact, []);
  assert.equal(plan.principalKnownSharedContractBlockers.count, 0);
  assert.equal(plan.principalReimplementationCandidatesAfterIntegratedContracts.count, 36);
  assert.equal(plan.principalReimplementationCandidatesAfterIntegratedContracts.ids.length, 36);
  assert.equal(unique(plan.principalReimplementationCandidatesAfterIntegratedContracts.ids), true);
  assert.deepEqual(plan.principalKnownSharedContractBlockers.resolvedContractContentStillNeedsWiring.sort(), ['EVT_18_JAN_001','EVT_18_PRS_002','EVT_18_SUM_001'].sort());
});

test('B1a verified principals are absent from the remaining repair queue', () => {
  const ids = ['EVT_18_MED_001','EVT_18_TEAM_001','EVT_18_MATCH_002'];
  assert.equal(plan.principalVerifiedByIntegratedB1a.count, 3);
  assert.deepEqual(plan.principalVerifiedByIntegratedB1a.ids, ids);
  for (const id of ids) assert.equal(plan.principalReimplementationCandidatesAfterIntegratedContracts.ids.includes(id), false, `${id}: no debe seguir en backlog`);
});

test('conditional plan has zero shared blockers and all 12 reimplementations are content work', () => {
  assert.deepEqual(plan.conditionalKnownSharedContractBlockers.eventGateOrOrDerivedFact, []);
  assert.equal(plan.conditionalKnownSharedContractBlockers.count, 0);
  assert.equal(plan.conditionalReimplementationCandidatesAfterIntegratedContracts.count, 12);
  assert.equal(plan.conditionalReimplementationCandidatesAfterIntegratedContracts.ids.length, 12);
  assert.equal(unique(plan.conditionalReimplementationCandidatesAfterIntegratedContracts.ids), true);
  assert.deepEqual(plan.conditionalKnownSharedContractBlockers.resolvedContractContentStillNeedsWiring.sort(), ['CEVT_19_SOCIAL_01','CEVT_21_MEDIA_01'].sort());
  assert.equal(plan.conditionalManualCertification.count, 0);
  assert.equal(plan.conditionalVerifiedAfterCertification.count, 5);
});

test('migration, choice eligibility and OR gates are integrated while PR10 remains audit-only', () => {
  assert.equal(plan.policy.pr10AuditOnly, true);
  assert.equal(plan.policy.runtimeChangesInPr10, false);
  assert.equal(plan.policy.silentAliasesAllowed, false);
  assert.equal(plan.baseline.sessionContentMigration.status, 'integrated_and_multigeneration');
  assert.equal(plan.baseline.sessionContentMigration.multigenerationCommit, 'fe06a5c9d61632ea4491dc6df95788154884177a');
  assert.equal(plan.baseline.choiceEligibility.status, 'integrated');
  assert.equal(plan.baseline.eventGateAlternatives.status, 'integrated');
  assert.equal(plan.baseline.preT51ContentIdentity, '2e07efd2ea99c4e9ec4c2b20ae89664204f76db2c55a72d567208799c01bccff');
});

test('B0 has no open shared dependencies and B1 handoff names every remaining 18-20 repair', () => {
  assert.equal(plan.implementationBatches.length, 5);
  assert.equal(plan.implementationBatches.every(batch => batch.runtimeAllowedInPr10 === false), true);
  const shared = plan.implementationBatches.find(batch => batch.id === 'B0_SHARED_CONTRACTS');
  assert.deepEqual(shared.integrated.sort(), ['CHOICE_ELIGIBILITY','EVENT_GATE_OR_OR_DERIVED_FACT','SESSION_CONTENT_MIGRATION'].sort());
  assert.deepEqual(shared.openDependencies, []);
  const b1 = plan.implementationBatches.find(batch => batch.id === 'B1_18_20_LOCAL_REPAIRS');
  const b2 = plan.implementationBatches.find(batch => batch.id === 'B2_20_23_SCENE_SPECIFIC_REWRITES');
  const principalIds = ['EVT_18_MATCH_001','EVT_18_PRS_001','EVT_18_SOC_001','EVT_18_PRS_002','EVT_18_JAN_001','EVT_18_END_001','EVT_18_END_002','EVT_18_SUM_001','EVT_19_SUM_001'];
  const conditionalIds = ['CEVT_18_EARLY_01','CEVT_18_BRUNO_01','CEVT_18_CCH_01','CEVT_18_RELEG_01','CEVT_18_PLAYOFF_01','CEVT_19_AGENT_01','CEVT_19_INJ_01','CEVT_19_SOCIAL_01','CEVT_19_RETURN_01'];
  assert.equal(b1.principalCandidates, principalIds.length);
  assert.equal(b1.conditionalCandidates, conditionalIds.length);
  assert.deepEqual(b1.principalIds, principalIds);
  assert.deepEqual(b1.conditionalIds, conditionalIds);
  assert.equal(unique(b1.principalIds), true);
  assert.equal(unique(b1.conditionalIds), true);
  for (const id of b1.principalIds) assert.equal(plan.principalReimplementationCandidatesAfterIntegratedContracts.ids.includes(id), true, `${id}: principal B1 debe estar en backlog`);
  for (const id of b1.conditionalIds) assert.equal(plan.conditionalReimplementationCandidatesAfterIntegratedContracts.ids.includes(id), true, `${id}: condicional B1 debe estar en backlog`);
  assert.deepEqual(b1.alreadyIntegratedPrincipals, ['EVT_18_MED_001','EVT_18_TEAM_001','EVT_18_MATCH_002']);
  assert.equal(b2.principalCandidates, 27);
  assert.equal(b2.conditionalCandidates, 3);
});
