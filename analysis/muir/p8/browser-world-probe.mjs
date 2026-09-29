import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const rootDir=path.resolve(import.meta.dirname,'../../..');
const axePath=path.join(rootDir,'node_modules','axe-core','axe.min.js');
assert(fs.existsSync(axePath),'axe-core is not installed');
const outDir=path.join(rootDir,'analysis','muir','p8','screenshots');
const evidenceDir=path.join(rootDir,'analysis','muir','p8','evidence');
fs.mkdirSync(outDir,{recursive:true});fs.mkdirSync(evidenceDir,{recursive:true});

const viewports=[
  {id:'phone-360',width:360,height:800},
  {id:'phone-primary',width:390,height:844},
  {id:'phone-412',width:412,height:915},
  {id:'tablet',width:768,height:1024},
  {id:'landscape',width:844,height:390}
];
const scenarios=['world-empty','world-one','world-long','world-many'];
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml','.webm':'video/webm'};
const server=http.createServer((req,res)=>{
  try{
    const url=new URL(req.url,'http://127.0.0.1'),rel=decodeURIComponent(url.pathname).replace(/^\/+/, '')||'analysis/muir/p8/world.html';
    const file=path.resolve(rootDir,rel);
    if(!file.startsWith(rootDir+path.sep)&&file!==rootDir){res.writeHead(403);res.end('forbidden');return;}
    if(!fs.existsSync(file)||fs.statSync(file).isDirectory()){res.writeHead(404);res.end('not found');return;}
    res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');fs.createReadStream(file).pipe(res);
  }catch(error){res.writeHead(500);res.end(String(error));}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const browser=await chromium.launch({headless:true});
const records=[];
const rawId=/\b(?:NPC|PLR|EVT|CEVT|OFFER)_[A-Z0-9_]+\b/;
const forbidden=/clasificaci[oó]n|standings|mercado global|pr[oó]ximo partido|resultados dedicados/i;

async function open(page,scenario){
  await page.goto('http://127.0.0.1:'+server.address().port+'/analysis/muir/p8/world.html?scenario='+encodeURIComponent(scenario),{waitUntil:'networkidle',timeout:30000});
  await page.waitForFunction(()=>globalThis.__P8_WORLD_READY__?.ready===true,null,{timeout:30000});
  await page.addScriptTag({path:axePath});
}
async function inspect(page,scale=1){
  return page.evaluate(async scale=>{
    const root=globalThis.__P8_WORLD_ROOT__,main=root.querySelector('main');
    if(scale!==1){
      for(const node of [main,...main.querySelectorAll('*')]){
        const size=parseFloat(getComputedStyle(node).fontSize);
        if(Number.isFinite(size)&&size>0)node.style.fontSize=(size*scale)+'px';
      }
    }
    const nodes=[main,...main.querySelectorAll('*')];
    const overflow=nodes.filter(n=>n.scrollWidth>n.clientWidth+1).slice(0,40).map(n=>({tag:n.tagName,className:String(n.className),text:(n.textContent||'').trim().slice(0,100),clientWidth:n.clientWidth,scrollWidth:n.scrollWidth}));
    const axeResult=await axe.run(main,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']},resultTypes:['violations']});
    return {
      text:main.innerText,
      h1:main.querySelector('h1')?.textContent.trim()??'',
      cards:[...main.querySelectorAll('.news-card')].map(n=>({tag:n.tagName,text:n.textContent.trim(),tabIndex:n.tabIndex})),
      overflow,
      serious:axeResult.violations.filter(v=>v.impact==='serious'||v.impact==='critical').map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.length})),
      banner:main.querySelectorAll('.world-banner').length,
      feed:main.querySelectorAll('.world-feed').length,
      labelled:main.querySelector('.world-feed')?.getAttribute('aria-labelledby')??'',
      labelText:main.querySelector('#world-news-title')?.textContent.trim()??'',
      mainTabIndex:main.tabIndex,
      scrollHeight:main.scrollHeight,
      clientHeight:main.clientHeight
    };
  },scale);
}
function assertScenario(scenario,m){
  assert.equal(m.h1,'El mundo sigue.',scenario+' heading');
  assert.equal(m.mainTabIndex,0,scenario+' main not keyboard focusable');
  assert.equal(m.banner,0,scenario+' retained decorative world banner');
  assert.equal(m.feed,1,scenario+' missing factual feed');
  assert.equal(m.labelled,'world-news-title',scenario+' feed labelling');
  assert.equal(m.labelText,'Noticias',scenario+' feed heading');
  assert.deepEqual(m.overflow,[],scenario+' horizontal overflow');
  assert.deepEqual(m.serious,[],scenario+' serious/critical AXE');
  assert.ok(!rawId.test(m.text),scenario+' leaked internal ID');
  assert.ok(!forbidden.test(m.text),scenario+' exposed forbidden/fictitious Mundo surface');
  for(const card of m.cards){assert.equal(card.tag,'ARTICLE');assert.notEqual(card.tabIndex,0,scenario+' news card became clickable/focus target');}
  if(scenario==='world-empty'){
    assert.equal(m.cards.length,0);assert.match(m.text,/No hay noticias destacadas esta semana/);
  }
  if(scenario==='world-one'){assert.equal(m.cards.length,1);assert.match(m.text,/El club completa la sesión del día/);}
  if(scenario==='world-long'){assert.equal(m.cards.length,1);assert.match(m.text,/Málaga, São Paulo y Mönchengladbach/);}
  if(scenario==='world-many'){
    assert.equal(m.cards.length,80,'long Mundo list was truncated');
    assert.match(m.cards[0].text,/Noticia pública 80/,'newest item should render first');
  }
}

