import { knowledgeRequirementsFor } from "../catalog/npc-knowledge-rules.js";
import { conditionsPass } from "../core/conditions.js";
import { npcKnows } from "../core/npc-knowledge.js";
import type { EventDefinition, GameState } from "../core/types.js";
import { EVENTS_34_PLUS } from "../content/events/34_plus/index.js";
import { a8CanonicalRuntimeEligible } from "./a8-runtime-eligibility.js";
import { eligibleChoices } from "./choice-eligibility.js";
import { eventGatesPass } from "./event-gates.js";
import { narrativeGuardsPass } from "./narrative-guards.js";

export const RETIREMENT_DECISION_EVENT_ID = "EVT_RET_FAM_001";

function retirementDecisionEvent(): EventDefinition | null {
  return EVENTS_34_PLUS.find(event => event.id === RETIREMENT_DECISION_EVENT_ID) ?? null;
}

function timeWindowPasses(state: GameState, event: EventDefinition): boolean {
  const window = event.timeWindow;
  if (!window) return true;
  const month = Number(state.date.slice(5, 7));
  if (window.months && !window.months.includes(month)) return false;
  if (window.minSeasonDay !== undefined && state.runtime.seasonDay < window.minSeasonDay) return false;
  if (window.maxSeasonDay !== undefined && state.runtime.seasonDay > window.maxSeasonDay) return false;
  return true;
}

/**
 * Read-only eligibility for the player-initiated "Considerar retirada" action.
 *
 * The canonical retirement scene remains the authority. This helper deliberately
 * bypasses scheduler rhythm/period-budget selection because the player is asking
 * to open the decision surface explicitly; it does not bypass the event's actual
 * age/phase, cooldown, canonical runtime, gates, guards, exclusions, knowledge or
 * choice eligibility.
 *
 * No RNG is consumed and no GameState field is written.
 */
export function retirementDecisionAvailable(state: GameState): boolean {
  const event = retirementDecisionEvent();
  if (!event) return false;

  const maxAge = event.ageWindow[1] ?? Infinity;
  if (state.age < event.ageWindow[0] || state.age > maxAge || state.phase !== event.phase) return false;
  if (!a8CanonicalRuntimeEligible(state, event)) return false;
  if ((state.eventCooldowns[event.id] ?? 0) > 0) return false;
  if (!event.repeatable && state.flags[`SEEN_${event.id}`] === true) return false;
  if (!timeWindowPasses(state, event)) return false;
  if (!eventGatesPass(state, event) || !narrativeGuardsPass(state, event)) return false;
  if (event.exclusions?.some(condition => conditionsPass(state, [condition]))) return false;
  if (!knowledgeRequirementsFor(event.id).every(requirement => npcKnows(state, requirement.npcId, requirement.factId))) return false;

  return eligibleChoices(state, event).length > 0;
}
