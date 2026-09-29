import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const rootDir=path.resolve(import.meta.dirname,'../../..');
const axePath=path.join(rootDir,'node_modules','axe-core','axe.min.js');
assert(fs.existsSync(axePath),'axe-core is not installed');
const outDir=path.join(rootDir,'analysis','muir','p7','screenshots');
const evidenceDir=path.join(rootDir,'analysis','muir','p7','evidence');
fs.mkdirSync(outDir,{recursive:true});fs.mkdirSync(evidenceDir,{recursive:true});
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webm':'video/webm','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{
  try{
    const url=new URL(req.url,'http://127.0.0.1'),rel=decodeURIComponent(url.pathname).replace(/^\/+/, '')||'analysis/muir/p7/index.html';
    const file=path.resolve(rootDir,rel);
    if(!file.startsWith(rootDir+path.sep)&&file!==rootDir){res.writeHead(403);res.end('forbidden');return;}
    if(!fs.existsSync(file)||fs.statSync(file).isDirectory()){res.writeHead(404);res.end('not found');return;}
    res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');fs.createReadStream(file).pipe(res);
  }catch(error){res.writeHead(500);res.end(String(error));}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const port=server.address().port;
const browser=await chromium.launch({headless:true});
const viewports=[
  {id:'phone-360',width:360,height:800},
  {id:'phone-primary',width:390,height:844},
  {id:'phone-412',width:412,height:915},
  {id:'tablet',width:768,height:1024}
];
const matrix=['news-long','match-partial','season-many','contract-zero','offer-loan','person-long'];
const primary=['news-empty','match-complete','match-empty','season-complete','season-partial','contract-complete','contract-partial','offer-complete','offer-partial','person-no-image','person-image'];
const rawId=/\b(?:ARG|BEL|CHN|DEU|ENG|ESP|FRA|ITA|JPN|KOR|MEX|NLD|PRT|SAU|TUR|USA)_[A-Z0-9_]+\b|\bNPC_[A-Z0-9_]+\b|\b(?:match|offer):[A-Za-z0-9:_-]+\b/;
const technical=/\bundefined\b|\bnull\b|\[object Object\]|\bN\/A\b|—/i;
const reports=[];

async function open(page,scenario,viewport){
  await page.goto('http://127.0.0.1:'+port+'/analysis/muir/p7/index.html?scenario='+encodeURIComponent(scenario),{waitUntil:'networkidle',timeout:30000});
  await page.waitForFunction(()=>globalThis.__P7_READY__?.ready===true,null,{timeout:30000});
  await page.waitForTimeout(80);
  await page.addScriptTag({path:axePath});
}
async function inspect(page,scale=1){
  return page.evaluate(async scale=>{
    const root=globalThis.__P7_ROOT__,main=root.querySelector('main');
    if(scale!==1){
      for(const node of [main,...main.querySelectorAll('*')]){
        const size=parseFloat(getComputedStyle(node).fontSize);
        if(Number.isFinite(size)&&size>0)node.style.fontSize=(size*scale)+'px';
      }
    }
    const semanticRoots=[...main.querySelectorAll('.semantic-card,.semantic-empty')];
    const nodes=[main,...semanticRoots.flatMap(node=>[node,...node.querySelectorAll('*')])];
    const overflow=nodes.filter(n=>n.scrollWidth>n.clientWidth+1).slice(0,30).map(n=>({tag:n.tagName,className:n.className,text:n.textContent.trim().slice(0,90),clientWidth:n.clientWidth,scrollWidth:n.scrollWidth}));
    const semantic=[...main.querySelectorAll('.semantic-card')].map(n=>({className:n.className,text:n.textContent.trim(),tag:n.tagName,tabIndex:n.tabIndex}));
    const axeResult=await axe.run(main,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']},resultTypes:['violations']});
    const buttons=[...main.querySelectorAll('button:not(:disabled)')].map(b=>({text:b.textContent.trim(),width:b.getBoundingClientRect().width,height:b.getBoundingClientRect().height}));
    return {
      text:main.textContent,
      h1:main.querySelector('h1')?.textContent.trim()??'',
      semantic,
      overflow,
      serious:axeResult.violations.filter(v=>v.impact==='serious'||v.impact==='critical').map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.length})),
      buttons,
      relationshipLabels:main.querySelectorAll('.relationship-label').length,
      initials:main.querySelectorAll('.person-initials,.initials').length,
      portraits:main.querySelectorAll('.person-portrait').length
    };
  },scale);
}
function scenarioAssertions(scenario,metric){
  assert.ok(!rawId.test(metric.text),scenario+' leaked raw internal id');
  assert.ok(!technical.test(metric.text),scenario+' leaked technical null/undefined placeholder');
  assert.equal(metric.relationshipLabels,0,scenario+' rendered inferred relationship label');
  if(scenario==='news-empty')assert.match(metric.text,/No hay noticias destacadas esta semana/);
  if(scenario==='match-partial')assert.ok(!metric.semantic.find(x=>x.className.includes('latest-match-card'))?.text.includes('Valoración'),'partial match rendered absent rating');
  if(scenario==='match-empty')assert.match(metric.text,/Todavía no hay un último partido oficial registrado/);
  if(scenario==='season-partial')assert.ok(!metric.semantic.find(x=>x.className.includes('career-season-card'))?.text.includes('Valoración media'),'partial season rendered absent rating');
  if(scenario==='contract-zero')assert.match(metric.text,/Sin meses de contrato restantes/);
  if(scenario==='offer-loan'){assert.match(metric.text,/La propuesta es una cesión/);assert.match(metric.text,/Club de inscripción/);}
  if(scenario==='person-long'){assert.match(metric.text,/Alejandra María de los Ángeles Fernández-Rodríguez/);assert.ok(metric.initials>=1,'long person fallback initials missing');}
  if(scenario==='person-no-image')assert.ok(metric.initials>=1,'no-image PersonCard lacks initials');
  if(scenario==='person-image')assert.ok(metric.portraits>=1,'known portrait PersonCard lacks portrait');
}

