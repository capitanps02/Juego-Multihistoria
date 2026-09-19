import test from 'node:test';
import assert from 'node:assert/strict';
import { EVENTS } from '../dist/content/events/index.js';
import { createInitialState } from '../dist/content/initial-state.js';
import { eligibleChoices } from '../dist/narrative/choice-eligibility.js';
import { eventGatesPass } from '../dist/narrative/event-gates.js';
import { resolveChoiceInPlace } from '../dist/narrative/resolver.js';
import { narrativeCausalFacts } from '../dist/simulation/club-contract-intent.js';
import { certifyActiveAgentInPlace } from '../dist/simulation/npc-authority.js';
import { recordOfficialMatchInPlace } from '../dist/simulation/match-model.js';
import { loadSave, serializeSave } from '../dist/save/save.js';
import { validateBuild } from '../dist/validation/build-validation.js';
import { CONTENT_MIGRATION_ROUTES, T51_AGE18_AUTHORITY_CONTENT_IDENTITY, T51_A5_POST_J_K_CONTENT_IDENTITY, findMigrationRoute } from '../dist/session/content-migration.js';

const IDS=['CEVT_18_PLAYOFF_01','EVT_20_BRIDGE_001','EVT_20_CCH_001','EVT_21_SOC_001','EVT_21_PRS_002'];
const RETIRED=['EVT_20_MATCH_001','EVT_21_CCH_001','EVT_22_LIFE_001'];
const byId=id=>EVENTS.find(event=>event.id===id);

function stateAt(seed,age,date){
  const state=createInitialState(seed);
  state.age=age;
  state.phase=age<20?'18_20':'20_23';
  state.date=date;
  if(age>=20) state.professional.initializedAt20=true;
  return state;
}
function addSeed(state,id,originEvent,payload){
  state.seeds.push({id,state:'dormant',intensity:60,originEvent,originSeason:state.season,npcRefs:[],payload:structuredClone(payload),lastTouchedDate:state.date});
  state.flags['HAS_'+id]=true;
}

test('A5 K/0 preserves the canonical 388-event inventory while retiring technical rows',()=>{
  assert.equal(EVENTS.length,388);
  const phase20=EVENTS.filter(event=>event.phase==='20_23');
  assert.equal(phase20.filter(event=>event.family!=='conditional').length,33);
  assert.equal(phase20.filter(event=>event.family==='conditional').length,18);
  for(const id of RETIRED) assert.equal(EVENTS.some(event=>event.id===id),false,id);
  assert.deepEqual(validateBuild(EVENTS).filter(issue=>issue.level==='error'),[]);
});

test('A5 K/0b retired technical IDs stay historical-only across the exact J-to-K edge',()=>{
  const route=findMigrationRoute(T51_AGE18_AUTHORITY_CONTENT_IDENTITY,T51_A5_POST_J_K_CONTENT_IDENTITY,CONTENT_MIGRATION_ROUTES);
  assert.ok(route,'missing exact J->K route');
  assert.deepEqual(route.schedulerMappings.map(row=>row.legacyEventId).sort(),['CEVT_18_PLAYOFF_01','EVT_20_CCH_001'].sort());
  for(const id of RETIRED){
    assert.equal(route.schedulerMappings.some(row=>row.legacyEventId===id),false,'retired technical id must not be aliased: '+id);
    assert.equal(EVENTS.some(event=>event.id===id),false,'retired technical id re-entered active scheduler: '+id);
  }
});

test('A5 K/1 active registry contains exactly one copy of each serialized post-J scene',()=>{
  for(const id of IDS){
    const rows=EVENTS.filter(event=>event.id===id);
    assert.equal(rows.length,1,id);
    assert.ok(rows[0].tags?.includes('a5_post_j'),id);
  }
});

test('A5 K/2 active-agent and institutional choices fail closed independently',()=>{
  const scene=byId('EVT_20_CCH_001');
  const state=stateAt(52002,20,'2028-08-20');
  let ids=eligibleChoices(state,scene).map(choice=>choice.id);
  assert.ok(ids.includes('ASK_DIRECTOR'));
  assert.ok(!ids.includes('AGENT_SOUND'));
  certifyActiveAgentInPlace(state,'NPC_AGT_01');
  ids=eligibleChoices(state,scene).map(choice=>choice.id);
  assert.ok(ids.includes('ASK_DIRECTOR'));
  assert.ok(ids.includes('AGENT_SOUND'));
  state.club='TRANSFER_FC';
  state.professional.registrationClub='TRANSFER_FC';
  ids=eligibleChoices(state,scene).map(choice=>choice.id);
  assert.ok(!ids.includes('ASK_DIRECTOR'));
  assert.ok(ids.includes('AGENT_SOUND'));
});

test('A5 K/3 Dani and Clara gates consume live seed memory, never legacy contact flags',()=>{
  const dani=byId('EVT_21_SOC_001');
  const state=stateAt(52003,21,'2029-10-12');
  state.professional.agentControl=60;
  addSeed(state,'SEED_DANI_NORMALITY','EVT_18_SOC_001',{pattern:'normality'});
  state.flags.AGENT_ACTIVE=true;
  assert.equal(eventGatesPass(state,dani),false);
  certifyActiveAgentInPlace(state,'NPC_AGT_01');
  assert.equal(eventGatesPass(state,dani),true);
  assert.equal(narrativeCausalFacts(state).daniNormalityPattern,'normality');

  const clara=stateAt(52004,21,'2029-11-03');
  addSeed(clara,'SEED_CLARA_CHANNEL','EVT_18_PRS_002',{mode:'context'});
  assert.equal(eventGatesPass(clara,byId('EVT_21_PRS_002')),true);
  assert.equal(narrativeCausalFacts(clara).claraChannelMode,'context');
});

test('A5 K/4 playoff decision persists exact exit-style payload across save/load',()=>{
  const scene=byId('CEVT_18_PLAYOFF_01');
  const state=stateAt(52005,18,'2027-05-15');
  state.flags.UDV_PLAYOFF=true;
  resolveChoiceInPlace(state,scene,'COMMIT');
  assert.equal(narrativeCausalFacts(state).exitStylePlayoff,'commit');
  const restored=loadSave(serializeSave(state));
  assert.equal(narrativeCausalFacts(restored).exitStylePlayoff,'commit');
});

test('A5 K/5 WAIT_THREE_MATCHES counts three subsequent official same-club fixtures',()=>{
  const scene=byId('EVT_20_CCH_001');
  let state=stateAt(52006,20,'2028-08-01');
  state.runtime.day=1;
  resolveChoiceInPlace(state,scene,'WAIT_THREE_MATCHES');
  assert.equal(narrativeCausalFacts(state).coachPromiseWait?.officialMatchesElapsed,0);
  for(const [index,date] of ['2028-08-08','2028-08-15','2028-08-22'].entries()){
    state.date=date;
    state.runtime.day=7*(index+1);
    state.runtime.seasonDay=7*(index+1);
    assert.ok(recordOfficialMatchInPlace(state,{appeared:false,debutOccurred:false,injuryUnavailable:false}));
    const fact=narrativeCausalFacts(state).coachPromiseWait;
    assert.equal(fact?.officialMatchesElapsed,index+1);
    assert.equal(fact?.complete,index===2);
    if(index===1) state=loadSave(serializeSave(state));
  }
});
