import type { EventDefinition } from "../../../core/types.js";
import type { EventWithGateAlternatives } from "../../../narrative/event-gates.js";

/**
 * PUBLIC_HEAT is the canonical composite backed directly by reputation.mediaHeat.
 * The existing 18-20 audit already treats mediaHeat >= 8 as the sufficient
 * public-heat threshold for the same phase (EVT_18_END_002), so this repair
 * reuses that established threshold rather than inventing a second proxy.
 */
export const T51_B1B_PUBLIC_HEAT_SUFFICIENT = 8;

const REPAIR_IDS = ["EVT_18_PRS_002"] as const;

/**
 * T5.1 B1b local repair.
 *
 * Canon for EVT_18_PRS_002 opens "Lo que Clara sabe" when either:
 *   A) the Clara channel is already open; OR
 *   B) PUBLIC_HEAT is sufficient.
 *
 * The frozen base definition only implemented route A. Keep the historical base
 * object untouched and layer the exact OR reachability onto a fresh definition.
 * Choices, outcomes, NPC refs, seeds, timing and text remain unchanged.
 */
export function applyT51B1bLocalRepairs(events: EventDefinition[]): EventDefinition[] {
  let found = false;

  const repaired = events.map(event => {
    if (event.id !== "EVT_18_PRS_002") return event;
    found = true;

    const gateAlternatives: NonNullable<EventWithGateAlternatives["gateAlternatives"]> = [
      [{ path: "flags.CLARA_CONTACTED", op: "eq", value: true }],
      [{ path: "reputation.mediaHeat", op: "gte", value: T51_B1B_PUBLIC_HEAT_SUFFICIENT }]
    ];

    return {
      ...event,
      // The previous CLARA_CONTACTED gate becomes one OR route rather than a
      // common prerequisite, otherwise the public-heat route could never open.
      gates: [],
      gateAlternatives
    } satisfies EventWithGateAlternatives;
  });

  if (!found) throw new Error("T5.1 B1b missing expected 18-20 event: EVT_18_PRS_002");
  return repaired;
}

export const T51_B1B_LOCAL_EVENT_IDS = Object.freeze([...REPAIR_IDS]);
