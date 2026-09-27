import type { GameState } from "../core/types.js";
import { resolveRecentCurrentClubCoachChange } from "../simulation/coach-change-authority.js";
import { resolveCurrentRepresentation } from "../simulation/representation-authority.js";
import { PLAYER_ACTION_CATALOG } from "./catalog.js";
import {
  getPlayerActionCooldown,
  isPlayerActionCooldownActive
} from "./action-state.js";
import type {
  PlayerActionAvailability,
  PlayerActionDefinition,
  PlayerActionErrorCode,
  PlayerActionGameState,
  PlayerActionTargetKind
} from "./types.js";

export interface PlayerActionTargetValidation {
  valid: boolean;
  code: PlayerActionErrorCode | null;
  reason: string | null;
}

function currentCoachId(state: GameState): string | null {
  const certified = resolveRecentCurrentClubCoachChange(state, Number.MAX_SAFE_INTEGER);
  if (certified) return certified.newCoachNpcId;
  if (state.professional.registrationClub === "UDV" && state.flags.COACH_FIRED !== true) return "NPC_CCH_01";
  return null;
}

function validNpc(state: GameState, targetId: string): boolean {
  return state.npcs.some(npc => npc.id === targetId && npc.careerState === "active");
}

function targetMatchesKind(state: GameState, targetKind: PlayerActionTargetKind, targetId: string): boolean {
  if (!validNpc(state, targetId)) return false;
  if (targetKind === "coach") return currentCoachId(state) === targetId;
  if (targetKind === "agent") return resolveCurrentRepresentation(state)?.agentNpcId === targetId;
  if (targetKind === "teammate") {
    const npc = state.npcs.find(candidate => candidate.id === targetId);
    return Boolean(npc && npc.id.startsWith("NPC_PLR_") && npc.club === state.club);
  }
  return false;
}

export function validatePlayerActionTarget(
  state: PlayerActionGameState,
  definition: PlayerActionDefinition,
  targetId?: string
): PlayerActionTargetValidation {
  if (definition.targetKind === "none") {
    return targetId
      ? { valid: false, code: "PLAYER_ACTION_TARGET_UNEXPECTED", reason: "Esta acción no admite objetivo." }
      : { valid: true, code: null, reason: null };
  }
  if (!targetId) {
    return { valid: false, code: "PLAYER_ACTION_TARGET_REQUIRED", reason: "Debes elegir un objetivo válido." };
  }
  if (!targetMatchesKind(state, definition.targetKind, targetId)) {
    return { valid: false, code: "PLAYER_ACTION_TARGET_INVALID", reason: "El objetivo ya no está disponible para esta acción." };
  }
  return { valid: true, code: null, reason: null };
}

function eligibilityPass(state: PlayerActionGameState, eligibilityKey: string): boolean {
  switch (eligibilityKey) {
    case "active_career":
      return state.retirement.status !== "closed";
    default:
      return false;
  }
}

export function evaluatePlayerAction(
  state: PlayerActionGameState,
  definition: PlayerActionDefinition,
  targetId?: string
): PlayerActionAvailability {
  const target = validatePlayerActionTarget(state, definition, targetId);
  const cooldownUntil = getPlayerActionCooldown(state, definition, targetId);
  const cooldownActive = isPlayerActionCooldownActive(state.date, cooldownUntil);
  const eligible = eligibilityPass(state, definition.eligibilityKey);

  let unavailableReason: string | null = null;
  if (!eligible) unavailableReason = "Esta acción no está disponible en el estado actual de la carrera.";
  else if (!target.valid) unavailableReason = target.reason;
  else if (cooldownActive) unavailableReason = `Disponible de nuevo el ${cooldownUntil}.`;

  const available = unavailableReason === null;
  return {
    actionId: definition.id,
    available,
    unavailableReason,
    cooldownUntil,
    options: definition.options.map(option => ({
      id: option.id,
      label: option.label,
      ...(option.description ? { description: option.description } : {}),
      available,
      unavailableReason
    }))
  };
}

export function isPlayerActionAvailable(
  state: PlayerActionGameState,
  definition: PlayerActionDefinition,
  targetId?: string
): boolean {
  return evaluatePlayerAction(state, definition, targetId).available;
}

export function getAvailablePlayerActionOptions(
  state: PlayerActionGameState,
  definition: PlayerActionDefinition,
  targetId?: string
): PlayerActionAvailability["options"] {
  return evaluatePlayerAction(state, definition, targetId).options.filter(option => option.available);
}

export function listPlayerActions(
  state: PlayerActionGameState,
  catalog: readonly PlayerActionDefinition[] = PLAYER_ACTION_CATALOG,
  targetByAction: Readonly<Record<string, string | undefined>> = {}
): PlayerActionAvailability[] {
  return catalog.map(definition => evaluatePlayerAction(state, definition, targetByAction[definition.id]));
}

export function getAvailablePlayerActions(
  state: PlayerActionGameState,
  catalog: readonly PlayerActionDefinition[] = PLAYER_ACTION_CATALOG,
  targetByAction: Readonly<Record<string, string | undefined>> = {}
): PlayerActionAvailability[] {
  return listPlayerActions(state, catalog, targetByAction).filter(action => action.available);
}
