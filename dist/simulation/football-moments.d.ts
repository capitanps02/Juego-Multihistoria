import type { GameState } from "../core/types.js";
export type FootballMomentOutcome = "scored" | "missed";
export interface PenaltyAttemptInput {
    /** Stable identity for this concrete sporting moment. Reusing it is idempotent. */
    momentId: string;
    /** Factual actor identity. Use PLAYER for the protagonist. */
    actorId: string;
    /** 0-100 execution quality supplied by an authoritative sporting source. */
    technique: number;
    /** 0-100 pressure handling supplied by an authoritative sporting source. */
    composure: number;
    /** 0-100 current form supplied by an authoritative sporting source. */
    form: number;
    /** 0-100 situational pressure supplied by the caller's factual match context. */
    pressure: number;
}
export interface PenaltyMomentResult {
    version: 1;
    kind: "penalty";
    momentId: string;
    actorId: string;
    outcome: FootballMomentOutcome;
    probability: number;
    resolvedAt: string;
    /** True when an already persisted sporting fact was returned without another draw. */
    replayed: boolean;
    /** Exposed only on the resolving call for QA/diagnostics; never required for story logic. */
    draw?: number;
}
export interface FootballMomentStoreIssue {
    path: string;
    reason: string;
}
/**
 * Read-only validation for the optional persisted store. Historical saves may omit it.
 * This function never consumes RNG and never mutates the supplied value.
 */
export declare function inspectFootballMomentStore(value: unknown, maxResolvedAt?: string): FootballMomentStoreIssue | null;
/** Runtime assertion used by the resolver when reading persisted authoritative facts. */
export declare function assertFootballMomentStore(value: unknown): void;
/**
 * Technical v1 probability model for a single penalty attempt.
 * It deliberately contains no RNG and is not a canonical story rule. The caller
 * supplies sporting facts; this function only converts them into a bounded chance.
 */
export declare function penaltySuccessProbability(inputValue: PenaltyAttemptInput): number;
/** Build the protagonist attempt from persisted football attributes only. */
export declare function playerPenaltyAttempt(state: GameState, momentId: string, pressure: number): PenaltyAttemptInput;
/**
 * Resolve one factual sporting moment. Exactly one draw from rngState.football is
 * consumed the first time a momentId is resolved. Replays return the persisted fact.
 * This layer never mutates goals, appearances, minutes, cards or relationships.
 */
export declare function resolvePenaltyMomentInPlace(state: GameState, inputValue: PenaltyAttemptInput): PenaltyMomentResult;
