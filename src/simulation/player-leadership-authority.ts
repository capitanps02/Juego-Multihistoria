import type { DataValue, GameState } from "../core/types.js";

const STORE_KEY = "playerClubLeadershipAuthority";
const ID = /^[A-Za-z0-9_.:-]+$/;

export type PlayerClubLeadershipRole = "captain_group" | "secondary_captain" | "captain";
export type PlayerClubLeadershipEndReason = "renounced" | "replaced" | "superseded" | "club_change_unobserved";

export interface PlayerClubLeadershipCertification {
  clubId: string;
  role: PlayerClubLeadershipRole;
  certifiedAt: string;
  sourceEventId: string;
  sourceChoiceId: string;
}

export interface PlayerClubLeadershipHistoryEntry extends PlayerClubLeadershipCertification {
  endedAt: string | null;
  endReason: PlayerClubLeadershipEndReason;
}

export interface PlayerLeadershipSuccessorCertification {
  clubId: string;
  npcId: string;
  certifiedAt: string;
  sourceEventId: string;
  sourceChoiceId: string;
}

export interface PlayerClubLeadershipAuthorityIssue {
  path: string;
  reason: string;
}

interface PlayerClubLeadershipAuthorityStore {
  version: 1;
  currentLeadership: PlayerClubLeadershipCertification | null;
  history: PlayerClubLeadershipHistoryEntry[];
  successor: PlayerLeadershipSuccessorCertification | null;
}

function plainRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function validIsoDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function validIdentifier(value: unknown): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= 200 && ID.test(value)
    && !["__proto__", "constructor", "prototype"].includes(value);
}

function validClubId(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0 && value.length <= 200;
}

function isLeadershipRole(value: unknown): value is PlayerClubLeadershipRole {
  return value === "captain_group" || value === "secondary_captain" || value === "captain";
}

function isEndReason(value: unknown): value is PlayerClubLeadershipEndReason {
  return value === "renounced" || value === "replaced" || value === "superseded" || value === "club_change_unobserved";
}

function certificationIssue(
  value: unknown,
  path: string,
  maxDate?: string
): PlayerClubLeadershipAuthorityIssue | null {
  if (!plainRecord(value)) return { path, reason: "leadership certification must be an object" };
  if (Object.keys(value).sort().join(",") !== "certifiedAt,clubId,role,sourceChoiceId,sourceEventId") {
    return { path, reason: "leadership certification fields do not match schema v1" };
  }
  if (!validClubId(value.clubId)) return { path: `${path}.clubId`, reason: "invalid club id" };
  if (!isLeadershipRole(value.role)) return { path: `${path}.role`, reason: "unknown leadership role" };
  if (!validIsoDate(value.certifiedAt)) return { path: `${path}.certifiedAt`, reason: "invalid certification date" };
  if (maxDate !== undefined && value.certifiedAt > maxDate) {
    return { path: `${path}.certifiedAt`, reason: "leadership certification cannot be in the future" };
  }
  if (!validIdentifier(value.sourceEventId)) return { path: `${path}.sourceEventId`, reason: "invalid source event id" };
  if (!validIdentifier(value.sourceChoiceId)) return { path: `${path}.sourceChoiceId`, reason: "invalid source choice id" };
  return null;
}

