export type PlayerActionTargetProfile = "locker_leader";

/**
 * Public/content-safe teammate profile membership.
 *
 * Membership alone never authorizes an action: A1 must still verify the NPC is
 * active and a current teammate. These IDs come from public canonical roles
 * (captain / vice-captain), never from private agenda or hidden knowledge.
 */
export const PLAYER_ACTION_TARGET_PROFILES: Readonly<Record<PlayerActionTargetProfile, readonly string[]>> = Object.freeze({
  locker_leader: Object.freeze(["NPC_PLR_10", "NPC_PLR_11"])
});


export const PLAYER_ACTION_TARGET_PROFILE_BY_ACTION: Readonly<Record<string, PlayerActionTargetProfile>> = Object.freeze({
  PA_LEADER_ADVICE: "locker_leader"
});
