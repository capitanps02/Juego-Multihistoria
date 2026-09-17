import './test-t51-role-expectation.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState } from '../dist/content/initial-state.js';
import { eventGatesPass } from '../dist/narrative/event-gates.js';
import {
  LOCKER_LEADERSHIP_ASSIGNMENTS,
  lockerSlotAffinity,
  lockerSlotRelationship,
  resolveLockerSlot
} from '../dist/simulation/locker-leadership.js';
import { narrativeCausalFacts } from '../dist/simulation/club-contract-intent.js';
import { loadSave, serializeSave } from '../dist/save/save.js';

function state23(seed = 8400) {
  const state = createInitialState(seed);
  state.age = 23;
  state.phase = '23_26';
  return state;
}

function relation(state, npcId) {
  const value = state.relationships.find(candidate => candidate.npcId === npcId);
  assert.ok(value, `missing relationship ${npcId}`);
  return value;
}

function npc(state, npcId) {
  const value = state.npcs.find(candidate => candidate.id === npcId);
  assert.ok(value, `missing npc ${npcId}`);
  return value;
}

const lockerGate = {
  id: 'TEST_LOCKER_GATE',
  ageWindow: [23, 23],
  phase: '23_26',
  family: 'team',
  gates: [],
  gateAlternatives: [
    [{ path: 'facts.lockerCaptainAffinity', op: 'gte', value: 60 }],
    [{ path: 'facts.lockerStarAffinity', op: 'gte', value: 60 }],
    [{ path: 'flags.HAS_SEED_TEAMMATE_COVER', op: 'eq', value: true }]
  ],
  cooldown: 0,
  weight: 1,
  text: { title: 'test', body: 'test' },
  intel: { visible: [], uncertain: [] },
  choices: [],
  outcomes: []
};

test('T5 shared locker/1 registry is explicit and does not invent SLOT_STAR', () => {
  const udv = LOCKER_LEADERSHIP_ASSIGNMENTS.find(row => row.club === 'UDV' && row.phases.includes('23_26'));
  assert.ok(udv);
  assert.equal(udv.captain, 'NPC_PLR_10');
  assert.equal(udv.star, null);
});

test('T5 shared locker/2 resolver returns only a current-club active certified leader', () => {
  const state = state23();
  assert.equal(resolveLockerSlot(state, 'captain'), 'NPC_PLR_10');
  assert.equal(resolveLockerSlot(state, 'star'), null);

  state.club = 'ATL';
  assert.equal(resolveLockerSlot(state, 'captain'), null, 'UDV captain must not leak after player club change');

  state.club = 'UDV';
  npc(state, 'NPC_PLR_10').club = 'ATL';
  assert.equal(resolveLockerSlot(state, 'captain'), null, 'stale assignment must fail when the NPC left the current club');

  npc(state, 'NPC_PLR_10').club = 'UDV';
  npc(state, 'NPC_PLR_10').careerState = 'retired';
  assert.equal(resolveLockerSlot(state, 'captain'), null, 'inactive leader must fail closed');
});

test('T5 shared locker/3 relationship access owns only its causal-fact subset and consumes zero RNG', () => {
  const state = state23();
  relation(state, 'NPC_PLR_10').affinity = 67;
  relation(state, 'NPC_PLR_10').trust = 71;
  const before = JSON.stringify(state);

  assert.equal(lockerSlotAffinity(state, 'captain'), 67);
  assert.equal(lockerSlotRelationship(state, 'captain', 'trust'), 71);
  assert.equal(lockerSlotAffinity(state, 'star'), null);

  const facts = narrativeCausalFacts(state);
  assert.equal(typeof facts.clubWantsRenewal, 'boolean');
  assert.equal(facts.lockerCaptainAffinity, 67);
  assert.equal(facts.lockerStarAffinity, null);

  assert.equal(JSON.stringify(state), before, 'leadership reads must not mutate state or RNG');
});

test('T5 shared locker/4 gate uses certified leader or seed, never an arbitrary high-affinity teammate', () => {
  const state = state23();
  relation(state, 'NPC_PLR_10').affinity = 40;
  relation(state, 'NPC_PLR_12').affinity = 99;
  state.flags.HAS_SEED_TEAMMATE_COVER = false;

  assert.equal(eventGatesPass(state, lockerGate), false, 'non-leader affinity cannot satisfy the leadership route');

  relation(state, 'NPC_PLR_10').affinity = 65;
  assert.equal(eventGatesPass(state, lockerGate), true, 'certified captain affinity may satisfy the route');

  state.club = 'ATL';
  assert.equal(eventGatesPass(state, lockerGate), false, 'changing club invalidates the UDV leader');

  state.flags.HAS_SEED_TEAMMATE_COVER = true;
  assert.equal(eventGatesPass(state, lockerGate), true, 'the independent seed route remains valid without a leadership slot');
});

test('T5 shared locker/5 save/reload reconstructs the same derived slot without persisted facts', () => {
  const state = state23();
  relation(state, 'NPC_PLR_10').affinity = 74;
  const rngBefore = structuredClone(state.rngState);
  const restored = loadSave(serializeSave(state));

  assert.equal(resolveLockerSlot(restored, 'captain'), 'NPC_PLR_10');
  assert.equal(lockerSlotAffinity(restored, 'captain'), 74);
  assert.equal(resolveLockerSlot(restored, 'star'), null);
  assert.deepEqual(restored.rngState, rngBefore);
  assert.equal(Object.prototype.hasOwnProperty.call(restored, 'facts'), false, 'derived facts must never be persisted');
});
