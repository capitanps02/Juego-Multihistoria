import type { FootballCountryCode } from "./types.js";

export const FOOTBALL_CATALOG_CLUB_ID_PATTERN = /^[A-Z]{3}_[A-Z0-9]+(?:_[A-Z0-9]+)*$/;

function asciiToken(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export function defaultCatalogClubId(countryCode: FootballCountryCode, city: string): string {
  const token = asciiToken(city);
  if (!token) throw new Error(`Cannot derive football club identity from empty city: ${city}`);
  return `${countryCode}_${token}`;
}

export function catalogMultiClubIdentityKey(
  countryCode: FootballCountryCode,
  city: string,
  occurrence: number
): string {
  if (!Number.isInteger(occurrence) || occurrence < 1) {
    throw new Error(`Football club city occurrence must be a positive integer, got ${occurrence}`);
  }
  return `${countryCode}|${asciiToken(city)}|${occurrence}`;
}

/**
 * Preserves every existing first-club city ID while requiring an explicit immutable ID
 * for additional clubs in the same city. This prevents city-list edits from silently
 * renumbering persisted identities.
 */
export function stableCatalogClubId(
  countryCode: FootballCountryCode,
  city: string,
  occurrence = 1,
  explicitId?: string
): string {
  const legacyCompatibleBase = defaultCatalogClubId(countryCode, city);
  if (occurrence === 1 && explicitId === undefined) return legacyCompatibleBase;

  if (!Number.isInteger(occurrence) || occurrence < 1) {
    throw new Error(`Football club city occurrence must be a positive integer, got ${occurrence}`);
  }
  if (!explicitId) {
    throw new Error(
      `Multiple football clubs in ${city} require an explicit stable club id for occurrence ${occurrence}.`
    );
  }
  if (!FOOTBALL_CATALOG_CLUB_ID_PATTERN.test(explicitId)) {
    throw new Error(`Malformed explicit football club id: ${explicitId}`);
  }
  if (!explicitId.startsWith(`${countryCode}_`)) {
    throw new Error(`Explicit football club id ${explicitId} does not match country ${countryCode}`);
  }
  return explicitId;
}
