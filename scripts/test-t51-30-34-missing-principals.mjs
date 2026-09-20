import test from 'node:test';
import assert from 'node:assert/strict';
import { EVENTS } from '../dist/content/events/index.js';
import { createInitialState } from '../dist/content/initial-state.js';
import { eventGatesPass } from '../dist/narrative/event-gates.js';
import { certifyPlayerClubLeadershipInPlace } from '../dist/simulation/player-leadership-authority.js';
import { offerBridgeEligible, offerDispositionForChoice } from '../dist/narrative/offer-bridge.js';
import { proposeCareerChange } from '../dist/simulation/offers.js';
import { PREPARED_SHIFTED_CANON_30_34_A } from '../dist/content/events/30_34/canonical-shifted-prepared-a.js';
import { PREPARED_SHIFTED_CANON_30_34_B } from '../dist/content/events/30_34/canonical-shifted-prepared-b.js';
import { PREPARED_SHIFTED_CANON_30_34_C } from '../dist/content/events/30_34/canonical-shifted-prepared-c.js';
import { BLOCKED_CANONICAL_ADDITIONS_30_34 } from '../dist/content/events/30_34/canonical-missing-principals.js';
import { SEED_CATALOG_30_34 } from '../dist/catalog/seeds.js';

const event = EVENTS.find(row => row.id === 'EVT_30_CCH_001');

test('EVT_30_CCH_001 is an active canonical addition with the four master choices', () => {
  assert.ok(event);
  assert.equal(event.text.title, 'Te enteras por la pizarra');
  assert.deepEqual(event.choices.map(choice => choice.id), ['A','B','C','D']);
  assert.deepEqual(event.choices.map(choice => choice.label), [
    'Hablar con el entrenador después del partido',
    'Preguntar antes de salir al calentamiento',
    'No decir nada y responder en el campo cuando toque',
    'Pedir a un líder del vestuario que aclare el criterio general'
  ]);
  assert.equal(event.canonStatus, 'technical_adaptation');
});

test('EVT_30_CCH_001 uses only current-club main-captain authority for its currently enabled trigger route', () => {
  const state=createInitialState(300301);
  state.age=30;
  state.phase='30_34';
  state.professional.initializedAt30=true;
  state.professional.statusInertia=100;
  assert.equal(eventGatesPass(state,event), false, 'status inertia alone has no canonical threshold and must not be guessed');

  certifyPlayerClubLeadershipInPlace(state,'secondary_captain','TEST','B');
  assert.equal(eventGatesPass(state,event), false);
  certifyPlayerClubLeadershipInPlace(state,'captain','TEST','A');
  assert.equal(eventGatesPass(state,event), true);
});

test('EVT_30_CCH_001 writes SEED_ROLE_COMMUNICATION for every canonical response and invents no coach NPC identity', () => {
  assert.deepEqual(event.seedsWrite, ['SEED_ROLE_COMMUNICATION']);
  assert.deepEqual(event.npcRefs ?? [], []);
  for (const choice of event.choices) {
    const outcomes=event.outcomes.filter(outcome=>choice.outcomeIds.includes(outcome.id));
    assert.equal(outcomes.length,2);
    for (const outcome of outcomes) {
      const transition=(outcome.seedTransitions ?? []).find(row=>row.seedId==='SEED_ROLE_COMMUNICATION');
      assert.ok(transition, `${choice.id}: missing role-communication memory`);
      assert.equal(transition.action,'create');
      assert.equal(transition.payload.choice,choice.id);
    }
  }
});


