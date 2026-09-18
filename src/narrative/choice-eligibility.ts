import { conditionsPass } from "../core/conditions.js";
import { getPath } from "../core/path.js";
import type { ChoiceDefinition, Condition, Effect, EventDefinition, GameState } from "../core/types.js";
import { narrativeConditionRoot } from "../simulation/club-contract-intent.js";
import { currentEmploymentClub } from "../simulation/employment.js";

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

function effectRequiresFormalEmploymentAuthority(state: GameState, effect: Effect): boolean {
  if (currentEmploymentClub(state) !== null) return false;
  if (effect.kind === "flag") return effect.value === true && EMPLOYMENT_FLAGS.has(effect.flag);
  if (!EMPLOYMENT_TERM_PATHS.has(effect.path)) return false;
  const current = getPath(state, effect.path);
  if (effect.kind === "set") return !Object.is(current, effect.value);
  if (typeof current !== "number") return true;
  const next = Math.min(effect.max ?? Infinity, Math.max(effect.min ?? -Infinity, current + effect.delta));
  return !Object.is(current, next);
}

function choiceRequiresFormalEmploymentAuthority(
  state: GameState,
  event: EventDefinition,
  choice: ChoiceDefinition
): boolean {
  if (currentEmploymentClub(state) !== null) return false;
  const outcomes = event.outcomes.filter(outcome => choice.outcomeIds.includes(outcome.id));
  const effects = [
    ...(choice.immediateEffects ?? []),
    ...(choice.hiddenCosts ?? []),
    ...outcomes.flatMap(outcome => outcome.effects)
  ];
  return effects.some(effect => effectRequiresFormalEmploymentAuthority(state, effect));
}

export function eligibleChoices(state: GameState, event: EventDefinition): ChoiceDefinition[] {
  return event.choices.filter(choice =>
    isChoiceEligible(state, choice)
    && !choiceRequiresFormalEmploymentAuthority(state, event, choice)
  );
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
