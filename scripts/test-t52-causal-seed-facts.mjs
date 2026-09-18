import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { SEED_CATALOG } from '../dist/catalog/seeds.js';
import { createInitialState } from '../dist/content/initial-state.js';
import { earlyCareerSeedFacts } from '../dist/narrative/seed-memory.js';
import { T52_CAUSAL_SEED_FACTS } from './t52-causal-seed-facts.mjs';

const lifecycle = JSON.parse(fs.readFileSync('analysis/T5.2/seed-lifecycle.json', 'utf8'));
const lifecycleById = new Map(lifecycle.seeds.map(row => [row.id, row]));

test('T5.2 causal fact registry exactly covers earlyCareerSeedFacts and known seed ids', () => {
  const state = createInitialState(52071);
  const factPaths = Object.keys(earlyCareerSeedFacts(state)).map(key => `facts.${key}`).sort();
  assert.deepEqual(Object.keys(T52_CAUSAL_SEED_FACTS).sort(), factPaths);
  const catalogIds = new Set(SEED_CATALOG.map(seed => seed.id));
  for (const seedId of Object.values(T52_CAUSAL_SEED_FACTS)) assert.equal(catalogIds.has(seedId), true, seedId);
});

test('T5.2 audit recognizes the five integrated 18-20 causal seed consumers', () => {
  const expected = [
    ['SEED_BRUNO_FAVOR', 'CEVT_18_BRUNO_01'],
    ['SEED_COACH_PUBLIC', 'CEVT_18_CCH_01'],
    ['SEED_MENA_EARLY_READ', 'CEVT_18_CCH_01'],
    ['SEED_EXIT_STYLE_UDV', 'CEVT_18_RELEG_01'],
    ['SEED_BODY_PRECEDENT', 'CEVT_19_INJ_01'],
    ['SEED_PHYSIO_CONFIDENCE', 'CEVT_19_INJ_01'],
    ['SEED_EXIT_STYLE_UDV', 'CEVT_19_RETURN_01']
  ];
  for (const [seedId, eventId] of expected) {
    const row = lifecycleById.get(seedId);
    assert.ok(row, `missing lifecycle row ${seedId}`);
    assert.equal(
      row.conditionReadBy.some(read => read.eventId === eventId && read.surface === 'causal_fact'),
      true,
      `${eventId} must be audited as causal fact consumer of ${seedId}`
    );
  }
});


test('load management plan projects exact live payload and never synthesizes a plan', () => {
  const state = createInitialState(52072);
  assert.equal(earlyCareerSeedFacts(state).loadManagementPlan, null);

  state.seeds.push({
    id: 'SEED_LOAD_MANAGEMENT',
    state: 'dormant',
    intensity: 64,
    originEvent: 'EVT_23_BODY_001',
    originSeason: state.season,
    npcRefs: ['NPC_MED_01'],
    payload: { plan: 'weekly_prevention' }
  });

  assert.equal(earlyCareerSeedFacts(state).loadManagementPlan, 'weekly_prevention');
  state.seeds[0].payload.plan = 'external_review_first';
  assert.equal(earlyCareerSeedFacts(state).loadManagementPlan, 'external_review_first');
  state.seeds[0].state = 'resolved';
  assert.equal(earlyCareerSeedFacts(state).loadManagementPlan, null);
});
