import test from 'node:test';
import assert from 'node:assert/strict';

import { A5_READY_EVENTS_18_23 } from '../dist/content/events/20_23/a5-ready-staged.js';
import { A5_AGENT_READY_EXTERNAL_EVENTS, A5_AGENT_EXTERNAL_REQUIREMENTS } from '../dist/content/events/20_23/a5-agent-ready-external.js';
import { A5_EVT_18_END_002_OWNER_READY, EVT_18_END_002_EXTERNAL_REQUIREMENT } from '../dist/content/events/18_20/a5-end002-staged.js';
import { A5_MARKET_EXTERNAL_REQUIREMENTS, A5_MARKET_OWNER_READY_PRINCIPALS } from '../dist/content/events/20_23/a5-market-external-staged.js';
import { A5_READY_NPC_KNOWLEDGE_RULES } from '../dist/catalog/npc-knowledge-rules-a5-ready.js';
import { createInitialState } from '../dist/content/initial-state.js';
import { eventGatesPass } from '../dist/narrative/event-gates.js';
import { eligibleChoices } from '../dist/narrative/choice-eligibility.js';
import { resolveChoiceInPlace } from '../dist/narrative/resolver.js';
import { narrativeCausalFacts } from '../dist/simulation/club-contract-intent.js';
import { certifyActiveAgentInPlace } from '../dist/simulation/npc-authority.js';
import { captureNpcKnowledgeTargetContext, resolveNpcKnowledgeTargets } from '../dist/narrative/npc-knowledge-targets.js';
import { proposeCareerChange } from '../dist/simulation/offers.js';
import { loadSave, serializeSave } from '../dist/save/save.js';

const event = id => {
  const found = [...A5_READY_EVENTS_18_23, ...A5_AGENT_READY_EXTERNAL_EVENTS].find(row => row.id === id);
  assert.ok(found, `missing staged event ${id}`);
  return found;
};

function stateAt(seed, age, date) {
  const state = createInitialState(seed);
  state.age = age;
  state.phase = age < 20 ? '18_20' : '20_23';
  state.date = date;
  state.season = date.slice(0, 4) + '-' + String((Number(date.slice(0,4)) + 1) % 100).padStart(2,'0');
  if (age >= 20) state.professional.initializedAt20 = true;
  return state;
}

function addLiveSeed(state, id, originEvent, payload) {
  state.seeds.push({
    id,
    state: 'dormant',
    intensity: 60,
    originEvent,
    originSeason: state.season,
    npcRefs: [],
    payload: structuredClone(payload),
    lastTouchedDate: state.date
  });
  state.flags[`HAS_${id}`] = true;
}

function ruleFor(eventId, choiceId) {
  return A5_READY_NPC_KNOWLEDGE_RULES.find(rule =>
    rule.eventId === eventId && (rule.choiceIds ?? []).includes(choiceId)
  );
}

test('A5 ready/1 exact finite batch and canonical choices are staged without activating a registry shortcut', () => {
  assert.deepEqual(A5_READY_EVENTS_18_23.map(row => row.id), [
    'CEVT_18_PLAYOFF_01',
    'EVT_20_BRIDGE_001',
    'EVT_20_CCH_001',
    'EVT_21_SOC_001',
    'EVT_21_PRS_002'
  ]);
  assert.deepEqual(event('EVT_20_BRIDGE_001').choices.map(choice => choice.id), [
    'WRITTEN_PLAN', 'MONEY_FIRST', 'ASK_PRICE', 'LISTEN_AND_CHECK'
  ]);
  assert.deepEqual(event('EVT_20_CCH_001').choices.map(choice => choice.id), [
    'COACH_NOW', 'WAIT_THREE_MATCHES', 'ASK_DIRECTOR', 'AGENT_SOUND'
  ]);
  assert.deepEqual(event('EVT_21_SOC_001').choices.map(choice => choice.id), [
    'BACK_AGENT', 'APOLOGIZE_LIMIT', 'MEDIATE', 'LET_PASS'
  ]);
  assert.deepEqual(event('EVT_21_PRS_002').choices.map(choice => choice.id), [
    'EXACT_DURATION', 'RANGE', 'PUBLICABLE_ONLY', 'PASS_TO_AGENT'
  ]);
});

