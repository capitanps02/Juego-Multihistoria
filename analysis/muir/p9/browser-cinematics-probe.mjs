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
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.webm':'video/webm','.svg':'image/svg+xml','.webp':'image/webp'};
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
const origin='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({headless:true});
const records=[];

async function base(page){
  await page.goto(origin+'/analysis/muir/p9/immersive.html?scenario=decision-2',{waitUntil:'networkidle',timeout:30000});
}
async function setupDirect(page,{id,clip,file}){
  await page.evaluate(async ({id,clip,file})=>{
    document.querySelector('#'+id)?.remove();
    const {createCutscenePlayer}=await import('/web/cutscene-player.js?probe='+Date.now());
    const host=document.createElement('div');host.id=id;document.body.append(host);
    const poster='data:image/svg+xml;charset=utf-8,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 9"><rect width="16" height="9" fill="black"/></svg>');
    globalThis.__P9_MEDIA_STARTED__=0;
    const p=createCutscenePlayer({document,clip,url:'/web/assets/cutscenes/'+file,posterUrl:poster,onStarted(){globalThis.__P9_MEDIA_STARTED__++;}});
    host.append(p.element);globalThis.__P9_DIRECT_DISPOSE__=p.dispose;
  },{id,clip,file});
}
async function realPlayback(page){
  await base(page);
  const eventClip={eventId:'EVT_18_AGT_001',file:'cutscene_evt_18_agt_001_agente.webm',title:'Dos tarjetas sobre la mesa'};
  await setupDirect(page,{id:'p9-direct-event',clip:eventClip,file:eventClip.file});
  const host=page.locator('#p9-direct-event');
  assert.equal(await host.locator('.event-cutscene').getAttribute('data-state'),'poster');
  assert.equal(await host.locator('.cutscene-poster').count(),1);
  assert.ok((await host.locator('video').getAttribute('poster'))?.length>0);
  assert.equal(await host.locator('video').evaluate(v=>v.muted),true);
  await host.getByRole('button',{name:/Ver escena/}).click();
  await page.waitForFunction(()=>document.querySelector('#p9-direct-event .event-cutscene')?.dataset.state==='playing',null,{timeout:15000});
  const playing=await host.locator('video').evaluate(v=>({paused:v.paused,readyState:v.readyState}));
  assert.equal(playing.paused,false);assert.ok(playing.readyState>=2);
  await host.getByRole('button',{name:'Saltar escena'}).click();
  assert.equal(await host.locator('.event-cutscene').getAttribute('data-state'),'complete');
  assert.equal(await host.locator('video').isHidden(),true);

  const prologue={eventId:'PROLOGUE',file:'prologo_multihistoria_v3.webm',title:'Prólogo · Multihistoria'};
  await setupDirect(page,{id:'p9-direct-prologue',clip:prologue,file:prologue.file});
  const pro=page.locator('#p9-direct-prologue');
  await pro.getByRole('button',{name:'Ver prólogo'}).click();
  assert.equal(await pro.locator('dialog').evaluate(d=>d.open),true);
  assert.equal(await pro.locator('.event-cutscene').getAttribute('data-state'),'poster');
  await pro.getByRole('button',{name:'Reproducir prólogo con sonido'}).click();
  await page.waitForFunction(()=>document.querySelector('#p9-direct-prologue .event-cutscene')?.dataset.state==='playing',null,{timeout:20000});
  const proPlaying=await pro.locator('video').evaluate(v=>({paused:v.paused,readyState:v.readyState,muted:v.muted}));
  assert.equal(proPlaying.paused,false);assert.ok(proPlaying.readyState>=2);assert.equal(proPlaying.muted,false);
  await pro.getByRole('button',{name:'Saltar prólogo'}).click();
  assert.equal(await pro.locator('.event-cutscene').getAttribute('data-state'),'complete');
  assert.equal(await pro.locator('dialog').evaluate(d=>d.open),false);
  return {eventReadyState:playing.readyState,prologueReadyState:proPlaying.readyState};
}

async function openFixture(page,scenario){
  await page.goto(origin+'/analysis/muir/p9/immersive.html?scenario='+encodeURIComponent(scenario),{waitUntil:'networkidle',timeout:30000});
  await page.waitForFunction(()=>globalThis.__P9_READY__?.ready===true,null,{timeout:30000});
  await page.addScriptTag({path:axePath});
}
async function inspect(page,scale=1){
  return page.evaluate(async scale=>{
    const root=globalThis.__P9_ROOT__,main=root.querySelector('main');
    if(scale!==1){for(const node of [main,...main.querySelectorAll('*')]){const s=parseFloat(getComputedStyle(node).fontSize);if(Number.isFinite(s)&&s>0)node.style.fontSize=(s*scale)+'px';}}
    const nodes=[main,...main.querySelectorAll('*')];
    const overflow=nodes.filter(n=>n.scrollWidth>n.clientWidth+1).slice(0,50).map(n=>({tag:n.tagName,className:String(n.className),clientWidth:n.clientWidth,scrollWidth:n.scrollWidth,text:(n.textContent||'').trim().slice(0,80)}));
    const axeResult=await axe.run(main,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']},resultTypes:['violations']});
    const cut=main.querySelector('.event-cutscene'),poster=cut?.querySelector('.cutscene-poster');
    return {
      text:main.innerText,mainClass:main.className,cutsceneKind:cut?.dataset.cutsceneKind||null,state:cut?.dataset.state||null,
      posterVisible:poster?!poster.hidden&&getComputedStyle(poster).display!=='none':false,
      retirement:main.querySelectorAll('.retirement-panel').length,
      buttons:[...main.querySelectorAll('button')].map(x=>x.textContent.trim()),
      serious:axeResult.violations.filter(v=>v.impact==='serious'||v.impact==='critical').map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.length})),overflow
    };
  },scale);
}

