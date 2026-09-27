import test from "node:test";
import assert from "node:assert/strict";

import { createInitialState } from "../dist/content/initial-state.js";
import { GameSession } from "../dist/session/game-session.js";
import { PLAYER_ACTION_CONTENT_PLAN } from "../dist/player-actions/content-plan.js";
import {
  PLAYER_ACTION_CATALOG,
  PLAYER_ACTION_EFFECT_KEYS,
  executePlayerActionInPlace,
  listPlayerActions
} from "../dist/player-actions/index.js";

const CURRENT_CATEGORIES = new Set([
  "career",
  "training",
  "representative",
  "relationships",
  "image",
  "life"
]);

const clone = value => structuredClone(value);

test("A5-001 UNIQUE IDS", () => {
  const runtimeIds = PLAYER_ACTION_CATALOG.map(action => action.id);
  const planIds = PLAYER_ACTION_CONTENT_PLAN.map(action => action.id);
  assert.equal(new Set(runtimeIds).size, runtimeIds.length);
  assert.equal(new Set(planIds).size, planIds.length);
  assert.equal(PLAYER_ACTION_CONTENT_PLAN.length, 20);
});

test("A5-002 VALID CATEGORIES", () => {
  for (const action of PLAYER_ACTION_CATALOG) {
    assert.ok(CURRENT_CATEGORIES.has(action.category), `invalid category for ${action.id}`);
  }
});

test("A5-003 OPTIONS", () => {
  for (const action of PLAYER_ACTION_CATALOG) {
    assert.ok(action.options.length >= 1, `${action.id} has no executable options`);
    assert.equal(new Set(action.options.map(option => option.id)).size, action.options.length);
  }
});

test("A5-004 VALID EFFECT PATHS / registry only", () => {
  const registered = new Set(PLAYER_ACTION_EFFECT_KEYS);
  for (const action of PLAYER_ACTION_CATALOG) {
    for (const option of action.options) {
      assert.ok(registered.has(option.effectKey), `${action.id}/${option.id} uses unregistered effect ${option.effectKey}`);
    }
  }
});

test("A5-005 VALID INTENTS / A3 handlers only", () => {
  const intended = new Map([
    ["PA_REQUEST_TRANSFER", "request_transfer"],
    ["PA_REQUEST_RENEWAL", "request_renewal"],
    ["PA_AGENT_MARKET", "ask_agent_market"]
  ]);
  for (const [actionId, effectKey] of intended) {
    const action = PLAYER_ACTION_CATALOG.find(row => row.id === actionId);
    assert.ok(action, `missing A3-wired action ${actionId}`);
    assert.equal(action.options.length, 1);
    assert.equal(action.options[0].effectKey, effectKey);
  }
});

test("A5-006 COOLDOWN", () => {
  for (const action of PLAYER_ACTION_CATALOG) {
    assert.ok(Number.isInteger(action.cooldown.days));
    assert.ok(action.cooldown.days >= 0);
    assert.ok(["action", "action_target"].includes(action.cooldown.scope));
    if (action.targetKind !== "none") assert.equal(action.cooldown.scope, "action_target");
  }
});

test("A5-007 TARGET CONTRACT", () => {
  for (const action of PLAYER_ACTION_CATALOG) {
    assert.ok(["none", "coach", "agent", "teammate"].includes(action.targetKind));
    if (action.targetKind === "none") assert.equal(action.cooldown.scope, "action");
  }
  assert.equal(PLAYER_ACTION_CATALOG.find(row => row.id === "PA_COACH_TALK")?.targetKind, "coach");
  assert.equal(PLAYER_ACTION_CATALOG.find(row => row.id === "PA_AGENT_MARKET")?.targetKind, "agent");
});