test('A5 ready/2 A1 identities are consumed read-only and no contact/relationship heuristic fabricates an agent', () => {
  const state = stateAt(51002, 20, '2028-08-08');
  state.flags.AGENT_ACTIVE = true;
  state.flags.AGENT_CONTACT_HECTOR = true;
  state.relationships.find(row => row.npcId === 'NPC_AGT_01').trust = 100;
  const beforeRng = structuredClone(state.rngState);
  const first = narrativeCausalFacts(state);
  assert.equal(first.activeAgentNpcId, null);
  assert.equal(first.currentClubInstitutionalNpcId, 'NPC_DIR_02');
  assert.deepEqual(state.rngState, beforeRng);

  certifyActiveAgentInPlace(state, 'NPC_AGT_01');
  const snapshot = structuredClone(state);
  const second = narrativeCausalFacts(state);
  assert.equal(second.activeAgentNpcId, 'NPC_AGT_01');
  assert.equal(second.currentClubInstitutionalNpcId, 'NPC_DIR_02');
  assert.deepEqual(state, snapshot, 'facts must be read-only');

  state.club = 'OTHER_CLUB';
  state.professional.registrationClub = 'OTHER_CLUB';
  assert.equal(narrativeCausalFacts(state).currentClubInstitutionalNpcId, null);
});

test('A5 ready/3 CCH director and agent choices fail closed independently', () => {
  const scene = event('EVT_20_CCH_001');
  const state = stateAt(51003, 20, '2028-08-20');
  let ids = eligibleChoices(state, scene).map(choice => choice.id);
  assert.ok(ids.includes('ASK_DIRECTOR'));
  assert.ok(!ids.includes('AGENT_SOUND'));

  certifyActiveAgentInPlace(state, 'NPC_AGT_01');
  ids = eligibleChoices(state, scene).map(choice => choice.id);
  assert.ok(ids.includes('ASK_DIRECTOR'));
  assert.ok(ids.includes('AGENT_SOUND'));

  state.club = 'TRANSFER_FC';
  state.professional.registrationClub = 'TRANSFER_FC';
  ids = eligibleChoices(state, scene).map(choice => choice.id);
  assert.ok(!ids.includes('ASK_DIRECTOR'), 'UDV director must not leak after transfer');
  assert.ok(ids.includes('AGENT_SOUND'), 'certified active agent remains independently resolvable');
});

test('A5 ready/4 Dani scene requires live causal memory plus a certified active agent', () => {
  const scene = event('EVT_21_SOC_001');
  const state = stateAt(51004, 21, '2029-10-12');
  state.professional.agentControl = 60;
  addLiveSeed(state, 'SEED_DANI_NORMALITY', 'EVT_18_SOC_001', { pattern: 'normality' });

  state.flags.AGENT_ACTIVE = true;
  state.flags.AGENT_CONTACT_HECTOR = true;
  assert.equal(eventGatesPass(state, scene), false, 'contact flags cannot certify representation');

  certifyActiveAgentInPlace(state, 'NPC_AGT_01');
  const before = structuredClone(state.rngState);
  assert.equal(eventGatesPass(state, scene), true);
  assert.equal(narrativeCausalFacts(state).daniNormalityPattern, 'normality');
  assert.deepEqual(state.rngState, before);
});

