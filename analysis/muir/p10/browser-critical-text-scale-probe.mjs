import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const root=path.resolve(import.meta.dirname,'../../..');
const outDir=path.join(root,'analysis','muir','p10','evidence');
fs.mkdirSync(outDir,{recursive:true});
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

const scenarios=[
  {fixture:'home-normal',surface:'.p3-home',required:['Simular','Gestionar mi carrera']},
  {fixture:'auto-running',surface:'.mh',required:['SIMULANDO','Pausar']}
];
const scales=[1,1.3,1.8];
const records=[];
const browser=await chromium.launch({headless:true});
try{
  for(const scenario of scenarios){
    for(const scale of scales){
      const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
      const page=await context.newPage();
      try{
        await page.goto(`http://127.0.0.1:${port}/analysis/muir/ui-fixtures/index.html?fixture=${scenario.fixture}&viewport=phone-primary`,{waitUntil:'networkidle',timeout:30000});
        await page.waitForFunction(()=>globalThis.__MUIR_READY__?.ready===true,null,{timeout:30000});
        const metric=await page.evaluate(({surface,scale,required})=>{
          const root=document.querySelector('#game').shadowRoot;
          const target=root.querySelector(surface);
          if(!target)throw Error('missing surface '+surface);
          if(scale!==1){
            for(const node of [target,...target.querySelectorAll('*')]){
              const size=parseFloat(getComputedStyle(node).fontSize);
              if(Number.isFinite(size)&&size>0)node.style.fontSize=(size*scale)+'px';
            }
          }
          const nodes=[target,...target.querySelectorAll('*')];
          const overflow=nodes.filter(n=>n.scrollWidth>n.clientWidth+1).slice(0,30).map(n=>({tag:n.tagName,className:String(n.className),text:(n.textContent||'').trim().slice(0,80),clientWidth:n.clientWidth,scrollWidth:n.scrollWidth}));
          const text=target.innerText;
          const actions=[...target.querySelectorAll('button:not(:disabled)')].map(b=>{const r=b.getBoundingClientRect();return {text:b.textContent.trim(),height:r.height,width:r.width,visible:r.width>0&&r.height>0};});
          return {overflow,text,actions,requiredPresent:required.map(s=>({text:s,present:text.includes(s)})),reducedMotion:matchMedia('(prefers-reduced-motion: reduce)').matches};
        },{surface:scenario.surface,scale,required:scenario.required});
        assert.deepEqual(metric.overflow,[],scenario.fixture+' '+scale+' horizontal overflow: '+JSON.stringify(metric.overflow));
        for(const req of metric.requiredPresent)assert.equal(req.present,true,scenario.fixture+' '+scale+' required text/action missing: '+req.text);
        for(const action of metric.actions)assert.equal(action.visible,true,scenario.fixture+' '+scale+' hidden action: '+action.text);
        const critical=metric.actions.filter(x=>/Simular|Gestionar mi carrera|Pausar/.test(x.text));
        for(const action of critical)assert(action.height>=48,scenario.fixture+' '+scale+' critical target below 48px: '+JSON.stringify(action));
        assert.equal(metric.reducedMotion,true,scenario.fixture+' '+scale+' reduced motion not active');
        records.push({fixture:scenario.fixture,scale,textScale:Math.round(scale*100)+'%',metric:{...metric,text:undefined}});
      }finally{await context.close();}
    }
  }
}finally{
  await browser.close();
  server.close();
}
const evidence={gate:'PASS',viewport:'390x844',textScales:['100%','130%','180%'],surfaces:['Home','Auto-sim'],records};
fs.writeFileSync(path.join(outDir,'p10-critical-text-scale.json'),JSON.stringify(evidence,null,2)+'\n');
console.log(JSON.stringify({gate:evidence.gate,viewport:evidence.viewport,textScales:evidence.textScales,surfaces:evidence.surfaces}));
