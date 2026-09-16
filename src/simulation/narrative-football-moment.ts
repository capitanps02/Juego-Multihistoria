import { DeterministicRng } from "../core/rng.js";
import type { DataValue, GameState } from "../core/types.js";

export const NARRATIVE_FOOTBALL_MOMENTS_KEY = "narrativeFootballMoments" as const;

export type NarrativeFootballMomentKind = "penalty";
export type NarrativeFootballOutcome = "scored" | "missed";

export interface NarrativeFootballAttempt {
  momentId: string;
  kind: NarrativeFootballMomentKind;
  actorId: string;
  technique: number;
  composure: number;
  form: number;
  pressure: number;
}

export interface NarrativeFootballFact {
  momentId: string;
  kind: NarrativeFootballMomentKind;
  actorId: string;
  outcome: NarrativeFootballOutcome;
  probability: number;
  roll: number;
  contextKey: string;
}

interface NormalizedAttempt extends NarrativeFootballAttempt {}

type MomentRegistry = Record<string, DataValue>;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const rounded = (value: number, digits = 6) => Number(value.toFixed(digits));

function bounded(name: string, value: number): number {
  if (!Number.isFinite(value)) throw new Error(`Invalid football moment ${name}: ${String(value)}`);
  return clamp(value, 0, 100);
}

function normalizeAttempt(input: NarrativeFootballAttempt): NormalizedAttempt {
  if (!input.momentId.trim()) throw new Error("Narrative football moment requires a non-empty momentId");
  if (!input.actorId.trim()) throw new Error("Narrative football moment requires a non-empty actorId");
  if (input.kind !== "penalty") throw new Error(`Unsupported narrative football moment kind: ${String(input.kind)}`);
  return {
    momentId: input.momentId,
    kind: input.kind,
    actorId: input.actorId,
    technique: bounded("technique", input.technique),
    composure: bounded("composure", input.composure),
    form: bounded("form", input.form),
    pressure: bounded("pressure", input.pressure)
  };
}

function contextKey(input: NormalizedAttempt): string {
  return JSON.stringify({
    kind: input.kind,
    actorId: input.actorId,
    technique: rounded(input.technique, 4),
    composure: rounded(input.composure, 4),
    form: rounded(input.form, 4),
    pressure: rounded(input.pressure, 4)
  });
}

/**
 * Technical penalty model for narrative match moments.
 *
 * This is intentionally narrow: the narrative chooses who attempts the kick and
 * supplies factual sporting inputs; this function only maps those inputs to a
 * bounded scoring probability. It consumes no RNG and mutates no state.
 */
export function narrativeFootballMomentProbability(input: NarrativeFootballAttempt): number {
  const attempt = normalizeAttempt(input);
  const probability = 0.72
    + (attempt.technique - 50) * 0.0015
    + (attempt.composure - 50) * 0.0020
    + (attempt.form - 50) * 0.0010
    - (attempt.pressure - 50) * 0.0012;
  return rounded(clamp(probability, 0.50, 0.92));
}

function registryFromState(state: GameState, create: boolean): MomentRegistry | null {
  const raw = state.world[NARRATIVE_FOOTBALL_MOMENTS_KEY];
  if (raw === undefined) {
    if (!create) return null;
    const registry: MomentRegistry = {};
    state.world[NARRATIVE_FOOTBALL_MOMENTS_KEY] = registry;
    return registry;
  }
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    throw new Error("Invalid narrative football moment registry");
  }
  return raw as MomentRegistry;
}

function parseFact(raw: unknown, expectedMomentId: string): NarrativeFootballFact | null {
  if (raw === undefined) return null;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    throw new Error(`Invalid narrative football moment fact: ${expectedMomentId}`);
  }
  const value = raw as Record<string, unknown>;
  const fact: NarrativeFootballFact = {
    momentId: String(value.momentId ?? ""),
    kind: value.kind as NarrativeFootballMomentKind,
    actorId: String(value.actorId ?? ""),
    outcome: value.outcome as NarrativeFootballOutcome,
    probability: Number(value.probability),
    roll: Number(value.roll),
    contextKey: String(value.contextKey ?? "")
  };
  if (
    fact.momentId !== expectedMomentId
    || fact.kind !== "penalty"
    || !fact.actorId
    || !["scored", "missed"].includes(fact.outcome)
    || !Number.isFinite(fact.probability)
    || !Number.isFinite(fact.roll)
    || !fact.contextKey
  ) {
    throw new Error(`Invalid narrative football moment fact: ${expectedMomentId}`);
  }
  return fact;
}

/** Read an already resolved moment without consuming RNG or mutating GameState. */
export function getNarrativeFootballMoment(state: GameState, momentId: string): NarrativeFootballFact | null {
  const registry = registryFromState(state, false);
  if (!registry) return null;
  return parseFact(registry[momentId], momentId);
}

/**
 * Resolve a narrative-originated sporting moment exactly once.
 *
 * A repeated call with the same `momentId` and exact sporting context is
 * idempotent and returns the stored fact without another RNG draw. Reusing the
 * id for different semantics fails closed instead of silently re-rolling.
 */
export function resolveNarrativeFootballMomentInPlace(
  state: GameState,
  input: NarrativeFootballAttempt
): NarrativeFootballFact {
  const attempt = normalizeAttempt(input);
  const key = contextKey(attempt);
  const existing = getNarrativeFootballMoment(state, attempt.momentId);
  if (existing) {
    if (existing.contextKey !== key) {
      throw new Error(`Narrative football moment '${attempt.momentId}' was already resolved with different context`);
    }
    return existing;
  }

  // Validate/create storage before consuming RNG so malformed state cannot burn a draw.
  const registry = registryFromState(state, true)!;
  const probability = narrativeFootballMomentProbability(attempt);
  const rng = new DeterministicRng(state.rngState.football);
  const roll = rng.next();
  const fact: NarrativeFootballFact = {
    momentId: attempt.momentId,
    kind: attempt.kind,
    actorId: attempt.actorId,
    outcome: roll < probability ? "scored" : "missed",
    probability,
    roll,
    contextKey: key
  };
  registry[attempt.momentId] = fact as unknown as DataValue;
  return { ...fact };
}
