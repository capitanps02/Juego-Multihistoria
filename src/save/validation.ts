import type { GameState } from "../core/types.js";
import { inspectSportMatchModelStore } from "../simulation/match-model.js";
import { inspectSportPenaltyContextStore } from "../simulation/penalty-context.js";
import * as legacy from "./validation-legacy.js";

export * from "./validation-legacy.js";

function assertSportModels(value: unknown): void {
  const state = legacy.record(value, "state");
  const world = legacy.record(state.world, "world");
  const matchIssue = inspectSportMatchModelStore(world.sportMatchModel, state.date as string);
  if (matchIssue) legacy.ensure(false, matchIssue.path, matchIssue.reason);
  const penaltyIssue = inspectSportPenaltyContextStore(
    world.sportPenaltyContexts,
    state.date as string,
    world.sportMatchModel
  );
  if (penaltyIssue) legacy.ensure(false, penaltyIssue.path, penaltyIssue.reason);
}

/**
 * Preserve the complete schema-2..8 validator and add optional sporting stores
 * as fail-closed extensions. Historical saves may omit either store.
 */
export function validateGameSave(value: unknown, version: number): void {
  legacy.validateGameSave(value, version);
  assertSportModels(value);
}

/** Common runtime/save boundary including market + football moment + sporting model checks. */
export function assertGameState(value: unknown): asserts value is GameState {
  legacy.assertGameState(value);
  assertSportModels(value);
}
