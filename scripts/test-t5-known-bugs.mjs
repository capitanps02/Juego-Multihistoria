import test from 'node:test';
import assert from 'node:assert/strict';
import { EVENTS } from '../dist/content/events/index.js';
import { createInitialState } from '../dist/content/initial-state.js';
import { simulateCareer } from '../dist/simulation/career-simulator.js';
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

test('T5-QA-004: un NPC no puede transmitir como fuente un hecho que él mismo no conoce', async t => {
  const npcKnowledge = await optionalImport('../dist/core/npc-knowledge.js');
  if (!npcKnowledge) {
    t.skip('T5.3 todavía no está integrado en esta rama');
    return;
  }

  const state = createInitialState(55404);
  resolver.resolveChoiceInPlace(state, byId('EVT_18_PRE_001'), 'CALL_NANO');

  assert.equal(npcKnowledge.npcKnows(state, 'NPC_ACA_01', 'EVT_18_PRE_001'), false, 'reproducción inválida: la fuente ya conocía el hecho');
  assert.equal(npcKnowledge.npcKnows(state, 'NPC_CCH_01', 'EVT_18_PRE_001'), false, 'reproducción inválida: el receptor ya conocía el hecho');

  try {
    npcKnowledge.informNpcOfEventInPlace(state, 'NPC_CCH_01', 'EVT_18_PRE_001', {
      source: 'reported',
      certainty: 80,
      memory: 'temporary',
      sourceNpcId: 'NPC_ACA_01'
    });
  } catch {
    // Rechazar explícitamente una cadena imposible es una solución válida.
  }

  assert.equal(
    npcKnowledge.npcKnows(state, 'NPC_CCH_01', 'EVT_18_PRE_001'),
    false,
    'T5-QA-004: se creó conocimiento verdadero mediante una fuente NPC que no conocía el hecho'
  );
});
