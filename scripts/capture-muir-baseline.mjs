import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { chromium } from 'playwright';
import { MUIR_BASE_SHA, MUIR_VIEWPORTS, MUIR_FIXTURES } from '../analysis/muir/ui-fixtures/fixtures.mjs';

const root=path.resolve(import.meta.dirname,'..');
const screenshotsDir=path.join(root,'analysis','muir','screenshots');
const evidenceDir=path.join(root,'analysis','muir','evidence');
fs.mkdirSync(screenshotsDir,{recursive:true});
fs.mkdirSync(evidenceDir,{recursive:true});

const mime=new Map([
 ['.html','text/html; charset=utf-8'],['.js','text/javascript; charset=utf-8'],['.mjs','text/javascript; charset=utf-8'],
 ['.css','text/css; charset=utf-8'],['.json','application/json; charset=utf-8'],['.png','image/png'],['.jpg','image/jpeg'],
 ['.jpeg','image/jpeg'],['.webm','video/webm'],['.svg','image/svg+xml']
]);
const server=http.createServer((req,res)=>{
 try{
  const url=new URL(req.url,'http://127.0.0.1');
  const rel=decodeURIComponent(url.pathname==='/'?'/analysis/muir/ui-fixtures/index.html':url.pathname);
  const file=path.resolve(root,'.'+rel);
  if(!file.startsWith(root+path.sep)){res.writeHead(403).end('forbidden');return;}
  const st=fs.statSync(file);
  if(!st.isFile()){res.writeHead(404).end('not found');return;}
  res.writeHead(200,{'content-type':mime.get(path.extname(file))||'application/octet-stream','cache-control':'no-store'});
  fs.createReadStream(file).pipe(res);
 }catch{res.writeHead(404).end('not found');}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const port=server.address().port;
const browser=await chromium.launch({headless:true});
const primaryIds=['phone-360','phone-primary','phone-412'];
const checkIds=['landscape-check','tablet-check'];
const viewportById=id=>MUIR_VIEWPORTS.find(v=>v.id===id);
const targets=[];
for(const fixture of MUIR_FIXTURES)for(const viewportId of primaryIds)targets.push({fixture,viewport:viewportById(viewportId),capture:true});
for(const viewportId of checkIds)targets.push({fixture:MUIR_FIXTURES.find(f=>f.id==='home-normal'),viewport:viewportById(viewportId),capture:true});

const records=[];
let failed=0;
for(const target of targets){
 const {fixture,viewport}=target;
 const page=await browser.newPage({viewport:{width:viewport.width,height:viewport.height},deviceScaleFactor:1});
 const errors=[];
 page.on('pageerror',e=>errors.push('pageerror: '+e.message));
 page.on('console',m=>{if(m.type()==='error')errors.push('console: '+m.text());});
 const url=`http://127.0.0.1:${port}/analysis/muir/ui-fixtures/index.html?fixture=${encodeURIComponent(fixture.id)}&viewport=${encodeURIComponent(viewport.id)}`;
 try{
  await page.goto(url,{waitUntil:'networkidle',timeout:45000});
  await page.waitForFunction(()=>globalThis.__MUIR_READY__?.ready===true,null,{timeout:45000});
  await page.waitForTimeout(250);
  const payload=await page.evaluate(()=>({ready:globalThis.__MUIR_READY__,metrics:globalThis.__MUIR_METRICS__}));
  const tmp=path.join(screenshotsDir,`tmp-${fixture.id}-${viewport.width}x${viewport.height}.png`);
  await page.screenshot({path:tmp,fullPage:true,animations:'disabled'});
  const bytes=fs.readFileSync(tmp);
  const sha=crypto.createHash('sha256').update(bytes).digest('hex');
  const name=`${MUIR_BASE_SHA.slice(0,12)}__${fixture.id}__${viewport.width}x${viewport.height}__${sha.slice(0,12)}.png`;
  const finalPath=path.join(screenshotsDir,name);
  fs.renameSync(tmp,finalPath);
  records.push({fixtureId:fixture.id,surface:fixture.surface,viewportId:viewport.id,width:viewport.width,height:viewport.height,screenshot:'analysis/muir/screenshots/'+name,sha256:sha,bytes:bytes.length,ready:payload.ready,metrics:payload.metrics,errors});
 }catch(error){
  failed++;
  records.push({fixtureId:fixture.id,surface:fixture.surface,viewportId:viewport.id,width:viewport.width,height:viewport.height,error:String(error),errors});
 }finally{await page.close();}
}
await browser.close();
server.close();

const report={
 schema:'muir-browser-baseline-v1',
 baseSha:MUIR_BASE_SHA,
 generatedAt:new Date().toISOString(),
 targetCount:targets.length,
 capturedCount:records.filter(r=>r.screenshot).length,
 failedCount:failed,
 primaryViewports:primaryIds,
 responsiveChecks:checkIds,
 records
};
fs.writeFileSync(path.join(evidenceDir,'browser-baseline.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({targets:targets.length,captured:report.capturedCount,failed,output:'analysis/muir/evidence/browser-baseline.json'}));
if(failed)process.exitCode=1;
