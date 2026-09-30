import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const rootDir=path.resolve(import.meta.dirname,'../../..');
const axePath=path.join(rootDir,'node_modules','axe-core','axe.min.js');
const names=['Leo','Alex Monteiro','Alejandro Fernandez-Ruiz',"Noa D'Avila",'Marta Álvarez','Alejandra Fernández-Rodríguez II'];
const ui=fs.readFileSync(path.join(rootDir,'web/game-ui.js'),'utf8');
const hardcoded=names.filter(name=>ui.includes(name));
assert.deepEqual(hardcoded,[],'hardcoded player identity literal in production UI');

const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webm':'video/webm','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{
  try{
    const url=new URL(req.url,'http://127.0.0.1');
    let rel=decodeURIComponent(url.pathname).replace(/^[/]+/,'');
    if(!rel)rel='analysis/muir/ui-fixtures/index.html';
    const file=path.resolve(rootDir,rel);
    if(!file.startsWith(rootDir+path.sep)&&file!==rootDir){res.writeHead(403);res.end('forbidden');return;}
    if(!fs.existsSync(file)||fs.statSync(file).isDirectory()){res.writeHead(404);res.end('not found');return;}
    res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');
    fs.createReadStream(file).pipe(res);
  }catch(error){res.writeHead(500);res.end(String(error));}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const port=server.address().port;
const browser=await chromium.launch({headless:true});
const viewports=[{id:'phone-360',width:360,height:800},{id:'phone-primary',width:390,height:844},{id:'phone-412',width:412,height:915}];
const records=[];

async function clickShadowText(page,text){
  await page.waitForFunction(t=>{
    const root=document.querySelector('#game')?.shadowRoot;
    return [...(root?.querySelectorAll('button')??[])].some(b=>b.textContent.trim()===t&&!b.disabled);
  },text,{timeout:30000});
  await page.evaluate(t=>{const root=document.querySelector('#game').shadowRoot;[...root.querySelectorAll('button')].find(b=>b.textContent.trim()===t&&!b.disabled).click();},text);
  await page.waitForTimeout(120);
}
async function settle(page){
  await page.waitForFunction(()=>document.querySelector('#game')?.shadowRoot?.querySelector('main')?.getAttribute('aria-busy')==='false',null,{timeout:30000});
  await page.waitForTimeout(100);
}

try{
  for(const viewport of viewports){
    for(let i=0;i<names.length;i++){
      const name=names[i];
      const context=await browser.newContext({viewport:{width:viewport.width,height:viewport.height},reducedMotion:'reduce'});
      const page=await context.newPage();
      try{
        await page.goto('http://127.0.0.1:'+port+'/analysis/muir/ui-fixtures/index.html?fixture=home-normal&viewport='+viewport.id,{waitUntil:'networkidle',timeout:30000});
        await page.waitForFunction(()=>globalThis.__MUIR_READY__?.ready===true,null,{timeout:30000});
        await clickShadowText(page,'Tu partida');await settle(page);
        await page.evaluate(({name,seed})=>{
          const root=document.querySelector('#game').shadowRoot;
          const nameInput=root.querySelector('input[aria-label="Nombre y apellido de la nueva carrera"]');
          const seedInput=root.querySelector('input[aria-label="Código de historia de la nueva carrera"]');
          nameInput.value=name;nameInput.dispatchEvent(new Event('input',{bubbles:true}));
          seedInput.value=String(seed);seedInput.dispatchEvent(new Event('input',{bubbles:true}));
        },{name,seed:120000+i});
        await clickShadowText(page,'Empezar otra carrera');
        await clickShadowText(page,'Confirmar');
        await settle(page);
        await page.waitForFunction(expected=>document.querySelector('#game')?.shadowRoot?.querySelector('.home-hero .player-name')?.textContent===expected,name,{timeout:30000});
        await page.addScriptTag({path:axePath});
        const home=await page.evaluate(async expected=>{
          const root=document.querySelector('#game').shadowRoot,main=root.querySelector('main'),node=root.querySelector('.home-hero .player-name'),hero=root.querySelector('.home-hero');
          const nr=node.getBoundingClientRect(),hr=hero.getBoundingClientRect();
          const axeResult=await axe.run(main,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']},resultTypes:['violations']});
          return {text:node.textContent,within:nr.left>=hr.left-1&&nr.right<=hr.right+1&&nr.top>=hr.top-1&&nr.bottom<=hr.bottom+1,overflow:[...main.querySelectorAll('*')].filter(n=>n.scrollWidth>n.clientWidth+1).length,serious:axeResult.violations.filter(v=>v.impact==='serious'||v.impact==='critical').length};
        },name);
        assert.deepEqual(home,{text:name,within:true,overflow:0,serious:0},viewport.id+' Home identity/a11y mismatch');

        await clickShadowText(page,'Perfil');await settle(page);
        const profile=await page.evaluate(async expected=>{
          const root=document.querySelector('#game').shadowRoot,main=root.querySelector('main'),input=main.querySelector('input[autocomplete="name"]');
          const axeResult=await axe.run(main,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']},resultTypes:['violations']});
          return {value:input?.value??null,overflow:[...main.querySelectorAll('*')].filter(n=>n.scrollWidth>n.clientWidth+1).length,serious:axeResult.violations.filter(v=>v.impact==='serious'||v.impact==='critical').length};
        },name);
        assert.deepEqual(profile,{value:name,overflow:0,serious:0},viewport.id+' Profile identity/a11y mismatch');

        let extreme=null;
        if(name===names.at(-1)){
          extreme=await page.evaluate(expected=>{
            const root=document.querySelector('#game').shadowRoot,main=root.querySelector('main');
            for(const node of [main,...main.querySelectorAll('*')]){const size=parseFloat(getComputedStyle(node).fontSize);if(Number.isFinite(size)&&size>0)node.style.fontSize=(size*1.8)+'px';}
            const input=main.querySelector('input[autocomplete="name"]'),r=input.getBoundingClientRect();
            return {value:input.value,usable:r.width>=44&&r.height>=44&&r.left>=0&&r.right<=innerWidth+1,overflow:[...main.querySelectorAll('*')].filter(n=>n.scrollWidth>n.clientWidth+1).length};
          },name);
          assert.deepEqual(extreme,{value:name,usable:true,overflow:0},viewport.id+' boundary identity failed at 180%');
        }
        records.push({viewport:viewport.id,name,home,profile,extreme});
      }finally{await context.close();}
    }
  }
}finally{await browser.close();server.close();}

const evidence={schema:'muir-p12-id01-browser-v1',gate:'PASS',names,boundaryName:names.at(-1),boundaryGraphemes:32,viewports:viewports.map(v=>v.id),hardcodedPlayerNames:hardcoded.length,axeSeriousCritical:0,horizontalOverflowFindings:0,records};
fs.mkdirSync(path.join(rootDir,'analysis/muir/p12/evidence'),{recursive:true});
fs.writeFileSync(path.join(rootDir,'analysis/muir/p12/evidence/id01-browser.json'),JSON.stringify(evidence,null,2)+'\n');
console.log(JSON.stringify({gate:'PASS',names:names.length,viewports:viewports.length,boundaryGraphemes:32,hardcodedPlayerNames:0},null,2));
