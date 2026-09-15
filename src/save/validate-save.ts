import type { GameState, NarrativePhase, RngStreamState } from "../core/types.js";
import { CURRENT_SCHEMA_VERSION } from "./save.js";

/**
 * T2.2 · Structural validation for saves and session snapshots.
 *
 * Rejects corrupt, truncated, future-version and structurally invalid data
 * with descriptive error codes. Never modifies the incoming object.
 * Migration is handled by save.ts; this module validates *after* migration.
 */

export class SaveValidationError extends Error {
  constructor(public readonly code: string, message: string) {
    super(message);
    this.name = "SaveValidationError";
  }
}

function fail(code: string, message: string): never {
  throw new SaveValidationError(code, message);
}

function isObj(x: unknown): x is Record<string, unknown> {
  return x !== null && typeof x === "object" && !Array.isArray(x);
}

function isFiniteNumber(x: unknown): x is number {
  return typeof x === "number" && Number.isFinite(x);
}

function requireFinite(value: unknown, label: string): void {
  if (!isFiniteNumber(value)) {
    fail("INVALID_FIELD", `${label} debe ser un número finito, recibido: ${String(value)}`);
  }
}

function requireString(value: unknown, label: string): void {
  if (typeof value !== "string" || value.length === 0) {
    fail("INVALID_FIELD", `${label} debe ser una cadena no vacía.`);
  }
}

function requireArray(value: unknown, label: string): void {
  if (!Array.isArray(value)) {
    fail("INVALID_FIELD", `${label} debe ser un array.`);
  }
}

// ── RNG stream ──────────────────────────────────────────────────────────

function validateRngStream(stream: unknown, label: string): void {
  if (!isObj(stream)) fail("INVALID_RNG", `${label}: stream RNG ausente o no es objeto.`);
  const { seed, state, draws } = stream as Record<string, unknown>;
  requireFinite(seed, `${label}.seed`);
  requireFinite(state, `${label}.state`);
  requireFinite(draws, `${label}.draws`);
  if ((draws as number) < 0) fail("INVALID_RNG", `${label}.draws no puede ser negativo.`);
}

// ── GameState ───────────────────────────────────────────────────────────

const VALID_PHASES: NarrativePhase[] = ["18_20", "20_23", "23_26", "26_30", "30_34", "34_plus"];
const RETIREMENT_STATUSES = ["playing", "decided", "announced", "closed"];

