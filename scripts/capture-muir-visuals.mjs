import http from 'node:http';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import {spawn,spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {MUIR_BASE_SHA,MUIR_FIXTURES,MUIR_VIEWPORTS} from '../analysis/muir/ui-fixtures/fixtures.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const screenshotsDir=path.join(root,'analysis','muir','screenshots');
const evidenceDir=path.join(root,'analysis','muir','evidence');
await fsp.rm(screenshotsDir,{recursive:true,force:true});
await fsp.mkdir(screenshotsDir,{recursive:true});
await fsp.mkdir(evidenceDir,{recursive:true});

function findChrome(){
  const candidates=[process.env.CHROME_BIN,'google-chrome-stable','google-chrome','chromium-browser','chromium'].filter(Boolean);
  for(const candidate of candidates){
    if(candidate.includes(path.sep)&&fs.existsSync(candidate))return candidate;
    const found=spawnSync('which',[candidate],{encoding:'utf8'});
    if(found.status===0&&found.stdout.trim())return found.stdout.trim();
  }
  throw new Error('No Chrome/Chromium binary found. Set CHROME_BIN.');
}
const chrome=findChrome();
const versionResult=spawnSync(chrome,['--version'],{encoding:'utf8'});
const browserVersion=(versionResult.stdout||versionResult.stderr||'unknown').trim();

const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.webm':'video/webm','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml'};
const server=http.createServer(async(req,res)=>{
  try{
    if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405);res.end();return;}
    const pathname=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname);
    const rel=pathname.replace(/^\/+/, '');
    const file=path.resolve(root,rel);
    if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
    const stat=await fsp.stat(file);
    if(!stat.isFile()){res.writeHead(404);res.end();return;}
    const content=await fsp.readFile(file);
    res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Content-Length':content.length,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
    res.end(req.method==='HEAD'?undefined:content);
  }catch{res.writeHead(404);res.end('Not found');}
});
await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
const port=server.address().port;
const baseUrl=`http://127.0.0.1:${port}/analysis/muir/ui-fixtures/index.html`;

function viewportById(id){
  const value=MUIR_VIEWPORTS.find(v=>v.id===id);
  if(!value)throw new Error('Unknown viewport '+id);
  return value;
}
function runChrome(extraArgs,timeoutMs=60000){
  return new Promise(async(resolve,reject)=>{
    const profile=await fsp.mkdtemp(path.join(os.tmpdir(),'muir-chrome-'));
    const args=[
      '--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--disable-background-networking',
      '--disable-default-apps','--disable-extensions','--no-first-run','--mute-audio','--force-color-profile=srgb',
      '--force-device-scale-factor=1',`--user-data-dir=${profile}`,...extraArgs
    ];
    const child=spawn(chrome,args,{stdio:['ignore','pipe','pipe']});
    let stdout='',stderr='';
    child.stdout.setEncoding('utf8');child.stderr.setEncoding('utf8');
    child.stdout.on('data',chunk=>stdout+=chunk);child.stderr.on('data',chunk=>stderr+=chunk);
    const timer=setTimeout(()=>{child.kill('SIGKILL');},timeoutMs);
    child.on('error',async error=>{clearTimeout(timer);await fsp.rm(profile,{recursive:true,force:true});reject(error);});
    child.on('close',async code=>{
      clearTimeout(timer);await fsp.rm(profile,{recursive:true,force:true});
      if(code!==0){reject(new Error(`Chrome exited ${code}: ${stderr.slice(-2000)}`));return;}
      resolve({stdout,stderr});
    });
  });
}
function fixtureUrl(fixtureId,viewportId,freezeAuto=true){
  const url=new URL(baseUrl);
  url.searchParams.set('fixture',fixtureId);
  url.searchParams.set('viewport',viewportId);
  url.searchParams.set('freezeAuto',freezeAuto?'1':'0');
  return url.href;
}
function decodeEvidence(html){
  const match=html.match(/<output id="muir-meta"[^>]*>([^<]+)<\/output>/);
  if(!match)throw new Error('MUIR browser evidence marker missing');
  return JSON.parse(Buffer.from(match[1].trim(),'base64').toString('utf8'));
}
function pngDimensions(file){
  const buf=fs.readFileSync(file);
  if(buf.length<24||buf.toString('ascii',1,4)!=='PNG')throw new Error('Invalid PNG: '+file);
  return {width:buf.readUInt32BE(16),height:buf.readUInt32BE(20)};
}
const sha256=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');

const captureFixtureIds=MUIR_FIXTURES.filter(f=>f.id!=='cinematic-fallback').map(f=>f.id);
const multiViewportIds=['home-normal','home-pending-decision','home-offer','result','auto-running','period-summary','career','world','relations','profile','save','player-actions-detail','epilogue-retirement'];
const matrix=[];
for(const fixtureId of captureFixtureIds)matrix.push({fixtureId,viewportId:'phone-primary'});
for(const fixtureId of multiViewportIds)for(const viewportId of ['phone-360','phone-412'])matrix.push({fixtureId,viewportId});
matrix.push({fixtureId:'home-normal',viewportId:'landscape-check'},{fixtureId:'home-normal',viewportId:'tablet-check'});
const unique=[...new Map(matrix.map(row=>[`${row.fixtureId}|${row.viewportId}`,row])).values()];

