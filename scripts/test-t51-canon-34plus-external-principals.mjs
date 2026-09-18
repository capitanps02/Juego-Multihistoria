import assert from 'node:assert/strict';
import test from 'node:test';
import { createInitialState } from '../dist/content/initial-state.js';
import { STAGED_EXTERNAL_PRINCIPALS,stagedExternalPrincipalEligible } from '../dist/content/events/34_plus/staged-principal-awaiting-external.js';

test('all remaining ordinary 34+ principals are staged exactly once behind factual external gates',()=>{
  assert.equal(STAGED_EXTERNAL_PRINCIPALS.length,34);
  const ids=STAGED_EXTERNAL_PRINCIPALS.map(r=>r.event.id);
  assert.equal(new Set(ids).size,34);
  for(const row of STAGED_EXTERNAL_PRINCIPALS){
    assert.equal(row.status,'AWAITING_EXTERNAL_FACT');
    assert.equal(row.event.canonStatus,'verified');
    assert.ok(row.event.tags.includes('staged_not_registered'));
    assert.ok(row.event.tags.includes('awaiting_external_fact'));
    assert.equal(row.event.choices.length,4);
    assert.ok(row.requiredFacts.length>0,row.event.id);
    assert.deepEqual(row.event.gates,[{path:'flags.__A8_EXTERNAL_FACT_NEVER_SYNTHESIZE',op:'eq',value:true}]);
  }
});

test('external principals fail closed unless an authoritative adapter explicitly satisfies facts',()=>{
  const state=createInitialState(13001);state.age=38;state.phase='34_plus';state.retirement.status='playing';
  for(const row of STAGED_EXTERNAL_PRINCIPALS){
    assert.equal(stagedExternalPrincipalEligible(state,row.event.id,false),false,row.event.id);
    assert.equal(stagedExternalPrincipalEligible(state,row.event.id,true),true,row.event.id);
  }
});

test('staged external principal outcomes never mutate club, contract, sport or retirement status directly',()=>{
  const forbidden=[/^club(?:\.|$)/,/^contract(?:\.|$)/,/^sport\./,/^retirement\.status$/,/^professional\.registrationClub$/,/^professional\.ownerClub$/];
  for(const row of STAGED_EXTERNAL_PRINCIPALS){
    for(const outcome of row.event.outcomes){
      for(const effect of outcome.effects??[]){
        if('path' in effect) assert.equal(forbidden.some(re=>re.test(effect.path)),false,`${row.event.id}/${effect.path}`);
      }
    }
  }
});

test('terminal choices remain marked for Agent 9 rather than changing retirement state in A8',()=>{
  const terminal=STAGED_EXTERNAL_PRINCIPALS.filter(r=>r.terminalChoiceIds.length>0);
  assert.ok(terminal.some(r=>r.event.id==='EVT_36_LOWER_001'));
  assert.ok(terminal.some(r=>r.event.id==='EVT_38_RICH_001'));
  for(const row of terminal) assert.equal(row.event.outcomes.some(o=>o.effects.some(e=>'path' in e && e.path==='retirement.status')),false);
});
