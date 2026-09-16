import { knowledgeRequirementsFor } from "../catalog/npc-knowledge-rules.js";
import { conditionsPass } from "../core/conditions.js";
import { npcKnows } from "../core/npc-knowledge.js";
import type { EventDefinition, GameState } from "../core/types.js";
import type { OfferDisposition } from "../simulation/offers.js";
import { eligibleChoices } from "./choice-eligibility.js";
import { eventGatesPass } from "./event-gates.js";

export interface OfferBridgeSpec {
  /** Every choice closes the currently pending CareerOffer through respondToOffer(). */
  choiceActions: Record<string, OfferDisposition>;
}

export type EventWithOfferBridge = EventDefinition & { offerBridge?: OfferBridgeSpec };

const DISPOSITIONS = new Set<OfferDisposition>(["accept", "reject", "delegate", "counter", "defer"]);

export function offerBridgeSpec(event: EventDefinition): OfferBridgeSpec | undefined {
  const spec = (event as EventWithOfferBridge).offerBridge;
  if (spec === undefined) return undefined;
  if (!spec || typeof spec !== "object" || Array.isArray(spec) || !spec.choiceActions || typeof spec.choiceActions !== "object") {
    throw new Error(`Invalid offer bridge metadata for ${event.id}`);
  }
  const choiceIds = event.choices.map(choice => choice.id).sort();
  const mappedIds = Object.keys(spec.choiceActions).sort();
  if (JSON.stringify(choiceIds) !== JSON.stringify(mappedIds)) {
    throw new Error(`Offer bridge ${event.id} must map every choice exactly once`);
  }
  for (const [choiceId, action] of Object.entries(spec.choiceActions)) {
    if (!DISPOSITIONS.has(action)) throw new Error(`Invalid offer disposition ${String(action)} for ${event.id}/${choiceId}`);
  }
  return spec;
}

export function offerDispositionForChoice(event: EventDefinition, choiceId: string): OfferDisposition | undefined {
  return offerBridgeSpec(event)?.choiceActions[choiceId];
}

function monthOf(date: string): number { return Number(date.slice(5, 7)); }

function timeWindowPass(state: GameState, event: EventDefinition): boolean {
  const window = event.timeWindow;
  if (!window) return true;
  const month = monthOf(state.date);
  if (window.months && !window.months.includes(month)) return false;
  if (window.minSeasonDay !== undefined && state.runtime.seasonDay < window.minSeasonDay) return false;
  if (window.maxSeasonDay !== undefined && state.runtime.seasonDay > window.maxSeasonDay) return false;
  return true;
}

function knowledgePass(state: GameState, event: EventDefinition): boolean {
  return knowledgeRequirementsFor(event.id).every(requirement => npcKnows(state, requirement.npcId, requirement.factId));
}

/**
 * Offer bridges are driven by a real pending offer, not by the ordinary narrative budget.
 * Their eligibility is deterministic and consumes no RNG.
 */
export function offerBridgeEligible(state: GameState, event: EventDefinition): boolean {
  if (!state.market?.pending || !offerBridgeSpec(event)) return false;
  const maxAge = event.ageWindow[1] ?? Infinity;
  if (state.age < event.ageWindow[0] || state.age > maxAge || state.phase !== event.phase) return false;
  if ((state.eventCooldowns[event.id] ?? 0) > 0 || (!event.repeatable && state.flags[`SEEN_${event.id}`] === true)) return false;
  if (!timeWindowPass(state, event) || !eventGatesPass(state, event) || !knowledgePass(state, event)) return false;
  if (event.exclusions?.some(condition => conditionsPass(state, [condition]))) return false;
  return eligibleChoices(state, event).length > 0;
}

export function selectOfferBridgeEvent(state: GameState, source: readonly EventDefinition[]): EventDefinition | null {
  if (!state.market?.pending) return null;
  const eligible = source.filter(event => offerBridgeEligible(state, event));
  if (eligible.length > 1) {
    throw new Error(`Ambiguous offer bridge for ${state.market.pending.id}: ${eligible.map(event => event.id).join(", ")}`);
  }
  return eligible[0] ?? null;
}