import { conditionsPass } from "../core/conditions.js";
export function choiceEligibility(choice) {
    return choice.eligibility ?? [];
}
export function isChoiceEligible(state, choice) {
    return conditionsPass(state, choiceEligibility(choice));
}
export function eligibleChoices(state, event) {
    return event.choices.filter(choice => isChoiceEligible(state, choice));
}
/**
 * Materialize the event as it may be shown/resolved in the current state.
 * The canonical definition is never mutated.
 */
export function eventWithEligibleChoices(state, event) {
    const choices = eligibleChoices(state, event);
    if (choices.length === event.choices.length)
        return event;
    return { ...event, choices };
}
