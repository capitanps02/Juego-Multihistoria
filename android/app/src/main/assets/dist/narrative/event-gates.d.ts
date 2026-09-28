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
export declare function gateAlternatives(event: EventDefinition): Condition[][] | undefined;
export declare function eventGatesPass(state: GameState, event: EventDefinition): boolean;
