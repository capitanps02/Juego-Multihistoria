import { CURRENT_SCHEMA_VERSION } from "./save.js";
/**
 * T2.2 · Structural validation for saves and session snapshots.
 *
 * Rejects corrupt, truncated, future-version and structurally invalid data
 * with descriptive error codes. Never modifies the incoming object.
 * Migration is handled by save.ts; this module validates *after* migration.
 */
export class SaveValidationError extends Error {
    code;
    constructor(code, message) {
        super(message);
        this.code = code;
        this.name = "SaveValidationError";
    }
}
function fail(code, message) {
    throw new SaveValidationError(code, message);
}
function isObj(x) {
    return x !== null && typeof x === "object" && !Array.isArray(x);
}
function isFiniteNumber(x) {
    return typeof x === "number" && Number.isFinite(x);
}
function requireFinite(value, label) {
    if (!isFiniteNumber(value)) {
        fail("INVALID_FIELD", `${label} debe ser un número finito, recibido: ${String(value)}`);
    }
}
function requireString(value, label) {
    if (typeof value !== "string" || value.length === 0) {
        fail("INVALID_FIELD", `${label} debe ser una cadena no vacía.`);
    }
}
function requireArray(value, label) {
    if (!Array.isArray(value)) {
        fail("INVALID_FIELD", `${label} debe ser un array.`);
    }
}
// ── RNG stream ──────────────────────────────────────────────────────────
function validateRngStream(stream, label) {
    if (!isObj(stream))
        fail("INVALID_RNG", `${label}: stream RNG ausente o no es objeto.`);
    const { seed, state, draws } = stream;
    requireFinite(seed, `${label}.seed`);
    requireFinite(state, `${label}.state`);
    requireFinite(draws, `${label}.draws`);
    if (draws < 0)
        fail("INVALID_RNG", `${label}.draws no puede ser negativo.`);
}
// ── GameState ───────────────────────────────────────────────────────────
const VALID_PHASES = ["18_20", "20_23", "23_26", "26_30", "30_34", "34_plus"];
const RETIREMENT_STATUSES = ["playing", "decided", "announced", "closed"];
export function validateGameState(s) {
    if (!isObj(s))
        fail("INVALID_SAVE", "El estado del juego no es un objeto válido.");
    // ── Schema version ──
    const version = s.schemaVersion;
    if (!isFiniteNumber(version))
        fail("INVALID_SAVE", "Falta schemaVersion o no es un número.");
    if (version > CURRENT_SCHEMA_VERSION)
        fail("FUTURE_VERSION", `Schema ${version} es posterior al soportado (${CURRENT_SCHEMA_VERSION}).`);
    if (version !== CURRENT_SCHEMA_VERSION)
        fail("INCOMPATIBLE_SCHEMA", `Schema ${version} no es la versión actual (${CURRENT_SCHEMA_VERSION}). Usa loadSave para migrar antes de validar.`);
    // ── Top-level scalars ──
    const state = s;
    requireString(state.date, "date");
    requireFinite(state.age, "age");
    if (state.age < 0 || state.age > 100)
        fail("INVALID_FIELD", "age fuera de rango razonable (0–100).");
    requireString(state.season, "season");
    if (!VALID_PHASES.includes(state.phase))
        fail("INVALID_FIELD", `phase '${String(state.phase)}' no es una fase válida.`);
    requireString(state.club, "club");
    requireFinite(state.tier, "tier");
    requireString(state.role, "role");
    // ── Required objects ──
    if (!isObj(state.professional))
        fail("INVALID_SAVE", "Falta el objeto professional.");
    if (!isObj(state.runtime))
        fail("INVALID_SAVE", "Falta el objeto runtime.");
    if (!isObj(state.retirement))
        fail("INVALID_SAVE", "Falta el objeto retirement.");
    if (!isObj(state.epilogue))
        fail("INVALID_SAVE", "Falta el objeto epilogue.");
    if (!isObj(state.contract))
        fail("INVALID_SAVE", "Falta el objeto contract.");
    if (!isObj(state.finances))
        fail("INVALID_SAVE", "Falta el objeto finances.");
    if (!isObj(state.body))
        fail("INVALID_SAVE", "Falta el objeto body.");
    if (!isObj(state.selection))
        fail("INVALID_SAVE", "Falta el objeto selection.");
    if (!isObj(state.reputation))
        fail("INVALID_SAVE", "Falta el objeto reputation.");
    if (!isObj(state.control))
        fail("INVALID_SAVE", "Falta el objeto control.");
    if (!isObj(state.sport))
        fail("INVALID_SAVE", "Falta el objeto sport.");
    if (!isObj(state.world))
        fail("INVALID_SAVE", "Falta el objeto world.");
    if (!isObj(state.personality))
        fail("INVALID_SAVE", "Falta el objeto personality.");
    if (!isObj(state.flags))
        fail("INVALID_SAVE", "Falta el objeto flags.");
    if (!isObj(state.eventCooldowns))
        fail("INVALID_SAVE", "Falta el objeto eventCooldowns.");
    if (!isObj(state.narrativePressure))
        fail("INVALID_SAVE", "Falta el objeto narrativePressure.");
    // ── Required arrays ──
    requireArray(state.careerStateTags, "careerStateTags");
    requireArray(state.relationships, "relationships");
    requireArray(state.npcs, "npcs");
    requireArray(state.seeds, "seeds");
    requireArray(state.history, "history");
    requireArray(state.microfeeds, "microfeeds");
    // ── Runtime ──
    const rt = state.runtime;
    requireFinite(rt.day, "runtime.day");
    requireFinite(rt.seasonDay, "runtime.seasonDay");
    requireFinite(rt.daysSinceNarrative, "runtime.daysSinceNarrative");
    requireFinite(rt.eventsThisSeason, "runtime.eventsThisSeason");
    // ── Retirement ──
    const ret = state.retirement;
    if (!RETIREMENT_STATUSES.includes(ret.status))
        fail("INVALID_FIELD", `retirement.status '${String(ret.status)}' no es válido.`);
    requireFinite(ret.reversals, "retirement.reversals");
    requireFinite(ret.noMarketWindows, "retirement.noMarketWindows");
    requireFinite(ret.daysInStatus, "retirement.daysInStatus");
    // ── Epilogue ──
    const epi = state.epilogue;
    if (typeof epi.generated !== "boolean")
        fail("INVALID_FIELD", "epilogue.generated debe ser booleano.");
    requireArray(epi.families, "epilogue.families");
    requireArray(epi.milestones, "epilogue.milestones");
    // ── RNG state ──
    if (!isObj(state.rngState))
        fail("INVALID_RNG", "Falta rngState.");
    const rng = state.rngState;
    validateRngStream(rng.narrative, "rngState.narrative");
    validateRngStream(rng.football, "rngState.football");
    validateRngStream(rng.microfeed, "rngState.microfeed");
    validateRngStream(rng.qa, "rngState.qa");
    // ── Professional: spot-check key numeric fields for NaN/Infinity ──
    const pro = state.professional;
    for (const key of [
        "leagueTier", "clubPrestigeTier", "clubPrestigeScore", "contractPower",
        "roleSecurity", "bodyLoad", "recoveryMargin", "motivationReserve",
        "retirementDistance", "legacyCapital", "explosiveness", "matchEndurance"
    ]) {
        requireFinite(pro[key], `professional.${key}`);
    }
    // ── History entries: spot-check structure ──
    const history = state.history;
    for (let i = 0; i < Math.min(history.length, 5); i++) {
        const h = history[i];
        if (!isObj(h))
            fail("CORRUPT_SAVE", `history[${i}] no es un objeto válido.`);
        const entry = h;
        requireString(entry.eventId, `history[${i}].eventId`);
        requireString(entry.date, `history[${i}].date`);
        requireString(entry.choiceId, `history[${i}].choiceId`);
        requireString(entry.outcomeId, `history[${i}].outcomeId`);
    }
    // Also spot-check the last few entries for long histories
    if (history.length > 5) {
        for (let i = Math.max(5, history.length - 3); i < history.length; i++) {
            const h = history[i];
            if (!isObj(h))
                fail("CORRUPT_SAVE", `history[${i}] no es un objeto válido.`);
            const entry = h;
            requireString(entry.eventId, `history[${i}].eventId`);
            requireString(entry.date, `history[${i}].date`);
        }
    }
}
export function validateSnapshotEnvelope(raw) {
    if (!isObj(raw))
        fail("CORRUPT_SAVE", "El snapshot no es un objeto válido.");
    const snap = raw;
    // ── Envelope fields ──
    requireFinite(snap.sessionVersion, "sessionVersion");
    requireString(snap.build, "build");
    requireString(snap.contentIdentity, "contentIdentity");
    requireString(snap.sessionId, "sessionId");
    requireFinite(snap.revision, "revision");
    if (snap.revision < 0)
        fail("INVALID_FIELD", "revision no puede ser negativa.");
    if (typeof snap.microfeeds !== "boolean")
        fail("INVALID_FIELD", "microfeeds debe ser booleano.");
    if (typeof snap.needsWorldAdvance !== "boolean")
        fail("INVALID_FIELD", "needsWorldAdvance debe ser booleano.");
    // ── Pending state coherence ──
    if (snap.pendingDecision !== null && snap.pendingDecision !== undefined && !isObj(snap.pendingDecision)) {
        fail("INVALID_SAVE", "pendingDecision debe ser null o un objeto válido.");
    }
    if (snap.pendingResult !== null && snap.pendingResult !== undefined && !isObj(snap.pendingResult)) {
        fail("INVALID_SAVE", "pendingResult debe ser null o un objeto válido.");
    }
    if (snap.pendingDecision && snap.pendingResult) {
        fail("INVALID_SAVE", "No puede haber decisión y resultado pendientes simultáneamente.");
    }
    // ── Arrays ──
    requireArray(snap.receipts, "receipts");
    requireArray(snap.journal, "journal");
    // ── Inner GameState ──
    validateGameState(snap.state);
}
// ── Raw JSON parsing with corruption detection ──────────────────────
export function parseSaveJson(raw) {
    if (typeof raw !== "string" || raw.length === 0) {
        fail("CORRUPT_SAVE", "Datos de guardado vacíos.");
    }
    try {
        return JSON.parse(raw);
    }
    catch (e) {
        fail("CORRUPT_SAVE", `JSON no válido: ${e.message}`);
    }
}