try{
  for(const viewport of viewports){
    for(const scenario of scenarios){
      const context=await browser.newContext({viewport:{width:viewport.width,height:viewport.height},reducedMotion:'reduce'});
      const page=await context.newPage();
      try{
        await open(page,scenario);
        const metric=await inspect(page,1);
        assertScenario(scenario,metric);
        const png=await page.screenshot({fullPage:false,type:'png'});
        const hash=crypto.createHash('sha256').update(png).digest('hex');
        const file='p8-world__'+scenario+'__'+viewport.width+'x'+viewport.height+'__'+hash.slice(0,12)+'.png';
        fs.writeFileSync(path.join(outDir,file),png);
        records.push({scenario,viewport:viewport.id,width:viewport.width,height:viewport.height,scale:1,screenshot:'analysis/muir/p8/screenshots/'+file,sha256:hash,metric});
      }finally{await context.close();}
    }
  }
  for(const scale of [1.3,1.8]){
    for(const scenario of ['world-long','world-many']){
      const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
      const page=await context.newPage();
      try{await open(page,scenario);const metric=await inspect(page,scale);assertScenario(scenario,metric);records.push({scenario,viewport:'phone-primary',width:390,height:844,scale,metric});}
      finally{await context.close();}
    }
  }
}finally{await browser.close();server.close();}

const evidence={
  schema:'muir-p8-world-v1',
  gate:'PASS',
  scenarios,
  viewports:viewports.map(v=>v.id),
  captures:records.filter(r=>r.screenshot).length,
  textScales:['100%','130%','180%'],
  newsCardReused:true,
  internalIdsVisible:0,
  inventedStandings:0,
  inventedMarket:0,
  horizontalOverflowFindings:0,
  axeSeriousCritical:0,
  records
};
fs.writeFileSync(path.join(evidenceDir,'p8-world.json'),JSON.stringify(evidence,null,2)+'\n');
console.log(JSON.stringify({gate:evidence.gate,captures:evidence.captures,scenarios:evidence.scenarios,viewports:evidence.viewports,textScales:evidence.textScales}));
