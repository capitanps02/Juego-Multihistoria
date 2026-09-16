import test from 'node:test';
import assert from 'node:assert/strict';
import { EVENTS } from '../dist/content/events/index.js';
import { createInitialState } from '../dist/content/initial-state.js';
import * as resolver from '../dist/narrative/resolver.js';

async function optionalImport(path) {
  try {
    return await import(path);
  } catch (error) {
    if (error?.code === 'ERR_MODULE_NOT_FOUND') return null;
    throw error;
  }
}

const byId = id => {
  const event = EVENTS.find(candidate => candidate.id === id);
  assert.ok(event, `Falta evento ${id}`);
  return event;
};

test('T5 integration/T5.2: sincronizar presencia elimina un HAS_* obsoleto sin instancia viva', async t => {
  if (typeof resolver.syncSeedPresenceFlagsInPlace !== 'function') {
    t.skip('T5.2 todavía no está integrado en esta rama');
    return;
  }

  const state = createInitialState(55201);
  state.seeds = state.seeds.filter(seed => seed.id !== 'SEED_NANO_SHADOW');
  state.flags.HAS_SEED_NANO_SHADOW = true;

  resolver.syncSeedPresenceFlagsInPlace(state);

  assert.equal(
    state.flags.HAS_SEED_NANO_SHADOW,
    false,
    'syncSeedPresenceFlagsInPlace dejó un flag de presencia true sin ninguna instancia viva'
  );
});

test('T5 integration/T5.2+T5.3: el resolver conserva idempotencia y conocimiento NPC al coexistir ambos subsistemas', async t => {
  const npcKnowledge = await optionalImport('../dist/core/npc-knowledge.js');
  if (!npcKnowledge || typeof resolver.syncSeedPresenceFlagsInPlace !== 'function') {
    t.skip('requiere T5.2 y T5.3 integrados simultáneamente');
    return;
  }

  const state = createInitialState(55202);
  const event = byId('EVT_18_PRE_001');

  const first = resolver.resolveChoiceInPlace(state, event, 'CALL_NANO');
  assert.equal(npcKnowledge.npcKnows(state, 'NPC_PLR_14', 'EVT_18_PRE_001'), true);

  const afterFirst = {
    history: state.history.length,
    draws: state.rngState.narrative.draws,
    record: structuredClone(npcKnowledge.getNpcKnowledgeRecord(state, 'NPC_PLR_14', 'EVT_18_PRE_001'))
  };

  const second = resolver.resolveChoiceInPlace(state, event, 'CALL_NANO');

  assert.equal(second.outcomeId, first.outcomeId, 'el replay cambió el outcome');
  assert.equal(state.history.length, afterFirst.history, 'el replay duplicó historia');
  assert.equal(state.rngState.narrative.draws, afterFirst.draws, 'el replay consumió RNG');
  assert.deepEqual(
    npcKnowledge.getNpcKnowledgeRecord(state, 'NPC_PLR_14', 'EVT_18_PRE_001'),
    afterFirst.record,
    'el replay reescribió o degradó la memoria NPC'
  );
});
