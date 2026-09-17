import './test-t5-football-moments.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { loadSave, serializeSave } from '../dist/save/save.js';
import { assertGameState, parseSaveJson } from '../dist/save/validation.js';
import { GameSession } from '../dist/session/game-session.js';
import { createInitialState } from '../dist/content/initial-state.js';
import { EVENTS } from '../dist/content/events/index.js';
import { scheduleEvent } from '../dist/narrative/scheduler.js';
import { resolveChoiceInPlace } from '../dist/narrative/resolver.js';
import { advanceWorldDayInPlace } from '../dist/simulation/world-simulator.js';

const invalid=e=>e.code==='INVALID_SAVE';
const initial=()=>createInitialState(424242);
const hash=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
const fixtures=JSON.parse(fs.readFileSync('qa/fixtures/migration-baselines.json','utf8')).cases;
function set(object,path,value) {
  const parts=path.split('.'), key=parts.pop();
  const parent=parts.reduce((o,k)=>o[k],object);
  if(value===undefined) delete parent[key]; else parent[key]=value;
}

for(const f of fixtures) test(`migration ${f.source}: frozen baseline, history, seeds and existing RNG preserved`,()=>{
  const raw=fs.readFileSync(f.source,'utf8'), original=JSON.parse(raw), migrated=loadSave(raw);
  assert.equal(migrated.schemaVersion,8);
  if (original.schemaVersion === 8) {
    assert.deepEqual(migrated, original, 'schema 8 is validation-only: loadSave must not normalize or migrate the fixture');
    assert.equal(f.normalizedV8Sha256, hash(original), 'schema-8 baseline must be the hash of the exact committed JSON object');
  }
  assert.equal(hash(migrated),f.normalizedV8Sha256);
  assert.deepEqual(migrated.history,original.history);
  assert.deepEqual(migrated.seeds,original.seeds);
  for(const stream of Object.keys(original.rngState)) assert.deepEqual(migrated.rngState[stream],original.rngState[stream]);
  assert.deepEqual(loadSave(serializeSave(migrated)),JSON.parse(JSON.stringify(migrated)));
});

for(const path of ['history','retirement','epilogue','runtime','runtime.day','professional','professional.technique','rngState.football','rngState.narrative.state','contract.salaryMonthly','body.acuteInjury','relationships.0.trust','npcs.0.knowledge','flags','seeds']) {
  test(`reject missing required field ${path}`,()=>{
    const s=initial(); set(s,path,undefined);
    assert.throws(()=>loadSave(JSON.stringify(s)),invalid);
  });
}

test('rejects invalid JSON, non-object roots and unknown schema before migration',()=>{
  for(const raw of ['', '{"schemaVersion":8', 'null','[]','42','"save"']) assert.throws(()=>loadSave(raw),invalid);
  for(const schemaVersion of [null,'8',1,9,8.5,-1]) assert.throws(()=>loadSave(JSON.stringify({...initial(),schemaVersion})),invalid);
});

test('rejects wrong types, non-finite numbers and impossible basic states with a field path',()=>{
  for(const [path,value] of [
    ['age',17],['phase','other'],['phase','34_plus'],['date','2026-02-30'],['date','today'],
    ['runtime.day',-1],['runtime.day',1.1],['contract.salaryMonthly','900'],['body.risk',101],
    ['professional.nationalRole','captain'],['professional.technique',Infinity],['flags.AGENT_ACTIVE','false'],
    ['retirement.status','unknown'],['retirement.status','closed'],['epilogue.generated',true],
    ['rngState.qa.draws',-1],['rngState.football.state',Number.MAX_SAFE_INTEGER+1]
  ]) {
    const s=initial();set(s,path,value);
    assert.throws(()=>assertGameState(s),e=>invalid(e) && typeof e.path==='string',`${path}=${value}`);
    assert.throws(()=>loadSave(JSON.stringify(s)),invalid,`${path} JSON`);
  }
  const s=initial();s.finances.cash=NaN;
  assert.throws(()=>serializeSave(s),invalid);
});

test('legacy validation does not turn invalid existing fields into migration defaults',()=>{
  for(const version of [3,4,5,6,7]) {
    const original=JSON.parse(fs.readFileSync(`examples/save-v0${version}-seed-424242.json`,'utf8'));
    for(const [path,value] of [['history',null],['rngState.football',undefined],['runtime.day','0'],['body.risk',null]]) {
      const s=structuredClone(original);set(s,path,value);
      assert.throws(()=>loadSave(JSON.stringify(s)),invalid,`${version}/${path}`);
    }
    if(version>=4) {
      const s=structuredClone(original); delete s.professional.roleSecurity;
      assert.throws(()=>loadSave(JSON.stringify(s)),invalid);
    }
    original.professional??={};original.professional.retirementDistance='not-a-number';
    assert.throws(()=>loadSave(JSON.stringify(original)),invalid);
  }
});

test('rejects malformed nested history, seeds and missing/duplicated NPCs',()=>{
  const original=JSON.parse(fs.readFileSync('examples/save-v08-seed-424242.json','utf8'));
  for(const [path,value] of [['history.0.date','2999-01-01'],['history.0.choiceId',null],['seeds.0.payload',[]],['seeds.0.state','potential'],['seeds.0.intensity',-10],['npcs.0.memories',{}],['relationships.0.trust',200]]) {
    const s=structuredClone(original);set(s,path,value);assert.throws(()=>loadSave(JSON.stringify(s)),invalid,path);
  }
  const duplicate=initial();duplicate.relationships.push(structuredClone(duplicate.relationships[0]));
  assert.throws(()=>assertGameState(duplicate),invalid);
  const missing=initial();missing.npcs.pop();assert.throws(()=>assertGameState(missing),invalid);
});

