import fs from 'node:fs';
import crypto from 'node:crypto';
import { EVENTS } from '../dist/content/events/index.js';
import { createInitialState } from '../dist/content/initial-state.js';
import { resolveChoiceInPlace } from '../dist/narrative/resolver.js';
import { scheduleEvent } from '../dist/narrative/scheduler.js';
import { advanceWorldDayInPlace } from '../dist/simulation/world-simulator.js';
import { respondToOffer } from '../dist/simulation/offers.js';
import { closeCareer } from '../dist/simulation/late-career-engine.js';
import { generateEpilogue } from '../dist/epilogue/generator.js';
import { T6_PROFILES, chooseForProfile, validateT6Profiles } from './t6-profiles.mjs';
import { SEGMENTS, aggregateT6Results, liveSeed, segmentForAge } from './t6-metrics.mjs';
import { marketCadenceMetrics } from './t6-market-metrics.mjs';
import { createMarketTelemetry, finalizeMarketTelemetry, recordMarketDecision } from './t6-market-telemetry.mjs';
import { pairedCohortMetrics } from './t6-paired-metrics.mjs';
import { buildPairedRunPlanFromEnv } from './t6-run-plan.mjs';

function increment(record, key, amount = 1) {
  record[key] = (record[key] ?? 0) + amount;
}

