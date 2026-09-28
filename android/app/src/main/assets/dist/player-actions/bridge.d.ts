import type { GameState } from "../core/types.js";
export declare const PLAYER_ACTION_TRANSFER_MARKET_THRESHOLD_BONUS = 12;
/**
 * System-authority input only. The Player Action never creates an offer; the
 * existing market producer may use this threshold with its existing deterministic
 * roll. With zero actions the exact historical threshold is returned unchanged.
 */
export declare function transferRequestExternalMarketThreshold(state: GameState, baseThreshold: number): number;
