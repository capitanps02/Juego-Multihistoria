import type { FootballCatalogIssue, FootballClub, FootballDivision } from "./types.js";
export declare const FOOTBALL_COUNTRY_CODES: readonly ["ESP", "ENG", "ITA", "DEU", "FRA", "PRT", "NLD", "BEL", "USA", "MEX", "ARG", "JPN", "CHN", "TUR", "NOR", "MAR", "ZAF"];
export declare const FOOTBALL_CONFEDERATIONS: readonly ["UEFA", "CONCACAF", "CONMEBOL", "AFC", "CAF"];
export declare const FOOTBALL_CLUB_ARCHETYPES: readonly ["continental", "development", "selling", "historic", "high_pressure", "community", "technical", "physical"];
export declare const FOOTBALL_CLEARANCE_STATUSES: readonly ["working_name_unchecked"];
export declare function inspectFootballCatalogData(clubs: readonly FootballClub[], divisions: readonly FootballDivision[]): readonly FootballCatalogIssue[];
export declare function assertFootballCatalogData(clubs: readonly FootballClub[], divisions: readonly FootballDivision[], label?: string): void;
export declare function footballCatalogStructuralFingerprint(clubs: readonly FootballClub[], divisions: readonly FootballDivision[]): string;
