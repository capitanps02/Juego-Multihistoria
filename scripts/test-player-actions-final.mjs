import test from "node:test";
import assert from "node:assert/strict";

import { GameSession } from "../dist/session/game-session.js";
import {
  PLAYER_ACTION_CATALOG,
  addPlayerActionDays,
  evaluatePlayerAction,
  executePlayerActionInPlace,
  getPlayerActionFacts,
  listPlayerActions
} from "../dist/player-actions/index.js";

const clone = value => structuredClone(value);

async function emptySession(seed, sessionId = `a6-${seed}`, extra = {}) {
  return GameSession.create(seed, { events: [], microfeeds: false, sessionId, ...extra });
}

function fixedCommand(session, commandId, type, extra = {}) {
  return {
    type,
    commandId,
    expectedRevision: session.getView().revision,
    ...extra
  };
}

function definition(id) {
  const row = PLAYER_ACTION_CATALOG.find(action => action.id === id);
  assert.ok(row, `Missing Player Action definition: ${id}`);
  return row;
}

function authoritySnapshot(state) {
  return {
    club: state.club,
    ownerClub: state.professional?.ownerClub,
    registrationClub: state.professional?.registrationClub,
    contract: clone(state.contract),
    market: clone(state.market),
    nationalCaps: state.professional?.nationalCaps,
    nationalRole: state.professional?.nationalRole,
    appearances: state.sport?.appearances,
    roleScore: state.sport?.roleScore,
    retirement: clone(state.retirement),
    history: clone(state.history)
  };
}

test("A6-001 GETVIEW PURITY: 1000 reads are byte-stable and keep store lazy", async () => {
  const session = await emptySession(6001, "a6-getview-purity");
  const before = session.exportSnapshot();
  for (let index = 0; index < 1000; index += 1) session.getView();
  assert.deepEqual(session.exportSnapshot(), before);
  assert.equal(Object.prototype.hasOwnProperty.call(session.exportSnapshot().state, "playerActions"), false);
});

test("A6-002 ACTION READ PURITY: availability/facts reads do not mutate state", async () => {
  const session = await emptySession(6002, "a6-read-purity");
  const state = session.exportSnapshot().state;
  const before = clone(state);
  const rest = definition("PA_REST");
  for (let index = 0; index < 1000; index += 1) {
    listPlayerActions(state);
    evaluatePlayerAction(state, rest);
    getPlayerActionFacts(state, { activeOnly: true });
  }
  assert.deepEqual(state, before);
});

test("A6-003 DETERMINISM: same seed + same commands + same actions => exact snapshot", async () => {
  const left = await emptySession(6003, "a6-determinism");
  const right = await emptySession(6003, "a6-determinism");
  const steps = [
    ["pa-rest-1", "player_action", { actionId: "PA_REST", optionId: "RECOVER" }],
    ["advance-1", "continue", { maxDays: 7 }],
    ["pa-train-1", "player_action", { actionId: "PA_TRAIN_EXTRA", optionId: "TECHNIQUE" }],
    ["advance-2", "continue", { maxDays: 14 }],
    ["pa-rest-2", "player_action", { actionId: "PA_REST", optionId: "RECOVER" }]
  ];
  for (const [id, type, extra] of steps) {
    const l = fixedCommand(left, id, type, extra);
    const r = fixedCommand(right, id, type, extra);
    await left.dispatch(l);
    await right.dispatch(r);
    assert.deepEqual(left.exportSnapshot(), right.exportSnapshot(), `determinism diverged after ${id}`);
  }
});

test("A6-004 RNG GATE: deterministic actions preserve all RNG streams immediately", async () => {
  for (const [seed, actionId, optionId] of [
    [6101, "PA_REST", "RECOVER"],
    [6102, "PA_TRAIN_EXTRA", "TECHNIQUE"]
  ]) {
    const session = await emptySession(seed, `a6-rng-${actionId}`);
    const before = clone(session.exportSnapshot().state.rngState);
    await session.dispatch(fixedCommand(session, `rng-${actionId}`, "player_action", { actionId, optionId }));
    assert.deepEqual(session.exportSnapshot().state.rngState, before);
  }
});

