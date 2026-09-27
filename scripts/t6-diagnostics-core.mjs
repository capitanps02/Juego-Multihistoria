function finite(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function pushSignal(signals, type, ownerHint, subject, evidence, note) {
  signals.push({ type, ownerHint, subject, evidence, note });
}

export function buildT6Diagnostics(report, overrides = {}) {
  if (report?.kind !== 'T6-balance-observability') throw new Error('not a T6 observability report');
  const metrics = report.metrics ?? {};
  const careers = finite(metrics.sample?.careersInShard, Array.isArray(report.results) ? report.results.length : 0);
  const options = {
    minChoiceSamples: finite(overrides.minChoiceSamples, 30),
    dominantChoiceShare: finite(overrides.dominantChoiceShare, 0.9),
    minFallbackDecisions: finite(overrides.minFallbackDecisions, 30),
    fallbackRate: finite(overrides.fallbackRate, 0.5),
    seedLiveEndRate: finite(overrides.seedLiveEndRate, 0.5),
    signatureUniquenessRate: finite(overrides.signatureUniquenessRate, 0.5),
    closureConcentrationRate: finite(overrides.closureConcentrationRate, 0.8),
    minMarketCareers: finite(overrides.minMarketCareers, 30),
    marketDecisionAbsoluteReview: finite(overrides.marketDecisionAbsoluteReview, 50),
    marketMedianMultiplier: finite(overrides.marketMedianMultiplier, 10)
  };
  const signals = [];

  if ((metrics.careersNotClosed ?? []).length) {
    pushSignal(
      signals,
      'career_not_closed',
      'qa/integration',
      `${metrics.careersNotClosed.length} careers`,
      { examples: metrics.careersNotClosed.slice(0, 20), careers },
      'Reproduce before treating as balance; a non-closing career can be a technical blocker.'
    );
  }

  const anomalyGroups = {};
  for (const row of metrics.structuralAnomalies ?? []) {
    anomalyGroups[row.issue] ??= [];
    if (anomalyGroups[row.issue].length < 20) anomalyGroups[row.issue].push({ profile: row.profile, seed: row.seed });
  }
  for (const [issue, examples] of Object.entries(anomalyGroups)) {
    pushSignal(signals, 'structural_anomaly', 'qa/integration', issue, { examples }, 'Structural anomaly: reproduce on the exact profile/seed before any balance work.');
  }

  const paired = metrics.pairedComparison;
  if (paired && finite(paired.incompleteCohortCount) > 0) {
    pushSignal(
      signals,
      'paired_cohort_incomplete',
      'qa/tooling',
      `${paired.incompleteCohortCount} cohorts`,
      {
        samplingDesign: report.configuration?.samplingDesign ?? paired.samplingDesign ?? null,
        cohortsObserved: paired.cohortsObserved ?? null,
        completeCohorts: paired.completeCohorts ?? null,
        incompleteCohorts: (paired.incompleteCohorts ?? []).slice(0, 20)
      },
      'A paired cohort is missing or duplicating one or more profiles. Fix sampling/sharding before interpreting within-seed divergence.'
    );
  }

  const market = metrics.marketCadence;
  if (market && finite(market.careersObserved) >= options.minMarketCareers) {
    const median = finite(market.decisionsPerCareer?.p50);
    const threshold = Math.max(options.marketDecisionAbsoluteReview, median * options.marketMedianMultiplier);
    const examples = (market.topExamples ?? []).filter(row => finite(row.marketDecisions) >= threshold).slice(0, 20);
    if (examples.length) {
      pushSignal(
        signals,
        'market_cadence_review',
        'qa/market',
        `${examples.length} careers`,
        {
          careersObserved: market.careersObserved,
          medianMarketDecisions: median,
          absoluteThreshold: options.marketDecisionAbsoluteReview,
          medianMultiplier: options.marketMedianMultiplier,
          effectiveThreshold: threshold,
          maxVersusMedian: market.maxVersusMedian ?? null,
          examples
        },
        'Extreme market cadence is a directed review signal only. Reproduce offer creation/response/idempotency before changing market balance.'
      );
    }
  }

  const exposureByEvent = new Map((metrics.schedulerExposure?.events ?? []).map(row => [row.eventId, row]));
  for (const eventId of metrics.coverage?.events?.missing ?? []) {
    const exposure = exposureByEvent.get(eventId);
    if (exposure?.candidateButNeverSelected) {
      pushSignal(
        signals,
        'candidate_never_selected',
        'scheduler/content',
        eventId,
        { candidateTicks: exposure.candidateTicks, candidateCareers: exposure.candidateCareers, maxCandidateWeight: exposure.maxCandidateWeight },
        'The event became eligible in the sample but was never selected; inspect competition/weight before changing gates.'
      );
    } else if (exposure?.neverCandidateInSample ?? true) {
      pushSignal(
        signals,
        'never_candidate_in_sample',
        'content/canon',
        eventId,
        { careers },
        'The event was not observed in any candidate pool; this is a reachability question, not proof that the event is dead.'
      );
    }
  }

  for (const row of metrics.choiceConcentration ?? []) {
    if (finite(row.total) < options.minChoiceSamples) continue;
    if (finite(row.dominantShare) < options.dominantChoiceShare) continue;
    pushSignal(
      signals,
      'choice_concentration_review',
      'narrative/balance',
      row.eventId,
      {
        samples: row.total,
        dominantChoice: row.dominantChoice,
        dominantShare: row.dominantShare,
        distinctChoicesSeen: row.distinctChoicesSeen,
        totalChoicesDefined: row.totalChoicesDefined
      },
      'High concentration is a review signal only; seeing every choice at least once does not remove concentration. Check profile mix and semantics before changing the event.'
    );
  }

  for (const row of metrics.semanticSelection?.byEvent ?? []) {
    if (finite(row.decisions) < options.minFallbackDecisions) continue;
    if (finite(row.rate) < options.fallbackRate) continue;
    pushSignal(
      signals,
      'semantic_fallback_review',
      'profile-vocabulary/content-tags',
      row.eventId,
      { decisions: row.decisions, fallbacks: row.fallbacks, fallbackRate: row.rate, phase: row.phase },
      'Profiles often fail to recognize a semantic option here; inspect intentTags/profile vocabulary without hard-coding event IDs.'
    );
  }

  const longGapThreshold = finite(metrics.narrativeGaps?.longGapThresholdDays, 180);
  for (const [segment, summary] of Object.entries(metrics.narrativeGaps?.bySegment ?? {})) {
    if (summary?.p95 === null || summary?.p95 === undefined) continue;
    if (finite(summary.p95) < longGapThreshold) continue;
    pushSignal(
      signals,
      'narrative_gap_review',
      'narrative/balance',
      segment,
      { p95Days: summary.p95, meanDays: summary.mean, thresholdDays: longGapThreshold, observations: summary.count },
      'Long gaps may be intentional; inspect reproduced careers and event availability before adding content.'
    );
  }

  const longSeedThreshold = finite(metrics.seedLifecycle?.longSeedThresholdDays, 730);
  for (const row of metrics.seedLifecycle?.seeds ?? []) {
    const p95 = row.lifetimeDays?.p95;
    if (p95 === null || p95 === undefined) continue;
    if (finite(p95) < longSeedThreshold) continue;
    if (finite(row.liveEndRateAmongObservedCareers) < options.seedLiveEndRate) continue;
    pushSignal(
      signals,
      'long_lived_seed_review',
      'seed-lifecycle/content',
      row.seedId,
      {
        careers: row.careers,
        careerRate: row.careerRate,
        liveEndRate: row.liveEndRateAmongObservedCareers,
        lifetimeP95Days: p95,
        consumers: row.consumers
      },
      'Persistent seeds require canonical review; do not invent a consumer merely to improve the metric.'
    );
  }

  if (careers > 0) {
    const unique = finite(metrics.signatures?.unique);
    const uniquenessRate = unique / careers;
    if (uniquenessRate < options.signatureUniquenessRate) {
      pushSignal(
        signals,
        'career_convergence_review',
        'narrative/balance',
        'career-signatures',
        { careers, uniqueSignatures: unique, uniquenessRate, duplicateGroups: (metrics.signatures?.duplicateGroups ?? []).slice(0, 20) },
        'Low signature diversity can reflect legitimate convergence; inspect duplicate trajectories before changing balance.'
      );
    }

    const closureEntries = Object.entries(metrics.closureTypes ?? {});
    if (closureEntries.length) {
      const [closureType, count] = closureEntries.sort((a, b) => b[1] - a[1])[0];
      const closureRate = finite(count) / careers;
      if (closureRate >= options.closureConcentrationRate) {
        pushSignal(
          signals,
          'closure_concentration_review',
          'retirement/epilogue-balance',
          closureType,
          { count, careers, rate: closureRate },
          'A dominant closure type is a diagnostic signal, not a target violation.'
        );
      }
    }
  }

  return {
    reportVersion: 1,
    kind: 'T6-diagnostics',
    source: {
      careers,
      buildLabel: report.configuration?.buildLabel ?? null,
      catalogFingerprint: report.configuration?.catalogFingerprint ?? null,
      samplingDesign: report.configuration?.samplingDesign ?? null,
      cohortsObserved: paired?.cohortsObserved ?? null,
      completeCohorts: paired?.completeCohorts ?? null
    },
    thresholds: options,
    summary: {
      totalSignals: signals.length,
      byType: Object.fromEntries([...new Set(signals.map(signal => signal.type))].sort().map(type => [type, signals.filter(signal => signal.type === type).length]))
    },
    signals
  };
}