test('A5 ready/5 Clara channel is factual, agent route is optional, and the scene never creates a CareerOffer', () => {
  const scene = event('EVT_21_PRS_002');
  const state = stateAt(51005, 21, '2029-11-03');
  addLiveSeed(state, 'SEED_CLARA_CHANNEL', 'EVT_18_PRS_002', { mode: 'context' });
  assert.equal(eventGatesPass(state, scene), true);
  assert.equal(narrativeCausalFacts(state).claraChannelMode, 'context');

  let ids = eligibleChoices(state, scene).map(choice => choice.id);
  assert.ok(!ids.includes('PASS_TO_AGENT'));
  const marketBefore = structuredClone(state.market);
  resolveChoiceInPlace(state, scene, 'PUBLICABLE_ONLY');
  assert.deepEqual(state.market, marketBefore, 'journalistic information must not manufacture a formal offer');

  const withAgent = stateAt(51006, 21, '2029-11-03');
  addLiveSeed(withAgent, 'SEED_CLARA_CHANNEL', 'EVT_18_PRS_002', { mode: 'trade' });
  certifyActiveAgentInPlace(withAgent, 'NPC_AGT_02');
  ids = eligibleChoices(withAgent, scene).map(choice => choice.id);
  assert.ok(ids.includes('PASS_TO_AGENT'));
});

test('A5 ready/6 bridge reads an existing formal offer but never creates, signs or replaces it', () => {
  const scene = event('EVT_20_BRIDGE_001');
  const state = stateAt(51007, 20, '2028-07-10');
  proposeCareerChange(state, 'QA existing offer', draft => {
    draft.contract.salaryMonthly = Number(draft.contract.salaryMonthly) + 700;
  });
  assert.ok(state.market?.pending);
  const pendingBefore = structuredClone(state.market.pending);
  const contractBefore = structuredClone(state.contract);
  resolveChoiceInPlace(state, scene, 'ASK_PRICE');
  assert.deepEqual(state.market.pending, pendingBefore);
  assert.deepEqual(state.contract, contractBefore);

  const allEffects = [
    ...scene.choices.flatMap(choice => choice.immediateEffects ?? []),
    ...scene.outcomes.flatMap(outcome => outcome.effects)
  ];
  assert.equal(allEffects.some(effect => effect.kind !== 'flag' && String(effect.path).startsWith('contract.')), false);
  assert.equal(allEffects.some(effect => effect.kind === 'set' && ['club','tier'].includes(effect.path)), false);
});

test('A5 ready/7 playoff decision persists a real retention-vs-market payload through save/restore deterministically', () => {
  const scene = event('CEVT_18_PLAYOFF_01');
  const base = stateAt(51008, 18, '2027-05-15');
  base.flags.UDV_PLAYOFF = true;
  assert.equal(eventGatesPass(base, scene), true);

  const beforeReadRng = structuredClone(base.rngState);
  narrativeCausalFacts(base);
  eligibleChoices(base, scene);
  assert.deepEqual(base.rngState, beforeReadRng, 'eligibility/fact reads consume zero RNG');

  const a = structuredClone(base);
  const b = structuredClone(base);
  resolveChoiceInPlace(a, scene, 'COMMIT');
  resolveChoiceInPlace(b, scene, 'COMMIT');
  assert.deepEqual(a, b, 'same state and RNG resolve identically');

  const seed = a.seeds.find(row => row.id === 'SEED_EXIT_STYLE_UDV' && row.state !== 'resolved' && row.state !== 'expired');
  assert.ok(seed);
  assert.equal(seed.originEvent, 'CEVT_18_PLAYOFF_01');
  assert.equal(seed.payload.playoff, 'commit');
  assert.equal(narrativeCausalFacts(a).exitStylePlayoff, 'commit');

  const restored = loadSave(serializeSave(a));
  assert.equal(narrativeCausalFacts(restored).exitStylePlayoff, 'commit');
  assert.deepEqual(restored.seeds, a.seeds);
});

