import type { DataValue, GameState } from "../core/types.js";
import { currentOfficialMatch, type MatchOutcome } from "./match-model.js";

const STORE_KEY = "sportCompetitionMoments";

export type SpecialCompetition = "domestic_cup" | "continental";
export type CompetitionStage = "league" | "final";
export type CompetitionOutcome = "win" | "loss";

export interface CompetitionMoment {
  id: string;
  season: string;
  date: string;
  runtimeDay: number;
  expiresRuntimeDay: number;
  club: string;
  competition: SpecialCompetition;
  stage: "final";
  outcome: CompetitionOutcome;
  highProfile: true;
}

export interface CompetitionMomentStore {
  version: 1;
  moments: CompetitionMoment[];
}

export interface CompetitionContext {
  status: "authoritative" | "no_current_competition";
  competition: "league" | SpecialCompetition | null;
  stage: CompetitionStage | null;
  date: string | null;
  club: string | null;
  outcome: MatchOutcome | null;
  highProfile: boolean;
  source: "official_match" | "competition_moment" | null;
}

export interface CompetitionMomentIssue {
  path: string;
  reason: string;
}

function plainRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function exactKeys(value: Record<string, unknown>, expected: string[]): boolean {
  return Object.keys(value).sort().join(",") === [...expected].sort().join(",");
}

function validIsoDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function momentId(state: GameState, competition: SpecialCompetition): string {
  return `competition:${state.season}:${state.date}:${state.professional.registrationClub}:${competition}:final`;
}

function currentCoreFinal(state: GameState): {
  competition: SpecialCompetition;
  outcome: CompetitionOutcome;
  expiresRuntimeDay: number;
} | null {
  if (state.flags.FINAL_CONTEXT !== true) return null;
  const competition = state.world.finalCompetition;
  const outcome = state.world.finalOutcome;
  const expiresRuntimeDay = state.world.finalContextExpiresDay;
  if (competition !== "domestic_cup" && competition !== "continental") return null;
  if (outcome !== "win" && outcome !== "loss") return null;
  if (typeof expiresRuntimeDay !== "number" || !Number.isInteger(expiresRuntimeDay) || expiresRuntimeDay < state.runtime.day) return null;
  return { competition, outcome, expiresRuntimeDay };
}

export function getCompetitionMomentStore(state: GameState): CompetitionMomentStore | null {
  const value = state.world[STORE_KEY];
  if (!plainRecord(value) || value.version !== 1 || !Array.isArray(value.moments)) return null;
  return value as unknown as CompetitionMomentStore;
}

function ensureStoreInPlace(state: GameState): CompetitionMomentStore {
  const existing = getCompetitionMomentStore(state);
  if (existing) return existing;
  const store: CompetitionMomentStore = { version: 1, moments: [] };
  state.world[STORE_KEY] = store as unknown as DataValue;
  return store;
}

/**
 * Materialize a final only when the core simulator has already produced its
 * competition + outcome + lifetime. This function consumes zero RNG and never
 * derives a final from month, reputation, roleScore or a narrative gate.
 */
export function recordCoreFinalCompetitionMomentInPlace(state: GameState): CompetitionMoment | null {
  const core = currentCoreFinal(state);
  if (!core) return null;
  const id = momentId(state, core.competition);
  const store = ensureStoreInPlace(state);
  const existing = store.moments.find(row => row.id === id);
  if (existing) return existing;

  const moment: CompetitionMoment = {
    id,
    season: state.season,
    date: state.date,
    runtimeDay: state.runtime.day,
    expiresRuntimeDay: core.expiresRuntimeDay,
    club: state.professional.registrationClub,
    competition: core.competition,
    stage: "final",
    outcome: core.outcome,
    highProfile: true
  };
  store.moments.push(moment);
  return moment;
}

export function latestCompetitionMoment(state: GameState): CompetitionMoment | null {
  const store = getCompetitionMomentStore(state);
  if (!store || store.moments.length === 0) return null;
  return store.moments[store.moments.length - 1] ?? null;
}

