import type { GameState } from "../core/types.js";
import { type ActiveAgentNpcId } from "./npc-authority.js";
export type RepresentationService = "market" | "media" | "image";
export type RepresentationContactPolicy = "inform_first" | "broad_delegation";
export interface RepresentationTerms {
    commissionPct: number;
    services: readonly RepresentationService[];
    contactPolicy: RepresentationContactPolicy;
}
export interface RepresentationAgreement {
    ordinal: number;
    agentNpcId: ActiveAgentNpcId;
    effectiveAt: string;
    endedAt: string | null;
    endedBy: string | null;
    commissionPct: number;
    services: RepresentationService[];
    contactPolicy: RepresentationContactPolicy;
    source: string;
}
export interface RepresentationAuthorityStore {
    version: 1;
    sequence: number;
    current: RepresentationAgreement | null;
    history: RepresentationAgreement[];
}
/**
 * Read the current representation agreement only when it agrees with the separately
 * certified active-agent identity. Legacy contact/identity-only states therefore fail
 * closed to null.
 */
export declare function resolveCurrentRepresentation(state: GameState): RepresentationAgreement | null;
/** Detached historical records; malformed stores fail closed to an empty history. */
export declare function representationHistory(state: GameState): RepresentationAgreement[];
/**
 * Explicitly establish or switch representation together with factual terms.
 * This is the only API that creates representation terms; simple contact or
 * certifyActiveAgentInPlace() remains identity-only.
 */
export declare function certifyRepresentationInPlace(state: GameState, agentNpcId: ActiveAgentNpcId, terms: RepresentationTerms, source: string): void;
/** Revise terms for the same certified representative while preserving the prior agreement. */
export declare function updateRepresentationTermsInPlace(state: GameState, terms: RepresentationTerms, source: string): void;
/** Explicitly terminate representation, preserving the closed agreement in history. */
export declare function clearRepresentationInPlace(state: GameState, source: string): void;
