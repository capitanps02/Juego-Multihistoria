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
export type OfferAction = "accept" | "reject" | "delegate";
export interface OfferDecision {
    offer: CareerOffer;
    action: OfferAction;
    accepted: boolean;
    explanation: string;
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
/** Delegation authorizes only this offer; no standing authority is inferred. */
export declare function respondToOffer(s: GameState, id: string, action: OfferAction): OfferDecision;
