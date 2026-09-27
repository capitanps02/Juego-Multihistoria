import {
  FOOTBALL_CATALOG_VERSION,
  classifyFootballClubReference
} from "../catalog/football/index.js";

export const CURRENT_FOOTBALL_CATALOG_VERSION = FOOTBALL_CATALOG_VERSION;
export const PRE_FOOTBALL_CATALOG_VERSION = "pre-football-catalog";

/**
 * Input generations whose stable identity space is understood by V2.
 * PRE is an input compatibility marker only: load normalizes it to CURRENT in memory.
 */
export const SUPPORTED_FOOTBALL_CATALOG_VERSIONS = Object.freeze([
  PRE_FOOTBALL_CATALOG_VERSION,
  "world-v1-2026-09-26",
  "world-v2-a1-2026-09-28",
  CURRENT_FOOTBALL_CATALOG_VERSION
] as const);

const SUPPORTED = new Set<string>(SUPPORTED_FOOTBALL_CATALOG_VERSIONS);

export function isSupportedFootballCatalogVersion(value: unknown): value is string {
  return typeof value === "string" && SUPPORTED.has(value);
}

/** Read the declared input generation without mutating source data. */
export function footballCatalogVersionOf(value: unknown): string {
  if (value === undefined) return PRE_FOOTBALL_CATALOG_VERSION;
  if (!isSupportedFootballCatalogVersion(value)) {
    throw new Error(`footballCatalogVersion: versión de catálogo no compatible: ${String(value)}`);
  }
  return value;
}

/**
 * Every understood pre/current generation is normalized to the active catalog in memory.
 * Stable IDs are preserved; no display-name matching is performed.
 */
export function normalizeFootballCatalogVersion(value: unknown): string {
  footballCatalogVersionOf(value);
  return CURRENT_FOOTBALL_CATALOG_VERSION;
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
