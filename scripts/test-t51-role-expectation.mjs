import test from 'node:test';
import assert from 'node:assert/strict';
import { EVENTS } from '../dist/content/events/index.js';
import { createInitialState } from '../dist/content/initial-state.js';
import { conditionsPass } from '../dist/core/conditions.js';
import { resolveChoiceInPlace } from '../dist/narrative/resolver.js';
import { loadSave, serializeSave } from '../dist/save/save.js';
import {
  hasRoleGuaranteeAt23,
  narrativeCausalFacts,
  narrativeConditionRoot,
  roleDropSince23
} from '../dist/simulation/club-contract-intent.js';

const bridge = EVENTS.find(event => event.id === 'EVT_23_BRIDGE_001');
assert.ok(bridge, 'Falta EVT_23_BRIDGE_001');

function age23State(seed = 9801) {
  const state = createInitialState(seed);
  state.age = 23;
  state.phase = '23_26';
  state.professional.initializedAt23 = true;
  state.professional.roleScoreAt23 = 72;
  state.sport.roleScore = 47;
  return state;
}

function resolveBridge(state, choiceId) {
  resolveChoiceInPlace(state, bridge, choiceId);
  const seed = state.seeds.find(candidate => candidate.id === 'SEED_ELITE_ROLE_BARGAIN');
  assert.ok(seed, 'BRIDGE debe crear SEED_ELITE_ROLE_BARGAIN');
  return seed;
}

test('role expectation/1 expone la caída factual desde el snapshot de entrada a 23 sin imponer umbral narrativo', () => {
  const state = age23State();
  assert.equal(roleDropSince23(state), 25);
  state.sport.roleScore = 80;
  assert.equal(roleDropSince23(state), 0, 'una mejora de rol no produce caída negativa');
});

test('role expectation/2 falla cerrado antes de que exista el snapshot autoritativo de edad 23', () => {
  const state = age23State(9802);
  state.professional.initializedAt23 = false;
  assert.equal(roleDropSince23(state), 0);
  state.age = 22;
  assert.equal(roleDropSince23(state), 0);
  assert.equal(hasRoleGuaranteeAt23(state), false);
});

test('role expectation/3 solo role_guarantees del bridge prueba una expectativa concreta; B/C/D no', () => {
  const cases = [
    ['A', 'role_guarantees', true],
    ['B', 'security_over_role', false],
    ['C', 'wait_market', false],
    ['D', 'agent_listens', false]
  ];
  for (let index = 0; index < cases.length; index += 1) {
    const [choiceId, stance, expected] = cases[index];
    const state = age23State(9810 + index);
    const seed = resolveBridge(state, choiceId);
    assert.equal(seed.payload.stance, stance);
    assert.equal(hasRoleGuaranteeAt23(state), expected, `${choiceId}/${stance}`);
  }
});

test('role expectation/4 una seed con el mismo id pero origen distinto no fabrica la historia del bridge', () => {
  const state = age23State(9820);
  const seed = resolveBridge(state, 'A');
  seed.originEvent = 'EVT_FAKE_SOURCE';
  assert.equal(hasRoleGuaranteeAt23(state), false);
});

test('role expectation/5 resolver o consumir después la seed no borra el hecho histórico de la conversación', () => {
  const state = age23State(9821);
  const seed = resolveBridge(state, 'A');
  seed.state = 'resolved';
  seed.consumedBy = 'LATER_EVENT';
  assert.equal(hasRoleGuaranteeAt23(state), true);
  seed.state = 'expired';
  assert.equal(hasRoleGuaranteeAt23(state), true);
});

test('role expectation/6 caída y expectativa son hechos independientes', () => {
  const state = age23State(9822);
  let facts = narrativeCausalFacts(state);
  assert.equal(facts.roleDropSince23, 25);
  assert.equal(facts.roleGuaranteeAt23, false, 'caída sola no fabrica expectativa previa');

  resolveBridge(state, 'A');
  state.sport.roleScore = state.professional.roleScoreAt23;
  facts = narrativeCausalFacts(state);
  assert.equal(facts.roleDropSince23, 0, 'expectativa sola no fabrica una caída');
  assert.equal(facts.roleGuaranteeAt23, true);
});

test('role expectation/7 los facts están disponibles a Condition y conviven con seed-memory y sport facts', () => {
  const state = age23State(9823);
  resolveBridge(state, 'A');
  const root = narrativeConditionRoot(state);
  assert.equal(conditionsPass(root, [
    { path: 'facts.roleGuaranteeAt23', op: 'eq', value: true },
    { path: 'facts.roleDropSince23', op: 'gte', value: 20 }
  ]), true);
  assert.ok(Object.prototype.hasOwnProperty.call(root.facts, 'brunoFavorStance'));
  assert.equal(root.facts.sport.sportingClub, state.professional.registrationClub);
  assert.equal(root.facts.match.status, 'no_authoritative_match_model');
  assert.equal(Object.hasOwn(state, 'facts'), false);
});

test('role expectation/8 leer causal facts no consume RNG ni muta el estado', () => {
  const state = age23State(9824);
  resolveBridge(state, 'A');
  const before = structuredClone(state);
  narrativeCausalFacts(state);
  narrativeConditionRoot(state);
  assert.deepEqual(state, before);
});

test('role expectation/9 save/load conserva exactamente los facts derivados', () => {
  const state = age23State(9825);
  resolveBridge(state, 'A');
  const before = narrativeCausalFacts(state);
  const restored = loadSave(serializeSave(state));
  assert.deepEqual(narrativeCausalFacts(restored), before);
});

test('role expectation/10 presencia genérica sin payload exacto no acredita garantía', () => {
  const state = age23State(9826);
  const seed = resolveBridge(state, 'A');
  seed.payload.stance = 'unknown_or_legacy';
  assert.equal(hasRoleGuaranteeAt23(state), false);
});
