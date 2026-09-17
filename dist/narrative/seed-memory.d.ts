import type { DataValue, GameState, SeedInstance, SeedState } from "../core/types.js";
export type SeedMemorySource = "live" | "historical" | "absent";
export interface SeedMemoryProjection {
    seedId: string;
    source: SeedMemorySource;
    historicalExists: boolean;
    live: boolean;
    scopeValid: boolean;
    state: SeedState | null;
    intensity: number | null;
    originEvent: string | null;
    originSeason: string | null;
    originClub: string | null;
    consumedBy: string | null;
    expiresAfter: string | null;
    lastTouchedDate: string | null;
    payload: Readonly<Record<string, DataValue>>;
}
export declare function seedInstanceScopeValid(state: GameState, seed: SeedInstance): boolean;
export declare function seedInstances(state: GameState, seedId: string): readonly SeedInstance[];
export declare function liveSeedInstance(state: GameState, seedId: string): SeedInstance | null;
export declare function latestHistoricalSeedInstance(state: GameState, seedId: string): SeedInstance | null;
export declare function projectSeedMemory(state: GameState, seedId: string): SeedMemoryProjection;
export interface BrunoFavorMemory extends SeedMemoryProjection {
    stance: string | null;
}
export declare function getBrunoFavorState(state: GameState): BrunoFavorMemory;
export interface CoachPublicMemory extends SeedMemoryProjection {
    stance: string | null;
}
export declare function getCoachPublicMemory(state: GameState): CoachPublicMemory;
export interface MenaEarlyReadMemory extends SeedMemoryProjection {
    read: string | null;
    early: string | null;
}
export declare function getMenaEarlyRead(state: GameState): MenaEarlyReadMemory;
export interface ExitStyleMemory extends SeedMemoryProjection {
    january: string | null;
    end: string | null;
    summer: string | null;
    market18: string | null;
    year19: string | null;
}
export declare function getExitStyleMemory(state: GameState): ExitStyleMemory;
export interface BodyPrecedentMemory extends SeedMemoryProjection {
    pattern: string | null;
    early: string | null;
    return19: string | null;
}
export declare function getBodyPrecedent(state: GameState): BodyPrecedentMemory;
export interface PhysioConfidenceMemory extends SeedMemoryProjection {
    pattern: string | null;
    return19: string | null;
}
export declare function getPhysioConfidenceMemory(state: GameState): PhysioConfidenceMemory;
export interface EarlyCareerSeedFacts {
    brunoFavorStance: string | null;
    coachPublicStance: string | null;
    menaEarlyRead: string | null;
    menaEarlyContext: string | null;
    exitStyleJanuary: string | null;
    exitStyleEnd: string | null;
    exitStyleSummer: string | null;
    exitStyleMarket18: string | null;
    exitStyleYear19: string | null;
    bodyPrecedentPattern: string | null;
    bodyPrecedentEarly: string | null;
    bodyPrecedentReturn19: string | null;
    physioConfidencePattern: string | null;
    physioConfidenceReturn19: string | null;
}
/**
 * Exact scalar payload projections for declarative Condition paths.
 * Only scope-valid live instances contribute. Historical existence remains available
 * through projectSeedMemory()/latestHistoricalSeedInstance() and is never promoted to live.
 */
export declare function earlyCareerSeedFacts(state: GameState): EarlyCareerSeedFacts;
