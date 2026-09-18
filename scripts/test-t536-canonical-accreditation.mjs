import test from 'node:test';
import assert from 'node:assert/strict';
import { EVENTS } from '../dist/content/events/index.js';

const event=id=>{
  const found=EVENTS.find(item=>item.id===id);
  assert.ok(found,`missing event ${id}`);
  return found;
};

test('terminal conditional exact-ID overlap cannot self-accredit without canonical factual authority',()=>{
  const postOffer=event('CEVT_38_OFFER_AFTER_RETIREMENT_ANNOUNCED');
  const noLastMatch=event('CEVT_RET_NO_LAST_MATCH');
  const storybook=event('CEVT_RET_STORYBOOK_LAST_GOAL');

  assert.equal(postOffer.canonStatus,'technical_adaptation');
  assert.equal(noLastMatch.canonStatus,'verified');
  assert.equal(storybook.canonStatus,'technical_adaptation');

  assert.ok(postOffer.tags?.includes('t536_canonical_pending_terminal_reversal_contract'));
  assert.ok(noLastMatch.tags?.includes('t536_canonical_injury_unavailability_fact'));
  assert.ok(noLastMatch.tags?.includes('t536_suspension_route_fail_closed'));
  assert.ok(storybook.tags?.includes('t536_canonical_pending_last_goal_fact'));
});

test('legacy pre-announcement reconsideration keeps distinct noncanonical identity',()=>{
  const reconsider=event('CEVT_RET_RECONSIDER');
  assert.equal(reconsider.canonStatus,'technical_adaptation');
  assert.ok(reconsider.tags?.includes('t536_noncanonical_conditional_id'));
  assert.notEqual(reconsider.id,'CEVT_38_RETIREMENT_REVERSAL');
});

test('no-last-match compatibility closure does not claim factual injury/suspension trigger',()=>{
  const noLastMatch=event('CEVT_RET_NO_LAST_MATCH');
  const serialized=JSON.stringify(noLastMatch.gates??[]);
  assert.match(serialized,/retirement\.daysInStatus/);
  assert.doesNotMatch(serialized,/injur|suspend/i);
  assert.equal(noLastMatch.canonStatus,'technical_adaptation');
});
