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
const rows=[];
const viewportCases=[
  {id:'phone-360',width:360,height:800,ctaTolerance:28},
  {id:'phone-primary',width:390,height:844,ctaTolerance:0},
  {id:'phone-412',width:412,height:915,ctaTolerance:0}
];

async function openFixture(page,fixture,viewport){
  const url=`http://127.0.0.1:${port}/analysis/muir/ui-fixtures/index.html?fixture=${fixture}&viewport=${viewport.id}`;
  await page.goto(url,{waitUntil:'networkidle',timeout:30000});
  await page.waitForFunction(()=>globalThis.__MUIR_READY__?.ready===true,null,{timeout:30000});
}
async function clickShadowButton(page,label){
  await page.evaluate(label=>{
    const root=document.querySelector('#game').shadowRoot;
    const button=[...root.querySelectorAll('button')].find(b=>b.textContent.trim()===label);
    if(!button||button.disabled)throw Error('Missing enabled button: '+label);
    button.click();
  },label);
  await page.waitForTimeout(80);
}
async function homeMetrics(page){
  return page.evaluate(()=>{
    const root=document.querySelector('#game').shadowRoot;
    const rect=n=>{const r=n.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom};};
    const main=root.querySelector('main');
    const nav=root.querySelector('.navigation');
    const grid=root.querySelector('.p3-home');
    const hero=root.querySelector('.home-hero');
    const name=root.querySelector('.home-hero .player-name');
    const next=root.querySelector('.p3-home .next');
    const cta=next?.querySelector('.primary');
    const secondary=[...next?.querySelectorAll('button')??[]].find(b=>b.textContent.trim()==='Gestionar mi carrera');
    const copy=[...hero?.querySelectorAll('.hero-copy p')??[]].map(n=>n.textContent.trim());
    const children=[...grid?.children??[]].map(n=>({tag:n.tagName,className:n.className,title:n.querySelector('h2')?.textContent.trim()??null}));
    const overflow=[...root.querySelectorAll('*')].filter(n=>n.scrollWidth>n.clientWidth+1).slice(0,20).map(n=>({tag:n.tagName,className:n.className,clientWidth:n.clientWidth,scrollWidth:n.scrollWidth,text:n.textContent.trim().slice(0,80)}));
    return {
      main:rect(main),nav:rect(nav),gridClass:grid?.className??null,hero:rect(hero),name:{text:name?.textContent.trim()??'',scrollWidth:name?.scrollWidth??0,clientWidth:name?.clientWidth??0,...rect(name)},
      next:rect(next),cta:{text:cta?.textContent.trim()??'',...rect(cta)},secondary:secondary?{text:secondary.textContent.trim(),className:secondary.className,...rect(secondary)}:null,
      context:copy,children,overflow
    };
  });
}

try{
  for(const viewport of viewportCases){
    const context=await browser.newContext({viewport:{width:viewport.width,height:viewport.height},reducedMotion:'reduce'});
    const page=await context.newPage();
    try{
      await openFixture(page,'home-normal',viewport);
      let m=await homeMetrics(page);
      assert(m.name.text.length>=2,viewport.id+' missing dynamic player identity');
      assert(!/Una vida|Mil decisiones/.test(m.name.text),viewport.id+' still uses generic hero title');
      assert(m.context.length>=2,viewport.id+' missing position/age/club context');
      assert(m.cta.text.startsWith('Simular'),viewport.id+' normal core CTA is not Simular');
      assert(m.cta.bottom<=m.nav.y+viewport.ctaTolerance,viewport.id+' primary CTA is not visible before the bottom navigation: '+JSON.stringify({cta:m.cta,nav:m.nav,main:m.main}));
      assert(m.cta.height>=48,viewport.id+' primary CTA below 48px');
      assert(m.secondary&&m.secondary.className.includes('secondary'),viewport.id+' Player Actions access is not secondary/optional');
      assert.deepEqual(m.overflow,[],viewport.id+' horizontal overflow before long-name edit: '+JSON.stringify(m.overflow));

      await clickShadowButton(page,'Perfil');
      await page.waitForFunction(()=>document.querySelector('#game').shadowRoot.querySelector('h1')?.textContent.includes('Tu perfil'));
      const longName='Maximiliano Fernández-Ruiz Pérez';
      await page.evaluate(value=>{
        const root=document.querySelector('#game').shadowRoot;
        const input=root.querySelector('input[aria-describedby="mh-player-name-help"]');
        if(!input)throw Error('Identity input missing');
        input.value=value;
      },longName);
      await clickShadowButton(page,'Guardar nombre');
      await page.waitForFunction(value=>document.querySelector('#game').shadowRoot.querySelector('input[aria-describedby="mh-player-name-help"]')?.value===value,longName);
      await clickShadowButton(page,'Inicio');
      await page.waitForFunction(()=>Boolean(document.querySelector('#game').shadowRoot.querySelector('.p3-home')));
      m=await homeMetrics(page);
      assert.equal(m.name.text,longName,viewport.id+' Home did not consume PlayerView identity after real edit');
      assert(m.name.scrollWidth<=m.name.clientWidth+1,viewport.id+' long player name overflows its heading');
      assert(m.name.bottom<=m.hero.bottom+.5,viewport.id+' long player name escapes hero');
      assert.deepEqual(m.overflow,[],viewport.id+' horizontal overflow after long-name edit: '+JSON.stringify(m.overflow));
      rows.push({fixture:'home-normal-long-name',viewport:viewport.id,...m});
    }finally{
      await context.close();
    }
  }

  for(const fixture of ['home-pending-decision','home-offer']){
    const viewport=viewportCases[1];
    const context=await browser.newContext({viewport:{width:viewport.width,height:viewport.height},reducedMotion:'reduce'});
    const page=await context.newPage();
    try{
      await openFixture(page,fixture,viewport);
      const m=await homeMetrics(page);
      assert(m.gridClass.includes('has-pending'),fixture+' must mark pending priority');
      assert(m.children[0]?.className.includes('next'),fixture+' pending action must be first Home block');
      assert(m.cta.bottom<=m.nav.y,fixture+' pending CTA must be fully visible before the bottom navigation');
      if(fixture==='home-pending-decision')assert.equal(m.cta.text,'Una decisión te espera');
      if(fixture==='home-offer')assert.equal(m.cta.text,'Revisar oferta');
      assert.deepEqual(m.overflow,[],fixture+' horizontal overflow: '+JSON.stringify(m.overflow));
      rows.push({fixture,viewport:viewport.id,...m});
    }finally{
      await context.close();
    }
  }
}finally{
  await browser.close();
  server.close();
}

const report={gate:'PASS',cases:rows.length,rows};
const evidenceDir=path.join(root,'analysis','muir','p3','evidence');
fs.mkdirSync(evidenceDir,{recursive:true});
fs.writeFileSync(path.join(evidenceDir,'home-core-loop.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report));
