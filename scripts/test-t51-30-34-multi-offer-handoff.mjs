import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { EVENTS } from '../dist/content/events/index.js';
import { createInitialState } from '../dist/content/initial-state.js';
import { careerTerms, getActiveCareerOffers, getEligibleCareerOffers } from '../dist/simulation/offers.js';
import { offerBridgeSpec } from '../dist/narrative/offer-bridge.js';

const handoff = JSON.parse(fs.readFileSync('analysis/T5.1/canon-30-34-multi-offer-handoff.json', 'utf8'));
const debt = JSON.parse(fs.readFileSync('analysis/T5.1/canon-30-34-authority-debt.json', 'utf8'));

const byId = id => {
  const event = EVENTS.find(row => row.id === id);
  assert.ok(event, `${id} must exist in active catalog`);
  return event;
};

test('C006 handoff is anchored to both current multi-offer blockers', () => {
  assert.equal(handoff.sourceMainSha, debt.sourceMainSha);
  assert.equal(handoff.status, 'shared_market_multi_offer_persistence_required');
  assert.deepEqual(handoff.consumers.map(row => row.eventId).sort(), ['EVT_31_MKT_001', 'EVT_33_MKT_001']);

  for (const id of ['EVT_31_MKT_001', 'EVT_33_MKT_001']) {
    const row = debt.scenes.find(scene => scene.eventId === id);
    assert.ok(row, `${id}: missing authority debt`);
    assert.equal(row.status, 'blocked_shared_multi_offer_authority');
    assert.equal(byId(id).canonStatus, 'technical_adaptation');
    assert.equal(offerBridgeSpec(byId(id)), undefined, `${id}: must not bridge through singleton pending authority`);
  }
});

test('C006 current persisted market authority remains singleton despite plural read APIs', () => {
  const state = createInitialState(313131);
  const before = careerTerms(state);
  state.market = {
    version: 1,
    sequence: 1,
    history: [],
    pending: {
      id: 'offer:single-proof',
      date: state.date,
      reason: 'Oferta formal',
      before,
      terms: { ...before, months: 12 }
    }
  };

  assert.equal(Array.isArray(state.market.pending), false);
  assert.equal(getActiveCareerOffers(state).length, 1);
  assert.equal(getEligibleCareerOffers(state).length, 1);
  assert.equal(handoff.currentRuntime.actualPersistedCardinality, 1);
  assert.match(handoff.currentRuntime.persistedPendingShape, /CareerOffer \| null/);
});

test('C006 refuses to invent terms or sibling-offer lifecycle semantics', () => {
  assert.deepEqual(handoff.canonicalValuesNotEstablishedByThisWorkstream, {
    offer31ExactTerms: null,
    offer33ExactTerms: null,
    simultaneousOfferOrderingPolicy: null,
    nonSelectedOfferDisposition: null,
    crossOfferCounterSemantics: null
  });
  assert.equal(handoff.ownership.workstreamMayEncodeExtraOffersAsNarrativeFlags, false);
  assert.equal(handoff.ownership.workstreamMayEncodeExtraOffersAsSeeds, false);
  assert.equal(handoff.ownership.workstreamMayInventOfferTerms, false);
});

test('C006 shared-authority contract requires identity, persistence, exact response addressing and migration', () => {
  const requirements = handoff.requiredCapabilities.join('\n');
  assert.match(requirements, /stable identity and exact provenance per offer/i);
  assert.match(requirements, /exact offer identity/i);
  assert.match(requirements, /save and restore/i);
  assert.match(requirements, /non-selected sibling offers/i);
  assert.match(requirements, /idempotence/i);
  assert.match(requirements, /singleton pending field/i);
});

test('C006 acceptance evidence covers two-offer and four-offer cardinalities without shadow narrative state', () => {
  const evidence = handoff.codexAcceptanceEvidence.join('\n');
  assert.match(evidence, /at least two simultaneously active offers/i);
  assert.match(evidence, /Four-offer capacity/i);
  assert.match(evidence, /selected offer id/i);
  assert.match(evidence, /zero narrative RNG/i);
  assert.match(evidence, /phantom siblings/i);
  assert.match(evidence, /choice text, flags, seeds and prestige/i);
});
