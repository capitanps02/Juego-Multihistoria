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
const scenarios=['offer-basic','offer-loan','offer-long-club','offer-partial'];
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.webm':'video/webm','.svg':'image/svg+xml'};
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
const browser=await chromium.launch({headless:true});
const records=[];

async function open(page,scenario){
  await page.goto('http://127.0.0.1:'+server.address().port+'/analysis/muir/p9/immersive.html?scenario='+encodeURIComponent(scenario),{waitUntil:'networkidle',timeout:30000});
  await page.waitForFunction(()=>globalThis.__P9_READY__?.ready===true,null,{timeout:30000});
  await page.addScriptTag({path:axePath});
}
async function inspect(page,scale=1){
  return page.evaluate(async scale=>{
    const root=globalThis.__P9_ROOT__,main=root.querySelector('main'),nav=root.querySelector('.navigation'),sheet=main.querySelector('.offer-sheet');
    if(scale!==1){for(const node of [sheet,...sheet.querySelectorAll('*')]){const s=parseFloat(getComputedStyle(node).fontSize);if(Number.isFinite(s)&&s>0)node.style.fontSize=(s*scale)+'px';}}
    const nodes=[main,...main.querySelectorAll('*')];
    const overflow=nodes.filter(n=>n.scrollWidth>n.clientWidth+1).slice(0,50).map(n=>({tag:n.tagName,className:String(n.className),clientWidth:n.clientWidth,scrollWidth:n.scrollWidth,text:(n.textContent||'').trim().slice(0,80)}));
    const axeResult=await axe.run(main,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']},resultTypes:['violations']});
    const actions=[...main.querySelectorAll('.offer-actions .choice')];
    return {
      text:main.innerText,
      immersiveState:sheet?.dataset.immersiveState,
      actionLabels:actions.map(x=>x.textContent.trim()),
      actionHeights:actions.map(x=>Math.round(x.getBoundingClientRect().height)),
      groupRole:main.querySelector('.offer-actions')?.getAttribute('role'),
      groupLabel:main.querySelector('.offer-actions')?.getAttribute('aria-label'),
      navDisplay:nav?getComputedStyle(nav).display:null,
      serious:axeResult.violations.filter(v=>v.impact==='serious'||v.impact==='critical').map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.length})),
      overflow
    };
  },scale);
}
function verify(m,viewport,scenario){
  assert.equal(m.immersiveState,'offer');
  assert.deepEqual(m.actionLabels,['Aceptar oferta','Rechazar oferta','Delegar esta oferta']);
  assert.ok(m.actionHeights.every(h=>h>=48),scenario+' action touch height');
  assert.equal(m.groupRole,'group');
  assert.equal(m.groupLabel,'Respuesta a la oferta');
  assert.deepEqual(m.overflow,[],scenario+' horizontal overflow');
  assert.deepEqual(m.serious,[],scenario+' serious/critical AXE');
  assert.doesNotMatch(m.text,/\b(?:Probabilidad|Riesgo|Resultado esperado|Recomendado)\b/i);
  assert.doesNotMatch(m.text,/\b(?:undefined|null)\b/i);
  if(scenario==='offer-loan')assert.match(m.text,/cesión/i);
  if(viewport.width<=820)assert.equal(m.navDisplay,'none',scenario+' mobile immersive nav');
  else assert.notEqual(m.navDisplay,'none',scenario+' landscape navigation remains available');
}
try{
  for(const viewport of viewports){
    for(const scenario of scenarios){
      const context=await browser.newContext({viewport:{width:viewport.width,height:viewport.height},reducedMotion:'reduce'});const page=await context.newPage();
      try{
        await open(page,scenario);const metric=await inspect(page,1);verify(metric,viewport,scenario);
        if(scenario==='offer-basic'&&viewport.id==='phone-primary'){
          await page.evaluate(()=>globalThis.__P9_ROOT__.querySelector('.offer-actions .choice')?.focus());
          await page.keyboard.press('ArrowRight');
          const focused=await page.evaluate(()=>globalThis.__P9_ROOT__.activeElement?.textContent?.trim()||'');
          assert.equal(focused,'Rechazar oferta','arrow key moves offer focus');
          await page.goBack({waitUntil:'domcontentloaded'}).catch(()=>{});
          await page.waitForTimeout(80);
          const back=await page.evaluate(()=>({commands:globalThis.__P9_COMMAND_LOG__.filter(x=>x.type==='offer'),immersive:globalThis.__P9_ROOT__.querySelector('.mh')?.classList.contains('immersive')}));
          assert.equal(back.commands.length,0,'Back must not answer offer');
          assert.equal(back.immersive,false,'Back safely closes offer presentation');
          const expected=['accept','reject','delegate'];
          for(let index=0;index<expected.length;index++){
            await open(page,scenario);
            await page.evaluate(i=>globalThis.__P9_ROOT__.querySelectorAll('.offer-actions .choice')[i]?.click(),index);
            await page.waitForTimeout(80);
            const command=await page.evaluate(()=>globalThis.__P9_COMMAND_LOG__.findLast(x=>x.type==='offer'));
            assert.equal(command?.offerId,'offer:p9:1');
            assert.equal(command?.action,expected[index]);
          }
        }
        const png=await page.screenshot({fullPage:false,type:'png'}),hash=crypto.createHash('sha256').update(png).digest('hex');
        const file='p9-offers__'+scenario+'__'+viewport.width+'x'+viewport.height+'__'+hash.slice(0,12)+'.png';
        fs.writeFileSync(path.join(outDir,file),png);
        records.push({scenario,viewport:viewport.id,width:viewport.width,height:viewport.height,scale:1,screenshot:'analysis/muir/p9/screenshots/'+file,sha256:hash,metric});
      }finally{await context.close();}
    }
  }
  for(const scale of [1.3,1.8]){
    for(const scenario of ['offer-long-club','offer-loan','offer-partial']){
      const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});const page=await context.newPage();
      try{await open(page,scenario);const metric=await inspect(page,scale);verify(metric,{width:390,height:844},scenario);records.push({scenario,viewport:'phone-primary',width:390,height:844,scale,metric});}
      finally{await context.close();}
    }
  }
}finally{await browser.close();server.close();}
const evidence={schema:'muir-p9-offers-v1',gate:'PASS',scenarios,viewports:viewports.map(x=>x.id),captures:records.filter(x=>x.screenshot).length,textScales:['100%','130%','180%'],publicOfferAuthority:'UNCHANGED',actions:['accept','reject','delegate'],axeSeriousCritical:0,horizontalOverflowFindings:0,records};
fs.writeFileSync(path.join(evidenceDir,'p9-offers.json'),JSON.stringify(evidence,null,2)+'\n');
console.log(JSON.stringify({gate:evidence.gate,captures:evidence.captures,actions:evidence.actions,textScales:evidence.textScales,publicOfferAuthority:evidence.publicOfferAuthority}));
