import test from 'node:test';
import assert from 'node:assert/strict';
import { EVENTS } from '../dist/content/events/index.js';
import { EVENTS_26_30 } from '../dist/content/events/26_30/index.js';
import { SEED_CATALOG_26_30 } from '../dist/catalog/seeds.js';

test('A6 safe3 pre-freeze preserves 388 unique active events',()=>{
  assert.equal(EVENTS.length,388);
  const ids=EVENTS.map(event=>event.id);
  assert.equal(new Set(ids).size,ids.length);
});

test('A6 safe3 activates only the explicit bridge plus exact-ID BODY27/FIN29 replacements',()=>{
  for(const id of ['EVT_26_BRIDGE_001','EVT_27_BODY_001','EVT_29_FIN_001']){
    const rows=EVENTS_26_30.filter(event=>event.id===id);
    assert.equal(rows.length,1,id);
    assert.equal(rows[0].canonStatus,'verified',id);
  }
  assert.equal(EVENTS_26_30.some(event=>event.id==='EVT_26_IDN_001'),false);
  assert.equal(EVENTS_26_30.some(event=>event.id==='EVT_26_DOC_001'),false);
  assert.equal(EVENTS_26_30.some(event=>event.id==='EVT_27_CON_001'),false);
});

test('future PEAK_IDENTITY provenance points to canonical bridge only',()=>{
  const seed=SEED_CATALOG_26_30.find(row=>row.id==='SEED_PEAK_IDENTITY');
  assert.ok(seed);
  assert.deepEqual(seed.originEvents,['EVT_26_BRIDGE_001']);
});
