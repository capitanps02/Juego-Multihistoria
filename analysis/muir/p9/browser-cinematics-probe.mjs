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
const scenarios=['decision-error','prologue'];
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
}
async function inspect(page,scenario,scale=1){
  if(scenario==='decision-error')await page.evaluate(()=>globalThis.__P9_ROOT__.querySelector('.cinematic-player video')?.dispatchEvent(new Event('error')));
  if(scenario==='prologue')await page.evaluate(()=>globalThis.__P9_ROOT__.querySelector('.prologue-dialog video')?.dispatchEvent(new Event('error')));
  return page.evaluate(async ({scenario,scale})=>{
    const root=globalThis.__P9_ROOT__,main=root.querySelector('main'),dialog=root.querySelector('.prologue-dialog'),scope=scenario==='prologue'?(dialog||main):main;
    if(scale!==1&&scope){for(const node of [scope,...scope.querySelectorAll('*')]){const s=parseFloat(getComputedStyle(node).fontSize);if(Number.isFinite(s)&&s>0)node.style.fontSize=(s*scale)+'px';}}
    const nodes=[scope,...scope.querySelectorAll('*')];
    const overflow=nodes.filter(n=>n.scrollWidth>n.clientWidth+1).slice(0,50).map(n=>({tag:n.tagName,className:String(n.className),clientWidth:n.clientWidth,scrollWidth:n.scrollWidth,text:(n.textContent||'').trim().slice(0,80)}));
    const axeResult=await axe.run(scope,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']},resultTypes:['violations']});
    const buttons=[...scope.querySelectorAll('button:not([hidden])')];
    return {
      text:scope.innerText,
      state:scenario==='prologue'?dialog?.dataset.cutsceneState:main.querySelector('.cinematic-player')?.dataset.cutsceneState,
      dialogOpen:dialog?.open??false,
      buttonHeights:buttons.map(x=>Math.round(x.getBoundingClientRect().height)),
      decisionChoices:main.querySelectorAll('.decision-choices .choice').length,
      serious:axeResult.violations.filter(v=>v.impact==='serious'||v.impact==='critical').map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.length})),
      overflow
    };
  },{scenario,scale});
}
function verify(m,scenario){
  assert.equal(m.state,'fallback');
  assert.ok(m.buttonHeights.every(h=>h>=48),scenario+' visible button touch height');
  assert.deepEqual(m.overflow,[],scenario+' horizontal overflow');
  assert.deepEqual(m.serious,[],scenario+' serious/critical AXE');
  if(scenario==='decision-error'){
    assert.match(m.text,/No se ha podido cargar la escena/);
    assert.equal(m.decisionChoices,4,'fallback must not block decisions');
  }else{
    assert.match(m.text,/No se ha podido cargar el prólogo/);
    assert.match(m.text,/Empezar historia/);
    assert.equal(m.dialogOpen,true);
  }
}
try{
  for(const viewport of viewports){
    for(const scenario of scenarios){
      const context=await browser.newContext({viewport:{width:viewport.width,height:viewport.height},reducedMotion:'reduce'});const page=await context.newPage();
      try{
        await open(page,scenario);const metric=await inspect(page,scenario,1);verify(metric,scenario);
        if(scenario==='decision-error'&&viewport.id==='phone-primary'){
          const commands=await page.evaluate(()=>globalThis.__P9_COMMAND_LOG__);
          assert.equal(commands.length,0,'video fallback must not dispatch a career command');
        }
        if(scenario==='prologue'&&viewport.id==='phone-primary'){
          await page.keyboard.press('Escape');await page.waitForTimeout(60);
          const closed=await page.evaluate(()=>({open:globalThis.__P9_ROOT__.querySelector('.prologue-dialog')?.open,commands:globalThis.__P9_COMMAND_LOG__}));
          assert.equal(closed.open,false,'Escape closes prologue safely');
          assert.equal(closed.commands.length,0,'prologue Escape must not dispatch career commands');
          await page.evaluate(()=>globalThis.__P9_ROOT__.querySelector('.prologue-entry>.secondary')?.click());await page.waitForTimeout(40);
          const reopened=await page.evaluate(()=>globalThis.__P9_ROOT__.querySelector('.prologue-dialog')?.open);
          assert.equal(reopened,true,'prologue can be reopened');
        }
        const png=await page.screenshot({fullPage:false,type:'png'}),hash=crypto.createHash('sha256').update(png).digest('hex');
        const file='p9-cinematics__'+scenario+'__'+viewport.width+'x'+viewport.height+'__'+hash.slice(0,12)+'.png';
        fs.writeFileSync(path.join(outDir,file),png);
        records.push({scenario,viewport:viewport.id,width:viewport.width,height:viewport.height,scale:1,screenshot:'analysis/muir/p9/screenshots/'+file,sha256:hash,metric});
      }finally{await context.close();}
    }
  }
  for(const scale of [1.3,1.8]){
    const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});const page=await context.newPage();
    try{await open(page,'prologue');const metric=await inspect(page,'prologue',scale);verify(metric,'prologue');records.push({scenario:'prologue',viewport:'phone-primary',width:390,height:844,scale,metric});}
    finally{await context.close();}
  }
}finally{await browser.close();server.close();}
const evidence={schema:'muir-p9-cinematics-v1',gate:'PASS',scenarios,viewports:viewports.map(x=>x.id),captures:records.filter(x=>x.screenshot).length,textScales:['100%','130%','180%'],careerCommandsFromMedia:0,axeSeriousCritical:0,horizontalOverflowFindings:0,records};
fs.writeFileSync(path.join(evidenceDir,'p9-cinematics.json'),JSON.stringify(evidence,null,2)+'\n');
console.log(JSON.stringify({gate:evidence.gate,captures:evidence.captures,textScales:evidence.textScales,careerCommandsFromMedia:evidence.careerCommandsFromMedia}));
