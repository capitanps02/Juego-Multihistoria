import type { DataValue, GameState, HistoryEntry, NPCState, RelationshipState } from "./types.js";

export type NpcKnowledgeSource = "witnessed" | "informed" | "public" | "reported";
export type NpcMemoryClass = "strong" | "temporary" | "practical";

export interface NpcKnowledgeRecord {
  factId: string;
  eventId: string;
  choiceId: string;
  outcomeId: string;
  learnedAt: string;
  source: NpcKnowledgeSource;
  certainty: number;
  memory: NpcMemoryClass;
  club: string;
  expiresAfter?: string;
  sourceNpcId?: string;
}

export interface RememberNpcFactOptions {
  factId: string;
  eventId: string;
  choiceId: string;
  outcomeId: string;
  source: NpcKnowledgeSource;
  certainty?: number;
  memory?: NpcMemoryClass;
  expiresAfterDays?: number;
  sourceNpcId?: string;
  relationshipMemory?: boolean;
  club?: string;
}

export interface InformNpcOptions {
  factId?: string;
  source?: Exclude<NpcKnowledgeSource, "witnessed">;
  certainty?: number;
  memory?: NpcMemoryClass;
  expiresAfterDays?: number;
  sourceNpcId?: string;
  relationshipMemory?: boolean;
}

const MEMORY_RANK: Record<NpcMemoryClass, number> = { practical: 1, temporary: 2, strong: 3 };
const KNOWLEDGE_SOURCES: readonly NpcKnowledgeSource[] = ["witnessed", "informed", "public", "reported"];
const MEMORY_CLASSES: readonly NpcMemoryClass[] = ["strong", "temporary", "practical"];
const clamp = (value: number, min = 0, max = 100) => Math.max(min, Math.min(max, value));

