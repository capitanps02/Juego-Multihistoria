import {GameSession} from '/dist/session/game-session.js';
import {createIndexedSaveStore} from './indexed-save-store.js';
const report=document.querySelector('#report'),button=document.querySelector('#run');
const eq=(a,b)=>{if(JSON.stringify(a)!==JSON.stringify(b))throw Error('Los estados difieren');};
button.onclick=async()=>{
 button.disabled=true;const result={passed:false,cases:[]},stores=[];
 try{
  const before=await fetch('./qa-offer-fixture.json').then(r=>r.text());
  for(const action of ['accept','reject','delegate'])for(const stage of ['before-put','after-put-queued','after-put-success','after-complete']){
   report.textContent=action+' · '+stage;
   const key='multihistoria.qa.t24.'+crypto.randomUUID();let fault=null;
   const store=createIndexedSaveStore({storage:{getItem:()=>null},indexedDB,key,validate:raw=>GameSession.fromSave(raw),fault:(point,tx)=>{if(point===fault){if(point!=='after-complete')tx.abort();throw Error('Injected');}}});stores.push(store);
   await store.write(JSON.parse(before),null);
   const s=await GameSession.fromSave(before,{commit:next=>store.write(next,before)}),ref=await GameSession.fromSave(before),v=s.getView();
   const c={type:'offer',offerId:v.offer.id,action,commandId:crypto.randomUUID(),expectedRevision:v.revision};
   await ref.dispatch(c);const after=JSON.stringify(ref.exportSnapshot());
   fault=stage;let failed=false;try{await s.dispatch(c);}catch{failed=true;}if(!failed)throw Error('No se propagó el fallo');
   eq(JSON.stringify(s.exportSnapshot()),before);await store.close();eq(await store.read(),stage==='after-complete'?after:before);
   fault=null;await s.dispatch(c);eq(await store.read(),after);eq(await store.previous(),before);
   const restored=await GameSession.fromSave(await store.read());const replay=await restored.dispatch(c);eq(replay.replayed,true);eq(JSON.stringify(restored.exportSnapshot()),after);
   result.cases.push({action,stage,passed:true});
  }
  result.passed=true;
 }catch(e){result.error=e.stack;}finally{for(const store of stores)await store.close();report.textContent=JSON.stringify(result,null,2);button.disabled=false;}
};
