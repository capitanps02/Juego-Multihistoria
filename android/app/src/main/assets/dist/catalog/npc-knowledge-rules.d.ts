import type { NpcKnowledgeSource, NpcMemoryClass } from "../core/npc-knowledge.js";
export type NpcKnowledgeTargetSlot = "captain" | "star" | "activeAgent" | "currentClubInstitutional";
export interface NpcEventKnowledgeRule {
    eventId: string;
    choiceIds?: string[];
    outcomeIds?: string[];
    /** Explicit persistent NPC targets known at authoring time. */
    npcIds: string[];
    /**
     * Optional role-based recipients resolved from authoritative runtime contracts.
     * These are live-resolution targets, never inferred from npcRefs, seeds, role
     * text or relationship magnitude.
     */
    targetSlots?: NpcKnowledgeTargetSlot[];
    factId?: string;
    source: NpcKnowledgeSource;
    certainty?: number;
    memory?: NpcMemoryClass;
    expiresAfterDays?: number;
    relationshipMemory?: boolean;
}
export interface NpcEventKnowledgeRequirement {
    eventId: string;
    npcId: string;
    factId: string;
}
/**
 * Conservative knowledge registry.
 *
 * `npcRefs` must never be treated as witnesses. A fact is granted only through
 * an explicit rule in this registry (or a later call to informNpcOfEventInPlace).
 */
export declare const NPC_EVENT_KNOWLEDGE_RULES: NpcEventKnowledgeRule[];
/**
 * Some callbacks are reactions to prior facts. They are eligible only after the
 * reacting NPC actually knows the relevant fact; flags/seeds alone are not enough.
 */
export declare const NPC_EVENT_KNOWLEDGE_REQUIREMENTS: NpcEventKnowledgeRequirement[];
export declare function knowledgeRulesFor(eventId: string, choiceId: string, outcomeId: string): NpcEventKnowledgeRule[];
export declare function knowledgeRequirementsFor(eventId: string): NpcEventKnowledgeRequirement[];
