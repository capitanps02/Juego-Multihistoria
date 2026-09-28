import type { OfferDisposition } from "../simulation/offers.js";
export interface FrozenOfferBridgeEventEvidence {
    eventFingerprint: string;
    choiceActions: Readonly<Record<string, OfferDisposition>>;
}
export declare const FROZEN_OFFER_BRIDGE_SOURCES: Readonly<Record<string, Readonly<Record<string, FrozenOfferBridgeEventEvidence>>>>;
