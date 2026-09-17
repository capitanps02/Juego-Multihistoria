import type { EventDefinition } from "../../../core/types.js";
/**
 * Issue #124 content-side wiring.
 *
 * This overlay deliberately consumes only simulation-owned facts exposed through
 * narrativeConditionRoot(...).facts. It never reconstructs match/calendar truth
 * from roleScore, form, reputation, FIRST_TEAM_ATTENTION, month or seasonDay.
 *
 * Frozen canonical definitions remain untouched; only the four blocked active
 * definitions are copied and repaired here.
 */
export declare function applyT51124SportContextRepairs(events: EventDefinition[]): EventDefinition[];
export declare const T51_124_SPORT_CONTEXT_EVENT_IDS: readonly ("EVT_18_MATCH_001" | "EVT_18_PRS_001" | "EVT_18_SOC_001" | "EVT_18_END_001")[];
