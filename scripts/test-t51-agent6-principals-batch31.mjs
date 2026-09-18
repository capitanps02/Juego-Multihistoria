import assert from 'node:assert/strict';
import test from 'node:test';
import { createInitialState } from '../dist/content/initial-state.js';
import { T531_STAGED_PRINCIPAL_EVENTS } from '../dist/content/events/26_30/t531-staged-principal-events.js';
import { eventGatesPass } from '../dist/narrative/event-gates.js';
const byId=id=>{const e=T531_STAGED_PRINCIPAL_EVENTS.find(row=>row.id===id);assert.ok(e,id);return e;};
test('t531 exact principal contracts',()=>{
 assert.deepEqual(T531_STAGED_PRINCIPAL_EVENTS.map(e=>e.id),['EVT_26_EUR_001','EVT_26_MATCH_001','EVT_26_TEAM_002','EVT_26_NAT_002','EVT_26_FINAL_001']);
 assert.deepEqual(byId('EVT_26_EUR_001').choices.map(c=>c.label),['Aceptar el plan sin discutir','Pedir explicación táctica detallada','Mostrar desacuerdo y exigir empezar','Aceptar pero pedir que no se venda públicamente como descanso']);
 assert.deepEqual(byId('EVT_26_MATCH_001').choices.map(c=>c.label),['Pedir el balón','Respetar al lanzador','Hablarlo en el campo y decidir juntos','Dejar que el capitán decida']);
 assert.deepEqual(byId('EVT_26_TEAM_002').choices.map(c=>c.label),['Decirle lo que quiere el entrenador','Contarle también la petición del técnico y dejarle decidir','Recomendar la cesión','No aconsejar sobre una decisión que afecta a su carrera']);
 assert.deepEqual(byId('EVT_26_NAT_002').choices.map(c=>c.label),['Aceptar y especializarte en ese rol','Pedir competir por otra posición','Expresar que no te satisface','Reducir compromisos de selección fuera de partidos']);
 assert.deepEqual(byId('EVT_26_FINAL_001').choices.map(c=>c.label),['Aceptar','Pedir reconsideración una sola vez','Escalar al capitán o director deportivo','No discutir antes, pero decidir que revisarás tu futuro después']);
});
test('t531 scenes fail closed without A4/national/current-club facts',()=>{
 for(const e of T531_STAGED_PRINCIPAL_EVENTS){const s=createInitialState(53101);s.age=26;s.phase='26_30';s.professional.roleSecurity=100;s.professional.nationalStanding=100;assert.equal(eventGatesPass(s,e),false,e.id);assert.ok(e.tags?.includes('a6_ready_external_blocker'),e.id);}
});
test('MATCH26 carries no local football result effects',()=>{
 const e=byId('EVT_26_MATCH_001');const paths=[...e.choices.flatMap(c=>c.immediateEffects??[]),...e.outcomes.flatMap(o=>o.effects??[])].map(x=>x.kind==='flag'?'flags.'+x.flag:x.path);
 assert.ok(paths.every(p=>!p.startsWith('sport.result')&&!p.startsWith('facts.')&&p!=='sport.goals'));
});