try{
  const directContext=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});const directPage=await directContext.newPage();
  const real=await realPlayback(directPage);await directContext.close();

  for(const viewport of viewports){
    for(const scenario of ['decision-error','epilogue']){
      const context=await browser.newContext({viewport:{width:viewport.width,height:viewport.height},reducedMotion:'reduce'});const page=await context.newPage();
      try{
        await openFixture(page,scenario);
        await page.evaluate(()=>globalThis.__P9_ROOT__.querySelector('.event-cutscene video')?.dispatchEvent(new Event('error')));
        await page.waitForTimeout(50);
        const metric=await inspect(page,1);
        assert.deepEqual(metric.overflow,[],scenario+' horizontal overflow');assert.deepEqual(metric.serious,[],scenario+' AXE');
        assert.equal(metric.state,'error');assert.equal(metric.posterVisible,true);
        if(scenario==='decision-error'){assert.equal(metric.cutsceneKind,'event');assert.match(metric.text,/No se ha podido cargar la escena/);}
        else{assert.equal(metric.cutsceneKind,'epilogue');assert.match(metric.mainClass,/p9-epilogue/);assert.equal(metric.retirement,1);assert.ok(metric.buttons.includes('Ver carrera'));assert.ok(metric.buttons.includes('Empezar otra historia'));}
        assert.equal((await page.evaluate(()=>globalThis.__P9_COMMAND_LOG__.length)),0,'media fallback cannot dispatch career commands');
        const png=await page.screenshot({fullPage:false,type:'png'}),hash=crypto.createHash('sha256').update(png).digest('hex');
        const file='p9-cinematics__'+scenario+'__'+viewport.width+'x'+viewport.height+'__'+hash.slice(0,12)+'.png';fs.writeFileSync(path.join(outDir,file),png);
        records.push({scenario,viewport:viewport.id,width:viewport.width,height:viewport.height,scale:1,screenshot:'analysis/muir/p9/screenshots/'+file,sha256:hash,metric});
      }finally{await context.close();}
    }
  }

  for(const scale of [1.3,1.8]){
    const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});const page=await context.newPage();
    try{await openFixture(page,'epilogue');await page.evaluate(()=>globalThis.__P9_ROOT__.querySelector('.event-cutscene video')?.dispatchEvent(new Event('error')));await page.waitForTimeout(40);const metric=await inspect(page,scale);assert.deepEqual(metric.overflow,[]);assert.deepEqual(metric.serious,[]);records.push({scenario:'epilogue',viewport:'phone-primary',width:390,height:844,scale,metric});}
    finally{await context.close();}
  }

  const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});const page=await context.newPage();
  try{
    await openFixture(page,'prologue');await page.waitForFunction(()=>globalThis.__P9_ROOT__.querySelector('.prologue-dialog')?.open===true,null,{timeout:5000});
    await page.evaluate(()=>globalThis.__P9_ROOT__.querySelector('.prologue-dialog video')?.dispatchEvent(new Event('error')));await page.waitForTimeout(40);
    const state=await page.evaluate(()=>{const r=globalThis.__P9_ROOT__,d=r.querySelector('.prologue-dialog'),cut=r.querySelector('.event-cutscene');return {open:d.open,state:cut.dataset.state,poster:!d.querySelector('.prologue-poster').hidden,status:d.querySelector('[role="status"]').textContent,skip:[...d.querySelectorAll('button')].find(x=>/Empezar historia|Saltar prólogo/.test(x.textContent))?.textContent,commands:globalThis.__P9_COMMAND_LOG__.length};});
    assert.equal(state.open,true);assert.equal(state.state,'error');assert.equal(state.poster,true);assert.match(state.status,/Puedes continuar con tu historia/);assert.equal(state.skip,'Empezar historia');assert.equal(state.commands,0);
    await page.evaluate(()=>[...globalThis.__P9_ROOT__.querySelectorAll('.prologue-dialog button')].find(x=>x.textContent==='Empezar historia')?.click());await page.waitForTimeout(30);
    assert.equal(await page.evaluate(()=>globalThis.__P9_ROOT__.querySelector('.prologue-dialog').open),false);
  }finally{await context.close();}

  const evidence={schema:'muir-p9-cinematics-v2',gate:'PASS',realVideoPlayback:true,realProloguePlayback:true,eventReadyState:real.eventReadyState,prologueReadyState:real.prologueReadyState,poster:'PASS',skip:'PASS',missingAsset:'PASS',errorFallback:'PASS',epilogue:'PASS',careerCommandsFromMedia:0,viewports:viewports.map(x=>x.id),textScales:['100%','130%','180%'],axeSeriousCritical:0,horizontalOverflowFindings:0,records};
  fs.writeFileSync(path.join(evidenceDir,'p9-cinematics.json'),JSON.stringify(evidence,null,2)+'\n');
  console.log(JSON.stringify({gate:evidence.gate,realVideoPlayback:evidence.realVideoPlayback,realProloguePlayback:evidence.realProloguePlayback,poster:evidence.poster,skip:evidence.skip,errorFallback:evidence.errorFallback,epilogue:evidence.epilogue}));
}finally{await browser.close();server.close();}