test("A6-005 CONCURRENCY: 20 same-revision clicks produce one commit and 19 stale revisions", async () => {
  const session = await emptySession(6005, "a6-concurrency");
  const expectedRevision = session.getView().revision;
  const commands = Array.from({ length: 20 }, (_, index) => ({
    type: "player_action",
    commandId: `a6-click-${index}`,
    expectedRevision,
    actionId: index % 2 === 0 ? "PA_REST" : "PA_TRAIN_EXTRA",
    optionId: index % 2 === 0 ? "RECOVER" : "TECHNIQUE"
  }));
  const results = await Promise.allSettled(commands.map(command => session.dispatch(command)));
  assert.equal(results.filter(row => row.status === "fulfilled").length, 1);
  assert.equal(
    results.filter(row => row.status === "rejected" && row.reason?.code === "STALE_REVISION").length,
    19
  );
  assert.equal(session.exportSnapshot().state.playerActions?.history.length, 1);
  assert.equal(session.exportSnapshot().revision, 1);
});

test("A6-006 REPLAY: confirmed command replays without duplicate state", async () => {
  const session = await emptySession(6006, "a6-replay");
  const command = {
    type: "player_action",
    commandId: "a6-replay-command",
    expectedRevision: 0,
    actionId: "PA_REST",
    optionId: "RECOVER"
  };
  const first = await session.dispatch(command);
  const confirmed = session.exportSnapshot();
  const replay = await session.dispatch(command);
  assert.equal(first.replayed, false);
  assert.equal(replay.replayed, true);
  assert.deepEqual(session.exportSnapshot(), confirmed);
});

test("A6-007 PERSISTENCE FAILURE: failed commit is total rollback", async () => {
  let fail = false;
  const session = await emptySession(6007, "a6-rollback", {
    commit: async () => {
      if (fail) throw new Error("A6 injected commit failure");
    }
  });
  const before = session.exportSnapshot();
  fail = true;
  await assert.rejects(
    session.dispatch(fixedCommand(session, "a6-failed-commit", "player_action", {
      actionId: "PA_TRAIN_EXTRA",
      optionId: "TECHNIQUE"
    })),
    /A6 injected commit failure/
  );
  assert.deepEqual(session.exportSnapshot(), before);
});

test("A6-008 LEGACY SAVE: missing playerActions remains absent through resume/read and can later materialize", async () => {
  const source = await emptySession(6008, "a6-legacy-save");
  const legacy = source.exportSnapshot();
  delete legacy.state.playerActions;
  const resumed = await GameSession.resume(clone(legacy), { events: [] });
  for (let index = 0; index < 100; index += 1) resumed.getView();
  assert.equal(Object.prototype.hasOwnProperty.call(resumed.exportSnapshot().state, "playerActions"), false);
  await resumed.dispatch(fixedCommand(resumed, "a6-legacy-first-action", "player_action", {
    actionId: "PA_REST",
    optionId: "RECOVER"
  }));
  assert.equal(resumed.exportSnapshot().state.playerActions?.history.length, 1);
});

test("A6-009 MALFORMED SAVE MATRIX: corrupt stores fail closed", async () => {
  const source = await emptySession(6009, "a6-malformed");
  const base = source.exportSnapshot();
  const cases = [
    store => { store.cooldowns = { "action:PA_REST": "not-a-date" }; },
    store => { store.sequence = 1; },
    store => {
      store.sequence = 1;
      store.history = [{
        executionId: "PAE-00000001",
        sequence: 1,
        actionId: "",
        optionId: "RECOVER",
        date: base.state.date,
        runtimeDay: base.state.runtime.day,
        visibleResult: "x",
        cooldownUntil: null
      }];
    },
    store => {
      store.sequence = 0;
      store.facts = [{
        factId: "F1",
        kind: "unknown_kind",
        createdDate: base.state.date,
        source: { kind: "player_action", executionId: "X", actionId: "X", optionId: "X" },
        payload: {}
      }];
    },
    store => { store.cooldowns = { "action:PA_REST": "2025-99-99" }; }
  ];
  for (const mutate of cases) {
    const bad = clone(base);
    bad.state.playerActions = { version: 1, sequence: 0, history: [], cooldowns: {}, facts: [] };
    mutate(bad.state.playerActions);
    await assert.rejects(GameSession.resume(bad, { events: [] }));
  }
});

