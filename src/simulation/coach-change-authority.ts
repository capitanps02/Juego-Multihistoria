import type { DataValue, GameState } from "../core/types.js";

export type CoachChangeKind = "security_firing" | "canonical_change" | "external_change";

export interface CoachChangeRecord {
  ordinal: number;
  clubId: string;
  date: string;
  day: number;
  season: string;
  kind: CoachChangeKind;
  previousCoachNpcId: string | null;
  newCoachNpcId: string | null;
}

interface CoachChangeStore {
  history: CoachChangeRecord[];
}

const KINDS: readonly CoachChangeKind[] = ["security_firing", "canonical_change", "external_change"];
const STORE_KEY = "coachChangeAuthority";

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringOrNull(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function parseRecord(value: unknown): CoachChangeRecord | null {
  if (!isObject(value)) return null;
  const ordinal = value.ordinal;
  const clubId = value.clubId;
  const date = value.date;
  const day = value.day;
  const season = value.season;
  const kind = value.kind;
  if (!Number.isInteger(ordinal) || Number(ordinal) < 1) return null;
  if (typeof clubId !== "string" || clubId.length === 0) return null;
  if (typeof date !== "string" || date.length === 0) return null;
  if (!Number.isInteger(day) || Number(day) < 0) return null;
  if (typeof season !== "string" || season.length === 0) return null;
  if (typeof kind !== "string" || !(KINDS as readonly string[]).includes(kind)) return null;

  return {
    ordinal: Number(ordinal),
    clubId,
    date,
    day: Number(day),
    season,
    kind: kind as CoachChangeKind,
    previousCoachNpcId: stringOrNull(value.previousCoachNpcId),
    newCoachNpcId: stringOrNull(value.newCoachNpcId)
  };
}

function readStore(state: GameState): CoachChangeStore {
  const raw = state.world[STORE_KEY];
  if (!isObject(raw) || !Array.isArray(raw.history)) return { history: [] };
  const history = raw.history.map(parseRecord).filter((row): row is CoachChangeRecord => row !== null);
  history.sort((a, b) => a.ordinal - b.ordinal || a.day - b.day);
  return { history };
}

function toDataValue(store: CoachChangeStore): DataValue {
  return {
    history: store.history.map(row => ({
      ordinal: row.ordinal,
      clubId: row.clubId,
      date: row.date,
      day: row.day,
      season: row.season,
      kind: row.kind,
      previousCoachNpcId: row.previousCoachNpcId,
      newCoachNpcId: row.newCoachNpcId
    }))
  };
}

/**
 * Certify a coach change that actually happened in the current registered club.
 * Identities are optional and must only be supplied by a caller that has independent
 * canonical authority for them. This helper never infers a replacement NPC.
 */
export function certifyCoachChangeInPlace(
  state: GameState,
  kind: CoachChangeKind,
  identities: { previousCoachNpcId?: string | null; newCoachNpcId?: string | null } = {}
): CoachChangeRecord {
  const store = readStore(state);
  const ordinal = (store.history.at(-1)?.ordinal ?? 0) + 1;
  const record: CoachChangeRecord = {
    ordinal,
    clubId: state.club,
    date: state.date,
    day: state.runtime.day,
    season: state.season,
    kind,
    previousCoachNpcId: stringOrNull(identities.previousCoachNpcId),
    newCoachNpcId: stringOrNull(identities.newCoachNpcId)
  };
  store.history.push(record);
  state.world[STORE_KEY] = toDataValue(store);
  return { ...record };
}

/** Historical latest certified change, irrespective of current club. */
export function resolveLatestCoachChange(state: GameState): CoachChangeRecord | null {
  const latest = readStore(state).history.at(-1);
  return latest ? { ...latest } : null;
}

/**
 * Resolve a recent coach change for the player's current club.
 *
 * Legacy `COACH_FIRED=true` without chronology intentionally fails closed. A club
 * change also invalidates current-club resolution while historical chronology stays
 * queryable through `resolveLatestCoachChange`.
 */
export function resolveRecentCurrentClubCoachChange(
  state: GameState,
  maxDays = 90
): CoachChangeRecord | null {
  if (!Number.isFinite(maxDays) || maxDays < 0) return null;
  const history = readStore(state).history;
  for (let index = history.length - 1; index >= 0; index -= 1) {
    const record = history[index]!;
    if (record.clubId !== state.club) continue;
    const elapsed = state.runtime.day - record.day;
    if (elapsed < 0 || elapsed > maxDays) return null;
    return { ...record };
  }
  return null;
}
