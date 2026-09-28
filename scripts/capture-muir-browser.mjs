import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import crypto from 'node:crypto';
import {chromium} from 'playwright';
import {MUIR_BASE_SHA,MUIR_VIEWPORTS,MUIR_FIXTURES} from '../analysis/muir/ui-fixtures/fixtures.mjs';

const root=path.resolve(import.meta.dirname,'..');
const outDir=path.join(root,'analysis','muir','screenshots');
const evidenceDir=path.join(root,'analysis','muir','evidence');
fs.mkdirSync(outDir,{recursive:true});
fs.mkdirSync(evidenceDir,{recursive:true});

const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webm':'video/webm','.svg':'image/svg+xml','.woff2':'font/woff2'};
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
const phoneIds=new Set(['phone-360','phone-primary','phone-412']);
const auxFixtureIds=new Set(['home-normal','result','player-actions-menu']);
const targets=[];
for(const fixture of MUIR_FIXTURES){
  for(const viewport of MUIR_VIEWPORTS){
    if(phoneIds.has(viewport.id)||auxFixtureIds.has(fixture.id))targets.push({fixture,viewport});
  }
}

const records=[];
const errors=[];
for(const {fixture,viewport} of targets){
  const context=await browser.newContext({viewport:{width:viewport.width,height:viewport.height},reducedMotion:'reduce'});
  const page=await context.newPage();
  const url=`http://127.0.0.1:${port}/analysis/muir/ui-fixtures/index.html?fixture=${encodeURIComponent(fixture.id)}&viewport=${encodeURIComponent(viewport.id)}`;
  try{
    await page.goto(url,{waitUntil:'networkidle',timeout:30000});
    await page.waitForFunction(()=>globalThis.__MUIR_READY__?.ready===true,null,{timeout:30000});
    if(fixture.id==='auto-running')await page.waitForTimeout(1500);
    else await page.waitForTimeout(150);
    const ready=await page.evaluate(()=>globalThis.__MUIR_READY__);
    const metrics=await page.evaluate(()=>globalThis.__MUIR_METRICS__);
    const png=await page.screenshot({fullPage:true,type:'png'});
    const hash=crypto.createHash('sha256').update(png).digest('hex');
    const name=`${MUIR_BASE_SHA.slice(0,12)}__${fixture.id}__${viewport.width}x${viewport.height}__${hash.slice(0,12)}.png`;
    fs.writeFileSync(path.join(outDir,name),png);
    records.push({fixtureId:fixture.id,surface:fixture.surface,viewportId:viewport.id,width:viewport.width,height:viewport.height,file:'analysis/muir/screenshots/'+name,sha256:hash,bytes:png.length,ready,metrics});
  }catch(error){
    errors.push({fixtureId:fixture.id,viewportId:viewport.id,error:String(error?.stack||error)});
  }finally{
    await context.close();
  }
}
await browser.close();
server.close();

const phoneCount=MUIR_FIXTURES.length*3;
const report={
  schema:'muir-browser-baseline-v1',
  baseSha:MUIR_BASE_SHA,
  generatedAt:new Date().toISOString(),
  targetCount:targets.length,
  expectedPhoneCaptures:phoneCount,
  captured:records.length,
  errors,
  records
};
fs.writeFileSync(path.join(evidenceDir,'browser-baseline.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({targetCount:targets.length,captured:records.length,errors:errors.length,output:'analysis/muir/evidence/browser-baseline.json'}));
if(errors.length)process.exitCode=1;
