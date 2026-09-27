import test from "node:test";
import assert from "node:assert/strict";

import { createInitialState } from "../dist/content/initial-state.js";
import {
  PLAYER_ACTION_EFFECT_KEYS,
  applyPlayerActionEffect,
  hasPlayerActionEffect
} from "../dist/player-actions/index.js";

const TEAMMATE = "NPC_PLR_10";
const TENSE_TEAMMATE = "NPC_PLR_15";

const V1_EFFECT_KEYS = [
  "coach_request_more_minutes",
  "coach_request_feedback",
  "coach_acknowledge_role",
  "query_role_status",
  "request_position_change",
  "request_transfer",
  "withdraw_transfer_request",
  "train_extra",
  "train_extra_physical",
  "train_extra_tactical",
  "video_study",
  "recovery_session",
  "rest",
  "ask_agent_market",
  "request_renewal",
  "career_priority_minutes",
  "career_priority_salary",
  "career_priority_stability",
  "career_priority_club_level",
  "teammate_connect",
  "teammate_clear_air",
  "leader_advice",
  "mentor_teammate",
  "interview_humble",
  "interview_ambitious",
  "interview_team_first",
  "social_post_professional",
  "social_post_personal",
  "personal_time_people",
  "personal_time_hobby",
  "disconnect"
];

const clone = value => structuredClone(value);

function relationship(state, npcId) {
  const row = state.relationships.find(candidate => candidate.npcId === npcId);
  assert.ok(row, `missing relationship ${npcId}`);
  return row;
}

test("A1-025 V1 EFFECT REGISTRY: all 31 certified option handlers are closed and registered", () => {
  assert.equal(V1_EFFECT_KEYS.length, 31);
  assert.equal(new Set(V1_EFFECT_KEYS).size, 31);
  for (const key of V1_EFFECT_KEYS) assert.equal(hasPlayerActionEffect(key), true, `missing ${key}`);
  assert.equal(PLAYER_ACTION_EFFECT_KEYS.includes("contract.salaryMonthly"), false);
  assert.equal(PLAYER_ACTION_EFFECT_KEYS.includes("club"), false);
});

test("A1-026 TRAINING VARIANTS: exact A5 deltas and fact focus are preserved", () => {
  {
    const state = createInitialState(1261);
    const facts = applyPlayerActionEffect(state, "train_extra");
    assert.equal(state.professional.technique, 62.15);
    assert.equal(state.body.fatigue, 15);
    assert.equal(state.body.risk, 19);
    assert.equal(facts[0]?.kind, "training_extra_completed");
    assert.equal(facts[0]?.payload.focus, "technique");
  }
  {
    const state = createInitialState(1262);
    const facts = applyPlayerActionEffect(state, "train_extra_physical");
    assert.equal(state.professional.matchEndurance, 78.15);
    assert.equal(state.body.fitness, 78.5);
    assert.equal(state.body.fatigue, 16);
    assert.equal(state.body.risk, 20);
    assert.equal(facts[0]?.payload.focus, "physical");
  }
  {
    const state = createInitialState(1263);
    const facts = applyPlayerActionEffect(state, "train_extra_tactical");
    assert.equal(state.professional.tacticalReading, 48.15);
    assert.equal(state.body.fatigue, 14);
    assert.equal(facts[0]?.payload.focus, "tactical");
  }
  {
    const state = createInitialState(1264);
    const facts = applyPlayerActionEffect(state, "video_study");
    assert.equal(state.professional.tacticalReading, 48.1);
    assert.equal(state.body.fatigue, 13);
    assert.deepEqual(facts, []);
  }
});

test("A1-027 HEALTH HANDLERS: recovery and rest remain distinct and bounded", () => {
  {
    const state = createInitialState(1271);
    const facts = applyPlayerActionEffect(state, "recovery_session");
    assert.equal(state.body.fatigue, 10);
    assert.equal(state.body.fitness, 78.25);
    assert.equal(state.body.risk, 17);
    assert.deepEqual(facts, []);
  }
  {
    const state = createInitialState(1272);
    const facts = applyPlayerActionEffect(state, "rest");
    assert.equal(state.body.fatigue, 10);
    assert.equal(state.body.fitness, 78.25);
    assert.equal(state.body.risk, 18);
    assert.equal(facts[0]?.kind, "rest_completed");
  }
});