function historyIssue(
  value: unknown,
  index: number,
  maxDate?: string
): PlayerClubLeadershipAuthorityIssue | null {
  const path = `world.${STORE_KEY}.history[${index}]`;
  if (!plainRecord(value)) return { path, reason: "leadership history entry must be an object" };
  if (Object.keys(value).sort().join(",") !== "certifiedAt,clubId,endReason,endedAt,role,sourceChoiceId,sourceEventId") {
    return { path, reason: "leadership history fields do not match schema v1" };
  }
  const core = {
    clubId: value.clubId,
    role: value.role,
    certifiedAt: value.certifiedAt,
    sourceEventId: value.sourceEventId,
    sourceChoiceId: value.sourceChoiceId
  };
  const issue = certificationIssue(core, path, maxDate);
  if (issue) return issue;
  if (!isEndReason(value.endReason)) return { path: `${path}.endReason`, reason: "unknown leadership end reason" };
  if (value.endedAt !== null) {
    if (!validIsoDate(value.endedAt)) return { path: `${path}.endedAt`, reason: "invalid leadership end date" };
    if (maxDate !== undefined && value.endedAt > maxDate) {
      return { path: `${path}.endedAt`, reason: "leadership end date cannot be in the future" };
    }
    if (value.endedAt < String(value.certifiedAt)) {
      return { path: `${path}.endedAt`, reason: "leadership cannot end before certification" };
    }
  }
  if (value.endReason === "club_change_unobserved" && value.endedAt !== null) {
    return { path: `${path}.endedAt`, reason: "unobserved club changes must not invent an end date" };
  }
  if (value.endReason !== "club_change_unobserved" && value.endedAt === null) {
    return { path: `${path}.endedAt`, reason: "explicit leadership termination requires an end date" };
  }
  return null;
}

function successorIssue(
  value: unknown,
  maxDate?: string
): PlayerClubLeadershipAuthorityIssue | null {
  const path = `world.${STORE_KEY}.successor`;
  if (!plainRecord(value)) return { path, reason: "leadership successor certification must be an object" };
  if (Object.keys(value).sort().join(",") !== "certifiedAt,clubId,npcId,sourceChoiceId,sourceEventId") {
    return { path, reason: "leadership successor fields do not match schema v1" };
  }
  if (!validClubId(value.clubId)) return { path: `${path}.clubId`, reason: "invalid successor club id" };
  if (!validIdentifier(value.npcId)) return { path: `${path}.npcId`, reason: "invalid successor npc id" };
  if (!validIsoDate(value.certifiedAt)) return { path: `${path}.certifiedAt`, reason: "invalid successor certification date" };
  if (maxDate !== undefined && value.certifiedAt > maxDate) {
    return { path: `${path}.certifiedAt`, reason: "successor certification cannot be in the future" };
  }
  if (!validIdentifier(value.sourceEventId)) return { path: `${path}.sourceEventId`, reason: "invalid successor source event id" };
  if (!validIdentifier(value.sourceChoiceId)) return { path: `${path}.sourceChoiceId`, reason: "invalid successor source choice id" };
  return null;
}

/**
 * Read-only validation for the optional authority store. Historical saves may omit it.
 * Validation is deterministic and never consumes RNG.
 */
export function inspectPlayerClubLeadershipAuthority(
  value: unknown,
  maxDate?: string
): PlayerClubLeadershipAuthorityIssue | null {
  if (value === undefined) return null;
  const path = `world.${STORE_KEY}`;
  if (!plainRecord(value)) return { path, reason: "authority store must be an object when present" };
  if (Object.keys(value).sort().join(",") !== "currentLeadership,history,successor,version") {
    return { path, reason: "authority store fields do not match schema v1" };
  }
  if (value.version !== 1) return { path: `${path}.version`, reason: "unsupported leadership authority schema version" };
  if (value.currentLeadership !== null) {
    const issue = certificationIssue(value.currentLeadership, `${path}.currentLeadership`, maxDate);
    if (issue) return issue;
  }
  if (!Array.isArray(value.history) || value.history.length > 500) {
    return { path: `${path}.history`, reason: "leadership history must be a bounded array" };
  }
  for (let i = 0; i < value.history.length; i += 1) {
    const issue = historyIssue(value.history[i], i, maxDate);
    if (issue) return issue;
  }
  if (value.successor !== null) {
    const issue = successorIssue(value.successor, maxDate);
    if (issue) return issue;
  }
  return null;
}

export function assertPlayerClubLeadershipAuthority(value: unknown, maxDate?: string): void {
  const issue = inspectPlayerClubLeadershipAuthority(value, maxDate);
  if (issue) throw new Error(`Invalid player club leadership authority at ${issue.path}: ${issue.reason}`);
}

