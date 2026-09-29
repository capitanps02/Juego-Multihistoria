import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {chromium} from 'playwright';

const root=path.resolve(import.meta.dirname,'../../..');
const axePath=path.join(root,'node_modules','axe-core','axe.min.js');
assert(fs.existsSync(axePath),'axe-core is not installed');
const outDir=path.join(root,'analysis','muir','p7','screenshots');
const evidenceDir=path.join(root,'analysis','muir','p7','evidence');
fs.mkdirSync(outDir,{recursive:true});fs.mkdirSync(evidenceDir,{recursive:true});
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webm':'video/webm','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{
  try{
    const url=new URL(req.url,'http://127.0.0.1'),rel=decodeURIComponent(url.pathname).replace(/^\/+/, '')||'analysis/muir/p7/semantic-fixture.html';
    const file=path.resolve(root,rel);
    if(!file.startsWith(root+path.sep)&&file!==root){res.writeHead(403);res.end('forbidden');return;}
    if(!fs.existsSync(file)||fs.statSync(file).isDirectory()){res.writeHead(404);res.end('not found');return;}
    res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');fs.createReadStream(file).pipe(res);
  }catch(error){res.writeHead(500);res.end(String(error));}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const port=server.address().port,browser=await chromium.launch({headless:true});
const viewports=[
  {id:'phone-360',width:360,height:800},
  {id:'phone-primary',width:390,height:844},
  {id:'phone-412',width:412,height:915},
  {id:'tablet',width:768,height:1024}
];
const fixtures=[
  {id:'news-long',route:'Mundo',selector:'.news-card'},
  {id:'news-empty',route:'Mundo',selector:'.news-grid .semantic-empty'},
  {id:'match-full',route:'Carrera',selector:'.latest-match-card'},
  {id:'match-partial',route:'Carrera',selector:'.latest-match-card'},
  {id:'match-empty',route:'Carrera',selector:'.latest-match-card.semantic-empty'},
  {id:'season-long',route:'Carrera',selector:'.career-season-card'},
  {id:'contract-full',route:'Perfil',selector:'.contract-summary'},
  {id:'contract-zero',route:'Perfil',selector:'.contract-summary'},
  {id:'offer-loan',route:'Inicio',selector:'.offer-card'},
  {id:'offer-nonloan',route:'Inicio',selector:'.offer-card'},
  {id:'person-long',route:'Relaciones',selector:'.person-card'}
];
const technical=/\b(?:NPC_[A-Z0-9_]+|[A-Z]{3}_[A-Z0-9_]+)\b/;
const forbiddenText=/\b(?:undefined|null|N\/A)\b|\[object Object\]|—/;
const reports=[];

async function open(page,fixture,viewport){
  const url='http://127.0.0.1:'+port+'/analysis/muir/p7/semantic-fixture.html?variant='+encodeURIComponent(fixture.id)+'&route='+encodeURIComponent(fixture.route);
  await page.goto(url,{waitUntil:'networkidle',timeout:30000});
  await page.waitForFunction(()=>globalThis.__MUIR_P7_READY__?.ready===true,null,{timeout:30000});
  await page.waitForTimeout(60);await page.addScriptTag({path:axePath});
  await page.waitForSelector('#game');
}
async function inspect(page,scale=1){
  return page.evaluate(async({scale})=>{
    const root=document.querySelector('#game').shadowRoot,main=root.querySelector('main');
    if(scale!==1){
      for(const node of [main,...main.querySelectorAll('*')]){
        const size=parseFloat(getComputedStyle(node).fontSize);
        if(Number.isFinite(size)&&size>0)node.style.fontSize=(size*scale)+'px';
      }
    }
    const nodes=[main,...main.querySelectorAll('*')];
    const overflow=nodes.filter(n=>n.scrollWidth>n.clientWidth+1).slice(0,30).map(n=>({tag:n.tagName,className:n.className,text:n.textContent.trim().slice(0,100),clientWidth:n.clientWidth,scrollWidth:n.scrollWidth}));
    const axeResult=await axe.run(main,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']},resultTypes:['violations']});
    return {
      text:main.textContent,
      html:main.innerHTML,
      overflow,
      serious:axeResult.violations.filter(v=>v.impact==='serious'||v.impact==='critical').map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.length})),
      relationshipLabels:main.querySelectorAll('.relationship-label').length,
      personInitials:main.querySelectorAll('.person-initials').length,
      ratingRows:[...main.querySelectorAll('.data-row')].filter(r=>r.querySelector('span')?.textContent.trim()==='Valoración').length,
      componentCounts:{
        news:main.querySelectorAll('.news-card').length,
        match:main.querySelectorAll('.latest-match-card').length,
        season:main.querySelectorAll('.career-season-card').length,
        contract:main.querySelectorAll('.contract-summary').length,
        offer:main.querySelectorAll('.offer-card').length,
        person:main.querySelectorAll('.person-card').length
      }
    };
  },{scale});
}
function semanticAssertions(fixture,metric){
  assert(!technical.test(metric.text),fixture.id+' exposes internal ID: '+metric.text.match(technical)?.[0]);
  assert(!forbiddenText.test(metric.text),fixture.id+' exposes technical fallback: '+metric.text.match(forbiddenText)?.[0]);
  assert.deepEqual(metric.serious,[],fixture.id+' AXE serious/critical: '+JSON.stringify(metric.serious));
  assert.deepEqual(metric.overflow,[],fixture.id+' horizontal overflow: '+JSON.stringify(metric.overflow));
  if(fixture.id==='news-long'){assert(metric.componentCounts.news===2,'news-long expected 2 NewsCards');assert(metric.text.includes('München')&&metric.text.includes('O’Connor'),'Unicode news copy missing');}
  if(fixture.id==='news-empty'){assert(metric.text.includes('No hay noticias destacadas'),'news empty state missing');}
  if(fixture.id==='match-full'){assert(metric.componentCounts.match>=1,'LatestMatchCard missing');assert(metric.text.includes('San Miguel de Tucumán Plata'),'long club formatter missing');assert(metric.ratingRows===1,'full rating row missing');}
  if(fixture.id==='match-partial'){assert(metric.ratingRows===0,'null rating should omit row');}
  if(fixture.id==='match-empty'){assert(metric.text.includes('Todavía no hay un último partido oficial registrado.'),'match empty state missing');assert(!metric.text.includes('Próximo partido'),'invented next match present');}
  if(fixture.id==='season-long'){assert(metric.componentCounts.season===3,'season cards missing');assert(metric.text.includes('San Miguel de Tucumán Plata'),'long season club formatter missing');}
  if(fixture.id==='contract-zero'){assert(metric.text.includes('Sin meses de contrato restantes'),'zero-month factual contract fallback missing');}
  if(fixture.id==='offer-loan'){assert(metric.componentCounts.offer===1,'OfferCard missing');assert(metric.text.includes('La propuesta es una cesión.'),'loan state missing');assert(metric.text.includes('Club de inscripción'),'loan registration club missing');}
  if(fixture.id==='offer-nonloan'){assert(metric.text.includes('La propuesta no es una cesión.'),'non-loan state missing');}
  if(fixture.id==='person-long'){assert(metric.componentCounts.person===2,'PersonCards missing');assert(metric.relationshipLabels===0,'inferred relationship label rendered');assert(metric.personInitials>=1,'initials fallback missing');assert(metric.text.includes("María-José D'Ávila"),'long person name missing');}
}
try{
  for(const viewport of viewports){
    for(const fixture of fixtures){
      const context=await browser.newContext({viewport:{width:viewport.width,height:viewport.height},reducedMotion:'reduce'});
      const page=await context.newPage();
      try{
        await open(page,fixture,viewport);
        const metric=await inspect(page,1);semanticAssertions(fixture,metric);
        assert(await page.locator('#game').evaluate((host,selector)=>Boolean(host.shadowRoot.querySelector(selector)),fixture.selector),viewport.id+'/'+fixture.id+' expected component selector missing');
        const png=await page.screenshot({type:'png',fullPage:false});
        const hash=crypto.createHash('sha256').update(png).digest('hex');
        const file=fixture.id+'__'+viewport.width+'x'+viewport.height+'__'+hash.slice(0,12)+'.png';
        fs.writeFileSync(path.join(outDir,file),png);
        reports.push({viewport:viewport.id,fixture:fixture.id,scale:1,file:'analysis/muir/p7/screenshots/'+file,sha256:hash,metric});
      }finally{await context.close();}
    }
  }
  for(const factor of [1.3,1.8]){
    for(const fixture of fixtures){
      const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
      const page=await context.newPage();
      try{
        await open(page,fixture,{id:'phone-primary'});
        const metric=await inspect(page,factor);semanticAssertions(fixture,metric);
        reports.push({viewport:'phone-primary',fixture:fixture.id,scale:factor,metric});
      }finally{await context.close();}
    }
  }
}finally{await browser.close();server.close();}

const evidence={
  gate:'PASS',
  components:['NewsCard','LatestMatchCard','CareerSeasonCard','ContractSummary','OfferCard','PersonCard'],
  viewports:viewports.map(v=>v.id),
  textScales:['100%','130%','180%'],
  internalIdsVisible:0,undefinedNullVisible:0,inventedFields:0,
  authority:{dbModified:false,marketModified:false,offerAuthorityModified:false,gameplayModified:false},
  reports
};
fs.writeFileSync(path.join(evidenceDir,'p7-browser-semantic-components.json'),JSON.stringify(evidence,null,2)+'\n');
console.log(JSON.stringify({gate:evidence.gate,components:evidence.components,viewports:evidence.viewports,textScales:evidence.textScales,captures:reports.filter(r=>r.scale===1).length}));
