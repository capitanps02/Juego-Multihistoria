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
const scenarios=['decision-poster','decision-video','decision-missing','decision-error','prologue','epilogue'];
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
  if(scenario==='decision-video'){
    await page.waitForFunction(()=>globalThis.__P9_ROOT__.querySelector('.cinematic-player')?.dataset.cutsceneState==='playing',null,{timeout:15000});
  }
  if(scenario==='decision-missing'){
    await page.waitForFunction(()=>globalThis.__P9_ROOT__.querySelector('.cinematic-player')?.dataset.cutsceneState==='fallback',null,{timeout:15000});
  }
  if(scenario==='decision-error'){
    await page.evaluate(()=>globalThis.__P9_ROOT__.querySelector('.cinematic-player video')?.dispatchEvent(new Event('error')));
  }
  if(scenario==='prologue'){
    await page.evaluate(()=>globalThis.__P9_ROOT__.querySelector('.prologue-dialog video')?.dispatchEvent(new Event('error')));
  }
}

async function inspect(page,scenario,scale=1){
  return page.evaluate(async ({scenario,scale})=>{
    const root=globalThis.__P9_ROOT__,main=root.querySelector('main'),dialog=root.querySelector('.prologue-dialog'),player=main.querySelector('.cinematic-player');
    const epilogue=main.classList.contains('p9-epilogue');
    const scope=scenario==='prologue'?(dialog||main):scenario==='epilogue'?main:(player||main);
    if(scale!==1&&scope){
      for(const node of [scope,...scope.querySelectorAll('*')]){
        const s=parseFloat(getComputedStyle(node).fontSize);
        if(Number.isFinite(s)&&s>0)node.style.fontSize=(s*scale)+'px';
      }
    }
    const nodes=[scope,...scope.querySelectorAll('*')];
    const overflow=nodes.filter(n=>n.scrollWidth>n.clientWidth+1).slice(0,60).map(n=>({tag:n.tagName,className:String(n.className),clientWidth:n.clientWidth,scrollWidth:n.scrollWidth,text:(n.textContent||'').trim().slice(0,80)}));
    const axeResult=await axe.run(scope,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']},resultTypes:['violations']});
    const relevantButtons=scenario==='prologue'
      ?[...dialog.querySelectorAll('button:not([hidden])')]
      :scenario==='epilogue'
        ?[...main.querySelectorAll('.cinematic-player button:not([hidden]),.retirement-panel button:not([hidden])')]
        :[...player.querySelectorAll('button:not([hidden])')];
    const poster=(scenario==='prologue'?dialog:player)?.querySelector('.cutscene-poster');
    return {
      text:scope.innerText,
      state:scenario==='prologue'?dialog?.dataset.cutsceneState:player?.dataset.cutsceneState,
      dialogOpen:dialog?.open??false,
      playerKind:player?.dataset.cutsceneKind??null,
      posterExists:Boolean(poster),
      posterHidden:poster?.hidden??null,
      videoHidden:(scenario==='prologue'?dialog:player)?.querySelector('video')?.hidden??null,
      buttonHeights:relevantButtons.map(x=>Math.round(x.getBoundingClientRect().height)),
      decisionChoices:main.querySelectorAll('.decision-choices .choice').length,
      epilogue,
      retirement:main.querySelectorAll('.retirement-panel').length,
      serious:axeResult.violations.filter(v=>v.impact==='serious'||v.impact==='critical').map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.length})),
      overflow
    };
  },{scenario,scale});
}

function verifyCommon(m,scenario){
  assert.ok(m.buttonHeights.every(h=>h>=48),scenario+' visible cinematic button touch height');
  assert.deepEqual(m.overflow,[],scenario+' horizontal overflow');
  assert.deepEqual(m.serious,[],scenario+' serious/critical AXE');
}

