import './test-t5-retirement-save-known-bug.mjs';
import './test-t5-npc-knowledge-save-known-bug.mjs';
import './test-t5-offer-context-known-bug.mjs';
import './test-t5-captain-gap-known-bug.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState } from '../dist/content/initial-state.js';
import { lateCareerPreseason, lateCareerWeek, reverseRetirement } from '../dist/simulation/late-career-engine.js';

function lateState(seed = 510034, age = 38) {
  const state = createInitialState(seed);
  state.age = age;
  state.phase = '34_plus';
  state.season = '2046-47';
  state.date = '2047-07-01';
  state.professional.initializedAt30 = true;
  state.sport.roleScore = 48;
  state.reputation.marketHeat = 42;
  return state;
}

test('T5-QA-016a: announced retirement must not reopen to playing', () => {
  const state = lateState(1601, 38);
  state.retirement.status = 'announced';
  state.retirement.decidedDate = '2047-05-01';
  state.retirement.announcedDate = '2047-06-01';
  state.flags.RETIREMENT_ANNOUNCED = true;
  const reversalsBefore = state.retirement.reversals;
  reverseRetirement(state);
  assert.equal(state.retirement.status, 'announced', 'T5-QA-016a: announced retirement reopened');
  assert.equal(state.retirement.reversals, reversalsBefore, 'T5-QA-016a: blocked reversal mutated the reversal counter');
});

test('T5-QA-016b: private retirement decision must not auto-announce after elapsed time', () => {
  const state = lateState(1602, 39);
  state.retirement.status = 'decided';
  state.retirement.reason = 'voluntary';
  state.retirement.decidedDate = '2047-05-01';
  state.retirement.daysInStatus = 420;
  lateCareerWeek(state);
  assert.equal(state.retirement.status, 'decided', 'T5-QA-016b: private decision auto-announced');
  assert.equal(state.retirement.announcedDate, null, 'T5-QA-016b: announcement date was fabricated');
});

test('T5-QA-016c: no-market exhaustion must open a decision instead of auto-deciding retirement', () => {
  let state = null;
  for (let seed = 1; seed <= 128; seed++) {
    const candidate = lateState(seed, 38);
    candidate.contract.monthsRemaining = 0;
    candidate.sport.roleScore = 5;
    candidate.reputation.marketHeat = 0;
    candidate.professional.veteranLeverage = 0;
    candidate.professional.legacyCapital = 0;
    candidate.professional.availability = 10;
    candidate.retirement.noMarketWindows = 3;
    lateCareerPreseason(candidate);
    if (candidate.flags.NO_MARKET_END_CONTEXT) { state = candidate; break; }
  }
  assert.ok(state, 'reproduction invalid: no deterministic no-market exhaustion state found');
  assert.equal(state.retirement.status, 'playing', 'T5-QA-016c: no-market exhaustion auto-decided retirement');
  assert.equal(state.retirement.reason, null, 'T5-QA-016c: retirement reason was fabricated before player choice');
});

