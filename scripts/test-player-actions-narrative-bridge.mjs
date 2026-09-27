import test from "node:test";
import assert from "node:assert/strict";

import { createInitialState } from "../dist/content/initial-state.js";
import { eventGatesPass } from "../dist/narrative/event-gates.js";
import { narrativeCausalFacts, narrativeConditionRoot } from "../dist/simulation/club-contract-intent.js";
import { certifyCoachChangeInPlace } from "../dist/simulation/coach-change-authority.js";
import { materializeAge18MarketOfferInPlace } from "../dist/simulation/early-career-market.js";
import {
  FORMAL_RENEWAL_REASON,
  proposeCareerChange,
  respondToOffer
} from "../dist/simulation/offers.js";
import { certifyRepresentationInPlace } from "../dist/simulation/representation-authority.js";
import { GameSession } from "../dist/session/game-session.js";
import {
  executePlayerActionInPlace,
  playerActionFacts,
  transferRequestExternalMarketThreshold
} from "../dist/player-actions/index.js";

const COACH = "NPC_CCH_01";
const AGENT = "NPC_AGT_01";

const FIXTURE_ACTIONS = [
  {
    id: "PA_REQUEST_TRANSFER",
    category: "career",
    label: "Pedir salir",
    description: "Test fixture",
    targetKind: "none",
    cooldown: { scope: "action", days: 0 },
    eligibilityKey: "active_career",
    options: [{ id: "REQUEST", label: "Pedir salida", effectKey: "request_transfer", publicResult: "Has pedido salir." }]
  },
  {
    id: "PA_REQUEST_RENEWAL",
    category: "career",
    label: "Pedir renovación",
    description: "Test fixture",
    targetKind: "none",
    cooldown: { scope: "action", days: 0 },
    eligibilityKey: "active_career",
    options: [{ id: "REQUEST", label: "Pedir renovación", effectKey: "request_renewal", publicResult: "Has pedido renovar." }]
  },
  {
    id: "PA_ASK_AGENT_MARKET",
    category: "representative",
    label: "Consultar mercado",
    description: "Test fixture",
    targetKind: "agent",
    cooldown: { scope: "action_target", days: 0 },
    eligibilityKey: "active_career",
    options: [{ id: "ASK", label: "Preguntar", effectKey: "ask_agent_market", publicResult: "Preguntas por el mercado." }]
  },
  {
    id: "PA_POSITION_CHANGE",
    category: "career",
    label: "Explorar posición",
    description: "Test fixture",
    targetKind: "coach",
    cooldown: { scope: "action_target", days: 0 },
    eligibilityKey: "active_career",
    options: [{ id: "EXPLORE", label: "Explorar", effectKey: "request_position_change", publicResult: "Planteas una adaptación." }]
  },
  {
    id: "PA_WITHDRAW_TRANSFER",
    category: "career",
    label: "Retirar salida",
    description: "Test fixture",
    targetKind: "none",
    cooldown: { scope: "action", days: 0 },
    eligibilityKey: "active_career",
    options: [{ id: "WITHDRAW", label: "Retirar", effectKey: "withdraw_transfer_request", publicResult: "Retiras la petición." }]
  },
  {
    id: "PA_DISCUSS_FUTURE",
    category: "representative",
    label: "Hablar futuro",
    description: "Test fixture",
    targetKind: "agent",
    cooldown: { scope: "action_target", days: 0 },
    eligibilityKey: "active_career",
    options: [
      { id: "MINUTES", label: "Minutos", effectKey: "career_priority_minutes", publicResult: "Priorizas minutos." },
      { id: "SALARY", label: "Salario", effectKey: "career_priority_salary", publicResult: "Priorizas salario." },
      { id: "STABILITY", label: "Estabilidad", effectKey: "career_priority_stability", publicResult: "Priorizas estabilidad." },
      { id: "CLUB_LEVEL", label: "Nivel", effectKey: "career_priority_club_level", publicResult: "Priorizas nivel." }
    ]
  }
];

