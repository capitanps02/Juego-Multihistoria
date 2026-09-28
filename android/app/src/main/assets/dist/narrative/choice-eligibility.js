import { conditionsPass } from "../core/conditions.js";
import { getPath } from "../core/path.js";
import { narrativeConditionRoot } from "../simulation/club-contract-intent.js";
export function choiceEligibility(choice) {
    return choice.eligibility ?? [];
}
export function isChoiceEligible(state, choice) {
    return conditionsPass(narrativeConditionRoot(state), choiceEligibility(choice));
}
const EMPLOYMENT_TERM_PATHS = new Set([
    "club",
    "professional.ownerClub",
    "professional.registrationClub",
    "world.ownerClub",
    "professional.route",
    "contract.monthsRemaining",
    "contract.salaryMonthly",
    "contract.releaseClause"
]);
const EMPLOYMENT_FLAGS = new Set(["LOAN_ACTIVE", "ABROAD_ROUTE", "BIG_CLUB"]);
function effectRequiresFormalEmploymentAuthority(state, effect) {
    if (effect.kind === "flag") {
        if (!EMPLOYMENT_FLAGS.has(effect.flag))
            return false;
        return !Object.is(Boolean(state.flags[effect.flag]), effect.value);
    }
    if (!EMPLOYMENT_TERM_PATHS.has(effect.path))
        return false;
    const current = getPath(state, effect.path);
    if (effect.kind === "set")
        return !Object.is(current, effect.value);
    if (typeof current !== "number")
        return true;
    const next = Math.min(effect.max ?? Infinity, Math.max(effect.min ?? -Infinity, current + effect.delta));
    return !Object.is(current, next);
}
function choiceRequiresFormalEmploymentAuthority(state, event, choice) {
    const outcomes = event.outcomes.filter(outcome => choice.outcomeIds.includes(outcome.id));
    const effects = [
        ...(choice.immediateEffects ?? []),
        ...(choice.hiddenCosts ?? []),
        ...outcomes.flatMap(outcome => outcome.effects)
    ];
    return effects.some(effect => effectRequiresFormalEmploymentAuthority(state, effect));
}
export function eligibleChoices(state, event) {
    return event.choices.filter(choice => isChoiceEligible(state, choice)
        && !choiceRequiresFormalEmploymentAuthority(state, event, choice));
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
