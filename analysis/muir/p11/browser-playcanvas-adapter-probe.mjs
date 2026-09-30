import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const root=path.resolve(import.meta.dirname,'../../..');
const outDir=path.join(root,'analysis','muir','p11','evidence');
fs.mkdirSync(outDir,{recursive:true});

const types={'.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.webm':'video/webm','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg'};
const server=http.createServer((req,res)=>{
  try{
    const url=new URL(req.url,'http://127.0.0.1');
    const rel=decodeURIComponent(url.pathname).replace(/^\/+/, '');
    if(!rel){res.setHeader('Content-Type','text/html; charset=utf-8');res.end('<!doctype html><html><body></body></html>');return;}
    const file=path.resolve(root,rel);
    if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||fs.statSync(file).isDirectory()){res.writeHead(404);res.end('not found');return;}
    res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');
    fs.createReadStream(file).pipe(res);
  }catch(error){res.writeHead(500);res.end(String(error));}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const port=server.address().port;

const report={schema:'muir-p11-playcanvas-adapter-browser-v1',targetScene:2593315,passed:false,surfaces:[],assetLookups:[],cutsceneResponses:[],pageErrors:[]};
const browser=await chromium.launch({headless:true});
try{
  const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
  const page=await context.newPage();
  page.on('pageerror',error=>report.pageErrors.push(String(error?.stack||error)));
  page.on('response',response=>{if(response.url().includes('/web/assets/cutscenes/'))report.cutsceneResponses.push({url:response.url(),status:response.status()});});
  await page.goto('http://127.0.0.1:'+port+'/',{waitUntil:'domcontentloaded'});
  await page.evaluate(()=>{
    window.__pcAssetLookups=[];
    window.pc={createScript(name){
      if(name!=='multihistoria')throw new Error('Unexpected PlayCanvas script '+name);
      function Script(){this.__handlers={};}
      Script.prototype.on=function(event,handler){this.__handlers[event]=handler;};
      return Script;
    }};
  });
  await page.addScriptTag({url:'http://127.0.0.1:'+port+'/playcanvas/multihistoria.js'});
  await page.evaluate(()=>{
    const instance=new window.Multihistoria();
    instance.app={assets:{find(name){
      window.__pcAssetLookups.push(name);
      return {getFileUrl(){return '/web/assets/cutscenes/'+name;}};
    }}};
    window.__pcInstance=instance;
    instance.initialize();
  });

  await page.waitForFunction(()=>Boolean(document.querySelector('#multihistoria-game')?.shadowRoot?.querySelector('.mh')),null,{timeout:30000});
  await page.waitForFunction(()=>document.querySelector('#multihistoria-game')?.shadowRoot?.querySelector('main')?.getAttribute('aria-busy')==='false',null,{timeout:30000});

  async function click(label){
    await page.evaluate(label=>{
      const root=document.querySelector('#multihistoria-game').shadowRoot;
      const button=[...root.querySelectorAll('button')].find(b=>b.textContent.trim()===label);
      if(!button||button.disabled)throw new Error('Missing enabled button: '+label);
      button.click();
    },label);
    await page.waitForTimeout(100);
  }
  async function expectH1(id,h1){
    await page.waitForFunction(expected=>document.querySelector('#multihistoria-game')?.shadowRoot?.querySelector('main h1')?.textContent.trim()===expected,h1,{timeout:10000});
    report.surfaces.push({id,h1,pass:true});
  }

  const prologueOpen=await page.evaluate(()=>Boolean(document.querySelector('#multihistoria-game').shadowRoot.querySelector('dialog.prologue-dialog[open]')));
  if(prologueOpen){
    await click('Saltar prólogo');
    await page.waitForTimeout(100);
  }
  const homeH1=await page.evaluate(()=>document.querySelector('#multihistoria-game').shadowRoot.querySelector('main h1')?.textContent.trim()??'');
  assert.equal(homeH1,'Jugador');
  report.surfaces.push({id:'home',h1:homeH1,pass:true});

  for(const [label,id,h1] of [
    ['Carrera','career','Tu carrera.'],
    ['Mundo','world','El mundo sigue.'],
    ['Relaciones','relations','Las personas de tu historia.'],
    ['Perfil','profile','Tu perfil.'],
    ['Tu partida','save','Tu partida.']
  ]){
    await click(label); await expectH1(id,h1);
  }

  await click('Carrera');
  await click('Gestionar mi carrera');
  await expectH1('player-actions','¿Qué quieres hacer?');

  await click('Inicio');
  const simulate=await page.evaluate(()=>{
    const root=document.querySelector('#multihistoria-game').shadowRoot;
    return [...root.querySelectorAll('button')].map(b=>b.textContent.trim()).find(t=>t.startsWith('Simular'))??null;
  });
  assert.ok(simulate,'Home simulate CTA missing');
  await click(simulate);
  await page.waitForFunction(()=>{
    const root=document.querySelector('#multihistoria-game')?.shadowRoot;
    return Boolean(root?.querySelector('.decision-sheet,.offer-sheet,.period-summary'));
  },null,{timeout:45000});
  const interruption=await page.evaluate(()=>{
    const root=document.querySelector('#multihistoria-game').shadowRoot;
    if(root.querySelector('.decision-sheet'))return 'decision';
    if(root.querySelector('.offer-sheet'))return 'offer';
    if(root.querySelector('.period-summary'))return 'summary';
    return 'unknown';
  });
  assert.notEqual(interruption,'unknown');
  report.surfaces.push({id:'auto-interruption',state:interruption,pass:true});

  report.assetLookups=await page.evaluate(()=>[...window.__pcAssetLookups]);
  assert.ok(report.assetLookups.includes('prologo_multihistoria_v3.webm'),'PlayCanvas app asset resolver did not receive the prologue');
  assert.equal(report.pageErrors.length,0,'Generated PlayCanvas adapter emitted page errors');
  report.passed=true;
  await context.close();
}finally{
  await browser.close();
  server.close();
}
fs.writeFileSync(path.join(outDir,'playcanvas-adapter-browser.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({passed:report.passed,surfaces:report.surfaces,assetLookups:report.assetLookups,pageErrors:report.pageErrors}));
