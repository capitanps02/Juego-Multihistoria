import assert from 'node:assert/strict';
import { EVENTS } from '../dist/content/events/index.js';
import { createInitialState } from '../dist/content/initial-state.js';
import { resolveChoiceInPlace } from '../dist/narrative/resolver.js';
import { scheduleEvent } from '../dist/narrative/scheduler.js';
import { advanceWorldDayInPlace } from '../dist/simulation/world-simulator.js';
import { respondToOffer } from '../dist/simulation/offers.js';
import { closeCareer } from '../dist/simulation/late-career-engine.js';
import { generateEpilogue } from '../dist/epilogue/generator.js';

const profiles = [
  { id: 'mercenary', seed: 513000, offer: 'accept', weights: { money: 8, contract: 7, market: 5, leverage: 5, exit: 4, power: 3 }, fallback: 'last' },
  { id: 'risky', seed: 514000, offer: 'accept', weights: { risk: 8, gamble: 8, aggressive: 6, exposure: 5, attack: 4, initiative: 3 }, fallback: 'last' }
];

function fallbackIndex(profile, choices, decisionIndex) {
  if (profile.fallback === 'last') return choices.length - 1;
  return decisionIndex % 2 === 0 ? 0 : choices.length - 1;
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

function run(profile) {
  const state = createInitialState(profile.seed);
  let decisions = 0;
  for (let days = 0; days < 14000; days++) {
    if (state.market?.pending) respondToOffer(state, state.market.pending.id, profile.offer);
    const scheduled = scheduleEvent(state, EVENTS, { qa: true });
    if (scheduled) {
      const choiceId = choose(profile, scheduled.event, decisions++);
      resolveChoiceInPlace(state, scheduled.event, choiceId, true);
    }
    if (state.flags.EARLY_RETIRED_30_34 && state.retirement.status !== 'closed') closeCareer(state, 'early_retirement_30_34', 'early_retirement');
    if (state.retirement.status === 'closed') { generateEpilogue(state); break; }
    advanceWorldDayInPlace(state);
    if (state.age >= 55) break;
  }
  const decidedDate = state.retirement.decidedDate;
  const waits = state.history.filter(entry =>
    entry.eventId === 'EVT_RET_ANNOUNCE_001' &&
    entry.choiceId === 'WAIT' &&
    decidedDate &&
    entry.date >= decidedDate
  );
  return { state, waits };
}

for (const profile of profiles) {
  const { state, waits } = run(profile);
  assert.equal(state.retirement.status, 'decided', profile.id + ' must remain privately decided after explicit deferral');
  assert.ok(state.retirement.decidedDate, profile.id + ' must retain a real decidedDate');
  assert.ok(waits.length > 0, profile.id + ' must have explicit post-decision WAIT history');
  assert.equal(state.epilogue.generated, false, profile.id + ' must not fabricate an epilogue while privately decided');
  console.log(JSON.stringify({
    profile: profile.id,
    seed: profile.seed,
    finalAge: state.age,
    decidedDate: state.retirement.decidedDate,
    waitCount: waits.length,
    lastWaitDate: waits.at(-1)?.date ?? null
  }));
}
