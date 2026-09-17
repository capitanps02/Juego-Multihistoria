import type { GameState } from "../core/types.js";
export type SportFactAvailability = "known" | "unavailable";
export type MatchContextStatus = "no_authoritative_match_model";
export interface SportContextAvailability {
    currentSeason: SportFactAvailability;
    sportingClub: SportFactAvailability;
    ownerClub: SportFactAvailability;
    careerAppearances: SportFactAvailability;
    officialDebutRecorded: SportFactAvailability;
    currentCompetition: SportFactAvailability;
    nextFixture: SportFactAvailability;
    previousFixture: SportFactAvailability;
    hoursToNextFixture: SportFactAvailability;
    isMatchDay: SportFactAvailability;
    isTrainingWindow: SportFactAvailability;
    remainingOfficialMatches: SportFactAvailability;
    remainingLeagueMatches: SportFactAvailability;
    seasonObjectiveStatus: SportFactAvailability;
    currentStanding: SportFactAvailability;
    currentSquadStatus: SportFactAvailability;
    firstMatchSquadCall: SportFactAvailability;
    firstBench: SportFactAvailability;
    firstAppearance: SportFactAvailability;
    firstStart: SportFactAvailability;
    firstFullMatch: SportFactAvailability;
    firstGoal: SportFactAvailability;
}
export interface SportContext {
    currentSeason: string;
    /** Registration club is the sporting authority during transfers and loans. */
    sportingClub: string;
    ownerClub: string;
    leagueTier: number;
    careerAppearances: number;
    /** Legacy coarse fact only. It is not a current-match or squad-call context. */
    officialDebutRecorded: boolean;
    currentCompetition: null;
    nextFixture: null;
    previousFixture: null;
    hoursToNextFixture: null;
    isMatchDay: null;
    isTrainingWindow: null;
    remainingOfficialMatches: null;
    remainingLeagueMatches: null;
    seasonObjectiveStatus: null;
    currentStanding: null;
    currentSquadStatus: null;
    firstMatchSquadCall: null;
    firstBench: null;
    firstAppearance: null;
    firstStart: null;
    firstFullMatch: null;
    firstGoal: null;
    availability: SportContextAvailability;
    unavailableReason: "no_authoritative_fixture_match_or_squad_store";
}
export interface CurrentMatchContext {
    status: MatchContextStatus;
    competition: null;
    opponent: null;
    homeAway: null;
    dateTime: null;
    result: null;
    playerCalledUp: null;
    playerOnBench: null;
    playerStarted: null;
    playerAppeared: null;
    minutes: null;
    goals: null;
    assists: null;
    cards: null;
    injury: null;
}
/**
 * Read-only sporting projection.
 *
 * Important: current main has no authoritative fixture, competition, match,
 * squad-call or per-match statistics store. Those facts therefore remain null.
 * This function intentionally refuses to infer them from age, roleScore, form,
 * reputation, coach trust, seasonDay, month or narrative flags.
 */
export declare function getSportContext(state: GameState): SportContext;
/**
 * Current-match projection. Fail closed until the simulation owns an actual
 * match store; narrative code must not turn aggregate career state into a match.
 */
export declare function getCurrentMatchContext(_state: GameState): CurrentMatchContext;
