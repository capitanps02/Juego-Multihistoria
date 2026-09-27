export type PlayerActionContentClass =
  | "CORE"
  | "CONTEXTUAL"
  | "LATE_CAREER"
  | "OPTIONAL_FLAVOR";

export type PlayerActionContentCategory =
  | "career"
  | "training"
  | "health"
  | "representative"
  | "relationships"
  | "image"
  | "life";

export type PlayerActionContentStatus = "implemented" | "blocked";

export interface PlayerActionContentPlanRow {
  id: string;
  classification: PlayerActionContentClass;
  category: PlayerActionContentCategory;
  ageRange: readonly [number, number | null];
  cooldownDays: number;
  targetKind: "none" | "coach" | "agent" | "teammate";
  status: PlayerActionContentStatus;
  requiredContext: string;
  blockedBy?: string;
}

export const PLAYER_ACTION_CONTENT_PLAN: readonly PlayerActionContentPlanRow[] = [
  {
    id: "PA_COACH_TALK",
    classification: "CORE",
    category: "career",
    ageRange: [18, null],
    cooldownDays: 31,
    targetKind: "coach",
    status: "implemented",
    requiredContext: "current coach + active club employment",
    blockedBy: "A1 active-employment contextual eligibility still generic"
  },
  {
    id: "PA_ROLE_CHECK",
    classification: "CORE",
    category: "career",
    ageRange: [18, null],
    cooldownDays: 21,
    targetKind: "coach",
    status: "blocked",
    requiredContext: "current coach",
    blockedBy: "A1 informational handler + coach eligibility"
  },
  {
    id: "PA_POSITION_CHANGE",
    classification: "CONTEXTUAL",
    category: "career",
    ageRange: [18, null],
    cooldownDays: 45,
    targetKind: "coach",
    status: "blocked",
    requiredContext: "current coach",
    blockedBy: "A1 contextual eligibility + A3 position-change intent"
  },
  {
    id: "PA_REQUEST_TRANSFER",
    classification: "CORE",
    category: "career",
    ageRange: [18, null],
    cooldownDays: 121,
    targetKind: "none",
    status: "implemented",
    requiredContext: "current club employment",
    blockedBy: "A1 active-employment contextual eligibility still generic"
  },
  {
    id: "PA_WITHDRAW_TRANSFER",
    classification: "CONTEXTUAL",
    category: "career",
    ageRange: [18, null],
    cooldownDays: 14,
    targetKind: "none",
    status: "blocked",
    requiredContext: "currently relevant transfer request",
    blockedBy: "A3 withdraw lifecycle / anti-toggle contract"
  },
  {
    id: "PA_TRAIN_EXTRA",
    classification: "CORE",
    category: "training",
    ageRange: [18, null],
    cooldownDays: 35,
    targetKind: "none",
    status: "implemented",
    requiredContext: "active career"
  },
  {
    id: "PA_VIDEO_STUDY",
    classification: "CONTEXTUAL",
    category: "training",
    ageRange: [18, null],
    cooldownDays: 14,
    targetKind: "none",
    status: "blocked",
    requiredContext: "active career",
    blockedBy: "A1 content effect registry"
  },
  {
    id: "PA_RECOVERY_SESSION",
    classification: "CORE",
    category: "health",
    ageRange: [18, null],
    cooldownDays: 14,
    targetKind: "none",
    status: "blocked",
    requiredContext: "elevated physical risk",
    blockedBy: "A1 health category + risk eligibility + recovery handler"
  },
  {
    id: "PA_REST",
    classification: "CORE",
    category: "health",
    ageRange: [18, null],
    cooldownDays: 21,
    targetKind: "none",
    status: "implemented",
    requiredContext: "active career",
    blockedBy: "runtime uses life until A1 adds health"
  },
  {
    id: "PA_AGENT_MARKET",
    classification: "CORE",
    category: "representative",
    ageRange: [18, null],
    cooldownDays: 31,
    targetKind: "agent",
    status: "implemented",
    requiredContext: "certified current representative"
  },
  {
    id: "PA_REQUEST_RENEWAL",
    classification: "CORE",
    category: "representative",
    ageRange: [18, null],
    cooldownDays: 91,
    targetKind: "none",
    status: "implemented",
    requiredContext: "current club employment + renewal window",
    blockedBy: "A1 active-employment + contract-window contextual eligibility still generic"
  },
  {
    id: "PA_DISCUSS_FUTURE",
    classification: "CONTEXTUAL",
    category: "representative",
    ageRange: [20, null],
    cooldownDays: 21,
    targetKind: "agent",
    status: "blocked",
    requiredContext: "certified current representative",
    blockedBy: "A3 career-priority fact contract"
  },
  {
    id: "PA_TALK_TEAMMATE",
    classification: "CONTEXTUAL",
    category: "relationships",
    ageRange: [18, null],
    cooldownDays: 10,
    targetKind: "teammate",
    status: "blocked",
    requiredContext: "eligible current teammate",
    blockedBy: "A1 relationship handler + shared cooldown support"
  },
  {
    id: "PA_CLEAR_AIR",
    classification: "CONTEXTUAL",
    category: "relationships",
    ageRange: [18, null],
    cooldownDays: 21,
    targetKind: "teammate",
    status: "blocked",
    requiredContext: "eligible teammate with safe visible tension context",
    blockedBy: "A1 contextual eligibility + relationship handler"
  },
  {
    id: "PA_LEADER_ADVICE",
    classification: "CONTEXTUAL",
    category: "relationships",
    ageRange: [18, 23],
    cooldownDays: 21,
    targetKind: "teammate",
    status: "blocked",
    requiredContext: "current locker-leader teammate",
    blockedBy: "A1 content target-profile support + relationship handler"
  },
  {
    id: "PA_MENTOR_TEAMMATE",
    classification: "LATE_CAREER",
    category: "relationships",
    ageRange: [30, null],
    cooldownDays: 21,
    targetKind: "teammate",
    status: "blocked",
    requiredContext: "current teammate",
    blockedBy: "A1 age eligibility + relationship handler"
  },
  {
    id: "PA_INTERVIEW",
    classification: "CORE",
    category: "image",
    ageRange: [18, null],
    cooldownDays: 28,
    targetKind: "none",
    status: "blocked",
    requiredContext: "active career",
    blockedBy: "A1 informational/image handler"
  },
  {
    id: "PA_SOCIAL_POST",
    classification: "OPTIONAL_FLAVOR",
    category: "image",
    ageRange: [18, null],
    cooldownDays: 21,
    targetKind: "none",
    status: "blocked",
    requiredContext: "active career",
    blockedBy: "A1 image effect registry"
  },
  {
    id: "PA_PERSONAL_TIME",
    classification: "CONTEXTUAL",
    category: "life",
    ageRange: [18, null],
    cooldownDays: 30,
    targetKind: "none",
    status: "blocked",
    requiredContext: "meaningful fatigue",
    blockedBy: "A1 life effect registry"
  },
  {
    id: "PA_DISCONNECT",
    classification: "LATE_CAREER",
    category: "life",
    ageRange: [28, null],
    cooldownDays: 45,
    targetKind: "none",
    status: "blocked",
    requiredContext: "late-career fatigue",
    blockedBy: "A1 age eligibility + life effect registry"
  }
] as const;
