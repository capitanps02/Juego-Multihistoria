import type { ChoiceDefinition, Condition, EventDefinition, GameState } from "../core/types.js";
/**
 * Additive compatibility contract for canonical choices whose availability depends on state.
 *
 * `ChoiceDefinition` remains wire-compatible with historical content: choices without
 * `eligibility` are always available. Canonical content can opt in without changing
 * save schema or event identity semantics outside the event definition itself.
 */
export type ChoiceWithEligibility = ChoiceDefinition & {
    eligibility?: Condition[];
};
export declare function choiceEligibility(choice: ChoiceDefinition): Condition[];
export declare function isChoiceEligible(state: GameState, choice: ChoiceDefinition): boolean;
export declare function eligibleChoices(state: GameState, event: EventDefinition): ChoiceDefinition[];
/**
 * Materialize the event as it may be shown/resolved in the current state.
 * The canonical definition is never mutated.
 */
export declare function eventWithEligibleChoices(state: GameState, event: EventDefinition): EventDefinition;
