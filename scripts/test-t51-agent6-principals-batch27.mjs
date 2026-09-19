import assert from 'node:assert/strict';
import test from 'node:test';
import { createInitialState } from '../dist/content/initial-state.js';
import { T527_STAGED_PRINCIPAL_EVENTS } from '../dist/content/events/26_30/t527-staged-principal-events.js';
import { eventGatesPass } from '../dist/narrative/event-gates.js';
const byId=id=>{const e=T527_STAGED_PRINCIPAL_EVENTS.find(row=>row.id===id);assert.ok(e,id);return e;};
test('t527 has five exact canonical principal choice sets',()=>{
 assert.deepEqual(T527_STAGED_PRINCIPAL_EVENTS.map(e=>e.id),['EVT_27_MKT_001','EVT_27_AWARD_001','EVT_27_MED_001','EVT_27_STAR_001','EVT_27_TEAM_001']);
 assert.deepEqual(byId('EVT_27_MKT_001').choices.map(c=>c.label),['Aceptar el proyecto','Quedarte en estructura más estable','Exigir dos condiciones deportivas por escrito como objetivos del club','Usar la oferta para renovar']);
 assert.deepEqual(byId('EVT_27_AWARD_001').choices.map(c=>c.label),['Defender abiertamente tu candidatura','Priorizar mérito del equipo','Elogiar al compañero y señalar tus números','Rechazar entrevista']);
 assert.deepEqual(byId('EVT_27_MED_001').choices.map(c=>c.label),['Operarte ya','Aguantar hasta final de temporada','Tratar conservador y reevaluar cada mes','Buscar especialista externo antes de decidir']);
 assert.deepEqual(byId('EVT_27_STAR_001').choices.map(c=>c.label),['Abrazar la dupla públicamente','Separar marca y competir solo en campo','Pedir reparto claro de penaltis y balón parado','No discutir jerarquía y dejar que rendimiento decida']);
 assert.deepEqual(byId('EVT_27_TEAM_001').choices.map(c=>c.label),['Felicitarlo y ayudarle','Ser correcto pero centrarte en recuperar puesto','Pedir jugar juntos en otro sistema','Presionar para volver en cuanto estés disponible']);
});
test('t527 fails closed on exact external facts',()=>{
 for(const e of T527_STAGED_PRINCIPAL_EVENTS){
  const s=createInitialState(52701);s.age=27;s.phase='26_30';s.reputation.marketHeat=100;s.professional.peakStatus=100;
  assert.equal(eventGatesPass(s,e),false,e.id);assert.ok(e.tags?.includes('a6_ready_external_blocker'),e.id);
 }
});
test('t527 does not fabricate shared-world facts through effects',()=>{
 for(const e of T527_STAGED_PRINCIPAL_EVENTS){
  const paths=[...e.choices.flatMap(c=>c.immediateEffects??[]),...e.outcomes.flatMap(o=>o.effects??[])].map(x=>x.kind==='flag'?'flags.'+x.flag:x.path);
  assert.ok(paths.every(p=>!p.startsWith('facts.')&&p!=='club'&&!p.startsWith('contract.')&&!p.startsWith('market.')),e.id);
 }
});
