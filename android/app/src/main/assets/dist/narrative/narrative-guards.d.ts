import type { EventDefinition, GameState } from "../core/types.js";
export type NarrativeGuardSpec = {
    id: "requiresRecentMatch";
    maxDays?: number;
    minMinutes?: number;
} | {
    id: "requiresRecentStart";
    maxDays?: number;
    minMinutes?: number;
} | {
    id: "requiresRecentGoal";
    maxDays?: number;
} | {
    id: "requiresCurrentCoach";
    npcId?: string;
} | {
    id: "requiresRecentCoachChange";
    maxDays?: number;
    previousCoachNpcId?: string;
    newCoachNpcId?: string;
} | {
    id: "requiresCurrentClub";
    club?: string;
} | {
    id: "requiresActiveContract";
} | {
    id: "requiresInjury";
} | {
    id: "requiresCareerOffer";
    minCount?: number;
} | {
    id: "requiresTransferOffer";
    minCount?: number;
} | {
    id: "requiresInternationalCallup";
    stage?: "preliminary" | "final";
    membership?: "selected" | "omitted" | "withdrawn";
} | {
    id: "requiresActiveCareer";
};
export interface NarrativeGuardResult {
    guard: NarrativeGuardSpec["id"];
    pass: boolean;
    reason?: string;
}
export type EventWithNarrativeGuards = EventDefinition & {
    narrativeGuards?: NarrativeGuardSpec[];
};
export declare function narrativeGuardsFor(event: EventDefinition): readonly NarrativeGuardSpec[];
export declare function canonicalInjuryActive(state: GameState): boolean;
export declare function evaluateNarrativeGuard(state: GameState, spec: NarrativeGuardSpec): NarrativeGuardResult;
export declare function narrativeGuardFailures(state: GameState, event: EventDefinition): NarrativeGuardResult[];
export declare function narrativeGuardsPass(state: GameState, event: EventDefinition): boolean;
