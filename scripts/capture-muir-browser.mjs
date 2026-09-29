import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import crypto from 'node:crypto';
import {chromium} from 'playwright';
import {MUIR_BASE_SHA,MUIR_VIEWPORTS,MUIR_FIXTURES} from '../analysis/muir/ui-fixtures/fixtures.mjs';

const root=path.resolve(import.meta.dirname,'..');
const outDir=path.join(root,'analysis','muir','screenshots');
const evidenceDir=path.join(root,'analysis','muir','evidence');
fs.mkdirSync(outDir,{recursive:true});
fs.mkdirSync(evidenceDir,{recursive:true});

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
const browserVersion=browser.version();
const phoneIds=new Set(['phone-360','phone-primary','phone-412']);
const auxFixtureIds=new Set(['home-normal','result','player-actions-menu']);
const targets=[];
for(const fixture of MUIR_FIXTURES){
  for(const viewport of MUIR_VIEWPORTS){
    if(phoneIds.has(viewport.id)||auxFixtureIds.has(fixture.id))targets.push({fixture,viewport});
  }
}

const records=[];
const errors=[];
for(const {fixture,viewport} of targets){
  const context=await browser.newContext({viewport:{width:viewport.width,height:viewport.height},reducedMotion:'reduce'});
  const page=await context.newPage();
  const pageErrors=[];
  page.on('pageerror',error=>pageErrors.push(String(error?.stack||error)));
  const url=`http://127.0.0.1:${port}/analysis/muir/ui-fixtures/index.html?fixture=${encodeURIComponent(fixture.id)}&viewport=${encodeURIComponent(viewport.id)}`;
  try{
    await page.goto(url,{waitUntil:'networkidle',timeout:30000});
    await page.waitForFunction(()=>globalThis.__MUIR_READY__?.ready===true,null,{timeout:30000});
    await page.waitForTimeout(150);
    const ready=await page.evaluate(()=>globalThis.__MUIR_READY__);
    const png=await page.screenshot({fullPage:false,type:'png'});
    if(png.readUInt32BE(16)!==viewport.width||png.readUInt32BE(20)!==viewport.height)throw Error(`Viewport screenshot mismatch: ${png.readUInt32BE(16)}x${png.readUInt32BE(20)} != ${viewport.width}x${viewport.height}`);
    if(fixture.id==='auto-running'){
      await page.evaluate(async()=>{await globalThis.__MUIR_START_AUTO_PROBE__?.();});
      await page.waitForTimeout(1500);
    }
    const metrics=await page.evaluate(()=>globalThis.__MUIR_METRICS__);
    const hash=crypto.createHash('sha256').update(png).digest('hex');
    const name=`${MUIR_BASE_SHA.slice(0,12)}__${fixture.id}__${viewport.width}x${viewport.height}__${hash.slice(0,12)}.png`;
    fs.writeFileSync(path.join(outDir,name),png);
    records.push({fixtureId:fixture.id,surface:fixture.surface,viewportId:viewport.id,width:viewport.width,height:viewport.height,file:'analysis/muir/screenshots/'+name,sha256:hash,bytes:png.length,ready,metrics});
  }catch(error){
    errors.push({fixtureId:fixture.id,viewportId:viewport.id,error:String(error?.stack||error),pageErrors});
  }finally{
    await context.close();
  }
}
await browser.close();
server.close();

const phoneCount=MUIR_FIXTURES.length*3;
const renderSamples=records.flatMap(row=>row.metrics?.render?.samplesMs??[]).filter(Number.isFinite).sort((a,b)=>a-b);
const percentile=p=>renderSamples.length?renderSamples[Math.min(renderSamples.length-1,Math.ceil(renderSamples.length*p)-1)]:null;
const report={
  schema:'muir-browser-baseline-v1',
  baseSha:MUIR_BASE_SHA,
  generatedAt:new Date().toISOString(),
  browser:{name:'Playwright Chromium',version:browserVersion},
  targetCount:targets.length,
  expectedPhoneCaptures:phoneCount,
  captured:records.length,
  skipped:[],
  errors,
  aggregate:{
    renderSampleCount:renderSamples.length,
    renderP50Ms:percentile(.5),
    renderP95Ms:percentile(.95),
    maxDomNodes:Math.max(0,...records.map(row=>row.metrics?.domNodes??0)),
    maxLongTaskMs:Math.max(0,...records.flatMap(row=>row.metrics?.longTasks??[]).map(x=>x.duration??0)),
    undersizedTouchTargetCount:records.reduce((sum,row)=>sum+(row.metrics?.undersizedTouchTargets?.length??0),0),
    horizontalOverflowFindingCount:records.reduce((sum,row)=>sum+(row.metrics?.overflowX?.length??0),0),
    autoSimUiUpdateRateHz:records.find(row=>row.fixtureId==='auto-running'&&row.viewportId==='phone-primary')?.metrics?.autoSimUiUpdateRateHz??null,
    totalFocusChanges:records.reduce((sum,row)=>sum+(row.metrics?.focusChanges??0),0),
    totalScrollEvents:records.reduce((sum,row)=>sum+(row.metrics?.scrollEvents??0),0)
  },
  records
};
fs.writeFileSync(path.join(evidenceDir,'browser-baseline.json'),JSON.stringify(report,null,2)+'\n');

const baselinePath=path.join(root,'analysis','muir','muir-baseline.json');
const baseline=JSON.parse(fs.readFileSync(baselinePath,'utf8'));
for(const viewport of baseline.viewports??[]){
  const capturedForViewport=records.filter(row=>row.viewportId===viewport.id).length;
  if(viewport.id.startsWith('phone-'))viewport.status=capturedForViewport>0?'CAPTURED':'MISSING';
  else viewport.status=capturedForViewport>0?'CHECKED':'MISSING';
}
baseline.status=errors.length?'BLOCKED':'READY_FOR_GATE';
baseline.screenshots={...baseline.screenshots,status:errors.length?'CAPTURE_FAILED':'CAPTURED',count:records.length,skippedNATargets:0,evidence:'analysis/muir/evidence/browser-baseline.json'};
baseline.performance={...baseline.performance,
  renderP50Ms:report.aggregate.renderP50Ms,
  renderP95Ms:report.aggregate.renderP95Ms,
  renderFrequencyHz:records.length?records.reduce((sum,row)=>sum+(row.metrics?.render?.frequencyHz??0),0)/records.length:null,
  domNodes:report.aggregate.maxDomNodes,
  longTasks:report.aggregate.maxLongTaskMs,
  autoSimUiUpdateRateHz:report.aggregate.autoSimUiUpdateRateHz,
  focusChurn:report.aggregate.totalFocusChanges,
  scrollChurn:report.aggregate.totalScrollEvents,
  status:errors.length?'MEASUREMENT_FAILED':'MEASURED',
  evidence:'analysis/muir/evidence/browser-baseline.json'
};
baseline.instrumentation={...baseline.instrumentation,status:errors.length?'EXECUTED_WITH_ERRORS':'EXECUTED'};
baseline.tooling={...baseline.tooling,browser:report.browser,visualRunner:'scripts/capture-muir-browser.mjs',status:errors.length?'EXECUTED_WITH_ERRORS':'EXECUTED'};
fs.writeFileSync(baselinePath,JSON.stringify(baseline,null,2)+'\n');
console.log(JSON.stringify({targetCount:targets.length,captured:records.length,errors:errors.length,browser:report.browser,aggregate:report.aggregate,output:'analysis/muir/evidence/browser-baseline.json'}));
if(errors.length)process.exitCode=1;
