import test from 'node:test';
import assert from 'node:assert/strict';
import { agencyDeferredRetirement } from './qa-t5-retirement-deferral.mjs';

const base=()=>({
  retirement:{status:'decided',decidedDate:'2048-06-01'},
  history:[]
});

test('decided without explicit WAIT remains blocked',()=>{
  assert.equal(agencyDeferredRetirement(base()),false);
});

test('old WAIT before current decision does not exempt a deadlock',()=>{
  const s=base();
  s.history.push({eventId:'EVT_RET_ANNOUNCE_001',choiceId:'WAIT',date:'2048-05-01'});
  assert.equal(agencyDeferredRetirement(s),false);
});

test('explicit WAIT on current decision is agency deferral',()=>{
  const s=base();
  s.history.push({eventId:'EVT_RET_ANNOUNCE_001',choiceId:'WAIT',date:'2048-06-01'});
  assert.equal(agencyDeferredRetirement(s),true);
});

test('announced/playing never qualify even with WAIT history',()=>{
  for(const status of ['playing','announced','closed']){
    const s=base(); s.retirement.status=status;
    s.history.push({eventId:'EVT_RET_ANNOUNCE_001',choiceId:'WAIT',date:'2048-06-02'});
    assert.equal(agencyDeferredRetirement(s),false,status);
  }
});