test("A1-028 RELATIONSHIP HANDLERS: only the exact target relationship changes", () => {
  {
    const state = createInitialState(1281);
    const beforeOther = clone(relationship(state, "NPC_PLR_12"));
    const target = relationship(state, TEAMMATE);
    const affinity = target.affinity;
    const respect = target.respect;
    assert.deepEqual(applyPlayerActionEffect(state, "teammate_connect", TEAMMATE), []);
    assert.equal(target.affinity, affinity + 1);
    assert.equal(target.respect, respect + 0.5);
    assert.deepEqual(relationship(state, "NPC_PLR_12"), beforeOther);
  }
  {
    const state = createInitialState(1282);
    const target = relationship(state, TENSE_TEAMMATE);
    const resentment = target.resentment;
    applyPlayerActionEffect(state, "teammate_clear_air", TENSE_TEAMMATE);
    assert.equal(target.resentment, resentment - 1);
  }
  for (const key of ["leader_advice", "mentor_teammate"]) {
    const state = createInitialState(1283);
    const target = relationship(state, TEAMMATE);
    const respect = target.respect;
    applyPlayerActionEffect(state, key, TEAMMATE);
    assert.equal(target.respect, respect + 1);
  }
});

test("A1-029 IMAGE HANDLERS: interview tradeoffs are exact; social posts stay informational", () => {
  {
    const state = createInitialState(1291);
    applyPlayerActionEffect(state, "interview_humble");
    assert.equal(state.professional.institutionalTrust, 58.25);
    assert.equal(state.professional.commercialPower, 1.75);
  }
  {
    const state = createInitialState(1292);
    applyPlayerActionEffect(state, "interview_ambitious");
    assert.equal(state.professional.commercialPower, 2.5);
    assert.equal(state.professional.publicPolarization, 0.5);
  }
  {
    const state = createInitialState(1293);
    applyPlayerActionEffect(state, "interview_team_first");
    assert.equal(state.professional.institutionalTrust, 58.5);
    assert.equal(state.professional.commercialPower, 1.75);
  }
  for (const key of ["social_post_professional", "social_post_personal", "query_role_status"]) {
    const state = createInitialState(1294);
    const before = clone(state);
    assert.deepEqual(applyPlayerActionEffect(state, key), []);
    assert.deepEqual(state, before);
  }
});

test("A1-030 LIFE HANDLERS: wellbeing deltas are exact and small", () => {
  for (const key of ["personal_time_people", "personal_time_hobby"]) {
    const state = createInitialState(1301);
    applyPlayerActionEffect(state, key);
    assert.equal(state.body.fatigue, 11.5);
    assert.equal(state.professional.motivationReserve, 88.25);
  }
  {
    const state = createInitialState(1302);
    applyPlayerActionEffect(state, "disconnect");
    assert.equal(state.body.fatigue, 11);
    assert.equal(state.professional.motivationReserve, 88.5);
  }
});

test("A1-031 DIRECT V1 EFFECTS: no RNG, market, contract, club, world or narrative-history authority", () => {
  const cases = [
    ["train_extra", undefined],
    ["train_extra_physical", undefined],
    ["train_extra_tactical", undefined],
    ["video_study", undefined],
    ["recovery_session", undefined],
    ["rest", undefined],
    ["teammate_connect", TEAMMATE],
    ["teammate_clear_air", TENSE_TEAMMATE],
    ["leader_advice", TEAMMATE],
    ["mentor_teammate", TEAMMATE],
    ["interview_humble", undefined],
    ["interview_ambitious", undefined],
    ["interview_team_first", undefined],
    ["social_post_professional", undefined],
    ["social_post_personal", undefined],
    ["personal_time_people", undefined],
    ["personal_time_hobby", undefined],
    ["disconnect", undefined]
  ];

  for (const [effectKey, targetId] of cases) {
    const state = createInitialState(1310);
    const rng = clone(state.rngState);
    const market = clone(state.market);
    const contract = clone(state.contract);
    const world = clone(state.world);
    const history = clone(state.history);
    const club = state.club;

    applyPlayerActionEffect(state, effectKey, targetId);

    assert.deepEqual(state.rngState, rng, `${effectKey} changed RNG`);
    assert.deepEqual(state.market, market, `${effectKey} changed market`);
    assert.deepEqual(state.contract, contract, `${effectKey} changed contract`);
    assert.deepEqual(state.world, world, `${effectKey} changed world`);
    assert.deepEqual(state.history, history, `${effectKey} changed narrative history`);
    assert.equal(state.club, club, `${effectKey} changed club`);
  }
});
