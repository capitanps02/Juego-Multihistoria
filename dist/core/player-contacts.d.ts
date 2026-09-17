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
export type PlayerContactRuleProvenance = {
    kind: "invariant";
} | {
    kind: "exact_sources";
    sources: readonly ContactDecisionProvenance[];
};
export interface PlayerContactRule {
    eventId: string;
    npcIds: string[];
    choiceIds?: string[];
    outcomeIds?: string[];
    /**
     * `invariant` is an explicit semantic certification across every supported
     * source catalog. Otherwise the resolved decision must carry one of the exact
     * sourceContentIdentity + eventFingerprint pairs listed here. No provenance
     * means no match for a source-bound rule.
     */
    provenance: PlayerContactRuleProvenance;
}
/**
 * Contacts that are unambiguously known before the first playable scene.
 * Keep this deliberately conservative: family plus explicitly described friends.
 */
export declare const INITIAL_PLAYER_CONTACT_IDS: readonly ["NPC_PLR_14", "NPC_FAM_01", "NPC_FAM_02", "NPC_FAM_03", "NPC_SOC_01"];
/**
 * Explicit introductions learned by the protagonist through resolved history.
 * This is intentionally independent from npcRefs, relationships and NPC knowledge.
 */
export declare const PLAYER_CONTACT_RULES: readonly PlayerContactRule[];
export declare function contactIntroductionRuleMatches(rule: PlayerContactRule, entry: HistoryEntry, provenance?: ContactDecisionProvenance): boolean;
/**
 * Reconstruct the protagonist-facing contact set from durable factual history.
 * Deny-by-default: no rule means no newly visible contact. Source-bound rules
 * additionally require the matching 1:1 decision provenance row.
 */
export declare function knownPlayerContactIds(state: GameState, decisionProvenance?: readonly ContactDecisionProvenance[]): string[];
export declare function playerKnowsNpc(state: GameState, npcId: string, decisionProvenance?: readonly ContactDecisionProvenance[]): boolean;
export declare function knownPlayerContacts(state: GameState, decisionProvenance?: readonly ContactDecisionProvenance[]): PublicPlayerContact[];
