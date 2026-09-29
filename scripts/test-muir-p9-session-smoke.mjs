import test from 'node:test';
import assert from 'node:assert/strict';
import {GameSession} from '../dist/session/game-session.js';

let seq=0;
const command=(s,type,extra={})=>({type,commandId:'p9-smoke-'+(++seq),expectedRevision:s.getView().revision,...extra});
function fixture(){
  return {
    id:'P9_DECISION_SMOKE',ageWindow:[18,18],phase:'18_20',family:'team',gates:[],cooldown:99999,weight:100,
    text:{title:'P9 smoke decision',body:'Decision body must remain unchanged.'},
    intel:{visible:['Dato visible real.'],uncertain:['Dato incierto real.']},
    choices:[
      {id:'A',label:'Primera opción',intentTags:['p9_smoke'],immediateEffects:[],hiddenCosts:[],followUps:[],outcomeIds:['OUT_A']},
      {id:'B',label:'Segunda opción',intentTags:['p9_smoke'],immediateEffects:[],hiddenCosts:[],followUps:[],outcomeIds:['OUT_B']}
    ],
    outcomes:[
      {id:'OUT_A',baseWeight:1,effects:[{kind:'numeric',path:'sport.form',delta:2}],messages:['Resultado A exacto.']},
      {id:'OUT_B',baseWeight:1,effects:[],messages:['Resultado B exacto.']}
    ],
    tags:['p9_smoke'],canonStatus:'technical_adaptation'
  };
}
async function reachDecision(s){
  for(let i=0;i<20;i++){
    const v=s.getView();
    if(v.screen==='decision')return v.decision;
    assert.equal(v.screen,'career');
    await s.dispatch(command(s,'continue',{maxDays:1}));
  }
  throw Error('P9 synthetic decision was not scheduled');
}
async function newSession(){
  const s=await GameSession.create(909090,{events:[fixture()],microfeeds:false,sessionId:'p9-smoke-session'});
  const decision=await reachDecision(s);return {s,decision};
}
test('Decision exposes exact ordered public choice ids/labels and no predictive fields',async()=>{
  const {decision}=await newSession();
  assert.equal(decision.title,'P9 smoke decision');
  assert.equal(decision.body,'Decision body must remain unchanged.');
  assert.deepEqual(decision.visible,['Dato visible real.']);
  assert.deepEqual(decision.uncertain,['Dato incierto real.']);
  assert.deepEqual(decision.choices,[{id:'A',label:'Primera opción'},{id:'B',label:'Segunda opción'}]);
  for(const c of decision.choices)assert.deepEqual(Object.keys(c).sort(),['id','label']);
});
test('same choice command produces Result then acknowledge clears Result without double resolution',async()=>{
  const {s,decision}=await newSession();
  const before=s.exportSnapshot();
  const choose=command(s,'choose',{pendingInstanceId:decision.instanceId,choiceId:'A'});
  const first=await s.dispatch(choose);
  assert.equal(first.replayed,false);
  let v=s.getView();assert.equal(v.screen,'result');assert.equal(v.result.choiceLabel,'Primera opción');
  assert.ok(v.result.visibleEffects.some(x=>x.label==='Forma'&&x.delta===2));
  const afterChoose=s.exportSnapshot();
  assert.equal(afterChoose.state.history.length,before.state.history.length+1);
  const replay=await s.dispatch(choose);
  assert.equal(replay.replayed,true);
  assert.equal(s.exportSnapshot().state.history.length,afterChoose.state.history.length,'same command must not resolve twice');
  await s.dispatch(command(s,'acknowledge'));
  v=s.getView();assert.notEqual(v.screen,'result');assert.equal(s.exportSnapshot().state.history.length,afterChoose.state.history.length);
});
test('stale second choice is rejected after first choice changes revision',async()=>{
  const {s,decision}=await newSession();
  const revision=s.getView().revision;
  const a={type:'choose',commandId:'p9-a',expectedRevision:revision,pendingInstanceId:decision.instanceId,choiceId:'A'};
  const b={type:'choose',commandId:'p9-b',expectedRevision:revision,pendingInstanceId:decision.instanceId,choiceId:'B'};
  await s.dispatch(a);
  await assert.rejects(()=>s.dispatch(b),e=>e?.code==='STALE_REVISION');
});
