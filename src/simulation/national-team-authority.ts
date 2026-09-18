import type { GameState } from "../core/types.js";

export type NationalTeamCareerRole = "none" | "fringe" | "rotation" | "regular";

export interface NationalTeamAuthorityContext {
  /** Historical fact: the player has entered the senior national-team pool at least once. */
  everCalled: boolean;
  /** Current simulator pool eligibility, not a concrete fixture call-up. */
  simulationPoolActive: boolean;
  /** Explicit international-retirement state. Distinct from club/career retirement. */
  retired: boolean;
  /** Aggregate senior caps produced by the simulator. */
  caps: number;
  /** Aggregate simulator role; never evidence of a specific match selection. */
  role: NationalTeamCareerRole;
  /** Aggregate standing; never evidence of a concrete call-up on its own. */
  standing: number;
  /** Current aggregate call-up gate only; not a concrete squad list. */
  gateOpen: boolean;
  /** Tournament-cycle/window context only; not preselection or final squad membership. */
  tournamentCycleWindow: boolean;
  /** The current runtime has no authoritative concrete call-up row. */
  concreteCallupKnown: false;
  /** The current runtime has no authoritative tournament squad/preselection row. */
  tournamentSquadKnown: false;
}

const ROLES: readonly NationalTeamCareerRole[] = ["none", "fringe", "rotation", "regular"];

function safeNumber(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function safeRole(value: unknown): NationalTeamCareerRole {
  return typeof value === "string" && (ROLES as readonly string[]).includes(value)
    ? value as NationalTeamCareerRole
    : "none";
}

/**
 * Project the national-team facts that are actually persisted today.
 *
 * This is deliberately narrower than a fixture/squad authority. `NATIONAL_CALLED`
 * records entry into the simulated senior pool; it does not identify a current match
 * call-up. Likewise, `NATIONAL_TOURNAMENT_CYCLE` is only a cycle/window signal.
 *
 * The projection is read-only, deterministic and consumes no RNG.
 */
export function resolveNationalTeamAuthority(state: GameState): NationalTeamAuthorityContext {
  const caps = Math.max(0, Math.trunc(safeNumber(state.professional.nationalCaps)));
  const standing = Math.max(0, Math.min(100, safeNumber(state.professional.nationalStanding)));
  const role = safeRole(state.professional.nationalRole);
  const retired = state.flags.NATIONAL_RETIRED === true;
  const enteredPool = state.flags.NATIONAL_CALLED === true;

  return {
    everCalled: enteredPool || caps > 0,
    simulationPoolActive: !retired && enteredPool,
    retired,
    caps,
    role,
    standing,
    gateOpen: !retired && state.flags.NATIONAL_GATE_OPEN === true,
    tournamentCycleWindow: !retired && state.flags.NATIONAL_TOURNAMENT_CYCLE === true,
    concreteCallupKnown: false,
    tournamentSquadKnown: false
  };
}

/** Historical senior-selection evidence only; does not mean a current call-up exists. */
export function hasNationalTeamHistory(state: GameState): boolean {
  return resolveNationalTeamAuthority(state).everCalled;
}


export interface ConcreteNationalTeamCallup {
  schemaVersion: 1;
  callupId: string;
  date: string;
  runtimeDay: number;
  tournamentCycle: boolean;
  status: "called";
}

/**
 * Persist a concrete senior call-up only at the transition where the simulator
 * actually opens a national gate for a non-retired player. This is not inferred
 * by readers from caps, standing, reputation or tournament windows.
 */
export function recordConcreteNationalTeamCallupInPlace(state: GameState): ConcreteNationalTeamCallup | null {
  if (state.flags.NATIONAL_RETIRED === true || state.flags.NATIONAL_GATE_OPEN !== true) return null;
  const world = state.world as Record<string, unknown>;
  const rows = Array.isArray(world.nationalTeamCallups)
    ? world.nationalTeamCallups as ConcreteNationalTeamCallup[]
    : [];
  const callupId = `NT_CALLUP:${state.runtime.day}:${state.date}`;
  const existing = rows.find(row => row.callupId === callupId);
  if (existing) return existing;
  const row: ConcreteNationalTeamCallup = {
    schemaVersion: 1,
    callupId,
    date: state.date,
    runtimeDay: state.runtime.day,
    tournamentCycle: state.flags.NATIONAL_TOURNAMENT_CYCLE === true,
    status: "called"
  };
  world.nationalTeamCallups = [...rows, row];
  return row;
}

export function latestConcreteNationalTeamCallup(state: GameState): ConcreteNationalTeamCallup | null {
  const rows = (state.world as Record<string, unknown>).nationalTeamCallups;
  if (!Array.isArray(rows)) return null;
  const valid = rows.filter((row): row is ConcreteNationalTeamCallup =>
    !!row && typeof row === "object" &&
    (row as ConcreteNationalTeamCallup).schemaVersion === 1 &&
    (row as ConcreteNationalTeamCallup).status === "called" &&
    typeof (row as ConcreteNationalTeamCallup).callupId === "string" &&
    typeof (row as ConcreteNationalTeamCallup).date === "string" &&
    Number.isInteger((row as ConcreteNationalTeamCallup).runtimeDay)
  );
  return valid.length ? valid[valid.length - 1]! : null;
}


export interface NationalTournamentSelection {
  schemaVersion: 1;
  selectionId: string;
  date: string;
  runtimeDay: number;
  phase: "preselection" | "final_squad";
  squadSize: 30 | 26;
}

/**
 * Explicit tournament selection writer. Callers must provide the actual phase;
 * a tournament-cycle flag alone can never create squad membership.
 */
export function recordNationalTournamentSelectionInPlace(
  state: GameState,
  phase: "preselection" | "final_squad"
): NationalTournamentSelection | null {
  if (state.flags.NATIONAL_RETIRED === true || state.flags.NATIONAL_TOURNAMENT_CYCLE !== true) return null;
  const callup = latestConcreteNationalTeamCallup(state);
  if (!callup) return null;
  const world = state.world as Record<string, unknown>;
  const rows = Array.isArray(world.nationalTournamentSelections)
    ? world.nationalTournamentSelections as NationalTournamentSelection[]
    : [];
  const squadSize = phase === "preselection" ? 30 : 26;
  const selectionId = `NT_SELECTION:${phase}:${state.runtime.day}:${state.date}`;
  const existing = rows.find(row => row.selectionId === selectionId);
  if (existing) return existing;
  if (phase === "final_squad" && !rows.some(row => row.phase === "preselection")) return null;
  const row: NationalTournamentSelection = {
    schemaVersion: 1, selectionId, date: state.date, runtimeDay: state.runtime.day, phase, squadSize
  };
  world.nationalTournamentSelections = [...rows, row];
  return row;
}

export function latestNationalTournamentSelection(state: GameState): NationalTournamentSelection | null {
  const rows = (state.world as Record<string, unknown>).nationalTournamentSelections;
  if (!Array.isArray(rows)) return null;
  const valid = rows.filter((row): row is NationalTournamentSelection =>
    !!row && typeof row === "object" &&
    (row as NationalTournamentSelection).schemaVersion === 1 &&
    ((row as NationalTournamentSelection).phase === "preselection" || (row as NationalTournamentSelection).phase === "final_squad") &&
    (((row as NationalTournamentSelection).phase === "preselection" && (row as NationalTournamentSelection).squadSize === 30) ||
     ((row as NationalTournamentSelection).phase === "final_squad" && (row as NationalTournamentSelection).squadSize === 26))
  );
  return valid.length ? valid[valid.length - 1]! : null;
}
