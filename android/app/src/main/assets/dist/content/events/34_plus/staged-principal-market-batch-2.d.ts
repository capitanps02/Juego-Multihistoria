import type { EventDefinition, GameState } from "../../../core/types.js";
export declare const STAGED_MARKET_BATCH_2: EventDefinition[];
export declare function isStagedMarketBatch2Eligible(state: GameState, id: string, authoritativeFactsSatisfied: boolean): boolean;
