import type { GameState, NarrativePhase, RelationshipState } from "../core/types.js";

export type LockerLeadershipSlot = "captain" | "star";
export type LockerRelationshipAxis = "trust" | "affinity" | "respect" | "resentment" | "leverage";

export interface LockerSlotAssignment {
  club: string;
  phases: readonly NarrativePhase[];
  slot: LockerLeadershipSlot;
  npcId: string;
  /** Human-readable provenance for review; never parsed at runtime. */
  source: string;
}

/**
 * Explicit authority registry. Never infer leadership from NPC role text,
 * protagonist relationships or generic lockerPower.
 *
 * The current canon/catalog explicitly certifies Tomás Vela as UDV captain.
 * No NPC is yet authoritatively certified as SLOT_STAR, so that slot remains
 * unresolved (null) until a canonical content owner adds an explicit row.
 */
export const LOCKER_SLOT_ASSIGNMENTS: readonly LockerSlotAssignment[] = [
  {
    club: "UDV",
    phases: ["18_20", "20_23", "23_26"],
    slot: "captain",
    npcId: "NPC_PLR_10",
    source: "NPC catalog: Tomás Vela is the UDV captain; retained only while his runtime NPC remains active at UDV."
  }
];

function assignmentFor(state: GameState, slot: LockerLeadershipSlot): LockerSlotAssignment | null {
  const matches = LOCKER_SLOT_ASSIGNMENTS.filter(row =>
    row.club === state.club && row.slot === slot && row.phases.includes(state.phase)
  );
  // Ambiguous authority is unsafe for canonical gates.
  return matches.length === 1 ? matches[0]! : null;
}

/**
 * Resolve a leadership slot against explicit authority plus live NPC state.
 * Club transfer, NPC transfer/departure or inactive career state invalidates the
 * assignment automatically. Reads are deterministic and consume no RNG.
 */
export function resolveLockerSlot(state: GameState, slot: LockerLeadershipSlot): string | null {
  const assignment = assignmentFor(state, slot);
  if (!assignment) return null;
  const npc = state.npcs.find(candidate => candidate.id === assignment.npcId);
  if (!npc || npc.club !== state.club || npc.careerState !== "active") return null;
  return npc.id;
}

export function lockerSlotRelationship(
  state: GameState,
  slot: LockerLeadershipSlot
): RelationshipState | null {
  const npcId = resolveLockerSlot(state, slot);
  if (!npcId) return null;
  return state.relationships.find(row => row.npcId === npcId) ?? null;
}

export function lockerSlotRelationshipValue(
  state: GameState,
  slot: LockerLeadershipSlot,
  axis: LockerRelationshipAxis
): number | null {
  const relationship = lockerSlotRelationship(state, slot);
  if (!relationship) return null;
  const value = relationship[axis];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export interface LockerLeadershipFacts {
  lockerCaptainNpcId: string | null;
  lockerStarNpcId: string | null;
  lockerCaptainAffinity: number | null;
  lockerStarAffinity: number | null;
  lockerCaptainTrust: number | null;
  lockerStarTrust: number | null;
}

/** Read-only facts suitable for `facts.*` narrative conditions. */
export function lockerLeadershipFacts(state: GameState): LockerLeadershipFacts {
  return {
    lockerCaptainNpcId: resolveLockerSlot(state, "captain"),
    lockerStarNpcId: resolveLockerSlot(state, "star"),
    lockerCaptainAffinity: lockerSlotRelationshipValue(state, "captain", "affinity"),
    lockerStarAffinity: lockerSlotRelationshipValue(state, "star", "affinity"),
    lockerCaptainTrust: lockerSlotRelationshipValue(state, "captain", "trust"),
    lockerStarTrust: lockerSlotRelationshipValue(state, "star", "trust")
  };
}
