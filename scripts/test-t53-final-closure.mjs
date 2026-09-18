import test from 'node:test';
import assert from 'node:assert/strict';

import { NPC_CATALOG } from '../dist/catalog/npcs.js';
import { createInitialState } from '../dist/content/initial-state.js';
import {
  getNpcKnowledgeRecord,
  npcKnows,
  rememberNpcFactInPlace
} from '../dist/core/npc-knowledge.js';
import { knownPlayerContactIds } from '../dist/core/player-contacts.js';
import {
  captureNpcKnowledgeTargetContext,
  resolveNpcKnowledgeTargets
} from '../dist/narrative/npc-knowledge-targets.js';
import { loadSave, serializeSave } from '../dist/save/save.js';
import {
  certifyActiveAgentInPlace,
  clearActiveAgentInPlace,
  resolveActiveAgent,
  resolveCurrentClubInstitutionalNpc
} from '../dist/simulation/npc-authority.js';

function relation(state, npcId) {
  const row = state.relationships.find(candidate => candidate.npcId === npcId);
  assert.ok(row, `missing relationship ${npcId}`);
  return row;
}

function npc(state, npcId) {
  const row = state.npcs.find(candidate => candidate.id === npcId);
  assert.ok(row, `missing npc ${npcId}`);
  return row;
}

test('T5.3 final/1 all 20 persistent NPC identities are unique and state/relationship complete', () => {
  assert.equal(NPC_CATALOG.length, 20);
  assert.equal(new Set(NPC_CATALOG.map(row => row.id)).size, 20);
  assert.equal(new Set(NPC_CATALOG.map(row => row.name)).size, 20);

  const state = createInitialState(53101);
  assert.equal(state.npcs.length, 20);
  assert.equal(state.relationships.length, 20);

  for (const def of NPC_CATALOG) {
    const stateNpc = npc(state, def.id);
    const stateRelationship = relation(state, def.id);
    assert.equal(stateNpc.id, def.id);
    assert.equal(stateRelationship.npcId, def.id);
  }
});

test('T5.3 final/2 relationship and causal knowledge persist independently for every NPC across save/load', () => {
  const state = createInitialState(53102);

  for (let index = 0; index < NPC_CATALOG.length; index += 1) {
    const id = NPC_CATALOG[index].id;
    const rel = relation(state, id);
    rel.trust = 20 + index;
    const factId = `T53_FINAL_FACT_${id}`;
    rememberNpcFactInPlace(state, id, {
      factId,
      eventId: 'T53_FINAL_QA',
      choiceId: 'EXPLICIT',
      outcomeId: 'KNOWN',
      source: 'informed',
      certainty: 100,
      memory: 'strong',
      relationshipMemory: true
    });
  }

  const restored = loadSave(serializeSave(state));
  for (let index = 0; index < NPC_CATALOG.length; index += 1) {
    const id = NPC_CATALOG[index].id;
    const factId = `T53_FINAL_FACT_${id}`;
    assert.equal(relation(restored, id).trust, 20 + index);
    assert.equal(npcKnows(restored, id, factId), true);
    assert.equal(getNpcKnowledgeRecord(restored, id, factId)?.source, 'informed');
    assert.equal(relation(restored, id).memories.includes(factId), true);
  }
});

test('T5.3 final/3 load/migration never fabricates knowledge for a fresh 20-NPC save', () => {
  const state = createInitialState(53103);
  const restored = loadSave(serializeSave(state));

  for (const def of NPC_CATALOG) {
    const row = npc(restored, def.id);
    assert.deepEqual(Object.keys(row.knowledge), []);
    assert.deepEqual(row.memories, []);
    assert.deepEqual(relation(restored, def.id).memories, []);
  }
});

test('T5.3 final/4 authority and knowledge reads across all NPCs are read-only and consume 0 RNG', () => {
  const state = createInitialState(53104);
  const before = structuredClone(state);
  const rng = structuredClone(state.rngState);

  for (const def of NPC_CATALOG) {
    npcKnows(state, def.id, 'T53_UNKNOWN_FACT');
    getNpcKnowledgeRecord(state, def.id, 'T53_UNKNOWN_FACT');
  }
  knownPlayerContactIds(state);
  resolveActiveAgent(state);
  resolveCurrentClubInstitutionalNpc(state);
  captureNpcKnowledgeTargetContext(state);

  assert.deepEqual(state.rngState, rng);
  assert.deepEqual(state, before);
});

test('T5.3 final/5 switching or terminating an agent never transfers private knowledge', () => {
  const state = createInitialState(53105);
  certifyActiveAgentInPlace(state, 'NPC_AGT_01');
  rememberNpcFactInPlace(state, 'NPC_AGT_01', {
    factId: 'PRIVATE_WITH_HECTOR',
    eventId: 'T53_AGENT_PRIVATE',
    choiceId: 'TELL_HECTOR',
    outcomeId: 'PRIVATE',
    source: 'informed',
    certainty: 100,
    memory: 'strong',
    relationshipMemory: true
  });

  assert.equal(resolveActiveAgent(state), 'NPC_AGT_01');
  assert.equal(npcKnows(state, 'NPC_AGT_01', 'PRIVATE_WITH_HECTOR'), true);
  assert.equal(npcKnows(state, 'NPC_AGT_02', 'PRIVATE_WITH_HECTOR'), false);

  certifyActiveAgentInPlace(state, 'NPC_AGT_02');
  assert.equal(resolveActiveAgent(state), 'NPC_AGT_02');
  assert.equal(npcKnows(state, 'NPC_AGT_01', 'PRIVATE_WITH_HECTOR'), true, 'historical knowledge must remain with prior agent');
  assert.equal(npcKnows(state, 'NPC_AGT_02', 'PRIVATE_WITH_HECTOR'), false, 'new agent must not inherit private knowledge');

  clearActiveAgentInPlace(state);
  assert.equal(resolveActiveAgent(state), null);
  assert.equal(npcKnows(state, 'NPC_AGT_01', 'PRIVATE_WITH_HECTOR'), true, 'termination must not erase history');
});

