import type { EventDefinition, GameState, ResolutionResult } from "../core/types.js";
export declare function syncSeedPresenceFlagsInPlace(state: GameState): void;
/**
 * Apply lifecycle scope after the clock or career context changes.
 * Eligibility remains derived from event gates; it is intentionally not persisted as a second source of truth.
 */
export declare function expireDueSeedsInPlace(state: GameState): string[];
/** Immutable API for UI / interactive callers. */
export declare function resolveChoice(state: GameState, event: EventDefinition, choiceId: string, qa?: boolean): ResolutionResult;
/** Fast path for headless simulation. Mutates the supplied GameState intentionally. */
export declare function resolveChoiceInPlace(state: GameState, event: EventDefinition, choiceId: string, qa?: boolean): ResolutionResult;
