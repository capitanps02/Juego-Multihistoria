import type { GameState } from "../core/types.js";
export interface CareerTerms {
    club: string;
    tier: number;
    months: number;
    salary: number;
    releaseClause: number | null;
    ownerClub: string;
    registrationClub: string;
    leagueTier: number;
    prestigeTier: number;
    prestigeScore: number;
    route: GameState["professional"]["route"];
    abroad: boolean;
    loan: boolean;
    bigClub: boolean;
}
export interface CareerOffer {
    id: string;
    date: string;
    reason: string;
    before: CareerTerms;
    terms: CareerTerms;
}
/** Direct player actions exposed by the ordinary offer screen and persisted in market.history.action. */
export type OfferAction = "accept" | "reject" | "delegate";
/** Narrative decisions may close an offer without changing the persisted action enum. */
export type OfferDisposition = OfferAction | "counter" | "defer";
export interface NarrativeOfferSource {
    kind: "narrative_choice";
    historyIndex: number;
    eventId: string;
    choiceId: string;
    disposition: OfferDisposition;
}
export interface OfferDecision {
    offer: CareerOffer;
    action: OfferAction;
    accepted: boolean;
    explanation: string;
    /** Absent for ordinary offer commands; present when a narrative choice consumed the offer. */
    source?: NarrativeOfferSource;
}
export interface MarketState {
    version: 1;
    sequence: number;
    pending: CareerOffer | null;
    history: OfferDecision[];
}
export declare function marketState(s: GameState): MarketState;
export declare function careerTerms(s: GameState): CareerTerms;
export declare function applyTerms(s: GameState, t: CareerTerms): void;
/** Run the world's proposal on a detached state. No signature or destination leaks. */
export declare function proposeCareerChange(s: GameState, reason: string, propose: (draft: GameState) => void): void;
/**
 * Single authority for closing an offer. Narrative choices may counter/defer, but only
 * accept/delegate are ever allowed to apply CareerTerms. Counter/defer normalize to the
 * persisted reject action while retaining their exact semantics in source.disposition.
 */
export declare function respondToOffer(s: GameState, id: string, disposition: OfferDisposition, source?: Omit<NarrativeOfferSource, "disposition">): OfferDecision;
