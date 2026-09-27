function positiveInteger(value, fallback, label) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  const integer = Math.floor(numeric);
  if (integer < 1) throw new Error(`${label} must be >= 1, got ${value}`);
  return integer;
}

export function buildPairedRunPlan({
  profiles,
  baseSeed = 610000,
  requestedTotal = 0,
  runsPerProfile = 1,
  shardCount = 1,
  shardIndex = 0
}) {
  if (!Array.isArray(profiles) || profiles.length === 0) throw new Error('profiles must be a non-empty array');

  const normalizedBaseSeed = Number(baseSeed);
  if (!Number.isFinite(normalizedBaseSeed)) throw new Error(`invalid base seed:${baseSeed}`);

  const normalizedShardCount = positiveInteger(shardCount, 1, 'shardCount');
  const normalizedShardIndex = Math.floor(Number(shardIndex));
  if (!Number.isInteger(normalizedShardIndex) || normalizedShardIndex < 0 || normalizedShardIndex >= normalizedShardCount) {
    throw new Error(`invalid shard ${shardIndex}/${normalizedShardCount}`);
  }

  const normalizedRunsPerProfile = positiveInteger(runsPerProfile, 1, 'runsPerProfile');
  const numericRequestedTotal = Number(requestedTotal);
  const hasExplicitTotal = Number.isFinite(numericRequestedTotal) && numericRequestedTotal > 0;
  const totalRequested = hasExplicitTotal
    ? Math.floor(numericRequestedTotal)
    : normalizedRunsPerProfile * profiles.length;

  if (totalRequested % profiles.length !== 0) {
    throw new Error(
      `paired sampling requires T6_TOTAL_RUNS to be a multiple of ${profiles.length}; got ${totalRequested}. ` +
      `Use ${profiles.length} careers per seed cohort (for ~10k with 15 profiles, use 9990 or 10005).`
    );
  }

  const cohortCount = totalRequested / profiles.length;
  const plan = [];
  let cohortCountInShard = 0;

  for (let cohortIndex = 0; cohortIndex < cohortCount; cohortIndex++) {
    if (cohortIndex % normalizedShardCount !== normalizedShardIndex) continue;
    cohortCountInShard++;
    const seed = normalizedBaseSeed + cohortIndex;
    for (let profileIndex = 0; profileIndex < profiles.length; profileIndex++) {
      plan.push({
        globalIndex: cohortIndex * profiles.length + profileIndex,
        cohortIndex,
        profileIndex,
        profile: profiles[profileIndex],
        seed
      });
    }
  }

  return {
    samplingDesign: 'paired_profile_seed_v1',
    baseSeed: normalizedBaseSeed,
    totalRequested,
    cohortCount,
    cohortCountInShard,
    shardCount: normalizedShardCount,
    shardIndex: normalizedShardIndex,
    plan
  };
}

export function buildPairedRunPlanFromEnv(profiles, env = process.env) {
  return buildPairedRunPlan({
    profiles,
    baseSeed: env.T6_BASE_SEED ?? 610000,
    requestedTotal: env.T6_TOTAL_RUNS ?? 0,
    runsPerProfile: env.T6_RUNS_PER_PROFILE ?? 1,
    shardCount: env.T6_SHARD_COUNT ?? 1,
    shardIndex: env.T6_SHARD_INDEX ?? 0
  });
}
