import type { EventDefinition, GameState } from "../../../core/types.js";
export type StagedRoleBatchEventId = "EVT_34_ROLE_001" | "EVT_34_FAN_001";
export declare function isStagedRoleBatchEligible(state: GameState, eventId: StagedRoleBatchEventId): boolean;
export declare const STAGED_PRINCIPAL_ROLE_BATCH: EventDefinition[];
export declare function eligibleStagedRoleBatch(state: GameState): EventDefinition[];
