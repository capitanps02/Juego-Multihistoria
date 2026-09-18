import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState } from '../dist/content/initial-state.js';
import {
  CANONICAL_34_PLUS_SEED_PRODUCERS,
  LEGACY_34_PLUS_TECHNICAL_SEED_IDS,
  SEED_34_PLUS_BRIDGE_COMPATIBILITY,
  isCompatibilityOnly34PlusSeed
} from '../dist/catalog/seed-34plus.js';
import { SEED_CATALOG_34_PLUS, SEED_IDS } from '../dist/catalog/seeds.js';
import { resolveChoiceInPlace } from '../dist/narrative/resolver.js';
import { loadSave, serializeSave } from '../dist/save/save.js';

function seedCreateEvent(id, seedId) {
  return {
    id,
    ageWindow: [34, null],
    phase: '34_plus',
    family: 'conditional',
    gates: [],
    cooldown: 0,
    repeatable: false,
    weight: 1,
    text: { title: id, body: 'T5.2 34+ fixture' },
    intel: { visible: [], uncertain: [] },
    choices: [{ id: 'A', label: 'A', intentTags: ['t52_34plus_fixture'], immediateEffects: [], outcomeIds: [`${id}_OUT`] }],
    outcomes: [{
      id: `${id}_OUT`, baseWeight: 1, effects: [], messages: ['ok'],
      seedTransitions: [{ seedId, action: 'create', intensity: 61, payload: { proof: 'canonical' } }]
    }],
    seedsWrite: [seedId]
  };
}

test('T5.2 34+: owner handoff is exactly 54 canonical seeds split 45 Agent 8 + 9 Agent 9', () => {
  assert.equal(CANONICAL_34_PLUS_SEED_PRODUCERS.length, 54);
  assert.equal(CANONICAL_34_PLUS_SEED_PRODUCERS.filter(row => row.owner === 'agent8').length, 45);
  assert.equal(CANONICAL_34_PLUS_SEED_PRODUCERS.filter(row => row.owner === 'agent9').length, 9);
  assert.equal(new Set(CANONICAL_34_PLUS_SEED_PRODUCERS.map(row => row.seedId)).size, 54);
});

test('T5.2 34+: catalog contains 14 compatibility memories plus the 54 exact canonical identities once each', () => {
  assert.equal(SEED_34_PLUS_BRIDGE_COMPATIBILITY.length, 14);
  assert.equal(SEED_34_PLUS_BRIDGE_COMPATIBILITY.filter(row => row.classification === 'pre34_canonical_memory').length, 1);
  assert.equal(SEED_34_PLUS_BRIDGE_COMPATIBILITY.filter(row => row.classification === 'derived_projection').length, 13);
  assert.equal(SEED_CATALOG_34_PLUS.length, 68);
  assert.equal(new Set(SEED_CATALOG_34_PLUS.map(seed => seed.id)).size, 68);

  const byId = new Map(SEED_CATALOG_34_PLUS.map(seed => [seed.id, seed]));
  for (const row of SEED_34_PLUS_BRIDGE_COMPATIBILITY) {
    assert.ok(isCompatibilityOnly34PlusSeed(row.seedId));
    assert.deepEqual(byId.get(row.seedId)?.originEvents, [], `${row.seedId} must not claim a new 34+ origin`);
  }
  for (const row of CANONICAL_34_PLUS_SEED_PRODUCERS) {
    assert.deepEqual(byId.get(row.seedId)?.originEvents, [row.producerEventId], `${row.seedId} provenance mismatch`);
  }
});

test('T5.2 34+: old technical Pasada-7 identities are compatibility history, not new canonical catalog IDs', () => {
  assert.equal(LEGACY_34_PLUS_TECHNICAL_SEED_IDS.length, 54);
  assert.equal(new Set(LEGACY_34_PLUS_TECHNICAL_SEED_IDS).size, 54);
  const canonical = new Set(CANONICAL_34_PLUS_SEED_PRODUCERS.map(row => row.seedId));
  for (const legacyId of LEGACY_34_PLUS_TECHNICAL_SEED_IDS) {
    assert.equal(SEED_IDS.has(legacyId), false, `${legacyId} must not remain creatable as an authoritative catalog seed`);
    assert.equal(canonical.has(legacyId), false, `${legacyId} must not be heuristically aliased to a canonical ID`);
  }
});

test('T5.2 34+: compatibility-only bridge memories cannot be newly created', () => {
  const state = createInitialState(8801);
  assert.throws(
    () => resolveChoiceInPlace(state, seedCreateEvent('T52_34_BRIDGE_COMPAT', 'SEED_PEAK_BODY_MEMORY'), 'A'),
    /Compatibility-only seed SEED_PEAK_BODY_MEMORY/
  );
  assert.equal(state.seeds.some(seed => seed.id === 'SEED_PEAK_BODY_MEMORY'), false);
});

test('T5.2 34+: exact canonical producer creates exact originEvent without aliasing', () => {
  const row = CANONICAL_34_PLUS_SEED_PRODUCERS.find(item => item.seedId === 'SEED_FINAL_RELOCATION_TRADEOFF');
  assert.ok(row);
  const state = createInitialState(8802);
  resolveChoiceInPlace(state, seedCreateEvent(row.producerEventId, row.seedId), 'A');
  const seed = state.seeds.find(item => item.id === row.seedId);
  assert.ok(seed);
  assert.equal(seed.originEvent, row.producerEventId);
  assert.equal(seed.intensity, 61);
  assert.equal(seed.payload.proof, 'canonical');
});

test('T5.2 34+: legacy technical save survives verbatim and never materialises a canonical alias', () => {
  const state = createInitialState(8803);
  state.seeds.push({
    id: 'SEED_34_MARKET_SILENCE',
    state: 'active',
    intensity: 77,
    originEvent: 'LEGACY_34_TECHNICAL_EVENT',
    originSeason: state.season,
    npcRefs: [],
    payload: { legacy: true },
    lastTouchedDate: state.date
  });
  const restored = loadSave(serializeSave(state));
  const legacy = restored.seeds.find(seed => seed.id === 'SEED_34_MARKET_SILENCE');
  assert.ok(legacy);
  assert.equal(legacy.originEvent, 'LEGACY_34_TECHNICAL_EVENT');
  assert.equal(legacy.intensity, 77);
  assert.equal(legacy.payload.legacy, true);
  assert.equal(restored.seeds.some(seed => CANONICAL_34_PLUS_SEED_PRODUCERS.some(row => row.seedId === seed.id)), false);
});

test('T5.2 34+: pre-34 FORM_VS_PLAN provenance survives save/load unchanged', () => {
  const state = createInitialState(8804);
  state.seeds.push({
    id: 'SEED_FORM_VS_PLAN',
    state: 'transformed',
    intensity: 64,
    originEvent: 'LEGACY_PRE34_FORM_EVENT',
    originSeason: '2038-39',
    npcRefs: [],
    payload: { stance: 'protect_form' },
    lastTouchedDate: state.date
  });
  const restored = loadSave(serializeSave(state));
  const seed = restored.seeds.find(item => item.id === 'SEED_FORM_VS_PLAN');
  assert.ok(seed);
  assert.equal(seed.originEvent, 'LEGACY_PRE34_FORM_EVENT');
  assert.equal(seed.originSeason, '2038-39');
  assert.equal(seed.state, 'transformed');
  assert.equal(seed.payload.stance, 'protect_form');
});
