import test from 'node:test';
import assert from 'node:assert/strict';
import { EVENTS } from '../dist/content/events/index.js';
import { createInitialState } from '../dist/content/initial-state.js';
import { assertGameState } from '../dist/save/validation.js';
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

test('T5 integration/T5.3: una fuente NPC ignorante no puede crear conocimiento verdadero', async t => {
  const npcKnowledge = await optionalImport('../dist/core/npc-knowledge.js');
  if (!npcKnowledge) {
    t.skip('T5.3 todavía no está integrado en esta rama');
    return;
  }

  const state = createInitialState(55404);
  resolver.resolveChoiceInPlace(state, byId('EVT_18_PRE_001'), 'CALL_NANO');

  assert.equal(npcKnowledge.npcKnows(state, 'NPC_ACA_01', 'EVT_18_PRE_001'), false, 'reproducción inválida: la fuente ya conoce el hecho');
  assert.equal(npcKnowledge.npcKnows(state, 'NPC_CCH_01', 'EVT_18_PRE_001'), false, 'reproducción inválida: el receptor ya conoce el hecho');

  assert.throws(
    () => npcKnowledge.informNpcOfEventInPlace(state, 'NPC_CCH_01', 'EVT_18_PRE_001', {
      source: 'reported',
      certainty: 80,
      memory: 'temporary',
      sourceNpcId: 'NPC_ACA_01'
    }),
    /uninformed NPC source|Cannot transmit/,
    'T5-QA-004: una fuente ignorante debe ser rechazada antes de mutar conocimiento'
  );
  assert.equal(
    npcKnowledge.npcKnows(state, 'NPC_CCH_01', 'EVT_18_PRE_001'),
    false,
    'T5-QA-004: el receptor aprendió el hecho pese a que la fuente no lo conocía'
  );
});

test('T5 integration/T5.3: conocimiento persistido malformado no puede satisfacer npcKnows', async t => {
  const npcKnowledge = await optionalImport('../dist/core/npc-knowledge.js');
  if (!npcKnowledge) {
    t.skip('T5.3 todavía no está integrado en esta rama');
    return;
  }

  const state = createInitialState(55808);
  const npc = state.npcs.find(candidate => candidate.id === 'NPC_CCH_01');
  assert.ok(npc, 'reproducción inválida: falta NPC_CCH_01');
  npc.knowledge.T53_CORRUPT = {
    factId: 'T53_CORRUPT',
    eventId: 'T53_FAKE',
    choiceId: 'FAKE',
    outcomeId: 'FAKE',
    learnedAt: 'not-a-date',
    source: 'telepathy',
    certainty: -1,
    memory: 'eternal',
    club: state.club
  };

  let rejectedBySaveValidation = false;
  try {
    assertGameState(state);
  } catch {
    rejectedBySaveValidation = true;
  }

  if (!rejectedBySaveValidation) {
    assert.equal(
      npcKnowledge.npcKnows(state, 'NPC_CCH_01', 'T53_CORRUPT'),
      false,
      'T5-QA-008: un registro knowledge malformado aceptado por save validation se convirtió en conocimiento verdadero'
    );
  }
});
