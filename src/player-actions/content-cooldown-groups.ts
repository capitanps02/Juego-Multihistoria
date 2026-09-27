export interface PlayerActionCooldownGroupSpec {
  actionId: string;
  groupId: string | null;
  groupDays: number;
}

/**
 * Optional family-level cooldown policy for the final V1.
 *
 * Existing action/action_target cooldowns remain authoritative until A1 adds
 * closed group cooldown support. These group rows only prevent family cycling;
 * they never replace the per-action cooldown stored in content-plan.ts.
 */
export const PLAYER_ACTION_COOLDOWN_GROUP_SPECS: readonly PlayerActionCooldownGroupSpec[] = [
  { actionId: "PA_COACH_TALK", groupId: "coach_conversation", groupDays: 7 },
  { actionId: "PA_ROLE_CHECK", groupId: "coach_conversation", groupDays: 7 },
  { actionId: "PA_POSITION_CHANGE", groupId: "coach_conversation", groupDays: 7 },
  { actionId: "PA_REQUEST_TRANSFER", groupId: "club_intent", groupDays: 14 },
  { actionId: "PA_WITHDRAW_TRANSFER", groupId: "club_intent", groupDays: 14 },

  { actionId: "PA_TRAIN_EXTRA", groupId: "extra_development", groupDays: 7 },
  { actionId: "PA_VIDEO_STUDY", groupId: "extra_development", groupDays: 7 },

  { actionId: "PA_RECOVERY_SESSION", groupId: "physical_recovery", groupDays: 7 },
  { actionId: "PA_REST", groupId: "physical_recovery", groupDays: 7 },

  { actionId: "PA_AGENT_MARKET", groupId: "agent_conversation", groupDays: 7 },
  { actionId: "PA_REQUEST_RENEWAL", groupId: "agent_conversation", groupDays: 7 },
  { actionId: "PA_DISCUSS_FUTURE", groupId: "agent_conversation", groupDays: 7 },

  { actionId: "PA_TALK_TEAMMATE", groupId: "teammate_interaction", groupDays: 7 },
  { actionId: "PA_CLEAR_AIR", groupId: "teammate_interaction", groupDays: 7 },
  { actionId: "PA_LEADER_ADVICE", groupId: "teammate_interaction", groupDays: 7 },
  { actionId: "PA_MENTOR_TEAMMATE", groupId: "teammate_interaction", groupDays: 7 },

  { actionId: "PA_INTERVIEW", groupId: "public_image", groupDays: 7 },
  { actionId: "PA_SOCIAL_POST", groupId: "public_image", groupDays: 7 },

  { actionId: "PA_PERSONAL_TIME", groupId: "personal_wellbeing", groupDays: 14 },
  { actionId: "PA_DISCONNECT", groupId: "personal_wellbeing", groupDays: 14 }
] as const;
