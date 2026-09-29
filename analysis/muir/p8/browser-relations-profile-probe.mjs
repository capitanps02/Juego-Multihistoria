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
const scenarios=['relations-empty','relations-one','relations-long','relations-many','profile-standard','profile-long','profile-contract-zero'];
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml','.webm':'video/webm'};
const server=http.createServer((req,res)=>{
  try{
    const url=new URL(req.url,'http://127.0.0.1'),rel=decodeURIComponent(url.pathname).replace(/^\/+/, '')||'analysis/muir/p8/relations-profile.html';
    const file=path.resolve(rootDir,rel);
    if(!file.startsWith(rootDir+path.sep)&&file!==rootDir){res.writeHead(403);res.end('forbidden');return;}
    if(!fs.existsSync(file)||fs.statSync(file).isDirectory()){res.writeHead(404);res.end('not found');return;}
    res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');fs.createReadStream(file).pipe(res);
  }catch(error){res.writeHead(500);res.end(String(error));}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const browser=await chromium.launch({headless:true});
const records=[];
const rawId=/\b(?:NPC|PLR|EVT|CEVT|P8_CONTACT)_[A-Z0-9_]+\b|\b(?:ARG|DEU|ESP)_[A-Z0-9_]+\b/;
const privateMetrics=/\b(?:trust|affinity|reliability|influence|probability|bondType)\b|métricas internas/i;
const inventedProfile=/\bGRL\b|valor de mercado|nacionalidad|moral global/i;

async function open(page,scenario){
  await page.goto('http://127.0.0.1:'+server.address().port+'/analysis/muir/p8/relations-profile.html?scenario='+encodeURIComponent(scenario),{waitUntil:'networkidle',timeout:30000});
  await page.waitForFunction(()=>globalThis.__P8_RP_READY__?.ready===true,null,{timeout:30000});
  await page.addScriptTag({path:axePath});
}
async function inspect(page,scale=1){
  return page.evaluate(async scale=>{
    const root=globalThis.__P8_RP_ROOT__,main=root.querySelector('main');
    if(scale!==1){
      for(const node of [main,...main.querySelectorAll('*')]){
        const size=parseFloat(getComputedStyle(node).fontSize);
        if(Number.isFinite(size)&&size>0)node.style.fontSize=(size*scale)+'px';
      }
    }
    const nodes=[main,...main.querySelectorAll('*')];
    const layoutNodes=nodes.filter(n=>!['INPUT','TEXTAREA','SELECT'].includes(n.tagName));
    const overflow=layoutNodes.filter(n=>n.scrollWidth>n.clientWidth+1).slice(0,50).map(n=>({tag:n.tagName,className:String(n.className),text:(n.textContent||'').trim().slice(0,100),clientWidth:n.clientWidth,scrollWidth:n.scrollWidth}));
    const mainRect=main.getBoundingClientRect();
    const controlOverflow=[...main.querySelectorAll('input,textarea,select')].filter(n=>{const r=n.getBoundingClientRect();return r.left<mainRect.left-1||r.right>mainRect.right+1||r.width>mainRect.width+1;}).map(n=>{const r=n.getBoundingClientRect();return {tag:n.tagName,left:r.left,right:r.right,width:r.width,mainLeft:mainRect.left,mainRight:mainRect.right};});
    const axeResult=await axe.run(main,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']},resultTypes:['violations']});
    const peopleGrid=main.querySelector('.people-grid');
    return {
      text:main.innerText,
      h1:main.querySelector('h1')?.textContent.trim()??'',
      overflow,
      controlOverflow,
      serious:axeResult.violations.filter(v=>v.impact==='serious'||v.impact==='critical').map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.length})),
      mainTabIndex:main.tabIndex,
      relationCards:main.querySelectorAll('.people-grid .person-card').length,
      relationsEmpty:main.querySelectorAll('.relations-empty').length,
      peopleColumns:peopleGrid?getComputedStyle(peopleGrid).gridTemplateColumns.split(/\s+/).filter(Boolean).length:0,
      profileDetails:main.querySelectorAll('.profile-details').length,
      profilePanels:main.querySelectorAll('.profile-details>.panel').length,
      profileNestedPanels:main.querySelectorAll('.profile-details .panel .panel').length,
      roleTabs:main.querySelectorAll('[role="tab"],[role="tablist"]').length,
      nameValue:main.querySelector('.profile-identity input')?.value??'',
      scrollHeight:main.scrollHeight,
      clientHeight:main.clientHeight
    };
  },scale);
}
function assertScenario(scenario,m,width){
  const isRelations=scenario.startsWith('relations-');
  assert.equal(m.h1,isRelations?'Las personas de tu historia.':'Tu perfil.',scenario+' heading');
  assert.equal(m.mainTabIndex,0,scenario+' main focus');
  assert.deepEqual(m.overflow,[],scenario+' horizontal layout overflow');
  assert.deepEqual(m.controlOverflow,[],scenario+' form control escaped main viewport');
  assert.deepEqual(m.serious,[],scenario+' serious/critical AXE');
  assert.ok(!rawId.test(m.text),scenario+' leaked internal ID');
  assert.ok(!privateMetrics.test(m.text),scenario+' leaked private relationship metric or technical copy');
  assert.ok(!inventedProfile.test(m.text),scenario+' invented profile field');
  assert.equal(m.roleTabs,0,scenario+' introduced fake profile tabs');
  if(isRelations&&width<=430)assert.equal(m.peopleColumns,1,scenario+' phone relationship grid must be one column');
  if(scenario==='relations-empty'){assert.equal(m.relationCards,0);assert.equal(m.relationsEmpty,1);assert.match(m.text,/Aún no hay personas registradas en esta etapa de tu historia/);}
  if(scenario==='relations-one')assert.equal(m.relationCards,1);
  if(scenario==='relations-long'){assert.equal(m.relationCards,1);assert.match(m.text,/Alejandra María de los Ángeles Fernández-Rodríguez/);}
  if(scenario==='relations-many')assert.equal(m.relationCards,24);
  if(!isRelations){
    assert.equal(m.profileDetails,1,scenario+' profile details wrapper');
    assert.equal(m.profilePanels,3,scenario+' identity, condition and contract panels');
    assert.equal(m.profileNestedPanels,0,scenario+' profile must not nest panels');
    for(const label of ['En este momento','Tu momento','Tu contrato','Forma','Estado físico','Fatiga'])assert.match(m.text,new RegExp(label),scenario+' missing '+label);
  }
  if(scenario==='profile-standard'){assert.equal(m.nameValue,'Álex Martín');assert.match(m.text,/León Norte/);}
  if(scenario==='profile-long'){assert.equal(m.nameValue,'Álex Fernández-Rodríguez');assert.match(m.text,/San Miguel de Tucumán Plata/);assert.match(m.text,/El contrato está en su tramo final/);}
  if(scenario==='profile-contract-zero'){assert.equal(m.nameValue,'María O’Neill-Sáez');assert.match(m.text,/Mönchengladbach Spree/);assert.match(m.text,/Sin meses de contrato restantes/);}
}

