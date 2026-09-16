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

const DEFAULT_SCOPE: SeedScopePolicy = {
  expireAtAgeWindowEnd: true,
  club: "career",
  season: "career"
};

/**
 * Only consequences whose meaning is unambiguously tied to one dressing room / club
 * are local here. Content workstreams can extend this list without changing runtime code.
 */
export const SEED_SCOPE_OVERRIDES: Readonly<Record<string, Partial<SeedScopePolicy>>> = {
  SEED_TEAMMATE_COVER: { club: "origin_club" },
  SEED_LOCKER_VOTE: { club: "origin_club" },
  SEED_PRIVATE_CHAT: { club: "origin_club" },
  SEED_STAR_COMPETITION: { club: "origin_club" },
  SEED_PENALTY_HIERARCHY: { club: "origin_club" }
};

export function getSeedScopePolicy(seedId: string): SeedScopePolicy {
  return { ...DEFAULT_SCOPE, ...(SEED_SCOPE_OVERRIDES[seedId] ?? {}) };
}
