import fs from 'node:fs';
import { EVENTS } from '../dist/content/events/index.js';
import { createInitialState } from '../dist/content/initial-state.js';
import { resolveChoiceInPlace } from '../dist/narrative/resolver.js';
import { scheduleEvent } from '../dist/narrative/scheduler.js';
import { advanceWorldDayInPlace } from '../dist/simulation/world-simulator.js';
import { careerTerms, respondToOffer } from '../dist/simulation/offers.js';
import { closeCareer } from '../dist/simulation/late-career-engine.js';
import { generateEpilogue } from '../dist/epilogue/generator.js';

const PROFILE = {
  id: 'loyal',
  offer: 'reject',
  weights: { loyalty: 7, home: 7, team: 5, mentor: 4, family: 4, continuity: 5 },
  fallback: 'middle'
};

function fallbackIndex(choices) {
  return Math.floor((choices.length - 1) / 2);
}

function choose(event) {
  let best = -Infinity;
  let bestIndex = fallbackIndex(event.choices);
  for (let i = 0; i < event.choices.length; i++) {
    const choice = event.choices[i];
    const haystack = [...choice.intentTags, choice.label].join(' ').toLowerCase();
    let score = 0;
    for (const [token, weight] of Object.entries(PROFILE.weights)) if (haystack.includes(token)) score += weight;
    if (score > best && score > 0) {
      best = score;
      bestIndex = i;
    }
  }
  return event.choices[bestIndex].id;
}

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map(key => [key, stable(value[key])]));
  }
  return value;
}

function fingerprint(value) {
  return JSON.stringify(stable(value));
}

function offerSignature(offer) {
  return fingerprint({ reason: offer.reason, before: offer.before, terms: offer.terms });
}

function dayNumber(iso) {
  return Math.floor(Date.parse(`${iso}T00:00:00Z`) / 86400000);
}

function seasonFor(date) {
  const year = Number(date.slice(0, 4));
  const month = Number(date.slice(5, 7));
  const start = month >= 7 ? year : year - 1;
  return `${start}-${String((start + 1) % 100).padStart(2, '0')}`;
}

function increment(map, key, amount = 1) {
  map[key] = (map[key] ?? 0) + amount;
}

