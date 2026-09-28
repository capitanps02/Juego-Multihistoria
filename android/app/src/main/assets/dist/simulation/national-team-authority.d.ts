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
export type NationalSelectionMembership = "selected" | "omitted" | "withdrawn";
export type NationalFinalRole = "starter_candidate" | "rotation" | "veteran_role";
export type NationalSelectionProvenance = {
    kind: "simulation_publication";
    producerId: string;
} | {
    kind: "canonical_event";
    eventId: string;
    choiceId: string;
    outcomeId: string;
};
export interface NationalSelectionPublication {
    date: string;
    runtimeDay: number;
    squadSize: 30 | 26;
    membership: NationalSelectionMembership;
    role: NationalFinalRole | null;
    source: NationalSelectionProvenance;
}
export interface NationalSelectionCycle {
    cycleId: string;
    tournamentId: string;
    season: string;
    openedDate: string;
    preliminary: NationalSelectionPublication | null;
    final: NationalSelectionPublication | null;
}
export interface NationalSelectionAuthorityStore {
    version: 1;
    cycles: NationalSelectionCycle[];
}
export interface NationalSelectionFacts {
    cycleId: string | null;
    tournamentId: string | null;
    preliminaryMembership: "selected" | "omitted" | null;
    preliminaryPublicationDate: string | null;
    preselected30: boolean;
    finalMembership: NationalSelectionMembership | null;
    finalPublicationDate: string | null;
    selectedFinal26: boolean;
    finalRole: NationalFinalRole | null;
}
export interface NationalSelectionStoreIssue {
    path: string;
    reason: string;
}
export interface RecordNationalPreselectionInput {
    cycleId: string;
    tournamentId: string;
    membership: "selected" | "omitted";
    source: NationalSelectionProvenance;
}
export interface RecordNationalFinalSquadInput {
    cycleId: string;
    membership: NationalSelectionMembership;
    role?: NationalFinalRole | null;
    source: NationalSelectionProvenance;
}
/**
 * Pure validator used by save validation. Missing stores are valid legacy/unknown state;
 * malformed stores fail closed and are never repaired or backfilled.
 */
export declare function inspectNationalSelectionAuthorityStore(value: unknown, currentDate?: string): NationalSelectionStoreIssue | null;
export declare function getNationalSelectionAuthorityStore(state: GameState): NationalSelectionAuthorityStore | null;
/**
 * Explicit producer boundary for a published 30-player preselection.
 * The caller must supply the factual membership and provenance; standing/caps/role
 * are never read here to manufacture membership.
 */
export declare function recordNationalPreselectionInPlace(state: GameState, input: RecordNationalPreselectionInput): NationalSelectionPublication | null;
/**
 * Explicit producer boundary for the separately published final 26-player list.
 * Final selection never follows automatically from preselection.
 */
export declare function recordNationalFinalSquadInPlace(state: GameState, input: RecordNationalFinalSquadInput): NationalSelectionPublication | null;
/** Read-only exact selection facts for narrative gates; consumes zero RNG. */
export declare function resolveNationalSelectionFacts(state: GameState): NationalSelectionFacts;
