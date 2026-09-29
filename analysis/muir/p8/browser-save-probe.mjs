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
const scenarios=['save-standard','save-backup','save-legacy','save-full'];
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml','.webm':'video/webm'};

const server=http.createServer((req,res)=>{
  try{
    const url=new URL(req.url,'http://127.0.0.1'),rel=decodeURIComponent(url.pathname).replace(/^\/+/, '')||'analysis/muir/p8/save.html';
    const file=path.resolve(rootDir,rel);
    if(!file.startsWith(rootDir+path.sep)&&file!==rootDir){res.writeHead(403);res.end('forbidden');return;}
    if(!fs.existsSync(file)||fs.statSync(file).isDirectory()){res.writeHead(404);res.end('not found');return;}
    res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');fs.createReadStream(file).pipe(res);
  }catch(error){res.writeHead(500);res.end(String(error));}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const browser=await chromium.launch({headless:true});
const records=[];
const interactionRecords=[];
const forbidden=/\bcloud\b|\bnube\b|login|iniciar sesi[oó]n|sincroniz|remote slot|slot remoto|cuenta online/i;

async function open(page,scenario){
  await page.goto('http://127.0.0.1:'+server.address().port+'/analysis/muir/p8/save.html?scenario='+encodeURIComponent(scenario),{waitUntil:'networkidle',timeout:30000});
  await page.waitForFunction(()=>globalThis.__P8_SAVE_READY__?.ready===true,null,{timeout:30000});
  await page.addScriptTag({path:axePath});
}
async function inspect(page,scale=1){
  return page.evaluate(async scale=>{
    const root=globalThis.__P8_SAVE_ROOT__,main=root.querySelector('main');
    if(scale!==1){
      for(const node of [main,...main.querySelectorAll('*')]){
        const size=parseFloat(getComputedStyle(node).fontSize);
        if(Number.isFinite(size)&&size>0)node.style.fontSize=(size*scale)+'px';
      }
    }
    const nodes=[main,...main.querySelectorAll('*')];
    const layoutNodes=nodes.filter(n=>!['INPUT','TEXTAREA','SELECT'].includes(n.tagName));
    const overflow=layoutNodes.filter(n=>n.scrollWidth>n.clientWidth+1).slice(0,60).map(n=>({tag:n.tagName,className:String(n.className),text:(n.textContent||'').trim().slice(0,100),clientWidth:n.clientWidth,scrollWidth:n.scrollWidth}));
    const mainRect=main.getBoundingClientRect();
    const controlOverflow=[...main.querySelectorAll('input,textarea,select')].filter(n=>{const r=n.getBoundingClientRect();return r.left<mainRect.left-1||r.right>mainRect.right+1||r.width>mainRect.width+1;}).map(n=>{const r=n.getBoundingClientRect();return {tag:n.tagName,left:r.left,right:r.right,width:r.width,mainLeft:mainRect.left,mainRight:mainRect.right};});
    const axeResult=await axe.run(main,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']},resultTypes:['violations']});
    const grid=main.querySelector('.save-support-grid');
    const buttons=[...main.querySelectorAll('button')].map(b=>b.textContent.trim());
    const code=main.querySelector('.save-new-story input[type=number]');
    const fileInput=main.querySelector('.save-import input[type=file]');
    return {
      text:main.innerText,
      h1:main.querySelector('h1')?.textContent.trim()??'',
      overflow,
      controlOverflow,
      serious:axeResult.violations.filter(v=>v.impact==='serious'||v.impact==='critical').map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.length})),
      mainTabIndex:main.tabIndex,
      current:main.querySelectorAll('.save-current').length,
      recovery:main.querySelectorAll('.save-recovery').length,
      supportCards:main.querySelectorAll('.save-support-card').length,
      importCards:main.querySelectorAll('.save-import').length,
      backupCards:main.querySelectorAll('.save-backup').length,
      legacyCards:main.querySelectorAll('.save-legacy').length,
      newStory:main.querySelectorAll('.save-new-story').length,
      supportColumns:grid?getComputedStyle(grid).gridTemplateColumns.split(/\s+/).filter(Boolean).length:0,
      buttons,
      fileAccept:fileInput?.accept??'',
      codeType:code?.type??'',
      codeMin:code?.min??'',
      codeMax:code?.max??'',
      codeValue:code?.value??'',
      scrollHeight:main.scrollHeight,
      clientHeight:main.clientHeight
    };
  },scale);
}
function assertScenario(scenario,m,width){
  assert.equal(m.h1,'Tu partida.',scenario+' heading');
  assert.equal(m.mainTabIndex,0,scenario+' main focus');
  assert.deepEqual(m.overflow,[],scenario+' horizontal layout overflow');
  assert.deepEqual(m.controlOverflow,[],scenario+' form control escaped main viewport');
  assert.deepEqual(m.serious,[],scenario+' serious/critical AXE');
  assert.ok(!forbidden.test(m.text),scenario+' invented remote save feature');
  assert.equal(m.current,1,scenario+' current-save panel');
  assert.equal(m.recovery,1,scenario+' recovery panel');
  assert.equal(m.importCards,1,scenario+' import card');
  assert.equal(m.newStory,1,scenario+' new-story panel');
  assert.ok(m.buttons.includes('Descargar copia'),scenario+' download action');
  assert.ok(m.buttons.includes('Recuperar partida actual'),scenario+' current recovery action');
  assert.match(m.text,/Guardado automático activo/);
  assert.match(m.text,/Importar una copia/);
  assert.match(m.text,/Código de historia/);
  assert.equal(m.fileAccept,'.json,application/json');
  assert.equal(m.codeType,'number');
  assert.equal(m.codeMin,'0');
  assert.equal(m.codeMax,'4294967295');
  assert.equal(m.codeValue,'424242');
  if(width<=430)assert.equal(m.supportColumns,1,scenario+' support grid must stack on narrow phone');
  if(scenario==='save-standard'){assert.equal(m.supportCards,1);assert.equal(m.backupCards,0);assert.equal(m.legacyCards,0);}
  if(scenario==='save-backup'){assert.equal(m.supportCards,2);assert.equal(m.backupCards,1);assert.equal(m.legacyCards,0);assert.ok(m.buttons.includes('Recuperar copia anterior'));}
  if(scenario==='save-legacy'){assert.equal(m.supportCards,2);assert.equal(m.backupCards,0);assert.equal(m.legacyCards,1);assert.ok(m.buttons.includes('Descargar copia antigua'));}
  if(scenario==='save-full'){assert.equal(m.supportCards,3);assert.equal(m.backupCards,1);assert.equal(m.legacyCards,1);assert.ok(m.buttons.includes('Recuperar copia anterior'));assert.ok(m.buttons.includes('Descargar copia antigua'));}
}

