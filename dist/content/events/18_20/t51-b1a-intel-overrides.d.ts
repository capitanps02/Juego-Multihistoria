import type { EventDefinition } from "../../../core/types.js";
/**
 * T5.1 B1a: restore only the player-facing information certified by the
 * Documento Maestro for three stable-ID 18–20 scenes.
 *
 * Options, outcomes, effects, seeds, gates, timing and IDs remain untouched.
 * Returning fresh objects prevents the repair layer from mutating the frozen
 * base definitions used as pre-T5.1 compatibility evidence.
 */
export declare function applyT51B1aIntelRepairs(events: EventDefinition[]): EventDefinition[];
export declare const T51_B1A_INTEL_EVENT_IDS: readonly string[];
