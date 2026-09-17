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
