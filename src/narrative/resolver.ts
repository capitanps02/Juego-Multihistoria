import { SEED_CATALOG } from "../catalog/seeds.js";
import { getSeedScopePolicy } from "../catalog/seed-scope.js";
import { conditionsPass } from "../core/conditions.js";
import { getPath, setPath } from "../core/path.js";
import { DeterministicRng } from "../core/rng.js";
import type { ChoiceDefinition, Effect, EventDefinition, GameState, OutcomeDefinition, ResolutionResult, SeedInstance, SeedTransition } from "../core/types.js";
import { syncRetirementState } from "../simulation/late-career-engine.js";

const TERMINAL_SEED_STATES = new Set(["resolved", "expired"]);
const SEED_DEFINITIONS = new Map(SEED_CATALOG.map(seed => [seed.id, seed]));
const SCOPE_CLUB_PAYLOAD = "__t52OriginClub";
const TERMINAL_REASON_PAYLOAD = "__t52TerminalReason";
const TERMINAL_DATE_PAYLOAD = "__t52TerminalDate";

function cloneState(state: GameState): GameState { return structuredClone(state); }

function isLiveSeed(state: GameState, seedId: string): boolean {
  return state.seeds.some(seed => seed.id === seedId && !TERMINAL_SEED_STATES.has(seed.state));
}

function applyEffect(state: GameState, effect: Effect): void {
  if (effect.kind === "flag") { state.flags[effect.flag] = effect.value; return; }
  if (effect.kind === "set") { setPath(state, effect.path, effect.value); return; }
  const current = getPath(state, effect.path);
  if (typeof current !== "number") throw new Error(`Numeric effect targets non-number: ${effect.path}`);
  const next = current + effect.delta;
  setPath(state, effect.path, Math.min(effect.max ?? Infinity, Math.max(effect.min ?? -Infinity, next)));
}

function bindScopeMetadata(state: GameState, seed: SeedInstance): void {
  const policy = getSeedScopePolicy(seed.id);
  if (policy.club === "origin_club" && typeof seed.payload[SCOPE_CLUB_PAYLOAD] !== "string") {
    seed.payload[SCOPE_CLUB_PAYLOAD] = state.club;
  }
}

function inferOriginClub(state: GameState, seed: SeedInstance): string | undefined {
  const stored = seed.payload[SCOPE_CLUB_PAYLOAD];
  if (typeof stored === "string") return stored;
  for (let i = state.history.length - 1; i >= 0; i -= 1) {
    const entry = state.history[i];
    if (entry.eventId === seed.originEvent && entry.season === seed.originSeason) return entry.club;
  }
  return undefined;
}

function markSeedExpired(state: GameState, seed: SeedInstance, reason: string): void {
  seed.state = "expired";
  seed.lastTouchedDate = state.date;
  seed.payload[TERMINAL_REASON_PAYLOAD] = reason;
  seed.payload[TERMINAL_DATE_PAYLOAD] = state.date;
}

