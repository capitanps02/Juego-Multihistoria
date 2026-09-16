import { conditionsPass } from "../core/conditions.js";
import type { Condition, EventDefinition, GameState } from "../core/types.js";

/**
 * Optional event-level OR contract.
 *
 * `event.gates` keeps its historical AND semantics and represents prerequisites
 * shared by every causal route. `gateAlternatives`, when present, contains
 * alternative routes: each inner group is AND, while the groups are OR.
 *
 * Example: common AND ((A AND B) OR C).
 *
 * The extension is additive and intentionally lives outside EventDefinition so
 * historical event payloads and the core Condition comparator contract remain
 * unchanged until a canonical scene opts in.
 */
export type EventWithGateAlternatives = EventDefinition & {
  gateAlternatives?: Condition[][];
};

export function gateAlternatives(event: EventDefinition): Condition[][] | undefined {
  return (event as EventWithGateAlternatives).gateAlternatives;
}

export function eventGatesPass(state: GameState, event: EventDefinition): boolean {
  if (!conditionsPass(state, event.gates)) return false;

  const alternatives = gateAlternatives(event);
  if (alternatives === undefined) return true;

  // Explicit but malformed/empty alternative sets fail closed rather than
  // accidentally widening a scene to unconditional reachability.
  if (!Array.isArray(alternatives) || alternatives.length === 0) return false;

  return alternatives.some(group =>
    Array.isArray(group) && group.length > 0 && conditionsPass(state, group)
  );
}
