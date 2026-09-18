import test from 'node:test';
import assert from 'node:assert/strict';
import { NPC_EVENT_KNOWLEDGE_RULES } from '../dist/catalog/npc-knowledge-rules.js';
import { createInitialState } from '../dist/content/initial-state.js';
import { getNpcKnowledgeRecord, npcKnows } from '../dist/core/npc-knowledge.js';
import { eligibleChoices } from '../dist/narrative/choice-eligibility.js';
import { resolveChoiceInPlace } from '../dist/narrative/resolver.js';

const EVENT = {
  id: 'EVT_T53_DYNAMIC_TARGET',
  ageWindow: [23, 25],
  phase: '23_26',
  family: 'team',
  gates: [],
  cooldown: 365,
  repeatable: false,
  weight: 1,
  text: { title: 'dynamic target test', body: 'dynamic target test' },
  intel: { visible: [], uncertain: [] },
  choices: [
    { id: 'ESCALATE', label: 'Escalate', intentTags: [], outcomeIds: ['ESCALATE__ONLY'] },
    { id: 'IGNORE', label: 'Ignore', intentTags: [], outcomeIds: ['IGNORE__ONLY'] }
  ],
  outcomes: [
    { id: 'ESCALATE__ONLY', baseWeight: 1, effects: [], messages: [] },
    { id: 'IGNORE__ONLY', baseWeight: 1, effects: [], messages: [] }
  ]
};

const DYNAMIC_RULE = {
  eventId: EVENT.id,
  choiceIds: ['ESCALATE'],
  outcomeIds: ['ESCALATE__ONLY'],
  npcIds: [],
  targetSlots: ['captain'],
  source: 'informed',
  certainty: 100,
  memory: 'strong',
  relationshipMemory: true
};

function state23(seed = 10401) {
  const state = createInitialState(seed);
  state.age = 23;
  state.phase = '23_26';
  state.club = 'UDV';
  return state;
}

async function withDynamicRule(rule, fn) {
  NPC_EVENT_KNOWLEDGE_RULES.push(rule);
  try {
    return await fn();
  } finally {
    const index = NPC_EVENT_KNOWLEDGE_RULES.lastIndexOf(rule);
    if (index >= 0) NPC_EVENT_KNOWLEDGE_RULES.splice(index, 1);
  }
}

test('T5.3 dynamic targets/0 declarations fail closed and role targets are choice+outcome scoped', () => {
  // Keep this runtime ratchet aligned with NpcKnowledgeTargetSlot and
  // npc-knowledge-targets.ts. Adding a fifth slot must update both the typed
  // authority resolver and this explicit allowlist before content may use it.
  const allowedSlots = new Set(['captain', 'star', 'activeAgent', 'currentClubInstitutional']);
  for (const rule of NPC_EVENT_KNOWLEDGE_RULES) {
    const slots = rule.targetSlots ?? [];
    const staticTargets = rule.npcIds ?? [];
    assert.ok(staticTargets.length + slots.length > 0, `${rule.eventId}: knowledge rule without target`);
    assert.equal(new Set(slots).size, slots.length, `${rule.eventId}: duplicate dynamic target slot`);
    for (const slot of slots) assert.ok(allowedSlots.has(slot), `${rule.eventId}: unknown dynamic target slot ${slot}`);
    if (slots.length === 0) continue;
    assert.ok(Array.isArray(rule.choiceIds) && rule.choiceIds.length > 0, `${rule.eventId}: dynamic target without choice scope`);
    assert.ok(Array.isArray(rule.outcomeIds) && rule.outcomeIds.length > 0, `${rule.eventId}: dynamic target without outcome scope`);
  }
});

test('T5.3 dynamic targets/1 matching choice informs exactly the authoritative captain and persists the resolved ref', async () => {
  await withDynamicRule(DYNAMIC_RULE, () => {
    const state = state23();
    assert.equal(npcKnows(state, 'NPC_PLR_10', EVENT.id), false);
    assert.equal(npcKnows(state, 'NPC_PLR_12', EVENT.id), false);

    resolveChoiceInPlace(state, EVENT, 'ESCALATE');

    assert.equal(npcKnows(state, 'NPC_PLR_10', EVENT.id), true);
    assert.equal(npcKnows(state, 'NPC_PLR_12', EVENT.id), false);
    const record = getNpcKnowledgeRecord(state, 'NPC_PLR_10', EVENT.id);
    assert.ok(record);
    assert.equal(record.source, 'informed');
    assert.equal(record.choiceId, 'ESCALATE');
    assert.equal(record.outcomeId, 'ESCALATE__ONLY');
    assert.deepEqual(state.history.at(-1)?.snapshot.npcRefs, ['NPC_PLR_10']);
    assert.equal(
      state.relationships.find(row => row.npcId === 'NPC_PLR_10')?.memories.includes(EVENT.id),
      true
    );
  });
});