function certificationFromRecord(value: Record<string, unknown>): PlayerClubLeadershipCertification {
  return {
    clubId: String(value.clubId),
    role: value.role as PlayerClubLeadershipRole,
    certifiedAt: String(value.certifiedAt),
    sourceEventId: String(value.sourceEventId),
    sourceChoiceId: String(value.sourceChoiceId)
  };
}

function historyFromRecord(value: Record<string, unknown>): PlayerClubLeadershipHistoryEntry {
  return {
    ...certificationFromRecord(value),
    endedAt: value.endedAt === null ? null : String(value.endedAt),
    endReason: value.endReason as PlayerClubLeadershipEndReason
  };
}

function successorFromRecord(value: Record<string, unknown>): PlayerLeadershipSuccessorCertification {
  return {
    clubId: String(value.clubId),
    npcId: String(value.npcId),
    certifiedAt: String(value.certifiedAt),
    sourceEventId: String(value.sourceEventId),
    sourceChoiceId: String(value.sourceChoiceId)
  };
}

function readStore(state: GameState): PlayerClubLeadershipAuthorityStore | null {
  const raw = state.world[STORE_KEY];
  if (raw === undefined) return null;
  assertPlayerClubLeadershipAuthority(raw, state.date);
  const record = raw as unknown as Record<string, unknown>;
  return {
    version: 1,
    currentLeadership: record.currentLeadership === null
      ? null
      : certificationFromRecord(record.currentLeadership as Record<string, unknown>),
    history: (record.history as Record<string, unknown>[]).map(historyFromRecord),
    successor: record.successor === null
      ? null
      : successorFromRecord(record.successor as Record<string, unknown>)
  };
}

function certificationValue(row: PlayerClubLeadershipCertification): Record<string, DataValue> {
  return {
    clubId: row.clubId,
    role: row.role,
    certifiedAt: row.certifiedAt,
    sourceEventId: row.sourceEventId,
    sourceChoiceId: row.sourceChoiceId
  };
}

function historyValue(row: PlayerClubLeadershipHistoryEntry): Record<string, DataValue> {
  return {
    ...certificationValue(row),
    endedAt: row.endedAt,
    endReason: row.endReason
  };
}

function successorValue(row: PlayerLeadershipSuccessorCertification): Record<string, DataValue> {
  return {
    clubId: row.clubId,
    npcId: row.npcId,
    certifiedAt: row.certifiedAt,
    sourceEventId: row.sourceEventId,
    sourceChoiceId: row.sourceChoiceId
  };
}

function writeStore(state: GameState, store: PlayerClubLeadershipAuthorityStore): void {
  state.world[STORE_KEY] = {
    version: 1,
    currentLeadership: store.currentLeadership ? certificationValue(store.currentLeadership) : null,
    history: store.history.map(historyValue),
    successor: store.successor ? successorValue(store.successor) : null
  };
}

function emptyStore(): PlayerClubLeadershipAuthorityStore {
  return { version: 1, currentLeadership: null, history: [], successor: null };
}

function archiveCurrent(
  store: PlayerClubLeadershipAuthorityStore,
  state: GameState,
  explicitReason: Exclude<PlayerClubLeadershipEndReason, "club_change_unobserved">
): void {
  const current = store.currentLeadership;
  if (!current) return;
  if (current.clubId !== state.club) {
    store.history.push({ ...current, endedAt: null, endReason: "club_change_unobserved" });
  } else {
    store.history.push({ ...current, endedAt: state.date, endReason: explicitReason });
  }
}

/**
 * Returns only a formally certified leadership role for the player's current club.
 * A stale certification from a previous club fails closed instead of following the player.
 */
export function resolveCurrentPlayerClubLeadership(state: GameState): PlayerClubLeadershipCertification | null {
  const store = readStore(state);
  const current = store?.currentLeadership ?? null;
  if (!current || current.clubId !== state.club) return null;
  return { ...current };
}

/**
 * Returns all certified leadership facts, including a stale current row from a former club.
 * This is historical evidence only and must not be used as proof of current captaincy.
 */
