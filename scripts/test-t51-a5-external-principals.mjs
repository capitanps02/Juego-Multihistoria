import test from 'node:test';
import assert from 'node:assert/strict';

import {
  A5_EXTERNAL_PRINCIPALS_20_23,
  A5_EXTERNAL_PRINCIPAL_REQUIREMENTS,
  a5ExternalPrincipalRequirement
} from '../dist/content/events/20_23/a5-external-principals-staged.js';
import { A5_EXTERNAL_PRINCIPAL_KNOWLEDGE_RULES } from '../dist/catalog/npc-knowledge-rules-a5-external.js';
import { createInitialState } from '../dist/content/initial-state.js';
import { eligibleChoices } from '../dist/narrative/choice-eligibility.js';
import { certifyActiveAgentInPlace } from '../dist/simulation/npc-authority.js';
import { captureNpcKnowledgeTargetContext, resolveNpcKnowledgeTargets } from '../dist/narrative/npc-knowledge-targets.js';

const EXPECTED = [
  'EVT_20_MKT_001','EVT_20_MED_001','EVT_20_AGT_001','EVT_20_MATCH_003','EVT_20_JAN_001','EVT_20_BRUNO_001',
  'EVT_21_MONEY_001','EVT_21_AGT_001','EVT_21_MKT_001','EVT_21_NAT_001','EVT_21_IMG_001','EVT_21_MED_001','EVT_21_CCH_002',
  'EVT_22_LOCK_001','EVT_22_HOME_001','EVT_22_MKT_001','EVT_22_MED_001','EVT_22_TACT_001','EVT_22_DDL_001'
];

const event = id => {
  const found = A5_EXTERNAL_PRINCIPALS_20_23.find(row => row.id === id);
  assert.ok(found, 'missing '+id);
  return found;
};

test('A5 external principals/1 exact finite owner-side inventory is 19', () => {
  assert.deepEqual(A5_EXTERNAL_PRINCIPALS_20_23.map(row => row.id), EXPECTED);
  assert.equal(A5_EXTERNAL_PRINCIPAL_REQUIREMENTS.length, EXPECTED.length);
  assert.deepEqual(new Set(A5_EXTERNAL_PRINCIPAL_REQUIREMENTS.map(row => row.eventId)), new Set(EXPECTED));
  for (const id of EXPECTED) assert.ok(a5ExternalPrincipalRequirement(id));
});

test('A5 external principals/2 every scene has specific choices/outcomes and is explicitly staged external', () => {
  const generic = new Set(['A','B','C','D','Tomar la iniciativa','Esperar y reunir información','Proteger tu posición','Buscar una solución intermedia']);
  for (const row of A5_EXTERNAL_PRINCIPALS_20_23) {
    assert.ok(row.tags?.includes('a5_ready_external_blocker'), row.id);
    assert.ok(row.tags?.includes('owner_complete'), row.id);
    assert.ok(row.choices.length >= 3, row.id);
    assert.ok(row.outcomes.length >= row.choices.length, row.id);
    for (const choice of row.choices) {
      assert.ok(!generic.has(choice.id), row.id+': generic choice id');
      assert.ok(!generic.has(choice.label), row.id+': generic choice label');
      assert.ok(choice.label.length >= 8, row.id+': weak label');
      assert.ok(choice.outcomeIds.length >= 1, row.id+': no outcome');
    }
    for (const outcome of row.outcomes) {
      assert.ok(outcome.messages?.[0]?.length >= 20, row.id+': weak outcome copy');
    }
  }
});

test('A5 external principals/3 staged definitions never mutate employment, club, injury or match authority directly', () => {
  const forbiddenPrefixes = ['contract.','market.','world.sportMatchModel','world.national','body.acuteInjury','body.injury'];
  const forbiddenSets = new Set(['club','tier','professional.ownerClub','professional.registrationClub','professional.leagueTier']);
  for (const row of A5_EXTERNAL_PRINCIPALS_20_23) {
    const effects = [
      ...row.choices.flatMap(choice => [...(choice.immediateEffects ?? []), ...(choice.hiddenCosts ?? [])]),
      ...row.outcomes.flatMap(outcome => outcome.effects ?? [])
    ];
    for (const effect of effects) {
      if (effect.kind === 'flag') continue;
      assert.ok(!forbiddenPrefixes.some(prefix => String(effect.path).startsWith(prefix)), row.id+': '+effect.path);
      if (effect.kind === 'set') assert.ok(!forbiddenSets.has(effect.path), row.id+': '+effect.path);
    }
  }
});

