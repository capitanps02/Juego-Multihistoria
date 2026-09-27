import type { GameState } from "../core/types.js";
import { resolveRecentCurrentClubCoachChange } from "../simulation/coach-change-authority.js";
import { hasActiveClubEmployment } from "../simulation/employment.js";
import { resolveCurrentRepresentation } from "../simulation/representation-authority.js";
import { PLAYER_ACTION_CATALOG } from "./catalog.js";
import { playerActionFacts } from "./facts.js";
import {
  getPlayerActionCooldown,
  isPlayerActionCooldownActive
} from "./action-state.js";
import type {
  PlayerActionAvailability,
  PlayerActionDefinition,
  PlayerActionErrorCode,
  PlayerActionEligibilityPredicate,
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

function legacyEligibilityPass(state: PlayerActionGameState, eligibilityKey: string): boolean {
  switch (eligibilityKey) {
    case "active_career":
      return state.retirement.status !== "closed";
    case "active_employment":
      return state.retirement.status !== "closed" && hasActiveClubEmployment(state);
    case "renewal_window": {
      if (state.retirement.status === "closed" || !hasActiveClubEmployment(state)) return false;
      const months = Number(state.contract.monthsRemaining);
      return Number.isFinite(months) && months >= 1 && months <= 24;
    }
    default:
      return false;
  }
}

function finiteNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function predicatePass(
  state: PlayerActionGameState,
  predicate: PlayerActionEligibilityPredicate,
  targetId?: string
): boolean {
  switch (predicate.kind) {
    case "active_career":
      return state.retirement.status !== "closed";
    case "active_club_employment":
      return hasActiveClubEmployment(state);
    case "age_range":
      return state.age >= predicate.min && (predicate.max === undefined || state.age <= predicate.max);
    case "current_coach":
      return Boolean(targetId && targetMatchesKind(state, "coach", targetId));
    case "current_representation":
      return Boolean(targetId && targetMatchesKind(state, "agent", targetId));
    case "contract_months": {
      const months = finiteNumber(state.contract.monthsRemaining);
      return months !== null && months >= predicate.min && months <= predicate.max;
    }
    case "live_transfer_request":
      return playerActionFacts(state).requestedTransfer.currentlyRelevant === predicate.required;
    case "fatigue_min": {
      const fatigue = finiteNumber(state.body.fatigue);
      return fatigue !== null && fatigue >= predicate.value;
    }
    case "fatigue_max": {
      const fatigue = finiteNumber(state.body.fatigue);
      return fatigue !== null && fatigue <= predicate.value;
    }
    case "risk_min": {
      const risk = finiteNumber(state.body.risk);
      return risk !== null && risk >= predicate.value;
    }
    case "risk_max": {
      const risk = finiteNumber(state.body.risk);
      return risk !== null && risk <= predicate.value;
    }
    case "current_teammate":
      return Boolean(targetId && targetMatchesKind(state, "teammate", targetId));
    case "teammate_profile":
      // Profile membership needs an explicit public registry. Do not infer from age, role text or private NPC data.
      return false;
    case "visible_teammate_tension":
      // No certified player-facing tension authority exists yet.
      return false;
  }
}

function eligibilityFailureReason(predicate: PlayerActionEligibilityPredicate): string {
  switch (predicate.kind) {
    case "active_club_employment":
      return "Necesitas tener un club actual para realizar esta acción.";
    case "age_range":
      return "Esta acción no está disponible en esta etapa de tu carrera.";
    case "contract_months":
      return "Esta acción no está disponible en esta fase del contrato.";
    case "fatigue_min":
    case "fatigue_max":
    case "risk_min":
    case "risk_max":
      return "Tu estado físico actual no permite esta acción.";
    case "current_coach":
    case "current_representation":
    case "current_teammate":
    case "teammate_profile":
    case "visible_teammate_tension":
      return "No hay un objetivo válido disponible para esta acción.";
    case "live_transfer_request":
      return "Esta acción no está disponible con tu situación de mercado actual.";
    case "active_career":
      return "Esta acción no está disponible en el estado actual de la carrera.";
  }
}

function eligibilityResult(
  state: PlayerActionGameState,
  definition: PlayerActionDefinition,
  targetId?: string
): { eligible: boolean; reason: string | null } {
  if (!legacyEligibilityPass(state, definition.eligibilityKey)) {
    return { eligible: false, reason: "Esta acción no está disponible en el estado actual de la carrera." };
  }
  for (const predicate of definition.eligibility ?? []) {
    if (!predicatePass(state, predicate, targetId)) {
      return { eligible: false, reason: eligibilityFailureReason(predicate) };
    }
  }
  return { eligible: true, reason: null };
}

export function evaluatePlayerAction(
  state: PlayerActionGameState,
  definition: PlayerActionDefinition,
  targetId?: string
): PlayerActionAvailability {
  const target = validatePlayerActionTarget(state, definition, targetId);
  const cooldownUntil = getPlayerActionCooldown(state, definition, targetId);
  const cooldownActive = isPlayerActionCooldownActive(state.date, cooldownUntil);
  const eligibility = eligibilityResult(state, definition, targetId);

  let unavailableReason: string | null = null;
  if (!eligibility.eligible) unavailableReason = eligibility.reason;
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
