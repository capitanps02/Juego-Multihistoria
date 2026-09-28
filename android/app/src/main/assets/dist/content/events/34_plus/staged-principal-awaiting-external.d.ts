import type { EventDefinition, GameState } from "../../../core/types.js";
export type ExternalPrincipalStatus = "AWAITING_EXTERNAL_FACT";
export interface StagedExternalPrincipal {
    event: EventDefinition;
    status: ExternalPrincipalStatus;
    requiredFacts: readonly string[];
    forbiddenProxies: readonly string[];
    terminalChoiceIds: readonly string[];
}
export declare const STAGED_EXTERNAL_PRINCIPALS: readonly StagedExternalPrincipal[];
export declare function stagedExternalPrincipal(eventId: string): StagedExternalPrincipal | null;
/**
 * Fail closed until a future owner-specific adapter supplies exact factual gates.
 * The boolean argument must come from a shared authoritative resolver, never a narrative proxy.
 */
export declare function stagedExternalPrincipalEligible(state: GameState, eventId: string, authoritativeFactsSatisfied: boolean): boolean;
