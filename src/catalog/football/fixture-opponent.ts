import {
  FOOTBALL_CLUBS,
  FOOTBALL_DIVISIONS,
  clubById,
  clubsForDivision,
  divisionById
} from "./index.js";
import type { FootballCountryCode } from "./types.js";

export interface FixtureOpponentContext {
  registrationClub: string;
  leagueTier: number;
  route: "home" | "loan" | "abroad" | "domestic" | "free_agent";
  abroad: boolean;
  selectionFingerprint: number;
}

export interface FixtureOpponentSelection {
  clubId: string;
  name: string;
  divisionId: string;
  countryCode: FootballCountryCode;
}

const FOREIGN_COUNTRIES: readonly FootballCountryCode[] = Object.freeze([
  "ENG", "ITA", "DEU", "FRA", "PRT", "NLD", "BEL", "TUR", "NOR",
  "USA", "MEX", "ARG", "JPN", "CHN", "MAR", "ZAF"
]);

function hashString(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function normalizedTier(value: number): number {
  if (!Number.isFinite(value)) return 3;
  return Math.max(1, Math.min(9, Math.trunc(value)));
}

function divisionsForCountry(countryCode: FootballCountryCode) {
  return FOOTBALL_DIVISIONS.filter(division => division.countryCode === countryCode);
}

function nearestDivision(countryCode: FootballCountryCode, leagueTier: number) {
  const divisions = divisionsForCountry(countryCode);
  if (divisions.length === 0) return null;
  const requested = normalizedTier(leagueTier);
  return [...divisions].sort((a, b) => {
    const distance = Math.abs(a.tier - requested) - Math.abs(b.tier - requested);
    return distance !== 0 ? distance : b.tier - a.tier;
  })[0] ?? null;
}

function foreignCountryForSyntheticClub(registrationClub: string, leagueTier: number): FootballCountryCode {
  const requested = normalizedTier(leagueTier);
  const exact = FOREIGN_COUNTRIES.filter(countryCode =>
    divisionsForCountry(countryCode).some(division => division.tier === requested)
  );
  const candidates = exact.length > 0
    ? exact
    : FOREIGN_COUNTRIES.filter(countryCode => divisionsForCountry(countryCode).length > 0);
  if (candidates.length === 0) return "ENG";
  return candidates[hashString(`fixture-country|${registrationClub}`) % candidates.length]!;
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
export function resolveFixtureDivision(
  registrationClub: string,
  leagueTier: number,
  route: FixtureOpponentContext["route"],
  abroad: boolean
) {
  const catalogClub = clubById(registrationClub);
  if (catalogClub) return divisionById(catalogClub.divisionId);

  const foreign = abroad || route === "abroad" || /^Foreign_/i.test(registrationClub);
  const countryCode = foreign
    ? foreignCountryForSyntheticClub(registrationClub, leagueTier)
    : "ESP";
  return nearestDivision(countryCode, leagueTier);
}

/**
 * Select a concrete fictional opponent from the world catalog.
 * The caller supplies an already deterministic fixture fingerprint, so no RNG draw is consumed.
 */
export function selectFixtureOpponent(context: FixtureOpponentContext): FixtureOpponentSelection {
  const currentClub = clubById(context.registrationClub);
  const division = resolveFixtureDivision(
    context.registrationClub,
    context.leagueTier,
    context.route,
    context.abroad
  );
  if (!division) throw new Error("Football catalog has no usable fixture division.");

  let pool = clubsForDivision(division.id);
  if (currentClub?.divisionId === division.id) {
    pool = pool.filter(candidate => candidate.id !== currentClub.id);
  }
  if (pool.length === 0) {
    pool = FOOTBALL_CLUBS.filter(candidate => candidate.id !== currentClub?.id);
  }
  if (pool.length === 0) throw new Error("Football catalog has no usable fixture opponent.");

  const selected = pool[(context.selectionFingerprint >>> 0) % pool.length]!;
  return Object.freeze({
    clubId: selected.id,
    name: selected.name,
    divisionId: selected.divisionId,
    countryCode: selected.countryCode
  });
}
