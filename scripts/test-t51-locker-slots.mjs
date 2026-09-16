import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState } from '../dist/content/initial-state.js';
import { eventGatesPass } from '../dist/narrative/event-gates.js';
import { loadSave, serializeSave } from '../dist/save/save.js';
import {
  LOCKER_SLOT_ASSIGNMENTS,
  lockerLeadershipFacts,
  lockerSlotRelationshipValue,
  resolveLockerSlot
} from '../dist/simulation/locker-leadership.js';

function state23(seed = 8401) {
  const state = createInitialState(seed);
  state.age = 23;
  state.phase = '23_26';
  state.club = 'UDV';
  return state;
}

function relation(state, npcId) {
  const row = state.relationships.find(candidate => candidate.npcId === npcId);
  assert.ok(row, `missing relationship ${npcId}`);
  return row;
}

function lockerGateEvent(threshold = 60) {
  return {
    id: 'EVT_T51_LOCKER_SLOT_TEST',
    ageWindow: [23, 25],
    phase: '23_26',
    family: 'team',
    gates: [],
    gateAlternatives: [
      [{ path: 'facts.lockerCaptainAffinity', op: 'gte', value: threshold }],
      [{ path: 'facts.lockerStarAffinity', op: 'gte', value: threshold }],
      [{ path: 'flags.HAS_SEED_TEAMMATE_COVER', op: 'eq', value: true }]
    ],
    cooldown: 365,
    repeatable: false,
    weight: 1,
    text: { title: 'slot test', body: 'slot test' },
    intel: { visible: [], uncertain: [] },
    choices: [{ id: 'A', label: 'A', intentTags: [], outcomeIds: ['O'] }],
    outcomes: [{ id: 'O', baseWeight: 1, effects: [], messages: [] }]
  };
}

test('locker slots/1 UDV captain is explicit and unresolved star fails closed', () => {
  const state = state23();
  assert.deepEqual(LOCKER_SLOT_ASSIGNMENTS.map(row => [row.club, row.slot, row.npcId]), [
    ['UDV', 'captain', 'NPC_PLR_10']
  ]);
  assert.equal(resolveLockerSlot(state, 'captain'), 'NPC_PLR_10');
  assert.equal(resolveLockerSlot(state, 'star'), null);
  const facts = lockerLeadershipFacts(state);
  assert.equal(facts.lockerCaptainNpcId, 'NPC_PLR_10');
  assert.equal(facts.lockerStarNpcId, null);
  assert.equal(facts.lockerStarAffinity, null);
});

test('locker slots/2 role text and high affinity with a non-leader never invent authority', () => {
  const state = state23();
  relation(state, 'NPC_PLR_10').affinity = 10;
  relation(state, 'NPC_PLR_12').affinity = 100;
  const bruno = state.npcs.find(npc => npc.id === 'NPC_PLR_12');
  assert.ok(bruno);
  bruno.role = 'Capitán y estrella';
  assert.equal(resolveLockerSlot(state, 'captain'), 'NPC_PLR_10');
  assert.equal(resolveLockerSlot(state, 'star'), null);
  assert.equal(eventGatesPass(state, lockerGateEvent(60)), false);
});

test('locker slots/3 changing protagonist club never carries UDV leadership forward', () => {
  const state = state23();
  state.club = 'Aurora CF';
  assert.equal(resolveLockerSlot(state, 'captain'), null);
  assert.equal(resolveLockerSlot(state, 'star'), null);
  assert.equal(lockerSlotRelationshipValue(state, 'captain', 'affinity'), null);
});

test('locker slots/4 transferred or inactive assigned NPC invalidates the slot', () => {
  for (const mutation of ['club', 'career']) {
    const state = state23(mutation === 'club' ? 8404 : 8405);
    const vela = state.npcs.find(npc => npc.id === 'NPC_PLR_10');
    assert.ok(vela);
    if (mutation === 'club') vela.club = 'Otro Club';
    else vela.careerState = 'retired';
    assert.equal(resolveLockerSlot(state, 'captain'), null);
  }
});

test('locker slots/5 authority is phase-bounded instead of leaking into later career', () => {
  const state = state23();
  assert.equal(resolveLockerSlot(state, 'captain'), 'NPC_PLR_10');
  state.phase = '26_30';
  state.age = 26;
  assert.equal(resolveLockerSlot(state, 'captain'), null);
});

test('locker slots/6 reads consume no RNG and mutate no state', () => {
  const state = state23();
  const before = structuredClone(state);
  for (let i = 0; i < 20; i++) {
    resolveLockerSlot(state, 'captain');
    resolveLockerSlot(state, 'star');
    lockerLeadershipFacts(state);
    lockerSlotRelationshipValue(state, 'captain', 'trust');
  }
  assert.deepEqual(state, before);
});

test('locker slots/7 captain/star facts compose with seed route through existing OR gates', () => {
  const state = state23();
  relation(state, 'NPC_PLR_10').affinity = 65;
  assert.equal(eventGatesPass(state, lockerGateEvent(60)), true, 'captain affinity should open route A');

  relation(state, 'NPC_PLR_10').affinity = 20;
  assert.equal(eventGatesPass(state, lockerGateEvent(60)), false, 'no leader route and no seed must fail');

  state.flags.HAS_SEED_TEAMMATE_COVER = true;
  assert.equal(eventGatesPass(state, lockerGateEvent(60)), true, 'prior teammate-cover seed must independently open route B');
});

test('locker slots/8 save/reload reconstructs the same authority without persisted derived facts', () => {
  const state = state23();
  relation(state, 'NPC_PLR_10').affinity = 67;
  const beforeFacts = lockerLeadershipFacts(state);
  const restored = loadSave(serializeSave(state));
  assert.deepEqual(lockerLeadershipFacts(restored), beforeFacts);
  assert.equal(resolveLockerSlot(restored, 'captain'), 'NPC_PLR_10');
  assert.equal(eventGatesPass(restored, lockerGateEvent(60)), true);
});
