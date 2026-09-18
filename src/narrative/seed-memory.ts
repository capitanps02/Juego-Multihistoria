import { SEED_CATALOG } from "../catalog/seeds.js";
import { getSeedScopePolicy } from "../catalog/seed-scope.js";
import type { DataValue, GameState, SeedInstance, SeedState } from "../core/types.js";

const TERMINAL_STATES = new Set<SeedState>(["resolved", "expired"]);
const DEFINITIONS = new Map(SEED_CATALOG.map(seed => [seed.id, seed]));
const ORIGIN_CLUB_PAYLOAD = "__t52OriginClub";

export type SeedMemorySource = "live" | "historical" | "absent";

export interface SeedMemoryProjection {
  seedId: string;
  source: SeedMemorySource;
  historicalExists: boolean;
  live: boolean;
  scopeValid: boolean;
  state: SeedState | null;
  intensity: number | null;
  originEvent: string | null;
  originSeason: string | null;
  originClub: string | null;
  consumedBy: string | null;
  expiresAfter: string | null;
  lastTouchedDate: string | null;
  payload: Readonly<Record<string, DataValue>>;
}

function inferOriginClub(state: GameState, seed: SeedInstance): string | null {
  const stored = seed.payload[ORIGIN_CLUB_PAYLOAD];
  if (typeof stored === "string") return stored;
  for (let i = state.history.length - 1; i >= 0; i -= 1) {
    const entry = state.history[i];
    if (entry.eventId === seed.originEvent && entry.season === seed.originSeason) return entry.club;
  }
  return null;
}

export function seedInstanceScopeValid(state: GameState, seed: SeedInstance): boolean {
  const definition = DEFINITIONS.get(seed.id);
  const policy = getSeedScopePolicy(seed.id);

  if (seed.expiresAfter && seed.expiresAfter <= state.date) return false;

  const maxAge = definition?.ageWindow[1];
  if (policy.expireAtAgeWindowEnd && maxAge !== null && maxAge !== undefined && state.age > maxAge) return false;

  if (policy.season === "origin_season" && seed.originSeason !== state.season) return false;

  if (policy.club === "origin_club") {
    const originClub = inferOriginClub(state, seed);
    if (originClub !== null && originClub !== state.club) return false;
  }

  return true;
}

export function seedInstances(state: GameState, seedId: string): readonly SeedInstance[] {
  return state.seeds.filter(seed => seed.id === seedId);
}

export function liveSeedInstance(state: GameState, seedId: string): SeedInstance | null {
  const instances = seedInstances(state, seedId);
  for (let i = instances.length - 1; i >= 0; i -= 1) {
    const seed = instances[i]!;
    if (!TERMINAL_STATES.has(seed.state) && seedInstanceScopeValid(state, seed)) return seed;
  }
  return null;
}

export function latestHistoricalSeedInstance(state: GameState, seedId: string): SeedInstance | null {
  const instances = seedInstances(state, seedId);
  return instances.length ? instances[instances.length - 1]! : null;
}

export function projectSeedMemory(state: GameState, seedId: string): SeedMemoryProjection {
  const live = liveSeedInstance(state, seedId);
  const historical = latestHistoricalSeedInstance(state, seedId);
  const selected = live ?? historical;

  if (!selected) {
    return {
      seedId,
      source: "absent",
      historicalExists: false,
      live: false,
      scopeValid: false,
      state: null,
      intensity: null,
      originEvent: null,
      originSeason: null,
      originClub: null,
      consumedBy: null,
      expiresAfter: null,
      lastTouchedDate: null,
      payload: {}
    };
  }

  return {
    seedId,
    source: live ? "live" : "historical",
    historicalExists: true,
    live: Boolean(live),
    scopeValid: seedInstanceScopeValid(state, selected),
    state: selected.state,
    intensity: selected.intensity,
    originEvent: selected.originEvent,
    originSeason: selected.originSeason,
    originClub: inferOriginClub(state, selected),
    consumedBy: selected.consumedBy ?? null,
    expiresAfter: selected.expiresAfter ?? null,
    lastTouchedDate: selected.lastTouchedDate ?? null,
    payload: selected.payload
  };
}

function liveStringPayload(state: GameState, seedId: string, key: string): string | null {
  const seed = liveSeedInstance(state, seedId);
  const value = seed?.payload[key];
  return typeof value === "string" ? value : null;
}

export interface BrunoFavorMemory extends SeedMemoryProjection {
  stance: string | null;
}

export function getBrunoFavorState(state: GameState): BrunoFavorMemory {
  return {
    ...projectSeedMemory(state, "SEED_BRUNO_FAVOR"),
    stance: liveStringPayload(state, "SEED_BRUNO_FAVOR", "stance")
  };
}

export interface CoachPublicMemory extends SeedMemoryProjection {
  stance: string | null;
}

export function getCoachPublicMemory(state: GameState): CoachPublicMemory {
  return {
    ...projectSeedMemory(state, "SEED_COACH_PUBLIC"),
    stance: liveStringPayload(state, "SEED_COACH_PUBLIC", "stance")
  };
}

export interface MenaEarlyReadMemory extends SeedMemoryProjection {
  read: string | null;
  early: string | null;
}

