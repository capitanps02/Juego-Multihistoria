import type { GameState, NarrativePhase } from "../core/types.js";
export declare const AGE_MILESTONES: readonly [20, 23, 26, 30, 34];
export type AgeMilestoneAge = typeof AGE_MILESTONES[number];
export interface AgeMilestone {
    age: AgeMilestoneAge;
    date: string;
    season: string;
    phase: NarrativePhase;
    club: string;
    tier: number;
    role: number;
    marketHeat: number;
    contractMonths: number;
    salaryMonthly: number;
    leagueTier: number;
    clubPrestigeTier: number;
    roleScore: number;
    route: string;
    tags: string[];
    signature: string;
}
export declare function recordAgeMilestone(state: GameState, age: AgeMilestoneAge, tags: string[], signature: string): void;
export declare function assertAgeMilestones(state: GameState): void;
