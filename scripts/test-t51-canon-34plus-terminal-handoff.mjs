import assert from 'node:assert/strict';
import test from 'node:test';
import { TERMINAL_CONDITIONAL_HANDOFFS } from '../dist/content/events/34_plus/terminal-conditional-handoff.js';

test('A8 hands off exactly four terminal conditional identities to Agent 9',()=>{
 assert.equal(TERMINAL_CONDITIONAL_HANDOFFS.length,4);
 assert.deepEqual(TERMINAL_CONDITIONAL_HANDOFFS.map(x=>x.id),[
  'CEVT_38_OFFER_AFTER_RETIREMENT_ANNOUNCED',
  'CEVT_38_RETIREMENT_REVERSAL',
  'CEVT_RET_NO_LAST_MATCH',
  'CEVT_RET_STORYBOOK_LAST_GOAL'
 ]);
 for(const row of TERMINAL_CONDITIONAL_HANDOFFS){
  assert.equal(row.status,'HANDED_OFF_TERMINAL');
  assert.equal(row.owner,'agent9');
  assert.ok(row.requirements.length>=4);
  assert.ok(row.forbiddenA8Actions.some(x=>x.includes('retirement.status')||x.includes('close career')));
  assert.ok(row.migrationExpectation.length>30);
 }
});
test('terminal handoffs explicitly forbid fabricated offer/match facts',()=>{
 const offer=TERMINAL_CONDITIONAL_HANDOFFS.find(x=>x.id==='CEVT_38_OFFER_AFTER_RETIREMENT_ANNOUNCED');
 const last=TERMINAL_CONDITIONAL_HANDOFFS.find(x=>x.id==='CEVT_RET_STORYBOOK_LAST_GOAL');
 assert.ok(offer.forbiddenA8Actions.some(x=>x.includes('CareerOffer')||x.includes('POST_ANNOUNCE')));
 assert.ok(last.forbiddenA8Actions.some(x=>x.includes('goal')));
});
