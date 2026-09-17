import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { EVENTS } from '../dist/content/events/index.js';

const lifecycle = JSON.parse(fs.readFileSync('analysis/T5.1/canon-30-34-seed-lifecycle.json', 'utf8'));
const byId = new Map(EVENTS.map(event => [event.id, event]));

function scrubDeclaredMetadata(event) {
  const copy = structuredClone(event);
  delete copy.seedsRead;
  delete copy.seedsWrite;
  return copy;
}

function hasRuntimeCausalReference(event, seedId) {
  const suffix = seedId.replace(/^SEED_/, '');
  const text = JSON.stringify(scrubDeclaredMetadata(event));
  return text.includes(`HAS_SEED_${suffix}`) || text.includes(`facts.seed.${seedId}`) || text.includes(`facts.seeds.${seedId}`);
}

test('seed lifecycle does not call declared reads confirmed causal chains', () => {
  assert.equal(lifecycle.policy.seedsReadIsNotCausalConsumption, true);
  assert.deepEqual(lifecycle.causalChainsConfirmed, []);
  assert.equal(lifecycle.declaredReadLinks.length, 7);
  assert.equal(lifecycle.declaredReadLinks.every(row => row.classification === 'declared_memory_context_not_causal_consumption'), true);
});

test('the seven declassified links are declared in seedsRead but have no positive runtime causal reference', () => {
  for (const row of lifecycle.declaredReadLinks) {
    assert.ok(byId.has(row.writer), `${row.seed}: missing writer ${row.writer}`);
    for (const readerId of row.readers) {
      const reader = byId.get(readerId);
      assert.ok(reader, `${row.seed}: missing reader ${readerId}`);
      assert.ok((reader.seedsRead ?? []).includes(row.seed), `${readerId}: ${row.seed} must remain declared memory context`);
      assert.equal(hasRuntimeCausalReference(reader, row.seed), false, `${readerId}: ${row.seed} now has a causal reference; promote the lifecycle row instead of keeping it declared-only`);
    }
  }
});

test('a real positive inbound seed gate stays distinguishable from declared-only memory', () => {
  const medical = byId.get('EVT_31_MED_001');
  assert.ok(medical);
  assert.ok((medical.seedsRead ?? []).includes('SEED_CHRONIC_BODY'));
  assert.equal(hasRuntimeCausalReference(medical, 'SEED_CHRONIC_BODY'), true);
  const inbound = lifecycle.inboundReads.find(row => row.seed === 'SEED_CHRONIC_BODY');
  assert.ok(inbound);
  assert.match(inbound.note, /real positive seed-dependent gate/i);
});

test('promotion rule requires a concrete causal surface instead of seed-name similarity', () => {
  assert.match(lifecycle.declaredReadPromotionRule, /exact runtime causal surface/i);
  assert.match(lifecycle.causalChainsConfirmedMeaning, /gate|eligibility|outcome|simulation|terminal/i);
});
