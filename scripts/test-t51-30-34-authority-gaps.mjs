import test from 'node:test';
import assert from 'node:assert/strict';
import { EVENTS } from '../dist/content/events/index.js';
import { createInitialState } from '../dist/content/initial-state.js';
import { offerBridgeSpec } from '../dist/narrative/offer-bridge.js';
import { careerTerms, getActiveCareerOffers } from '../dist/simulation/offers.js';

const byId = id => {
  const event = EVENTS.find(row => row.id === id);
  assert.ok(event, `${id} must exist in active catalog`);
  return event;
};

test('formal CareerTerms cannot yet prove the minutes-based renewal clause asserted by EVT_32_CON_001', () => {
  const state = createInitialState(320032);
  const terms = careerTerms(state);

  assert.equal(Object.hasOwn(terms, 'renewalByMinutes'), false);
  assert.equal(Object.hasOwn(terms, 'renewalMinutesThreshold'), false);
  assert.equal(Object.hasOwn(terms, 'automaticRenewal'), false);

  const event = byId('EVT_32_CON_001');
  assert.equal(event.canonStatus, 'technical_adaptation');
  assert.ok(offerBridgeSpec(event), 'the scene may consume a formal offer without claiming clause parity');
});

test('shared market authority exposes at most the single persisted pending CareerOffer', () => {
  const state = createInitialState(313133);
  assert.deepEqual(getActiveCareerOffers(state), []);

  const before = careerTerms(state);
  state.market = {
    version: 1,
    sequence: 1,
    history: [],
    pending: {
      id: 'offer:single-authority-proof',
      date: state.date,
      reason: 'Oferta formal',
      before,
      terms: { ...before, months: 12 }
    }
  };

  const active = getActiveCareerOffers(state);
  assert.equal(active.length, 1);
  assert.equal(active[0].id, 'offer:single-authority-proof');
  assert.equal(Array.isArray(state.market.pending), false);
});

test('multi-offer veteran scenes remain outside offerBridge while market authority is single-offer', () => {
  for (const id of ['EVT_31_MKT_001', 'EVT_33_MKT_001']) {
    const event = byId(id);
    assert.equal(offerBridgeSpec(event), undefined, `${id} must not pretend one pending offer proves a multi-offer scene`);
    assert.equal(event.canonStatus, 'technical_adaptation');
  }
});
