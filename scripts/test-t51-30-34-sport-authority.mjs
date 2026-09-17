import test from 'node:test';
import assert from 'node:assert/strict';
import { EVENTS } from '../dist/content/events/index.js';
import { createInitialState } from '../dist/content/initial-state.js';
import { eventGatesPass } from '../dist/narrative/event-gates.js';
import { narrativeConditionRoot } from '../dist/simulation/club-contract-intent.js';

const byId = id => {
  const event = EVENTS.find(row => row.id === id);
  assert.ok(event, `${id} must exist in active catalog`);
  return event;
};

function veteranState(age, month) {
  const state = createInitialState(3034999 + age);
  state.age = age;
  state.phase = '30_34';
  state.date = `203${age - 30}-${String(month).padStart(2, '0')}-01`;
  state.professional.initializedAt30 = true;
  return state;
}

test('shared sport authority exposes unavailable concrete match facts as null', () => {
  const state = veteranState(31, 5);
  state.flags.FINAL_CONTEXT = true;
  state.sport.form = 100;
  state.sport.roleScore = 100;
  state.professional.roleSecurity = 100;
  const root = narrativeConditionRoot(state);
  assert.equal(root.facts.sport.currentCompetition, null);
  assert.equal(root.facts.sport.nextFixture, null);
  assert.equal(root.facts.sport.hoursToNextFixture, null);
  assert.equal(root.facts.match.playerStarted, null);
  assert.equal(root.facts.match.minutes, null);
});

test('EVT_31_FINAL_001 fails closed even when legacy final and role proxies are maximized', () => {
  const state = veteranState(31, 5);
  state.flags.FINAL_CONTEXT = true;
  state.sport.form = 100;
  state.sport.roleScore = 100;
  state.professional.roleSecurity = 100;
  state.professional.statusInertia = 100;
  const event = byId('EVT_31_FINAL_001');
  assert.ok(event.tags?.includes('t51_sport_authority_required'));
  assert.ok(event.gates.some(g => g.path === 'facts.sport.currentCompetition' && g.op === 'exists'));
  assert.ok(event.gates.some(g => g.path === 'facts.sport.nextFixture' && g.op === 'exists'));
  assert.equal(eventGatesPass(state, event), false);
});

test('EVT_33_BODY_001 fails closed even when recovery proxy alone would pass', () => {
  const state = veteranState(33, 9);
  state.professional.recoveryMargin = 0;
  state.professional.recoveryDebt = 100;
  state.sport.form = 100;
  state.sport.roleScore = 100;
  const event = byId('EVT_33_BODY_001');
  assert.ok(event.tags?.includes('t51_sport_authority_required'));
  assert.ok(event.gates.some(g => g.path === 'facts.sport.nextFixture' && g.op === 'exists'));
  assert.ok(event.gates.some(g => g.path === 'facts.sport.hoursToNextFixture' && g.op === 'exists'));
  assert.equal(eventGatesPass(state, event), false);
});

test('sport authority gates do not mutate state or consume a synthetic match', () => {
  const state = veteranState(33, 9);
  state.professional.recoveryMargin = 0;
  const before = structuredClone(state);
  eventGatesPass(state, byId('EVT_33_BODY_001'));
  assert.deepEqual(state, before);
});
