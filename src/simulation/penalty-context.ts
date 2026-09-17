import type { DataValue, GameState } from "../core/types.js";
import type { OfficialMatchRecord } from "./match-model.js";

const STORE_KEY = "sportPenaltyContexts";
const DESIGNATED_TAKER_ID = "TEAM_DESIGNATED_PENALTY_TAKER";

export type MatchImportance = "high_profile";

export interface PenaltyHierarchyContext {
  version: 1;
  fixtureId: string;
  date: string;
  club: string;
  importance: MatchImportance;
  playerOnField: true;
  designatedTakerId: string;
  designatedTakerMissedEarlier: true;
  minute: number;
  scoreHome: number;
  scoreAway: number;
  pressure: number;
}

export interface SportPenaltyContextStore {
  version: 1;
  contexts: PenaltyHierarchyContext[];
}

export interface PenaltyContextIssue {
  path: string;
  reason: string;
}

function plainRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function validIsoDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function exactKeys(value: Record<string, unknown>, expected: readonly string[]): boolean {
  return Object.keys(value).sort().join(",") === [...expected].sort().join(",");
}

function hashString(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function avalanche32(value: number): number {
  let x = value >>> 0;
  x ^= x >>> 16;
  x = Math.imul(x, 0x7feb352d);
  x ^= x >>> 15;
  x = Math.imul(x, 0x846ca68b);
  x ^= x >>> 16;
  return x >>> 0;
}

/** Pure producer channel. It reads the stable career seed but consumes zero RNG draws. */
function producerRoll(state: GameState, fixtureId: string, channel: string): number {
  return avalanche32(hashString(`${state.rngState.narrative.seed}|${fixtureId}|penalty-hierarchy|${channel}`));
}

function playerOnFieldAt(match: OfficialMatchRecord, minute: number): boolean {
  if (!match.player.appeared || match.player.injuryUnavailable) return false;
  if (match.player.started) return minute <= match.player.minutes;
  const enteredAt = 90 - match.player.minutes;
  return minute >= enteredAt;
}

export function getSportPenaltyContextStore(state: GameState): SportPenaltyContextStore | null {
  const value = state.world[STORE_KEY];
  if (!plainRecord(value) || value.version !== 1 || !Array.isArray(value.contexts)) return null;
  return value as unknown as SportPenaltyContextStore;
}

function ensureStoreInPlace(state: GameState): SportPenaltyContextStore {
  const existing = getSportPenaltyContextStore(state);
  if (existing) return existing;
  const created: SportPenaltyContextStore = { version: 1, contexts: [] };
  state.world[STORE_KEY] = created as unknown as DataValue;
  return created;
}

/**
 * Materialise the rare canonical setup required by EVT_24_MATCH_001 from a concrete
 * official fixture. The narrative layer cannot request or force this context.
 *
 * The producer deliberately does not resolve the *new* penalty: #85 owns that draw.
 * It records only pre-existing match truth: important fixture, player on the pitch,
 * designated taker, that taker's earlier miss, current minute/score and pressure.
 */
export function recordPenaltyHierarchyContextInPlace(
  state: GameState,
  match: OfficialMatchRecord
): PenaltyHierarchyContext | null {
  const existing = getSportPenaltyContextStore(state)?.contexts.find(row => row.fixtureId === match.id);
  if (existing) return existing;
  if (!match.player.appeared || match.player.injuryUnavailable) return null;

  // One producer-owned scenario channel, rather than independent narrative-friendly
  // gates, keeps the setup rare without letting content reconstruct it from proxies.
  if (producerRoll(state, match.id, "scenario") % 1000 >= 220) return null;

  const minute = 58 + (producerRoll(state, match.id, "minute") % 27); // 58..84
  if (!playerOnFieldAt(match, minute)) return null;

  const scores: ReadonlyArray<readonly [number, number]> = [
    [0, 0], [1, 0], [0, 1], [1, 1], [2, 1], [1, 2]
  ];
  const [scoreHome, scoreAway] = scores[producerRoll(state, match.id, "score") % scores.length]!;
  const context: PenaltyHierarchyContext = {
    version: 1,
    fixtureId: match.id,
    date: match.date,
    club: match.club,
    importance: "high_profile",
    playerOnField: true,
    designatedTakerId: DESIGNATED_TAKER_ID,
    designatedTakerMissedEarlier: true,
    minute,
    scoreHome,
    scoreAway,
    pressure: 70 + (producerRoll(state, match.id, "pressure") % 31)
  };
  ensureStoreInPlace(state).contexts.push(context);
  return context;
}

/** Read the produced context for today's concrete fixture only. */
export function currentPenaltyHierarchyContext(state: GameState): PenaltyHierarchyContext | null {
  const store = getSportPenaltyContextStore(state);
  if (!store) return null;
  for (let i = store.contexts.length - 1; i >= 0; i -= 1) {
    const row = store.contexts[i]!;
    if (row.date === state.date && row.club === state.professional.registrationClub) return row;
  }
  return null;
}

function contextIssue(
  value: unknown,
  index: number,
  maxDate: string | undefined,
  fixtureIds: ReadonlySet<string>
): PenaltyContextIssue | null {
  const path = `world.${STORE_KEY}.contexts[${index}]`;
  if (!plainRecord(value)) return { path, reason: "context must be an object" };
  if (!exactKeys(value, [
    "version", "fixtureId", "date", "club", "importance", "playerOnField",
    "designatedTakerId", "designatedTakerMissedEarlier", "minute", "scoreHome",
    "scoreAway", "pressure"
  ])) return { path, reason: "context fields do not match penalty-context v1" };
  if (value.version !== 1) return { path: `${path}.version`, reason: "unsupported context version" };
  if (typeof value.fixtureId !== "string" || !fixtureIds.has(value.fixtureId)) {
    return { path: `${path}.fixtureId`, reason: "context must reference an authoritative fixture" };
  }
  if (!validIsoDate(value.date)) return { path: `${path}.date`, reason: "invalid context date" };
  if (maxDate !== undefined && value.date > maxDate) return { path: `${path}.date`, reason: "context cannot be in the future" };
  if (typeof value.club !== "string" || value.club.length === 0) return { path: `${path}.club`, reason: "invalid club" };
  if (value.importance !== "high_profile") return { path: `${path}.importance`, reason: "unsupported match importance" };
  if (value.playerOnField !== true) return { path: `${path}.playerOnField`, reason: "penalty hierarchy context requires player on field" };
  if (value.designatedTakerId !== DESIGNATED_TAKER_ID) return { path: `${path}.designatedTakerId`, reason: "invalid designated taker identity" };
  if (value.designatedTakerMissedEarlier !== true) return { path: `${path}.designatedTakerMissedEarlier`, reason: "context requires factual prior miss" };
  if (typeof value.minute !== "number" || !Number.isInteger(value.minute) || value.minute < 1 || value.minute > 89) {
    return { path: `${path}.minute`, reason: "invalid penalty decision minute" };
  }
  for (const key of ["scoreHome", "scoreAway"] as const) {
    const score = value[key];
    if (typeof score !== "number" || !Number.isInteger(score) || score < 0 || score > 9) {
      return { path: `${path}.${key}`, reason: "invalid score" };
    }
  }
  if (typeof value.pressure !== "number" || !Number.isInteger(value.pressure) || value.pressure < 0 || value.pressure > 100) {
    return { path: `${path}.pressure`, reason: "invalid pressure" };
  }
  return null;
}

/**
 * Read-only save validation. A context is invalid unless its referenced fixture is
 * present in the authoritative match store. Historical saves may omit this store.
 */
export function inspectSportPenaltyContextStore(
  value: unknown,
  maxDate?: string,
  matchModelValue?: unknown
): PenaltyContextIssue | null {
  if (value === undefined) return null;
  const path = `world.${STORE_KEY}`;
  if (!plainRecord(value) || !exactKeys(value, ["version", "contexts"])) return { path, reason: "store fields do not match penalty-context v1" };
  if (value.version !== 1) return { path: `${path}.version`, reason: "unsupported penalty-context store version" };
  if (!Array.isArray(value.contexts) || value.contexts.length > 5000) return { path: `${path}.contexts`, reason: "invalid context list" };

  const fixtureIds = new Set<string>();
  if (plainRecord(matchModelValue) && Array.isArray(matchModelValue.fixtures)) {
    for (const row of matchModelValue.fixtures) {
      if (plainRecord(row) && typeof row.id === "string") fixtureIds.add(row.id);
    }
  }
  if (value.contexts.length > 0 && fixtureIds.size === 0) return { path, reason: "penalty contexts require authoritative match history" };

  const seen = new Set<string>();
  let previousDate = "";
  for (let i = 0; i < value.contexts.length; i += 1) {
    const issue = contextIssue(value.contexts[i], i, maxDate, fixtureIds);
    if (issue) return issue;
    const row = value.contexts[i] as Record<string, unknown>;
    if ((row.date as string) < previousDate) return { path: `${path}.contexts[${i}].date`, reason: "context history is out of order" };
    previousDate = row.date as string;
    if (seen.has(row.fixtureId as string)) return { path: `${path}.contexts[${i}].fixtureId`, reason: "duplicate fixture context" };
    seen.add(row.fixtureId as string);
  }
  return null;
}
