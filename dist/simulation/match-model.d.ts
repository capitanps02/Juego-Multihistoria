import type { GameState } from "../core/types.js";
export type MatchHomeAway = "home" | "away";
export type MatchCompetition = "league";
export type SquadStatus = "not_called" | "bench" | "substitute" | "starter";
export type LeagueObjectiveStatus = "open" | "closed";
export interface ScheduledFixture {
    id: string;
    date: string;
    season: string;
    competition: MatchCompetition;
    club: string;
    opponent: string;
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
}
export interface MatchDecisionContext {
    kind: "debut_substitution";
    minute: number;
    scoreHome: number;
    scoreAway: number;
}
export interface OfficialMatchRecord extends ScheduledFixture {
    player: MatchPlayerFact;
    decisionContext: MatchDecisionContext | null;
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
}
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
export declare function previousOfficialMatch(state: GameState): OfficialMatchRecord | null;
export declare function nextScheduledFixture(state: GameState): ScheduledFixture | null;
export declare function hoursToNextScheduledFixture(state: GameState): number | null;
export declare function nextScheduledTrainingDate(state: GameState): string | null;
export declare function remainingLeagueFixtures(state: GameState): number;
/** Read-only validation for the optional match-model store. */
export declare function inspectSportMatchModelStore(value: unknown, maxDate?: string): MatchModelIssue | null;
