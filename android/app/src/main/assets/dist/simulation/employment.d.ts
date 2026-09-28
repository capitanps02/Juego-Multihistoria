import type { GameState } from "../core/types.js";
export type EmploymentStatus = "contracted" | "loaned" | "unattached" | "expired_pending_resolution";
export interface PreviousEmployment {
    club: string;
    ownerClub: string;
    registrationClub: string;
    salaryMonthly: number;
    endedDate: string;
    reason: "contract_expired";
}
export interface EmploymentState {
    version: 1;
    status: EmploymentStatus;
    since: string;
    previous: PreviousEmployment | null;
}
/**
 * Read-only employment truth. Historical schema-8 saves may omit the explicit store.
 * Positive-month legacy saves can be projected safely; zero-month legacy saves are
 * deliberately ambiguous and fail closed instead of being rewritten heuristically.
 */
export declare function employmentSnapshot(state: GameState): EmploymentState;
export declare function employmentStatus(state: GameState): EmploymentStatus;
export declare function hasActiveClubEmployment(state: GameState): boolean;
export declare function currentEmploymentClub(state: GameState): string | null;
/** Initialize explicit employment for a new/current state without guessing legacy expiry. */
export declare function ensureEmploymentStateInPlace(state: GameState): EmploymentState;
/**
 * Natural 1→0 contract expiry authority. Former club identifiers remain historical
 * provenance strings, but no longer constitute live employment/registration authority.
 */
export declare function transitionNaturalExpiryInPlace(state: GameState, previousMonths: number): boolean;
/** Formal signing/reactivation authority called only after CareerTerms are accepted. */
export declare function activateEmploymentFromAcceptedTermsInPlace(state: GameState): void;
/**
 * Narrative club changes are legacy-authorized career transitions, not CareerOffer acceptances.
 * Keep the explicit employment store coherent with the already-authoritative narrative flags.
 */
export declare function syncEmploymentAfterNarrativeClubChangeInPlace(state: GameState): void;
/**
 * Narrow employment authority for a narrative transition that has already
 * established a loan owner but would otherwise persist the same identity as
 * registration. It never creates loan authority; LOAN_ACTIVE must already exist.
 */
export declare function setNarrativeLoanRegistrationInPlace(state: GameState, registrationClub: string): void;
