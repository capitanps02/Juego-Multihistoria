import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { EVENTS } from '../dist/content/events/index.js';

const audit=JSON.parse(fs.readFileSync('analysis/T5.1/canon-30-34.json','utf8'));
const debt=JSON.parse(fs.readFileSync('analysis/T5.1/canon-30-34-conditional-seed-read-debt.json','utf8'));

test('all 26 engine-side 30-34 conditionals are resolved remove/supersede, not promoted by similarity',()=>{
  assert.equal(audit.conditionals.events.length,26);
  assert.equal(audit.counts.conditionalsResolvedRemoveOrSupersede,26);
  assert.equal(audit.counts.conditionalsRequiresManualReview,0);
  assert.equal(audit.conditionals.activeRuntimeCountAfterResolution,0);
  assert.equal(audit.conditionals.events.every(row=>row.status.startsWith('remove_')||row.status.startsWith('superseded_')),true);
});

test('no CEVT_30-34 technical callback remains active in EVENTS',()=>{
  const active=EVENTS.filter(event=>/^CEVT_(30|31|32|33)_/.test(event.id));
  assert.deepEqual(active,[]);
});

test('La selección gana sin ti conditional is superseded cross-type without aliasing the canonical principal',()=>{
  const row=audit.conditionals.events.find(x=>x.engineId==='CEVT_30_NAT_01');
  assert.equal(row.status,'superseded_by_canonical_principal_EVT_30_NAT_002');
  assert.equal(EVENTS.some(event=>event.id==='CEVT_30_NAT_01'),false);
  assert.equal(audit.conditionals.crossTypeWarnings.some(x=>x.engineConditionalId==='CEVT_30_NAT_01'&&x.canonicalPrincipalId==='EVT_30_NAT_002'),true);
  assert.equal(audit.conditionals.migrationSemantics.aliasesCreated,false);
  assert.equal(audit.conditionals.migrationSemantics.rewriteHistory,false);
});

test('removing non-canonical callbacks does not invent replacement seed consumers',()=>{
  assert.equal(debt.classification,'resolved_by_removal_no_canonical_identity');
  assert.equal(debt.summary.runtimePositiveSeedGates,0);
  assert.equal(debt.summary.runtimeMetadataFixDeferred,0);
  assert.equal(debt.resolution.removedEventIds.length,7);
  assert.match(debt.resolution.rule,/no replacement consumer is invented/i);
});