test('A5 external principals/4 market authority is CareerOffer-based wherever a signable proposal is canonical', () => {
  for (const id of ['EVT_20_MKT_001','EVT_21_MKT_001','EVT_22_MKT_001','EVT_22_DDL_001']) {
    const row = event(id);
    assert.ok(row.gates.some(g => g.path === 'facts.pendingCareerOffer' && g.op === 'exists'), id);
    assert.ok(!row.gates.some(g => g.path === 'reputation.marketHeat'), id);
  }
  assert.ok(!event('EVT_20_JAN_001').gates.some(g => g.path === 'facts.pendingCareerOffer'), 'conditional interest must not masquerade as formal offer');
});

test('A5 external principals/5 national and medical scenes contain no proxy gates', () => {
  const nat = event('EVT_21_NAT_001');
  for (const path of ['professional.nationalStanding','professional.nationalCaps','professional.nationalHeat','flags.NATIONAL_TOURNAMENT_CYCLE']) {
    assert.ok(!nat.gates.some(g => g.path === path), path);
  }
  for (const id of ['EVT_20_MED_001','EVT_21_MED_001','EVT_22_MED_001']) {
    const row = event(id);
    assert.ok(!row.gates.some(g => ['body.risk','body.fatigue','body.injuryCount'].includes(g.path)), id);
  }
});

test('A5 external principals/6 agent choices fail closed unless A1 certifies a representative', () => {
  const state = createInitialState(52006);
  state.age = 20; state.phase = '20_23'; state.date = '2028-08-12';
  state.flags.AGENT_ACTIVE = true;
  state.flags.AGENT_CONTACT_HECTOR = true;
  let ids = eligibleChoices(state, event('EVT_20_BRUNO_001')).map(c => c.id);
  assert.ok(!ids.includes('AUTHORIZE_NOTIFY'));

  certifyActiveAgentInPlace(state,'NPC_AGT_01');
  ids = eligibleChoices(state, event('EVT_20_BRUNO_001')).map(c => c.id);
  assert.ok(ids.includes('AUTHORIZE_NOTIFY'));

  const agt = event('EVT_20_AGT_001');
  assert.ok(agt.gates.some(g => g.path === 'facts.activeAgentNpcId' && g.op === 'exists'));
});

test('A5 external principals/7 dynamic NPC provenance informs only resolved authority slots', () => {
  const state = createInitialState(52007);
  state.age = 20; state.phase = '20_23';
  const rule = A5_EXTERNAL_PRINCIPAL_KNOWLEDGE_RULES.find(r => r.eventId === 'EVT_20_AGT_001');
  assert.ok(rule);
  let ctx = captureNpcKnowledgeTargetContext(state);
  assert.deepEqual(resolveNpcKnowledgeTargets(rule,ctx),[]);

  certifyActiveAgentInPlace(state,'NPC_AGT_02');
  ctx = captureNpcKnowledgeTargetContext(state);
  assert.deepEqual(resolveNpcKnowledgeTargets(rule,ctx),['NPC_AGT_02']);

  const bruno = A5_EXTERNAL_PRINCIPAL_KNOWLEDGE_RULES.find(r => r.eventId === 'EVT_20_BRUNO_001' && r.choiceIds?.includes('ASK_DETAILS'));
  assert.ok(bruno);
  assert.deepEqual(resolveNpcKnowledgeTargets(bruno,ctx),['NPC_PLR_12']);
});

test('A5 external principals/8 every blocker documents exact owner/API and forbidden proxy class', () => {
  for (const row of A5_EXTERNAL_PRINCIPAL_REQUIREMENTS) {
    assert.ok(row.owner.length > 3,row.eventId);
    assert.ok(row.fact.length > 12,row.eventId);
    assert.ok(row.integrationApi.length > 5,row.eventId);
    assert.ok(row.forbiddenProxies.length >= 1,row.eventId);
    assert.ok(!row.integrationApi.includes('REAL_'),row.eventId);
  }
});
