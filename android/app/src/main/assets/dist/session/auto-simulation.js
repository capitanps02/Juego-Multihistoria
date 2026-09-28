import { buildPeriodReport } from "./period-report.js";
export const DEFAULT_MAX_AUTO_WEEKS = 6;
export const MIN_AUTO_WEEKS = 1;
export const MAX_CONFIGURABLE_AUTO_WEEKS = 12;
function publicInterrupt(value) {
    return value ? { type: value.type, requiresPlayerInput: value.requiresPlayerInput } : null;
}
export function publicAutoSimulationState(flow, state) {
    return {
        mode: flow.mode,
        maxWeeks: flow.maxWeeks,
        elapsedDays: flow.elapsedDays,
        summary: flow.summary ? {
            ...flow.summary,
            ...(state ? { report: buildPeriodReport(state, flow.summary.fromDate, flow.summary.toDate) } : {}),
            interruption: publicInterrupt(flow.summary.interruption)
        } : null,
        interruption: publicInterrupt(flow.interruption)
    };
}
const num = (value) => typeof value === "number" && Number.isFinite(value) ? value : 0;
export function idleAutoSimulationState() {
    return {
        mode: "idle",
        maxWeeks: DEFAULT_MAX_AUTO_WEEKS,
        elapsedDays: 0,
        baseline: null,
        summary: null,
        interruption: null
    };
}
export function validateMaxAutoWeeks(value) {
    const weeks = value === undefined ? DEFAULT_MAX_AUTO_WEEKS : Number(value);
    if (!Number.isInteger(weeks) || weeks < MIN_AUTO_WEEKS || weeks > MAX_CONFIGURABLE_AUTO_WEEKS) {
        throw new Error(`maxWeeks must be an integer between ${MIN_AUTO_WEEKS} and ${MAX_CONFIGURABLE_AUTO_WEEKS}`);
    }
    return weeks;
}
export function startAutoSimulationState(state, maxWeeks = DEFAULT_MAX_AUTO_WEEKS) {
    return {
        mode: "auto_simulating",
        maxWeeks: validateMaxAutoWeeks(maxWeeks),
        elapsedDays: 0,
        baseline: {
            date: state.date,
            runtimeDay: state.runtime.day,
            appearances: num(state.sport.appearances),
            form: num(state.sport.form),
            fatigue: num(state.body.fatigue),
            fitness: num(state.body.fitness),
            club: state.club,
            role: state.role,
            microfeedCount: state.microfeeds.length
        },
        summary: null,
        interruption: null
    };
}
export function buildPeriodSummary(flow, state, interruption) {
    const baseline = flow.baseline;
    if (!baseline)
        throw new Error("Auto-simulation baseline is missing");
    return {
        fromDate: baseline.date,
        toDate: state.date,
        fromWeek: Math.floor(baseline.runtimeDay / 7),
        toWeek: Math.floor(state.runtime.day / 7),
        daysSimulated: flow.elapsedDays,
        weeksSimulated: Math.floor(flow.elapsedDays / 7),
        matches: {
            appearances: Math.max(0, num(state.sport.appearances) - baseline.appearances)
        },
        playerChanges: {
            form: num(state.sport.form) - baseline.form,
            fatigue: num(state.body.fatigue) - baseline.fatigue,
            fitness: num(state.body.fitness) - baseline.fitness
        },
        careerChanges: {
            clubFrom: baseline.club,
            clubTo: state.club,
            roleFrom: baseline.role,
            roleTo: state.role
        },
        worldHighlights: state.microfeeds.slice(baseline.microfeedCount).map(row => row.text),
        interruption
    };
}
export function resolvedInterruptMode(flow) {
    return flow.summary && flow.summary.daysSimulated > 0 ? "showing_summary" : "paused";
}
