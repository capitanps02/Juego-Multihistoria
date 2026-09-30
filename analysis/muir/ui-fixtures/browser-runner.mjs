// MUIR P0 browser harness. TEST-ONLY; never imported by production entrypoints.
import {GameSession} from '/dist/session/game-session.js';
import {mountGame} from '/web/game-ui.js';
import {createIndexedSaveStore} from '/web/indexed-save-store.js';
import {MUIR_BASE_SHA,MUIR_VIEWPORTS,fixtureById} from '/analysis/muir/ui-fixtures/fixtures.mjs';
import {buildFixtureSession,fixtureEventCatalog} from '/analysis/muir/ui-fixtures/session-recipes.mjs';

const params=new URLSearchParams(location.search);
const perf={renderSamples:[],responseSamples:[],longTasks:[],focusChanges:0,scrollEvents:0,uiMutationBatches:0,uiMutationRecords:0,startedAt:performance.now()};
let lastFocus=document.activeElement;
document.addEventListener('focusin',()=>{perf.focusChanges++;lastFocus=document.activeElement;},{capture:true});
addEventListener('scroll',()=>{perf.scrollEvents++;},{capture:true,passive:true});
if(globalThis.PerformanceObserver){
  try{const po=new PerformanceObserver(list=>{for(const e of list.getEntries())perf.longTasks.push({startTime:e.startTime,duration:e.duration});});po.observe({type:'longtask',buffered:true});}catch{}
}
const nativeReplaceChildren=Element.prototype.replaceChildren;
Element.prototype.replaceChildren=function(...nodes){
  if(this.classList?.contains('mh')){
    const started=performance.now();
    const result=nativeReplaceChildren.apply(this,nodes);
    perf.renderSamples.push(performance.now()-started);
    return result;
  }
  return nativeReplaceChildren.apply(this,nodes);
};
const fixtureId=params.get('fixture')||'home-normal';
const fixture=fixtureById(fixtureId);
const viewport=params.get('viewport')||'phone-primary';
const viewportSpec=MUIR_VIEWPORTS.find(v=>v.id===viewport);
if(!viewportSpec)throw Error('Unknown viewport '+viewport);

const nativeSetTimeout=globalThis.setTimeout.bind(globalThis);
const nativeClearTimeout=globalThis.clearTimeout.bind(globalThis);
const AUTO_TIMER_SENTINEL=2147483001;
let autoTimerFrozen=fixtureId==='auto-running';
let frozenAutoCallback=null;
if(autoTimerFrozen){
  globalThis.setTimeout=(fn,ms,...args)=>{
    if(Number(ms)===140){frozenAutoCallback=()=>fn(...args);return AUTO_TIMER_SENTINEL;}
    return nativeSetTimeout(fn,ms,...args);
  };
  globalThis.clearTimeout=id=>id===AUTO_TIMER_SENTINEL?undefined:nativeClearTimeout(id);
}
function releaseAutoTimer(){
  if(!autoTimerFrozen)return;
  autoTimerFrozen=false;
  globalThis.setTimeout=nativeSetTimeout;
  globalThis.clearTimeout=nativeClearTimeout;
  const callback=frozenAutoCallback;
  frozenAutoCallback=null;
  if(callback)callback();
}

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

const session=await buildFixtureSession(fixtureId);
const snapshot=session.exportSnapshot();
const storageKey='muir.p0.'+MUIR_BASE_SHA.slice(0,12)+'.'+fixtureId;
localStorage.setItem(storageKey,JSON.stringify(snapshot));

// Pre-mark the prologue as watched for non-cinematic fixtures so baseline screens
// are not obscured by an autoplay presentation modal. This changes presentation
// preference only; it does not mutate GameSession, saves, RNG or narrative state.
const fixtureView=session.getView();
if(fixture.recipe!=='cinematic-missing-asset'&&fixtureView.cutscene?.eventId==='PROLOGUE'){
  const sceneKey=[fixtureView.sessionId,fixtureView.cutscene.file,fixtureView.screen,fixtureView.decisionsMade].join(':');
  localStorage.setItem(storageKey+'.watched-cutscenes.v1',JSON.stringify([sceneKey]));
}

const cutsceneUrl=clip=>{
  if(fixture.recipe==='cinematic-missing-asset')return '/analysis/muir/__missing_cutscene__.webm';
  return '/web/assets/cutscenes/'+clip.file;
};