test("A5-008 NO FORBIDDEN AUTHORITY", () => {
  for (const [actionId, optionId] of [
    ["PA_REQUEST_TRANSFER", "REQUEST"],
    ["PA_REQUEST_RENEWAL", "REQUEST"]
  ]) {
    const state = createInitialState(8508);
    const before = {
      club: state.club,
      contract: clone(state.contract),
      employment: clone(state.employment),
      market: clone(state.market),
      selection: clone(state.selection),
      retirement: clone(state.retirement),
      seeds: clone(state.seeds),
      history: clone(state.history)
    };
    const result = executePlayerActionInPlace(state, { actionId, optionId });
    assert.equal(result.ok, true, `${actionId} should execute`);
    assert.equal(state.club, before.club);
    assert.deepEqual(state.contract, before.contract);
    assert.deepEqual(state.employment, before.employment);
    assert.deepEqual(state.market, before.market);
    assert.deepEqual(state.selection, before.selection);
    assert.deepEqual(state.retirement, before.retirement);
    assert.deepEqual(state.seeds, before.seeds);
    assert.deepEqual(state.history, before.history);
  }
});

test("A5-009 NO NARRATIVE RNG", () => {
  for (const [actionId, optionId] of [
    ["PA_TRAIN_EXTRA", "TECHNIQUE"],
    ["PA_REST", "RECOVER"],
    ["PA_REQUEST_TRANSFER", "REQUEST"],
    ["PA_REQUEST_RENEWAL", "REQUEST"]
  ]) {
    const state = createInitialState(8509);
    const before = clone(state.rngState.narrative);
    const result = executePlayerActionInPlace(state, { actionId, optionId });
    assert.equal(result.ok, true, `${actionId} should execute`);
    assert.deepEqual(state.rngState.narrative, before);
  }
});

test("A5-010 AGE VALIDITY", () => {
  for (const row of PLAYER_ACTION_CONTENT_PLAN) {
    const [minAge, maxAge] = row.ageRange;
    assert.ok(Number.isInteger(minAge) && minAge >= 18, `${row.id} invalid minAge`);
    assert.ok(maxAge === null || (Number.isInteger(maxAge) && maxAge >= minAge), `${row.id} invalid maxAge`);
  }
});

test("A5-011 ZERO ACTION", () => {
  const state = createInitialState(8511);
  const before = clone(state);
  listPlayerActions(state, PLAYER_ACTION_CATALOG);
  assert.deepEqual(state, before);
  assert.equal(Object.prototype.hasOwnProperty.call(state, "playerActions"), false);
});

test("A5-012 PLAYER VIEW", async () => {
  const session = await GameSession.create(8512, {
    events: [],
    microfeeds: false,
    sessionId: "a5-player-view"
  });
  const view = session.getView();
  const projectedIds = new Set(
    (view.actions?.categories ?? []).flatMap(category => category.actions.map(action => action.id))
  );
  for (const action of PLAYER_ACTION_CATALOG) {
    assert.ok(projectedIds.has(action.id), `${action.id} missing from PlayerView.actions`);
  }
});

test("A5-013 COPY BUDGETS", () => {
  for (const action of PLAYER_ACTION_CATALOG) {
    assert.ok(action.label.length <= 42, `${action.id} label too long`);
    assert.ok(action.description.length <= 180, `${action.id} description too long`);
    for (const option of action.options) {
      assert.ok(option.label.length <= 48, `${action.id}/${option.id} option label too long`);
      assert.ok(option.publicResult.length <= 140, `${action.id}/${option.id} public result too long`);
    }
    assert.ok(action.options.length <= 5, `${action.id} has too many options for mobile`);
  }
});

test("A5-014 PLAN/RUNTIME CONTRACT GAPS ARE EXPLICIT", () => {
  const finalCategories = new Set(["career","training","health","representative","relationships","image","life"]);
  for (const row of PLAYER_ACTION_CONTENT_PLAN) {
    assert.ok(finalCategories.has(row.category), `${row.id} invalid planned category`);
    assert.ok(["implemented","blocked"].includes(row.status));
    if (row.status === "blocked") assert.ok(row.blockedBy, `${row.id} missing blocker`);
  }
  assert.ok(PLAYER_ACTION_CONTENT_PLAN.some(row => row.category === "health"));
  const runtimeCategories = new Set(PLAYER_ACTION_CATALOG.map(row => row.category));
  assert.equal(runtimeCategories.has("health"), false, "health must remain explicit gap until A1 contract lands");
});
