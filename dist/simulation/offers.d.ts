import type { GameState } from "../core/types.js";
export declare const FORMAL_RENEWAL_REASON = "Renovaci\u00F3n de contrato";
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
export type CareerOfferKind = "renewal" | "transfer" | "loan" | "loan_return" | "loan_conversion";
export type ContractEmploymentStatus = "active_contract" | "expiring" | "expired_pending_resolution" | "retired";
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
/**
 * Read-only semantic classification over the persisted CareerOffer shape.
 * No extra offer type is persisted: historical saves remain schema-compatible.
 */
export declare function careerOfferKind(offer: CareerOffer): CareerOfferKind;
/** Returns detached formal offers so callers cannot mutate market.pending accidentally. */
export declare function getActiveCareerOffers(s: GameState): readonly CareerOffer[];
/**
 * Returns only formal offers whose persisted `before` snapshot still matches the live
 * CareerTerms. Results are detached through getActiveCareerOffers(), so callers may
 * inspect exact destination/financial terms without acquiring mutation authority.
 */
export declare function getEligibleCareerOffers(s: GameState): readonly CareerOffer[];
/**
 * Read-only kind of the one formal offer that is still compatible with the live
 * CareerTerms. A stale pending offer remains inspectable through getActiveCareerOffers
 * but intentionally projects null here so narrative eligibility fails closed.
 */
export declare function eligibleCareerOfferKind(s: GameState): CareerOfferKind | null;
export declare function getEligibleTransferOffers(s: GameState): readonly CareerOffer[];
export declare function getEligibleLoanOffers(s: GameState): readonly CareerOffer[];
export declare function getEligibleRenewalOffers(s: GameState): readonly CareerOffer[];
/**
 * Employment status is deliberately conservative over the existing save schema.
 * The model has a `professional.route="free_agent"` token and classifiers that read it,
 * but current production code has no authoritative transition that also establishes
 * unattached club/owner/registration/salary/football semantics. Therefore months===0
 * remains pending resolution rather than being silently promoted to free agency.
 */
export declare function contractEmploymentStatus(s: GameState): ContractEmploymentStatus;
export declare function applyTerms(s: GameState, t: CareerTerms): void;
/** Run the world's proposal on a detached state. No signature or destination leaks. */
export declare function proposeCareerChange(s: GameState, reason: string, propose: (draft: GameState) => void): void;
/**
 * Single authority for closing an offer. Narrative choices may counter/defer, but only
 * accept/delegate are ever allowed to apply CareerTerms. Counter/defer normalize to the
 * persisted reject action while retaining their exact semantics in source.disposition.
 */
export declare function respondToOffer(s: GameState, id: string, disposition: OfferDisposition, source?: Omit<NarrativeOfferSource, "disposition">): OfferDecision;
