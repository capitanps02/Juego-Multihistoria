import type { GameState } from "../core/types.js";
export type MatchHomeAway = "home" | "away";
export type MatchCompetition = "league";
export type MatchOutcome = "win" | "draw" | "loss";
export type SquadStatus = "not_called" | "bench" | "substitute" | "starter";
export type LeagueObjectiveStatus = "open" | "closed";
export interface ScheduledFixture {
    id: string;
    date: string;
    season: string;
    competition: MatchCompetition;
    club: string;
    opponent: string;
    /** Stable catalog identity for new fixtures; absent on historical v1 rows. */
    opponentClubId?: string;
    homeAway: MatchHomeAway;
    official: true;
}
export interface MatchPlayerFact {
    calledUp: boolean;
    onBench: boolean;
    started: boolean;
    appeared: boolean;
    minutes: number;
    debut: boolean;
    injuryUnavailable: boolean;
    /** Optional for backwards compatibility with historical match-model v1 rows. */
    suspensionUnavailable?: boolean;
}
export interface MatchDecisionContext {
    kind: "debut_substitution";
    minute: number;
    scoreHome: number;
    scoreAway: number;
}
export interface MatchResultFact {
    homeGoals: number;
    awayGoals: number;
    halfTimeHomeGoals: number;
    halfTimeAwayGoals: number;
    /** Outcome from the registered club's perspective. */
    outcome: MatchOutcome;
}
export interface MatchPlayerStats {
    goals: number;
    assists: number;
    yellowCards: number;
    redCards: number;
    /** 3.5-10.0 deterministic performance rating; absent on historical rows. */
    rating?: number;
}
export interface MatchPerformanceContext {
    age: number;
    careerRole: string;
    roleScore: number;
    form: number;
    fitness: number;
    fatigue: number;
    coachTrust: number | null;
    leagueTier: number;
    opponentLevel: number;
    positionIdentity: string | null;
}
export interface MatchSportEffects {
    formDelta: number;
    fatigueDelta: number;
    fitnessDelta: number;
    coachTrustDelta: number;
    roleScoreDelta: number;
}
export interface CareerSportMilestones {
    /** True only when every aggregate career appearance is represented by a persisted appeared fixture with stats. */
    historyComplete: boolean;
    appearances: number | null;
    goals: number | null;
    assists: number | null;
    yellowCards: number | null;
    redCards: number | null;
    appearance10: boolean | null;
    appearance50: boolean | null;
    appearance100: boolean | null;
    appearance500: boolean | null;
    appearance700: boolean | null;
    /** Exact ordinal only when the career ledger is complete; it does not guarantee another appearance. */
    nextAppearanceOrdinal: number | null;
}
export interface SeasonPlayerStats extends MatchPlayerStats {
    season: string;
    appearances: number;
}
export interface DetailedSeasonPlayerStats extends SeasonPlayerStats {
    starts: number;
    minutes: number;
    averageRating: number | null;
}
export interface CareerSeasonRecord extends DetailedSeasonPlayerStats {
    club: string;
    age: number | null;
    role: string | null;
    roleScore: number | null;
}
export interface CareerMatchResult {
    matchId: string;
    date: string;
    homeAway: MatchHomeAway;
    result: MatchResultFact | null;
    season: string;
    club: string;
    competition: MatchCompetition;
    opponent: string;
    available: boolean;
    selected: boolean;
    started: boolean;
    minutes: number;
    rating: number | null;
    goals: number;
    assists: number;
    cards: {
        yellow: number;
        red: number;
    };
    statDeltas: {
        appearances: number;
        starts: number;
        minutes: number;
        goals: number;
        assists: number;
    };
    sportDeltas: MatchSportEffects;
    milestones: string[];
}
export interface RecentPlayerMatchStats extends MatchPlayerStats {
    fixtureIds: string[];
    matches: number;
    appearances: number;
    starts: number;
    minutes: number;
    wins: number;
    draws: number;
    losses: number;
}
export interface OfficialMatchRecord extends ScheduledFixture {
    player: MatchPlayerFact;
    decisionContext: MatchDecisionContext | null;
    /** Optional A15 producer snapshot; historical v1 rows omit it. */
    performanceContext?: MatchPerformanceContext;
    /** Optional structured consequences for A16; historical v1 rows omit it. */
    effects?: MatchSportEffects;
    /**
     * Absent only on historical v1 rows created before the result authority existed.
     * Historical rows are never backfilled from present-day state.
     */
    result?: MatchResultFact;
    /** Absent on historical/result-only rows created before player-stat authority. */
    stats?: MatchPlayerStats;
}
export interface MatchMilestones {
    firstMatchSquadCall: string | null;
    firstBench: string | null;
    firstAppearance: string | null;
    firstStart: string | null;
    firstFullMatch: string | null;
    firstGoal: string | null;
}
export interface LeagueObjectiveRecord {
    season: string;
    club: string;
    kind: "league_campaign";
    status: LeagueObjectiveStatus;
    resolvedAt: string | null;
    outcome: string | null;
}
export interface SportMatchModelStore {
    version: 1;
    fixtures: OfficialMatchRecord[];
    milestones: MatchMilestones;
    objective: LeagueObjectiveRecord | null;
}
export interface MatchModelIssue {
    path: string;
    reason: string;
}
export interface RecordOfficialMatchInput {
    /** Appearance/debut are observed from the existing football simulation, not reconstructed from role/form. */
    appeared: boolean;
    debutOccurred: boolean;
    injuryUnavailable: boolean;
    suspensionUnavailable?: boolean;
    /** Supplied only by the continuous sports producer; direct legacy callers may omit it. */
    performanceContext?: MatchPerformanceContext;
}
/**
 * Snapshot the mutable sports inputs used by A15 before they can drift later in the career.
 * Persisting this context lets save validation reproduce player performance without consulting
 * future form/fitness/coach state.
 */
