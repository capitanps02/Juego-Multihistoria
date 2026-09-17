export type SeedClubScope = "career" | "origin_club";
export type SeedSeasonScope = "career" | "origin_season";
export interface SeedScopePolicy {
    /** Finite catalog age windows are terminal once the player moves beyond the maximum age. */
    expireAtAgeWindowEnd: boolean;
    /** Career by default: changing club must not erase long-lived consequences silently. */
    club: SeedClubScope;
    /** Career by default: season rollover must not erase a consequence silently. */
    season: SeedSeasonScope;
}
/**
 * Only consequences whose meaning is unambiguously tied to one dressing room / club
 * are local here. Content workstreams can extend this list without changing runtime code.
 */
export declare const SEED_SCOPE_OVERRIDES: Readonly<Record<string, Partial<SeedScopePolicy>>>;
export declare function getSeedScopePolicy(seedId: string): SeedScopePolicy;
