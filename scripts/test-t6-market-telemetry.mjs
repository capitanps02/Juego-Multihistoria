import test from 'node:test';
import assert from 'node:assert/strict';
import { createMarketTelemetry, finalizeMarketTelemetry, recordMarketDecision } from './t6-market-telemetry.mjs';

function terms(months, salary = 1000) {
  return {
    club: 'A', tier: 2, months, salary, releaseClause: null,
    ownerClub: 'A', registrationClub: 'A', leagueTier: 2,
    prestigeTier: 3, prestigeScore: 50, route: 'home',
    abroad: false, loan: false, bigClub: false
  };
}

function decision(id, date, reason, before, proposed, accepted = false) {
  return { offer: { id, date, reason, before, terms: proposed }, action: accepted ? 'accept' : 'reject', accepted };
}

test('logical source-state reoffers are detected even when technical offer IDs and proposed terms differ', () => {
  const telemetry = createMarketTelemetry();
  const before = terms(0);
  recordMarketDecision(telemetry, {
    phase: '20_23', action: 'reject',
    decision: decision('offer:1', '2028-01-07', 'Renovación de contrato', before, terms(30, 1200))
  });
  recordMarketDecision(telemetry, {
    phase: '20_23', action: 'reject',
    decision: decision('offer:2', '2028-01-14', 'Renovación de contrato', before, terms(36, 1300))
  });
  recordMarketDecision(telemetry, {
    phase: '20_23', action: 'reject',
    decision: decision('offer:3', '2028-01-21', 'Renovación de contrato', before, terms(30, 1200))
  });

  const result = finalizeMarketTelemetry(telemetry);
  assert.equal(result.uniqueOfferIds, 3);
  assert.equal(result.duplicateOfferIds, 0);
  assert.equal(result.uniqueLogicalSourceStates, 1);
  assert.equal(result.repeatedLogicalSourceOffers, 2);
  assert.equal(result.maxOffersFromSameSourceState, 3);
  assert.equal(result.topRepeatedSourceStates[0].reason, 'Renovación de contrato');
  assert.equal(result.topRepeatedSourceStates[0].before.months, 0);
  assert.equal(result.uniqueExactOfferVariants, 2);
  assert.equal(result.repeatedExactOfferVariants, 1);
  assert.equal(result.maxExactOfferVariantRepeats, 2);
});

test('accepted term changes produce a new logical source state', () => {
  const telemetry = createMarketTelemetry();
  recordMarketDecision(telemetry, {
    phase: '20_23', action: 'accept',
    decision: decision('offer:1', '2028-01-07', 'Renovación de contrato', terms(0), terms(30), true)
  });
  recordMarketDecision(telemetry, {
    phase: '23_26', action: 'reject',
    decision: decision('offer:2', '2030-01-07', 'Renovación de contrato', terms(5), terms(36))
  });
  const result = finalizeMarketTelemetry(telemetry);
  assert.equal(result.uniqueLogicalSourceStates, 2);
  assert.equal(result.repeatedLogicalSourceOffers, 0);
  assert.equal(result.accepted, 1);
  assert.equal(result.rejected, 1);
});
