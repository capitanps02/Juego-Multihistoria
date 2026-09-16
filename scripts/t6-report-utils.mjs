export function reportCareerCount(report) {
  const fromMetrics = Number(report.metrics?.sample?.careersInShard);
  if (Number.isFinite(fromMetrics) && fromMetrics >= 0) return fromMetrics;
  if (Array.isArray(report.sampleKeys)) return report.sampleKeys.length;
  return Array.isArray(report.results) ? report.results.length : 0;
}

export function sampleKeys(report) {
  if (Array.isArray(report.sampleKeys)) return new Set(report.sampleKeys);
  return new Set((report.results ?? []).map(result => `${result.profile}:${result.seed}`));
}

export function setDiff(a, b) {
  return [...a].filter(value => !b.has(value)).sort();
}

export function sameStringSet(a, b) {
  if (a.size !== b.size) return false;
  for (const value of a) if (!b.has(value)) return false;
  return true;
}

export function catalogIds(report) {
  const eventIds = new Set([
    ...Object.keys(report.metrics?.eventOccurrences ?? {}),
    ...(report.metrics?.coverage?.events?.missing ?? [])
  ]);
  const choiceIds = new Set([
    ...Object.keys(report.metrics?.choiceOccurrences ?? {}),
    ...(report.metrics?.coverage?.choices?.missing ?? [])
  ]);
  return { eventIds, choiceIds };
}

export function catalogIdentity(report) {
  const ids = catalogIds(report);
  return {
    eventCount: ids.eventIds.size,
    choiceCount: ids.choiceIds.size,
    eventIds: [...ids.eventIds].sort(),
    choiceIds: [...ids.choiceIds].sort(),
    semanticFingerprint: report.configuration?.catalogFingerprint ?? null,
    fingerprintAlgorithm: report.configuration?.catalogFingerprintAlgorithm ?? null
  };
}

export function eventCareerRates(report) {
  const results = report.results ?? [];
  if (results.length) {
    const counts = {};
    for (const result of results) {
      const seen = new Set((result.sequence ?? []).map(entry => entry.eventId));
      for (const eventId of seen) counts[eventId] = (counts[eventId] ?? 0) + 1;
    }
    const total = results.length;
    return Object.fromEntries(Object.entries(counts).map(([eventId, count]) => [eventId, total ? count / total : 0]));
  }

  const total = reportCareerCount(report);
  return Object.fromEntries((report.metrics?.schedulerExposure?.events ?? [])
    .filter(row => Number(row.selectedCareers ?? 0) > 0)
    .map(row => [row.eventId, total ? Number(row.selectedCareers ?? 0) / total : 0]));
}

export function comparableSimulationConfig(report) {
  const config = report.configuration ?? {};
  return {
    profiles: config.profiles ?? null,
    samplingDesign: config.samplingDesign ?? null,
    baseSeed: config.baseSeed ?? null,
    totalRequested: config.totalRequested ?? null,
    cohortCount: config.cohortCount ?? null,
    maxAge: config.maxAge ?? null,
    maxDays: config.maxDays ?? null,
    rareCareerRate: config.rareCareerRate ?? null,
    longGapDays: config.longGapDays ?? null,
    longSeedDays: config.longSeedDays ?? null
  };
}
