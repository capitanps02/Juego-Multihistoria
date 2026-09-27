import assert from "node:assert/strict";
import path from "node:path";
import { pathToFileURL } from "node:url";

const candidateRoot = path.resolve(process.argv[2] ?? ".");
const { GameSession } = await import(
  pathToFileURL(path.join(candidateRoot, "dist/session/game-session.js")).href
);

const SEEDS = Array.from({ length: 10 }, (_, index) => index + 1);
const DAYS = 365;

function action(view, id) {
  return view.actions.categories.flatMap(category => category.actions).find(row => row.id === id);
}

async function resolve(session, counter) {
  const view = session.getView();
  if (view.screen === "career") return false;
  if (view.screen === "decision") {
    const choice = view.decision?.choices?.[0];
    assert.ok(choice);
    await session.dispatch({
      type: "choose",
      commandId: `bal-${counter}-choice`,
      expectedRevision: view.revision,
      pendingInstanceId: view.decision.instanceId,
      choiceId: choice.id
    });
    return true;
  }
  if (view.screen === "result") {
    await session.dispatch({
      type: "acknowledge",
      commandId: `bal-${counter}-ack`,
      expectedRevision: view.revision
    });
    return true;
  }
  if (view.screen === "offer") {
    await session.dispatch({
      type: "offer",
      commandId: `bal-${counter}-offer`,
      expectedRevision: view.revision,
      offerId: view.offer.id,
      action: "reject"
    });
    return true;
  }
  throw new Error(`unsupported balance screen: ${view.screen}`);
}

async function run(seed, policy) {
  const session = await GameSession.create(seed, {
    events: [],
    microfeeds: false,
    sessionId: `a6-balance-${seed}-${policy}`
  });
  let commands = 0;
  let actions = 0;

  while (session.exportSnapshot().state.runtime.day < DAYS) {
    let view = session.getView();
    if (view.screen !== "career") {
      await resolve(session, ++commands);
      continue;
    }

    if (policy === "training") {
      const row = action(view, "PA_TRAIN_EXTRA");
      if (row?.available) {
        await session.dispatch({
          type: "player_action",
          commandId: `bal-${seed}-train-${++commands}`,
          expectedRevision: view.revision,
          actionId: "PA_TRAIN_EXTRA",
          optionId: "TECHNIQUE"
        });
        actions += 1;
        view = session.getView();
      }
    }

    if (policy === "rest") {
      const row = action(view, "PA_REST");
      if (row?.available) {
        await session.dispatch({
          type: "player_action",
          commandId: `bal-${seed}-rest-${++commands}`,
          expectedRevision: view.revision,
          actionId: "PA_REST",
          optionId: "RECOVER"
        });
        actions += 1;
        view = session.getView();
      }
    }

    await session.dispatch({
      type: "continue",
      commandId: `bal-${seed}-advance-${++commands}`,
      expectedRevision: view.revision,
      maxDays: 1
    });
  }

  const state = session.exportSnapshot().state;
  return {
    seed,
    policy,
    actions,
    technique: Number(state.professional.technique),
    fatigue: Number(state.body.fatigue),
    fitness: Number(state.body.fitness)
  };
}

const rows = [];
for (const seed of SEEDS) {
  for (const policy of ["none", "training", "rest"]) rows.push(await run(seed, policy));
}

const group = policy => rows.filter(row => row.policy === policy);
const avg = (policy, key) => group(policy).reduce((sum, row) => sum + row[key], 0) / group(policy).length;

const noneTechnique = avg("none", "technique");
const trainingTechnique = avg("training", "technique");
const trainingTechniqueDelta = trainingTechnique - noneTechnique;
const restFitness = avg("rest", "fitness");
const restFatigue = avg("rest", "fatigue");
const trainingActions = avg("training", "actions");
const restActions = avg("rest", "actions");

console.log(JSON.stringify({
  gate: "PA-GATE-11 ANTI_GRIND",
  seeds: SEEDS.length,
  days: DAYS,
  training: {
    averageActions: trainingActions,
    baselineTechnique: noneTechnique,
    averageTechnique: trainingTechnique,
    techniqueDelta: trainingTechniqueDelta,
    acceptance: "annual average technique delta <= 8, consistent with A5 documented +0.10..+0.20/10d range"
  },
  rest: {
    averageActions: restActions,
    averageFitness: restFitness,
    averageFatigue: restFatigue,
    acceptance: "must not simultaneously pin average fitness >=99 and average fatigue <=1"
  }
}, null, 2));

assert.ok(
  trainingTechniqueDelta <= 8,
  `training grind exceeds A5 release budget: +${trainingTechniqueDelta.toFixed(2)} technique/year`
);

assert.ok(
  !(restFitness >= 99 && restFatigue <= 1),
  `rest grind pins recovery near-perfect: fitness=${restFitness.toFixed(2)} fatigue=${restFatigue.toFixed(2)}`
);

console.log("PA-GATE-11 ANTI_GRIND PASS");