test("A6-010 COOLDOWN BOUNDARY: day 0 and N-1 blocked, day N allowed; calendar rollover is UTC-safe", async () => {
  const session = await emptySession(6010, "a6-cooldown");
  const state = session.exportSnapshot().state;
  const executedDate = state.date;
  const result = executePlayerActionInPlace(state, { actionId: "PA_TRAIN_EXTRA", optionId: "TECHNIQUE" });
  assert.equal(result.ok, true);
  const train = definition("PA_TRAIN_EXTRA");
  const until = state.playerActions?.history.at(-1)?.cooldownUntil;
  assert.ok(until);
  assert.equal(evaluatePlayerAction(state, train).available, false, "day 0 must be blocked");
  state.date = addPlayerActionDays(executedDate, 6);
  assert.equal(evaluatePlayerAction(state, train).available, false, "N-1 must be blocked");
  state.date = until;
  assert.equal(evaluatePlayerAction(state, train).available, true, "day N must be available");
  assert.equal(addPlayerActionDays("2026-12-31", 1), "2027-01-01");
  assert.equal(addPlayerActionDays("2028-02-28", 1), "2028-02-29");
});

test("A6-011 AUTHORITY: fixture actions cannot mutate protected world/contract/market/national/retirement authority", async () => {
  for (const [seed, actionId, optionId, targetId] of [
    [6201, "PA_REST", "RECOVER", undefined],
    [6202, "PA_TRAIN_EXTRA", "TECHNIQUE", undefined],
    [6203, "PA_COACH_TALK", "MORE_MINUTES", "NPC_CCH_01"]
  ]) {
    const session = await emptySession(seed, `a6-authority-${actionId}`);
    const state = session.exportSnapshot().state;
    const before = authoritySnapshot(state);
    const result = executePlayerActionInPlace(state, {
      actionId,
      optionId,
      ...(targetId ? { targetId } : {})
    });
    assert.equal(result.ok, true, `${actionId} fixture should execute for authority test`);
    assert.deepEqual(authoritySnapshot(state), before, `${actionId} mutated protected authority`);
    if (actionId === "PA_COACH_TALK") {
      const facts = getPlayerActionFacts(state, { kind: "request_more_minutes" });
      assert.equal(facts.length, 1);
      assert.equal(facts[0].targetId, targetId);
    }
  }
});

test("A6-012 AUTHORITY ADVERSARIAL: unknown effect key fails without mutation", async () => {
  const session = await emptySession(6012, "a6-malicious-effect");
  const state = session.exportSnapshot().state;
  const before = clone(state);
  const maliciousCatalog = [{
    id: "PA_MALICIOUS",
    category: "career",
    label: "Malicious",
    description: "QA only",
    targetKind: "none",
    cooldown: { scope: "action", days: 0 },
    eligibilityKey: "active_career",
    options: [{
      id: "DO_IT",
      label: "Do it",
      effectKey: "set_contract_salary",
      publicResult: "should never happen"
    }]
  }];
  const result = executePlayerActionInPlace(state, {
    actionId: "PA_MALICIOUS",
    optionId: "DO_IT"
  }, maliciousCatalog);
  assert.equal(result.ok, false);
  assert.equal(result.code, "PLAYER_ACTION_EFFECT_FORBIDDEN");
  assert.deepEqual(state, before);
});

test("A6-013 CONTENT INVENTORY: current A1 fixture catalog is explicit and duplicate-free", () => {
  const ids = PLAYER_ACTION_CATALOG.map(row => row.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const action of PLAYER_ACTION_CATALOG) {
    assert.ok(Number.isInteger(action.cooldown.days) && action.cooldown.days >= 0);
    assert.ok(action.options.length > 0);
    assert.equal(new Set(action.options.map(option => option.id)).size, action.options.length);
  }
  console.log(JSON.stringify({
    totalActions: PLAYER_ACTION_CATALOG.length,
    categories: [...new Set(PLAYER_ACTION_CATALOG.map(row => row.category))].sort(),
    ids
  }));
});