function run(seed = 512000, maxAge = 55) {
  const state = createInitialState(seed);
  const creations = [];
  const decisions = [];
  const seenOfferIds = new Set();
  let narrativeDecisions = 0;
  let days = 0;
  const maxDays = 14000;

  function observePending(checkpoint) {
    const offer = state.market?.pending;
    if (!offer || seenOfferIds.has(offer.id)) return;
    seenOfferIds.add(offer.id);
    creations.push({
      id: offer.id,
      checkpoint,
      date: state.date,
      age: state.age,
      season: seasonFor(state.date),
      reason: offer.reason,
      signature: offerSignature(offer),
      beforeFingerprint: fingerprint(offer.before),
      termsFingerprint: fingerprint(offer.terms),
      before: structuredClone(offer.before),
      terms: structuredClone(offer.terms),
      currentTerms: careerTerms(state)
    });
  }

  for (; days < maxDays; days++) {
    observePending('day_start');

    if (state.market?.pending) {
      const offer = structuredClone(state.market.pending);
      const currentBefore = careerTerms(state);
      const decision = respondToOffer(state, offer.id, PROFILE.offer);
      decisions.push({
        id: offer.id,
        date: state.date,
        age: state.age,
        season: seasonFor(state.date),
        reason: offer.reason,
        action: decision.action,
        accepted: decision.accepted,
        signature: offerSignature(offer),
        beforeFingerprint: fingerprint(offer.before),
        currentTermsMatchedBefore: fingerprint(currentBefore) === fingerprint(offer.before)
      });
    }

    const scheduled = scheduleEvent(state, EVENTS, { qa: true });
    if (scheduled) {
      const choiceId = choose(scheduled.event, narrativeDecisions++);
      resolveChoiceInPlace(state, scheduled.event, choiceId, true);
      observePending('after_narrative');
    }

    if (state.flags.EARLY_RETIRED_30_34 && state.retirement.status !== 'closed') {
      closeCareer(state, 'early_retirement_30_34', 'early_retirement');
    }
    if (state.retirement.status === 'closed') {
      generateEpilogue(state);
      break;
    }

    advanceWorldDayInPlace(state);
    observePending('after_world_day');
    if (state.age >= maxAge) break;
  }

  const decisionsByAge = {};
  const decisionsBySeason = {};
  const decisionsByReason = {};
  const creationsByCheckpoint = {};
  for (const row of decisions) {
    increment(decisionsByAge, String(row.age));
    increment(decisionsBySeason, row.season);
    increment(decisionsByReason, row.reason);
  }
  for (const row of creations) increment(creationsByCheckpoint, row.checkpoint);

  const bySignature = new Map();
  for (const row of creations) {
    const group = bySignature.get(row.signature) ?? [];
    group.push(row);
    bySignature.set(row.signature, group);
  }
  const repeatedSignatureGroups = [...bySignature.entries()]
    .filter(([, rows]) => rows.length > 1)
    .map(([signature, rows]) => {
      const gaps = [];
      for (let i = 1; i < rows.length; i++) gaps.push(dayNumber(rows[i].date) - dayNumber(rows[i - 1].date));
      return {
        signature,
        count: rows.length,
        reason: rows[0].reason,
        firstDate: rows[0].date,
        lastDate: rows.at(-1).date,
        ages: [...new Set(rows.map(row => row.age))],
        minGapDays: gaps.length ? Math.min(...gaps) : null,
        maxGapDays: gaps.length ? Math.max(...gaps) : null,
        consecutiveDayRecreations: gaps.filter(gap => gap === 1).length,
        withinWeekRecreations: gaps.filter(gap => gap >= 1 && gap <= 7).length,
        offerIds: rows.map(row => row.id)
      };
    })
    .sort((a, b) => b.count - a.count);

  const exactRecreationCount = repeatedSignatureGroups.reduce((sum, row) => sum + row.count - 1, 0);
  const renewalDecisions = decisions.filter(row => row.reason === 'Renovación de contrato');
  const uniqueOfferIds = new Set(decisions.map(row => row.id));
  const duplicateDecisionIds = decisions.length - uniqueOfferIds.size;

  return {
    gate: 'T5-market-cadence-diagnostic',
    seed,
    profile: PROFILE.id,
    offerPolicy: PROFILE.offer,
    final: {
      closed: state.retirement.status === 'closed',
      retirementAge: state.retirement.decisionAge,
      closureType: state.retirement.closureType,
      finalAge: state.age,
      days,
      narrativeDecisions,
      marketDecisions: decisions.length,
      marketHistoryLength: state.market?.history.length ?? 0
    },
    summary: {
      offersObserved: creations.length,
      decisionsObserved: decisions.length,
      uniqueOfferIds: uniqueOfferIds.size,
      duplicateDecisionIds,
      renewalDecisions: renewalDecisions.length,
      exactRecreationCount,
      repeatedSignatureGroups: repeatedSignatureGroups.length,
      maxExactRepetitions: repeatedSignatureGroups[0]?.count ?? 1,
      allResponsesMatchedOfferBeforeTerms: decisions.every(row => row.currentTermsMatchedBefore)
    },
    decisionsByAge,
    decisionsBySeason,
    decisionsByReason,
    creationsByCheckpoint,
    topRepeatedSignatures: repeatedSignatureGroups.slice(0, 12),
    firstDecisions: decisions.slice(0, 15),
    lastDecisions: decisions.slice(-15),
    trace: { creations, decisions }
  };
}

const seed = Number(process.env.T5_MARKET_CADENCE_SEED ?? 512000);
const report = run(seed);
const output = process.env.T5_MARKET_CADENCE_OUTPUT;
if (output) fs.writeFileSync(output, JSON.stringify(report, null, 2) + '\n');

const consoleReport = { ...report, trace: undefined };
console.log(JSON.stringify(consoleReport, null, 2));

if (report.summary.duplicateDecisionIds !== 0) process.exitCode = 1;
if (!report.summary.allResponsesMatchedOfferBeforeTerms) process.exitCode = 1;
