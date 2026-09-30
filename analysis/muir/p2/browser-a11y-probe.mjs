import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const root=path.resolve(import.meta.dirname,'../../..');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webm':'video/webm','.svg':'image/svg+xml'};

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
const results=[];
try{
  for(const viewport of [
    {id:'phone-360',width:360,height:800},
    {id:'phone-primary',width:390,height:844},
    {id:'phone-412',width:412,height:915}
  ]){
    const context=await browser.newContext({viewport:{width:viewport.width,height:viewport.height},reducedMotion:'reduce'});
    const page=await context.newPage();
    try{
      const url=`http://127.0.0.1:${port}/analysis/muir/ui-fixtures/index.html?fixture=home-normal&viewport=${viewport.id}`;
      await page.goto(url,{waitUntil:'networkidle',timeout:30000});
      await page.waitForFunction(()=>globalThis.__MUIR_READY__?.ready===true,null,{timeout:30000});

      const initial=await page.evaluate(()=>{
        const root=document.querySelector('#game').shadowRoot;
        const nav=root.querySelector('nav.navigation');
        const buttons=[...nav.querySelectorAll('button.nav-button')];
        const current=buttons.filter(b=>b.getAttribute('aria-current')==='page');
        return {
          navLabel:nav.getAttribute('aria-label'),
          buttons:buttons.map(b=>({text:b.textContent.trim(),ariaCurrent:b.getAttribute('aria-current'),ariaLabel:b.getAttribute('aria-label')})),
          current:current.map(b=>b.textContent.trim()),
          mainTabIndex:root.querySelector('main')?.tabIndex,
          reducedMotion:matchMedia('(prefers-reduced-motion: reduce)').matches
        };
      });
      assert.equal(initial.navLabel,'Navegación principal',viewport.id+' nav accessible name');
      assert.equal(initial.buttons.length,6,viewport.id+' six nav buttons');
      assert.deepEqual(initial.current,['Inicio'],viewport.id+' exactly Inicio selected');
      // P8+ certified contract: main is intentionally reachable in the keyboard tab order.\n      assert.equal(initial.mainTabIndex,0,viewport.id+' main keyboard landmark target');
      assert.equal(initial.reducedMotion,true,viewport.id+' reduced-motion media query');

      await page.evaluate(()=>{
        const root=document.querySelector('#game').shadowRoot;
        root.querySelector('.nav-button')?.focus();
      });
      const focusStyle=await page.evaluate(()=>{
        const root=document.querySelector('#game').shadowRoot;
        const active=root.activeElement;
        const s=getComputedStyle(active);
        return {text:active?.textContent?.trim(),outlineStyle:s.outlineStyle,outlineWidth:s.outlineWidth,outlineColor:s.outlineColor,boxShadow:s.boxShadow};
      });
      assert.equal(focusStyle.text,'Inicio',viewport.id+' focus begins on Inicio');
      assert.notEqual(focusStyle.outlineStyle,'none',viewport.id+' visible focus outline');
      assert(parseFloat(focusStyle.outlineWidth)>=3,viewport.id+' focus outline >=3px');
      assert.notEqual(focusStyle.boxShadow,'none',viewport.id+' focus halo');

      await page.keyboard.press('ArrowRight');
      let focused=await page.evaluate(()=>document.querySelector('#game').shadowRoot.activeElement?.textContent?.trim());
      assert.equal(focused,'Carrera',viewport.id+' ArrowRight advances nav focus');
      await page.keyboard.press('ArrowLeft');
      focused=await page.evaluate(()=>document.querySelector('#game').shadowRoot.activeElement?.textContent?.trim());
      assert.equal(focused,'Inicio',viewport.id+' ArrowLeft reverses nav focus');

      await page.keyboard.press('ArrowLeft');
      focused=await page.evaluate(()=>document.querySelector('#game').shadowRoot.activeElement?.textContent?.trim());
      assert.equal(focused,'Tu partida',viewport.id+' nav arrow wrapping');

      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('ArrowRight');
      focused=await page.evaluate(()=>document.querySelector('#game').shadowRoot.activeElement?.textContent?.trim());
      assert.equal(focused,'Carrera',viewport.id+' wrap back to Carrera');

      await page.keyboard.press('Enter');
      await page.waitForFunction(()=>{
        const root=document.querySelector('#game').shadowRoot;
        return root.querySelector('main h1')?.textContent?.trim()==='Tu carrera.';
      },null,{timeout:5000});
      const afterEnter=await page.evaluate(()=>{
        const root=document.querySelector('#game').shadowRoot;
        const current=[...root.querySelectorAll('.nav-button')].filter(b=>b.getAttribute('aria-current')==='page').map(b=>b.textContent.trim());
        return {current,h1:root.querySelector('main h1')?.textContent?.trim()};
      });
      assert.deepEqual(afterEnter.current,['Carrera'],viewport.id+' aria-current follows keyboard activation');
      assert.equal(afterEnter.h1,'Tu carrera.',viewport.id+' keyboard activation navigates');

      const unlabeled=await page.evaluate(()=>{
        const root=document.querySelector('#game').shadowRoot;
        return [...root.querySelectorAll('button')].filter(b=>{
          const text=b.textContent.trim();
          const aria=b.getAttribute('aria-label')?.trim();
          return !text&&!aria;
        }).map(b=>b.outerHTML.slice(0,160));
      });
      assert.deepEqual(unlabeled,[],viewport.id+' no unlabeled buttons on career shell');

      results.push({viewport:viewport.id,focusStyle,afterEnter,unlabeledButtons:unlabeled.length});
    }finally{
      await context.close();
    }
  }
}finally{
  await browser.close();
  server.close();
}

const report={gate:'PASS',viewports:results.length,results};
const evidenceDir=path.join(root,'analysis','muir','p2','evidence');
fs.mkdirSync(evidenceDir,{recursive:true});
fs.writeFileSync(path.join(evidenceDir,'a11y.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report));
