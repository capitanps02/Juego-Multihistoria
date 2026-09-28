import type { EventDefinition, GameState } from "../core/types.js";
export type ConsequenceCategory = "sport" | "body" | "relationship" | "reputation" | "career" | "finance";
export interface VisibleConsequence {
    category: ConsequenceCategory;
    label: string;
    delta: number;
    direction: "up" | "down";
    /** null means the sign is informative but not inherently good/bad. */
    favorable: boolean | null;
}
export interface DecisionConsequences {
    visibleEffects: VisibleConsequence[];
    narrativeEffects: string[];
    /** Player-safe deferred/no-immediate-change notices. Never raw internal IDs. */
    hiddenEffects: string[];
}
export interface StructuredSportDeltas {
    formDelta?: number;
    fatigueDelta?: number;
    fitnessDelta?: number;
    coachTrustDelta?: number;
    roleChange?: string;
    careerMilestone?: string;
}
export declare const DEFERRED_CONSEQUENCE_MESSAGE = "Esta decisi\u00F3n puede tener consecuencias m\u00E1s adelante.";
export declare const NO_IMMEDIATE_CHANGE_MESSAGE = "No hay cambios inmediatos.";
export declare function containsInternalJargon(value: string): boolean;
export declare function sanitizePlayerFacingMessage(value: string): string;
export declare function isMeaningfulFeedbackMessage(value: string): boolean;
export declare function playerFacingMessages(messages: readonly string[]): string[];
export declare function buildDecisionConsequences(before: GameState, after: GameState, event: EventDefinition, choiceId: string, outcomeId: string, messages: readonly string[]): DecisionConsequences;
export declare function normalizeConsequenceFields(value: Partial<DecisionConsequences> & {
    messages: readonly string[];
}): DecisionConsequences;
export declare function consequencesFromStructuredSportDeltas(deltas: StructuredSportDeltas): DecisionConsequences;
export interface FeedbackAudit {
    choices: number;
    resolutions: number;
    resolutionsWithVisiblePotential: number;
    resolutionsWithNarrativeFeedback: number;
    resolutionsWithDeferredOrNoChangeFallback: number;
    rawJargonMessages: number;
    playerFacingJargonLeaks: number;
    missing: string[];
}
export declare function auditDecisionFeedback(events: readonly EventDefinition[]): FeedbackAudit;
