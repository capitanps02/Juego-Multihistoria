// MUIR P0 browser harness. TEST-ONLY; never imported by production entrypoints.
import {GameSession} from '/dist/session/game-session.js';
import {mountGame} from '/web/game-ui.js';
import {MUIR_BASE_SHA,MUIR_VIEWPORTS,fixtureById} from '/analysis/muir/ui-fixtures/fixtures.mjs';
import {buildFixtureSession} from '/analysis/muir/ui-fixtures/session-recipes.mjs';

const params=new URLSearchParams(location.search);
const perf={renderSamples:[],longTasks:[],focusChanges:0,scrollEvents:0,uiMutationBatches:0,uiMutationRecords:0,startedAt:performance.now()};
let lastFocus=document.activeElement;
document.addEventListener('focusin',()=>{perf.focusChanges++;lastFocus=document.activeElement;},{capture:true});
addEventListener('scroll',()=>{perf.scrollEvents++;},{capture:true,passive:true});
if(globalThis.PerformanceObserver){
  try{const po=new PerformanceObserver(list=>{for(const e of list.getEntries())perf.longTasks.push({startTime:e.startTime,duration:e.duration});});po.observe({type:'longtask',buffered:true});}catch{}
}
const fixtureId=params.get('fixture')||'home-normal';
const fixture=fixtureById(fixtureId);
const viewport=params.get('viewport')||'phone-primary';
const viewportSpec=MUIR_VIEWPORTS.find(v=>v.id===viewport);
if(!viewportSpec)throw Error('Unknown viewport '+viewport);

document.documentElement.dataset.muirVisualTest='true';
const root=document.querySelector('#game').attachShadow({mode:'open'});
const [assets,css]=await Promise.all([
  fetch('/web/assets.json').then(r=>r.json()),
  fetch('/web/game-ui.css').then(r=>r.text())
]);

// Visual-test-only motion suppression. Production CSS is not modified.
const deterministicCss=css+`
:host,:host *,:host *::before,:host *::after{
 animation-duration:0s!important;
 animation-delay:0s!important;
 transition-duration:0s!important;
 transition-delay:0s!important;
 caret-color:transparent!important;
 scroll-behavior:auto!important;
}
`;

const session=await buildFixtureSession(fixture.recipe==='cinematic-missing-asset'?'home-pending-decision':fixtureId);
const snapshot=session.exportSnapshot();
const storageKey='muir.p0.'+MUIR_BASE_SHA.slice(0,12)+'.'+fixtureId;
localStorage.setItem(storageKey,JSON.stringify(snapshot));

const cutsceneUrl=clip=>{
  if(fixture.recipe==='cinematic-missing-asset')return '/analysis/muir/__missing_cutscene__.webm';
  return '/web/assets/cutscenes/'+clip.file;
};

const mountStarted=performance.now();
mountGame({root,GameSession,assets,css:deterministicCss,storageKey,cutsceneUrl});
perf.renderSamples.push(performance.now()-mountStarted);
const mutationObserver=new MutationObserver(records=>{perf.uiMutationBatches++;perf.uiMutationRecords+=records.length;});
mutationObserver.observe(root,{subtree:true,childList:true,characterData:true,attributes:true});

// Navigation is performed through the same buttons a player uses.
async function clickText(text){
  for(let i=0;i<80;i++){
    const buttons=[...root.querySelectorAll('button')];
    const b=buttons.find(x=>x.textContent.trim()===text);
    if(b&&!b.disabled){const started=performance.now();b.click();await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));perf.renderSamples.push(performance.now()-started);return;}
    await new Promise(r=>setTimeout(r,25));
  }
  throw Error('MUIR harness could not find enabled button: '+text);
}
async function clickCardButton(cardTitle,buttonText){
  for(let i=0;i<80;i++){
    const cards=[...root.querySelectorAll('.player-action-card')];
    const card=cards.find(node=>node.querySelector('h2')?.textContent.trim()===cardTitle);
    const b=card?[...card.querySelectorAll('button')].find(node=>node.textContent.trim()===buttonText):null;
    if(b&&!b.disabled){const started=performance.now();b.click();await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));perf.renderSamples.push(performance.now()-started);return;}
    await new Promise(r=>setTimeout(r,25));
  }
  throw Error('MUIR harness could not find enabled '+buttonText+' in card '+cardTitle);
}
async function settle(){
  for(let i=0;i<80;i++){
    const busy=root.querySelector('main')?.getAttribute('aria-busy');
    if(busy==='false'){await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));return;}
    await new Promise(r=>setTimeout(r,25));
  }
  throw Error('MUIR harness did not settle');
}
await settle();

