import type { DataValue, GameState } from "../core/types.js";
import {
  certifyActiveAgentInPlace,
  clearActiveAgentInPlace,
  resolveActiveAgent,
  type ActiveAgentNpcId
} from "./npc-authority.js";

const STORE_KEY = "representationAuthority";

export type RepresentationService = "market" | "media" | "image";
export type RepresentationContactPolicy = "inform_first" | "broad_delegation";

export interface RepresentationTerms {
  commissionPct: number;
  services: readonly RepresentationService[];
  contactPolicy: RepresentationContactPolicy;
}

export interface RepresentationAgreement {
  ordinal: number;
  agentNpcId: ActiveAgentNpcId;
  effectiveAt: string;
  endedAt: string | null;
  endedBy: string | null;
  commissionPct: number;
  services: RepresentationService[];
  contactPolicy: RepresentationContactPolicy;
  source: string;
}

export interface RepresentationAuthorityStore {
  version: 1;
  sequence: number;
  current: RepresentationAgreement | null;
  history: RepresentationAgreement[];
}

const SERVICE_VALUES = new Set<RepresentationService>(["market", "media", "image"]);
const CONTACT_POLICIES = new Set<RepresentationContactPolicy>(["inform_first", "broad_delegation"]);

function record(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function validDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value + "T00:00:00Z");
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function validSource(value: unknown): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= 240;
}

function validAgent(value: unknown): value is ActiveAgentNpcId {
  return value === "NPC_AGT_01" || value === "NPC_AGT_02";
}

function validServices(value: unknown): value is RepresentationService[] {
  if (!Array.isArray(value) || value.length < 1 || value.length > 3) return false;
  if (!value.every(item => typeof item === "string" && SERVICE_VALUES.has(item as RepresentationService))) return false;
  return new Set(value).size === value.length;
}

function validAgreement(value: unknown, current: boolean): value is RepresentationAgreement {
  const row = record(value);
  if (!row) return false;
  const expected = ["ordinal","agentNpcId","effectiveAt","endedAt","endedBy","commissionPct","services","contactPolicy","source"];
  if (Object.keys(row).sort().join(",") !== expected.sort().join(",")) return false;
  if (!Number.isInteger(row.ordinal) || (row.ordinal as number) < 1) return false;
  if (!validAgent(row.agentNpcId) || !validDate(row.effectiveAt)) return false;
  if (typeof row.commissionPct !== "number" || !Number.isFinite(row.commissionPct) || row.commissionPct < 0 || row.commissionPct > 40) return false;
  if (!validServices(row.services) || !CONTACT_POLICIES.has(row.contactPolicy as RepresentationContactPolicy)) return false;
  if (!validSource(row.source)) return false;
  if (current) return row.endedAt === null && row.endedBy === null;
  return validDate(row.endedAt) && validSource(row.endedBy) && (row.endedAt as string) >= (row.effectiveAt as string);
}

function parseStore(value: unknown): RepresentationAuthorityStore | null {
  const store = record(value);
  if (!store) return null;
  if (Object.keys(store).sort().join(",") !== ["version","sequence","current","history"].sort().join(",")) return null;
  if (store.version !== 1 || !Number.isInteger(store.sequence) || (store.sequence as number) < 0) return null;
  if (!Array.isArray(store.history) || !store.history.every(row => validAgreement(row, false))) return null;
  if (store.current !== null && !validAgreement(store.current, true)) return null;

  const ordinals = [
    ...store.history.map(row => (row as RepresentationAgreement).ordinal),
    ...(store.current ? [(store.current as RepresentationAgreement).ordinal] : [])
  ];
  if (new Set(ordinals).size !== ordinals.length) return null;
  if (ordinals.some(ordinal => ordinal > (store.sequence as number))) return null;
  return value as RepresentationAuthorityStore;
}

function assertAgentAvailable(state: GameState, agentNpcId: ActiveAgentNpcId): void {
  const npc = state.npcs.find(candidate => candidate.id === agentNpcId);
  if (!npc || npc.careerState !== "active") throw new Error(`Cannot establish representation with inactive or missing agent: ${agentNpcId}`);
}

