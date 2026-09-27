import test from "node:test";
import assert from "node:assert/strict";

import { GameSession } from "../dist/session/game-session.js";
import { EVENTS } from "../dist/content/events/index.js";
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


test("A6-014 TARGETED PUBLIC FLOW: coach action must be reachable from PlayerView when a current coach exists", async () => {
  const session = await emptySession(6014, "a6-target-public-flow");
  const view = session.getView();
  const coachAction = view.actions.categories
    .flatMap(category => category.actions)
    .find(action => action.id === "PA_COACH_TALK");
  assert.ok(coachAction, "PA_COACH_TALK must be present in the public catalog");
  assert.equal(
    coachAction.available,
    true,
    "PA_COACH_TALK is dead in the public flow: target-required availability is projected without a target selector/resolution"
  );
});


test("A6-015 CONTENT RELEASE READINESS: final catalog must be broad, category-complete and non-fixture-only", () => {
  const categories = new Set(PLAYER_ACTION_CATALOG.map(action => action.category));
  const requiredCategories = [
    "career",
    "training",
    "health",
    "representative",
    "relationships",
    "image",
    "life"
  ];
  assert.ok(
    PLAYER_ACTION_CATALOG.length >= 20,
    `release catalog is not A5-complete: expected >=20 actions, got ${PLAYER_ACTION_CATALOG.length}`
  );
  for (const category of requiredCategories) {
    assert.ok(categories.has(category), `release catalog missing category: ${category}`);
  }
  for (const action of PLAYER_ACTION_CATALOG) {
    assert.ok(action.cooldown.days > 0, `release action has non-productive cooldown: ${action.id}`);
  }
});


test("A6-016 DECISION COLLISION: action rendered before a decision loses on stale revision", async () => {
  const event = clone(EVENTS.find(row => row.id === "EVT_18_PRE_001"));
  assert.ok(event);
  const session = await GameSession.create(42, {
    events: [event],
    microfeeds: false,
    sessionId: "a6-decision-collision"
  });
  const rendered = session.getView();
  const staleAction = {
    type: "player_action",
    commandId: "a6-stale-after-decision",
    expectedRevision: rendered.revision,
    actionId: "PA_REST",
    optionId: "RECOVER"
  };
  await session.dispatch({
    type: "continue",
    commandId: "a6-create-decision",
    expectedRevision: rendered.revision
  });
  assert.equal(session.getView().screen, "decision");
  const before = session.exportSnapshot();
  await assert.rejects(
    session.dispatch(staleAction),
    error => error?.code === "STALE_REVISION"
  );
  assert.deepEqual(session.exportSnapshot(), before);
});

test("A6-017 OFFER COLLISION: offer created after render makes old action stale", async () => {
  let proven = false;
  for (let seed = 1; seed <= 80 && !proven; seed += 1) {
    const base = await emptySession(seed, `a6-offer-collision-${seed}`);
    const snapshot = base.exportSnapshot();
    snapshot.state.date = "2027-01-07";
    snapshot.state.runtime.day = 190;
    snapshot.state.runtime.seasonDay = 190;
    snapshot.state.runtime.daysSinceNarrative = 190;
    snapshot.state.sport.roleScore = 18;
    snapshot.state.sport.appearances = 0;
    snapshot.state.flags.OFFICIAL_DEBUT = false;
    snapshot.state.body.risk = 18;
    const session = await GameSession.resume(snapshot, { events: [] });
    const rendered = session.getView();
    const staleAction = {
      type: "player_action",
      commandId: `a6-stale-after-offer-${seed}`,
      expectedRevision: rendered.revision,
      actionId: "PA_REST",
      optionId: "RECOVER"
    };
    await session.dispatch({
      type: "auto",
      commandId: `a6-offer-auto-${seed}`,
      expectedRevision: rendered.revision,
      action: "start",
      maxWeeks: 2
    });
    if (session.getView().screen !== "offer") continue;
    const before = session.exportSnapshot();
    await assert.rejects(
      session.dispatch(staleAction),
      error => error?.code === "STALE_REVISION"
    );
    assert.deepEqual(session.exportSnapshot(), before);
    proven = true;
  }
  assert.equal(proven, true, "no deterministic offer collision seed found");
});

test("A6-018 RETIREMENT COLLISION: career closure after render makes old action stale", async () => {
  const source = await emptySession(6018, "a6-retirement-collision");
  const rendered = source.getView();
  const staleAction = {
    type: "player_action",
    commandId: "a6-stale-after-retirement",
    expectedRevision: rendered.revision,
    actionId: "PA_REST",
    optionId: "RECOVER"
  };
  const closed = source.exportSnapshot();
  closed.revision = rendered.revision + 1;
  closed.state.retirement.status = "closed";
  closed.state.retirement.decidedDate = closed.state.date;
  closed.state.retirement.announcedDate = closed.state.date;
  closed.state.retirement.closedDate = closed.state.date;
  closed.state.retirement.decisionAge = closed.state.age;
  closed.state.retirement.reason = "qa_terminal";
  closed.state.retirement.closureType = "qa_terminal";
  const session = await GameSession.resume(closed, { events: [] });
  const before = session.exportSnapshot();
  await assert.rejects(
    session.dispatch(staleAction),
    error => error?.code === "STALE_REVISION"
  );
  assert.deepEqual(session.exportSnapshot(), before);
});


