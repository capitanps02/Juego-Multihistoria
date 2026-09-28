import type { EventDefinition, GameState } from "../../../core/types.js";
export type StagedSportBatchEventId = "EVT_34_LOAD_001" | "EVT_34_BODY_001" | "EVT_35_BENCH_001";
export declare function isStagedSportBatchEligible(state: GameState, eventId: StagedSportBatchEventId): boolean;
export declare const STAGED_PRINCIPAL_SPORT_BATCH: EventDefinition[];
export declare function eligibleStagedSportBatch(state: GameState): EventDefinition[];
