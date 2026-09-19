import assert from 'node:assert/strict';
import test from 'node:test';
import { createInitialState } from '../dist/content/initial-state.js';
import { EVENTS_26_30 } from '../dist/content/events/26_30/index.js';
import { T521_STAGED_FIN29_PRINCIPAL_EVENTS } from '../dist/content/events/26_30/t521-staged-fin29-principal-events.js';
import { resolveChoice } from '../dist/narrative/resolver.js';
import { careerTerms } from '../dist/simulation/offers.js';

const event = T521_STAGED_FIN29_PRINCIPAL_EVENTS[0];
const expected = [
  ['MAXIMUM', 'Quiero seguir compitiendo por lo máximo aunque juegue menos', 'maximum'],
  ['WEEKLY_IMPORTANCE', 'Quiero ser importante cada semana', 'minutes'],
  ['BODY_FAMILY_STABILITY', 'Quiero proteger cuerpo, familia y estabilidad', 'body'],
  ['FREEDOM_REINVENTION', 'Quiero libertad para moverme y reinventarme', 'freedom'],
  ['LEGACY', 'Quiero que mi siguiente decisión tenga sentido para mi legado, aunque no maximice otra variable', 'legacy']
];

function state29(seed = 62101) {
  const state = createInitialState(seed);
  state.age = 29;
  state.phase = '26_30';
  state.date = '2037-05-20';
  state.season = '2036-37';
  state.runtime.seasonDay = 323;
  state.professional.initializedAt26 = true;
  return state;
}

test('Agent6 FIN29 exposes all five canonical age-30 priorities', () => {
  assert.equal(event.id, 'EVT_29_FIN_001');
  assert.equal(event.text.title, 'Cumples 30');
  assert.deepEqual(event.timeWindow?.months, [5, 6]);
  assert.ok(event.tags?.includes('hard_deadline'));
  assert.deepEqual(event.choices.map(choice => [choice.id, choice.label]), expected.map(([id, label]) => [id, label]));
});

test('Agent6 FIN29 records preference without mutating career terms or sporting state', () => {
  for (const [choiceId, , priority] of expected) {
    const state = state29(62110 + choiceId.length);
    const beforeTerms = careerTerms(state);
    const beforeSport = structuredClone(state.sport);
    const beforeProfessional = structuredClone(state.professional);
    const beforeBody = structuredClone(state.body);
    const result = resolveChoice(state, event, choiceId);

    assert.equal(result.state.world.age30Priority, priority);
    assert.deepEqual(careerTerms(result.state), beforeTerms);
    assert.deepEqual(result.state.sport, beforeSport);
    assert.deepEqual(result.state.professional, beforeProfessional);
    assert.deepEqual(result.state.body, beforeBody);

    const memory = result.state.seeds.find(seed => seed.id === 'SEED_AGE30_PRIORITY');
    assert.equal(memory?.originEvent, 'EVT_29_FIN_001');
    assert.equal(memory?.payload.priority, priority);
    assert.equal(memory?.payload.advisory, true);
  }
});

test('Agent6 FIN29 preserves the age-26 priority as historical context', () => {
  const state = state29(62140);
  state.seeds.push({
    id: 'SEED_AGE26_PRIORITY', state: 'dormant', intensity: 55,
    originEvent: 'EVT_25_END_001', originSeason: '2032-33', npcRefs: [],
    payload: { priority: 'role' }, lastTouchedDate: '2033-05-20'
  });
  state.flags.HAS_SEED_AGE26_PRIORITY = true;
  const before = structuredClone(state.seeds[0]);
  const result = resolveChoice(state, event, 'MAXIMUM');
  assert.deepEqual(result.state.seeds.find(seed => seed.id === 'SEED_AGE26_PRIORITY'), before);
});

test('Agent6 FIN29 stays staged while replacing the active four-choice placeholder semantically', () => {
  const active = EVENTS_26_30.find(candidate => candidate.id === 'EVT_29_FIN_001');
  assert.ok(active, 'active placeholder must still exist until integration-owned replacement');
  assert.equal(active.choices.length, 4, 'current active generation still has four choices');
  assert.equal(event.choices.length, 5, 'staged canonical replacement has five choices');
});
