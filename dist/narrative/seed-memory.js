import { SEED_CATALOG } from "../catalog/seeds.js";
import { getSeedScopePolicy } from "../catalog/seed-scope.js";
const TERMINAL_STATES = new Set(["resolved", "expired"]);
const DEFINITIONS = new Map(SEED_CATALOG.map(seed => [seed.id, seed]));
const ORIGIN_CLUB_PAYLOAD = "__t52OriginClub";
function inferOriginClub(state, seed) {
    const stored = seed.payload[ORIGIN_CLUB_PAYLOAD];
    if (typeof stored === "string")
        return stored;
    for (let i = state.history.length - 1; i >= 0; i -= 1) {
        const entry = state.history[i];
        if (entry.eventId === seed.originEvent && entry.season === seed.originSeason)
            return entry.club;
    }
    return null;
}
export function seedInstanceScopeValid(state, seed) {
    const definition = DEFINITIONS.get(seed.id);
    const policy = getSeedScopePolicy(seed.id);
    if (seed.expiresAfter && seed.expiresAfter <= state.date)
        return false;
    const maxAge = definition?.ageWindow[1];
    if (policy.expireAtAgeWindowEnd && maxAge !== null && maxAge !== undefined && state.age > maxAge)
        return false;
    if (policy.season === "origin_season" && seed.originSeason !== state.season)
        return false;
    if (policy.club === "origin_club") {
        const originClub = inferOriginClub(state, seed);
        if (originClub !== null && originClub !== state.club)
            return false;
    }
    return true;
}
export function seedInstances(state, seedId) {
    return state.seeds.filter(seed => seed.id === seedId);
}
export function liveSeedInstance(state, seedId) {
    const instances = seedInstances(state, seedId);
    for (let i = instances.length - 1; i >= 0; i -= 1) {
        const seed = instances[i];
        if (!TERMINAL_STATES.has(seed.state) && seedInstanceScopeValid(state, seed))
            return seed;
    }
    return null;
}
export function latestHistoricalSeedInstance(state, seedId) {
    const instances = seedInstances(state, seedId);
    return instances.length ? instances[instances.length - 1] : null;
}
export function projectSeedMemory(state, seedId) {
    const live = liveSeedInstance(state, seedId);
    const historical = latestHistoricalSeedInstance(state, seedId);
    const selected = live ?? historical;
    if (!selected) {
        return {
            seedId,
            source: "absent",
            historicalExists: false,
            live: false,
            scopeValid: false,
            state: null,
            intensity: null,
            originEvent: null,
            originSeason: null,
            originClub: null,
            consumedBy: null,
            expiresAfter: null,
            lastTouchedDate: null,
            payload: {}
        };
    }
    return {
        seedId,
        source: live ? "live" : "historical",
        historicalExists: true,
        live: Boolean(live),
        scopeValid: seedInstanceScopeValid(state, selected),
        state: selected.state,
        intensity: selected.intensity,
        originEvent: selected.originEvent,
        originSeason: selected.originSeason,
        originClub: inferOriginClub(state, selected),
        consumedBy: selected.consumedBy ?? null,
        expiresAfter: selected.expiresAfter ?? null,
        lastTouchedDate: selected.lastTouchedDate ?? null,
        payload: selected.payload
    };
}
function liveStringPayload(state, seedId, key) {
    const seed = liveSeedInstance(state, seedId);
    const value = seed?.payload[key];
    return typeof value === "string" ? value : null;
}
export function getBrunoFavorState(state) {
    return {
        ...projectSeedMemory(state, "SEED_BRUNO_FAVOR"),
        stance: liveStringPayload(state, "SEED_BRUNO_FAVOR", "stance")
    };
}
export function getCoachPublicMemory(state) {
    return {
        ...projectSeedMemory(state, "SEED_COACH_PUBLIC"),
        stance: liveStringPayload(state, "SEED_COACH_PUBLIC", "stance")
    };
}
export function getMenaEarlyRead(state) {
    return {
        ...projectSeedMemory(state, "SEED_MENA_EARLY_READ"),
        read: liveStringPayload(state, "SEED_MENA_EARLY_READ", "read"),
        early: liveStringPayload(state, "SEED_MENA_EARLY_READ", "early")
    };
}
export function getExitStyleMemory(state) {
    return {
        ...projectSeedMemory(state, "SEED_EXIT_STYLE_UDV"),
        january: liveStringPayload(state, "SEED_EXIT_STYLE_UDV", "january"),
        end: liveStringPayload(state, "SEED_EXIT_STYLE_UDV", "end"),
        summer: liveStringPayload(state, "SEED_EXIT_STYLE_UDV", "summer"),
        market18: liveStringPayload(state, "SEED_EXIT_STYLE_UDV", "market18"),
        year19: liveStringPayload(state, "SEED_EXIT_STYLE_UDV", "year19")
    };
}
export function getBodyPrecedent(state) {
    return {
        ...projectSeedMemory(state, "SEED_BODY_PRECEDENT"),
        pattern: liveStringPayload(state, "SEED_BODY_PRECEDENT", "pattern"),
        early: liveStringPayload(state, "SEED_BODY_PRECEDENT", "early"),
        return19: liveStringPayload(state, "SEED_BODY_PRECEDENT", "return19")
    };
}
export function getPhysioConfidenceMemory(state) {
    return {
        ...projectSeedMemory(state, "SEED_PHYSIO_CONFIDENCE"),
        pattern: liveStringPayload(state, "SEED_PHYSIO_CONFIDENCE", "pattern"),
        return19: liveStringPayload(state, "SEED_PHYSIO_CONFIDENCE", "return19")
    };
}
/**
 * Exact scalar payload projections for declarative Condition paths.
 * Only scope-valid live instances contribute. Historical existence remains available
 * through projectSeedMemory()/latestHistoricalSeedInstance() and is never promoted to live.
 */
export function earlyCareerSeedFacts(state) {
    const bruno = getBrunoFavorState(state);
    const coach = getCoachPublicMemory(state);
    const mena = getMenaEarlyRead(state);
    const exit = getExitStyleMemory(state);
    const body = getBodyPrecedent(state);
    const physio = getPhysioConfidenceMemory(state);
    return {
        brunoFavorStance: bruno.stance,
        coachPublicStance: coach.stance,
        menaEarlyRead: mena.read,
        menaEarlyContext: mena.early,
        exitStyleJanuary: exit.january,
        exitStyleEnd: exit.end,
        exitStyleSummer: exit.summer,
        exitStyleMarket18: exit.market18,
        exitStyleYear19: exit.year19,
        bodyPrecedentPattern: body.pattern,
        bodyPrecedentEarly: body.early,
        bodyPrecedentReturn19: body.return19,
        physioConfidencePattern: physio.pattern,
        physioConfidenceReturn19: physio.return19
    };
}
