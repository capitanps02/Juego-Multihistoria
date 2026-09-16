import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const audit=JSON.parse(fs.readFileSync('analysis/T5.1/canon-23-30-conditionals.json','utf8'));
const src23=fs.readFileSync('src/content/events/23_26/conditional-events.ts','utf8');
const src26=fs.readFileSync('src/content/events/26_30/conditional-events.ts','utf8');
const ids=s=>new Set([...s.matchAll(/id:\"(CEVT_[^\"]+)\"/g)].map(m=>m[1]));
const runtime23=ids(src23), runtime26=ids(src26);
const p23=audit.records.filter(r=>r.phase==='23_26');
const p26=audit.records.filter(r=>r.phase==='26_30');

test('conditional audit covers exactly the 44 canonical callbacks owned by this workstream',()=>{
  assert.equal(audit.records.length,44);
  assert.equal(p23.length,20);
  assert.equal(p26.length,24);
  assert.equal(new Set(audit.records.map(r=>r.canonicalId)).size,44);
  assert.equal(audit.summary.planningReviewed,44);
  assert.equal(audit.summary.runtimeCertifiedFull,0);
});

test('23-26 preserves exact identity but never mistakes generic factory rows for certification',()=>{
  assert.equal(runtime23.size,20);
  assert.ok(p23.every(r=>r.identityDisposition==='exact_id'));
  assert.ok(p23.every(r=>runtime23.has(r.canonicalId)));
  assert.equal(p23.filter(r=>r.conditionDisposition==='condition_contradiction').length,1);
  assert.equal(p23.find(r=>r.canonicalId==='CEVT_24_TOURN_02')?.conditionDisposition,'condition_contradiction');
  assert.match(src23,/body:\"Una causa previa de la carrera reaparece/);
  assert.match(src23,/canonStatus:\"technical_adaptation\"/);
});

test('26-30 records the five exact IDs and keeps technical lineage non-authoritative',()=>{
  assert.equal(runtime26.size,24);
  assert.equal(p26.filter(r=>r.identityDisposition==='exact_id').length,5);
  assert.equal(p26.filter(r=>r.identityDisposition==='canonical_missing_runtime_counterpart').length,7);
  assert.equal(p26.filter(r=>r.conditionDisposition==='ambiguous_partial_lineage').length,3);
  assert.equal(p26.filter(r=>['design_lineage_only','weak_lineage_only'].includes(r.conditionDisposition)).length,9);
  assert.ok(p26.filter(r=>r.identityDisposition==='exact_id').every(r=>runtime26.has(r.canonicalId)));
  for(const r of p26) for(const candidate of r.runtimeCandidates) assert.ok(runtime26.has(candidate),`${r.canonicalId}: unknown runtime lineage ${candidate}`);
});

test('known high-risk exact-ID semantic collisions remain explicit',()=>{
  assert.equal(p26.find(r=>r.canonicalId==='CEVT_29_BODY_04')?.conditionDisposition,'exact_id_semantic_collision');
  assert.equal(p26.find(r=>r.canonicalId==='CEVT_29_RECORD_02')?.conditionDisposition,'exact_id_partial_condition_generic_scene');
  assert.equal(p26.find(r=>r.canonicalId==='CEVT_29_PROJECT_02')?.conditionDisposition,'exact_id_partial_condition_generic_scene');
  assert.match(src26,/verified:true/);
});

test('audit encodes migration and external-world constraints rather than manual-review fallback',()=>{
  assert.equal(audit.rules.runtimeMutationAllowed,false);
  assert.equal(audit.rules.externalWorldFactMustExistIndependently,true);
  assert.equal(audit.rules.pendingSaveCompatibilityRequiresContentIdentityOrLegacyVersionHandling,true);
  assert.ok(!JSON.stringify(audit).includes('requires_manual_review'));
  assert.equal(audit.summary.phase26_30.safeDirectSameSceneIdMigrations,0);
});
