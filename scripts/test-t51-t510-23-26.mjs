import assert from 'node:assert/strict';
import test from 'node:test';
import { createInitialState } from '../dist/content/initial-state.js';
import { EVENTS } from '../dist/content/events/index.js';
import { EVENTS_23_26 } from '../dist/content/events/23_26/index.js';
import { eventGatesPass, gateAlternatives } from '../dist/narrative/event-gates.js';
import { resolveChoice } from '../dist/narrative/resolver.js';
import { contentIdentity } from '../dist/session/content-identity.js';
import {
  CONTENT_MIGRATION_ROUTES,
  T51_B1A_CONTENT_IDENTITY,
  T510_CONTENT_IDENTITY,
  applyMigrationPathInPlace,
  findMigrationPath,
  findMigrationRoute
} from '../dist/session/content-migration.js';
import { PRE_T51_CONTENT_IDENTITY } from '../dist/session/pre-t51-legacy-registry.js';

const T510_IDS = ['EVT_23_BRIDGE_001', 'EVT_23_AGT_001', 'EVT_23_BODY_001'];

const byId = id => {
  const rows = EVENTS_23_26.filter(event => event.id === id);
  assert.equal(rows.length, 1, `${id} must have exactly one active runtime definition`);
  return rows[0];
};

const labels = event => event.choices.map(choice => choice.label);
const transitions = event => event.outcomes.flatMap(outcome => outcome.seedTransitions ?? []);
const effectPaths = event => event.outcomes.flatMap(outcome => outcome.effects ?? []).map(effect => effect.kind === 'flag' ? `flags.${effect.flag}` : effect.path);

const bridge = () => byId('EVT_23_BRIDGE_001');
const agent = () => byId('EVT_23_AGT_001');
const body = () => byId('EVT_23_BODY_001');

test('T5.10 activates the three canonical identities and exact decision labels', () => {
  assert.equal(bridge().text.title, 'Ya no eres proyecto');
  assert.deepEqual(labels(bridge()), [
    'Pedir garantías deportivas concretas antes de hablar de dinero',
    'Priorizar salario y duración, aceptando competir',
    'Mantener contrato actual y esperar un mercado mejor',
    'Pedir que tu agente escuche todo sin comprometerte'
  ]);

  assert.equal(agent().text.title, 'La videollamada sin tu agente');
  assert.deepEqual(labels(agent()), [
    'Aceptar y avisar al agente después',
    'Reenviar el contacto al agente antes de responder',
    'Aceptar con tu agente presente',
    'No responder hasta que haya oferta formal'
  ]);

  assert.equal(body().text.title, 'El GPS');
  assert.deepEqual(labels(body()), [
    'Seguir el plan preventivo',
    'Entrenar todo mientras no haya dolor',
    'Reducir carga solo después de partidos completos',
    'Pedir segunda valoración externa y aplazar el cambio'
  ]);

  for (const event of [bridge(), agent(), body()]) assert.equal(event.canonStatus, 'verified');
});

test('bridge is a one-shot age-23 transition scene without signing a contract', () => {
  const event = bridge();
  assert.deepEqual(event.ageWindow, [23, 23]);
  assert.deepEqual(event.timeWindow?.months, [7]);
  assert.ok(event.tags?.includes('hard_deadline'));
  assert.deepEqual(event.seedsRead, ['SEED_AGENT_POWER']);
  assert.deepEqual(event.seedsWrite, ['SEED_ELITE_ROLE_BARGAIN']);
  assert.ok(transitions(event).every(t => t.seedId === 'SEED_ELITE_ROLE_BARGAIN' && t.action === 'create'));
  assert.ok(effectPaths(event).every(path => !path.startsWith('contract.') && path !== 'club'));
});

test('direct recruiter scene requires plausible market interest and never creates a formal offer by effects', () => {
  const event = agent();
  assert.deepEqual(event.gates, [{ path: 'reputation.marketHeat', op: 'gte', value: 30 }]);
  assert.deepEqual(event.seedsRead, ['SEED_AGENT_POWER']);
  assert.deepEqual(event.seedsWrite, ['SEED_DIRECT_RECRUIT']);
  assert.ok(transitions(event).every(t => t.seedId === 'SEED_DIRECT_RECRUIT' && t.action === 'create'));
  assert.ok(effectPaths(event).every(path => !path.startsWith('contract.') && !path.startsWith('market.') && path !== 'club'));

  const state = createInitialState(424242);
  state.age = 23;
  state.phase = '23_26';
  state.date = '2026-08-15';
  state.reputation.marketHeat = 45;
  const marketBefore = structuredClone(state.market);
  const result = resolveChoice(state, event, 'A');
  assert.deepEqual(result.state.market, marketBefore, 'informal recruiter call must not manufacture/accept a CareerOffer');
  const memory = result.state.seeds.find(seed => seed.id === 'SEED_DIRECT_RECRUIT');
  assert.ok(memory);
  assert.equal(memory.originEvent, 'EVT_23_AGT_001');
  assert.equal(memory.payload.handling, 'direct_then_inform');
});