test("A6-019 NARRATIVE RNG FUTURE: local action does not shift future narrative stream", async () => {
  const source = await GameSession.create(6190, {
    microfeeds: false,
    sessionId: "a6-future-rng"
  });
  const baselineSnapshot = source.exportSnapshot();
  const actionSnapshot = clone(baselineSnapshot);
  const bodyBefore = clone(actionSnapshot.state.body);

  const result = executePlayerActionInPlace(actionSnapshot.state, {
    actionId: "PA_REST",
    optionId: "RECOVER"
  });
  assert.equal(result.ok, true);

  // Neutralize only the legitimate local physical differences from REST.
  actionSnapshot.state.body.fatigue = bodyBefore.fatigue;
  actionSnapshot.state.body.fitness = bodyBefore.fitness;

  const withAction = await GameSession.resume(actionSnapshot);
  const withoutAction = await GameSession.resume(clone(baselineSnapshot));

  const command = {
    type: "continue",
    commandId: "a6-future-rng-continue",
    expectedRevision: 0,
    maxDays: 30
  };
  await withAction.dispatch(clone(command));
  await withoutAction.dispatch(clone(command));

  const a = withAction.exportSnapshot();
  const b = withoutAction.exportSnapshot();
  assert.deepEqual(a.state.rngState.narrative, b.state.rngState.narrative);
  assert.deepEqual(a.state.history, b.state.history);
  assert.deepEqual(a.pendingDecision, b.pendingDecision);
  assert.equal(a.state.date, b.state.date);
});


test("A6-020 SAVE LOAD CONTINUATION: resumed path remains exact after further commands", async () => {
  const left = await emptySession(6020, "a6-save-continuation");
  const right = await emptySession(6020, "a6-save-continuation");

  const action = {
    type: "player_action",
    commandId: "a6-save-cont-action",
    expectedRevision: 0,
    actionId: "PA_TRAIN_EXTRA",
    optionId: "TECHNIQUE"
  };
  await left.dispatch(clone(action));
  await right.dispatch(clone(action));

  const resumed = await GameSession.resume(clone(right.exportSnapshot()), { events: [] });
  assert.deepEqual(resumed.exportSnapshot(), left.exportSnapshot());

  for (let index = 0; index < 8; index += 1) {
    const commandId = `a6-save-cont-${index}`;
    const l = {
      type: "continue",
      commandId,
      expectedRevision: left.getView().revision,
      maxDays: 7
    };
    const r = {
      type: "continue",
      commandId,
      expectedRevision: resumed.getView().revision,
      maxDays: 7
    };
    await left.dispatch(l);
    await resumed.dispatch(r);
    assert.deepEqual(resumed.exportSnapshot(), left.exportSnapshot(), `save/load diverged after continuation ${index}`);
  }
});


test("A6-020 CAUSAL COOLDOWN STRICT: cooldown must outlive inclusive fact relevance", () => {
  const lifecycles = new Map([
    ["PA_COACH_TALK", 30],
    ["PA_REQUEST_TRANSFER", 120],
    ["PA_REQUEST_RENEWAL", 90],
    ["PA_AGENT_MARKET", 30]
  ]);
  for (const [actionId, lifecycleDays] of lifecycles) {
    const action = PLAYER_ACTION_CATALOG.find(row => row.id === actionId);
    assert.ok(action, `missing causal action ${actionId}`);
    assert.ok(
      action.cooldown.days > lifecycleDays,
      `${actionId} cooldown ${action.cooldown.days}d must be > inclusive fact lifecycle ${lifecycleDays}d`
    );
  }
});


test("A6-020 ACTIVE EMPLOYMENT: club-scoped actions fail at eligibility while unattached", async () => {
  const session = await emptySession(6020, "a6-unattached-eligibility");
  const snapshot = session.exportSnapshot();
  const state = snapshot.state;

  state.contract.monthsRemaining = 0;
  state.contract.salaryMonthly = 0;
  state.employment = {
    version: 1,
    status: "unattached",
    since: state.date,
    previous: {
      club: state.club,
      ownerClub: state.professional.ownerClub,
      registrationClub: state.professional.registrationClub,
      salaryMonthly: 0,
      endedDate: state.date,
      reason: "contract_expired"
    }
  };

  const transfer = definition("PA_REQUEST_TRANSFER");
  const renewal = definition("PA_REQUEST_RENEWAL");
  assert.equal(
    evaluatePlayerAction(state, transfer).available,
    false,
    "transfer request must not be advertised while unattached"
  );
  assert.equal(
    evaluatePlayerAction(state, renewal).available,
    false,
    "renewal request must not be advertised while unattached"
  );

  const transferBefore = structuredClone(state);
  const transferResult = executePlayerActionInPlace(state, {
    actionId: "PA_REQUEST_TRANSFER",
    optionId: "REQUEST"
  });
  assert.equal(transferResult.ok, false);
  assert.equal(
    transferResult.code,
    "PLAYER_ACTION_UNAVAILABLE",
    "unattached transfer must fail in eligibility, not inside effect execution"
  );
  assert.deepEqual(state, transferBefore);

  const coach = definition("PA_COACH_TALK");
  const projectedCoach = evaluatePlayerAction(state, coach, "NPC_CCH_01");
  assert.equal(
    projectedCoach.available,
    false,
    "coach conversation must fail closed when no active club employment exists"
  );
});
