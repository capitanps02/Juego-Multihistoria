import type { FootballClub, FootballCountryCode } from "./types.js";
export type MarketDestinationProfile = "development" | "balanced" | "ambitious";
export interface MarketDestinationRequest {
    countryCode: FootballCountryCode;
    leagueTier: number;
    roll: number;
    profile: MarketDestinationProfile;
    excludeClubIds?: readonly string[];
}
/**
 * A2's BIG_CLUB semantic contract. A3 consumes it; it does not redefine it.
 */
export declare function isBigClubCandidate(club: FootballClub): boolean;
/**
 * Identity projection only. Opportunity existence, live tier, contract terms and
 * acceptance remain owned by the calling market authority.
 */
export declare function selectMarketDestination(request: MarketDestinationRequest): FootballClub;
export interface BigClubDestinationRequest {
    countryCode: FootballCountryCode;
    roll: number;
    excludeClubIds?: readonly string[];
}
export declare function selectBigClubDestination(request: BigClubDestinationRequest): FootballClub;
export interface HigherClubDestinationRequest {
    countryCode: FootballCountryCode;
    currentClubId: string;
    currentLeagueTier: number;
    targetLeagueTier: number;
    roll: number;
    excludeClubIds?: readonly string[];
}
/**
 * HIGHER_CLUB is relative by A2 contract: >=5 prestige improvement, or a stronger
 * competitive band backed by a stronger league/tier context.
 */
export declare function selectHigherClubDestination(request: HigherClubDestinationRequest): FootballClub;
export interface ForeignMarketDestinationRequest {
    leagueTier: number;
    roll: number;
    profile: MarketDestinationProfile;
    excludeClubIds?: readonly string[];
}
/**
 * Equal-weight the represented country contexts first, so countries with more
 * catalog clubs/divisions do not dominate merely because their arrays are larger.
 */
export declare function selectForeignMarketDestination(request: ForeignMarketDestinationRequest): FootballClub;
export interface ForeignBigClubDestinationRequest {
    roll: number;
    excludeClubIds?: readonly string[];
}
export declare function selectForeignBigClubDestination(request: ForeignBigClubDestinationRequest): FootballClub;
