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
const FINAL_ROLES = ["starter_candidate", "rotation", "veteran_role"];
const MEMBERSHIPS = ["selected", "omitted", "withdrawn"];
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
function plainRecord(value) {
    return !!value && typeof value === "object" && !Array.isArray(value);
}
function exactKeys(value, expected) {
    return Object.keys(value).sort().join(",") === [...expected].sort().join(",");
}
function validProvenance(value) {
    if (!plainRecord(value) || typeof value.kind !== "string")
        return false;
    if (value.kind === "simulation_publication") {
        return exactKeys(value, ["kind", "producerId"]) &&
            typeof value.producerId === "string" && value.producerId.length > 0;
    }
    if (value.kind === "canonical_event") {
        return exactKeys(value, ["kind", "eventId", "choiceId", "outcomeId"]) &&
            typeof value.eventId === "string" && value.eventId.length > 0 &&
            typeof value.choiceId === "string" && value.choiceId.length > 0 &&
            typeof value.outcomeId === "string" && value.outcomeId.length > 0;
    }
    return false;
}
function publicationIssue(value, path, expectedSize, allowedMemberships, currentDate) {
    if (!plainRecord(value))
        return { path, reason: "publicación inválida" };
    if (!exactKeys(value, ["date", "runtimeDay", "squadSize", "membership", "role", "source"])) {
        return { path, reason: "campos de publicación incorrectos" };
    }
    if (typeof value.date !== "string" || !ISO_DATE.test(value.date))
        return { path: path + ".date", reason: "fecha inválida" };
    if (currentDate && value.date > currentDate)
        return { path: path + ".date", reason: "fecha futura" };
    if (!Number.isInteger(value.runtimeDay) || value.runtimeDay < 0) {
        return { path: path + ".runtimeDay", reason: "día runtime inválido" };
    }
    if (value.squadSize !== expectedSize)
        return { path: path + ".squadSize", reason: "tamaño de lista incorrecto" };
    if (typeof value.membership !== "string" || !allowedMemberships.includes(value.membership)) {
        return { path: path + ".membership", reason: "estado de selección inválido" };
    }
    if (!validProvenance(value.source))
        return { path: path + ".source", reason: "provenance inválida" };
    if (expectedSize === 30) {
        if (value.role !== null)
            return { path: path + ".role", reason: "preselección no puede fijar rol final" };
    }
    else if (value.membership === "selected") {
        if (value.role !== null && (typeof value.role !== "string" || !FINAL_ROLES.includes(value.role))) {
            return { path: path + ".role", reason: "rol final inválido" };
        }
    }
    else if (value.role !== null) {
        return { path: path + ".role", reason: "lista final no seleccionada no puede fijar rol" };
    }
    return null;
}
/**
 * Pure validator used by save validation. Missing stores are valid legacy/unknown state;
 * malformed stores fail closed and are never repaired or backfilled.
 */
export function inspectNationalSelectionAuthorityStore(value, currentDate) {
    if (value === undefined)
        return null;
    if (!plainRecord(value) || value.version !== 1 || !Array.isArray(value.cycles)) {
        return { path: "world.nationalSelectionAuthority", reason: "store inválido" };
    }
    if (!exactKeys(value, ["version", "cycles"])) {
        return { path: "world.nationalSelectionAuthority", reason: "campos desconocidos" };
    }
    const seen = new Set();
    for (let i = 0; i < value.cycles.length; i += 1) {
        const path = `world.nationalSelectionAuthority.cycles[${i}]`;
        const row = value.cycles[i];
        if (!plainRecord(row) || !exactKeys(row, ["cycleId", "tournamentId", "season", "openedDate", "preliminary", "final"])) {
            return { path, reason: "ciclo inválido" };
        }
        if (typeof row.cycleId !== "string" || row.cycleId.length === 0)
            return { path: path + ".cycleId", reason: "cycleId inválido" };
        if (seen.has(row.cycleId))
            return { path: path + ".cycleId", reason: "cycleId duplicado" };
        seen.add(row.cycleId);
        if (typeof row.tournamentId !== "string" || row.tournamentId.length === 0)
            return { path: path + ".tournamentId", reason: "tournamentId inválido" };
        if (typeof row.season !== "string" || !/^\d{4}-\d{2}$/.test(row.season))
            return { path: path + ".season", reason: "temporada inválida" };
        if (typeof row.openedDate !== "string" || !ISO_DATE.test(row.openedDate))
            return { path: path + ".openedDate", reason: "fecha de apertura inválida" };
        if (currentDate && row.openedDate > currentDate)
            return { path: path + ".openedDate", reason: "fecha futura" };
        if (row.preliminary !== null) {
            const issue = publicationIssue(row.preliminary, path + ".preliminary", 30, ["selected", "omitted"], currentDate);
            if (issue)
                return issue;
            const pre = row.preliminary;
            if (pre.date < row.openedDate)
                return { path: path + ".preliminary.date", reason: "preselección anterior al ciclo" };
        }
        if (row.final !== null) {
            if (row.preliminary === null)
                return { path: path + ".final", reason: "lista final sin preselección" };
            const pre = row.preliminary;
            if (pre.membership !== "selected")
                return { path: path + ".final", reason: "lista final sin pertenencia previa a la preselección" };
            const issue = publicationIssue(row.final, path + ".final", 26, MEMBERSHIPS, currentDate);
            if (issue)
                return issue;
            const fin = row.final;
            if (fin.date < pre.date || fin.runtimeDay < pre.runtimeDay) {
                return { path: path + ".final", reason: "cronología final anterior a preselección" };
            }
        }
    }
    return null;
}
export function getNationalSelectionAuthorityStore(state) {
    const raw = state.world.nationalSelectionAuthority;
    if (raw === undefined || inspectNationalSelectionAuthorityStore(raw, state.date) !== null)
        return null;
    return raw;
}
function ensureNationalSelectionStoreInPlace(state) {
    const raw = state.world.nationalSelectionAuthority;
    if (raw !== undefined)
        return getNationalSelectionAuthorityStore(state);
    const store = { version: 1, cycles: [] };
    state.world.nationalSelectionAuthority = store;
    return store;
}
function cloneSource(source) {
    return source.kind === "simulation_publication"
        ? { kind: source.kind, producerId: source.producerId }
        : { kind: source.kind, eventId: source.eventId, choiceId: source.choiceId, outcomeId: source.outcomeId };
}
function validId(value) {
    return value.trim().length > 0;
}
/**
 * Explicit producer boundary for a published 30-player preselection.
 * The caller must supply the factual membership and provenance; standing/caps/role
 * are never read here to manufacture membership.
 */
