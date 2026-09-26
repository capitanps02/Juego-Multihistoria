import {
  FOOTBALL_DIVISIONS,
  clubsForDivision,
  nearestDivisionForCountry
} from "./index.js";
import type { FootballClub, FootballCountryCode } from "./types.js";

export type MarketDestinationProfile = "development" | "balanced" | "ambitious";

export interface MarketDestinationRequest {
  countryCode: FootballCountryCode;
  leagueTier: number;
  roll: number;
  profile: MarketDestinationProfile;
  excludeClubIds?: readonly string[];
}

function shortlistScore(club: FootballClub, profile: MarketDestinationProfile): number {
  if (profile === "development") {
    return club.developmentBias * 0.45
      + club.youthQuality * 0.35
      + (100 - club.prestige) * 0.20;
  }
  if (profile === "ambitious") {
    return club.prestige * 0.55
      + club.financialPower * 0.30
      + club.internationalAttraction * 0.15;
  }
  return club.prestige * 0.35
    + club.developmentBias * 0.25
    + club.financialPower * 0.20
    + club.youthQuality * 0.20;
}

const MARKET_PROFILES: readonly MarketDestinationProfile[] = Object.freeze(["development", "balanced", "ambitious"]);
const RANKED_DIVISION_POOLS = new Map<string, readonly FootballClub[]>();

for (const division of FOOTBALL_DIVISIONS) {
  const divisionClubs = clubsForDivision(division.id);
  for (const profile of MARKET_PROFILES) {
    const ranked = [...divisionClubs].sort((a, b) => {
      const delta = shortlistScore(b, profile) - shortlistScore(a, profile);
      return delta !== 0 ? delta : a.id.localeCompare(b.id);
    });
    RANKED_DIVISION_POOLS.set(`${division.id}|${profile}`, Object.freeze(ranked));
  }
}

const FOREIGN_COUNTRY_CODES = Object.freeze([...new Set(
  FOOTBALL_DIVISIONS
    .filter(division => division.countryCode !== "ESP")
    .map(division => division.countryCode)
)]);

const FOREIGN_COUNTRIES_BY_TIER = new Map<number, readonly FootballCountryCode[]>();
for (let requestedTier = 1; requestedTier <= 9; requestedTier += 1) {
  const contexts = FOREIGN_COUNTRY_CODES
    .map(countryCode => ({ countryCode, division: nearestDivisionForCountry(countryCode, requestedTier) }))
    .filter((row): row is { countryCode: FootballCountryCode; division: NonNullable<typeof row.division> } => row.division !== null);
  if (contexts.length === 0) {
    FOREIGN_COUNTRIES_BY_TIER.set(requestedTier, Object.freeze([]));
    continue;
  }
  const minimumDistance = Math.min(...contexts.map(row => Math.abs(row.division.tier - requestedTier)));
  FOREIGN_COUNTRIES_BY_TIER.set(
    requestedTier,
    Object.freeze(contexts
      .filter(row => Math.abs(row.division.tier - requestedTier) === minimumDistance)
      .map(row => row.countryCode))
  );
}

/**
 * Deterministic identity selector for formal market opportunities.
 * It chooses a club from the nearest represented division but does not alter the
 * offer's authoritative leagueTier: promotion/relegation state remains owned by the career.
 */
export function selectMarketDestination(request: MarketDestinationRequest): FootballClub {
  const division = nearestDivisionForCountry(request.countryCode, request.leagueTier);
  if (!division) throw new Error(`No football-catalog division for ${request.countryCode}.`);

  const excluded = new Set(request.excludeClubIds ?? []);
  const preRanked = RANKED_DIVISION_POOLS.get(`${division.id}|${request.profile}`) ?? [];
  const ranked = preRanked.filter(club => !excluded.has(club.id));
  if (ranked.length === 0) throw new Error(`No football-catalog market destination for ${division.id}.`);

  const shortlistSize = request.profile === "balanced"
    ? ranked.length
    : Math.max(6, Math.ceil(ranked.length * 0.6));
  const shortlist = ranked.slice(0, shortlistSize);
  return shortlist[(request.roll >>> 0) % shortlist.length]!;
}


export interface ForeignMarketDestinationRequest {
  leagueTier: number;
  roll: number;
  profile: MarketDestinationProfile;
  excludeClubIds?: readonly string[];
}

function mix32(value: number): number {
  let x = value >>> 0;
  x ^= x >>> 16;
  x = Math.imul(x, 0x7feb352d);
  x ^= x >>> 15;
  x = Math.imul(x, 0x846ca68b);
  x ^= x >>> 16;
  return x >>> 0;
}

/**
 * Select a foreign destination without any extra RNG draw.
 * Countries with an exact represented tier are preferred. If no foreign league
 * represents that tier, the closest represented depth is used.
 */
export function selectForeignMarketDestination(request: ForeignMarketDestinationRequest): FootballClub {
  const requestedTier = Number.isFinite(request.leagueTier)
    ? Math.max(1, Math.min(9, Math.trunc(request.leagueTier)))
    : 3;
  const candidates = FOREIGN_COUNTRIES_BY_TIER.get(requestedTier) ?? [];
  if (candidates.length === 0) throw new Error("Football catalog has no foreign market destinations.");

  const countryRoll = mix32(request.roll ^ 0x9e3779b9);
  const selectedCountry = candidates[countryRoll % candidates.length]!;

  return selectMarketDestination({
    countryCode: selectedCountry,
    leagueTier: requestedTier,
    roll: mix32(request.roll ^ 0x85ebca6b),
    profile: request.profile,
    excludeClubIds: request.excludeClubIds
  });
}
