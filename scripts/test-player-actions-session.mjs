import test from "node:test";
import assert from "node:assert/strict";

import { GameSession } from "../dist/session/game-session.js";
import { EVENTS } from "../dist/content/events/index.js";

const clone = value => structuredClone(value);
const command = (session, type, extra = {}) => ({
  type,
  commandId: crypto.randomUUID(),
  expectedRevision: session.getView().revision,
  ...extra
});

async function emptySession(seed, sessionId = `a2-${seed}-${crypto.randomUUID()}`, extra = {}) {
  const created = await GameSession.create(seed, { events: [], microfeeds: false, sessionId, ...extra });
  const snapshot = created.exportSnapshot();
  snapshot.state.body.fatigue = Math.max(30, Number(snapshot.state.body.fatigue ?? 0));
  return GameSession.resume(snapshot, { events: [], ...extra });
}

async function sessionFromMutatedState(seed, mutate, sessionId) {
  const base = await emptySession(seed, sessionId);
  const snapshot = base.exportSnapshot();
  mutate(snapshot.state);
  return GameSession.resume(snapshot, { events: [] });
}

async function januaryOfferSession() {
  for (let seed = 1; seed <= 80; seed += 1) {
    const session = await sessionFromMutatedState(seed, state => {
      state.date = "2027-01-07";
      state.runtime.day = 190;
      state.runtime.seasonDay = 190;
      state.runtime.daysSinceNarrative = 190;
      state.sport.roleScore = 18;
      state.sport.appearances = 0;
      state.flags.OFFICIAL_DEBUT = false;
      state.body.risk = 18;
    }, `a2-offer-${seed}`);
    await session.dispatch(command(session, "auto", { action: "start", maxWeeks: 2 }));
    if (session.getView().screen === "offer") return session;
  }
  throw new Error("No deterministic January offer seed found");
}

async function closedCareerSession() {
  let session = await emptySession(1, "a2-retired");
  const snapshot = session.exportSnapshot();
  snapshot.state.retirement.status = "closed";
  snapshot.state.retirement.decidedDate = snapshot.state.date;
  snapshot.state.retirement.announcedDate = snapshot.state.date;
  snapshot.state.retirement.closedDate = snapshot.state.date;
  snapshot.state.retirement.decisionAge = snapshot.state.age;
  snapshot.state.retirement.reason = "qa_terminal";
  snapshot.state.retirement.closureType = "qa_terminal";
  return GameSession.resume(snapshot, { events: [] });
}

test("A2-001 COMMAND: valid Player Action executes through GameSession", async () => {
  const session = await emptySession(201, "a2-001");
  const response = await session.dispatch(command(session, "player_action", {
    actionId: "PA_REST", optionId: "RECOVER"
  }));
  assert.equal(response.replayed, false);
  assert.equal(response.receipt.type, "player_action");
  assert.equal(session.exportSnapshot().state.playerActions?.history.length, 1);
  assert.equal(response.view.actions.lastResult?.text, "Reduces carga y recuperas sensaciones.");
});

test("A2-002 REVISION: successful action increments revision exactly once", async () => {
  const session = await emptySession(202, "a2-002");
  const before = session.getView().revision;
  await session.dispatch(command(session, "player_action", { actionId: "PA_REST", optionId: "RECOVER" }));
  assert.equal(session.getView().revision, before + 1);
});

test("A2-003 RECEIPT: canonical fingerprint includes target slot", async () => {
  const session = await emptySession(203, "a2-003");
  const response = await session.dispatch({
    type: "player_action", commandId: "a2-003-action", expectedRevision: 0,
    actionId: "PA_REST", optionId: "RECOVER"
  });
  assert.equal(response.receipt.fingerprint, JSON.stringify(["player_action", 0, "PA_REST", "RECOVER", null]));
  assert.equal(response.receipt.revision, 1);
});

test("A2-004 REPLAY: same commandId + same fingerprint is idempotent", async () => {
  const session = await emptySession(204, "a2-004");
  const c = { type: "player_action", commandId: "a2-replay", expectedRevision: 0, actionId: "PA_REST", optionId: "RECOVER" };
  const first = await session.dispatch(c);
  const afterFirst = session.exportSnapshot();
  const replay = await session.dispatch(c);
  assert.equal(first.replayed, false);
  assert.equal(replay.replayed, true);
  assert.deepEqual(session.exportSnapshot(), afterFirst);
});

