import test from 'node:test';
import assert from 'node:assert/strict';
import { EVENTS } from '../dist/content/events/index.js';
import { createInitialState } from '../dist/content/initial-state.js';
import {
  forgetExpiredNpcKnowledgeInPlace,
  getNpcKnowledgeRecord,
  informNpcOfEventInPlace,
  npcKnows,
  rememberNpcFactInPlace
} from '../dist/core/npc-knowledge.js';
import { getPath } from '../dist/core/path.js';
import { resolveChoiceInPlace } from '../dist/narrative/resolver.js';
import { scheduleEvent } from '../dist/narrative/scheduler.js';
import { loadSave, serializeSave } from '../dist/save/save.js';
import { GameSession } from '../dist/session/game-session.js';

const byId = id => {
  const event = EVENTS.find(candidate => candidate.id === id);
  assert.ok(event, `Falta evento ${id}`);
  return event;
};

const relation = (state, npcId) => {
  const value = state.relationships.find(row => row.npcId === npcId);
  assert.ok(value, `Falta relación ${npcId}`);
  return value;
};

const origin = () => byId('EVT_18_PRE_001');

test('T5.3/1 NPC que presencia un hecho puede recordarlo', () => {
  const state = createInitialState(101);
  state.flags.PRESEASON_STARTED = true;
  resolveChoiceInPlace(state, byId('EVT_18_PRE_002'), 'TECHNICAL_ONLY');
  for (const npcId of ['NPC_PLR_10', 'NPC_PLR_12', 'NPC_MED_01']) {
    assert.equal(npcKnows(state, npcId, 'EVT_18_PRE_002'), true);
    assert.equal(getNpcKnowledgeRecord(state, npcId, 'EVT_18_PRE_002')?.source, 'witnessed');
  }
});

test('T5.3/2 NPC sin acceso no reacciona: npcRefs no concede omnisciencia', () => {
  const state = createInitialState(102);
  resolveChoiceInPlace(state, origin(), 'CALL_NANO');
  assert.equal(npcKnows(state, 'NPC_PLR_14', 'EVT_18_PRE_001'), true);
  assert.equal(npcKnows(state, 'NPC_ACA_01', 'EVT_18_PRE_001'), false);
  assert.equal(getPath(state, 'know.NPC_PLR_14.EVT_18_PRE_001'), true);
  assert.equal(getPath(state, 'know.NPC_ACA_01.EVT_18_PRE_001'), false);
});

test('T5.3/3 NPC informado posteriormente aprende desde ese momento sin consumir RNG', () => {
  const state = createInitialState(103);
  resolveChoiceInPlace(state, origin(), 'CALL_NANO');
  assert.equal(npcKnows(state, 'NPC_ACA_01', 'EVT_18_PRE_001'), false);
  state.date = '2026-07-10';
  const rngBefore = structuredClone(state.rngState);
  const record = informNpcOfEventInPlace(state, 'NPC_ACA_01', 'EVT_18_PRE_001', {
    source: 'reported', certainty: 65, sourceNpcId: 'NPC_PLR_14', memory: 'strong'
  });
  assert.equal(record.learnedAt, '2026-07-10');
  assert.equal(record.sourceNpcId, 'NPC_PLR_14');
  assert.equal(npcKnows(state, 'NPC_ACA_01', 'EVT_18_PRE_001'), true);
  assert.deepEqual(state.rngState, rngBefore, 'informar/recordar conocimiento no consume RNG');
});

test('T5.3/4 cambiar de club no reinicia relaciones', () => {
  const state = createInitialState(104);
  resolveChoiceInPlace(state, origin(), 'CALL_NANO');
  const before = structuredClone(relation(state, 'NPC_PLR_14'));
  const clubChange = {
    id: 'T53_CLUB_CHANGE', ageWindow: [18, 18], phase: '18_20', family: 'market',
    gates: [], cooldown: 0, weight: 1,
    text: { title: 'Cambio de club', body: 'Escena sintética de contrato.' },
    intel: { visible: [], uncertain: [] },
    choices: [{ id: 'MOVE', label: 'Cambiar', intentTags: [], outcomeIds: ['DONE'] }],
    outcomes: [{ id: 'DONE', baseWeight: 1, effects: [{ kind: 'set', path: 'club', value: 'ATL' }], messages: [] }]
  };
  resolveChoiceInPlace(state, clubChange, 'MOVE');
  assert.equal(state.club, 'ATL');
  assert.deepEqual(relation(state, 'NPC_PLR_14'), before);
  assert.equal(npcKnows(state, 'NPC_PLR_14', 'EVT_18_PRE_001'), true);
});

test('T5.3/5 un recuerdo fuerte reaparece años después', () => {
  const state = createInitialState(105);
  resolveChoiceInPlace(state, origin(), 'CALL_NANO');
  state.date = '2038-07-01';
  assert.equal(npcKnows(state, 'NPC_PLR_14', 'EVT_18_PRE_001'), true);
  assert.equal(getNpcKnowledgeRecord(state, 'NPC_PLR_14', 'EVT_18_PRE_001')?.memory, 'strong');
});