function sha256Json(value) {
  return crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

function daysBetween(startIso, endIso) {
  if (typeof startIso !== 'string' || typeof endIso !== 'string') return null;
  const start = Date.parse(`${startIso}T00:00:00Z`);
  const end = Date.parse(`${endIso}T00:00:00Z`);
  if (!Number.isFinite(start) || !Number.isFinite(end)) return null;
  return Math.max(0, Math.round((end - start) / 86_400_000));
}

function structuralAnomalies(state) {
  const issues = [];
  if (state.phase !== segmentForAge(state.age)) issues.push(`phase:${state.phase}/age:${state.age}`);
  if (Number(state.contract.monthsRemaining) < 0) issues.push('negative_contract_months');
  if (Number(state.contract.salaryMonthly) < 0) issues.push('negative_salary');
  if (state.epilogue.generated && state.retirement.status !== 'closed') issues.push('epilogue_before_retirement_closed');
  const live = new Map();
  for (const seed of state.seeds.filter(liveSeed)) live.set(seed.id, (live.get(seed.id) ?? 0) + 1);
  for (const [id, count] of live) if (count > 1) issues.push(`duplicate_live_seed:${id}:${count}`);
  if (state.market?.pending && state.retirement.status === 'closed') issues.push('pending_offer_after_retirement');
  return issues;
}

function seedLifecycleSnapshot(state) {
  const originDates = new Map();
  for (const entry of state.history) {
    const key = `${entry.eventId}::${entry.season}`;
    if (!originDates.has(key)) originDates.set(key, entry.date);
  }
  return state.seeds.map(seed => {
    const originDate = originDates.get(`${seed.originEvent}::${seed.originSeason}`) ?? null;
    const live = liveSeed(seed);
    const observedEndDate = live ? state.date : (seed.lastTouchedDate ?? state.date);
    return {
      id: seed.id,
      state: seed.state,
      originEvent: seed.originEvent,
      originSeason: seed.originSeason,
      originDate,
      observedEndDate,
      observedLifetimeDays: originDate ? daysBetween(originDate, observedEndDate) : null,
      liveAtCareerEnd: live,
      consumedBy: seed.consumedBy ?? null
    };
  });
}

function signatureOf(result) {
  const payload = {
    sequence: result.sequence.map(entry => [entry.eventId, entry.choiceId, entry.outcomeId]),
    closureType: result.closureType,
    epilogues: [...result.epilogues].sort()
  };
  return sha256Json(payload);
}

function runCareer(profile, seed, options) {
  const state = createInitialState(seed);
  const sequence = [];
  const narrativeGaps = [];
  const narrativeGapsBySegment = Object.fromEntries(SEGMENTS.map(segment => [segment, []]));
  const eventsBySegment = Object.fromEntries(SEGMENTS.map(segment => [segment, 0]));
  const eventsByFamily = {};
  const choices = {};
  const candidateExposure = {};
  const candidatePoolSizes = [];
  const marketTelemetry = createMarketTelemetry();
  let decisions = 0;
  let fallbackDecisions = 0;
  let days = 0;
  let lastNarrativeDay = null;

  for (; days < options.maxDays; days++) {
    if (state.market?.pending) {
      const action = profile.offer;
      const phase = segmentForAge(state.age);
      const decision = respondToOffer(state, state.market.pending.id, action);
      recordMarketDecision(marketTelemetry, { phase, action, decision, fallbackDate: state.date });
    }

    const scheduled = scheduleEvent(state, EVENTS, { qa: true });
    if (scheduled) {
      const phase = scheduled.event.phase ?? segmentForAge(state.age);
      const candidates = scheduled.debug?.candidates ?? [];
      candidatePoolSizes.push(candidates.length);
      for (const candidate of candidates) {
        candidateExposure[candidate.id] ??= { ticks: 0, weightSum: 0, maxWeight: 0 };
        const exposure = candidateExposure[candidate.id];
        exposure.ticks++;
        const weight = Number(candidate.weight ?? 0);
        if (Number.isFinite(weight)) {
          exposure.weightSum += weight;
          exposure.maxWeight = Math.max(exposure.maxWeight, weight);
        }
      }

      if (lastNarrativeDay !== null) {
        const gap = days - lastNarrativeDay;
        narrativeGaps.push(gap);
        narrativeGapsBySegment[phase] ??= [];
        narrativeGapsBySegment[phase].push(gap);
      }
      lastNarrativeDay = days;
      const decision = chooseForProfile(profile, scheduled.event, decisions);
      if (decision.usedFallback) fallbackDecisions++;
      const result = resolveChoiceInPlace(state, scheduled.event, decision.choiceId, true);
      increment(eventsBySegment, phase);
      increment(eventsByFamily, scheduled.event.family ?? 'unknown');
      increment(choices, `${scheduled.event.id}/${decision.choiceId}`);
      sequence.push({
        day: days,
        age: state.age,
        phase,
        family: scheduled.event.family ?? 'unknown',
        eventId: scheduled.event.id,
        choiceId: decision.choiceId,
        outcomeId: result.outcomeId,
        semanticScore: decision.score,
        matchedTokens: decision.matchedTokens,
        usedFallback: decision.usedFallback,
        candidatePoolSize: candidates.length
      });
      decisions++;
    }

    if (state.flags.EARLY_RETIRED_30_34 && state.retirement.status !== 'closed') {
      closeCareer(state, 'early_retirement_30_34', 'early_retirement');
    }
    if (state.retirement.status === 'closed') {
      generateEpilogue(state);
      break;
    }
    advanceWorldDayInPlace(state);
    if (state.age >= options.maxAge) break;
  }

  const result = {
    profile: profile.id,
    seed,
    closed: state.retirement.status === 'closed',
    retirementAge: state.retirement.decisionAge,
    closureType: state.retirement.closureType,
    finalAge: state.age,
    days,
    decisions,
    fallbackDecisions,
    fallbackRate: decisions ? fallbackDecisions / decisions : 0,
    eventsBySegment,
    eventsByFamily,
    choiceOccurrences: choices,
    narrativeGaps,
    narrativeGapsBySegment,
    terminalGapDays: lastNarrativeDay === null ? days : Math.max(0, days - lastNarrativeDay),
    historyEvents: state.history.length,
    sequence,
    candidateExposure,
    candidatePoolSizes,
    seedLifecycle: seedLifecycleSnapshot(state),
    openSeeds: state.seeds.filter(liveSeed).map(seed => seed.id).sort(),
    epilogues: [...state.epilogue.families],
    marketDecisions: state.market?.history.length ?? 0,
    marketTelemetry: finalizeMarketTelemetry(marketTelemetry),
    structuralAnomalies: structuralAnomalies(state)
  };
  result.signature = signatureOf(result);
  return result;
}

const profileErrors = validateT6Profiles();
if (profileErrors.length) throw new Error(`invalid T6 profiles:\n${profileErrors.join('\n')}`);

const runPlan = buildPairedRunPlanFromEnv(T6_PROFILES);
const options = {
  maxAge: Number(process.env.T6_MAX_AGE ?? 55),
  maxDays: Number(process.env.T6_MAX_DAYS ?? 14000),
  rareCareerRate: Number(process.env.T6_RARE_CAREER_RATE ?? 0.01),
  longGapDays: Number(process.env.T6_LONG_GAP_DAYS ?? 180),
  longSeedDays: Number(process.env.T6_LONG_SEED_DAYS ?? 730),
  totalRequested: runPlan.totalRequested
};
const results = runPlan.plan.map(item => ({
  ...runCareer(item.profile, item.seed, options),
  globalIndex: item.globalIndex,
  cohortIndex: item.cohortIndex
}));
const catalogFingerprint = sha256Json(EVENTS);
const profileIds = T6_PROFILES.map(profile => profile.id);
const metrics = aggregateT6Results(results, EVENTS, { ...options, totalRequested: runPlan.totalRequested });
metrics.marketCadence = marketCadenceMetrics(results);
metrics.pairedComparison = pairedCohortMetrics(results, profileIds);
const report = {
  reportVersion: 1,
  kind: 'T6-balance-observability',
  generatedAt: new Date().toISOString(),
  configuration: {
    buildLabel: process.env.T6_BUILD_LABEL ?? null,
    catalogFingerprint,
    catalogShape: {
      events: EVENTS.length,
      choices: EVENTS.reduce((sum, event) => sum + event.choices.length, 0)
    },
    samplingDesign: runPlan.samplingDesign,
    baseSeed: runPlan.baseSeed,
    totalRequested: runPlan.totalRequested,
    cohortCount: runPlan.cohortCount,
    cohortCountInShard: runPlan.cohortCountInShard,
    shardCount: runPlan.shardCount,
    shardIndex: runPlan.shardIndex,
    careersInShard: results.length,
    maxAge: options.maxAge,
    maxDays: options.maxDays,
    rareCareerRate: options.rareCareerRate,
    longGapDays: options.longGapDays,
    longSeedDays: options.longSeedDays,
    profiles: profileIds
  },
  sampleKeys: results.map(result => `${result.profile}:${result.seed}`),
  metrics,
  results
};

const output = process.env.T6_OUTPUT;
if (output) fs.writeFileSync(output, JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
