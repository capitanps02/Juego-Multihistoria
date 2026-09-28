import type { GameState } from "../core/types.js";
import { type CareerOffer, type VeteranOfferContext } from "./offers.js";
export declare function veteranMarketDemand(state: GameState): number;
export type VeteranMedicalEvaluationResult = "cleared" | "cleared_with_conditions" | "failed";
export interface VeteranMarketApproach {
    id: string;
    club: string;
    date: string;
    context: string;
    medicalEvaluation: {
        occurred: boolean;
        result: VeteranMedicalEvaluationResult | null;
        date: string | null;
    };
}
export declare function isVeteranMarketApproach(value: unknown): value is VeteranMarketApproach;
export declare function getVeteranMarketApproaches(state: GameState): readonly VeteranMarketApproach[];
export declare function recordVeteranMarketApproachInPlace(state: GameState, input: {
    id: string;
    club: string;
    context: string;
}): VeteranMarketApproach | null;
export declare function recordVeteranMedicalEvaluationInPlace(state: GameState, approachId: string, result: VeteranMedicalEvaluationResult): VeteranMarketApproach;
export interface VeteranMarketOpportunity {
    id: string;
    reason: string;
    opportunity: VeteranOfferContext["opportunity"];
    club: string;
    leagueTier: number;
    months: number;
    salary: number;
    route: GameState["professional"]["route"];
    abroad: boolean;
    bigClub?: boolean;
    releaseClause?: number | null;
    sportingRole?: string | null;
    ancillaryRole?: string | null;
    validThrough?: string;
}
/**
 * Explicit market-owned materializer for factual veteran opportunities.
 * It never invents a destination: callers must provide the concrete opportunity.
 */
export declare function materializeVeteranCareerOfferFromOpportunity(state: GameState, opportunity: VeteranMarketOpportunity): CareerOffer | null;
/** Deterministic same-club producer used by the late-career world simulation. */
export declare function materializeVeteranRenewalInPlace(state: GameState): CareerOffer | null;
/**
 * Narrow post-announcement emergency producer. Market can create the offer; retirement
 * state remains owned elsewhere and is never reversed here.
 */
export declare function materializePostAnnouncementEmergencyOffer(state: GameState, opportunity: VeteranMarketOpportunity): CareerOffer | null;
