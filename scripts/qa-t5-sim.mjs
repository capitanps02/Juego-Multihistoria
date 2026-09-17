import fs from 'node:fs';
import { EVENTS } from '../dist/content/events/index.js';
import { createInitialState } from '../dist/content/initial-state.js';
import { resolveChoiceInPlace } from '../dist/narrative/resolver.js';
import { scheduleEvent } from '../dist/narrative/scheduler.js';
import { advanceWorldDayInPlace } from '../dist/simulation/world-simulator.js';
import { respondToOffer } from '../dist/simulation/offers.js';
import { closeCareer } from '../dist/simulation/late-career-engine.js';
import { generateEpilogue } from '../dist/epilogue/generator.js';
import { validateGameStateQa } from './qa-t5-state-validator.mjs';

const profiles = [
  { id: 'ambitious', offer: 'accept', weights: { ambition: 6, competition: 5, initiative: 4, career: 3, elite: 5, risk: 1 }, fallback: 'first' },
  { id: 'conservative', offer: 'delegate', weights: { stability: 6, patience: 5, control: 4, safety: 6, information: 2, focus: 2 }, fallback: 'middle' },
  { id: 'loyal', offer: 'reject', weights: { loyalty: 7, home: 7, team: 5, mentor: 4, family: 4, continuity: 5 }, fallback: 'middle' },
  { id: 'mercenary', offer: 'accept', weights: { money: 8, contract: 7, market: 5, leverage: 5, exit: 4, power: 3 }, fallback: 'last' },
  { id: 'risky', offer: 'accept', weights: { risk: 8, gamble: 8, aggressive: 6, exposure: 5, attack: 4, initiative: 3 }, fallback: 'last' },
  { id: 'health-first', offer: 'delegate', weights: { health: 9, body: 8, recovery: 8, rest: 8, medical: 8, focus: 2 }, fallback: 'middle' },
  { id: 'fame-first', offer: 'accept', weights: { media: 9, fame: 9, image: 8, public: 7, commercial: 7, exposure: 5 }, fallback: 'first' },
  { id: 'stability', offer: 'delegate', weights: { stability: 9, continuity: 8, control: 6, team: 5, family: 4, patience: 4 }, fallback: 'middle' },
  { id: 'contradictory', offer: 'accept', weights: {}, fallback: 'alternating' }
];

function fallbackIndex(profile, choices, decisionIndex) {
  if (profile.fallback === 'last') return choices.length - 1;
  if (profile.fallback === 'middle') return Math.floor((choices.length - 1) / 2);
  if (profile.fallback === 'alternating') return decisionIndex % 2 === 0 ? 0 : choices.length - 1;
  return 0;
}

function choose(profile, event, decisionIndex) {
  let best = -Infinity;
  let bestIndex = fallbackIndex(profile, event.choices, decisionIndex);
  for (let i = 0; i < event.choices.length; i++) {
    const choice = event.choices[i];
    const haystack = [...choice.intentTags, choice.label].join(' ').toLowerCase();
    let score = 0;
    for (const [token, weight] of Object.entries(profile.weights)) if (haystack.includes(token)) score += weight;
    if (score > best && score > 0) { best = score; bestIndex = i; }
  }
  return event.choices[bestIndex].id;
}

const segmentForAge = age => age < 20 ? '18_20' : age < 23 ? '20_23' : age < 26 ? '23_26' : age < 30 ? '30_34' : age < 34 ? '30_34' : '34_plus';
const liveSeed = seed => !['resolved', 'expired'].includes(seed.state);

function runProfile(profile, seed, maxAge = 55) {
  const state = createInitialState(seed);
  let decisions = 0;
  let days = 0;
  const maxDays = 14000;
  for (; days < maxDays; days++) {
    if (state.market?.pending) respondToOffer(state, state.market.pending.id, profile.offer);
    const scheduled = scheduleEvent(state, EVENTS, { qa: true });
    if (scheduled) {
      const choiceId = choose(profile, scheduled.event, decisions++);
      resolveChoiceInPlace(state, scheduled.event, choiceId, true);
    }
    if (state.flags.EARLY_RETIRED_30_34 && state.retirement.status !== 'closed') closeCareer(state, 'early_retirement_30_34', 'early_retirement');
    if (state.retirement.status === 'closed') { generateEpilogue(state); break; }
    advanceWorldDayInPlace(state);
    if (state.age >= maxAge) break;
  }
  const eventsBySegment = {};
  for (const entry of state.history) {
    const age = Number(entry.snapshot?.age ?? state.age);
    const segment = segmentForAge(age);
    eventsBySegment[segment] = (eventsBySegment[segment] ?? 0) + 1;
  }
  return {
    profile: profile.id,
    seed,
    closed: state.retirement.status === 'closed',
    retirementAge: state.retirement.decisionAge,
    closureType: state.retirement.closureType,
    finalAge: state.age,
    days,
    decisions,
    eventsBySegment,
    historyEvents: state.history.length,
    openSeeds: state.seeds.filter(liveSeed).map(seed => seed.id),
    epilogues: state.epilogue.families,
    marketDecisions: state.market?.history.length ?? 0,
    impossibleStates: validateGameStateQa(state)
  };
}

const runsPerProfile = Math.max(1, Number(process.env.T5_RUNS_PER_PROFILE ?? 1));
const baseSeed = Number(process.env.T5_BASE_SEED ?? 510000);
const results = [];
for (let p = 0; p < profiles.length; p++) for (let run = 0; run < runsPerProfile; run++) results.push(runProfile(profiles[p], baseSeed + p * 1000 + run));
const report = {
  gate: 'T5-stratified-simulation',
  generatedAt: new Date().toISOString(),
  runsPerProfile,
  totalRuns: results.length,
  metrics: {
    careersClosed: results.filter(row => row.closed).length,
    blockedCareers: results.filter(row => !row.closed).map(row => ({ profile: row.profile, seed: row.seed, finalAge: row.finalAge })),
    impossibleStates: results.flatMap(row => row.impossibleStates.map(issue => ({ profile: row.profile, seed: row.seed, issue }))),
    retirementAges: results.filter(row => row.retirementAge !== null).map(row => row.retirementAge),
    epilogueFamilies: [...new Set(results.flatMap(row => row.epilogues))]
  },
  results
};
if (process.env.T5_QA_OUTPUT) fs.writeFileSync(process.env.T5_QA_OUTPUT, JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
if (report.metrics.blockedCareers.length || report.metrics.impossibleStates.length) process.exitCode = 1;
