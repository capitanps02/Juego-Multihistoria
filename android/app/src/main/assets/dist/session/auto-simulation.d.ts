import type { GameState } from "../core/types.js";
import { type PeriodReport } from "./period-report.js";
export declare const DEFAULT_MAX_AUTO_WEEKS = 6;
export declare const MIN_AUTO_WEEKS = 1;
export declare const MAX_CONFIGURABLE_AUTO_WEEKS = 12;
export type AutoSimulationMode = "idle" | "auto_simulating" | "paused" | "waiting_for_decision" | "showing_summary" | "season_transition" | "retirement";
export type SimulationInterruptType = "decision" | "offer" | "important_injury" | "national_selection" | "role_change" | "career_change" | "season_complete" | "season_transition" | "retirement" | "max_auto_weeks";
export interface SimulationInterrupt {
    type: SimulationInterruptType;
    priority: number;
    source: string;
    requiresPlayerInput: boolean;
    payload?: Record<string, string | number | boolean | null>;
}
export interface WeekSimulationResult {
    fromDate: string;
    toDate: string;
    daysAdvanced: number;
    seasonChanged: boolean;
    ageChanged: boolean;
    importantInjuryStarted: boolean;
    nationalSelectionChanged: boolean;
    roleChanged: boolean;
    clubChanged: boolean;
    seasonCompleted: boolean;
    retirementChanged: boolean;
}
export interface PeriodSummary {
    fromDate: string;
    toDate: string;
    fromWeek: number;
    toWeek: number;
    daysSimulated: number;
    weeksSimulated: number;
    matches: {
        appearances: number;
    };
    playerChanges: {
        form: number;
        fatigue: number;
        fitness: number;
    };
    careerChanges: {
        clubFrom: string;
        clubTo: string;
        roleFrom: string;
        roleTo: string;
    };
    worldHighlights: string[];
    interruption: SimulationInterrupt | null;
}
export interface AutoSimulationBaseline {
    date: string;
    runtimeDay: number;
    appearances: number;
    form: number;
    fatigue: number;
    fitness: number;
    club: string;
    role: string;
    microfeedCount: number;
}
export interface AutoSimulationState {
    mode: AutoSimulationMode;
    maxWeeks: number;
    elapsedDays: number;
    baseline: AutoSimulationBaseline | null;
    summary: PeriodSummary | null;
    interruption: SimulationInterrupt | null;
}
/**
 * Player-facing simulation contract. Internal producer provenance (source/payload)
 * and the private comparison baseline never cross the presentation boundary.
 */
export interface PublicSimulationInterrupt {
    type: SimulationInterruptType;
    requiresPlayerInput: boolean;
}
export interface PublicPeriodSummary extends Omit<PeriodSummary, "interruption"> {
    report?: PeriodReport;
    interruption: PublicSimulationInterrupt | null;
}
export interface PublicAutoSimulationState {
    mode: AutoSimulationMode;
    maxWeeks: number;
    elapsedDays: number;
    summary: PublicPeriodSummary | null;
    interruption: PublicSimulationInterrupt | null;
}
export declare function publicAutoSimulationState(flow: AutoSimulationState, state?: GameState): PublicAutoSimulationState;
export declare function idleAutoSimulationState(): AutoSimulationState;
export declare function validateMaxAutoWeeks(value: unknown): number;
export declare function startAutoSimulationState(state: GameState, maxWeeks?: number): AutoSimulationState;
export declare function buildPeriodSummary(flow: AutoSimulationState, state: GameState, interruption: SimulationInterrupt | null): PeriodSummary;
export declare function resolvedInterruptMode(flow: AutoSimulationState): AutoSimulationMode;
