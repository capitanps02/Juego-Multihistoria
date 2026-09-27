export const SEGMENTS = Object.freeze(['18_20', '20_23', '23_26', '26_30', '30_34', '34_plus']);
export const segmentForAge = age => age < 20 ? '18_20' : age < 23 ? '20_23' : age < 26 ? '23_26' : age < 30 ? '26_30' : age < 34 ? '30_34' : '34_plus';
export const liveSeed = seed => !['resolved', 'expired'].includes(seed.state);

function increment(record, key, amount = 1) {
  record[key] = (record[key] ?? 0) + amount;
}

function percentile(values, p) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1));
  return sorted[index];
}

export function stats(values) {
  if (!values.length) return { count: 0, min: null, p50: null, p90: null, p95: null, p99: null, max: null, mean: null };
  const sum = values.reduce((acc, value) => acc + value, 0);
  return {
    count: values.length,
    min: Math.min(...values),
    p50: percentile(values, 50),
    p90: percentile(values, 90),
    p95: percentile(values, 95),
    p99: percentile(values, 99),
    max: Math.max(...values),
    mean: Number((sum / values.length).toFixed(3))
  };
}

export function aggregateT6Results(results, events, config) {
  const eventCatalog = new Map(events.map(event => [event.id, event]));
  const expectedChoices = new Set(events.flatMap(event => event.choices.map(choice => `${event.id}/${choice.id}`)));
  const eventOccurrences = {};
  const eventCareers = {};
  const choiceOccurrences = {};
  const familyOccurrences = {};
  const segmentOccurrences = Object.fromEntries(SEGMENTS.map(segment => [segment, 0]));
  const closureTypes = {};
  const epilogueFamilies = {};
  const openSeeds = {};
  const runsByProfile = {};
  const signatures = new Map();
  const allGaps = [];
  const gapsBySegment = Object.fromEntries(SEGMENTS.map(segment => [segment, []]));
  const terminalGaps = [];
  const retirementAges = [];
  const fallbackRates = [];
  const semanticScores = [];
  const fallbackByProfile = {};
  const fallbackBySegment = Object.fromEntries(SEGMENTS.map(segment => [segment, { decisions: 0, fallbacks: 0 }]));
  const fallbackByEvent = {};
  const schedulerExposure = {};
  const candidatePoolSizes = [];
  const seedAggregate = {};
  const longSeedExamples = [];

  for (const result of results) {
    increment(runsByProfile, result.profile);
    if (result.closureType) increment(closureTypes, result.closureType);
    for (const family of result.epilogues) increment(epilogueFamilies, family);
    for (const seedId of result.openSeeds) increment(openSeeds, seedId);
    for (const [segment, count] of Object.entries(result.eventsBySegment)) increment(segmentOccurrences, segment, count);
    for (const [family, count] of Object.entries(result.eventsByFamily)) increment(familyOccurrences, family, count);
    for (const [key, count] of Object.entries(result.choiceOccurrences)) increment(choiceOccurrences, key, count);
    for (const gap of result.narrativeGaps) allGaps.push(gap);
    for (const [segment, gaps] of Object.entries(result.narrativeGapsBySegment ?? {})) {
      gapsBySegment[segment] ??= [];
      for (const gap of gaps) gapsBySegment[segment].push(gap);
    }
    for (const size of result.candidatePoolSizes ?? []) candidatePoolSizes.push(size);
    terminalGaps.push(result.terminalGapDays);
    fallbackRates.push(result.fallbackRate);
    if (result.retirementAge !== null) retirementAges.push(result.retirementAge);
    if (!signatures.has(result.signature)) signatures.set(result.signature, []);
    signatures.get(result.signature).push({ profile: result.profile, seed: result.seed });

    for (const [eventId, exposure] of Object.entries(result.candidateExposure ?? {})) {
      schedulerExposure[eventId] ??= { candidateTicks: 0, candidateCareers: 0, weightSum: 0, maxWeight: 0 };
      const row = schedulerExposure[eventId];
      row.candidateTicks += Number(exposure.ticks ?? 0);
      row.candidateCareers += 1;
      row.weightSum += Number(exposure.weightSum ?? 0);
      row.maxWeight = Math.max(row.maxWeight, Number(exposure.maxWeight ?? 0));
    }

    for (const lifecycle of result.seedLifecycle ?? []) {
      seedAggregate[lifecycle.id] ??= { instances: 0, careers: new Set(), liveEndCareers: new Set(), lifetimes: [], states: {}, consumers: {}, missingOriginDate: 0 };
      const row = seedAggregate[lifecycle.id];
      row.instances++;
      row.careers.add(`${result.profile}:${result.seed}`);
      if (lifecycle.liveAtCareerEnd) row.liveEndCareers.add(`${result.profile}:${result.seed}`);
      increment(row.states, lifecycle.state ?? 'unknown');
      if (lifecycle.consumedBy) increment(row.consumers, lifecycle.consumedBy);
      if (Number.isFinite(lifecycle.observedLifetimeDays)) {
        row.lifetimes.push(lifecycle.observedLifetimeDays);
        if (lifecycle.observedLifetimeDays >= config.longSeedDays && longSeedExamples.length < 500) {
          longSeedExamples.push({
            profile: result.profile,
            careerSeed: result.seed,
            seedId: lifecycle.id,
            state: lifecycle.state,
            lifetimeDays: lifecycle.observedLifetimeDays,
            originDate: lifecycle.originDate,
            observedEndDate: lifecycle.observedEndDate,
            liveAtCareerEnd: lifecycle.liveAtCareerEnd
          });
        }
      } else row.missingOriginDate++;
    }

    const seenInCareer = new Set();
    fallbackByProfile[result.profile] ??= { decisions: 0, fallbacks: 0 };
    for (const entry of result.sequence) {
      increment(eventOccurrences, entry.eventId);
      if (!seenInCareer.has(entry.eventId)) {
        increment(eventCareers, entry.eventId);
        seenInCareer.add(entry.eventId);
      }
      fallbackByProfile[result.profile].decisions++;
      const segment = entry.phase ?? 'unknown';
      fallbackBySegment[segment] ??= { decisions: 0, fallbacks: 0 };
      fallbackBySegment[segment].decisions++;
      fallbackByEvent[entry.eventId] ??= { decisions: 0, fallbacks: 0 };
      fallbackByEvent[entry.eventId].decisions++;
      if (entry.usedFallback) {
        fallbackByProfile[result.profile].fallbacks++;
        fallbackBySegment[segment].fallbacks++;
        fallbackByEvent[entry.eventId].fallbacks++;
      }
      if (Number.isFinite(entry.semanticScore)) semanticScores.push(entry.semanticScore);
    }
  }

  const seenEvents = Object.keys(eventOccurrences);
  const missingEvents = events.map(event => event.id).filter(id => !eventOccurrences[id]);
  const missingChoices = [...expectedChoices].filter(key => !choiceOccurrences[key]);
  const rareRate = config.rareCareerRate;
  const rareEvents = events.map(event => ({
    id: event.id,
    phase: event.phase,
    family: event.family,
    careers: eventCareers[event.id] ?? 0,
    occurrences: eventOccurrences[event.id] ?? 0,
    careerRate: results.length ? (eventCareers[event.id] ?? 0) / results.length : 0
  })).filter(row => row.careerRate > 0 && row.careerRate <= rareRate)
    .sort((a, b) => a.careerRate - b.careerRate || a.id.localeCompare(b.id));

  const eventChoiceCounts = {};
  for (const [key, count] of Object.entries(choiceOccurrences)) {
    const slash = key.lastIndexOf('/');
    const eventId = key.slice(0, slash);
    const choiceId = key.slice(slash + 1);
    eventChoiceCounts[eventId] ??= {};
    eventChoiceCounts[eventId][choiceId] = count;
  }
  const choiceConcentration = Object.entries(eventChoiceCounts).map(([eventId, counts]) => {
    const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
    const [dominantChoice, dominantCount] = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    return {
      eventId,
      phase: eventCatalog.get(eventId)?.phase ?? null,
      total,
      dominantChoice,
      dominantShare: total ? dominantCount / total : 0,
      distinctChoicesSeen: Object.keys(counts).length,
      totalChoicesDefined: eventCatalog.get(eventId)?.choices.length ?? null
    };
  }).sort((a, b) => b.dominantShare - a.dominantShare || b.total - a.total);

  const schedulerExposureRows = events.map(event => {
    const exposure = schedulerExposure[event.id] ?? { candidateTicks: 0, candidateCareers: 0, weightSum: 0, maxWeight: 0 };
    const selectedOccurrences = eventOccurrences[event.id] ?? 0;
    const selectedCareers = eventCareers[event.id] ?? 0;
    return {
      eventId: event.id,
      phase: event.phase,
      family: event.family,
      candidateTicks: exposure.candidateTicks,
      candidateCareers: exposure.candidateCareers,
      selectedOccurrences,
      selectedCareers,
      selectionPerCandidateTick: exposure.candidateTicks ? selectedOccurrences / exposure.candidateTicks : null,
      averageCandidateWeight: exposure.candidateTicks ? exposure.weightSum / exposure.candidateTicks : null,
      maxCandidateWeight: exposure.candidateTicks ? exposure.maxWeight : null,
      neverCandidateInSample: exposure.candidateTicks === 0,
      candidateButNeverSelected: exposure.candidateTicks > 0 && selectedOccurrences === 0
    };
  }).sort((a, b) => {
    if (a.neverCandidateInSample !== b.neverCandidateInSample) return a.neverCandidateInSample ? -1 : 1;
    if (a.candidateButNeverSelected !== b.candidateButNeverSelected) return a.candidateButNeverSelected ? -1 : 1;
    return (a.selectionPerCandidateTick ?? 0) - (b.selectionPerCandidateTick ?? 0) || a.eventId.localeCompare(b.eventId);
  });

  const seedLifecycleRows = Object.entries(seedAggregate).map(([seedId, row]) => ({
    seedId,
    instances: row.instances,
    careers: row.careers.size,
    careerRate: results.length ? row.careers.size / results.length : 0,
    liveEndCareers: row.liveEndCareers.size,
    liveEndRateAmongObservedCareers: row.careers.size ? row.liveEndCareers.size / row.careers.size : 0,
    lifetimeDays: stats(row.lifetimes),
    states: row.states,
    consumers: row.consumers,
    missingOriginDate: row.missingOriginDate
  })).sort((a, b) => (b.lifetimeDays.p95 ?? -1) - (a.lifetimeDays.p95 ?? -1) || b.liveEndRateAmongObservedCareers - a.liveEndRateAmongObservedCareers || a.seedId.localeCompare(b.seedId));

  const duplicateSignatures = [...signatures.entries()]
    .filter(([, careers]) => careers.length > 1)
    .map(([signature, careers]) => ({ signature, count: careers.length, examples: careers.slice(0, 10) }))
    .sort((a, b) => b.count - a.count);

  const finalizeFallback = record => Object.fromEntries(Object.entries(record).map(([key, value]) => [key, {
    ...value,
    rate: value.decisions ? value.fallbacks / value.decisions : 0
  }]));
  const fallbackByEventRows = Object.entries(finalizeFallback(fallbackByEvent))
    .map(([eventId, value]) => ({ eventId, ...value, phase: eventCatalog.get(eventId)?.phase ?? null }))
    .sort((a, b) => b.rate - a.rate || b.decisions - a.decisions || a.eventId.localeCompare(b.eventId));

  const longGapExamples = results.flatMap(result => {
    const maxGap = result.narrativeGaps.length ? Math.max(...result.narrativeGaps) : result.terminalGapDays;
    return maxGap >= config.longGapDays ? [{ profile: result.profile, seed: result.seed, maxGapDays: maxGap }] : [];
  }).sort((a, b) => b.maxGapDays - a.maxGapDays);

  return {
    sample: {
      careersInShard: results.length,
      totalRequested: config.totalRequested,
      runsByProfile
    },
    careersClosed: results.filter(result => result.closed).length,
    careersNotClosed: results.filter(result => !result.closed).map(result => ({ profile: result.profile, seed: result.seed, finalAge: result.finalAge })),
    structuralAnomalies: results.flatMap(result => result.structuralAnomalies.map(issue => ({ profile: result.profile, seed: result.seed, issue }))),
    coverage: {
      events: { expected: events.length, seen: seenEvents.length, missing: missingEvents, rareCareerRateThreshold: rareRate, rare: rareEvents },
      choices: { expected: expectedChoices.size, seen: Object.keys(choiceOccurrences).length, missing: missingChoices }
    },
    eventOccurrences,
    choiceOccurrences,
    choiceConcentration,
    schedulerExposure: {
      candidatePoolSize: stats(candidatePoolSizes),
      neverCandidateCount: schedulerExposureRows.filter(row => row.neverCandidateInSample).length,
      candidateButNeverSelectedCount: schedulerExposureRows.filter(row => row.candidateButNeverSelected).length,
      events: schedulerExposureRows
    },
    density: { bySegment: segmentOccurrences, byFamily: familyOccurrences },
    narrativeGaps: {
      betweenEvents: stats(allGaps),
      bySegment: Object.fromEntries(Object.entries(gapsBySegment).map(([segment, gaps]) => [segment, stats(gaps)])),
      terminal: stats(terminalGaps),
      longGapThresholdDays: config.longGapDays,
      longGapExamples: longGapExamples.slice(0, 100)
    },
    semanticFallbackRate: stats(fallbackRates.map(value => value * 100)),
    semanticSelection: {
      score: stats(semanticScores),
      byProfile: finalizeFallback(fallbackByProfile),
      bySegment: finalizeFallback(fallbackBySegment),
      byEvent: fallbackByEventRows
    },
    seedLifecycle: {
      longSeedThresholdDays: config.longSeedDays,
      seeds: seedLifecycleRows,
      longLivedExamples: longSeedExamples.sort((a, b) => b.lifetimeDays - a.lifetimeDays).slice(0, 200)
    },
    retirementAges: stats(retirementAges),
    closureTypes,
    epilogueFamilies,
    openSeedsAtEnd: openSeeds,
    signatures: { unique: signatures.size, duplicateGroups: duplicateSignatures.slice(0, 100) }
  };
}
