import { DeterministicRng } from "../core/rng.js";
const STORE_KEY = "footballMomentResults";
const MIN_PROBABILITY = 0.45;
const MAX_PROBABILITY = 0.9;
const IDENTIFIER = /^[A-Za-z0-9_.:-]+$/;
const MOMENT_CONTEXT = /^[A-Za-z0-9_.-]+$/;
const REGISTERED_PENALTY_EVENTS = new Set(["EVT_24_MATCH_001", "EVT_26_MATCH_001"]);
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
function plainRecord(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
}
function score(value, label) {
    if (!Number.isFinite(value) || value < 0 || value > 100)
        throw new Error(`Invalid ${label}: ${value}`);
    return value;
}
function actorIdentifier(value) {
    if (typeof value !== "string" || value.length === 0 || value.length > 200 || !IDENTIFIER.test(value)) {
        throw new Error("Invalid football actor id");
    }
    if (["__proto__", "constructor", "prototype"].includes(value))
        throw new Error("Reserved football actor id");
    return value;
}
/**
 * Football moment identities are an explicit registry, not arbitrary save keys.
 * Registering a new narrative football moment is therefore a deliberate code change.
 */
function penaltyMomentIdentifier(value) {
    if (typeof value !== "string" || value.length === 0 || value.length > 200) {
        throw new Error("Invalid football moment id");
    }
    const parts = value.split(":");
    if (parts.length !== 3 || !REGISTERED_PENALTY_EVENTS.has(parts[0]) || !MOMENT_CONTEXT.test(parts[1]) || parts[2] !== "penalty") {
        throw new Error(`Unknown football moment id: ${value}`);
    }
    return value;
}
function normalizedInput(input) {
    return {
        momentId: penaltyMomentIdentifier(input.momentId),
        actorId: actorIdentifier(input.actorId),
        technique: score(input.technique, "penalty technique"),
        composure: score(input.composure, "penalty composure"),
        form: score(input.form, "penalty form"),
        pressure: score(input.pressure, "penalty pressure")
    };
}
function signature(input) {
    return JSON.stringify([
        input.actorId,
        input.technique,
        input.composure,
        input.form,
        input.pressure
    ]);
}
function probabilityFromValues(technique, composure, form, pressure) {
    return clamp(0.58
        + technique * 0.0018
        + composure * 0.0012
        + form * 0.0008
        - pressure * 0.0014, MIN_PROBABILITY, MAX_PROBABILITY);
}
function parsedSignature(value) {
    if (typeof value !== "string" || value.length === 0 || value.length > 1000)
        return null;
    let parsed;
    try {
        parsed = JSON.parse(value);
    }
    catch {
        return null;
    }
    if (!Array.isArray(parsed) || parsed.length !== 5)
        return null;
    const [actorId, technique, composure, form, pressure] = parsed;
    try {
        const normalized = {
            actorId: actorIdentifier(actorId),
            technique: score(technique, "penalty technique"),
            composure: score(composure, "penalty composure"),
            form: score(form, "penalty form"),
            pressure: score(pressure, "penalty pressure")
        };
        if (JSON.stringify([normalized.actorId, normalized.technique, normalized.composure, normalized.form, normalized.pressure]) !== value)
            return null;
        return normalized;
    }
    catch {
        return null;
    }
}
function validIsoDate(value) {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value))
        return false;
    const date = new Date(`${value}T00:00:00Z`);
    return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
function storedPenaltyIssue(value, momentId, maxResolvedAt) {
    const path = `world.${STORE_KEY}.${momentId}`;
    if (!plainRecord(value))
        return { path, reason: "row must be an object" };
    const keys = Object.keys(value).sort().join(",");
    if (keys !== "actorId,inputSignature,kind,outcome,probability,resolvedAt,version") {
        return { path, reason: "row fields do not match football moment schema v1" };
    }
    if (value.version !== 1)
        return { path: `${path}.version`, reason: "unsupported football moment schema version" };
    if (value.kind !== "penalty")
        return { path: `${path}.kind`, reason: "unknown football moment kind" };
    try {
        actorIdentifier(value.actorId);
    }
    catch {
        return { path: `${path}.actorId`, reason: "invalid actor id" };
    }
    if (value.outcome !== "scored" && value.outcome !== "missed") {
        return { path: `${path}.outcome`, reason: "unknown penalty outcome" };
    }
    const persistedInput = parsedSignature(value.inputSignature);
    if (!persistedInput)
        return { path: `${path}.inputSignature`, reason: "invalid or non-canonical input signature" };
    if (persistedInput.actorId !== value.actorId)
        return { path: `${path}.inputSignature`, reason: "input signature actor does not match row actor" };
    const expectedProbability = probabilityFromValues(persistedInput.technique, persistedInput.composure, persistedInput.form, persistedInput.pressure);
    if (typeof value.probability !== "number" ||
        !Number.isFinite(value.probability) ||
        value.probability < MIN_PROBABILITY ||
        value.probability > MAX_PROBABILITY ||
        Math.abs(value.probability - expectedProbability) > Number.EPSILON * 16) {
        return { path: `${path}.probability`, reason: "probability is inconsistent with persisted sporting inputs" };
    }
    if (!validIsoDate(value.resolvedAt))
        return { path: `${path}.resolvedAt`, reason: "invalid ISO date" };
    if (maxResolvedAt !== undefined && value.resolvedAt > maxResolvedAt) {
        return { path: `${path}.resolvedAt`, reason: "football moment cannot be resolved in the future" };
    }
    return null;
}
/**
 * Read-only validation for the optional persisted store. Historical saves may omit it.
 * This function never consumes RNG and never mutates the supplied value.
 */
