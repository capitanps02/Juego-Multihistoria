import assert from 'node:assert/strict';
import test from 'node:test';
import { createInitialState } from '../dist/content/initial-state.js';
import { T539_STAGED_PRINCIPAL_EVENTS } from '../dist/content/events/23_26/t539-staged-principal-events.js';
import { eventGatesPass } from '../dist/narrative/event-gates.js';

const byId=id=>{const e=T539_STAGED_PRINCIPAL_EVENTS.find(row=>row.id===id);assert.ok(e,id);return e;};

test('t539 closes the three remaining 23-26 principal contracts',()=>{
  assert.deepEqual(T539_STAGED_PRINCIPAL_EVENTS.map(e=>e.id),['EVT_24_MATCH_001','EVT_25_AGT_001','EVT_25_NAT_001']);
  assert.deepEqual(byId('EVT_24_MATCH_001').choices.map(c=>c.label),['Entregarle el balón','Decir que lo tiras tú','Preguntar al capitán o técnico desde el campo','Proponer decidirlo con una regla rápida entre ambos']);
  assert.deepEqual(byId('EVT_25_AGT_001').choices.map(c=>c.label),['Romper con el agente','Exigir acceso a todo contacto futuro y seguir','Pedir explicación documental antes de decidir','Usar la información para renegociar comisión o representación']);
  assert.deepEqual(byId('EVT_25_NAT_001').choices.map(c=>c.label),['Aceptar rol sin ruido','Preguntar qué debes cambiar para adelantarle','Pedir probar otra posición','Dejar que tu agente use el estatus internacional en mercado aunque juegues poco']);
});

test('t539 external facts fail closed rather than using proxies',()=>{
  const match=createInitialState(53901);match.age=24;match.phase='23_26';match.professional.lockerPower=100;assert.equal(eventGatesPass(match,byId('EVT_24_MATCH_001')),false);
  const penalty=byId('EVT_24_MATCH_001');assert.ok(penalty.gates.some(g=>g.path==='facts.match.penaltyDecisionContext'));assert.ok(penalty.gates.some(g=>g.path==='facts.match.designatedTakerMissedEarlier'));assert.ok(penalty.gates.some(g=>g.path==='facts.match.highProfileMatch'));
  const agent=createInitialState(53902);agent.age=25;agent.phase='23_26';agent.professional.agentControl=100;agent.flags.HAS_SEED_AGENT_OMISSION=true;assert.equal(eventGatesPass(agent,byId('EVT_25_AGT_001')),false);
  const nat=createInitialState(53903);nat.age=25;nat.phase='23_26';nat.professional.nationalCaps=100;nat.professional.nationalStanding=100;nat.flags.HAS_SEED_FIRST_ABSOLUTE_CALL=true;assert.equal(eventGatesPass(nat,byId('EVT_25_NAT_001')),false);
});

test('MATCH24 never manufactures the penalty result',()=>{
  const e=byId('EVT_24_MATCH_001');
  const effects=[...e.choices.flatMap(c=>c.immediateEffects??[]),...e.outcomes.flatMap(o=>o.effects??[])];
  const paths=effects.map(x=>x.kind==='flag'?'flags.'+x.flag:x.path);
  assert.ok(paths.every(p=>!String(p).startsWith('sport.result')&&!String(p).startsWith('sport.goals')&&!String(p).startsWith('facts.')));
  assert.ok(e.tags?.includes('consumes_a4_pr209_match24_setup'));
  assert.ok(e.tags?.includes('needs_a4_penalty_outcome_resolver_for_scored_missed'));
});

test('AGT25 and NAT25 require current factual authority',()=>{
  assert.ok(byId('EVT_25_AGT_001').tags?.includes('needs_a1_certified_active_agent_identity_and_omission_evidence'));
  assert.ok(byId('EVT_25_NAT_001').tags?.includes('needs_concrete_current_squad_role_not_standing_or_history_proxy'));
});
