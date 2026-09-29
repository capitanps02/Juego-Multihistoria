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
try{
  for(const viewport of [
    {id:'phone-360',width:360,height:800},
    {id:'phone-primary',width:390,height:844},
    {id:'phone-412',width:412,height:915}
  ]){
    for(const fixture of ['auto-running','auto-paused']){
      const context=await browser.newContext({viewport:{width:viewport.width,height:viewport.height},reducedMotion:'reduce'});
      const page=await context.newPage();
      try{
        const url=`http://127.0.0.1:${port}/analysis/muir/ui-fixtures/index.html?fixture=${fixture}&viewport=${viewport.id}`;
        await page.goto(url,{waitUntil:'networkidle',timeout:30000});
        await page.waitForFunction(()=>globalThis.__MUIR_READY__?.ready===true,null,{timeout:30000});
        const m=await page.evaluate(()=>{
          const root=document.querySelector('#game').shadowRoot;
          const rect=n=>{const r=n.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom};};
          const top=root.querySelector('.topbar');
          const brand=root.querySelector('.brand');
          const pause=root.querySelector('.pause-button');
          const date=root.querySelector('.date-button');
          const children=[brand,pause,date].filter(Boolean).map(n=>({className:n.className,text:n.textContent.trim(),...rect(n)}));
          const overflow=[...root.querySelectorAll('*')].filter(n=>n.scrollWidth>n.clientWidth+1).slice(0,20).map(n=>({tag:n.tagName,className:n.className,clientWidth:n.clientWidth,scrollWidth:n.scrollWidth}));
          return {topbar:rect(top),brand:rect(brand),pause:pause?rect(pause):null,date:rect(date),children,overflow};
        });
        assert(m.pause,fixture+' '+viewport.id+' missing pause/resume control');
        assert(m.pause.height>=48,fixture+' '+viewport.id+' pause/resume below 48px');
        assert(m.date.height>=48,fixture+' '+viewport.id+' Tu partida below 48px');
        assert(m.topbar.x>=0&&m.topbar.right<=viewport.width+.5,fixture+' '+viewport.id+' topbar outside viewport');
        for(const child of m.children){
          assert(child.x>=m.topbar.x-.5&&child.right<=m.topbar.right+.5,fixture+' '+viewport.id+' topbar child escapes: '+child.className);
        }
        const sorted=[...m.children].sort((a,b)=>a.x-b.x);
        for(let i=1;i<sorted.length;i++)assert(sorted[i].x>=sorted[i-1].right-.5,fixture+' '+viewport.id+' topbar overlap between '+sorted[i-1].className+' and '+sorted[i].className);
        assert.deepEqual(m.overflow,[],fixture+' '+viewport.id+' horizontal overflow: '+JSON.stringify(m.overflow));
        rows.push({fixture,viewport:viewport.id,...m});
      }finally{
        await context.close();
      }
    }
  }
}finally{
  await browser.close();
  server.close();
}
console.log(JSON.stringify({gate:'PASS',cases:rows.length,rows}));