const p5CommandLog=[];
const nativeSessionDispatch=GameSession.prototype.dispatch;
GameSession.prototype.dispatch=function(command){
  p5CommandLog.push({
    type:command?.type??null,
    action:command?.action??null,
    maxWeeks:command?.maxWeeks??null,
    expectedRevision:command?.expectedRevision??null
  });
  return nativeSessionDispatch.call(this,command);
};
globalThis.__MUIR_COMMAND_LOG__=p5CommandLog;
mountGame({root,GameSession,assets,css:deterministicCss,storageKey,cutsceneUrl,events:fixtureEventCatalog(fixtureId)});
const p5ProbeStore=createIndexedSaveStore({storage:localStorage,indexedDB,key:storageKey,validate:async()=>{}});
globalThis.__MUIR_READ_SAVED_SNAPSHOT__=async()=>{
  const raw=await p5ProbeStore.readRaw();
  return raw?JSON.parse(raw):null;
};
const mutationObserver=new MutationObserver(records=>{perf.uiMutationBatches++;perf.uiMutationRecords+=records.length;});
mutationObserver.observe(root,{subtree:true,childList:true,characterData:true,attributes:true});

// Navigation is performed through the same buttons a player uses.
async function clickText(text){
  for(let i=0;i<80;i++){
    const buttons=[...root.querySelectorAll('button')];
    const b=buttons.find(x=>x.textContent.trim()===text);
    if(b&&!b.disabled){const started=performance.now();b.click();await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));perf.responseSamples.push(performance.now()-started);return;}
    await new Promise(r=>setTimeout(r,25));
  }
  throw Error('MUIR harness could not find enabled button: '+text);
}
async function clickCardButton(cardTitle,buttonText){
  for(let i=0;i<80;i++){
    const cards=[...root.querySelectorAll('.player-action-card')];
    const card=cards.find(node=>node.querySelector('h2')?.textContent.trim()===cardTitle);
    const b=card?[...card.querySelectorAll('button')].find(node=>node.textContent.trim()===buttonText):null;
    if(b&&!b.disabled){const started=performance.now();b.click();await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));perf.responseSamples.push(performance.now()-started);return;}
    await new Promise(r=>setTimeout(r,25));
  }
  throw Error('MUIR harness could not find enabled '+buttonText+' in card '+cardTitle);
}
async function waitForSurface(predicate,label){
  for(let i=0;i<120;i++){
    if(predicate()){await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));return;}
    await new Promise(r=>setTimeout(r,25));
  }
  throw Error('MUIR harness did not reach surface: '+label);
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
if(root.textContent.includes('No se ha podido cargar el juego.'))throw Error('MUIR harness loaded fixture into the product save failure screen');

// The product intentionally reopens pending decision/offer/result in cinematic mode.
// Home-specific fixtures explicitly return to Inicio so they baseline the Home shell,
// while result/contract-offer retain the detailed cinematic surface.
if(fixture.id==='home-pending-decision'||fixture.id==='home-offer'){
  await clickText('Volver a Inicio');
  await waitForSurface(()=>Boolean(root.querySelector('.home-grid')),'home after closing cinematic');
}

if(fixture.route==='career')await clickText('Carrera');
else if(fixture.route==='world')await clickText('Mundo');
else if(fixture.route==='relations')await clickText('Relaciones');
else if(fixture.route==='profile')await clickText('Perfil');
else if(fixture.route==='save')await clickText('Tu partida');

if(fixture.recipe==='player-actions-menu')await clickText('Gestionar mi carrera');
if(fixture.recipe==='player-actions-category'){await clickText('Gestionar mi carrera');await clickCardButton('Entrenamiento','Ver acciones');}
if(fixture.recipe==='player-actions-detail'){await clickText('Gestionar mi carrera');await clickCardButton('Entrenamiento','Ver acciones');await clickCardButton('Entrenamiento extra','Abrir');}
if(fixture.recipe==='player-actions-category-unavailable'){await clickText('Gestionar mi carrera');await clickCardButton('Salud','Ver acciones');}
if(fixture.recipe==='player-actions-cooldown'){await clickText('Gestionar mi carrera');await clickCardButton('Entrenamiento','Ver acciones');}
if(fixture.recipe==='player-actions-detail-none'){await clickText('Gestionar mi carrera');await clickCardButton('Entrenamiento','Ver acciones');await clickCardButton('Entrenamiento extra','Abrir');}
if(fixture.recipe==='player-actions-detail-coach'){await clickText('Gestionar mi carrera');await clickCardButton('Carrera','Ver acciones');await clickCardButton('Hablar con entrenador','Abrir');}
if(fixture.recipe==='player-actions-detail-agent'){await clickText('Gestionar mi carrera');await clickCardButton('Representante','Ver acciones');await clickCardButton('Preguntar por mercado','Abrir');}
if(fixture.recipe==='player-actions-detail-teammate'){await clickText('Gestionar mi carrera');await clickCardButton('Relaciones','Ver acciones');await clickCardButton('Hablar con un compañero','Abrir');}
if(fixture.recipe==='player-actions-options'){await clickText('Gestionar mi carrera');await clickCardButton('Imagen','Ver acciones');await clickCardButton('Conceder entrevista','Abrir');}
if(fixture.recipe==='cinematic-missing-asset'){
  // PROLOGUE uses preload="none". Use the real product control, then explicitly call load()
  // so headless Chromium deterministically requests the deliberately missing WebM even when
  // synthetic DOM click activation is not treated as a trusted media-play gesture.
  await clickText('Reproducir prólogo con sonido');
  const prologueVideo=root.querySelector('dialog.prologue-dialog video');
  if(!prologueVideo)throw Error('MUIR prologue video element missing');
  prologueVideo.load();
  for(let i=0;i<160;i++){
    if(root.textContent.includes('No se ha podido cargar el prólogo. Puedes continuar con tu historia.'))break;
    await new Promise(r=>setTimeout(r,25));
    if(i===159)throw Error('MUIR prologue fallback message did not appear');
  }
}

