import { DeterministicRng } from "../core/rng.js";
const STORE_KEY = "footballMomentResults";
const MIN_PROBABILITY = 0.45;
const MAX_PROBABILITY = 0.9;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
function score(value, label) {
    if (!Number.isFinite(value) || value < 0 || value > 100)
        throw new Error(`Invalid ${label}: ${value}`);
    return value;
}
function identifier(value, label) {
    if (typeof value !== "string" || value.length === 0 || value.length > 200)
        throw new Error(`Invalid ${label}`);
    if (["__proto__", "constructor", "prototype"].includes(value))
        throw new Error(`Reserved ${label}`);
    return value;
}
function normalizedInput(input) {
    return {
        momentId: identifier(input.momentId, "football moment id"),
        actorId: identifier(input.actorId, "football actor id"),
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
function resultStore(state) {
    const existing = state.world[STORE_KEY];
    if (existing === undefined) {
        const created = {};
        state.world[STORE_KEY] = created;
        return created;
    }
    if (existing === null || typeof existing !== "object" || Array.isArray(existing)) {
        throw new Error("Invalid persisted football moment store");
    }
    return existing;
}
function storedPenalty(value, momentId) {
    if (value === null || typeof value !== "object" || Array.isArray(value)) {
        throw new Error(`Invalid persisted football moment ${momentId}`);
    }
    const row = value;
    if (row.version !== 1
        || row.kind !== "penalty"
        || typeof row.actorId !== "string"
        || (row.outcome !== "scored" && row.outcome !== "missed")
        || typeof row.probability !== "number"
        || !Number.isFinite(row.probability)
        || row.probability < 0
        || row.probability > 1
        || typeof row.resolvedAt !== "string"
        || typeof row.inputSignature !== "string") {
        throw new Error(`Invalid persisted football moment ${momentId}`);
    }
    return row;
}
/**
 * Technical v1 probability model for a single penalty attempt.
 * It deliberately contains no RNG and is not a canonical story rule. The caller
 * supplies sporting facts; this function only converts them into a bounded chance.
 */
export function penaltySuccessProbability(inputValue) {
    const input = normalizedInput(inputValue);
    return clamp(0.58
        + input.technique * 0.0018
        + input.composure * 0.0012
        + input.form * 0.0008
        - input.pressure * 0.0014, MIN_PROBABILITY, MAX_PROBABILITY);
}
/** Build the protagonist attempt from the real persisted football attributes. */
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
