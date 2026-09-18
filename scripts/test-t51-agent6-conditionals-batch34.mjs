import assert from 'node:assert/strict';
import test from 'node:test';
import { createInitialState } from '../dist/content/initial-state.js';
import { T534_STAGED_CONDITIONAL_EVENTS } from '../dist/content/events/26_30/t534-staged-conditional-events.js';
import { eventGatesPass } from '../dist/narrative/event-gates.js';
const byId=id=>{const e=T534_STAGED_CONDITIONAL_EVENTS.find(row=>row.id===id);assert.ok(e,id);return e;};
test('t534 resolves five more canonical conditionals with scene-specific decisions',()=>{
 assert.deepEqual(T534_STAGED_CONDITIONAL_EVENTS.map(e=>e.id),['CEVT_27_FINAL_02','CEVT_28_MEDIA_02','CEVT_28_TRANSFER_02','CEVT_28_DDL_02','CEVT_28_MANAGER_02']);
 assert.deepEqual(byId('CEVT_28_TRANSFER_02').choices.map(c=>c.label),['Aceptar renegociar la estructura','Pedir una revisión médica independiente','Retirarte de la operación']);
 assert.deepEqual(byId('CEVT_28_DDL_02').choices.map(c=>c.label),['Aceptar que la operación terminó','Pedir un informe del fallo de proceso','Mantener abierto el canal para la siguiente ventana']);
});
test('t534 events require external outcomes instead of deriving them from seeds',()=>{
 for(const e of T534_STAGED_CONDITIONAL_EVENTS){const s=createInitialState(53401);s.age=e.ageWindow[0];s.phase='26_30';for(const g of e.gates??[])if(g.path.startsWith('flags.HAS_SEED_'))s.flags[g.path.slice(6)]=true;assert.equal(eventGatesPass(s,e),false,e.id);}
});
test('no t534 effect writes sport results, transfers or facts',()=>{
 for(const e of T534_STAGED_CONDITIONAL_EVENTS){const paths=[...e.choices.flatMap(c=>c.immediateEffects??[]),...e.outcomes.flatMap(o=>o.effects??[])].map(x=>x.kind==='flag'?'flags.'+x.flag:x.path);assert.ok(paths.every(p=>!p.startsWith('facts.')&&!p.startsWith('sport.result')&&p!=='club'&&!p.startsWith('market.')&&!p.startsWith('contract.')),e.id);}
});