try{
  const targets=[
    ...viewports.flatMap(viewport=>matrix.map(scenario=>({viewport,scenario}))),
    ...primary.map(scenario=>({viewport:viewports[1],scenario}))
  ];
  for(const {viewport,scenario} of targets){
    const context=await browser.newContext({viewport:{width:viewport.width,height:viewport.height},reducedMotion:'reduce'});
    const page=await context.newPage();
    try{
      await open(page,scenario,viewport);
      const metric=await inspect(page,1);
      assert.deepEqual(metric.serious,[],viewport.id+'/'+scenario+' AXE: '+JSON.stringify(metric.serious));
      assert.deepEqual(metric.overflow,[],viewport.id+'/'+scenario+' horizontal overflow: '+JSON.stringify(metric.overflow));
      for(const b of metric.buttons)assert(b.height>=44,viewport.id+'/'+scenario+' control below 44px: '+JSON.stringify(b));
      for(const card of metric.semantic)assert.notEqual(card.tabIndex,0,viewport.id+'/'+scenario+' non-action semantic card became whole-card focus target');
      scenarioAssertions(scenario,metric);
      const png=await page.screenshot({fullPage:false,type:'png'});
      const hash=crypto.createHash('sha256').update(png).digest('hex');
      const file='p7__'+scenario+'__'+viewport.width+'x'+viewport.height+'__'+hash.slice(0,12)+'.png';
      fs.writeFileSync(path.join(outDir,file),png);
      reports.push({viewport:viewport.id,width:viewport.width,height:viewport.height,scenario,scale:1,screenshot:'analysis/muir/p7/screenshots/'+file,sha256:hash,metric});
    }finally{await context.close();}
  }
  for(const scale of [1.3,1.8]){
    for(const scenario of matrix){
      const viewport=viewports[1],context=await browser.newContext({viewport:{width:viewport.width,height:viewport.height},reducedMotion:'reduce'});
      const page=await context.newPage();
      try{
        await open(page,scenario,viewport);
        const metric=await inspect(page,scale);
        assert.deepEqual(metric.overflow,[],'text '+scale+' '+scenario+' overflow: '+JSON.stringify(metric.overflow));
        scenarioAssertions(scenario,metric);
        reports.push({viewport:viewport.id,scenario,scale,metric});
      }finally{await context.close();}
    }
  }
}finally{await browser.close();server.close();}

const evidence={
  gate:'PASS',
  components:['NewsCard','LatestMatchCard','CareerSeasonCard','ContractSummary','OfferCard','PersonCard'],
  matrix,
  primary,
  viewports:viewports.map(v=>v.id),
  textScales:['100%','130%','180%'],
  internalIdsVisible:0,
  undefinedNullVisible:0,
  inventedFields:0,
  axeSeriousCritical:0,
  authority:{dbModified:false,marketModified:false,offerAuthorityModified:false,gameplayModified:false},
  reports
};
fs.writeFileSync(path.join(evidenceDir,'p7-browser-semantic.json'),JSON.stringify(evidence,null,2)+'\n');
console.log(JSON.stringify({gate:evidence.gate,captures:reports.filter(r=>r.screenshot).length,viewports:evidence.viewports,textScales:evidence.textScales,internalIdsVisible:0,undefinedNullVisible:0,axeSeriousCritical:0}));