test('shifted canonical bridge scenes replace their legacy shells in the active catalog', () => {
  const bridge=EVENTS.find(row=>row.id==='EVT_30_BRIDGE_001');
  const finish=EVENTS.find(row=>row.id==='EVT_33_FIN_001');
  assert.ok(bridge);
  assert.ok(finish);
  assert.equal(EVENTS.some(row=>row.id==='EVT_30_IDN_001'),false);
  assert.equal(EVENTS.some(row=>row.id==='EVT_33_END_001'),false);
  assert.deepEqual(bridge.choices.map(choice=>choice.id),['A','B','C','D']);
  assert.deepEqual(bridge.seedsRead,['SEED_AGE30_PRIORITY']);
  assert.deepEqual(bridge.seedsWrite,['SEED_VETERAN_LABEL']);
  assert.deepEqual(finish.choices.map(choice=>choice.id),['A','B','C','D','E','F']);
  assert.deepEqual(finish.seedsWrite,['SEED_AGE34_PRIORITY','SEED_RETIREMENT_DISTANCE_PROFILE']);
});

test('EVT_33_FIN_001 retirement reflection stays non-terminal', () => {
  const finish=EVENTS.find(row=>row.id==='EVT_33_FIN_001');
  const choice=finish.choices.find(row=>row.id==='F');
  const outcomes=finish.outcomes.filter(outcome=>choice.outcomeIds.includes(outcome.id));
  assert.equal(outcomes.length,2);
  for(const outcome of outcomes){
    assert.equal(JSON.stringify(outcome.effects ?? []).includes('EARLY_RETIRED_30_34'),false);
    assert.equal((outcome.seedTransitions ?? []).some(row=>row.seedId==='SEED_RETIREMENT_DISTANCE_PROFILE'),true);
  }
});


test('EVT_30_JAN_001 requires a live eligible formal big-club transfer/loan offer', () => {
  const jan=EVENTS.find(row=>row.id==='EVT_30_JAN_001');
  assert.ok(jan);
  assert.deepEqual(jan.choices.map(choice=>choice.id),['A','B','C','D']);
  assert.deepEqual(jan.seedsWrite,['SEED_SPECIALIST_BIGCLUB']);
  assert.deepEqual(['A','B','C','D'].map(id=>offerDispositionForChoice(jan,id)),['accept','reject','counter','counter']);

  const state=createInitialState(300401);
  state.age=30; state.phase='30_34'; state.date='2038-01-08'; state.professional.initializedAt30=true;
  proposeCareerChange(state,'Propuesta de mercado',draft=>{
    draft.club='Gigante FC'; draft.tier=1;
    draft.professional.ownerClub='Gigante FC';
    draft.professional.registrationClub='Gigante FC';
    draft.professional.leagueTier=1;
    draft.professional.clubPrestigeTier=4;
    draft.professional.clubPrestigeScore=90;
    draft.flags.BIG_CLUB=true;
    draft.contract.salaryMonthly=Number(draft.contract.salaryMonthly)+5000;
  });
  assert.ok(state.market?.pending);
  assert.equal(offerBridgeEligible(state,jan),true);

  state.contract.salaryMonthly=Number(state.contract.salaryMonthly)+1;
  assert.equal(offerBridgeEligible(state,jan),false,'stale formal offer must fail closed');
});


test('EVT_32_IMPACT_001 replaces the generic legacy shell and only uses the certified reinvention route', () => {
  const impact=EVENTS.find(row=>row.id==='EVT_32_IMPACT_001');
  assert.ok(impact);
  assert.equal(EVENTS.some(row=>row.id==='EVT_32_TACT_001'),false);
  assert.deepEqual(impact.choices.map(choice=>choice.id),['A','B','C','D']);
  assert.deepEqual(impact.seedsRead,['SEED_ROLE_REINVENTION_32']);
  assert.deepEqual(impact.seedsWrite,['SEED_LOW_STATS_HIGH_IMPACT']);

  const state=createInitialState(320401);
  state.age=32; state.phase='30_34'; state.date='2040-09-04'; state.professional.initializedAt30=true;
  state.flags.ROLE_REINVENTED_30=false;
  assert.equal(eventGatesPass(state,impact),false);
  state.flags.ROLE_REINVENTED_30=true;
  assert.equal(eventGatesPass(state,impact),true);
});


