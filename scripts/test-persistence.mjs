import test from 'node:test';
import assert from 'node:assert/strict';
import {createSaveStore} from '../web/save-store.js';
import {GameSession} from '../dist/session/game-session.js';
function harness(){
 const data=new Map();let fault=null,tail=Promise.resolve();
 const storage={getItem:k=>data.get(k)??null,setItem(k,v){if(fault===k+':before')throw Error('interrupted');data.set(k,v);if(fault===k+':after')throw Error('interrupted');}};
 const locks={request:(_,fn)=>{const p=tail.then(fn);tail=p.catch(()=>{});return p;}};
 const store=createSaveStore({storage,locks,key:'save',lockName:'writer',validate:raw=>GameSession.fromSave(raw)});
 return {store,data,fault:v=>fault=v};
}
test('100 pending decision cycles: interruption matrix and retry preserve exact state and RNG',async()=>{
 const session=await GameSession.create(424242);
 for(let i=0;i<100;i++){
  let view=session.getView();
  while(view.screen!=='decision'){
   assert.notEqual(view.screen,'epilogue');
   if(view.screen==='offer'){await session.dispatch({type:'offer',offerId:view.offer.id,action:'accept',commandId:crypto.randomUUID(),expectedRevision:view.revision});view=session.getView();continue;}
   await session.dispatch({type:view.screen==='result'?'acknowledge':'continue',maxDays:7,commandId:crypto.randomUUID(),expectedRevision:view.revision});view=session.getView();
  }
  if(i%10===0)console.log('Persistence cycles:',i,'/100');
  const before=JSON.stringify(session.exportSnapshot());
  const cmd={type:'choose',commandId:crypto.randomUUID(),expectedRevision:view.revision,pendingInstanceId:view.decision.instanceId,choiceId:view.decision.choices[i%view.decision.choices.length].id};
  await session.dispatch(cmd);const next=session.exportSnapshot(),after=JSON.stringify(next);
  for(const point of ['save.previous:before','save.previous:after','save:before','save:after']){
   const h=harness();h.data.set('save',before);h.fault(point);
   await assert.rejects(h.store.write(next,before));
   const durable=await h.store.read();assert.equal(durable,point==='save:after'?after:before);
   h.fault(null);await h.store.write(next,before);assert.equal(await h.store.read(),after);
   const resumed=await GameSession.fromSave(await h.store.read());await resumed.dispatch(cmd);assert.deepEqual(JSON.parse(JSON.stringify(resumed.exportSnapshot())),JSON.parse(after));
  }
 }
});
test('concurrent replacements: one wins and recovery copy remains the former active',async()=>{
 const h=harness(),a=await GameSession.create(1),b=await GameSession.create(2),c=await GameSession.create(3);
 const initial=JSON.stringify(a.exportSnapshot());h.data.set('save',initial);
 const results=await Promise.allSettled([h.store.write(b.exportSnapshot(),initial),h.store.write(c.exportSnapshot(),initial)]);
 assert.equal(results.filter(x=>x.status==='fulfilled').length,1);assert.equal(await h.store.previous(),initial);
});
test('invalid import, quota failure, corrupt active recovery and legacy raw saves',async()=>{
 const h=harness(),a=await GameSession.create(1),b=await GameSession.create(2);const raw=JSON.stringify(a.exportSnapshot());h.data.set('save',raw);
 assert.equal(await h.store.read(),raw);await assert.rejects(h.store.write({},raw));assert.equal(await h.store.read(),raw);
 h.fault('save:before');await assert.rejects(h.store.write(b.exportSnapshot(),raw));assert.equal(await h.store.read(),raw);assert.equal(await h.store.previous(),raw);
 h.fault(null);h.data.set('save','corrupt');await assert.rejects(h.store.read());await h.store.write(a.exportSnapshot(),'corrupt');assert.equal(await h.store.read(),raw);assert.equal(await h.store.previous(),raw);
});
