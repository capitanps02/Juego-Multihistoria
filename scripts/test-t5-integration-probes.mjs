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

test('T5 integration/T5.2+T5.3: una resolución conserva simultáneamente lifecycle de seed y conocimiento NPC', async t => {
  const npcKnowledge = await optionalImport('../dist/core/npc-knowledge.js');
  if (!npcKnowledge || typeof resolver.syncSeedPresenceFlagsInPlace !== 'function') {
    t.skip('requiere T5.2 y T5.3 integrados simultáneamente');
    return;
  }

  const state = createInitialState(55202);
  const event = byId('EVT_18_PRE_001');
  resolver.resolveChoiceInPlace(state, event, 'CALL_NANO');

  assert.equal(
    npcKnowledge.npcKnows(state, 'NPC_PLR_14', 'EVT_18_PRE_001'),
    true,
    'el resolver integrado perdió la adquisición explícita de conocimiento T5.3'
  );
  assert.ok(
    state.seeds.some(seed => seed.id === 'SEED_NANO_SHADOW' && !['resolved', 'expired'].includes(seed.state)),
    'el resolver integrado perdió la transición de seed de EVT_18_PRE_001'
  );
  assert.equal(
    state.flags.HAS_SEED_NANO_SHADOW,
    true,
    'la seed fue creada pero el flag de presencia no quedó sincronizado'
  );
});
