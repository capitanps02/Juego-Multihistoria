import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const root=path.resolve(import.meta.dirname,'../../..');
const axePath=path.join(root,'node_modules','axe-core','axe.min.js');
assert(fs.existsSync(axePath),'axe-core is not installed');
const outDir=path.join(root,'analysis','muir','p8','screenshots');
const evidenceDir=path.join(root,'analysis','muir','p8','evidence');
fs.mkdirSync(outDir,{recursive:true});fs.mkdirSync(evidenceDir,{recursive:true});

const viewports=[
  {id:'phone-360',width:360,height:800},
  {id:'phone-primary',width:390,height:844},
  {id:'phone-412',width:412,height:915},
  {id:'tablet',width:768,height:1024},
  {id:'landscape',width:844,height:390}
];
const fixtures=[
  {id:'career',h1:'Tu carrera.'},
  {id:'world',h1:'El mundo sigue.'},
  {id:'relations',h1:'Las personas de tu historia.'},
  {id:'profile',h1:'Tu perfil.'},
  {id:'save',h1:'Tu partida.'}
];
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

const browser=await chromium.launch({headless:true});
const records=[];
try{
  for(const viewport of viewports){
    for(const fixture of fixtures){
      const context=await browser.newContext({viewport:{width:viewport.width,height:viewport.height},reducedMotion:'reduce'});
      const page=await context.newPage();
      try{
        const url='http://127.0.0.1:'+server.address().port+'/analysis/muir/ui-fixtures/index.html?fixture='+encodeURIComponent(fixture.id)+'&viewport='+encodeURIComponent(viewport.id==='tablet'?'tablet-check':viewport.id==='landscape'?'landscape-check':viewport.id);
        await page.goto(url,{waitUntil:'networkidle',timeout:30000});
        await page.waitForFunction(()=>globalThis.__MUIR_READY__?.ready===true,null,{timeout:30000});
        await page.addScriptTag({path:axePath});
        const metric=await page.evaluate(async()=>{
          const root=document.querySelector('#game')?.shadowRoot;
          const main=root?.querySelector('main');
          const nodes=main?[main,...main.querySelectorAll('*')]:[];
          const overflow=nodes.filter(n=>n.scrollWidth>n.clientWidth+1).slice(0,25).map(n=>({tag:n.tagName,className:String(n.className),text:(n.textContent||'').trim().slice(0,100),clientWidth:n.clientWidth,scrollWidth:n.scrollWidth}));
          const axeResult=main?await axe.run(main,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']},resultTypes:['violations']}):{violations:[]};
          const visible=(main?.innerText||'').trim();
          return {
            h1:main?.querySelector('h1')?.textContent?.trim()||'',
            visible,
            overflow,
            serious:axeResult.violations.filter(v=>v.impact==='serious'||v.impact==='critical').map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.length})),
            mainTabIndex:main?.tabIndex??null,
            scrollHeight:main?.scrollHeight??0,
            clientHeight:main?.clientHeight??0,
            panelCount:main?.querySelectorAll('.panel').length??0,
            articleCount:main?.querySelectorAll('article').length??0
          };
        });
        assert.equal(metric.h1,fixture.h1,fixture.id+' heading');
        assert.equal(metric.mainTabIndex,0,fixture.id+' main landmark must be keyboard focusable');
        assert.deepEqual(metric.overflow,[],viewport.id+'/'+fixture.id+' horizontal overflow');
        assert.deepEqual(metric.serious,[],viewport.id+'/'+fixture.id+' serious/critical AXE');
        assert.doesNotMatch(metric.visible,/\b(?:NPC|PLR|EVT|OFFER|match|offer)_[A-Z0-9_]+\b/,'visible internal id');
        const png=await page.screenshot({fullPage:false,type:'png'});
        const hash=crypto.createHash('sha256').update(png).digest('hex');
        const file='p8-baseline__'+fixture.id+'__'+viewport.width+'x'+viewport.height+'__'+hash.slice(0,12)+'.png';
        fs.writeFileSync(path.join(outDir,file),png);
        records.push({fixture:fixture.id,viewport:viewport.id,width:viewport.width,height:viewport.height,screenshot:'analysis/muir/p8/screenshots/'+file,sha256:hash,metric});
      }finally{await context.close();}
    }
  }
}finally{await browser.close();server.close();}

const evidence={
  schema:'muir-p8-baseline-v1',
  predecessor:'3f93206903441029d692eaa76def890ddc7a0cc0',
  gate:'PASS',
  surfaces:fixtures.map(x=>x.id),
  viewports:viewports.map(x=>x.id),
  captures:records.length,
  internalIdsVisible:0,
  axeSeriousCritical:0,
  horizontalOverflowFindings:0,
  records
};
fs.writeFileSync(path.join(evidenceDir,'p8-baseline.json'),JSON.stringify(evidence,null,2)+'\n');
console.log(JSON.stringify({gate:evidence.gate,captures:evidence.captures,surfaces:evidence.surfaces,viewports:evidence.viewports}));
