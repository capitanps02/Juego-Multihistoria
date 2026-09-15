import type { GameState } from "../core/types.js";
/**
 * T2.2 · Structural validation for saves and session snapshots.
 *
 * Rejects corrupt, truncated, future-version and structurally invalid data
 * with descriptive error codes. Never modifies the incoming object.
 * Migration is handled by save.ts; this module validates *after* migration.
 */
export declare class SaveValidationError extends Error {
    readonly code: string;
    constructor(code: string, message: string);
}
export declare function validateGameState(s: unknown): asserts s is GameState;
export interface SnapshotEnvelope {
    sessionVersion: number;
    build: string;
    contentIdentity: string;
    sessionId: string;
    revision: number;
    microfeeds: boolean;
    state: unknown;
    pendingDecision: unknown;
    pendingResult: unknown;
    receipts: unknown[];
    journal: unknown[];
    needsWorldAdvance: boolean;
}
export declare function validateSnapshotEnvelope(raw: unknown): asserts raw is SnapshotEnvelope;
export declare function parseSaveJson(raw: string): unknown;