test('rejects prototype keys, extreme depth/size, circular values and sparse arrays',()=>{
  assert.throws(()=>parseSaveJson('{"flags":{"__proto__":{"polluted":true}}}'),invalid);
  assert.equal({}.polluted,undefined);
  assert.throws(()=>parseSaveJson('['.repeat(70)+'0'+']'.repeat(70)),invalid);
  assert.throws(()=>parseSaveJson(' '.repeat(8*1024*1024+1)),invalid);
  const s=initial();s.world.loop=s;assert.throws(()=>assertGameState(s),invalid);
  const sparse=initial();sparse.seeds=Array(2);assert.throws(()=>assertGameState(sparse),invalid);
  let executed=false;const getter=initial();Object.defineProperty(getter.world,'bad',{get(){executed=true;return 5},enumerable:true});
  assert.throws(()=>assertGameState(getter),invalid);assert.equal(executed,false);
});

test('RNG states larger than uint32 are preserved exactly',()=>{
  const raw=fs.readFileSync('examples/save-v08-seed-424242.json','utf8'),s=loadSave(raw);
  assert.ok(s.rngState.football.state>0xffffffff);
  assert.equal(s.rngState.football.state,JSON.parse(raw).rngState.football.state);
});

for(const f of fixtures.filter(f=>!f.source.includes('v08'))) test(`continuation after migrated save/reload: ${f.source}`,()=>{
  const a=loadSave(fs.readFileSync(f.source,'utf8'));
  const tick=s=>{
    if(s.retirement.status==='closed') return;
    const event=scheduleEvent(s,EVENTS);
    if(event) resolveChoiceInPlace(s,event.event,event.event.choices[0].id);
    if(s.retirement.status!=='closed') advanceWorldDayInPlace(s);
  };
  for(let i=0;i<90;i++) tick(a);
  const b=loadSave(serializeSave(a));
  for(let i=0;i<90;i++){tick(a);tick(b);}
  assert.equal(serializeSave(a),serializeSave(b));
});

async function sampleSession() {
  const s=await GameSession.create(424242);
  await s.dispatch({type:'continue',commandId:'advance',expectedRevision:0});
  return s;
}
test('T2.1 session migrates without writing, losing pending scene, changing RNG or mutating input',async()=>{
  const old=(await sampleSession()).exportSnapshot();old.build='0.8.0-t2.1';
  const before=JSON.stringify(old);let writes=0;
  const s=await GameSession.fromSave(before,{commit:async()=>{writes++;}});
  const next=s.exportSnapshot();assert.equal(next.build,'0.8.0-t2.5');next.build=old.build;
  assert.equal(JSON.stringify(next),before);assert.equal(JSON.stringify(old),before);assert.equal(writes,0);
});

test('corrupt session receipts/screens/state never call the storage adapter',async()=>{
  const original=(await sampleSession()).exportSnapshot();let writes=0;
  const paths=[['state.history',null],['revision',12],['receipts.0.commandId',null],['receipts.0.revision',9],['receipts.0.fingerprint','["continue",8,90]'],['receipts.0.fingerprint','{"x":true}'],['pendingDecision.instanceId','another:1'],['needsWorldAdvance',true],['journal',[{}]],['sessionVersion',99],['build','0.8.0-future']];
  for(const [path,value] of paths){
    const bad=structuredClone(original);set(bad,path,value);
    await assert.rejects(GameSession.fromSave(JSON.stringify(bad),{commit:async()=>{writes++;}}),invalid,path);
  }
  assert.equal(writes,0);
});

test('corrupt result/journal and duplicate receipts are rejected',async()=>{
  const s=await sampleSession(),v=s.getView();
  await s.dispatch({type:'choose',commandId:'choose',expectedRevision:1,pendingInstanceId:v.decision.instanceId,choiceId:v.decision.choices[0].id});
  const original=s.exportSnapshot();
  for(const [path,value] of [['pendingResult.messages',['invented']],['pendingResult',null],['journal.0.choiceLabel','changed'],['receipts.1.commandId','advance'],['needsWorldAdvance',false]]) {
    const bad=structuredClone(original);set(bad,path,value);await assert.rejects(GameSession.resume(bad),invalid,path);
  }
  const old=structuredClone(original);old.build='0.8.0-t2.1';
  assert.deepEqual((await GameSession.resume(old)).getView(),s.getView());
});

test('receipt chronology and chosen payload must agree with the actual history',async()=>{
  const s=await sampleSession(),v=s.getView();
  await s.dispatch({type:'choose',commandId:'choose',expectedRevision:1,pendingInstanceId:v.decision.instanceId,choiceId:v.decision.choices[0].id});
  const snapshot=s.exportSnapshot();
  const wrongChoice=structuredClone(snapshot);
  const fingerprint=JSON.parse(wrongChoice.receipts[1].fingerprint);
  fingerprint[3]=v.decision.choices[1].id;wrongChoice.receipts[1].fingerprint=JSON.stringify(fingerprint);
  await assert.rejects(GameSession.resume(wrongChoice),invalid);
  const wrongScene=structuredClone(snapshot);fingerprint[3]=v.decision.choices[0].id;fingerprint[2]='wrong:1';
  wrongScene.receipts[1].fingerprint=JSON.stringify(fingerprint);
  await assert.rejects(GameSession.resume(wrongScene),invalid);
  const wrongOrder=structuredClone(snapshot);
  wrongOrder.receipts[0].type='acknowledge';wrongOrder.receipts[0].fingerprint='["acknowledge",0]';
  await assert.rejects(GameSession.resume(wrongOrder),invalid);
});