if(fixture.recipe==='player-actions-result'){
  // Reproduce a known target-free action through real UI navigation.
  // Do not synthesize private playerActionUi state.
  await clickText('Gestionar mi carrera');
  await clickCardButton('Entrenamiento','Ver acciones');
  await clickCardButton('Entrenamiento extra','Abrir');
  await clickText('Trabajo técnico');
  await settle();
}


function requireSurface(condition,label){
  if(!condition)throw Error('MUIR visible-surface assertion failed: '+fixtureId+' -> '+label);
}
const visibleText=root.textContent;
const h1=root.querySelector('main h1')?.textContent.trim()??'';
switch(fixtureId){
  case 'home-normal':
    requireSurface(Boolean(root.querySelector('.home-grid')),'home grid');
    requireSurface(visibleText.includes('Lo que viene ahora'),'normal home next panel');
    requireSurface(!root.querySelector('dialog[open]'),'no autoplay modal');
    break;
  case 'home-pending-decision':
    requireSurface(Boolean(root.querySelector('.home-grid')),'home grid with pending decision');
    requireSurface([...root.querySelectorAll('button')].some(b=>b.textContent.trim()==='Una decisión te espera'),'pending-decision Home CTA');
    break;
  case 'auto-interruption':
    requireSurface(Boolean(root.querySelector('.decision-sheet')),'decision interruption sheet');
    requireSurface(visibleText.includes('UN MOMENTO QUE CUENTA'),'decision interruption eyebrow');
    break;
  case 'home-offer':
    requireSurface(Boolean(root.querySelector('.home-grid')),'home grid with offer');
    requireSurface([...root.querySelectorAll('button')].some(b=>b.textContent.trim()==='Revisar oferta'),'offer Home CTA');
    break;
  case 'contract-offer': {
    const offerLabels=[...root.querySelectorAll('.choices button')].map(b=>b.textContent.trim());
    for(const expected of ['Aceptar oferta','Rechazar oferta','Delegar esta oferta'])requireSurface(offerLabels.includes(expected),'contract action '+expected);
    break;
  }
  case 'result':
    requireSurface(visibleText.includes('DESPUÉS DE TU DECISIÓN'),'result sheet');
    requireSurface(Boolean(root.querySelector('[data-result-continue]')),'result continue action');
    break;
  case 'auto-running':
    requireSurface(visibleText.includes('Simulando el siguiente tramo…'),'running auto-sim status');
    requireSurface([...root.querySelectorAll('button')].some(b=>b.textContent.trim()==='Pausar simulación'),'pause auto-sim action');
    break;
  case 'auto-paused':
    requireSurface(visibleText.includes('Juego en pausa'),'paused status');
    requireSurface([...root.querySelectorAll('button')].some(b=>b.textContent.trim()==='Reanudar simulación'),'resume auto-sim action');
    break;
  case 'period-summary':
    requireSurface(Boolean(root.querySelector('.period-summary')),'period summary');
    requireSurface(visibleText.includes('Resumen del periodo'),'period summary heading');
    requireSurface([...root.querySelectorAll('button')].some(b=>b.textContent.trim()==='Seguir simulando'),'period summary continue action');
    break;
  case 'player-actions-menu':
    requireSurface(h1==='¿Qué quieres hacer?','player actions menu');
    requireSurface(root.querySelectorAll('.player-action-category-card').length===7,'seven public categories');
    break;
  case 'player-actions-category':
    requireSurface(h1==='Entrenamiento','training category');
    break;
  case 'player-actions-detail':
    requireSurface(h1==='Entrenamiento extra','training action detail');
    break;
  case 'player-actions-result':
    requireSurface(Boolean(root.querySelector('.player-action-result')),'player action result card');
    requireSurface(visibleText.includes('ACCIÓN COMPLETADA'),'player action result');
    requireSurface(visibleText.includes('Completas una sesión técnica adicional.'),'canonical public result text');
    requireSurface([...root.querySelectorAll('button')].some(b=>b.textContent.trim()==='Volver a Inicio'),'real Home destination label');
    break;
  case 'player-actions-category-unavailable':
    requireSurface(h1==='Salud','health unavailable category');
    requireSurface(visibleText.includes('No disponible'),'unavailable textual state');
    break;
  case 'player-actions-cooldown':
    requireSurface(h1==='Entrenamiento','training cooldown category');
    requireSurface(visibleText.includes('Cooldown activo'),'cooldown textual state');
    requireSurface(visibleText.includes('Disponible de nuevo el'),'exact public cooldown expiry');
    requireSurface(!visibleText.includes('próxima semana'),'no approximate cooldown');
    requireSurface(![...root.querySelectorAll('.player-action-reason')].some(node=>/\d{4}-\d{2}-\d{2}/.test(node.textContent)),'no duplicate ISO cooldown reason');
    break;
  case 'player-actions-detail-none':
    requireSurface(h1==='Entrenamiento extra','target-none detail');
    requireSurface(!root.querySelector('.player-action-targets'),'target-none has no empty selector');
    break;
  case 'player-actions-detail-coach':
    requireSurface(h1==='Hablar con entrenador','coach detail');
    requireSurface(root.querySelectorAll('.player-action-target').length>=1,'coach public target');
    break;
  case 'player-actions-detail-agent':
    requireSurface(h1==='Preguntar por mercado','agent detail');
    requireSurface(root.querySelectorAll('.player-action-target').length>=1,'agent public target');
    break;
  case 'player-actions-detail-teammate':
    requireSurface(h1==='Hablar con un compañero','teammate detail');
    requireSurface(root.querySelectorAll('.player-action-target').length>=1,'teammate public target');
    break;
  case 'player-actions-options':
    requireSurface(h1==='Conceder entrevista','options detail');
    for(const label of ['Tono humilde','Tono ambicioso','Poner al equipo primero'])requireSurface([...root.querySelectorAll('.player-action-options button')].some(b=>b.textContent.trim()===label),'canonical option '+label);
    break;
  case 'injury-public':
    requireSurface(Boolean(root.querySelector('.period-summary')),'injury period summary');
    requireSurface(visibleText.includes('Una lesión importante requiere atención.'),'important injury interruption');
    break;
  case 'career':
    requireSurface(h1==='Tu carrera.','career screen');
    break;
  case 'world':
    requireSurface(h1==='El mundo sigue.','world screen');
    break;
  case 'relations':
    requireSurface(h1==='Las personas de tu historia.','relations screen');
    break;
  case 'profile':
    requireSurface(h1==='Tu perfil.','profile screen');
    break;
  case 'save':
    requireSurface(h1==='Tu partida.','save screen');
    requireSurface(visibleText.includes('Partida actual'),'active save panel');
    break;
  case 'cinematic-fallback':
    requireSurface(Boolean(root.querySelector('dialog.prologue-dialog[open]')),'open prologue dialog');
    requireSurface(visibleText.includes('No se ha podido cargar el prólogo. Puedes continuar con tu historia.'),'prologue missing-media fallback');
    break;
  case 'epilogue-retirement':
    requireSurface(Boolean(root.querySelector('.home-grid')),'epilogue home surface');
    requireSurface(Boolean(root.querySelector('.retirement-panel')),'closed retirement panel');
    requireSurface(visibleText.includes('Una carrera para recordar'),'epilogue copy');
    break;
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
const percentile=(samples,p)=>samples.length?samples[Math.min(samples.length-1,Math.ceil(samples.length*p)-1)]:null;
const metrics={
  capturedAt:new Date().toISOString(),
  elapsedMs:performance.now()-perf.startedAt,
  domNodes:allNodes.length,
  render:{samplesMs:[],p50Ms:null,p95Ms:null,count:0,frequencyHz:0},
  response:{samplesMs:[],p50Ms:null,p95Ms:null,count:0},
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
  const renderSorted=[...perf.renderSamples].sort((a,b)=>a-b);
  const responseSorted=[...perf.responseSamples].sort((a,b)=>a-b);
  metrics.render={samplesMs:renderSorted,p50Ms:percentile(renderSorted,.5),p95Ms:percentile(renderSorted,.95),count:renderSorted.length,frequencyHz:metrics.elapsedMs>0?renderSorted.length/(metrics.elapsedMs/1000):0};
  metrics.response={samplesMs:responseSorted,p50Ms:percentile(responseSorted,.5),p95Ms:percentile(responseSorted,.95),count:responseSorted.length};
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
globalThis.__MUIR_RELEASE_AUTO_TIMER__=()=>releaseAutoTimer();
globalThis.__MUIR_START_AUTO_PROBE__=async()=>{
  if(fixtureId!=='auto-running')return;
  releaseAutoTimer();
};
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