test('GPS scene uses true causal OR: load signal OR prior body precedent', () => {
  const event = body();
  assert.deepEqual(event.gates, []);
  assert.deepEqual(gateAlternatives(event), [
    [{ path: 'professional.bodyLoad', op: 'gte', value: 28 }],
    [{ path: 'flags.HAS_SEED_BODY_PRECEDENT', op: 'eq', value: true }]
  ]);
  assert.deepEqual(event.seedsRead, ['SEED_BODY_PRECEDENT']);
  assert.deepEqual(event.seedsWrite, ['SEED_LOAD_MANAGEMENT']);
  assert.ok(event.npcRefs?.includes('NPC_MED_01'));
  assert.ok(transitions(event).every(t => t.seedId === 'SEED_LOAD_MANAGEMENT' && t.action === 'create'));

  const state = createInitialState(424242);
  state.professional.bodyLoad = 12;
  state.flags.HAS_SEED_BODY_PRECEDENT = false;
  assert.equal(eventGatesPass(state, event), false);

  state.professional.bodyLoad = 32;
  assert.equal(eventGatesPass(state, event), true);

  state.professional.bodyLoad = 12;
  state.flags.HAS_SEED_BODY_PRECEDENT = true;
  assert.equal(eventGatesPass(state, event), true);
});

test('GPS resolution records load-management memory without rewriting the old body precedent', () => {
  const event = body();
  const state = createInitialState(777);
  state.age = 23;
  state.phase = '23_26';
  state.date = '2026-09-10';
  state.professional.bodyLoad = 38;
  state.seeds.push({
    id: 'SEED_BODY_PRECEDENT',
    state: 'dormant',
    intensity: 55,
    originEvent: 'EVT_18_MED_001',
    originSeason: state.season,
    npcRefs: ['NPC_MED_01'],
    payload: { precedent: 'old' }
  });
  state.flags.HAS_SEED_BODY_PRECEDENT = true;

  const result = resolveChoice(state, event, 'A');
  const oldSeed = result.state.seeds.find(seed => seed.id === 'SEED_BODY_PRECEDENT');
  const newSeed = result.state.seeds.find(seed => seed.id === 'SEED_LOAD_MANAGEMENT');
  assert.equal(oldSeed?.originEvent, 'EVT_18_MED_001');
  assert.equal(oldSeed?.payload.precedent, 'old');
  assert.equal(newSeed?.originEvent, 'EVT_23_BODY_001');
  assert.equal(newSeed?.payload.plan, 'weekly_prevention');
});

test('T5.10 extends lineage only through B1a -> C and targets the exact active catalog', async () => {
  const actualIdentity = await contentIdentity(EVENTS);
  assert.equal(actualIdentity, T510_CONTENT_IDENTITY);
  assert.equal(findMigrationRoute(PRE_T51_CONTENT_IDENTITY, actualIdentity, CONTENT_MIGRATION_ROUTES), undefined, 'PRE -> C shortcut would make lineage ambiguous');

  const route = findMigrationRoute(T51_B1A_CONTENT_IDENTITY, actualIdentity, CONTENT_MIGRATION_ROUTES);
  assert.ok(route, 'B1a saves need a direct edge to the T5.10 catalog');
  assert.deepEqual(route.seedOriginMappings ?? [], []);
  assert.deepEqual((route.schedulerMappings ?? []).map(mapping => mapping.legacyEventId), T510_IDS);
  for (const mapping of route.schedulerMappings ?? []) {
    assert.equal(mapping.kind, 'distinct_scene');
    assert.equal(mapping.legacyEventId, mapping.canonicalEventId);
    assert.equal(mapping.clearCanonicalSeen, true);
    assert.equal(mapping.clearCanonicalCooldown, true);
  }

  const path = findMigrationPath(PRE_T51_CONTENT_IDENTITY, actualIdentity, CONTENT_MIGRATION_ROUTES);
  assert.ok(path);
  assert.equal(path.length, 2);
  assert.deepEqual(path.map(edge => [edge.sourceContentIdentity, edge.targetContentIdentity]), [
    [PRE_T51_CONTENT_IDENTITY, T51_B1A_CONTENT_IDENTITY],
    [T51_B1A_CONTENT_IDENTITY, T510_CONTENT_IDENTITY]
  ]);
});

test('PRE -> B1a -> C preserves history and seeds while clearing legacy suppression for rewritten exact IDs', () => {
  const path = findMigrationPath(PRE_T51_CONTENT_IDENTITY, T510_CONTENT_IDENTITY, CONTENT_MIGRATION_ROUTES);
  assert.ok(path);
  const state = createInitialState(20260916);
  state.age = 23;
  state.phase = '23_26';
  state.date = '2026-09-01';
  state.seeds.push({
    id: 'SEED_BODY_PRECEDENT',
    state: 'dormant',
    intensity: 50,
    originEvent: 'EVT_18_MED_001',
    originSeason: state.season,
    npcRefs: ['NPC_MED_01'],
    payload: { historical: true }
  });
  for (const eventId of T510_IDS) {
    state.flags[`SEEN_${eventId}`] = true;
    state.eventCooldowns[eventId] = 500;
    state.history.push({
      eventId,
      date: '2026-08-01',
      season: state.season,
      choiceId: 'LEGACY',
      outcomeId: 'LEGACY_OUT',
      club: state.club,
      snapshot: { age: 23, family: 'legacy' },
      salience: 70,
      visibility: 'private'
    });
  }
  const historyBefore = structuredClone(state.history);
  const seedBefore = structuredClone(state.seeds);

  applyMigrationPathInPlace(state, path);

  assert.deepEqual(state.history, historyBefore, 'migration must not relabel historical journal entries');
  assert.deepEqual(state.seeds, seedBefore, 'T5.10 authorizes no historical seed-origin rewrite');
  for (const eventId of T510_IDS) {
    assert.equal(state.flags[`SEEN_${eventId}`], false);
    assert.equal(Object.hasOwn(state.eventCooldowns, eventId), false);
  }
});
