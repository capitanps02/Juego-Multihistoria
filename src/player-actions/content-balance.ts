export type PlayerActionPlannedMetric =
  | "body.fatigue"
  | "body.fitness"
  | "body.risk"
  | "professional.technique"
  | "professional.tacticalReading"
  | "professional.matchEndurance"
  | "professional.commercialPower"
  | "professional.publicPolarization"
  | "professional.institutionalTrust"
  | "professional.motivationReserve"
  | "professional.lockerPower"
  | "relationship.affinity"
  | "relationship.trust"
  | "relationship.respect"
  | "relationship.resentment";

export interface PlayerActionPlannedDelta {
  metric: PlayerActionPlannedMetric;
  delta: number;
}

export interface PlayerActionOptionBalanceSpec {
  optionId: string;
  directDeltas: readonly PlayerActionPlannedDelta[];
}

export interface PlayerActionBalanceSpec {
  actionId: string;
  options: readonly PlayerActionOptionBalanceSpec[];
}

/**
 * Target V1 balance owned by A5.
 *
 * This data is deliberately not consumed by the executor. A1 still owns the
 * closed effect registry and must translate approved rows into registered
 * handlers. Keeping the target numbers here prevents balance decisions from
 * being hidden inside engine code.
 */
export const PLAYER_ACTION_BALANCE_SPECS: readonly PlayerActionBalanceSpec[] = [
  {
    actionId: "PA_COACH_TALK",
    options: [
      { optionId: "MORE_MINUTES", directDeltas: [] },
      { optionId: "WHAT_TO_IMPROVE", directDeltas: [] },
      { optionId: "COMFORTABLE_ROLE", directDeltas: [] }
    ]
  },
  {
    actionId: "PA_ROLE_CHECK",
    options: [{ optionId: "ASK_ROLE", directDeltas: [] }]
  },
  {
    actionId: "PA_POSITION_CHANGE",
    options: [{ optionId: "EXPLORE", directDeltas: [] }]
  },
  {
    actionId: "PA_REQUEST_TRANSFER",
    options: [{ optionId: "REQUEST", directDeltas: [] }]
  },
  {
    actionId: "PA_WITHDRAW_TRANSFER",
    options: [{ optionId: "WITHDRAW", directDeltas: [] }]
  },
  {
    actionId: "PA_TRAIN_EXTRA",
    options: [
      {
        optionId: "TECHNIQUE",
        directDeltas: [
          { metric: "professional.technique", delta: 0.15 },
          { metric: "body.fatigue", delta: 3 },
          { metric: "body.risk", delta: 1 }
        ]
      },
      {
        optionId: "PHYSICAL",
        directDeltas: [
          { metric: "professional.matchEndurance", delta: 0.15 },
          { metric: "body.fitness", delta: 0.5 },
          { metric: "body.fatigue", delta: 4 },
          { metric: "body.risk", delta: 2 }
        ]
      },
      {
        optionId: "TACTICAL",
        directDeltas: [
          { metric: "professional.tacticalReading", delta: 0.15 },
          { metric: "body.fatigue", delta: 2 }
        ]
      }
    ]
  },
  {
    actionId: "PA_VIDEO_STUDY",
    options: [{
      optionId: "STUDY",
      directDeltas: [
        { metric: "professional.tacticalReading", delta: 0.10 },
        { metric: "body.fatigue", delta: 1 }
      ]
    }]
  },
  {
    actionId: "PA_RECOVERY_SESSION",
    options: [{
      optionId: "RECOVER",
      directDeltas: [
        { metric: "body.fatigue", delta: -3 },
        { metric: "body.fitness", delta: 0.5 },
        { metric: "body.risk", delta: -1 }
      ]
    }]
  },
  {
    actionId: "PA_REST",
    options: [{
      optionId: "RECOVER",
      directDeltas: [
        { metric: "body.fatigue", delta: -2 },
        { metric: "body.fitness", delta: 0.25 }
      ]
    }]
  },
  {
    actionId: "PA_AGENT_MARKET",
    options: [{ optionId: "ASK", directDeltas: [] }]
  },
  {
    actionId: "PA_REQUEST_RENEWAL",
    options: [{ optionId: "REQUEST", directDeltas: [] }]
  },
  {
    actionId: "PA_DISCUSS_FUTURE",
    options: [
      { optionId: "MINUTES", directDeltas: [] },
      { optionId: "SALARY", directDeltas: [] },
      { optionId: "STABILITY", directDeltas: [] },
      { optionId: "CLUB_LEVEL", directDeltas: [] }
    ]
  },
  {
    actionId: "PA_TALK_TEAMMATE",
    options: [{
      optionId: "CONNECT",
      directDeltas: [
        { metric: "relationship.affinity", delta: 1 },
        { metric: "relationship.respect", delta: 0.5 }
      ]
    }]
  },
  {
    actionId: "PA_CLEAR_AIR",
    options: [{
      optionId: "TALK",
      directDeltas: [
        { metric: "relationship.resentment", delta: -1 },
        { metric: "relationship.trust", delta: 0.5 }
      ]
    }]
  },
  {
    actionId: "PA_VETERAN_ADVICE",
    options: [{
      optionId: "ASK_ADVICE",
      directDeltas: [
        { metric: "professional.tacticalReading", delta: 0.05 },
        { metric: "relationship.respect", delta: 1 }
      ]
    }]
  },
  {
    actionId: "PA_MENTOR_YOUNG",
    options: [{
      optionId: "MENTOR",
      directDeltas: [
        { metric: "professional.lockerPower", delta: 0.05 },
        { metric: "relationship.respect", delta: 1 }
      ]
    }]
  },
  {
    actionId: "PA_INTERVIEW",
    options: [
      { optionId: "HUMBLE", directDeltas: [{ metric: "professional.commercialPower", delta: 0.5 }] },
      {
        optionId: "AMBITIOUS",
        directDeltas: [
          { metric: "professional.commercialPower", delta: 0.75 },
          { metric: "professional.publicPolarization", delta: 0.5 }
        ]
      },
      { optionId: "TEAM_FIRST", directDeltas: [{ metric: "professional.institutionalTrust", delta: 0.5 }] }
    ]
  },
  {
    actionId: "PA_SOCIAL_POST",
    options: [
      { optionId: "PROFESSIONAL", directDeltas: [{ metric: "professional.commercialPower", delta: 0.25 }] },
      { optionId: "PERSONAL", directDeltas: [{ metric: "professional.motivationReserve", delta: 0.25 }] }
    ]
  },
  {
    actionId: "PA_PERSONAL_TIME",
    options: [
      {
        optionId: "PEOPLE",
        directDeltas: [
          { metric: "body.fatigue", delta: -1 },
          { metric: "professional.motivationReserve", delta: 0.5 }
        ]
      },
      {
        optionId: "HOBBY",
        directDeltas: [
          { metric: "body.fatigue", delta: -1 },
          { metric: "professional.motivationReserve", delta: 0.5 }
        ]
      }
    ]
  },
  {
    actionId: "PA_DISCONNECT",
    options: [{
      optionId: "DISCONNECT",
      directDeltas: [
        { metric: "body.fatigue", delta: -2 },
        { metric: "professional.motivationReserve", delta: 1 }
      ]
    }]
  }
] as const;
