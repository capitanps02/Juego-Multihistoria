import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import {
  NPC_KNOWLEDGE_BACKFILL_RULES_V1,
  NPC_KNOWLEDGE_BACKFILL_V1_SHA256
} from '../dist/catalog/npc-knowledge-backfill-v1.js';
import { NPC_EVENT_KNOWLEDGE_RULES } from '../dist/catalog/npc-knowledge-rules.js';
import { EVENTS } from '../dist/content/events/index.js';
import { createInitialState } from '../dist/content/initial-state.js';
import { npcKnows } from '../dist/core/npc-knowledge.js';
import { reconcileNpcKnowledgeFromHistoryInPlace } from '../dist/narrative/npc-knowledge-reconciliation.js';
import { resolveChoiceInPlace } from '../dist/narrative/resolver.js';

const byId = id => {
  const event = EVENTS.find(candidate => candidate.id === id);
  assert.ok(event, `Falta evento ${id}`);
  return event;
};

function clearFact(state, npcId, factId) {
  const npc = state.npcs.find(candidate => candidate.id === npcId);
  const relation = state.relationships.find(candidate => candidate.npcId === npcId);
  assert.ok(npc);
  delete npc.knowledge[factId];
  npc.memories = npc.memories.filter(id => id !== factId);
  if (relation) relation.memories = relation.memories.filter(id => id !== factId);
}

function activeContext(state, fingerprint = 'T53-QA-021-ACTIVE') {
  return {
    decisionProvenance: state.history.map(() => ({
      sourceContentIdentity: 'T53-QA-021-CONTENT',
      eventFingerprint: fingerprint
    })),
    activeEventEvidence: Object.fromEntries(
      state.history.map(entry => [entry.eventId, { fingerprint }])
    )
  };
}

test('T5-QA-021/1 la baseline histórica v1 conserva hash y es inmutable en runtime', () => {
  assert.equal(NPC_KNOWLEDGE_BACKFILL_RULES_V1.length, 18);
  const actual = createHash('sha256')
    .update(JSON.stringify(NPC_KNOWLEDGE_BACKFILL_RULES_V1))
    .digest('hex');
  assert.equal(
    actual,
    NPC_KNOWLEDGE_BACKFILL_V1_SHA256,
    'La baseline v1 cambió: no editarla en sitio; crear una nueva versión explícita'
  );

  assert.equal(Object.isFrozen(NPC_KNOWLEDGE_BACKFILL_RULES_V1), true);
  for (const rule of NPC_KNOWLEDGE_BACKFILL_RULES_V1) {
    assert.equal(Object.isFrozen(rule), true, `${rule.eventId}: regla histórica mutable`);
    assert.equal(Object.isFrozen(rule.npcIds), true, `${rule.eventId}: npcIds histórico mutable`);
    if (rule.choiceIds) assert.equal(Object.isFrozen(rule.choiceIds), true, `${rule.eventId}: choiceIds histórico mutable`);
    if (rule.outcomeIds) assert.equal(Object.isFrozen(rule.outcomeIds), true, `${rule.eventId}: outcomeIds histórico mutable`);
    if (rule.targetSlots) assert.equal(Object.isFrozen(rule.targetSlots), true, `${rule.eventId}: targetSlots histórico mutable`);
  }
  assert.throws(
    () => NPC_KNOWLEDGE_BACKFILL_RULES_V1.push({}),
    TypeError,
    'La baseline congelada no debe aceptar reglas nuevas en runtime'
  );
});

test('T5-QA-021/2 cambiar reglas live no reinterpreta el replay histórico', () => {
  const event = byId('EVT_18_PRE_001');

  // Produce durable history under the original live semantics, then simulate an
  // old/pre-T5.3 save whose derived NPC knowledge is missing.
  const historical = createInitialState(420);
  resolveChoiceInPlace(historical, event, 'CALL_NANO');
  clearFact(historical, 'NPC_PLR_14', 'EVT_18_PRE_001');

  const syntheticFactId = 'T5_QA_021_LIVE_ONLY';
  const syntheticRule = {
    eventId: 'EVT_18_PRE_001',
    choiceIds: ['CALL_NANO'],
    npcIds: ['NPC_PLR_14'],
    factId: syntheticFactId,
    source: 'informed',
    certainty: 100,
    memory: 'strong',
    relationshipMemory: true
  };

  NPC_EVENT_KNOWLEDGE_RULES.push(syntheticRule);
  try {
    // New live resolution must still honor the mutable/current registry.
    const live = createInitialState(421);
    resolveChoiceInPlace(live, event, 'CALL_NANO');
    assert.equal(npcKnows(live, 'NPC_PLR_14', syntheticFactId), true);

    // Historical reconciliation must use the frozen baseline, not the newly
    // introduced live-only rule, even though event/choice/outcome strings match.
    const rebuilt = reconcileNpcKnowledgeFromHistoryInPlace(historical, activeContext(historical));
    assert.equal(npcKnows(historical, 'NPC_PLR_14', 'EVT_18_PRE_001'), true);
    assert.equal(npcKnows(historical, 'NPC_PLR_14', syntheticFactId), false);
    assert.equal(rebuilt.some(key => key.endsWith(syntheticFactId)), false);
  } finally {
    const index = NPC_EVENT_KNOWLEDGE_RULES.indexOf(syntheticRule);
    if (index >= 0) NPC_EVENT_KNOWLEDGE_RULES.splice(index, 1);
  }
});