test('EVT_30_STATUS_001 uses exact young-successor memory and replaces the legacy dorsal shell', () => {
  const dorsal=EVENTS.find(row=>row.id==='EVT_30_STATUS_001');
  assert.ok(dorsal);
  assert.equal(EVENTS.some(row=>row.id==='EVT_30_TEAM_001'),false);
  assert.deepEqual(dorsal.choices.map(choice=>choice.id),['A','B','C','D']);
  assert.deepEqual(dorsal.seedsRead,['SEED_YOUNG_SUCCESSOR']);
  assert.deepEqual(dorsal.seedsWrite,['SEED_DORSAL_SUCCESSION']);

  const state=createInitialState(300501);
  state.age=30; state.phase='30_34'; state.professional.initializedAt30=true;
  state.flags.HAS_SEED_YOUNG_SUCCESSOR=false;
  assert.equal(eventGatesPass(state,dorsal),false);
  state.flags.HAS_SEED_YOUNG_SUCCESSOR=true;
  assert.equal(eventGatesPass(state,dorsal),true);
  for(const choice of dorsal.choices){
    const outcomes=dorsal.outcomes.filter(outcome=>choice.outcomeIds.includes(outcome.id));
    assert.equal(outcomes.length,2);
    assert.equal(outcomes.every(outcome=>(outcome.seedTransitions??[]).some(t=>t.seedId==='SEED_DORSAL_SUCCESSION'&&t.action==='create')),true);
    assert.equal(outcomes.some(outcome=>(outcome.seedTransitions??[]).some(t=>t.seedId==='SEED_SUCCESSOR_PEAK')),false);
  }
});


test('prepared shifted batch A is owner-complete but remains outside active EVENTS until external gates exist', () => {
  const expected = new Map([
    ['EVT_30_EUR_001', ['SEED_BIG_GAME_ROTATION_30','SEED_BIG_GAME_BENCH']],
    ['EVT_30_RECORD_001', ['SEED_MILESTONE_CHASE_500','SEED_RECORD_CHASE']],
    ['EVT_30_PAIN_001', ['SEED_PAIN_WITHOUT_SCAN','SEED_MEDICAL_AUTHORITY']],
    ['EVT_30_NANO_001', ['SEED_OLD_NETWORK_FAVOR','SEED_NANO_SHADOW']],
    ['EVT_31_FAM_001', ['SEED_RELOCATION_LIMIT','SEED_FAMILY_ANCHOR']]
  ]);
  assert.equal(PREPARED_SHIFTED_CANON_30_34_A.length,5);
  for(const prepared of PREPARED_SHIFTED_CANON_30_34_A){
    assert.equal(expected.has(prepared.id),true,prepared.id);
    assert.equal(EVENTS.some(event=>event.id===prepared.id),false,`${prepared.id}: external gate is not integrated yet`);
    assert.deepEqual(prepared.choices.map(choice=>choice.id),['A','B','C','D']);
    const [write,read]=expected.get(prepared.id);
    assert.deepEqual(prepared.seedsWrite,[write]);
    assert.ok((prepared.seedsRead??[]).includes(read));
    assert.ok((prepared.tags??[]).includes('t51_shifted_prepared'));
  }
});


