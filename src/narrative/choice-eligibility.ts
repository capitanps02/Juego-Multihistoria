import { conditionsPass } from "../core/conditions.js";
import type { ChoiceDefinition, Condition, EventDefinition, GameState } from "../core/types.js";

/**
 * Additive compatibility contract for canonical choices whose availability depends on state.
 *
 * `ChoiceDefinition` remains wire-compatible with historical content: choices without
 * `eligibility` are always available. Canonical content can opt in without changing
 * save schema or event identity semantics outside the event definition itself.
 */
export type ChoiceWithEligibility = ChoiceDefinition & { eligibility?: Condition[] };

export function choiceEligibility(choice: ChoiceDefinition): Condition[] {
  return (choice as ChoiceWithEligibility).eligibility ?? [];
}

export function isChoiceEligible(state: GameState, choice: ChoiceDefinition): boolean {
  return conditionsPass(state, choiceEligibility(choice));
}

export function eligibleChoices(state: GameState, event: EventDefinition): ChoiceDefinition[] {
  return event.choices.filter(choice => isChoiceEligible(state, choice));
}

/**
 * Materialize the event as it may be shown/resolved in the current state.
 * The canonical definition is never mutated.
 */
export function eventWithEligibleChoices(state: GameState, event: EventDefinition): EventDefinition {
  const choices = eligibleChoices(state, event);
  if (choices.length === event.choices.length) return event;
  return { ...event, choices };
}
