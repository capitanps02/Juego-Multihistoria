import { clubById } from "./index.js";
import { selectBigClubDestination, selectForeignMarketDestination, selectHigherClubDestination, selectMarketDestination } from "./market-destination.js";
const ALIASES = new Set([
    "NEW_CLUB",
    "DEVELOPMENT_CLUB",
    "DEVELOPMENT_CLUB_2",
    "HIGHER_CLUB",
    "BIG_CLUB",
    "FOREIGN_DEV_CLUB"
]);
export function isNarrativeClubAlias(value) {
    return typeof value === "string" && ALIASES.has(value);
}
function hashString(value) {
    let hash = 2166136261;
    for (let i = 0; i < value.length; i += 1) {
        hash ^= value.charCodeAt(i);
        hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
}
function aliasTier(state, alias, requestedTier) {
    if (requestedTier !== null && Number.isFinite(requestedTier)) {
        return Math.max(1, Math.min(9, Math.trunc(requestedTier)));
    }
    if (alias === "BIG_CLUB")
        return 1;
    if (alias === "HIGHER_CLUB")
        return Math.max(1, Math.trunc(state.tier) - 1);
    if (alias === "DEVELOPMENT_CLUB" || alias === "DEVELOPMENT_CLUB_2" || alias === "FOREIGN_DEV_CLUB") {
        return Math.min(4, Math.max(1, Math.trunc(state.tier) + 1));
    }
    return Math.max(1, Math.min(9, Math.trunc(state.tier)));
}
function aliasRoll(state, alias, context, extra = "") {
    return hashString([
        state.rngState.narrative.seed,
        state.date,
        state.season,
        context.eventId,
        context.choiceId,
        alias,
        extra
    ].join("|"));
}
/**
 * Canonical event definitions keep their historical alias strings. At resolution,
 * aliases become catalog IDs via a pure hash projection with zero RNG draws.
 */
export function materializeNarrativeClubAlias(state, alias, context) {
    const tier = aliasTier(state, alias, context.targetTier);
    const roll = aliasRoll(state, alias, context);
    const excludeClubIds = [
        state.club,
        state.professional.ownerClub,
        state.professional.registrationClub
    ];
    if (alias === "BIG_CLUB") {
        return selectBigClubDestination({
            countryCode: "ESP",
            roll,
            excludeClubIds
        }).id;
    }
    if (alias === "HIGHER_CLUB") {
        return selectHigherClubDestination({
            countryCode: "ESP",
            currentClubId: state.club,
            currentLeagueTier: state.professional.leagueTier,
            targetLeagueTier: tier,
            roll,
            excludeClubIds
        }).id;
    }
    if (alias === "FOREIGN_DEV_CLUB") {
        return selectForeignMarketDestination({
            leagueTier: tier,
            roll,
            profile: "development",
            excludeClubIds
        }).id;
    }
    return selectMarketDestination({
        countryCode: "ESP",
        leagueTier: tier,
        roll,
        profile: alias === "DEVELOPMENT_CLUB" || alias === "DEVELOPMENT_CLUB_2"
            ? "development"
            : "balanced",
        excludeClubIds
    }).id;
}
/**
 * Some canonical choices model "sign for parent club, then go on loan" with the
 * same alias in club + world.ownerClub. Once that alias becomes a concrete parent
 * identity, A3 must still preserve loan authority: registration/playing club must
 * be distinct from ownerClub. This pure projection resolves only that collision.
 */
export function materializeNarrativeLoanRegistration(state, ownerClubId, context) {
    const owner = clubById(ownerClubId);
    const countryCode = owner?.countryCode ?? "ESP";
    const tier = context.targetTier !== null && Number.isFinite(context.targetTier)
        ? Math.max(1, Math.min(9, Math.trunc(context.targetTier)))
        : Math.max(1, Math.min(9, Math.trunc(state.tier)));
    const roll = aliasRoll(state, "LOAN_REGISTRATION", context, ownerClubId);
    return selectMarketDestination({
        countryCode,
        leagueTier: tier,
        roll,
        profile: "development",
        excludeClubIds: [
            ownerClubId,
            state.club,
            state.professional.ownerClub,
            state.professional.registrationClub
        ]
    }).id;
}
