import type { GameState } from "../core/types.js";
export declare const CLUB_WANTS_RENEWAL_FACT: "facts.clubWantsRenewal";
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
export interface NarrativeCausalFacts {
    clubWantsRenewal: boolean;
}
export declare function narrativeCausalFacts(state: GameState): NarrativeCausalFacts;
/**
 * Shallow read-only projection used only for Condition resolution. Nested GameState
 * objects are not cloned or mutated; the synthetic `facts` namespace is never saved.
 */
export declare function narrativeConditionRoot(state: GameState): GameState & {
    facts: NarrativeCausalFacts;
};
