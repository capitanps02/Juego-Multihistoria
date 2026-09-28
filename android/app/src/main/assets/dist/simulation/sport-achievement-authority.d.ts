import type { GameState } from "../core/types.js";
export type AchievementProvenance = {
    kind: "simulation_boundary";
    producerId: string;
} | {
    kind: "canonical_event";
    eventId: string;
    choiceId: string;
    outcomeId: string;
};
export type IndividualAwardResult = "won" | "not_won";
export type RecordDirection = "higher" | "lower";
export type RecordUnit = "appearances" | "goals" | "assists" | "minutes" | "age_days" | "count";
export interface IndividualAwardFact {
    awardResultId: string;
    awardId: string;
    season: string;
    subjectRef: string;
    result: IndividualAwardResult;
    date: string;
    source: AchievementProvenance;
}
export interface SportRecordDefinition {
    recordId: string;
    label: string;
    metricId: string;
    scope: "career" | "club" | "competition";
    scopeRef: string | null;
    direction: RecordDirection;
    unit: RecordUnit;
    source: AchievementProvenance;
}
export interface SportRecordProgressFact {
    progressId: string;
    recordId: string;
    subjectRef: string;
    value: number;
    date: string;
    runtimeDay: number;
    fixtureId: string | null;
    source: AchievementProvenance;
}
export interface SportRecordEventFact {
    eventId: string;
    recordId: string;
    kind: "set" | "surpassed";
    date: string;
    runtimeDay: number;
    previousHolderRef: string | null;
    newHolderRef: string;
    value: number;
    fixtureId: string | null;
    source: AchievementProvenance;
}
export interface SportAchievementStore {
    version: 1;
    awards: IndividualAwardFact[];
    records: SportRecordDefinition[];
    progress: SportRecordProgressFact[];
    recordEvents: SportRecordEventFact[];
}
export interface SportAchievementIssue {
    path: string;
    reason: string;
}
export interface AchievementHistoryFacts {
    awardResultsKnown: number;
    protagonistAwardWins: readonly {
        awardId: string;
        season: string;
        date: string;
    }[];
    latestAwardWin: {
        awardId: string;
        season: string;
        date: string;
    } | null;
    recordDefinitionsKnown: number;
    latestRecordSurpass: {
        recordId: string;
        previousHolderRef: string;
        newHolderRef: string;
        value: number;
        date: string;
    } | null;
}
export declare function inspectSportAchievementStore(value: unknown, state?: GameState): SportAchievementIssue | null;
export declare function getSportAchievementStore(state: GameState): SportAchievementStore | null;
export declare function recordIndividualAwardResultInPlace(state: GameState, input: Omit<IndividualAwardFact, "date">): IndividualAwardFact | null;
export declare function defineSportRecordInPlace(state: GameState, input: SportRecordDefinition): SportRecordDefinition | null;
export declare function recordSportRecordProgressInPlace(state: GameState, input: Omit<SportRecordProgressFact, "date" | "runtimeDay">): SportRecordProgressFact | null;
export declare function recordSportRecordEventInPlace(state: GameState, input: Omit<SportRecordEventFact, "date" | "runtimeDay">): SportRecordEventFact | null;
export declare function resolveAchievementHistoryFacts(state: GameState): AchievementHistoryFacts;
