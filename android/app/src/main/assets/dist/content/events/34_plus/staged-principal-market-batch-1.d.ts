import type { EventDefinition, GameState } from "../../../core/types.js";
export type StagedMarketBatch1Id = "EVT_34_BRIDGE_001" | "EVT_34_PAY_001" | "EVT_34_HOME_001" | "EVT_34_AGT_001" | "EVT_34_CON_001" | "EVT_34_MAR_001" | "EVT_35_MKT_001" | "EVT_35_CON_001";
export declare function isStagedMarketBatch1Eligible(state: GameState, id: StagedMarketBatch1Id, authoritativeFactsSatisfied: boolean): boolean;
export declare const STAGED_MARKET_BATCH_1: EventDefinition[];
