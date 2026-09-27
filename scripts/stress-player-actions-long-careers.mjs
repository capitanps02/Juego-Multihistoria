import assert from "node:assert/strict";
import { GameSession } from "../dist/session/game-session.js";

const SEEDS = [
  1, 2, 7, 42, 77, 125, 777, 2026, 424242,
  11, 19, 23, 31, 55, 88, 144, 233, 377, 610, 987, 1597, 2584, 4096, 8192
];
const POLICIES = [
  "none",
  "training-heavy",
  "career-aggressive",
  "rest-heavy",
  "mixed",
  "random-valid-action"
];
const MAX_COMMANDS = 30000;
const MAX_ACTIONS_PER_TICK = 2;

const POLICY_IDS = {
  "none": [],
  "training-heavy": ["PA_TRAIN_EXTRA","PA_VIDEO_STUDY"],
  "career-aggressive": [
    "PA_REQUEST_TRANSFER","PA_REQUEST_RENEWAL","PA_COACH_TALK",
    "PA_AGENT_MARKET","PA_DISCUSS_FUTURE","PA_POSITION_CHANGE"
  ],
  "rest-heavy": ["PA_REST","PA_RECOVERY_SESSION","PA_PERSONAL_TIME","PA_DISCONNECT"],
  "mixed": [
    "PA_TRAIN_EXTRA","PA_REST","PA_COACH_TALK","PA_AGENT_MARKET",
    "PA_TALK_TEAMMATE","PA_INTERVIEW","PA_PERSONAL_TIME"
  ],
  "random-valid-action": []
};

function allActions(view) {
  return view.actions?.categories?.flatMap(category => category.actions) ?? [];
}

function executableRequest(action) {
  if (!action?.available) return null;
  if (action.targetKind && action.targetKind !== "none") {
    for (const target of action.targets ?? []) {
      if (!target.available) continue;
      const option = (target.options ?? []).find(candidate => candidate.available);
      if (option) return { actionId: action.id, optionId: option.id, targetId: target.id };
    }
    return null;
  }
  const option = (action.options ?? []).find(candidate => candidate.available);
  return option ? { actionId: action.id, optionId: option.id } : null;
}

function hash32(text) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

function policyRequests(view, policy, seed, salt) {
  if (policy === "none") return [];
  const actions = allActions(view);
  const byId = new Map(actions.map(action => [action.id, action]));
  if (policy === "random-valid-action") {
    const available = actions
      .map(executableRequest)
      .filter(Boolean)
      .sort((a, b) => `${a.actionId}::${a.optionId}::${a.targetId ?? ""}`.localeCompare(
        `${b.actionId}::${b.optionId}::${b.targetId ?? ""}`
      ));
    if (!available.length) return [];
    const day = view.runtimeDay ?? 0;
    const start = hash32(`${seed}:${day}:${salt}`) % available.length;
    return [available[start]];
  }
  return POLICY_IDS[policy]
    .map(id => executableRequest(byId.get(id)))
    .filter(Boolean);
}