test('T5-QA-021: live-only NPC knowledge rules must not reinterpret historical backfill', async () => {
  const [
    { EVENTS },
    { NPC_EVENT_KNOWLEDGE_RULES },
    { npcKnows },
    { reconcileNpcKnowledgeFromHistoryInPlace },
    { resolveChoiceInPlace }
  ] = await Promise.all([
    import('../dist/content/events/index.js'),
    import('../dist/catalog/npc-knowledge-rules.js'),
    import('../dist/core/npc-knowledge.js'),
    import('../dist/narrative/npc-knowledge-reconciliation.js'),
    import('../dist/narrative/resolver.js')
  ]);

  const event = EVENTS.find(candidate => candidate.id === 'EVT_18_PRE_001');
  assert.ok(event, 'T5-QA-021 reproduction invalid: EVT_18_PRE_001 missing');

  const state = createInitialState(21021);
  resolveChoiceInPlace(state, event, 'CALL_NANO');
  const npc = state.npcs.find(candidate => candidate.id === 'NPC_PLR_14');
  const relation = state.relationships.find(candidate => candidate.npcId === 'NPC_PLR_14');
  assert.ok(npc);
  delete npc.knowledge.EVT_18_PRE_001;
  npc.memories = npc.memories.filter(id => id !== 'EVT_18_PRE_001');
  if (relation) relation.memories = relation.memories.filter(id => id !== 'EVT_18_PRE_001');

  const liveOnlyFact = 'T5_QA_021_LIVE_ONLY';
  const liveOnlyRule = {
    eventId: 'EVT_18_PRE_001',
    choiceIds: ['CALL_NANO'],
    npcIds: ['NPC_PLR_14'],
    factId: liveOnlyFact,
    source: 'informed',
    certainty: 100,
    memory: 'strong',
    relationshipMemory: true
  };

  NPC_EVENT_KNOWLEDGE_RULES.push(liveOnlyRule);
  try {
    const fingerprint = 'T5-QA-021-SAME-EVENT-FINGERPRINT';
    reconcileNpcKnowledgeFromHistoryInPlace(state, {
      decisionProvenance: state.history.map(() => ({
        sourceContentIdentity: 'T5-QA-021-SOURCE',
        eventFingerprint: fingerprint
      })),
      activeEventEvidence: {
        EVT_18_PRE_001: { fingerprint }
      }
    });

    assert.equal(npcKnows(state, 'NPC_PLR_14', 'EVT_18_PRE_001'), true, 'baseline historical fact was not reconstructed');
    assert.equal(
      npcKnows(state, 'NPC_PLR_14', liveOnlyFact),
      false,
      'T5-QA-021: historical replay adopted a rule that exists only in the mutable live registry'
    );
  } finally {
    const index = NPC_EVENT_KNOWLEDGE_RULES.indexOf(liveOnlyRule);
    if (index >= 0) NPC_EVENT_KNOWLEDGE_RULES.splice(index, 1);
  }
});

test('T5-QA-023: security-over-role bridge must not unlock PRS as if minutes had been promised', async () => {
  const [
    { EVENTS },
    { eventGatesPass },
    { resolveChoiceInPlace }
  ] = await Promise.all([
    import('../dist/content/events/index.js'),
    import('../dist/narrative/event-gates.js'),
    import('../dist/narrative/resolver.js')
  ]);

  const bridge = EVENTS.find(candidate => candidate.id === 'EVT_23_BRIDGE_001');
  const prs = EVENTS.find(candidate => candidate.id === 'EVT_23_PRS_001');
  assert.ok(bridge, 'T5-QA-023 reproduction invalid: EVT_23_BRIDGE_001 missing');
  assert.ok(prs, 'T5-QA-023 reproduction invalid: EVT_23_PRS_001 missing');

  const state = createInitialState(23023);
  state.age = 23;
  state.phase = '23_26';
  state.professional.initializedAt23 = true;
  state.professional.roleScoreAt23 = 72;
  state.sport.roleScore = 47;
  state.professional.roleSecurity = 50;

  resolveChoiceInPlace(state, bridge, 'B');
  const seed = state.seeds.find(candidate => candidate.id === 'SEED_ELITE_ROLE_BARGAIN');
  assert.ok(seed, 'T5-QA-023 reproduction invalid: bridge B did not create SEED_ELITE_ROLE_BARGAIN');
  assert.equal(seed.originEvent, 'EVT_23_BRIDGE_001');
  assert.equal(seed.payload?.stance, 'security_over_role', 'reproduction must use the non-promise bridge stance');
  assert.equal(state.flags.HAS_SEED_ELITE_ROLE_BARGAIN, true, 'reproduction requires the generic presence flag to be live');

  assert.equal(
    eventGatesPass(state, prs),
    false,
    'T5-QA-023: PRS became eligible from generic seed presence even though the prior conversation did not promise minutes'
  );
});
