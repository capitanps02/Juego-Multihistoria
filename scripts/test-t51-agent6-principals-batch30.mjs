import assert from 'node:assert/strict';
import test from 'node:test';
import { createInitialState } from '../dist/content/initial-state.js';
import { T530_STAGED_PRINCIPAL_EVENTS } from '../dist/content/events/26_30/t530-staged-principal-events.js';
import { eventGatesPass } from '../dist/narrative/event-gates.js';
const byId=id=>{const e=T530_STAGED_PRINCIPAL_EVENTS.find(row=>row.id===id);assert.ok(e,id);return e;};
test('t530 exact canonical ids and choices',()=>{
 assert.deepEqual(T530_STAGED_PRINCIPAL_EVENTS.map(e=>e.id),['EVT_26_HOME_001','EVT_26_CAP_001','EVT_26_MED_001','EVT_26_RIV_001','EVT_28_NAT_001']);
 assert.deepEqual(byId('EVT_26_HOME_001').choices.map(c=>c.label),['Financiar y prestar tu nombre','Financiar sin usar tu imagen','Participar solo si una fundación independiente gestiona','Rechazar por ahora']);
 assert.deepEqual(byId('EVT_26_CAP_001').choices.map(c=>c.label),['Apoyar la acción colectiva','Negociar con entrenador antes','Desmarcarte','Proponer que solo los capitanes asuman la protesta']);
 assert.deepEqual(byId('EVT_26_MED_001').choices.map(c=>c.label),['Aceptar ambos descansos','Jugar todo mientras estés bien','Elegir tú qué partido descansar','Aceptar descanso solo si el club lo comunica como plan físico']);
 assert.deepEqual(byId('EVT_26_RIV_001').choices.map(c=>c.label),['Alimentar la rivalidad deportiva','Quitar importancia','Contactarle en privado antes del partido','Usar la historia para una campaña conjunta si aparece']);
 assert.deepEqual(byId('EVT_28_NAT_001').choices.map(c=>c.label),['Aceptar el plan','Pedir empezar partidos grandes y descansar otros','Competir por rol sin acuerdos previos','Priorizar posición habitual aunque juegues menos']);
});
test('t530 external-world scenes fail closed without owner facts',()=>{
 for(const e of T530_STAGED_PRINCIPAL_EVENTS){const s=createInitialState(53001);s.age=e.ageWindow[0];s.phase='26_30';s.professional.institutionalPower=100;s.professional.recoveryMargin=10;assert.equal(eventGatesPass(s,e),false,e.id);assert.ok(e.tags?.includes('a6_ready_external_blocker'),e.id);}
});
test('HOME26 owns a catalog-aligned canonical seed writer',()=>{
 const e=byId('EVT_26_HOME_001');assert.ok(e.outcomes.flatMap(o=>o.seedTransitions??[]).every(t=>t.seedId==='SEED_HOME_INSTITUTION'));
});
test('other t530 scenes preserve existing memory instead of inventing future-origin seed ids',()=>{
 const allowed=new Set(['SEED_CAPTAINCY_STYLE','SEED_LOAD_MANAGEMENT','SEED_ADRIAN_MIRROR','SEED_MAJOR_TOURNAMENT']);
 for(const id of ['EVT_26_CAP_001','EVT_26_MED_001','EVT_26_RIV_001','EVT_28_NAT_001']){for(const t of byId(id).outcomes.flatMap(o=>o.seedTransitions??[]))assert.ok(allowed.has(t.seedId),id+':'+t.seedId);}
});
