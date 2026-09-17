import type { NpcEventKnowledgeRule } from "../catalog/npc-knowledge-rules.js";
import type { GameState } from "../core/types.js";
import { type LockerLeadershipSlot } from "../simulation/locker-leadership.js";
export interface NpcKnowledgeTargetContext {
    lockerSlots: Readonly<Record<LockerLeadershipSlot, string | null>>;
}
/**
 * Capture role-based knowledge targets at scene entry, before any choice/outcome
 * effect can change club or NPC state. This keeps the recipient tied to the
 * actual scene context rather than the post-resolution career state.
 */
export declare function captureNpcKnowledgeTargetContext(state: GameState): NpcKnowledgeTargetContext;
/**
 * Resolve explicit static targets plus role-based targets. Missing slots fail
 * closed by contributing no NPC id. No relation axis, npcRef, seed or role text
 * is used to invent a recipient.
 */
export declare function resolveNpcKnowledgeTargets(rule: NpcEventKnowledgeRule, context: NpcKnowledgeTargetContext): string[];
