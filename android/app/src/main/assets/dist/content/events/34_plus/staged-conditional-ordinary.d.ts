import type { EventDefinition, GameState } from "../../../core/types.js";
export interface StagedCanonicalConditional {
    event: EventDefinition;
    status: "AWAITING_EXTERNAL_FACT";
    canonicalTrigger: string;
    canonicalMeaning: string;
}
export declare const STAGED_ORDINARY_CANONICAL_CONDITIONALS: readonly StagedCanonicalConditional[];
export declare function stagedCanonicalConditional(id: string): StagedCanonicalConditional | null;
export declare function stagedCanonicalConditionalEligible(state: GameState, id: string, authoritativeTriggerSatisfied: boolean): boolean;
