const REPAIR_IDS = [
    "EVT_18_MATCH_001",
    "EVT_18_PRS_001",
    "EVT_18_SOC_001",
    "EVT_18_END_001"
];
const debutDecisionContext = {
    path: "facts.match.debutDecisionContext",
    op: "eq",
    value: true
};
const firstRealMatchSquadCall = {
    path: "facts.sport.firstMatchSquadCall",
    op: "neq",
    value: null
};
const futureTrainingExists = {
    path: "facts.sport.nextTrainingDate",
    op: "neq",
    value: null
};
const atLeastOneLeagueMatchRemaining = {
    path: "facts.sport.remainingLeagueMatches",
    op: "gte",
    value: 1
};
const atMostFourLeagueMatchesRemaining = {
    path: "facts.sport.remainingLeagueMatches",
    op: "lte",
    value: 4
};
const leagueObjectiveOpen = {
    path: "facts.sport.seasonObjectiveStatus",
    op: "eq",
    value: "open"
};
/**
 * Issue #124 content-side wiring.
 *
 * This overlay deliberately consumes only simulation-owned facts exposed through
 * narrativeConditionRoot(...).facts. It never reconstructs match/calendar truth
 * from roleScore, form, reputation, FIRST_TEAM_ATTENTION, month or seasonDay.
 *
 * Frozen canonical definitions remain untouched; only the four blocked active
 * definitions are copied and repaired here.
 */
export function applyT51124SportContextRepairs(events) {
    const found = new Set();
    const repaired = events.map(event => {
        if (event.id === "EVT_18_MATCH_001") {
            found.add(event.id);
            return {
                ...event,
                // A historical debut flag is insufficient. The live scene exists only
                // when the persisted current fixture proves the canonical 78' / 1-1
                // substitute-debut decision context.
                gates: [debutDecisionContext]
            };
        }
        if (event.id === "EVT_18_PRS_001") {
            found.add(event.id);
            const gateAlternatives = [
                [{ path: "flags.OFFICIAL_DEBUT", op: "eq", value: true }],
                [firstRealMatchSquadCall]
            ];
            return {
                ...event,
                // FIRST_TEAM_ATTENTION remains the shared local-attention prerequisite;
                // it is not allowed to stand in for the public sporting fact itself.
                gates: [{ path: "flags.FIRST_TEAM_ATTENTION", op: "eq", value: true }],
                gateAlternatives
            };
        }
        if (event.id === "EVT_18_SOC_001") {
            found.add(event.id);
            const gateAlternatives = [
                [{ path: "facts.sport.hoursToNextFixture", op: "gte", value: 24 }],
                [{ path: "facts.sport.hoursToNextFixture", op: "eq", value: null }]
            ];
            return {
                ...event,
                // Preserve the existing PUBLIC_HEAT threshold, but require the real
                // calendar to prove a subsequent training window and no fixture inside
                // the next 24 hours.
                gates: [...event.gates, futureTrainingExists],
                gateAlternatives
            };
        }
        if (event.id === "EVT_18_END_001") {
            found.add(event.id);
            return {
                ...event,
                gates: [
                    atLeastOneLeagueMatchRemaining,
                    atMostFourLeagueMatchesRemaining,
                    leagueObjectiveOpen
                ]
            };
        }
        return event;
    });
    const missing = REPAIR_IDS.filter(id => !found.has(id));
    if (missing.length)
        throw new Error(`T5.1 #124 missing expected 18-20 event(s): ${missing.join(", ")}`);
    return repaired;
}
export const T51_124_SPORT_CONTEXT_EVENT_IDS = Object.freeze([...REPAIR_IDS]);
