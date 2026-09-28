import type { EventDefinition, GameState } from "../../../core/types.js";
export type StagedWaveAEventId = "EVT_35_FAM_001" | "EVT_35_BODY_001" | "EVT_35_IMG_001" | "EVT_36_MED_001";
export declare function isStagedWaveAEligible(state: GameState, eventId: StagedWaveAEventId): boolean;
export declare const STAGED_PRINCIPAL_WAVE_A: EventDefinition[];
export declare function eligibleStagedPrincipalWaveA(state: GameState): EventDefinition[];
