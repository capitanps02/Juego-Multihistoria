import { playerActionFacts } from "../player-actions/facts.js";
import { earlyCareerSeedFacts } from "../narrative/seed-memory.js";
import { lockerSlotAffinity } from "./locker-leadership.js";
import { listCertifiedPlayerClubLeadership, resolveCurrentPlayerClubLeadership } from "./player-leadership-authority.js";
import { bosmanEligibility, careerOfferKind, eligibleCareerOfferKind, FORMAL_RENEWAL_REASON, getEligibleCareerOffers, getFutureCareerAgreements, getOpenFutureEmploymentNegotiations, isCareerOfferContext } from "./offers.js";
import { getCurrentMatchContext, getSportContext } from "./sport-context.js";
import { resolveCurrentRepresentation } from "./representation-authority.js";
import { getSportMatchModelStore } from "./match-model.js";
import { resolveActiveAgent, resolveCurrentClubInstitutionalNpc } from "./npc-authority.js";
import { employmentStatus } from "./employment.js";
import { getVeteranMarketApproaches } from "./veteran-market.js";
import { resolveNationalSelectionFacts } from "./national-team-authority.js";
import { resolveInjuryEpisodeFacts } from "./injury-episode-authority.js";
import { resolveAchievementHistoryFacts } from "./sport-achievement-authority.js";
import { retirementNoLastMatchFact, retirementPostAnnouncementOfferFact, retirementStorybookLastGoalFact } from "./retirement-authority.js";
export { FORMAL_RENEWAL_REASON };
export const CLUB_WANTS_RENEWAL_FACT = "facts.clubWantsRenewal";
export const LOCKER_CAPTAIN_AFFINITY_FACT = "facts.lockerCaptainAffinity";
export const LOCKER_STAR_AFFINITY_FACT = "facts.lockerStarAffinity";
export const ROLE_DROP_SINCE_23_FACT = "facts.roleDropSince23";
export const ROLE_GUARANTEE_AT_23_FACT = "facts.roleGuaranteeAt23";
export const PENDING_CAREER_OFFER_KIND_FACT = "facts.pendingCareerOfferKind";
export const PENDING_CAREER_OFFER_FACT = "facts.pendingCareerOffer";
export const PLAYER_CLUB_LEADERSHIP_ROLE_FACT = "facts.playerClubLeadership.currentRole";
export const PLAYER_CLUB_MAIN_CAPTAIN_HISTORY_FACT = "facts.playerClubLeadership.hasCertifiedMainCaptainHistory";
export const CLUB_RENEWAL_INTENT_MAX_MONTHS = 24;
export const CLUB_RENEWAL_INTENT_THRESHOLD = 0.50;
const clamp = (x, min = 0, max = 1) => Math.min(max, Math.max(min, x));
const num = (x, fallback = 0) => typeof x === "number" ? x : fallback;
/**
 * Club-side renewal propensity already used by the world simulation when a formal
 * renewal can be materialised. Keeping the policy in this domain module gives the
 * narrative layer a causal fact instead of asking content to infer club intent from
 * unrelated flags or player-facing outcomes.
 */
export function clubRenewalPropensity(state) {
    const p = state.professional;
    return clamp(0.20
        + num(p.institutionalTrust) / 220
        + num(p.roleSecurity) / 280
        - Math.max(0, num(p.contractPower) - 65) / 230, 0.16, 0.68);
}
/** A materialised, still-compatible same-club renewal is direct evidence of club renewal intent. */
export function hasFormalClubRenewalOffer(state) {
    return getEligibleCareerOffers(state).some(offer => offer.reason === FORMAL_RENEWAL_REASON
        && careerOfferKind(offer) === "renewal"
        && offer.before.club === offer.terms.club
        && offer.before.ownerClub === offer.terms.ownerClub);
}
/**
 * Authoritative read-only club fact for canonical narrative gates.
 *
 * It is true when a formal same-club renewal is already pending, or when the club's
 * existing renewal policy has crossed the explicit intent threshold while the player
 * is within an early-renewal horizon. It consumes no RNG and mutates no GameState.
 */
export function clubWantsRenewal(state) {
    if (hasFormalClubRenewalOffer(state))
        return true;
    if (state.retirement.status !== "playing")
        return false;
    if (!["contracted", "loaned"].includes(employmentStatus(state)))
        return false;
    if (state.age < 20 || state.age >= 34)
        return false;
    if (state.flags.CONTRACT_DISPUTE)
        return false;
    const months = num(state.contract.monthsRemaining);
    if (months <= 0 || months > CLUB_RENEWAL_INTENT_MAX_MONTHS)
        return false;
    return clubRenewalPropensity(state) >= CLUB_RENEWAL_INTENT_THRESHOLD;
}
/**
 * Raw factual drop from the role snapshot captured when the age-23 professional
 * state is initialized. This shared fact deliberately does not define how large a
 * drop must be before a narrative scene considers it material.
 */
