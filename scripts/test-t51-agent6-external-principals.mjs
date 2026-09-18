import assert from 'node:assert/strict';
import test from 'node:test';
import { createInitialState } from '../dist/content/initial-state.js';
import { T524_STAGED_PRINCIPAL_EVENTS } from '../dist/content/events/26_30/t524-staged-external-principal-events.js';
import { eventGatesPass } from '../dist/narrative/event-gates.js';
import { resolveChoice } from '../dist/narrative/resolver.js';

const byId = id => {
  const event = T524_STAGED_PRINCIPAL_EVENTS.find(row => row.id === id);
  assert.ok(event, id);
  return event;
};

test('t524 owns five exact canonical principal contracts', () => {
  assert.deepEqual(T524_STAGED_PRINCIPAL_EVENTS.map(event => event.id), [
    'EVT_27_LOCK_001','EVT_27_NAT_001','EVT_28_CON_001','EVT_29_PRS_001','EVT_29_TACT_001'
  ]);
  assert.deepEqual(byId('EVT_27_LOCK_001').choices.map(c => c.label), [
    'Decir que debe seguir','Decir que el ciclo terminó','Negarte a decidir sobre su puesto','Condicionar tu apoyo a cambios concretos'
  ]);
  assert.deepEqual(byId('EVT_27_NAT_001').choices.map(c => c.label), [
    'Aceptar','Aceptar solo como capitán temporal','Rechazar y apoyar a otro veterano','Pedir que el grupo vote o consulte internamente'
  ]);
  assert.deepEqual(byId('EVT_28_CON_001').choices.map(c => c.label), [
    'Cinco años','Dos años','Pedir tres con opción del jugador','Elegir según cláusula de salida y no duración'
  ]);
  assert.deepEqual(byId('EVT_29_PRS_001').choices.map(c => c.label), [
    'Confirmar off the record','Negarlo','Decir que no hablarás de vestuario','Dar una respuesta parcial sobre fútbol, no personas'
  ]);
  assert.deepEqual(byId('EVT_29_TACT_001').choices.map(c => c.label), [
    'Adoptar el nuevo rol como posición principal','Mantener rol histórico','Usarlo solo en club','Usarlo solo cuando no compitas con el sucesor joven'
  ]);
});

test('four shared-authority principals fail closed until their owner facts exist', () => {
  for (const id of ['EVT_27_LOCK_001','EVT_27_NAT_001','EVT_28_CON_001','EVT_29_PRS_001']) {
    const state = createInitialState(52401);
    state.age = Number(id.slice(4,6));
    state.phase = '26_30';
    state.professional.institutionalPower = 90;
    state.flags.HAS_SEED_CLARA_CHANNEL = true;
    assert.equal(eventGatesPass(state, byId(id)), false, id);
    assert.ok(byId(id).tags?.includes('a6_ready_external_blocker'), id);
  }
});

test('TACT29 executes from real roleAdaptability and preserves existing seed origin', () => {
  const event = byId('EVT_29_TACT_001');
  const state = createInitialState(52402);
  state.age = 29;
  state.phase = '26_30';
  state.professional.roleAdaptability = 52;
  state.seeds.push({
    id:'SEED_POSITIONAL_REINVENTION', state:'dormant', intensity:55,
    originEvent:'EVT_28_TACT_001', originSeason:state.season, npcRefs:[], payload:{legacy:true}
  });
  state.flags.HAS_SEED_POSITIONAL_REINVENTION = true;
  assert.equal(eventGatesPass(state,event), true);
  const beforeClub = state.club;
  const beforeContract = structuredClone(state.contract);
  const beforeMarket = structuredClone(state.market);
  const result = resolveChoice(state,event,'A').state;
  assert.equal(result.club,beforeClub);
  assert.deepEqual(result.contract,beforeContract);
  assert.deepEqual(result.market,beforeMarket);
  const seed = result.seeds.find(row => row.id === 'SEED_POSITIONAL_REINVENTION');
  assert.equal(seed?.originEvent,'EVT_28_TACT_001');
  assert.equal(seed?.payload.legacy,true);
  assert.equal(seed?.payload.age29,'primary_role');
  assert.ok(result.professional.roleAdaptability > 52);
});

test('LOCK27 declares the external current-club crisis fact and writes only owner seed', () => {
  const event = byId('EVT_27_LOCK_001');
  assert.deepEqual(event.gates,[
    {path:'professional.institutionalPower',op:'gte',value:63},
    {path:'facts.currentClubCoachCrisis',op:'eq',value:true}
  ]);
  assert.ok(event.outcomes.flatMap(o => o.seedTransitions ?? []).every(t => t.seedId === 'SEED_LOCKER_ENDORSEMENT'));
});

test('external blocker content never mutates facts, club, contract or market', () => {
  for (const id of ['EVT_27_NAT_001','EVT_28_CON_001','EVT_29_PRS_001']) {
    const event = byId(id);
    const paths = [
      ...event.choices.flatMap(c => c.immediateEffects ?? []),
      ...event.outcomes.flatMap(o => o.effects ?? [])
    ].map(e => e.kind === 'flag' ? 'flags.' + e.flag : e.path);
    assert.ok(paths.every(path => !path.startsWith('facts.')), id);
    assert.ok(paths.every(path => path !== 'club' && !path.startsWith('contract.') && !path.startsWith('market.')), id);
  }
});
