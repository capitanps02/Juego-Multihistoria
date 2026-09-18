import assert from 'node:assert/strict';
import test from 'node:test';
import { createInitialState } from '../dist/content/initial-state.js';
import { T523_STAGED_INDEPENDENT_PRINCIPAL_EVENTS } from '../dist/content/events/23_26/t523-staged-independent-principal-events.js';
import { eventGatesPass } from '../dist/narrative/event-gates.js';
import { resolveChoice } from '../dist/narrative/resolver.js';
import { loadSave, serializeSave } from '../dist/save/save.js';

const byId = id => {
  const rows = T523_STAGED_INDEPENDENT_PRINCIPAL_EVENTS.filter(event => event.id === id);
  assert.equal(rows.length, 1);
  return rows[0];
};
const labels = id => byId(id).choices.map(choice => choice.label);
const allEffectPaths = event => [
  ...event.choices.flatMap(choice => choice.immediateEffects ?? []),
  ...event.outcomes.flatMap(outcome => outcome.effects ?? [])
].map(effect => effect.kind === 'flag' ? `flags.${effect.flag}` : effect.path);

test('t523 contains five canonical principal definitions with exact decision labels', () => {
  assert.deepEqual(T523_STAGED_INDEPENDENT_PRINCIPAL_EVENTS.map(event => event.id), [
    'EVT_24_IMG_001','EVT_24_LIFE_001','EVT_24_PRS_001','EVT_25_FAM_001','EVT_25_END_001'
  ]);
  assert.deepEqual(labels('EVT_24_IMG_001'), [
    'Aceptar el lema','Pedir un mensaje sin promesa de futuro','Rechazar la campaña','Aceptar solo si se publica tras cerrar mercado'
  ]);
  assert.deepEqual(labels('EVT_24_LIFE_001'), [
    'Contratar a Dani','Elegir profesional de la agencia','Contratar a un independiente','Repartir tareas entre alguien cercano y un profesional'
  ]);
  assert.deepEqual(labels('EVT_24_PRS_001'), [
    'Preguntar internamente y no hablar','Negar públicamente que exista precio acordado','Autorizar a tu agente a decir que escucharías proyectos','Llamar a Clara para intentar conocer la fuente'
  ]);
  assert.deepEqual(labels('EVT_25_FAM_001'), [
    'Aportar capital','Prestar con contrato y calendario','No poner más dinero','Financiar solo si entra un gestor externo'
  ]);
  assert.deepEqual(labels('EVT_25_END_001'), [
    'Proteger techo deportivo','Proteger minutos e identidad','Proteger cuerpo y estabilidad','Proteger libertad'
  ]);
  for (const event of T523_STAGED_INDEPENDENT_PRINCIPAL_EVENTS) assert.equal(event.canonStatus, 'verified');
});

test('image24 and press24 retain their explicit factual gates', () => {
  const state = createInitialState(52301);
  state.age = 24;
  state.phase = '23_26';
  state.professional.commercialPower = 27;
  state.reputation.marketHeat = 47;
  assert.equal(eventGatesPass(state, byId('EVT_24_IMG_001')), false);
  assert.equal(eventGatesPass(state, byId('EVT_24_PRS_001')), false);
  state.professional.commercialPower = 28;
  state.reputation.marketHeat = 48;
  assert.equal(eventGatesPass(state, byId('EVT_24_IMG_001')), true);
  assert.equal(eventGatesPass(state, byId('EVT_24_PRS_001')), true);
});

test('the five scenes never mutate club, market or CareerTerms directly', () => {
  for (const event of T523_STAGED_INDEPENDENT_PRINCIPAL_EVENTS) {
    for (const path of allEffectPaths(event)) {
      assert.notEqual(path, 'club');
      assert.ok(!path.startsWith('contract.'), `${event.id}: direct contract mutation ${path}`);
      assert.ok(!path.startsWith('market.'), `${event.id}: direct market mutation ${path}`);
    }
  }
});

test('image24 transforms prior sponsor memory without rewriting its historical origin', () => {
  const state = createInitialState(52302);
  state.age = 24;
  state.phase = '23_26';
  state.professional.commercialPower = 40;
  state.seeds.push({
    id:'SEED_SPONSOR_IMAGE',state:'dormant',intensity:55,originEvent:'EVT_21_IMG_001',
    originSeason:state.season,npcRefs:[],payload:{old:true}
  });
  state.flags.HAS_SEED_SPONSOR_IMAGE = true;
  const result = resolveChoice(state, byId('EVT_24_IMG_001'), 'A');
  const seed = result.state.seeds.find(row => row.id === 'SEED_SPONSOR_IMAGE');
  assert.equal(seed?.originEvent, 'EVT_21_IMG_001');
  assert.equal(seed?.payload.old, true);
  assert.equal(seed?.payload.campaign24, 'promise_stay');
  assert.equal(seed?.payload.publicPromise, true);
});

test('life24, family25 and end25 write canonical owner seeds with save/load-safe payloads', () => {
  const lifeState = createInitialState(52303);
  lifeState.age = 24; lifeState.phase = '23_26';
  const life = resolveChoice(lifeState, byId('EVT_24_LIFE_001'), 'C').state;
  const personal = life.seeds.find(seed => seed.id === 'SEED_PERSONAL_STAFF');
  assert.equal(personal?.originEvent, 'EVT_24_LIFE_001');
  assert.equal(personal?.payload.structure, 'independent');

  const famState = createInitialState(52304);
  famState.age = 25; famState.phase = '23_26';
  const fam = resolveChoice(famState, byId('EVT_25_FAM_001'), 'B').state;
  const family = fam.seeds.find(seed => seed.id === 'SEED_FAMILY_BUSINESS');
  assert.equal(family?.originEvent, 'EVT_25_FAM_001');
  assert.equal(family?.payload.stage25, 'formal_loan');

  const endState = createInitialState(52305);
  endState.age = 25; endState.phase = '23_26';
  const end = resolveChoice(endState, byId('EVT_25_END_001'), 'C').state;
  assert.equal(end.world.nextCyclePriority, 'body_stability');
  const priority = end.seeds.find(seed => seed.id === 'SEED_AGE26_PRIORITY');
  assert.equal(priority?.originEvent, 'EVT_25_END_001');
  assert.equal(priority?.payload.priority, 'body_stability');
  assert.equal(priority?.payload.advisory, true);

  const restored = loadSave(serializeSave(end));
  assert.equal(restored.world.nextCyclePriority, 'body_stability');
  assert.equal(restored.seeds.find(seed => seed.id === 'SEED_AGE26_PRIORITY')?.payload.priority, 'body_stability');
});

test('t523 resolution is deterministic for identical narrative RNG state', () => {
  const a = createInitialState(52306);
  const b = createInitialState(52306);
  a.age = b.age = 25;
  a.phase = b.phase = '23_26';
  const ra = resolveChoice(a, byId('EVT_25_END_001'), 'D');
  const rb = resolveChoice(b, byId('EVT_25_END_001'), 'D');
  assert.deepEqual(ra.state.rngState, rb.state.rngState);
  assert.deepEqual(ra.state.seeds, rb.state.seeds);
  assert.deepEqual(ra.state.world.nextCyclePriority, rb.state.world.nextCyclePriority);
});
