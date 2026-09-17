import type { GameState } from "../core/types.js";
import { type CareerOfferKind } from "./offers.js";
export declare const AGE18_JAN_OFFER_MONTH_DAY = "01-08";
export declare const AGE18_SUMMER_OFFER_MONTH_DAY = "06-04";
/**
 * Materialize the one formal proposal that the canonical age-18 market scene may consume.
 * Exactly one calendar date is eligible in each window, so a failed/no-offer roll cannot
 * silently reroll on every subsequent world day. The function consumes zero RNG draws.
 *
 * This function is intentionally not wired into the world loop by this staging module.
 * Activation must land atomically with the JAN/SUM offerBridge content generation so the
 * generic offer UI can never consume the proposal before its canonical scene.
 */
export declare function materializeAge18MarketOfferInPlace(state: GameState): CareerOfferKind | null;
