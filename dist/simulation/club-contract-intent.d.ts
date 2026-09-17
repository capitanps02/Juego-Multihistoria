import type { GameState } from "../core/types.js";
import { type EarlyCareerSeedFacts } from "../narrative/seed-memory.js";
import { type CurrentMatchContext, type SportContext } from "./sport-context.js";
export declare const CLUB_WANTS_RENEWAL_FACT: "facts.clubWantsRenewal";
export declare const LOCKER_CAPTAIN_AFFINITY_FACT: "facts.lockerCaptainAffinity";
export declare const LOCKER_STAR_AFFINITY_FACT: "facts.lockerStarAffinity";
export declare const ROLE_DROP_SINCE_23_FACT: "facts.roleDropSince23";
export declare const ROLE_GUARANTEE_AT_23_FACT: "facts.roleGuaranteeAt23";
export declare const CLUB_RENEWAL_INTENT_MAX_MONTHS = 24;
export declare const CLUB_RENEWAL_INTENT_THRESHOLD = 0.5;
export declare const FORMAL_RENEWAL_REASON = "Renovaci\u00F3n de contrato";
/**
 * Club-side renewal propensity already used by the world simulation when a formal
 * renewal can be materialised. Keeping the policy in this domain module gives the
 * narrative layer a causal fact instead of asking content to infer club intent from
 * unrelated flags or player-facing outcomes.
 */
export declare function clubRenewalPropensity(state: GameState): number;
/** A materialised same-club renewal offer is direct evidence of club renewal intent. */
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
export interface NarrativeCausalFacts extends EarlyCareerSeedFacts {
    clubWantsRenewal: boolean;
    lockerCaptainAffinity: number | null;
    lockerStarAffinity: number | null;
    roleDropSince23: number;
    roleGuaranteeAt23: boolean;
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
