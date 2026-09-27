import { PLAYER_ACTION_CATALOG, findPlayerActionDefinition } from "./catalog.js";
import {
  addPlayerActionDays,
  ensurePlayerActionStateInPlace,
  isPlayerActionCooldownActive,
  playerActionCooldownKey,
  readPlayerActionState
} from "./action-state.js";
import { applyPlayerActionEffect, hasPlayerActionEffect } from "./effects.js";
import { evaluatePlayerAction, validatePlayerActionTarget } from "./eligibility.js";
import { inspectPlayerActionState } from "./validation.js";
import type {
  PlayerActionDefinition,
  PlayerActionErrorCode,
  PlayerActionExecutionResult,
  PlayerActionFact,
  PlayerActionGameState,
  PlayerActionPureExecution,
  PlayerActionRequest
} from "./types.js";

function failed(
  request: PlayerActionRequest,
  code: PlayerActionErrorCode,
  message: string
): PlayerActionExecutionResult {
  return {
    ok: false,
    actionId: request.actionId,
    optionId: request.optionId,
    code,
    message
  };
}

function replaceStateInPlace(target: PlayerActionGameState, source: PlayerActionGameState): void {
  const targetRecord = target as unknown as Record<string, unknown>;
  for (const key of Object.keys(targetRecord)) delete targetRecord[key];
  Object.assign(targetRecord, source as unknown as Record<string, unknown>);
}

function executionId(sequence: number): string {
  return `PAE-${String(sequence).padStart(8, "0")}`;
}

function factRows(
  draft: PlayerActionGameState,
  request: PlayerActionRequest,
  sequence: number,
  drafts: ReturnType<typeof applyPlayerActionEffect>
): PlayerActionFact[] {
  const id = executionId(sequence);
  return drafts.map((fact, index) => ({
    factId: `${id}:F${index + 1}`,
    kind: fact.kind,
    createdDate: draft.date,
    ...(fact.expiresInDays === undefined
      ? {}
      : { expiresAfter: addPlayerActionDays(draft.date, fact.expiresInDays) }),
    source: {
      kind: "player_action",
      executionId: id,
      actionId: request.actionId,
      optionId: request.optionId
    },
    ...(request.targetId ? { targetId: request.targetId } : {}),
    payload: structuredClone(fact.payload)
  }));
}

export function playerActionAvailability(
  state: PlayerActionGameState,
  actionId: string,
  targetId?: string,
  catalog: readonly PlayerActionDefinition[] = PLAYER_ACTION_CATALOG
) {
  const definition = findPlayerActionDefinition(actionId, catalog);
  return definition ? evaluatePlayerAction(state, definition, targetId) : null;
}

export function executePlayerActionInPlace(
  state: PlayerActionGameState,
  request: PlayerActionRequest,
  catalog: readonly PlayerActionDefinition[] = PLAYER_ACTION_CATALOG
): PlayerActionExecutionResult {
  const definition = findPlayerActionDefinition(request.actionId, catalog);
  if (!definition) return failed(request, "PLAYER_ACTION_UNKNOWN", "Acción desconocida.");

  const option = definition.options.find(candidate => candidate.id === request.optionId);
  if (!option) return failed(request, "PLAYER_ACTION_OPTION_UNKNOWN", "Opción desconocida.");

  const target = validatePlayerActionTarget(state, definition, request.targetId);
  if (!target.valid) {
    return failed(request, target.code ?? "PLAYER_ACTION_TARGET_INVALID", target.reason ?? "Objetivo no válido.");
  }

  const availability = evaluatePlayerAction(state, definition, request.targetId);
  if (!availability.available) {
    const cooldownActive = isPlayerActionCooldownActive(state.date, availability.cooldownUntil);
    return failed(
      request,
      cooldownActive ? "PLAYER_ACTION_COOLDOWN" : "PLAYER_ACTION_UNAVAILABLE",
      availability.unavailableReason ?? "Acción no disponible."
    );
  }

  if (!hasPlayerActionEffect(option.effectKey)) {
    return failed(request, "PLAYER_ACTION_EFFECT_FORBIDDEN", "La acción intenta usar un efecto no autorizado.");
  }

  const draft = structuredClone(state) as PlayerActionGameState;
  try {
    const factDrafts = applyPlayerActionEffect(draft, option.effectKey, request.targetId);
    const sequence = readPlayerActionState(draft).sequence + 1;
    const id = executionId(sequence);
    const cooldownUntil = definition.cooldown.days > 0
      ? addPlayerActionDays(draft.date, definition.cooldown.days)
      : null;
    const cooldownKey = playerActionCooldownKey(definition, request.targetId);
    if (definition.cooldown.days > 0 && !cooldownKey) {
      return failed(request, "PLAYER_ACTION_STATE_INVALID", "No se pudo derivar el cooldown de forma segura.");
    }

    const facts = factRows(draft, request, sequence, factDrafts);
    const store = ensurePlayerActionStateInPlace(draft);
    store.sequence = sequence;
    store.history.push({
      executionId: id,
      sequence,
      actionId: request.actionId,
      optionId: request.optionId,
      date: draft.date,
      runtimeDay: draft.runtime.day,
      ...(request.targetId ? { targetId: request.targetId } : {}),
      visibleResult: option.publicResult,
      cooldownUntil
    });
    if (cooldownKey && cooldownUntil) store.cooldowns[cooldownKey] = cooldownUntil;
    store.facts.push(...facts);

    const issue = inspectPlayerActionState(store, draft.date);
    if (issue) return failed(request, "PLAYER_ACTION_STATE_INVALID", "El estado resultante de Player Actions no es válido.");

    replaceStateInPlace(state, draft);
    return {
      ok: true,
      actionId: request.actionId,
      optionId: request.optionId,
      executionId: id,
      visibleResult: option.publicResult,
      cooldownUntil
    };
  } catch {
    return failed(request, "PLAYER_ACTION_EFFECT_FAILED", "No se pudo aplicar la acción de forma segura.");
  }
}

export function executePlayerAction(
  state: PlayerActionGameState,
  request: PlayerActionRequest,
  catalog: readonly PlayerActionDefinition[] = PLAYER_ACTION_CATALOG
): PlayerActionPureExecution {
  const next = structuredClone(state) as PlayerActionGameState;
  return {
    state: next,
    result: executePlayerActionInPlace(next, request, catalog)
  };
}

export function playerActionPublicResult(result: PlayerActionExecutionResult): PlayerActionExecutionResult {
  return structuredClone(result);
}