test('A5 ready/8 staged NPC provenance uses only explicit participants and A1 dynamic authority slots', () => {
  const state = stateAt(51009, 20, '2028-08-20');
  const directorRule = ruleFor('EVT_20_CCH_001', 'ASK_DIRECTOR');
  const agentRule = ruleFor('EVT_20_CCH_001', 'AGENT_SOUND');
  assert.ok(directorRule);
  assert.ok(agentRule);

  let context = captureNpcKnowledgeTargetContext(state);
  assert.deepEqual(resolveNpcKnowledgeTargets(directorRule, context), ['NPC_DIR_02']);
  assert.deepEqual(resolveNpcKnowledgeTargets(agentRule, context), []);

  certifyActiveAgentInPlace(state, 'NPC_AGT_01');
  context = captureNpcKnowledgeTargetContext(state);
  assert.deepEqual(resolveNpcKnowledgeTargets(agentRule, context), ['NPC_AGT_01']);

  const socialRule = ruleFor('EVT_21_SOC_001', 'MEDIATE');
  assert.ok(socialRule);
  assert.deepEqual(new Set(resolveNpcKnowledgeTargets(socialRule, context)), new Set(['NPC_SOC_01', 'NPC_AGT_01']));
  assert.equal(ruleFor('EVT_21_SOC_001', 'LET_PASS'), undefined, 'private inaction does not inform either party');

  state.club = 'TRANSFER_FC';
  state.professional.registrationClub = 'TRANSFER_FC';
  context = captureNpcKnowledgeTargetContext(state);
  assert.deepEqual(resolveNpcKnowledgeTargets(directorRule, context), []);
});


test('A5 canon blocker/1 EVT_18_END_002 is canon-resolved owner-side without coach-status proxy', () => {
  const scene = A5_EVT_18_END_002_OWNER_READY;
  assert.equal(scene.id, 'EVT_18_END_002');
  assert.deepEqual(scene.choices.map(choice => choice.id), [
    'DEFEND', 'CLUB_DECIDES', 'NEED_DIFFERENT_ROLE', 'SILENCE'
  ]);
  assert.deepEqual(scene.seedsWrite, ['SEED_COACH_PUBLIC']);
  assert.deepEqual(scene.gates, [{ path: 'reputation.mediaHeat', op: 'gte', value: 8 }]);

  const serialized = JSON.stringify(scene);
  assert.ok(!serialized.includes('coachSecurity'));
  assert.ok(!serialized.includes('COACH_FIRED'));
  assert.equal(EVT_18_END_002_EXTERNAL_REQUIREMENT.owner, 'A1/shared-coach');
  assert.ok(EVT_18_END_002_EXTERNAL_REQUIREMENT.mustProve.includes('questioned=true'));
  assert.ok(EVT_18_END_002_EXTERNAL_REQUIREMENT.mustProve.includes('continuityDecided=false'));
  assert.ok(scene.tags.includes('a5_ready_external_blocker'));
});


test('A5 external market/1 six blocked principals are complete owner-side and remain authority-clean', () => {
  assert.deepEqual(A5_MARKET_OWNER_READY_PRINCIPALS.map(row => row.id), [
    'EVT_20_MKT_001',
    'EVT_20_JAN_001',
    'EVT_21_MKT_001',
    'EVT_21_IMG_001',
    'EVT_22_MKT_001',
    'EVT_22_DDL_001'
  ]);
  for (const scene of A5_MARKET_OWNER_READY_PRINCIPALS) {
    assert.equal(scene.choices.length, 4, scene.id);
    assert.ok(scene.outcomes.length >= 8, scene.id);
    assert.ok(scene.tags.includes('a5_ready_external_blocker'), scene.id);
    const effects = [
      ...scene.choices.flatMap(choice => [...(choice.immediateEffects ?? []), ...(choice.hiddenCosts ?? [])]),
      ...scene.outcomes.flatMap(outcome => outcome.effects)
    ];
    const forbidden = effects.filter(effect => {
      if (effect.kind === 'flag') return ['LOAN_ACTIVE','ABROAD_ROUTE','BIG_CLUB'].includes(effect.flag);
      return [
        'club','tier','contract.monthsRemaining','contract.salaryMonthly','contract.releaseClause',
        'professional.ownerClub','professional.registrationClub','professional.leagueTier',
        'professional.clubPrestigeTier','professional.clubPrestigeScore','professional.route'
      ].includes(effect.path);
    });
    assert.deepEqual(forbidden, [], `${scene.id} must not mutate employment authority`);
  }
});

