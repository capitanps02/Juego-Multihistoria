import type { GameState } from "../core/types.js";
import { type CompetitionContext, type CompetitionMoment, type CompetitionScheduleFixture, type FixtureCongestionContext } from "./competition-context.js";
import { type CareerSportMilestones, type LeagueObjectiveStatus, type MatchCompetition, type MatchResultFact, type OfficialMatchRecord, type RecentPlayerMatchStats, type SeasonPlayerStats, type ScheduledFixture, type SquadStatus } from "./match-model.js";
export type SportFactAvailability = "known" | "unavailable";
export type MatchContextStatus = "authoritative" | "no_current_match";
export type LastPlayerAppearanceStatus = "authoritative" | "historical_match_store_not_initialized";
export interface SportContextAvailability {
    currentSeason: SportFactAvailability;
    sportingClub: SportFactAvailability;
    ownerClub: SportFactAvailability;
    careerAppearances: SportFactAvailability;
    officialDebutRecorded: SportFactAvailability;
    currentCompetition: SportFactAvailability;
    currentCompetitionStage: SportFactAvailability;
    latestCompetitionMoment: SportFactAvailability;
    nextCompetitionFixture: SportFactAvailability;
    competitionSchedule14: SportFactAvailability;
    fixtureCongestion: SportFactAvailability;
    nextFixture: SportFactAvailability;
    previousFixture: SportFactAvailability;
    lastPlayerAppearance: SportFactAvailability;
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
    currentSeasonPlayerStats: SportFactAvailability;
    recentSixMatchStats: SportFactAvailability;
    priorTwoMatchStats: SportFactAvailability;
    careerMilestones: SportFactAvailability;
}
export interface SportContext {
    currentSeason: string;
    /** Registration club is the sporting authority during transfers and loans. */
    sportingClub: string | null;
    ownerClub: string | null;
    leagueTier: number | null;
    careerAppearances: number;
    /** Legacy coarse fact retained for compatibility; prefer match-model milestones for new content. */
    officialDebutRecorded: boolean;
    currentCompetition: MatchCompetition | null;
    currentCompetitionStage: CompetitionContext;
    latestCompetitionMoment: CompetitionMoment | null;
    nextCompetitionFixture: CompetitionScheduleFixture | null;
    competitionSchedule14: CompetitionScheduleFixture[];
    fixtureCongestion: FixtureCongestionContext;
    nextFixture: ScheduledFixture | null;
    previousFixture: OfficialMatchRecord | null;
    /** Latest factual official row where the player actually appeared, across clubs. */
    lastPlayerAppearance: OfficialMatchRecord | null;
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
    firstGoal: string | null;
    currentSeasonPlayerStats: SeasonPlayerStats | null;
    recentSixMatchStats: RecentPlayerMatchStats | null;
    /** Latest two complete current-club/current-season matches strictly before today. */
    priorTwoMatchStats: RecentPlayerMatchStats | null;
    /** Exact career aggregates only when the persisted appearance/stat ledger is complete. */
    careerMilestones: CareerSportMilestones | null;
    availability: SportContextAvailability;
    unavailableReason: "standing_model_not_implemented" | "historical_match_store_not_initialized" | "historical_player_stats_incomplete" | null;
}
export interface CurrentMatchContext {
    status: MatchContextStatus;
    fixtureId: string | null;
    competition: MatchCompetition | null;
    opponent: string | null;
    homeAway: "home" | "away" | null;
    dateTime: null;
    result: MatchResultFact | null;
    playerCalledUp: boolean | null;
    playerOnBench: boolean | null;
    playerStarted: boolean | null;
    playerAppeared: boolean | null;
    minutes: number | null;
    goals: number | null;
    assists: number | null;
    cards: {
        yellow: number;
        red: number;
    } | null;
    injury: boolean | null;
    decisionMinute: number | null;
    scoreAtDecision: {
        home: number;
        away: number;
    } | null;
    debutDecisionContext: boolean;
    highProfileMatch: boolean | null;
    penaltyDecisionContext: boolean;
    designatedPenaltyTakerRef: string | null;
    designatedTakerMissedEarlier: boolean;
    priorPenaltyMinute: number | null;
    penaltyDecisionMinute: number | null;
    penaltyScoreAtDecision: {
        home: number;
        away: number;
    } | null;
}
export interface LastPlayerAppearanceContext {
    status: LastPlayerAppearanceStatus;
    match: OfficialMatchRecord | null;
}
/**
 * Read-only sporting projection over the simulation-owned weekly fixture model.
 * Calendar facts are derived from the same seven-day cadence used by footballWeek;
 * match/squad facts come only from persisted rows produced by that simulation.
 * No RNG is consumed and narrative flags/roleScore are never used here to fabricate facts.
 */
export declare function getSportContext(state: GameState): SportContext;
/**
 * Latest factual on-field appearance. Historical saves without the match store
 * remain explicitly unavailable rather than being interpreted as zero games.
 */
export declare function getLastPlayerAppearanceContext(state: GameState): LastPlayerAppearanceContext;
/** Current-match projection over persisted sporting rows for today's football cycle. */
export declare function getCurrentMatchContext(state: GameState): CurrentMatchContext;
