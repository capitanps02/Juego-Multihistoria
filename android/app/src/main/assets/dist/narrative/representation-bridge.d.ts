import type { EventDefinition, GameState } from "../core/types.js";
import { type RepresentationContactPolicy, type RepresentationService } from "../simulation/representation-authority.js";
export interface RepresentationChoiceTerms {
    contactPolicy: RepresentationContactPolicy;
    services: readonly RepresentationService[] | "preserve";
}
export interface RepresentationBridgeSpec {
    choices: Record<string, RepresentationChoiceTerms>;
}
export type EventWithRepresentationBridge = EventDefinition & {
    representationBridge?: RepresentationBridgeSpec;
};
export declare function representationBridgeSpec(event: EventDefinition): RepresentationBridgeSpec | undefined;
export declare function representationTermsForChoice(event: EventDefinition, choiceId: string): RepresentationChoiceTerms | undefined;
/**
 * Applies only an explicitly-declared representation choice after the narrative
 * history entry has been persisted. The current agreement must exist; identity-only
 * agent state fails closed.
 */
export declare function applyRepresentationBridgeChoiceInPlace(state: GameState, event: EventDefinition, choiceId: string, outcomeId: string): void;
