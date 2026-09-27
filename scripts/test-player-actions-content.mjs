import test from "node:test";
import assert from "node:assert/strict";

import { createInitialState } from "../dist/content/initial-state.js";
import { GameSession } from "../dist/session/game-session.js";
import { materializeAge18MarketOfferInPlace } from "../dist/simulation/early-career-market.js";
import { certifyRepresentationInPlace } from "../dist/simulation/representation-authority.js";
import { PLAYER_ACTION_CONTENT_PLAN } from "../dist/player-actions/content-plan.js";
import { PLAYER_ACTION_CONTENT_SPECS } from "../dist/player-actions/content-spec.js";
import { PLAYER_ACTION_BALANCE_SPECS } from "../dist/player-actions/content-balance.js";
import { PLAYER_ACTION_ELIGIBILITY_SPECS } from "../dist/player-actions/content-eligibility.js";
import { PLAYER_ACTION_COOLDOWN_GROUP_SPECS } from "../dist/player-actions/content-cooldown-groups.js";
import { CLUB_RENEWAL_INTENT_MAX_MONTHS } from "../dist/simulation/club-contract-intent.js";
import {
  PLAYER_ACTION_CATALOG,
  PLAYER_ACTION_EFFECT_KEYS,
  addPlayerActionDays,
  evaluatePlayerAction,
  executePlayerActionInPlace,
  getPlayerActionFacts,
  isPlayerActionAvailable,
  listPlayerActions,
  playerActionFacts
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


test("A5-015 TRAINING FREQUENCY CEILING", () => {
  const action = PLAYER_ACTION_CATALOG.find(row => row.id === "PA_TRAIN_EXTRA");
  assert.ok(action);
  const maxUses = Math.floor(364 / action.cooldown.days) + 1;
  assert.ok(maxUses <= 11, `training can run ${maxUses} times/year`);
});

test("A5-016 REST FREQUENCY CEILING", () => {
  const action = PLAYER_ACTION_CATALOG.find(row => row.id === "PA_REST");
  assert.ok(action);
  const maxUses = Math.floor(364 / action.cooldown.days) + 1;
  assert.ok(maxUses <= 18, `rest can run ${maxUses} times/year`);
});


test("A5-017 INTENT COOLDOWN > INCLUSIVE FACT LIFECYCLE", () => {
  const minimums = new Map([
    ["PA_COACH_TALK", 30],
    ["PA_REQUEST_TRANSFER", 120],
    ["PA_REQUEST_RENEWAL", 90],
    ["PA_AGENT_MARKET", 30]
  ]);
  for (const [actionId, minimumDays] of minimums) {
    const action = PLAYER_ACTION_CATALOG.find(row => row.id === actionId);
    assert.ok(action, `missing ${actionId}`);
    assert.ok(
      action.cooldown.days > minimumDays,
      `${actionId} cooldown ${action.cooldown.days}d must exceed inclusive causal fact lifecycle ${minimumDays}d`
    );
  }
});


test("A5-018 IMPLEMENTED PLAN/RUNTIME SYNC", () => {
  for (const row of PLAYER_ACTION_CONTENT_PLAN.filter(item => item.status === "implemented")) {
    const action = PLAYER_ACTION_CATALOG.find(item => item.id === row.id);
    assert.ok(action, `implemented plan row missing in runtime: ${row.id}`);
    assert.equal(action.cooldown.days, row.cooldownDays, `${row.id} cooldown drift`);
    assert.equal(action.targetKind, row.targetKind, `${row.id} target drift`);
    if (row.id === "PA_REST") {
      assert.equal(action.category, "life");
      assert.equal(row.category, "health");
      assert.match(row.blockedBy ?? "", /health/i);
    } else {
      assert.equal(action.category, row.category, `${row.id} category drift`);
    }
  }
});


test("A5-019 CONTENT PLAN DISTRIBUTION", () => {
  const countBy = (key) => PLAYER_ACTION_CONTENT_PLAN.reduce((acc, row) => {
    acc[row[key]] = (acc[row[key]] ?? 0) + 1;
    return acc;
  }, {});
  assert.deepEqual(countBy("classification"), {
    CORE: 9,
    CONTEXTUAL: 8,
    LATE_CAREER: 2,
    OPTIONAL_FLAVOR: 1
  });
  assert.deepEqual(countBy("category"), {
    career: 5,
    training: 2,
    health: 2,
    representative: 3,
    relationships: 4,
    image: 2,
    life: 2
  });
});

test("A5-020 NO DUPLICATE RUNTIME SEMANTICS", () => {
  const seen = new Map();
  for (const action of PLAYER_ACTION_CATALOG) {
    const signature = JSON.stringify({
      category: action.category,
      targetKind: action.targetKind,
      effects: [...action.options.map(option => option.effectKey)].sort()
    });
    const previous = seen.get(signature);
    assert.equal(previous, undefined, `${action.id} duplicates runtime semantics of ${previous}`);
    seen.set(signature, action.id);
  }
});

test("A5-021 PUBLIC COPY DOES NOT LEAK INTERNALS", () => {
  const forbidden = [
    "rolescore",
    "marketheat",
    "rngstate",
    "effectkey",
    "eligibilitykey",
    "originEvent",
    "playeractionfact",
    "currentlyrelevant"
  ].map(term => term.toLowerCase());

  for (const action of PLAYER_ACTION_CATALOG) {
    const publicText = [
      action.label,
      action.description,
      ...action.options.flatMap(option => [
        option.label,
        option.description ?? "",
        option.publicResult
      ])
    ].join(" ").toLowerCase();
    for (const term of forbidden) {
      assert.equal(publicText.includes(term), false, `${action.id} leaks internal term ${term}`);
    }
  }
});


test("A5-022 TRANSFER REQUEST MARKET UPLIFT IS BOUNDED, NOT GUARANTEED", () => {
  let withoutTransfer = 0;
  let withTransfer = 0;
  const samples = 1000;

  for (let seed = 1; seed <= samples; seed += 1) {
    const base = createInitialState(seed);
    base.date = "2027-06-04";
    base.age = 18;
    base.flags.OFFICIAL_DEBUT = true;
    base.sport.appearances = 3;
    base.reputation.marketHeat = 40;

    const neutral = clone(base);
    const requested = clone(base);

    const action = executePlayerActionInPlace(requested, {
      actionId: "PA_REQUEST_TRANSFER",
      optionId: "REQUEST"
    });
    assert.equal(action.ok, true);
    assert.equal(requested.market?.pending ?? null, null, "Player Action must not synthesize an offer");

    if (materializeAge18MarketOfferInPlace(neutral) === "transfer") withoutTransfer += 1;
    if (materializeAge18MarketOfferInPlace(requested) === "transfer") withTransfer += 1;
  }

  const neutralRate = withoutTransfer / samples;
  const requestedRate = withTransfer / samples;
  const uplift = requestedRate - neutralRate;

  assert.ok(requestedRate > neutralRate, `transfer request should have positive market influence: ${neutralRate} -> ${requestedRate}`);
  assert.ok(requestedRate < 0.65, `transfer request became too close to a guarantee: ${requestedRate}`);
  assert.ok(uplift >= 0.07, `transfer request influence too small to be meaningful: ${uplift}`);
  assert.ok(uplift <= 0.17, `transfer request influence too large for +12 threshold points: ${uplift}`);
});


test("A5-023 MORE MINUTES REQUEST NEVER GRANTS SPORT OUTCOME DIRECTLY", () => {
  const state = createInitialState(8523);
  const before = {
    roleScore: state.sport.roleScore,
    appearances: state.sport.appearances,
    minutesShare: state.sport.minutesShare,
    history: clone(state.history),
    market: clone(state.market)
  };

  const result = executePlayerActionInPlace(state, {
    actionId: "PA_COACH_TALK",
    optionId: "MORE_MINUTES",
    targetId: "NPC_CCH_01"
  });

  assert.equal(result.ok, true);
  assert.equal(state.sport.roleScore, before.roleScore);
  assert.equal(state.sport.appearances, before.appearances);
  assert.equal(state.sport.minutesShare, before.minutesShare);
  assert.deepEqual(state.history, before.history);
  assert.deepEqual(state.market, before.market);
  assert.equal(
    state.playerActions?.facts.some(fact => fact.kind === "request_more_minutes"),
    true
  );
});


test("A5-024 AGENT MARKET QUERY NEVER SYNTHESIZES OFFER", () => {
  const state = createInitialState(8524);
  certifyRepresentationInPlace(state, "NPC_AGT_01", {
    commissionPct: 10,
    services: ["market"],
    contactPolicy: "inform_first"
  }, "a5_content_test");

  const beforeMarket = clone(state.market);
  const beforeClub = state.club;
  const beforeContract = clone(state.contract);

  const result = executePlayerActionInPlace(state, {
    actionId: "PA_AGENT_MARKET",
    optionId: "ASK",
    targetId: "NPC_AGT_01"
  });

  assert.equal(result.ok, true);
  assert.deepEqual(state.market, beforeMarket);
  assert.equal(state.club, beforeClub);
  assert.deepEqual(state.contract, beforeContract);
  assert.equal(
    state.playerActions?.facts.some(fact => fact.kind === "ask_agent_market"),
    true
  );
});


test("A5-025 INCLUSIVE FACT EXPIRY NEVER OVERLAPS RE-EXECUTION", () => {
  const state = createInitialState(8525);
  const action = PLAYER_ACTION_CATALOG.find(row => row.id === "PA_REQUEST_TRANSFER");
  assert.ok(action);

  const startDate = state.date;
  const first = executePlayerActionInPlace(state, {
    actionId: "PA_REQUEST_TRANSFER",
    optionId: "REQUEST"
  });
  assert.equal(first.ok, true);

  state.date = addPlayerActionDays(startDate, 120);
  assert.equal(playerActionFacts(state).requestedTransfer.currentlyRelevant, true);
  assert.equal(evaluatePlayerAction(state, action).available, false);

  state.date = addPlayerActionDays(startDate, 121);
  assert.equal(playerActionFacts(state).requestedTransfer.currentlyRelevant, false);
  assert.equal(evaluatePlayerAction(state, action).available, true);
});


test("A5-026 IMPLEMENTED CONTEXT GAPS ARE EXPLICIT", () => {
  const expectedA1ContextGaps = new Set([
    "PA_COACH_TALK",
    "PA_REQUEST_TRANSFER",
    "PA_REQUEST_RENEWAL"
  ]);

  for (const row of PLAYER_ACTION_CONTENT_PLAN.filter(item => expectedA1ContextGaps.has(item.id))) {
    assert.equal(row.status, "implemented");
    assert.match(row.blockedBy ?? "", /A1/i, `${row.id} must name A1 context blocker`);
    assert.match(row.blockedBy ?? "", /eligibility/i, `${row.id} must name eligibility blocker`);
    assert.match(row.requiredContext, /employment/i, `${row.id} must require active employment`);
  }

  const agentMarket = PLAYER_ACTION_CONTENT_PLAN.find(item => item.id === "PA_AGENT_MARKET");
  assert.ok(agentMarket);
  assert.equal(agentMarket.blockedBy, undefined, "A2 public-target blocker is resolved by #806");
});


test("A5-027 CAUSAL FACT EXPIRES BEFORE ACTION REOPENS", () => {
  const state = createInitialState(8526);
  const definition = PLAYER_ACTION_CATALOG.find(row => row.id === "PA_REQUEST_TRANSFER");
  assert.ok(definition);

  const result = executePlayerActionInPlace(state, {
    actionId: "PA_REQUEST_TRANSFER",
    optionId: "REQUEST"
  });
  assert.equal(result.ok, true);
  assert.ok(result.cooldownUntil);

  const fact = getPlayerActionFacts(state, { kind: "request_transfer" }).at(-1);
  assert.ok(fact?.expiresAfter);
  assert.equal(result.cooldownUntil, addPlayerActionDays(fact.expiresAfter, 1));

  state.date = fact.expiresAfter;
  assert.equal(getPlayerActionFacts(state, { activeOnly: true, kind: "request_transfer" }).length, 1);
  assert.equal(isPlayerActionAvailable(state, definition), false);

  state.date = result.cooldownUntil;
  assert.equal(getPlayerActionFacts(state, { activeOnly: true, kind: "request_transfer" }).length, 0);
  assert.equal(isPlayerActionAvailable(state, definition), true);
});


test("A5-028 FULL PUBLIC CONTENT SPEC COVERAGE", () => {
  const planIds = PLAYER_ACTION_CONTENT_PLAN.map(row => row.id).sort();
  const specIds = PLAYER_ACTION_CONTENT_SPECS.map(row => row.id).sort();

  assert.equal(PLAYER_ACTION_CONTENT_SPECS.length, 20);
  assert.equal(new Set(specIds).size, specIds.length);
  assert.deepEqual(specIds, planIds);
});

test("A5-029 FULL SPEC OPTION AND COPY BUDGETS", () => {
  for (const spec of PLAYER_ACTION_CONTENT_SPECS) {
    assert.ok(spec.label.length > 0 && spec.label.length <= 42, `${spec.id} invalid label length`);
    assert.ok(spec.description.length > 0 && spec.description.length <= 180, `${spec.id} invalid description length`);
    assert.ok(spec.options.length >= 1 && spec.options.length <= 5, `${spec.id} invalid option count`);
    assert.equal(new Set(spec.options.map(option => option.id)).size, spec.options.length, `${spec.id} duplicate option ids`);

    for (const option of spec.options) {
      assert.ok(option.label.length > 0 && option.label.length <= 48, `${spec.id}/${option.id} invalid option label`);
      assert.ok(option.publicResult.length > 0 && option.publicResult.length <= 140, `${spec.id}/${option.id} invalid public result`);
    }
  }
});

test("A5-030 IMPLEMENTED PUBLIC COPY IS A SUBSET OF CERTIFIED SPEC", () => {
  for (const action of PLAYER_ACTION_CATALOG) {
    const spec = PLAYER_ACTION_CONTENT_SPECS.find(row => row.id === action.id);
    assert.ok(spec, `missing public content spec for ${action.id}`);
    assert.equal(action.label, spec.label, `${action.id} label drift`);
    assert.equal(action.description, spec.description, `${action.id} description drift`);

    for (const option of action.options) {
      const plannedOption = spec.options.find(row => row.id === option.id);
      assert.ok(plannedOption, `${action.id}/${option.id} missing from public content spec`);
      assert.equal(option.label, plannedOption.label, `${action.id}/${option.id} label drift`);
      assert.equal(option.publicResult, plannedOption.publicResult, `${action.id}/${option.id} result drift`);
    }
  }
});


test("A5-031 FULL PUBLIC SPEC DOES NOT LEAK INTERNALS", () => {
  const forbidden = [
    "rolescore",
    "marketheat",
    "rngstate",
    "effectkey",
    "eligibilitykey",
    "originevent",
    "playeractionfact",
    "currentlyrelevant"
  ];

  for (const spec of PLAYER_ACTION_CONTENT_SPECS) {
    const publicText = [
      spec.label,
      spec.description,
      ...spec.options.flatMap(option => [option.label, option.publicResult])
    ].join(" ").toLowerCase();

    for (const term of forbidden) {
      assert.equal(publicText.includes(term), false, `${spec.id} leaks internal term ${term}`);
    }
  }
});

test("A5-032 FULL PUBLIC SPEC DOES NOT PROMISE FOREIGN AUTHORITY OUTCOMES", () => {
  const forbiddenClaims = [
    "serás titular",
    "eres titular",
    "recibirás una oferta",
    "tendrás una oferta",
    "te renuevan",
    "renovación asegurada",
    "cambias de club",
    "fichas por",
    "curas la lesión",
    "lesión curada",
    "te convocan",
    "eres capitán",
    "te retiras"
  ];

  for (const spec of PLAYER_ACTION_CONTENT_SPECS) {
    const publicText = [
      spec.label,
      spec.description,
      ...spec.options.flatMap(option => [option.label, option.publicResult])
    ].join(" ").toLowerCase();

    for (const claim of forbiddenClaims) {
      assert.equal(publicText.includes(claim), false, `${spec.id} promises foreign authority outcome: ${claim}`);
    }
  }
});


test("A5-033 FULL BALANCE SPEC COVERS EVERY ACTION AND OPTION", () => {
  const specByAction = new Map(PLAYER_ACTION_CONTENT_SPECS.map(spec => [spec.id, spec]));
  const balanceIds = PLAYER_ACTION_BALANCE_SPECS.map(row => row.actionId).sort();

  assert.equal(PLAYER_ACTION_BALANCE_SPECS.length, 20);
  assert.equal(new Set(balanceIds).size, balanceIds.length);
  assert.deepEqual(balanceIds, PLAYER_ACTION_CONTENT_SPECS.map(row => row.id).sort());

  for (const balance of PLAYER_ACTION_BALANCE_SPECS) {
    const spec = specByAction.get(balance.actionId);
    assert.ok(spec, `missing content spec for balance row ${balance.actionId}`);
    assert.deepEqual(
      balance.options.map(row => row.optionId).sort(),
      spec.options.map(row => row.id).sort(),
      `${balance.actionId} balance options drift from content spec`
    );
  }
});

test("A5-034 TARGET V1 DIRECT DELTAS STAY WITHIN SMALL-EFFECT BUDGETS", () => {
  const maxAbsByMetric = new Map([
    ["body.fatigue", 4],
    ["body.fitness", 0.5],
    ["body.risk", 2],
    ["professional.technique", 0.2],
    ["professional.tacticalReading", 0.2],
    ["professional.matchEndurance", 0.2],
    ["professional.commercialPower", 1],
    ["professional.publicPolarization", 1],
    ["professional.institutionalTrust", 1],
    ["professional.motivationReserve", 1],
    ["professional.lockerPower", 0.1],
    ["relationship.affinity", 1],
    ["relationship.trust", 1],
    ["relationship.respect", 1],
    ["relationship.resentment", 1]
  ]);

  for (const action of PLAYER_ACTION_BALANCE_SPECS) {
    for (const option of action.options) {
      const metrics = option.directDeltas.map(delta => delta.metric);
      assert.equal(new Set(metrics).size, metrics.length, `${action.actionId}/${option.optionId} repeats a metric`);

      for (const delta of option.directDeltas) {
        const limit = maxAbsByMetric.get(delta.metric);
        assert.ok(limit !== undefined, `${action.actionId}/${option.optionId} uses non-approved metric ${delta.metric}`);
        assert.ok(Number.isFinite(delta.delta) && delta.delta !== 0);
        assert.ok(
          Math.abs(delta.delta) <= limit,
          `${action.actionId}/${option.optionId} ${delta.metric} delta ${delta.delta} exceeds ${limit}`
        );
      }
    }
  }
});

test("A5-035 AUTHORITY/INTENT ACTIONS HAVE NO DIRECT WORLD DELTAS", () => {
  const factFirstActions = new Set([
    "PA_COACH_TALK",
    "PA_ROLE_CHECK",
    "PA_POSITION_CHANGE",
    "PA_REQUEST_TRANSFER",
    "PA_WITHDRAW_TRANSFER",
    "PA_AGENT_MARKET",
    "PA_REQUEST_RENEWAL",
    "PA_DISCUSS_FUTURE"
  ]);

  for (const action of PLAYER_ACTION_BALANCE_SPECS.filter(row => factFirstActions.has(row.actionId))) {
    for (const option of action.options) {
      assert.deepEqual(
        option.directDeltas,
        [],
        `${action.actionId}/${option.optionId} must remain fact/intent-first`
      );
    }
  }
});


test("A5-036 FULL ELIGIBILITY SPEC COVERS ALL 20 ACTIONS", () => {
  const planIds = PLAYER_ACTION_CONTENT_PLAN.map(row => row.id).sort();
  const eligibilityIds = PLAYER_ACTION_ELIGIBILITY_SPECS.map(row => row.actionId).sort();

  assert.equal(PLAYER_ACTION_ELIGIBILITY_SPECS.length, 20);
  assert.equal(new Set(eligibilityIds).size, eligibilityIds.length);
  assert.deepEqual(eligibilityIds, planIds);

  for (const row of PLAYER_ACTION_ELIGIBILITY_SPECS) {
    assert.ok(row.all.length >= 2, `${row.actionId} eligibility is underspecified`);
    assert.equal(row.all.some(predicate => predicate.kind === "active_career"), true);
  }
});

test("A5-037 ELIGIBILITY AGE RANGE MATCHES CONTENT PLAN", () => {
  for (const plan of PLAYER_ACTION_CONTENT_PLAN) {
    const eligibility = PLAYER_ACTION_ELIGIBILITY_SPECS.find(row => row.actionId === plan.id);
    assert.ok(eligibility, `missing eligibility for ${plan.id}`);
    const age = eligibility.all.find(predicate => predicate.kind === "age_range");
    assert.ok(age, `${plan.id} missing age_range predicate`);
    assert.equal(age.min, plan.ageRange[0], `${plan.id} min age drift`);
    assert.equal(age.max ?? null, plan.ageRange[1], `${plan.id} max age drift`);
  }
});

test("A5-038 CLUB-SCOPED ACTIONS REQUIRE ACTIVE EMPLOYMENT", () => {
  const clubScoped = new Set([
    "PA_COACH_TALK",
    "PA_ROLE_CHECK",
    "PA_POSITION_CHANGE",
    "PA_REQUEST_TRANSFER",
    "PA_WITHDRAW_TRANSFER",
    "PA_REQUEST_RENEWAL",
    "PA_TALK_TEAMMATE",
    "PA_CLEAR_AIR",
    "PA_VETERAN_ADVICE",
    "PA_MENTOR_YOUNG"
  ]);

  for (const row of PLAYER_ACTION_ELIGIBILITY_SPECS.filter(item => clubScoped.has(item.actionId))) {
    assert.equal(
      row.all.some(predicate => predicate.kind === "active_club_employment"),
      true,
      `${row.actionId} must fail before execution when unattached`
    );
  }
});

test("A5-039 TARGET ELIGIBILITY MATCHES TARGET KIND", () => {
  const planById = new Map(PLAYER_ACTION_CONTENT_PLAN.map(row => [row.id, row]));

  for (const row of PLAYER_ACTION_ELIGIBILITY_SPECS) {
    const plan = planById.get(row.actionId);
    assert.ok(plan);
    const kinds = new Set(row.all.map(predicate => predicate.kind));

    if (plan.targetKind === "coach") assert.equal(kinds.has("current_coach"), true, `${row.actionId} missing current_coach`);
    if (plan.targetKind === "agent") assert.equal(kinds.has("current_representation"), true, `${row.actionId} missing current_representation`);
    if (plan.targetKind === "teammate") assert.equal(kinds.has("current_teammate"), true, `${row.actionId} missing current_teammate`);
  }
});

test("A5-040 RENEWAL USES CANONICAL 24-MONTH HORIZON", () => {
  const renewal = PLAYER_ACTION_ELIGIBILITY_SPECS.find(row => row.actionId === "PA_REQUEST_RENEWAL");
  assert.ok(renewal);
  const contract = renewal.all.find(predicate => predicate.kind === "contract_months");
  assert.ok(contract);
  assert.equal(contract.min, 1);
  assert.equal(contract.max, CLUB_RENEWAL_INTENT_MAX_MONTHS);
  assert.equal(CLUB_RENEWAL_INTENT_MAX_MONTHS, 24);
});


test("A5-041 SHARED COOLDOWN POLICY COVERS ALL 20 ACTIONS", () => {
  const planIds = PLAYER_ACTION_CONTENT_PLAN.map(row => row.id).sort();
  const groupIds = PLAYER_ACTION_COOLDOWN_GROUP_SPECS.map(row => row.actionId).sort();

  assert.equal(PLAYER_ACTION_COOLDOWN_GROUP_SPECS.length, 20);
  assert.equal(new Set(groupIds).size, groupIds.length);
  assert.deepEqual(groupIds, planIds);

  for (const row of PLAYER_ACTION_COOLDOWN_GROUP_SPECS) {
    assert.ok(Number.isInteger(row.groupDays) && row.groupDays >= 0);
    if (row.groupId) assert.ok(row.groupId.length > 0);
  }
});

test("A5-042 SHARED COOLDOWN NEVER EXCEEDS ACTION COOLDOWN", () => {
  const planById = new Map(PLAYER_ACTION_CONTENT_PLAN.map(row => [row.id, row]));

  for (const row of PLAYER_ACTION_COOLDOWN_GROUP_SPECS) {
    const plan = planById.get(row.actionId);
    assert.ok(plan);
    assert.ok(
      row.groupDays <= plan.cooldownDays,
      `${row.actionId} group cooldown ${row.groupDays}d exceeds action cooldown ${plan.cooldownDays}d`
    );
  }
});

test("A5-043 TARGET-CYCLING FAMILIES HAVE GROUP COOLDOWNS", () => {
  const requiredFamilies = new Set([
    "coach_conversation",
    "agent_conversation",
    "teammate_interaction"
  ]);

  const present = new Set(
    PLAYER_ACTION_COOLDOWN_GROUP_SPECS
      .map(row => row.groupId)
      .filter(Boolean)
  );

  for (const family of requiredFamilies) {
    assert.equal(present.has(family), true, `missing anti-cycling family ${family}`);
  }

  for (const row of PLAYER_ACTION_COOLDOWN_GROUP_SPECS.filter(item => item.groupId === "teammate_interaction")) {
    assert.ok(row.groupDays >= 7, `${row.actionId} teammate family cooldown too short`);
  }
});

test("A5-044 RECOVERY/DEVELOPMENT FAMILIES PREVENT DAILY ALTERNATION", () => {
  for (const family of ["extra_development", "physical_recovery", "public_image", "personal_wellbeing"]) {
    const rows = PLAYER_ACTION_COOLDOWN_GROUP_SPECS.filter(item => item.groupId === family);
    assert.ok(rows.length >= 2, `family ${family} must contain at least two actions`);
    assert.ok(rows.every(row => row.groupDays >= 7), `family ${family} must block daily cycling`);
  }
});
