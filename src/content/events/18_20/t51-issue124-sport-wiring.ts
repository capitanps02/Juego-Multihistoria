import type { Condition, EventDefinition } from "../../../core/types.js";
import type { EventWithGateAlternatives } from "../../../narrative/event-gates.js";

const REPAIR_IDS = [
  "EVT_18_MATCH_001",
  "EVT_18_PRS_001",
  "EVT_18_SOC_001",
  "EVT_18_END_001"
] as const;

/**
 * #124 content-owner wiring.
 *
 * These four scenes consume only facts exposed by the simulation-owned sporting
 * model. The overlay deliberately removes the historical narrative proxies
 * (`OFFICIAL_DEBUT` alone, month, role/form/trust and `udvSeasonResolved`) from
 * scheduling authority.
 */
export function applyT51Issue124SportWiring(events: EventDefinition[]): EventDefinition[] {
  const found = new Set<string>();

  const repaired = events.map(event => {
    if (event.id === "EVT_18_MATCH_001") {
      found.add(event.id);
      const gates: Condition[] = [
        { path: "facts.match.status", op: "eq", value: "authoritative" },
        { path: "facts.match.competition", op: "eq", value: "league" },
        { path: "facts.match.playerAppeared", op: "eq", value: true },
        { path: "facts.match.debutDecisionContext", op: "eq", value: true }
      ];
      return { ...event, gates };
    }

    if (event.id === "EVT_18_PRS_001") {
      found.add(event.id);
      const gates: Condition[] = [
        { path: "flags.FIRST_TEAM_ATTENTION", op: "eq", value: true }
      ];
      const gateAlternatives: NonNullable<EventWithGateAlternatives["gateAlternatives"]> = [
        [{ path: "facts.sport.officialDebutRecorded", op: "eq", value: true }],
        [{ path: "facts.sport.firstMatchSquadCall", op: "exists" }]
      ];
      return { ...event, gates, gateAlternatives } satisfies EventWithGateAlternatives;
    }

    if (event.id === "EVT_18_SOC_001") {
      found.add(event.id);
      const gates: Condition[] = [
        { path: "reputation.mediaHeat", op: "gte", value: 5 },
        { path: "facts.sport.hoursToNextFixture", op: "gte", value: 24 },
        { path: "facts.sport.nextTrainingDate", op: "exists" }
      ];
      return { ...event, gates };
    }

    if (event.id === "EVT_18_END_001") {
      found.add(event.id);
      const gates: Condition[] = [
        { path: "facts.sport.remainingLeagueMatches", op: "gte", value: 1 },
        { path: "facts.sport.remainingLeagueMatches", op: "lte", value: 4 },
        { path: "facts.sport.seasonObjectiveStatus", op: "eq", value: "open" }
      ];
      return { ...event, gates };
    }

    return event;
  });

  const missing = REPAIR_IDS.filter(id => !found.has(id));
  if (missing.length) throw new Error(`#124 missing expected 18-20 event(s): ${missing.join(", ")}`);
  return repaired;
}

export const T51_ISSUE124_EVENT_IDS = Object.freeze([...REPAIR_IDS]);
