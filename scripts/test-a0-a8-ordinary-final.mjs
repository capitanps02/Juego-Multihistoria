import test from 'node:test';
import assert from 'node:assert/strict';

import { createInitialState } from '../dist/content/initial-state.js';
import { EVENTS, EVENTS_34_PLUS } from '../dist/content/events/index.js';
import {
  A8_STAGED_PRINCIPALS,
  A8_STAGED_ORDINARY_CONDITIONALS
} from '../dist/content/events/34_plus/staged-runtime.js';
import { a8CanonicalRuntimeEligible } from '../dist/narrative/a8-runtime-eligibility.js';
import { validateBuild } from '../dist/validation/build-validation.js';

const TERMINAL_PRINCIPALS=[
  'EVT_37_ANNOUNCE_001',
  'EVT_RET_FAM_001',
  'EVT_RET_BODY_001',
  'EVT_RET_HIGH_001',
  'EVT_RET_LOW_001',
  'EVT_RET_ANNOUNCE_001',
  'EVT_RET_LASTMATCH_001'
];

const TERMINAL_CONDITIONALS=[
  'CEVT_38_OFFER_AFTER_RETIREMENT_ANNOUNCED',
  'CEVT_38_RETIREMENT_REVERSAL',
  'CEVT_RET_NO_LAST_MATCH',
  'CEVT_RET_STORYBOOK_LAST_GOAL'
];

function sameSet(actual,expected,label){
  assert.deepEqual([...new Set(actual)].sort(),[...new Set(expected)].sort(),label);
}

test('A8 final ordinary composition preserves 388 unique global events',()=>{
  assert.equal(EVENTS.length,388);
  assert.equal(new Set(EVENTS.map(event=>event.id)).size,388);
  assert.equal(EVENTS_34_PLUS.length,82);
  assert.deepEqual(validateBuild(EVENTS).filter(issue=>issue.level==='error'),[]);
});

test('A8 final principal surface is exactly 43 canonical ordinary + 7 A9 terminal rows',()=>{
  const ids=EVENTS_34_PLUS.filter(event=>event.id.startsWith('EVT_')).map(event=>event.id);
  sameSet(ids,[...A8_STAGED_PRINCIPALS.map(event=>event.id),...TERMINAL_PRINCIPALS],'principal surface');
  assert.equal(ids.length,50);
  assert.equal(ids.includes('EVT_34_MKT_001'),false);
  assert.equal(ids.includes('EVT_38_MKT_001'),false);
  assert.equal(ids.includes('EVT_38_MARKET_001'),true);
  assert.equal(ids.includes('EVT_34_PRE_001'),false);
  assert.equal(ids.includes('EVT_35_ROLE_001'),false);
  assert.equal(ids.includes('EVT_36_RICH_001'),false);
});

test('A8 final conditional surface is exactly 28 canonical ordinary + 4 A9 terminal rows',()=>{
  const ids=EVENTS_34_PLUS.filter(event=>event.id.startsWith('CEVT_')).map(event=>event.id);
  sameSet(ids,[...A8_STAGED_ORDINARY_CONDITIONALS.map(event=>event.id),...TERMINAL_CONDITIONALS],'conditional surface');
  assert.equal(ids.length,32);
  assert.equal(ids.includes('CEVT_34_RENEWAL_GHOST'),false);
  assert.equal(ids.includes('CEVT_35_BODY_SETBACK'),false);
  assert.equal(ids.includes('CEVT_36_MARKET_SILENCE'),false);
  assert.equal(ids.includes('CEVT_34_LATE_BALLON_WIN'),true);
  assert.equal(ids.includes('CEVT_37_LAST_DERBY'),true);
});

test('owner factual adapters fail closed instead of falling back to broad proxies',()=>{
  const state=createInitialState(8842001);
  state.age=40;
  state.phase='34_plus';
  state.retirement.status='playing';
  state.reputation.marketHeat=100;
  state.reputation.prestige=100;
  state.professional.lockerPower=100;

  for(const id of [
    'EVT_34_BRIDGE_001',
    'EVT_35_AGT_001',
    'EVT_34_NT_001',
    'EVT_35_RECORD_001',
    'CEVT_34_LATE_BALLON_WIN'
  ]){
    const event=EVENTS_34_PLUS.find(row=>row.id===id);
    assert.ok(event,id);
    assert.equal(a8CanonicalRuntimeEligible(state,event),false,id);
  }
});

test('existing A9 terminal rows are outside A8 factual accreditation',()=>{
  const state=createInitialState(8842002);
  state.age=40;
  state.phase='34_plus';
  const event=EVENTS_34_PLUS.find(row=>row.id==='EVT_RET_FAM_001');
  assert.ok(event);
  assert.equal(a8CanonicalRuntimeEligible(state,event),true);
});
