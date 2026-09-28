import type { FootballClub, FootballDivision } from "./types.js";
export type FootballLeagueGroup = "A" | "B" | "C" | "D";
export type FootballClubBand = "elite" | "continental" | "upper" | "mid" | "lower" | "development";
export type FootballSelectorProfile = "elite" | "ambitious" | "balanced" | "development" | "lower_pressure" | "financial";
export type FootballBalanceAttribute = "prestige" | "financialPower" | "youthQuality" | "developmentBias" | "pressure" | "internationalAttraction";
export declare const FOOTBALL_CLUB_BANDS: readonly ["elite", "continental", "upper", "mid", "lower", "development"];
export declare const FOOTBALL_SELECTOR_PROFILES: readonly ["elite", "ambitious", "balanced", "development", "lower_pressure", "financial"];
export declare function footballLeagueGroupForStrength(strength: number): FootballLeagueGroup;
/**
 * Converts a league/division coefficient into a club-level structural baseline.
 * The compression leaves room for explicit club bands so deterministic flavour
 * cannot dominate the structural hierarchy.
 */
export declare function footballStructuralCoefficient(value: number): number;
/**
 * Stable competitive band assignment. It is deterministic, consumes no GameState
 * RNG and is constrained first by tier and league group.
 */
export declare function footballClubBandFor(clubId: string, tier: number, divisionStrength: number): FootballClubBand;
export declare function footballBandAttributeModifier(band: FootballClubBand, attribute: FootballBalanceAttribute): number;
export declare function footballClubSelectorProfile(club: FootballClub, division: FootballDivision): FootballSelectorProfile;
export declare function footballClubBalanceMetadata(club: FootballClub, division: FootballDivision): Readonly<{
    band: FootballClubBand;
    leagueGroup: FootballLeagueGroup;
    selectorProfile: FootballSelectorProfile;
}>;
/**
 * Data contract for DB-A3. These are selector semantics only; no market runtime,
 * offer creation or club comparison is performed in this layer.
 */
export declare const FOOTBALL_SELECTOR_PROFILE_CONTRACT: Readonly<{
    readonly BIG_CLUB: Readonly<{
        expectedBands: readonly ["elite", "continental"];
        allowedTiers: readonly [1];
        relative: false;
        topContinental: Readonly<{
            minPrestige: 88;
            minInternationalAttraction: 84;
            minDivisionStrength: 78;
        }>;
        rule: "elite OR continental meeting every topContinental threshold";
    }>;
    readonly DEVELOPMENT_CLUB: Readonly<{
        expectedBands: readonly ["development"];
        allowedTiers: readonly [1, 2, 3];
        relative: false;
        rule: "prioritize development band, youthQuality, developmentBias and moderate pressure";
    }>;
    readonly AMBITIOUS: Readonly<{
        expectedBands: readonly ["continental", "upper"];
        allowedTiers: readonly [1, 2];
        relative: false;
        minAmbitionComposite: 76;
        rule: "favor prestige + financialPower + internationalAttraction without becoming BIG_CLUB";
    }>;
    readonly BALANCED: Readonly<{
        expectedBands: readonly ["upper", "mid", "lower", "development"];
        allowedTiers: readonly [1, 2, 3];
        relative: false;
        rule: "general-purpose profile with no single extreme";
    }>;
    readonly HIGHER_CLUB: Readonly<{
        expectedBands: readonly ["elite", "continental", "upper", "mid"];
        allowedTiers: readonly [1, 2, 3];
        relative: true;
        minPrestigeDelta: 5;
        rule: "A3 must compare against the current club and require >=5 prestige points or a stronger band plus league context";
    }>;
}>;
