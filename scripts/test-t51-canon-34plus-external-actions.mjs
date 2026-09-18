import assert from 'node:assert/strict';
import test from 'node:test';
import { STAGED_EXTERNAL_PRINCIPALS } from '../dist/content/events/34_plus/staged-principal-awaiting-external.js';
import { EXTERNAL_PRINCIPAL_CHOICE_ACTIONS,externalChoiceAction } from '../dist/content/events/34_plus/staged-principal-external-actions.js';

test('every externally blocked principal choice has an explicit A8 consumer action contract',()=>{
 for(const row of STAGED_EXTERNAL_PRINCIPALS){
  for(const choice of row.event.choices){
   const action=externalChoiceAction(row.event.id,choice.id);
   assert.ok(action,`${row.event.id}/${choice.id}`);
   assert.ok(action.authorityOwner.length>0);
   assert.ok(action.note.length>8);
  }
 }
});
test('A8 terminal-looking choices only emit Agent9 intent handoff',()=>{
 const ids=[['EVT_36_LOWER_001','B'],['EVT_38_RICH_001','B'],['EVT_38_MARKET_001','D']];
 for(const [eventId,choiceId] of ids) assert.equal(externalChoiceAction(eventId,choiceId)?.kind,'agent9_retirement_intent');
});
test('market accept/reject actions are commands, not direct contract field writes',()=>{
 const market=EXTERNAL_PRINCIPAL_CHOICE_ACTIONS.filter(x=>x.kind.startsWith('market_'));
 assert.ok(market.length>40);
 for(const row of market) assert.doesNotMatch(row.note,/direct contract mutation/i);
});
