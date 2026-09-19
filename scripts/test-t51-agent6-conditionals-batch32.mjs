import assert from 'node:assert/strict';
import test from 'node:test';
import { createInitialState } from '../dist/content/initial-state.js';
import { T532_STAGED_CONDITIONAL_EVENTS } from '../dist/content/events/26_30/t532-staged-conditional-events.js';
import { eventGatesPass } from '../dist/narrative/event-gates.js';
import { resolveChoice } from '../dist/narrative/resolver.js';
const byId=id=>{const e=T532_STAGED_CONDITIONAL_EVENTS.find(row=>row.id===id);assert.ok(e,id);return e;};

test('t532 uses five canonical conditional identities with bespoke choices',()=>{
 assert.deepEqual(T532_STAGED_CONDITIONAL_EVENTS.map(e=>e.id),['CEVT_26_RIVAS_03','CEVT_26_MENA_03','CEVT_26_VELA_03','CEVT_26_BRUNO_04','CEVT_26_NANO_03']);
 assert.deepEqual(byId('CEVT_26_RIVAS_03').choices.map(c=>c.label),['Llamar a Rivas y hablar de las condiciones','Dejar que el proceso siga por vía formal','Buscar otra referencia dentro del club']);
 assert.deepEqual(byId('CEVT_26_MENA_03').choices.map(c=>c.label),['Insistir en tu nueva versión','Recuperar recursos viejos solo para este partido','Mezclar ambas versiones durante el partido']);
 assert.deepEqual(byId('CEVT_26_VELA_03').choices.map(c=>c.label),['Hablar con Vela como directivo o técnico, no como excompañero','Recordarle vuestra historia antes de decidir','Pedir que otra persona cierre la decisión']);
});
test('all callbacks fail closed when the external world fact is absent',()=>{
 for(const e of T532_STAGED_CONDITIONAL_EVENTS){const s=createInitialState(53201);s.age=26;s.phase='26_30';for(const g of e.gates??[])if(g.path.startsWith('flags.HAS_SEED_'))s.flags[g.path.slice(6)]=true;assert.equal(eventGatesPass(s,e),false,e.id);}
});
test('callbacks consume history by transforming the original seed without rewriting origin',()=>{
 const e=byId('CEVT_26_RIVAS_03');const s=createInitialState(53202);s.age=26;s.phase='26_30';
 s.seeds.push({id:'SEED_RIVAS_TRUST',state:'dormant',intensity:60,originEvent:'EVT_18_PRE_001',originSeason:s.season,npcRefs:['NPC_ACA_01'],payload:{old:true}});s.flags.HAS_SEED_RIVAS_TRUST=true;
 const out=resolveChoice(s,e,'A').state;const seed=out.seeds.find(x=>x.id==='SEED_RIVAS_TRUST');
 assert.equal(seed?.originEvent,'EVT_18_PRE_001');assert.equal(seed?.payload.old,true);assert.equal(seed?.payload.callback26,'direct_conditions_call');
});
test('conditional definitions route to the canonical persistent NPCs',()=>{
 assert.deepEqual(byId('CEVT_26_RIVAS_03').npcRefs,['NPC_ACA_01']);
 assert.deepEqual(byId('CEVT_26_MENA_03').npcRefs,['NPC_CCH_02']);
 assert.deepEqual(byId('CEVT_26_VELA_03').npcRefs,['NPC_PLR_10']);
 assert.deepEqual(byId('CEVT_26_BRUNO_04').npcRefs,['NPC_PLR_12']);
 assert.deepEqual(byId('CEVT_26_NANO_03').npcRefs,['NPC_PLR_14']);
});
