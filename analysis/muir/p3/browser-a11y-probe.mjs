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
    const url=new URL(req.url,'http://127.0.0.1');
    let rel=decodeURIComponent(url.pathname).replace(/^[/]+/, '');
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
const reports=[];
try{
  for(const viewport of [
    {id:'phone-360',width:360,height:800},
    {id:'phone-primary',width:390,height:844},
    {id:'phone-412',width:412,height:915}
  ]){
    const context=await browser.newContext({viewport:{width:viewport.width,height:viewport.height},reducedMotion:'reduce'});
    const page=await context.newPage();
    try{
      await page.goto(`http://127.0.0.1:${port}/analysis/muir/ui-fixtures/index.html?fixture=home-normal&viewport=${viewport.id}`,{waitUntil:'networkidle',timeout:30000});
      await page.waitForFunction(()=>globalThis.__MUIR_READY__?.ready===true,null,{timeout:30000});
      await page.addScriptTag({path:axePath});
      const base=await page.evaluate(async()=>{
        const root=document.querySelector('#game').shadowRoot;
        const home=root.querySelector('.p3-home');
        const primary=home.querySelector('.next .primary');
        const secondary=[...home.querySelectorAll('.next .secondary')].find(b=>b.textContent.trim()==='Gestionar mi carrera');
        const axeResult=await axe.run(home,{
          runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']},
          resultTypes:['violations']
        });
        const serious=axeResult.violations.filter(v=>v.impact==='serious'||v.impact==='critical');
        const focusable=node=>node instanceof HTMLButtonElement&&!node.disabled&&node.tabIndex>=0;
        return {
          primary:{text:primary?.textContent.trim()??'',height:primary?.getBoundingClientRect().height??0,focusable:focusable(primary)},
          secondary:secondary?{text:secondary.textContent.trim(),height:secondary.getBoundingClientRect().height,focusable:focusable(secondary)}:null,
          serious:serious.map(v=>({id:v.id,impact:v.impact,help:v.help,nodes:v.nodes.length}))
        };
      });
      assert.deepEqual(base.serious,[],viewport.id+' Home serious/critical AXE violations: '+JSON.stringify(base.serious));
      assert(base.primary.text.startsWith('Simular'),viewport.id+' Home primary action missing');
      assert(base.primary.height>=48,viewport.id+' Home primary touch target below 48px');
      assert.equal(base.primary.focusable,true,viewport.id+' Home primary action not keyboard focusable');
      assert(base.secondary,viewport.id+' optional Player Actions button missing');
      assert(base.secondary.height>=48,viewport.id+' Home secondary touch target below 48px');
      assert.equal(base.secondary.focusable,true,viewport.id+' Home secondary action not keyboard focusable');

      const text130=await page.evaluate(()=>{
        const root=document.querySelector('#game').shadowRoot;
        const home=root.querySelector('.p3-home');
        const nodes=[home,...home.querySelectorAll('*')];
        const sizes=nodes.map(node=>[node,parseFloat(getComputedStyle(node).fontSize)]).filter(([,size])=>Number.isFinite(size)&&size>0);
        for(const [node,size] of sizes)node.style.fontSize=(size*1.3)+'px';
        const overflow=[...home.querySelectorAll('*')].filter(n=>n.scrollWidth>n.clientWidth+1).slice(0,20).map(n=>({tag:n.tagName,className:n.className,text:n.textContent.trim().slice(0,90),clientWidth:n.clientWidth,scrollWidth:n.scrollWidth}));
        const name=home.querySelector('.home-hero .player-name');
        const primary=home.querySelector('.next .primary');
        const hero=home.querySelector('.home-hero');
        const nr=name.getBoundingClientRect(),hr=hero.getBoundingClientRect(),pr=primary.getBoundingClientRect();
        return {overflow,nameWithinHero:nr.bottom<=hr.bottom+1,primaryHeight:pr.height,primaryText:primary.textContent.trim()};
      });
      assert.deepEqual(text130.overflow,[],viewport.id+' horizontal overflow at 130% text: '+JSON.stringify(text130.overflow));
      assert.equal(text130.nameWithinHero,true,viewport.id+' player identity escapes hero at 130% text');
      assert(text130.primaryHeight>=48,viewport.id+' primary target shrank under 130% text');
      reports.push({viewport:viewport.id,base,text130});
    }finally{
      await context.close();
    }
  }
}finally{
  await browser.close();
  server.close();
}

const evidence={gate:'PASS',textScale:'130%',viewports:reports.length,reports};
const evidenceDir=path.join(root,'analysis','muir','p3','evidence');
fs.mkdirSync(evidenceDir,{recursive:true});
fs.writeFileSync(path.join(evidenceDir,'home-a11y.json'),JSON.stringify(evidence,null,2)+'\n');
console.log(JSON.stringify(evidence));
