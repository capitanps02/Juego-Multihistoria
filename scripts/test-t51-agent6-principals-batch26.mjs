import assert from 'node:assert/strict';
import test from 'node:test';
import { createInitialState } from '../dist/content/initial-state.js';
import { T526_STAGED_PRINCIPAL_EVENTS } from '../dist/content/events/26_30/t526-staged-principal-events.js';
import { eventGatesPass } from '../dist/narrative/event-gates.js';

const byId=id=>{const e=T526_STAGED_PRINCIPAL_EVENTS.find(row=>row.id===id);assert.ok(e,id);return e;};
test('t526 contains five exact canonical choice sets',()=>{
 assert.deepEqual(T526_STAGED_PRINCIPAL_EVENTS.map(e=>e.id),['EVT_26_MKT_001','EVT_26_CON_001','EVT_26_IMG_001','EVT_26_BODY_001','EVT_26_AGT_001']);
 assert.deepEqual(byId('EVT_26_MKT_001').choices.map(c=>c.label),['Ir donde serás el centro','Quedarte donde competirás por todos los títulos','Pedir una salida solo si el destino ficha dos refuerzos concretos','Esperar al final de pretemporada']);
 assert.deepEqual(byId('EVT_26_CON_001').choices.map(c=>c.label),['Firmar y convertirte en pieza estructural','Pedir tres años y menos dinero','Mantener cinco años pero exigir salida por objetivos o minutos','Rechazar y entrar en temporada con contrato más corto']);
 assert.deepEqual(byId('EVT_26_IMG_001').choices.map(c=>c.label),['Aceptar el paquete completo','Aceptar solo marca, no campaña de club','Reducir compromisos para proteger descanso','Rechazar y mantener perfil bajo']);
 assert.deepEqual(byId('EVT_26_BODY_001').choices.map(c=>c.label),['Crear equipo privado completo','Usar solo especialistas externos puntualmente','Confiar exclusivamente en el club','Contratar equipo propio pero compartir todos los datos']);
 assert.deepEqual(byId('EVT_26_AGT_001').choices.map(c=>c.label),['Seguir recomendación del agente','Pedir valoración a asesor independiente','Hablar directamente con el club','Exigir a tu agencia que detalle conflictos económicos']);
});
test('t526 external proposals fail closed instead of using narrative proxies',()=>{
 for(const e of T526_STAGED_PRINCIPAL_EVENTS){
  const s=createInitialState(52601);s.age=26;s.phase='26_30';s.reputation.marketHeat=99;s.professional.commercialPower=99;s.professional.bodyLoad=99;
  assert.equal(eventGatesPass(s,e),false,e.id);assert.ok(e.tags?.includes('a6_ready_external_blocker'),e.id);
 }
});
test('canonical owner seeds are wired where catalog origins already match',()=>{
 const expected={EVT_26_MKT_001:'SEED_SHADOW_ESCAPE',EVT_26_CON_001:'SEED_PEAK_CONTRACT',EVT_26_IMG_001:'SEED_GLOBAL_IMAGE',EVT_26_BODY_001:'SEED_SELF_OPTIMIZATION'};
 for(const [id,seed] of Object.entries(expected)){
  assert.ok(byId(id).outcomes.flatMap(o=>o.seedTransitions??[]).some(t=>t.seedId===seed),id);
 }
});
test('AGT26 records only into prior evidence until shared seed origin is realigned',()=>{
 const e=byId('EVT_26_AGT_001');
 const written=new Set(e.outcomes.flatMap(o=>o.seedTransitions??[]).map(t=>t.seedId));
 assert.deepEqual([...written].sort(),['SEED_AGENT_PROOF','SEED_DIRECT_RECRUIT']);
 assert.ok(e.tags?.includes('needs_seed_agent_conflict_peak_origin'));
});