try{
  for(const viewport of viewports){
    for(const scenario of scenarios){
      const context=await browser.newContext({viewport:{width:viewport.width,height:viewport.height},reducedMotion:'reduce'});
      const page=await context.newPage();
      try{
        await open(page,scenario);
        const metric=await inspect(page,scenario,1);
        verifyCommon(metric,scenario);

        if(scenario==='decision-poster'){
          assert.equal(metric.state,'ready');
          assert.equal(metric.posterExists,true);
          assert.equal(metric.posterHidden,false);
          assert.equal(metric.videoHidden,true);
        }
        if(scenario==='decision-video'){
          assert.equal(metric.state,'playing');
          assert.equal(metric.videoHidden,false);
          assert.equal(metric.posterExists,true);
          if(viewport.id==='phone-primary'){
            await page.evaluate(()=>globalThis.__P9_ROOT__.querySelector('.cinematic-player video')?.dispatchEvent(new Event('waiting')));
            await page.waitForTimeout(20);
            let state=await page.evaluate(()=>globalThis.__P9_ROOT__.querySelector('.cinematic-player')?.dataset.cutsceneState);
            assert.equal(state,'loading','waiting must expose loading state');
            await page.evaluate(()=>globalThis.__P9_ROOT__.querySelector('.cinematic-player video')?.dispatchEvent(new Event('playing')));
            await page.waitForTimeout(20);
            state=await page.evaluate(()=>globalThis.__P9_ROOT__.querySelector('.cinematic-player')?.dataset.cutsceneState);
            assert.equal(state,'playing','playing must recover after buffering');
            await page.evaluate(()=>globalThis.__P9_ROOT__.querySelector('.cinematic-player .glass')?.click());
            await page.waitForTimeout(30);
            const skipped=await page.evaluate(()=>({
              state:globalThis.__P9_ROOT__.querySelector('.cinematic-player')?.dataset.cutsceneState,
              commands:globalThis.__P9_COMMAND_LOG__
            }));
            assert.equal(skipped.state,'complete');
            assert.equal(skipped.commands.length,0,'skip must not dispatch career commands');
          }
        }
        if(['decision-missing','decision-error'].includes(scenario)){
          assert.equal(metric.state,'fallback');
          assert.match(metric.text,/No se ha podido cargar la escena/);
          assert.equal(metric.decisionChoices,4,'fallback must not block decisions');
          const commands=await page.evaluate(()=>globalThis.__P9_COMMAND_LOG__);
          assert.equal(commands.length,0,'fallback must not dispatch career commands');
        }
        if(scenario==='prologue'){
          assert.equal(metric.state,'fallback');
          assert.equal(metric.dialogOpen,true);
          assert.equal(metric.posterExists,true);
          assert.equal(metric.posterHidden,false);
          assert.match(metric.text,/No se ha podido cargar el prólogo/);
          assert.match(metric.text,/Empezar historia/);
          if(viewport.id==='phone-primary'){
            await page.keyboard.press('Escape');await page.waitForTimeout(60);
            const closed=await page.evaluate(()=>({open:globalThis.__P9_ROOT__.querySelector('.prologue-dialog')?.open,commands:globalThis.__P9_COMMAND_LOG__}));
            assert.equal(closed.open,false,'Escape closes prologue safely');
            assert.equal(closed.commands.length,0,'prologue Escape must not dispatch career commands');
            await page.evaluate(()=>globalThis.__P9_ROOT__.querySelector('.prologue-entry>.secondary')?.click());await page.waitForTimeout(40);
            const reopened=await page.evaluate(()=>globalThis.__P9_ROOT__.querySelector('.prologue-dialog')?.open);
            assert.equal(reopened,true,'prologue can be reopened');
          }
        }
        if(scenario==='epilogue'){
          assert.equal(metric.epilogue,true);
          assert.equal(metric.playerKind,'epilogue');
          assert.equal(metric.retirement,1);
          assert.equal(metric.state,'ready');
          assert.equal(metric.posterExists,true);
          assert.equal(metric.posterHidden,false);
          assert.match(metric.text,/Carrera finalizada/);
          assert.match(metric.text,/Ver carrera/);
          if(viewport.id==='phone-primary'){
            await page.evaluate(()=>[...globalThis.__P9_ROOT__.querySelectorAll('.retirement-panel button')].find(b=>b.textContent.includes('Ver carrera'))?.click());
            await page.waitForTimeout(50);
            const history=await page.evaluate(()=>({
              career:globalThis.__P9_ROOT__.querySelector('main')?.classList.contains('p8-career'),
              commands:globalThis.__P9_COMMAND_LOG__
            }));
            assert.equal(history.career,true,'epilogue must provide safe career-history access');
            assert.equal(history.commands.length,0,'history navigation must not mutate career authority');
          }
        }

        const png=await page.screenshot({fullPage:false,type:'png'}),hash=crypto.createHash('sha256').update(png).digest('hex');
        const file='p9-cinematics__'+scenario+'__'+viewport.width+'x'+viewport.height+'__'+hash.slice(0,12)+'.png';
        fs.writeFileSync(path.join(outDir,file),png);
        records.push({scenario,viewport:viewport.id,width:viewport.width,height:viewport.height,scale:1,screenshot:'analysis/muir/p9/screenshots/'+file,sha256:hash,metric});
      }finally{await context.close();}
    }
  }

  for(const scale of [1.3,1.8]){
    for(const scenario of ['prologue','decision-error','epilogue']){
      const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});const page=await context.newPage();
      try{
        await open(page,scenario);const metric=await inspect(page,scenario,scale);verifyCommon(metric,scenario);
        records.push({scenario,viewport:'phone-primary',width:390,height:844,scale,metric});
      }finally{await context.close();}
    }
  }
}finally{await browser.close();server.close();}

const evidence={
  schema:'muir-p9-cinematics-v2',gate:'PASS',scenarios,viewports:viewports.map(x=>x.id),
  captures:records.filter(x=>x.screenshot).length,textScales:['100%','130%','180%'],
  poster:'PASS',play:'PASS',skip:'PASS',missingAsset:'PASS',error:'PASS',fallback:'PASS',epilogue:'PASS',
  careerCommandsFromMedia:0,axeSeriousCritical:0,horizontalOverflowFindings:0,records
};
fs.writeFileSync(path.join(evidenceDir,'p9-cinematics.json'),JSON.stringify(evidence,null,2)+'\n');
console.log(JSON.stringify({
  gate:evidence.gate,captures:evidence.captures,poster:evidence.poster,play:evidence.play,
  skip:evidence.skip,missingAsset:evidence.missingAsset,fallback:evidence.fallback,epilogue:evidence.epilogue
}));
