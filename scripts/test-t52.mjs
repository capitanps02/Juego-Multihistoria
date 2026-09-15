import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { EVENTS } from '../dist/content/events/index.js';
import { SEED_CATALOG } from '../dist/catalog/seeds.js';
import { createInitialState } from '../dist/content/initial-state.js';
import { resolveChoiceInPlace } from '../dist/narrative/resolver.js';
import { advanceWorldDayInPlace } from '../dist/simulation/world-simulator.js';

const report = JSON.parse(fs.readFileSync('analysis/2026-09-15/T5.2-seed-lifecycle.json', 'utf8'));
const byId = id => {
  const event = EVENTS.find(candidate => candidate.id === id);
  assert.ok(event, `Falta evento ${id}`);
  return event;
};

test('T5.2 inventario: catálogo, consumidores, transiciones y referencias son trazables', () => {
  assert.equal(report.summary.catalogSeeds, 210);
  assert.equal(report.summary.uniqueCatalogSeeds, 210);
  assert.equal(report.summary.eventCount, 388);
  assert.equal(report.summary.principalEvents, 254);
  assert.equal(report.summary.conditionalEvents, 134);
  assert.equal(report.summary.declaredReaders, 34);
  assert.equal(report.summary.seedsWithoutDeclaredReader.length, 176);
  assert.equal(report.summary.unknownReferences.length, 0);
  assert.equal(report.summary.explicitExpiryDefinitions, 0);
  assert.equal(report.summary.expireTransitions, 0);
  assert.equal(report.rules.noUnknownReferences, true);
  assert.equal(report.rules.expiryRequiresExplicitDate, true);
});

test('T5.2 repetición: crear de nuevo una seed terminal no duplica instancias vivas', () => {
  const state = createInitialState(52);
  const origin = byId('EVT_18_PRE_001');
  resolveChoiceInPlace(state, origin, 'CALL_NANO');
  const seed = state.seeds.find(candidate => candidate.id === 'SEED_NANO_SHADOW');
  assert.ok(seed);
  seed.state = 'resolved';
  state.flags.HAS_SEED_NANO_SHADOW = false;
  resolveChoiceInPlace(state, origin, 'CALL_NANO');
  const instances = state.seeds.filter(candidate => candidate.id === 'SEED_NANO_SHADOW');
  assert.equal(instances.length, 2);
  assert.equal(instances.filter(candidate => !['resolved', 'expired'].includes(candidate.state)).length, 1);
});

test('T5.2 caducidad: una seed con expiresAfter se marca expired al cruzar la fecha', () => {
  const state = createInitialState(53);
  state.date = '2026-07-01';
  state.seeds.push({
    id: 'SEED_NANO_SHADOW', state: 'active', intensity: 50,
    originEvent: 'EVT_18_PRE_001', originSeason: state.season,
    npcRefs: ['NPC_PLR_14'], payload: {}, expiresAfter: '2026-07-02',
    lastTouchedDate: '2026-07-01'
  });
  state.flags.HAS_SEED_NANO_SHADOW = true;
  advanceWorldDayInPlace(state);
  const seed = state.seeds.find(candidate => candidate.id === 'SEED_NANO_SHADOW');
  assert.equal(seed?.state, 'expired');
  assert.equal(state.flags.HAS_SEED_NANO_SHADOW, false);
});
