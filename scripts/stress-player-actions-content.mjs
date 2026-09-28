import assert from "node:assert/strict";
import { GameSession } from "../dist/session/game-session.js";

const SEEDS = Array.from({ length: 20 }, (_, index) => index + 1);
const POLICIES = ["none", "training-heavy", "rest-heavy", "mixed"];
const TARGET_DAYS = 365;

function actionFromView(view, actionId) {
  return view.actions.categories
    .flatMap(category => category.actions)
    .find(action => action.id === actionId) ?? null;
}

async function dispatchActionIfAvailable(session, actionId, optionId, commandId) {
  const view = session.getView();
  const action = actionFromView(view, actionId);
  if (!action?.available) return false;
  await session.dispatch({
    type: "player_action",
    commandId,
    expectedRevision: view.revision,
    actionId,
    optionId
  });
  return true;
}

async function resolveNonCareer(session, commandId) {
  const view = session.getView();
  if (view.screen === "decision") {
    const choice = view.decision?.choices?.[0];
    assert.ok(choice, "decision without eligible choice");
    await session.dispatch({
      type: "choose",
      commandId,
      expectedRevision: view.revision,
      pendingInstanceId: view.decision.instanceId,
      choiceId: choice.id
    });
    return;
  }
  if (view.screen === "result") {
    await session.dispatch({ type: "acknowledge", commandId, expectedRevision: view.revision });
    return;
  }
  if (view.screen === "offer") {
    assert.ok(view.offer?.id, "offer screen without offer");
    await session.dispatch({
      type: "offer",
      commandId,
      expectedRevision: view.revision,
      offerId: view.offer.id,
      action: "reject"
    });
    return;
  }
  throw new Error(`unsupported stress screen: ${view.screen}`);
}

async function runCareer(seed, policy) {
  const session = await GameSession.create(seed, {
    events: [],
    microfeeds: false,
    sessionId: `a5-balance-${seed}-${policy}`
  });
  let commands = 0;
  let trainingActions = 0;
  let restActions = 0;

  while (session.exportSnapshot().state.runtime.day < TARGET_DAYS) {
    const view = session.getView();
    if (view.screen === "epilogue") break;
    if (view.screen !== "career") {
      await resolveNonCareer(session, `a5-balance-${seed}-${policy}-resolve-${++commands}`);
      continue;
    }

    if (policy === "training-heavy" || policy === "mixed") {
      if (await dispatchActionIfAvailable(
        session,
        "PA_TRAIN_EXTRA",
        "TECHNIQUE",
        `a5-balance-${seed}-${policy}-train-${++commands}`
      )) trainingActions += 1;
    }

    if (policy === "rest-heavy" || policy === "mixed") {
      if (await dispatchActionIfAvailable(
        session,
        "PA_REST",
        "RECOVER",
        `a5-balance-${seed}-${policy}-rest-${++commands}`
      )) restActions += 1;
    }

    const current = session.getView();
    assert.equal(current.screen, "career");
    await session.dispatch({
      type: "continue",
      commandId: `a5-balance-${seed}-${policy}-continue-${++commands}`,
      expectedRevision: current.revision,
      maxDays: 1
    });
  }

  const snapshot = session.exportSnapshot();
  assert.ok(snapshot.state.runtime.day >= TARGET_DAYS, `career ended before ${TARGET_DAYS} days`);
  return {
    seed,
    policy,
    trainingActions,
    restActions,
    technique: Number(snapshot.state.professional.technique),
    fatigue: Number(snapshot.state.body.fatigue),
    fitness: Number(snapshot.state.body.fitness),
    saveBytes: Buffer.byteLength(JSON.stringify(snapshot))
  };
}

const rows = [];
for (const seed of SEEDS) {
  for (const policy of POLICIES) rows.push(await runCareer(seed, policy));
}

const average = (group, key) => group.reduce((sum, row) => sum + row[key], 0) / group.length;
const byPolicy = Object.fromEntries(POLICIES.map(policy => {
  const group = rows.filter(row => row.policy === policy);
  return [policy, {
    careers: group.length,
    averageTrainingActions: average(group, "trainingActions"),
    averageRestActions: average(group, "restActions"),
    averageTechnique: average(group, "technique"),
    averageFatigue: average(group, "fatigue"),
    averageFitness: average(group, "fitness"),
    averageSaveBytes: average(group, "saveBytes"),
    maxSaveBytes: Math.max(...group.map(row => row.saveBytes))
  }];
}));

const none = byPolicy.none;
const training = byPolicy["training-heavy"];
const rest = byPolicy["rest-heavy"];
const mixed = byPolicy.mixed;

assert.ok(training.averageTrainingActions <= 11, `training frequency too high: ${training.averageTrainingActions}`);
assert.ok(
  training.averageTechnique - none.averageTechnique <= 6,
  `training grind delta too high: ${training.averageTechnique - none.averageTechnique}`
);
assert.ok(rest.averageRestActions <= 18, `rest frequency too high: ${rest.averageRestActions}`);
assert.ok(rest.averageFitness <= 94, `rest keeps fitness too high: ${rest.averageFitness}`);
assert.ok(rest.averageFatigue >= 7, `rest keeps fatigue too low: ${rest.averageFatigue}`);
assert.ok(
  mixed.averageTechnique - none.averageTechnique <= 6,
  `mixed training delta too high: ${mixed.averageTechnique - none.averageTechnique}`
);
assert.ok(mixed.averageFitness <= 95, `mixed policy keeps fitness too high: ${mixed.averageFitness}`);
assert.ok(mixed.averageFatigue >= 5, `mixed policy keeps fatigue too low: ${mixed.averageFatigue}`);

console.log(JSON.stringify({
  scope: "A5 one-year anti-grind gate",
  seeds: SEEDS.length,
  careers: rows.length,
  targetDays: TARGET_DAYS,
  cooldowns: {
    trainingDays: 35,
    restDays: 21
  },
  acceptance: {
    maxTechniqueDelta: 6,
    restMaxFitness: 94,
    restMinFatigue: 7,
    mixedMaxFitness: 95,
    mixedMinFatigue: 5
  },
  byPolicy
}, null, 2));