export function recordNationalPreselectionInPlace(state, input) {
    if (state.flags.NATIONAL_RETIRED === true || state.flags.NATIONAL_TOURNAMENT_CYCLE !== true)
        return null;
    if (!validId(input.cycleId) || !validId(input.tournamentId) || !validProvenance(input.source))
        return null;
    const store = ensureNationalSelectionStoreInPlace(state);
    if (!store)
        return null;
    let cycle = store.cycles.find(row => row.cycleId === input.cycleId);
    if (!cycle) {
        cycle = {
            cycleId: input.cycleId,
            tournamentId: input.tournamentId,
            season: state.season,
            openedDate: state.date,
            preliminary: null,
            final: null
        };
        store.cycles.push(cycle);
    }
    else if (cycle.tournamentId !== input.tournamentId || cycle.season !== state.season) {
        return null;
    }
    if (cycle.preliminary) {
        return cycle.preliminary.membership === input.membership ? cycle.preliminary : null;
    }
    const publication = {
        date: state.date,
        runtimeDay: state.runtime.day,
        squadSize: 30,
        membership: input.membership,
        role: null,
        source: cloneSource(input.source)
    };
    cycle.preliminary = publication;
    return publication;
}
/**
 * Explicit producer boundary for the separately published final 26-player list.
 * Final selection never follows automatically from preselection.
 */
export function recordNationalFinalSquadInPlace(state, input) {
    if (!validId(input.cycleId) || !validProvenance(input.source))
        return null;
    const store = getNationalSelectionAuthorityStore(state);
    if (!store)
        return null;
    const cycle = store.cycles.find(row => row.cycleId === input.cycleId);
    if (!cycle || !cycle.preliminary || cycle.preliminary.membership !== "selected")
        return null;
    if (state.flags.NATIONAL_RETIRED === true && input.membership !== "withdrawn")
        return null;
    const role = input.role ?? null;
    if (input.membership !== "selected" && role !== null)
        return null;
    if (role !== null && !FINAL_ROLES.includes(role))
        return null;
    if (cycle.final) {
        return cycle.final.membership === input.membership && cycle.final.role === role ? cycle.final : null;
    }
    const publication = {
        date: state.date,
        runtimeDay: state.runtime.day,
        squadSize: 26,
        membership: input.membership,
        role,
        source: cloneSource(input.source)
    };
    cycle.final = publication;
    return publication;
}
/** Read-only exact selection facts for narrative gates; consumes zero RNG. */
export function resolveNationalSelectionFacts(state) {
    const store = getNationalSelectionAuthorityStore(state);
    const cycle = store?.cycles.at(-1) ?? null;
    const preliminary = cycle?.preliminary ?? null;
    const final = cycle?.final ?? null;
    return {
        cycleId: cycle?.cycleId ?? null,
        tournamentId: cycle?.tournamentId ?? null,
        preliminaryMembership: preliminary?.membership === "selected" || preliminary?.membership === "omitted"
            ? preliminary.membership
            : null,
        preliminaryPublicationDate: preliminary?.date ?? null,
        preselected30: preliminary?.membership === "selected",
        finalMembership: final?.membership ?? null,
        finalPublicationDate: final?.date ?? null,
        selectedFinal26: final?.membership === "selected",
        finalRole: final?.membership === "selected" ? final.role : null
    };
}
