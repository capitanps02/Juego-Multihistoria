// MUIR P7 browser fixtures. TEST-ONLY: overlays public PlayerView shapes after GameSession projection.
import {GameSession} from '/dist/session/game-session.js';
import {mountGame} from '/web/game-ui.js';

const params=new URLSearchParams(location.search);
const scenario=params.get('scenario')||'news-long';
const fixtures=await fetch('/analysis/muir/p7/semantic-fixtures.json').then(r=>r.json());
const sessionId='muir-p7-'+scenario;
const storageKey='muir.p7.'+scenario;
const originalGetView=GameSession.prototype.getView;

const people={
  long:{id:'P7_CONTACT_LONG',...fixtures.people.long},
  noImage:{id:'P7_CONTACT_NO_IMAGE',...fixtures.people.noPortrait},
  known:{id:'NPC_CCH_01',...fixtures.people.knownPortrait}
};

function clone(value){return structuredClone(value);}
function applyScenario(view){
  const v=clone(view);
  v.cutscene=null;
  v.offerHistory=[];
  if(scenario==='news-long')v.news=[clone(fixtures.news.short),clone(fixtures.news.long)];
  if(scenario==='news-empty')v.news=[];
  if(scenario==='match-complete')v.latestMatch=clone(fixtures.latestMatch.complete);
  if(scenario==='match-partial')v.latestMatch=clone(fixtures.latestMatch.partial);
  if(scenario==='match-empty')v.latestMatch=null;
  if(scenario==='season-complete')v.careerSeasons=[clone(fixtures.seasons.complete)];
  if(scenario==='season-partial')v.careerSeasons=[clone(fixtures.seasons.partial)];
  if(scenario==='season-many')v.careerSeasons=clone(fixtures.seasons.many);
  if(scenario.startsWith('contract-')){
    const key=scenario.slice('contract-'.length);
    const row=fixtures.contract[key==='zero'?'zeroMonths':key];
    v.club=row.club;v.salaryMonthly=row.salaryMonthly;v.contractMonths=row.contractMonths;
  }
  if(scenario.startsWith('offer-')){
    const key=scenario.slice('offer-'.length);
    v.screen='offer';v.offer=clone(fixtures.offer[key]);v.decision=null;v.result=null;
  }
  if(scenario==='person-long')v.contacts=[clone(people.long)];
  if(scenario==='person-no-image')v.contacts=[clone(people.noImage)];
  if(scenario==='person-image')v.contacts=[clone(people.known)];
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
  for(let i=0;i<160;i++){
    const main=root.querySelector('main');
    if(main&&main.getAttribute('aria-busy')==='false')return;
    await new Promise(r=>setTimeout(r,25));
  }
  throw Error('P7 fixture did not settle');
}
async function clickNav(label){
  for(let i=0;i<100;i++){
    const button=[...root.querySelectorAll('.navigation button')].find(b=>b.textContent.trim()===label);
    if(button&&!button.disabled){button.click();await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));return;}
    await new Promise(r=>setTimeout(r,20));
  }
  throw Error('P7 fixture nav missing: '+label);
}

await settle();
if(scenario.startsWith('news-'))await clickNav('Mundo');
else if(scenario.startsWith('person-'))await clickNav('Relaciones');
else if(scenario.startsWith('contract-'))await clickNav('Perfil');
else if(!scenario.startsWith('offer-'))await clickNav('Carrera');
await settle();

globalThis.__P7_ROOT__=root;
globalThis.__P7_SCENARIO__=scenario;
globalThis.__P7_READY__={ready:true,scenario,screen:GameSession.prototype.getView.call(base).screen};
