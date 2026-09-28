import type { GameState } from "../core/types.js";
type RetirementStatus = GameState["retirement"]["status"];
interface RetirementTransitionSource {
    eventId?: string;
    choiceId?: string;
}
export type RetirementSportingBoundary = "unavailable" | "matches_remaining" | "season_complete";
type RetirementSportContext = {
    remainingOfficialMatches: unknown;
    availability: {
        remainingOfficialMatches?: unknown;
    };
};
/**
 * Read-only retirement projection over shared sport authority.
 *
 * Main currently exposes this field as unavailable/null, while the authoritative match
 * model upgrades it to known/number. Keeping the input structural and `unknown` makes
 * retirement forward-compatible without claiming sporting authority itself.
 */
export declare function retirementSportingBoundary(sportContext: RetirementSportContext): RetirementSportingBoundary;
/**
 * Authoritative fixtures outrank the legacy administrative timeout. While fixtures remain,
 * an announced player stays playable even if the contract has expired or the old timeout
 * elapsed. Once the modeled season is complete, closure may happen immediately. If the
 * sport authority is unavailable (legacy/current-main fallback), preserve prior behavior.
 */
export declare function shouldCloseAnnouncedCareer(sportContext: RetirementSportContext, administrativeFallback: boolean): boolean;
export declare function isRetirementTransitionAllowed(previous: RetirementStatus, current: RetirementStatus): boolean;
export declare function syncRetirementState(state: GameState, previous: RetirementStatus, source?: RetirementTransitionSource): void;
export declare function closeCareer(state: GameState, reason: string, closureType: string): void;
export declare function reverseRetirement(state: GameState): boolean;
export declare function lateCareerPreseason(state: GameState): void;
export declare function lateCareerWeek(state: GameState): void;
export {};
