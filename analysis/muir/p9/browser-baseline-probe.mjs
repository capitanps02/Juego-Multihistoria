import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const rootDir=path.resolve(import.meta.dirname,'../../..');
const axePath=path.join(rootDir,'node_modules','axe-core','axe.min.js');
assert(fs.existsSync(axePath),'axe-core is not installed');
const outDir=path.join(rootDir,'analysis','muir','p9','screenshots');
const evidenceDir=path.join(rootDir,'analysis','muir','p9','evidence');
fs.mkdirSync(outDir,{recursive:true});fs.mkdirSync(evidenceDir,{recursive:true});
const viewports=[
 {id:'phone-360',width:360,height:800},
 {id:'phone-primary',width:390,height:844},
 {id:'phone-412',width:412,height:915},
 {id:'landscape',width:844,height:390}
];
const scenarios=['decision-2','decision-3','decision-4','decision-long','decision-memory','decision-uncertainty','result-simple','result-long','result-match','offer-normal','offer-loan','offer-long-club','offer-partial','prologue','decision-error','epilogue'];
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.webm':'video/webm','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{
 try{
  const url=new URL(req.url,'http://127.0.0.1'),rel=decodeURIComponent(url.pathname).replace(/^\/+/, '')||'analysis/muir/p9/immersive.html';
  const file=path.resolve(rootDir,rel);
  if(!file.startsWith(rootDir+path.sep)&&file!==rootDir){res.writeHead(403);res.end('forbidden');return;}
  if(!fs.existsSync(file)||fs.statSync(file).isDirectory()){res.writeHead(404);res.end('not found');return;}
  res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');fs.createReadStream(file).pipe(res);
 }catch(error){res.writeHead(500);res.end(String(error));}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const browser=await chromium.launch({headless:true});
const records=[];

async function open(page,scenario){
 await page.goto('http://127.0.0.1:'+server.address().port+'/analysis/muir/p9/immersive.html?scenario='+encodeURIComponent(scenario),{waitUntil:'networkidle',timeout:30000});
 await page.waitForFunction(()=>globalThis.__P9_READY__?.ready===true,null,{timeout:30000});
 await page.addScriptTag({path:axePath});
 if(scenario==='decision-error'){
   await page.evaluate(()=>{const r=globalThis.__P9_ROOT__;r.querySelector('.event-cutscene button')?.click();r.querySelector('.event-cutscene video')?.dispatchEvent(new Event('error'));});
 }
}
async function inspect(page,scale=1){
 return page.evaluate(async scale=>{
  const root=globalThis.__P9_ROOT__,main=root.querySelector('main');
  if(scale!==1){for(const node of [main,...main.querySelectorAll('*')]){const s=parseFloat(getComputedStyle(node).fontSize);if(Number.isFinite(s)&&s>0)node.style.fontSize=(s*scale)+'px';}}
  const nodes=[main,...main.querySelectorAll('*')];
  const overflow=nodes.filter(n=>n.scrollWidth>n.clientWidth+1).slice(0,60).map(n=>({tag:n.tagName,className:String(n.className),text:(n.textContent||'').trim().slice(0,90),clientWidth:n.clientWidth,scrollWidth:n.scrollWidth}));
  const axeResult=await axe.run(main,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']},resultTypes:['violations']});
  const nav=root.querySelector('.navigation');
  return {
   text:main.innerText,
   screenClass:main.className,
   h1:main.querySelector('h1')?.textContent?.trim()||'',
   choices:main.querySelectorAll('.choices .choice').length,
   resultContinue:main.querySelectorAll('[data-result-continue]').length,
   offerCard:main.querySelectorAll('.offer-card').length,
   offerActions:main.querySelectorAll('.offer-card .choice').length,
   cutscene:main.querySelectorAll('.event-cutscene').length,
   retirement:main.querySelectorAll('.retirement-panel').length,
   navDisplay:nav?getComputedStyle(nav).display:null,
   navOpacity:nav?getComputedStyle(nav).opacity:null,
   mainTabIndex:main.tabIndex,
   overflow,
   serious:axeResult.violations.filter(v=>v.impact==='serious'||v.impact==='critical').map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.length}))
  };
 },scale);
}
function assertSemantics(scenario,m){
 assert.equal(m.mainTabIndex,0);
 if(scenario.startsWith('decision-'))assert.ok(m.choices>=2,scenario+' choices');
 if(scenario.startsWith('result-'))assert.equal(m.resultContinue,1,scenario+' Continue');
 if(scenario.startsWith('offer-')){assert.equal(m.offerCard,1);assert.equal(m.offerActions,3);assert.match(m.text,/Aceptar oferta/);assert.match(m.text,/Rechazar oferta/);assert.match(m.text,/Delegar esta oferta/);}
 if(scenario==='offer-loan')assert.match(m.text,/cesión/);
 if(scenario==='prologue')assert.equal(m.cutscene,1);
 if(scenario==='decision-error')assert.match(m.text,/No se ha podido cargar la escena/);
 if(scenario==='epilogue'){assert.equal(m.retirement,1);assert.match(m.text,/Carrera finalizada/);}
 if(scenario.startsWith('decision-'))assert.doesNotMatch(m.text,/\b(?:Probabilidad|Riesgo|Resultado esperado|Recomendado)\b/i);
}
try{
 for(const viewport of viewports){
  for(const scenario of scenarios){
   const context=await browser.newContext({viewport:{width:viewport.width,height:viewport.height},reducedMotion:'reduce'});const page=await context.newPage();
   try{
    await open(page,scenario);const metric=await inspect(page,1);assertSemantics(scenario,metric);
    const png=await page.screenshot({fullPage:false,type:'png'}),hash=crypto.createHash('sha256').update(png).digest('hex');
    const file='p9-baseline__'+scenario+'__'+viewport.width+'x'+viewport.height+'__'+hash.slice(0,12)+'.png';
    fs.writeFileSync(path.join(outDir,file),png);
    records.push({scenario,viewport:viewport.id,width:viewport.width,height:viewport.height,scale:1,screenshot:'analysis/muir/p9/screenshots/'+file,sha256:hash,metric});
   }finally{await context.close();}
  }
 }
 for(const scale of [1.3,1.8]){
  for(const scenario of ['decision-4','decision-long','offer-long-club','result-long']){
   const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});const page=await context.newPage();
   try{await open(page,scenario);const metric=await inspect(page,scale);assertSemantics(scenario,metric);records.push({scenario,viewport:'phone-primary',width:390,height:844,scale,metric});}
   finally{await context.close();}
  }
 }
}finally{await browser.close();server.close();}
const allOverflow=records.flatMap(r=>r.metric.overflow.map(x=>({scenario:r.scenario,viewport:r.viewport,scale:r.scale,...x})));
const allSerious=records.flatMap(r=>r.metric.serious.map(x=>({scenario:r.scenario,viewport:r.viewport,scale:r.scale,...x})));
const evidence={
 schema:'muir-p9-baseline-v1',predecessor:'ecc72b9abebbc64533c86b1f3cf7009a127c0c02',gate:'BASELINE_CAPTURED',
 scenarios,viewports:viewports.map(v=>v.id),captures:records.filter(r=>r.screenshot).length,textScales:['100%','130%','180%'],
 horizontalOverflowFindings:allOverflow.length,axeSeriousCritical:allSerious.length,
 navBaseline:'VISIBLE',records
};
fs.writeFileSync(path.join(evidenceDir,'p9-baseline.json'),JSON.stringify(evidence,null,2)+'\n');
console.log(JSON.stringify({gate:evidence.gate,captures:evidence.captures,horizontalOverflowFindings:evidence.horizontalOverflowFindings,axeSeriousCritical:evidence.axeSeriousCritical,navBaseline:evidence.navBaseline}));
