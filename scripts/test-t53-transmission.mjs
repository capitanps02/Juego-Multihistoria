import test from 'node:test';
import assert from 'node:assert/strict';
import { EVENTS } from '../dist/content/events/index.js';
import { createInitialState } from '../dist/content/initial-state.js';
import {
  getNpcKnowledgeRecord,
  informNpcOfEventInPlace,
  npcKnows,
  rememberNpcFactInPlace
} from '../dist/core/npc-knowledge.js';
import { resolveChoiceInPlace } from '../dist/narrative/resolver.js';

const byId = id => {
  const event = EVENTS.find(candidate => candidate.id === id);
  assert.ok(event, `Falta evento ${id}`);
  return event;
};

test('T5.3 transmission: la certeza no se amplifica al pasar por otro NPC', () => {
  const state = createInitialState(119);
  resolveChoiceInPlace(state, byId('EVT_18_PRE_001'), 'CALL_NANO');

  const rivas = informNpcOfEventInPlace(state, 'NPC_ACA_01', 'EVT_18_PRE_001', {
    source: 'reported', sourceNpcId: 'NPC_PLR_14', certainty: 45, memory: 'strong'
  });
  assert.equal(rivas.certainty, 45);

  const coach = informNpcOfEventInPlace(state, 'NPC_CCH_01', 'EVT_18_PRE_001', {
    source: 'reported', sourceNpcId: 'NPC_ACA_01', certainty: 90, memory: 'strong'
  });
  assert.equal(coach.certainty, 45);
  assert.equal(coach.sourceNpcId, 'NPC_ACA_01');
  assert.equal(npcKnows(state, 'NPC_CCH_01', 'EVT_18_PRE_001'), true);
});

test('T5.3 transmission: sourceNpcId solo es válido para información NPC→NPC', () => {
  const state = createInitialState(120);
  resolveChoiceInPlace(state, byId('EVT_18_PRE_001'), 'CALL_NANO');
  const entry = state.history.at(-1);
  assert.ok(entry);

  assert.throws(
    () => rememberNpcFactInPlace(state, 'NPC_CCH_01', {
      factId: 'EVT_18_PRE_001', eventId: 'EVT_18_PRE_001',
      choiceId: entry.choiceId, outcomeId: entry.outcomeId,
      source: 'public', sourceNpcId: 'NPC_PLR_14', certainty: 100, memory: 'strong'
    }),
    /incompatible with knowledge source public/
  );
  assert.equal(npcKnows(state, 'NPC_CCH_01', 'EVT_18_PRE_001'), false);
});

test('T5.3 transmission: una fuente desconocida se rechaza antes de mutar', () => {
  const state = createInitialState(121);
  resolveChoiceInPlace(state, byId('EVT_18_PRE_001'), 'CALL_NANO');

  assert.throws(
    () => informNpcOfEventInPlace(state, 'NPC_CCH_01', 'EVT_18_PRE_001', {
      source: 'reported', sourceNpcId: 'NPC_DOES_NOT_EXIST', certainty: 80, memory: 'strong'
    }),
    /Unknown NPC knowledge source: NPC_DOES_NOT_EXIST/
  );
  assert.equal(getNpcKnowledgeRecord(state, 'NPC_CCH_01', 'EVT_18_PRE_001'), undefined);
});

test('T5.3 transmission: un NPC no puede declararse fuente de sí mismo', () => {
  const state = createInitialState(122);
  resolveChoiceInPlace(state, byId('EVT_18_PRE_001'), 'CALL_NANO');

  assert.throws(
    () => informNpcOfEventInPlace(state, 'NPC_PLR_14', 'EVT_18_PRE_001', {
      source: 'reported', sourceNpcId: 'NPC_PLR_14', certainty: 80, memory: 'strong'
    }),
    /cannot be its own knowledge source/
  );
  assert.equal(getNpcKnowledgeRecord(state, 'NPC_PLR_14', 'EVT_18_PRE_001')?.source, 'informed');
});
