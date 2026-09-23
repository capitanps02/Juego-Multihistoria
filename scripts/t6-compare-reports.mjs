import fs from 'node:fs';
import { catalogIdentity, comparableSimulationConfig, eventCareerRates, reportCareerCount, sampleKeys, setDiff } from './t6-report-utils.mjs';

const [baselinePath, candidatePath] = process.argv.slice(2);
if (!baselinePath || !candidatePath) throw new Error('usage: node scripts/t6-compare-reports.mjs <baseline.json> <candidate.json>');
const baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
const candidate = JSON.parse(fs.readFileSync(candidatePath, 'utf8'));

for (const [label, report] of [['baseline', baseline], ['candidate', candidate]]) {
  if (report.kind !== 'T6-balance-observability') throw new Error(`${label} is not a T6 observability report`);
  if (!report.metrics || typeof report.metrics !== 'object') throw new Error(`${label} report has no metrics`);
  if (!Array.isArray(report.sampleKeys) && !Array.isArray(report.results)) throw new Error(`${label} report has no sample keys or raw results`);
}

function rate(count, total) {
  return total ? count / total : 0;
}
function delta(candidateValue, baselineValue) {
  if (candidateValue === null || baselineValue === null || candidateValue === undefined || baselineValue === undefined) return null;
  return candidateValue - baselineValue;
}
function occurrenceRates(report) {
  const total = reportCareerCount(report);
  return Object.fromEntries(Object.entries(report.metrics.eventOccurrences ?? {}).map(([id, count]) => [id, rate(count, total)]));
}
function rateDeltas(a, b) {
  const ids = new Set([...Object.keys(a), ...Object.keys(b)]);
  return [...ids].map(id => ({ id, baselineRate: a[id] ?? 0, candidateRate: b[id] ?? 0, delta: (b[id] ?? 0) - (a[id] ?? 0) }))
    .sort((x, y) => Math.abs(y.delta) - Math.abs(x.delta) || x.id.localeCompare(y.id));
}
function normalizedCounts(record, total) {
  return Object.fromEntries(Object.entries(record ?? {}).map(([key, count]) => [key, rate(count, total)]));
}
function normalizedDeltas(a, b) {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  return [...keys].map(key => ({ key, baselineRate: a[key] ?? 0, candidateRate: b[key] ?? 0, delta: (b[key] ?? 0) - (a[key] ?? 0) }))
    .sort((x, y) => Math.abs(y.delta) - Math.abs(x.delta) || x.key.localeCompare(y.key));
}
function semanticRateRecord(report, dimension) {
  const record = report.metrics.semanticSelection?.[dimension] ?? {};
  return Object.fromEntries(Object.entries(record).map(([key, value]) => [key, Number(value?.rate ?? 0)]));
}
function semanticRateDeltas(dimension) {
  return normalizedDeltas(semanticRateRecord(baseline, dimension), semanticRateRecord(candidate, dimension));
}
function schedulerMap(report) {
  return new Map((report.metrics.schedulerExposure?.events ?? []).map(row => [row.eventId, row]));
}
function schedulerChanges() {
  const beforeMap = schedulerMap(baseline);
  const afterMap = schedulerMap(candidate);
  const ids = new Set([...beforeMap.keys(), ...afterMap.keys()]);
  const bTotal = reportCareerCount(baseline);
  const cTotal = reportCareerCount(candidate);
  return [...ids].map(eventId => {
    const before = beforeMap.get(eventId);
    const after = afterMap.get(eventId);
    const beforeCandidateCareerRate = before ? rate(before.candidateCareers, bTotal) : 0;
    const afterCandidateCareerRate = after ? rate(after.candidateCareers, cTotal) : 0;
    const beforeCandidateTicksPerCareer = before ? rate(before.candidateTicks, bTotal) : 0;
    const afterCandidateTicksPerCareer = after ? rate(after.candidateTicks, cTotal) : 0;
    return {
      eventId,
      baselineCandidateCareerRate: beforeCandidateCareerRate,
      candidateCandidateCareerRate: afterCandidateCareerRate,
      candidateCareerRateDelta: afterCandidateCareerRate - beforeCandidateCareerRate,
      baselineCandidateTicksPerCareer: beforeCandidateTicksPerCareer,
      candidateCandidateTicksPerCareer: afterCandidateTicksPerCareer,
      candidateTicksPerCareerDelta: afterCandidateTicksPerCareer - beforeCandidateTicksPerCareer,
      baselineSelectionPerCandidateTick: before?.selectionPerCandidateTick ?? null,
      candidateSelectionPerCandidateTick: after?.selectionPerCandidateTick ?? null,
      selectionPerCandidateTickDelta: delta(after?.selectionPerCandidateTick, before?.selectionPerCandidateTick),
      baselineNeverCandidate: before?.neverCandidateInSample ?? true,
      candidateNeverCandidate: after?.neverCandidateInSample ?? true,
      baselineCandidateButNeverSelected: before?.candidateButNeverSelected ?? false,
      candidateCandidateButNeverSelected: after?.candidateButNeverSelected ?? false
    };
  }).sort((x, y) => {
    const xMagnitude = Math.max(Math.abs(x.candidateCareerRateDelta), Math.abs(x.candidateTicksPerCareerDelta), Math.abs(x.selectionPerCandidateTickDelta ?? 0));
    const yMagnitude = Math.max(Math.abs(y.candidateCareerRateDelta), Math.abs(y.candidateTicksPerCareerDelta), Math.abs(y.selectionPerCandidateTickDelta ?? 0));
    return yMagnitude - xMagnitude || x.eventId.localeCompare(y.eventId);
  });
}
function seedMap(report) {
  return new Map((report.metrics.seedLifecycle?.seeds ?? []).map(row => [row.seedId, row]));
}
function seedChanges() {
  const beforeMap = seedMap(baseline);
  const afterMap = seedMap(candidate);
  const ids = new Set([...beforeMap.keys(), ...afterMap.keys()]);
  return [...ids].map(seedId => {
    const before = beforeMap.get(seedId);
    const after = afterMap.get(seedId);
    return {
      seedId,
      baselineCareerRate: before?.careerRate ?? 0,
      candidateCareerRate: after?.careerRate ?? 0,
      careerRateDelta: (after?.careerRate ?? 0) - (before?.careerRate ?? 0),
      baselineLiveEndRate: before?.liveEndRateAmongObservedCareers ?? 0,
      candidateLiveEndRate: after?.liveEndRateAmongObservedCareers ?? 0,
      liveEndRateDelta: (after?.liveEndRateAmongObservedCareers ?? 0) - (before?.liveEndRateAmongObservedCareers ?? 0),
      baselineLifetimeP95Days: before?.lifetimeDays?.p95 ?? null,
      candidateLifetimeP95Days: after?.lifetimeDays?.p95 ?? null,
      lifetimeP95DeltaDays: delta(after?.lifetimeDays?.p95, before?.lifetimeDays?.p95)
    };
  }).sort((x, y) => {
    const xMagnitude = Math.max(Math.abs(x.careerRateDelta), Math.abs(x.liveEndRateDelta), Math.abs((x.lifetimeP95DeltaDays ?? 0) / 365));
    const yMagnitude = Math.max(Math.abs(y.careerRateDelta), Math.abs(y.liveEndRateDelta), Math.abs((y.lifetimeP95DeltaDays ?? 0) / 365));
    return yMagnitude - xMagnitude || x.seedId.localeCompare(y.seedId);
  });
}
function segmentGapChanges() {
  const before = baseline.metrics.narrativeGaps?.bySegment ?? {};
  const after = candidate.metrics.narrativeGaps?.bySegment ?? {};
  const segments = new Set([...Object.keys(before), ...Object.keys(after)]);
  return [...segments].sort().map(segment => ({
    segment,
    baselineP95Days: before[segment]?.p95 ?? null,
    candidateP95Days: after[segment]?.p95 ?? null,
    p95DeltaDays: delta(after[segment]?.p95, before[segment]?.p95),
    baselineMeanDays: before[segment]?.mean ?? null,
    candidateMeanDays: after[segment]?.mean ?? null,
    meanDeltaDays: delta(after[segment]?.mean, before[segment]?.mean)
  }));
}
function pairedProfileDivergenceChanges() {
  const before = baseline.metrics.pairedComparison;
  const after = candidate.metrics.pairedComparison;
  if (!before || !after) return { available: false };
  return {
    available: true,
    baselineCompleteCohorts: before.completeCohorts ?? null,
    candidateCompleteCohorts: after.completeCohorts ?? null,
    completeCohortDelta: delta(after.completeCohorts, before.completeCohorts),
    uniqueSignaturesPerCohortP50: {
      baseline: before.uniqueSignaturesPerCohort?.p50 ?? null,
      candidate: after.uniqueSignaturesPerCohort?.p50 ?? null,
      delta: delta(after.uniqueSignaturesPerCohort?.p50, before.uniqueSignaturesPerCohort?.p50)
    },
    eventSetJaccardMean: {
      baseline: before.eventSetJaccardDistance?.mean ?? null,
      candidate: after.eventSetJaccardDistance?.mean ?? null,
      delta: delta(after.eventSetJaccardDistance?.mean, before.eventSetJaccardDistance?.mean)
    },
    choiceSetJaccardMean: {
      baseline: before.choiceSetJaccardDistance?.mean ?? null,
      candidate: after.choiceSetJaccardDistance?.mean ?? null,
      delta: delta(after.choiceSetJaccardDistance?.mean, before.choiceSetJaccardDistance?.mean)
    },
    epilogueSetJaccardMean: {
      baseline: before.epilogueSetJaccardDistance?.mean ?? null,
      candidate: after.epilogueSetJaccardDistance?.mean ?? null,
      delta: delta(after.epilogueSetJaccardDistance?.mean, before.epilogueSetJaccardDistance?.mean)
    },
    retirementAgeSpreadP50: {
      baseline: before.retirementAgeSpread?.p50 ?? null,
      candidate: after.retirementAgeSpread?.p50 ?? null,
      delta: delta(after.retirementAgeSpread?.p50, before.retirementAgeSpread?.p50)
    },
    closureDisagreementRate: {
      baseline: before.closureDisagreementRate ?? null,
      candidate: after.closureDisagreementRate ?? null,
      delta: delta(after.closureDisagreementRate, before.closureDisagreementRate)
    }
  };
}

