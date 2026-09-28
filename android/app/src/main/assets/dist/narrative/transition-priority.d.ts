import type { EventDefinition, GameState } from "../core/types.js";
/**
 * Opt-in tag for canonical scenes that must win scheduling at a career phase boundary.
 * The tag does not make gates true and does not bypass knowledge, cooldowns or choice eligibility.
 */
export declare const MANDATORY_TRANSITION_TAG = "mandatory_transition";
export declare const MANDATORY_TRANSITION_GRACE_DAYS = 14;
/**
 * Priority is deliberately narrow: only the first 15 season days at the exact lower age
 * boundary of the event. Outside this window the event falls back to ordinary scheduling.
 */
export declare function mandatoryTransitionPriorityActive(state: GameState, event: EventDefinition): boolean;
/**
 * Helper for content owners. Existing EventDefinition stays unchanged; adding the tag to a
 * concrete scene is an explicit catalog/contentIdentity change owned by that canonical batch.
 */
export declare function withMandatoryTransitionPriority<T extends EventDefinition>(event: T): T;
