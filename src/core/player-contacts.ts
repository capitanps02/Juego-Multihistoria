import { NPC_CATALOG } from "../catalog/npcs.js";
import type { GameState, HistoryEntry } from "./types.js";

export interface PublicPlayerContact {
  id: string;
  name: string;
  role: string;
}

export interface ContactDecisionProvenance {
  sourceContentIdentity: string;
  eventFingerprint: string;
}

export type PlayerContactRuleProvenance =
  | { kind: "invariant" }
  | { kind: "event_fingerprints"; eventFingerprints: readonly string[] };

export interface PlayerContactRule {
  eventId: string;
  npcIds: string[];
  choiceIds?: string[];
  outcomeIds?: string[];
  /**
   * `invariant` is an explicit semantic certification across every supported
   * source catalog. Otherwise the resolved decision must carry one of the exact
   * event fingerprints listed here. No provenance means no match for a
   * fingerprint-bound rule.
   */
  provenance: PlayerContactRuleProvenance;
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
    npcIds: ["NPC_ACA_01"],
    // Audited across every currently supported content source. A regression test
    // requires all frozen/active definitions to retain the same event fingerprint;
    // if a future batch changes this event, the rule must become fingerprint-bound.
    provenance: { kind: "invariant" }
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

export function contactIntroductionRuleMatches(
  rule: PlayerContactRule,
  entry: HistoryEntry,
  provenance?: ContactDecisionProvenance
): boolean {
  if (rule.choiceIds && !rule.choiceIds.includes(entry.choiceId)) return false;
  if (rule.outcomeIds && !rule.outcomeIds.includes(entry.outcomeId)) return false;
  if (rule.provenance.kind === "invariant") return true;
  return Boolean(
    provenance
    && rule.provenance.eventFingerprints.includes(provenance.eventFingerprint)
  );
}

/**
 * Reconstruct the protagonist-facing contact set from durable factual history.
 * Deny-by-default: no rule means no newly visible contact. Fingerprint-bound
 * rules additionally require the 1:1 decision provenance row.
 */
export function knownPlayerContactIds(
  state: GameState,
  decisionProvenance?: readonly ContactDecisionProvenance[]
): string[] {
  const known = new Set<string>(INITIAL_IDS);
  for (const [index, entry] of state.history.entries()) {
    const provenance = decisionProvenance?.[index];
    for (const rule of RULES_BY_EVENT.get(entry.eventId) ?? []) {
      if (!contactIntroductionRuleMatches(rule, entry, provenance)) continue;
      for (const npcId of rule.npcIds) if (CATALOG_IDS.has(npcId)) known.add(npcId);
    }
  }
  return NPC_CATALOG.filter(npc => known.has(npc.id)).map(npc => npc.id);
}

export function playerKnowsNpc(
  state: GameState,
  npcId: string,
  decisionProvenance?: readonly ContactDecisionProvenance[]
): boolean {
  if (!CATALOG_IDS.has(npcId)) return false;
  return knownPlayerContactIds(state, decisionProvenance).includes(npcId);
}

export function knownPlayerContacts(
  state: GameState,
  decisionProvenance?: readonly ContactDecisionProvenance[]
): PublicPlayerContact[] {
  const ids = new Set(knownPlayerContactIds(state, decisionProvenance));
  return NPC_CATALOG
    .filter(npc => ids.has(npc.id))
    .map(npc => ({ id: npc.id, name: npc.name, role: npc.role }));
}
