import assert from 'node:assert/strict';
import test from 'node:test';
import { createInitialState } from '../dist/content/initial-state.js';
import { T529_STAGED_PRINCIPAL_EVENTS } from '../dist/content/events/26_30/t529-staged-principal-events.js';
import { eventGatesPass } from '../dist/narrative/event-gates.js';
const byId=id=>{const e=T529_STAGED_PRINCIPAL_EVENTS.find(row=>row.id===id);assert.ok(e,id);return e;};
test('t529 exact principal contracts',()=>{
 assert.deepEqual(T529_STAGED_PRINCIPAL_EVENTS.map(e=>e.id),['EVT_28_MKT_001','EVT_28_FORM_001','EVT_28_STAR_001','EVT_28_MED_001','EVT_28_CLUB_001']);
 assert.deepEqual(byId('EVT_28_MKT_001').choices.map(c=>c.label),['Salir ahora','Quedarte al menos un año','Renovar solo con salida pactada','Decidir según entrenador o fichajes antes de cerrar mercado']);
 assert.deepEqual(byId('EVT_28_FORM_001').choices.map(c=>c.label),['No cambiar nada','Añadir trabajo individual','Pedir descanso corto','Cambiar rol táctico temporalmente']);
 assert.deepEqual(byId('EVT_28_STAR_001').choices.map(c=>c.label),['Adaptarte para jugar juntos','Competir por el puesto original','Explorar salida','Pedir al club que defina quién es prioridad']);
 assert.deepEqual(byId('EVT_28_MED_001').choices.map(c=>c.label),['Reducir amistosos o partidos menores de selección','Pedir más rotación al club','Mantener todo y aceptar riesgo','Negociar un plan conjunto club-selección']);
 assert.deepEqual(byId('EVT_28_CLUB_001').choices.map(c=>c.label),['Respaldarlo con claridad','Dar un mensaje genérico de unidad','Negarte a personalizar apoyo','Decir al presidente en privado que tienes dudas antes de hablar']);
});
test('t529 fails closed on exact shared facts',()=>{
 for(const e of T529_STAGED_PRINCIPAL_EVENTS){const s=createInitialState(52901);s.age=28;s.phase='26_30';s.professional.peakStatus=100;s.professional.institutionalPower=100;assert.equal(eventGatesPass(s,e),false,e.id);assert.ok(e.tags?.includes('a6_ready_external_blocker'),e.id);}
});
test('t529 effects never fabricate facts or mutate authority-owned state',()=>{
 for(const e of T529_STAGED_PRINCIPAL_EVENTS){const paths=[...e.choices.flatMap(c=>c.immediateEffects??[]),...e.outcomes.flatMap(o=>o.effects??[])].map(x=>x.kind==='flag'?'flags.'+x.flag:x.path);assert.ok(paths.every(p=>!p.startsWith('facts.')&&p!=='club'&&!p.startsWith('market.')&&!p.startsWith('contract.')),e.id);}
});
