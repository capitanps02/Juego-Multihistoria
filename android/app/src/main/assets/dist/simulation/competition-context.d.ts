import type { GameState } from "../core/types.js";
import { type MatchOutcome } from "./match-model.js";
export type SpecialCompetition = "domestic_cup" | "continental";
export type CompetitionStage = "league" | "final";
export type CompetitionOutcome = "win" | "loss";
export interface CompetitionMoment {
    id: string;
    season: string;
    date: string;
    runtimeDay: number;
    expiresRuntimeDay: number;
    club: string;
    competition: SpecialCompetition;
    stage: "final";
    outcome: CompetitionOutcome;
    highProfile: true;
}
export interface CompetitionMomentStore {
    version: 1;
    moments: CompetitionMoment[];
}
export interface CompetitionContext {
    status: "authoritative" | "no_current_competition";
    competition: "league" | SpecialCompetition | null;
    stage: CompetitionStage | null;
    date: string | null;
    club: string | null;
    outcome: MatchOutcome | null;
    highProfile: boolean;
    source: "official_match" | "competition_moment" | null;
}
export interface CompetitionScheduleFixture {
    id: string;
    date: string;
    season: string;
    competition: "league" | SpecialCompetition;
    stage: CompetitionStage;
    club: string;
    opponent: string | null;
    homeAway: "home" | "away" | null;
    official: true;
    highProfile: boolean;
    source: "league_schedule" | "competition_moment";
}
export interface FixtureCongestionContext {
    status: "authoritative" | "unavailable";
    nextFixture: CompetitionScheduleFixture | null;
    matchesNext7: number;
    matchesNext14: number;
    competitionMixNext14: Array<"league" | SpecialCompetition>;
    multipleCompetitionsNext14: boolean;
    hoursToNextFixture: number | null;
    hoursSincePreviousFixture: number | null;
    minimumRestHoursNext14: number | null;
    /** Count is factual from scheduled fixture home/away rows; no distance is inferred. */
    awayMatchesNext14: number;
    /** Geographic travel load remains unavailable until venue/location authority exists. */
    travelLoadKnown: boolean;
    travelLoadReason: "no_authoritative_locations" | null;
}
export interface CompetitionMomentIssue {
    path: string;
    reason: string;
}
export declare function getCompetitionMomentStore(state: GameState): CompetitionMomentStore | null;
/**
 * Materialize a final only when the core simulator has already produced its
 * competition + outcome + lifetime. This function consumes zero RNG and never
 * derives a final from month, reputation, roleScore or a narrative gate.
 */
export declare function recordCoreFinalCompetitionMomentInPlace(state: GameState): CompetitionMoment | null;
export declare function latestCompetitionMoment(state: GameState): CompetitionMoment | null;
export declare function activeCompetitionMoment(state: GameState): CompetitionMoment | null;
export declare function getCurrentCompetitionContext(state: GameState): CompetitionContext;
export declare function inspectCompetitionMomentStore(value: unknown, state: GameState): CompetitionMomentIssue | null;
export declare function competitionMomentFixtureDate(moment: CompetitionMoment): string;
export declare function getCompetitionSchedule(state: GameState, horizonDays?: number): CompetitionScheduleFixture[];
export declare function getFixtureCongestionContext(state: GameState): FixtureCongestionContext;
