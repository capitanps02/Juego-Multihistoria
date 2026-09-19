import assert from 'node:assert/strict';
import test from 'node:test';
import { createInitialState } from '../dist/content/initial-state.js';
import { buildAgent9LateCareerHandoff } from '../dist/content/events/34_plus/agent9-handoff.js';

test('Agent-9 handoff is read-only and cannot advance retirement',()=>{
 const s=createInitialState(15001);s.age=37;s.phase='34_plus';s.retirement.status='playing';
 const before=structuredClone(s);
 const h=buildAgent9LateCareerHandoff(s);
 assert.deepEqual(s,before);
 assert.equal(h.careerStatus,'playing');
 assert.equal(h.handoffRules.agent8MayMutateRetirement,false);
 assert.equal(h.handoffRules.agent9OwnsTerminalTransition,true);
});
test('handoff exposes exact current club/employment and does not pretend zero-month contract is free agency',()=>{
 const s=createInitialState(15002);s.age=37;s.phase='34_plus';s.contract.monthsRemaining=0;
 const h=buildAgent9LateCareerHandoff(s);
 assert.equal(h.club.registrationClub,s.professional.registrationClub);
 assert.equal(h.employment.status,'expired_pending_resolution');
});
test('handoff explicitly reports unavailable rich-history layers instead of synthesizing them',()=>{
 const s=createInitialState(15003);s.age=37;s.phase='34_plus';
 const h=buildAgent9LateCareerHandoff(s);
 assert.equal(h.sport.richResultGoalsAssistsCardsAuthorityAvailable,false);
 assert.equal(h.body.episodeHistoryAuthorityAvailable,false);
});
