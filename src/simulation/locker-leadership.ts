import type { GameState, NarrativePhase, RelationshipState } from "../core/types.js";

export type LockerLeadershipSlot = "captain" | "star";
export type LockerRelationshipAxis = "trust" | "affinity" | "respect" | "resentment" | "leverage";

export interface LockerLeadershipAssignment {
  club: string;
  phases: readonly NarrativePhase[];
  captain: string | null;
  star: string | null;
  evidence: string;
}

/**
 * Explicit, audited leadership assignments only. This is deliberately sparse:
 * unknown clubs/phases and uncertified slots resolve to null rather than being
 * inferred from visible role text, relationship scores or protagonist state.
 */
export const LOCKER_LEADERSHIP_ASSIGNMENTS: readonly LockerLeadershipAssignment[] = [
  {
    club: "UDV",
    phases: ["23_26"],
    captain: "NPC_PLR_10",
    star: null,
    evidence: "NPC_PLR_10 is explicitly defined as UDV captain; no authoritative SLOT_STAR assignment is certified for 23_26."
  }
];

function assignmentFor(state: GameState): LockerLeadershipAssignment | null {
  return LOCKER_LEADERSHIP_ASSIGNMENTS.find(
    assignment => assignment.club === state.club && assignment.phases.includes(state.phase)
  ) ?? null;
}

/**
 * Resolve an authoritative leadership slot for the player's current club/phase.
 *
 * The declared NPC must still exist, be active and belong to the current club.
 * This prevents stale UDV leadership from leaking after a club change or NPC move.
 */
export function resolveLockerSlot(state: GameState, slot: LockerLeadershipSlot): string | null {
  const assignment = assignmentFor(state);
  const npcId = assignment?.[slot] ?? null;
  if (!npcId) return null;

  const npc = state.npcs.find(candidate => candidate.id === npcId);
  if (!npc || npc.careerState !== "active" || npc.club !== state.club) return null;
  return npc.id;
}

/** Read a relationship axis against the currently resolved slot, fail-closed. */
export function lockerSlotRelationship(
  state: GameState,
  slot: LockerLeadershipSlot,
  axis: LockerRelationshipAxis
): number | null {
  const npcId = resolveLockerSlot(state, slot);
  if (!npcId) return null;
  const relationship = state.relationships.find(candidate => candidate.npcId === npcId);
  if (!relationship) return null;
  const value = relationship[axis as keyof RelationshipState];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function lockerSlotAffinity(state: GameState, slot: LockerLeadershipSlot): number | null {
  return lockerSlotRelationship(state, slot, "affinity");
}