async function withPage(scenario,fn){
  const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce',acceptDownloads:true});
  const page=await context.newPage();
  try{await open(page,scenario);return await fn(page);}finally{await context.close();}
}
async function dialogText(page){
  await page.locator('dialog[open]').waitFor({state:'visible',timeout:10000});
  return page.locator('dialog[open]').innerText();
}

try{
  for(const viewport of viewports){
    for(const scenario of scenarios){
      const context=await browser.newContext({viewport:{width:viewport.width,height:viewport.height},reducedMotion:'reduce'});
      const page=await context.newPage();
      try{
        await open(page,scenario);
        const metric=await inspect(page,1);
        assertScenario(scenario,metric,viewport.width);
        const png=await page.screenshot({fullPage:false,type:'png'});
        const hash=crypto.createHash('sha256').update(png).digest('hex');
        const file='p8-save__'+scenario+'__'+viewport.width+'x'+viewport.height+'__'+hash.slice(0,12)+'.png';
        fs.writeFileSync(path.join(outDir,file),png);
        records.push({scenario,viewport:viewport.id,width:viewport.width,height:viewport.height,scale:1,screenshot:'analysis/muir/p8/screenshots/'+file,sha256:hash,metric});
      }finally{await context.close();}
    }
  }
  for(const scale of [1.3,1.8]){
    for(const scenario of ['save-standard','save-full']){
      const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
      const page=await context.newPage();
      try{
        await open(page,scenario);
        const metric=await inspect(page,scale);
        assertScenario(scenario,metric,390);
        records.push({scenario,viewport:'phone-primary',width:390,height:844,scale,metric});
      }finally{await context.close();}
    }
  }

  await withPage('save-standard',async page=>{
    const raw=await page.evaluate(()=>globalThis.__P8_SAVE_IMPORT_RAW__);
    await page.locator('#mh-import').setInputFiles({name:'multihistoria-import.json',mimeType:'application/json',buffer:Buffer.from(raw)});
    const text=await dialogText(page);
    assert.match(text,/Recuperar esta copia/);
    assert.match(text,/Se conservará una copia de la partida actual/);
    await page.locator('dialog[open] button').filter({hasText:'Cancelar'}).click();
    interactionRecords.push({interaction:'import-confirmation',gate:'PASS'});
  });

  await withPage('save-backup',async page=>{
    await page.getByRole('button',{name:'Recuperar copia anterior'}).click();
    const text=await dialogText(page);
    assert.match(text,/Recuperar esta copia/);
    await page.locator('dialog[open] button').filter({hasText:'Cancelar'}).click();
    interactionRecords.push({interaction:'backup-recovery-confirmation',gate:'PASS'});
  });

  await withPage('save-standard',async page=>{
    await page.locator('input[aria-label="Nombre y apellido de la nueva carrera"]').fill('María O’Neill-Sáez');
    await page.locator('input[aria-label="Código de historia de la nueva carrera"]').fill('123456');
    await page.getByRole('button',{name:'Empezar otra carrera'}).click();
    const text=await dialogText(page);
    assert.match(text,/Empezar otra carrera/);
    assert.match(text,/La partida actual pasará a la copia anterior/);
    await page.locator('dialog[open] button').filter({hasText:'Cancelar'}).click();
    interactionRecords.push({interaction:'new-story-confirmation',gate:'PASS'});
  });

  await withPage('save-standard',async page=>{
    const pending=page.waitForEvent('download');
    await page.getByRole('button',{name:'Descargar copia',exact:true}).click();
    const download=await pending;
    assert.equal(download.suggestedFilename(),'multihistoria-partida.json');
    interactionRecords.push({interaction:'current-download',gate:'PASS',filename:download.suggestedFilename()});
  });

  await withPage('save-legacy',async page=>{
    const pending=page.waitForEvent('download');
    await page.getByRole('button',{name:'Descargar copia antigua'}).click();
    const download=await pending;
    assert.equal(download.suggestedFilename(),'multihistoria-copia-antigua.json');
    interactionRecords.push({interaction:'legacy-download',gate:'PASS',filename:download.suggestedFilename()});
  });
}finally{await browser.close();server.close();}

const evidence={
  schema:'muir-p8-save-v1',
  gate:'PASS',
  scenarios,
  viewports:viewports.map(v=>v.id),
  captures:records.filter(r=>r.screenshot).length,
  textScales:['100%','130%','180%'],
  currentSave:true,
  download:true,
  currentRecovery:true,
  import:true,
  previousBackup:true,
  legacyDownload:true,
  newStory:true,
  interactions:interactionRecords,
  cloudFeatures:0,
  remoteSlots:0,
  horizontalOverflowFindings:0,
  axeSeriousCritical:0,
  records
};
fs.writeFileSync(path.join(evidenceDir,'p8-save.json'),JSON.stringify(evidence,null,2)+'\n');
console.log(JSON.stringify({gate:evidence.gate,captures:evidence.captures,scenarios:evidence.scenarios,viewports:evidence.viewports,textScales:evidence.textScales,interactions:interactionRecords.map(x=>x.interaction)}));