function addDays(iso: string, days: number): string {
  const date = new Date(`${iso}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function defaultExpiryDays(memory: NpcMemoryClass): number | undefined {
  if (memory === "temporary") return 730;
  if (memory === "practical") return 90;
  return undefined;
}

function isIsoDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function nonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

function npcFor(state: GameState, npcId: string): NPCState {
  const npc = state.npcs.find(candidate => candidate.id === npcId);
  if (!npc) throw new Error(`Unknown NPC knowledge target: ${npcId}`);
  return npc;
}

function relationFor(state: GameState, npcId: string): RelationshipState | undefined {
  return state.relationships.find(candidate => candidate.npcId === npcId);
}

function rawRecord(npc: NPCState, factId: string): unknown {
  return (npc.knowledge as Record<string, unknown>)[factId];
}

function parseRecord(
  value: unknown,
  state?: GameState,
  targetNpcId?: string,
  expectedFactId?: string
): NpcKnowledgeRecord | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const row = value as Record<string, unknown>;
  if (
    !nonEmptyString(row.factId) || !nonEmptyString(row.eventId) ||
    !nonEmptyString(row.choiceId) || !nonEmptyString(row.outcomeId) ||
    !isIsoDate(row.learnedAt) || !nonEmptyString(row.club) ||
    typeof row.source !== "string" || !KNOWLEDGE_SOURCES.includes(row.source as NpcKnowledgeSource) ||
    typeof row.memory !== "string" || !MEMORY_CLASSES.includes(row.memory as NpcMemoryClass) ||
    typeof row.certainty !== "number" || !Number.isFinite(row.certainty) || row.certainty < 0 || row.certainty > 100
  ) return undefined;
  if (expectedFactId !== undefined && row.factId !== expectedFactId) return undefined;

  if (row.expiresAfter !== undefined) {
    if (!isIsoDate(row.expiresAfter) || row.expiresAfter <= row.learnedAt) return undefined;
    if (row.memory === "strong") return undefined;
  }

  if (row.sourceNpcId !== undefined) {
    if (!nonEmptyString(row.sourceNpcId)) return undefined;
    if (row.source === "witnessed" || row.source === "public") return undefined;
    if (targetNpcId !== undefined && row.sourceNpcId === targetNpcId) return undefined;
    if (state && !state.npcs.some(candidate => candidate.id === row.sourceNpcId)) return undefined;
  }

  return row as unknown as NpcKnowledgeRecord;
}

export function getNpcKnowledgeRecord(state: GameState, npcId: string, factId: string): NpcKnowledgeRecord | undefined {
  const npc = state.npcs.find(candidate => candidate.id === npcId);
  if (!npc) return undefined;
  return parseRecord(rawRecord(npc, factId), state, npcId, factId);
}

export function npcKnows(state: GameState, npcId: string, factId: string, asOfDate = state.date): boolean {
  const record = getNpcKnowledgeRecord(state, npcId, factId);
  if (!record) return false;
  return !record.expiresAfter || record.expiresAfter > asOfDate;
}

function knowledgeSourceForTransmission(
  state: GameState,
  targetNpcId: string,
  factId: string,
  source: NpcKnowledgeSource,
  sourceNpcId?: string
): NpcKnowledgeRecord | undefined {
  if (!sourceNpcId) return undefined;
  if (source === "witnessed" || source === "public") {
    throw new Error(`NPC source ${sourceNpcId} is incompatible with knowledge source ${source}`);
  }
  if (!state.npcs.some(candidate => candidate.id === sourceNpcId)) {
    throw new Error(`Unknown NPC knowledge source: ${sourceNpcId}`);
  }
  if (sourceNpcId === targetNpcId) {
    throw new Error(`NPC ${targetNpcId} cannot be its own knowledge source for ${factId}`);
  }
  const sourceRecord = getNpcKnowledgeRecord(state, sourceNpcId, factId);
  if (!sourceRecord || !npcKnows(state, sourceNpcId, factId)) {
    throw new Error(`Cannot transmit ${factId} from uninformed NPC source ${sourceNpcId}`);
  }
  return sourceRecord;
}

function laterExpiry(first?: string, second?: string): string | undefined {
  if (!first) return second;
  if (!second) return first;
  return first >= second ? first : second;
}

/**
 * Re-learning an already-known fact can reinforce it, but never make the NPC
 * less certain or turn durable memory into a shorter-lived one. Provenance,
 * learnedAt and club remain the context of first acquisition while the fact is
 * still known. Once it has expired, learning it again creates a fresh record.
 */
function reinforceActiveRecord(existing: NpcKnowledgeRecord, candidate: NpcKnowledgeRecord): NpcKnowledgeRecord {
  const memory = MEMORY_RANK[candidate.memory] > MEMORY_RANK[existing.memory] ? candidate.memory : existing.memory;
  const reinforced: NpcKnowledgeRecord = {
    ...existing,
    certainty: Math.max(existing.certainty, candidate.certainty),
    memory
  };
  if (memory === "strong") {
    delete reinforced.expiresAfter;
  } else {
    const expiry = laterExpiry(existing.expiresAfter, candidate.expiresAfter);
    if (expiry) reinforced.expiresAfter = expiry;
    else delete reinforced.expiresAfter;
  }
  return reinforced;
}

export function rememberNpcFactInPlace(state: GameState, npcId: string, options: RememberNpcFactOptions): NpcKnowledgeRecord {
  const npc = npcFor(state, npcId);
  const sourceRecord = knowledgeSourceForTransmission(state, npcId, options.factId, options.source, options.sourceNpcId);
  const memory = options.memory ?? "temporary";
  const requestedExpiryDays = memory === "strong" ? undefined : (options.expiresAfterDays ?? defaultExpiryDays(memory));
  if (requestedExpiryDays !== undefined && (!Number.isInteger(requestedExpiryDays) || requestedExpiryDays <= 0)) {
    throw new Error(`Invalid NPC knowledge expiry: ${requestedExpiryDays}`);
  }
  const requestedCertainty = clamp(options.certainty ?? 100);
  const certainty = sourceRecord ? Math.min(requestedCertainty, sourceRecord.certainty) : requestedCertainty;
  const candidate: NpcKnowledgeRecord = {
    factId: options.factId,
    eventId: options.eventId,
    choiceId: options.choiceId,
    outcomeId: options.outcomeId,
    learnedAt: state.date,
    source: options.source,
    certainty,
    memory,
    club: options.club ?? state.club
  };
  if (requestedExpiryDays !== undefined) candidate.expiresAfter = addDays(state.date, requestedExpiryDays);
  if (options.sourceNpcId) candidate.sourceNpcId = options.sourceNpcId;

  const existing = getNpcKnowledgeRecord(state, npcId, options.factId);
  const record = existing && npcKnows(state, npcId, options.factId)
    ? reinforceActiveRecord(existing, candidate)
    : candidate;

  npc.knowledge[options.factId] = record as unknown as DataValue;
  if (!npc.memories.includes(options.factId)) npc.memories.push(options.factId);

  if (options.relationshipMemory) {
    const relation = relationFor(state, npcId);
    if (relation && !relation.memories.includes(options.factId)) relation.memories.push(options.factId);
  }
  return record;
}

function latestHistoryEntry(state: GameState, eventId: string): HistoryEntry | undefined {
  return [...state.history].reverse().find(entry => entry.eventId === eventId);
}

export function informNpcOfEventInPlace(state: GameState, npcId: string, eventId: string, options: InformNpcOptions = {}): NpcKnowledgeRecord {
  const entry = latestHistoryEntry(state, eventId);
  if (!entry) throw new Error(`Cannot inform ${npcId} about unknown world fact ${eventId}`);
  const factId = options.factId ?? eventId;
  const sourceRecord = options.sourceNpcId ? getNpcKnowledgeRecord(state, options.sourceNpcId, factId) : undefined;
  return rememberNpcFactInPlace(state, npcId, {
    factId,
    eventId: sourceRecord?.eventId ?? eventId,
    choiceId: sourceRecord?.choiceId ?? entry.choiceId,
    outcomeId: sourceRecord?.outcomeId ?? entry.outcomeId,
    source: options.source ?? "informed",
    certainty: options.certainty ?? 80,
    memory: options.memory ?? "temporary",
    expiresAfterDays: options.expiresAfterDays,
    sourceNpcId: options.sourceNpcId,
    relationshipMemory: options.relationshipMemory
  });
}

export function forgetExpiredNpcKnowledgeInPlace(state: GameState): string[] {
  const forgotten: string[] = [];
  for (const npc of state.npcs) {
    const knowledge = npc.knowledge as Record<string, unknown>;
    for (const factId of Object.keys(knowledge)) {
      const record = parseRecord(knowledge[factId], state, npc.id, factId);
      if (!record?.expiresAfter || record.expiresAfter > state.date) continue;
      delete npc.knowledge[factId];
      npc.memories = npc.memories.filter(id => id !== factId);
      const relation = relationFor(state, npc.id);
      if (relation) relation.memories = relation.memories.filter(id => id !== factId);
      forgotten.push(`${npc.id}:${factId}`);
    }
  }
  return forgotten;
}