test('T5.3 dynamic targets/2 a non-matching choice does not make the captain omniscient', async () => {
  await withDynamicRule(DYNAMIC_RULE, () => {
    const state = state23(10402);
    resolveChoiceInPlace(state, EVENT, 'IGNORE');
    assert.equal(npcKnows(state, 'NPC_PLR_10', EVENT.id), false);
    assert.deepEqual(state.history.at(-1)?.snapshot.npcRefs, []);
  });
});

test('T5.3 dynamic targets/3 an unresolved slot fails closed instead of inventing a recipient', async () => {
  await withDynamicRule(DYNAMIC_RULE, () => {
    const state = state23(10403);
    state.club = 'Aurora CF';
    resolveChoiceInPlace(state, EVENT, 'ESCALATE');
    assert.equal(npcKnows(state, 'NPC_PLR_10', EVENT.id), false);
    assert.equal(state.npcs.some(npc => npc.memories.includes(EVENT.id)), false);
    assert.deepEqual(state.history.at(-1)?.snapshot.npcRefs, []);
  });
});

test('T5.3 dynamic targets/4 resolving a role target consumes no extra RNG', async () => {
  const withRule = state23(10404);
  const withoutRule = state23(10404);

  await withDynamicRule(DYNAMIC_RULE, () => {
    resolveChoiceInPlace(withRule, EVENT, 'ESCALATE');
  });
  resolveChoiceInPlace(withoutRule, EVENT, 'ESCALATE');

  assert.deepEqual(withRule.rngState, withoutRule.rngState);
  assert.equal(npcKnows(withRule, 'NPC_PLR_10', EVENT.id), true);
  assert.equal(npcKnows(withoutRule, 'NPC_PLR_10', EVENT.id), false);
});

test('T5.3 dynamic targets/5 recipient is captured from scene-entry club before a choice moves the player', async () => {
  const movingEvent = structuredClone(EVENT);
  movingEvent.id = 'EVT_T53_DYNAMIC_TARGET_MOVE';
  movingEvent.choices[0].immediateEffects = [{ kind: 'set', path: 'club', value: 'NEW_CLUB' }];
  const movingRule = { ...DYNAMIC_RULE, eventId: movingEvent.id };

  await withDynamicRule(movingRule, () => {
    const state = state23(10405);
    resolveChoiceInPlace(state, movingEvent, 'ESCALATE');

    assert.equal(state.club, 'NEW_CLUB');
    assert.equal(npcKnows(state, 'NPC_PLR_10', movingEvent.id), true);
    const record = getNpcKnowledgeRecord(state, 'NPC_PLR_10', movingEvent.id);
    assert.ok(record);
    assert.equal(record.club, 'UDV');
    assert.deepEqual(state.history.at(-1)?.snapshot.npcRefs, ['NPC_PLR_10']);
  });
});

test('T5.3 dynamic targets/6 choice eligibility sees the same authoritative locker facts as event gates', () => {
  const guardedEvent = structuredClone(EVENT);
  guardedEvent.choices[0].eligibility = [{ path: 'facts.lockerCaptainAffinity', op: 'exists' }];

  const state = state23(10406);
  const before = structuredClone(state);
  assert.deepEqual(eligibleChoices(state, guardedEvent).map(choice => choice.id), ['ESCALATE', 'IGNORE']);
  assert.deepEqual(state, before, 'choice eligibility must be read-only');

  state.club = 'Aurora CF';
  const rngBefore = structuredClone(state.rngState);
  assert.deepEqual(eligibleChoices(state, guardedEvent).map(choice => choice.id), ['IGNORE']);
  assert.deepEqual(state.rngState, rngBefore, 'choice eligibility must not consume RNG');
});
