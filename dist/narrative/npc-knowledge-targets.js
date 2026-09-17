import { resolveLockerSlot } from "../simulation/locker-leadership.js";
/**
 * Capture role-based knowledge targets at scene entry, before any choice/outcome
 * effect can change club or NPC state. This keeps the recipient tied to the
 * actual scene context rather than the post-resolution career state.
 */
export function captureNpcKnowledgeTargetContext(state) {
    return {
        lockerSlots: {
            captain: resolveLockerSlot(state, "captain"),
            star: resolveLockerSlot(state, "star")
        }
    };
}
/**
 * Resolve explicit static targets plus role-based targets. Missing slots fail
 * closed by contributing no NPC id. No relation axis, npcRef, seed or role text
 * is used to invent a recipient.
 */
export function resolveNpcKnowledgeTargets(rule, context) {
    const ids = new Set(rule.npcIds);
    for (const slot of rule.targetSlots ?? []) {
        const npcId = context.lockerSlots[slot];
        if (npcId)
            ids.add(npcId);
    }
    return [...ids];
}
