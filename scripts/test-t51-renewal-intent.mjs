import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { createInitialState } from '../dist/content/initial-state.js';
import { eventGatesPass } from '../dist/narrative/event-gates.js';
import { clubRenewalPropensity, clubWantsRenewal, hasFormalClubRenewalOffer } from '../dist/simulation/club-contract-intent.js';
import { careerTerms, proposeCareerChange, respondToOffer } from '../dist/simulation/offers.js';

function state30() {
  const state = createInitialState(12345);
  state.age = 30;
  state.phase = '30_34';
  state.professional.initializedAt30 = true;
  state.contract.monthsRemaining = 24;
  state.professional.institutionalTrust = 80;
  state.professional.roleSecurity = 75;
  state.professional.contractPower = 45;
  return state;
}

function canonicalTriggerEvent() {
  return {
    id: 'TEST_EVT_30_CON',
    ageWindow: [30, 30],
    phase: '30_34',
    family: 'contract',
    gates: [],
    gateAlternatives: [
      [{ path: 'contract.monthsRemaining', op: 'lte', value: 18 }],
      [{ path: 'facts.clubWantsRenewal', op: 'eq', value: true }]
    ],
    cooldown: 0,
    weight: 1,
    text: { title: 'test', body: 'test' },
    intel: { visible: [], uncertain: [] },
    choices: [{ id: 'A', label: 'A', intentTags: [], outcomeIds: ['O'] }],
    outcomes: [{ id: 'O', baseWeight: 1, effects: [], messages: ['ok'] }]
  };
}

function makeRenewal(state, months = 36, salaryDelta = 600) {
  proposeCareerChange(state, 'Renovación de contrato', draft => {
    draft.contract.monthsRemaining = months;
    draft.contract.salaryMonthly = Number(draft.contract.salaryMonthly) + salaryDelta;
  });
}

test('high club renewal propensity creates an authoritative early-renewal fact beyond 18 months', () => {
  const state = state30();
  assert.ok(clubRenewalPropensity(state) >= 0.50);
  assert.equal(state.contract.monthsRemaining, 24);
  assert.equal(clubWantsRenewal(state), true);
  assert.equal(eventGatesPass(state, canonicalTriggerEvent()), true);
});

test('low club renewal propensity does not fabricate renewal intent', () => {
  const state = state30();
  state.professional.institutionalTrust = 10;
  state.professional.roleSecurity = 10;
  state.professional.contractPower = 95;
  assert.ok(clubRenewalPropensity(state) < 0.50);
  assert.equal(clubWantsRenewal(state), false);
  assert.equal(eventGatesPass(state, canonicalTriggerEvent()), false);
});

test('contract <=18 months still satisfies the other canonical OR branch', () => {
  const state = state30();
  state.contract.monthsRemaining = 18;
  state.professional.institutionalTrust = 0;
  state.professional.roleSecurity = 0;
  state.professional.contractPower = 100;
  assert.equal(clubWantsRenewal(state), false);
  assert.equal(eventGatesPass(state, canonicalTriggerEvent()), true);
});

test('a formal same-club renewal offer is direct evidence even outside the early-intent horizon', () => {
  const state = state30();
  state.contract.monthsRemaining = 36;
  state.professional.institutionalTrust = 0;
  state.professional.roleSecurity = 0;
  state.professional.contractPower = 100;
  proposeCareerChange(state, 'Renovación de contrato', draft => {
    draft.contract.monthsRemaining = 48;
    draft.contract.salaryMonthly = Number(draft.contract.salaryMonthly) + 1000;
  });
  assert.equal(hasFormalClubRenewalOffer(state), true);
  assert.equal(clubWantsRenewal(state), true);
});

test('an unrelated market proposal never counts as club renewal intent', () => {
  const state = state30();
  state.contract.monthsRemaining = 36;
  state.professional.institutionalTrust = 0;
  state.professional.roleSecurity = 0;
  state.professional.contractPower = 100;
  proposeCareerChange(state, 'Propuesta de mercado', draft => {
    draft.professional.leagueTier = Math.max(1, draft.professional.leagueTier - 1);
  });
  assert.equal(hasFormalClubRenewalOffer(state), false);
  assert.equal(clubWantsRenewal(state), false);
});

test('contract dispute and invalid lifecycle states fail closed without a formal renewal', () => {
  const dispute = state30();
  dispute.flags.CONTRACT_DISPUTE = true;
  assert.equal(clubWantsRenewal(dispute), false);

  const tooEarly = state30();
  tooEarly.contract.monthsRemaining = 25;
  assert.equal(clubWantsRenewal(tooEarly), false);

  const retired = state30();
  retired.retirement.status = 'closed';
  assert.equal(clubWantsRenewal(retired), false);
});

test('renewal fact resolution consumes no RNG and mutates no GameState', () => {
  const state = state30();
  const before = structuredClone(state);
  assert.equal(clubWantsRenewal(state), true);
  assert.deepEqual(state, before);
});

test('a directly rejected renewal cannot be recreated from the identical contract snapshot', () => {
  const state = state30();
  state.contract.monthsRemaining = 5;
  const before = careerTerms(state);
  makeRenewal(state, 36, 600);
  const first = structuredClone(state.market.pending);
  assert.ok(first);
  respondToOffer(state, first.id, 'reject');
  assert.deepEqual(careerTerms(state), before);

  makeRenewal(state, 42, 900);
  assert.equal(state.market.pending, null);
  assert.equal(state.market.history.length, 1);
});

test('a changed current contract snapshot can open a fresh renewal after a rejection', () => {
  const state = state30();
  state.contract.monthsRemaining = 5;
  makeRenewal(state, 36, 600);
  respondToOffer(state, state.market.pending.id, 'reject');

  state.contract.monthsRemaining = 4;
  makeRenewal(state, 42, 900);
  assert.ok(state.market.pending);
  assert.equal(state.market.pending.before.months, 4);
  assert.equal(state.market.pending.reason, 'Renovación de contrato');
});

test('countering a renewal does not masquerade as a direct rejection for reoffer suppression', () => {
  const state = state30();
  state.contract.monthsRemaining = 5;
  makeRenewal(state, 36, 600);
  const first = state.market.pending;
  respondToOffer(state, first.id, 'counter', {
    kind: 'narrative_choice',
    historyIndex: 0,
    eventId: 'TEST_COUNTER',
    choiceId: 'COUNTER'
  });

  makeRenewal(state, 42, 900);
  assert.ok(state.market.pending);
  assert.equal(state.market.history[0].source.disposition, 'counter');
});

test('derived propensity is locked to the existing world renewal policy until deliberately changed', () => {
  const source = fs.readFileSync('src/simulation/world-simulator-core.ts', 'utf8');
  assert.match(source, /0\.20 \+ p\.institutionalTrust \/ 220 \+ p\.roleSecurity \/ 280 - Math\.max\(0, p\.contractPower - 65\) \/ 230, 0\.16, 0\.68/);
});
