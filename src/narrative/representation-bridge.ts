import type { EventDefinition, GameState } from "../core/types.js";
import {
  resolveCurrentRepresentation,
  updateRepresentationTermsInPlace,
  type RepresentationContactPolicy,
  type RepresentationService
} from "../simulation/representation-authority.js";

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

const SERVICES = new Set<RepresentationService>(["market","media","image"]);
const POLICIES = new Set<RepresentationContactPolicy>(["inform_first","broad_delegation"]);

function validTerms(value: unknown): value is RepresentationChoiceTerms {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const row=value as Record<string,unknown>;
  if (Object.keys(row).sort().join(",") !== ["contactPolicy","services"].sort().join(",")) return false;
  if (typeof row.contactPolicy !== "string" || !POLICIES.has(row.contactPolicy as RepresentationContactPolicy)) return false;
  if (row.services === "preserve") return true;
  return Array.isArray(row.services)
    && row.services.length >= 1
    && row.services.length <= 3
    && row.services.every(x => typeof x === "string" && SERVICES.has(x as RepresentationService))
    && new Set(row.services).size === row.services.length;
}

export function representationBridgeSpec(event: EventDefinition): RepresentationBridgeSpec | undefined {
  const spec=(event as EventWithRepresentationBridge).representationBridge;
  if(spec===undefined) return undefined;
  if(!spec || typeof spec!=="object" || Array.isArray(spec) || !spec.choices || typeof spec.choices!=="object") {
    throw new Error(`Invalid representation bridge metadata for ${event.id}`);
  }
  const choiceIds=event.choices.map(choice=>choice.id).sort();
  const mapped=Object.keys(spec.choices).sort();
  if(JSON.stringify(choiceIds)!==JSON.stringify(mapped)) {
    throw new Error(`Representation bridge ${event.id} must map every choice exactly once`);
  }
  for(const [choiceId,terms] of Object.entries(spec.choices)) {
    if(!validTerms(terms)) throw new Error(`Invalid representation terms for ${event.id}/${choiceId}`);
  }
  return spec;
}

export function representationTermsForChoice(
  event: EventDefinition,
  choiceId: string
): RepresentationChoiceTerms | undefined {
  return representationBridgeSpec(event)?.choices[choiceId];
}

/**
 * Applies only an explicitly-declared representation choice after the narrative
 * history entry has been persisted. The current agreement must exist; identity-only
 * agent state fails closed.
 */
export function applyRepresentationBridgeChoiceInPlace(
  state: GameState,
  event: EventDefinition,
  choiceId: string,
  outcomeId: string
): void {
  const terms=representationTermsForChoice(event,choiceId);
  if(!terms) return;
  const current=resolveCurrentRepresentation(state);
  if(!current) throw new Error(`Representation bridge ${event.id}/${choiceId} requires an exact current agreement`);
  const services=terms.services==="preserve" ? [...current.services] : [...terms.services];
  updateRepresentationTermsInPlace(
    state,
    {
      commissionPct:current.commissionPct,
      services,
      contactPolicy:terms.contactPolicy
    },
    `narrative:${event.id}:${choiceId}:${outcomeId}`
  );
}
