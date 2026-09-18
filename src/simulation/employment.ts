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

function persisted(state: GameState): EmploymentState | undefined {
  return state.employment;
}

/**
 * Read-only employment truth. Historical schema-8 saves may omit the explicit store.
 * Positive-month legacy saves can be projected safely; zero-month legacy saves are
 * deliberately ambiguous and fail closed instead of being rewritten heuristically.
 */
export function employmentSnapshot(state: GameState): EmploymentState {
  const stored = persisted(state);
  if (stored) return structuredClone(stored);
  const months = Number(state.contract.monthsRemaining);
  const status: EmploymentStatus = months <= 0
    ? "expired_pending_resolution"
    : state.flags.LOAN_ACTIVE
      ? "loaned"
      : "contracted";
  return { version: 1, status, since: state.date, previous: null };
}

export function employmentStatus(state: GameState): EmploymentStatus {
  return employmentSnapshot(state).status;
}

export function hasActiveClubEmployment(state: GameState): boolean {
  const status = employmentStatus(state);
  return status === "contracted" || status === "loaned";
}

export function currentEmploymentClub(state: GameState): string | null {
  return hasActiveClubEmployment(state) ? state.professional.registrationClub : null;
}

/** Initialize explicit employment for a new/current state without guessing legacy expiry. */
export function ensureEmploymentStateInPlace(state: GameState): EmploymentState {
  if (state.employment) return state.employment;
  const snapshot = employmentSnapshot(state);
  state.employment = snapshot;
  return snapshot;
}

/**
 * Natural 1→0 contract expiry authority. Former club identifiers remain historical
 * provenance strings, but no longer constitute live employment/registration authority.
 */
export function transitionNaturalExpiryInPlace(state: GameState, previousMonths: number): boolean {
  if (previousMonths <= 0 || Number(state.contract.monthsRemaining) !== 0) return false;
  const employment = ensureEmploymentStateInPlace(state);
  if (employment.status === "unattached") return false;
  if (employment.status === "expired_pending_resolution") return false;
  employment.previous = {
    club: state.club,
    ownerClub: state.professional.ownerClub,
    registrationClub: state.professional.registrationClub,
    salaryMonthly: Number(state.contract.salaryMonthly),
    endedDate: state.date,
    reason: "contract_expired"
  };
  employment.status = "unattached";
  employment.since = state.date;
  state.contract.monthsRemaining = 0;
  state.contract.salaryMonthly = 0;
  state.contract.releaseClause = null;
  state.professional.route = "free_agent";
  state.flags.LOAN_ACTIVE = false;
  state.flags.ABROAD_ROUTE = false;
  state.flags.BIG_CLUB = false;
  return true;
}

/** Formal signing/reactivation authority called only after CareerTerms are accepted. */
export function activateEmploymentFromAcceptedTermsInPlace(state: GameState): void {
  const employment = ensureEmploymentStateInPlace(state);
  employment.status = state.flags.LOAN_ACTIVE ? "loaned" : "contracted";
  employment.since = state.date;
}