const clone = value => structuredClone(value);

function addDays(iso, days) {
  const date = new Date(`${iso}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function requestMoreMinutes(state) {
  const result = executePlayerActionInPlace(state, {
    actionId: "PA_COACH_TALK",
    optionId: "MORE_MINUTES",
    targetId: COACH
  });
  assert.equal(result.ok, true);
  return result;
}

function requestTransfer(state) {
  const result = executePlayerActionInPlace(
    state,
    { actionId: "PA_REQUEST_TRANSFER", optionId: "REQUEST" },
    FIXTURE_ACTIONS
  );
  assert.equal(result.ok, true);
  return result;
}

function requestRenewal(state) {
  const result = executePlayerActionInPlace(
    state,
    { actionId: "PA_REQUEST_RENEWAL", optionId: "REQUEST" },
    FIXTURE_ACTIONS
  );
  assert.equal(result.ok, true);
  return result;
}

function certifyAgent(state) {
  certifyRepresentationInPlace(state, AGENT, {
    commissionPct: 10,
    services: ["market"],
    contactPolicy: "inform_first"
  }, "a3_test_representation");
}

function askAgentMarket(state) {
  const result = executePlayerActionInPlace(
    state,
    { actionId: "PA_ASK_AGENT_MARKET", optionId: "ASK", targetId: AGENT },
    FIXTURE_ACTIONS
  );
  assert.equal(result.ok, true);
  return result;
}

function requestPositionChange(state) {
  const result = executePlayerActionInPlace(
    state,
    { actionId: "PA_POSITION_CHANGE", optionId: "EXPLORE", targetId: COACH },
    FIXTURE_ACTIONS
  );
  assert.equal(result.ok, true);
  return result;
}

function withdrawTransfer(state) {
  const result = executePlayerActionInPlace(
    state,
    { actionId: "PA_WITHDRAW_TRANSFER", optionId: "WITHDRAW" },
    FIXTURE_ACTIONS
  );
  assert.equal(result.ok, true);
  return result;
}

function setCareerPriority(state, optionId = "MINUTES") {
  const result = executePlayerActionInPlace(
    state,
    { actionId: "PA_DISCUSS_FUTURE", optionId, targetId: AGENT },
    FIXTURE_ACTIONS
  );
  assert.equal(result.ok, true);
  return result;
}

test("A3-001 FACT PROJECTION PURE: 100 reads keep state identical", () => {
  const state = createInitialState(301);
  requestMoreMinutes(state);
  const before = clone(state);
  for (let index = 0; index < 100; index += 1) playerActionFacts(state);
  assert.deepEqual(state, before);
});

test("A3-002 REQUEST MORE MINUTES: exact live fact is projected", () => {
  const state = createInitialState(302);
  requestMoreMinutes(state);
  const facts = playerActionFacts(state);
  assert.equal(facts.requestedMoreMinutes.historicalExists, true);
  assert.equal(facts.requestedMoreMinutes.currentlyRelevant, true);
  assert.equal(facts.requestedMoreMinutes.club, "UDV");
  assert.equal(facts.requestedMoreMinutes.coachNpcId, COACH);
});

test("A3-003 CLUB SCOPE: club change closes live transfer intent but keeps history", () => {
  const state = createInitialState(303);
  requestTransfer(state);
  assert.equal(playerActionFacts(state).requestedTransfer.currentlyRelevant, true);
  state.club = "OTHER_CLUB";
  state.professional.ownerClub = "OTHER_CLUB";
  state.professional.registrationClub = "OTHER_CLUB";
  const facts = playerActionFacts(state);
  assert.equal(facts.requestedTransfer.historicalExists, true);
  assert.equal(facts.requestedTransfer.currentlyRelevant, false);
  assert.equal(facts.requestedTransfer.count, 1);
});

test("A3-004 COACH SCOPE: old minutes request never applies to a new/unknown coach", () => {
  const state = createInitialState(304);
  requestMoreMinutes(state);
  certifyCoachChangeInPlace(state, "canonical_change", {
    previousCoachNpcId: COACH,
    newCoachNpcId: null
  });
  const facts = playerActionFacts(state);
  assert.equal(facts.requestedMoreMinutes.historicalExists, true);
  assert.equal(facts.requestedMoreMinutes.currentlyRelevant, false);
  assert.equal(facts.lastCoachConversation?.currentlyRelevant, false);
});

test("A3-005 TRANSFER REQUEST: intent alone creates no CareerOffer", () => {
  const state = createInitialState(305);
  const marketBefore = clone(state.market);
  requestTransfer(state);
  assert.deepEqual(state.market, marketBefore);
  assert.equal(playerActionFacts(state).requestedTransfer.currentlyRelevant, true);
});

test("A3-006 RENEWAL REQUEST: request does not mutate contract; formal authority resolves it", () => {
  const state = createInitialState(306);
  const contractBefore = clone(state.contract);
  requestRenewal(state);
  assert.deepEqual(state.contract, contractBefore);
  assert.equal(playerActionFacts(state).requestedRenewal.currentlyRelevant, true);

  const offer = proposeCareerChange(state, FORMAL_RENEWAL_REASON, draft => {
    draft.contract.monthsRemaining = 36;
    draft.contract.salaryMonthly = Number(draft.contract.salaryMonthly) + 500;
  });
  assert.ok(offer);
  respondToOffer(state, offer.id, "accept");
  assert.equal(playerActionFacts(state).requestedRenewal.historicalExists, true);
  assert.equal(playerActionFacts(state).requestedRenewal.currentlyRelevant, false);
});

test("A3-007 AGENT MARKET: private consultation creates no offer", () => {
  const state = createInitialState(307);
  certifyAgent(state);
  const marketBefore = clone(state.market);
  askAgentMarket(state);
  assert.deepEqual(state.market, marketBefore);
  const facts = playerActionFacts(state);
  assert.equal(facts.askedAgentAboutMarket.historicalExists, true);
  assert.equal(facts.askedAgentAboutMarket.currentlyRelevant, true);
  assert.equal(facts.askedAgentAboutMarket.agentNpcId, AGENT);
});

test("A3-008 NARRATIVE CONSUMER: event gate reads facts.playerActions", () => {
  const state = createInitialState(308);
  const event = {
    gates: [{
      path: "facts.playerActions.requestedMoreMinutes.currentlyRelevant",
      op: "eq",
      value: true
    }]
  };
  assert.equal(eventGatesPass(state, event), false);
  requestMoreMinutes(state);
  assert.equal(eventGatesPass(state, event), true);
});

test("A3-009 SYSTEM CONSUMER: market authority can consume transfer intent without losing authority", () => {
  let found = null;
  for (let seed = 1; seed <= 5000; seed += 1) {
    const base = createInitialState(seed);
    base.date = "2027-06-04";
    base.age = 18;
    base.flags.OFFICIAL_DEBUT = true;
    base.sport.appearances = 3;
    base.reputation.marketHeat = 40;

    const withoutIntent = clone(base);
    const withIntent = clone(base);
    requestTransfer(withIntent);

    const noIntentKind = materializeAge18MarketOfferInPlace(withoutIntent);
    const intentKind = materializeAge18MarketOfferInPlace(withIntent);
    if (noIntentKind === "renewal" && intentKind === "transfer") {
      found = { withoutIntent, withIntent };
      break;
    }
  }
  assert.ok(found, "directed seeds should expose the existing market threshold band");
  assert.equal(found.withoutIntent.playerActions, undefined);
  assert.equal(found.withoutIntent.market?.pending?.reason, FORMAL_RENEWAL_REASON);
  assert.match(found.withIntent.market?.pending?.reason ?? "", /salida/i);
  assert.equal(playerActionFacts(found.withIntent).requestedTransfer.historicalExists, true);
});

test("A3-010 NO EXTRA RNG: projection, narrative root and bridge consume zero draws", () => {
  const state = createInitialState(310);
  requestTransfer(state);
  const before = clone(state.rngState);
  for (let index = 0; index < 100; index += 1) {
    playerActionFacts(state);
    narrativeConditionRoot(state);
    transferRequestExternalMarketThreshold(state, 38);
  }
  assert.deepEqual(state.rngState, before);
});

test("A3-011 ZERO ACTION: neutral projection has no active or historical intent", () => {
  const state = createInitialState(311);
  const before = clone(state);
  const facts = playerActionFacts(state);
  for (const key of ["requestedMoreMinutes", "requestedTransfer", "requestedRenewal", "askedAgentAboutMarket"]) {
    assert.equal(facts[key].historicalExists, false);
    assert.equal(facts[key].currentlyRelevant, false);
    assert.equal(facts[key].count, 0);
  }
  assert.equal(facts.lastCoachConversation, null);
  assert.equal(transferRequestExternalMarketThreshold(state, 38), 38);
  assert.deepEqual(state, before);
});

test("A3-012 HISTORICAL VS LIVE: expired intent remains historical and becomes inactive", () => {
  const state = createInitialState(312);
  requestMoreMinutes(state);
  state.date = addDays(state.date, 31);
  const facts = playerActionFacts(state);
  assert.equal(facts.requestedMoreMinutes.historicalExists, true);
  assert.equal(facts.requestedMoreMinutes.currentlyRelevant, false);
  assert.equal(facts.requestedMoreMinutes.count, 1);
});

test("A3-013 SAVE/LOAD: derived facts are identical after GameSession resume", async () => {
  const session = await GameSession.create(313, { events: [], microfeeds: false, sessionId: "a3-save-load" });
  await session.dispatch({
    type: "player_action",
    commandId: "a3-save-action",
    expectedRevision: 0,
    actionId: "PA_COACH_TALK",
    optionId: "MORE_MINUTES",
    targetId: COACH
  });
  const snapshot = session.exportSnapshot();
  const beforeFacts = playerActionFacts(snapshot.state);
  const resumed = await GameSession.resume(clone(snapshot), { events: [] });
  assert.deepEqual(playerActionFacts(resumed.exportSnapshot().state), beforeFacts);
});

test("A3-014 PRIVATE KNOWLEDGE: coach conversation does not become global/NPC knowledge", () => {
  const state = createInitialState(314);
  const npcsBefore = clone(state.npcs);
  const relationshipsBefore = clone(state.relationships);
  const worldBefore = clone(state.world);
  requestMoreMinutes(state);
  assert.deepEqual(state.npcs, npcsBefore);
  assert.deepEqual(state.relationships, relationshipsBefore);
  assert.deepEqual(state.world, worldBefore);
});

test("A3-015 NO PROXY: market heat/interest and agent query are still not a formal offer", () => {
  const state = createInitialState(315);
  state.reputation.marketHeat = 100;
  state.flags.BIG_CLUB_INTEREST = true;
  certifyAgent(state);
  askAgentMarket(state);
  const facts = narrativeCausalFacts(state);
  assert.equal(facts.pendingCareerOffer, null);
  assert.equal(facts.pendingCareerOfferKind, null);
  assert.equal(state.market?.pending ?? null, null);
});


test("A3-016 POSITION CHANGE: fact is coach/club scoped and never changes sporting position", () => {
  const state = createInitialState(316);
  const professionalBefore = clone(state.professional);
  const bodyBefore = clone(state.body);
  requestPositionChange(state);

  assert.deepEqual(state.professional, professionalBefore);
  assert.deepEqual(state.body, bodyBefore);

  let facts = playerActionFacts(state);
  assert.equal(facts.requestedPositionChange.historicalExists, true);
  assert.equal(facts.requestedPositionChange.currentlyRelevant, true);
  assert.equal(facts.requestedPositionChange.club, "UDV");
  assert.equal(facts.requestedPositionChange.coachNpcId, COACH);
  assert.equal(facts.lastCoachConversation?.stance, "position_change");

  certifyCoachChangeInPlace(state, "canonical_change", {
    previousCoachNpcId: COACH,
    newCoachNpcId: null
  });
  facts = playerActionFacts(state);
  assert.equal(facts.requestedPositionChange.historicalExists, true);
  assert.equal(facts.requestedPositionChange.currentlyRelevant, false);
});

test("A3-017 WITHDRAW TRANSFER: withdrawal closes live request without erasing its history", () => {
  const state = createInitialState(317);
  requestTransfer(state);
  assert.equal(playerActionFacts(state).requestedTransfer.currentlyRelevant, true);

  const marketBefore = clone(state.market);
  withdrawTransfer(state);
  assert.deepEqual(state.market, marketBefore);

  let facts = playerActionFacts(state);
  assert.equal(facts.requestedTransfer.historicalExists, true);
  assert.equal(facts.requestedTransfer.count, 1);
  assert.equal(facts.requestedTransfer.currentlyRelevant, false);
  assert.equal(facts.transferRequestWithdrawn.historicalExists, true);
  assert.equal(facts.transferRequestWithdrawn.currentlyRelevant, true);
  assert.equal(facts.transferRequestWithdrawn.club, "UDV");

  requestTransfer(state);
  facts = playerActionFacts(state);
  assert.equal(facts.requestedTransfer.count, 2);
  assert.equal(facts.requestedTransfer.currentlyRelevant, true);
  assert.equal(facts.transferRequestWithdrawn.currentlyRelevant, false);
});

test("A3-018 CAREER PRIORITY: priority is representative-scoped and creates no offer or contract mutation", () => {
  const state = createInitialState(318);
  certifyAgent(state);
  const marketBefore = clone(state.market);
  const contractBefore = clone(state.contract);

  setCareerPriority(state, "SALARY");

  assert.deepEqual(state.market, marketBefore);
  assert.deepEqual(state.contract, contractBefore);
  let facts = playerActionFacts(state);
  assert.equal(facts.careerPriority.historicalExists, true);
  assert.equal(facts.careerPriority.currentlyRelevant, true);
  assert.equal(facts.careerPriority.agentNpcId, AGENT);
  assert.equal(facts.careerPriority.priority, "salary");

  state.date = addDays(state.date, 21);
  facts = playerActionFacts(state);
  assert.equal(facts.careerPriority.historicalExists, true);
  assert.equal(facts.careerPriority.currentlyRelevant, false);
  assert.equal(facts.careerPriority.priority, null);
});

test("A3-019 NEW FACTS: narrative gates can consume position/withdraw/priority without hidden authority", () => {
  const state = createInitialState(319);
  certifyAgent(state);

  requestPositionChange(state);
  setCareerPriority(state, "CLUB_LEVEL");
  const root = narrativeConditionRoot(state);

  assert.equal(root.facts.playerActions.requestedPositionChange.currentlyRelevant, true);
  assert.equal(root.facts.playerActions.careerPriority.currentlyRelevant, true);
  assert.equal(root.facts.playerActions.careerPriority.priority, "club_level");

  requestTransfer(state);
  withdrawTransfer(state);
  const after = narrativeConditionRoot(state);
  assert.equal(after.facts.playerActions.requestedTransfer.currentlyRelevant, false);
  assert.equal(after.facts.playerActions.transferRequestWithdrawn.currentlyRelevant, true);
});

test("A3-020 NEW FACTS NO RNG: writes/projection consume no narrative RNG and no synthetic world outcome", () => {
  const state = createInitialState(320);
  certifyAgent(state);
  const rngBefore = clone(state.rngState);
  const worldBefore = clone(state.world);
  const offersBefore = clone(state.market);

  requestPositionChange(state);
  setCareerPriority(state, "STABILITY");
  requestTransfer(state);
  withdrawTransfer(state);
  for (let index = 0; index < 100; index += 1) playerActionFacts(state);

  assert.deepEqual(state.rngState, rngBefore);
  assert.deepEqual(state.world, worldBefore);
  assert.deepEqual(state.market, offersBefore);
});
