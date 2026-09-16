import test from 'node:test';
import assert from 'node:assert/strict';
import { EVENTS } from '../dist/content/events/index.js';
import { createInitialState } from '../dist/content/initial-state.js';
import { getNpcKnowledgeRecord, npcKnows } from '../dist/core/npc-knowledge.js';
import { reconcileNpcKnowledgeFromHistoryInPlace } from '../dist/narrative/npc-knowledge-reconciliation.js';
import { resolveChoiceInPlace } from '../dist/narrative/resolver.js';
import { GameSession } from '../dist/session/game-session.js';

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

function activeContext(state, fingerprint = 'ACTIVE-FP') {
  return {
    decisionProvenance: state.history.map(() => ({
      sourceContentIdentity: 'ACTIVE-CONTENT',
      eventFingerprint: fingerprint
    })),
    activeEventEvidence: Object.fromEntries(
      state.history.map(entry => [entry.eventId, { fingerprint }])
    )
  };
}

test('T5.3 reconcile/1 reconstruye conocimiento faltante con fecha y club históricos sin tocar RNG ni history', () => {
  const state = createInitialState(401);
  resolveChoiceInPlace(state, byId('EVT_18_PRE_001'), 'CALL_NANO');
  const entry = state.history.at(-1);
  assert.ok(entry);
  clearFact(state, 'NPC_PLR_14', 'EVT_18_PRE_001');
  const rngBefore = structuredClone(state.rngState);
  const historyBefore = structuredClone(state.history);

  const rebuilt = reconcileNpcKnowledgeFromHistoryInPlace(state, activeContext(state));
  const record = getNpcKnowledgeRecord(state, 'NPC_PLR_14', 'EVT_18_PRE_001');

  assert.deepEqual(rebuilt, ['NPC_PLR_14\u0000EVT_18_PRE_001']);
  assert.ok(record);
  assert.equal(record.learnedAt, entry.date);
  assert.equal(record.club, entry.club);
  assert.equal(record.choiceId, 'CALL_NANO');
  assert.equal(record.source, 'informed');
  assert.equal(record.memory, 'strong');
  assert.equal(record.certainty, 100);
  assert.deepEqual(state.rngState, rngBefore);
  assert.deepEqual(state.history, historyBefore);
});

test('T5.3 reconcile/2 es idempotente tras reconstruir las filas canónicas', () => {
  const state = createInitialState(402);
  resolveChoiceInPlace(state, byId('EVT_18_PRE_001'), 'CALL_RIVAS');
  clearFact(state, 'NPC_ACA_01', 'EVT_18_PRE_001');
  const context = activeContext(state);
  reconcileNpcKnowledgeFromHistoryInPlace(state, context);
  const once = structuredClone(state);

  assert.deepEqual(reconcileNpcKnowledgeFromHistoryInPlace(state, context), []);
  assert.deepEqual(state, once);
});

test('T5.3 reconcile/3 preserva exactamente una versión persistida válida aunque difiera de history', () => {
  const state = createInitialState(403);
  resolveChoiceInPlace(state, byId('EVT_18_PRE_001'), 'CALL_NANO');
  const npc = state.npcs.find(candidate => candidate.id === 'NPC_PLR_14');
  assert.ok(npc);
  npc.knowledge.EVT_18_PRE_001 = {
    factId: 'EVT_18_PRE_001',
    eventId: 'EVT_18_PRE_001',
    choiceId: 'SUBJECTIVE_VERSION',
    outcomeId: 'SUBJECTIVE_OUTCOME',
    learnedAt: state.history[0].date,
    source: 'reported',
    certainty: 37,
    memory: 'strong',
    club: 'MEMORY_CLUB'
  };
  const before = structuredClone(npc.knowledge.EVT_18_PRE_001);

  assert.deepEqual(reconcileNpcKnowledgeFromHistoryInPlace(state, activeContext(state)), []);
  assert.deepEqual(npc.knowledge.EVT_18_PRE_001, before);
});

