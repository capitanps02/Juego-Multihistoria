import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { EVENTS } from '../dist/content/events/index.js';

const handoff = JSON.parse(fs.readFileSync('analysis/T5.1/canon-30-34-downstream-seed-handoff.json', 'utf8'));
const lifecycle = JSON.parse(fs.readFileSync('analysis/T5.1/canon-30-34-seed-lifecycle.json', 'utf8'));
const readiness = JSON.parse(fs.readFileSync('analysis/T5.1/canon-30-34-implementation-readiness.json', 'utf8'));

const EXPECTED_BOUNDARY_SEEDS = [
  'SEED_72H_LIMIT',
  'SEED_AGE34_PRIORITY',
  'SEED_FINAL_FOUR_WAYS',
  'SEED_HOME_PULL_PUBLIC',
  'SEED_RETIREMENT_PUBLIC_TONE',
  'SEED_VETERAN_LEADERSHIP_FINAL'
].sort();

const ORPHAN_SEEDS = new Set([
  'SEED_ROLE_COMMUNICATION',
  'SEED_FALSE_ULTIMATUM',
  'SEED_NATIONAL_ABSENCE',
  'SEED_SPECIALIST_BIGCLUB'
]);

const producingActions = new Set(['create', 'activate', 'intensify', 'transform']);

function seedWriters(seedId) {
  return EVENTS.filter(event =>
    (event.outcomes ?? []).some(outcome =>
      (outcome.seedTransitions ?? []).some(transition =>
        transition.seedId === seedId && producingActions.has(transition.action)
      )
    )
  ).map(event => event.id).sort();
}

test('downstream handoff is explicitly non-prescriptive and anchored to the current 30-34 baseline', () => {
  assert.equal(handoff.schemaVersion, 1);
  assert.equal(handoff.policy.structuralReadIsNotConsumption, true);
  assert.equal(handoff.policy.nameSimilarityIsNotCausality, true);
  assert.equal(handoff.policy.noArtificialTerminality, true);
  assert.equal(handoff.policy.noConsumerInventedByThisWorkstream, true);
  assert.equal(handoff.policy.futureValidConsumerAllowed, true);
  assert.equal(handoff.policy.downstreamOwnerMustChooseReaderTerminalOrOpen, true);
  assert.match(handoff.integrationRule, /non-prescriptive/i);
  assert.equal(handoff.sourceMainSha, lifecycle.sourceMainSha);
  assert.equal(readiness.base, `main@${handoff.sourceMainSha}`);
  assert.equal(handoff.consumerMatrixEvidence.snapshotBaseCommit, 'cda24da1a688cc245695cd007c50d458c4e1e7d7');
  assert.match(handoff.consumerMatrixEvidence.rule, /evidence snapshot/i);
});

test('boundary handoff contains exactly the six reviewed 30-34 seeds and no orphan-writer seed', () => {
  const ids = handoff.handoffs.map(row => row.seedId).sort();
  assert.deepEqual(ids, EXPECTED_BOUNDARY_SEEDS);
  assert.equal(new Set(ids).size, ids.length);
  assert.equal(ids.some(id => ORPHAN_SEEDS.has(id)), false);
  assert.equal(handoff.handoffs.every(row => row.currentStatus === 'review_required_no_demonstrated_live_consumer'), true);
  assert.equal(handoff.handoffs.every(row => row.reviewTarget && row.requiredDecision), true);
  assert.deepEqual([...lifecycle.downstreamBoundaryHandoff.seeds].sort(), EXPECTED_BOUNDARY_SEEDS);
  assert.equal(lifecycle.downstreamBoundaryHandoff.path, 'analysis/T5.1/canon-30-34-downstream-seed-handoff.json');
});

test('producer evidence matches current runtime writers without editorial provenance aliases', () => {
  for (const row of handoff.handoffs) {
    const expected = [...row.currentProducerEvidence].sort();
    assert.deepEqual(seedWriters(row.seedId), expected, `${row.seedId}: producer evidence drifted from runtime`);
    assert.equal(expected.includes('PASADA_6_30_34'), false, `${row.seedId}: editorial provenance must not become runtime producer`);
  }
});

test('SEED_LAST_BIG_MOVE_WINDOW stays outside the boundary handoff and retains its actual writer', () => {
  const row = handoff.nonBoundaryOpenSeedExample;
  assert.equal(row.seedId, 'SEED_LAST_BIG_MOVE_WINDOW');
  assert.equal(handoff.handoffs.some(entry => entry.seedId === row.seedId), false);
  assert.deepEqual(seedWriters(row.seedId), [...row.producerEvidence].sort());
  assert.equal(row.status, 'still_open_not_promoted_to_boundary_handoff');
});
