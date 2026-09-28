import type { EventDefinition } from "../../../core/types.js";
/**
 * Staged #123 canonical rewrites. This module deliberately is not added to the active
 * event index until the producer hook and the next serialized content generation land
 * together. That keeps generation H active and prevents a half-integrated bridge.
 */
export declare function applyAge18MarketOfferBridges(events: EventDefinition[]): EventDefinition[];
export declare const AGE18_MARKET_BRIDGE_EVENT_IDS: readonly string[];
