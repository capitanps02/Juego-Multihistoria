import {GameSession} from '/dist/session/game-session.js';
import {createIndexedSaveStore} from './indexed-save-store.js';
const status=document.querySelector('#status'),report=document.querySelector('#report'),button=document.querySelector('#run');
const equal=(a,b,label)=>{if(JSON.stringify(a)!==JSON.stringify(b))throw Error(label);};
const rejects=async(fn,label)=>{let failed=false;try{await fn();}catch{failed=true;}if(!failed)throw Error(label);};
button.onclick=async()=>{
 button.disabled=true;const start=performance.now(),keys=[],stores=[],result={cycles:0,aborts:0,lostAcknowledgements:0,checks:[],timingsMs:[]};
 const prefix='multihistoria.qa.idb.'+crypto.randomUUID();let n=0;
 function harness(raw=null,backup=null){
  const key=prefix+'.'+n++,legacy=new Map([[key,raw],[key+'.previous',backup]]);keys.push(key);let point=null;
  const store=createIndexedSaveStore({storage:{getItem:k=>legacy.get(k)??null},indexedDB,key,validate:raw=>GameSession.fromSave(raw),fault:(stage,tx)=>{if(point===stage){if(stage!=='after-complete')tx.abort();throw Error('Injected '+stage);}}});stores.push(store);
  return {store,key,legacy,fault:p=>point=p};
 }
 async function mutate(key,fn){const db=await new Promise((resolve,reject)=>{const r=indexedDB.open('multihistoria.saves.v1',1);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});try{await new Promise((resolve,reject)=>{const tx=db.transaction('saves','readwrite'),s=tx.objectStore('saves'),r=s.get(key);r.onsuccess=()=>{const value=r.result;fn(value);s.put(value,key);};tx.oncomplete=resolve;tx.onabort=()=>reject(tx.error);});}finally{db.close();}}
 try{
  for(let i=0;i<100;i++){
   status.textContent=`Ciclos ${i}/100 · abortos reales ${result.aborts}`;
   const direct=await GameSession.create(424242+i);let v=direct.getView();
   for(let j=0;v.screen!=='decision'&&j<100;j++){await direct.dispatch({type:'continue',maxDays:7,commandId:crypto.randomUUID(),expectedRevision:v.revision});v=direct.getView();}
   if(!v.decision)throw Error('No pending decision');
   const before=JSON.stringify(direct.exportSnapshot()),command={type:'choose',commandId:crypto.randomUUID(),expectedRevision:v.revision,pendingInstanceId:v.decision.instanceId,choiceId:v.decision.choices[i%v.decision.choices.length].id};
   await direct.dispatch(command);const next=direct.exportSnapshot(),after=JSON.stringify(next);
   for(const point of ['before-put','after-put-queued','after-put-success','after-complete']){
    const h=harness(before);equal(await h.store.read(),before,'legacy migration');equal(h.legacy.get(h.key),before,'legacy preserved');h.fault(point);
    const session=await GameSession.fromSave(before,{commit:s=>h.store.write(s,before)});
    await rejects(()=>session.dispatch(command),'failure propagated');equal(JSON.stringify(session.exportSnapshot()),before,'memory published before complete');
    await h.store.close();equal(await h.store.read(),point==='after-complete'?after:before,'reopen after interruption');
    h.fault(null);await session.dispatch(command);equal(JSON.stringify(session.exportSnapshot()),after,'retry differs');
    await session.dispatch(command);equal(await h.store.read(),after,'duplicate changed persisted state');equal(await h.store.previous(),before,'recovery mismatch');
    if(point==='after-complete')result.lostAcknowledgements++;else result.aborts++;
    await h.store.close();
   }
   result.cycles++;
  }
  const a=await GameSession.create(111),b=await GameSession.create(222),c=await GameSession.create(333),raw=JSON.stringify(a.exportSnapshot());
  const h=harness(raw);await h.store.read();
  const writes=await Promise.allSettled([h.store.write(b.exportSnapshot(),raw),h.store.write(c.exportSnapshot(),raw)]);
  equal(writes.filter(r=>r.status==='fulfilled').length,1,'concurrent replacement');result.checks.push('concurrent replacement: one winner');
  const active=await h.store.read();await rejects(()=>h.store.write({},active),'invalid import accepted');equal(await h.store.read(),active,'invalid import altered save');result.checks.push('invalid import preserves save');
  await mutate(h.key,r=>{r.active.sha256='broken';});await rejects(()=>h.store.read(),'checksum ignored');equal(await h.store.previous(),raw,'corruption destroyed backup');await h.store.write(a.exportSnapshot(),await h.store.readRaw());equal(await h.store.read(),raw,'corrupt recovery');await mutate(h.key,r=>{r.active.sha256='broken';});await h.store.write(a.exportSnapshot(),raw);equal(await h.store.read(),raw,'same payload checksum repair');result.checks.push('SHA-256 corruption and recovery, including unchanged payload');
  h.legacy.set(h.key,JSON.stringify(b.exportSnapshot()));equal(await h.store.legacyChanged(),true,'legacy conflict not detected');equal(await h.store.read(),raw,'legacy conflict overwrites IDB');result.checks.push('old tab divergence detected; both copies preserved');
  const broken=harness('broken',raw);await rejects(()=>broken.store.read(),'invalid migration opened');equal(await broken.store.previous(),raw,'migration backup missing');await broken.store.write(a.exportSnapshot(),'broken');equal(await broken.store.read(),raw,'migration recovery');result.checks.push('corrupt legacy recoverable without deletion');
  const interrupted=harness(raw);interrupted.fault('after-put-success');await rejects(()=>interrupted.store.read(),'migration abort ignored');equal(interrupted.legacy.get(interrupted.key),raw,'migration destroyed legacy');interrupted.fault(null);equal(await interrupted.store.read(),raw,'migration retry');result.checks.push('migration abort and retry');
  const late=await GameSession.create(2026);let view=late.getView();for(let k=0;k<250;k++){if(view.screen==='epilogue')break;const command={commandId:crypto.randomUUID(),expectedRevision:view.revision};if(view.screen==='decision')Object.assign(command,{type:'choose',pendingInstanceId:view.decision.instanceId,choiceId:view.decision.choices[0].id});else Object.assign(command,{type:view.screen==='result'?'acknowledge':'continue',maxDays:7});await late.dispatch(command);view=late.getView();}
  const large=late.exportSnapshot(),p=harness();await p.store.read();const t=performance.now();await p.store.write(large,null);result.timingsMs.push({label:'250-command save',duration:Math.round(performance.now()-t),bytes:JSON.stringify(large).length,date:view.date});
  result.status='passed';status.textContent='100/100 ciclos superados';
 }catch(e){result.status='failed';result.error=e.stack;status.textContent='FALLO: '+e.message;}
 finally{
  await Promise.all(stores.map(s=>s.close()));
  // Delete only records created by this isolated test run.
  try{const db=await new Promise((resolve,reject)=>{const r=indexedDB.open('multihistoria.saves.v1',1);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});await new Promise((resolve,reject)=>{const tx=db.transaction('saves','readwrite');for(const key of keys)tx.objectStore('saves').delete(key);tx.oncomplete=resolve;tx.onabort=()=>reject(tx.error);});db.close();}catch(e){result.cleanupError=e.message;}
  result.durationMs=Math.round(performance.now()-start);report.textContent=JSON.stringify(result,null,2);button.disabled=false;
 }
};