test("A2-005 COMMAND ID REUSE: same id with different action rejects", async () => {
  const session = await emptySession(205, "a2-005");
  await session.dispatch({ type: "player_action", commandId: "same", expectedRevision: 0, actionId: "PA_REST", optionId: "RECOVER" });
  await assert.rejects(
    session.dispatch({ type: "player_action", commandId: "same", expectedRevision: 0, actionId: "PA_TRAIN_EXTRA", optionId: "TECHNIQUE" }),
    error => error?.code === "COMMAND_ID_REUSED"
  );
  assert.equal(session.exportSnapshot().state.playerActions?.history.length, 1);
});

test("A2-006 DOUBLE CLICK: same revision has exactly one winner", async () => {
  const session = await emptySession(206, "a2-006");
  const revision = session.getView().revision;
  const a = { type: "player_action", commandId: "a2-double-a", expectedRevision: revision, actionId: "PA_REST", optionId: "RECOVER" };
  const b = { type: "player_action", commandId: "a2-double-b", expectedRevision: revision, actionId: "PA_TRAIN_EXTRA", optionId: "TECHNIQUE" };
  const results = await Promise.allSettled([session.dispatch(a), session.dispatch(b)]);
  assert.equal(results.filter(row => row.status === "fulfilled").length, 1);
  assert.equal(results.filter(row => row.status === "rejected" && row.reason?.code === "STALE_REVISION").length, 1);
  assert.equal(session.exportSnapshot().state.playerActions?.history.length, 1);
});

test("A2-007 PERSISTENCE: action save/load preserves exact state", async () => {
  const session = await emptySession(207, "a2-007");
  await session.dispatch(command(session, "player_action", { actionId: "PA_TRAIN_EXTRA", optionId: "TECHNIQUE" }));
  const saved = clone(session.exportSnapshot());
  const resumed = await GameSession.resume(clone(saved), { events: [] });
  assert.deepEqual(resumed.exportSnapshot(), saved);
});

test("A2-008 FAILED COMMIT: persistence failure rolls back all Player Action changes", async () => {
  let fail = false;
  const session = await emptySession(208, "a2-008", {
    commit: async () => { if (fail) throw new Error("write failed"); }
  });
  const before = session.exportSnapshot();
  fail = true;
  await assert.rejects(
    session.dispatch(command(session, "player_action", { actionId: "PA_REST", optionId: "RECOVER" })),
    /write failed/
  );
  assert.deepEqual(session.exportSnapshot(), before);
});

test("A2-009 OLD SAVE: save without playerActions resumes without materializing it", async () => {
  const session = await emptySession(209, "a2-009");
  const old = session.exportSnapshot();
  delete old.state.playerActions;
  const resumed = await GameSession.resume(clone(old), { events: [] });
  assert.equal(Object.prototype.hasOwnProperty.call(resumed.exportSnapshot().state, "playerActions"), false);
});

test("A2-010 AUTO RUNNING: action is rejected during auto_simulating", async () => {
  const session = await emptySession(210, "a2-010");
  await session.dispatch(command(session, "auto", { action: "start", maxWeeks: 2 }));
  assert.equal(session.getView().simulation.mode, "auto_simulating");
  const before = session.exportSnapshot();
  await assert.rejects(
    session.dispatch(command(session, "player_action", { actionId: "PA_REST", optionId: "RECOVER" })),
    error => error?.code === "PLAYER_ACTION_STATE"
  );
  assert.deepEqual(session.exportSnapshot(), before);
});

test("A2-011 DECISION: pending narrative decision blocks Player Actions", async () => {
  const event = clone(EVENTS.find(row => row.id === "EVT_18_PRE_001"));
  assert.ok(event);
  const session = await GameSession.create(42, { events: [event], microfeeds: false, sessionId: "a2-011" });
  await session.dispatch(command(session, "continue"));
  assert.equal(session.getView().screen, "decision");
  const before = session.exportSnapshot();
  await assert.rejects(
    session.dispatch(command(session, "player_action", { actionId: "PA_REST", optionId: "RECOVER" })),
    error => error?.code === "PLAYER_ACTION_STATE"
  );
  assert.deepEqual(session.exportSnapshot(), before);
});

test("A2-012 RESULT: pending narrative result blocks Player Actions", async () => {
  const event = clone(EVENTS.find(row => row.id === "EVT_18_PRE_001"));
  assert.ok(event);
  const session = await GameSession.create(42, { events: [event], microfeeds: false, sessionId: "a2-012" });
  await session.dispatch(command(session, "continue"));
  const view = session.getView();
  await session.dispatch(command(session, "choose", {
    pendingInstanceId: view.decision.instanceId,
    choiceId: view.decision.choices[0].id
  }));
  assert.equal(session.getView().screen, "result");
  const before = session.exportSnapshot();
  await assert.rejects(
    session.dispatch(command(session, "player_action", { actionId: "PA_REST", optionId: "RECOVER" })),
    error => error?.code === "PLAYER_ACTION_STATE"
  );
  assert.deepEqual(session.exportSnapshot(), before);
});

