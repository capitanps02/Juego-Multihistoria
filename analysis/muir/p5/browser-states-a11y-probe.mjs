import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const root=path.resolve(import.meta.dirname,'../../..');
const axePath=path.join(root,'node_modules','axe-core','axe.min.js');
assert(fs.existsSync(axePath),'axe-core is not installed');
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

const fixtures=['auto-running','auto-paused','period-summary','auto-interruption'];
const viewports=[
  {id:'phone-360',width:360,height:800},
  {id:'phone-primary',width:390,height:844},
  {id:'phone-412',width:412,height:915},
  {id:'landscape-check',width:844,height:390}
];
const results=[];
const browser=await chromium.launch({headless:true});
try{
  for(const fixture of fixtures){
    for(const viewport of viewports){
      const context=await browser.newContext({viewport:{width:viewport.width,height:viewport.height},reducedMotion:'reduce'});
      const page=await context.newPage();
      try{
        await page.goto(`http://127.0.0.1:${port}/analysis/muir/ui-fixtures/index.html?fixture=${fixture}&viewport=${viewport.id}`,{waitUntil:'networkidle',timeout:30000});
        await page.waitForFunction(()=>globalThis.__MUIR_READY__?.ready===true,null,{timeout:30000});
        await page.addScriptTag({path:axePath});
        const info=await page.evaluate(async fixture=>{
          const root=document.querySelector('#game').shadowRoot;
          const all=[...root.querySelectorAll('*')];
          const overflow=all.filter(n=>n.scrollWidth>n.clientWidth+1).slice(0,20).map(n=>({tag:n.tagName,className:n.className,clientWidth:n.clientWidth,scrollWidth:n.scrollWidth}));
          const state=root.querySelector('.auto-sim-state');
          const progress=root.querySelector('[data-p5-auto-progress]');
          const buttons=[...root.querySelectorAll('button')].map(b=>({text:b.textContent.trim(),height:b.getBoundingClientRect().height,disabled:b.disabled}));
          const live=root.querySelector('.p5-live-status');
          const axeResult=await axe.run(root.querySelector('.mh'),{
            runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']},
            resultTypes:['violations']
          });
          const severe=axeResult.violations.filter(v=>v.impact==='serious'||v.impact==='critical').map(v=>({id:v.id,impact:v.impact,help:v.help,nodes:v.nodes.length}));
          const main=root.querySelector('main');
          return {
            fixture,
            text:root.textContent,
            overflow,
            stateText:state?.textContent.trim()??null,
            progress:progress?{value:progress.value,max:progress.max,ariaLabel:progress.getAttribute('aria-label')}:null,
            buttons,
            live:live?{text:live.textContent.trim(),role:live.getAttribute('role'),ariaLive:live.getAttribute('aria-live')}:null,
            severe,
            reducedMotion:matchMedia('(prefers-reduced-motion: reduce)').matches,
            main:{scrollHeight:main?.scrollHeight??0,clientHeight:main?.clientHeight??0}
          };
        },fixture);

        assert.deepEqual(info.overflow,[],fixture+' '+viewport.id+' horizontal overflow: '+JSON.stringify(info.overflow));
        assert.deepEqual(info.severe,[],fixture+' '+viewport.id+' serious/critical AXE violations: '+JSON.stringify(info.severe));
        assert.equal(info.reducedMotion,true,fixture+' '+viewport.id+' reduced motion not active');

        const button=(label)=>info.buttons.find(b=>b.text===label);
        if(fixture==='auto-running'){
          assert(info.stateText?.includes('SIMULANDO'),viewport.id+' Simulando state missing');
          assert(info.progress,viewport.id+' progress missing');
          assert.equal(info.progress.max,56,viewport.id+' progress max must derive from 8 weeks');
          assert.equal(info.progress.value,7,viewport.id+' initial elapsedDays progress mismatch');
          assert(info.progress.ariaLabel?.includes('7 de 56 días'),viewport.id+' accessible progress label mismatch');
          assert(button('Pausar simulación'),viewport.id+' pause control missing');
          assert(info.live?.text==='Simulación en curso.',viewport.id+' running live status mismatch');
        }else if(fixture==='auto-paused'){
          assert(info.stateText?.includes('PAUSADA'),viewport.id+' paused state missing');
          assert(button('Reanudar simulación'),viewport.id+' resume control missing');
          assert(button('Terminar simulación'),viewport.id+' stop control missing');
          assert(info.live?.text==='Simulación pausada.',viewport.id+' paused live status mismatch');
        }else if(fixture==='period-summary'){
          assert(info.text.includes('Resumen del periodo'),viewport.id+' period summary missing');
          assert(button('Seguir simulando'),viewport.id+' continue simulation action missing');
          assert(info.text.includes('días'),viewport.id+' public period duration missing');
        }else if(fixture==='auto-interruption'){
          assert(info.text.includes('UN MOMENTO QUE CUENTA'),viewport.id+' decision interruption surface missing');
        }

        for(const b of info.buttons.filter(b=>['Pausar simulación','Reanudar simulación','Terminar simulación','Seguir simulando'].includes(b.text)&&!b.disabled)){
          assert(b.height>=48,fixture+' '+viewport.id+' '+b.text+' touch target below 48px');
        }
        results.push({fixture,viewport:viewport.id,...info,text:undefined,buttons:info.buttons.filter(b=>['Pausar simulación','Reanudar simulación','Terminar simulación','Seguir simulando'].includes(b.text))});
      }finally{
        await context.close();
      }
    }
  }
}finally{
  await browser.close();
  server.close();
}
const evidence={gate:'PASS',viewports:viewports.map(v=>v.id),fixtures,checks:results.length,results};
fs.writeFileSync(path.join(outDir,'p5-states-a11y.json'),JSON.stringify(evidence,null,2)+'\n');
console.log(JSON.stringify({gate:evidence.gate,checks:evidence.checks,fixtures,viewports:evidence.viewports}));
