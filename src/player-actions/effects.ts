import type { DataValue } from "../core/types.js";
import { currentEmploymentClub } from "../simulation/employment.js";
import { resolveCurrentRepresentation } from "../simulation/representation-authority.js";
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

function requireCurrentClub(state: PlayerActionGameState): string {
  const club = currentEmploymentClub(state);
  if (!club) throw new Error("Player Action requires current club employment");
  return club;
}

function coachScope(state: PlayerActionGameState, targetId: string | undefined): { club: string; coachNpcId: string } {
  if (!targetId) throw new Error("Coach conversation requires target");
  return { club: requireCurrentClub(state), coachNpcId: targetId };
}

function agentScope(state: PlayerActionGameState, targetId: string | undefined): { agentNpcId: string } {
  if (!targetId) throw new Error("Agent conversation requires target");
  const representation = resolveCurrentRepresentation(state);
  if (!representation || representation.agentNpcId !== targetId) {
    throw new Error("Agent conversation requires the current certified representative");
  }
  return { agentNpcId: targetId };
}

function careerPriorityFact(
  state: PlayerActionGameState,
  targetId: string | undefined,
  priority: "minutes" | "salary" | "stability" | "club_level"
): readonly PlayerActionFactDraft[] {
  return [{
    kind: "career_priority",
    payload: { priority, ...agentScope(state, targetId) },
    expiresInDays: 20
  }];
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

  coach_request_more_minutes(state, targetId) {
    const scope = coachScope(state, targetId);
    return [{
      kind: "request_more_minutes",
      payload: { request: "more_minutes", ...scope },
      expiresInDays: 30
    }];
  },

  coach_request_feedback(state, targetId) {
    const scope = coachScope(state, targetId);
    return [{
      kind: "request_coach_feedback",
      payload: { request: "development_feedback", ...scope },
      expiresInDays: 14
    }];
  },

  coach_acknowledge_role(state, targetId) {
    const scope = coachScope(state, targetId);
    return [{
      kind: "coach_role_acknowledged",
      payload: { stance: "comfortable_with_current_role", ...scope },
      expiresInDays: 14
    }];
  },

  request_transfer(state) {
    return [{
      kind: "request_transfer",
      payload: {
        request: "transfer",
        club: requireCurrentClub(state)
      },
      expiresInDays: 120
    }];
  },

  withdraw_transfer_request(state) {
    return [{
      kind: "withdraw_transfer_request",
      payload: {
        request: "withdraw_transfer",
        club: requireCurrentClub(state)
      }
    }];
  },

  request_position_change(state, targetId) {
    const scope = coachScope(state, targetId);
    return [{
      kind: "request_position_change",
      payload: { request: "position_change", ...scope },
      expiresInDays: 44
    }];
  },

  request_renewal(state) {
    return [{
      kind: "request_renewal",
      payload: {
        request: "renewal",
        club: requireCurrentClub(state),
        marketHistoryCount: state.market?.history.length ?? 0
      },
      expiresInDays: 90
    }];
  },

  ask_agent_market(state, targetId) {
    return [{
      kind: "ask_agent_market",
      payload: {
        request: "market_status",
        ...agentScope(state, targetId)
      },
      expiresInDays: 30
    }];
  },

  career_priority_minutes(state, targetId) {
    return careerPriorityFact(state, targetId, "minutes");
  },

  career_priority_salary(state, targetId) {
    return careerPriorityFact(state, targetId, "salary");
  },

  career_priority_stability(state, targetId) {
    return careerPriorityFact(state, targetId, "stability");
  },

  career_priority_club_level(state, targetId) {
    return careerPriorityFact(state, targetId, "club_level");
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