test("A2-013 OFFER: pending formal offer blocks Player Actions", async () => {
  const session = await januaryOfferSession();
  assert.equal(session.getView().screen, "offer");
  const before = session.exportSnapshot();
  await assert.rejects(
    session.dispatch(command(session, "player_action", { actionId: "PA_REST", optionId: "RECOVER" })),
    error => error?.code === "PLAYER_ACTION_STATE"
  );
  assert.deepEqual(session.exportSnapshot(), before);
});

test("A2-014 RETIRED: closed career rejects Player Actions", async () => {
  const session = await closedCareerSession();
  const before = session.exportSnapshot();
  await assert.rejects(
    session.dispatch(command(session, "player_action", { actionId: "PA_REST", optionId: "RECOVER" })),
    error => error?.code === "CAREER_CLOSED"
  );
  assert.deepEqual(session.exportSnapshot(), before);
});

test("A2-015 NO WORLD ADVANCE: action changes neither date nor runtime day", async () => {
  const session = await emptySession(215, "a2-015");
  const before = session.exportSnapshot();
  await session.dispatch(command(session, "player_action", { actionId: "PA_REST", optionId: "RECOVER" }));
  const after = session.exportSnapshot();
  assert.equal(after.state.date, before.state.date);
  assert.equal(after.state.runtime.day, before.state.runtime.day);
});

test("A2-016 NO NARRATIVE HISTORY: action does not append state.history", async () => {
  const session = await emptySession(216, "a2-016");
  const before = clone(session.exportSnapshot().state.history);
  await session.dispatch(command(session, "player_action", { actionId: "PA_REST", optionId: "RECOVER" }));
  assert.deepEqual(session.exportSnapshot().state.history, before);
});

test("A2-017 NO PROVENANCE: action does not append decisionProvenance", async () => {
  const session = await emptySession(217, "a2-017");
  const before = clone(session.exportSnapshot().decisionProvenance);
  await session.dispatch(command(session, "player_action", { actionId: "PA_REST", optionId: "RECOVER" }));
  assert.deepEqual(session.exportSnapshot().decisionProvenance, before);
});

test("A2-018 NO RNG: action preserves every RNG stream exactly", async () => {
  const session = await emptySession(218, "a2-018");
  const before = clone(session.exportSnapshot().state.rngState);
  await session.dispatch(command(session, "player_action", { actionId: "PA_TRAIN_EXTRA", optionId: "TECHNIQUE" }));
  assert.deepEqual(session.exportSnapshot().state.rngState, before);
});

test("A2-019 GETVIEW PURE: 100 reads do not mutate snapshot or materialize state", async () => {
  const session = await emptySession(219, "a2-019");
  const before = session.exportSnapshot();
  for (let index = 0; index < 100; index += 1) session.getView();
  assert.deepEqual(session.exportSnapshot(), before);
  assert.equal(Object.prototype.hasOwnProperty.call(session.exportSnapshot().state, "playerActions"), false);
});

test("A2-020 ZERO ACTION REGRESSION: old command path never materializes Player Actions", async () => {
  const session = await emptySession(220, "a2-020");
  for (let index = 0; index < 3; index += 1) {
    await session.dispatch(command(session, "continue", { maxDays: 7 }));
  }
  assert.equal(Object.prototype.hasOwnProperty.call(session.exportSnapshot().state, "playerActions"), false);
});

test("A2-021 AUTO STOP: paused block can exit without day/RNG changes and then execute an action", async () => {
  const session = await emptySession(221, "a2-021");
  await session.dispatch(command(session, "auto", { action: "start", maxWeeks: 2 }));
  await session.dispatch(command(session, "auto", { action: "pause" }));
  const beforeStop = session.exportSnapshot();
  await session.dispatch(command(session, "auto", { action: "stop" }));
  const afterStop = session.exportSnapshot();
  assert.equal(session.getView().simulation.mode, "idle");
  assert.deepEqual(afterStop.state, beforeStop.state);
  assert.deepEqual(afterStop.state.rngState, beforeStop.state.rngState);
  await session.dispatch(command(session, "player_action", { actionId: "PA_REST", optionId: "RECOVER" }));
  assert.equal(session.exportSnapshot().state.playerActions?.history.length, 1);
});

