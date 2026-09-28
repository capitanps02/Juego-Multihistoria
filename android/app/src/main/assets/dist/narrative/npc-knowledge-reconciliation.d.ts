import type { GameState } from "../core/types.js";
export interface NpcKnowledgeDecisionProvenance {
    sourceContentIdentity: string;
    eventFingerprint: string;
}
export interface NpcKnowledgeEventEvidence {
    fingerprint: string;
}
export interface NpcKnowledgeLegacyCertification {
    sourceContentIdentity: string;
    eventFingerprint: string;
    eventId: string;
    choiceId: string;
    outcomeId: string;
}
export interface NpcKnowledgeReconciliationContext {
    decisionProvenance: readonly NpcKnowledgeDecisionProvenance[];
    activeEventEvidence: Readonly<Record<string, NpcKnowledgeEventEvidence>>;
    legacyCertifications?: readonly NpcKnowledgeLegacyCertification[];
}
/**
 * Backfill only missing/semantically-invalid T5.3 knowledge from durable history.
 *
 * Historical ids are not semantic proof. Every history row must also be backed by
 * decision provenance whose event fingerprint matches the active event definition,
 * or by an exact explicit legacy certification. This fails closed on exact-id
 * semantic collisions introduced by content migrations (T5-QA-017).
 *
 * Historical rule semantics are also frozen independently from the live registry.
 * Reconciliation uses the immutable v1 backfill baseline rather than
 * NPC_EVENT_KNOWLEDGE_RULES, so a future live-rule change cannot reinterpret an
 * old save whose event fingerprint stayed unchanged (T5-QA-021).
 *
 * Valid persisted rows are authoritative and are never rewritten. Missing rows,
 * including invalid legacy rows that cannot satisfy npcKnows(), are reconstructed
 * only through frozen explicit event rules after semantic provenance has been established.
 *
 * The operation is deterministic, consumes no RNG, does not rewrite history and
 * is idempotent once the canonical rows have been reconstructed.
 */
export declare function reconcileNpcKnowledgeFromHistoryInPlace(state: GameState, context: NpcKnowledgeReconciliationContext): string[];
