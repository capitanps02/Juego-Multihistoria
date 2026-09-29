import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const root=path.resolve(import.meta.dirname,'../../..');
const axePath=path.join(root,'node_modules','axe-core','axe.min.js');
assert(fs.existsSync(axePath),'axe-core is not installed');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webm':'video/webm','.svg':'image/svg+xml'};

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
const reports=[];
try{
  for(const viewport of [
    {id:'phone-360',width:360,height:800},
    {id:'phone-primary',width:390,height:844},
    {id:'phone-412',width:412,height:915}
  ]){
    const context=await browser.newContext({viewport:{width:viewport.width,height:viewport.height},reducedMotion:'reduce'});
    const page=await context.newPage();
    try{
      const url=`http://127.0.0.1:${port}/analysis/muir/ui-fixtures/index.html?fixture=home-normal&viewport=${viewport.id}`;
      await page.goto(url,{waitUntil:'networkidle',timeout:30000});
      await page.waitForFunction(()=>globalThis.__MUIR_READY__?.ready===true,null,{timeout:30000});
      await page.addScriptTag({path:axePath});
      const report=await page.evaluate(async()=>{
        const host=document.querySelector('#game');
        const root=host.shadowRoot;
        const targets=[root.querySelector('.topbar'),root.querySelector('.navigation')].filter(Boolean);
        const results=[];
        for(const target of targets){
          const r=await axe.run(target,{
            runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']},
            resultTypes:['violations']
          });
          results.push(...r.violations.map(v=>({
            id:v.id,
            impact:v.impact,
            help:v.help,
            nodes:v.nodes.map(n=>({impact:n.impact,target:n.target,summary:n.failureSummary}))
          })));
        }
        return results;
      });
      const severe=report.filter(v=>v.impact==='serious'||v.impact==='critical');
      assert.deepEqual(severe,[],viewport.id+' serious/critical AXE violations: '+JSON.stringify(severe));
      reports.push({viewport:viewport.id,violations:report.length,severe:severe.length,details:report});
    }finally{
      await context.close();
    }
  }
}finally{
  await browser.close();
  server.close();
}

const evidence={gate:'PASS',viewports:reports.length,reports};
const evidenceDir=path.join(root,'analysis','muir','p2','evidence');
fs.mkdirSync(evidenceDir,{recursive:true});
fs.writeFileSync(path.join(evidenceDir,'axe.json'),JSON.stringify(evidence,null,2)+'\n');
console.log(JSON.stringify(evidence));