test('prepared shifted batch B stays owner-complete while the rich-offer scene activates on exact authority', () => {
  const expected = new Map([
    ['EVT_31_TEAM_001', ['SEED_FORMAL_MENTOR','SEED_MENTOR_ADVICE']],
    ['EVT_31_SQUAD_001', ['SEED_SQUAD_YOUTH_WAVE',null]],
    ['EVT_31_BIZ_001', ['SEED_BUSINESS_REPUTATION_SHOCK','SEED_WEALTH_STRUCTURE']],
    ['EVT_32_RICH_001', ['SEED_LATE_RICH_OFFER','SEED_WEALTHY_PEAK_EXIT']],
    ['EVT_32_ELITE_001', ['SEED_LATE_CONTENDER_BENCH','SEED_SPECIALIST_BIGCLUB']]
  ]);
  assert.equal(PREPARED_SHIFTED_CANON_30_34_B.length,5);
  for(const prepared of PREPARED_SHIFTED_CANON_30_34_B){
    assert.equal(expected.has(prepared.id),true,prepared.id);
    const shouldBeActive=prepared.id==='EVT_31_TEAM_001'||prepared.id==='EVT_32_RICH_001';
    assert.equal(EVENTS.some(event=>event.id===prepared.id),shouldBeActive,`${prepared.id}: authority activation mismatch`);
    assert.deepEqual(prepared.choices.map(choice=>choice.id),['A','B','C','D']);
    const [write,read]=expected.get(prepared.id);
    assert.deepEqual(prepared.seedsWrite,[write]);
    if(read) assert.ok((prepared.seedsRead??[]).includes(read));
    assert.ok((prepared.tags??[]).includes('t51_shifted_prepared'));
  }
  const youth=PREPARED_SHIFTED_CANON_30_34_B.find(event=>event.id==='EVT_31_SQUAD_001');
  assert.equal(JSON.stringify(youth).includes('SEED_SUCCESSION_DECISION'),true,'missing canonical seed is documented only as a tag, not a transition');
  assert.equal(youth.outcomes.some(outcome=>(outcome.seedTransitions??[]).some(t=>t.seedId==='SEED_SUCCESSION_DECISION')),false);
});

test('prepared offer-based shifted scenes are already wired to shared offer dispositions', () => {
  const family=PREPARED_SHIFTED_CANON_30_34_A.find(event=>event.id==='EVT_31_FAM_001');
  const rich=PREPARED_SHIFTED_CANON_30_34_B.find(event=>event.id==='EVT_32_RICH_001');
  const elite=PREPARED_SHIFTED_CANON_30_34_B.find(event=>event.id==='EVT_32_ELITE_001');
  assert.deepEqual(['A','B','C','D'].map(id=>offerDispositionForChoice(family,id)),['reject','accept','accept','counter']);
  assert.deepEqual(['A','B','C','D'].map(id=>offerDispositionForChoice(rich,id)),['accept','reject','counter','defer']);
  assert.deepEqual(['A','B','C','D'].map(id=>offerDispositionForChoice(elite,id)),['accept','reject','counter','defer']);
});


test('prepared shifted batch C completes owner-side content for the remaining four shifted principals', () => {
  const expected = new Map([
    ['EVT_32_SUCCESSOR_001','SEED_REPLACEMENT_BREAKOUT'],
    ['EVT_32_LOAD_001','SEED_TRAVEL_LOAD'],
    ['EVT_32_BOSMAN_001','SEED_BOSMAN_33'],
    ['EVT_33_RECORD_001','SEED_RECORD_VS_BODY']
  ]);
  assert.equal(PREPARED_SHIFTED_CANON_30_34_C.length,4);
  for(const prepared of PREPARED_SHIFTED_CANON_30_34_C){
    assert.equal(expected.has(prepared.id),true,prepared.id);
    assert.equal(EVENTS.some(event=>event.id===prepared.id),false,`${prepared.id}: external authority gate is not ready`);
    assert.deepEqual(prepared.choices.map(choice=>choice.id),['A','B','C','D']);
    assert.deepEqual(prepared.seedsWrite,[expected.get(prepared.id)]);
    assert.ok((prepared.tags??[]).includes('t51_shifted_prepared'));
  }
  const successor=PREPARED_SHIFTED_CANON_30_34_C.find(event=>event.id==='EVT_32_SUCCESSOR_001');
  const bosman=PREPARED_SHIFTED_CANON_30_34_C.find(event=>event.id==='EVT_32_BOSMAN_001');
  assert.equal(successor.outcomes.some(outcome=>(outcome.seedTransitions??[]).some(t=>t.seedId==='SEED_SUCCESSION_DECISION')),false);
  assert.equal(bosman.outcomes.some(outcome=>(outcome.seedTransitions??[]).some(t=>t.seedId==='SEED_PARALLEL_NEGOTIATION')),false);
});


