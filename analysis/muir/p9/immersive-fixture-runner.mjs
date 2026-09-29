// MUIR P9 baseline fixtures. TEST-ONLY PlayerView overlays; never persisted to product authority.
import {GameSession} from '/dist/session/game-session.js';
import {mountGame} from '/web/game-ui.js';

const params=new URLSearchParams(location.search);
const scenario=params.get('scenario')||'decision-2';
const sessionId='muir-p9-'+scenario;
const storageKey='muir.p9.'+scenario;
const originalGetView=GameSession.prototype.getView;
const originalDispatch=GameSession.prototype.dispatch;
globalThis.__P9_COMMAND_LOG__=[];
GameSession.prototype.dispatch=function(command){
  globalThis.__P9_COMMAND_LOG__.push(structuredClone(command));
  return originalDispatch.call(this,command);
};
const clone=value=>structuredClone(value);
const terms=(club='ESP_LEON',salary=12000,months=12,extra={})=>({club,ownerClub:club,registrationClub:club,leagueTier:1,months,salary,releaseClause:null,loan:false,...extra});
const long='Esta decisión llega después de semanas de conversaciones, partidos y dudas. '.repeat(22).trim();
const labels=[
  'Seguir el plan del cuerpo técnico y esperar mi momento.',
  'Pedir una conversación directa antes de decidir.',
  'Buscar una alternativa que preserve mi sitio en el equipo.',
  'No mover ficha todavía y observar cómo evoluciona la situación.'
];

