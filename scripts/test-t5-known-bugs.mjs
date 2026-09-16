import test from 'node:test';
import assert from 'node:assert/strict';
import { EVENTS } from '../dist/content/events/index.js';
import { createInitialState } from '../dist/content/initial-state.js';
import { simulateCareer } from '../dist/simulation/career-simulator.js';
import * as resolver from '../dist/narrative/resolver.js';

test('T5-QA-001: NPCs referenced by played events must learn or remember something', () => {
  const initial = createInitialState(424242);
  const result = simulateCareer({ seed: 424242, days: 3000, choiceStrategy: 'first', microfeeds: false });
  const referenced = new Set(result.history.flatMap(entry => Array.isArray(entry.snapshot?.npcRefs) ? entry.snapshot.npcRefs : []));
  assert.ok(referenced.size > 0, 'reproduction invalid: no NPC was referenced');
  const evolved = [...referenced].filter(id => {
    const before = initial.npcs.find(npc => npc.id === id);
    const after = result.state.npcs.find(npc => npc.id === id);
    if (!before || !after) return false;
    return JSON.stringify(before.knowledge) !== JSON.stringify(after.knowledge)
      || JSON.stringify(before.memories) !== JSON.stringify(after.memories);
  });
  assert.ok(evolved.length > 0, `T5-QA-001: ${referenced.size} NPCs participaron en escenas, pero knowledge/memories permanecieron estáticos`);
});

test('T5-QA-002: seed graph must contain at least one explicit terminal consumer', () => {
  const terminal = [];
  for (const event of EVENTS) for (const outcome of event.outcomes) for (const transition of outcome.seedTransitions ?? []) {
    if (transition.action === 'resolve' || transition.action === 'expire') terminal.push(`${event.id}/${outcome.id}:${transition.seedId}:${transition.action}`);
  }
  assert.ok(terminal.length > 0, 'T5-QA-002: el catálogo crea memoria pero no declara consumidores resolve/expire; las seeds pueden quedar eternas');
});

test('T5-QA-005: sync de presencia debe limpiar HAS_* sin instancia viva', t => {
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
    'T5-QA-005: HAS_SEED_NANO_SHADOW quedó true sin ninguna instancia viva de la seed'
  );
});
