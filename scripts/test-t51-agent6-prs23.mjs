import assert from 'node:assert/strict';
import test from 'node:test';
import { EVENTS } from '../dist/content/events/index.js';
import { createInitialState } from '../dist/content/initial-state.js';
import { eventGatesPass } from '../dist/narrative/event-gates.js';
import { resolveChoiceInPlace } from '../dist/narrative/resolver.js';
import { loadSave, serializeSave } from '../dist/save/save.js';
import { T511_PRS_CORRECTED_STAGED_23 } from '../dist/content/events/23_26/t511-prs-corrected-staged.js';
import { hasRoleGuaranteeAt23, narrativeCausalFacts, roleDropSince23 } from '../dist/simulation/club-contract-intent.js';
import { HISTORICAL_SEED_CONSUMERS } from './t52-historical-seed-consumers.mjs';

const bridge = EVENTS.find(event => event.id === 'EVT_23_BRIDGE_001');
assert.ok(bridge);
const prs = T511_PRS_CORRECTED_STAGED_23[0];
assert.ok(prs);

function state23(seed = 61600) {
  const state = createInitialState(seed);
  state.age = 23;
  state.phase = '23_26';
  state.date = '2026-11-12';
  state.professional.initializedAt23 = true;
  state.professional.roleScoreAt23 = 72;
  state.sport.roleScore = 47;
  state.professional.roleSecurity = 50;
  return state;
}

function bridgeChoice(choiceId, seed) {
  const state = state23(seed);
  resolveChoiceInPlace(state, bridge, choiceId);
  return state;
}

test('Agent6 PRS23 exact provenance: only role_guarantees establishes the prior expectation', () => {
  const guaranteed = bridgeChoice('A', 61601);
  assert.equal(hasRoleGuaranteeAt23(guaranteed), true);
  assert.equal(eventGatesPass(guaranteed, prs), true);

  for (const [choiceId, seed] of [['B', 61602], ['C', 61603], ['D', 61604]]) {
    const state = bridgeChoice(choiceId, seed);
    assert.equal(hasRoleGuaranteeAt23(state), false, `${choiceId} must not fabricate a role guarantee`);
    assert.equal(eventGatesPass(state, prs), false, `${choiceId} must not open PRS23`);
  }
});

test('Agent6 PRS23 uses factual drop from the age-23 snapshot rather than low role alone', () => {
  const state = bridgeChoice('A', 61610);
  assert.equal(roleDropSince23(state), 25);
  assert.equal(eventGatesPass(state, prs), true);

  state.sport.roleScore = 63;
  assert.equal(roleDropSince23(state), 9);
  assert.equal(eventGatesPass(state, prs), false, 'drop below the material threshold must fail closed');

  state.sport.roleScore = 40;
  state.professional.initializedAt23 = false;
  assert.equal(roleDropSince23(state), 0, 'no authoritative snapshot => no factual drop');
  assert.equal(eventGatesPass(state, prs), false);
});

test('Agent6 PRS23 rejects same seed id with wrong origin and preserves terminal historical evidence', () => {
  const wrong = bridgeChoice('A', 61620);
  const wrongSeed = wrong.seeds.find(seed => seed.id === 'SEED_ELITE_ROLE_BARGAIN');
  assert.ok(wrongSeed);
  wrongSeed.originEvent = 'EVT_23_MKT_001';
  assert.equal(hasRoleGuaranteeAt23(wrong), false);
  assert.equal(eventGatesPass(wrong, prs), false);

  const terminal = bridgeChoice('A', 61621);
  const terminalSeed = terminal.seeds.find(seed => seed.id === 'SEED_ELITE_ROLE_BARGAIN');
  assert.ok(terminalSeed);
  terminalSeed.state = 'resolved';
  terminalSeed.consumedBy = 'LATER_EVENT';
  terminal.flags.HAS_SEED_ELITE_ROLE_BARGAIN = false;
  assert.equal(hasRoleGuaranteeAt23(terminal), true, 'terminal state must not erase historical conversation');
  assert.equal(eventGatesPass(terminal, prs), true);
});

test('Agent6 PRS23 historical seed read is registered as historical_instance, not live presence', () => {
  const row = HISTORICAL_SEED_CONSUMERS.find(item => item.file === 'src/simulation/club-contract-intent.ts' && item.seedId === 'SEED_ELITE_ROLE_BARGAIN');
  assert.ok(row);
  assert.deepEqual(row.ageWindow, [23, null]);
  assert.match(row.surface, /roleGuaranteeAt23/);
});

test('Agent6 PRS23 causal facts are read-only, 0 RNG and survive save/load', () => {
  const state = bridgeChoice('A', 61630);
  const before = structuredClone(state);
  const facts = narrativeCausalFacts(state);
  assert.equal(facts.roleGuaranteeAt23, true);
  assert.equal(facts.roleDropSince23, 25);
  assert.deepEqual(state, before);

  const restored = loadSave(serializeSave(state));
  assert.deepEqual(narrativeCausalFacts(restored), facts);
});
