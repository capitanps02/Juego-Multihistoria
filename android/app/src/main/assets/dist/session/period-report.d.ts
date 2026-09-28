import type { GameState } from "../core/types.js";
import { type MatchHomeAway } from "../simulation/match-model.js";
export interface PeriodMatch {
    date: string;
    club: string;
    opponent: string;
    homeAway: MatchHomeAway;
    homeGoals: number | null;
    awayGoals: number | null;
    participation: string;
    minutes: number;
    rating: number | null;
}
export interface PeriodReport {
    fixtures: PeriodMatch[];
    context: string[];
}
/** Read-only projection. A historical match is never re-labelled as a new one. */
export declare function buildPeriodReport(state: GameState, fromDate: string, toDate: string): PeriodReport;
