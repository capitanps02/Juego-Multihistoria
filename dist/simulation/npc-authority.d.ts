import type { GameState, NarrativePhase } from "../core/types.js";
export type ActiveAgentNpcId = "NPC_AGT_01" | "NPC_AGT_02";
export interface ClubInstitutionalAssignment {
    club: string;
    phases: readonly NarrativePhase[];
    npcId: string;
    evidence: string;
}
/**
 * Certified institutional recipients only. The registry is deliberately sparse:
 * a club/phase without an audited persistent actor resolves to null.
 *
 * Ferrer is the canonical UDV sporting director and is therefore a valid
 * institutional recipient while he remains active at UDV in the audited early
 * career phases. Later phases/clubs must be certified independently.
 */
export declare const CLUB_INSTITUTIONAL_ASSIGNMENTS: readonly ClubInstitutionalAssignment[];
/**
 * Resolve the player's explicitly certified current representative.
 *
 * Missing authority is meaningful and returns null. This function never infers
 * identity from AGENT_ACTIVE, AGENT_CONTACT_*, SEED_FIRST_AGENT, npcRefs,
 * relationship values, professional.agentControl or interaction recency.
 */
export declare function resolveActiveAgent(state: GameState): ActiveAgentNpcId | null;
/**
 * Persist an explicit hiring or agent-switch decision. Call this only from a
 * canonical action that actually establishes representation; never from contact,
 * consultation, trust, a seed or a generic AGENT_ACTIVE flag.
 */
export declare function certifyActiveAgentInPlace(state: GameState, npcId: ActiveAgentNpcId): void;
/** Persist an explicit termination of representation. */
export declare function clearActiveAgentInPlace(state: GameState): void;
/**
 * Resolve a named institutional recipient for the player's current club/phase.
 * Abstract institutional effects remain valid even when this returns null.
 */
export declare function resolveCurrentClubInstitutionalNpc(state: GameState): string | null;
