export type PlayerActionEffectMode =
  | "fact_only"
  | "direct_only"
  | "direct_and_fact"
  | "informational";

export interface PlayerActionOptionEffectPlan {
  actionId: string;
  optionId: string;
  mode: PlayerActionEffectMode;
  desiredEffectKey: string;
  desiredFactKind?: string;
  implemented: boolean;
}

/**
 * A5 effect/fact routing contract for every V1 option.
 *
 * desiredEffectKey names a closed registry handler A1 may implement.
 * desiredFactKind is present only when a persistent causal fact is actually
 * useful. Local relationship/image/life effects deliberately avoid A3 facts.
 */
export const PLAYER_ACTION_EFFECT_PLAN: readonly PlayerActionOptionEffectPlan[] = [
  { actionId: "PA_COACH_TALK", optionId: "MORE_MINUTES", mode: "fact_only", desiredEffectKey: "coach_request_more_minutes", desiredFactKind: "request_more_minutes", implemented: true },
  { actionId: "PA_COACH_TALK", optionId: "WHAT_TO_IMPROVE", mode: "fact_only", desiredEffectKey: "coach_request_feedback", desiredFactKind: "request_coach_feedback", implemented: true },
  { actionId: "PA_COACH_TALK", optionId: "COMFORTABLE_ROLE", mode: "fact_only", desiredEffectKey: "coach_acknowledge_role", desiredFactKind: "coach_role_acknowledged", implemented: true },

  { actionId: "PA_ROLE_CHECK", optionId: "ASK_ROLE", mode: "informational", desiredEffectKey: "query_role_status", implemented: false },
  { actionId: "PA_POSITION_CHANGE", optionId: "EXPLORE", mode: "fact_only", desiredEffectKey: "request_position_change", desiredFactKind: "request_position_change", implemented: true },
  { actionId: "PA_REQUEST_TRANSFER", optionId: "REQUEST", mode: "fact_only", desiredEffectKey: "request_transfer", desiredFactKind: "request_transfer", implemented: true },
  { actionId: "PA_WITHDRAW_TRANSFER", optionId: "WITHDRAW", mode: "fact_only", desiredEffectKey: "withdraw_transfer_request", desiredFactKind: "withdraw_transfer_request", implemented: true },

  { actionId: "PA_TRAIN_EXTRA", optionId: "TECHNIQUE", mode: "direct_and_fact", desiredEffectKey: "train_extra", desiredFactKind: "training_extra_completed", implemented: true },
  { actionId: "PA_TRAIN_EXTRA", optionId: "PHYSICAL", mode: "direct_and_fact", desiredEffectKey: "train_extra_physical", desiredFactKind: "training_extra_completed", implemented: false },
  { actionId: "PA_TRAIN_EXTRA", optionId: "TACTICAL", mode: "direct_and_fact", desiredEffectKey: "train_extra_tactical", desiredFactKind: "training_extra_completed", implemented: false },
  { actionId: "PA_VIDEO_STUDY", optionId: "STUDY", mode: "direct_only", desiredEffectKey: "video_study", implemented: false },

  { actionId: "PA_RECOVERY_SESSION", optionId: "RECOVER", mode: "direct_only", desiredEffectKey: "recovery_session", implemented: false },
  { actionId: "PA_REST", optionId: "RECOVER", mode: "direct_and_fact", desiredEffectKey: "rest", desiredFactKind: "rest_completed", implemented: true },

  { actionId: "PA_AGENT_MARKET", optionId: "ASK", mode: "fact_only", desiredEffectKey: "ask_agent_market", desiredFactKind: "ask_agent_market", implemented: true },
  { actionId: "PA_REQUEST_RENEWAL", optionId: "REQUEST", mode: "fact_only", desiredEffectKey: "request_renewal", desiredFactKind: "request_renewal", implemented: true },
  { actionId: "PA_DISCUSS_FUTURE", optionId: "MINUTES", mode: "fact_only", desiredEffectKey: "career_priority_minutes", desiredFactKind: "career_priority", implemented: true },
  { actionId: "PA_DISCUSS_FUTURE", optionId: "SALARY", mode: "fact_only", desiredEffectKey: "career_priority_salary", desiredFactKind: "career_priority", implemented: true },
  { actionId: "PA_DISCUSS_FUTURE", optionId: "STABILITY", mode: "fact_only", desiredEffectKey: "career_priority_stability", desiredFactKind: "career_priority", implemented: true },
  { actionId: "PA_DISCUSS_FUTURE", optionId: "CLUB_LEVEL", mode: "fact_only", desiredEffectKey: "career_priority_club_level", desiredFactKind: "career_priority", implemented: true },

  { actionId: "PA_TALK_TEAMMATE", optionId: "CONNECT", mode: "direct_only", desiredEffectKey: "teammate_connect", implemented: false },
  { actionId: "PA_CLEAR_AIR", optionId: "TALK", mode: "direct_only", desiredEffectKey: "teammate_clear_air", implemented: false },
  { actionId: "PA_LEADER_ADVICE", optionId: "ASK_ADVICE", mode: "direct_only", desiredEffectKey: "leader_advice", implemented: false },
  { actionId: "PA_MENTOR_TEAMMATE", optionId: "MENTOR", mode: "direct_only", desiredEffectKey: "mentor_teammate", implemented: false },

  { actionId: "PA_INTERVIEW", optionId: "HUMBLE", mode: "direct_only", desiredEffectKey: "interview_humble", implemented: false },
  { actionId: "PA_INTERVIEW", optionId: "AMBITIOUS", mode: "direct_only", desiredEffectKey: "interview_ambitious", implemented: false },
  { actionId: "PA_INTERVIEW", optionId: "TEAM_FIRST", mode: "direct_only", desiredEffectKey: "interview_team_first", implemented: false },
  { actionId: "PA_SOCIAL_POST", optionId: "PROFESSIONAL", mode: "informational", desiredEffectKey: "social_post_professional", implemented: false },
  { actionId: "PA_SOCIAL_POST", optionId: "PERSONAL", mode: "informational", desiredEffectKey: "social_post_personal", implemented: false },

  { actionId: "PA_PERSONAL_TIME", optionId: "PEOPLE", mode: "direct_only", desiredEffectKey: "personal_time_people", implemented: false },
  { actionId: "PA_PERSONAL_TIME", optionId: "HOBBY", mode: "direct_only", desiredEffectKey: "personal_time_hobby", implemented: false },
  { actionId: "PA_DISCONNECT", optionId: "DISCONNECT", mode: "direct_only", desiredEffectKey: "disconnect", implemented: false }
] as const;
