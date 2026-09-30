import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {pathToFileURL} from 'node:url';

const currentRoot=path.resolve(import.meta.dirname,'..');
const predecessorRoot=process.env.MUIR_P12_PREDECESSOR_ROOT;
const P11='81f802a2c2ef14a69d0b0b6251e40532615509aa';
assert(predecessorRoot,'MUIR_P12_PREDECESSOR_ROOT is required');

async function loadSession(root){
  return (await import(pathToFileURL(path.join(root,'dist/session/game-session.js')).href)).GameSession;
}
const cmd=(s,type,extra={},id=type+'-'+s.getView().revision)=>({
  type,commandId:id,expectedRevision:s.getView().revision,...extra
});
const stable=value=>JSON.parse(JSON.stringify(value));
const findAction=(view,id)=>view.actions.categories.flatMap(c=>c.actions).find(a=>a.id===id);

async function zeroAction(GameSession){
  const s=await GameSession.create(424242,{events:[],microfeeds:false,sessionId:'muir-p12-zero',playerDisplayName:'Leo'});
  const sequence=[stable(s.getView())];
  for(let i=0;i<4;i++){
    if(s.getView().screen!=='career')break;
    await s.dispatch(cmd(s,'continue',{maxDays:21},'zero-'+i));
    sequence.push(stable(s.getView()));
  }
  const snapshot=stable(s.exportSnapshot());
  const resumed=await GameSession.resume(stable(snapshot),{events:[]});
  assert.deepEqual(stable(resumed.exportSnapshot()),snapshot,'zero-action save/resume drift');
  return {sequence,snapshot,resumeExact:true};
}

async function autoScenario(GameSession){
  const s=await GameSession.create(515151,{events:[],microfeeds:false,sessionId:'muir-p12-auto',playerDisplayName:'Alex Monteiro'});
  const commands=[];
  const start=cmd(s,'auto',{action:'start',maxWeeks:4},'auto-start');
  commands.push(stable(start));await s.dispatch(start);
  for(let i=0;i<20&&s.getView().simulation.mode==='auto_simulating';i++){
    const step=cmd(s,'auto',{action:'step'},'auto-step-'+i);
    commands.push(stable(step));await s.dispatch(step);
  }
  return {commands,view:stable(s.getView()),snapshot:stable(s.exportSnapshot())};
}

async function playerActionScenario(GameSession){
  const s=await GameSession.create(424242,{events:[],microfeeds:false,sessionId:'muir-p12-action',playerDisplayName:"Noa D'Avila"});
  const before=stable(s.getView());
  const action=findAction(before,'PA_TRAIN_EXTRA');
  assert(action?.available,'PA_TRAIN_EXTRA unavailable in P12 equivalence fixture');
  const option=action.options.find(o=>o.available)??action.options[0];
  assert(option,'PA_TRAIN_EXTRA option missing');
  const payload=cmd(s,'player_action',{actionId:action.id,optionId:option.id},'action-train');
  await s.dispatch(payload);
  const after=stable(s.getView());
  const snapshot=stable(s.exportSnapshot());
  const resumed=await GameSession.resume(stable(snapshot),{events:[]});
  assert.deepEqual(stable(resumed.exportSnapshot()),snapshot,'player-action save/resume drift');
  return {payload:stable(payload),before,after,snapshot,resumeExact:true};
}

async function offerScenario(GameSession){
  const s=await GameSession.create(123,{events:[],microfeeds:false,sessionId:'muir-p12-offer',playerDisplayName:'Marta Álvarez'});
  const commands=[];
  for(let i=0;i<5&&!s.getView().offer;i++){
    const c=cmd(s,'continue',{maxDays:366},'offer-'+i);
    commands.push(stable(c));await s.dispatch(c);
  }
  assert(s.getView().offer,'deterministic offer did not materialize');
  return {commands,view:stable(s.getView()),snapshot:stable(s.exportSnapshot())};
}

async function identityScenario(GameSession){
  const s=await GameSession.create(9001,{events:[],microfeeds:false,sessionId:'muir-p12-identity',playerDisplayName:'Alejandro Fernandez-Ruiz'});
  const before=stable(s.exportSnapshot());
  const payload=cmd(s,'identity',{displayName:'Marta Álvarez'},'identity-change');
  await s.dispatch(payload);
  const after=stable(s.exportSnapshot());
  assert.deepEqual(after.state.rngState,before.state.rngState,'identity consumed RNG');
  const resumed=await GameSession.resume(stable(after),{events:[]});
  return {payload:stable(payload),beforeRng:before.state.rngState,after,view:stable(s.getView()),resumed:stable(resumed.exportSnapshot())};
}

async function capture(root){
  const GameSession=await loadSession(root);
  return {
    zeroAction:await zeroAction(GameSession),
    auto:await autoScenario(GameSession),
    playerAction:await playerActionScenario(GameSession),
    offer:await offerScenario(GameSession),
    identity:await identityScenario(GameSession)
  };
}

const current=await capture(currentRoot);
const predecessor=await capture(path.resolve(predecessorRoot));
assert.deepEqual(current,predecessor,'P11 -> P12 gameplay/public-state equivalence failed');

const digest=value=>crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
const report={
  schema:'muir-p12-equivalence-v1',
  gate:'PASS',
  predecessorSha:P11,
  currentHead:process.env.GITHUB_SHA??null,
  checks:{
    commandEquivalence:true,
    snapshotEquivalence:true,
    rngEquivalence:true,
    resultEquivalence:true,
    zeroActionEquivalence:true,
    saveLoad:true,
    autoSimulation:true,
    playerActions:true,
    offerProjection:true,
    identityNoRng:true
  },
  digest:{predecessor:digest(predecessor),current:digest(current)},
  proof:{
    zeroActionRevision:current.zeroAction.snapshot.revision,
    autoRevision:current.auto.snapshot.revision,
    playerActionRevision:current.playerAction.snapshot.revision,
    offerId:current.offer.view.offer?.id??null,
    identity:current.identity.view.player?.displayName??null
  }
};
assert.equal(report.digest.current,report.digest.predecessor,'equivalence digest mismatch');
fs.mkdirSync(path.join(currentRoot,'analysis/muir/p12/evidence'),{recursive:true});
fs.writeFileSync(path.join(currentRoot,'analysis/muir/p12/evidence/equivalence.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
