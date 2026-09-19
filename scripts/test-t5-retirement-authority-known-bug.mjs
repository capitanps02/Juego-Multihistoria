import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState } from '../dist/content/initial-state.js';
import { loadSave, serializeSave } from '../dist/save/save.js';
import {
  lateCareerPreseason,
  lateCareerWeek,
  reopenVoluntaryRetirementDialoguesInPlace,
  reverseRetirement
} from '../dist/simulation/late-career-engine.js';

function veteran(seed) {
  const state = createInitialState(seed);
  state.age = 36;
  state.phase = '34_plus';
  state.date = '2044-09-15';
  return state;
}

test('T5-QA-016a/#61: ordinary announced retirement cannot reopen to playing', () => {
  const state = veteran(61001);
  state.retirement.status = 'announced';
  state.retirement.decidedDate = '2044-07-01';
  state.retirement.announcedDate = '2044-08-01';
  state.retirement.reversals = 2;
  state.flags.RETIREMENT_ANNOUNCED = true;
  const before = structuredClone(state);

  reverseRetirement(state);

  assert.equal(state.retirement.status, 'announced', 'public retirement must remain announced without the canonical reversal authority');
  assert.equal(state.retirement.reversals, 2, 'rejected reversal must not increment reversal count');
  assert.deepEqual(state, before, 'rejected announced reversal must be mutation-free');
});

test('T5-QA-016b/#61: elapsed time alone never fabricates retirement announcement', () => {
  const state = veteran(61002);
  state.retirement.status = 'decided';
  state.retirement.decidedDate = '2044-07-01';
  state.retirement.decisionAge = 36;
  state.retirement.daysInStatus = 45;
  state.flags.RETIREMENT_DECISION_CONTEXT = true;
  state.flags.RETIREMENT_ANNOUNCED = false;
  const narrativeRng = structuredClone(state.rngState.narrative);

  lateCareerWeek(state);

  assert.equal(state.retirement.status, 'decided', 'private decision must stay private until an explicit announcement scene');
  assert.equal(state.retirement.announcedDate, null);
  assert.notEqual(state.flags.ADMIN_ANNOUNCEMENT_FALLBACK, true, 'timer fallback must not fabricate public announcement');
  assert.deepEqual(state.rngState.narrative, narrativeRng, 'retirement authority guard must not consume narrative RNG');
});

test('T5-QA-016c/#61: no-market exhaustion is context only and never decides retirement', () => {
  const state = veteran(61003);
  state.contract.monthsRemaining = 0;
  state.reputation.marketHeat = 0;
  state.sport.roleScore = 0;
  state.professional.veteranLeverage = 0;
  state.professional.legacyCapital = 0;
  state.professional.availability = 100;
  state.professional.recoveryDebt = 0;
  state.professional.motivationReserve = 70;
  const beforeStatus = structuredClone(state.retirement);
  const narrativeRng = structuredClone(state.rngState.narrative);

  lateCareerPreseason(state);

  assert.equal(state.retirement.status, 'playing');
  assert.equal(state.retirement.decidedDate, beforeStatus.decidedDate);
  assert.equal(state.retirement.announcedDate, beforeStatus.announcedDate);
  assert.equal(state.flags.NO_MARKET_END_CONTEXT, true, 'market silence should expose only a player-decision context');
  assert.deepEqual(state.rngState.narrative, narrativeRng);
});


function recordVoluntaryContinue(state,eventId,choiceId,date){
  state.history.push({
    eventId,date,season:state.season,choiceId,outcomeId:choiceId,club:state.club,
    snapshot:{age:state.age,phase:state.phase,family:'life'},salience:80,visibility:'private'
  });
  state.flags['SEEN_'+eventId]=true;
  state.eventCooldowns[eventId]=99999;
}

test('T5-QA-016d: voluntary continuation does not permanently consume retirement decision surfaces', () => {
  const state=veteran(61004);
  state.date='2044-07-01';
  recordVoluntaryContinue(state,'EVT_RET_BODY_001','ONE_MORE','2044-07-01');
  const narrativeRng=structuredClone(state.rngState.narrative);

  state.date='2045-06-30';
  reopenVoluntaryRetirementDialoguesInPlace(state);
  assert.equal(state.flags.SEEN_EVT_RET_BODY_001,true,'dialogue stays consumed before one full year');
  assert.equal(state.eventCooldowns.EVT_RET_BODY_001,99999);

  state.date='2045-07-01';
  reopenVoluntaryRetirementDialoguesInPlace(state);
  assert.equal(state.flags.SEEN_EVT_RET_BODY_001,false,'same retirement dialogue reopens after one year');
  assert.equal(state.eventCooldowns.EVT_RET_BODY_001,0);
  assert.equal(state.retirement.status,'playing','reopening does not decide retirement');
  assert.deepEqual(state.rngState.narrative,narrativeRng,'reopening consumes no narrative RNG');
});

test('T5-QA-016e: only explicit continue choices reopen and save/load preserves the evidence', () => {
  let state=veteran(61005);
  state.date='2044-07-01';
  recordVoluntaryContinue(state,'EVT_RET_LOW_001','FIGHT','2044-07-01');
  recordVoluntaryContinue(state,'EVT_RET_HIGH_001','HIGH','2044-07-02');
  state=loadSave(serializeSave(state));
  state.date='2045-07-03';

  reopenVoluntaryRetirementDialoguesInPlace(state);

  assert.equal(state.flags.SEEN_EVT_RET_LOW_001,false,'FIGHT is an explicit continue choice and must reopen later');
  assert.equal(state.eventCooldowns.EVT_RET_LOW_001,0);
  assert.equal(state.flags.SEEN_EVT_RET_HIGH_001,true,'a retirement choice must never be reinterpreted as continuation');
  assert.equal(state.eventCooldowns.EVT_RET_HIGH_001,99999);
});
