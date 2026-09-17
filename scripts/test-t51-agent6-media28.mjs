import assert from 'node:assert/strict';
import test from 'node:test';
import { createInitialState } from '../dist/content/initial-state.js';
import { EVENTS_26_30 } from '../dist/content/events/26_30/index.js';
import { T516_STAGED_DOC_PRINCIPAL_EVENTS_26 } from '../dist/content/events/26_30/t516-staged-doc-principal-events.js';
import { T520_STAGED_MEDIA_PRINCIPAL_EVENTS_28 } from '../dist/content/events/26_30/t520-staged-media-principal-events.js';
import { eventGatesPass } from '../dist/narrative/event-gates.js';
import { resolveChoice } from '../dist/narrative/resolver.js';

const doc = T516_STAGED_DOC_PRINCIPAL_EVENTS_26[0];
const media = T520_STAGED_MEDIA_PRINCIPAL_EVENTS_28[0];

function state26(seed) {
  const state = createInitialState(seed);
  state.age = 26;
  state.phase = '26_30';
  state.professional.initializedAt26 = true;
  state.professional.publicMyth = 35;
  return state;
}

test('Agent6 MEDIA28 preserves canonical response choices', () => {
  assert.equal(media.id, 'EVT_28_MEDIA_001');
  assert.equal(media.text.title, 'El documental se estrena cuando ya eres otro');
  assert.deepEqual(media.choices.map(choice => choice.label), [
    'No responder',
    'Explicar contexto',
    'Pedir a productora publicar material adicional',
    'Criticar públicamente el montaje'
  ]);
});

test('Agent6 MEDIA28 requires documentary access that was actually granted', () => {
  for (const choiceId of ['BROAD_ACCESS', 'PRIVATE_ZONES', 'LIMITED_VETO']) {
    const granted = resolveChoice(state26(62010 + choiceId.length), doc, choiceId).state;
    granted.age = 28;
    assert.equal(eventGatesPass(granted, media), true, `${choiceId} must authorize later release context`);
  }

  const rejected = resolveChoice(state26(62030), doc, 'REJECT').state;
  rejected.age = 28;
  assert.equal(eventGatesPass(rejected, media), false, 'rejected access must never manufacture a documentary release');
});

test('Agent6 MEDIA28 gate is read-only and candidate remains staged pending fallout-seed catalog lineage', () => {
  const state = resolveChoice(state26(62040), doc, 'PRIVATE_ZONES').state;
  state.age = 28;
  const before = structuredClone(state);
  assert.equal(eventGatesPass(state, media), true);
  assert.deepEqual(state, before);
  assert.equal(EVENTS_26_30.some(candidate => candidate.id === 'EVT_28_MEDIA_001'), false);
  assert.equal(media.seedsWrite.includes('SEED_DOCUMENTARY_FALLOUT'), true);
});
