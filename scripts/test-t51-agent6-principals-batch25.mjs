import assert from 'node:assert/strict';
import test from 'node:test';
import { createInitialState } from '../dist/content/initial-state.js';
import { T525_STAGED_PRINCIPAL_EVENTS } from '../dist/content/events/26_30/t525-staged-principal-events.js';
import { eventGatesPass } from '../dist/narrative/event-gates.js';
import { resolveChoice } from '../dist/narrative/resolver.js';

const byId=id=>{const e=T525_STAGED_PRINCIPAL_EVENTS.find(row=>row.id===id);assert.ok(e,id);return e;};

test('t525 carries five exact canonical principal choice sets',()=>{
 assert.deepEqual(T525_STAGED_PRINCIPAL_EVENTS.map(e=>e.id),['EVT_26_TEAM_001','EVT_26_NAT_001','EVT_28_RICH_001','EVT_28_HOME_001','EVT_29_CON_001']);
 assert.deepEqual(byId('EVT_26_TEAM_001').choices.map(c=>c.label),['Integrarlo activamente','Ser cordial sin convertirte en mentor','Marcar jerarquía en entrenamientos','Pedir al técnico claridad sobre reparto de minutos']);
 assert.deepEqual(byId('EVT_26_NAT_001').choices.map(c=>c.label),['Priorizar vacaciones','Ir a la concentración','Ir solo a actos sin entrenar','Pedir al seleccionador que te libere públicamente para evitar especulación']);
 assert.deepEqual(byId('EVT_28_RICH_001').choices.map(c=>c.label),['Aceptar','Rechazar por nivel deportivo','Pedir contrato corto','Usar la oferta para subir salario en Europa o entorno principal']);
 assert.deepEqual(byId('EVT_28_HOME_001').choices.map(c=>c.label),['Volver','Mantener vínculo pero seguir fuera','Pedir un plan deportivo de dos años antes','Acordar que se vuelva a hablar a los 30']);
 assert.deepEqual(byId('EVT_29_CON_001').choices.map(c=>c.label),['Maximizar dinero','Maximizar rol','Maximizar libertad','Reabrir negociación intentando un híbrido y arriesgar perder alguno']);
});

test('all five fail closed until their exact external world fact exists',()=>{
 for(const id of T525_STAGED_PRINCIPAL_EVENTS.map(e=>e.id)){
  const s=createInitialState(52501); s.age=Number(id.slice(4,6)); s.phase='26_30';
  assert.equal(eventGatesPass(s,byId(id)),false,id);
  assert.ok(byId(id).tags?.includes('a6_ready_external_blocker'),id);
 }
});

test('TEAM26 and NAT26 write their canonical owner seeds without market or club mutation',()=>{
 for(const [id,choice,seedId] of [['EVT_26_TEAM_001','A','SEED_YOUNG_SUCCESSOR'],['EVT_26_NAT_001','A','SEED_INTERNATIONAL_LOAD']]){
  const s=createInitialState(52502); s.age=26; s.phase='26_30';
  const beforeClub=s.club, beforeContract=structuredClone(s.contract), beforeMarket=structuredClone(s.market);
  const out=resolveChoice(s,byId(id),choice).state;
  assert.equal(out.club,beforeClub); assert.deepEqual(out.contract,beforeContract); assert.deepEqual(out.market,beforeMarket);
  assert.equal(out.seeds.find(seed=>seed.id===seedId)?.originEvent,id);
 }
});

test('legacy memories transformed by 28-29 scenes keep originEvent immutable',()=>{
 const cases=[
  ['EVT_28_RICH_001','SEED_WEALTHY_EXIT','EVT_24_JAN_001','peak28'],
  ['EVT_28_HOME_001','SEED_HOME_SYMBOL','EVT_23_HOME_001','return28'],
  ['EVT_29_CON_001','SEED_CONTRACT_CEILING','EVT_23_CON_001','age29']
 ];
 for(const [eventId,seedId,origin,key] of cases){
  const s=createInitialState(52503); s.age=Number(eventId.slice(4,6)); s.phase='26_30';
  s.seeds.push({id:seedId,state:'dormant',intensity:55,originEvent:origin,originSeason:s.season,npcRefs:[],payload:{old:true}});
  s.flags['HAS_'+seedId]=true;
  const out=resolveChoice(s,byId(eventId),'A').state;
  const seed=out.seeds.find(row=>row.id===seedId);
  assert.equal(seed?.originEvent,origin,eventId); assert.equal(seed?.payload.old,true,eventId); assert.ok(seed?.payload[key],eventId);
 }
});
