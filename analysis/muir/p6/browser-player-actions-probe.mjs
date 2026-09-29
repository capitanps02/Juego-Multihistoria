import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const root=path.resolve(import.meta.dirname,'../../..');
const axePath=path.join(root,'node_modules','axe-core','axe.min.js');
assert(fs.existsSync(axePath),'axe-core is not installed');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webm':'video/webm','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{
  try{
    const url=new URL(req.url,'http://127.0.0.1'),rel=decodeURIComponent(url.pathname).replace(/^\/+/, '')||'analysis/muir/ui-fixtures/index.html';
    const file=path.resolve(root,rel);
    if(!file.startsWith(root+path.sep)&&file!==root){res.writeHead(403);res.end('forbidden');return;}
    if(!fs.existsSync(file)||fs.statSync(file).isDirectory()){res.writeHead(404);res.end('not found');return;}
    res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');fs.createReadStream(file).pipe(res);
  }catch(error){res.writeHead(500);res.end(String(error));}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const port=server.address().port,browser=await chromium.launch({headless:true});
const viewports=[
  {id:'phone-360',width:360,height:800},
  {id:'phone-primary',width:390,height:844},
  {id:'phone-412',width:412,height:915},
  {id:'landscape-check',width:844,height:390}
];
const fixtures=['player-actions-menu','player-actions-category','player-actions-category-unavailable','player-actions-cooldown','player-actions-detail-none','player-actions-detail-coach','player-actions-detail-agent','player-actions-detail-teammate','player-actions-options','player-actions-result'];
const reports=[];

async function open(page,fixture,viewport){
  await page.goto('http://127.0.0.1:'+port+'/analysis/muir/ui-fixtures/index.html?fixture='+encodeURIComponent(fixture)+'&viewport='+encodeURIComponent(viewport.id),{waitUntil:'networkidle',timeout:30000});
  await page.waitForFunction(()=>globalThis.__MUIR_READY__?.ready===true,null,{timeout:30000});
  await page.waitForTimeout(80);
  await page.addScriptTag({path:axePath});
}
async function inspect(page,scale=1){
  return page.evaluate(async scale=>{
    const root=document.querySelector('#game').shadowRoot,main=root.querySelector('main');
    if(scale!==1){
      for(const node of [main,...main.querySelectorAll('*')]){
        const size=parseFloat(getComputedStyle(node).fontSize);
        if(Number.isFinite(size)&&size>0)node.style.fontSize=(size*scale)+'px';
      }
    }
    const nodes=[main,...main.querySelectorAll('*')];
    const overflow=nodes.filter(n=>n.scrollWidth>n.clientWidth+1).slice(0,20).map(n=>({tag:n.tagName,className:n.className,text:n.textContent.trim().slice(0,80),clientWidth:n.clientWidth,scrollWidth:n.scrollWidth}));
    const buttons=[...main.querySelectorAll('button:not(:disabled)')].map(b=>({text:b.textContent.trim(),width:b.getBoundingClientRect().width,height:b.getBoundingClientRect().height}));
    const reasons=[...main.querySelectorAll('.player-action-reason,.player-action-cooldown')].map(n=>({text:n.textContent.trim(),scrollWidth:n.scrollWidth,clientWidth:n.clientWidth}));
    const axeResult=await axe.run(main,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']},resultTypes:['violations']});
    return {text:main.textContent,h1:main.querySelector('h1')?.textContent.trim()??'',focusTag:root.activeElement?.tagName??null,overflow,buttons,reasons,serious:axeResult.violations.filter(v=>v.impact==='serious'||v.impact==='critical').map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.length}))};
  },scale);
}
try{
  for(const viewport of viewports){
    for(const fixture of fixtures){
      const context=await browser.newContext({viewport:{width:viewport.width,height:viewport.height},reducedMotion:'reduce'});
      const page=await context.newPage();
      try{
        await open(page,fixture,viewport);
        if(fixture==='player-actions-detail-teammate'){
          await page.evaluate(()=>{
            const root=document.querySelector('#game').shadowRoot;
            const b=[...root.querySelectorAll('.player-action-target button:not(:disabled)')].find(x=>x.textContent.trim()==='Elegir');
            b?.click();
          });
          await page.waitForTimeout(50);
          const selected=await page.evaluate(()=>[...document.querySelector('#game').shadowRoot.querySelectorAll('.player-action-target button')].some(b=>b.getAttribute('aria-pressed')==='true'));
          assert.equal(selected,true,viewport.id+' teammate target lacks selected semantics');
        }
        const metric=await inspect(page,1);
        assert.deepEqual(metric.serious,[],viewport.id+'/'+fixture+' AXE: '+JSON.stringify(metric.serious));
        assert.deepEqual(metric.overflow,[],viewport.id+'/'+fixture+' horizontal overflow: '+JSON.stringify(metric.overflow));
        for(const b of metric.buttons)assert(b.height>=48,viewport.id+'/'+fixture+' control below 48px: '+JSON.stringify(b));
        assert.equal(metric.focusTag,'H1',viewport.id+'/'+fixture+' focus did not return to h1');
        if(fixture==='player-actions-cooldown'){
          assert(metric.text.includes('Disponible de nuevo el'),viewport.id+' exact cooldown missing');
          assert(!metric.text.includes('próxima semana')&&!metric.text.includes('mañana'),viewport.id+' approximate cooldown remains');
        }
        reports.push({viewport:viewport.id,fixture,scale:1,metric});
      }finally{await context.close();}
    }
  }
  for(const factor of [1.3,1.8]){
    for(const fixture of fixtures){
      const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
      const page=await context.newPage();
      try{
        await open(page,fixture,{id:'phone-primary'});
        const metric=await inspect(page,factor);
        assert.deepEqual(metric.overflow,[],'text '+factor+' '+fixture+' overflow: '+JSON.stringify(metric.overflow));
        for(const b of metric.buttons)assert(b.height>=48,'text '+factor+' '+fixture+' control below 48px: '+JSON.stringify(b));
        for(const reason of metric.reasons)assert(reason.scrollWidth<=reason.clientWidth+1,'reason truncated at '+factor+': '+JSON.stringify(reason));
        reports.push({viewport:'phone-primary',fixture,scale:factor,metric});
      }finally{await context.close();}
    }
  }
  {
    const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
    const page=await context.newPage();
    try{
      await open(page,'player-actions-detail-none',{id:'phone-primary'});
      await page.evaluate(()=>{
        const root=document.querySelector('#game').shadowRoot;
        const b=[...root.querySelectorAll('.player-action-options button:not(:disabled)')].find(x=>x.textContent.trim()==='Trabajo técnico');
        if(!b)throw Error('Trabajo técnico option missing');
        b.click();b.click();
      });
      await page.waitForFunction(()=>document.querySelector('#game').shadowRoot.textContent.includes('ACCIÓN COMPLETADA'),null,{timeout:5000});
      const commands=await page.evaluate(()=>globalThis.__MUIR_COMMAND_LOG__.filter(row=>row.type==='player_action'));
      assert.equal(commands.length,1,'double tap emitted '+commands.length+' player_action commands');
      reports.push({viewport:'phone-primary',fixture:'double-submit',commands});
    }finally{await context.close();}
  }
}finally{await browser.close();server.close();}

const evidence={gate:'PASS',viewports:viewports.map(v=>v.id),fixtures,textScales:['100%','130%','180%'],doubleSubmit:'PASS',reports};
const dir=path.join(root,'analysis','muir','p6','evidence');fs.mkdirSync(dir,{recursive:true});
fs.writeFileSync(path.join(dir,'p6-browser-player-actions.json'),JSON.stringify(evidence,null,2)+'\n');
console.log(JSON.stringify({gate:evidence.gate,viewports:evidence.viewports,fixtureCount:fixtures.length,textScales:evidence.textScales,doubleSubmit:evidence.doubleSubmit}));
