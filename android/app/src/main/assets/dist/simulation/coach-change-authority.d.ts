import type { GameState } from "../core/types.js";
export type CoachChangeKind = "security_firing" | "canonical_change" | "external_change";
export interface CoachChangeRecord {
    ordinal: number;
    clubId: string;
    date: string;
    day: number;
    season: string;
    kind: CoachChangeKind;
    previousCoachNpcId: string | null;
    newCoachNpcId: string | null;
}
/**
 * Certify a coach change that actually happened in the current registered club.
 * Identities are optional and must only be supplied by a caller that has independent
 * canonical authority for them. This helper never infers a replacement NPC.
 */
export declare function certifyCoachChangeInPlace(state: GameState, kind: CoachChangeKind, identities?: {
    previousCoachNpcId?: string | null;
    newCoachNpcId?: string | null;
}): CoachChangeRecord;
/** Historical latest certified change, irrespective of current club. */
export declare function resolveLatestCoachChange(state: GameState): CoachChangeRecord | null;
/**
 * Resolve a recent coach change for the player's current club.
 *
 * Legacy `COACH_FIRED=true` without chronology intentionally fails closed. A club
 * change also invalidates current-club resolution while historical chronology stays
 * queryable through `resolveLatestCoachChange`.
 */
export declare function resolveRecentCurrentClubCoachChange(state: GameState, maxDays?: number): CoachChangeRecord | null;