export function inspectFootballMomentStore(value, maxResolvedAt) {
    if (value === undefined)
        return null;
    if (!plainRecord(value))
        return { path: `world.${STORE_KEY}`, reason: "store must be an object when present" };
    for (const [momentId, row] of Object.entries(value)) {
        try {
            penaltyMomentIdentifier(momentId);
        }
        catch {
            return { path: `world.${STORE_KEY}`, reason: `unknown football moment id '${momentId}'` };
        }
        const issue = storedPenaltyIssue(row, momentId, maxResolvedAt);
        if (issue)
            return issue;
    }
    return null;
}
/** Runtime assertion used by the resolver when reading persisted authoritative facts. */
export function assertFootballMomentStore(value) {
    const issue = inspectFootballMomentStore(value);
    if (issue)
        throw new Error(`Invalid persisted football moment store at ${issue.path}: ${issue.reason}`);
}
function resultStore(state) {
    const existing = state.world[STORE_KEY];
    if (existing === undefined) {
        const created = {};
        state.world[STORE_KEY] = created;
        return created;
    }
    assertFootballMomentStore(existing);
    return existing;
}
function storedPenalty(value, momentId) {
    const issue = storedPenaltyIssue(value, momentId);
    if (issue)
        throw new Error(`Invalid persisted football moment ${momentId}: ${issue.reason}`);
    return value;
}
/**
 * Technical v1 probability model for a single penalty attempt.
 * It deliberately contains no RNG and is not a canonical story rule. The caller
 * supplies sporting facts; this function only converts them into a bounded chance.
 */
export function penaltySuccessProbability(inputValue) {
    const input = normalizedInput(inputValue);
    return probabilityFromValues(input.technique, input.composure, input.form, input.pressure);
}
/** Build the protagonist attempt from persisted football attributes only. */
export function playerPenaltyAttempt(state, momentId, pressure) {
    return normalizedInput({
        momentId,
        actorId: "PLAYER",
        technique: Number(state.professional.technique),
        composure: Number(state.professional.composure),
        form: Number(state.sport.form),
        pressure
    });
}
/**
 * Resolve one factual sporting moment. Exactly one draw from rngState.football is
 * consumed the first time a momentId is resolved. Replays return the persisted fact.
 * This layer never mutates goals, appearances, minutes, cards or relationships.
 */
export function resolvePenaltyMomentInPlace(state, inputValue) {
    const input = normalizedInput(inputValue);
    const inputSignature = signature(input);
    const store = resultStore(state);
    const persisted = store[input.momentId];
    if (persisted !== undefined) {
        const row = storedPenalty(persisted, input.momentId);
        if (row.inputSignature !== inputSignature) {
            throw new Error(`Football moment ${input.momentId} was already resolved with different sporting inputs`);
        }
        return {
            version: 1,
            kind: "penalty",
            momentId: input.momentId,
            actorId: row.actorId,
            outcome: row.outcome,
            probability: row.probability,
            resolvedAt: row.resolvedAt,
            replayed: true
        };
    }
    const probability = penaltySuccessProbability(input);
    const rng = new DeterministicRng(state.rngState.football);
    const draw = rng.next();
    const outcome = draw < probability ? "scored" : "missed";
    const row = {
        version: 1,
        kind: "penalty",
        actorId: input.actorId,
        outcome,
        probability,
        resolvedAt: state.date,
        inputSignature
    };
    store[input.momentId] = row;
    return {
        version: 1,
        kind: "penalty",
        momentId: input.momentId,
        actorId: input.actorId,
        outcome,
        probability,
        resolvedAt: state.date,
        replayed: false,
        draw
    };
}
