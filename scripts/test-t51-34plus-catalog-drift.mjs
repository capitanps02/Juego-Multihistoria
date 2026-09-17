import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {EVENTS} from '../dist/content/events/index.js';

const frozen=JSON.parse(fs.readFileSync('qa/fixtures/t5.1/pre-t51-event-catalog.json','utf8'));
const frozenById=new Map(frozen.map(event=>[event.id,event]));
const activeById=new Map(EVENTS.map(event=>[event.id,event]));

const replacements=[
  ['EVT_38_MKT_001','EVT_38_MARKET_001'],
  ['EVT_RET_HOME_001','EVT_RET_FAM_001'],
  ['EVT_RET_LAST_001','EVT_RET_LASTMATCH_001']
];
const reviewedSameId=[
  'EVT_RET_BODY_001',
  'EVT_RET_HIGH_001',
  'EVT_RET_LOW_001',
  'EVT_RET_ANNOUNCE_001',
  'CEVT_38_OFFER_AFTER_RETIREMENT_ANNOUNCED',
  'CEVT_RET_RECONSIDER',
  'CEVT_RET_STORYBOOK_LAST_GOAL'
];

test('T5.1 34+ owner drift matches the reviewed replacements and same-ID changes',()=>{
  for(const [legacyId,canonicalId] of replacements){
    assert.ok(frozenById.has(legacyId),`frozen legacy event missing: ${legacyId}`);
    assert.equal(activeById.has(legacyId),false,`legacy owner event must leave the active catalog: ${legacyId}`);
    assert.equal(frozenById.has(canonicalId),false,`canonical owner replacement already existed in frozen catalog: ${canonicalId}`);
    assert.ok(activeById.has(canonicalId),`canonical owner replacement missing from active catalog: ${canonicalId}`);
  }

  for(const id of reviewedSameId){
    assert.ok(frozenById.has(id),`frozen same-ID event missing: ${id}`);
    assert.ok(activeById.has(id),`active same-ID event missing: ${id}`);
    assert.notEqual(
      JSON.stringify(activeById.get(id)),
      JSON.stringify(frozenById.get(id)),
      `reviewed 34+ same-ID definition did not change: ${id}`
    );
  }
});

test('T5.1 canonical replacements do not inherit legacy scheduler identity',()=>{
  for(const [legacyId,canonicalId] of replacements){
    assert.ok(frozenById.has(legacyId));
    assert.equal(activeById.has(legacyId),false);
    assert.ok(activeById.has(canonicalId));
    assert.equal(frozenById.has(canonicalId),false);
  }
});
