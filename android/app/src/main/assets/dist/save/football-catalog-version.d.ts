import type { GameState } from "../core/types.js";
export declare const CURRENT_FOOTBALL_CATALOG_VERSION = "world-v2-a2-2026-09-28";
export declare const PRE_FOOTBALL_CATALOG_VERSION = "pre-football-catalog";
/**
 * Input generations whose stable identity space is understood by V2.
 * PRE is a compatibility generation: load/read never upgrades it implicitly.
 */
export declare const SUPPORTED_FOOTBALL_CATALOG_VERSIONS: readonly ["pre-football-catalog", "world-v2-a1-2026-09-28", "world-v2-a2-2026-09-28"];
export declare function isSupportedFootballCatalogVersion(value: unknown): value is string;
/** Read the declared input generation without mutating source data. */
export declare function footballCatalogVersionOf(value: unknown): string;
/**
 * Compatibility reader retained for callers that used the original helper name.
 * This function validates but never migrates. Version changes belong exclusively
 * to migrateFootballCatalogVersionInPlace.
 */
export declare function normalizeFootballCatalogVersion(value: unknown): string;
export interface ExplicitFootballClubIdMap {
    readonly [oldId: string]: string | null;
}
/**
 * Pure future-migration primitive. It applies only an exact manifest entry.
 * There is deliberately no matching by name, city, shortName or array position.
 * A null entry is a tombstone and fails closed instead of inventing a club.
 */
export declare function migrateFootballClubReferenceExplicitly(value: string, mapping: ExplicitFootballClubIdMap): string;
/**
 * Apply one explicit identity manifest to every persisted football-reference surface.
 * The traversal is structural only; it never uses display names or football metadata.
 */
export declare function migrateFootballStateReferencesExplicitlyInPlace(state: GameState, mapping: ExplicitFootballClubIdMap): number;
export interface FootballCatalogMigrationStep {
    readonly from: string;
    readonly to: string;
    readonly clubIds: ExplicitFootballClubIdMap;
}
/**
 * Stable V2 IDs did not change between A1 and A2. Keeping the step explicit means
 * a future ID change must ship a reviewed manifest instead of a heuristic mapper.
 */
export declare const FOOTBALL_CATALOG_MIGRATION_STEPS: readonly FootballCatalogMigrationStep[];
export declare function migrateFootballCatalogVersionInPlace(state: GameState, targetVersion?: string): boolean;