const baselineKeys = sampleKeys(baseline);
const candidateKeys = sampleKeys(candidate);
const baselineOnly = setDiff(baselineKeys, candidateKeys);
const candidateOnly = setDiff(candidateKeys, baselineKeys);
const exactSample = baselineOnly.length === 0 && candidateOnly.length === 0;
if (!exactSample && process.env.T6_REQUIRE_EXACT_SAMPLE === '1') {
  throw new Error(`sample mismatch baselineOnly=${baselineOnly.length} candidateOnly=${candidateOnly.length}`);
}

const baselineMissingEvents = new Set(baseline.metrics.coverage?.events?.missing ?? []);
const candidateMissingEvents = new Set(candidate.metrics.coverage?.events?.missing ?? []);
const baselineMissingChoices = new Set(baseline.metrics.coverage?.choices?.missing ?? []);
const candidateMissingChoices = new Set(candidate.metrics.coverage?.choices?.missing ?? []);
const bTotal = reportCareerCount(baseline);
const cTotal = reportCareerCount(candidate);
const baselineCatalog = catalogIdentity(baseline);
const candidateCatalog = catalogIdentity(candidate);
const baselineEventIds = new Set(baselineCatalog.eventIds);
const candidateEventIds = new Set(candidateCatalog.eventIds);
const baselineChoiceIds = new Set(baselineCatalog.choiceIds);
const candidateChoiceIds = new Set(candidateCatalog.choiceIds);
const eventIdsAdded = setDiff(candidateEventIds, baselineEventIds);
const eventIdsRemoved = setDiff(baselineEventIds, candidateEventIds);
const choiceIdsAdded = setDiff(candidateChoiceIds, baselineChoiceIds);
const choiceIdsRemoved = setDiff(baselineChoiceIds, candidateChoiceIds);
const sameCatalogIds = eventIdsAdded.length === 0 && eventIdsRemoved.length === 0 && choiceIdsAdded.length === 0 && choiceIdsRemoved.length === 0;
const bothFingerprinted = Boolean(baselineCatalog.semanticFingerprint && candidateCatalog.semanticFingerprint);
const sameCatalogFingerprint = bothFingerprinted ? baselineCatalog.semanticFingerprint === candidateCatalog.semanticFingerprint : null;
const baselineSimulationConfig = comparableSimulationConfig(baseline);
const candidateSimulationConfig = comparableSimulationConfig(candidate);
const sameSimulationConfig = JSON.stringify(baselineSimulationConfig) === JSON.stringify(candidateSimulationConfig);

