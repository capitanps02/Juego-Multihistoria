import { playerActionFacts } from "./facts.js";
export const PLAYER_ACTION_TRANSFER_MARKET_THRESHOLD_BONUS = 12;
/**
 * System-authority input only. The Player Action never creates an offer; the
 * existing market producer may use this threshold with its existing deterministic
 * roll. With zero actions the exact historical threshold is returned unchanged.
 */
export function transferRequestExternalMarketThreshold(state, baseThreshold) {
    if (!Number.isFinite(baseThreshold))
        return baseThreshold;
    if (!playerActionFacts(state).requestedTransfer.currentlyRelevant)
        return baseThreshold;
    return Math.min(100, Math.max(0, baseThreshold + PLAYER_ACTION_TRANSFER_MARKET_THRESHOLD_BONUS));
}
