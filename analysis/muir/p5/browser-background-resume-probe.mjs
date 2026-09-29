import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const root=path.resolve(import.meta.dirname,'../../..');
const outDir=path.join(root,'analysis','muir','p5','evidence');
fs.mkdirSync(outDir,{recursive:true});
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
const results=[];
try{
  for(const fixture of ['auto-running','auto-paused']){
    const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
    const page=await context.newPage();
    try{
      await page.goto(`http://127.0.0.1:${port}/analysis/muir/ui-fixtures/index.html?fixture=${fixture}&viewport=phone-primary`,{waitUntil:'networkidle',timeout:30000});
      await page.waitForFunction(()=>globalThis.__MUIR_READY__?.ready===true,null,{timeout:30000});
      if(fixture==='auto-running')await page.evaluate(()=>globalThis.__MUIR_RELEASE_AUTO_TIMER__?.());
      await page.waitForTimeout(220);
      const before=await page.evaluate(async()=>({
        snapshot:await globalThis.__MUIR_READ_SAVED_SNAPSHOT__?.(),
        commands:structuredClone(globalThis.__MUIR_COMMAND_LOG__??[])
      }));
      const cdp=await context.newCDPSession(page);
      await cdp.send('Page.setWebLifecycleState',{state:'frozen'});
      await new Promise(resolve=>setTimeout(resolve,400));
      await cdp.send('Page.setWebLifecycleState',{state:'active'});
      await page.waitForTimeout(450);
      const after=await page.evaluate(async()=>{
        const root=document.querySelector('#game').shadowRoot;
        return {
          snapshot:await globalThis.__MUIR_READ_SAVED_SNAPSHOT__?.(),
          commands:structuredClone(globalThis.__MUIR_COMMAND_LOG__??[]),
          text:root.textContent,
          buttons:[...root.querySelectorAll('button')].map(b=>b.textContent.trim())
        };
      });
      assert(before.snapshot&&after.snapshot,fixture+' lifecycle snapshot missing');
      if(fixture==='auto-running'){
        const newCommands=after.commands.slice(before.commands.length);
        assert(newCommands.length>0,'running lifecycle did not resume logical progression');
        assert(newCommands.every(c=>c.type==='auto'&&c.action==='step'),'running lifecycle emitted a non-step command');
        for(let i=1;i<newCommands.length;i++)assert.equal(newCommands[i].expectedRevision,newCommands[i-1].expectedRevision+1,'duplicate or skipped command revision after resume');
        assert(after.snapshot.revision>before.snapshot.revision,'running lifecycle revision did not advance');
        assert(after.buttons.includes('Pausar simulación')||after.snapshot.autoSimulation?.mode!=='auto_simulating','running controls disappeared after lifecycle resume');
      }else{
        assert.equal(after.snapshot.autoSimulation?.mode,'paused','paused lifecycle resumed simulation unexpectedly');
        assert.deepEqual(after.commands,before.commands,'paused lifecycle emitted commands');
        assert(after.buttons.includes('Reanudar simulación'),'resume control missing after paused lifecycle');
        assert(after.buttons.includes('Terminar simulación'),'stop control missing after paused lifecycle');
      }
      results.push({
        fixture,
        before:{revision:before.snapshot.revision,mode:before.snapshot.autoSimulation?.mode,commands:before.commands.length},
        after:{revision:after.snapshot.revision,mode:after.snapshot.autoSimulation?.mode,commands:after.commands.length}
      });
    }finally{
      await context.close();
    }
  }
}finally{
  await browser.close();
  server.close();
}
const evidence={gate:'PASS',environment:'Playwright Chromium lifecycle smoke; not physical Android',android:'DEFERRED',results};
fs.writeFileSync(path.join(outDir,'p5-background-resume.json'),JSON.stringify(evidence,null,2)+'\n');
console.log(JSON.stringify(evidence));