const comparison = {
  reportVersion: 1,
  kind: 'T6-balance-comparison',
  generatedAt: new Date().toISOString(),
  baseline: baselinePath,
  candidate: candidatePath,
  comparability: {
    exactSample,
    baselineCareers: bTotal,
    candidateCareers: cTotal,
    baselineOnly: baselineOnly.slice(0, 100),
    candidateOnly: candidateOnly.slice(0, 100),
    sameSimulationConfig,
    baselineSimulationConfig,
    candidateSimulationConfig,
    sameCatalogIds,
    sameCatalogFingerprint,
    catalogSemanticsChanged: bothFingerprinted ? !sameCatalogFingerprint : null,
    baselineCatalog: {
      eventCount: baselineCatalog.eventCount,
      choiceCount: baselineCatalog.choiceCount,
      semanticFingerprint: baselineCatalog.semanticFingerprint,
      fingerprintAlgorithm: baselineCatalog.fingerprintAlgorithm
    },
    candidateCatalog: {
      eventCount: candidateCatalog.eventCount,
      choiceCount: candidateCatalog.choiceCount,
      semanticFingerprint: candidateCatalog.semanticFingerprint,
      fingerprintAlgorithm: candidateCatalog.fingerprintAlgorithm
    }
  },
  catalogChanges: { eventIdsAdded, eventIdsRemoved, choiceIdsAdded, choiceIdsRemoved },
  deltas: {
    closedCareerRate: delta(rate(candidate.metrics.careersClosed ?? 0, cTotal), rate(baseline.metrics.careersClosed ?? 0, bTotal)),
    structuralAnomalyRate: delta(rate(candidate.metrics.structuralAnomalies?.length ?? 0, cTotal), rate(baseline.metrics.structuralAnomalies?.length ?? 0, bTotal)),
    eventCoverage: delta(candidate.metrics.coverage?.events?.seen, baseline.metrics.coverage?.events?.seen),
    choiceCoverage: delta(candidate.metrics.coverage?.choices?.seen, baseline.metrics.coverage?.choices?.seen),
    uniqueSignatureRate: delta(rate(candidate.metrics.signatures?.unique ?? 0, cTotal), rate(baseline.metrics.signatures?.unique ?? 0, bTotal)),
    narrativeGapP95Days: delta(candidate.metrics.narrativeGaps?.betweenEvents?.p95, baseline.metrics.narrativeGaps?.betweenEvents?.p95),
    terminalGapP95Days: delta(candidate.metrics.narrativeGaps?.terminal?.p95, baseline.metrics.narrativeGaps?.terminal?.p95),
    semanticFallbackMeanPercentagePoints: delta(candidate.metrics.semanticFallbackRate?.mean, baseline.metrics.semanticFallbackRate?.mean),
    retirementAgeP50: delta(candidate.metrics.retirementAges?.p50, baseline.metrics.retirementAges?.p50),
    candidatePoolP50: delta(candidate.metrics.schedulerExposure?.candidatePoolSize?.p50, baseline.metrics.schedulerExposure?.candidatePoolSize?.p50)
  },
  pairedProfileDivergenceChanges: pairedProfileDivergenceChanges(),
  coverageChanges: {
    eventsNewlySeen: setDiff(baselineMissingEvents, candidateMissingEvents),
    eventsNoLongerSeen: setDiff(candidateMissingEvents, baselineMissingEvents),
    choicesNewlySeen: setDiff(baselineMissingChoices, candidateMissingChoices),
    choicesNoLongerSeen: setDiff(candidateMissingChoices, baselineMissingChoices)
  },
  semanticFallbackChanges: {
    byProfile: semanticRateDeltas('byProfile'),
    bySegment: semanticRateDeltas('bySegment')
  },
  narrativeGapChangesBySegment: segmentGapChanges(),
  schedulerExposureChanges: schedulerChanges().slice(0, 150),
  seedLifecycleChanges: seedChanges().slice(0, 210),
  largestEventCareerReachRateChanges: rateDeltas(eventCareerRates(baseline), eventCareerRates(candidate)).slice(0, 100),
  largestEventOccurrenceRateChanges: rateDeltas(occurrenceRates(baseline), occurrenceRates(candidate)).slice(0, 100),
  phaseDensityRateChanges: normalizedDeltas(
    normalizedCounts(baseline.metrics.density?.bySegment, bTotal),
    normalizedCounts(candidate.metrics.density?.bySegment, cTotal)
  ),
  epilogueRateChanges: normalizedDeltas(
    normalizedCounts(baseline.metrics.epilogueFamilies, bTotal),
    normalizedCounts(candidate.metrics.epilogueFamilies, cTotal)
  ),
  closureRateChanges: normalizedDeltas(
    normalizedCounts(baseline.metrics.closureTypes, bTotal),
    normalizedCounts(candidate.metrics.closureTypes, cTotal)
  )
};

const output = process.env.T6_COMPARE_OUTPUT;
if (output) fs.writeFileSync(output, JSON.stringify(comparison, null, 2) + '\n');
console.log(JSON.stringify(comparison, null, 2));
