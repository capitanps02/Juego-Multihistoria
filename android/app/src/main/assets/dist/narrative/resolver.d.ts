import type { EventDefinition, GameState, ResolutionResult } from "../core/types.js";
/** Immutable API for UI / interactive callers. */
export declare function resolveChoice(state: GameState, event: EventDefinition, choiceId: string, qa?: boolean): ResolutionResult;
/** Fast path for headless simulation. Mutates the supplied GameState intentionally. */
export declare function resolveChoiceInPlace(state: GameState, event: EventDefinition, choiceId: string, qa?: boolean): ResolutionResult;
