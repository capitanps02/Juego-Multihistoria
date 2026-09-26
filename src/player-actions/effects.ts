import type { DataValue } from "../core/types.js";
import type {
  PlayerActionFactKind,
  PlayerActionGameState
} from "./types.js";

export interface PlayerActionFactDraft {
  kind: PlayerActionFactKind;
  payload: Record<string, DataValue>;
  expiresInDays?: number;
}

type EffectHandler = (
  state: PlayerActionGameState,
  targetId: string | undefined
) => readonly PlayerActionFactDraft[];

function clamp(value: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, value));
}

function requireNumber(value: unknown, label: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`Player Action expected numeric ${label}`);
  }
  return value;
}

const EFFECTS: Readonly<Record<string, EffectHandler>> = Object.freeze({
  train_extra(state) {
    const fatigue = requireNumber(state.body.fatigue, "body.fatigue");
    const technique = requireNumber(state.professional.technique, "professional.technique");
    state.body.fatigue = Math.round(clamp(fatigue + 3) * 10) / 10;
    state.professional.technique = Math.round(clamp(technique + 0.5) * 10) / 10;
    return [{
      kind: "training_extra_completed",
      payload: { focus: "technique" },
      expiresInDays: 0
    }];
  },

  rest(state) {
    const fatigue = requireNumber(state.body.fatigue, "body.fatigue");
    const fitness = requireNumber(state.body.fitness, "body.fitness");
    state.body.fatigue = Math.round(clamp(fatigue - 5) * 10) / 10;
    state.body.fitness = Math.round(clamp(fitness + 2) * 10) / 10;
    return [{
      kind: "rest_completed",
      payload: { focus: "recovery" },
      expiresInDays: 0
    }];
  },

  coach_request_more_minutes(_state, targetId) {
    if (!targetId) throw new Error("Coach conversation requires target");
    return [{
      kind: "request_more_minutes",
      payload: { request: "more_minutes" },
      expiresInDays: 30
    }];
  },

  coach_request_feedback(_state, targetId) {
    if (!targetId) throw new Error("Coach conversation requires target");
    return [{
      kind: "request_coach_feedback",
      payload: { request: "development_feedback" },
      expiresInDays: 14
    }];
  },

  coach_acknowledge_role(_state, targetId) {
    if (!targetId) throw new Error("Coach conversation requires target");
    return [{
      kind: "coach_role_acknowledged",
      payload: { stance: "comfortable_with_current_role" },
      expiresInDays: 14
    }];
  }
});

export function hasPlayerActionEffect(effectKey: string): boolean {
  return Object.prototype.hasOwnProperty.call(EFFECTS, effectKey);
}

export function applyPlayerActionEffect(
  state: PlayerActionGameState,
  effectKey: string,
  targetId?: string
): readonly PlayerActionFactDraft[] {
  const handler = EFFECTS[effectKey];
  if (!handler) throw new Error(`Forbidden Player Action effect: ${effectKey}`);
  return handler(state, targetId);
}

export const PLAYER_ACTION_EFFECT_KEYS = Object.freeze(Object.keys(EFFECTS));