if(fixture.route==='career')await clickText('Carrera');
else if(fixture.route==='world')await clickText('Mundo');
else if(fixture.route==='relations')await clickText('Relaciones');
else if(fixture.route==='profile')await clickText('Perfil');
else if(fixture.route==='save')await clickText('Tu partida');

if(fixture.recipe==='player-actions-menu')await clickText('Gestionar mi carrera');
if(fixture.recipe==='player-actions-category'){await clickText('Gestionar mi carrera');await clickText('Ver acciones');}
if(fixture.recipe==='player-actions-detail'){await clickText('Gestionar mi carrera');await clickText('Ver acciones');await clickText('Abrir');}
if(fixture.recipe==='player-actions-result'){
  // Reproduce a known target-free action through real UI navigation.
  // Do not synthesize private playerActionUi state.
  await clickText('Gestionar mi carrera');
  await clickCardButton('Entrenamiento','Ver acciones');
  await clickCardButton('Entrenamiento extra','Abrir');
  await clickText('Trabajo técnico');
  await settle();
}

const q=s=>[...root.querySelectorAll(s)];
const rect=n=>{const r=n.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,bottom:r.bottom,right:r.right};};
const buttons=q('button');
const touchTargets=buttons.map(b=>({text:b.textContent.trim().slice(0,80),disabled:b.disabled,...rect(b)}));
const undersizedTouchTargets=touchTargets.filter(x=>!x.disabled&&(x.width<44||x.height<44));
const heroNode=root.querySelector('.hero');
const primaryCta=buttons.find(b=>b.classList.contains('primary'));
const navNode=root.querySelector('.navigation');
const mainNode=root.querySelector('main');
const allNodes=q('*');
const overflowX=allNodes.filter(n=>n.scrollWidth>n.clientWidth+1).slice(0,50).map(n=>({tag:n.tagName,className:n.className,clientWidth:n.clientWidth,scrollWidth:n.scrollWidth}));
const navStyles=navNode?getComputedStyle(navNode):null;
const navButtons=q('.nav-button');
const navTypography=navButtons[0]?(()=>{const s=getComputedStyle(navButtons[0]);return {fontFamily:s.fontFamily,fontSize:s.fontSize,fontWeight:s.fontWeight,lineHeight:s.lineHeight};})():null;
const renderSorted=[...perf.renderSamples].sort((a,b)=>a-b);
const percentile=p=>renderSorted.length?renderSorted[Math.min(renderSorted.length-1,Math.ceil(renderSorted.length*p)-1)]:null;
const metrics={
  capturedAt:new Date().toISOString(),
  elapsedMs:performance.now()-perf.startedAt,
  domNodes:allNodes.length,
  render:{samplesMs:renderSorted,p50Ms:percentile(.5),p95Ms:percentile(.95),count:renderSorted.length},
  longTasks:perf.longTasks,
  focusChanges:perf.focusChanges,
  scrollEvents:perf.scrollEvents,
  uiMutationBatches:perf.uiMutationBatches,
  uiMutationRecords:perf.uiMutationRecords,
  uiMutationBatchesPerSecond:0,
  autoSimUiUpdateRateHz:null,
  viewportActual:{width:innerWidth,height:innerHeight,devicePixelRatio:devicePixelRatio||1},
  hero:heroNode?rect(heroNode):null,
  firstPrimaryCta:primaryCta?{text:primaryCta.textContent.trim(),...rect(primaryCta)}:null,
  main:mainNode?{...rect(mainNode),scrollHeight:mainNode.scrollHeight,clientHeight:mainNode.clientHeight,scrollTop:mainNode.scrollTop}:null,
  nav:navNode?{...rect(navNode),position:navStyles.position,paddingBottom:navStyles.paddingBottom}:null,
  navTypography,
  touchTargets,
  undersizedTouchTargets,
  overflowX
};
const refreshDynamicMetrics=()=>{
  metrics.elapsedMs=performance.now()-perf.startedAt;
  metrics.focusChanges=perf.focusChanges;
  metrics.scrollEvents=perf.scrollEvents;
  metrics.uiMutationBatches=perf.uiMutationBatches;
  metrics.uiMutationRecords=perf.uiMutationRecords;
  metrics.uiMutationBatchesPerSecond=metrics.elapsedMs>0?perf.uiMutationBatches/(metrics.elapsedMs/1000):0;
  metrics.autoSimUiUpdateRateHz=fixture.recipe==='auto-running'?metrics.uiMutationBatchesPerSecond:null;
};
refreshDynamicMetrics();
setInterval(refreshDynamicMetrics,100);
globalThis.__MUIR_METRICS__=metrics;
globalThis.__MUIR_READY__={
  baseSha:MUIR_BASE_SHA,
  fixtureId,
  viewport,
  viewportSpec,
  route:fixture.route,
  recipe:fixture.recipe,
  publicScreen:session.getView().screen,
  ready:true
};
