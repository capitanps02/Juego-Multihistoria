import type { FootballCountryCode } from "./types.js";
export interface FixtureOpponentContext {
    registrationClub: string;
    leagueTier: number;
    route: "home" | "loan" | "abroad" | "domestic" | "free_agent";
    abroad: boolean;
    selectionFingerprint: number;
}
export interface FixtureOpponentSelection {
    clubId: string;
    name: string;
    divisionId: string;
    countryCode: FootballCountryCode;
}
/**
 * Resolve the league context for fixture presentation only.
 *
 * - Catalog clubs keep their exact division.
 * - UDV and synthetic domestic/development/loan clubs remain in Spain.
 * - Foreign/abroad synthetic clubs receive one stable country derived only from club identity.
 *
 * This projection consumes no GameState RNG and never mutates the catalog.
 */
export declare function resolveFixtureDivision(registrationClub: string, leagueTier: number, route: FixtureOpponentContext["route"], abroad: boolean): import("./types.js").FootballDivision | null;
/**
 * Select a concrete fictional opponent from the world catalog.
 * The caller supplies an already deterministic fixture fingerprint, so no RNG draw is consumed.
 */
export declare function selectFixtureOpponent(context: FixtureOpponentContext): FixtureOpponentSelection;
