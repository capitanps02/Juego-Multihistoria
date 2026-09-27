import { stats } from './t6-metrics.mjs';

function finiteNonNegative(value) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : null;
}

function push(record, key, value) {
  record[key] ??= [];
  record[key].push(value);
}

function increment(record, key, amount = 1) {
  record[key] = (record[key] ?? 0) + amount;
}

function mergeCounts(target, source) {
  for (const [key, value] of Object.entries(source ?? {})) increment(target, key, Number(value) || 0);
}

function sortedRecord(record) {
  return Object.fromEntries(Object.entries(record).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])));
}

export function marketCadenceMetrics(results = []) {
  const counts = [];
  const ratios = [];
  const byProfileCounts = {};
  const byProfileRatios = {};
  const examples = [];
  const telemetryBySegment = {};
  const telemetryByReason = {};
  const telemetryByAction = {};
  const duplicateOfferIds = [];
  const repeatedLogicalSourceOffers = [];
  const maxOffersFromSameSourceState = [];
  const repeatedExactOfferVariants = [];
  const maxExactOfferVariantRepeats = [];
  const uniqueOfferDates = [];
  const maxDecisionsSameDate = [];
  const decisionsPerOfferDate = [];
  let accepted = 0;
  let rejected = 0;
  let careersWithTelemetry = 0;
  let invalidCount = 0;

  for (const result of results) {
    const count = finiteNonNegative(result.marketDecisions);
    if (count === null) {
      invalidCount++;
      continue;
    }
    const decisions = finiteNonNegative(result.decisions) ?? 0;
    const ratio = decisions > 0 ? count / decisions : (count === 0 ? 0 : null);
    counts.push(count);
    push(byProfileCounts, result.profile ?? 'unknown', count);
    if (ratio !== null) {
      ratios.push(ratio);
      push(byProfileRatios, result.profile ?? 'unknown', ratio);
    }

    const telemetry = result.marketTelemetry ?? null;
    if (telemetry) {
      careersWithTelemetry++;
      mergeCounts(telemetryBySegment, telemetry.bySegment);
      mergeCounts(telemetryByReason, telemetry.byReason);
      mergeCounts(telemetryByAction, telemetry.byAction);
      accepted += finiteNonNegative(telemetry.accepted) ?? 0;
      rejected += finiteNonNegative(telemetry.rejected) ?? 0;
      const duplicateIds = finiteNonNegative(telemetry.duplicateOfferIds);
      const repeatedSources = finiteNonNegative(telemetry.repeatedLogicalSourceOffers);
      const maxSourceRepeats = finiteNonNegative(telemetry.maxOffersFromSameSourceState);
      const repeatedExact = finiteNonNegative(telemetry.repeatedExactOfferVariants);
      const maxExactRepeats = finiteNonNegative(telemetry.maxExactOfferVariantRepeats);
      const uniqueDates = finiteNonNegative(telemetry.uniqueOfferDates);
      const maxSameDate = finiteNonNegative(telemetry.maxDecisionsSameDate);
      if (duplicateIds !== null) duplicateOfferIds.push(duplicateIds);
      if (repeatedSources !== null) repeatedLogicalSourceOffers.push(repeatedSources);
      if (maxSourceRepeats !== null) maxOffersFromSameSourceState.push(maxSourceRepeats);
      if (repeatedExact !== null) repeatedExactOfferVariants.push(repeatedExact);
      if (maxExactRepeats !== null) maxExactOfferVariantRepeats.push(maxExactRepeats);
      if (uniqueDates !== null) {
        uniqueOfferDates.push(uniqueDates);
        if (uniqueDates > 0) decisionsPerOfferDate.push(count / uniqueDates);
        else if (count === 0) decisionsPerOfferDate.push(0);
      }
      if (maxSameDate !== null) maxDecisionsSameDate.push(maxSameDate);
    }

    examples.push({
      profile: result.profile ?? null,
      seed: result.seed ?? null,
      marketDecisions: count,
      narrativeDecisions: decisions,
      marketPerNarrativeDecision: ratio,
      retirementAge: result.retirementAge ?? null,
      finalAge: result.finalAge ?? null,
      closureType: result.closureType ?? null,
      marketTelemetry: telemetry ? {
        bySegment: telemetry.bySegment ?? {},
        byReason: telemetry.byReason ?? {},
        byAction: telemetry.byAction ?? {},
        accepted: telemetry.accepted ?? 0,
        rejected: telemetry.rejected ?? 0,
        uniqueOfferIds: telemetry.uniqueOfferIds ?? null,
        duplicateOfferIds: telemetry.duplicateOfferIds ?? null,
        uniqueLogicalSourceStates: telemetry.uniqueLogicalSourceStates ?? null,
        repeatedLogicalSourceOffers: telemetry.repeatedLogicalSourceOffers ?? null,
        maxOffersFromSameSourceState: telemetry.maxOffersFromSameSourceState ?? null,
        topRepeatedSourceStates: telemetry.topRepeatedSourceStates ?? [],
        uniqueExactOfferVariants: telemetry.uniqueExactOfferVariants ?? null,
        repeatedExactOfferVariants: telemetry.repeatedExactOfferVariants ?? null,
        maxExactOfferVariantRepeats: telemetry.maxExactOfferVariantRepeats ?? null,
        uniqueOfferDates: telemetry.uniqueOfferDates ?? null,
        maxDecisionsSameDate: telemetry.maxDecisionsSameDate ?? null,
        firstOfferDate: telemetry.firstOfferDate ?? null,
        lastOfferDate: telemetry.lastOfferDate ?? null
      } : null
    });
  }

  const overall = stats(counts);
  const median = overall.p50;
  const normalizedExamples = examples.map(row => ({
    ...row,
    versusMedian: median !== null && median > 0 ? row.marketDecisions / median : null
  })).sort((a, b) => b.marketDecisions - a.marketDecisions || String(a.profile).localeCompare(String(b.profile)) || Number(a.seed) - Number(b.seed));

  return {
    careersObserved: counts.length,
    careersWithTelemetry,
    invalidCount,
    decisionsPerCareer: overall,
    marketPerNarrativeDecision: stats(ratios),
    byProfile: Object.fromEntries(Object.keys(byProfileCounts).sort().map(profile => [profile, {
      decisionsPerCareer: stats(byProfileCounts[profile]),
      marketPerNarrativeDecision: stats(byProfileRatios[profile] ?? [])
    }])),
    telemetry: {
      bySegment: sortedRecord(telemetryBySegment),
      byReason: sortedRecord(telemetryByReason),
      byAction: sortedRecord(telemetryByAction),
      accepted,
      rejected,
      duplicateOfferIds: stats(duplicateOfferIds),
      repeatedLogicalSourceOffers: stats(repeatedLogicalSourceOffers),
      maxOffersFromSameSourceState: stats(maxOffersFromSameSourceState),
      repeatedExactOfferVariants: stats(repeatedExactOfferVariants),
      maxExactOfferVariantRepeats: stats(maxExactOfferVariantRepeats),
      uniqueOfferDates: stats(uniqueOfferDates),
      decisionsPerOfferDate: stats(decisionsPerOfferDate),
      maxDecisionsSameDate: stats(maxDecisionsSameDate)
    },
    maxVersusMedian: normalizedExamples[0]?.versusMedian ?? null,
    topExamples: normalizedExamples.slice(0, 50)
  };
}
