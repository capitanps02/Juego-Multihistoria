import type { EventDefinition, GameState } from "../core/types.js";
import type { OfferDisposition } from "../simulation/offers.js";
export interface OfferBridgeSpec {
    /** Every choice closes the currently pending CareerOffer through respondToOffer(). */
    choiceActions: Record<string, OfferDisposition>;
}
export type EventWithOfferBridge = EventDefinition & {
    offerBridge?: OfferBridgeSpec;
};
export declare function offerBridgeSpec(event: EventDefinition): OfferBridgeSpec | undefined;
export declare function offerDispositionForChoice(event: EventDefinition, choiceId: string): OfferDisposition | undefined;
/**
 * Offer bridges are driven by a real pending offer, not by the ordinary narrative budget.
 * Their eligibility is deterministic and consumes no RNG.
 */
export declare function offerBridgeEligible(state: GameState, event: EventDefinition): boolean;
export declare function selectOfferBridgeEvent(state: GameState, source: readonly EventDefinition[]): EventDefinition | null;
