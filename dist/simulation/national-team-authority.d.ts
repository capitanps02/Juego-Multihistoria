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
/**
 * Project the national-team facts that are actually persisted today.
 *
 * This is deliberately narrower than a fixture/squad authority. `NATIONAL_CALLED`
 * records entry into the simulated senior pool; it does not identify a current match
 * call-up. Likewise, `NATIONAL_TOURNAMENT_CYCLE` is only a cycle/window signal.
 *
 * The projection is read-only, deterministic and consumes no RNG.
 */
export declare function resolveNationalTeamAuthority(state: GameState): NationalTeamAuthorityContext;
/** Historical senior-selection evidence only; does not mean a current call-up exists. */
export declare function hasNationalTeamHistory(state: GameState): boolean;
