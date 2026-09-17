import type { GameState } from "../core/types.js";
/**
 * Public world-simulation boundary.
 * The established simulator stays single-sourced in world-simulator-core.ts;
 * this wrapper materializes authoritative sporting facts after that exact tick
 * and consumes zero additional RNG draws.
 */
export declare function advanceWorldDayInPlace(next: GameState): GameState;
export declare function advanceWorldDay(state: GameState): GameState;
