import type { GameState, NarrativePhase } from "../core/types.js";
export type LockerLeadershipSlot = "captain" | "star";
export type LockerRelationshipAxis = "trust" | "affinity" | "respect" | "resentment" | "leverage";
export interface LockerLeadershipAssignment {
    club: string;
    phases: readonly NarrativePhase[];
    captain: string | null;
    star: string | null;
    evidence: string;
}
/**
 * Explicit, audited leadership assignments only. This is deliberately sparse:
 * unknown clubs/phases and uncertified slots resolve to null rather than being
 * inferred from visible role text, relationship scores or protagonist state.
 */
export declare const LOCKER_LEADERSHIP_ASSIGNMENTS: readonly LockerLeadershipAssignment[];
/**
 * Resolve an authoritative leadership slot for the player's current club/phase.
 *
 * The declared NPC must still exist, be active and belong to the current club.
 * This prevents stale UDV leadership from leaking after a club change or NPC move.
 */
export declare function resolveLockerSlot(state: GameState, slot: LockerLeadershipSlot): string | null;
/** Read a relationship axis against the currently resolved slot, fail-closed. */
export declare function lockerSlotRelationship(state: GameState, slot: LockerLeadershipSlot, axis: LockerRelationshipAxis): number | null;
export declare function lockerSlotAffinity(state: GameState, slot: LockerLeadershipSlot): number | null;
