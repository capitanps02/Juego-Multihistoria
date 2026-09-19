import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState } from '../dist/content/initial-state.js';
import {
  certifyRepresentationInPlace,
  representationHistory,
  resolveCurrentRepresentation
} from '../dist/simulation/representation-authority.js';
import { certifyActiveAgentInPlace } from '../dist/simulation/npc-authority.js';
import {
  applyRepresentationBridgeChoiceInPlace,
  representationBridgeSpec,
  representationTermsForChoice
} from '../dist/narrative/representation-bridge.js';

function event(spec){
  return {
    id:'EVT_20_AGT_001',
    ageWindow:[20,20],
    phase:'20_23',
    family:'agent',
    text:{title:'x',body:'x',visible:[],uncertain:[]},
    choices:[
      {id:'BROAD_CONTROL',label:'broad',outcomeIds:['O']},
      {id:'INFORM_FIRST',label:'inform',outcomeIds:['O']},
      {id:'SPLIT_IMAGE',label:'split',outcomeIds:['O']},
      {id:'NO_CENTRALIZE',label:'no',outcomeIds:['O']}
    ],
    outcomes:[{id:'O',baseWeight:1,effects:[],messages:[]}],
    gates:[],weight:1,cooldown:0,
    representationBridge:spec
  };
}
const SPEC={
  choices:{
    BROAD_CONTROL:{contactPolicy:'broad_delegation',services:['market','media','image']},
    INFORM_FIRST:{contactPolicy:'inform_first',services:'preserve'},
    SPLIT_IMAGE:{contactPolicy:'inform_first',services:['market']},
    NO_CENTRALIZE:{contactPolicy:'inform_first',services:'preserve'}
  }
};

function represented(seed=4200){
  const s=createInitialState(seed);
  const agent=s.npcs.find(n=>n.id==='NPC_AGT_01');
  assert.ok(agent);
  agent.careerState='active';
  certifyRepresentationInPlace(s,'NPC_AGT_01',{
    commissionPct:8,
    services:['market','media'],
    contactPolicy:'inform_first'
  },'test:initial');
  return s;
}

test('representation bridge/1 metadata maps every choice exactly once',()=>{
  const e=event(SPEC);
  assert.deepEqual(Object.keys(representationBridgeSpec(e).choices).sort(),e.choices.map(c=>c.id).sort());
  assert.equal(representationTermsForChoice(e,'BROAD_CONTROL').contactPolicy,'broad_delegation');
  const bad=event({choices:{BROAD_CONTROL:{contactPolicy:'broad_delegation',services:['market']}}});
  assert.throws(()=>representationBridgeSpec(bad));
});

test('representation bridge/2 identity-only agent state fails closed',()=>{
  const s=createInitialState(4201);
  const agent=s.npcs.find(n=>n.id==='NPC_AGT_01'); assert.ok(agent); agent.careerState='active';
  certifyActiveAgentInPlace(s,'NPC_AGT_01');
  assert.equal(resolveCurrentRepresentation(s),null);
  assert.throws(()=>applyRepresentationBridgeChoiceInPlace(s,event(SPEC),'BROAD_CONTROL','O'));
});

test('representation bridge/3 broad control changes policy/services but preserves commission and agent',()=>{
  const s=represented(4202);
  applyRepresentationBridgeChoiceInPlace(s,event(SPEC),'BROAD_CONTROL','O');
  const current=resolveCurrentRepresentation(s);
  assert.equal(current.agentNpcId,'NPC_AGT_01');
  assert.equal(current.commissionPct,8);
  assert.deepEqual(current.services,['image','market','media']);
  assert.equal(current.contactPolicy,'broad_delegation');
  assert.equal(current.source,'narrative:EVT_20_AGT_001:BROAD_CONTROL:O');
  const history=representationHistory(s);
  assert.equal(history.length,1);
  assert.equal(history[0].source,'test:initial');
  assert.equal(history[0].endedBy,'narrative:EVT_20_AGT_001:BROAD_CONTROL:O');
});

test('representation bridge/4 inform-first preserves current service set',()=>{
  const s=represented(4203);
  applyRepresentationBridgeChoiceInPlace(s,event(SPEC),'INFORM_FIRST','O');
  const current=resolveCurrentRepresentation(s);
  assert.deepEqual(current.services,['market','media']);
  assert.equal(current.contactPolicy,'inform_first');
  assert.equal(current.commissionPct,8);
});

test('representation bridge/5 split image narrows agent services to market only',()=>{
  const s=represented(4204);
  applyRepresentationBridgeChoiceInPlace(s,event(SPEC),'SPLIT_IMAGE','O');
  const current=resolveCurrentRepresentation(s);
  assert.deepEqual(current.services,['market']);
  assert.equal(current.contactPolicy,'inform_first');
});

test('representation bridge/6 no bridge metadata is a strict no-op',()=>{
  const s=represented(4205);
  const before=structuredClone(s);
  const e=event(undefined);
  assert.equal(representationTermsForChoice(e,'BROAD_CONTROL'),undefined);
  applyRepresentationBridgeChoiceInPlace(s,e,'BROAD_CONTROL','O');
  assert.deepEqual(s,before);
});