export function listCertifiedPlayerClubLeadership(state: GameState): PlayerClubLeadershipCertification[] {
  const store = readStore(state);
  if (!store) return [];
  const rows = store.history.map(row => ({
    clubId: row.clubId,
    role: row.role,
    certifiedAt: row.certifiedAt,
    sourceEventId: row.sourceEventId,
    sourceChoiceId: row.sourceChoiceId
  }));
  if (store.currentLeadership) rows.push({ ...store.currentLeadership });
  return rows;
}

/**
 * Persist a formal club-leadership fact. Call only from a canonical action that actually
 * establishes the supplied role. Do not call from lockerPower, CAPTAINCY_WINDOW, seeds,
 * relationships, reputation, age or npcRefs.
 */
export function certifyPlayerClubLeadershipInPlace(
  state: GameState,
  role: PlayerClubLeadershipRole,
  sourceEventId: string,
  sourceChoiceId: string
): void {
  if (!isLeadershipRole(role)) throw new Error(`Invalid player club leadership role: ${role}`);
  if (!validIdentifier(sourceEventId) || !validIdentifier(sourceChoiceId)) throw new Error("Invalid player club leadership source");
  if (!validClubId(state.club) || !validIsoDate(state.date)) throw new Error("Cannot certify leadership for invalid current club/date");

  const store = readStore(state) ?? emptyStore();
  const next: PlayerClubLeadershipCertification = {
    clubId: state.club,
    role,
    certifiedAt: state.date,
    sourceEventId,
    sourceChoiceId
  };
  const current = store.currentLeadership;
  if (
    current
    && current.clubId === next.clubId
    && current.role === next.role
    && current.sourceEventId === next.sourceEventId
    && current.sourceChoiceId === next.sourceChoiceId
  ) return;

  if (current) archiveCurrent(store, state, "superseded");
  store.currentLeadership = next;
  if (store.successor && store.successor.clubId !== state.club) store.successor = null;
  writeStore(state, store);
}

/** End an explicitly observed current-club leadership role while retaining its history. */
export function clearPlayerClubLeadershipInPlace(
  state: GameState,
  reason: "renounced" | "replaced"
): void {
  const store = readStore(state);
  if (!store?.currentLeadership) return;
  if (store.currentLeadership.clubId !== state.club) return;
  archiveCurrent(store, state, reason);
  store.currentLeadership = null;
  store.successor = null;
  writeStore(state, store);
}

/**
 * Resolve an explicitly certified named successor. Unknown or generic successors remain null.
 * The named NPC must still be active and belong to the same current club.
 */
export function resolveCertifiedPlayerLeadershipSuccessor(state: GameState): string | null {
  const store = readStore(state);
  const successor = store?.successor ?? null;
  if (!successor || successor.clubId !== state.club) return null;
  const npc = state.npcs.find(candidate => candidate.id === successor.npcId);
  if (!npc || npc.careerState !== "active" || npc.club !== state.club) return null;
  return npc.id;
}

/** Persist only a canonically identified named successor; never infer one from relationships or npcRefs. */
export function certifyPlayerLeadershipSuccessorInPlace(
  state: GameState,
  npcId: string,
  sourceEventId: string,
  sourceChoiceId: string
): void {
  if (!validIdentifier(npcId) || !validIdentifier(sourceEventId) || !validIdentifier(sourceChoiceId)) {
    throw new Error("Invalid player leadership successor certification");
  }
  const npc = state.npcs.find(candidate => candidate.id === npcId);
  if (!npc || npc.careerState !== "active" || npc.club !== state.club) {
    throw new Error(`Cannot certify missing, inactive or off-club leadership successor: ${npcId}`);
  }
  const store = readStore(state) ?? emptyStore();
  store.successor = {
    clubId: state.club,
    npcId,
    certifiedAt: state.date,
    sourceEventId,
    sourceChoiceId
  };
  writeStore(state, store);
}

export function clearPlayerLeadershipSuccessorInPlace(state: GameState): void {
  const store = readStore(state);
  if (!store?.successor) return;
  store.successor = null;
  writeStore(state, store);
}
