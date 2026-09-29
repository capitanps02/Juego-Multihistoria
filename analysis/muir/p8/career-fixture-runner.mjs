// MUIR P8 Carrera fixtures. TEST-ONLY public PlayerView overlays; never persisted to production.
import {GameSession} from '/dist/session/game-session.js';
import {mountGame} from '/web/game-ui.js';

const params=new URLSearchParams(location.search);
const scenario=params.get('scenario')||'career-many-seasons';
const sessionId='muir-p8-'+scenario;
const storageKey='muir.p8.'+scenario;
const originalGetView=GameSession.prototype.getView;
const clubs=['ESP_LEON','ARG_SAN_MIGUEL_DE_TUCUMAN','DEU_MONCHENGLADBACH'];

const season=(i)=>{
  const year=2026+i;
  return {
    season:String(year)+'-'+String((year+1)%100).padStart(2,'0'),
    club:clubs[i%clubs.length],
    appearances:18+(i%17),
    starts:10+(i%13),
    minutes:900+i*83,
    goals:i%12,
    assists:(i*2)%10,
    averageRating:i%4===0?null:6.4+(i%8)/10,
    age:18+i,
    role:null,
    roleScore:null
  };
};
const seasons=Array.from({length:20},(_,i)=>season(i));
const latest={
  matchId:'match:p8-career-latest',date:'2045-05-18',homeAway:'home',
  result:{homeGoals:2,awayGoals:1},season:'2044-45',club:'ARG_SAN_MIGUEL_DE_TUCUMAN',
  competition:'league',opponent:'DEU_MONCHENGLADBACH',available:true,selected:true,started:true,
  minutes:90,rating:8.2,goals:1,assists:1,cards:{yellow:0,red:0},statDeltas:{appearances:1,starts:1,minutes:90,goals:1,assists:1},sportDeltas:{},milestones:['appearance_500']
};
const milestones={
  historyComplete:true,appearances:520,goals:121,assists:96,yellowCards:42,redCards:2,
  appearance10:true,appearance50:true,appearance100:true,appearance500:true,appearance700:false,nextAppearanceOrdinal:521
};
const ageMilestones=[20,23,26,30,34].map((age,i)=>({age,date:String(2028+i*3)+'-07-01',club:clubs[i%clubs.length]}));
const terms=(club,salary,months)=>({club,ownerClub:club,registrationClub:club,leagueTier:1,months,salary,releaseClause:null,loan:false});
const offers=Array.from({length:4},(_,i)=>({
  offer:{id:'offer:p8:'+i,date:'203'+i+'-06-15',reason:'Propuesta profesional '+(i+1),before:terms(clubs[i%clubs.length],12000+i*2000,6),terms:terms(clubs[(i+1)%clubs.length],18000+i*3000,24+i*6)},
  action:i%2?'accept':'reject',accepted:Boolean(i%2),explanation:i%2?'Aceptaste esta propuesta.':'Rechazaste esta propuesta.'
}));
const journal=Array.from({length:35},(_,i)=>({date:'20'+String(27+Math.floor(i/4)).padStart(2,'0')+'-'+String((i%12)+1).padStart(2,'0')+'-10',title:'Decisión pública '+(i+1),choiceLabel:'Opción elegida '+(i+1),messages:['Consecuencia visible de la decisión '+(i+1)+'.']}));
const actionHistory=Array.from({length:25},(_,i)=>({date:'20'+String(28+Math.floor(i/4)).padStart(2,'0')+'-'+String((i%12)+1).padStart(2,'0')+'-15',actionLabel:'Acción voluntaria '+(i+1),optionLabel:'Opción '+(i+1),text:'Resultado público de la acción '+(i+1)+'.'}));

function clone(value){return structuredClone(value);}
function clear(v){
  v.cutscene=null;v.offer=null;v.offerHistory=[];v.careerSeasons=[];v.latestMatch=null;v.ageMilestones=[];v.journal=[];
  v.careerMilestones={historyComplete:false,appearances:null,goals:null,assists:null,yellowCards:null,redCards:null,appearance10:null,appearance50:null,appearance100:null,appearance500:null,appearance700:null,nextAppearanceOrdinal:null};
  if(v.actions)v.actions={...v.actions,history:[]};
  v.retirementStatus='playing';
  return v;
}
function applyScenario(view){
  const v=clear(clone(view));
  if(scenario==='career-early'){v.appearances=0;return v;}
  if(scenario==='career-season'){v.careerSeasons=[clone(seasons[0])];return v;}
  if(scenario==='career-many-seasons'){v.careerSeasons=clone(seasons);v.latestMatch=clone(latest);return v;}
  if(scenario==='career-milestones'){v.careerSeasons=clone(seasons.slice(0,8));v.careerMilestones=clone(milestones);v.ageMilestones=clone(ageMilestones);return v;}
  if(scenario==='career-latest-match'){v.careerSeasons=clone(seasons.slice(0,4));v.latestMatch=clone(latest);return v;}
  if(scenario==='career-offers'){v.careerSeasons=clone(seasons.slice(0,6));v.offerHistory=clone(offers);return v;}
  if(scenario==='career-timeline'){v.careerSeasons=clone(seasons.slice(0,10));v.journal=clone(journal);if(v.actions)v.actions={...v.actions,history:clone(actionHistory)};return v;}
  if(scenario==='career-retirement'){v.careerSeasons=clone(seasons);v.latestMatch=clone(latest);v.careerMilestones=clone(milestones);v.ageMilestones=clone(ageMilestones);v.offerHistory=clone(offers);v.journal=clone(journal.slice(-10));if(v.actions)v.actions={...v.actions,history:clone(actionHistory.slice(-8))};v.retirementStatus='closed';return v;}
  throw Error('Unknown P8 Carrera scenario: '+scenario);
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
  throw Error('P8 Carrera fixture did not settle');
}
async function clickNav(label){
  for(let i=0;i<120;i++){
    const button=[...root.querySelectorAll('.navigation button')].find(b=>b.textContent.trim()===label);
    if(button&&!button.disabled){button.click();await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));return;}
    await new Promise(r=>setTimeout(r,20));
  }
  throw Error('P8 Carrera nav missing: '+label);
}
await settle();await clickNav('Carrera');await settle();
globalThis.__P8_CAREER_ROOT__=root;
globalThis.__P8_CAREER_SCENARIO__=scenario;
globalThis.__P8_CAREER_READY__={ready:true,scenario};
