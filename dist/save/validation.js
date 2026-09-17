import { inspectSportMatchModelStore } from "../simulation/match-model.js";
import * as legacy from "./validation-legacy.js";
export * from "./validation-legacy.js";
function assertSportMatchModel(value) {
    const state = legacy.record(value, "state");
    const world = legacy.record(state.world, "world");
    const issue = inspectSportMatchModelStore(world.sportMatchModel, state.date);
    if (issue)
        legacy.ensure(false, issue.path, issue.reason);
}
/**
 * Preserve the complete schema-2..8 validator and add the optional match-model
 * store as a fail-closed extension. Historical saves may omit the store.
 */
export function validateGameSave(value, version) {
    legacy.validateGameSave(value, version);
    assertSportMatchModel(value);
}
/** Common runtime/save boundary including market + football moment + match-model checks. */
export function assertGameState(value) {
    legacy.assertGameState(value);
    assertSportMatchModel(value);
}
