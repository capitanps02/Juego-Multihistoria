import assert from "node:assert/strict";
import { performance } from "node:perf_hooks";
import { GameSession } from "../dist/session/game-session.js";

const SEEDS = Array.from({ length: 20 }, (_, index) => index + 1);
const POLICIES = ["none", "training-heavy", "rest-heavy", "mixed"];
const TARGET_DAYS = 365;

function actionFromView(view, actionId) {
  return view.actions.categories
    .flatMap(category => category.actions)
    .find(action => action.id === actionId) ?? null;
}

async function dispatchActionIfAvailable(session, actionId, optionId, id) {
  const view = session.getView();
  const action = actionFromView(view, actionId);
  if (!action?.available) return false;
  await session.dispatch({
    type: "player_action",
    commandId: id,
    expectedRevision: view.revision,
    actionId,
    optionId
  });
  return true;
}

async function resolveNonCareer(session, counter) {
  const view = session.getView();
  if (view.screen === "decision") {
    const choice = view.decision?.choices?.[0];
    assert.ok(choice, "decision without eligible choice");
    await session.dispatch({
      type: "choose",
      commandId: `stress-${counter}-decision`,
      expectedRevision: view.revision,
      pendingInstanceId: view.decision.instanceId,
      choiceId: choice.id
    });
    return true;
  }
  if (view.screen === "result") {
    await session.dispatch({
      type: "acknowledge",
      commandId: `stress-${counter}-ack`,
      expectedRevision: view.revision
    });
    return true;
  }
  if (view.screen === "offer") {
    assert.ok(view.offer?.id, "offer screen without offer id");
    await session.dispatch({
      type: "offer",
      commandId: `stress-${counter}-offer`,
      expectedRevision: view.revision,
      offerId: view.offer.id,
      action: "reject"
    });
    return true;
  }
  return false;
}

async function runCareer(seed, policy) {
  const session = await GameSession.create(seed, {
    events: [],
    microfeeds: false,
    sessionId: `a6-stress-${seed}-${policy}`
  });
  let actionCount = 0;
  let commands = 0;
  const started = performance.now();

  while (session.exportSnapshot().state.runtime.day < TARGET_DAYS) {
    const view = session.getView();
    if (view.screen === "epilogue") break;
    if (view.screen !== "career") {
      const resolved = await resolveNonCareer(session, ++commands);
      assert.equal(resolved, true, `unsupported screen during stress: ${view.screen}`);
      continue;
    }

    if (policy === "training-heavy" || policy === "mixed") {
      const ran = await dispatchActionIfAvailable(
        session,
        "PA_TRAIN_EXTRA",
        "TECHNIQUE",
        `stress-${seed}-${policy}-train-${++commands}`
      );
      if (ran) actionCount += 1;
    }
    if (policy === "rest-heavy" || policy === "mixed") {
      const ran = await dispatchActionIfAvailable(
        session,
        "PA_REST",
        "RECOVER",
        `stress-${seed}-${policy}-rest-${++commands}`
      );
      if (ran) actionCount += 1;
    }

    const current = session.getView();
    assert.equal(current.screen, "career");
    await session.dispatch({
      type: "continue",
      commandId: `stress-${seed}-${policy}-continue-${++commands}`,
      expectedRevision: current.revision,
      maxDays: Math.min(7, TARGET_DAYS - session.exportSnapshot().state.runtime.day)
    });
  }

  const snapshot = session.exportSnapshot();
  const store = snapshot.state.playerActions;
  const elapsedMs = performance.now() - started;
  return {
    seed,
    policy,
    elapsedDays: snapshot.state.runtime.day,
    actions: actionCount,
    historyEntries: store?.history.length ?? 0,
    cooldownEntries: Object.keys(store?.cooldowns ?? {}).length,
    factEntries: store?.facts.length ?? 0,
    saveBytes: Buffer.byteLength(JSON.stringify(snapshot)),
    technique: Number(snapshot.state.professional.technique),
    fatigue: Number(snapshot.state.body.fatigue),
    fitness: Number(snapshot.state.body.fitness),
    elapsedMs
  };
}

const rows = [];
const failures = [];
for (const seed of SEEDS) {
  for (const policy of POLICIES) {
    try {
      const row = await runCareer(seed, policy);
      assert.ok(row.elapsedDays >= TARGET_DAYS, `seed ${seed} policy ${policy} ended at day ${row.elapsedDays}`);
      rows.push(row);
      console.log(`STRESS seed=${seed} policy=${policy} days=${row.elapsedDays} actions=${row.actions} saveBytes=${row.saveBytes} PASS`);
    } catch (error) {
      failures.push({ seed, policy, error: String(error?.stack ?? error) });
      console.error(`STRESS seed=${seed} policy=${policy} FAIL`, error);
    }
  }
}

assert.equal(failures.length, 0, JSON.stringify(failures, null, 2));

const byPolicy = Object.fromEntries(POLICIES.map(policy => {
  const group = rows.filter(row => row.policy === policy);
  const avg = key => group.reduce((sum, row) => sum + row[key], 0) / group.length;
  return [policy, {
    careers: group.length,
    averageActions: avg("actions"),
    averageSaveBytes: avg("saveBytes"),
    maxSaveBytes: Math.max(...group.map(row => row.saveBytes)),
    maxHistoryEntries: Math.max(...group.map(row => row.historyEntries)),
    maxCooldownEntries: Math.max(...group.map(row => row.cooldownEntries)),
    maxFactEntries: Math.max(...group.map(row => row.factEntries)),
    averageTechnique: avg("technique"),
    averageFatigue: avg("fatigue"),
    averageFitness: avg("fitness"),
    averageElapsedMs: avg("elapsedMs")
  }];
}));

console.log(JSON.stringify({
  scope: "A6 backend fixture stress; NOT final A5 balance certification",
  seeds: SEEDS.length,
  policies: POLICIES,
  careers: rows.length,
  crashes: failures.length,
  targetDays: TARGET_DAYS,
  byPolicy
}, null, 2));
