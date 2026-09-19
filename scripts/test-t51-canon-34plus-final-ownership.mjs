import assert from 'node:assert/strict';
import test from 'node:test';
import {
  A8_STAGED_PRINCIPALS,
  A8_STAGED_ORDINARY_CONDITIONALS,
  A8_TERMINAL_CONDITIONAL_HANDOFFS,
  A8_ORDINARY_SEED_WRITERS
} from '../dist/content/events/34_plus/staged-runtime.js';

const TERMINAL_IDS=[
  'CEVT_38_OFFER_AFTER_RETIREMENT_ANNOUNCED',
  'CEVT_RET_NO_LAST_MATCH',
  'CEVT_RET_STORYBOOK_LAST_GOAL',
  'CEVT_38_RETIREMENT_REVERSAL'
];

const BRIDGES=new Set([
  'SEED_FORM_VS_PLAN','SEED_PEAK_BODY_MEMORY','SEED_PEAK_ROLE_LEGACY','SEED_CONTRACT_REPUTATION',
  'SEED_PUBLIC_POLARIZATION','SEED_CLUB_POWER_MEMORY','SEED_FINALS_MEMORY','SEED_NATIONAL_LEGACY',
  'SEED_WEALTH_LEGACY','SEED_AGENT_ENDGAME','SEED_FAMILY_RELOCATION','SEED_VETERAN_MARKET_SIGNAL',
  'SEED_MEDICAL_LONG_MEMORY','SEED_HOME_RETURN_SIGNAL'
]);

const forbiddenPath = path =>
  path==='retirement.status'
  || path==='club'
  || path==='tier'
  || path.startsWith('contract.')
  || path==='professional.registrationClub'
  || path==='professional.ownerClub'
  || path==='professional.leagueTier'
  || path.startsWith('sport.');

test('A8 ownership surface is exactly 43 ordinary principals + 32 resolved conditional identities',()=>{
  assert.equal(A8_STAGED_PRINCIPALS.length,43);
  assert.equal(new Set(A8_STAGED_PRINCIPALS.map(e=>e.id)).size,43);
  assert.equal(A8_STAGED_ORDINARY_CONDITIONALS.length,28);
  assert.equal(new Set(A8_STAGED_ORDINARY_CONDITIONALS.map(e=>e.id)).size,28);
  assert.equal(A8_TERMINAL_CONDITIONAL_HANDOFFS.length,4);
  assert.deepEqual(A8_TERMINAL_CONDITIONAL_HANDOFFS.map(x=>x.id).sort(),TERMINAL_IDS.sort());
  assert.equal(new Set([
    ...A8_STAGED_ORDINARY_CONDITIONALS.map(e=>e.id),
    ...A8_TERMINAL_CONDITIONAL_HANDOFFS.map(x=>x.id)
  ]).size,32);
});

test('all 43 staged principals are concrete canonical definitions with choices and outcomes',()=>{
  for(const e of A8_STAGED_PRINCIPALS){
    assert.equal(e.canonStatus,'verified',e.id);
    assert.ok(e.tags.includes('staged_not_registered'),e.id);
    assert.ok(e.choices.length>=4,e.id);
    assert.ok(e.outcomes.length>=e.choices.length,e.id);
    for(const c of e.choices){
      assert.ok(c.outcomeIds.length>=1,`${e.id}/${c.id}`);
      for(const outcomeId of c.outcomeIds) assert.ok(e.outcomes.some(o=>o.id===outcomeId),`${e.id}/${c.id}/${outcomeId}`);
    }
  }
});

test('all 28 ordinary conditionals are concrete staged definitions and terminal ownership stays outside A8',()=>{
  for(const e of A8_STAGED_ORDINARY_CONDITIONALS){
    assert.equal(e.canonStatus,'verified',e.id);
    assert.ok(e.choices.length>=4,e.id);
    assert.ok(e.outcomes.length>=e.choices.length,e.id);
    for(const o of e.outcomes){
      for(const fx of o.effects??[]) if('path' in fx) assert.notEqual(fx.path,'retirement.status',e.id);
    }
  }
});

test('45 ordinary Pasada-7 seed writers have a real create transition from the exact producer',()=>{
  assert.equal(A8_ORDINARY_SEED_WRITERS.length,45);
  assert.equal(new Set(A8_ORDINARY_SEED_WRITERS.map(x=>x.seedId)).size,45);
  const events=new Map(A8_STAGED_PRINCIPALS.map(e=>[e.id,e]));
  for(const writer of A8_ORDINARY_SEED_WRITERS){
    assert.equal(BRIDGES.has(writer.seedId),false,writer.seedId);
    const event=events.get(writer.producerEventId);
    assert.ok(event,writer.producerEventId);
    const creates=event.outcomes.flatMap(o=>o.seedTransitions??[]).filter(t=>t.action==='create'&&t.seedId===writer.seedId);
    assert.ok(creates.length>0,`${writer.seedId} missing create transition in ${writer.producerEventId}`);
  }
});

test('A8 principal and conditional narrative outcomes never directly mutate external football/terminal authorities',()=>{
  for(const e of [...A8_STAGED_PRINCIPALS,...A8_STAGED_ORDINARY_CONDITIONALS]){
    for(const o of e.outcomes){
      for(const fx of o.effects??[]) if('path' in fx) assert.equal(forbiddenPath(fx.path),false,`${e.id}/${fx.path}`);
    }
  }
});