export function validateGameState(s: unknown): asserts s is GameState {
  if (!isObj(s)) fail("INVALID_SAVE", "El estado del juego no es un objeto válido.");

  // ── Schema version ──
  const version = (s as Record<string, unknown>).schemaVersion;
  if (!isFiniteNumber(version)) fail("INVALID_SAVE", "Falta schemaVersion o no es un número.");
  if ((version as number) > CURRENT_SCHEMA_VERSION) fail("FUTURE_VERSION", `Schema ${version} es posterior al soportado (${CURRENT_SCHEMA_VERSION}).`);
  if ((version as number) !== CURRENT_SCHEMA_VERSION) fail("INCOMPATIBLE_SCHEMA", `Schema ${version} no es la versión actual (${CURRENT_SCHEMA_VERSION}). Usa loadSave para migrar antes de validar.`);

  // ── Top-level scalars ──
  const state = s as Record<string, unknown>;
  requireString(state.date, "date");
  requireFinite(state.age, "age");
  if ((state.age as number) < 0 || (state.age as number) > 100) fail("INVALID_FIELD", "age fuera de rango razonable (0–100).");
  requireString(state.season, "season");
  if (!VALID_PHASES.includes(state.phase as NarrativePhase)) fail("INVALID_FIELD", `phase '${String(state.phase)}' no es una fase válida.`);
  requireString(state.club, "club");
  requireFinite(state.tier, "tier");
  requireString(state.role, "role");

  // ── Required objects ──
  if (!isObj(state.professional)) fail("INVALID_SAVE", "Falta el objeto professional.");
  if (!isObj(state.runtime)) fail("INVALID_SAVE", "Falta el objeto runtime.");
  if (!isObj(state.retirement)) fail("INVALID_SAVE", "Falta el objeto retirement.");
  if (!isObj(state.epilogue)) fail("INVALID_SAVE", "Falta el objeto epilogue.");
  if (!isObj(state.contract)) fail("INVALID_SAVE", "Falta el objeto contract.");
  if (!isObj(state.finances)) fail("INVALID_SAVE", "Falta el objeto finances.");
  if (!isObj(state.body)) fail("INVALID_SAVE", "Falta el objeto body.");
  if (!isObj(state.selection)) fail("INVALID_SAVE", "Falta el objeto selection.");
  if (!isObj(state.reputation)) fail("INVALID_SAVE", "Falta el objeto reputation.");
  if (!isObj(state.control)) fail("INVALID_SAVE", "Falta el objeto control.");
  if (!isObj(state.sport)) fail("INVALID_SAVE", "Falta el objeto sport.");
  if (!isObj(state.world)) fail("INVALID_SAVE", "Falta el objeto world.");
  if (!isObj(state.personality)) fail("INVALID_SAVE", "Falta el objeto personality.");
  if (!isObj(state.flags)) fail("INVALID_SAVE", "Falta el objeto flags.");
  if (!isObj(state.eventCooldowns)) fail("INVALID_SAVE", "Falta el objeto eventCooldowns.");
  if (!isObj(state.narrativePressure)) fail("INVALID_SAVE", "Falta el objeto narrativePressure.");

  // ── Required arrays ──
  requireArray(state.careerStateTags, "careerStateTags");
  requireArray(state.relationships, "relationships");
  requireArray(state.npcs, "npcs");
  requireArray(state.seeds, "seeds");
  requireArray(state.history, "history");
  requireArray(state.microfeeds, "microfeeds");

  // ── Runtime ──
  const rt = state.runtime as Record<string, unknown>;
  requireFinite(rt.day, "runtime.day");
  requireFinite(rt.seasonDay, "runtime.seasonDay");
  requireFinite(rt.daysSinceNarrative, "runtime.daysSinceNarrative");
  requireFinite(rt.eventsThisSeason, "runtime.eventsThisSeason");

  // ── Retirement ──
  const ret = state.retirement as Record<string, unknown>;
  if (!RETIREMENT_STATUSES.includes(ret.status as string)) fail("INVALID_FIELD", `retirement.status '${String(ret.status)}' no es válido.`);
  requireFinite(ret.reversals, "retirement.reversals");
  requireFinite(ret.noMarketWindows, "retirement.noMarketWindows");
  requireFinite(ret.daysInStatus, "retirement.daysInStatus");

  // ── Epilogue ──
  const epi = state.epilogue as Record<string, unknown>;
  if (typeof epi.generated !== "boolean") fail("INVALID_FIELD", "epilogue.generated debe ser booleano.");
  requireArray(epi.families, "epilogue.families");
  requireArray(epi.milestones, "epilogue.milestones");

  // ── RNG state ──
  if (!isObj(state.rngState)) fail("INVALID_RNG", "Falta rngState.");
  const rng = state.rngState as Record<string, unknown>;
  validateRngStream(rng.narrative, "rngState.narrative");
  validateRngStream(rng.football, "rngState.football");
  validateRngStream(rng.microfeed, "rngState.microfeed");
  validateRngStream(rng.qa, "rngState.qa");

  // ── Professional: spot-check key numeric fields for NaN/Infinity ──
  const pro = state.professional as Record<string, unknown>;
  for (const key of [
    "leagueTier", "clubPrestigeTier", "clubPrestigeScore", "contractPower",
    "roleSecurity", "bodyLoad", "recoveryMargin", "motivationReserve",
    "retirementDistance", "legacyCapital", "explosiveness", "matchEndurance"
  ]) {
    requireFinite(pro[key], `professional.${key}`);
  }

  // ── History entries: spot-check structure ──
  const history = state.history as unknown[];
  for (let i = 0; i < Math.min(history.length, 5); i++) {
    const h = history[i];
    if (!isObj(h)) fail("CORRUPT_SAVE", `history[${i}] no es un objeto válido.`);
    const entry = h as Record<string, unknown>;
    requireString(entry.eventId, `history[${i}].eventId`);
    requireString(entry.date, `history[${i}].date`);
    requireString(entry.choiceId, `history[${i}].choiceId`);
    requireString(entry.outcomeId, `history[${i}].outcomeId`);
  }
  // Also spot-check the last few entries for long histories
  if (history.length > 5) {
    for (let i = Math.max(5, history.length - 3); i < history.length; i++) {
      const h = history[i];
      if (!isObj(h)) fail("CORRUPT_SAVE", `history[${i}] no es un objeto válido.`);
      const entry = h as Record<string, unknown>;
      requireString(entry.eventId, `history[${i}].eventId`);
      requireString(entry.date, `history[${i}].date`);
    }
  }
}

