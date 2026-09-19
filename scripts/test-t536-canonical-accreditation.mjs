import test from 'node:test';
import assert from 'node:assert/strict';
import { EVENTS } from '../dist/content/events/index.js';

const event=id=>{
  const found=EVENTS.find(item=>item.id===id);
  assert.ok(found,`missing event ${id}`);
  return found;
};

test('terminal factual conditionals accredit only exact shared-authority facts',()=>{
  const postOffer=event('CEVT_38_OFFER_AFTER_RETIREMENT_ANNOUNCED');
  const reversal=event('CEVT_38_RETIREMENT_REVERSAL');
  const noLastMatch=event('CEVT_RET_NO_LAST_MATCH');
  const storybook=event('CEVT_RET_STORYBOOK_LAST_GOAL');

  assert.equal(postOffer.canonStatus,'technical_adaptation');
  assert.equal(reversal.canonStatus,'technical_adaptation');
  assert.equal(noLastMatch.canonStatus,'verified');
  assert.equal(storybook.canonStatus,'verified');

  assert.match(JSON.stringify(postOffer.gates),/facts\.retirementPostAnnouncementOffer\.stage/);
  assert.match(JSON.stringify(reversal.gates),/facts\.retirementPostAnnouncementOffer\.stage/);
  assert.ok(reversal.tags?.includes('t536_canonical_consumer_waiting_post_announcement_offer_producer'));
  assert.ok(noLastMatch.tags?.includes('t536_canonical_injury_unavailability_fact'));
  assert.ok(storybook.tags?.includes('t536_canonical_factual_last_goal'));
});

test('legacy pre-announcement reconsideration keeps distinct noncanonical identity',()=>{
  const reconsider=event('CEVT_RET_RECONSIDER');
  assert.equal(reconsider.canonStatus,'technical_adaptation');
  assert.ok(reconsider.tags?.includes('t536_noncanonical_conditional_id'));
  assert.notEqual(reconsider.id,'CEVT_38_RETIREMENT_REVERSAL');
});

test('no-last-match and storybook gates contain no timer, role or synthetic-goal proxy',()=>{
  const noLastMatch=event('CEVT_RET_NO_LAST_MATCH');
  const storybook=event('CEVT_RET_STORYBOOK_LAST_GOAL');
  const noLastSerialized=JSON.stringify(noLastMatch.gates??[]);
  const storySerialized=JSON.stringify(storybook.gates??[]);
  assert.match(noLastSerialized,/facts\.retirementNoLastMatch\.eligible/);
  assert.match(noLastSerialized,/injury/);
  assert.doesNotMatch(noLastSerialized,/retirement\.daysInStatus|LAST_MATCH_PLAYED/);
  assert.match(storySerialized,/facts\.retirementStorybookLastGoal\.eligible/);
  assert.doesNotMatch(storySerialized,/roleScore|LAST_MATCH_GOAL_FACT|STORYBOOK_LAST_GOAL/);
});
