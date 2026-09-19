// PRE-ACTIVATION evidence only; successor identity is computed after #444 lands in main.
import test from 'node:test';
import assert from 'node:assert/strict';
import { EVENTS } from '../dist/content/events/index.js';
import { eventFingerprint } from '../dist/session/content-identity.js';
import { validateBuild } from '../dist/validation/build-validation.js';
import { T512_STAGED_MARKET_PRINCIPAL_EVENTS_25 } from '../dist/content/events/23_26/t512-staged-market-principal-events.js';
import { T513_STAGED_OFFER_PRINCIPAL_EVENTS_23_25 } from '../dist/content/events/23_26/t513-staged-offer-principal-events.js';
import { T514_STAGED_LOCK_PRINCIPAL_EVENTS_23 } from '../dist/content/events/23_26/t514-staged-lock-principal-events.js';

const EXPECTED=[
  ...T512_STAGED_MARKET_PRINCIPAL_EVENTS_25,
  ...T513_STAGED_OFFER_PRINCIPAL_EVENTS_23_25,
  ...T514_STAGED_LOCK_PRINCIPAL_EVENTS_23
];
const IDS=EXPECTED.map(event=>event.id);

test('A6 L preserves 388 events and activates exactly five owner definitions', async()=>{
  assert.equal(EVENTS.length,388);
  assert.equal(new Set(EVENTS.map(event=>event.id)).size,388);
  assert.deepEqual(validateBuild(EVENTS).filter(issue=>issue.level==='error'),[]);
  for(const expected of EXPECTED){
    const rows=EVENTS.filter(event=>event.id===expected.id);
    assert.equal(rows.length,1,expected.id);
    assert.equal(await eventFingerprint(rows[0]),await eventFingerprint(expected),expected.id);
  }
});

test('A6 L changes only the selected 23-25 semantic slots',()=>{
  assert.deepEqual([...IDS].sort(),[
    'EVT_23_CON_001','EVT_23_LOCK_001','EVT_23_MKT_001','EVT_25_CON_001','EVT_25_MKT_001'
  ]);
});

