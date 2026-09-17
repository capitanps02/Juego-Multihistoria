import type { GameState } from "../core/types.js";
import { type EarlyCareerSeedFacts } from "../narrative/seed-memory.js";
import { FORMAL_RENEWAL_REASON, type CareerOfferKind, type CareerTerms } from "./offers.js";
import { type CurrentMatchContext, type SportContext } from "./sport-context.js";
export { FORMAL_RENEWAL_REASON };
export declare const CLUB_WANTS_RENEWAL_FACT: "facts.clubWantsRenewal";
export declare const LOCKER_CAPTAIN_AFFINITY_FACT: "facts.lockerCaptainAffinity";
export declare const LOCKER_STAR_AFFINITY_FACT: "facts.lockerStarAffinity";
export declare const ROLE_DROP_SINCE_23_FACT: "facts.roleDropSince23";
export declare const ROLE_GUARANTEE_AT_23_FACT: "facts.roleGuaranteeAt23";
export declare const PENDING_CAREER_OFFER_KIND_FACT: "facts.pendingCareerOfferKind";
export declare const PENDING_CAREER_OFFER_FACT: "facts.pendingCareerOffer";
export declare const CLUB_RENEWAL_INTENT_MAX_MONTHS = 24;
export declare const CLUB_RENEWAL_INTENT_THRESHOLD = 0.5;
/**
 * Club-side renewal propensity already used by the world simulation when a formal
 * renewal can be materialised. Keeping the policy in this domain module gives the
 * narrative layer a causal fact instead of asking content to infer club intent from
 * unrelated flags or player-facing outcomes.
 */
export declare function clubRenewalPropensity(state: GameState): number;
/** A materialised, still-compatible same-club renewal is direct evidence of club renewal intent. */
export declare function hasFormalClubRenewalOffer(state: GameState): boolean;
/**
 * Authoritative read-only club fact for canonical narrative gates.
 *
 * It is true when a formal same-club renewal is already pending, or when the club's
 * existing renewal policy has crossed the explicit intent threshold while the player
 * is within an early-renewal horizon. It consumes no RNG and mutates no GameState.
 */
export declare function clubWantsRenewal(state: GameState): boolean;
/**
 * Raw factual drop from the role snapshot captured when the age-23 professional
 * state is initialized. This shared fact deliberately does not define how large a
 * drop must be before a narrative scene considers it material.
 */
export declare function roleDropSince23(state: GameState): number;
/**
 * Historical evidence that the canonical age-23 bridge established a concrete role
 * expectation. This is intentionally a persisted-history read: terminality or later
 * consumption does not erase that the conversation happened. Generic seed presence,
 * other origins and the other three bridge stances are not sufficient.
 */
export declare function hasRoleGuaranteeAt23(state: GameState): boolean;
/**
 * Exact, detached projection of the one formal offer that is still compatible with
 * live CareerTerms. Narrative conditions can inspect destination, salary, duration,
 * release clause and registration semantics without receiving mutation authority.
 * Stale offers fail closed to null.
 */
export interface PendingCareerOfferFacts {
    id: string;
    kind: CareerOfferKind;
    date: string;
    reason: string;
    terms: Readonly<CareerTerms>;
}
export declare function pendingCareerOfferFacts(state: GameState): PendingCareerOfferFacts | null;
export interface NarrativeCausalFacts extends EarlyCareerSeedFacts {
    clubWantsRenewal: boolean;
    lockerCaptainAffinity: number | null;
    lockerStarAffinity: number | null;
    roleDropSince23: number;
    roleGuaranteeAt23: boolean;
    /** Compatible formal offer kind for deterministic event/choice gating; null includes stale offers. */
    pendingCareerOfferKind: CareerOfferKind | null;
    /** Exact detached formal-offer projection; null includes no offer and stale offers. */
    pendingCareerOffer: PendingCareerOfferFacts | null;
    /** Authoritative/read-only sporting projection. Unavailable sporting facts are null. */
    sport: SportContext;
    /** Current match projection. Fails closed until a real match producer exists. */
    match: CurrentMatchContext;
}
export declare function narrativeCausalFacts(state: GameState): NarrativeCausalFacts;
/**
 * Shallow read-only projection used only for Condition resolution. Nested GameState
 * objects are not cloned or mutated; the synthetic `facts` namespace is never saved.
 */
export declare function narrativeConditionRoot(state: GameState): GameState & {
    facts: NarrativeCausalFacts;
};
