import {
  FOOTBALL_CATALOG_VERSION,
  classifyFootballClubReference
} from "../catalog/football/index.js";

export const CURRENT_FOOTBALL_CATALOG_VERSION = FOOTBALL_CATALOG_VERSION;
export const PRE_FOOTBALL_CATALOG_VERSION = "pre-football-catalog";

/**
 * Versions actually produced by Football Database V2 development. Missing metadata
 * is a distinct pre-catalog compatibility generation and is never auto-upgraded.
 */
export const SUPPORTED_FOOTBALL_CATALOG_VERSIONS = Object.freeze([
  PRE_FOOTBALL_CATALOG_VERSION,
  "world-v2-a1-2026-09-28",
  CURRENT_FOOTBALL_CATALOG_VERSION
] as const);

const SUPPORTED = new Set<string>(SUPPORTED_FOOTBALL_CATALOG_VERSIONS);

export function isSupportedFootballCatalogVersion(value: unknown): value is string {
  return typeof value === "string" && SUPPORTED.has(value);
}

/** Missing metadata has stable compatibility meaning; reading it never mutates a save. */
export function footballCatalogVersionOf(value: unknown): string {
  if (value === undefined) return PRE_FOOTBALL_CATALOG_VERSION;
  if (!isSupportedFootballCatalogVersion(value)) {
    throw new Error(`footballCatalogVersion: versión de catálogo no compatible: ${String(value)}`);
  }
  return value;
}

export interface ExplicitFootballClubIdMap {
  readonly [oldId: string]: string | null;
}

/**
 * Pure future-migration primitive. It applies only an exact manifest entry.
 * There is deliberately no matching by name, city, shortName or array position.
 * A null entry is a tombstone and fails closed instead of inventing a club.
 */
export function migrateFootballClubReferenceExplicitly(
  value: string,
  mapping: ExplicitFootballClubIdMap
): string {
  if (!Object.prototype.hasOwnProperty.call(mapping, value)) return value;
  const replacement = mapping[value];
  if (replacement === null) {
    throw new Error(`Football club identity ${value} is tombstoned without replacement`);
  }
  const classification = classifyFootballClubReference(replacement);
  if (classification.kind !== "catalog" && classification.kind !== "canonical_special") {
    throw new Error(`Explicit football migration target ${replacement} is not a current football identity`);
  }
  return replacement;
}