export function activeCompetitionMoment(state: GameState): CompetitionMoment | null {
  const store = getCompetitionMomentStore(state);
  if (!store) return null;
  for (let i = store.moments.length - 1; i >= 0; i -= 1) {
    const row = store.moments[i]!;
    if (row.club === state.professional.registrationClub
      && row.runtimeDay <= state.runtime.day
      && row.expiresRuntimeDay >= state.runtime.day) return row;
  }
  return null;
}

export function getCurrentCompetitionContext(state: GameState): CompetitionContext {
  const special = activeCompetitionMoment(state);
  if (special) {
    return {
      status: "authoritative",
      competition: special.competition,
      stage: special.stage,
      date: special.date,
      club: special.club,
      outcome: special.outcome,
      highProfile: true,
      source: "competition_moment"
    };
  }

  const match = currentOfficialMatch(state);
  if (match) {
    return {
      status: "authoritative",
      competition: "league",
      stage: "league",
      date: match.date,
      club: match.club,
      outcome: match.result?.outcome ?? null,
      highProfile: false,
      source: "official_match"
    };
  }

  return {
    status: "no_current_competition",
    competition: null,
    stage: null,
    date: null,
    club: null,
    outcome: null,
    highProfile: false,
    source: null
  };
}

export function inspectCompetitionMomentStore(value: unknown, state: GameState): CompetitionMomentIssue | null {
  if (value === undefined) return null;
  const path = `world.${STORE_KEY}`;
  if (!plainRecord(value) || !exactKeys(value, ["version", "moments"])) return { path, reason: "competition moment store fields do not match v1" };
  if (value.version !== 1) return { path: `${path}.version`, reason: "unsupported competition moment version" };
  if (!Array.isArray(value.moments) || value.moments.length > 500) return { path: `${path}.moments`, reason: "invalid competition moment list" };

  const ids = new Set<string>();
  let previousRuntimeDay = -1;
  for (let i = 0; i < value.moments.length; i += 1) {
    const rowPath = `${path}.moments[${i}]`;
    const row = value.moments[i];
    if (!plainRecord(row) || !exactKeys(row, [
      "id", "season", "date", "runtimeDay", "expiresRuntimeDay", "club",
      "competition", "stage", "outcome", "highProfile"
    ])) return { path: rowPath, reason: "competition moment fields do not match v1" };

    for (const key of ["id", "season", "club"]) {
      if (typeof row[key] !== "string" || (row[key] as string).length === 0 || (row[key] as string).length > 500) {
        return { path: `${rowPath}.${key}`, reason: "invalid text" };
      }
    }
    if (!validIsoDate(row.date) || row.date > state.date) return { path: `${rowPath}.date`, reason: "invalid or future competition date" };
    if (typeof row.runtimeDay !== "number" || !Number.isInteger(row.runtimeDay) || row.runtimeDay < 0) {
      return { path: `${rowPath}.runtimeDay`, reason: "invalid runtime day" };
    }
    if (typeof row.expiresRuntimeDay !== "number" || !Number.isInteger(row.expiresRuntimeDay) || row.expiresRuntimeDay < row.runtimeDay) {
      return { path: `${rowPath}.expiresRuntimeDay`, reason: "invalid competition lifetime" };
    }
    if (row.competition !== "domestic_cup" && row.competition !== "continental") {
      return { path: `${rowPath}.competition`, reason: "unsupported competition" };
    }
    if (row.stage !== "final") return { path: `${rowPath}.stage`, reason: "unsupported competition stage" };
    if (row.outcome !== "win" && row.outcome !== "loss") return { path: `${rowPath}.outcome`, reason: "invalid competition outcome" };
    if (row.highProfile !== true) return { path: `${rowPath}.highProfile`, reason: "final must be high-profile" };
    const expectedId = `competition:${row.season}:${row.date}:${row.club}:${row.competition}:final`;
    if (row.id !== expectedId) return { path: `${rowPath}.id`, reason: "non-canonical competition moment id" };
    if ((row.runtimeDay as number) < previousRuntimeDay) return { path: `${rowPath}.runtimeDay`, reason: "competition history is out of order" };
    previousRuntimeDay = row.runtimeDay as number;
    if (ids.has(row.id as string)) return { path: `${rowPath}.id`, reason: "duplicate competition moment" };
    ids.add(row.id as string);
  }
  return null;
}
