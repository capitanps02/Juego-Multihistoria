import type { NpcEventKnowledgeRule } from "./npc-knowledge-rules.js";
/**
 * Immutable semantic baseline used only to reconstruct missing T5.3 knowledge
 * from historical saves. Live event resolution MUST continue to use
 * NPC_EVENT_KNOWLEDGE_RULES from npc-knowledge-rules.ts.
 *
 * Do not edit this v1 baseline in place when live rules evolve. If historical
 * backfill semantics must intentionally expand, add a new explicitly versioned
 * baseline/provenance decision instead. The SHA-256 ratchet is asserted by QA.
 */
export declare const NPC_KNOWLEDGE_BACKFILL_V1_SHA256 = "80187bea933b80035e0c5c02d28fffe2d5d7bea84df0f478288461214aaee4d6";
export declare const NPC_KNOWLEDGE_BACKFILL_RULES_V1: readonly NpcEventKnowledgeRule[];
export declare function historicalKnowledgeRulesFor(eventId: string, choiceId: string, outcomeId: string): NpcEventKnowledgeRule[];
