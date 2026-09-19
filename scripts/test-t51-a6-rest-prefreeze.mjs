// A6 second-batch pre-freeze exact-head trigger.
import test from 'node:test';
import assert from 'node:assert/strict';
import { EVENTS } from '../dist/content/events/index.js';
import { EVENTS_26_30 } from '../dist/content/events/26_30/index.js';

const TARGETS=[
  'EVT_26_BRIDGE_001',
  'EVT_26_DOC_001',
  'EVT_27_BODY_001',
  'EVT_27_CON_001',
  'EVT_29_FIN_001'
];

test('A6 second pre-freeze keeps global active event count stable',()=>{
  assert.equal(EVENTS.length,388);
});

test('A6 second pre-freeze activates each exact-ID replacement exactly once',()=>{
  for(const id of TARGETS){
    const rows=EVENTS_26_30.filter(event=>event.id===id);
    assert.equal(rows.length,1,id);
    assert.equal(rows[0].canonStatus,'verified',id);
    assert.ok(rows[0].tags?.includes('staged_candidate'),id);
  }
});

test('A6 second pre-freeze does not create duplicate IDs anywhere',()=>{
  const ids=EVENTS.map(event=>event.id);
  assert.equal(new Set(ids).size,ids.length);
});
