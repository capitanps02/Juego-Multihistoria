import { historicalKnowledgeRulesFor } from "../catalog/npc-knowledge-backfill-v1.js";
import {
  getNpcKnowledgeRecord,
  npcKnows,
  rememberNpcFactInPlace
} from "../core/npc-knowledge.js";
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

const pairKey = (npcId: string, factId: string) => `${npcId}\u0000${factId}`;

function certificationMatches(
  certification: NpcKnowledgeLegacyCertification,
  provenance: NpcKnowledgeDecisionProvenance,
  entry: GameState["history"][number]
): boolean {
  return certification.sourceContentIdentity === provenance.sourceContentIdentity
    && certification.eventFingerprint === provenance.eventFingerprint
    && certification.eventId === entry.eventId
    && certification.choiceId === entry.choiceId
    && certification.outcomeId === entry.outcomeId;
}

function historyEntryHasEpistemicAuthority(
  entry: GameState["history"][number],
  index: number,
  context: NpcKnowledgeReconciliationContext
): boolean {
  const provenance = context.decisionProvenance[index];
  const activeEvidence = context.activeEventEvidence[entry.eventId];
  if (!provenance || !activeEvidence) return false;
  if (provenance.eventFingerprint === activeEvidence.fingerprint) return true;
  return (context.legacyCertifications ?? []).some(certification =>
    certificationMatches(certification, provenance, entry)
  );
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
export function reconcileNpcKnowledgeFromHistoryInPlace(
  state: GameState,
  context: NpcKnowledgeReconciliationContext
): string[] {
  const preexisting = new Set<string>();
  for (const npc of state.npcs) {
    for (const factId of Object.keys(npc.knowledge)) {
      if (getNpcKnowledgeRecord(state, npc.id, factId)) preexisting.add(pairKey(npc.id, factId));
    }
  }

  const reconstructed = new Set<string>();
  for (const [index, entry] of state.history.entries()) {
    if (!historyEntryHasEpistemicAuthority(entry, index, context)) continue;
    for (const rule of historicalKnowledgeRulesFor(entry.eventId, entry.choiceId, entry.outcomeId)) {
      const factId = rule.factId ?? entry.eventId;
      for (const npcId of rule.npcIds) {
        const key = pairKey(npcId, factId);
        if (preexisting.has(key)) continue;
        rememberNpcFactInPlace(state, npcId, {
          factId,
          eventId: entry.eventId,
          choiceId: entry.choiceId,
          outcomeId: entry.outcomeId,
          source: rule.source,
          certainty: rule.certainty,
          memory: rule.memory,
          expiresAfterDays: rule.expiresAfterDays,
          relationshipMemory: rule.relationshipMemory,
          club: entry.club,
          learnedAt: entry.date
        });
        reconstructed.add(key);
      }
    }
  }

  // Do not globally prune unrelated persisted knowledge during resume. Only rows
  // reconstructed by this backfill are removed when their historical expiry is
  // already in the past, preventing resurrection without mutating other memories.
  for (const key of reconstructed) {
    const separator = key.indexOf("\u0000");
    const npcId = key.slice(0, separator);
    const factId = key.slice(separator + 1);
    if (npcKnows(state, npcId, factId)) continue;
    const npc = state.npcs.find(candidate => candidate.id === npcId);
    if (!npc) continue;
    delete npc.knowledge[factId];
    npc.memories = npc.memories.filter(id => id !== factId);
    const relation = state.relationships.find(candidate => candidate.npcId === npcId);
    if (relation) relation.memories = relation.memories.filter(id => id !== factId);
  }

  return [...reconstructed].sort();
}