test('T5.3 reconcile/4 sustituye una fila persistida inválida si existe evidencia histórica explícita', () => {
  const state = createInitialState(404);
  resolveChoiceInPlace(state, byId('EVT_18_PRE_001'), 'CALL_NANO');
  const npc = state.npcs.find(candidate => candidate.id === 'NPC_PLR_14');
  assert.ok(npc);
  npc.knowledge.EVT_18_PRE_001 = {
    factId: 'EVT_18_PRE_001',
    eventId: 'EVT_18_PRE_001',
    choiceId: 'CALL_NANO',
    outcomeId: state.history[0].outcomeId,
    learnedAt: state.history[0].date,
    source: 'telepathy',
    certainty: 100,
    memory: 'strong',
    club: state.history[0].club
  };
  assert.equal(npcKnows(state, 'NPC_PLR_14', 'EVT_18_PRE_001'), false);

  reconcileNpcKnowledgeFromHistoryInPlace(state, activeContext(state));
  const repaired = getNpcKnowledgeRecord(state, 'NPC_PLR_14', 'EVT_18_PRE_001');
  assert.ok(repaired);
  assert.equal(repaired.source, 'informed');
  assert.equal(repaired.choiceId, 'CALL_NANO');
});

test('T5.3 reconcile/5 no resucita una memoria temporal que ya habría caducado', () => {
  const state = createInitialState(405);
  resolveChoiceInPlace(state, byId('EVT_18_PRE_002'), 'MAX_INTENSITY');
  const targets = ['NPC_PLR_10', 'NPC_PLR_12', 'NPC_MED_01'];
  for (const npcId of targets) clearFact(state, npcId, 'EVT_18_PRE_002');
  state.date = '2030-01-01';

  reconcileNpcKnowledgeFromHistoryInPlace(state, activeContext(state));
  for (const npcId of targets) {
    assert.equal(npcKnows(state, npcId, 'EVT_18_PRE_002'), false);
    const npc = state.npcs.find(candidate => candidate.id === npcId);
    const relation = state.relationships.find(candidate => candidate.npcId === npcId);
    assert.ok(npc);
    assert.equal(npc.memories.includes('EVT_18_PRE_002'), false);
    assert.equal(relation?.memories.includes('EVT_18_PRE_002') ?? false, false);
  }
});

test('T5.3 reconcile/6 GameSession.resume repara una partida válida con history pero sin memoria T5.3', async () => {
  const event = byId('EVT_18_PRE_001');
  const session = await GameSession.create(406, { events: [event], microfeeds: false, sessionId: 't53-reconcile' });
  const first = await session.dispatch({ type: 'continue', commandId: 'reconcile-continue', expectedRevision: 0, maxDays: 10 });
  assert.ok(first.view.decision);
  await session.dispatch({
    type: 'choose',
    commandId: 'reconcile-choose',
    expectedRevision: 1,
    pendingInstanceId: first.view.decision.instanceId,
    choiceId: 'CALL_NANO'
  });

  const snapshot = session.exportSnapshot();
  clearFact(snapshot.state, 'NPC_PLR_14', 'EVT_18_PRE_001');
  const rngBefore = structuredClone(snapshot.state.rngState);
  const historyBefore = structuredClone(snapshot.state.history);
  let commits = 0;

  const resumed = await GameSession.resume(snapshot, {
    events: [event],
    commit: async () => { commits += 1; }
  });
  const restored = resumed.exportSnapshot();
  const record = getNpcKnowledgeRecord(restored.state, 'NPC_PLR_14', 'EVT_18_PRE_001');
  assert.ok(record);
  assert.equal(record.learnedAt, restored.state.history[0].date);
  assert.equal(record.club, restored.state.history[0].club);
  assert.deepEqual(restored.state.history, historyBefore);
  assert.deepEqual(restored.state.rngState, rngBefore);
  assert.equal(commits, 0, 'resume no debe persistir ni ejecutar commits por sí mismo');
});

