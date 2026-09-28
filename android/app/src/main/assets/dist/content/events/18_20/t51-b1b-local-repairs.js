/**
 * PUBLIC_HEAT is the canonical composite backed directly by reputation.mediaHeat.
 * The existing 18-20 audit already treats mediaHeat >= 8 as the sufficient
 * public-heat threshold for the same phase (EVT_18_END_002), so this repair
 * reuses that established threshold rather than inventing a second proxy.
 */
export const T51_B1B_PUBLIC_HEAT_SUFFICIENT = 8;
const REPAIR_IDS = ["EVT_18_PRS_002", "EVT_19_SUM_001"];
/**
 * T5.1 B1b local repairs.
 *
 * - EVT_18_PRS_002: Clara channel OR sufficient PUBLIC_HEAT.
 * - EVT_19_SUM_001: first full summer is only eligible in the absence of an
 *   acute injury. The age/time window already represents the first full summer;
 *   this overlay adds only the missing injury-state prerequisite.
 *
 * Frozen base definitions remain untouched; active definitions are copied only
 * for the exact IDs repaired here.
 */
export function applyT51B1bLocalRepairs(events) {
    const found = new Set();
    const repaired = events.map(event => {
        if (event.id === "EVT_18_PRS_002") {
            found.add(event.id);
            const gateAlternatives = [
                [{ path: "flags.CLARA_CONTACTED", op: "eq", value: true }],
                [{ path: "reputation.mediaHeat", op: "gte", value: T51_B1B_PUBLIC_HEAT_SUFFICIENT }]
            ];
            return {
                ...event,
                // The previous CLARA_CONTACTED gate becomes one OR route rather than a
                // common prerequisite, otherwise the public-heat route could never open.
                gates: [],
                gateAlternatives
            };
        }
        if (event.id === "EVT_19_SUM_001") {
            found.add(event.id);
            const noAcuteInjury = { path: "body.acuteInjury", op: "neq", value: true };
            return {
                ...event,
                gates: [...event.gates, noAcuteInjury]
            };
        }
        return event;
    });
    const missing = REPAIR_IDS.filter(id => !found.has(id));
    if (missing.length)
        throw new Error(`T5.1 B1b missing expected 18-20 event(s): ${missing.join(", ")}`);
    return repaired;
}
export const T51_B1B_LOCAL_EVENT_IDS = Object.freeze([...REPAIR_IDS]);
