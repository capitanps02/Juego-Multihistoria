import type { DataValue, GameState } from "../core/types.js";
import { currentEmploymentClub } from "../simulation/employment.js";
import { careerOfferKind } from "../simulation/offers.js";
import { resolveCurrentCoach } from "../simulation/npc-authority.js";
import { resolveCurrentRepresentation } from "../simulation/representation-authority.js";
import { getPlayerActionFacts } from "./action-state.js";
import type { PlayerActionFact, PlayerActionFactKind } from "./types.js";

export interface PlayerActionFactStatus {
  historicalExists: boolean;
  currentlyRelevant: boolean;
  count: number;
  lastDate: string | null;
  activeDate: string | null;
}

export interface ClubScopedPlayerActionFactStatus extends PlayerActionFactStatus {
  club: string | null;
}

export interface CoachScopedPlayerActionFactStatus extends ClubScopedPlayerActionFactStatus {
  coachNpcId: string | null;
}

export interface AgentScopedPlayerActionFactStatus extends PlayerActionFactStatus {
  agentNpcId: string | null;
}

export interface LastCoachConversation {
  date: string;
  stance: string;
  targetId: string;
  club: string | null;
  currentlyRelevant: boolean;
}

export interface PlayerActionFacts {
  requestedMoreMinutes: CoachScopedPlayerActionFactStatus;
  requestedTransfer: ClubScopedPlayerActionFactStatus;
  requestedRenewal: ClubScopedPlayerActionFactStatus;
  askedAgentAboutMarket: AgentScopedPlayerActionFactStatus;
  lastCoachConversation: LastCoachConversation | null;
}

function payloadRecord(value: Record<string, DataValue>): Record<string, DataValue> {
  return value;
}

function payloadString(fact: PlayerActionFact, key: string): string | null {
  const value = payloadRecord(fact.payload)[key];
  return typeof value === "string" && value.length > 0 ? value : null;
}

function payloadInteger(fact: PlayerActionFact, key: string): number | null {
  const value = payloadRecord(fact.payload)[key];
  return typeof value === "number" && Number.isInteger(value) && value >= 0 ? value : null;
}

function dateActive(state: GameState, fact: PlayerActionFact): boolean {
  return fact.expiresAfter === undefined || fact.expiresAfter >= state.date;
}

function latest(facts: readonly PlayerActionFact[]): PlayerActionFact | null {
  let selected: PlayerActionFact | null = null;
  for (const fact of facts) {
    if (!selected || fact.createdDate > selected.createdDate || (
      fact.createdDate === selected.createdDate && fact.factId > selected.factId
    )) selected = fact;
  }
  return selected;
}

function factsOf(state: GameState, kind: PlayerActionFactKind): PlayerActionFact[] {
  return getPlayerActionFacts(state, { kind });
}

function status(
  history: readonly PlayerActionFact[],
  active: readonly PlayerActionFact[]
): PlayerActionFactStatus {
  const lastHistorical = latest(history);
  const lastActive = latest(active);
  return {
    historicalExists: history.length > 0,
    currentlyRelevant: lastActive !== null,
    count: history.length,
    lastDate: lastHistorical?.createdDate ?? null,
    activeDate: lastActive?.createdDate ?? null
  };
}

function acceptedRenewalSinceBaseline(state: GameState, fact: PlayerActionFact, club: string): boolean {
  const baseline = payloadInteger(fact, "marketHistoryCount");
  if (baseline === null) return true;
  const history = state.market?.history ?? [];
  if (baseline > history.length) return true;
  return history.slice(baseline).some(decision =>
    decision.accepted
    && careerOfferKind(decision.offer) === "renewal"
    && decision.offer.before.club === club
    && decision.offer.terms.club === club
  );
}

function coachConversationFacts(state: GameState): PlayerActionFact[] {
  const kinds = new Set<PlayerActionFactKind>([
    "request_more_minutes",
    "request_coach_feedback",
    "coach_role_acknowledged"
  ]);
  return getPlayerActionFacts(state).filter(fact => kinds.has(fact.kind));
}

/**
 * Read-only causal projection. Historical facts are never deleted; live relevance
 * is recomputed from exact current authorities and the scope captured at execution.
 * Missing scope fails closed.
 */
export function playerActionFacts(state: GameState): PlayerActionFacts {
  const currentClub = currentEmploymentClub(state);
  const currentCoach = resolveCurrentCoach(state);
  const currentRepresentation = resolveCurrentRepresentation(state);

  const moreHistory = factsOf(state, "request_more_minutes");
  const moreActive = moreHistory.filter(fact => {
    const club = payloadString(fact, "club");
    const coachNpcId = payloadString(fact, "coachNpcId");
    return dateActive(state, fact)
      && currentClub !== null
      && currentCoach !== null
      && club === currentClub
      && coachNpcId === currentCoach
      && fact.targetId === currentCoach;
  });
  const moreLatest = latest(moreActive);

  const transferHistory = factsOf(state, "request_transfer");
  const transferActive = transferHistory.filter(fact => {
    const club = payloadString(fact, "club");
    return dateActive(state, fact) && currentClub !== null && club === currentClub;
  });
  const transferLatest = latest(transferActive);

  const renewalHistory = factsOf(state, "request_renewal");
  const renewalActive = renewalHistory.filter(fact => {
    const club = payloadString(fact, "club");
    if (!dateActive(state, fact) || currentClub === null || club !== currentClub) return false;
    return !acceptedRenewalSinceBaseline(state, fact, club);
  });
  const renewalLatest = latest(renewalActive);

  const agentHistory = factsOf(state, "ask_agent_market");
  const agentActive = agentHistory.filter(fact => {
    const agentNpcId = payloadString(fact, "agentNpcId");
    return dateActive(state, fact)
      && currentRepresentation !== null
      && agentNpcId === currentRepresentation.agentNpcId
      && fact.targetId === currentRepresentation.agentNpcId;
  });
  const agentLatest = latest(agentActive);

  const conversations = coachConversationFacts(state);
  const lastConversation = latest(conversations);
  const lastConversationClub = lastConversation ? payloadString(lastConversation, "club") : null;
  const lastConversationCoach = lastConversation ? payloadString(lastConversation, "coachNpcId") : null;
  const lastConversationStance = lastConversation
    ? payloadString(lastConversation, "request") ?? payloadString(lastConversation, "stance") ?? "conversation"
    : null;

  return {
    requestedMoreMinutes: {
      ...status(moreHistory, moreActive),
      club: moreLatest ? payloadString(moreLatest, "club") : null,
      coachNpcId: moreLatest ? payloadString(moreLatest, "coachNpcId") : null
    },
    requestedTransfer: {
      ...status(transferHistory, transferActive),
      club: transferLatest ? payloadString(transferLatest, "club") : null
    },
    requestedRenewal: {
      ...status(renewalHistory, renewalActive),
      club: renewalLatest ? payloadString(renewalLatest, "club") : null
    },
    askedAgentAboutMarket: {
      ...status(agentHistory, agentActive),
      agentNpcId: agentLatest ? payloadString(agentLatest, "agentNpcId") : null
    },
    lastCoachConversation: lastConversation && lastConversationStance && lastConversation.targetId
      ? {
          date: lastConversation.createdDate,
          stance: lastConversationStance,
          targetId: lastConversation.targetId,
          club: lastConversationClub,
          currentlyRelevant: dateActive(state, lastConversation)
            && currentClub !== null
            && currentCoach !== null
            && lastConversationClub === currentClub
            && lastConversationCoach === currentCoach
            && lastConversation.targetId === currentCoach
        }
      : null
  };
}