test('T5-QA-017/7 una colisión exact-ID con fingerprint legacy distinto falla cerrada sin backfill', () => {
  const state = createInitialState(407);
  resolveChoiceInPlace(state, byId('EVT_18_PRE_001'), 'CALL_NANO');
  clearFact(state, 'NPC_PLR_14', 'EVT_18_PRE_001');
  const rngBefore = structuredClone(state.rngState);
  const historyBefore = structuredClone(state.history);
  const context = {
    decisionProvenance: [{ sourceContentIdentity: 'LEGACY-A', eventFingerprint: 'LEGACY-FP' }],
    activeEventEvidence: { EVT_18_PRE_001: { fingerprint: 'ACTIVE-FP' } }
  };

  assert.deepEqual(reconcileNpcKnowledgeFromHistoryInPlace(state, context), []);
  assert.equal(npcKnows(state, 'NPC_PLR_14', 'EVT_18_PRE_001'), false);
  assert.deepEqual(state.rngState, rngBefore);
  assert.deepEqual(state.history, historyBefore);
  assert.deepEqual(reconcileNpcKnowledgeFromHistoryInPlace(state, context), []);
});

test('T5-QA-017/8 una certificación legacy exacta permite backfill aunque cambie el fingerprint activo', () => {
  const state = createInitialState(408);
  resolveChoiceInPlace(state, byId('EVT_18_PRE_001'), 'CALL_NANO');
  const entry = state.history[0];
  clearFact(state, 'NPC_PLR_14', 'EVT_18_PRE_001');
  const context = {
    decisionProvenance: [{ sourceContentIdentity: 'LEGACY-A', eventFingerprint: 'LEGACY-FP' }],
    activeEventEvidence: { EVT_18_PRE_001: { fingerprint: 'ACTIVE-FP' } },
    legacyCertifications: [{
      sourceContentIdentity: 'LEGACY-A',
      eventFingerprint: 'LEGACY-FP',
      eventId: entry.eventId,
      choiceId: entry.choiceId,
      outcomeId: entry.outcomeId
    }]
  };

  assert.deepEqual(reconcileNpcKnowledgeFromHistoryInPlace(state, context), ['NPC_PLR_14\u0000EVT_18_PRE_001']);
  assert.equal(npcKnows(state, 'NPC_PLR_14', 'EVT_18_PRE_001'), true);
});

test('T5-QA-017/9 un historial mixto evalúa provenance fila a fila', () => {
  const state = createInitialState(409);
  resolveChoiceInPlace(state, byId('EVT_18_PRE_001'), 'CALL_NANO');
  resolveChoiceInPlace(state, byId('EVT_18_PRE_002'), 'MAX_INTENSITY');
  clearFact(state, 'NPC_PLR_14', 'EVT_18_PRE_001');
  for (const npcId of ['NPC_PLR_10', 'NPC_PLR_12', 'NPC_MED_01']) clearFact(state, npcId, 'EVT_18_PRE_002');

  const context = {
    decisionProvenance: [
      { sourceContentIdentity: 'LEGACY-A', eventFingerprint: 'LEGACY-FP' },
      { sourceContentIdentity: 'ACTIVE-CONTENT', eventFingerprint: 'ACTIVE-PRE2' }
    ],
    activeEventEvidence: {
      EVT_18_PRE_001: { fingerprint: 'ACTIVE-PRE1' },
      EVT_18_PRE_002: { fingerprint: 'ACTIVE-PRE2' }
    }
  };
  const rngBefore = structuredClone(state.rngState);
  const historyBefore = structuredClone(state.history);

  const rebuilt = reconcileNpcKnowledgeFromHistoryInPlace(state, context);
  assert.equal(npcKnows(state, 'NPC_PLR_14', 'EVT_18_PRE_001'), false);
  assert.equal(npcKnows(state, 'NPC_PLR_10', 'EVT_18_PRE_002'), true);
  assert.equal(npcKnows(state, 'NPC_PLR_12', 'EVT_18_PRE_002'), true);
  assert.equal(npcKnows(state, 'NPC_MED_01', 'EVT_18_PRE_002'), true);
  assert.equal(rebuilt.some(key => key.endsWith('EVT_18_PRE_001')), false);
  assert.equal(rebuilt.filter(key => key.endsWith('EVT_18_PRE_002')).length, 3);
  assert.deepEqual(state.rngState, rngBefore);
  assert.deepEqual(state.history, historyBefore);
});