test('A5 external market/2 signable scenes consume formal-offer facts and never marketHeat as an offer proxy', () => {
  const byId = id => A5_MARKET_OWNER_READY_PRINCIPALS.find(row => row.id === id);
  for (const id of ['EVT_20_MKT_001','EVT_21_MKT_001','EVT_22_MKT_001','EVT_22_DDL_001']) {
    const scene = byId(id);
    assert.ok(scene);
    assert.ok(scene.gates.some(gate => String(gate.path).startsWith('facts.pendingCareerOffer')), id);
    assert.equal(scene.gates.some(gate => gate.path === 'reputation.marketHeat'), false, id);
  }
  assert.equal(byId('EVT_20_JAN_001').gates.some(gate => gate.path === 'reputation.marketHeat'), false);
  assert.equal(byId('EVT_21_IMG_001').gates.some(gate => gate.path === 'reputation.mediaHeat'), false);
});

test('A5 external market/3 exact external owner contracts stay explicit instead of fake REAL flags', () => {
  assert.equal(A5_MARKET_EXTERNAL_REQUIREMENTS.EVT_20_MKT_001.owner, 'A3');
  assert.ok(A5_MARKET_EXTERNAL_REQUIREMENTS.EVT_20_MKT_001.facts.includes('compatible CareerOffer'));
  assert.ok(A5_MARKET_EXTERNAL_REQUIREMENTS.EVT_21_IMG_001.facts.includes('real sponsorship/image proposal'));
  assert.ok(A5_MARKET_EXTERNAL_REQUIREMENTS.EVT_22_DDL_001.facts.includes('remaining decision time'));
  const serialized = JSON.stringify(A5_MARKET_OWNER_READY_PRINCIPALS);
  for (const fake of ['REAL_OFFER','HAS_OFFER','REAL_TRANSFER_AVAILABLE','REAL_LOAN_AVAILABLE']) {
    assert.equal(serialized.includes(fake), false);
  }
});


test('A5 external/1 agent batch is fully authored and awaits only explicit shared facts', () => {
  assert.deepEqual(A5_AGENT_READY_EXTERNAL_EVENTS.map(row => row.id), [
    'EVT_20_AGT_001', 'EVT_20_BRUNO_001', 'EVT_21_AGT_001'
  ]);
  assert.deepEqual(event('EVT_20_AGT_001').choices.map(choice => choice.id), [
    'BROAD_CONTROL', 'INFORM_FIRST', 'SPLIT_IMAGE', 'NO_CENTRALIZE'
  ]);
  assert.deepEqual(event('EVT_20_BRUNO_001').choices.map(choice => choice.id), [
    'AUTHORIZE_NOTIFY', 'AUTHORIZE_PRIVATE', 'ASK_MORE', 'DECLINE_HELP_OTHER'
  ]);
  assert.deepEqual(event('EVT_21_AGT_001').choices.map(choice => choice.id), [
    'ACCEPT_TARGETS', 'KEEP_TERMS', 'SOUND_OTHER_AGENCY', 'SPLIT_RIGHTS'
  ]);
  assert.equal(A5_AGENT_EXTERNAL_REQUIREMENTS.EVT_20_AGT_001.owner, 'A1');
  assert.equal(A5_AGENT_EXTERNAL_REQUIREMENTS.EVT_20_BRUNO_001.owner, 'A1/world');
  assert.equal(A5_AGENT_EXTERNAL_REQUIREMENTS.EVT_21_AGT_001.owner, 'A1');
});

test('A5 external/2 active-agent gates fail closed against legacy heuristics', () => {
  const state = stateAt(51010, 20, '2028-09-02');
  state.flags.AGENT_ACTIVE = true;
  state.flags.AGENT_CONTACT_HECTOR = true;
  state.professional.agentControl = 90;
  state.reputation.marketHeat = 60;
  const agent20 = event('EVT_20_AGT_001');
  assert.equal(eventGatesPass(state, agent20), false);

  certifyActiveAgentInPlace(state, 'NPC_AGT_01');
  assert.equal(eventGatesPass(state, agent20), true);

  const state21 = stateAt(51011, 21, '2029-09-02');
  state21.reputation.marketHeat = 60;
  state21.flags.AGENT_ACTIVE = true;
  assert.equal(eventGatesPass(state21, event('EVT_21_AGT_001')), false);
  certifyActiveAgentInPlace(state21, 'NPC_AGT_02');
  assert.equal(eventGatesPass(state21, event('EVT_21_AGT_001')), true);
});

