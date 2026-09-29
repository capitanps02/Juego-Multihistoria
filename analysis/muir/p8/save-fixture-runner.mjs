// MUIR P8 Tu partida fixtures. TEST-ONLY local-save preparation; never used by production.
import {GameSession} from '/dist/session/game-session.js';
import {mountGame} from '/web/game-ui.js';
import {createIndexedSaveStore} from '/web/indexed-save-store.js';

const params=new URLSearchParams(location.search);
const scenario=params.get('scenario')||'save-standard';
const storageKey='muir.p8.'+scenario;
const events=[];
const sessionOptions={events};

const make=async(seed,id)=>GameSession.create(seed,{events,microfeeds:false,sessionId:id});
const raw=session=>JSON.stringify(session.exportSnapshot());
const first=await make(424242,'muir-p8-save-a');
const second=await make(424243,'muir-p8-save-b');
const firstRaw=raw(first);
const secondRaw=raw(second);

async function prepareIndexed({legacy=null,backup=false}={}){
  if(legacy!==null)localStorage.setItem(storageKey,legacy);
  const prep=createIndexedSaveStore({
    storage:localStorage,
    indexedDB:globalThis.indexedDB,
    key:storageKey,
    validate:value=>GameSession.migrateFromSave(value,sessionOptions)
  });
  if(legacy===null){
    await prep.write(first.exportSnapshot(),null);
    if(backup)await prep.write(second.exportSnapshot(),firstRaw);
  }else if(backup){
    // ensure() adopts the legacy save as active; the next valid write makes it the previous copy.
    await prep.write(second.exportSnapshot(),legacy);
  }
  await prep.close();
}

if(scenario==='save-standard')await prepareIndexed();
else if(scenario==='save-backup')await prepareIndexed({backup:true});
else if(scenario==='save-legacy')localStorage.setItem(storageKey,firstRaw);
else if(scenario==='save-full')await prepareIndexed({legacy:firstRaw,backup:true});
else throw Error('Unknown P8 save scenario: '+scenario);

const root=document.querySelector('#game').attachShadow({mode:'open'});
const [assets,css]=await Promise.all([
  fetch('/web/assets.json').then(r=>r.json()),
  fetch('/web/game-ui.css').then(r=>r.text())
]);
mountGame({root,GameSession,assets,css,storageKey,events});

async function settle(){
  for(let i=0;i<240;i++){
    const main=root.querySelector('main');
    if(main&&main.getAttribute('aria-busy')==='false'&&root.querySelector('.navigation'))return;
    await new Promise(r=>setTimeout(r,25));
  }
  throw Error('P8 Tu partida fixture did not settle');
}
async function clickNav(label){
  for(let i=0;i<160;i++){
    const button=[...root.querySelectorAll('.navigation button')].find(b=>b.textContent.trim()===label);
    if(button&&!button.disabled){
      button.click();
      await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
      return;
    }
    await new Promise(r=>setTimeout(r,20));
  }
  throw Error('P8 Tu partida nav missing: '+label);
}
await settle();await clickNav('Tu partida');await settle();

globalThis.__P8_SAVE_ROOT__=root;
globalThis.__P8_SAVE_SCENARIO__=scenario;
globalThis.__P8_SAVE_READY__={ready:true,scenario};
