import { getSportMatchModelStore } from "./match-model.js";
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const UNITS = ["appearances", "goals", "assists", "minutes", "age_days", "count"];
function plain(value) {
    return !!value && typeof value === "object" && !Array.isArray(value);
}
function exact(row, keys) {
    return Object.keys(row).sort().join(",") === [...keys].sort().join(",");
}
function validDate(value) {
    if (typeof value !== "string" || !ISO_DATE.test(value))
        return false;
    const d = new Date(`${value}T00:00:00Z`);
    return Number.isFinite(d.getTime()) && d.toISOString().slice(0, 10) === value;
}
function validString(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validSource(value) {
    if (!plain(value) || typeof value.kind !== "string")
        return false;
    if (value.kind === "simulation_boundary") {
        return exact(value, ["kind", "producerId"]) && validString(value.producerId);
    }
    if (value.kind === "canonical_event") {
        return exact(value, ["kind", "eventId", "choiceId", "outcomeId"]) &&
            validString(value.eventId) && validString(value.choiceId) && validString(value.outcomeId);
    }
    return false;
}
function fixtureExists(state, fixtureId, date) {
    if (fixtureId === null)
        return true;
    if (!state || typeof fixtureId !== "string")
        return false;
    return !!getSportMatchModelStore(state)?.fixtures.find(row => row.id === fixtureId && row.date === date);
}
export function inspectSportAchievementStore(value, state) {
    if (value === undefined)
        return null;
    if (!plain(value) || value.version !== 1 || !Array.isArray(value.awards) || !Array.isArray(value.records) ||
        !Array.isArray(value.progress) || !Array.isArray(value.recordEvents)) {
        return { path: "world.sportAchievements", reason: "store inválido" };
    }
    if (!exact(value, ["version", "awards", "records", "progress", "recordEvents"])) {
        return { path: "world.sportAchievements", reason: "campos desconocidos" };
    }
    const awardIds = new Set();
    for (let i = 0; i < value.awards.length; i += 1) {
        const p = `world.sportAchievements.awards[${i}]`, r = value.awards[i];
        if (!plain(r) || !exact(r, ["awardResultId", "awardId", "season", "subjectRef", "result", "date", "source"]))
            return { path: p, reason: "premio inválido" };
        if (!validString(r.awardResultId) || awardIds.has(r.awardResultId))
            return { path: p + ".awardResultId", reason: "id inválido o duplicado" };
        awardIds.add(r.awardResultId);
        if (!validString(r.awardId) || !validString(r.subjectRef))
            return { path: p, reason: "identidad de premio inválida" };
        if (typeof r.season !== "string" || !/^\d{4}-\d{2}$/.test(r.season))
            return { path: p + ".season", reason: "temporada inválida" };
        if (r.result !== "won" && r.result !== "not_won")
            return { path: p + ".result", reason: "resultado inválido" };
        if (!validDate(r.date) || (state && r.date > state.date))
            return { path: p + ".date", reason: "fecha inválida" };
        if (!validSource(r.source))
            return { path: p + ".source", reason: "provenance inválida" };
    }
    const defs = new Map();
    for (let i = 0; i < value.records.length; i += 1) {
        const p = `world.sportAchievements.records[${i}]`, r = value.records[i];
        if (!plain(r) || !exact(r, ["recordId", "label", "metricId", "scope", "scopeRef", "direction", "unit", "source"]))
            return { path: p, reason: "definición inválida" };
        if (!validString(r.recordId) || defs.has(r.recordId))
            return { path: p + ".recordId", reason: "id inválido o duplicado" };
        if (!validString(r.label) || !validString(r.metricId))
            return { path: p, reason: "definición incompleta" };
        if (!["career", "club", "competition"].includes(String(r.scope)))
            return { path: p + ".scope", reason: "scope inválido" };
        if (r.scope === "career" && r.scopeRef !== null)
            return { path: p + ".scopeRef", reason: "career no admite scopeRef" };
        if (r.scope !== "career" && !validString(r.scopeRef))
            return { path: p + ".scopeRef", reason: "scopeRef requerido" };
        if (r.direction !== "higher" && r.direction !== "lower")
            return { path: p + ".direction", reason: "dirección inválida" };
        if (typeof r.unit !== "string" || !UNITS.includes(r.unit))
            return { path: p + ".unit", reason: "unidad inválida" };
        if (!validSource(r.source))
            return { path: p + ".source", reason: "provenance inválida" };
        defs.set(r.recordId, r);
    }
    const progressIds = new Set();
    for (let i = 0; i < value.progress.length; i += 1) {
        const p = `world.sportAchievements.progress[${i}]`, r = value.progress[i];
        if (!plain(r) || !exact(r, ["progressId", "recordId", "subjectRef", "value", "date", "runtimeDay", "fixtureId", "source"]))
            return { path: p, reason: "progreso inválido" };
        if (!validString(r.progressId) || progressIds.has(r.progressId))
            return { path: p + ".progressId", reason: "id inválido o duplicado" };
        progressIds.add(r.progressId);
        if (!validString(r.recordId) || !defs.has(r.recordId))
            return { path: p + ".recordId", reason: "récord desconocido" };
        if (!validString(r.subjectRef) || typeof r.value !== "number" || !Number.isFinite(r.value))
            return { path: p, reason: "progreso incompleto" };
        if (!validDate(r.date) || (state && r.date > state.date))
            return { path: p + ".date", reason: "fecha inválida" };
        if (!Number.isInteger(r.runtimeDay) || r.runtimeDay < 0)
            return { path: p + ".runtimeDay", reason: "día inválido" };
        if (!fixtureExists(state, r.fixtureId, r.date))
            return { path: p + ".fixtureId", reason: "fixture inexistente" };
        if (!validSource(r.source))
            return { path: p + ".source", reason: "provenance inválida" };
    }
    const eventIds = new Set(), lastByRecord = new Map();
    for (let i = 0; i < value.recordEvents.length; i += 1) {
        const p = `world.sportAchievements.recordEvents[${i}]`, r = value.recordEvents[i];
        if (!plain(r) || !exact(r, ["eventId", "recordId", "kind", "date", "runtimeDay", "previousHolderRef", "newHolderRef", "value", "fixtureId", "source"]))
            return { path: p, reason: "evento de récord inválido" };
        if (!validString(r.eventId) || eventIds.has(r.eventId))
            return { path: p + ".eventId", reason: "id inválido o duplicado" };
        eventIds.add(r.eventId);
        if (!validString(r.recordId) || !defs.has(r.recordId))
            return { path: p + ".recordId", reason: "récord desconocido" };
        if (r.kind !== "set" && r.kind !== "surpassed")
            return { path: p + ".kind", reason: "tipo inválido" };
        if (!validDate(r.date) || (state && r.date > state.date))
            return { path: p + ".date", reason: "fecha inválida" };
        if (!Number.isInteger(r.runtimeDay) || r.runtimeDay < 0)
            return { path: p + ".runtimeDay", reason: "día inválido" };
        if (!validString(r.newHolderRef) || typeof r.value !== "number" || !Number.isFinite(r.value))
            return { path: p, reason: "valor/holder inválido" };
        if (!fixtureExists(state, r.fixtureId, r.date))
            return { path: p + ".fixtureId", reason: "fixture inexistente" };
        if (!validSource(r.source))
            return { path: p + ".source", reason: "provenance inválida" };
        const prev = lastByRecord.get(r.recordId);
        if (!prev) {
            if (r.kind !== "set" || r.previousHolderRef !== null)
                return { path: p, reason: "primer evento debe establecer el récord" };
        }
        else {
            if (r.kind !== "surpassed" || r.previousHolderRef !== prev.newHolderRef || r.newHolderRef === prev.newHolderRef)
                return { path: p, reason: "cadena de holders inválida" };
            if (r.runtimeDay < prev.runtimeDay || r.date < prev.date)
                return { path: p, reason: "cronología de récord inválida" };
            const def = defs.get(r.recordId);
            if (def.direction === "higher" ? r.value <= prev.value : r.value >= prev.value) {
                return { path: p + ".value", reason: "valor no supera el récord anterior" };
            }
        }
        lastByRecord.set(r.recordId, r);
    }
    return null;
}
export function getSportAchievementStore(state) {
    const raw = state.world.sportAchievements;
    if (raw === undefined || inspectSportAchievementStore(raw, state) !== null)
        return null;
    return raw;
}
function ensureStore(state) {
    if (state.world.sportAchievements !== undefined)
        return getSportAchievementStore(state);
    const store = { version: 1, awards: [], records: [], progress: [], recordEvents: [] };
    state.world.sportAchievements = store;
    return store;
}
function cloneSource(source) {
    return source.kind === "simulation_boundary"
        ? { kind: source.kind, producerId: source.producerId }
        : { kind: source.kind, eventId: source.eventId, choiceId: source.choiceId, outcomeId: source.outcomeId };
}
export function recordIndividualAwardResultInPlace(state, input) {
    if (!validString(input.awardResultId) || !validString(input.awardId) || !validString(input.subjectRef) ||
        !/^\d{4}-\d{2}$/.test(input.season) || (input.result !== "won" && input.result !== "not_won") || !validSource(input.source))
        return null;
    const store = ensureStore(state);
    if (!store)
        return null;
    const existing = store.awards.find(row => row.awardResultId === input.awardResultId);
    const candidate = { ...input, date: state.date, source: cloneSource(input.source) };
    if (existing)
        return JSON.stringify(existing) === JSON.stringify(candidate) ? existing : null;
    store.awards.push(candidate);
    return candidate;
}
export function defineSportRecordInPlace(state, input) {
    if (!validString(input.recordId) || !validString(input.label) || !validString(input.metricId) || !validSource(input.source))
        return null;
    if (!["career", "club", "competition"].includes(input.scope) || !["higher", "lower"].includes(input.direction) || !UNITS.includes(input.unit))
        return null;
    if (input.scope === "career" ? input.scopeRef !== null : !validString(input.scopeRef))
        return null;
    const store = ensureStore(state);
    if (!store)
        return null;
    const existing = store.records.find(row => row.recordId === input.recordId);
    const candidate = { ...input, source: cloneSource(input.source) };
    if (existing)
        return JSON.stringify(existing) === JSON.stringify(candidate) ? existing : null;
    store.records.push(candidate);
    return candidate;
}
export function recordSportRecordProgressInPlace(state, input) {
    const store = getSportAchievementStore(state);
    if (!store)
        return null;
    if (!store.records.some(row => row.recordId === input.recordId) || !validString(input.progressId) || !validString(input.subjectRef) ||
        typeof input.value !== "number" || !Number.isFinite(input.value) || !validSource(input.source))
        return null;
    if (input.fixtureId !== null && !getSportMatchModelStore(state)?.fixtures.some(row => row.id === input.fixtureId && row.date === state.date))
        return null;
    const candidate = { ...input, date: state.date, runtimeDay: state.runtime.day, source: cloneSource(input.source) };
    const existing = store.progress.find(row => row.progressId === input.progressId);
    if (existing)
        return JSON.stringify(existing) === JSON.stringify(candidate) ? existing : null;
    store.progress.push(candidate);
    return candidate;
}
export function recordSportRecordEventInPlace(state, input) {
    const store = getSportAchievementStore(state);
    if (!store)
        return null;
    const def = store.records.find(row => row.recordId === input.recordId);
    if (!def || !validString(input.eventId) || !validString(input.newHolderRef) || typeof input.value !== "number" || !Number.isFinite(input.value) || !validSource(input.source))
        return null;
    if (input.fixtureId !== null && !getSportMatchModelStore(state)?.fixtures.some(row => row.id === input.fixtureId && row.date === state.date))
        return null;
    const candidate = { ...input, date: state.date, runtimeDay: state.runtime.day, source: cloneSource(input.source) };
    const existing = store.recordEvents.find(row => row.eventId === input.eventId);
    if (existing)
        return JSON.stringify(existing) === JSON.stringify(candidate) ? existing : null;
    const previous = [...store.recordEvents].reverse().find(row => row.recordId === input.recordId) ?? null;
    if (!previous) {
        if (input.kind !== "set" || input.previousHolderRef !== null)
            return null;
    }
    else {
        if (input.kind !== "surpassed" || input.previousHolderRef !== previous.newHolderRef || input.newHolderRef === previous.newHolderRef)
            return null;
        if (def.direction === "higher" ? input.value <= previous.value : input.value >= previous.value)
            return null;
    }
    store.recordEvents.push(candidate);
    return candidate;
}
export function resolveAchievementHistoryFacts(state) {
    const store = getSportAchievementStore(state);
    const wins = store?.awards.filter(row => row.subjectRef === "protagonist" && row.result === "won")
        .map(row => ({ awardId: row.awardId, season: row.season, date: row.date })) ?? [];
    const latestWin = wins.at(-1) ?? null;
    const latestSurpass = store ? [...store.recordEvents].reverse().find(row => row.kind === "surpassed") ?? null : null;
    return {
        awardResultsKnown: store?.awards.length ?? 0,
        protagonistAwardWins: wins,
        latestAwardWin: latestWin,
        recordDefinitionsKnown: store?.records.length ?? 0,
        latestRecordSurpass: latestSurpass && latestSurpass.previousHolderRef !== null ? {
            recordId: latestSurpass.recordId,
            previousHolderRef: latestSurpass.previousHolderRef,
            newHolderRef: latestSurpass.newHolderRef,
            value: latestSurpass.value,
            date: latestSurpass.date
        } : null
    };
}
