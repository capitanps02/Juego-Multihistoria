import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { EVENTS } from '../dist/content/events/index.js';
import { createInitialState } from '../dist/content/initial-state.js';
import { eventGatesPass } from '../dist/narrative/event-gates.js';
import { narrativeConditionRoot } from '../dist/simulation/club-contract-intent.js';

const debt = JSON.parse(fs.readFileSync('analysis/T5.1/canon-30-34-authority-debt.json', 'utf8'));

const byId = id => {
  const event = EVENTS.find(row => row.id === id);
  assert.ok(event, `${id} must exist in active catalog`);
  return event;
};

function veteranState(age) {
  const state = createInitialState(3034999 + age);
  state.age = age;
  state.phase = '30_34';
  state.professional.initializedAt30 = true;
  state.date = '2026-09-01';
  state.season = '2026-27';
  state.runtime.day = 1;
  return state;
}

test('shared sport authority now exposes a deterministic league fixture without fabricating a current match row', () => {
  const state = veteranState(31);
  state.sport.form = 100;
  state.sport.roleScore = 100;
  const before = structuredClone(state);
  const root = narrativeConditionRoot(state);

  assert.equal(root.facts.sport.currentCompetition, 'league');
  assert.ok(root.facts.sport.nextFixture);
  assert.equal(root.facts.sport.nextFixture.competition, 'league');
  assert.equal(root.facts.sport.hoursToNextFixture, 144, 'runtime.day=1 means the next weekly league cycle is six days away');
  assert.equal(root.facts.match.playerStarted, null);
  assert.equal(root.facts.match.minutes, null);
  assert.equal(root.facts.match.goals, null);
  assert.deepEqual(state, before, 'sport projection is read-only and consumes zero RNG');
});

test('EVT_31_FINAL_001 current existence-only sport gates no longer prove a final', () => {
  const state = veteranState(31);
  state.flags.FINAL_CONTEXT = true;
  state.sport.roleScore = 100;
  const event = byId('EVT_31_FINAL_001');
  const root = narrativeConditionRoot(state);

  assert.equal(root.facts.sport.currentCompetition, 'league');
  assert.ok(event.tags?.includes('t51_sport_authority_required'));
  assert.ok(event.gates.some(g => g.path === 'facts.sport.currentCompetition' && g.op === 'exists'));
  assert.ok(event.gates.some(g => g.path === 'facts.sport.nextFixture' && g.op === 'exists'));
  assert.equal(eventGatesPass(state, event), true, 'characterization: ordinary league fixture currently satisfies the partial gate');

  const row = debt.scenes.find(scene => scene.eventId === event.id);
  assert.equal(row?.status, 'partial_guard_insufficient_after_match_model');
  assert.match(row.risk, /not a final/i);
});

test('EVT_33_BODY_001 current existence-only timing gates do not prove two starts inside 72h', () => {
  const state = veteranState(33);
  state.professional.recoveryMargin = 0;
  const event = byId('EVT_33_BODY_001');
  const root = narrativeConditionRoot(state);

  assert.equal(root.facts.sport.hoursToNextFixture, 144);
  assert.equal(root.facts.match.playerStarted, null);
  assert.ok(event.tags?.includes('t51_sport_authority_required'));
  assert.ok(event.gates.some(g => g.path === 'facts.sport.nextFixture' && g.op === 'exists'));
  assert.ok(event.gates.some(g => g.path === 'facts.sport.hoursToNextFixture' && g.op === 'exists'));
  assert.equal(eventGatesPass(state, event), true, 'characterization: existence-only timing gate passes despite a six-day gap and no start-pair evidence');

  const row = debt.scenes.find(scene => scene.eventId === event.id);
  assert.equal(row?.status, 'partial_guard_insufficient_after_match_model');
  assert.match(row.risk, /144\/168-hour league gap/i);
});

test('sport authority characterization does not mutate state or manufacture match records', () => {
  const state = veteranState(33);
  state.professional.recoveryMargin = 0;
  const before = structuredClone(state);
  eventGatesPass(state, byId('EVT_33_BODY_001'));
  assert.deepEqual(state, before);
  assert.equal(state.world.sportMatchModel, undefined);
});
