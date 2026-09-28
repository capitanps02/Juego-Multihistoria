export const FOOTBALL_CLUB_BANDS = Object.freeze([
    "elite",
    "continental",
    "upper",
    "mid",
    "lower",
    "development"
]);
export const FOOTBALL_SELECTOR_PROFILES = Object.freeze([
    "elite",
    "ambitious",
    "balanced",
    "development",
    "lower_pressure",
    "financial"
]);
const BAND_ATTRIBUTE_MODIFIERS = Object.freeze({
    elite: Object.freeze({
        prestige: 10,
        financialPower: 10,
        youthQuality: 0,
        developmentBias: -7,
        pressure: 10,
        internationalAttraction: 10
    }),
    continental: Object.freeze({
        prestige: 6,
        financialPower: 6,
        youthQuality: 1,
        developmentBias: -3,
        pressure: 6,
        internationalAttraction: 6
    }),
    upper: Object.freeze({
        prestige: 2,
        financialPower: 2,
        youthQuality: 2,
        developmentBias: 0,
        pressure: 2,
        internationalAttraction: 3
    }),
    mid: Object.freeze({
        prestige: -2,
        financialPower: 0,
        youthQuality: 1,
        developmentBias: 1,
        pressure: 0,
        internationalAttraction: 0
    }),
    lower: Object.freeze({
        prestige: -8,
        financialPower: -4,
        youthQuality: -1,
        developmentBias: 3,
        pressure: -5,
        internationalAttraction: -5
    }),
    development: Object.freeze({
        prestige: -2,
        financialPower: -1,
        youthQuality: 8,
        developmentBias: 10,
        pressure: -6,
        internationalAttraction: -1
    })
});
function hashString(value) {
    let hash = 2166136261;
    for (let i = 0; i < value.length; i += 1) {
        hash ^= value.charCodeAt(i);
        hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
}
function stableBucket(id, channel, buckets = 100) {
    return hashString(`${id}|${channel}`) % buckets;
}
export function footballLeagueGroupForStrength(strength) {
    if (strength >= 80)
        return "A";
    if (strength >= 72)
        return "B";
    if (strength >= 64)
        return "C";
    return "D";
}
/**
 * Converts a league/division coefficient into a club-level structural baseline.
 * The compression leaves room for explicit club bands so deterministic flavour
 * cannot dominate the structural hierarchy.
 */
export function footballStructuralCoefficient(value) {
    return Math.min(100, Math.max(0, Math.round(32 + (0.58 * value))));
}
/**
 * Stable competitive band assignment. It is deterministic, consumes no GameState
 * RNG and is constrained first by tier and league group.
 */
export function footballClubBandFor(clubId, tier, divisionStrength) {
    const roll = stableBucket(clubId, "competitive-band");
    const group = footballLeagueGroupForStrength(divisionStrength);
    if (tier >= 3) {
        if (roll < 28)
            return "development";
        if (roll < 78)
            return "lower";
        return "mid";
    }
    if (tier === 2) {
        if (roll < 20)
            return "development";
        if (roll < 55)
            return "lower";
        if (roll < 88)
            return "mid";
        return "upper";
    }
    if (group === "A") {
        if (roll < 12)
            return "elite";
        if (roll < 30)
            return "continental";
        if (roll < 55)
            return "upper";
        if (roll < 78)
            return "mid";
        if (roll < 90)
            return "development";
        return "lower";
    }
    if (group === "B") {
        if (roll < 4)
            return "elite";
        if (roll < 16)
            return "continental";
        if (roll < 42)
            return "upper";
        if (roll < 70)
            return "mid";
        if (roll < 86)
            return "development";
        return "lower";
    }
    if (group === "C") {
        if (roll < 8)
            return "continental";
        if (roll < 28)
            return "upper";
        if (roll < 60)
            return "mid";
        if (roll < 78)
            return "development";
        return "lower";
    }
    if (roll < 14)
        return "upper";
    if (roll < 50)
        return "mid";
    if (roll < 72)
        return "development";
    return "lower";
}
export function footballBandAttributeModifier(band, attribute) {
    return BAND_ATTRIBUTE_MODIFIERS[band][attribute];
}
export function footballClubSelectorProfile(club, division) {
    const band = footballClubBandFor(club.id, club.tier, division.strength);
    const ambition = (club.prestige + club.financialPower + club.internationalAttraction) / 3;
    if (band === "elite")
        return "elite";
    if (band === "development" ||
        (club.developmentBias >= 88 && club.youthQuality >= 84 && club.pressure <= 78)) {
        return "development";
    }
    if (club.financialPower >= 82 && club.financialPower - club.prestige >= 7)
        return "financial";
    if (club.pressure <= 58 && ambition < 78)
        return "lower_pressure";
    if (band === "continental" || (band === "upper" && ambition >= 76))
        return "ambitious";
    return "balanced";
}
export function footballClubBalanceMetadata(club, division) {
    const band = footballClubBandFor(club.id, club.tier, division.strength);
    return Object.freeze({
        band,
        leagueGroup: footballLeagueGroupForStrength(division.strength),
        selectorProfile: footballClubSelectorProfile(club, division)
    });
}
/**
 * Data contract for DB-A3. These are selector semantics only; no market runtime,
 * offer creation or club comparison is performed in this layer.
 */
export const FOOTBALL_SELECTOR_PROFILE_CONTRACT = Object.freeze({
    BIG_CLUB: Object.freeze({
        expectedBands: Object.freeze(["elite", "continental"]),
        allowedTiers: Object.freeze([1]),
        relative: false,
        topContinental: Object.freeze({
            minPrestige: 88,
            minInternationalAttraction: 84,
            minDivisionStrength: 78
        }),
        rule: "elite OR continental meeting every topContinental threshold"
    }),
    DEVELOPMENT_CLUB: Object.freeze({
        expectedBands: Object.freeze(["development"]),
        allowedTiers: Object.freeze([1, 2, 3]),
        relative: false,
        rule: "prioritize development band, youthQuality, developmentBias and moderate pressure"
    }),
    AMBITIOUS: Object.freeze({
        expectedBands: Object.freeze(["continental", "upper"]),
        allowedTiers: Object.freeze([1, 2]),
        relative: false,
        minAmbitionComposite: 76,
        rule: "favor prestige + financialPower + internationalAttraction without becoming BIG_CLUB"
    }),
    BALANCED: Object.freeze({
        expectedBands: Object.freeze(["upper", "mid", "lower", "development"]),
        allowedTiers: Object.freeze([1, 2, 3]),
        relative: false,
        rule: "general-purpose profile with no single extreme"
    }),
    HIGHER_CLUB: Object.freeze({
        expectedBands: Object.freeze(["elite", "continental", "upper", "mid"]),
        allowedTiers: Object.freeze([1, 2, 3]),
        relative: true,
        minPrestigeDelta: 5,
        rule: "A3 must compare against the current club and require >=5 prestige points or a stronger band plus league context"
    })
});
