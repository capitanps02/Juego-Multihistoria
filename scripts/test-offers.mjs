import test from 'node:test';
import assert from 'node:assert/strict';
import { GameSession } from '../dist/session/game-session.js';
import { createInitialState } from '../dist/content/initial-state.js';
import { careerTerms,proposeCareerChange,respondToOffer } from '../dist/simulation/offers.js';
import { advanceWorldDayInPlace } from '../dist/simulation/world-simulator.js';
import { assertGameState } from '../dist/save/validation.js';
const command=(s,type,extra={})=>({type,commandId:crypto.randomUUID(),expectedRevision:s.getView().revision,...extra});
async function pending(options={}){
 const s=await GameSession.create(123,{events:[],...options});
 for(let i=0;i<5 && !s.getView().offer;i++)await s.dispatch(command(s,'continue',{maxDays:366}));
 assert.equal(s.getView().screen,'offer');return s;
}
test('20th birthday proposes terms without changing club or silently renewing',async()=>{
 const s=await pending(),v=s.getView(),snap=s.exportSnapshot();
 assert.equal(v.age,20);assert.equal(v.salaryMonthly,900);assert.equal(v.contractMonths,0);
 assert.ok(v.offer.terms.salary>900);assert.equal(v.club,v.offer.before.club);
 assertGameState(snap.state);
 for(const hidden of ["prestigeScore","prestigeTier","route","bigClub","abroad"])assert.ok(!JSON.stringify(v.offer).includes(`"${hidden}"`));
 for(let i=0;i<10;i++){s.getView().offer.terms.salary=1;await assert.rejects(s.dispatch(command(s,'continue')),{code:'PENDING_SCREEN'});}
 assert.deepEqual(s.exportSnapshot(),snap);
 const world=structuredClone(snap.state);advanceWorldDayInPlace(world);assert.deepEqual(world,snap.state);
 const restored=await GameSession.fromSave(JSON.stringify(snap),{events:[]});assert.deepEqual(restored.getView(),v);
});
test('reject retains terms and RNG, records response and unlocks time',async()=>{
 const s=await pending(),before=s.exportSnapshot(),o=s.getView().offer;
 await s.dispatch(command(s,'offer',{offerId:o.id,action:'reject'}));
 assert.deepEqual(careerTerms(s.exportSnapshot().state),careerTerms(before.state));
 assert.deepEqual(s.exportSnapshot().state.rngState,before.state.rngState);
 assert.equal(s.getView().offerHistory.at(-1).accepted,false);
 const restored=await GameSession.resume(s.exportSnapshot(),{events:[]});
 await restored.dispatch(command(restored,'continue',{maxDays:1}));assert.notEqual(restored.getView().date,before.state.date);
});
test('acceptance persists once across double click, reload and replay',async()=>{
 const s=await pending(),o=s.exportSnapshot().state.market.pending,c=command(s,'offer',{offerId:o.id,action:'accept'});
 const [a,b]=await Promise.all([s.dispatch(c),s.dispatch(c)]);assert.equal(a.replayed,false);assert.equal(b.replayed,true);
 assert.deepEqual(careerTerms(s.exportSnapshot().state),o.terms);
 assert.equal(s.getView().offerHistory.length,1);
 const restored=await GameSession.resume(s.exportSnapshot(),{events:[]});assert.equal((await restored.dispatch(c)).replayed,true);
 await assert.rejects(restored.dispatch({...c,action:'reject'}),{code:'COMMAND_ID_REUSED'});
 await assert.rejects(restored.dispatch(command(restored,'offer',{offerId:o.id,action:'accept'})),{code:'STALE_OFFER'});
});
test('failed signing commit preserves offer, contract and RNG; retry equals clean run',async()=>{
 let fail=false,saved;const s=await pending({commit:async snap=>{if(fail)throw Error('disk full');saved=snap;}});
 const before=s.exportSnapshot(),clean=await GameSession.resume(before,{events:[]});
 const c=command(s,'offer',{offerId:s.getView().offer.id,action:'accept'});fail=true;
 await assert.rejects(s.dispatch(c),/disk full/);assert.deepEqual(s.exportSnapshot(),before);assert.deepEqual(saved,before);
 fail=false;await s.dispatch(c);await clean.dispatch(c);assert.deepEqual(s.exportSnapshot(),clean.exportSnapshot());
});
test('delegation has deterministic limits and never grants authority to the next offer',()=>{
 for(const [salary,tier,months,expected]of [[1200,2,24,true],[800,2,24,false],[1200,4,24,false],[1200,2,6,false]]){
  const s=createInitialState(10);proposeCareerChange(s,'Renovación',d=>{d.contract.salaryMonthly=salary;d.contract.monthsRemaining=months;d.tier=d.professional.leagueTier=tier;});
  // A change of category implies a transfer and its minimum duration. Test a short renewal separately.
  if(months===6){s.market.pending.terms.months=6;}
  const o=structuredClone(s.market.pending),r=respondToOffer(s,o.id,'delegate');assert.equal(r.accepted,expected);
  assert.deepEqual(careerTerms(s),expected?o.terms:o.before);
  proposeCareerChange(s,'Nueva propuesta',d=>{d.contract.salaryMonthly+=300;});assert.ok(s.market.pending);assert.equal(s.market.history.length,1);
 }
});
test('transfer acceptance changes registration, owner, contract and context together',()=>{
 const s=createInitialState(10);proposeCareerChange(s,'Fichaje',d=>{d.club='Destino';d.contract.salaryMonthly=4500;d.professional.route='abroad';d.flags.ABROAD_ROUTE=true;});
 const before=careerTerms(s),o=s.market.pending;assert.equal(s.club,'UDV');assert.deepEqual(careerTerms(s),before);
 respondToOffer(s,o.id,'accept');assert.equal(s.club,'Destino');assert.equal(s.professional.ownerClub,'Destino');assert.equal(s.world.ownerClub,'Destino');assert.equal(s.professional.registrationClub,'Destino');assert.equal(s.contract.monthsRemaining,24);assert.equal(s.flags.ABROAD_ROUTE,true);assertGameState(s);
});
test('corrupt offers, authority records and receipt mismatches are rejected',async()=>{
 const s=await pending();
 for(const mutate of [x=>x.state.market.pending.terms.salary=-1,x=>x.state.market.pending.id='old',x=>x.state.market.pending.before.salary=7,x=>x.state.market.sequence=100,x=>x.state.market.pending.terms.hidden=true]){
  const bad=s.exportSnapshot();mutate(bad);await assert.rejects(GameSession.resume(bad,{events:[]}),{code:'INVALID_SAVE'});
 }
 await s.dispatch(command(s,'offer',{offerId:s.getView().offer.id,action:'reject'}));
 const bad=s.exportSnapshot();bad.state.market.history[0].accepted=true;await assert.rejects(GameSession.resume(bad,{events:[]}),{code:'INVALID_SAVE'});
 const mismatch=s.exportSnapshot();mismatch.state.market.history[0].action='delegate';mismatch.state.market.history[0].accepted=true;await assert.rejects(GameSession.resume(mismatch,{events:[]}),{code:'INVALID_SAVE'});
});
test('v1 migration preserves pending narrative, history and RNG and grants no delegation',async()=>{
 const s=await GameSession.create(424242);await s.dispatch(command(s,'continue'));
 const old=s.exportSnapshot();old.sessionVersion=1;old.build='0.8.0-t2.2';delete old.state.market;
 const raw=JSON.stringify(old),restored=await GameSession.fromSave(raw),next=restored.exportSnapshot();
 assert.equal(next.sessionVersion,2);assert.equal(JSON.stringify(next.pendingDecision),JSON.stringify(old.pendingDecision));assert.deepEqual(next.state.rngState,old.state.rngState);assert.deepEqual(next.journal,old.journal);
 assert.deepEqual(next.state.market,{version:1,sequence:0,pending:null,history:[]});assert.equal(JSON.stringify(old),raw);
});
test('world renewal, summer moves and loan continuity remain proposals across seeds',()=>{
 const reasons=new Set();
 for(let seed=1;seed<=30;seed++){
  const s=createInitialState(seed);s.age=21;s.phase='20_23';s.professional.initializedAt20=true;s.contract.monthsRemaining=3;s.reputation.marketHeat=90;s.sport.roleScore=65;s.professional.ownerClub='Propietario';s.world.ownerClub='Propietario';s.flags.LOAN_ACTIVE=true;s.date='2029-05-01';
  for(let i=0;i<140;i++){
   const before=careerTerms(s);advanceWorldDayInPlace(s);
   assert.equal(s.club,before.club);assert.equal(s.contract.salaryMonthly,before.salary);assert.ok(Number(s.contract.monthsRemaining)<=before.months);
   if(s.market.pending){reasons.add(s.market.pending.reason);respondToOffer(s,s.market.pending.id,'reject');}
  }
 }
 for(const reason of ['Renovación de contrato','Continuidad de la cesión','Propuesta de mercado'])assert.ok(reasons.has(reason),reason);
});
