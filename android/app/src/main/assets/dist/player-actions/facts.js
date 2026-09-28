import { currentEmploymentClub } from "../simulation/employment.js";
import { careerOfferKind } from "../simulation/offers.js";
import { resolveCurrentCoach } from "../simulation/npc-authority.js";
import { resolveCurrentRepresentation } from "../simulation/representation-authority.js";
import { getPlayerActionFacts } from "./action-state.js";
function payloadRecord(value) {
    return value;
}
function payloadString(fact, key) {
    const value = payloadRecord(fact.payload)[key];
    return typeof value === "string" && value.length > 0 ? value : null;
}
function payloadInteger(fact, key) {
    const value = payloadRecord(fact.payload)[key];
    return typeof value === "number" && Number.isInteger(value) && value >= 0 ? value : null;
}
function dateActive(state, fact) {
    return fact.expiresAfter === undefined || fact.expiresAfter >= state.date;
}
function latest(facts) {
    let selected = null;
    for (const fact of facts) {
        if (!selected || fact.createdDate > selected.createdDate || (fact.createdDate === selected.createdDate && fact.factId > selected.factId))
            selected = fact;
    }
    return selected;
}
function factAfter(candidate, baseline) {
    return candidate.createdDate > baseline.createdDate || (candidate.createdDate === baseline.createdDate && candidate.factId > baseline.factId);
}
function priorityValue(fact) {
    if (!fact)
        return null;
    const value = payloadString(fact, "priority");
    return value === "minutes" || value === "salary" || value === "stability" || value === "club_level"
        ? value
        : null;
}
function factsOf(state, kind) {
    return getPlayerActionFacts(state, { kind });
}
function status(history, active) {
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
function acceptedRenewalSinceBaseline(state, fact, club) {
    const baseline = payloadInteger(fact, "marketHistoryCount");
    if (baseline === null)
        return true;
    const history = state.market?.history ?? [];
    if (baseline > history.length)
        return true;
    return history.slice(baseline).some(decision => decision.accepted
        && careerOfferKind(decision.offer) === "renewal"
        && decision.offer.before.club === club
        && decision.offer.terms.club === club);
}
function coachConversationFacts(state) {
    const kinds = new Set([
        "request_more_minutes",
        "request_coach_feedback",
        "coach_role_acknowledged",
        "request_position_change"
    ]);
    return getPlayerActionFacts(state).filter(fact => kinds.has(fact.kind));
}
/**
 * Read-only causal projection. Historical facts are never deleted; live relevance
 * is recomputed from exact current authorities and the scope captured at execution.
 * Missing scope fails closed.
 */
export function playerActionFacts(state) {
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
    const positionHistory = factsOf(state, "request_position_change");
    const positionActive = positionHistory.filter(fact => {
        const club = payloadString(fact, "club");
        const coachNpcId = payloadString(fact, "coachNpcId");
        return dateActive(state, fact)
            && currentClub !== null
            && currentCoach !== null
            && club === currentClub
            && coachNpcId === currentCoach
            && fact.targetId === currentCoach;
    });
    const positionLatest = latest(positionActive);
    const transferHistory = factsOf(state, "request_transfer");
    const withdrawHistory = factsOf(state, "withdraw_transfer_request");
    const transferActive = transferHistory.filter(fact => {
        const club = payloadString(fact, "club");
        if (!dateActive(state, fact) || currentClub === null || club !== currentClub)
            return false;
        return !withdrawHistory.some(withdraw => payloadString(withdraw, "club") === club && factAfter(withdraw, fact));
    });
    const transferLatest = latest(transferActive);
    const withdrawActive = withdrawHistory.filter(fact => {
        const club = payloadString(fact, "club");
        if (currentClub === null || club !== currentClub)
            return false;
        return !transferHistory.some(request => payloadString(request, "club") === club && factAfter(request, fact));
    });
    const withdrawLatest = latest(withdrawActive);
    const renewalHistory = factsOf(state, "request_renewal");
    const renewalActive = renewalHistory.filter(fact => {
        const club = payloadString(fact, "club");
        if (!dateActive(state, fact) || currentClub === null || club !== currentClub)
            return false;
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
    const priorityHistory = factsOf(state, "career_priority");
    const priorityActive = priorityHistory.filter(fact => {
        const agentNpcId = payloadString(fact, "agentNpcId");
        return dateActive(state, fact)
            && currentRepresentation !== null
            && agentNpcId === currentRepresentation.agentNpcId
            && fact.targetId === currentRepresentation.agentNpcId
            && priorityValue(fact) !== null;
    });
    const priorityLatest = latest(priorityActive);
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
        requestedPositionChange: {
            ...status(positionHistory, positionActive),
            club: positionLatest ? payloadString(positionLatest, "club") : null,
            coachNpcId: positionLatest ? payloadString(positionLatest, "coachNpcId") : null
        },
        requestedTransfer: {
            ...status(transferHistory, transferActive),
            club: transferLatest ? payloadString(transferLatest, "club") : null
        },
        transferRequestWithdrawn: {
            ...status(withdrawHistory, withdrawActive),
            club: withdrawLatest ? payloadString(withdrawLatest, "club") : null
        },
        requestedRenewal: {
            ...status(renewalHistory, renewalActive),
            club: renewalLatest ? payloadString(renewalLatest, "club") : null
        },
        askedAgentAboutMarket: {
            ...status(agentHistory, agentActive),
            agentNpcId: agentLatest ? payloadString(agentLatest, "agentNpcId") : null
        },
        careerPriority: {
            ...status(priorityHistory, priorityActive),
            agentNpcId: priorityLatest ? payloadString(priorityLatest, "agentNpcId") : null,
            priority: priorityValue(priorityLatest)
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
