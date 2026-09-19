import assert from 'node:assert/strict';
import test from 'node:test';
import { createInitialState } from '../dist/content/initial-state.js';
import { T538_STAGED_CONDITIONAL_EVENTS } from '../dist/content/events/23_26/t538-staged-conditional-events.js';
import { eventGatesPass } from '../dist/narrative/event-gates.js';
const byId=id=>{const e=T538_STAGED_CONDITIONAL_EVENTS.find(row=>row.id===id);assert.ok(e,id);return e;};
test('t538 closes five more bespoke 23-26 callbacks',()=>{
 assert.deepEqual(T538_STAGED_CONDITIONAL_EVENTS.map(e=>e.id),['CEVT_23_NANO_02','CEVT_23_CLARA_03','CEVT_23_MED_02','CEVT_23_UDV_02','CEVT_24_TOURN_01']);
 assert.deepEqual(byId('CEVT_23_CLARA_03').choices.map(c=>c.label),['Escuchar bajo esas condiciones','Rechazar la exclusiva','Intercambiar información no sensible']);
});
test('t538 never turns seed memory into external selection, medical or club facts',()=>{
 for(const e of T538_STAGED_CONDITIONAL_EVENTS){const s=createInitialState(53801);s.age=e.ageWindow[0];s.phase='23_26';for(const g of e.gates??[])if(g.path.startsWith('flags.HAS_SEED_'))s.flags[g.path.slice(6)]=true;assert.equal(eventGatesPass(s,e),false,e.id);}
});
