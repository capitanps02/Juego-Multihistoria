import test from 'node:test';
import assert from 'node:assert/strict';
import { T6_PROFILES } from './t6-profiles.mjs';
import { buildPairedRunPlan } from './t6-run-plan.mjs';

function sampleKeys(plan) {
  return plan.plan.map(item => `${item.profile.id}:${item.seed}`);
}

test('default paired plan gives all 15 profiles the same seed', () => {
  const plan = buildPairedRunPlan({ profiles: T6_PROFILES, baseSeed: 610000 });
  assert.equal(plan.samplingDesign, 'paired_profile_seed_v1');
  assert.equal(plan.totalRequested, 15);
  assert.equal(plan.cohortCount, 1);
  assert.equal(plan.plan.length, 15);
  assert.deepEqual(new Set(plan.plan.map(item => item.seed)), new Set([610000]));
  assert.equal(new Set(plan.plan.map(item => item.profile.id)).size, 15);
});

test('150 careers are ten complete paired seed cohorts', () => {
  const plan = buildPairedRunPlan({ profiles: T6_PROFILES, baseSeed: 700000, requestedTotal: 150 });
  assert.equal(plan.cohortCount, 10);
  assert.equal(plan.plan.length, 150);
  for (let cohort = 0; cohort < 10; cohort++) {
    const rows = plan.plan.filter(item => item.cohortIndex === cohort);
    assert.equal(rows.length, 15);
    assert.deepEqual(new Set(rows.map(item => item.seed)), new Set([700000 + cohort]));
  }
});

test('explicit totals that cannot form complete profile cohorts are rejected', () => {
  assert.throws(
    () => buildPairedRunPlan({ profiles: T6_PROFILES, requestedTotal: 10000 }),
    /multiple of 15/
  );
  assert.equal(buildPairedRunPlan({ profiles: T6_PROFILES, requestedTotal: 9990 }).cohortCount, 666);
  assert.equal(buildPairedRunPlan({ profiles: T6_PROFILES, requestedTotal: 10005 }).cohortCount, 667);
});

test('sharding keeps whole seed cohorts together', () => {
  const shard0 = buildPairedRunPlan({ profiles: T6_PROFILES, baseSeed: 800000, requestedTotal: 60, shardCount: 2, shardIndex: 0 });
  const shard1 = buildPairedRunPlan({ profiles: T6_PROFILES, baseSeed: 800000, requestedTotal: 60, shardCount: 2, shardIndex: 1 });

  assert.deepEqual([...new Set(shard0.plan.map(item => item.cohortIndex))], [0, 2]);
  assert.deepEqual([...new Set(shard1.plan.map(item => item.cohortIndex))], [1, 3]);
  assert.equal(shard0.plan.length, 30);
  assert.equal(shard1.plan.length, 30);

  for (const shard of [shard0, shard1]) {
    for (const cohortIndex of new Set(shard.plan.map(item => item.cohortIndex))) {
      const rows = shard.plan.filter(item => item.cohortIndex === cohortIndex);
      assert.equal(rows.length, 15);
      assert.equal(new Set(rows.map(item => item.seed)).size, 1);
    }
  }
});

test('shards preserve stable global indices and reconstruct the unsharded sample exactly', () => {
  const full = buildPairedRunPlan({ profiles: T6_PROFILES, baseSeed: 900000, requestedTotal: 90 });
  const shards = [0, 1, 2].flatMap(shardIndex =>
    buildPairedRunPlan({ profiles: T6_PROFILES, baseSeed: 900000, requestedTotal: 90, shardCount: 3, shardIndex }).plan
  );

  assert.deepEqual(
    shards.map(item => item.globalIndex).sort((a, b) => a - b),
    full.plan.map(item => item.globalIndex)
  );
  assert.deepEqual(new Set(shards.map(item => `${item.profile.id}:${item.seed}`)), new Set(sampleKeys(full)));
});
