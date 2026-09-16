import { conditionsPass } from "../core/conditions.js";
import type { Condition, EventDefinition, GameState } from "../core/types.js";

/**
 * Optional additive event-gate contract.
 *
 * `event.gates` remain mandatory common conditions (AND).
 * `gateAny` adds alternative causal routes: each inner group is AND, while the
 * groups themselves are OR. Therefore the complete expression is:
 *
 *   event.gates AND (gateAny[0] OR gateAny[1] OR ...)
 *
 * Historical events without `gateAny` keep exactly their previous behavior.
 */
export type AlternativeGateGroups = Condition[][];
export type EventWithAlternativeGates = EventDefinition & { gateAny?: AlternativeGateGroups };

export function alternativeGateGroups(event: EventDefinition): AlternativeGateGroups | undefined {
  return (event as EventWithAlternativeGates).gateAny;
}

/**
 * Fail closed for malformed opt-in data: `gateAny: []` and empty inner groups do
 * not turn an event into an unconditional route.
 */
export function eventGatesPass(state: GameState, event: EventDefinition): boolean {
  if (!conditionsPass(state, event.gates)) return false;
  const alternatives = alternativeGateGroups(event);
  if (alternatives === undefined) return true;
  if (alternatives.length === 0) return false;
  return alternatives.some(group => group.length > 0 && conditionsPass(state, group));
}

/**
 * Ergonomic constructor for event modules that do not use a higher-level helper.
 * It returns a new definition and never mutates the supplied event.
 */
export function withAlternativeGates<T extends EventDefinition>(
  event: T,
  gateAny: AlternativeGateGroups
): T & EventWithAlternativeGates {
  return { ...event, gateAny };
}
