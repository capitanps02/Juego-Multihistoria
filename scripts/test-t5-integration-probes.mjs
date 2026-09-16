import test from 'node:test';
import assert from 'node:assert/strict';
import { EVENTS } from '../dist/content/events/index.js';
import { createInitialState } from '../dist/content/initial-state.js';
import { conditionsPass } from '../dist/core/conditions.js';
import { getPath, setPath } from '../dist/core/path.js';
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

function qaValueForCondition(state, condition) {
  const current = getPath(state, condition.path);
  if (condition.op === 'exists') return current ?? 1;
  if (condition.op === 'eq' || condition.op === 'gte' || condition.op === 'lte') return condition.value;
  if (condition.op === 'gt') return Number(condition.value) + 1;
  if (condition.op === 'lt') return Number(condition.value) - 1;
  if (condition.op === 'in') return Array.isArray(condition.value) ? condition.value[0] : condition.value;
  if (condition.op === 'neq') {
    if (typeof condition.value === 'boolean') return !condition.value;
    if (typeof condition.value === 'number') return condition.value + 1;
    return `__qa_not_${String(condition.value)}`;
  }
  if (condition.op === 'notIn') {
    const values = Array.isArray(condition.value) ? condition.value : [];
    if (!values.includes('__qa__')) return '__qa__';
    let candidate = 987654321;
    while (values.includes(candidate)) candidate += 1;
    return candidate;
  }
  throw new Error(`QA no sabe sintetizar condición ${condition.op} en ${condition.path}`);
}

function satisfyConditions(state, conditions = []) {
  for (const condition of conditions) setPath(state, condition.path, qaValueForCondition(state, condition));
  assert.equal(conditionsPass(state, conditions), true, `fixture QA no pudo satisfacer ${JSON.stringify(conditions)}`);
}

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

test('T5 integration/T5.1 30-34: cada elección reimplementada produce un GameState válido', t => {
  const reimplemented = EVENTS.filter(event =>
    event.phase === '30_34' && (event.tags ?? []).includes('t51_canonical_reimplementation')
  );
  if (reimplemented.length === 0) {
    t.skip('las reimplementaciones canónicas 30-34 todavía no están integradas en main');
    return;
  }

  let executions = 0;
  for (const event of reimplemented) {
    for (const [choiceIndex, choice] of event.choices.entries()) {
      const state = createInitialState(56000 + executions);
      state.age = event.ageWindow[0];
      state.phase = event.phase;
      state.runtime.daysSinceNarrative = 999;
      state.runtime.eventsThisSeason = 0;
      satisfyConditions(state, event.gates ?? []);

      const firstOutcome = event.outcomes.find(outcome => choice.outcomeIds.includes(outcome.id));
      if (firstOutcome) satisfyConditions(state, firstOutcome.conditions ?? []);

      let result;
      assert.doesNotThrow(() => {
        result = resolver.resolveChoiceInPlace(state, event, choice.id, true);
      }, `${event.id}/${choice.id}: la elección reimplementada rompe al resolverse`);
      assert.ok(result, `${event.id}/${choice.id}: no devolvió ResolutionResult`);
      assert.equal(result.eventId, event.id);
      assert.equal(result.choiceId, choice.id);
      assert.doesNotThrow(
        () => assertGameState(state),
        `${event.id}/${choice.id}: produjo un GameState inválido tras resolver la elección ${choiceIndex + 1}`
      );
      executions += 1;
    }
  }
  assert.ok(executions > 0, 'fixture inválido: no se ejecutó ninguna elección canónica reimplementada');
});
