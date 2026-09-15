import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { GameSession } from '../dist/session/game-session.js';
const source=fs.readFileSync('playcanvas/multihistoria.js','utf8');
// Execute generated script with its PlayCanvas registration stub. Mounting is
// exercised in the real browser; this verifies packaged engine equivalence.
const registered=vm.compileFunction(source+'\nreturn Multihistoria;',['pc'])({createScript(name){assert.equal(name,'multihistoria');return function(){};}});
const Bundled=registered.GameSession;
const json=value=>JSON.stringify(value);
test('PlayCanvas package preserves all states and RNG over 20 interactive choices',async()=>{
  const a=await GameSession.create(424242,{sessionId:'equivalence'}),b=await Bundled.create(424242,{sessionId:'equivalence'});
  let commandIndex=0;
  for(let i=0;i<20;i++){
    const send=async(type,extra={})=>{const cmd={type,commandId:type+(commandIndex++),expectedRevision:a.getView().revision,...extra};await a.dispatch(cmd);await b.dispatch(cmd);assert.equal(json(a.exportSnapshot()),json(b.exportSnapshot()));};
    for(let tries=0;tries<100 && ['career','offer'].includes(a.getView().screen);tries++){const v=a.getView();if(v.screen==='offer')await send('offer',{offerId:v.offer.id,action:'accept'});else await send('continue');}
    const v=a.getView();assert.equal(v.screen,'decision');
    await send('choose',{pendingInstanceId:v.decision.instanceId,choiceId:v.decision.choices[i%v.decision.choices.length].id});
    await send('acknowledge');
  }
});
test('presentation exposes public context without leaking NPC agendas or hidden outcomes',async()=>{
  const s=await GameSession.create(424242);await s.dispatch({type:'continue',commandId:'c',expectedRevision:0});const v=s.getView();
  assert.equal(v.season,'2026-27');assert.equal(v.contacts.length,20);assert.ok(v.decision.family);
  for(const c of v.contacts)assert.deepEqual(Object.keys(c).sort(),['id','name','role']);
  for(const forbidden of ['privateAgenda','outcomeIds','rngState','flags','reliability','probability','leverage','trust'])assert.ok(!json(v).includes('"'+forbidden+'"'));
  const before=json(s.exportSnapshot());v.news.push({date:'2099-01-01',text:'changed'});v.contacts[0].name='changed';assert.equal(json(s.exportSnapshot()),before);
});
test('package is self-contained and requires no localhost or external image/font request',()=>{
  assert.ok(!source.includes('127.0.0.1'));assert.ok(!source.includes('localhost:'));assert.ok(source.includes('data:image/jpeg;base64,'));assert.ok(!source.includes('new Function('));
  const manifest=JSON.parse(fs.readFileSync('playcanvas/manifest.json'));assert.equal(manifest.targetScene,2593315);assert.equal(manifest.bundleBytes,Buffer.byteLength(source));
});
