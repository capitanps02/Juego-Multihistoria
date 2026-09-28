import { hasPlayerActionEffect } from "./effects.js";
import { PLAYER_ACTION_CONTENT_PLAN } from "./content-plan.js";
import { PLAYER_ACTION_CONTENT_SPECS } from "./content-spec.js";
import { PLAYER_ACTION_ELIGIBILITY_SPECS } from "./content-eligibility.js";
import { PLAYER_ACTION_COOLDOWN_GROUP_SPECS } from "./content-cooldown-groups.js";
import { PLAYER_ACTION_EFFECT_PLAN } from "./content-effect-plan.js";
function eligibilityFor(actionId) {
    return PLAYER_ACTION_ELIGIBILITY_SPECS.find(row => row.actionId === actionId)?.all ?? [];
}
function cooldownGroupFor(actionId) {
    const row = PLAYER_ACTION_COOLDOWN_GROUP_SPECS.find(candidate => candidate.actionId === actionId);
    return row?.groupId ? { id: row.groupId, days: row.groupDays } : undefined;
}
function executableOptions(actionId) {
    const spec = PLAYER_ACTION_CONTENT_SPECS.find(row => row.id === actionId);
    if (!spec)
        return [];
    const effectByOption = new Map(PLAYER_ACTION_EFFECT_PLAN
        .filter(row => row.actionId === actionId)
        .map(row => [row.optionId, row.desiredEffectKey]));
    const options = [];
    for (const option of spec.options) {
        const effectKey = effectByOption.get(option.id);
        if (!effectKey || !hasPlayerActionEffect(effectKey))
            continue;
        options.push({
            id: option.id,
            label: option.label,
            effectKey,
            publicResult: option.publicResult
        });
    }
    return options;
}
function runtimeDefinition(plan) {
    const spec = PLAYER_ACTION_CONTENT_SPECS.find(row => row.id === plan.id);
    if (!spec)
        return null;
    const options = executableOptions(plan.id);
    if (options.length === 0)
        return null;
    return {
        id: plan.id,
        category: plan.category,
        label: spec.label,
        description: spec.description,
        targetKind: plan.targetKind,
        cooldown: {
            scope: plan.targetKind === "none" ? "action" : "action_target",
            days: plan.cooldownDays
        },
        ...(cooldownGroupFor(plan.id) ? { cooldownGroup: cooldownGroupFor(plan.id) } : {}),
        eligibilityKey: "active_career",
        eligibility: eligibilityFor(plan.id),
        options
    };
}
/**
 * Production catalog is derived from A5's frozen content manifests plus the
 * A1/A3 closed effect registry. Unsupported effect keys are omitted, so content
 * can never expose an action option that would fail with EFFECT_FORBIDDEN.
 *
 * Adding a certified closed handler is enough to make its option executable;
 * actions with no executable options remain absent from runtime.
 */
export const PLAYER_ACTION_CATALOG = Object.freeze(PLAYER_ACTION_CONTENT_PLAN
    .map(runtimeDefinition)
    .filter((row) => row !== null));
export function findPlayerActionDefinition(actionId, catalog = PLAYER_ACTION_CATALOG) {
    return catalog.find(definition => definition.id === actionId) ?? null;
}
