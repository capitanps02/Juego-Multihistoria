import type { GameState } from "../core/types.js";
export type PlayerClubLeadershipRole = "captain_group" | "secondary_captain" | "captain";
export type PlayerClubLeadershipEndReason = "renounced" | "replaced" | "superseded" | "club_change_unobserved";
export interface PlayerClubLeadershipCertification {
    clubId: string;
    role: PlayerClubLeadershipRole;
    certifiedAt: string;
    sourceEventId: string;
    sourceChoiceId: string;
}
export interface PlayerClubLeadershipHistoryEntry extends PlayerClubLeadershipCertification {
    endedAt: string | null;
    endReason: PlayerClubLeadershipEndReason;
}
export interface PlayerLeadershipSuccessorCertification {
    clubId: string;
    npcId: string;
    certifiedAt: string;
    sourceEventId: string;
    sourceChoiceId: string;
}
export interface PlayerClubLeadershipAuthorityIssue {
    path: string;
    reason: string;
}
/**
 * Read-only validation for the optional authority store. Historical saves may omit it.
 * Validation is deterministic and never consumes RNG.
 */
export declare function inspectPlayerClubLeadershipAuthority(value: unknown, maxDate?: string): PlayerClubLeadershipAuthorityIssue | null;
export declare function assertPlayerClubLeadershipAuthority(value: unknown, maxDate?: string): void;
/**
 * Returns only a formally certified leadership role for the player's current club.
 * A stale certification from a previous club fails closed instead of following the player.
 */
export declare function resolveCurrentPlayerClubLeadership(state: GameState): PlayerClubLeadershipCertification | null;
/**
 * Returns all certified leadership facts, including a stale current row from a former club.
 * This is historical evidence only and must not be used as proof of current captaincy.
 */
export declare function listCertifiedPlayerClubLeadership(state: GameState): PlayerClubLeadershipCertification[];
/**
 * Persist a formal club-leadership fact. Call only from a canonical action that actually
 * establishes the supplied role. Do not call from lockerPower, CAPTAINCY_WINDOW, seeds,
 * relationships, reputation, age or npcRefs.
 */
export declare function certifyPlayerClubLeadershipInPlace(state: GameState, role: PlayerClubLeadershipRole, sourceEventId: string, sourceChoiceId: string): void;
/** End an explicitly observed current-club leadership role while retaining its history. */
export declare function clearPlayerClubLeadershipInPlace(state: GameState, reason: "renounced" | "replaced"): void;
/**
 * Resolve an explicitly certified named successor. Unknown or generic successors remain null.
 * The named NPC must still be active and belong to the same current club.
 */
export declare function resolveCertifiedPlayerLeadershipSuccessor(state: GameState): string | null;
/** Persist only a canonically identified named successor; never infer one from relationships or npcRefs. */
export declare function certifyPlayerLeadershipSuccessorInPlace(state: GameState, npcId: string, sourceEventId: string, sourceChoiceId: string): void;
export declare function clearPlayerLeadershipSuccessorInPlace(state: GameState): void;
