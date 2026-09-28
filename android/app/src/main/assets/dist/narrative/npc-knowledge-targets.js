import { resolveLockerSlot } from "../simulation/locker-leadership.js";
import { resolveActiveAgent, resolveCurrentClubInstitutionalNpc } from "../simulation/npc-authority.js";
/**
 * Capture role-based knowledge targets at scene entry, before any choice/outcome
 * effect can change club, representative or NPC state. This keeps recipients
 * tied to the actual scene context rather than the post-resolution career state.
 */
export function captureNpcKnowledgeTargetContext(state) {
    return {
        lockerSlots: {
            captain: resolveLockerSlot(state, "captain"),
            star: resolveLockerSlot(state, "star")
        },
        activeAgent: resolveActiveAgent(state),
        currentClubInstitutional: resolveCurrentClubInstitutionalNpc(state)
    };
}
function targetFor(slot, context) {
    if (slot === "captain" || slot === "star")
        return context.lockerSlots[slot];
    if (slot === "activeAgent")
        return context.activeAgent;
    return context.currentClubInstitutional;
}
/**
 * Resolve explicit static targets plus role-based targets. Missing slots fail
 * closed by contributing no NPC id. No relation axis, npcRef, seed, role text,
 * contact flag or interaction recency is used to invent a recipient.
 */
export function resolveNpcKnowledgeTargets(rule, context) {
    const ids = new Set(rule.npcIds);
    for (const slot of rule.targetSlots ?? []) {
        const npcId = targetFor(slot, context);
        if (npcId)
            ids.add(npcId);
    }
    return [...ids];
}
