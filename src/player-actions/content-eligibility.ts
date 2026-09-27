import type { PlayerActionEligibilityPredicate } from "./types.js";

export interface PlayerActionEligibilitySpec {
  actionId: string;
  all: readonly PlayerActionEligibilityPredicate[];
}

/**
 * Target V1 eligibility owned by A5.
 *
 * This is intentionally declarative and closed. A1 may implement these
 * predicates in the core engine, but content never supplies executable
 * callbacks or arbitrary state paths.
 */
export const PLAYER_ACTION_ELIGIBILITY_SPECS: readonly PlayerActionEligibilitySpec[] = [
  {
    actionId: "PA_COACH_TALK",
    all: [
      { kind: "active_career" },
      { kind: "active_club_employment" },
      { kind: "age_range", min: 18 },
      { kind: "current_coach" }
    ]
  },
  {
    actionId: "PA_ROLE_CHECK",
    all: [
      { kind: "active_career" },
      { kind: "active_club_employment" },
      { kind: "age_range", min: 18 },
      { kind: "current_coach" }
    ]
  },
  {
    actionId: "PA_POSITION_CHANGE",
    all: [
      { kind: "active_career" },
      { kind: "active_club_employment" },
      { kind: "age_range", min: 18 },
      { kind: "current_coach" }
    ]
  },
  {
    actionId: "PA_REQUEST_TRANSFER",
    all: [
      { kind: "active_career" },
      { kind: "active_club_employment" },
      { kind: "age_range", min: 18 },
      { kind: "live_transfer_request", required: false }
    ]
  },
  {
    actionId: "PA_WITHDRAW_TRANSFER",
    all: [
      { kind: "active_career" },
      { kind: "active_club_employment" },
      { kind: "age_range", min: 18 },
      { kind: "live_transfer_request", required: true }
    ]
  },
  {
    actionId: "PA_TRAIN_EXTRA",
    all: [
      { kind: "active_career" },
      { kind: "age_range", min: 18 },
      { kind: "fatigue_max", value: 55 },
      { kind: "risk_max", value: 40 }
    ]
  },
  {
    actionId: "PA_VIDEO_STUDY",
    all: [
      { kind: "active_career" },
      { kind: "age_range", min: 18 },
      { kind: "fatigue_max", value: 65 }
    ]
  },
  {
    actionId: "PA_RECOVERY_SESSION",
    all: [
      { kind: "active_career" },
      { kind: "age_range", min: 18 },
      { kind: "risk_min", value: 28 }
    ]
  },
  {
    actionId: "PA_REST",
    all: [
      { kind: "active_career" },
      { kind: "age_range", min: 18 },
      { kind: "fatigue_min", value: 24 }
    ]
  },
  {
    actionId: "PA_AGENT_MARKET",
    all: [
      { kind: "active_career" },
      { kind: "age_range", min: 18 },
      { kind: "current_representation" }
    ]
  },
  {
    actionId: "PA_REQUEST_RENEWAL",
    all: [
      { kind: "active_career" },
      { kind: "active_club_employment" },
      { kind: "age_range", min: 18 },
      { kind: "contract_months", min: 1, max: 24 }
    ]
  },
  {
    actionId: "PA_DISCUSS_FUTURE",
    all: [
      { kind: "active_career" },
      { kind: "age_range", min: 20 },
      { kind: "current_representation" }
    ]
  },
  {
    actionId: "PA_TALK_TEAMMATE",
    all: [
      { kind: "active_career" },
      { kind: "active_club_employment" },
      { kind: "age_range", min: 18 },
      { kind: "current_teammate" }
    ]
  },
  {
    actionId: "PA_CLEAR_AIR",
    all: [
      { kind: "active_career" },
      { kind: "active_club_employment" },
      { kind: "age_range", min: 18 },
      { kind: "current_teammate" },
      { kind: "visible_teammate_tension" }
    ]
  },
  {
    actionId: "PA_LEADER_ADVICE",
    all: [
      { kind: "active_career" },
      { kind: "active_club_employment" },
      { kind: "age_range", min: 18, max: 23 },
      { kind: "current_teammate" }
    ]
  },
  {
    actionId: "PA_MENTOR_TEAMMATE",
    all: [
      { kind: "active_career" },
      { kind: "active_club_employment" },
      { kind: "age_range", min: 30 },
      { kind: "current_teammate" }
    ]
  },
  {
    actionId: "PA_INTERVIEW",
    all: [
      { kind: "active_career" },
      { kind: "age_range", min: 18 }
    ]
  },
  {
    actionId: "PA_SOCIAL_POST",
    all: [
      { kind: "active_career" },
      { kind: "age_range", min: 18 }
    ]
  },
  {
    actionId: "PA_PERSONAL_TIME",
    all: [
      { kind: "active_career" },
      { kind: "age_range", min: 18 },
      { kind: "fatigue_min", value: 20 }
    ]
  },
  {
    actionId: "PA_DISCONNECT",
    all: [
      { kind: "active_career" },
      { kind: "age_range", min: 28 },
      { kind: "fatigue_min", value: 30 }
    ]
  }
] as const;
