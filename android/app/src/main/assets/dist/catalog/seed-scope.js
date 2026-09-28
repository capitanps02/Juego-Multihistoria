const DEFAULT_SCOPE = {
    expireAtAgeWindowEnd: true,
    club: "career",
    season: "career"
};
/**
 * Only consequences whose meaning is unambiguously tied to one dressing room / club
 * are local here. Content workstreams can extend this list without changing runtime code.
 */
export const SEED_SCOPE_OVERRIDES = {
    SEED_TEAMMATE_COVER: { club: "origin_club" },
    SEED_LOCKER_VOTE: { club: "origin_club" },
    SEED_PRIVATE_CHAT: { club: "origin_club" },
    SEED_STAR_COMPETITION: { club: "origin_club" },
    SEED_PENALTY_HIERARCHY: { club: "origin_club" }
};
export function getSeedScopePolicy(seedId) {
    return { ...DEFAULT_SCOPE, ...(SEED_SCOPE_OVERRIDES[seedId] ?? {}) };
}
