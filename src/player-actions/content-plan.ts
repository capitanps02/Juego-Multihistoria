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
    requiredContext: "current coach + active club employment"
  },
  {
    id: "PA_ROLE_CHECK",
    classification: "CORE",
    category: "career",
    ageRange: [18, null],
    cooldownDays: 21,
    targetKind: "coach",
    status: "implemented",
    requiredContext: "current coach"
  },
  {
    id: "PA_POSITION_CHANGE",
    classification: "CONTEXTUAL",
    category: "career",
    ageRange: [18, null],
    cooldownDays: 45,
    targetKind: "coach",
    status: "implemented",
    requiredContext: "current coach",
  },
  {
    id: "PA_REQUEST_TRANSFER",
    classification: "CORE",
    category: "career",
    ageRange: [18, null],
    cooldownDays: 121,
    targetKind: "none",
    status: "implemented",
    requiredContext: "current club employment"
  },
  {
    id: "PA_WITHDRAW_TRANSFER",
    classification: "CONTEXTUAL",
    category: "career",
    ageRange: [18, null],
    cooldownDays: 14,
    targetKind: "none",
    status: "implemented",
    requiredContext: "currently relevant transfer request",
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
    status: "implemented",
    requiredContext: "active career"
  },
  {
    id: "PA_RECOVERY_SESSION",
    classification: "CORE",
    category: "health",
    ageRange: [18, null],
    cooldownDays: 14,
    targetKind: "none",
    status: "implemented",
    requiredContext: "elevated physical risk"
  },
  {
    id: "PA_REST",
    classification: "CORE",
    category: "health",
    ageRange: [18, null],
    cooldownDays: 21,
    targetKind: "none",
    status: "implemented",
    requiredContext: "fatigue >= 24"
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
    requiredContext: "current club employment + contract 1..24 months"
  },
  {
    id: "PA_DISCUSS_FUTURE",
    classification: "CONTEXTUAL",
    category: "representative",
    ageRange: [20, null],
    cooldownDays: 21,
    targetKind: "agent",
    status: "implemented",
    requiredContext: "certified current representative",
  },
  {
    id: "PA_TALK_TEAMMATE",
    classification: "CONTEXTUAL",
    category: "relationships",
    ageRange: [18, null],
    cooldownDays: 10,
    targetKind: "teammate",
    status: "implemented",
    requiredContext: "eligible current teammate"
  },
  {
    id: "PA_CLEAR_AIR",
    classification: "CONTEXTUAL",
    category: "relationships",
    ageRange: [18, null],
    cooldownDays: 21,
    targetKind: "teammate",
    status: "implemented",
    requiredContext: "current teammate"
  },
  {
    id: "PA_LEADER_ADVICE",
    classification: "CONTEXTUAL",
    category: "relationships",
    ageRange: [18, 23],
    cooldownDays: 21,
    targetKind: "teammate",
    status: "implemented",
    requiredContext: "current teammate"
  },
  {
    id: "PA_MENTOR_TEAMMATE",
    classification: "LATE_CAREER",
    category: "relationships",
    ageRange: [30, null],
    cooldownDays: 21,
    targetKind: "teammate",
    status: "implemented",
    requiredContext: "current teammate"
  },
  {
    id: "PA_INTERVIEW",
    classification: "CORE",
    category: "image",
    ageRange: [18, null],
    cooldownDays: 28,
    targetKind: "none",
    status: "implemented",
    requiredContext: "active career"
  },
  {
    id: "PA_SOCIAL_POST",
    classification: "OPTIONAL_FLAVOR",
    category: "image",
    ageRange: [18, null],
    cooldownDays: 21,
    targetKind: "none",
    status: "implemented",
    requiredContext: "active career"
  },
  {
    id: "PA_PERSONAL_TIME",
    classification: "CONTEXTUAL",
    category: "life",
    ageRange: [18, null],
    cooldownDays: 30,
    targetKind: "none",
    status: "implemented",
    requiredContext: "meaningful fatigue"
  },
  {
    id: "PA_DISCONNECT",
    classification: "LATE_CAREER",
    category: "life",
    ageRange: [28, null],
    cooldownDays: 45,
    targetKind: "none",
    status: "implemented",
    requiredContext: "late-career fatigue"
  }
] as const;
