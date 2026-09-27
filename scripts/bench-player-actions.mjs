import { performance } from "node:perf_hooks";
import { GameSession } from "../dist/session/game-session.js";
import {
  addPlayerActionDays,
  executePlayerActionInPlace,
  listPlayerActions
} from "../dist/player-actions/index.js";

function measure(label, iterations, fn) {
  const started = performance.now();
  for (let index = 0; index < iterations; index += 1) fn(index);
  const elapsedMs = performance.now() - started;
  return {
    label,
    iterations,
    elapsedMs,
    meanMs: elapsedMs / iterations
  };
}

const session = await GameSession.create(6601, {
  events: [],
  microfeeds: false,
  sessionId: "a6-performance"
});
const snapshot = session.exportSnapshot();
const state = snapshot.state;

const rows = [];
rows.push(measure("getView", 5000, () => session.getView()));
rows.push(measure("availability_projection", 5000, () => listPlayerActions(state)));
rows.push(measure("save_serialization", 2000, () => JSON.stringify(session.exportSnapshot())));

const executionState = structuredClone(state);
const started = performance.now();
let executed = 0;
for (let index = 0; index < 500; index += 1) {
  const result = executePlayerActionInPlace(executionState, {
    actionId: "PA_REST",
    optionId: "RECOVER"
  });
  if (!result.ok) {
    executionState.date = addPlayerActionDays(executionState.date, 1);
    const retry = executePlayerActionInPlace(executionState, {
      actionId: "PA_REST",
      optionId: "RECOVER"
    });
    if (!retry.ok) throw new Error(`performance execution setup failed: ${retry.code}`);
  }
  executed += 1;
  executionState.date = addPlayerActionDays(executionState.date, 1);
}
const executionElapsedMs = performance.now() - started;
rows.push({
  label: "player_action_execution",
  iterations: executed,
  elapsedMs: executionElapsedMs,
  meanMs: executionElapsedMs / executed
});

console.log(JSON.stringify({
  note: "Approximate CI timing only; informational, not a hard release threshold.",
  rows,
  finalHistoryEntries: executionState.playerActions?.history.length ?? 0,
  finalSaveBytes: Buffer.byteLength(JSON.stringify({
    sessionVersion: snapshot.sessionVersion,
    revision: snapshot.revision,
    state: executionState,
    receipts: snapshot.receipts
  }))
}, null, 2));
