import test from 'node:test';
import assert from 'node:assert/strict';
import { NPC_CATALOG } from '../dist/catalog/npcs.js';
import { EVENTS } from '../dist/content/events/index.js';
import { createInitialState } from '../dist/content/initial-state.js';
import {
  INITIAL_PLAYER_CONTACT_IDS,
  PLAYER_CONTACT_RULES,
  knownPlayerContactIds,
  knownPlayerContacts,
  playerKnowsNpc
} from '../dist/core/player-contacts.js';
import { rememberNpcFactInPlace } from '../dist/core/npc-knowledge.js';
import { resolveChoiceInPlace } from '../dist/narrative/resolver.js';
import { loadSave, serializeSave } from '../dist/save/save.js';
import { GameSession } from '../dist/session/game-session.js';
import { getKnownPlayerContacts } from '../dist/session/player-contacts.js';

const byId = id => {
  const event = EVENTS.find(candidate => candidate.id === id);
  assert.ok(event, `Falta evento ${id}`);
  return event;
};

const INITIAL = [
  'NPC_PLR_14',
  'NPC_FAM_01',
  'NPC_FAM_02',
  'NPC_FAM_03',
  'NPC_SOC_01'
];

test('T5.3 contacts/1 el catálogo inicial es explícito y conservador', () => {
  const state = createInitialState(301);
  assert.deepEqual([...INITIAL_PLAYER_CONTACT_IDS], INITIAL);
  assert.deepEqual(knownPlayerContactIds(state), INITIAL);
  assert.deepEqual(knownPlayerContacts(state).map(contact => contact.id), INITIAL);
  assert.equal(playerKnowsNpc(state, 'NPC_CCH_01'), false);
  assert.equal(playerKnowsNpc(state, 'NPC_AGT_02'), false);
});

test('T5.3 contacts/2 relación, acceso y conocimiento NPC no revelan un contacto al protagonista', () => {
  const state = createInitialState(302);
  const coach = state.npcs.find(npc => npc.id === 'NPC_CCH_01');
  const relation = state.relationships.find(row => row.npcId === 'NPC_CCH_01');
  assert.ok(coach && relation);
  coach.access = 100;
  relation.trust = 100;
  rememberNpcFactInPlace(state, 'NPC_CCH_01', {
    factId: 'T53_CONTACT_PRIVATE',
    eventId: 'T53_CONTACT_PRIVATE',
    choiceId: 'OBSERVED',
    outcomeId: 'KNOWN',
    source: 'witnessed',
    certainty: 100,
    memory: 'strong'
  });
  assert.equal(playerKnowsNpc(state, 'NPC_CCH_01'), false);
  assert.equal(knownPlayerContactIds(state).includes('NPC_CCH_01'), false);
});

test('T5.3 contacts/3 una interacción explícita añade solo el contacto autorizado por la regla', () => {
  const state = createInitialState(303);
  const beforeRng = structuredClone(state.rngState);
  resolveChoiceInPlace(state, byId('EVT_18_PRE_001'), 'CALL_RIVAS');
  assert.equal(playerKnowsNpc(state, 'NPC_ACA_01'), true);
  assert.equal(playerKnowsNpc(state, 'NPC_CCH_01'), false);
  assert.deepEqual(knownPlayerContactIds(state), [
    'NPC_ACA_01',
    'NPC_PLR_14',
    'NPC_FAM_01',
    'NPC_FAM_02',
    'NPC_FAM_03',
    'NPC_SOC_01'
  ]);
  assert.equal(state.rngState.narrative.draws, beforeRng.narrative.draws + 1, 'solo consume el RNG normal de resolver la escena');
});

test('T5.3 contacts/4 CALL_NANO no concede por accidente el contacto de Rivas', () => {
  const state = createInitialState(304);
  resolveChoiceInPlace(state, byId('EVT_18_PRE_001'), 'CALL_NANO');
  assert.equal(playerKnowsNpc(state, 'NPC_PLR_14'), true);
  assert.equal(playerKnowsNpc(state, 'NPC_ACA_01'), false);
});

test('T5.3 contacts/5 el contrato se reconstruye tras save/restore sin cambiar schema', () => {
  const state = createInitialState(305);
  resolveChoiceInPlace(state, byId('EVT_18_PRE_001'), 'CALL_RIVAS');
  const restored = loadSave(serializeSave(state));
  assert.deepEqual(knownPlayerContactIds(restored), knownPlayerContactIds(state));
  assert.equal(playerKnowsNpc(restored, 'NPC_ACA_01'), true);
});

test('T5.3 contacts/6 el adaptador de sesión no expone agendas ni estado privado', async () => {
  const session = await GameSession.create(306, { events: [byId('EVT_18_PRE_001')], microfeeds: false, sessionId: 't53-contacts' });
  const rngBefore = structuredClone(session.exportSnapshot().state.rngState);
  const contacts = getKnownPlayerContacts(session);
  assert.deepEqual(contacts.map(contact => contact.id), INITIAL);
  for (const contact of contacts) assert.deepEqual(Object.keys(contact).sort(), ['id', 'name', 'role']);
  const json = JSON.stringify(contacts);
  for (const forbidden of ['privateAgenda', 'knowledge', 'memories', 'trust', 'access', 'reliability']) {
    assert.equal(json.includes(forbidden), false, `No debe exponerse ${forbidden}`);
  }
  assert.deepEqual(session.exportSnapshot().state.rngState, rngBefore, 'leer contactos no consume RNG ni muta sesión');
});

test('T5.3 contacts/7 todas las reglas apuntan a eventos, choices y NPC reales', () => {
  const npcIds = new Set(NPC_CATALOG.map(npc => npc.id));
  const eventIds = new Set(EVENTS.map(event => event.id));
  for (const npcId of INITIAL_PLAYER_CONTACT_IDS) assert.ok(npcIds.has(npcId), `NPC inicial inexistente: ${npcId}`);
  for (const rule of PLAYER_CONTACT_RULES) {
    assert.ok(eventIds.has(rule.eventId), `Evento inexistente: ${rule.eventId}`);
    const event = byId(rule.eventId);
    for (const npcId of rule.npcIds) {
      assert.ok(npcIds.has(npcId), `NPC inexistente: ${npcId}`);
      assert.ok(event.npcRefs?.includes(npcId), `${rule.eventId} debe declarar ${npcId} en npcRefs`);
    }
    for (const choiceId of rule.choiceIds ?? []) assert.ok(event.choices.some(choice => choice.id === choiceId), `Choice inexistente: ${rule.eventId}/${choiceId}`);
    for (const outcomeId of rule.outcomeIds ?? []) assert.ok(event.outcomes.some(outcome => outcome.id === outcomeId), `Outcome inexistente: ${rule.eventId}/${outcomeId}`);
  }
});
