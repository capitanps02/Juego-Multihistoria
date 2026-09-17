import type { GameState } from "../core/types.js";
export * from "./validation-legacy.js";
/**
 * Preserve the complete schema-2..8 validator and add the optional match-model
 * store as a fail-closed extension. Historical saves may omit the store.
 */
export declare function validateGameSave(value: unknown, version: number): void;
/** Common runtime/save boundary including market + football moment + match-model checks. */
export declare function assertGameState(value: unknown): asserts value is GameState;