test('T5.3/6 save/restore conserva conocimiento y relación', () => {
  const state = createInitialState(106);
  resolveChoiceInPlace(state, origin(), 'CALL_NANO');
  const beforeRecord = getNpcKnowledgeRecord(state, 'NPC_PLR_14', 'EVT_18_PRE_001');
  const restored = loadSave(serializeSave(state));
  assert.deepEqual(getNpcKnowledgeRecord(restored, 'NPC_PLR_14', 'EVT_18_PRE_001'), beforeRecord);
  assert.deepEqual(relation(restored, 'NPC_PLR_14'), relation(state, 'NPC_PLR_14'));
});

test('T5.3/7 una partida nueva no hereda memoria', () => {
  const played = createInitialState(107);
  resolveChoiceInPlace(played, origin(), 'CALL_NANO');
  const fresh = createInitialState(107);
  assert.equal(npcKnows(fresh, 'NPC_PLR_14', 'EVT_18_PRE_001'), false);
  assert.ok(fresh.npcs.every(npc => Object.keys(npc.knowledge).length === 0 && npc.memories.length === 0));
  assert.ok(fresh.relationships.every(row => row.memories.length === 0));
});

test('T5.3/8 dos NPC pueden conocer versiones distintas del mismo hecho', () => {
  const state = createInitialState(108);
  resolveChoiceInPlace(state, origin(), 'CALL_NANO');
  state.date = '2026-07-12';
  informNpcOfEventInPlace(state, 'NPC_ACA_01', 'EVT_18_PRE_001', {
    source: 'reported', certainty: 55, sourceNpcId: 'NPC_PLR_14', memory: 'strong'
  });
  const nano = getNpcKnowledgeRecord(state, 'NPC_PLR_14', 'EVT_18_PRE_001');
  const rivas = getNpcKnowledgeRecord(state, 'NPC_ACA_01', 'EVT_18_PRE_001');
  assert.equal(nano?.source, 'informed');
  assert.equal(nano?.certainty, 100);
  assert.equal(rivas?.source, 'reported');
  assert.equal(rivas?.certainty, 55);
  assert.notEqual(nano?.learnedAt, rivas?.learnedAt);
});

test('T5.3/9 la información práctica caduca y puede podarse', () => {
  const state = createInitialState(109);
  rememberNpcFactInPlace(state, 'NPC_PRS_01', {
    factId: 'T53_PRACTICAL', eventId: 'T53_MANUAL', choiceId: 'TOLD', outcomeId: 'KNOWN',
    source: 'informed', certainty: 90, memory: 'practical', expiresAfterDays: 1,
    relationshipMemory: true
  });
  assert.equal(npcKnows(state, 'NPC_PRS_01', 'T53_PRACTICAL'), true);
  state.date = '2026-07-03';
  assert.equal(npcKnows(state, 'NPC_PRS_01', 'T53_PRACTICAL'), false);
  assert.deepEqual(forgetExpiredNpcKnowledgeInPlace(state), ['NPC_PRS_01:T53_PRACTICAL']);
  assert.equal(getNpcKnowledgeRecord(state, 'NPC_PRS_01', 'T53_PRACTICAL'), undefined);
  assert.equal(relation(state, 'NPC_PRS_01').memories.includes('T53_PRACTICAL'), false);
});

test('T5.3/10 PlayerView no filtra conocimiento interno del NPC', async () => {
  const event = structuredClone(origin());
  const session = await GameSession.create(110, { events: [event], microfeeds: false, sessionId: 't53-view' });
  await session.dispatch({ type: 'continue', maxDays: 1, commandId: 'advance', expectedRevision: 0 });
  let view = session.getView();
  assert.equal(view.screen, 'decision');
  assert.ok(view.decision);
  await session.dispatch({
    type: 'choose', commandId: 'choose', expectedRevision: view.revision,
    pendingInstanceId: view.decision.instanceId, choiceId: 'CALL_NANO'
  });
  const internal = session.exportSnapshot().state;
  assert.equal(npcKnows(internal, 'NPC_PLR_14', 'EVT_18_PRE_001'), true);
  view = session.getView();
  const publicJson = JSON.stringify(view);
  for (const hidden of ['"knowledge"', '"memories"', '"privateAgenda"', '"reliability"', '"access"', '"trustAxes"']) {
    assert.equal(publicJson.includes(hidden), false, `ViewModel filtra ${hidden}`);
  }
});