function canonicalTerms(terms: RepresentationTerms): RepresentationTerms {
  if (typeof terms.commissionPct !== "number" || !Number.isFinite(terms.commissionPct) || terms.commissionPct < 0 || terms.commissionPct > 40) {
    throw new Error("Representation commissionPct must be within 0..40");
  }
  if (!validServices(terms.services)) throw new Error("Representation services must be unique supported services");
  if (!CONTACT_POLICIES.has(terms.contactPolicy)) throw new Error("Unsupported representation contact policy");
  return {
    commissionPct: terms.commissionPct,
    services: [...terms.services].sort() as RepresentationService[],
    contactPolicy: terms.contactPolicy
  };
}

function mutableStore(state: GameState): RepresentationAuthorityStore {
  const existing = state.world[STORE_KEY];
  if (existing === undefined) {
    const store: RepresentationAuthorityStore = { version: 1, sequence: 0, current: null, history: [] };
    state.world[STORE_KEY] = store as unknown as DataValue;
    return store;
  }
  const parsed = parseStore(existing);
  if (!parsed) throw new Error("Malformed representation authority store");
  return parsed;
}

function closeCurrentInPlace(store: RepresentationAuthorityStore, date: string, source: string): void {
  if (!store.current) return;
  store.history.push({
    ...store.current,
    services: [...store.current.services],
    endedAt: date,
    endedBy: source
  });
  store.current = null;
}

/**
 * Read the current representation agreement only when it agrees with the separately
 * certified active-agent identity. Legacy contact/identity-only states therefore fail
 * closed to null.
 */
export function resolveCurrentRepresentation(state: GameState): RepresentationAgreement | null {
  const store = parseStore(state.world[STORE_KEY]);
  if (!store?.current) return null;
  if (resolveActiveAgent(state) !== store.current.agentNpcId) return null;
  return structuredClone(store.current);
}

/** Detached historical records; malformed stores fail closed to an empty history. */
export function representationHistory(state: GameState): RepresentationAgreement[] {
  const store = parseStore(state.world[STORE_KEY]);
  return store ? structuredClone(store.history) : [];
}

/**
 * Explicitly establish or switch representation together with factual terms.
 * This is the only API that creates representation terms; simple contact or
 * certifyActiveAgentInPlace() remains identity-only.
 */
export function certifyRepresentationInPlace(
  state: GameState,
  agentNpcId: ActiveAgentNpcId,
  terms: RepresentationTerms,
  source: string
): void {
  if (!validSource(source)) throw new Error("Representation source must be a non-empty provenance string");
  const normalized = canonicalTerms(terms);
  assertAgentAvailable(state, agentNpcId);
  const store = mutableStore(state);

  // All inputs/store are validated before the existing active-agent authority is mutated.
  certifyActiveAgentInPlace(state, agentNpcId);
  closeCurrentInPlace(store, state.date, source);
  store.sequence += 1;
  store.current = {
    ordinal: store.sequence,
    agentNpcId,
    effectiveAt: state.date,
    endedAt: null,
    endedBy: null,
    commissionPct: normalized.commissionPct,
    services: [...normalized.services],
    contactPolicy: normalized.contactPolicy,
    source
  };
}

/** Revise terms for the same certified representative while preserving the prior agreement. */
export function updateRepresentationTermsInPlace(
  state: GameState,
  terms: RepresentationTerms,
  source: string
): void {
  const current = resolveCurrentRepresentation(state);
  if (!current) throw new Error("Cannot update representation terms without a current certified agreement");
  certifyRepresentationInPlace(state, current.agentNpcId, terms, source);
}

/** Explicitly terminate representation, preserving the closed agreement in history. */
export function clearRepresentationInPlace(state: GameState, source: string): void {
  if (!validSource(source)) throw new Error("Representation termination source must be non-empty");
  const store = mutableStore(state);
  closeCurrentInPlace(store, state.date, source);
  clearActiveAgentInPlace(state);
}