test('T5.3 final/6 family, coach and teammate remain non-omniscient across private channels', () => {
  const state = createInitialState(53106);

  rememberNpcFactInPlace(state, 'NPC_FAM_01', {
    factId: 'PRIVATE_FAMILY_DECISION',
    eventId: 'T53_PRIVATE_FAMILY',
    choiceId: 'TELL_MOTHER',
    outcomeId: 'PRIVATE',
    source: 'informed',
    certainty: 100,
    memory: 'strong'
  });
  assert.equal(npcKnows(state, 'NPC_CCH_01', 'PRIVATE_FAMILY_DECISION'), false);

  rememberNpcFactInPlace(state, 'NPC_AGT_01', {
    factId: 'PRIVATE_OFFER_TERMS',
    eventId: 'T53_PRIVATE_OFFER',
    choiceId: 'NEGOTIATE',
    outcomeId: 'PRIVATE',
    source: 'informed',
    certainty: 100,
    memory: 'strong'
  });
  assert.equal(npcKnows(state, 'NPC_PLR_12', 'PRIVATE_OFFER_TERMS'), false);
  assert.equal(npcKnows(state, 'NPC_PRS_01', 'PRIVATE_OFFER_TERMS'), false);
});

test('T5.3 final/7 current-club institutional authority fails closed after transfer while historical memory remains', () => {
  const state = createInitialState(53107);
  state.age = 21;
  state.phase = '20_23';
  assert.equal(resolveCurrentClubInstitutionalNpc(state), 'NPC_DIR_02');

  rememberNpcFactInPlace(state, 'NPC_DIR_02', {
    factId: 'UDV_PRIVATE_INSTITUTIONAL',
    eventId: 'T53_UDV_PRIVATE',
    choiceId: 'TELL_CLUB',
    outcomeId: 'KNOWN',
    source: 'informed',
    certainty: 100,
    memory: 'strong'
  });

  state.club = 'OTHER_CLUB';
  state.professional.ownerClub = 'OTHER_CLUB';
  state.professional.registrationClub = 'OTHER_CLUB';

  assert.equal(resolveCurrentClubInstitutionalNpc(state), null);
  assert.equal(npcKnows(state, 'NPC_DIR_02', 'UDV_PRIVATE_INSTITUTIONAL'), true, 'old institutional history is preserved');
});

test('T5.3 final/8 dynamic captain target informs only the certified captain and fails closed elsewhere', () => {
  const state = createInitialState(53108);
  state.age = 23;
  state.phase = '23_26';

  const context = captureNpcKnowledgeTargetContext(state);
  const targets = resolveNpcKnowledgeTargets({
    eventId: 'T53_CAPTAIN_TARGET',
    npcIds: [],
    targetSlots: ['captain'],
    source: 'informed'
  }, context);
  assert.deepEqual(targets, ['NPC_PLR_10']);

  state.club = 'OTHER_CLUB';
  state.professional.ownerClub = 'OTHER_CLUB';
  state.professional.registrationClub = 'OTHER_CLUB';
  const otherContext = captureNpcKnowledgeTargetContext(state);
  assert.deepEqual(resolveNpcKnowledgeTargets({
    eventId: 'T53_CAPTAIN_TARGET',
    npcIds: [],
    targetSlots: ['captain'],
    source: 'informed'
  }, otherContext), []);
});

test('T5.3 final/9 a public fact still requires an explicit recipient/channel; it is not global telepathy', () => {
  const state = createInitialState(53109);
  rememberNpcFactInPlace(state, 'NPC_PRS_01', {
    factId: 'PUBLIC_PRESS_FACT',
    eventId: 'T53_PUBLIC_FACT',
    choiceId: 'PUBLISH',
    outcomeId: 'PUBLIC',
    source: 'public',
    certainty: 100,
    memory: 'strong'
  });

  assert.equal(npcKnows(state, 'NPC_PRS_01', 'PUBLIC_PRESS_FACT'), true);
  for (const id of ['NPC_CCH_01', 'NPC_AGT_01', 'NPC_FAM_01', 'NPC_PLR_12']) {
    assert.equal(npcKnows(state, id, 'PUBLIC_PRESS_FACT'), false);
  }

  rememberNpcFactInPlace(state, 'NPC_CCH_01', {
    factId: 'PUBLIC_PRESS_FACT',
    eventId: 'T53_PUBLIC_FACT',
    choiceId: 'PUBLISH',
    outcomeId: 'PUBLIC',
    source: 'public',
    certainty: 100,
    memory: 'strong'
  });
  assert.equal(npcKnows(state, 'NPC_CCH_01', 'PUBLIC_PRESS_FACT'), true);
});
