import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { EVENTS } from '../dist/content/events/index.js';

const debt=JSON.parse(fs.readFileSync('analysis/T5.1/canon-30-34-conditional-seed-read-debt.json','utf8'));
const readiness=JSON.parse(fs.readFileSync('analysis/T5.1/canon-30-34-implementation-readiness.json','utf8'));
const migrationHandoff=JSON.parse(fs.readFileSync('analysis/T5.1/canon-30-34-migration-handoff.json','utf8'));
const byId=new Map(EVENTS.map(event=>[event.id,event]));

const HISTORICAL_SEED_CALLBACKS=new Map([
 ['CEVT_31_SURGERY_01','SEED_SURGERY_31'],
 ['CEVT_31_COACH_01','SEED_NEW_COACH_RESET'],
 ['CEVT_31_NTLOAD_01','SEED_CLUB_NT_LOAD_TENSION'],
 ['CEVT_31_FINAL_01','SEED_MANAGED_FINAL_ROLE'],
 ['CEVT_32_REPLACE_01','SEED_REPLACEMENT_BREAKOUT'],
 ['CEVT_32_BOSMAN_01','SEED_BOSMAN_33'],
 ['CEVT_32_FAN_01','SEED_FAN_LEGACY_BUFFER']
]);

test('conditional seed debt preserves the seven historical callback identities as removal evidence',()=>{
 assert.equal(debt.rows.length,7);
 assert.deepEqual(
  debt.rows.map(row=>[row.eventId,row.seedId]).sort(),
  [...HISTORICAL_SEED_CALLBACKS.entries()].sort()
 );
 assert.deepEqual([...debt.resolution.removedEventIds].sort(),[...HISTORICAL_SEED_CALLBACKS.keys()].sort());
});

test('conditional seed debt follows current baseline and active target',()=>{
 assert.equal(readiness.base,`main@${debt.sourceMainSha}`);
 assert.equal(debt.sourceMainSha,migrationHandoff.sourceMainSha);
 assert.equal(debt.identityConstraint.currentTargetContentIdentity,readiness.currentTarget.contentIdentity);
 assert.equal(debt.identityConstraint.currentTargetContentIdentity,migrationHandoff.observedTargetContentIdentity);
});

test('removed technical callbacks are no longer runtime consumers',()=>{
 assert.equal(debt.classification,'resolved_by_removal_no_canonical_identity');
 assert.equal(debt.summary.ownerDeclaredReadMismatches,0);
 assert.equal(debt.summary.runtimePositiveSeedGates,0);
 assert.equal(debt.summary.runtimeMetadataFixDeferred,0);
 for(const eventId of HISTORICAL_SEED_CALLBACKS.keys()){
  assert.equal(byId.has(eventId),false,`${eventId}: removed technical callback must not remain active`);
 }
});

test('removal does not promote or synthesize canonical seed consumption',()=>{
 assert.equal(debt.summary.canonicalConditionalIdentityVerified,0);
 assert.equal(debt.summary.safeToCallCanonicalConsumer,0);
 assert.equal(debt.policy.runtimeConsumptionIsNotCanonicalCertification,true);
 assert.match(debt.resolution.rule,/no replacement consumer is invented/i);
});
