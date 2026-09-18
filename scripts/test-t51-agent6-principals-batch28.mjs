import assert from 'node:assert/strict';
import test from 'node:test';
import { createInitialState } from '../dist/content/initial-state.js';
import { T528_STAGED_PRINCIPAL_EVENTS } from '../dist/content/events/26_30/t528-staged-principal-events.js';
import { eventGatesPass } from '../dist/narrative/event-gates.js';
const byId=id=>{const e=T528_STAGED_PRINCIPAL_EVENTS.find(row=>row.id===id);assert.ok(e,id);return e;};
test('t528 exact ids and choices',()=>{
 assert.deepEqual(T528_STAGED_PRINCIPAL_EVENTS.map(e=>e.id),['EVT_27_PRS_001','EVT_27_TACT_001','EVT_27_EUR_001','EVT_27_MATCH_001','EVT_27_AGT_002']);
 assert.deepEqual(byId('EVT_27_PRS_001').choices.map(c=>c.label),['Aplaudir al público al salir','No reaccionar','Responder en entrevista','Pedir al club que te proteja públicamente']);
 assert.deepEqual(byId('EVT_27_TACT_001').choices.map(c=>c.label),['Aceptar la reconversión','Mantener posición principal','Probarla solo en partidos concretos','Entrenarla pero pedir no cambiar etiqueta pública todavía']);
 assert.deepEqual(byId('EVT_27_EUR_001').choices.map(c=>c.label),['Aceptar plenamente','Pedir libertad en transiciones','Mostrar dudas por tu rol','Cumplir sin permitir que tu agente critique después']);
 assert.deepEqual(byId('EVT_27_MATCH_001').choices.map(c=>c.label),['Publicar igual','Retrasar 24-48 horas','Publicar solo un mensaje breve centrado en el equipo','Cancelar la campaña']);
 assert.deepEqual(byId('EVT_27_AGT_002').choices.map(c=>c.label),['Permitir que siga','Ordenar elegir una vía','Tomar control directo de una negociación','Cambiar de agente en mitad del proceso']);
});
test('t528 fails closed without shared facts',()=>{
 for(const e of T528_STAGED_PRINCIPAL_EVENTS){const s=createInitialState(52801);s.age=27;s.phase='26_30';s.professional.publicMyth=100;s.professional.roleAdaptability=100;assert.equal(eventGatesPass(s,e),false,e.id);assert.ok(e.tags?.includes('a6_ready_external_blocker'),e.id);}
});
test('t528 never fabricates sport, market or npc facts through effects',()=>{
 for(const e of T528_STAGED_PRINCIPAL_EVENTS){const paths=[...e.choices.flatMap(c=>c.immediateEffects??[]),...e.outcomes.flatMap(o=>o.effects??[])].map(x=>x.kind==='flag'?'flags.'+x.flag:x.path);assert.ok(paths.every(p=>!p.startsWith('facts.')&&p!=='club'&&!p.startsWith('market.')&&!p.startsWith('contract.')),e.id);}
});
