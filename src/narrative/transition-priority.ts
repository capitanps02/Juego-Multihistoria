import type { EventDefinition, GameState } from "../core/types.js";

/**
 * Opt-in tag for canonical scenes that must win scheduling at a career phase boundary.
 * The tag does not make gates true and does not bypass knowledge, cooldowns or choice eligibility.
 */
export const MANDATORY_TRANSITION_TAG = "mandatory_transition";
export const MANDATORY_TRANSITION_GRACE_DAYS = 14;

const PHASE_BOUNDARY_AGES = new Set([20, 23, 26, 30, 34]);

/**
 * Priority is deliberately narrow: only the first 15 season days at the exact lower age
 * boundary of the event. Outside this window the event falls back to ordinary scheduling.
 */
export function mandatoryTransitionPriorityActive(state: GameState, event: EventDefinition): boolean {
  if (!(event.tags ?? []).includes(MANDATORY_TRANSITION_TAG)) return false;
  if (!PHASE_BOUNDARY_AGES.has(state.age)) return false;
  if (event.ageWindow[0] !== state.age) return false;
  return state.runtime.seasonDay >= 0 && state.runtime.seasonDay <= MANDATORY_TRANSITION_GRACE_DAYS;
}

/**
 * Helper for content owners. Existing EventDefinition stays unchanged; adding the tag to a
 * concrete scene is an explicit catalog/contentIdentity change owned by that canonical batch.
 */
export function withMandatoryTransitionPriority<T extends EventDefinition>(event: T): T {
  const tags = [...new Set([...(event.tags ?? []), MANDATORY_TRANSITION_TAG])];
  return { ...event, tags };
}
