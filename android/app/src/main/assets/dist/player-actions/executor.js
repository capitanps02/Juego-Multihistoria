import { PLAYER_ACTION_CATALOG, findPlayerActionDefinition } from "./catalog.js";
import { addPlayerActionDays, ensurePlayerActionStateInPlace, isPlayerActionCooldownActive, isPlayerActionCooldownGroupValid, playerActionCooldownKey, playerActionGroupCooldownKey, readPlayerActionState } from "./action-state.js";
import { applyPlayerActionEffect, hasPlayerActionEffect } from "./effects.js";
import { evaluatePlayerAction, validatePlayerActionTarget } from "./eligibility.js";
import { inspectPlayerActionState } from "./validation.js";
function failed(request, code, message) {
    return {
        ok: false,
        actionId: request.actionId,
        optionId: request.optionId,
        code,
        message
    };
}
function replaceStateInPlace(target, source) {
    const targetRecord = target;
    for (const key of Object.keys(targetRecord))
        delete targetRecord[key];
    Object.assign(targetRecord, source);
}
function executionId(sequence) {
    return `PAE-${String(sequence).padStart(8, "0")}`;
}
function factRows(draft, request, sequence, drafts) {
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
export function playerActionAvailability(state, actionId, targetId, catalog = PLAYER_ACTION_CATALOG) {
    const definition = findPlayerActionDefinition(actionId, catalog);
    return definition ? evaluatePlayerAction(state, definition, targetId) : null;
}
export function executePlayerActionInPlace(state, request, catalog = PLAYER_ACTION_CATALOG) {
    const definition = findPlayerActionDefinition(request.actionId, catalog);
    if (!definition)
        return failed(request, "PLAYER_ACTION_UNKNOWN", "Acción desconocida.");
    const option = definition.options.find(candidate => candidate.id === request.optionId);
    if (!option)
        return failed(request, "PLAYER_ACTION_OPTION_UNKNOWN", "Opción desconocida.");
    if (!isPlayerActionCooldownGroupValid(definition)) {
        return failed(request, "PLAYER_ACTION_STATE_INVALID", "La configuración de cooldown compartido no es válida.");
    }
    const target = validatePlayerActionTarget(state, definition, request.targetId);
    if (!target.valid) {
        return failed(request, target.code ?? "PLAYER_ACTION_TARGET_INVALID", target.reason ?? "Objetivo no válido.");
    }
    const availability = evaluatePlayerAction(state, definition, request.targetId);
    if (!availability.available) {
        const cooldownActive = isPlayerActionCooldownActive(state.date, availability.cooldownUntil);
        return failed(request, cooldownActive ? "PLAYER_ACTION_COOLDOWN" : "PLAYER_ACTION_UNAVAILABLE", availability.unavailableReason ?? "Acción no disponible.");
    }
    if (!hasPlayerActionEffect(option.effectKey)) {
        return failed(request, "PLAYER_ACTION_EFFECT_FORBIDDEN", "La acción intenta usar un efecto no autorizado.");
    }
    const draft = structuredClone(state);
    try {
        const factDrafts = applyPlayerActionEffect(draft, option.effectKey, request.targetId);
        const sequence = readPlayerActionState(draft).sequence + 1;
        const id = executionId(sequence);
        const actionCooldownUntil = definition.cooldown.days > 0
            ? addPlayerActionDays(draft.date, definition.cooldown.days)
            : null;
        const cooldownKey = playerActionCooldownKey(definition, request.targetId);
        if (definition.cooldown.days > 0 && !cooldownKey) {
            return failed(request, "PLAYER_ACTION_STATE_INVALID", "No se pudo derivar el cooldown de forma segura.");
        }
        const groupCooldownKey = playerActionGroupCooldownKey(definition);
        const groupCooldownUntil = definition.cooldownGroup && definition.cooldownGroup.days > 0
            ? addPlayerActionDays(draft.date, definition.cooldownGroup.days)
            : null;
        if (definition.cooldownGroup && !groupCooldownKey) {
            return failed(request, "PLAYER_ACTION_STATE_INVALID", "No se pudo derivar el cooldown compartido de forma segura.");
        }
        const cooldownUntil = [actionCooldownUntil, groupCooldownUntil]
            .filter((value) => typeof value === "string")
            .sort()
            .at(-1) ?? null;
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
        if (cooldownKey && actionCooldownUntil)
            store.cooldowns[cooldownKey] = actionCooldownUntil;
        if (groupCooldownKey && groupCooldownUntil)
            store.cooldowns[groupCooldownKey] = groupCooldownUntil;
        store.facts.push(...facts);
        const issue = inspectPlayerActionState(store, draft.date);
        if (issue)
            return failed(request, "PLAYER_ACTION_STATE_INVALID", "El estado resultante de Player Actions no es válido.");
        replaceStateInPlace(state, draft);
        return {
            ok: true,
            actionId: request.actionId,
            optionId: request.optionId,
            executionId: id,
            visibleResult: option.publicResult,
            cooldownUntil
        };
    }
    catch {
        return failed(request, "PLAYER_ACTION_EFFECT_FAILED", "No se pudo aplicar la acción de forma segura.");
    }
}
export function executePlayerAction(state, request, catalog = PLAYER_ACTION_CATALOG) {
    const next = structuredClone(state);
    return {
        state: next,
        result: executePlayerActionInPlace(next, request, catalog)
    };
}
export function playerActionPublicResult(result) {
    return structuredClone(result);
}
