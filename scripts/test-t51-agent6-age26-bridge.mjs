import assert from 'node:assert/strict';
import test from 'node:test';
import { createInitialState } from '../dist/content/initial-state.js';
import { EVENTS_26_30 } from '../dist/content/events/26_30/index.js';
import { T515_STAGED_PRINCIPAL_EVENTS_26 } from '../dist/content/events/26_30/t515-principal-events.js';
import { eventGatesPass } from '../dist/narrative/event-gates.js';
import { resolveChoice } from '../dist/narrative/resolver.js';
import { scheduleEvent } from '../dist/narrative/scheduler.js';

const bridge = T515_STAGED_PRINCIPAL_EVENTS_26[0];

function createState() {
  const state = createInitialState(61501);
  state.age = 26;
  state.phase = '26_30';
  state.date = '2026-07-05';
  state.runtime.seasonDay = 4;
  state.runtime.daysSinceNarrative = 30;
  return state;
}

test('Agent6 age26 bridge preserves the canonical identity and four decisions', () => {
  assert.equal(bridge.id, 'EVT_26_BRIDGE_001');
  assert.equal(bridge.text.title, 'Ya no te pagan por potencial');
  assert.deepEqual(bridge.choices.map(choice => choice.label), [
    'Pedir que definan tu rol, no tu precio',
    'Aceptar el marco y negociar dinero',
    'Preguntar por fichajes previstos en tu posición',
    'No reaccionar y dejar que el mercado hable'
  ]);
  assert.deepEqual(bridge.gates, []);
  assert.equal(eventGatesPass(createState(), bridge), true);
  assert.ok(bridge.tags?.includes('mandatory_transition'));
});

test('Agent6 age26 bridge creates PEAK_IDENTITY without reinterpreting prior memory', () => {
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
  const result = resolveChoice(state, bridge, 'ASK_SIGNINGS');
  const prior = result.state.seeds.find(seed => seed.id === 'SEED_STAR_COMPETITION');
  const created = result.state.seeds.find(seed => seed.id === 'SEED_PEAK_IDENTITY');
  assert.equal(prior?.originEvent, 'EVT_24_CCH_001');
  assert.equal(created?.originEvent, 'EVT_26_BRIDGE_001');
  assert.equal(created?.payload.stance, 'ask_signings');
});

test('Agent6 age26 bridge does not sign, transfer or mutate pending offers', () => {
  const before = createState();
  const club = before.club;
  const contract = structuredClone(before.contract);
  const pending = structuredClone(before.market.pending);
  const result = resolveChoice(before, bridge, 'NEGOTIATE_MONEY');
  assert.equal(result.state.club, club);
  assert.deepEqual(result.state.contract, contract);
  assert.deepEqual(result.state.market.pending, pending);
});

test('Agent6 age26 bridge is active after the integration-owned lineage handoff', () => {
  assert.equal(EVENTS_26_30.some(event => event.id === 'EVT_26_BRIDGE_001'), true);
  assert.equal(EVENTS_26_30.some(event => event.id === 'EVT_26_IDN_001'), false);
});

test('Agent6 age26 bridge can win phase-boundary scheduling when evaluated as candidate', () => {
  const state = createState();
  state.runtime.seasonDay = 0;
  state.runtime.daysSinceNarrative = 0;
  const scheduled = scheduleEvent(state, [bridge], { currentTick: state.runtime.day });
  assert.equal(scheduled?.event.id, 'EVT_26_BRIDGE_001');
});
