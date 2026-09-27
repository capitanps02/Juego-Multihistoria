import type {
  PlayerActionDefinition,
  PlayerActionFact,
  PlayerActionGameState,
  PlayerActionState
} from "./types.js";

const EMPTY_PLAYER_ACTION_STATE: Readonly<PlayerActionState> = Object.freeze({
  version: 1 as const,
  sequence: 0,
  history: Object.freeze([]) as unknown as PlayerActionState["history"],
  cooldowns: Object.freeze({}) as PlayerActionState["cooldowns"],
  facts: Object.freeze([]) as unknown as PlayerActionState["facts"]
});

function assertIsoDate(value: string): void {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error(`Invalid ISO date: ${value}`);
  const date = new Date(`${value}T00:00:00Z`);
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw new Error(`Invalid ISO date: ${value}`);
  }
}

export function addPlayerActionDays(isoDate: string, days: number): string {
  assertIsoDate(isoDate);
  if (!Number.isInteger(days) || days < 0) throw new Error("Player Action cooldown days must be a non-negative integer");
  const date = new Date(`${isoDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function readPlayerActionState(state: PlayerActionGameState): Readonly<PlayerActionState> {
  return state.playerActions ?? EMPTY_PLAYER_ACTION_STATE;
}

export function playerActionStateSnapshot(state: PlayerActionGameState): PlayerActionState | null {
  return state.playerActions ? structuredClone(state.playerActions) : null;
}

export function ensurePlayerActionStateInPlace(state: PlayerActionGameState): PlayerActionState {
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

export function playerActionCooldownKey(
  definition: PlayerActionDefinition,
  targetId?: string
): string | null {
  if (definition.cooldown.scope === "action") return `action:${definition.id}`;
  if (!targetId) return null;
  return `action_target:${definition.id}:${targetId}`;
}

export function getPlayerActionCooldown(
  state: PlayerActionGameState,
  definition: PlayerActionDefinition,
  targetId?: string
): string | null {
  const key = playerActionCooldownKey(definition, targetId);
  if (!key) return null;
  return readPlayerActionState(state).cooldowns[key] ?? null;
}

export function isPlayerActionCooldownActive(currentDate: string, cooldownUntil: string | null): boolean {
  if (!cooldownUntil) return false;
  assertIsoDate(currentDate);
  assertIsoDate(cooldownUntil);
  return currentDate < cooldownUntil;
}

export function getPlayerActionFacts(
  state: PlayerActionGameState,
  options: { activeOnly?: boolean; kind?: PlayerActionFact["kind"] } = {}
): PlayerActionFact[] {
  const { activeOnly = false, kind } = options;
  return readPlayerActionState(state).facts
    .filter(fact => !kind || fact.kind === kind)
    .filter(fact => !activeOnly || fact.expiresAfter === undefined || fact.expiresAfter >= state.date)
    .map(fact => structuredClone(fact));
}
