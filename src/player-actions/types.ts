import type { DataValue, GameState } from "../core/types.js";

export type PlayerActionCategory =
  | "career"
  | "training"
  | "representative"
  | "relationships"
  | "image"
  | "life";

export type PlayerActionTargetKind = "none" | "coach" | "agent" | "teammate";
export type PlayerActionCooldownScope = "action" | "action_target";

export interface PlayerActionOption {
  id: string;
  label: string;
  description?: string;
  effectKey: string;
  publicResult: string;
}

export interface PlayerActionDefinition {
  id: string;
  category: PlayerActionCategory;
  label: string;
  description: string;
  targetKind: PlayerActionTargetKind;
  cooldown: {
    scope: PlayerActionCooldownScope;
    days: number;
  };
  eligibilityKey: string;
  options: readonly PlayerActionOption[];
}

export interface PlayerActionOptionAvailability {
  id: string;
  label: string;
  description?: string;
  available: boolean;
  unavailableReason: string | null;
}

export interface PlayerActionAvailability {
  actionId: string;
  available: boolean;
  unavailableReason: string | null;
  cooldownUntil: string | null;
  options: PlayerActionOptionAvailability[];
}

export interface PlayerActionSource {
  kind: "player_action";
  executionId: string;
  actionId: string;
  optionId: string;
}

export type PlayerActionFactKind =
  | "training_extra_completed"
  | "rest_completed"
  | "request_more_minutes"
  | "request_coach_feedback"
  | "coach_role_acknowledged";

export interface PlayerActionFact {
  factId: string;
  kind: PlayerActionFactKind;
  createdDate: string;
  expiresAfter?: string;
  source: PlayerActionSource;
  targetId?: string;
  payload: Record<string, DataValue>;
}

/**
 * A0 selected a fact-first causal model. This alias gives downstream code the
 * requested "intent" vocabulary without creating a second persisted authority.
 */
export type PlayerActionIntent = PlayerActionFact;

export interface PlayerActionHistoryEntry {
  executionId: string;
  sequence: number;
  actionId: string;
  optionId: string;
  date: string;
  runtimeDay: number;
  targetId?: string;
  visibleResult: string;
  cooldownUntil: string | null;
}

export interface PlayerActionState {
  version: 1;
  sequence: number;
  history: PlayerActionHistoryEntry[];
  cooldowns: Record<string, string>;
  facts: PlayerActionFact[];
}

export type PlayerActionGameState = GameState & {
  playerActions?: PlayerActionState;
};

export interface PlayerActionRequest {
  actionId: string;
  optionId: string;
  targetId?: string;
}

export type PlayerActionErrorCode =
  | "PLAYER_ACTION_UNKNOWN"
  | "PLAYER_ACTION_OPTION_UNKNOWN"
  | "PLAYER_ACTION_TARGET_REQUIRED"
  | "PLAYER_ACTION_TARGET_UNEXPECTED"
  | "PLAYER_ACTION_TARGET_INVALID"
  | "PLAYER_ACTION_UNAVAILABLE"
  | "PLAYER_ACTION_COOLDOWN"
  | "PLAYER_ACTION_EFFECT_FORBIDDEN"
  | "PLAYER_ACTION_EFFECT_FAILED"
  | "PLAYER_ACTION_STATE_INVALID";

export type PlayerActionExecutionResult =
  | {
      ok: true;
      actionId: string;
      optionId: string;
      executionId: string;
      visibleResult: string;
      cooldownUntil: string | null;
    }
  | {
      ok: false;
      actionId: string;
      optionId: string;
      code: PlayerActionErrorCode;
      message: string;
    };

export interface PlayerActionExecution {
  historyEntry: PlayerActionHistoryEntry;
  factsWritten: PlayerActionFact[];
  visibleResult: string;
}

export interface PlayerActionPureExecution {
  state: PlayerActionGameState;
  result: PlayerActionExecutionResult;
}