export function getMenaEarlyRead(state: GameState): MenaEarlyReadMemory {
  return {
    ...projectSeedMemory(state, "SEED_MENA_EARLY_READ"),
    read: liveStringPayload(state, "SEED_MENA_EARLY_READ", "read"),
    early: liveStringPayload(state, "SEED_MENA_EARLY_READ", "early")
  };
}

export interface ExitStyleMemory extends SeedMemoryProjection {
  january: string | null;
  end: string | null;
  summer: string | null;
  market18: string | null;
  year19: string | null;
  playoff: string | null;
}

export function getExitStyleMemory(state: GameState): ExitStyleMemory {
  return {
    ...projectSeedMemory(state, "SEED_EXIT_STYLE_UDV"),
    january: liveStringPayload(state, "SEED_EXIT_STYLE_UDV", "january"),
    end: liveStringPayload(state, "SEED_EXIT_STYLE_UDV", "end"),
    summer: liveStringPayload(state, "SEED_EXIT_STYLE_UDV", "summer"),
    market18: liveStringPayload(state, "SEED_EXIT_STYLE_UDV", "market18"),
    year19: liveStringPayload(state, "SEED_EXIT_STYLE_UDV", "year19"),
    playoff: liveStringPayload(state, "SEED_EXIT_STYLE_UDV", "playoff")
  };
}

export interface BodyPrecedentMemory extends SeedMemoryProjection {
  pattern: string | null;
  early: string | null;
  return19: string | null;
}

export function getBodyPrecedent(state: GameState): BodyPrecedentMemory {
  return {
    ...projectSeedMemory(state, "SEED_BODY_PRECEDENT"),
    pattern: liveStringPayload(state, "SEED_BODY_PRECEDENT", "pattern"),
    early: liveStringPayload(state, "SEED_BODY_PRECEDENT", "early"),
    return19: liveStringPayload(state, "SEED_BODY_PRECEDENT", "return19")
  };
}

export interface PhysioConfidenceMemory extends SeedMemoryProjection {
  pattern: string | null;
  return19: string | null;
}

export function getPhysioConfidenceMemory(state: GameState): PhysioConfidenceMemory {
  return {
    ...projectSeedMemory(state, "SEED_PHYSIO_CONFIDENCE"),
    pattern: liveStringPayload(state, "SEED_PHYSIO_CONFIDENCE", "pattern"),
    return19: liveStringPayload(state, "SEED_PHYSIO_CONFIDENCE", "return19")
  };
}

export function getDaniNormalityPattern(state: GameState): string | null {
  return liveStringPayload(state, "SEED_DANI_NORMALITY", "pattern");
}

export function getClaraChannelMode(state: GameState): string | null {
  return liveStringPayload(state, "SEED_CLARA_CHANNEL", "mode");
}

export function getAgentPowerChoice(state: GameState): string | null {
  return liveStringPayload(state, "SEED_AGENT_POWER", "choice");
}

export function getPublicContractChoice(state: GameState): string | null {
  return liveStringPayload(state, "SEED_PUBLIC_CONTRACT", "choice");
}

export interface EarlyCareerSeedFacts {
  brunoFavorStance: string | null;
  coachPublicStance: string | null;
  menaEarlyRead: string | null;
  menaEarlyContext: string | null;
  exitStyleJanuary: string | null;
  exitStyleEnd: string | null;
  exitStyleSummer: string | null;
  exitStyleMarket18: string | null;
  exitStyleYear19: string | null;
  exitStylePlayoff: string | null;
  daniNormalityPattern: string | null;
  claraChannelMode: string | null;
  agentPowerChoice: string | null;
  agentOmissionLive: boolean;
  publicContractChoice: string | null;
  bodyPrecedentPattern: string | null;
  bodyPrecedentEarly: string | null;
  bodyPrecedentReturn19: string | null;
  physioConfidencePattern: string | null;
  physioConfidenceReturn19: string | null;
}

/**
 * Exact scalar payload projections for declarative Condition paths.
 * Only scope-valid live instances contribute. Historical existence remains available
 * through projectSeedMemory()/latestHistoricalSeedInstance() and is never promoted to live.
 */
export function earlyCareerSeedFacts(state: GameState): EarlyCareerSeedFacts {
  const bruno = getBrunoFavorState(state);
  const coach = getCoachPublicMemory(state);
  const mena = getMenaEarlyRead(state);
  const exit = getExitStyleMemory(state);
  const body = getBodyPrecedent(state);
  const physio = getPhysioConfidenceMemory(state);
  return {
    brunoFavorStance: bruno.stance,
    coachPublicStance: coach.stance,
    menaEarlyRead: mena.read,
    menaEarlyContext: mena.early,
    exitStyleJanuary: exit.january,
    exitStyleEnd: exit.end,
    exitStyleSummer: exit.summer,
    exitStyleMarket18: exit.market18,
    exitStyleYear19: exit.year19,
    exitStylePlayoff: exit.playoff,
    daniNormalityPattern: getDaniNormalityPattern(state),
    claraChannelMode: getClaraChannelMode(state),
    agentPowerChoice: getAgentPowerChoice(state),
    agentOmissionLive: projectSeedMemory(state, "SEED_AGENT_OMISSION").live,
    publicContractChoice: getPublicContractChoice(state),
    bodyPrecedentPattern: body.pattern,
    bodyPrecedentEarly: body.early,
    bodyPrecedentReturn19: body.return19,
    physioConfidencePattern: physio.pattern,
    physioConfidenceReturn19: physio.return19
  };
}