export function roleDropSince23(state) {
    if (state.age < 23 || !state.professional.initializedAt23)
        return 0;
    return Math.max(0, num(state.professional.roleScoreAt23) - num(state.sport.roleScore));
}
/**
 * Historical evidence that the canonical age-23 bridge established a concrete role
 * expectation. This is intentionally a persisted-history read: terminality or later
 * consumption does not erase that the conversation happened. Generic seed presence,
 * other origins and the other three bridge stances are not sufficient.
 */
export function hasRoleGuaranteeAt23(state) {
    if (state.age < 23)
        return false;
    return state.seeds.some(seed => seed.id === "SEED_ELITE_ROLE_BARGAIN"
        && seed.originEvent === "EVT_23_BRIDGE_001"
        && seed.payload.stance === "role_guarantees");
}
export function playerClubLeadershipFacts(state) {
    const current = resolveCurrentPlayerClubLeadership(state);
    return {
        currentRole: current?.role ?? null,
        hasCertifiedMainCaptainHistory: listCertifiedPlayerClubLeadership(state)
            .some(row => row.role === "captain")
    };
}
export function pendingCareerOfferFacts(state) {
    const offer = getEligibleCareerOffers(state)[0];
    if (!offer)
        return null;
    return {
        id: offer.id,
        kind: careerOfferKind(offer),
        date: offer.date,
        reason: offer.reason,
        terms: structuredClone(offer.terms),
        ...(isCareerOfferContext(offer.context) ? { context: structuredClone(offer.context) } : {}),
        ...(offer.validThrough ? { validThrough: offer.validThrough } : {})
    };
}
export function coachPromiseWaitFacts(state) {
    let choice = null;
    for (let i = state.history.length - 1; i >= 0; i -= 1) {
        const row = state.history[i];
        if (row.eventId === "EVT_20_CCH_001" && row.choiceId === "WAIT_THREE_MATCHES") {
            choice = row;
            break;
        }
    }
    if (!choice)
        return null;
    const store = getSportMatchModelStore(state);
    const elapsed = store
        ? store.fixtures.filter(row => row.official === true
            && row.date > choice.date
            && row.date <= state.date
            && row.club === choice.club).length
        : 0;
    return { choiceDate: choice.date, club: choice.club, officialMatchesElapsed: elapsed, complete: elapsed >= 3 };
}
export function narrativeCausalFacts(state) {
    return {
        ...earlyCareerSeedFacts(state),
        playerActions: playerActionFacts(state),
        clubWantsRenewal: clubWantsRenewal(state),
        lockerCaptainAffinity: lockerSlotAffinity(state, "captain"),
        lockerStarAffinity: lockerSlotAffinity(state, "star"),
        roleDropSince23: roleDropSince23(state),
        roleGuaranteeAt23: hasRoleGuaranteeAt23(state),
        playerClubLeadership: playerClubLeadershipFacts(state),
        activeAgentNpcId: resolveActiveAgent(state),
        currentClubInstitutionalNpcId: resolveCurrentClubInstitutionalNpc(state),
        employmentStatus: employmentStatus(state),
        futureEmploymentNegotiations: getOpenFutureEmploymentNegotiations(state),
        futureCareerAgreements: getFutureCareerAgreements(state),
        bosman: bosmanEligibility(state),
        veteranMarketApproaches: getVeteranMarketApproaches(state),
        pendingCareerOfferKind: eligibleCareerOfferKind(state),
        pendingCareerOffer: pendingCareerOfferFacts(state),
        representation: resolveCurrentRepresentation(state),
        coachPromiseWait: coachPromiseWaitFacts(state),
        achievements: resolveAchievementHistoryFacts(state),
        injuryEpisodes: resolveInjuryEpisodeFacts(state),
        nationalSelection: resolveNationalSelectionFacts(state),
        sport: getSportContext(state),
        match: getCurrentMatchContext(state),
        retirementNoLastMatch: retirementNoLastMatchFact(state),
        retirementStorybookLastGoal: retirementStorybookLastGoalFact(state),
        retirementPostAnnouncementOffer: retirementPostAnnouncementOfferFact(state)
    };
}
/**
 * Shallow read-only projection used only for Condition resolution. Nested GameState
 * objects are not cloned or mutated; the synthetic `facts` namespace is never saved.
 */
export function narrativeConditionRoot(state) {
    return Object.assign({}, state, { facts: narrativeCausalFacts(state) });
}
