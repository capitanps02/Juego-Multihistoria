import test from 'node:test';
import assert from 'node:assert/strict';
import { EVENTS, EVENTS_30_34 } from '../dist/content/events/index.js';
import { validateBuild } from '../dist/validation/build-validation.js';

const ADDED=['EVT_30_CCH_001','EVT_30_JAN_001'];
const RETIRED=['EVT_30_AGT_001','EVT_33_NAT_001'];
const FIRST_BATCH=['EVT_30_BRIDGE_001','EVT_30_STATUS_001','EVT_32_RICH_001','EVT_32_IMPACT_001','EVT_33_FIN_001'];

test('A7 add2 prefreeze preserves the global 388-event contract',()=>{
  assert.equal(EVENTS.length,388);
  assert.equal(new Set(EVENTS.map(event=>event.id)).size,388);
  assert.deepEqual(validateBuild(EVENTS).filter(issue=>issue.level==='error'),[]);
});

test('A7 add2 activates only the two selected canonical additions and retires two unrelated engine-only rows',()=>{
  for(const id of ADDED) assert.equal(EVENTS_30_34.filter(event=>event.id===id).length,1,id);
  for(const id of RETIRED) assert.equal(EVENTS_30_34.some(event=>event.id===id),false,id);
  for(const id of FIRST_BATCH) assert.equal(EVENTS_30_34.filter(event=>event.id===id).length,1,'first A7 batch preserved: '+id);
  assert.equal(EVENTS_30_34.some(event=>event.id==='EVT_33_RET_001'),true,'budget-exempt early-retirement technical row stays active');
});

test('A7 add2 keeps the canonical market scene on formal offer authority',()=>{
  const jan=EVENTS_30_34.find(event=>event.id==='EVT_30_JAN_001');
  assert.ok(jan);
  assert.ok(jan.tags?.includes('t51_offer_authority_bridge'));
  assert.ok('offerBridge' in jan);
});
