import type { GameState } from "../core/types.js";
import type { OfficialMatchRecord } from "./match-model.js";
export type InjuryEpisodeSeverity = "standard" | "long";
export interface InjuryEpisode {
    episodeId: string;
    startDate: string;
    startRuntimeDay: number;
    season: string;
    registrationClub: string;
    severity: InjuryEpisodeSeverity;
    plannedRecoveryWeeks: number;
    clearanceDate: string | null;
    clearanceRuntimeDay: number | null;
    firstReturnFixtureId: string | null;
    firstReturnDate: string | null;
    firstReturnMinutes: number | null;
    source: "world_injury_transition";
}
export interface InjuryEpisodeStore {
    version: 1;
    episodes: InjuryEpisode[];
}
export interface InjuryEpisodeIssue {
    path: string;
    reason: string;
}
export interface InjuryEpisodeFacts {
    episodeCount: number;
    latestEpisodeId: string | null;
    latestSeverity: InjuryEpisodeSeverity | null;
    latestStartDate: string | null;
    latestClearanceDate: string | null;
    latestReturnFixtureId: string | null;
    latestReturnDate: string | null;
    latestReturnMinutes: number | null;
    latestLongEpisodeId: string | null;
    latestLongCleared: boolean;
    latestLongReturnFixtureId: string | null;
}
export declare function inspectInjuryEpisodeStore(value: unknown, state?: GameState): InjuryEpisodeIssue | null;
export declare function getInjuryEpisodeStore(state: GameState): InjuryEpisodeStore | null;
export declare function recordInjuryEpisodeStartInPlace(state: GameState, plannedRecoveryWeeks: number, severity: InjuryEpisodeSeverity): InjuryEpisode | null;
export declare function recordInjuryClearanceInPlace(state: GameState): InjuryEpisode | null;
export declare function linkFirstPostReturnAppearanceInPlace(state: GameState, match: OfficialMatchRecord): InjuryEpisode | null;
export declare function resolveInjuryEpisodeFacts(state: GameState): InjuryEpisodeFacts;
