import { NPC_CATALOG } from "../catalog/npcs.js";
import type { GameState, HistoryEntry } from "./types.js";

export interface PublicPlayerContact {
  id: string;
  name: string;
  role: string;
}

export interface PlayerContactRule {
  eventId: string;
  npcIds: string[];
  choiceIds?: string[];
  outcomeIds?: string[];
}

/**
 * Contacts that are unambiguously known before the first playable scene.
 * Keep this deliberately conservative: family plus explicitly described friends.
 */
export const INITIAL_PLAYER_CONTACT_IDS = [
  "NPC_PLR_14", // Nano — explicitly the protagonist's friend.
  "NPC_FAM_01",
  "NPC_FAM_02",
  "NPC_FAM_03",
  "NPC_SOC_01" // Dani — childhood friend.
] as const;

/**
 * Explicit introductions learned by the protagonist through resolved history.
 * This is intentionally independent from npcRefs, relationships and NPC knowledge.
 */
export const PLAYER_CONTACT_RULES: readonly PlayerContactRule[] = [
  {
    eventId: "EVT_18_PRE_001",
    choiceIds: ["CALL_RIVAS"],
    npcIds: ["NPC_ACA_01"]
  }
];

const CATALOG_IDS = new Set(NPC_CATALOG.map(npc => npc.id));
const INITIAL_IDS = new Set<string>(INITIAL_PLAYER_CONTACT_IDS);
const RULES_BY_EVENT = new Map<string, PlayerContactRule[]>();
for (const rule of PLAYER_CONTACT_RULES) {
  const bucket = RULES_BY_EVENT.get(rule.eventId) ?? [];
  bucket.push(rule);
  RULES_BY_EVENT.set(rule.eventId, bucket);
}

function matches(rule: PlayerContactRule, entry: HistoryEntry): boolean {
  if (rule.choiceIds && !rule.choiceIds.includes(entry.choiceId)) return false;
  if (rule.outcomeIds && !rule.outcomeIds.includes(entry.outcomeId)) return false;
  return true;
}

/**
 * Reconstruct the protagonist-facing contact set from durable factual history.
 * Deny-by-default: no rule means no newly visible contact.
 */
export function knownPlayerContactIds(state: GameState): string[] {
  const known = new Set<string>(INITIAL_IDS);
  for (const entry of state.history) {
    for (const rule of RULES_BY_EVENT.get(entry.eventId) ?? []) {
      if (!matches(rule, entry)) continue;
      for (const npcId of rule.npcIds) if (CATALOG_IDS.has(npcId)) known.add(npcId);
    }
  }
  return NPC_CATALOG.filter(npc => known.has(npc.id)).map(npc => npc.id);
}

export function playerKnowsNpc(state: GameState, npcId: string): boolean {
  if (!CATALOG_IDS.has(npcId)) return false;
  return knownPlayerContactIds(state).includes(npcId);
}

export function knownPlayerContacts(state: GameState): PublicPlayerContact[] {
  const ids = new Set(knownPlayerContactIds(state));
  return NPC_CATALOG
    .filter(npc => ids.has(npc.id))
    .map(npc => ({ id: npc.id, name: npc.name, role: npc.role }));
}
