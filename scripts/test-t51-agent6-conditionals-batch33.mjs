import assert from 'node:assert/strict';
import test from 'node:test';
import { createInitialState } from '../dist/content/initial-state.js';
import { T533_STAGED_CONDITIONAL_EVENTS } from '../dist/content/events/26_30/t533-staged-conditional-events.js';
import { eventGatesPass } from '../dist/narrative/event-gates.js';
import { resolveChoice } from '../dist/narrative/resolver.js';
const byId=id=>{const e=T533_STAGED_CONDITIONAL_EVENTS.find(row=>row.id===id);assert.ok(e,id);return e;};

test('t533 is bespoke conditional content, not the generic callback factory',()=>{
 assert.deepEqual(T533_STAGED_CONDITIONAL_EVENTS.map(e=>e.id),['CEVT_26_FAMILY_03','CEVT_27_OWNER_03','CEVT_27_STAR_02','CEVT_27_BODY_03','CEVT_27_AWARD_02']);
 assert.deepEqual(byId('CEVT_26_FAMILY_03').choices.map(c=>c.label),['Aumentar exposición','Retirar parte de los beneficios','Profesionalizar antes de reinvertir']);
 assert.deepEqual(byId('CEVT_27_STAR_02').choices.map(c=>c.label),['Animarle a quedarse','Contarle tus dudas con honestidad','No intentar influir en su carrera']);
});
test('world events remain external and every conditional fails closed without them',()=>{
 for(const e of T533_STAGED_CONDITIONAL_EVENTS){const s=createInitialState(53301);s.age=e.ageWindow[0];s.phase='26_30';for(const g of e.gates??[])if(g.path.startsWith('flags.HAS_SEED_'))s.flags[g.path.slice(6)]=true;assert.equal(eventGatesPass(s,e),false,e.id);}
});
test('FAMILY03 consumes the actual family-business memory payload',()=>{
 const e=byId('CEVT_26_FAMILY_03'),s=createInitialState(53302);s.age=26;s.phase='26_30';
 s.seeds.push({id:'SEED_FAMILY_BUSINESS',state:'dormant',intensity:60,originEvent:'EVT_25_FAM_001',originSeason:s.season,npcRefs:[],payload:{old:true}});s.flags.HAS_SEED_FAMILY_BUSINESS=true;
 const out=resolveChoice(s,e,'B').state;const seed=out.seeds.find(x=>x.id==='SEED_FAMILY_BUSINESS');
 assert.equal(seed?.originEvent,'EVT_25_FAM_001');assert.equal(seed?.payload.old,true);assert.equal(seed?.payload.callback26,'take_profit');
});
