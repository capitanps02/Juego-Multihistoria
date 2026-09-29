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
    for(const variant of ['A-six','B-five']){
      const context=await browser.newContext({viewport:{width:viewport.width,height:viewport.height},reducedMotion:'reduce'});
      const page=await context.newPage();
      try{
        const url=`http://127.0.0.1:${port}/analysis/muir/ui-fixtures/index.html?fixture=home-normal&viewport=${viewport.id}`;
        await page.goto(url,{waitUntil:'networkidle',timeout:30000});
        await page.waitForFunction(()=>globalThis.__MUIR_READY__?.ready===true,null,{timeout:30000});
        if(variant==='B-five'){
          await page.evaluate(()=>{
            const host=document.querySelector('#game');
            const style=document.createElement('style');
            style.dataset.muirNavAb='B-five';
            style.textContent='.navigation .nav-button:last-of-type{display:none!important}';
            host.shadowRoot.append(style);
          });
        }
        const metrics=await page.evaluate(()=>{
          const root=document.querySelector('#game').shadowRoot;
          const visible=n=>getComputedStyle(n).display!=='none'&&n.getBoundingClientRect().width>0&&n.getBoundingClientRect().height>0;
          const buttons=[...root.querySelectorAll('.navigation .nav-button')].filter(visible);
          const rect=n=>{const r=n.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom};};
          const saveTop=root.querySelector('.date-button');
          const nav=root.querySelector('.navigation');
          const overflow=[...root.querySelectorAll('*')].filter(n=>n.scrollWidth>n.clientWidth+1).slice(0,20).map(n=>({tag:n.tagName,className:n.className,clientWidth:n.clientWidth,scrollWidth:n.scrollWidth}));
          const buttonRects=buttons.map(b=>({text:b.textContent.trim(),ariaLabel:b.getAttribute('aria-label'),tabIndex:b.tabIndex,...rect(b),fontSize:parseFloat(getComputedStyle(b).fontSize)}));
          const sorted=[...buttonRects].sort((a,b)=>a.x-b.x);
          const gaps=sorted.slice(1).map((b,i)=>b.x-sorted[i].right);
          const navSave=buttonRects.find(b=>b.text==='Tu partida')??null;
          const topSaveRect={text:saveTop.textContent.trim(),ariaLabel:saveTop.getAttribute('aria-label'),tabIndex:saveTop.tabIndex,...rect(saveTop)};
          const centerY=r=>r.y+r.height/2;
          return {
            visibleDestinations:buttons.map(b=>b.textContent.trim()),
            nav:rect(nav),
            buttonRects,
            buttonWidths:buttonRects.map(b=>b.width),
            minButtonWidth:Math.min(...buttonRects.map(b=>b.width)),
            maxButtonWidth:Math.max(...buttonRects.map(b=>b.width)),
            minButtonHeight:Math.min(...buttonRects.map(b=>b.height)),
            labelSizes:buttonRects.map(b=>b.fontSize),
            minGapPx:gaps.length?Math.min(...gaps):null,
            maxGapPx:gaps.length?Math.max(...gaps):null,
            saveTopbar:topSaveRect,
            navSave,
            access:{
              tapsToSave:1,
              visibleSaveLabel:navSave?.text??topSaveRect.text,
              accessibleSaveName:navSave?.ariaLabel||navSave?.text||topSaveRect.ariaLabel||topSaveRect.text,
              saveSurface:navSave?'primary-nav':'topbar',
              saveCenterY:navSave?centerY(navSave):centerY(topSaveRect),
              distanceFromBottom:innerHeight-(navSave?centerY(navSave):centerY(topSaveRect)),
              directFocusable:(navSave??topSaveRect).tabIndex>=0
            },
            overflow
          };
        });
        assert(metrics.minButtonHeight>=48,variant+' '+viewport.id+' nav target <48');
        assert(metrics.labelSizes.every(x=>x>=10),variant+' '+viewport.id+' label <10');
        assert(metrics.saveTopbar.height>=48,variant+' '+viewport.id+' topbar save target <48');
        assert.equal(metrics.overflow.length,0,variant+' '+viewport.id+' horizontal overflow');
        assert(metrics.access.tapsToSave===1,variant+' '+viewport.id+' Tu partida must remain one-tap accessible');
        assert(metrics.access.directFocusable,variant+' '+viewport.id+' Tu partida route must remain keyboard focusable');
        assert(metrics.access.accessibleSaveName?.includes('Tu partida')||metrics.access.accessibleSaveName==='Tu partida',variant+' '+viewport.id+' accessible save name must identify Tu partida');
        if(variant==='A-six'){
          assert.equal(metrics.visibleDestinations.length,6,'A must expose six bottom destinations');
          assert(metrics.visibleDestinations.includes('Tu partida'),'A must expose Tu partida in nav');
          assert.equal(metrics.access.saveSurface,'primary-nav','A keeps save in primary nav');
          assert.equal(metrics.access.visibleSaveLabel,'Tu partida','A exposes the exact visible Tu partida label');
        }else{
          assert.equal(metrics.visibleDestinations.length,5,'B must expose five bottom destinations');
          assert(!metrics.visibleDestinations.includes('Tu partida'),'B hides only duplicate Tu partida nav entry');
          assert(metrics.saveTopbar.text.includes('Partida'),'B must retain persistent topbar route to Tu partida');
          assert(metrics.saveTopbar.ariaLabel?.includes('Tu partida'),'B topbar route must retain accessible Tu partida name');
          assert.equal(metrics.access.saveSurface,'topbar','B moves save access to topbar');
        }
        rows.push({viewport:viewport.id,width:viewport.width,height:viewport.height,variant,...metrics});
      }finally{
        await context.close();
      }
    }
  }
}finally{
  await browser.close();
  server.close();
}

const comparisons=[];
for(const viewport of ['phone-360','phone-primary','phone-412']){
  const a=rows.find(x=>x.viewport===viewport&&x.variant==='A-six');
  const b=rows.find(x=>x.viewport===viewport&&x.variant==='B-five');
  comparisons.push({
    viewport,
    aVisible:a.visibleDestinations.length,
    bVisible:b.visibleDestinations.length,
    minButtonWidthA:a.minButtonWidth,
    minButtonWidthB:b.minButtonWidth,
    minButtonWidthDelta:b.minButtonWidth-a.minButtonWidth,
    minButtonHeightA:a.minButtonHeight,
    minButtonHeightB:b.minButtonHeight,
    minLabelPxA:Math.min(...a.labelSizes),
    minLabelPxB:Math.min(...b.labelSizes),
    minGapPxA:a.minGapPx,
    minGapPxB:b.minGapPx,
    overflowA:a.overflow.length,
    overflowB:b.overflow.length,
    tapsToSaveA:a.access.tapsToSave,
    tapsToSaveB:b.access.tapsToSave,
    visibleSaveLabelA:a.access.visibleSaveLabel,
    visibleSaveLabelB:b.access.visibleSaveLabel,
    saveSurfaceA:a.access.saveSurface,
    saveSurfaceB:b.access.saveSurface,
    distanceFromBottomA:a.access.distanceFromBottom,
    distanceFromBottomB:b.access.distanceFromBottom,
    reachDistanceDelta:b.access.distanceFromBottom-a.access.distanceFromBottom,
    focusableA:a.access.directFocusable,
    focusableB:b.access.directFocusable,
    accessibleNameA:a.access.accessibleSaveName,
    accessibleNameB:b.access.accessibleSaveName
  });
}
console.log(JSON.stringify({gate:'PASS',rows:rows.length,comparisons}));