function applySeedTransition(state: GameState, t: SeedTransition, event: EventDefinition): void {
  if (t.action === "create" && !SEED_DEFINITIONS.has(t.seedId)) {
    throw new Error(`Unknown seed ${t.seedId} in ${event.id}`);
  }

  const existing = state.seeds.find(s => s.id === t.seedId && !TERMINAL_SEED_STATES.has(s.state));
  const presenceFlag = `HAS_${t.seedId}`;
  if (t.action === "create") {
    if (!existing) {
      const created: SeedInstance = {
        id: t.seedId, state: "dormant", intensity: t.intensity ?? 50,
        originEvent: event.id, originSeason: state.season, npcRefs: event.npcRefs ?? [],
        payload: { ...(t.payload ?? {}) }, expiresAfter: t.expiresAfter, lastTouchedDate: state.date
      };
      bindScopeMetadata(state, created);
      state.seeds.push(created);
    } else {
      existing.intensity = Math.max(existing.intensity, t.intensity ?? existing.intensity);
      Object.assign(existing.payload, t.payload ?? {});
      if (t.expiresAfter !== undefined) existing.expiresAfter = t.expiresAfter;
      existing.lastTouchedDate = state.date;
      bindScopeMetadata(state, existing);
    }
    state.flags[presenceFlag] = true;
    return;
  }

  // Missing/non-live targets are a safe no-op: terminal transitions are idempotent.
  if (!existing) return;
  existing.lastTouchedDate = state.date;
  if (t.expiresAfter !== undefined) existing.expiresAfter = t.expiresAfter;
  if (t.action === "activate") existing.state = "active";
  if (t.action === "intensify") existing.intensity = Math.max(0, Math.min(100, existing.intensity + (t.intensity ?? 10)));
  if (t.action === "transform") { existing.state = "transformed"; Object.assign(existing.payload, t.payload ?? {}); }
  if (t.action === "resolve") {
    existing.state = "resolved";
    existing.consumedBy = event.id;
    existing.payload[TERMINAL_REASON_PAYLOAD] = "resolved";
    existing.payload[TERMINAL_DATE_PAYLOAD] = state.date;
    state.flags[presenceFlag] = false;
  }
  if (t.action === "expire") {
    markSeedExpired(state, existing, "explicit_transition");
    state.flags[presenceFlag] = false;
  }
  if (!["resolve", "expire"].includes(t.action)) state.flags[presenceFlag] = true;
}

export function syncSeedPresenceFlagsInPlace(state: GameState): void {
  const ids = new Set(state.seeds.map(seed => seed.id));
  for (const seedId of ids) state.flags[`HAS_${seedId}`] = isLiveSeed(state, seedId);
}

/**
 * Apply lifecycle scope after the clock or career context changes.
 * Eligibility remains derived from event gates; it is intentionally not persisted as a second source of truth.
 */
export function expireDueSeedsInPlace(state: GameState): string[] {
  const expired = new Set<string>();
  for (const seed of state.seeds) {
    if (TERMINAL_SEED_STATES.has(seed.state)) continue;

    const definition = SEED_DEFINITIONS.get(seed.id);
    const policy = getSeedScopePolicy(seed.id);
    let reason: string | undefined;

    if (seed.expiresAfter && seed.expiresAfter <= state.date) reason = "explicit_date";

    const maxAge = definition?.ageWindow[1];
    if (!reason && policy.expireAtAgeWindowEnd && maxAge !== null && maxAge !== undefined && state.age > maxAge) {
      reason = "age_window";
    }

    if (!reason && policy.season === "origin_season" && seed.originSeason !== state.season) {
      reason = "season_scope";
    }

    if (!reason && policy.club === "origin_club") {
      const originClub = inferOriginClub(state, seed);
      if (originClub !== undefined && originClub !== state.club) reason = "club_scope";
    }

    if (reason) {
      markSeedExpired(state, seed, reason);
      expired.add(seed.id);
    }
  }
  syncSeedPresenceFlagsInPlace(state);
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

function findSameDayResolution(state: GameState, event: EventDefinition, choiceId: string) {
  for (let i = state.history.length - 1; i >= 0; i -= 1) {
    const entry = state.history[i];
    if (entry.date !== state.date) break;
    if (entry.eventId === event.id && entry.choiceId === choiceId) return entry;
  }
  return undefined;
}

function resolveChoiceCore(next: GameState, event: EventDefinition, choiceId: string, qa = false): ResolutionResult {
  const previousClub=next.club;
  const previousRetirementStatus = next.retirement?.status ?? "playing";
  const choice: ChoiceDefinition | undefined = event.choices.find(c => c.id === choiceId);
  if (!choice) throw new Error(`Unknown choice ${choiceId} for ${event.id}`);

  // UI double-submit / recovery replay: the same event+choice on the same game day is one transaction.
  const replay = findSameDayResolution(next, event, choiceId);
  if (replay) {
    const priorOutcome = event.outcomes.find(outcome => outcome.id === replay.outcomeId);
    return {
      state: next, eventId: event.id, choiceId, outcomeId: replay.outcomeId,
      messages: priorOutcome?.messages ?? [], presentation: event.presentation
    };
  }

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
    expireDueSeedsInPlace(next);
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
