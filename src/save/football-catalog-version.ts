import { FOOTBALL_CATALOG_VERSION } from "../catalog/football/index.js";

export const CURRENT_FOOTBALL_CATALOG_VERSION = FOOTBALL_CATALOG_VERSION;

/**
 * Catalog versions whose stable IDs are compatible with the current V2 identity layer.
 * Missing means pre-catalog save and is normalized on load.
 */
export const SUPPORTED_FOOTBALL_CATALOG_VERSIONS = Object.freeze([
  "world-v1-2026-09-26",
  "world-v2-a1-2026-09-28",
  "world-v2-a2-2026-09-28"
] as const);

const SUPPORTED = new Set<string>(SUPPORTED_FOOTBALL_CATALOG_VERSIONS);

export function isSupportedFootballCatalogVersion(value: unknown): value is string {
  return typeof value === "string" && SUPPORTED.has(value);
}

export function normalizeFootballCatalogVersion(value: unknown): string {
  if (value === undefined) return CURRENT_FOOTBALL_CATALOG_VERSION;
  if (!isSupportedFootballCatalogVersion(value)) {
    throw new Error(`footballCatalogVersion: versión de catálogo no compatible: ${String(value)}`);
  }
  return CURRENT_FOOTBALL_CATALOG_VERSION;
}
