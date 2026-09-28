import { FOOTBALL_CLUBS, clubById, clubsForDivision, divisionById, divisionsForCountry, nearestDivisionForCountry } from "./index.js";
const FOREIGN_COUNTRIES = Object.freeze([
    "ENG", "ITA", "DEU", "FRA", "PRT", "NLD", "BEL", "TUR", "NOR",
    "USA", "MEX", "ARG", "JPN", "CHN", "MAR", "ZAF"
]);
const FOREIGN_COUNTRIES_BY_TIER = new Map();
for (let tier = 1; tier <= 9; tier += 1) {
    const exact = FOREIGN_COUNTRIES.filter(countryCode => divisionsForCountry(countryCode).some(division => division.tier === tier));
    const fallback = exact.length > 0
        ? exact
        : FOREIGN_COUNTRIES.filter(countryCode => divisionsForCountry(countryCode).length > 0);
    FOREIGN_COUNTRIES_BY_TIER.set(tier, Object.freeze(fallback));
}
const OPPONENTS_BY_CLUB = new Map();
for (const club of FOOTBALL_CLUBS) {
    OPPONENTS_BY_CLUB.set(club.id, Object.freeze(clubsForDivision(club.divisionId).filter(candidate => candidate.id !== club.id)));
}
function hashString(value) {
    let hash = 2166136261;
    for (let i = 0; i < value.length; i += 1) {
        hash ^= value.charCodeAt(i);
        hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
}
function normalizedTier(value) {
    if (!Number.isFinite(value))
        return 3;
    return Math.max(1, Math.min(9, Math.trunc(value)));
}
function foreignCountryForSyntheticClub(registrationClub, leagueTier) {
    const requested = normalizedTier(leagueTier);
    const candidates = FOREIGN_COUNTRIES_BY_TIER.get(requested) ?? FOREIGN_COUNTRIES;
    if (candidates.length === 0)
        return "ENG";
    return candidates[hashString(`fixture-country|${registrationClub}`) % candidates.length];
}
/**
 * Resolve the league context for fixture presentation only.
 *
 * - Catalog clubs keep their exact division.
 * - UDV and synthetic domestic/development/loan clubs remain in Spain.
 * - Foreign/abroad synthetic clubs receive one stable country derived only from club identity.
 *
 * This projection consumes no GameState RNG and never mutates the catalog.
 */
export function resolveFixtureDivision(registrationClub, leagueTier, route, abroad) {
    const catalogClub = clubById(registrationClub);
    if (catalogClub) {
        return catalogClub.tier === normalizedTier(leagueTier)
            ? divisionById(catalogClub.divisionId)
            : nearestDivisionForCountry(catalogClub.countryCode, leagueTier);
    }
    const foreign = abroad || route === "abroad" || /^Foreign_/i.test(registrationClub);
    const countryCode = foreign
        ? foreignCountryForSyntheticClub(registrationClub, leagueTier)
        : "ESP";
    return nearestDivisionForCountry(countryCode, leagueTier);
}
/**
 * Select a concrete fictional opponent from the world catalog.
 * The caller supplies an already deterministic fixture fingerprint, so no RNG draw is consumed.
 */
export function selectFixtureOpponent(context) {
    const currentClub = clubById(context.registrationClub);
    const division = resolveFixtureDivision(context.registrationClub, context.leagueTier, context.route, context.abroad);
    if (!division)
        throw new Error("Football catalog has no usable fixture division.");
    let pool = clubsForDivision(division.id);
    if (currentClub?.divisionId === division.id) {
        pool = OPPONENTS_BY_CLUB.get(currentClub.id) ?? pool;
    }
    if (pool.length === 0) {
        pool = FOOTBALL_CLUBS.filter(candidate => candidate.id !== currentClub?.id);
    }
    if (pool.length === 0)
        throw new Error("Football catalog has no usable fixture opponent.");
    const selected = pool[(context.selectionFingerprint >>> 0) % pool.length];
    return Object.freeze({
        clubId: selected.id,
        name: selected.name,
        divisionId: selected.divisionId,
        countryCode: selected.countryCode
    });
}
