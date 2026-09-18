import type { GameState } from "../core/types.js";
import { inspectSportMatchModelStore } from "../simulation/match-model.js";
import { inspectPenaltySetupStore } from "../simulation/match-penalty-context.js";
import * as legacy from "./validation-legacy.js";

export * from "./validation-legacy.js";

function assertSportMatchModel(value: unknown): void {
  const state = legacy.record(value, "state");
  const world = legacy.record(state.world, "world");
  const issue = inspectSportMatchModelStore(world.sportMatchModel, state.date as string);
  if (issue) legacy.ensure(false, issue.path, issue.reason);
}

function assertPenaltySetupStore(value: unknown): void {
  const state = value as GameState;
  const world = legacy.record(state.world, "world");
  const issue = inspectPenaltySetupStore(world.sportPenaltySetups, state);
  if (issue) legacy.ensure(false, issue.path, issue.reason);
}

/**
 * Preserve the complete schema-2..8 validator and add optional sporting stores
 * as fail-closed extensions. Historical saves may omit either store.
 */
export function validateGameSave(value: unknown, version: number): void {
  legacy.validateGameSave(value, version);
  assertSportMatchModel(value);
  assertPenaltySetupStore(value);
}

/** Common runtime/save boundary including market + football moment + sporting checks. */
export function assertGameState(value: unknown): asserts value is GameState {
  legacy.assertGameState(value);
  assertSportMatchModel(value);
  assertPenaltySetupStore(value);
}