test('all 52 owner seeds have a concrete writer in active or owner-complete prepared 30-34 content', () => {
  const sources=[
    ...EVENTS.filter(event=>event.phase==='30_34'),
    ...BLOCKED_CANONICAL_ADDITIONS_30_34,
    ...PREPARED_SHIFTED_CANON_30_34_A,
    ...PREPARED_SHIFTED_CANON_30_34_B,
    ...PREPARED_SHIFTED_CANON_30_34_C
  ];
  const producing=new Set(['create','activate','intensify','transform']);
  const writers=new Map(SEED_CATALOG_30_34.map(seed=>[seed.id,new Set()]));
  for(const event of sources){
    for(const outcome of event.outcomes??[]){
      for(const transition of outcome.seedTransitions??[]){
        if(producing.has(transition.action) && writers.has(transition.seedId)){
          writers.get(transition.seedId).add(event.id);
        }
      }
    }
  }
  assert.equal(SEED_CATALOG_30_34.length,52);
  const missing=[...writers.entries()].filter(([,eventIds])=>eventIds.size===0).map(([seedId])=>seedId);
  assert.deepEqual(missing,[]);
});

test('prepared seed-trigger prerequisites are explicit and do not widen their scenes', () => {
  const nano=PREPARED_SHIFTED_CANON_30_34_A.find(event=>event.id==='EVT_30_NANO_001');
  const family=PREPARED_SHIFTED_CANON_30_34_A.find(event=>event.id==='EVT_31_FAM_001');
  const load=PREPARED_SHIFTED_CANON_30_34_C.find(event=>event.id==='EVT_32_LOAD_001');
  assert.deepEqual(nano.gates,[{path:'flags.HAS_SEED_NANO_SHADOW',op:'eq',value:true}]);
  assert.deepEqual(family.gates,[{path:'flags.HAS_SEED_FAMILY_ANCHOR',op:'eq',value:true}]);
  assert.deepEqual(load.gates,[{path:'flags.HAS_SEED_MATCH_SELECTIVITY',op:'eq',value:true}]);
  assert.equal(EVENTS.some(event=>['EVT_30_NANO_001','EVT_31_FAM_001','EVT_32_LOAD_001'].includes(event.id)),false);
});


test('all 18 shifted principals are either active canonical scenes or owner-complete prepared definitions', () => {
  const shiftedIds=[
    'EVT_30_BRIDGE_001','EVT_30_STATUS_001','EVT_30_EUR_001','EVT_30_RECORD_001','EVT_30_PAIN_001','EVT_30_NANO_001',
    'EVT_31_FAM_001','EVT_31_TEAM_001','EVT_31_SQUAD_001','EVT_31_BIZ_001',
    'EVT_32_RICH_001','EVT_32_ELITE_001','EVT_32_IMPACT_001','EVT_32_SUCCESSOR_001','EVT_32_LOAD_001','EVT_32_BOSMAN_001',
    'EVT_33_RECORD_001','EVT_33_FIN_001'
  ];
  const active=new Set(EVENTS.map(event=>event.id));
  const prepared=new Set([
    ...PREPARED_SHIFTED_CANON_30_34_A,
    ...PREPARED_SHIFTED_CANON_30_34_B,
    ...PREPARED_SHIFTED_CANON_30_34_C
  ].map(event=>event.id));
  assert.equal(shiftedIds.length,18);
  assert.equal(new Set(shiftedIds).size,18);
  assert.deepEqual(
    shiftedIds.filter(id=>!active.has(id)&&!prepared.has(id)),
    []
  );
  assert.equal(shiftedIds.filter(id=>active.has(id)).length,6);
  assert.equal(shiftedIds.filter(id=>prepared.has(id)&&!active.has(id)).length,12);
});