const screenshots=[],metrics=[];
try{
  for(const row of unique){
    const vp=viewportById(row.viewportId);
    const rawName=`${MUIR_BASE_SHA.slice(0,12)}__${row.fixtureId}__${vp.width}x${vp.height}__raw.png`;
    const rawPath=path.join(screenshotsDir,rawName);
    await runChrome([
      `--window-size=${vp.width},${vp.height}`,'--run-all-compositor-stages-before-draw','--virtual-time-budget=3500',
      `--screenshot=${rawPath}`,fixtureUrl(row.fixtureId,row.viewportId,true)
    ]);
    const dimensions=pngDimensions(rawPath);
    if(dimensions.width!==vp.width||dimensions.height!==vp.height)throw new Error(`Screenshot dimension mismatch for ${row.fixtureId}/${row.viewportId}: ${dimensions.width}x${dimensions.height}`);
    const hash=sha256(rawPath);
    const finalName=`${MUIR_BASE_SHA.slice(0,12)}__${row.fixtureId}__${vp.width}x${vp.height}__${hash.slice(0,12)}.png`;
    const finalPath=path.join(screenshotsDir,finalName);
    await fsp.rename(rawPath,finalPath);
    screenshots.push({fixtureId:row.fixtureId,viewportId:row.viewportId,width:vp.width,height:vp.height,path:path.relative(root,finalPath),sha256:hash});

    if(row.viewportId==='phone-primary'||row.viewportId==='landscape-check'||row.viewportId==='tablet-check'){
      const liveAuto=row.fixtureId==='auto-running';
      const dump=await runChrome([
        `--window-size=${vp.width},${vp.height}`,'--virtual-time-budget=3500','--dump-dom',
        fixtureUrl(row.fixtureId,row.viewportId,!liveAuto)
      ]);
      const evidence=decodeEvidence(dump.stdout);
      if(!evidence.ready?.ready)throw new Error('Fixture did not reach MUIR ready state: '+row.fixtureId);
      metrics.push({fixtureId:row.fixtureId,viewportId:row.viewportId,...evidence});
    }
  }
}finally{
  await new Promise(resolve=>server.close(resolve));
}
const renderSamples=metrics.flatMap(row=>row.metrics.render?.samplesMs??[]).filter(Number.isFinite).sort((a,b)=>a-b);
const percentile=p=>renderSamples.length?renderSamples[Math.min(renderSamples.length-1,Math.ceil(renderSamples.length*p)-1)]:null;
const report={
  schema:'muir-browser-evidence-v1',
  baseSha:MUIR_BASE_SHA,
  branch:'ui-a0/muir-p0-baseline',
  generatedAt:new Date().toISOString(),
  browser:{binary:chrome,version:browserVersion},
  screenshots,
  metrics,
  skippedFixtures:[{fixtureId:'cinematic-fallback',reason:'Fail-closed by design until a real cutscene-bearing public view is reproducible; K-02 source/package-path probes remain authoritative and no PlayerView is fabricated.'}],
  aggregate:{
    screenshotCount:screenshots.length,
    metricCount:metrics.length,
    renderSampleCount:renderSamples.length,
    renderP50Ms:percentile(.5),
    renderP95Ms:percentile(.95),
    maxDomNodes:Math.max(0,...metrics.map(row=>row.metrics.domNodes??0)),
    maxLongTaskMs:Math.max(0,...metrics.flatMap(row=>row.metrics.longTasks??[]).map(x=>x.duration??0)),
    undersizedTouchTargetCount:metrics.reduce((sum,row)=>sum+(row.metrics.undersizedTouchTargets?.length??0),0),
    horizontalOverflowFindingCount:metrics.reduce((sum,row)=>sum+(row.metrics.overflowX?.length??0),0),
    autoSimUiUpdateRateHz:metrics.find(row=>row.fixtureId==='auto-running'&&row.viewportId==='phone-primary')?.metrics?.autoSimUiUpdateRateHz??null,
    totalFocusChanges:metrics.reduce((sum,row)=>sum+(row.metrics.focusChanges??0),0),
    totalScrollEvents:metrics.reduce((sum,row)=>sum+(row.metrics.scrollEvents??0),0)
  }
};
await fsp.writeFile(path.join(evidenceDir,'browser-metrics.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({browser:browserVersion,screenshots:report.aggregate.screenshotCount,metrics:report.aggregate.metricCount,renderP50Ms:report.aggregate.renderP50Ms,renderP95Ms:report.aggregate.renderP95Ms,output:'analysis/muir/evidence/browser-metrics.json'}));
