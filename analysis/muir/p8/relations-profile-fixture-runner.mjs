// MUIR P8 Relaciones/Perfil fixtures. TEST-ONLY public PlayerView overlays; never persisted to production.
import {GameSession} from '/dist/session/game-session.js';
import {mountGame} from '/web/game-ui.js';

const params=new URLSearchParams(location.search);
const scenario=params.get('scenario')||'relations-long';
const sessionId='muir-p8-'+scenario;
const storageKey='muir.p8.'+scenario;
const originalGetView=GameSession.prototype.getView;

const contacts={
  one:[{id:'NPC_CCH_01',name:'Lucía Martín',role:'Entrenadora'}],
  long:[{id:'P8_CONTACT_LONG',name:'Alejandra María de los Ángeles Fernández-Rodríguez',role:'Directora deportiva internacional'}],
  many:Array.from({length:24},(_,i)=>({id:'P8_CONTACT_'+String(i+1).padStart(2,'0'),name:'Contacto público '+String(i+1).padStart(2,'0'),role:i%3===0?'Entrenador':i%3===1?'Compañero':'Representante'}))
};

function clone(value){return structuredClone(value);}
function applyScenario(view){
  const v=clone(view);v.cutscene=null;v.offer=null;
  if(scenario==='relations-empty')v.contacts=[];
  else if(scenario==='relations-one')v.contacts=clone(contacts.one);
  else if(scenario==='relations-long')v.contacts=clone(contacts.long);
  else if(scenario==='relations-many')v.contacts=clone(contacts.many);
  else if(scenario==='profile-standard'){
    v.player={displayName:'Álex Martín'};v.age=24;v.position='winger';v.club='ESP_LEON';v.appearances=91;v.salaryMonthly=14000;v.contractMonths=18;v.form=74;v.fitness=83;v.fatigue=27;
  }else if(scenario==='profile-long'){
    v.player={displayName:'Álex Fernández-Rodríguez'};v.age=34;v.position='midfielder';v.club='ARG_SAN_MIGUEL_DE_TUCUMAN';v.appearances=512;v.salaryMonthly=24500;v.contractMonths=5;v.form=92;v.fitness=76;v.fatigue=38;
  }else if(scenario==='profile-contract-zero'){
    v.player={displayName:'María O’Neill-Sáez'};v.age=29;v.position='defender';v.club='DEU_MONCHENGLADBACH';v.appearances=238;v.salaryMonthly=0;v.contractMonths=0;v.form=61;v.fitness=69;v.fatigue=54;
  }else if(!scenario.startsWith('relations-'))throw Error('Unknown P8 Relaciones/Perfil scenario: '+scenario);
  return v;
}
GameSession.prototype.getView=function(){
  const base=originalGetView.call(this);
  return base.sessionId===sessionId?applyScenario(base):base;
};

const base=await GameSession.create(424242,{events:[],microfeeds:false,sessionId});
localStorage.setItem(storageKey,JSON.stringify(base.exportSnapshot()));
const root=document.querySelector('#game').attachShadow({mode:'open'});
const [assets,css]=await Promise.all([fetch('/web/assets.json').then(r=>r.json()),fetch('/web/game-ui.css').then(r=>r.text())]);
mountGame({root,GameSession,assets,css,storageKey,events:[]});

async function settle(){
  for(let i=0;i<180;i++){
    const main=root.querySelector('main');
    if(main&&main.getAttribute('aria-busy')==='false')return;
    await new Promise(r=>setTimeout(r,25));
  }
  throw Error('P8 Relaciones/Perfil fixture did not settle');
}
async function clickNav(label){
  for(let i=0;i<120;i++){
    const button=[...root.querySelectorAll('.navigation button')].find(b=>b.textContent.trim()===label);
    if(button&&!button.disabled){button.click();await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));return;}
    await new Promise(r=>setTimeout(r,20));
  }
  throw Error('P8 Relaciones/Perfil nav missing: '+label);
}
await settle();await clickNav(scenario.startsWith('relations-')?'Relaciones':'Perfil');await settle();
globalThis.__P8_RP_ROOT__=root;
globalThis.__P8_RP_SCENARIO__=scenario;
globalThis.__P8_RP_READY__={ready:true,scenario};
