const ROLES = ["none", "fringe", "rotation", "regular"];
function safeNumber(value) {
    return typeof value === "number" && Number.isFinite(value) ? value : 0;
}
function safeRole(value) {
    return typeof value === "string" && ROLES.includes(value)
        ? value
        : "none";
}
/**
 * Project the national-team facts that are actually persisted today.
 *
 * This is deliberately narrower than a fixture/squad authority. `NATIONAL_CALLED`
 * records entry into the simulated senior pool; it does not identify a current match
 * call-up. Likewise, `NATIONAL_TOURNAMENT_CYCLE` is only a cycle/window signal.
 *
 * The projection is read-only, deterministic and consumes no RNG.
 */
export function resolveNationalTeamAuthority(state) {
    const caps = Math.max(0, Math.trunc(safeNumber(state.professional.nationalCaps)));
    const standing = Math.max(0, Math.min(100, safeNumber(state.professional.nationalStanding)));
    const role = safeRole(state.professional.nationalRole);
    const retired = state.flags.NATIONAL_RETIRED === true;
    const enteredPool = state.flags.NATIONAL_CALLED === true;
    return {
        everCalled: enteredPool || caps > 0,
        simulationPoolActive: !retired && enteredPool,
        retired,
        caps,
        role,
        standing,
        gateOpen: !retired && state.flags.NATIONAL_GATE_OPEN === true,
        tournamentCycleWindow: !retired && state.flags.NATIONAL_TOURNAMENT_CYCLE === true,
        concreteCallupKnown: false,
        tournamentSquadKnown: false
    };
}
/** Historical senior-selection evidence only; does not mean a current call-up exists. */
export function hasNationalTeamHistory(state) {
    return resolveNationalTeamAuthority(state).everCalled;
}
