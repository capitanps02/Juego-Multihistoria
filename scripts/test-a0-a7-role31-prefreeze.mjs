import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState } from '../dist/content/initial-state.js';
import { EVENTS, EVENTS_30_34 } from '../dist/content/events/index.js';
import { eventGatesPass } from '../dist/narrative/event-gates.js';
import { recordOfficialMatchInPlace } from '../dist/simulation/match-model.js';
import { narrativeCausalFacts } from '../dist/simulation/club-contract-intent.js';
import { validateBuild } from '../dist/validation/build-validation.js';

const role=EVENTS_30_34.find(event=>event.id==='EVT_31_ROLE_001');
assert.ok(role);

function state31(seed){
  const state=createInitialState(seed);
  state.age=31;
  state.phase='30_34';
  state.date='2039-09-22';
  state.runtime.day=49;
  state.runtime.seasonDay=49;
  return state;
}

test('A7 ROLE31 prefreeze preserves 388 and retires only technical HOME33 slot',()=>{
  assert.equal(EVENTS.length,388);
  assert.equal(new Set(EVENTS.map(event=>event.id)).size,388);
  assert.equal(EVENTS_30_34.some(event=>event.id==='EVT_31_ROLE_001'),true);
  assert.equal(EVENTS_30_34.some(event=>event.id==='EVT_33_HOME_001'),false);
  assert.equal(EVENTS_30_34.some(event=>event.id==='EVT_33_RET_001'),true);
  assert.deepEqual(validateBuild(EVENTS).filter(issue=>issue.level==='error'),[]);
});

test('A7 ROLE31 uses only prior-two factual scoring plus current bench fact',()=>{
  assert.deepEqual(role.gates,[
    {path:'facts.sport.priorTwoMatchStats.goals',op:'gte',value:3},
    {path:'facts.match.playerOnBench',op:'eq',value:true}
  ]);
  assert.equal(role.gates.some(gate=>gate.path==='sport.form'),false);
  assert.equal(role.tags?.includes('t51_blocked_three_goals_and_bench_authority'),false);
  assert.equal(role.tags?.includes('t51_blocked_SEED_FORM_VS_PLAN_identity'),false);
});

test('A7 ROLE31 fails closed without exact prior-two + current bench facts',()=>{
  const empty=state31(731001);
  empty.sport.form=100;
  assert.equal(eventGatesPass(empty,role),false);

  let qualifying=null;
  for(let seed=731010;seed<732000 && !qualifying;seed++){
    const state=state31(seed);
    state.date='2039-09-01'; state.runtime.day=28; state.runtime.seasonDay=28;
    const r1=recordOfficialMatchInPlace(state,{appeared:true,debutOccurred:false,injuryUnavailable:false});
    state.date='2039-09-08'; state.runtime.day=35; state.runtime.seasonDay=35;
    const r2=recordOfficialMatchInPlace(state,{appeared:true,debutOccurred:false,injuryUnavailable:false});
    if(!r1||!r2) continue;
    state.date='2039-09-15'; state.runtime.day=42; state.runtime.seasonDay=42;
    const current=recordOfficialMatchInPlace(state,{appeared:false,debutOccurred:false,injuryUnavailable:false});
    if(!current) continue;
    const facts=narrativeCausalFacts(state);
    if((facts.sport.priorTwoMatchStats?.goals??0)>=3 && facts.match.playerOnBench===true) qualifying=state;
  }
  assert.ok(qualifying,'directed seed range must contain a factual qualifying window');
  assert.equal(eventGatesPass(qualifying,role),true);
  qualifying.sport.form=0;
  assert.equal(eventGatesPass(qualifying,role),true,'aggregate form must not control canonical gate');
});

test('A7 ROLE31 factual reads are deterministic/read-only',()=>{
  const state=state31(731777);
  const before=structuredClone(state);
  narrativeCausalFacts(state);
  eventGatesPass(state,role);
  assert.deepEqual(state,before);
});
