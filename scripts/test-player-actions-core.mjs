import test from "node:test";
import assert from "node:assert/strict";

import { createInitialState } from "../dist/content/initial-state.js";
import {
  PLAYER_ACTION_CATALOG,
  evaluatePlayerAction,
  executePlayerActionInPlace,
  getAvailablePlayerActions,
  getPlayerActionFacts,
  inspectPlayerActionState,
  isPlayerActionAvailable
} from "../dist/player-actions/index.js";

const COACH = "NPC_CCH_01";

function clone(value) {
  return structuredClone(value);
}

function addDays(iso, days) {
  const date = new Date(`${iso}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function definition(id) {
  const found = PLAYER_ACTION_CATALOG.find(action => action.id === id);
  assert.ok(found, `missing fixture action ${id}`);
  return found;
}

test("A1-001 READ ONLY ELIGIBILITY: 100 reads leave state byte-equivalent", () => {
  const state = createInitialState(101);
  const before = clone(state);
  for (let index = 0; index < 100; index += 1) {
    getAvailablePlayerActions(state, PLAYER_ACTION_CATALOG, { PA_COACH_TALK: COACH });
  }
  assert.deepEqual(state, before);
});

test("A1-002 ZERO ACTION: importing and initializing does not materialize PlayerActionState", () => {
  const state = createInitialState(102);
  assert.equal(Object.prototype.hasOwnProperty.call(state, "playerActions"), false);
  assert.equal(state.playerActions, undefined);
});

test("A1-003 EXECUTION: valid training applies only bounded effect + own state", () => {
  const state = createInitialState(103);
  const narrativeBefore = clone(state.rngState.narrative);
  const historyBefore = clone(state.history);
  const seedsBefore = clone(state.seeds);
  const contractBefore = clone(state.contract);
  const marketBefore = clone(state.market);
  const clubBefore = state.club;
  const nationalRoleBefore = state.professional.nationalRole;
  const fatigueBefore = state.body.fatigue;
  const riskBefore = state.body.risk;
  const techniqueBefore = state.professional.technique;

  const result = executePlayerActionInPlace(state, {
    actionId: "PA_TRAIN_EXTRA",
    optionId: "TECHNIQUE"
  });

  assert.equal(result.ok, true);
  assert.equal(state.body.fatigue, fatigueBefore + 3);
  assert.equal(state.body.risk, riskBefore + 1);
  assert.equal(state.professional.technique, techniqueBefore + 0.15);
  assert.equal(state.playerActions?.history.length, 1);
  assert.equal(state.playerActions?.facts.length, 1);
  assert.equal(Object.keys(state.playerActions?.cooldowns ?? {}).length, 2);
  assert.ok(state.playerActions?.cooldowns["action:PA_TRAIN_EXTRA"]);
  assert.ok(state.playerActions?.cooldowns["group:extra_development"]);
  assert.deepEqual(state.rngState.narrative, narrativeBefore);
  assert.deepEqual(state.history, historyBefore);
  assert.deepEqual(state.seeds, seedsBefore);
  assert.deepEqual(state.contract, contractBefore);
  assert.deepEqual(state.market, marketBefore);
  assert.equal(state.club, clubBefore);
  assert.equal(state.professional.nationalRole, nationalRoleBefore);
});

test("A1-004 INVALID ACTION: unknown id rejects with identical state", () => {
  const state = createInitialState(104);
  const before = clone(state);
  const result = executePlayerActionInPlace(state, { actionId: "PA_UNKNOWN", optionId: "X" });
  assert.equal(result.ok, false);
  assert.equal(result.code, "PLAYER_ACTION_UNKNOWN");
  assert.deepEqual(state, before);
});

test("A1-005 INVALID OPTION: unknown option rejects with identical state", () => {
  const state = createInitialState(105);
  const before = clone(state);
  const result = executePlayerActionInPlace(state, { actionId: "PA_REST", optionId: "NOPE" });
  assert.equal(result.ok, false);
  assert.equal(result.code, "PLAYER_ACTION_OPTION_UNKNOWN");
  assert.deepEqual(state, before);
});

test("A1-006 INVALID TARGET: non-coach target rejects closed", () => {
  const state = createInitialState(106);
  const before = clone(state);
  const result = executePlayerActionInPlace(state, {
    actionId: "PA_COACH_TALK",
    optionId: "MORE_MINUTES",
    targetId: "NPC_DOES_NOT_EXIST"
  });
  assert.equal(result.ok, false);
  assert.equal(result.code, "PLAYER_ACTION_TARGET_INVALID");
  assert.deepEqual(state, before);
});

test("A1-007 COOLDOWN: immediate repeat rejects without second mutation", () => {
  const state = createInitialState(107);
  state.body.fatigue = 30;
  const first = executePlayerActionInPlace(state, { actionId: "PA_REST", optionId: "RECOVER" });
  assert.equal(first.ok, true);
  const afterFirst = clone(state);
  const second = executePlayerActionInPlace(state, { actionId: "PA_REST", optionId: "RECOVER" });
  assert.equal(second.ok, false);
  assert.equal(second.code, "PLAYER_ACTION_COOLDOWN");
  assert.deepEqual(state, afterFirst);
});

test("A1-008 COOLDOWN EXPIRY: action is available exactly on cooldownUntil", () => {
  const state = createInitialState(108);
  state.body.fatigue = 30;
  const first = executePlayerActionInPlace(state, { actionId: "PA_REST", optionId: "RECOVER" });
  assert.equal(first.ok, true);
  assert.ok(first.cooldownUntil);
  state.date = first.cooldownUntil;
  assert.equal(isPlayerActionAvailable(state, definition("PA_REST")), true);
});

test("A1-009 NARRATIVE RNG: deterministic action never changes narrative stream", () => {
  const state = createInitialState(109);
  state.body.fatigue = 30;
  const before = clone(state.rngState.narrative);
  const result = executePlayerActionInPlace(state, { actionId: "PA_REST", optionId: "RECOVER" });
  assert.equal(result.ok, true);
  assert.deepEqual(state.rngState.narrative, before);
});

test("A1-010 HISTORY SEPARATION: Player Action never appends state.history", () => {
  const state = createInitialState(110);
  const before = clone(state.history);
  const result = executePlayerActionInPlace(state, {
    actionId: "PA_COACH_TALK",
    optionId: "MORE_MINUTES",
    targetId: COACH
  });
  assert.equal(result.ok, true);
  assert.deepEqual(state.history, before);
  assert.equal(state.playerActions?.history.length, 1);
});

test("A1-011 AUTHORITY GUARD: arbitrary club/contract/national writes have no registered effect", () => {
  for (const effectKey of ["club", "contract.salaryMonthly", "professional.nationalRole"]) {
    const state = createInitialState(111);
    const before = clone(state);
    const malicious = [{
      id: `PA_MALICIOUS_${effectKey}`,
      category: "career",
      label: "malicious",
      description: "test only",
      targetKind: "none",
      cooldown: { scope: "action", days: 1 },
      eligibilityKey: "active_career",
      options: [{ id: "RUN", label: "run", effectKey, publicResult: "never" }]
    }];
    const result = executePlayerActionInPlace(
      state,
      { actionId: malicious[0].id, optionId: "RUN" },
      malicious
    );
    assert.equal(result.ok, false);
    assert.equal(result.code, "PLAYER_ACTION_EFFECT_FORBIDDEN");
    assert.deepEqual(state, before);
  }
});

test("A1-012 ATOMIC FAILURE: failure after a valid draft effect leaves confirmed state intact", () => {
  const state = createInitialState(112);
  state.body.fatigue = 30;
  // Deliberately malformed pre-existing PA store. The direct REST effect is valid
  // and mutates only the cloned draft; post-effect store validation must then fail.
  state.playerActions = {
    version: 1,
    sequence: 5,
    history: [],
    cooldowns: {},
    facts: []
  };
  const before = clone(state);
  const result = executePlayerActionInPlace(state, {
    actionId: "PA_REST",
    optionId: "RECOVER"
  });
  assert.equal(result.ok, false);
  assert.equal(result.code, "PLAYER_ACTION_STATE_INVALID");
  assert.deepEqual(state, before);
});

test("A1-013 DETERMINISM: identical states + request produce identical outputs", () => {
  const left = createInitialState(113);
  const right = clone(left);
  const request = {
    actionId: "PA_COACH_TALK",
    optionId: "MORE_MINUTES",
    targetId: COACH
  };
  const leftResult = executePlayerActionInPlace(left, request);
  const rightResult = executePlayerActionInPlace(right, request);
  assert.deepEqual(leftResult, rightResult);
  assert.deepEqual(left, right);
});

test("A1-014 OPTIONALITY: reads without execution create no store, flags, costs or cooldowns", () => {
  const state = createInitialState(114);
  const before = clone(state);
  getAvailablePlayerActions(state, PLAYER_ACTION_CATALOG, { PA_COACH_TALK: COACH });
  assert.deepEqual(state, before);
  assert.equal(Object.prototype.hasOwnProperty.call(state, "playerActions"), false);
});

test("A0 PA-014 FACT EXPIRY READ: expired facts disappear from active projection without cleanup write", () => {
  const state = createInitialState(115);
  const result = executePlayerActionInPlace(state, {
    actionId: "PA_COACH_TALK",
    optionId: "MORE_MINUTES",
    targetId: COACH
  });
  assert.equal(result.ok, true);
  const stored = clone(state.playerActions);
  assert.equal(getPlayerActionFacts(state, { activeOnly: true, kind: "request_more_minutes" }).length, 1);
  state.date = addDays(state.date, 31);
  assert.equal(getPlayerActionFacts(state, { activeOnly: true, kind: "request_more_minutes" }).length, 0);
  assert.deepEqual(state.playerActions, stored);
});


function syntheticDefinition({
  id,
  category = "career",
  targetKind = "none",
  effectKey = "rest",
  eligibility = [],
  cooldownDays = 0,
  cooldownGroup
}) {
  return {
    id,
    category,
    label: id,
    description: "QA synthetic Player Action",
    targetKind,
    cooldown: { scope: targetKind === "none" ? "action" : "action_target", days: cooldownDays },
    ...(cooldownGroup ? { cooldownGroup } : {}),
    eligibilityKey: "active_career",
    eligibility,
    options: [{ id: "RUN", label: "Run", effectKey, publicResult: "ok" }]
  };
}

test("A1-015 HEALTH CATEGORY: core accepts a health action without special UI logic", () => {
  const state = createInitialState(116);
  const action = syntheticDefinition({
    id: "PA_QA_HEALTH",
    category: "health",
    eligibility: [{ kind: "active_career" }]
  });
  const before = clone(state);
  assert.equal(evaluatePlayerAction(state, action).available, true);
  assert.deepEqual(state, before);
});

test("A1-016 ACTIVE EMPLOYMENT: unattached club action fails before effect execution", () => {
  const state = createInitialState(117);
  state.employment = { version: 1, status: "unattached", since: state.date, previous: null };
  const action = syntheticDefinition({
    id: "PA_QA_TRANSFER",
    effectKey: "request_transfer",
    eligibility: [
      { kind: "active_career" },
      { kind: "active_club_employment" }
    ]
  });
  const before = clone(state);
  const result = executePlayerActionInPlace(state, { actionId: action.id, optionId: "RUN" }, [action]);
  assert.equal(result.ok, false);
  assert.equal(result.code, "PLAYER_ACTION_UNAVAILABLE");
  assert.match(result.message, /club actual/i);
  assert.deepEqual(state, before);
});

test("A1-017 CONTRACT WINDOW: renewal eligibility is inclusive at 1..24 months", () => {
  const action = syntheticDefinition({
    id: "PA_QA_RENEWAL",
    effectKey: "request_renewal",
    eligibility: [
      { kind: "active_career" },
      { kind: "active_club_employment" },
      { kind: "contract_months", min: 1, max: 24 }
    ]
  });

  for (const [months, expected] of [[0, false], [1, true], [24, true], [25, false]]) {
    const state = createInitialState(118 + months);
    state.contract.monthsRemaining = months;
    const before = clone(state);
    assert.equal(evaluatePlayerAction(state, action).available, expected, `months=${months}`);
    assert.deepEqual(state, before);
  }
});

test("A1-018 AGE AND BODY PREDICATES: boundaries are deterministic and read-only", () => {
  const action = syntheticDefinition({
    id: "PA_QA_CONTEXT",
    eligibility: [
      { kind: "active_career" },
      { kind: "age_range", min: 18, max: 23 },
      { kind: "fatigue_max", value: 55 },
      { kind: "risk_max", value: 40 }
    ]
  });
  const state = createInitialState(150);
  state.age = 23;
  state.body.fatigue = 55;
  state.body.risk = 40;
  let before = clone(state);
  assert.equal(evaluatePlayerAction(state, action).available, true);
  assert.deepEqual(state, before);

  state.age = 24;
  before = clone(state);
  assert.equal(evaluatePlayerAction(state, action).available, false);
  assert.deepEqual(state, before);
});

test("A1-019 LIVE TRANSFER REQUEST: request context closes immediately after fact creation", () => {
  const action = syntheticDefinition({
    id: "PA_QA_TRANSFER_LIFECYCLE",
    effectKey: "request_transfer",
    eligibility: [
      { kind: "active_career" },
      { kind: "active_club_employment" },
      { kind: "live_transfer_request", required: false }
    ]
  });
  const state = createInitialState(151);
  assert.equal(evaluatePlayerAction(state, action).available, true);
  const result = executePlayerActionInPlace(state, { actionId: action.id, optionId: "RUN" }, [action]);
  assert.equal(result.ok, true);
  assert.equal(evaluatePlayerAction(state, action).available, false);
});

test("A1-020 TEAMMATE PROFILE: locker leader profile fails closed without explicit registry", () => {
  const state = createInitialState(152);
  const action = syntheticDefinition({
    id: "PA_QA_VETERAN",
    targetKind: "teammate",
    eligibility: [
      { kind: "active_career" },
      { kind: "current_teammate" },
      { kind: "teammate_profile", profile: "locker_leader" }
    ]
  });
  const before = clone(state);
  const availability = evaluatePlayerAction(state, action, "NPC_PLR_10");
  assert.equal(availability.available, false);
  assert.match(availability.unavailableReason, /objetivo válido/i);
  assert.deepEqual(state, before);
});


test("A1-021 RISK MIN: recovery-style gate opens only at the configured boundary", () => {
  const action = syntheticDefinition({
    id: "PA_QA_RECOVERY_RISK",
    category: "health",
    eligibility: [
      { kind: "active_career" },
      { kind: "age_range", min: 18 },
      { kind: "risk_min", value: 28 }
    ]
  });
  const state = createInitialState(153);
  state.body.risk = 27;
  let before = clone(state);
  assert.equal(evaluatePlayerAction(state, action).available, false);
  assert.deepEqual(state, before);

  state.body.risk = 28;
  before = clone(state);
  assert.equal(evaluatePlayerAction(state, action).available, true);
  assert.deepEqual(state, before);
});


test("A1-022 GROUP COOLDOWN: family block is additive and does not replace action cooldown", () => {
  const state = createInitialState(154);
  const started = state.date;
  const first = syntheticDefinition({
    id: "PA_QA_GROUP_A",
    cooldownDays: 21,
    cooldownGroup: { id: "physical_recovery", days: 7 }
  });
  const second = syntheticDefinition({
    id: "PA_QA_GROUP_B",
    cooldownDays: 14,
    cooldownGroup: { id: "physical_recovery", days: 7 }
  });
  const unrelated = syntheticDefinition({
    id: "PA_QA_GROUP_C",
    cooldownDays: 14,
    cooldownGroup: { id: "public_image", days: 7 }
  });
  const catalog = [first, second, unrelated];

  const result = executePlayerActionInPlace(
    state,
    { actionId: first.id, optionId: "RUN" },
    catalog
  );
  assert.equal(result.ok, true);
  assert.equal(result.cooldownUntil, addDays(started, 21));
  assert.equal(state.playerActions?.cooldowns[`action:${first.id}`], addDays(started, 21));
  assert.equal(state.playerActions?.cooldowns["group:physical_recovery"], addDays(started, 7));
  assert.equal(inspectPlayerActionState(state.playerActions, state.date), null);

  const siblingBlocked = evaluatePlayerAction(state, second);
  assert.equal(siblingBlocked.available, false);
  assert.equal(siblingBlocked.cooldownUntil, addDays(started, 7));
  assert.equal(evaluatePlayerAction(state, unrelated).available, true);

  state.date = addDays(started, 7);
  assert.equal(evaluatePlayerAction(state, second).available, true);
  const originalStillBlocked = evaluatePlayerAction(state, first);
  assert.equal(originalStillBlocked.available, false);
  assert.equal(originalStillBlocked.cooldownUntil, addDays(started, 21));
});

test("A1-023 GROUP TARGET FARMING: switching teammate cannot bypass family cooldown", () => {
  const state = createInitialState(155);
  const started = state.date;
  const action = syntheticDefinition({
    id: "PA_QA_TEAMMATE_FAMILY",
    targetKind: "teammate",
    cooldownDays: 30,
    cooldownGroup: { id: "teammate_interaction", days: 7 }
  });

  const first = executePlayerActionInPlace(
    state,
    { actionId: action.id, optionId: "RUN", targetId: "NPC_PLR_10" },
    [action]
  );
  assert.equal(first.ok, true);
  assert.equal(state.playerActions?.cooldowns[`action_target:${action.id}:NPC_PLR_10`], addDays(started, 30));
  assert.equal(state.playerActions?.cooldowns["group:teammate_interaction"], addDays(started, 7));

  const alternateTarget = evaluatePlayerAction(state, action, "NPC_PLR_11");
  assert.equal(alternateTarget.available, false);
  assert.equal(alternateTarget.cooldownUntil, addDays(started, 7));

  state.date = addDays(started, 7);
  assert.equal(evaluatePlayerAction(state, action, "NPC_PLR_11").available, true);
  assert.equal(evaluatePlayerAction(state, action, "NPC_PLR_10").available, false);
});

test("A1-024 GROUP CONFIG: malformed shared cooldown fails closed without mutation", () => {
  const state = createInitialState(156);
  const before = clone(state);
  const action = syntheticDefinition({
    id: "PA_QA_BAD_GROUP",
    cooldownDays: 1,
    cooldownGroup: { id: "bad:group", days: 7 }
  });

  const result = executePlayerActionInPlace(
    state,
    { actionId: action.id, optionId: "RUN" },
    [action]
  );
  assert.equal(result.ok, false);
  assert.equal(result.code, "PLAYER_ACTION_STATE_INVALID");
  assert.deepEqual(state, before);
});
