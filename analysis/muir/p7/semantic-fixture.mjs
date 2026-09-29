import {mountGame} from '/web/game-ui.js';

const params=new URLSearchParams(location.search);
const variant=params.get('variant')||'news-long';
const route=params.get('route')||'Mundo';

const LONG_CLUB='ARG_SAN_MIGUEL_DE_TUCUMAN';
const OTHER_CLUB='ARG_BUENOS_AIRES';
const baseMatch={
  matchId:'fixture-public-match',
  date:'2029-03-18',
  homeAway:'home',
  result:{homeGoals:2,awayGoals:1,outcome:'win'},
  season:'2028-29',
  club:LONG_CLUB,
  competition:'league',
  opponent:OTHER_CLUB,
  available:true,
  selected:true,
  started:true,
  minutes:90,
  rating:8.2,
  goals:1,
  assists:1,
  cards:{yellow:0,red:0},
  statDeltas:{appearances:1,starts:1,minutes:90,goals:1,assists:1},
  sportDeltas:{formDelta:1,fatigueDelta:1,fitnessDelta:0,coachTrustDelta:0,roleScoreDelta:0},
  milestones:['first_goal']
};
const season={
  season:'2028-29',club:LONG_CLUB,age:25,role:null,roleScore:null,
  appearances:38,starts:31,minutes:2847,goals:14,assists:11,
  yellowCards:3,redCards:0,averageRating:7.4
};
const longPerson={id:'NPC_P7_LONG',name:"María-José D'Ávila de la Fuente y O'Connor",role:'Directora de desarrollo deportivo internacional'};
const knownPerson={id:'NPC_FAM_01',name:'Isabel Álvarez',role:'Madre'};

function baseView(){
  return {
    sessionId:'muir-p7-fixture',revision:7,screen:'career',offer:null,offerHistory:[],
    ageMilestones:[],careerSeasons:[],careerMilestones:{historyComplete:false,appearances:0,goals:0,assists:0},
    latestMatch:null,retirementStatus:'playing',player:{displayName:'Álex O’Connor-Sánchez'},
    date:'2029-03-20',age:25,club:LONG_CLUB,appearances:77,salaryMonthly:42500,decisionsMade:18,
    season:'2028-29',position:'midfielder',fitness:83,fatigue:21,form:76,contractMonths:18,
    news:[],contacts:[knownPerson,longPerson],decision:null,cutscene:null,result:null,resultCategory:null,
    journal:[],simulation:{mode:'idle',summary:null,interruption:null,maxWeeks:null,elapsedDays:0},
    actions:{available:false,unavailableReason:null,categories:[],history:[],lastResult:null}
  };
}
function makeView(name){
  const v=baseView();
  if(name==='news-long')v.news=[
    {date:'2029-03-20',text:'El mundo del fútbol continúa mientras tu carrera avanza.'},
    {date:'2029-03-19',text:"Crónica extensa: fútbol, presión y decisiones alrededor de un club con un nombre largo; también valida tildes, apóstrofos, guiones y caracteres como München, São Paulo y O’Connor sin alterar la información pública."}
  ];
  if(name==='news-empty')v.news=[];
  if(name==='match-full')v.latestMatch=structuredClone(baseMatch);
  if(name==='match-partial')v.latestMatch={...structuredClone(baseMatch),result:null,rating:null,milestones:[]};
  if(name==='match-empty')v.latestMatch=null;
  if(name==='season-long')v.careerSeasons=[
    {...season,season:'2026-27',appearances:4,starts:1,minutes:173,goals:0,assists:1,averageRating:null},
    structuredClone(season),
    {...season,season:'2029-30',appearances:9,starts:7,minutes:612,goals:2,assists:4,averageRating:7.1}
  ];
  if(name==='contract-zero'){v.contractMonths=0;v.salaryMonthly=0;}
  if(name==='person-long')v.contacts=[longPerson,knownPerson];
  if(name==='offer-loan'||name==='offer-nonloan'){
    const loan=name==='offer-loan';
    v.screen='offer';
    v.offer={
      id:'offer:p7-public',date:'2029-03-20',reason:loan?'Propuesta de cesión':'Propuesta de contrato',
      before:{club:'UDV',ownerClub:'UDV',registrationClub:'UDV',leagueTier:3,months:18,salary:42500,releaseClause:null,loan:false},
      terms:{club:LONG_CLUB,ownerClub:loan?OTHER_CLUB:LONG_CLUB,registrationClub:LONG_CLUB,leagueTier:2,months:loan?12:36,salary:51000,releaseClause:loan?null:9000000,loan}
    };
  }
  return v;
}
class FixtureGameSession{
  constructor(view){this.view=view;}
  static async migrateFromSave(raw){const parsed=JSON.parse(raw);return new FixtureGameSession(makeView(parsed.variant));}
  static async create(){return new FixtureGameSession(makeView(variant));}
  getView(){return structuredClone(this.view);}
  exportSnapshot(){return {variant};}
  async dispatch(){return {receipt:{},replayed:false,view:this.getView()};}
}
const key='muir.p7.semantic.'+variant;
localStorage.setItem(key,JSON.stringify({variant}));
const root=document.querySelector('#game').attachShadow({mode:'open'});
const [assets,css]=await Promise.all([fetch('/web/assets.json').then(r=>r.json()),fetch('/web/game-ui.css').then(r=>r.text())]);
mountGame({root,GameSession:FixtureGameSession,assets,css,storageKey:key,events:[]});
for(let i=0;i<160;i++){
  const main=root.querySelector('main');
  if(main&&main.getAttribute('aria-busy')==='false'&&root.querySelector('.navigation'))break;
  await new Promise(r=>setTimeout(r,25));
  if(i===159)throw Error('P7 fixture did not finish loading');
}
if(!variant.startsWith('offer-')){
  const button=[...root.querySelectorAll('.nav-button')].find(node=>node.textContent.trim()===route);
  if(!button)throw Error('P7 route button missing: '+route);
  button.click();
  await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
  const expected={Mundo:'El mundo sigue.',Carrera:'Tu carrera.',Perfil:'Tu perfil.',Relaciones:'Las personas de tu historia.'}[route];
  for(let i=0;i<80;i++){
    if(!expected||root.querySelector('main h1')?.textContent.trim()===expected)break;
    await new Promise(r=>setTimeout(r,20));
    if(i===79)throw Error('P7 fixture did not reach route: '+route);
  }
}else{
  for(let i=0;i<80;i++){
    if(root.querySelector('.offer-card'))break;
    await new Promise(r=>setTimeout(r,20));
    if(i===79)throw Error('P7 offer fixture did not reach OfferCard');
  }
}
globalThis.__MUIR_P7_READY__={ready:true,variant,route};
