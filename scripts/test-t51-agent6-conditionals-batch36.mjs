import assert from 'node:assert/strict';
import test from 'node:test';
import { createInitialState } from '../dist/content/initial-state.js';
import { T536_STAGED_CONDITIONAL_EVENTS } from '../dist/content/events/26_30/t536-staged-conditional-events.js';
import { eventGatesPass } from '../dist/narrative/event-gates.js';
import { resolveChoice } from '../dist/narrative/resolver.js';
const byId=id=>{const e=T536_STAGED_CONDITIONAL_EVENTS.find(row=>row.id===id);assert.ok(e,id);return e;};

test('t536 closes the final four canonical 26-30 conditional identities',()=>{
 assert.deepEqual(T536_STAGED_CONDITIONAL_EVENTS.map(e=>e.id),['CEVT_26_CLARA_04','CEVT_26_AGENT_05','CEVT_29_RECORD_02','CEVT_29_PROJECT_02']);
 assert.deepEqual(byId('CEVT_29_RECORD_02').choices.map(c=>c.label),['Felicitarle y reconocer el nuevo récord','Restar importancia al récord','Usarlo como motivación para el siguiente objetivo']);
});
test('t536 external events fail closed even when causal seeds exist',()=>{
 for(const e of T536_STAGED_CONDITIONAL_EVENTS){const s=createInitialState(53601);s.age=e.ageWindow[0];s.phase='26_30';for(const g of e.gates??[])if(g.path.startsWith('flags.HAS_SEED_'))s.flags[g.path.slice(6)]=true;assert.equal(eventGatesPass(s,e),false,e.id);}
});
test('CLARA04 consumes the actual channel history without rewriting provenance',()=>{
 const e=byId('CEVT_26_CLARA_04'),s=createInitialState(53602);s.age=26;s.phase='26_30';
 s.seeds.push({id:'SEED_CLARA_CHANNEL',state:'dormant',intensity:60,originEvent:'EVT_18_PRS_001',originSeason:s.season,npcRefs:['NPC_PRS_01'],payload:{old:true}});s.flags.HAS_SEED_CLARA_CHANNEL=true;
 const out=resolveChoice(s,e,'A').state,seed=out.seeds.find(x=>x.id==='SEED_CLARA_CHANNEL');
 assert.equal(seed?.originEvent,'EVT_18_PRS_001');assert.equal(seed?.payload.old,true);assert.equal(seed?.payload.callback26Transfer,'give_context');
});
