import {
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

/**
 * Deterministic identity selector for formal market opportunities.
 * It chooses a club from the nearest represented division but does not alter the
 * offer's authoritative leagueTier: promotion/relegation state remains owned by the career.
 */
export function selectMarketDestination(request: MarketDestinationRequest): FootballClub {
  const division = nearestDivisionForCountry(request.countryCode, request.leagueTier);
  if (!division) throw new Error(`No football-catalog division for ${request.countryCode}.`);

  const excluded = new Set(request.excludeClubIds ?? []);
  const pool = clubsForDivision(division.id).filter(club => !excluded.has(club.id));
  if (pool.length === 0) throw new Error(`No football-catalog market destination for ${division.id}.`);

  const ranked = [...pool].sort((a, b) => {
    const delta = shortlistScore(b, request.profile) - shortlistScore(a, request.profile);
    return delta !== 0 ? delta : a.id.localeCompare(b.id);
  });
  const shortlistSize = request.profile === "balanced"
    ? ranked.length
    : Math.max(6, Math.ceil(ranked.length * 0.6));
  const shortlist = ranked.slice(0, shortlistSize);
  return shortlist[(request.roll >>> 0) % shortlist.length]!;
}
