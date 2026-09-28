import type { FootballCountryCode } from "./types.js";
export declare const FOOTBALL_CATALOG_CLUB_ID_PATTERN: RegExp;
export declare function defaultCatalogClubId(countryCode: FootballCountryCode, city: string): string;
export declare function catalogMultiClubIdentityKey(countryCode: FootballCountryCode, city: string, occurrence: number): string;
/**
 * Preserves every existing first-club city ID while requiring an explicit immutable ID
 * for additional clubs in the same city. This prevents city-list edits from silently
 * renumbering persisted identities.
 */
export declare function stableCatalogClubId(countryCode: FootballCountryCode, city: string, occurrence?: number, explicitId?: string): string;
