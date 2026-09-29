import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';

const currentRoot=path.resolve(import.meta.dirname,'..');
const predecessorRoot=process.env.MUIR_P7_PREDECESSOR_ROOT;
const P6='e2b54ec654a32b8665925bec7811363003e482ed';
assert(predecessorRoot,'MUIR_P7_PREDECESSOR_ROOT is required');
const evidenceDir=path.join(currentRoot,'analysis','muir','p7','evidence');
fs.mkdirSync(evidenceDir,{recursive:true});

async function loadGameSession(root){
  return (await import(pathToFileURL(path.join(root,'dist','session','game-session.js')).href)).GameSession;
}
const command=(session,type,extra={},commandId=type+'-'+session.getView().revision)=>({type,commandId,expectedRevision:session.getView().revision,...extra});
const findAction=(view,id)=>view.actions.categories.flatMap(c=>c.actions).find(a=>a.id===id);

async function zeroAction(GameSession){
  const s=await GameSession.create(424242,{events:[],microfeeds:false,sessionId:'muir-p7-zero'});
  const views=[s.getView()];
  for(let i=0;i<4;i++){
    if(s.getView().screen!=='career')break;
    await s.dispatch(command(s,'continue',{maxDays:21},'zero-'+i));
    views.push(s.getView());
  }
  return {snapshot:s.exportSnapshot(),views};
}
async function playerAction(GameSession){
  const s=await GameSession.create(424242,{events:[],microfeeds:false,sessionId:'muir-p7-action'});
  const before=s.getView(),action=findAction(before,'PA_TRAIN_EXTRA');
  assert(action?.available);
  const payload={type:'player_action',actionId:action.id,optionId:action.options[0].id,commandId:'p7-action',expectedRevision:before.revision};
  await s.dispatch(payload);
  return {payload,view:s.getView(),snapshot:s.exportSnapshot()};
}
async function offerProjection(GameSession){
  const s=await GameSession.create(123,{events:[],microfeeds:false,sessionId:'muir-p7-offer'});
  for(let i=0;i<5&&!s.getView().offer;i++)await s.dispatch(command(s,'continue',{maxDays:366},'offer-'+i));
  const view=s.getView();
  assert.equal(view.screen,'offer','deterministic P7 offer did not materialize');
  return {offer:view.offer,offerHistory:view.offerHistory,snapshot:s.exportSnapshot()};
}
async function capture(root){
  const GameSession=await loadGameSession(root);
  return {zero:await zeroAction(GameSession),action:await playerAction(GameSession),offer:await offerProjection(GameSession)};
}

const current=await capture(currentRoot);
const predecessor=await capture(path.resolve(predecessorRoot));
assert.deepEqual(current,predecessor,'P6 -> P7 runtime/public-view equivalence failed');

const report={
  gate:'PASS',
  predecessorSha:P6,
  checks:{
    snapshotSequence:true,
    playerViewSequence:true,
    playerActionCommand:true,
    playerActionResult:true,
    offerProjection:true,
    rngAndGameplayState:true
  },
  proof:{
    zeroRevision:current.zero.snapshot.revision,
    actionRevision:current.action.snapshot.revision,
    offerId:current.offer.offer?.id??null,
    offerLoan:current.offer.offer?.terms?.loan??null
  }
};
fs.writeFileSync(path.join(evidenceDir,'p7-equivalence-current.json'),JSON.stringify(current,null,2)+'\n');
fs.writeFileSync(path.join(evidenceDir,'p7-equivalence-p6.json'),JSON.stringify(predecessor,null,2)+'\n');
fs.writeFileSync(path.join(evidenceDir,'p7-equivalence-report.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report));
