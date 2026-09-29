import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {GameSession} from '../../../dist/session/game-session.js';

const root=path.resolve(import.meta.dirname,'../../..');
const outDir=path.join(root,'analysis','muir','p5','evidence');
fs.mkdirSync(outDir,{recursive:true});
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webm':'video/webm','.svg':'image/svg+xml','.woff2':'font/woff2'};
const server=http.createServer((req,res)=>{
  try{
    const url=new URL(req.url,'http://127.0.0.1');
    let rel=decodeURIComponent(url.pathname).replace(/^\/+/, '');
    if(!rel)rel='analysis/muir/ui-fixtures/index.html';
    const file=path.resolve(root,rel);
    if(!file.startsWith(root+path.sep)&&file!==root){res.writeHead(403);res.end('forbidden');return;}
    if(!fs.existsSync(file)||fs.statSync(file).isDirectory()){res.writeHead(404);res.end('not found');return;}
    res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');
    fs.createReadStream(file).pipe(res);
  }catch(error){res.writeHead(500);res.end(String(error));}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const port=server.address().port;

const browser=await chromium.launch({headless:true});
let browserStart,browserEnd,commandLog;
try{
  const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
  const page=await context.newPage();
  try{
    await page.goto(`http://127.0.0.1:${port}/analysis/muir/ui-fixtures/index.html?fixture=auto-running&viewport=phone-primary`,{waitUntil:'networkidle',timeout:30000});
    await page.waitForFunction(()=>globalThis.__MUIR_READY__?.ready===true,null,{timeout:30000});
    browserStart=await page.evaluate(()=>globalThis.__MUIR_READ_SAVED_SNAPSHOT__());
    assert(browserStart,'browser start snapshot missing');
    assert.equal(browserStart.autoSimulation?.mode,'auto_simulating');
    await page.evaluate(()=>globalThis.__MUIR_RELEASE_AUTO_TIMER__?.());
    for(let i=0;i<120;i++){
      await page.waitForTimeout(100);
      browserEnd=await page.evaluate(()=>globalThis.__MUIR_READ_SAVED_SNAPSHOT__());
      if(browserEnd?.autoSimulation?.mode!=='auto_simulating')break;
    }
    assert(browserEnd,'browser final snapshot missing');
    assert.notEqual(browserEnd.autoSimulation?.mode,'auto_simulating','UI auto-sim did not reach a real boundary');
    commandLog=await page.evaluate(()=>structuredClone(globalThis.__MUIR_COMMAND_LOG__??[]));
  }finally{
    await context.close();
  }
}finally{
  await browser.close();
  server.close();
}

const control=await GameSession.resume(structuredClone(browserStart),{events:[]});
const controlCommands=[];
for(let guard=0;guard<30&&control.getView().simulation.mode==='auto_simulating';guard++){
  const expectedRevision=control.getView().revision;
  controlCommands.push({type:'auto',action:'step',maxWeeks:null,expectedRevision});
  await control.dispatch({type:'auto',action:'step',commandId:'p5-control-'+expectedRevision,expectedRevision});
}
assert.notEqual(control.getView().simulation.mode,'auto_simulating','control auto-sim did not reach a boundary');

assert.deepEqual(commandLog,controlCommands,'UI SessionCommand sequence diverged from direct GameSession control');

const controlEnd=control.exportSnapshot();
const comparable=snapshot=>({
  sessionVersion:snapshot.sessionVersion,
  build:snapshot.build,
  contentIdentity:snapshot.contentIdentity,
  sessionId:snapshot.sessionId,
  revision:snapshot.revision,
  microfeeds:snapshot.microfeeds,
  state:snapshot.state,
  pendingDecision:snapshot.pendingDecision,
  pendingResult:snapshot.pendingResult,
  journal:snapshot.journal,
  decisionProvenance:snapshot.decisionProvenance,
  needsWorldAdvance:snapshot.needsWorldAdvance,
  autoSimulation:snapshot.autoSimulation
});
assert.deepEqual(comparable(browserEnd),comparable(controlEnd),'browser UI final snapshot diverged from direct control');

const restored=await GameSession.resume(structuredClone(browserEnd),{events:[]});
assert.deepEqual(restored.getView().simulation,control.getView().simulation,'save/load public simulation view diverged after P5');
assert.deepEqual(restored.exportSnapshot().state,controlEnd.state,'save/load state diverged after P5');

const evidence={
  gate:'PASS',
  commandEquivalence:'PASS',
  snapshotEquivalence:'PASS',
  rngAndResultStateEquivalence:'PASS',
  saveLoad:'PASS',
  commandCount:commandLog.length,
  commands:commandLog,
  start:{revision:browserStart.revision,elapsedDays:browserStart.autoSimulation.elapsedDays,mode:browserStart.autoSimulation.mode},
  end:{revision:browserEnd.revision,elapsedDays:browserEnd.autoSimulation.elapsedDays,mode:browserEnd.autoSimulation.mode,interruption:browserEnd.autoSimulation.interruption?.type??null}
};
fs.writeFileSync(path.join(outDir,'p5-equivalence.json'),JSON.stringify(evidence,null,2)+'\n');
console.log(JSON.stringify(evidence));