test('A5 external/3 EVT_20_AGT_001 writes exact agent-power payload and never creates market authority', () => {
  const state = stateAt(51012, 20, '2028-09-02');
  state.reputation.marketHeat = 60;
  certifyActiveAgentInPlace(state, 'NPC_AGT_01');
  const scene = event('EVT_20_AGT_001');
  const marketBefore = structuredClone(state.market);
  resolveChoiceInPlace(state, scene, 'INFORM_FIRST');
  const seed = state.seeds.find(row => row.id === 'SEED_AGENT_POWER' && row.state !== 'resolved' && row.state !== 'expired');
  assert.ok(seed);
  assert.equal(seed.originEvent, 'EVT_20_AGT_001');
  assert.equal(seed.payload.choice, 'B');
  assert.equal(seed.payload.control, 'inform_first');
  assert.deepEqual(state.market, marketBefore);
});

test('A5 external/4 Bruno favor never proves current club need and notify route needs certified agent', () => {
  const state = stateAt(51013, 20, '2028-11-03');
  addLiveSeed(state, 'SEED_BRUNO_FAVOR', 'EVT_18_TEAM_001', { stance: 'helped' });
  const scene = event('EVT_20_BRUNO_001');
  assert.equal(eventGatesPass(state, scene), true, 'owner-side memory gate is ready');
  let ids = eligibleChoices(state, scene).map(choice => choice.id);
  assert.ok(!ids.includes('AUTHORIZE_NOTIFY'));
  assert.ok(ids.includes('AUTHORIZE_PRIVATE'));
  assert.ok(A5_AGENT_EXTERNAL_REQUIREMENTS.EVT_20_BRUNO_001.awaiting.includes('current Bruno opportunity/club-need fact'));

  certifyActiveAgentInPlace(state, 'NPC_AGT_01');
  ids = eligibleChoices(state, scene).map(choice => choice.id);
  assert.ok(ids.includes('AUTHORIZE_NOTIFY'));
  const marketBefore = structuredClone(state.market);
  resolveChoiceInPlace(state, scene, 'ASK_MORE');
  assert.deepEqual(state.market, marketBefore, 'Bruno contact does not manufacture CareerOffer');
});

test('A5 external/5 dynamic agent knowledge targets resolve only from A1 authority', () => {
  const state = stateAt(51014, 21, '2029-09-02');
  const rule = ruleFor('EVT_21_AGT_001', 'KEEP_TERMS');
  assert.ok(rule);
  let context = captureNpcKnowledgeTargetContext(state);
  assert.deepEqual(resolveNpcKnowledgeTargets(rule, context), []);
  certifyActiveAgentInPlace(state, 'NPC_AGT_02');
  context = captureNpcKnowledgeTargetContext(state);
  assert.deepEqual(resolveNpcKnowledgeTargets(rule, context), ['NPC_AGT_02']);

  const notifyRule = ruleFor('EVT_20_BRUNO_001', 'AUTHORIZE_NOTIFY');
  assert.ok(notifyRule);
  assert.deepEqual(new Set(resolveNpcKnowledgeTargets(notifyRule, context)), new Set(['NPC_PLR_12']));
  const allNotifyRules = A5_READY_NPC_KNOWLEDGE_RULES.filter(row =>
    row.eventId === 'EVT_20_BRUNO_001' && (row.choiceIds ?? []).includes('AUTHORIZE_NOTIFY')
  );
  const recipients = new Set(allNotifyRules.flatMap(row => resolveNpcKnowledgeTargets(row, context)));
  assert.deepEqual(recipients, new Set(['NPC_PLR_12', 'NPC_AGT_02']));
});