test("A2-022 SAVE VALIDATION: malformed Player Action state is rejected", async () => {
  const session = await emptySession(222, "a2-022");
  const bad = session.exportSnapshot();
  bad.state.playerActions = {
    version: 1,
    sequence: 0,
    history: [],
    cooldowns: { "action:PA_REST": "not-a-date" },
    facts: []
  };
  await assert.rejects(GameSession.resume(bad, { events: [] }));
});

test("A2-023 PUBLIC VIEW: result is visible without leaking internal facts/effects/RNG", async () => {
  const session = await emptySession(223, "a2-023");
  await session.dispatch(command(session, "player_action", { actionId: "PA_REST", optionId: "RECOVER" }));
  const json = JSON.stringify(session.getView().actions);
  assert.match(json, /Reduces carga y recuperas sensaciones/);
  for (const forbidden of ["effectKey", "eligibilityKey", "\"facts\"", "rngState", "source"]) {
    assert.equal(json.includes(forbidden), false, `public actions leaked ${forbidden}`);
  }
});


test("A2-024 PUBLIC TARGET: coach action exposes the authoritative current coach", async () => {
  const session = await emptySession(224, "a2-024");
  const action = session.getView().actions.categories
    .flatMap(category => category.actions)
    .find(candidate => candidate.id === "PA_COACH_TALK");
  assert.ok(action);
  assert.equal(action.targetKind, "coach");
  assert.equal(action.available, true);
  assert.equal(action.targets.length, 1);
  assert.equal(action.targets[0].id, "NPC_CCH_01");
  assert.equal(action.targets[0].label, "Darío Montalbán");
  assert.equal(action.targets[0].available, true);
  assert.equal(action.targets[0].options.every(option => option.available), true);
});

test("A2-025 TARGET EXECUTION: projected targetId executes and exposes target-scoped cooldown", async () => {
  const session = await emptySession(225, "a2-025");
  const before = session.getView();
  const action = before.actions.categories
    .flatMap(category => category.actions)
    .find(candidate => candidate.id === "PA_COACH_TALK");
  const target = action.targets[0];
  await session.dispatch(command(session, "player_action", {
    actionId: action.id,
    optionId: "MORE_MINUTES",
    targetId: target.id
  }));
  const after = session.getView();
  const cooled = after.actions.categories
    .flatMap(category => category.actions)
    .find(candidate => candidate.id === "PA_COACH_TALK")
    .targets.find(candidate => candidate.id === target.id);
  assert.equal(cooled.available, false);
  assert.ok(cooled.cooldownUntil);
  assert.match(cooled.unavailableReason, /Disponible de nuevo/);
});

test("A2-026 PUBLIC HISTORY: sanitized history survives save/load without private causal data", async () => {
  const session = await emptySession(226, "a2-026");
  await session.dispatch(command(session, "player_action", { actionId: "PA_REST", optionId: "RECOVER" }));
  const history = session.getView().actions.history;
  assert.equal(history.length, 1);
  assert.deepEqual(Object.keys(history[0]).sort(), [
    "actionId", "actionLabel", "date", "executionId", "optionLabel", "text"
  ]);
  assert.equal(history[0].actionLabel, "Descansar");
  assert.equal(history[0].optionLabel, "Recuperar");
  const resumed = await GameSession.resume(clone(session.exportSnapshot()), { events: [] });
  assert.deepEqual(resumed.getView().actions.history, history);
  const json = JSON.stringify(resumed.getView().actions);
  for (const forbidden of ["effectKey", "eligibilityKey", "\"facts\"", "\"payload\"", "privateAgenda", "\"knowledge\"", "rngState"]) {
    assert.equal(json.includes(forbidden), false, `public actions leaked ${forbidden}`);
  }
});

test("A2-027 PUBLIC TARGET PURE: repeated target projection is read-only and stale ids fail closed", async () => {
  const session = await emptySession(227, "a2-027");
  const before = session.exportSnapshot();
  for (let index = 0; index < 100; index += 1) session.getView().actions;
  assert.deepEqual(session.exportSnapshot(), before);
  await assert.rejects(
    session.dispatch(command(session, "player_action", {
      actionId: "PA_COACH_TALK",
      optionId: "MORE_MINUTES",
      targetId: "NPC_CCH_02"
    })),
    error => error?.code === "PLAYER_ACTION_TARGET_INVALID"
  );
  assert.deepEqual(session.exportSnapshot(), before);
});
