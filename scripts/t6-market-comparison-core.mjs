function delta(after, before) {
  if (after === null || after === undefined || before === null || before === undefined) return null;
  const a = Number(after);
  const b = Number(before);
  return Number.isFinite(a) && Number.isFinite(b) ? a - b : null;
}

function samples(report) {
  if (Array.isArray(report.sampleKeys)) return new Set(report.sampleKeys);
  return new Set((report.results ?? []).map(row => `${row.profile}:${row.seed}`));
}

function exactSameSet(a, b) {
  if (a.size !== b.size) return false;
  for (const value of a) if (!b.has(value)) return false;
  return true;
}

function summaryChange(before, after) {
  return {
    baseline: before ?? null,
    candidate: after ?? null,
    delta: delta(after, before)
  };
}

export function compareMarketCadenceReports(baseline, candidate) {
  const before = baseline?.metrics?.marketCadence;
  const after = candidate?.metrics?.marketCadence;
  if (!before || !after) return { available: false, reason: 'marketCadence missing from one or both reports' };

  const baselineSamples = samples(baseline);
  const candidateSamples = samples(candidate);
  const profiles = new Set([
    ...Object.keys(before.byProfile ?? {}),
    ...Object.keys(after.byProfile ?? {})
  ]);

  return {
    available: true,
    comparability: {
      exactSample: exactSameSet(baselineSamples, candidateSamples),
      baselineCareers: before.careersObserved ?? baselineSamples.size,
      candidateCareers: after.careersObserved ?? candidateSamples.size,
      baselineSamplingDesign: baseline.configuration?.samplingDesign ?? null,
      candidateSamplingDesign: candidate.configuration?.samplingDesign ?? null,
      sameSamplingDesign: (baseline.configuration?.samplingDesign ?? null) === (candidate.configuration?.samplingDesign ?? null)
    },
    overall: {
      decisionsPerCareer: {
        mean: summaryChange(before.decisionsPerCareer?.mean, after.decisionsPerCareer?.mean),
        p50: summaryChange(before.decisionsPerCareer?.p50, after.decisionsPerCareer?.p50),
        p95: summaryChange(before.decisionsPerCareer?.p95, after.decisionsPerCareer?.p95),
        max: summaryChange(before.decisionsPerCareer?.max, after.decisionsPerCareer?.max)
      },
      marketPerNarrativeDecision: {
        mean: summaryChange(before.marketPerNarrativeDecision?.mean, after.marketPerNarrativeDecision?.mean),
        p95: summaryChange(before.marketPerNarrativeDecision?.p95, after.marketPerNarrativeDecision?.p95),
        max: summaryChange(before.marketPerNarrativeDecision?.max, after.marketPerNarrativeDecision?.max)
      },
      maxVersusMedian: summaryChange(before.maxVersusMedian, after.maxVersusMedian)
    },
    byProfile: [...profiles].sort().map(profile => {
      const b = before.byProfile?.[profile] ?? {};
      const a = after.byProfile?.[profile] ?? {};
      return {
        profile,
        decisionsPerCareerMean: summaryChange(b.decisionsPerCareer?.mean, a.decisionsPerCareer?.mean),
        decisionsPerCareerP95: summaryChange(b.decisionsPerCareer?.p95, a.decisionsPerCareer?.p95),
        marketPerNarrativeDecisionMean: summaryChange(b.marketPerNarrativeDecision?.mean, a.marketPerNarrativeDecision?.mean)
      };
    }),
    topExamples: {
      baseline: (before.topExamples ?? []).slice(0, 20),
      candidate: (after.topExamples ?? []).slice(0, 20)
    }
  };
}
