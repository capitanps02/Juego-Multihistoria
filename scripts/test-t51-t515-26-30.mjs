import assert from 'node:assert/strict';
import test from 'node:test';
import { createInitialState } from '../dist/content/initial-state.js';
import { EVENTS_26_30 } from '../dist/content/events/26_30/index.js';
import { T515_STAGED_PRINCIPAL_EVENTS_26 } from '../dist/content/events/26_30/t515-principal-events.js';
import { eventGatesPass } from '../dist/narrative/event-gates.js';
import { resolveChoice } from '../dist/narrative/resolver.js';
import { scheduleEvent } from '../dist/narrative/scheduler.js';

const bridge = () => {
  assert.equal(T515_STAGED_PRINCIPAL_EVENTS_26.length, 1);
  return T515_STAGED_PRINCIPAL_EVENTS_26[0];
};

const labels = event => event.choices.map(choice => choice.label);
const transitions = event => event.outcomes.flatMap(outcome => outcome.seedTransitions ?? []);
const effectPaths = event => event.outcomes.flatMap(outcome => outcome.effects ?? []).map(effect => effect.kind === 'flag' ? `flags.${effect.flag}` : effect.path);

test('T5.15 stages the exact canonical age-26 bridge semantics', () => {
  const event = bridge();
  assert.equal(event.id, 'EVT_26_BRIDGE_001');
  assert.equal(event.text.title, 'Ya no te pagan por potencial');
  assert.deepEqual(event.ageWindow, [26, 26]);
  assert.equal(event.phase, '26_30');
  assert.equal(event.canonStatus, 'verified');
  assert.deepEqual(labels(event), [
    'Pedir que definan tu rol, no tu precio',
    'Aceptar el marco y negociar dinero',
    'Preguntar por fichajes previstos en tu posición',
    'No reaccionar y dejar que el mercado hable'
  ]);
  assert.ok(event.intel?.visible?.some(line => /contrato actual/i.test(line)));
  assert.ok(event.intel?.uncertain?.some(line => /presión negociadora/i.test(line)));
  assert.ok(event.intel?.uncertain?.some(line => /dirección deportiva y entrenador/i.test(line)));
});

test('T5.15 bridge is mandatory at the age-26 phase boundary without inventing a gate', () => {
  const event = bridge();
  assert.deepEqual(event.gates, []);
  assert.equal(eventGatesPass(createState(), event), true);
  assert.ok(event.tags?.includes('mandatory_transition'));
  assert.deepEqual(event.timeWindow?.months, [7, 8]);

  const state = createState();
  state.runtime.seasonDay = 0;
  state.runtime.daysSinceNarrative = 0;
  const scheduled = scheduleEvent(state, [event], { currentTick: state.runtime.day });
  assert.equal(scheduled?.event.id, 'EVT_26_BRIDGE_001');
});

test('T5.15 bridge uses STAR_COMPETITION as prior memory and creates PEAK_IDENTITY canonically', () => {
  const event = bridge();
  assert.deepEqual(event.seedsRead, ['SEED_STAR_COMPETITION']);
  assert.deepEqual(event.seedsWrite, ['SEED_PEAK_IDENTITY']);
  assert.ok(transitions(event).length > 0);
  assert.ok(transitions(event).every(row => row.seedId === 'SEED_PEAK_IDENTITY' && row.action === 'create'));

  const state = createState();
  state.seeds.push({
    id: 'SEED_STAR_COMPETITION',
    state: 'dormant',
    intensity: 54,
    originEvent: 'EVT_24_CCH_001',
    originSeason: state.season - 2,
    npcRefs: [],
    payload: { historical: true }
  });
  state.flags.HAS_SEED_STAR_COMPETITION = true;

  const result = resolveChoice(state, event, 'ASK_SIGNINGS');
  const prior = result.state.seeds.find(seed => seed.id === 'SEED_STAR_COMPETITION');
  const created = result.state.seeds.find(seed => seed.id === 'SEED_PEAK_IDENTITY');
  assert.equal(prior?.originEvent, 'EVT_24_CCH_001');
  assert.equal(prior?.payload.historical, true);
  assert.equal(created?.originEvent, 'EVT_26_BRIDGE_001');
  assert.equal(created?.payload.stance, 'ask_signings');
});

test('T5.15 bridge choices stay narrative: no transfer, contract signing or pending-offer mutation', () => {
  const event = bridge();
  const paths = effectPaths(event);
  assert.ok(paths.every(path => path !== 'club'));
  assert.ok(paths.every(path => !path.startsWith('contract.')));
  assert.ok(paths.every(path => !path.startsWith('market.pending')));
  assert.ok(paths.every(path => !path.startsWith('market.offers')));

  const before = createState();
  const club = before.club;
  const contract = structuredClone(before.contract);
  const pending = structuredClone(before.market.pending);
  const result = resolveChoice(before, event, 'NEGOTIATE_MONEY');
  assert.equal(result.state.club, club);
  assert.deepEqual(result.state.contract, contract);
  assert.deepEqual(result.state.market.pending, pending);
});

test('T5.15 bridge outcomes are conditioned by existing peak-state signals', () => {
  const event = bridge();
  const expected = new Map([
    ['ROLE_NOT_PRICE__PRIMARY', 'professional.roleSecurity'],
    ['NEGOTIATE_MONEY__PRIMARY', 'professional.contractPower'],
    ['ASK_SIGNINGS__PRIMARY', 'professional.institutionalPower'],
    ['LET_MARKET_SPEAK__PRIMARY', 'reputation.marketHeat']
  ]);
  for (const [outcomeId, path] of expected) {
    const outcome = event.outcomes.find(row => row.id === outcomeId);
    assert.ok(outcome, `missing ${outcomeId}`);
    assert.equal(outcome.modifiers?.[0]?.conditions?.[0]?.path, path);
    assert.ok((outcome.modifiers?.[0]?.multiply ?? 1) > 1);
  }
});

test('T5.15 remains staged until the coordinator lands the adjacent migration generation', () => {
  assert.equal(EVENTS_26_30.filter(event => event.id === 'EVT_26_BRIDGE_001').length, 0, 'canonical bridge must not be activated without content lineage');
  assert.equal(EVENTS_26_30.filter(event => event.id === 'EVT_26_IDN_001').length, 1, 'legacy event remains active until coordinated migration');
});

function createState() {
  const state = createInitialState(51501);
  state.age = 26;
  state.phase = '26_30';
  state.date = '2026-07-05';
  state.runtime.seasonDay = 4;
  state.runtime.daysSinceNarrative = 30;
  return state;
}
