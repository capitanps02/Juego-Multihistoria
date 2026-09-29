import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';

const currentRoot=path.resolve(import.meta.dirname,'..');
const predecessorRoot=process.env.MUIR_P6_PREDECESSOR_ROOT;
assert(predecessorRoot,'MUIR_P6_PREDECESSOR_ROOT is required');
const evidenceDir=path.join(currentRoot,'analysis','muir','p6','evidence');
fs.mkdirSync(evidenceDir,{recursive:true});

async function loadGameSession(root){
  return (await import(pathToFileURL(path.join(root,'dist','session','game-session.js')).href)).GameSession;
}
const command=(session,type,extra={},commandId=type+'-'+session.getView().revision)=>({type,commandId,expectedRevision:session.getView().revision,...extra});
const findAction=(view,id)=>view.actions.categories.flatMap(c=>c.actions).find(a=>a.id===id);

async function zeroAction(GameSession){
  const s=await GameSession.create(424242,{events:[],microfeeds:false,sessionId:'muir-p6-zero'});
  for(let i=0;i<4;i++){
    if(s.getView().screen!=='career')break;
    await s.dispatch(command(s,'continue',{maxDays:21},'zero-'+i));
  }
  return s.exportSnapshot();
}

async function actionScenario(GameSession){
  const s=await GameSession.create(424242,{events:[],microfeeds:false,sessionId:'muir-p6-action'});
  const before=s.getView(),train=findAction(before,'PA_TRAIN_EXTRA');
  assert(train?.available);
  const trainPayload={type:'player_action',actionId:train.id,optionId:train.options[0].id,commandId:'action-train',expectedRevision:before.revision};
  await s.dispatch(trainPayload);
  const afterTrain=s.getView(),cooled=findAction(afterTrain,'PA_TRAIN_EXTRA');
  const snapshotAfterTrain=s.exportSnapshot();
  const resumed=await GameSession.fromSave(JSON.stringify(snapshotAfterTrain),{events:[]});
  assert.deepEqual(resumed.exportSnapshot(),snapshotAfterTrain,'save/load changed exact snapshot');

  const coachSession=await GameSession.create(424242,{events:[],microfeeds:false,sessionId:'muir-p6-coach'});
  const coachBefore=coachSession.getView(),coach=findAction(coachBefore,'PA_COACH_TALK');
  assert(coach?.available&&coach.targets.length>0);
  const target=coach.targets.find(t=>t.available),option=target?.options.find(o=>o.available);
  assert(target&&option);
  const coachPayload={type:'player_action',actionId:coach.id,optionId:option.id,targetId:target.id,commandId:'action-coach',expectedRevision:coachBefore.revision};
  await coachSession.dispatch(coachPayload);

  return {
    trainPayload,
    trainBefore:{date:before.date,revision:before.revision,availability:train},
    trainAfter:{date:afterTrain.date,revision:afterTrain.revision,availability:cooled,lastResult:afterTrain.actions.lastResult,history:afterTrain.actions.history},
    trainSnapshot:snapshotAfterTrain,
    saveLoadExact:true,
    coachPayload,
    coachAfter:coachSession.exportSnapshot()
  };
}

async function capture(root){
  const GameSession=await loadGameSession(root);
  return {zeroAction:await zeroAction(GameSession),action:await actionScenario(GameSession)};
}
const current=await capture(currentRoot);
const predecessor=await capture(path.resolve(predecessorRoot));
assert.deepEqual(current.zeroAction,predecessor.zeroAction,'ZERO_ACTION_EQUIVALENCE failed');
assert.deepEqual(current.action,predecessor.action,'PLAYER_ACTION_COMMAND_EQUIVALENCE failed');

const report={
  gate:'PASS',
  predecessorSha:'603797a9b9bae15bfb7382603111673573f873cc',
  checks:{zeroAction:true,command:true,availability:true,cooldown:true,factsIntents:true,rng:true,saveLoad:true},
  proof:{
    zeroRevision:current.zeroAction.revision,
    actionRevision:current.action.trainAfter.revision,
    cooldownUntil:current.action.trainAfter.availability.cooldownUntil,
    result:current.action.trainAfter.lastResult?.text??null,
    targetId:current.action.coachPayload.targetId
  }
};
fs.writeFileSync(path.join(evidenceDir,'equivalence-current.json'),JSON.stringify(current,null,2)+'\n');
fs.writeFileSync(path.join(evidenceDir,'equivalence-p5.json'),JSON.stringify(predecessor,null,2)+'\n');
fs.writeFileSync(path.join(evidenceDir,'equivalence-report.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report));
