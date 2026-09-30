import {GameSession} from '/dist/session/game-session.js';
import {mountGame} from '/web/game-ui.js';

const params=new URLSearchParams(location.search);
const name=params.get('name')||'Leo';
const storageKey='muir.p12.id01.'+btoa(unescape(encodeURIComponent(name))).replace(/[^a-z0-9]/gi,'').slice(0,24);
const session=await GameSession.create(120012,{events:[],microfeeds:false,sessionId:'muir-p12-id01',playerDisplayName:name});
const view=session.getView();
if(view.cutscene?.eventId==='PROLOGUE'){
  const sceneKey=[view.sessionId,view.cutscene.file,view.screen,view.decisionsMade].join(':');
  localStorage.setItem(storageKey+'.watched-cutscenes.v1',JSON.stringify([sceneKey]));
}
localStorage.setItem(storageKey,JSON.stringify(session.exportSnapshot()));
const root=document.querySelector('#game').attachShadow({mode:'open'});
const [assets,css]=await Promise.all([fetch('/web/assets.json').then(r=>r.json()),fetch('/web/game-ui.css').then(r=>r.text())]);
mountGame({root,GameSession,assets,css,storageKey,events:[]});

async function settle(){
  for(let i=0;i<160;i++){
    const main=root.querySelector('main');
    if(main&&main.getAttribute('aria-busy')==='false')return;
    await new Promise(r=>setTimeout(r,25));
  }
  throw Error('P12 ID-01 fixture did not settle');
}
async function clickNav(label){
  for(let i=0;i<120;i++){
    const b=[...root.querySelectorAll('.navigation button')].find(x=>x.textContent.trim()===label);
    if(b&&!b.disabled){b.click();await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));await settle();return;}
    await new Promise(r=>setTimeout(r,20));
  }
  throw Error('P12 ID-01 nav missing: '+label);
}
await settle();
globalThis.__P12_ID01__={root,session,settle,clickNav,name,ready:true};
