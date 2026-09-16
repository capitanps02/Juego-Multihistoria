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
import './test-t53-dynamic-targets.mjs';

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

test('T5.3 transmission: NPC→NPC conserva la versión de la fuente y no consulta la verdad omnisciente', () => {
  const state = createInitialState(123);
  resolveChoiceInPlace(state, byId('EVT_18_PRE_001'), 'CALL_NANO');
  const worldFact = state.history.at(-1);
  assert.ok(worldFact);

  const rivasVersion = rememberNpcFactInPlace(state, 'NPC_ACA_01', {
    factId: 'EVT_18_PRE_001',
    eventId: 'EVT_18_PRE_001',
    choiceId: 'RUMORED_CHOICE',
    outcomeId: 'RUMORED_OUTCOME',
    source: 'reported',
    certainty: 45,
    memory: 'strong'
  });
  assert.notEqual(rivasVersion.choiceId, worldFact.choiceId);
  assert.notEqual(rivasVersion.outcomeId, worldFact.outcomeId);

  const coach = informNpcOfEventInPlace(state, 'NPC_CCH_01', 'EVT_18_PRE_001', {
    source: 'reported',
    sourceNpcId: 'NPC_ACA_01',
    certainty: 90,
    memory: 'strong'
  });
  assert.equal(coach.choiceId, rivasVersion.choiceId);
  assert.equal(coach.outcomeId, rivasVersion.outcomeId);
  assert.equal(coach.certainty, 45);
  assert.notEqual(coach.choiceId, worldFact.choiceId);
  assert.notEqual(coach.outcomeId, worldFact.outcomeId);
});

test('T5.3 transmission: una versión contradictoria activa no refuerza certeza ni durabilidad de la versión vigente', () => {
  const state = createInitialState(124);

  const original = rememberNpcFactInPlace(state, 'NPC_ACA_01', {
    factId: 'T53_CONTRADICTORY_FACT',
    eventId: 'EVT_18_PRE_001',
    choiceId: 'VERSION_A',
    outcomeId: 'OUTCOME_A',
    source: 'reported',
    certainty: 35,
    memory: 'practical',
    expiresAfterDays: 30
  });
  assert.equal(original.certainty, 35);
  assert.equal(original.memory, 'practical');
  assert.ok(original.expiresAfter);

  const afterContradiction = rememberNpcFactInPlace(state, 'NPC_ACA_01', {
    factId: 'T53_CONTRADICTORY_FACT',
    eventId: 'EVT_18_PRE_001',
    choiceId: 'VERSION_B',
    outcomeId: 'OUTCOME_B',
    source: 'reported',
    certainty: 99,
    memory: 'strong'
  });

  assert.deepEqual(afterContradiction, original);
  const persisted = getNpcKnowledgeRecord(state, 'NPC_ACA_01', 'T53_CONTRADICTORY_FACT');
  assert.deepEqual(persisted, original);
  assert.equal(persisted?.choiceId, 'VERSION_A');
  assert.equal(persisted?.outcomeId, 'OUTCOME_A');
  assert.equal(persisted?.certainty, 35);
  assert.equal(persisted?.memory, 'practical');
  assert.equal(persisted?.expiresAfter, original.expiresAfter);
});
