import { conditionsPass } from "../core/conditions.js";
import { getPath, setPath } from "../core/path.js";
import { DeterministicRng } from "../core/rng.js";
import type { ChoiceDefinition, Effect, EventDefinition, GameState, OutcomeDefinition, ResolutionResult, SeedTransition } from "../core/types.js";
import { syncRetirementState } from "../simulation/late-career-engine.js";

function cloneState(state: GameState): GameState { return structuredClone(state); }

function isLiveSeed(state: GameState, seedId: string): boolean {
  return state.seeds.some(seed => seed.id === seedId && !["resolved", "expired"].includes(seed.state));
}

function applyEffect(state: GameState, effect: Effect): void {
  if (effect.kind === "flag") { state.flags[effect.flag] = effect.value; return; }
  if (effect.kind === "set") { setPath(state, effect.path, effect.value); return; }
  const current = getPath(state, effect.path);
  if (typeof current !== "number") throw new Error(`Numeric effect targets non-number: ${effect.path}`);
  const next = current + effect.delta;
  setPath(state, effect.path, Math.min(effect.max ?? Infinity, Math.max(effect.min ?? -Infinity, next)));
}

function applySeedTransition(state: GameState, t: SeedTransition, event: EventDefinition): void {
  const existing = state.seeds.find(s => s.id === t.seedId && !["resolved", "expired"].includes(s.state));
  const presenceFlag = `HAS_${t.seedId}`;
  if (t.action === "create") {
    if (!existing) state.seeds.push({
      id: t.seedId, state: "dormant", intensity: t.intensity ?? 50,
      originEvent: event.id, originSeason: state.season, npcRefs: event.npcRefs ?? [],
      payload: t.payload ?? {}, expiresAfter: t.expiresAfter, lastTouchedDate: state.date
    });
    else {
      existing.intensity = Math.max(existing.intensity, t.intensity ?? existing.intensity);
      Object.assign(existing.payload, t.payload ?? {});
      if (t.expiresAfter !== undefined) existing.expiresAfter = t.expiresAfter;
      existing.lastTouchedDate = state.date;
    }
    state.flags[presenceFlag] = true;
    return;
  }
  if (!existing) return;
  existing.lastTouchedDate = state.date;
  if (t.expiresAfter !== undefined) existing.expiresAfter = t.expiresAfter;
  if (t.action === "activate") existing.state = "active";
  if (t.action === "intensify") existing.intensity = Math.max(0, Math.min(100, existing.intensity + (t.intensity ?? 10)));
  if (t.action === "transform") { existing.state = "transformed"; Object.assign(existing.payload, t.payload ?? {}); }
  if (t.action === "resolve") { existing.state = "resolved"; existing.consumedBy = event.id; state.flags[presenceFlag] = false; }
  if (t.action === "expire") { existing.state = "expired"; state.flags[presenceFlag] = false; }
  if (!["resolve", "expire"].includes(t.action)) state.flags[presenceFlag] = true;
}

/** Apply explicit seed expirations after the world clock advances. */
export function expireDueSeedsInPlace(state: GameState): string[] {
  const expired = new Set<string>();
  for (const seed of state.seeds) {
    if (["resolved", "expired"].includes(seed.state) || !seed.expiresAfter) continue;
    if (seed.expiresAfter <= state.date) {
      seed.state = "expired";
      seed.lastTouchedDate = state.date;
      expired.add(seed.id);
    }
  }
  for (const seedId of expired) state.flags[`HAS_${seedId}`] = isLiveSeed(state, seedId);
  return [...expired];
}

function outcomeWeight(state: GameState, outcome: OutcomeDefinition): { weight: number; modifiers: string[] } {
  let weight = outcome.baseWeight;
  const reasons: string[] = [];
  for (const m of outcome.modifiers ?? []) {
    if (!conditionsPass(state, m.conditions)) continue;
    if (m.multiply !== undefined) weight *= m.multiply;
    if (m.add !== undefined) weight += m.add;
    reasons.push(`${m.id}: ${m.reason}`);
  }
  return { weight: Math.max(0, weight), modifiers: reasons };
}

function resolveChoiceCore(next: GameState, event: EventDefinition, choiceId: string, qa = false): ResolutionResult {
  const previousClub=next.club;
  const previousRetirementStatus = next.retirement?.status ?? "playing";
  const choice: ChoiceDefinition | undefined = event.choices.find(c => c.id === choiceId);
  if (!choice) throw new Error(`Unknown choice ${choiceId} for ${event.id}`);

  for (const e of choice.immediateEffects ?? []) applyEffect(next, e);

  const possible = event.outcomes
    .filter(o => choice.outcomeIds.includes(o.id))
    .filter(o => conditionsPass(next, o.conditions ?? []))
    .map(o => ({ outcome: o, ...outcomeWeight(next, o) }))
    .filter(o => o.weight > 0);

  if (!possible.length) throw new Error(`No plausible outcomes for ${event.id}/${choiceId}`);

  const rng = new DeterministicRng(next.rngState.narrative);
  const picked = rng.pickWeighted(possible.map(x => ({ item: x, weight: x.weight })));
  const selected = picked.item.outcome;

  for (const e of selected.effects) applyEffect(next, e);
  for (const e of choice.hiddenCosts ?? []) applyEffect(next, e);
  for (const t of selected.seedTransitions ?? []) applySeedTransition(next, t, event);

  // A club change authorized by a narrative choice is one coherent transaction.
  if(next.club!==previousClub){
    const p=next.professional;
    p.registrationClub=next.club;p.leagueTier=next.tier;
    p.ownerClub=next.flags.LOAN_ACTIVE ? String(next.world.ownerClub ?? previousClub) : next.club;
    next.world.ownerClub=p.ownerClub;
    p.route=next.flags.ABROAD_ROUTE?"abroad":next.flags.LOAN_ACTIVE?"loan":next.club==="UDV"?"home":"domestic";
  }

  next.eventCooldowns[event.id] = event.cooldown;
  next.flags[`SEEN_${event.id}`] = true;
  next.familyLastSeen[event.family] = next.runtime.day;
  next.runtime.daysSinceNarrative = 0;
  next.runtime.eventsThisSeason += 1;
  syncRetirementState(next, previousRetirementStatus);
  next.history.push({
    eventId: event.id, date: next.date, season: next.season, choiceId,
    outcomeId: selected.id, club: next.club,
    snapshot: { family: event.family, npcRefs: event.npcRefs ?? [], tags: event.tags ?? [], age: next.age },
    salience: 70, visibility: "private"
  });

  return {
    state: next, eventId: event.id, choiceId, outcomeId: selected.id,
    messages: selected.messages, presentation: event.presentation,
    debug: qa ? {
      outcomeWeights: possible.map(x => ({ id: x.outcome.id, weight: x.weight, modifiers: x.modifiers })),
      rngDraw: picked.draw
    } : undefined
  };
}

/** Immutable API for UI / interactive callers. */
export function resolveChoice(state: GameState, event: EventDefinition, choiceId: string, qa = false): ResolutionResult {
  return resolveChoiceCore(cloneState(state), event, choiceId, qa);
}

/** Fast path for headless simulation. Mutates the supplied GameState intentionally. */
export function resolveChoiceInPlace(state: GameState, event: EventDefinition, choiceId: string, qa = false): ResolutionResult {
  return resolveChoiceCore(state, event, choiceId, qa);
}
