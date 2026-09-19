import test from 'node:test';
import assert from 'node:assert/strict';
import { EVENTS, EVENTS_20_23 } from '../dist/content/events/index.js';
import { contentIdentity } from '../dist/session/content-identity.js';
import { offerBridgeSpec } from '../dist/narrative/offer-bridge.js';
import { representationBridgeSpec } from '../dist/narrative/representation-bridge.js';

const byId=id=>EVENTS.find(e=>e.id===id);

test('A5 next pre-freeze/1 exact two authority-ready identities are active',()=>{
  const agent=byId('EVT_20_AGT_001');
  const market=byId('EVT_20_MKT_001');
  assert.ok(agent);
  assert.ok(market);
  assert.deepEqual(agent.gates,[{path:'facts.representation',op:'exists'}]);
  assert.ok(representationBridgeSpec(agent));
  assert.ok(offerBridgeSpec(market));
});

test('A5 next pre-freeze/2 no other external-owner-ready A5 principal is activated by this pass',()=>{
  const forbidden=[
    'EVT_18_END_002','EVT_20_MED_001','EVT_20_BRUNO_001','EVT_20_JAN_001','EVT_20_MATCH_003',
    'EVT_21_AGT_001','EVT_21_MKT_001','EVT_21_MONEY_001','EVT_21_NAT_001','EVT_21_IMG_001',
    'EVT_21_MED_001','EVT_21_CCH_002','EVT_22_LOCK_001','EVT_22_HOME_001','EVT_22_MKT_001',
    'EVT_22_MED_001','EVT_22_TACT_001','EVT_22_DDL_001'
  ];
  // They may still exist as legacy/technical base IDs, but must not carry the owner-ready verified definitions.
  for(const id of forbidden){
    const event=byId(id);
    if(!event) continue;
    assert.notEqual(event.tags?.includes('a5_ready_external_blocker')&&event.canonStatus==='verified',true,
      `${id} was promoted without its full external authority`);
  }
});

test('A5 next pre-freeze/3 catalog remains unique and deterministic',async()=>{
  const ids=EVENTS.map(e=>e.id);
  assert.equal(new Set(ids).size,ids.length);
  assert.equal(EVENTS_20_23.filter(e=>e.id==='EVT_20_AGT_001').length,1);
  assert.equal(EVENTS_20_23.filter(e=>e.id==='EVT_20_MKT_001').length,1);
  const identity=await contentIdentity(EVENTS);
  assert.match(identity,/^[a-f0-9]{64}$/);
  console.log('A5_NEXT_TARGET_IDENTITY='+identity);
});
