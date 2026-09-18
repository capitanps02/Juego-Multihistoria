import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState } from '../dist/content/initial-state.js';
import { loadSave, serializeSave } from '../dist/save/save.js';

const invalidSave = error => error?.code === 'INVALID_SAVE';

function corruptedState(seed, factValue) {
  const state = createInitialState(seed);
  const npc = state.npcs[0];
  assert.ok(npc, 'reproduction invalid: canonical NPC catalog is empty');
  npc.knowledge.T5_QA_CORRUPT = factValue;
  return state;
}

test('T5-QA-032a: non-record NPC knowledge value fails closed at serialize/load boundaries', () => {
  const state = corruptedState(53201, 7);
  const before = structuredClone(state);
  assert.throws(() => serializeSave(state), invalidSave);
  assert.throws(() => loadSave(JSON.stringify(state)), invalidSave);
  assert.deepEqual(state, before, 'validation must not mutate corrupt input');
});

test('T5-QA-032b: structurally invalid NPC knowledge record fails closed', () => {
  const state = corruptedState(53202, {
    factId: 'DIFFERENT_FACT_ID',
    eventId: 'EVT_FAKE',
    choiceId: 'A',
    outcomeId: 'OUT',
    learnedAt: stateDate(),
    source: 'omniscient',
    certainty: 150,
    memory: 'forever',
    club: 'UDV'
  });
  assert.throws(() => serializeSave(state), invalidSave);
  assert.throws(() => loadSave(JSON.stringify(state)), invalidSave);
});

function stateDate() {
  return '2026-07-01';
}

test('T5-QA-032c: absent knowledge fact remains valid historical/current state', () => {
  const state = createInitialState(53203);
  const beforeRng = structuredClone(state.rngState);
  const restored = loadSave(serializeSave(state));
  assert.deepEqual(restored.npcs.map(npc => npc.knowledge), state.npcs.map(npc => npc.knowledge));
  assert.deepEqual(restored.rngState, beforeRng);
});


test('T5-QA-032d: invalid NPC source/date fail closed and valid records round-trip exactly', () => {
  const invalidSource = corruptedState(53204, {
    factId: 'T5_QA_CORRUPT', eventId: 'EVT_TEST', choiceId: 'A', outcomeId: 'OUT',
    learnedAt: '2026-07-01', source: 'reported', certainty: 80, memory: 'temporary', club: 'UDV',
    expiresAfter: '2026-08-01', sourceNpcId: 'NPC_DOES_NOT_EXIST'
  });
  assert.throws(() => serializeSave(invalidSource), invalidSave);
  assert.throws(() => loadSave(JSON.stringify(invalidSource)), invalidSave);

  const future = corruptedState(53205, {
    factId: 'T5_QA_CORRUPT', eventId: 'EVT_TEST', choiceId: 'A', outcomeId: 'OUT',
    learnedAt: '2099-01-01', source: 'informed', certainty: 80, memory: 'temporary', club: 'UDV'
  });
  assert.throws(() => serializeSave(future), invalidSave);

  const valid = createInitialState(53206);
  const npc = valid.npcs[0];
  npc.knowledge.T5_QA_VALID = {
    factId: 'T5_QA_VALID', eventId: 'EVT_TEST', choiceId: 'A', outcomeId: 'OUT',
    learnedAt: valid.date, source: 'informed', certainty: 80, memory: 'temporary', club: valid.club,
    expiresAfter: '2028-07-01'
  };
  const before = structuredClone(npc.knowledge.T5_QA_VALID);
  const beforeRng = structuredClone(valid.rngState);
  const restored = loadSave(serializeSave(valid));
  assert.deepEqual(restored.npcs[0].knowledge.T5_QA_VALID, before);
  assert.deepEqual(restored.rngState, beforeRng);
});
