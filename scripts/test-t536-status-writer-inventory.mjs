import test from 'node:test';
import assert from 'node:assert/strict';
import { EVENTS } from '../dist/content/events/index.js';
import { createInitialState } from '../dist/content/initial-state.js';
import { closeCareer } from '../dist/simulation/late-career-engine.js';
import { loadSave } from '../dist/save/save.js';

function collectStatusWrites(value,out=[]){
  if(Array.isArray(value)){
    for(const item of value)collectStatusWrites(item,out);
    return out;
  }
  if(!value||typeof value!=='object')return out;
  if(value.kind==='set'&&value.path==='retirement.status')out.push(String(value.value));
  for(const nested of Object.values(value))collectStatusWrites(nested,out);
  return out;
}

const expected=new Map([
  ['EVT_38_MKT_001',['decided']],
  ['EVT_RET_HOME_001',['decided']],
  ['EVT_RET_BODY_001',['decided']],
  ['EVT_RET_HIGH_001',['decided']],
  ['EVT_RET_LOW_001',['decided']],
  ['EVT_RET_ANNOUNCE_001',['announced']],
  ['CEVT_RET_RECONSIDER',['playing']],
  ['CEVT_RET_NO_LAST_MATCH',['closed']],
  ['CEVT_RET_STORYBOOK_LAST_GOAL',['closed']]
]);

test('T5.36 every content writer of retirement.status is explicitly inventoried',()=>{
  const actual=new Map();
  for(const event of EVENTS){
    const writes=[...new Set(collectStatusWrites(event))].sort();
    if(writes.length)actual.set(event.id,writes);
  }
  assert.deepEqual([...actual.entries()].sort(([a],[b])=>a.localeCompare(b)),[...expected.entries()].map(([id,values])=>[id,[...values].sort()]).sort(([a],[b])=>a.localeCompare(b)));
});

test('T5.36 every direct status writer is terminal-tagged and writes a legal status',()=>{
  const legal=new Set(['playing','decided','announced','closed']);
  for(const event of EVENTS){
    const writes=collectStatusWrites(event);
    if(!writes.length)continue;
    assert.ok(event.tags?.includes('t536_terminal'),`${event.id} writes retirement.status without t536_terminal ownership tag`);
    for(const value of writes)assert.ok(legal.has(value),`${event.id} writes invalid retirement status ${value}`);
  }
});

test('T5.36 legacy 30-34 bridge is narrowly keyed to the explicit historical retirement fact',()=>{
  const blocked=createInitialState(53690);
  blocked.age=33;
  blocked.retirement.status='playing';
  blocked.flags.EARLY_RETIRED_30_34=true;
  closeCareer(blocked,'some_other_reason','early_retirement');
  assert.equal(blocked.retirement.status,'playing');
  assert.equal(blocked.flags.RETIREMENT_INVALID_TRANSITION_BLOCKED,true);

  const bridged=createInitialState(53691);
  bridged.age=33;
  bridged.retirement.status='playing';
  bridged.flags.EARLY_RETIRED_30_34=true;
  closeCareer(bridged,'early_retirement_30_34','early_retirement');
  assert.equal(bridged.retirement.status,'closed');
  assert.equal(bridged.retirement.reason,'early_retirement_30_34');
  assert.equal(bridged.retirement.closureType,'early_retirement');
  assert.equal(bridged.flags.RETIREMENT_WAS_ANNOUNCED,true);
});

test('T5.36 schema-7 historical early-retirement flag is reconstructed, not newly decided on load',()=>{
  const state=createInitialState(53692);
  state.age=33;
  state.phase='30_34';
  state.flags.EARLY_RETIRED_30_34=true;
  const legacy=structuredClone(state);
  legacy.schemaVersion=7;
  delete legacy.retirement;
  delete legacy.epilogue;
  const rng=structuredClone(legacy.rngState);
  const history=structuredClone(legacy.history);
  const loaded=loadSave(JSON.stringify(legacy));
  assert.equal(loaded.retirement.status,'closed');
  assert.equal(loaded.retirement.reason,'early_retirement_30_34');
  assert.equal(loaded.retirement.closureType,'early_retirement');
  assert.deepEqual(loaded.rngState,rng);
  assert.deepEqual(loaded.history,history);
});
