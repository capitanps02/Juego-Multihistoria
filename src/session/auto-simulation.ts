import type { GameState } from "../core/types.js";
import { buildPeriodReport, type PeriodReport } from "./period-report.js";

export const DEFAULT_MAX_AUTO_WEEKS = 6;
export const MIN_AUTO_WEEKS = 1;
export const MAX_CONFIGURABLE_AUTO_WEEKS = 12;

export type AutoSimulationMode =
  | "idle"
  | "auto_simulating"
  | "paused"
  | "waiting_for_decision"
  | "showing_summary"
  | "season_transition"
  | "retirement";

export type SimulationInterruptType =
  | "decision"
  | "offer"
  | "important_injury"
  | "national_selection"
  | "role_change"
  | "career_change"
  | "season_complete"
  | "season_transition"
  | "retirement"
  | "max_auto_weeks";

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

function publicInterrupt(value: SimulationInterrupt | null): PublicSimulationInterrupt | null {
  return value ? { type: value.type, requiresPlayerInput: value.requiresPlayerInput } : null;
}

export function publicAutoSimulationState(flow: AutoSimulationState, state?: GameState): PublicAutoSimulationState {
  return {
    mode: flow.mode,
    maxWeeks: flow.maxWeeks,
    elapsedDays: flow.elapsedDays,
    summary: flow.summary ? {
      ...flow.summary,
      ...(state ? { report: buildPeriodReport(state, flow.summary.fromDate, flow.summary.toDate) } : {}),
      interruption: publicInterrupt(flow.summary.interruption)
    } : null,
    interruption: publicInterrupt(flow.interruption)
  };
}

const num = (value: unknown): number =>
  typeof value === "number" && Number.isFinite(value) ? value : 0;

export function idleAutoSimulationState(): AutoSimulationState {
  return {
    mode: "idle",
    maxWeeks: DEFAULT_MAX_AUTO_WEEKS,
    elapsedDays: 0,
    baseline: null,
    summary: null,
    interruption: null
  };
}

export function validateMaxAutoWeeks(value: unknown): number {
  const weeks = value === undefined ? DEFAULT_MAX_AUTO_WEEKS : Number(value);
  if (!Number.isInteger(weeks) || weeks < MIN_AUTO_WEEKS || weeks > MAX_CONFIGURABLE_AUTO_WEEKS) {
    throw new Error(`maxWeeks must be an integer between ${MIN_AUTO_WEEKS} and ${MAX_CONFIGURABLE_AUTO_WEEKS}`);
  }
  return weeks;
}

export function startAutoSimulationState(state: GameState, maxWeeks = DEFAULT_MAX_AUTO_WEEKS): AutoSimulationState {
  return {
    mode: "auto_simulating",
    maxWeeks: validateMaxAutoWeeks(maxWeeks),
    elapsedDays: 0,
    baseline: {
      date: state.date,
      runtimeDay: state.runtime.day,
      appearances: num(state.sport.appearances),
      form: num(state.sport.form),
      fatigue: num(state.body.fatigue),
      fitness: num(state.body.fitness),
      club: state.club,
      role: state.role,
      microfeedCount: state.microfeeds.length
    },
    summary: null,
    interruption: null
  };
}

export function buildPeriodSummary(
  flow: AutoSimulationState,
  state: GameState,
  interruption: SimulationInterrupt | null
): PeriodSummary {
  const baseline = flow.baseline;
  if (!baseline) throw new Error("Auto-simulation baseline is missing");
  return {
    fromDate: baseline.date,
    toDate: state.date,
    fromWeek: Math.floor(baseline.runtimeDay / 7),
    toWeek: Math.floor(state.runtime.day / 7),
    daysSimulated: flow.elapsedDays,
    weeksSimulated: Math.floor(flow.elapsedDays / 7),
    matches: {
      appearances: Math.max(0, num(state.sport.appearances) - baseline.appearances)
    },
    playerChanges: {
      form: num(state.sport.form) - baseline.form,
      fatigue: num(state.body.fatigue) - baseline.fatigue,
      fitness: num(state.body.fitness) - baseline.fitness
    },
    careerChanges: {
      clubFrom: baseline.club,
      clubTo: state.club,
      roleFrom: baseline.role,
      roleTo: state.role
    },
    worldHighlights: state.microfeeds.slice(baseline.microfeedCount).map(row => row.text),
    interruption
  };
}

export function resolvedInterruptMode(flow: AutoSimulationState): AutoSimulationMode {
  return flow.summary && flow.summary.daysSimulated > 0 ? "showing_summary" : "paused";
}
