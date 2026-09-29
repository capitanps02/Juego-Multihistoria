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

async function openHome(page,id){
  await page.goto(`http://127.0.0.1:${port}/analysis/muir/ui-fixtures/index.html?fixture=home-normal&viewport=${id}`,{waitUntil:'networkidle',timeout:30000});
  await page.waitForFunction(()=>globalThis.__MUIR_READY__?.ready===true,null,{timeout:30000});
}

try{
  for(const viewport of [
    {id:'phone-360',width:360,height:800},
    {id:'phone-primary',width:390,height:844},
    {id:'phone-412',width:412,height:915}
  ]){
    const context=await browser.newContext({viewport:{width:viewport.width,height:viewport.height},reducedMotion:'reduce'});
    const page=await context.newPage();
    try{
      await openHome(page,viewport.id);
      await page.addScriptTag({path:axePath});
      const base=await page.evaluate(async()=>{
        const root=document.querySelector('#game').shadowRoot;
        const help=root.querySelector('.home-help');
        const summary=help?.querySelector('summary');
        const body=help?.querySelector('.tutorial-body');
        const axeResult=await axe.run(root.querySelector('main'),{
          runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']},
          resultTypes:['violations']
        });
        return {
          helpExists:Boolean(help),
          helpOpen:help?.open??null,
          summary:summary?.textContent.trim()??'',
          summaryHeight:summary?.getBoundingClientRect().height??0,
          summaryTabIndex:summary?.tabIndex??-1,
          bodyVisible:body?getComputedStyle(body).display!=='none'&&body.getClientRects().length>0:false,
          glossaryExists:Boolean(help?.querySelector('.tutorial-glossary')),
          serious:axeResult.violations.filter(v=>v.impact==='serious'||v.impact==='critical').map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.length})),
          operationalText:root.textContent
        };
      });
      assert.equal(base.helpExists,true,viewport.id+' contextual help missing');
      assert.equal(base.helpOpen,false,viewport.id+' help must be optional/closed by default');
      assert.equal(base.summary,'Cómo se juega',viewport.id+' help accessible label mismatch');
      assert(base.summaryHeight>=48,viewport.id+' help summary touch target below 48px');
      assert(base.summaryTabIndex>=0,viewport.id+' help summary is not keyboard focusable');
      assert.equal(base.bodyVisible,false,viewport.id+' help body occupies permanent Home space');
      assert.equal(base.glossaryExists,false,viewport.id+' duplicated glossary remains in Home help');
      assert.deepEqual(base.serious,[],viewport.id+' serious/critical AXE violations: '+JSON.stringify(base.serious));
      await page.evaluate(()=>{
        const root=document.querySelector('#game').shadowRoot;
        const button=[...root.querySelectorAll('.next button')].find(b=>b.textContent.trim()==='Gestionar mi carrera');
        if(!button)throw Error('optional Player Actions entry missing');
        button.click();
      });
      await page.waitForTimeout(50);
      const optionality=await page.evaluate(()=>document.querySelector('#game').shadowRoot.querySelector('main')?.textContent??'');
      assert(optionality.includes('Opcional: entra sólo si quieres hacer algo antes de simular.'),viewport.id+' Player Actions optionality wording missing');

      await openHome(page,viewport.id);
      await page.evaluate(()=>{
        const root=document.querySelector('#game').shadowRoot;
        root.querySelector('.home-help summary').click();
      });
      const opened=await page.evaluate(()=>{
        const root=document.querySelector('#game').shadowRoot;
        const help=root.querySelector('.home-help');
        const body=help.querySelector('.tutorial-body');
        return {open:help.open,bodyVisible:getComputedStyle(body).display!=='none'&&body.getClientRects().length>0,text:body.textContent.trim()};
      });
      assert.equal(opened.open,true,viewport.id+' contextual help did not open');
      assert.equal(opened.bodyVisible,true,viewport.id+' contextual help content unavailable');
      assert(opened.text.includes('Decide cuando aparezca un momento importante.'),viewport.id+' core help meaning missing');

      const scales=[];
      for(const factor of [1,1.3,1.8]){
        await openHome(page,viewport.id);
        const metric=await page.evaluate(factor=>{
          const root=document.querySelector('#game').shadowRoot;
          const main=root.querySelector('main');
          const nodes=[main,...main.querySelectorAll('*')];
          if(factor!==1){
            for(const node of nodes){
              const size=parseFloat(getComputedStyle(node).fontSize);
              if(Number.isFinite(size)&&size>0)node.style.fontSize=(size*factor)+'px';
            }
          }
          const overflow=[...main.querySelectorAll('*')].filter(n=>n.scrollWidth>n.clientWidth+1).slice(0,20).map(n=>({tag:n.tagName,className:n.className,text:n.textContent.trim().slice(0,80),clientWidth:n.clientWidth,scrollWidth:n.scrollWidth}));
          const help=root.querySelector('.home-help');
          const summary=help.querySelector('summary');
          return {factor,overflow,summaryHeight:summary.getBoundingClientRect().height};
        },factor);
        assert.deepEqual(metric.overflow,[],viewport.id+' horizontal overflow at '+factor+'x text: '+JSON.stringify(metric.overflow));
        assert(metric.summaryHeight>=48,viewport.id+' help target below 48px at '+factor+'x text');
        scales.push(metric);
      }
      reports.push({viewport:viewport.id,base,opened,scales});
    }finally{await context.close();}
  }
}finally{
  await browser.close();
  server.close();
}

const evidence={gate:'PASS',viewports:reports.length,textScales:['100%','130%','180%'],reports};
const dir=path.join(root,'analysis','muir','p4','evidence');
fs.mkdirSync(dir,{recursive:true});
fs.writeFileSync(path.join(dir,'p4-a11y-help.json'),JSON.stringify(evidence,null,2)+'\n');
console.log(JSON.stringify(evidence));
