import type { GameState } from "../core/types.js";
import { type LeagueObjectiveStatus, type MatchCompetition, type OfficialMatchRecord, type ScheduledFixture, type SquadStatus } from "./match-model.js";
export type SportFactAvailability = "known" | "unavailable";
export type MatchContextStatus = "authoritative" | "no_current_match";
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
    nextTrainingDate: SportFactAvailability;
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
    /** Legacy coarse fact retained for compatibility; prefer match-model milestones for new content. */
    officialDebutRecorded: boolean;
    currentCompetition: MatchCompetition | null;
    nextFixture: ScheduledFixture | null;
    previousFixture: OfficialMatchRecord | null;
    hoursToNextFixture: number | null;
    isMatchDay: boolean;
    isTrainingWindow: boolean;
    nextTrainingDate: string | null;
    remainingOfficialMatches: number;
    remainingLeagueMatches: number;
    seasonObjectiveStatus: LeagueObjectiveStatus | null;
    currentStanding: null;
    currentSquadStatus: SquadStatus | null;
    firstMatchSquadCall: string | null;
    firstBench: string | null;
    firstAppearance: string | null;
    firstStart: string | null;
    firstFullMatch: string | null;
    firstGoal: null;
    availability: SportContextAvailability;
    unavailableReason: "standing_and_goal_model_not_implemented" | "historical_match_store_not_initialized" | null;
}
export interface CurrentMatchContext {
    status: MatchContextStatus;
    fixtureId: string | null;
    competition: MatchCompetition | null;
    opponent: string | null;
    homeAway: "home" | "away" | null;
    dateTime: null;
    result: null;
    playerCalledUp: boolean | null;
    playerOnBench: boolean | null;
    playerStarted: boolean | null;
    playerAppeared: boolean | null;
    minutes: number | null;
    goals: null;
    assists: null;
    cards: null;
    injury: boolean | null;
    decisionMinute: number | null;
    scoreAtDecision: {
        home: number;
        away: number;
    } | null;
    debutDecisionContext: boolean;
}
/**
 * Read-only sporting projection over the simulation-owned weekly fixture model.
 * Calendar facts are derived from the same seven-day cadence used by footballWeek;
 * match/squad facts come only from persisted rows produced by that simulation.
 * No RNG is consumed and narrative flags/roleScore are never used here to fabricate facts.
 */
export declare function getSportContext(state: GameState): SportContext;
/** Current-match projection over the persisted match row for today's football cycle. */
export declare function getCurrentMatchContext(state: GameState): CurrentMatchContext;
