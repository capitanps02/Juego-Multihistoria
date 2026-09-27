import type { DataValue } from "../core/types.js";
import type {
  PlayerActionFactKind,
  PlayerActionState
} from "./types.js";

const FACT_KINDS = new Set<PlayerActionFactKind>([
  "training_extra_completed",
  "rest_completed",
  "request_more_minutes",
  "request_coach_feedback",
  "coach_role_acknowledged",
  "request_transfer",
  "withdraw_transfer_request",
  "request_position_change",
  "request_renewal",
  "ask_agent_market",
  "career_priority"
]);

function record(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function isoDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function dataValue(value: unknown): value is DataValue {
  if (value === null || typeof value === "string" || typeof value === "boolean") return true;
  if (typeof value === "number") return Number.isFinite(value);
  if (Array.isArray(value)) return value.every(dataValue);
  const row = record(value);
  return row !== null && Object.values(row).every(dataValue);
}

function noUnexpectedKeys(row: Record<string, unknown>, allowed: readonly string[]): boolean {
  const allow = new Set(allowed);
  return Object.keys(row).every(key => allow.has(key));
}

function nonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

export function inspectPlayerActionState(value: unknown, currentDate?: string): string | null {
  const store = record(value);
  if (!store) return "playerActions must be an object";
  if (!noUnexpectedKeys(store, ["version","sequence","history","cooldowns","facts"])) {
    return "playerActions contains unexpected fields";
  }
  if (store.version !== 1) return "playerActions.version must be 1";
  if (!Number.isInteger(store.sequence) || Number(store.sequence) < 0) return "playerActions.sequence must be a non-negative integer";
  if (!Array.isArray(store.history)) return "playerActions.history must be an array";
  if (!Array.isArray(store.facts)) return "playerActions.facts must be an array";
  const cooldowns = record(store.cooldowns);
  if (!cooldowns) return "playerActions.cooldowns must be an object";
  if (currentDate !== undefined && !isoDate(currentDate)) return "currentDate must be an ISO date";

  const sequence = Number(store.sequence);
  if (store.history.length !== sequence) return "playerActions.sequence must equal history length";

  const executions = new Map<string, { actionId: string; optionId: string; date: string; targetId?: string }>();
  for (let index = 0; index < store.history.length; index += 1) {
    const row = record(store.history[index]);
    if (!row) return `playerActions.history[${index}] must be an object`;
    if (!noUnexpectedKeys(row, ["executionId","sequence","actionId","optionId","date","runtimeDay","targetId","visibleResult","cooldownUntil"])) {
      return `playerActions.history[${index}] contains unexpected fields`;
    }
    if (!nonEmptyString(row.executionId) || !nonEmptyString(row.actionId) || !nonEmptyString(row.optionId) || !nonEmptyString(row.visibleResult)) {
      return `playerActions.history[${index}] has invalid identifiers/result`;
    }
    if (row.sequence !== index + 1) return `playerActions.history[${index}].sequence is not monotonic`;
    if (!isoDate(row.date)) return `playerActions.history[${index}].date is invalid`;
    if (!Number.isInteger(row.runtimeDay) || Number(row.runtimeDay) < 0) return `playerActions.history[${index}].runtimeDay is invalid`;
    if (row.targetId !== undefined && !nonEmptyString(row.targetId)) return `playerActions.history[${index}].targetId is invalid`;
    if (row.cooldownUntil !== null && !isoDate(row.cooldownUntil)) return `playerActions.history[${index}].cooldownUntil is invalid`;
    if (typeof row.cooldownUntil === "string" && row.cooldownUntil < row.date) return `playerActions.history[${index}].cooldownUntil precedes execution`;
    if (currentDate && row.date > currentDate) return `playerActions.history[${index}] is from the future`;
    if (executions.has(row.executionId)) return `duplicate Player Action executionId: ${row.executionId}`;
    executions.set(row.executionId, {
      actionId: row.actionId,
      optionId: row.optionId,
      date: row.date,
      ...(typeof row.targetId === "string" ? { targetId: row.targetId } : {})
    });
  }

  for (const [key, until] of Object.entries(cooldowns)) {
    if (!nonEmptyString(key) || !isoDate(until)) return `invalid Player Action cooldown: ${key}`;
  }

  const factIds = new Set<string>();
  for (let index = 0; index < store.facts.length; index += 1) {
    const row = record(store.facts[index]);
    if (!row) return `playerActions.facts[${index}] must be an object`;
    if (!noUnexpectedKeys(row, ["factId","kind","createdDate","expiresAfter","source","targetId","payload"])) {
      return `playerActions.facts[${index}] contains unexpected fields`;
    }
    if (!nonEmptyString(row.factId) || factIds.has(row.factId)) return `playerActions.facts[${index}].factId is invalid or duplicate`;
    factIds.add(row.factId);
    if (typeof row.kind !== "string" || !FACT_KINDS.has(row.kind as PlayerActionFactKind)) {
      return `playerActions.facts[${index}].kind is not allowlisted`;
    }
    if (!isoDate(row.createdDate)) return `playerActions.facts[${index}].createdDate is invalid`;
    if (row.expiresAfter !== undefined && !isoDate(row.expiresAfter)) return `playerActions.facts[${index}].expiresAfter is invalid`;
    if (typeof row.expiresAfter === "string" && row.expiresAfter < row.createdDate) {
      return `playerActions.facts[${index}].expiresAfter precedes createdDate`;
    }
    if (currentDate && row.createdDate > currentDate) return `playerActions.facts[${index}] is from the future`;
    if (row.targetId !== undefined && !nonEmptyString(row.targetId)) return `playerActions.facts[${index}].targetId is invalid`;
    const payload = record(row.payload);
    if (!payload || !Object.values(payload).every(dataValue)) return `playerActions.facts[${index}].payload is invalid`;

    const source = record(row.source);
    if (!source || !noUnexpectedKeys(source, ["kind","executionId","actionId","optionId"])) {
      return `playerActions.facts[${index}].source is invalid`;
    }
    if (source.kind !== "player_action" || !nonEmptyString(source.executionId) || !nonEmptyString(source.actionId) || !nonEmptyString(source.optionId)) {
      return `playerActions.facts[${index}].source is invalid`;
    }
    const history = executions.get(source.executionId);
    if (!history || history.actionId !== source.actionId || history.optionId !== source.optionId || history.date !== row.createdDate) {
      return `playerActions.facts[${index}].source does not match history`;
    }
    if ((history.targetId ?? undefined) !== (typeof row.targetId === "string" ? row.targetId : undefined)) {
      return `playerActions.facts[${index}].targetId does not match history`;
    }
  }

  return null;
}

export function assertPlayerActionState(value: unknown, currentDate?: string): asserts value is PlayerActionState {
  const issue = inspectPlayerActionState(value, currentDate);
  if (issue) throw new Error(issue);
}