// ── Snapshot-level validation (for SessionSnapshot containers) ────────

export interface SnapshotEnvelope {
  sessionVersion: number;
  build: string;
  contentIdentity: string;
  sessionId: string;
  revision: number;
  microfeeds: boolean;
  state: unknown;
  pendingDecision: unknown;
  pendingResult: unknown;
  receipts: unknown[];
  journal: unknown[];
  needsWorldAdvance: boolean;
}

export function validateSnapshotEnvelope(raw: unknown): asserts raw is SnapshotEnvelope {
  if (!isObj(raw)) fail("CORRUPT_SAVE", "El snapshot no es un objeto válido.");
  const snap = raw as Record<string, unknown>;

  // ── Envelope fields ──
  requireFinite(snap.sessionVersion, "sessionVersion");
  requireString(snap.build, "build");
  requireString(snap.contentIdentity, "contentIdentity");
  requireString(snap.sessionId, "sessionId");
  requireFinite(snap.revision, "revision");
  if ((snap.revision as number) < 0) fail("INVALID_FIELD", "revision no puede ser negativa.");
  if (typeof snap.microfeeds !== "boolean") fail("INVALID_FIELD", "microfeeds debe ser booleano.");
  if (typeof snap.needsWorldAdvance !== "boolean") fail("INVALID_FIELD", "needsWorldAdvance debe ser booleano.");

  // ── Pending state coherence ──
  if (snap.pendingDecision !== null && snap.pendingDecision !== undefined && !isObj(snap.pendingDecision)) {
    fail("INVALID_SAVE", "pendingDecision debe ser null o un objeto válido.");
  }
  if (snap.pendingResult !== null && snap.pendingResult !== undefined && !isObj(snap.pendingResult)) {
    fail("INVALID_SAVE", "pendingResult debe ser null o un objeto válido.");
  }
  if (snap.pendingDecision && snap.pendingResult) {
    fail("INVALID_SAVE", "No puede haber decisión y resultado pendientes simultáneamente.");
  }

  // ── Arrays ──
  requireArray(snap.receipts, "receipts");
  requireArray(snap.journal, "journal");

  // ── Inner GameState ──
  validateGameState(snap.state);
}

// ── Raw JSON parsing with corruption detection ──────────────────────

export function parseSaveJson(raw: string): unknown {
  if (typeof raw !== "string" || raw.length === 0) {
    fail("CORRUPT_SAVE", "Datos de guardado vacíos.");
  }
  try {
    return JSON.parse(raw);
  } catch (e) {
    fail("CORRUPT_SAVE", `JSON no válido: ${(e as Error).message}`);
  }
}