async function resolveBlockingScreen(session, commandSeq) {
  const view = session.getView();
  if (view.screen === "decision") {
    const choice = view.decision?.choices?.[0];
    assert.ok(choice, "decision has no eligible choice");
    await session.dispatch({
      type: "choose",
      commandId: `lc-${commandSeq}-choice`,
      expectedRevision: view.revision,
      pendingInstanceId: view.decision.instanceId,
      choiceId: choice.id
    });
    return true;
  }
  if (view.screen === "result") {
    await session.dispatch({
      type: "acknowledge",
      commandId: `lc-${commandSeq}-ack`,
      expectedRevision: view.revision
    });
    return true;
  }
  if (view.screen === "offer") {
    assert.ok(view.offer?.id, "offer screen missing offer id");
    await session.dispatch({
      type: "offer",
      commandId: `lc-${commandSeq}-offer`,
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
    microfeeds: false,
    sessionId: `a6-long-${seed}-${policy}`
  });
  let commands = 0;
  let actions = 0;
  const byAction = {};
  let maxHistory = 0;
  let maxFacts = 0;
  let maxCooldowns = 0;

  while (commands < MAX_COMMANDS) {
    let view = session.getView();
    if (view.screen === "epilogue") break;

    if (view.screen !== "career") {
      const handled = await resolveBlockingScreen(session, ++commands);
      assert.equal(handled, true, `unsupported screen ${view.screen}`);
      continue;
    }

    const requests = policyRequests(view, policy, seed, actions + commands).slice(0, MAX_ACTIONS_PER_TICK);
    for (const request of requests) {
      view = session.getView();
      if (view.screen !== "career") break;
      const currentAction = allActions(view).find(row => row.id === request.actionId);
      const current = executableRequest(currentAction);
      if (!current) continue;
      await session.dispatch({
        type: "player_action",
        commandId: `lc-${seed}-${policy}-action-${++commands}`,
        expectedRevision: view.revision,
        ...current
      });
      actions += 1;
      byAction[current.actionId] = (byAction[current.actionId] ?? 0) + 1;
      const store = session.exportSnapshot().state.playerActions;
      maxHistory = Math.max(maxHistory, store?.history.length ?? 0);
      maxFacts = Math.max(maxFacts, store?.facts.length ?? 0);
      maxCooldowns = Math.max(maxCooldowns, Object.keys(store?.cooldowns ?? {}).length);
    }

    view = session.getView();
    if (view.screen !== "career") continue;
    await session.dispatch({
      type: "continue",
      commandId: `lc-${seed}-${policy}-continue-${++commands}`,
      expectedRevision: view.revision,
      maxDays: 7
    });
  }

  const finalView = session.getView();
  const snapshot = session.exportSnapshot();
  const saveBytes = Buffer.byteLength(JSON.stringify(snapshot));
  assert.equal(
    finalView.screen,
    "epilogue",
    `career seed=${seed} policy=${policy} did not complete in ${MAX_COMMANDS} commands; screen=${finalView.screen}`
  );
  return {
    seed,
    policy,
    commands,
    actions,
    byAction,
    completed: true,
    finalDate: snapshot.state.date,
    finalAge: snapshot.state.age,
    runtimeDays: snapshot.state.runtime.day,
    historyEntries: snapshot.state.playerActions?.history.length ?? 0,
    factEntries: snapshot.state.playerActions?.facts.length ?? 0,
    cooldownEntries: Object.keys(snapshot.state.playerActions?.cooldowns ?? {}).length,
    maxHistory,
    maxFacts,
    maxCooldowns,
    saveBytes
  };
}

const rows = [];
const failures = [];
for (let index = 0; index < SEEDS.length; index += 1) {
  const seed = SEEDS[index];
  const policy = POLICIES[index % POLICIES.length];
  try {
    const row = await runCareer(seed, policy);
    rows.push(row);
    console.log(`LONG_CAREER seed=${seed} policy=${policy} actions=${row.actions} days=${row.runtimeDays} saveBytes=${row.saveBytes} PASS`);
  } catch (error) {
    failures.push({ seed, policy, error: String(error?.stack ?? error) });
    console.error(`LONG_CAREER seed=${seed} policy=${policy} FAIL`, error);
  }
}

assert.equal(failures.length, 0, JSON.stringify(failures, null, 2));
assert.equal(rows.length, SEEDS.length);

const byPolicy = Object.fromEntries(POLICIES.map(policy => {
  const group = rows.filter(row => row.policy === policy);
  const avg = key => group.reduce((sum, row) => sum + row[key], 0) / Math.max(1, group.length);
  return [policy, {
    careers: group.length,
    averageActions: avg("actions"),
    averageRuntimeDays: avg("runtimeDays"),
    averageSaveBytes: avg("saveBytes"),
    maxSaveBytes: Math.max(...group.map(row => row.saveBytes)),
    maxHistoryEntries: Math.max(...group.map(row => row.historyEntries)),
    maxFactEntries: Math.max(...group.map(row => row.factEntries)),
    maxCooldownEntries: Math.max(...group.map(row => row.cooldownEntries))
  }];
}));

console.log(JSON.stringify({
  gate: "A6 LONG CAREER STRESS",
  careers: rows.length,
  uniqueSeeds: new Set(rows.map(row => row.seed)).size,
  policies: POLICIES,
  crashes: failures.length,
  careersCompleted: rows.filter(row => row.completed).length,
  totalActions: rows.reduce((sum, row) => sum + row.actions, 0),
  maxSaveBytes: Math.max(...rows.map(row => row.saveBytes)),
  maxHistoryEntries: Math.max(...rows.map(row => row.historyEntries)),
  maxFactEntries: Math.max(...rows.map(row => row.factEntries)),
  maxCooldownEntries: Math.max(...rows.map(row => row.cooldownEntries)),
  byPolicy,
  result: "PASS"
}, null, 2));
