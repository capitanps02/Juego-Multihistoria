// MUIR P8 Mundo fixtures. TEST-ONLY public PlayerView overlays; never persisted to production.
import {GameSession} from '/dist/session/game-session.js';
import {mountGame} from '/web/game-ui.js';

const params=new URLSearchParams(location.search);
const scenario=params.get('scenario')||'world-long';
const sessionId='muir-p8-'+scenario;
const storageKey='muir.p8.'+scenario;
const originalGetView=GameSession.prototype.getView;

const isoDay=offset=>{
  const d=new Date(Date.UTC(2026,8,29));d.setUTCDate(d.getUTCDate()+offset);return d.toISOString().slice(0,10);
};
const short={date:'2026-09-29',text:'El club completa la sesión del día.'};
const long={date:'2026-09-29',text:'Málaga, São Paulo y Mönchengladbach aparecen en una noticia pública deliberadamente extensa —con tildes, eñes y caracteres Unicode— para comprobar lectura móvil, saltos de línea y ausencia de desbordamiento horizontal.'};
const many=Array.from({length:80},(_,i)=>({date:isoDay(i-79),text:'Noticia pública '+String(i+1).padStart(2,'0')+' · contexto futbolístico visible para comprobar una carrera con un feed largo.'}));

function clone(value){return structuredClone(value);}
function applyScenario(view){
  const v=clone(view);v.cutscene=null;v.offerHistory=[];
  if(scenario==='world-empty')v.news=[];
  else if(scenario==='world-one')v.news=[clone(short)];
  else if(scenario==='world-long')v.news=[clone(long)];
  else if(scenario==='world-many')v.news=clone(many);
  else throw Error('Unknown P8 Mundo scenario: '+scenario);
  return v;
}
GameSession.prototype.getView=function(){
  const base=originalGetView.call(this);
  return base.sessionId===sessionId?applyScenario(base):base;
};

const base=await GameSession.create(424242,{events:[],microfeeds:false,sessionId});
localStorage.setItem(storageKey,JSON.stringify(base.exportSnapshot()));

const root=document.querySelector('#game').attachShadow({mode:'open'});
const [assets,css]=await Promise.all([
  fetch('/web/assets.json').then(r=>r.json()),
  fetch('/web/game-ui.css').then(r=>r.text())
]);
mountGame({root,GameSession,assets,css,storageKey,events:[]});

async function settle(){
  for(let i=0;i<180;i++){
    const main=root.querySelector('main');
    if(main&&main.getAttribute('aria-busy')==='false')return;
    await new Promise(r=>setTimeout(r,25));
  }
  throw Error('P8 Mundo fixture did not settle');
}
async function clickNav(label){
  for(let i=0;i<120;i++){
    const button=[...root.querySelectorAll('.navigation button')].find(b=>b.textContent.trim()===label);
    if(button&&!button.disabled){button.click();await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));return;}
    await new Promise(r=>setTimeout(r,20));
  }
  throw Error('P8 Mundo nav missing: '+label);
}

await settle();
await clickNav('Mundo');
await settle();

globalThis.__P8_WORLD_ROOT__=root;
globalThis.__P8_WORLD_SCENARIO__=scenario;
globalThis.__P8_WORLD_READY__={ready:true,scenario};
