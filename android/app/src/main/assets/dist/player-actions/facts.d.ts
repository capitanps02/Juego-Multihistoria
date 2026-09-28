import type { GameState } from "../core/types.js";
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
export interface CareerPriorityFactStatus extends AgentScopedPlayerActionFactStatus {
    priority: "minutes" | "salary" | "stability" | "club_level" | null;
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
    requestedPositionChange: CoachScopedPlayerActionFactStatus;
    requestedTransfer: ClubScopedPlayerActionFactStatus;
    transferRequestWithdrawn: ClubScopedPlayerActionFactStatus;
    requestedRenewal: ClubScopedPlayerActionFactStatus;
    askedAgentAboutMarket: AgentScopedPlayerActionFactStatus;
    careerPriority: CareerPriorityFactStatus;
    lastCoachConversation: LastCoachConversation | null;
}
/**
 * Read-only causal projection. Historical facts are never deleted; live relevance
 * is recomputed from exact current authorities and the scope captured at execution.
 * Missing scope fails closed.
 */
export declare function playerActionFacts(state: GameState): PlayerActionFacts;
