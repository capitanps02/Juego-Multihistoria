import {
  FOOTBALL_DIVISIONS,
  clubById,
  clubsForDivision,
  nearestDivisionForCountry
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

function foreignCountryForCompatibilityClub(registrationClub: string, leagueTier: number): FootballCountryCode {
  const requested = normalizedTier(leagueTier);
  const countryCodes = [...new Set(
    FOOTBALL_DIVISIONS
      .filter(division => division.countryCode !== "ESP")
      .map(division => division.countryCode)
  )].sort();
  const exact = countryCodes.filter(countryCode =>
    FOOTBALL_DIVISIONS.some(division => division.countryCode === countryCode && division.tier === requested)
  );
  const candidates = exact.length > 0 ? exact : countryCodes;
  if (candidates.length === 0) return "ENG";
  return candidates[hashString(`fixture-country|${registrationClub}`) % candidates.length]!;
}

/**
 * Resolve sporting league context without mutating career state.
 * Live career leagueTier is authoritative for sporting level. A catalog club supplies
 * its country identity, but its catalog division is metadata and must not override an
 * in-career promotion/relegation. Canonical/domestic compatibility IDs project to Spain,
 * while historical abroad IDs project to one stable foreign country.
 */
export function resolveFixtureDivision(
  registrationClub: string,
  leagueTier: number,
  route: FixtureOpponentContext["route"],
  abroad: boolean
) {
  const catalogClub = clubById(registrationClub);
  if (catalogClub) return nearestDivisionForCountry(catalogClub.countryCode, leagueTier);

  const foreign = abroad || route === "abroad" || /^Foreign_/i.test(registrationClub);
  const countryCode = foreign
    ? foreignCountryForCompatibilityClub(registrationClub, leagueTier)
    : "ESP";
  return nearestDivisionForCountry(countryCode, leagueTier);
}

/**
 * Select one concrete fictional opponent using an already-deterministic fingerprint.
 * Zero GameState RNG draws are consumed.
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
    pool = FOOTBALL_DIVISIONS
      .flatMap(row => [...clubsForDivision(row.id)])
      .filter(candidate => candidate.id !== currentClub?.id);
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
