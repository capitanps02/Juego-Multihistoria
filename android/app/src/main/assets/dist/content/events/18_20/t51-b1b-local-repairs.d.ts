import type { EventDefinition } from "../../../core/types.js";
/**
 * PUBLIC_HEAT is the canonical composite backed directly by reputation.mediaHeat.
 * The existing 18-20 audit already treats mediaHeat >= 8 as the sufficient
 * public-heat threshold for the same phase (EVT_18_END_002), so this repair
 * reuses that established threshold rather than inventing a second proxy.
 */
export declare const T51_B1B_PUBLIC_HEAT_SUFFICIENT = 8;
/**
 * T5.1 B1b local repairs.
 *
 * - EVT_18_PRS_002: Clara channel OR sufficient PUBLIC_HEAT.
 * - EVT_19_SUM_001: first full summer is only eligible in the absence of an
 *   acute injury. The age/time window already represents the first full summer;
 *   this overlay adds only the missing injury-state prerequisite.
 *
 * Frozen base definitions remain untouched; active definitions are copied only
 * for the exact IDs repaired here.
 */
export declare function applyT51B1bLocalRepairs(events: EventDefinition[]): EventDefinition[];
export declare const T51_B1B_LOCAL_EVENT_IDS: readonly ("EVT_18_PRS_002" | "EVT_19_SUM_001")[];
