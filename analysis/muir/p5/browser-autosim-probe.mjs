import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const root=path.resolve(import.meta.dirname,'../../..');
const outDir=path.join(root,'analysis','muir','p5','evidence');
fs.mkdirSync(outDir,{recursive:true});

const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.webm':'video/webm','.svg':'image/svg+xml','.woff2':'font/woff2'};
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

const percentile=(samples,p)=>{
  if(!samples.length)return null;
  const sorted=[...samples].sort((a,b)=>a-b);
  return sorted[Math.min(sorted.length-1,Math.ceil(sorted.length*p)-1)];
};

const browser=await chromium.launch({headless:true});
const records=[];
try{
  for(const viewport of [
    {id:'phone-360',width:360,height:800},
    {id:'phone-primary',width:390,height:844},
    {id:'phone-412',width:412,height:915}
  ]){
    const context=await browser.newContext({viewport:{width:viewport.width,height:viewport.height},reducedMotion:'reduce'});
    const page=await context.newPage();
    await page.addInitScript(()=>{
      const nativeReplaceChildren=Element.prototype.replaceChildren;
      globalThis.__P5_PROBE__={shellReplacements:0,shellReplaceDurationsMs:[]};
      Element.prototype.replaceChildren=function(...nodes){
        if(this.classList?.contains('mh')){
          const started=performance.now();
          const result=nativeReplaceChildren.apply(this,nodes);
          globalThis.__P5_PROBE__.shellReplacements++;
          globalThis.__P5_PROBE__.shellReplaceDurationsMs.push(performance.now()-started);
          return result;
        }
        return nativeReplaceChildren.apply(this,nodes);
      };
    });
    try{
      const url=`http://127.0.0.1:${port}/analysis/muir/ui-fixtures/index.html?fixture=auto-running&viewport=${viewport.id}`;
      await page.goto(url,{waitUntil:'networkidle',timeout:30000});
      await page.waitForFunction(()=>globalThis.__MUIR_READY__?.ready===true,null,{timeout:30000});
      await page.waitForFunction(()=>{
        const root=document.querySelector('#game')?.shadowRoot;
        return [...(root?.querySelectorAll('button')??[])].some(b=>b.textContent.trim()==='Pausar simulación');
      },null,{timeout:10000});
      const start=await page.evaluate(async()=>{
        const root=document.querySelector('#game').shadowRoot;
        const main=root.querySelector('main');
        const maxScroll=Math.max(0,main.scrollHeight-main.clientHeight);
        const requested=Math.min(320,maxScroll);
        main.scrollTop=requested;
        const pause=[...root.querySelectorAll('button')].find(b=>b.textContent.trim()==='Pausar simulación');
        pause?.focus({preventScroll:true});
        const snapshot=await globalThis.__MUIR_READ_SAVED_SNAPSHOT__?.();
        if(!snapshot)throw Error('persisted auto-running snapshot is unavailable');
        const metrics=globalThis.__MUIR_METRICS__;
        const sampleCount=globalThis.__P5_PROBE__?.shellReplaceDurationsMs?.length??0;
        globalThis.__P5_VISUAL_PATCHES__=0;
        globalThis.__P5_VISUAL_OBSERVER__?.disconnect?.();
        const progressNode=root.querySelector('[data-p5-auto-progress]');
        const progressTextNode=root.querySelector('[data-p5-auto-progress-text]');
        const watched=[progressNode,progressTextNode].filter(Boolean);
        if(watched.length){
          globalThis.__P5_VISUAL_OBSERVER__=new MutationObserver(records=>{
            if(records.length)globalThis.__P5_VISUAL_PATCHES__++;
          });
          for(const node of watched)globalThis.__P5_VISUAL_OBSERVER__.observe(node,{attributes:true,childList:true,characterData:true,subtree:true});
        }
        const result={
          now:performance.now(),
          revision:snapshot.revision,
          elapsedDays:snapshot.autoSimulation?.elapsedDays??null,
          mode:snapshot.autoSimulation?.mode??null,
          maxWeeks:snapshot.autoSimulation?.maxWeeks??null,
          renderCount:metrics?.render?.count??0,
          mutationBatches:metrics?.uiMutationBatches??0,
          focusChanges:metrics?.focusChanges??0,
          scrollEvents:metrics?.scrollEvents??0,
          shellReplacements:globalThis.__P5_PROBE__?.shellReplacements??0,
          shellDurationCount:sampleCount,
          scrollTop:main.scrollTop,
          maxScroll,
          activeText:root.activeElement?.textContent?.trim()??''
        };
        globalThis.__MUIR_RELEASE_AUTO_TIMER__?.();
        return new Promise(resolve=>setTimeout(async()=>{
          const refreshed=globalThis.__MUIR_METRICS__;
          const settledSnapshot=await globalThis.__MUIR_READ_SAVED_SNAPSHOT__?.();
          result.now=performance.now();
          result.revision=settledSnapshot?.revision??result.revision;
          result.elapsedDays=settledSnapshot?.autoSimulation?.elapsedDays??result.elapsedDays;
          result.mode=settledSnapshot?.autoSimulation?.mode??result.mode;
          result.focusChanges=refreshed?.focusChanges??result.focusChanges;
          result.scrollEvents=refreshed?.scrollEvents??result.scrollEvents;
          globalThis.__P5_VISUAL_PATCHES__=0;
          result.visualPatches=0;
          resolve(result);
        },120));
      });

      await page.waitForTimeout(700);

      const end=await page.evaluate(async()=>{
        const root=document.querySelector('#game').shadowRoot;
        const main=root.querySelector('main');
        const snapshot=await globalThis.__MUIR_READ_SAVED_SNAPSHOT__?.();
        if(!snapshot)throw Error('persisted auto-running snapshot is unavailable');
        const metrics=globalThis.__MUIR_METRICS__;
        return {
          now:performance.now(),
          revision:snapshot.revision,
          elapsedDays:snapshot.autoSimulation?.elapsedDays??null,
          mode:snapshot.autoSimulation?.mode??null,
          renderCount:metrics?.render?.count??0,
          mutationBatches:metrics?.uiMutationBatches??0,
          focusChanges:metrics?.focusChanges??0,
          scrollEvents:metrics?.scrollEvents??0,
          shellReplacements:globalThis.__P5_PROBE__?.shellReplacements??0,
          shellReplaceDurationsMs:[...(globalThis.__P5_PROBE__?.shellReplaceDurationsMs??[])],
          scrollTop:main.scrollTop,
          maxScroll:Math.max(0,main.scrollHeight-main.clientHeight),
          activeText:root.activeElement?.textContent?.trim()??'',
          visualPatches:globalThis.__P5_VISUAL_PATCHES__??0
        };
      });

      const durationMs=end.now-start.now;
      const logicTicks=end.revision-start.revision;
      const daysAdvanced=(end.elapsedDays??0)-(start.elapsedDays??0);
      const fullRenders=end.shellReplacements-start.shellReplacements;
      const visualUpdates=Math.max(0,(end.visualPatches??0)-(start.visualPatches??0));
      const mutationBatches=end.mutationBatches-start.mutationBatches;
      const focusChurn=end.focusChanges-start.focusChanges;
      const scrollEvents=end.scrollEvents-start.scrollEvents;
      const durations=end.shellReplaceDurationsMs.slice(start.shellDurationCount);
      const logicRateHz=durationMs>0?logicTicks/(durationMs/1000):0;
      const visualRateHz=durationMs>0?visualUpdates/(durationMs/1000):0;
      const mutationRateHz=durationMs>0?mutationBatches/(durationMs/1000):0;

      assert(logicTicks>0,viewport.id+' probe observed no logical auto steps');
      assert.equal(daysAdvanced,logicTicks*7,viewport.id+' logical step/day relation changed during baseline probe');
      assert.equal(fullRenders,0,viewport.id+' normal auto ticks rebuilt the shell');
      assert(visualRateHz<=4.0,viewport.id+' visual refresh exceeded 4 Hz: '+visualRateHz);
      assert.equal(focusChurn,0,viewport.id+' focus changed during normal auto ticks');
      assert.equal(end.activeText,start.activeText,viewport.id+' active control changed during normal auto ticks');
      if(start.maxScroll>0)assert.equal(end.scrollTop,start.scrollTop,viewport.id+' scroll position changed during normal auto ticks');

      records.push({
        viewport,
        durationMs,
        start,
        end:{...end,shellReplaceDurationsMs:undefined},
        logicTicks,
        daysAdvanced,
        logicRateHz,
        visualUpdates,
        visualRateHz,
        fullRenders,
        mutationBatches,
        mutationRateHz,
        renderCountDelta:end.renderCount-start.renderCount,
        domReplacements:fullRenders,
        renderP50Ms:percentile(durations,.5),
        renderP95Ms:percentile(durations,.95),
        focusChurn,
        focusChurnPerTick:logicTicks?focusChurn/logicTicks:null,
        focusPreserved:end.activeText===start.activeText&&start.activeText==='Pausar simulación',
        scrollEvents,
        scrollPreserved:start.maxScroll===0?null:end.scrollTop===start.scrollTop,
        scrollStart:start.scrollTop,
        scrollEnd:end.scrollTop,
        focusStart:start.activeText,
        focusEnd:end.activeText
      });
    }finally{
      await context.close();
    }
  }
}finally{
  await browser.close();
  server.close();
}

const primary=records.find(r=>r.viewport.id==='phone-primary');
const report={
  schema:'muir-p5-autosim-probe-v1',
  predecessor:'45371a41908e2ecdac71cfc5f2bf855f086f7866',
  generatedAt:new Date().toISOString(),
  records,
  primary:{
    logicRateHz:primary?.logicRateHz??null,
    visualRateHz:primary?.visualRateHz??null,
    renderP50Ms:primary?.renderP50Ms??null,
    renderP95Ms:primary?.renderP95Ms??null,
    domReplacements:primary?.domReplacements??null,
    visualUpdates:primary?.visualUpdates??null,
    focusChurn:primary?.focusChurn??null,
    scrollPreserved:primary?.scrollPreserved??null
  }
};
fs.writeFileSync(path.join(outDir,'p5-autosim-probe.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report));
