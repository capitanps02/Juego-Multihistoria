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
    cooldownDays: 30,
    targetKind: "coach",
    status: "implemented",
    requiredContext: "current coach",
    blockedBy: "A2 public target projection for UI execution"
  },
  {
    id: "PA_ROLE_CHECK",
    classification: "CONTEXTUAL",
    category: "career",
    ageRange: [18, null],
    cooldownDays: 21,
    targetKind: "coach",
    status: "blocked",
    requiredContext: "current coach",
    blockedBy: "A1/A3 informational role-query contract"
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
    cooldownDays: 120,
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
    cooldownDays: 6,
    targetKind: "none",
    status: "blocked",
    requiredContext: "active career",
    blockedBy: "A1 health category + recovery handler"
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
    cooldownDays: 30,
    targetKind: "agent",
    status: "implemented",
    requiredContext: "certified current representative",
    blockedBy: "A2 public target projection for UI execution"
  },
  {
    id: "PA_REQUEST_RENEWAL",
    classification: "CORE",
    category: "representative",
    ageRange: [18, null],
    cooldownDays: 90,
    targetKind: "none",
    status: "implemented",
    requiredContext: "current club employment",
    blockedBy: "A1 contract-month contextual eligibility still generic"
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
    blockedBy: "A1 relationship handler + A2 public targets"
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
    id: "PA_VETERAN_ADVICE",
    classification: "CONTEXTUAL",
    category: "relationships",
    ageRange: [18, 23],
    cooldownDays: 21,
    targetKind: "teammate",
    status: "blocked",
    requiredContext: "eligible veteran teammate",
    blockedBy: "A1 veteran predicate + A3 advice intent"
  },
  {
    id: "PA_MENTOR_YOUNG",
    classification: "LATE_CAREER",
    category: "relationships",
    ageRange: [30, null],
    cooldownDays: 21,
    targetKind: "teammate",
    status: "blocked",
    requiredContext: "eligible young teammate",
    blockedBy: "A1 young-player predicate + A3 mentorship intent"
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
    blockedBy: "A1 image effect registry"
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
    cooldownDays: 7,
    targetKind: "none",
    status: "blocked",
    requiredContext: "active career",
    blockedBy: "A1 life effect registry"
  },
  {
    id: "PA_DISCONNECT",
    classification: "LATE_CAREER",
    category: "life",
    ageRange: [28, null],
    cooldownDays: 14,
    targetKind: "none",
    status: "blocked",
    requiredContext: "active career",
    blockedBy: "A1 age eligibility + life effect registry"
  }
] as const;