export declare function buildMatchPerformanceContext(state: GameState, coachTrust: number | null): MatchPerformanceContext | null;
/**
 * The existing simulation has one authoritative football cycle every seven runtime days.
 * This calendar materializes those same cycles as official league fixtures during Aug-May.
 * No extra RNG is consumed and no narrative state is consulted.
 */
export declare function isOfficialMatchDay(state: GameState, offsetDays?: number): boolean;
export declare function isTrainingDay(state: GameState, offsetDays?: number): boolean;
export declare function getSportMatchModelStore(state: GameState): SportMatchModelStore | null;
/**
 * Persist one factual match row for the current weekly football cycle.
 * Appearance/debut come from the existing simulator; squad role and score context are
 * deterministic fixture-level production, independent from narrative gates and role/form proxies.
 */
export declare function recordOfficialMatchInPlace(state: GameState, input: RecordOfficialMatchInput): OfficialMatchRecord | null;
export declare function closeLeagueObjectiveInPlace(state: GameState, outcome: string): void;
export declare function currentOfficialMatch(state: GameState): OfficialMatchRecord | null;
export declare function lastPlayerAppearance(state: GameState): OfficialMatchRecord | null;
/**
 * Career totals are factual only when the persisted ledger is complete.
 * Aggregate appearance counters, form, reputation and age never backfill missing rows.
 */
export declare function careerSportMilestones(state: GameState): CareerSportMilestones;
export declare function careerGoalHistoryComplete(state: GameState): boolean;
export declare function seasonPlayerStats(state: GameState, season?: string): SeasonPlayerStats | null;
/**
 * A15 detailed aggregate. The legacy seasonPlayerStats() shape stays unchanged because
 * sport-context and narrative consumers already treat that object as a stable contract.
 */
export declare function detailedSeasonPlayerStats(state: GameState, season?: string): DetailedSeasonPlayerStats | null;
export declare function careerSeasonRecords(state: GameState): CareerSeasonRecord[];
export declare function setOfficialMatchEffectsInPlace(state: GameState, matchId: string, effects: MatchSportEffects): OfficialMatchRecord | null;
export declare function currentCareerMatchResult(state: GameState): CareerMatchResult | null;
/** Presentation history survives non-match days; currentOfficialMatch keeps its simulation semantics. */
export declare function latestCareerMatchResult(state: GameState): CareerMatchResult | null;
/**
 * Aggregate the latest complete official fixtures for the current registration
 * club and season. Missing result/stats in any selected row makes the whole
 * window unknown rather than mixing factual and inferred history.
 */
export declare function recentClubPlayerMatchStats(state: GameState, count?: number): RecentPlayerMatchStats | null;
/**
 * Aggregate complete official fixtures strictly before the current state date
 * for the current registration club + season. A current-day match is excluded
 * deliberately so narrative consumers can combine a prior form window with
 * today's factual lineup/squad decision without double-counting.
 */
export declare function priorClubPlayerMatchStats(state: GameState, count?: number): RecentPlayerMatchStats | null;
export declare function previousOfficialMatch(state: GameState): OfficialMatchRecord | null;
export declare function scheduledLeagueFixtures(state: GameState, horizonDays?: number): ScheduledFixture[];
export declare function nextScheduledFixture(state: GameState): ScheduledFixture | null;
export declare function hoursToNextScheduledFixture(state: GameState): number | null;
export declare function nextScheduledTrainingDate(state: GameState): string | null;
export declare function remainingLeagueFixtures(state: GameState): number;
/** Read-only validation for the optional match-model store. */
export declare function inspectSportMatchModelStore(value: unknown, maxDate?: string, state?: GameState): MatchModelIssue | null;
