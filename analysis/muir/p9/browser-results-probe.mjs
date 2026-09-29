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
const scenarios=['result-basic','result-message-only','result-mixed','result-long','result-match'];
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
    const root=globalThis.__P9_ROOT__,main=root.querySelector('main'),nav=root.querySelector('.navigation'),sheet=main.querySelector('.result-sheet');
    if(scale!==1){for(const node of [sheet,...sheet.querySelectorAll('*')]){const s=parseFloat(getComputedStyle(node).fontSize);if(Number.isFinite(s)&&s>0)node.style.fontSize=(s*scale)+'px';}}
    const nodes=[main,...main.querySelectorAll('*')];
    const overflow=nodes.filter(n=>n.scrollWidth>n.clientWidth+1).slice(0,50).map(n=>({tag:n.tagName,className:String(n.className),clientWidth:n.clientWidth,scrollWidth:n.scrollWidth,text:(n.textContent||'').trim().slice(0,80)}));
    const axeResult=await axe.run(main,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']},resultTypes:['violations']});
    const next=main.querySelector('[data-result-continue]');
    return {
      text:main.innerText,
      immersiveState:sheet?.dataset.immersiveState,
      choiceText:main.querySelector('.result-choice .chosen')?.textContent?.trim()||'',
      consequenceCount:main.querySelectorAll('.result-consequences').length,
      matchCount:main.querySelectorAll('.result-match-summary').length,
      continueHeight:next?Math.round(next.getBoundingClientRect().height):0,
      continuePosition:next?getComputedStyle(next).position:null,
      navDisplay:nav?getComputedStyle(nav).display:null,
      serious:axeResult.violations.filter(v=>v.impact==='serious'||v.impact==='critical').map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.length})),
      overflow
    };
  },scale);
}
function verify(m,viewport,scenario){
  assert.equal(m.immersiveState,'result');
  assert.ok(m.choiceText.length>0,scenario+' chosen label');
  assert.ok(m.continueHeight>=48,scenario+' continue touch height');
  assert.equal(m.continuePosition,'sticky',scenario+' sticky continue');
  assert.deepEqual(m.overflow,[],scenario+' horizontal overflow');
  assert.deepEqual(m.serious,[],scenario+' serious/critical AXE');
  assert.doesNotMatch(m.text,/\b(?:Probabilidad|Riesgo|Resultado esperado|Recomendado)\b/i);
  if(scenario==='result-message-only')assert.equal(m.consequenceCount,0);
  else assert.equal(m.consequenceCount,1);
  assert.equal(m.matchCount,scenario==='result-match'?1:0);
  if(viewport.width<=820)assert.equal(m.navDisplay,'none',scenario+' mobile immersive nav');
  else assert.notEqual(m.navDisplay,'none',scenario+' landscape navigation remains available');
}
try{
  for(const viewport of viewports){
    for(const scenario of scenarios){
      const context=await browser.newContext({viewport:{width:viewport.width,height:viewport.height},reducedMotion:'reduce'});const page=await context.newPage();
      try{
        await open(page,scenario);const metric=await inspect(page,1);verify(metric,viewport,scenario);
        if(scenario==='result-basic'&&viewport.id==='phone-primary'){
          await page.goBack({waitUntil:'domcontentloaded'}).catch(()=>{});
          await page.waitForTimeout(80);
          const back=await page.evaluate(()=>({
            commands:globalThis.__P9_COMMAND_LOG__.map(x=>x.type),
            immersive:globalThis.__P9_ROOT__.querySelector('.mh')?.classList.contains('immersive')
          }));
          assert.equal(back.commands.includes('acknowledge'),false,'Back must not acknowledge Result');
          assert.equal(back.immersive,false,'Back must safely close Result presentation');
          await open(page,scenario);
          await page.evaluate(()=>globalThis.__P9_ROOT__.querySelector('[data-result-continue]')?.click());
          await page.waitForTimeout(80);
          const count=await page.evaluate(()=>globalThis.__P9_COMMAND_LOG__.filter(x=>x.type==='acknowledge').length);
          assert.equal(count,1,'Continue emits exactly one acknowledge command');
        }
        const png=await page.screenshot({fullPage:false,type:'png'}),hash=crypto.createHash('sha256').update(png).digest('hex');
        const file='p9-results__'+scenario+'__'+viewport.width+'x'+viewport.height+'__'+hash.slice(0,12)+'.png';
        fs.writeFileSync(path.join(outDir,file),png);
        records.push({scenario,viewport:viewport.id,width:viewport.width,height:viewport.height,scale:1,screenshot:'analysis/muir/p9/screenshots/'+file,sha256:hash,metric});
      }finally{await context.close();}
    }
  }
  for(const scale of [1.3,1.8]){
    for(const scenario of ['result-long','result-mixed','result-match']){
      const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});const page=await context.newPage();
      try{await open(page,scenario);const metric=await inspect(page,scale);verify(metric,{width:390,height:844},scenario);records.push({scenario,viewport:'phone-primary',width:390,height:844,scale,metric});}
      finally{await context.close();}
    }
  }
}finally{await browser.close();server.close();}
const evidence={schema:'muir-p9-results-v1',gate:'PASS',scenarios,viewports:viewports.map(x=>x.id),captures:records.filter(x=>x.screenshot).length,textScales:['100%','130%','180%'],acknowledgeAuthority:'UNCHANGED',predictiveEffects:0,axeSeriousCritical:0,horizontalOverflowFindings:0,records};
fs.writeFileSync(path.join(evidenceDir,'p9-results.json'),JSON.stringify(evidence,null,2)+'\n');
console.log(JSON.stringify({gate:evidence.gate,captures:evidence.captures,viewports:evidence.viewports,textScales:evidence.textScales,acknowledgeAuthority:evidence.acknowledgeAuthority}));
