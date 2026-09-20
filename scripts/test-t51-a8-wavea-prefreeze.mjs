import test from 'node:test';
import assert from 'node:assert/strict';
import { EVENTS, EVENTS_34_PLUS } from '../dist/content/events/index.js';
import { STAGED_PRINCIPAL_WAVE_A } from '../dist/content/events/34_plus/staged-principal-wave-a.js';
import { validateBuild } from '../dist/validation/build-validation.js';

const ACTIVE=[
  'EVT_35_FAM_001',
  'EVT_35_BODY_001',
  'EVT_35_IMG_001',
  'EVT_36_MED_001'
];

test('A8 Wave A prefreeze keeps 388 unique events and excludes retirement activation changes',()=>{
  assert.equal(EVENTS.length,388);
  assert.equal(new Set(EVENTS.map(event=>event.id)).size,388);
  assert.equal(EVENTS_34_PLUS.some(event=>event.id==='EVT_34_MKT_001'),false);
  for(const id of ACTIVE){
    const rows=EVENTS_34_PLUS.filter(event=>event.id===id);
    assert.equal(rows.length,1,id);
    assert.equal(rows[0].canonStatus,'verified',id);
  }
  for(const id of ['EVT_RET_ANNOUNCE_001','EVT_RET_BODY_001','EVT_RET_HIGH_001','EVT_RET_LOW_001','EVT_RET_LAST_001']){
    assert.equal(EVENTS_34_PLUS.filter(event=>event.id===id).length,1,'terminal baseline untouched: '+id);
  }
  assert.equal(STAGED_PRINCIPAL_WAVE_A.length,4);
  assert.deepEqual(validateBuild(EVENTS).filter(issue=>issue.level==='error'),[]);
});

test('A8 Wave A contains three exact-id reimplementations plus one new canonical id',()=>{
  assert.deepEqual(ACTIVE.sort(),STAGED_PRINCIPAL_WAVE_A.map(event=>event.id).sort());
  assert.equal(ACTIVE.includes('EVT_35_IMG_001'),true);
});
