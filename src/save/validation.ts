import type { GameState } from "../core/types.js";
import { inspectSportMatchModelStore } from "../simulation/match-model.js";
import { inspectCompetitionMomentStore } from "../simulation/competition-context.js";
import { inspectPenaltySetupStore } from "../simulation/match-penalty-context.js";
import * as legacy from "./validation-legacy.js";

export * from "./validation-legacy.js";

function assertCompetitionMoments(value: unknown): void {
  const state = legacy.record(value, "state");
  const world = legacy.record(state.world, "world");
  const issue = inspectCompetitionMomentStore(world.sportCompetitionMoments, value as GameState);
  if (issue) legacy.ensure(false, issue.path, issue.reason);
}

function assertPenaltySetups(value: unknown): void {
  const state = value as GameState;
  const world = legacy.record(state.world, "world");
  const issue = inspectPenaltySetupStore(world.sportPenaltySetups, state);
  if (issue) legacy.ensure(false, issue.path, issue.reason);
}

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
  assertCompetitionMoments(value);
  assertPenaltySetups(value);
}

/** Common runtime/save boundary including market + football moment + match-model checks. */
export function assertGameState(value: unknown): asserts value is GameState {
  legacy.assertGameState(value);
  assertSportMatchModel(value);
  assertCompetitionMoments(value);
}