try{
  for(const viewport of viewports){
    for(const scenario of scenarios){
      const context=await browser.newContext({viewport:{width:viewport.width,height:viewport.height},reducedMotion:'reduce'});
      const page=await context.newPage();
      try{
        await open(page,scenario);const metric=await inspect(page,1);assertScenario(scenario,metric,viewport.width);
        const png=await page.screenshot({fullPage:false,type:'png'}),hash=crypto.createHash('sha256').update(png).digest('hex');
        const file='p8-rel-profile__'+scenario+'__'+viewport.width+'x'+viewport.height+'__'+hash.slice(0,12)+'.png';
        fs.writeFileSync(path.join(outDir,file),png);
        records.push({scenario,viewport:viewport.id,width:viewport.width,height:viewport.height,scale:1,screenshot:'analysis/muir/p8/screenshots/'+file,sha256:hash,metric});
      }finally{await context.close();}
    }
  }
  for(const scale of [1.3,1.8]){
    for(const scenario of ['relations-long','relations-many','profile-long']){
      const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});const page=await context.newPage();
      try{await open(page,scenario);const metric=await inspect(page,scale);assertScenario(scenario,metric,390);records.push({scenario,viewport:'phone-primary',width:390,height:844,scale,metric});}
      finally{await context.close();}
    }
  }
}finally{await browser.close();server.close();}

const evidence={schema:'muir-p8-relations-profile-v1',gate:'PASS',scenarios,viewports:viewports.map(v=>v.id),captures:records.filter(r=>r.screenshot).length,textScales:['100%','130%','180%'],privateMetricsVisible:0,inventedProfileFields:0,fakeTabs:0,horizontalOverflowFindings:0,axeSeriousCritical:0,records};
fs.writeFileSync(path.join(evidenceDir,'p8-relations-profile.json'),JSON.stringify(evidence,null,2)+'\n');
console.log(JSON.stringify({gate:evidence.gate,captures:evidence.captures,scenarios:evidence.scenarios,viewports:evidence.viewports,textScales:evidence.textScales}));
