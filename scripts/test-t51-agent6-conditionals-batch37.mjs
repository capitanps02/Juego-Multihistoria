import assert from 'node:assert/strict';
import test from 'node:test';
import { createInitialState } from '../dist/content/initial-state.js';
import { T537_STAGED_CONDITIONAL_EVENTS } from '../dist/content/events/23_26/t537-staged-conditional-events.js';
import { eventGatesPass } from '../dist/narrative/event-gates.js';
const byId=id=>{const e=T537_STAGED_CONDITIONAL_EVENTS.find(row=>row.id===id);assert.ok(e,id);return e;};
test('t537 begins 23-26 bespoke conditional closure',()=>{
 assert.deepEqual(T537_STAGED_CONDITIONAL_EVENTS.map(e=>e.id),['CEVT_23_RIVAS_02','CEVT_23_MENA_02','CEVT_23_VELA_02','CEVT_23_BRUNO_03','CEVT_23_ADR_03']);
 assert.deepEqual(byId('CEVT_23_ADR_03').choices.map(c=>c.label),['Coordinar una respuesta con Adrián','Competir por foco sin atacar','Ignorar el relato']);
});
test('t537 memories never create current NPC or selection facts',()=>{
 for(const e of T537_STAGED_CONDITIONAL_EVENTS){const s=createInitialState(53701);s.age=23;s.phase='23_26';for(const g of e.gates??[])if(g.path.startsWith('flags.HAS_SEED_'))s.flags[g.path.slice(6)]=true;assert.equal(eventGatesPass(s,e),false,e.id);}
});
test('t537 routes every named callback to its canonical NPC',()=>{
 assert.deepEqual(byId('CEVT_23_RIVAS_02').npcRefs,['NPC_ACA_01']);assert.deepEqual(byId('CEVT_23_MENA_02').npcRefs,['NPC_CCH_02']);assert.deepEqual(byId('CEVT_23_VELA_02').npcRefs,['NPC_PLR_10']);assert.deepEqual(byId('CEVT_23_BRUNO_03').npcRefs,['NPC_PLR_12']);assert.deepEqual(byId('CEVT_23_ADR_03').npcRefs,['NPC_PLR_15']);
});
