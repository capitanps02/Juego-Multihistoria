import type { GameState } from "../core/types.js";
import { inspectSportMatchModelStore } from "../simulation/match-model.js";
import * as legacy from "./validation-legacy.js";

export * from "./validation-legacy.js";

function assertSportMatchModel(value: unknown): void {
  const state = legacy.record(value, "state");
  const world = legacy.record(state.world, "world");
  const issue = inspectSportMatchModelStore(world.sportMatchModel, state.date as string, value as GameState);
  if (issue) legacy.ensure(false, issue.path, issue.reason);
}

/**
 * Preserve the complete schema-2..8 validator and add the optional match-model
 * store as a fail-closed extension. Historical saves may omit the store.
 */
export function validateGameSave(value: unknown, version: number): void {
  legacy.validateGameSave(value, version);
  assertSportMatchModel(value);
}

/** Common runtime/save boundary including market + football moment + match-model checks. */
export function assertGameState(value: unknown): asserts value is GameState {
  legacy.assertGameState(value);
  assertSportMatchModel(value);
}
