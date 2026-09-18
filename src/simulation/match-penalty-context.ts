import type { DataValue, GameState } from "../core/types.js";
import {
  currentOfficialMatch,
  getSportMatchModelStore,
  type OfficialMatchRecord
} from "./match-model.js";

const STORE_KEY = "sportPenaltySetups";

export interface PenaltyDecisionSetup {
  id: string;
  fixtureId: string;
  date: string;
  club: string;
  designatedTakerRef: string;
  priorMissMinute: number;
  decisionMinute: number;
  scoreHome: number;
  scoreAway: number;
  highProfile: true;
}

export interface PenaltySetupStore {
  version: 1;
  contexts: PenaltyDecisionSetup[];
}

export interface PenaltySetupIssue {
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

/** Pure sporting producer roll. The persisted football seed is stable; no RNG draw is consumed. */
function sportRoll(state: GameState, fixtureId: string, channel: string): number {
  return avalanche32(hashString(`${state.rngState.football.seed}|${fixtureId}|${channel}`));
}

function contextId(fixtureId: string): string {
  return `penalty-setup:${fixtureId}`;
}

function designatedTakerRef(fixtureId: string): string {
  // Sporting identity only. It deliberately does not alias a persistent narrative NPC.
  return `match-actor:${fixtureId}:designated-penalty-taker`;
}

function expectedSetup(state: GameState, match: OfficialMatchRecord): PenaltyDecisionSetup | null {
  if (!match.player.appeared || match.player.injuryUnavailable) return null;

  // High-profile is an explicit fixture-owned sporting classification, not reputation/role inference.
  const highProfile = (sportRoll(state, match.id, "profile") % 1000) < 500;
  if (!highProfile) return null;

  // Not every important match contains the canonical two-penalty hierarchy moment.
  if ((sportRoll(state, match.id, "penalty-hierarchy") % 1000) >= 500) return null;

  const priorMissMinute = 14 + (sportRoll(state, match.id, "prior-miss-minute") % 29); // 14..42
  const playerEntryMinute = match.player.started ? 0 : Math.max(0, 90 - match.player.minutes);
  const projectedDecision = 58 + (sportRoll(state, match.id, "decision-minute") % 27); // 58..84
  const decisionMinute = Math.max(projectedDecision, priorMissMinute + 10, playerEntryMinute + 3);
  if (decisionMinute > 88) return null;

  // A starter who was substituted before this minute is no longer on the field.
  // Substitute appearances are modelled as running from entry until full time.
  const playerExitMinute = match.player.started && match.player.minutes < 90
    ? match.player.minutes
    : 90;
  if (decisionMinute > playerExitMinute) return null;

  const scoreOptions: Array<[number, number]> = [
    [0, 0], [1, 0], [0, 1], [1, 1], [2, 1], [1, 2]
  ];
  const [scoreHome, scoreAway] = scoreOptions[sportRoll(state, match.id, "decision-score") % scoreOptions.length]!;

  return {
    id: contextId(match.id),
    fixtureId: match.id,
    date: match.date,
    club: match.club,
    designatedTakerRef: designatedTakerRef(match.id),
    priorMissMinute,
    decisionMinute,
    scoreHome,
    scoreAway,
    highProfile: true
  };
}

function sameSetup(a: PenaltyDecisionSetup, b: Record<string, unknown>): boolean {
  return a.id === b.id
    && a.fixtureId === b.fixtureId
    && a.date === b.date
    && a.club === b.club
    && a.designatedTakerRef === b.designatedTakerRef
    && a.priorMissMinute === b.priorMissMinute
    && a.decisionMinute === b.decisionMinute
    && a.scoreHome === b.scoreHome
    && a.scoreAway === b.scoreAway
    && b.highProfile === true;
}

export function getPenaltySetupStore(state: GameState): PenaltySetupStore | null {
  const value = state.world[STORE_KEY];
  if (!plainRecord(value) || value.version !== 1 || !Array.isArray(value.contexts)) return null;
  return value as unknown as PenaltySetupStore;
}

function ensureStoreInPlace(state: GameState): PenaltySetupStore {
  const existing = getPenaltySetupStore(state);
  if (existing) return existing;
  const store: PenaltySetupStore = { version: 1, contexts: [] };
  state.world[STORE_KEY] = store as unknown as DataValue;
  return store;
}

/**
 * Materialize the pre-choice sporting setup for MATCH24-like moments.
 * This does not resolve who ultimately takes the second penalty and never resolves scored/missed.
 */
export function recordPenaltyDecisionSetupInPlace(
  state: GameState,
  match: OfficialMatchRecord | null = currentOfficialMatch(state)
): PenaltyDecisionSetup | null {
  const authoritative = currentOfficialMatch(state);
  if (!authoritative) return null;
  // A caller may provide the current row as a convenience, but its fields are
  // never trusted. Only the simulation-owned persisted row can produce facts.
  if (match && authoritative.id !== match.id) return null;
  if (authoritative.date !== state.date || authoritative.club !== state.professional.registrationClub) return null;
  const existing = getPenaltySetupStore(state)?.contexts.find(row => row.fixtureId === authoritative.id);
  if (existing) return existing;

  const setup = expectedSetup(state, authoritative);
  if (!setup) return null;
  ensureStoreInPlace(state).contexts.push(setup);
  return setup;
}

export function currentPenaltyDecisionSetup(state: GameState): PenaltyDecisionSetup | null {
  const match = currentOfficialMatch(state);
  const store = getPenaltySetupStore(state);
  if (!match || !store) return null;
  for (let i = store.contexts.length - 1; i >= 0; i -= 1) {
    const row = store.contexts[i]!;
    if (row.fixtureId === match.id && row.date === state.date && row.club === state.professional.registrationClub) return row;
  }
  return null;
}

/** Read-only validation for the optional penalty-setup store. */
export function inspectPenaltySetupStore(value: unknown, state: GameState): PenaltySetupIssue | null {
  if (value === undefined) return null;
  const path = `world.${STORE_KEY}`;
  if (!plainRecord(value) || !exactKeys(value, ["version", "contexts"])) return { path, reason: "store fields do not match penalty-setup v1" };
  if (value.version !== 1) return { path: `${path}.version`, reason: "unsupported penalty-setup version" };
  if (!Array.isArray(value.contexts) || value.contexts.length > 5000) return { path: `${path}.contexts`, reason: "invalid penalty setup list" };

  const matchStore = getSportMatchModelStore(state);
  const matches = new Map<string, OfficialMatchRecord>(
    matchStore?.fixtures.map(row => [row.id, row] as const) ?? []
  );
  const ids = new Set<string>();
  let previousDate = "";

  for (let i = 0; i < value.contexts.length; i += 1) {
    const rowPath = `${path}.contexts[${i}]`;
    const row = value.contexts[i];
    if (!plainRecord(row) || !exactKeys(row, ["id", "fixtureId", "date", "club", "designatedTakerRef", "priorMissMinute", "decisionMinute", "scoreHome", "scoreAway", "highProfile"])) {
      return { path: rowPath, reason: "penalty setup fields do not match v1" };
    }
    for (const key of ["id", "fixtureId", "club", "designatedTakerRef"]) {
      if (typeof row[key] !== "string" || (row[key] as string).length === 0 || (row[key] as string).length > 500) {
        return { path: `${rowPath}.${key}`, reason: "invalid text" };
      }
    }
    if (!validIsoDate(row.date) || row.date > state.date) return { path: `${rowPath}.date`, reason: "invalid or future setup date" };
    if (row.highProfile !== true) return { path: `${rowPath}.highProfile`, reason: "persisted setup must be high-profile" };
    for (const key of ["priorMissMinute", "decisionMinute", "scoreHome", "scoreAway"]) {
      if (typeof row[key] !== "number" || !Number.isInteger(row[key])) return { path: `${rowPath}.${key}`, reason: "expected integer" };
    }
    if ((row.priorMissMinute as number) < 1 || (row.priorMissMinute as number) > 89) return { path: `${rowPath}.priorMissMinute`, reason: "invalid prior penalty minute" };
    if ((row.decisionMinute as number) <= (row.priorMissMinute as number) || (row.decisionMinute as number) > 89) return { path: `${rowPath}.decisionMinute`, reason: "decision must follow prior miss" };
    if ((row.scoreHome as number) < 0 || (row.scoreHome as number) > 9 || (row.scoreAway as number) < 0 || (row.scoreAway as number) > 9) {
      return { path: rowPath, reason: "invalid decision score" };
    }
    if (row.id !== contextId(row.fixtureId as string)) return { path: `${rowPath}.id`, reason: "non-canonical setup id" };
    if (row.designatedTakerRef !== designatedTakerRef(row.fixtureId as string)) return { path: `${rowPath}.designatedTakerRef`, reason: "non-canonical designated taker identity" };
    if ((row.date as string) < previousDate) return { path: `${rowPath}.date`, reason: "penalty setup history is out of order" };
    previousDate = row.date as string;
    if (ids.has(row.id as string)) return { path: `${rowPath}.id`, reason: "duplicate penalty setup id" };
    ids.add(row.id as string);

    const match = matches.get(row.fixtureId as string);
    if (!match) return { path: `${rowPath}.fixtureId`, reason: "setup references unknown fixture" };
    if (match.date !== row.date || match.club !== row.club) return { path: rowPath, reason: "setup identity does not match fixture" };
    const expected = expectedSetup(state, match);
    if (!expected || !sameSetup(expected, row)) return { path: rowPath, reason: "setup is inconsistent with authoritative sporting producer" };
  }
  return null;
}