function baseDecision(count=2){
  return {
    instanceId:'p9-instance-1',family:'team',title:'Una conversación que puede cambiar el curso',body:'El entrenador quiere hablar contigo antes del siguiente partido.',
    memories:[],visible:['El entrenador ha pedido hablar contigo.'],uncertain:['No sabes todavía qué decisión tomará después de escucharte.'],
    choices:labels.slice(0,count).map((label,i)=>({id:['A','B','C','D'][i],label}))
  };
}
function publicOffer({loan=false,longClub=false,partial=false}={}){
  const before=terms('ESP_LEON',12000,8);
  const after=terms(longClub?'DEU_MONCHENGLADBACH':'ARG_SAN_MIGUEL_DE_TUCUMAN',partial?12000:18500,partial?8:30,loan?{loan:true,ownerClub:'ESP_LEON',registrationClub:'ARG_SAN_MIGUEL_DE_TUCUMAN'}:{});
  if(partial){after.releaseClause=undefined;after.ownerClub=undefined;}
  return {id:'offer:p9:1',date:'2031-06-20',reason:'Propuesta profesional',before,terms:after};
}
function apply(view){
  const v=clone(view);
  v.simulation={...v.simulation,mode:'idle'};
  v.cutscene=null;v.offer=null;v.decision=null;v.result=null;v.resultCategory=null;v.retirementStatus='playing';
  if(scenario.startsWith('decision-')){
    const suffix=scenario.slice('decision-'.length);
    v.screen='decision';v.decision=baseDecision(['2','3','4'].includes(suffix)?Number(suffix):4);
    if(suffix==='long')v.decision.body=long;
    if(suffix==='memory'){v.decision.memories=[{date:'2029-02-14',title:'La primera conversación',choiceLabel:'Esperar y observar',journalIndex:0}];}
    if(suffix==='uncertainty'){v.decision.visible=['El club ha confirmado la reunión.',long.slice(0,240)];v.decision.uncertain=['No conoces la propuesta final.','No sabes qué otros clubes han preguntado por ti.'];}
    if(['video','poster','missing','error'].includes(suffix))v.cutscene={eventId:'EVT_P9_FIXTURE',file:['video','poster'].includes(suffix)?'cutscene_evt_18_match_001_debut.webm':'missing-p9-cutscene.webm',title:'Escena de prueba P9'};
    return v;
  }
  if(scenario.startsWith('result-')){
    v.screen='result';v.result={title:'Después de tu decisión',choiceLabel:'Elegiste hablar primero',messages:['La conversación ya forma parte de tu historia.'],visibleEffects:[{label:'Forma',delta:1,favorable:true}],narrativeEffects:['El entrenador toma nota de tu postura.'],hiddenEffects:[]};
    if(scenario==='result-long'){v.result.messages=[long];v.result.narrativeEffects=[long.slice(0,700)];v.result.visibleEffects=[{label:'Forma',delta:1,favorable:true},{label:'Estado físico',delta:-0.5,favorable:false}];}
    if(scenario==='result-match'){v.resultCategory='match';v.appearances=117;v.form=76;v.fitness=88;}
    if(scenario==='result-message-only'){v.result.visibleEffects=[];v.result.narrativeEffects=[];v.result.hiddenEffects=[];v.result.messages=['No hay un cambio numérico público en este momento.','La decisión queda registrada en tu historia.'];}
    if(scenario==='result-mixed'){v.result.visibleEffects=[{label:'Forma',delta:1,favorable:true},{label:'Estado físico',delta:-1,favorable:false},{label:'Reputación',delta:0,favorable:null}];v.result.narrativeEffects=['El cuerpo técnico registra tu postura.'];v.result.hiddenEffects=['Hay consecuencias que todavía no son públicas.'];}
    return v;
  }
  if(scenario.startsWith('offer-')){
    v.screen='offer';v.offer=publicOffer({loan:scenario==='offer-loan',longClub:scenario==='offer-long-club',partial:scenario==='offer-partial'});return v;
  }
  if(scenario==='prologue'){v.screen='career';v.cutscene={eventId:'PROLOGUE',file:'missing-p9-prologue.webm',title:'Prólogo · Multihistoria'};return v;}
  if(scenario==='epilogue'){v.screen='epilogue';v.retirementStatus='closed';v.cutscene={eventId:'EPILOGUE',file:'cutscene_evt_ret_epilogue_despues_ruido.webm',title:'Después del ruido'};v.careerSeasons=[];return v;}
  throw Error('Unknown P9 scenario '+scenario);
}
GameSession.prototype.getView=function(){
  const base=originalGetView.call(this);
  return base.sessionId===sessionId?apply(base):base;
};
const base=await GameSession.create(424242,{events:[],microfeeds:false,sessionId});
localStorage.setItem(storageKey,JSON.stringify(base.exportSnapshot()));
const fixtureView=base.getView();
if(['decision-poster','epilogue'].includes(scenario)&&fixtureView.cutscene){
  const sceneKey=[fixtureView.sessionId,fixtureView.cutscene.file,fixtureView.screen,fixtureView.decisionsMade].join(':');
  localStorage.setItem(storageKey+'.watched-cutscenes.v1',JSON.stringify([sceneKey]));
}
const root=document.querySelector('#game').attachShadow({mode:'open'});
const [assets,css]=await Promise.all([fetch('/web/assets.json').then(r=>r.json()),fetch('/web/game-ui.css').then(r=>r.text())]);
const cutsceneUrl=clip=>{
  if(['decision-video','decision-poster'].includes(scenario))return '/web/assets/cutscenes/cutscene_evt_18_match_001_debut.webm';
  if(scenario==='epilogue')return '/web/assets/cutscenes/cutscene_evt_ret_epilogue_despues_ruido.webm';
  return '/analysis/muir/p9/missing/'+clip.file;
};
mountGame({root,GameSession,assets,css,storageKey,events:[],cutsceneUrl});
for(let i=0;i<180;i++){
  const main=root.querySelector('main');
  if(main&&main.getAttribute('aria-busy')==='false')break;
  await new Promise(r=>setTimeout(r,25));
}
globalThis.__P9_ROOT__=root;
globalThis.__P9_SCENARIO__=scenario;
globalThis.__P9_READY__={ready:true,scenario};