test('T5.3/11 Nano solo aprende la ayuda no solicitada cuando realmente se entera', () => {
  const event = byId('EVT_19_TEAM_001');
  let primary;
  let secondary;
  for (let seed = 0; seed < 2000 && (!primary || !secondary); seed++) {
    const state = createInitialState(seed);
    resolveChoiceInPlace(state, event, 'MOVE_CONTACT');
    const outcome = state.history.at(-1)?.outcomeId;
    if (outcome === 'MOVE_CONTACT__PRIMARY' && !primary) primary = state;
    if (outcome === 'MOVE_CONTACT__SECONDARY' && !secondary) secondary = state;
  }
  assert.ok(primary, 'No se encontró resultado primario MOVE_CONTACT');
  assert.ok(secondary, 'No se encontró resultado secundario MOVE_CONTACT');
  assert.equal(npcKnows(primary, 'NPC_PLR_14', 'EVT_19_TEAM_001'), false);
  assert.equal(npcKnows(secondary, 'NPC_PLR_14', 'EVT_19_TEAM_001'), true);
  assert.equal(getNpcKnowledgeRecord(secondary, 'NPC_PLR_14', 'EVT_19_TEAM_001')?.source, 'reported');
});

test('T5.3/12 flags y seed no bastan: el callback de Nano exige conocimiento personal', () => {
  const event = byId('EVT_19_TEAM_001');
  const callback = byId('CEVT_19_NANO_01');
  let informed;
  for (let seed = 0; seed < 2000 && !informed; seed++) {
    const state = createInitialState(seed);
    resolveChoiceInPlace(state, event, 'MOVE_CONTACT');
    if (state.history.at(-1)?.outcomeId === 'MOVE_CONTACT__SECONDARY') informed = state;
  }
  assert.ok(informed, 'No se encontró estado donde Nano descubre el contacto');
  Object.assign(informed, { age: 19, phase: '18_20', date: '2027-07-01' });
  informed.runtime.day = 365;
  informed.runtime.seasonDay = 0;
  informed.runtime.daysSinceNarrative = 999;
  informed.runtime.eventsThisSeason = 0;
  assert.equal(scheduleEvent(informed, [callback], { ignoreRhythmGate: true })?.event.id, callback.id);

  const omniscient = structuredClone(informed);
  const nano = omniscient.npcs.find(npc => npc.id === 'NPC_PLR_14');
  assert.ok(nano);
  delete nano.knowledge.EVT_19_TEAM_001;
  nano.memories = nano.memories.filter(id => id !== 'EVT_19_TEAM_001');
  relation(omniscient, 'NPC_PLR_14').memories = relation(omniscient, 'NPC_PLR_14').memories.filter(id => id !== 'EVT_19_TEAM_001');
  assert.equal(omniscient.flags.UNSOLICITED_NANO_HELP, true);
  assert.equal(omniscient.flags.HAS_SEED_NANO_SHADOW, true);
  assert.equal(scheduleEvent(omniscient, [callback], { ignoreRhythmGate: true }), null);
});

test('T5.3/13 un NPC no puede reportar un hecho que no conoce', () => {
  const state = createInitialState(113);
  resolveChoiceInPlace(state, origin(), 'CALL_NANO');
  assert.equal(npcKnows(state, 'NPC_PLR_14', 'EVT_18_PRE_001'), true);
  assert.equal(npcKnows(state, 'NPC_ACA_01', 'EVT_18_PRE_001'), false);
  assert.equal(npcKnows(state, 'NPC_CCH_01', 'EVT_18_PRE_001'), false);

  assert.throws(
    () => informNpcOfEventInPlace(state, 'NPC_CCH_01', 'EVT_18_PRE_001', {
      source: 'reported', sourceNpcId: 'NPC_ACA_01', memory: 'strong'
    }),
    /uninformed NPC source NPC_ACA_01/
  );
  assert.equal(npcKnows(state, 'NPC_CCH_01', 'EVT_18_PRE_001'), false);
});

test('T5.3/14 un retry de commandId no reaprende ni altera conocimiento', async () => {
  const event = structuredClone(origin());
  const session = await GameSession.create(114, { events: [event], microfeeds: false, sessionId: 't53-replay' });
  await session.dispatch({ type: 'continue', maxDays: 1, commandId: 't53-replay-advance', expectedRevision: 0 });
  const decision = session.getView();
  assert.equal(decision.screen, 'decision');
  assert.ok(decision.decision);
  const command = {
    type: 'choose', commandId: 't53-replay-choice', expectedRevision: decision.revision,
    pendingInstanceId: decision.decision.instanceId, choiceId: 'CALL_NANO'
  };

  const first = await session.dispatch(command);
  assert.equal(first.replayed, false);
  const afterFirst = session.exportSnapshot();
  const record = getNpcKnowledgeRecord(afterFirst.state, 'NPC_PLR_14', 'EVT_18_PRE_001');
  assert.ok(record);

  const replay = await session.dispatch(command);
  assert.equal(replay.replayed, true);
  assert.deepEqual(session.exportSnapshot(), afterFirst, 'el retry no reescribe learnedAt, estado ni RNG');
});
