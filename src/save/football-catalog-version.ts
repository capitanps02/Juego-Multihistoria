import type { GameState } from "../core/types.js";
import {
  FOOTBALL_CATALOG_VERSION,
  classifyFootballClubReference
} from "../catalog/football/index.js";

export const CURRENT_FOOTBALL_CATALOG_VERSION = FOOTBALL_CATALOG_VERSION;
export const PRE_FOOTBALL_CATALOG_VERSION = "pre-football-catalog";

/**
 * Input generations whose stable identity space is understood by V2.
 * PRE is a compatibility generation: load/read never upgrades it implicitly.
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

/** Read the declared input generation without mutating source data. */
export function footballCatalogVersionOf(value: unknown): string {
  if (value === undefined) return PRE_FOOTBALL_CATALOG_VERSION;
  if (!isSupportedFootballCatalogVersion(value)) {
    throw new Error(`footballCatalogVersion: versión de catálogo no compatible: ${String(value)}`);
  }
  return value;
}

/**
 * Compatibility reader retained for callers that used the original helper name.
 * This function validates but never migrates. Version changes belong exclusively
 * to migrateFootballCatalogVersionInPlace.
 */
export function normalizeFootballCatalogVersion(value: unknown): string {
  return footballCatalogVersionOf(value);
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

const MIGRATABLE_REFERENCE_KEYS = new Set([
  "club",
  "ownerClub",
  "registrationClub",
  "clubId",
  "destination",
  "opponentClubId"
]);

function plainRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

/**
 * Apply one explicit identity manifest to every persisted football-reference surface.
 * The traversal is structural only; it never uses display names or football metadata.
 */
export function migrateFootballStateReferencesExplicitlyInPlace(
  state: GameState,
  mapping: ExplicitFootballClubIdMap
): number {
  let changes = 0;
  const ancestors = new Set<object>();
  let nodes = 0;

  const visit = (value: unknown, depth: number): void => {
    if (++nodes > 300_000 || depth > 64) {
      throw new Error("Football catalog migration state is too large or deep");
    }
    if (value === null || typeof value !== "object") return;
    if (ancestors.has(value as object)) throw new Error("Football catalog migration state contains a cycle");
    ancestors.add(value as object);
    try {
      if (Array.isArray(value)) {
        for (const child of value) visit(child, depth + 1);
        return;
      }
      if (!plainRecord(value)) throw new Error("Football catalog migration encountered a non-plain object");
      for (const [key, child] of Object.entries(value)) {
        if (MIGRATABLE_REFERENCE_KEYS.has(key) && typeof child === "string") {
          const migrated = migrateFootballClubReferenceExplicitly(child, mapping);
          if (migrated !== child) {
            value[key] = migrated;
            changes += 1;
          }
        } else if (child !== null && typeof child === "object") {
          visit(child, depth + 1);
        }
      }
    } finally {
      ancestors.delete(value as object);
    }
  };

  visit(state, 0);
  return changes;
}

export interface FootballCatalogMigrationStep {
  readonly from: string;
  readonly to: string;
  readonly clubIds: ExplicitFootballClubIdMap;
}

/**
 * Stable V2 IDs did not change between A1 and A2. Keeping the step explicit means
 * a future ID change must ship a reviewed manifest instead of a heuristic mapper.
 */
export const FOOTBALL_CATALOG_MIGRATION_STEPS: readonly FootballCatalogMigrationStep[] = Object.freeze([
  Object.freeze({
    from: "world-v2-a1-2026-09-28",
    to: CURRENT_FOOTBALL_CATALOG_VERSION,
    clubIds: Object.freeze({})
  })
]);

export function migrateFootballCatalogVersionInPlace(
  state: GameState,
  targetVersion = CURRENT_FOOTBALL_CATALOG_VERSION
): boolean {
  let version = footballCatalogVersionOf(state.footballCatalogVersion);
  if (version === PRE_FOOTBALL_CATALOG_VERSION) {
    throw new Error("Pre-football-catalog saves require an audited explicit legacy manifest before upgrade");
  }
  if (!isSupportedFootballCatalogVersion(targetVersion)) {
    throw new Error(`Unsupported football catalog migration target: ${targetVersion}`);
  }

  let changed = false;
  const visited = new Set<string>();
  while (version !== targetVersion) {
    if (visited.has(version)) throw new Error(`Football catalog migration cycle at ${version}`);
    visited.add(version);
    const step = FOOTBALL_CATALOG_MIGRATION_STEPS.find(row => row.from === version);
    if (!step) throw new Error(`No explicit football catalog migration path from ${version} to ${targetVersion}`);
    migrateFootballStateReferencesExplicitlyInPlace(state, step.clubIds);
    state.footballCatalogVersion = step.to;
    version = step.to;
    changed = true;
  }
  return changed;
}