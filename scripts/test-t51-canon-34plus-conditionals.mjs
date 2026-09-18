import assert from 'node:assert/strict';
import test from 'node:test';
import { createInitialState } from '../dist/content/initial-state.js';
import { STAGED_ORDINARY_CANONICAL_CONDITIONALS,stagedCanonicalConditionalEligible } from '../dist/content/events/34_plus/staged-conditional-ordinary.js';

test('A8 stages exactly 23 external-fact canonical Pasada-7 conditionals',()=>{
 assert.equal(STAGED_ORDINARY_CANONICAL_CONDITIONALS.length,23);
 const ids=STAGED_ORDINARY_CANONICAL_CONDITIONALS.map(x=>x.event.id);
 assert.equal(new Set(ids).size,23);
 for(const row of STAGED_ORDINARY_CANONICAL_CONDITIONALS){
   assert.equal(row.status,'AWAITING_EXTERNAL_FACT');
   assert.equal(row.event.family,'conditional');
   assert.equal(row.event.canonStatus,'verified');
   assert.ok(row.event.tags.includes('no_generic_shell'));
   assert.ok(row.canonicalTrigger.length>3);
   assert.ok(row.canonicalMeaning.length>3);
   assert.equal(row.event.choices.length,4);
 }
});
test('canonical conditional choices are scene-specific rather than the technical A-D shell',()=>{
 for(const row of STAGED_ORDINARY_CANONICAL_CONDITIONALS){
   assert.notDeepEqual(row.event.choices.map(c=>c.id),['A','B','C','D'],row.event.id);
   assert.equal(new Set(row.event.choices.map(c=>c.label)).size,4,row.event.id);
 }
});
test('all staged ordinary conditionals fail closed without factual owner trigger',()=>{
 const s=createInitialState(14001);s.age=40;s.phase='34_plus';s.retirement.status='playing';
 for(const row of STAGED_ORDINARY_CANONICAL_CONDITIONALS){
   assert.equal(stagedCanonicalConditionalEligible(s,row.event.id,false),false,row.event.id);
   assert.equal(stagedCanonicalConditionalEligible(s,row.event.id,true),true,row.event.id);
 }
});
test('ordinary conditional staging never owns terminal retirement state mutation',()=>{
 for(const row of STAGED_ORDINARY_CANONICAL_CONDITIONALS){
   for(const out of row.event.outcomes){
     assert.equal(out.effects.some(e=>'path' in e && e.path==='retirement.status'),false,row.event.id);
   }
 }
});

test('all externally gated ordinary conditionals have scene-specific local effects',()=>{
 for(const row of STAGED_ORDINARY_CANONICAL_CONDITIONALS){
  for(const outcome of row.event.outcomes){
   assert.ok((outcome.effects??[]).length>0,`${row.event.id}/${outcome.id}`);
   for(const effect of outcome.effects??[]){
    if('path' in effect){
     assert.equal(effect.path.startsWith('sport.'),false,`${row.event.id}/${effect.path}`);
     assert.notEqual(effect.path,'retirement.status',row.event.id);
     assert.equal(effect.path.startsWith('contract.'),false,`${row.event.id}/${effect.path}`);
    }
   }
  }
 }
});

test('known causal-memory conditionals declare exact seed reads instead of HAS_SEED proxies',()=>{
 const expected={
  CEVT_34_RIVAS_RETURNS:['SEED_RIVAS_TRUST'],
  CEVT_34_NANO_DIRECTOR:['SEED_NANO_SHADOW'],
  CEVT_34_ADRIAN_LAST_DERBY:['SEED_ADRIAN_MIRROR'],
  CEVT_34_SUCCESSOR_INJURED:['SEED_YOUNG_SUCCESSOR'],
  CEVT_35_UDV_CUP_RUN:['SEED_HOME_INSTITUTION'],
  CEVT_36_RECORD_BROKEN_BY_OTHER:['SEED_RECORD_CHASE']
 };
 for(const [id,seeds] of Object.entries(expected)){
  const row=STAGED_ORDINARY_CANONICAL_CONDITIONALS.find(x=>x.event.id===id);
  assert.ok(row,id);
  assert.deepEqual(row.event.seedsRead,seeds,id);
 }
});
