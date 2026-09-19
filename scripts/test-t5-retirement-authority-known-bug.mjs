import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState } from '../dist/content/initial-state.js';
import { agencyDeferredRetirement } from './qa-t5-retirement-deferral.mjs';
import {
  lateCareerPreseason,
  lateCareerWeek,
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


test('T5-QA-016d: explicit canonical continuation is agency, not retirement deadlock', () => {
  const state = veteran(61004);
  state.retirement.status = 'playing';
  state.history.push({ eventId: 'EVT_RET_BODY_001', choiceId: 'ONE_MORE', date: '2044-07-01' });
  assert.equal(agencyDeferredRetirement(state), true);

  const noEvidence = veteran(61005);
  noEvidence.retirement.status = 'playing';
  noEvidence.history.push({ eventId: 'EVT_RET_BODY_001', choiceId: 'HEALTH', date: '2044-07-01' });
  assert.equal(agencyDeferredRetirement(noEvidence), false, 'only explicit continue choices may classify player agency');
});
