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

const cases=[
  {id:'phone-360-safe',viewport:'phone-360',width:360,height:800,insets:{top:44,right:0,bottom:34,left:0},base:6},
  {id:'phone-390-safe',viewport:'phone-primary',width:390,height:844,insets:{top:44,right:0,bottom:34,left:0},base:6},
  {id:'phone-412-safe',viewport:'phone-412',width:412,height:915,insets:{top:47,right:0,bottom:34,left:0},base:8},
  {id:'landscape-safe',viewport:'landscape-check',width:844,height:390,insets:{top:0,right:44,bottom:21,left:44},base:12},
  {id:'tablet-safe',viewport:'tablet-check',width:768,height:1024,insets:{top:24,right:0,bottom:20,left:0},base:8}
];

const browser=await chromium.launch({headless:true});
const results=[];
try{
  for(const c of cases){
    const context=await browser.newContext({viewport:{width:c.width,height:c.height},reducedMotion:'reduce'});
    const page=await context.newPage();
    const url=`http://127.0.0.1:${port}/analysis/muir/ui-fixtures/index.html?fixture=home-normal&viewport=${encodeURIComponent(c.viewport)}`;
    try{
      await page.goto(url,{waitUntil:'networkidle',timeout:30000});
      await page.waitForFunction(()=>globalThis.__MUIR_READY__?.ready===true,null,{timeout:30000});
      const metrics=await page.evaluate(({insets})=>{
        const host=document.querySelector('#game');
        host.style.setProperty('--muir-safe-top',insets.top+'px');
        host.style.setProperty('--muir-safe-right',insets.right+'px');
        host.style.setProperty('--muir-safe-bottom',insets.bottom+'px');
        host.style.setProperty('--muir-safe-left',insets.left+'px');
        const root=host.shadowRoot;
        const mh=root.querySelector('.mh');
        const topbar=root.querySelector('.topbar');
        const nav=root.querySelector('.navigation');
        const date=root.querySelector('.date-button');
        const buttons=[...root.querySelectorAll('.nav-button')];
        const rect=n=>{const r=n.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom};};
        const style=n=>getComputedStyle(n);
        const overflow=[...root.querySelectorAll('*')].filter(n=>n.scrollWidth>n.clientWidth+1).slice(0,20).map(n=>({tag:n.tagName,className:n.className,clientWidth:n.clientWidth,scrollWidth:n.scrollWidth}));
        return {
          padding:{top:parseFloat(style(mh).paddingTop),right:parseFloat(style(mh).paddingRight),bottom:parseFloat(style(mh).paddingBottom),left:parseFloat(style(mh).paddingLeft)},
          topbar:rect(topbar),
          nav:rect(nav),
          date:rect(date),
          navButtons:buttons.map(b=>({text:b.textContent.trim(),...rect(b),fontSize:parseFloat(style(b).fontSize)})),
          overflow
        };
      },{insets:c.insets});

      assert.equal(metrics.padding.top,c.base+c.insets.top,c.id+' top padding');
      assert.equal(metrics.padding.right,c.base+c.insets.right,c.id+' right padding');
      assert.equal(metrics.padding.bottom,c.base+c.insets.bottom,c.id+' bottom padding');
      assert.equal(metrics.padding.left,c.base+c.insets.left,c.id+' left padding');
      assert(metrics.topbar.y>=c.base+c.insets.top-.5,c.id+' topbar intrudes top safe-area');
      assert(metrics.topbar.right<=c.width-(c.base+c.insets.right)+.5,c.id+' topbar intrudes right safe-area');
      assert(metrics.date.height>=48,c.id+' Tu partida control below 48px');
      assert.equal(metrics.navButtons.length,6,c.id+' must expose six direct destinations');
      for(const b of metrics.navButtons){
        assert(b.height>=48,c.id+' nav target below 48px: '+b.text);
        assert(b.fontSize>=10,c.id+' nav label below 10px: '+b.text);
      }
      if(c.width<=820){
        assert(metrics.nav.bottom<=c.height-(c.base+c.insets.bottom)+.5,c.id+' bottom nav intrudes bottom safe-area');
        assert(metrics.nav.x>=c.base+c.insets.left-.5,c.id+' bottom nav intrudes left safe-area');
      }else{
        assert(metrics.nav.x>=c.base+c.insets.left-.5,c.id+' side nav intrudes left safe-area');
      }
      assert.deepEqual(metrics.overflow,[],c.id+' horizontal overflow: '+JSON.stringify(metrics.overflow));
      results.push({id:c.id,pass:true,metrics});
    }finally{
      await context.close();
    }
  }
}finally{
  await browser.close();
  server.close();
}

console.log(JSON.stringify({gate:'PASS',cases:results.length,results}));
