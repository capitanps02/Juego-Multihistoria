import type { DataValue, GameState, NarrativePhase } from "../core/types.js";

export type ActiveAgentNpcId = "NPC_AGT_01" | "NPC_AGT_02";

export interface ClubInstitutionalAssignment {
  club: string;
  phases: readonly NarrativePhase[];
  npcId: string;
  evidence: string;
}

const ACTIVE_AGENT_IDS: readonly ActiveAgentNpcId[] = ["NPC_AGT_01", "NPC_AGT_02"];

/**
 * Certified institutional recipients only. The registry is deliberately sparse:
 * a club/phase without an audited persistent actor resolves to null.
 *
 * Ferrer is the canonical UDV sporting director and is therefore a valid
 * institutional recipient while he remains active at UDV in the audited early
 * career phases. Later phases/clubs must be certified independently.
 */
export const CLUB_INSTITUTIONAL_ASSIGNMENTS: readonly ClubInstitutionalAssignment[] = [
  {
    club: "UDV",
    phases: ["18_20", "20_23"],
    npcId: "NPC_DIR_02",
    evidence: "NPC_DIR_02 is the persistent UDV sporting director; T5.3 assigns him market/contract institutional knowledge for UDV only."
  }
];

function record(value: DataValue | undefined): Record<string, DataValue> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, DataValue>;
}

function isActiveAgentNpcId(value: unknown): value is ActiveAgentNpcId {
  return typeof value === "string" && (ACTIVE_AGENT_IDS as readonly string[]).includes(value);
}

/**
 * Resolve the player's explicitly certified current representative.
 *
 * Missing authority is meaningful and returns null. This function never infers
 * identity from AGENT_ACTIVE, AGENT_CONTACT_*, SEED_FIRST_AGENT, npcRefs,
 * relationship values, professional.agentControl or interaction recency.
 */
export function resolveActiveAgent(state: GameState): ActiveAgentNpcId | null {
  const authority = record(state.world.npcAuthority);
  const npcId = authority?.activeAgentNpcId;
  if (!isActiveAgentNpcId(npcId)) return null;

  const npc = state.npcs.find(candidate => candidate.id === npcId);
  if (!npc || npc.careerState !== "active") return null;
  return npcId;
}

/**
 * Persist an explicit hiring or agent-switch decision. Call this only from a
 * canonical action that actually establishes representation; never from contact,
 * consultation, trust, a seed or a generic AGENT_ACTIVE flag.
 */
export function certifyActiveAgentInPlace(state: GameState, npcId: ActiveAgentNpcId): void {
  const npc = state.npcs.find(candidate => candidate.id === npcId);
  if (!npc || npc.careerState !== "active") throw new Error(`Cannot certify inactive or missing agent: ${npcId}`);

  const current = record(state.world.npcAuthority) ?? {};
  state.world.npcAuthority = { ...current, activeAgentNpcId: npcId };
  state.flags.AGENT_ACTIVE = true;
  state.flags.NO_AGENT = false;
}

/** Persist an explicit termination of representation. */
export function clearActiveAgentInPlace(state: GameState): void {
  const current = record(state.world.npcAuthority) ?? {};
  state.world.npcAuthority = { ...current, activeAgentNpcId: null };
  state.flags.AGENT_ACTIVE = false;
}

/**
 * Resolve a named institutional recipient for the player's current club/phase.
 * Abstract institutional effects remain valid even when this returns null.
 */
export function resolveCurrentClubInstitutionalNpc(state: GameState): string | null {
  const assignment = CLUB_INSTITUTIONAL_ASSIGNMENTS.find(
    candidate => candidate.club === state.club && candidate.phases.includes(state.phase)
  );
  if (!assignment) return null;

  const npc = state.npcs.find(candidate => candidate.id === assignment.npcId);
  if (!npc || npc.careerState !== "active" || npc.club !== state.club) return null;
  return npc.id;
}
