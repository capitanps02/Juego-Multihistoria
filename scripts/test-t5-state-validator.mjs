import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState } from '../dist/content/initial-state.js';
import { validateGameStateQa } from './qa-t5-state-validator.mjs';

const codes = issues => new Set(issues.map(issue => issue.code));

test('QA state validator is read-only and accepts a fresh canonical state', () => {
  const state = createInitialState(57001);
  const before = structuredClone(state);
  const issues = validateGameStateQa(state);
  assert.deepEqual(issues, [], JSON.stringify(issues));
  assert.deepEqual(state, before, 'validateGameStateQa mutated state or RNG');
});

test('QA state validator catches contract, phase and retirement impossibilities', () => {
  const state = createInitialState(57002);
  state.age = 31;
  state.phase = '20_23';
  state.contract.monthsRemaining = -1;
  state.contract.salaryMonthly = -50;
  state.epilogue.generated = true;
  state.retirement.status = 'playing';
  const found = codes(validateGameStateQa(state));
  for (const code of ['phase_age_mismatch', 'contract_months_invalid', 'contract_salary_invalid', 'epilogue_before_retirement_closed']) {
    assert.equal(found.has(code), true, `missing ${code}`);
  }
});

test('QA state validator catches duplicate/invalid seed lifecycle states', () => {
  const state = createInitialState(57003);
  state.seeds.push({
    id: 'SEED_NANO_SHADOW', state: 'active', intensity: 50,
    originEvent: 'QA_A', originSeason: state.season, npcRefs: [], payload: {}, lastTouchedDate: state.date
  });
  state.seeds.push({
    id: 'SEED_NANO_SHADOW', state: 'dormant', intensity: 50,
    originEvent: 'QA_B', originSeason: state.season, npcRefs: [], payload: {}, lastTouchedDate: state.date
  });
  state.seeds.push({
    id: 'SEED_RIVAS_TRUST', state: 'resolved', intensity: 50,
    originEvent: 'QA_C', originSeason: state.season, npcRefs: [], payload: {}, lastTouchedDate: state.date
  });
  state.seeds.push({
    id: 'SEED_MENA_EARLY_READ', state: 'impossible', intensity: 50,
    originEvent: 'QA_D', originSeason: state.season, npcRefs: [], payload: {}, lastTouchedDate: state.date
  });
  const found = codes(validateGameStateQa(state));
  assert.equal(found.has('duplicate_live_seed'), true);
  assert.equal(found.has('resolved_seed_without_consumer'), true);
  assert.equal(found.has('seed_state_unknown'), true);
});

test('QA state validator catches live employment and loan ownership incoherence', () => {
  const state = createInitialState(57004);
  state.professional.registrationClub = 'OTHER';
  state.world.ownerClub = 'WRONG_OWNER';
  state.flags.LOAN_ACTIVE = true;
  state.professional.route = 'home';
  state.professional.ownerClub = state.professional.registrationClub;
  const found = codes(validateGameStateQa(state));
  assert.equal(found.has('live_registration_club_mismatch'), true);
  assert.equal(found.has('live_owner_club_mismatch'), true);
  assert.equal(found.has('loan_without_distinct_parent_club'), true);
});

test('QA state validator accepts an international loan with abroad route and distinct parent club', () => {
  const state = createInitialState(57006);
  state.club = 'Foreign QA';
  state.professional.registrationClub = 'Foreign QA';
  state.professional.ownerClub = 'UDV';
  state.world.ownerClub = 'UDV';
  state.professional.route = 'abroad';
  state.flags.LOAN_ACTIVE = true;
  state.flags.ABROAD_ROUTE = true;
  const before = structuredClone(state);
  const issues = validateGameStateQa(state);
  assert.equal(codes(issues).has('loan_without_distinct_parent_club'), false, JSON.stringify(issues));
  assert.deepEqual(state, before, 'international-loan validation mutated state');
});

test('QA state validator catches duplicate/pending-decided market identity', () => {
  const state = createInitialState(57005);
  const terms = {
    club: 'UDV', tier: 2, months: 12, salary: 1000, releaseClause: null,
    ownerClub: 'UDV', registrationClub: 'UDV', leagueTier: 2,
    prestigeTier: 3, prestigeScore: 40, route: 'home', loan: false
  };
  const offer = { id: 'QA_DUP_OFFER', reason: 'qa', before: structuredClone(terms), terms: structuredClone(terms) };
  state.market = {
    version: 1,
    sequence: 1,
    pending: structuredClone(offer),
    history: [
      { offer: structuredClone(offer), action: 'reject', accepted: false, decidedAt: state.date },
      { offer: structuredClone(offer), action: 'reject', accepted: false, decidedAt: state.date }
    ]
  };
  const found = codes(validateGameStateQa(state));
  assert.equal(found.has('market_duplicate_decision_offer'), true);
  assert.equal(found.has('market_pending_offer_already_decided'), true);
});
