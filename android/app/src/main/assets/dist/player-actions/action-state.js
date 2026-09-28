const EMPTY_PLAYER_ACTION_STATE = Object.freeze({
    version: 1,
    sequence: 0,
    history: Object.freeze([]),
    cooldowns: Object.freeze({}),
    facts: Object.freeze([])
});
function assertIsoDate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value))
        throw new Error(`Invalid ISO date: ${value}`);
    const date = new Date(`${value}T00:00:00Z`);
    if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
        throw new Error(`Invalid ISO date: ${value}`);
    }
}
export function addPlayerActionDays(isoDate, days) {
    assertIsoDate(isoDate);
    if (!Number.isInteger(days) || days < 0)
        throw new Error("Player Action cooldown days must be a non-negative integer");
    const date = new Date(`${isoDate}T00:00:00Z`);
    date.setUTCDate(date.getUTCDate() + days);
    return date.toISOString().slice(0, 10);
}
export function readPlayerActionState(state) {
    return state.playerActions ?? EMPTY_PLAYER_ACTION_STATE;
}
export function playerActionStateSnapshot(state) {
    return state.playerActions ? structuredClone(state.playerActions) : null;
}
export function ensurePlayerActionStateInPlace(state) {
    if (!state.playerActions) {
        state.playerActions = {
            version: 1,
            sequence: 0,
            history: [],
            cooldowns: {},
            facts: []
        };
    }
    return state.playerActions;
}
export function playerActionCooldownKey(definition, targetId) {
    if (definition.cooldown.scope === "action")
        return `action:${definition.id}`;
    if (!targetId)
        return null;
    return `action_target:${definition.id}:${targetId}`;
}
export function playerActionGroupCooldownKey(definition) {
    const group = definition.cooldownGroup;
    if (!group)
        return null;
    if (!/^[a-z0-9][a-z0-9_-]{0,63}$/i.test(group.id))
        return null;
    if (!Number.isInteger(group.days) || group.days < 0)
        return null;
    return `group:${group.id}`;
}
export function isPlayerActionCooldownGroupValid(definition) {
    return definition.cooldownGroup === undefined || playerActionGroupCooldownKey(definition) !== null;
}
function latestCooldown(...values) {
    const dates = values.filter((value) => typeof value === "string");
    return dates.length ? dates.sort().at(-1) ?? null : null;
}
export function getPlayerActionCooldown(state, definition, targetId) {
    const store = readPlayerActionState(state);
    const actionKey = playerActionCooldownKey(definition, targetId);
    const groupKey = playerActionGroupCooldownKey(definition);
    return latestCooldown(actionKey ? store.cooldowns[actionKey] : null, groupKey ? store.cooldowns[groupKey] : null);
}
export function isPlayerActionCooldownActive(currentDate, cooldownUntil) {
    if (!cooldownUntil)
        return false;
    assertIsoDate(currentDate);
    assertIsoDate(cooldownUntil);
    return currentDate < cooldownUntil;
}
export function getPlayerActionFacts(state, options = {}) {
    const { activeOnly = false, kind } = options;
    return readPlayerActionState(state).facts
        .filter(fact => !kind || fact.kind === kind)
        .filter(fact => !activeOnly || fact.expiresAfter === undefined || fact.expiresAfter >= state.date)
        .map(fact => structuredClone(fact));
}
