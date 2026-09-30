import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {GameSession} from '../../../dist/session/game-session.js';

const root=path.resolve(import.meta.dirname,'../../..');
const outDir=path.join(root,'analysis','muir','p11','evidence');
fs.mkdirSync(outDir,{recursive:true});
let commandIndex=0;
const command=(s,type,extra={})=>({type,commandId:'p11-pc-state-'+(commandIndex++),expectedRevision:s.getView().revision,...extra});

async function makeSnapshot(target){
  const opts=target==='summary'?{events:[],microfeeds:false,sessionId:'p11-pc-summary'}:{sessionId:'p11-pc-'+target};
  const s=await GameSession.create(target==='summary'?1:424242,opts);
  if(target==='summary'){
    await s.dispatch(command(s,'auto',{action:'start',maxWeeks:4}));
    for(let i=0;i<20&&s.getView().simulation.mode==='auto_simulating';i++)await s.dispatch(command(s,'auto',{action:'step'}));
    assert.equal(s.getView().screen,'summary','summary snapshot not reached');
    return JSON.stringify(s.exportSnapshot());
  }
  for(let i=0;i<3000;i++){
    const v=s.getView();
    if(v.screen===target)return JSON.stringify(s.exportSnapshot());
    if(target==='result'&&v.screen==='decision'){
      await s.dispatch(command(s,'choose',{pendingInstanceId:v.decision.instanceId,choiceId:v.decision.choices[0].id}));
      continue;
    }
    if(v.screen==='offer'){
      if(target==='offer')return JSON.stringify(s.exportSnapshot());
      await s.dispatch(command(s,'offer',{offerId:v.offer.id,action:'accept'}));
    }else if(v.screen==='decision'){
      await s.dispatch(command(s,'choose',{pendingInstanceId:v.decision.instanceId,choiceId:v.decision.choices[0].id}));
    }else if(v.screen==='result'){
      await s.dispatch(command(s,'acknowledge'));
    }else{
      await s.dispatch(command(s,'continue'));
    }
  }
  throw new Error('Could not reach '+target);
}

const snapshots={};
for(const target of ['summary','decision','result','offer','epilogue'])snapshots[target]=await makeSnapshot(target);

const types={'.js':'text/javascript; charset=utf-8','.webm':'video/webm'};
const server=http.createServer((req,res)=>{
  try{
    const url=new URL(req.url,'http://127.0.0.1');
    const rel=decodeURIComponent(url.pathname).replace(/^\/+/, '');
    if(!rel){res.setHeader('Content-Type','text/html; charset=utf-8');res.end('<!doctype html><html><body></body></html>');return;}
    const file=path.resolve(root,rel);
    if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||fs.statSync(file).isDirectory()){res.writeHead(404);res.end('not found');return;}
    res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');
    fs.createReadStream(file).pipe(res);
  }catch(error){res.writeHead(500);res.end(String(error));}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const port=server.address().port;
const browser=await chromium.launch({headless:true});
const report={schema:'muir-p11-playcanvas-state-matrix-v1',targetScene:2593315,passed:false,states:[]};

async function mount(target,snapshot){
  const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
  const page=await context.newPage();
  const errors=[];page.on('pageerror',e=>errors.push(String(e?.stack||e)));
  await page.goto('http://127.0.0.1:'+port+'/',{waitUntil:'domcontentloaded'});
  await page.evaluate(({key,raw})=>localStorage.setItem(key,raw),{key:'historia-jugador.playcanvas.2593315.session.v1',raw:snapshot});
  await page.evaluate(()=>{
    window.__pcAssets=[];
    window.pc={createScript(name){
      if(name!=='multihistoria')throw new Error('unexpected script '+name);
      function Script(){this.__handlers={};}
      Script.prototype.on=function(event,handler){this.__handlers[event]=handler;};
      return Script;
    }};
  });
  await page.addScriptTag({url:'http://127.0.0.1:'+port+'/playcanvas/multihistoria.js'});
  await page.evaluate(()=>{
    const instance=new window.Multihistoria();
    instance.app={assets:{find(name){window.__pcAssets.push(name);return {getFileUrl(){return '/web/assets/cutscenes/'+name;}};}}};
    window.__pcInstance=instance;instance.initialize();
  });
  await page.waitForFunction(()=>document.querySelector('#multihistoria-game')?.shadowRoot?.querySelector('main')?.getAttribute('aria-busy')==='false',null,{timeout:30000});
  const expectedSelector={summary:'.period-summary',decision:'.decision-choice-sheet',result:'.result-sheet',offer:'.offer-sheet',epilogue:'.p9-epilogue'}[target];
  await page.waitForFunction(selector=>Boolean(document.querySelector('#multihistoria-game')?.shadowRoot?.querySelector(selector)),expectedSelector,{timeout:30000});
  const state=await page.evaluate(target=>{
    const root=document.querySelector('#multihistoria-game').shadowRoot;
    return {
      target,
      classes:root.querySelector('main')?.className??'',
      decision:Boolean(root.querySelector('.decision-choice-sheet')),
      result:Boolean(root.querySelector('.result-sheet [data-result-continue],.result-sheet')),
      offer:Boolean(root.querySelector('.offer-sheet')),
      summary:Boolean(root.querySelector('.period-summary')),
      epilogue:Boolean(root.querySelector('.p9-epilogue')),
      cutscene:Boolean(root.querySelector('.event-cutscene')),
      assets:[...window.__pcAssets],
      text:(root.textContent||'').slice(0,5000)
    };
  },target);
  if(target==='decision')assert(state.decision,'decision UI missing');
  if(target==='result')assert(state.result,'result UI missing');
  if(target==='offer')assert(state.offer,'offer UI missing');
  if(target==='summary')assert(state.summary,'summary UI missing');
  if(target==='epilogue')assert(state.epilogue,'epilogue UI missing');
  assert(!/undefined|null/.test(state.text),'technical undefined/null visible in '+target);
  assert.equal(errors.length,0,'page errors in '+target+': '+errors.join('\n'));
  report.states.push({...state,pageErrors:errors,pass:true});
  await context.close();
}

try{
  for(const target of ['summary','decision','result','offer','epilogue'])await mount(target,snapshots[target]);
  report.passed=true;
}finally{
  await browser.close();server.close();
  fs.writeFileSync(path.join(outDir,'playcanvas-state-matrix.json'),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({passed:report.passed,states:report.states.map(s=>({target:s.target,decision:s.decision,result:s.result,offer:s.offer,summary:s.summary,epilogue:s.epilogue,cutscene:s.cutscene,assets:s.assets}))}));
}
if(!report.passed)process.exitCode=1;
