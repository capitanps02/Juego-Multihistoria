import assert from "node:assert/strict";
import path from "node:path";
import { pathToFileURL } from "node:url";

const [baselineRootArg, candidateRootArg] = process.argv.slice(2);
if (!baselineRootArg || !candidateRootArg) {
  throw new Error("Usage: node scripts/test-player-actions-zero-equivalence.mjs <baseline-root> <candidate-root>");
}

const baselineRoot = path.resolve(baselineRootArg);
const candidateRoot = path.resolve(candidateRootArg);
const baselineModule = await import(pathToFileURL(path.join(baselineRoot, "dist/session/game-session.js")).href);
const candidateModule = await import(pathToFileURL(path.join(candidateRoot, "dist/session/game-session.js")).href);
const BaselineGameSession = baselineModule.GameSession;
const CandidateGameSession = candidateModule.GameSession;

const SEEDS = [1, 2, 7, 42, 77, 125, 777, 2026, 424242];
const WINDOWS = [28, 84, 365];
const MAX_COMMANDS = 5000;

function stableCommand(view, index) {
  const common = {
    commandId: `zae-${String(index).padStart(5, "0")}`,
    expectedRevision: view.revision
  };
  if (view.screen === "decision") {
    const choice = view.decision?.choices?.[0];
    assert.ok(choice, "Decision without an eligible choice in baseline");
    return {
      ...common,
      type: "choose",
      pendingInstanceId: view.decision.instanceId,
      choiceId: choice.id
    };
  }
  if (view.screen === "result") return { ...common, type: "acknowledge" };
  if (view.screen === "offer") {
    assert.ok(view.offer?.id, "Offer screen without public offer id in baseline");
    return { ...common, type: "offer", offerId: view.offer.id, action: "reject" };
  }
  if (view.screen === "epilogue") return null;
  assert.equal(view.screen, "career", `Unexpected baseline screen: ${view.screen}`);
  return { ...common, type: "continue", maxDays: 7 };
}

function canonicalSnapshot(snapshot) {
  const cloned = structuredClone(snapshot);
  if (Object.prototype.hasOwnProperty.call(cloned.state, "playerActions") && cloned.state.playerActions === undefined) {
    delete cloned.state.playerActions;
  }
  return cloned;
}

async function runSeed(seed) {
  const sessionId = `a6-zero-action-${seed}`;
  const baseline = await BaselineGameSession.create(seed, { microfeeds: false, sessionId });
  const candidate = await CandidateGameSession.create(seed, { microfeeds: false, sessionId });

  assert.deepEqual(
    canonicalSnapshot(candidate.exportSnapshot()),
    canonicalSnapshot(baseline.exportSnapshot()),
    `seed ${seed}: initial snapshot differs`
  );

  const reached = new Set();
  let commands = 0;
  while (commands < MAX_COMMANDS && reached.size < WINDOWS.length) {
    const baselineView = baseline.getView();
    const command = stableCommand(baselineView, commands + 1);
    if (!command) break;

    const baselineResult = await baseline.dispatch(structuredClone(command));
    let candidateResult;
    try {
      candidateResult = await candidate.dispatch(structuredClone(command));
    } catch (error) {
      throw new Error(
        `seed ${seed}: candidate rejected baseline command #${commands + 1} ${JSON.stringify(command)}: ${error?.code ?? error?.message ?? error}`
      );
    }

    assert.equal(candidateResult.replayed, baselineResult.replayed, `seed ${seed}: replay flag differs at command ${commands + 1}`);
    const baselineSnapshot = canonicalSnapshot(baseline.exportSnapshot());
    const candidateSnapshot = canonicalSnapshot(candidate.exportSnapshot());

    assert.deepEqual(
      candidateSnapshot,
      baselineSnapshot,
      `seed ${seed}: ZERO_ACTION_EQUIVALENCE diverged after command ${commands + 1} (${command.type})`
    );

    const day = baselineSnapshot.state.runtime.day;
    for (const window of WINDOWS) {
      if (day >= window && !reached.has(window)) {
        reached.add(window);
        console.log(`ZERO_ACTION seed=${seed} window=${window} reached_day=${day} revision=${baselineSnapshot.revision} PASS`);
      }
    }
    commands += 1;
  }

  for (const window of WINDOWS) {
    assert.ok(reached.has(window), `seed ${seed}: did not reach ${window} runtime days within ${MAX_COMMANDS} commands`);
  }
  assert.equal(Object.prototype.hasOwnProperty.call(candidate.exportSnapshot().state, "playerActions"), false,
    `seed ${seed}: zero-action candidate materialized playerActions`);
  return { seed, commands };
}

const rows = [];
for (const seed of SEEDS) rows.push(await runSeed(seed));

console.log(JSON.stringify({
  gate: "PA-GATE-03 ZERO_ACTION_EQUIVALENCE",
  baseline: path.basename(baselineRoot),
  candidate: path.basename(candidateRoot),
  seeds: SEEDS,
  windowsDays: WINDOWS,
  differences: 0,
  rows,
  result: "PASS"
}, null, 2));
