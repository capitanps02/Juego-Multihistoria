import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState } from '../dist/content/initial-state.js';
import { eventGatesPass } from '../dist/narrative/event-gates.js';
import { resolveChoiceInPlace } from '../dist/narrative/resolver.js';
import {
  applyRepresentationBridgeChoiceInPlace,
  representationBridgeSpec
} from '../dist/narrative/representation-bridge.js';
import {
  certifyRepresentationInPlace,
  resolveCurrentRepresentation
} from '../dist/simulation/representation-authority.js';
import { certifyActiveAgentInPlace } from '../dist/simulation/npc-authority.js';
import { A5_REPRESENTATION_READY_EVENTS } from '../dist/content/events/20_23/a5-agent-ready-external.js';

function activeAgent(state){
  const agent=state.npcs.find(n=>n.id==='NPC_AGT_01');
  assert.ok(agent);
  agent.careerState='active';
}

function readyState(seed=5200){
  const s=createInitialState(seed);
  s.age=20;
  s.phase='20_23';
  s.reputation.marketHeat=40;
  activeAgent(s);
  certifyRepresentationInPlace(s,'NPC_AGT_01',{
    commissionPct:8,
    services:['market','media'],
    contactPolicy:'inform_first'
  },'test:a5-initial');
  return s;
}

test('A5 representation batch/1 only EVT_20_AGT_001 is promoted by this handoff',()=>{
  assert.deepEqual(A5_REPRESENTATION_READY_EVENTS.map(e=>e.id),['EVT_20_AGT_001']);
});

test('A5 representation batch/2 event fails closed for identity-only active agent',()=>{
  const event=A5_REPRESENTATION_READY_EVENTS[0];
  const s=createInitialState(5201);
  s.age=20;
  s.phase='20_23';
  s.reputation.marketHeat=40;
  activeAgent(s);
  certifyActiveAgentInPlace(s,'NPC_AGT_01');
  assert.equal(resolveCurrentRepresentation(s),null);
  assert.equal(eventGatesPass(s,event),false);
});

test('A5 representation batch/3 exact representation authority unlocks gate',()=>{
  const event=A5_REPRESENTATION_READY_EVENTS[0];
  const s=readyState(5202);
  assert.equal(eventGatesPass(s,event),true);
  const spec=representationBridgeSpec(event);
  assert.ok(spec);
  assert.deepEqual(Object.keys(spec.choices).sort(),event.choices.map(c=>c.id).sort());
});

test('A5 representation batch/4 BROAD_CONTROL updates persisted authority after narrative outcome',()=>{
  const event=A5_REPRESENTATION_READY_EVENTS[0];
  const s=readyState(5203);
  const before=resolveCurrentRepresentation(s);
  const result=resolveChoiceInPlace(s,event,'BROAD_CONTROL',true);
  applyRepresentationBridgeChoiceInPlace(s,event,'BROAD_CONTROL',result.outcomeId);
  const current=resolveCurrentRepresentation(s);
  assert.equal(current.agentNpcId,before.agentNpcId);
  assert.equal(current.commissionPct,before.commissionPct);
  assert.equal(current.contactPolicy,'broad_delegation');
  assert.deepEqual(current.services,['image','market','media']);
  assert.equal(current.source,`narrative:EVT_20_AGT_001:BROAD_CONTROL:${result.outcomeId}`);
});

test('A5 representation batch/5 SPLIT_IMAGE removes media/image representation but does not invent commission',()=>{
  const event=A5_REPRESENTATION_READY_EVENTS[0];
  const s=readyState(5204);
  const before=resolveCurrentRepresentation(s);
  const result=resolveChoiceInPlace(s,event,'SPLIT_IMAGE',true);
  applyRepresentationBridgeChoiceInPlace(s,event,'SPLIT_IMAGE',result.outcomeId);
  const current=resolveCurrentRepresentation(s);
  assert.equal(current.commissionPct,before.commissionPct);
  assert.deepEqual(current.services,['market']);
  assert.equal(current.contactPolicy,'inform_first');
});
