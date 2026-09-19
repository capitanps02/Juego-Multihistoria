import test from 'node:test';
import assert from 'node:assert/strict';

import { createInitialState } from '../dist/content/initial-state.js';
import { loadSave, serializeSave } from '../dist/save/save.js';
import { narrativeCausalFacts } from '../dist/simulation/club-contract-intent.js';
import { certifyActiveAgentInPlace, resolveActiveAgent } from '../dist/simulation/npc-authority.js';
import {
  certifyRepresentationInPlace,
  clearRepresentationInPlace,
  representationHistory,
  resolveCurrentRepresentation,
  updateRepresentationTermsInPlace
} from '../dist/simulation/representation-authority.js';

const TERMS_A={
  commissionPct:7.5,
  services:['market'],
  contactPolicy:'inform_first'
};
const TERMS_B={
  commissionPct:10,
  services:['image','market','media'],
  contactPolicy:'broad_delegation'
};

test('representation/1 contact flags and identity-only certification never fabricate contract terms',()=>{
  const state=createInitialState(624201);
  state.flags.AGENT_CONTACT_HECTOR=true;
  state.flags.AGENT_ACTIVE=true;
  state.professional.agentControl=100;
  assert.equal(resolveCurrentRepresentation(state),null);

  certifyActiveAgentInPlace(state,'NPC_AGT_01');
  assert.equal(resolveActiveAgent(state),'NPC_AGT_01');
  assert.equal(resolveCurrentRepresentation(state),null);
  assert.equal(narrativeCausalFacts(state).representation,null);
});

test('representation/2 explicit engagement exposes exact detached terms with zero RNG reads',()=>{
  const state=createInitialState(624202);
  const rng=structuredClone(state.rngState);
  certifyRepresentationInPlace(state,'NPC_AGT_01',TERMS_A,'TEST_HIRE_A');

  assert.equal(resolveActiveAgent(state),'NPC_AGT_01');
  const current=resolveCurrentRepresentation(state);
  assert.ok(current);
  assert.deepEqual(current,{
    ordinal:1,
    agentNpcId:'NPC_AGT_01',
    effectiveAt:state.date,
    endedAt:null,
    endedBy:null,
    commissionPct:7.5,
    services:['market'],
    contactPolicy:'inform_first',
    source:'TEST_HIRE_A'
  });
  assert.deepEqual(state.rngState,rng);

  current.services.push('media');
  assert.deepEqual(resolveCurrentRepresentation(state).services,['market'],'read must be detached');

  const fact=narrativeCausalFacts(state).representation;
  assert.ok(fact);
  assert.equal(fact.agentNpcId,'NPC_AGT_01');
  assert.equal(fact.commissionPct,7.5);
  assert.deepEqual(state.rngState,rng);
});

test('representation/3 term revision preserves the prior agreement and keeps the same active agent',()=>{
  const state=createInitialState(624203);
  certifyRepresentationInPlace(state,'NPC_AGT_01',TERMS_A,'TEST_HIRE_A');
  state.date='2027-09-10';
  updateRepresentationTermsInPlace(state,TERMS_B,'EVT_20_AGT_001/BROAD_CONTROL');

  assert.equal(resolveActiveAgent(state),'NPC_AGT_01');
  const current=resolveCurrentRepresentation(state);
  assert.equal(current.ordinal,2);
  assert.equal(current.contactPolicy,'broad_delegation');
  assert.deepEqual(current.services,['image','market','media']);

  const history=representationHistory(state);
  assert.equal(history.length,1);
  assert.equal(history[0].ordinal,1);
  assert.equal(history[0].endedAt,'2027-09-10');
  assert.equal(history[0].endedBy,'EVT_20_AGT_001/BROAD_CONTROL');
});

test('representation/4 explicit switch closes old terms and certifies exactly one new representative',()=>{
  const state=createInitialState(624204);
  certifyRepresentationInPlace(state,'NPC_AGT_01',TERMS_A,'HIRE_A');
  state.date='2028-01-05';
  certifyRepresentationInPlace(state,'NPC_AGT_02',TERMS_B,'SWITCH_TO_B');

  assert.equal(resolveActiveAgent(state),'NPC_AGT_02');
  assert.equal(resolveCurrentRepresentation(state).agentNpcId,'NPC_AGT_02');
  const history=representationHistory(state);
  assert.equal(history.length,1);
  assert.equal(history[0].agentNpcId,'NPC_AGT_01');
  assert.equal(history[0].endedBy,'SWITCH_TO_B');
});

test('representation/5 explicit termination preserves closed history and clears current authority',()=>{
  const state=createInitialState(624205);
  certifyRepresentationInPlace(state,'NPC_AGT_02',TERMS_B,'HIRE_B');
  state.date='2028-02-01';
  clearRepresentationInPlace(state,'TERMINATE_B');

  assert.equal(resolveActiveAgent(state),null);
  assert.equal(resolveCurrentRepresentation(state),null);
  const history=representationHistory(state);
  assert.equal(history.length,1);
  assert.equal(history[0].endedAt,'2028-02-01');
  assert.equal(history[0].endedBy,'TERMINATE_B');
});

test('representation/6 exact authority survives save/load without schema migration',()=>{
  const state=createInitialState(624206);
  certifyRepresentationInPlace(state,'NPC_AGT_01',TERMS_B,'HIRE_A');
  const restored=loadSave(serializeSave(state));

  assert.deepEqual(resolveCurrentRepresentation(restored),resolveCurrentRepresentation(state));
  assert.deepEqual(representationHistory(restored),representationHistory(state));
  assert.deepEqual(restored.world.representationAuthority,state.world.representationAuthority);
});

test('representation/7 malformed optional store fails closed and does not become narrative truth',()=>{
  const state=createInitialState(624207);
  certifyActiveAgentInPlace(state,'NPC_AGT_01');
  state.world.representationAuthority={version:1,sequence:1,current:{agentNpcId:'NPC_AGT_01'},history:[]};

  const before=structuredClone(state);
  assert.equal(resolveCurrentRepresentation(state),null);
  assert.deepEqual(representationHistory(state),[]);
  assert.equal(narrativeCausalFacts(state).representation,null);
  assert.deepEqual(state,before,'malformed reads must be side-effect free');
});

test('representation/8 invalid terms or malformed store fail atomically',()=>{
  const state=createInitialState(624208);
  const before=structuredClone(state);
  assert.throws(()=>certifyRepresentationInPlace(state,'NPC_AGT_01',{
    commissionPct:99,
    services:['market'],
    contactPolicy:'inform_first'
  },'BAD_TERMS'));
  assert.deepEqual(state,before);

  const corrupted=createInitialState(624209);
  corrupted.world.representationAuthority={version:1,sequence:-1,current:null,history:[]};
  const corruptedBefore=structuredClone(corrupted);
  assert.throws(()=>certifyRepresentationInPlace(corrupted,'NPC_AGT_01',TERMS_A,'HIRE'));
  assert.deepEqual(corrupted,corruptedBefore,'store corruption must not certify agent before throwing');
});

test('representation/9 direct active-agent switch invalidates stale agreement until terms are explicitly recertified',()=>{
  const state=createInitialState(624210);
  certifyRepresentationInPlace(state,'NPC_AGT_01',TERMS_A,'HIRE_A');
  certifyActiveAgentInPlace(state,'NPC_AGT_02');

  assert.equal(resolveActiveAgent(state),'NPC_AGT_02');
  assert.equal(resolveCurrentRepresentation(state),null,'stale terms for another agent must fail closed');
  assert.equal(narrativeCausalFacts(state).representation,null);
});
