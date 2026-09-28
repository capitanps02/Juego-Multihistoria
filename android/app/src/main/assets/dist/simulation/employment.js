function persisted(state) {
    return state.employment;
}
/**
 * Read-only employment truth. Historical schema-8 saves may omit the explicit store.
 * Positive-month legacy saves can be projected safely; zero-month legacy saves are
 * deliberately ambiguous and fail closed instead of being rewritten heuristically.
 */
export function employmentSnapshot(state) {
    const stored = persisted(state);
    if (stored)
        return structuredClone(stored);
    const months = Number(state.contract.monthsRemaining);
    const status = months <= 0
        ? "expired_pending_resolution"
        : state.flags.LOAN_ACTIVE
            ? "loaned"
            : "contracted";
    return { version: 1, status, since: state.date, previous: null };
}
export function employmentStatus(state) {
    return employmentSnapshot(state).status;
}
export function hasActiveClubEmployment(state) {
    const status = employmentStatus(state);
    return status === "contracted" || status === "loaned";
}
export function currentEmploymentClub(state) {
    return hasActiveClubEmployment(state) ? state.professional.registrationClub : null;
}
/** Initialize explicit employment for a new/current state without guessing legacy expiry. */
export function ensureEmploymentStateInPlace(state) {
    if (state.employment)
        return state.employment;
    const snapshot = employmentSnapshot(state);
    state.employment = snapshot;
    return snapshot;
}
/**
 * Natural 1→0 contract expiry authority. Former club identifiers remain historical
 * provenance strings, but no longer constitute live employment/registration authority.
 */
export function transitionNaturalExpiryInPlace(state, previousMonths) {
    if (previousMonths <= 0 || Number(state.contract.monthsRemaining) !== 0)
        return false;
    const employment = ensureEmploymentStateInPlace(state);
    if (employment.status === "unattached")
        return false;
    if (employment.status === "expired_pending_resolution")
        return false;
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
export function activateEmploymentFromAcceptedTermsInPlace(state) {
    const employment = ensureEmploymentStateInPlace(state);
    employment.status = state.flags.LOAN_ACTIVE ? "loaned" : "contracted";
    employment.since = state.date;
}
/**
 * Narrative club changes are legacy-authorized career transitions, not CareerOffer acceptances.
 * Keep the explicit employment store coherent with the already-authoritative narrative flags.
 */
export function syncEmploymentAfterNarrativeClubChangeInPlace(state) {
    const employment = ensureEmploymentStateInPlace(state);
    if (employment.status === "unattached" || employment.status === "expired_pending_resolution") {
        throw new Error("Narrative club change cannot reactivate inactive employment.");
    }
    employment.status = state.flags.LOAN_ACTIVE ? "loaned" : "contracted";
    employment.since = state.date;
}
/**
 * Narrow employment authority for a narrative transition that has already
 * established a loan owner but would otherwise persist the same identity as
 * registration. It never creates loan authority; LOAN_ACTIVE must already exist.
 */
export function setNarrativeLoanRegistrationInPlace(state, registrationClub) {
    const employment = ensureEmploymentStateInPlace(state);
    if (employment.status === "unattached" || employment.status === "expired_pending_resolution") {
        throw new Error("Narrative loan registration cannot reactivate inactive employment.");
    }
    if (state.flags.LOAN_ACTIVE !== true) {
        throw new Error("Narrative loan registration requires existing loan authority.");
    }
    const ownerClub = String(state.world.ownerClub ?? state.professional.ownerClub);
    if (!registrationClub || registrationClub === ownerClub) {
        throw new Error("Narrative loan registration must differ from the owner club.");
    }
    state.club = registrationClub;
}
