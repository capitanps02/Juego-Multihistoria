import { NPC_CATALOG } from "../catalog/npcs.js";
import { getPath } from "../core/path.js";
import type { Effect, EventDefinition, GameState } from "../core/types.js";

export type ConsequenceCategory = "sport" | "body" | "relationship" | "reputation" | "career" | "finance";

export interface VisibleConsequence {
  category: ConsequenceCategory;
  label: string;
  delta: number;
  direction: "up" | "down";
  /** null means the sign is informative but not inherently good/bad. */
  favorable: boolean | null;
}

export interface DecisionConsequences {
  visibleEffects: VisibleConsequence[];
  narrativeEffects: string[];
  /** Player-safe deferred/no-immediate-change notices. Never raw internal IDs. */
  hiddenEffects: string[];
}

export interface StructuredSportDeltas {
  formDelta?: number;
  fatigueDelta?: number;
  fitnessDelta?: number;
  coachTrustDelta?: number;
  roleChange?: string;
  careerMilestone?: string;
}

interface ConsequenceMeta {
  category: ConsequenceCategory;
  label: string;
  higherIsBetter: boolean | null;
}

export const DEFERRED_CONSEQUENCE_MESSAGE = "Esta decisión puede tener consecuencias más adelante.";
export const NO_IMMEDIATE_CHANGE_MESSAGE = "No hay cambios inmediatos.";

const INTERNAL_JARGON = /(?:\bcallback\b|\bauthority\b|\bseedOrigin\b|\bSEED_[A-Z0-9_]+\b|\bHAS_SEED_[A-Z0-9_]+\b|\b(?:C?EVT)_[A-Z0-9_]+\b|\bNPC_[A-Z0-9_]+\b|\bSTATE(?:20|23|26|30|34)?_[A-Z0-9_]+\b|\bNANO_SHADOW\b|\bOLD_NETWORK_FAVOR\b)/i;
const GENERIC_MESSAGES = new Set([
  "has tomado una decisión.",
  "decisión tomada.",
  "continúas.",
  "continuas.",
  "hecho."
]);

const PATH_META: Readonly<Record<string, ConsequenceMeta>> = {
  "sport.form": { category: "sport", label: "Forma", higherIsBetter: true },
  "sport.roleScore": { category: "sport", label: "Rol deportivo", higherIsBetter: true },
  "body.fitness": { category: "body", label: "Estado físico", higherIsBetter: true },
  "body.fatigue": { category: "body", label: "Fatiga", higherIsBetter: false },
  "body.risk": { category: "body", label: "Riesgo físico", higherIsBetter: false },
  "reputation.prestige": { category: "reputation", label: "Reputación", higherIsBetter: true },
  "reputation.marketHeat": { category: "reputation", label: "Interés de mercado", higherIsBetter: true },
  "reputation.mediaHeat": { category: "reputation", label: "Exposición mediática", higherIsBetter: null },
  "control.career": { category: "career", label: "Control de carrera", higherIsBetter: true },
  "professional.careerControl": { category: "career", label: "Control de carrera", higherIsBetter: true },
  "professional.roleSecurity": { category: "career", label: "Seguridad del rol", higherIsBetter: true },
  "professional.institutionalTrust": { category: "career", label: "Confianza del club", higherIsBetter: true },
  "professional.environmentStability": { category: "career", label: "Estabilidad del entorno", higherIsBetter: true },
  "professional.contractPower": { category: "career", label: "Poder de negociación", higherIsBetter: true },
  "professional.lockerPower": { category: "career", label: "Peso en el vestuario", higherIsBetter: true },
  "professional.moneyComfort": { category: "finance", label: "Comodidad financiera", higherIsBetter: true },
  "finances.cash": { category: "finance", label: "Dinero disponible", higherIsBetter: true },
  "professional.recoveryDebt": { category: "body", label: "Recuperación pendiente", higherIsBetter: false },
  "professional.recoveryMargin": { category: "body", label: "Margen de recuperación", higherIsBetter: true },
  "professional.motivationReserve": { category: "career", label: "Motivación", higherIsBetter: true },
  "professional.legacyCapital": { category: "career", label: "Legado", higherIsBetter: true },
  "professional.successionPressure": { category: "career", label: "Competencia por el puesto", higherIsBetter: false },
  "professional.foreignAdaptation": { category: "career", label: "Adaptación al extranjero", higherIsBetter: true },
  "professional.retirementDistance": { category: "career", label: "Cercanía a la retirada", higherIsBetter: null }
};

const REL_AXIS_META: Readonly<Record<string, { label: string; higherIsBetter: boolean | null }>> = {
  trust: { label: "Confianza", higherIsBetter: true },
  affinity: { label: "Afinidad", higherIsBetter: true },
  respect: { label: "Respeto", higherIsBetter: true },
  resentment: { label: "Resentimiento", higherIsBetter: false },
  leverage: { label: "Influencia", higherIsBetter: null }
};

function relationMeta(path: string): ConsequenceMeta | undefined {
  if (!path.startsWith("rel.")) return undefined;
  const [, npcId, axis] = path.split(".");
  const axisMeta = axis ? REL_AXIS_META[axis] : undefined;
  if (!npcId || !axisMeta) return undefined;
  const npcName = NPC_CATALOG.find(npc => npc.id === npcId)?.name;
  return {
    category: "relationship",
    label: npcName ? `${npcName} · ${axisMeta.label}` : `Relación · ${axisMeta.label}`,
    higherIsBetter: axisMeta.higherIsBetter
  };
}

function metaForPath(path: string): ConsequenceMeta | undefined {
  return PATH_META[path] ?? relationMeta(path);
}

function effectPath(effect: Effect): string | undefined {
  return effect.kind === "flag" ? undefined : effect.path;
}

function unique<T>(values: readonly T[]): T[] {
  return [...new Set(values)];
}

export function containsInternalJargon(value: string): boolean {
  return INTERNAL_JARGON.test(value);
}

export function sanitizePlayerFacingMessage(value: string): string {
  const text = value.trim();
  if (!text) return "";
  return containsInternalJargon(text) ? DEFERRED_CONSEQUENCE_MESSAGE : text;
}

export function isMeaningfulFeedbackMessage(value: string): boolean {
  const text = sanitizePlayerFacingMessage(value);
  return text.length > 0 && !GENERIC_MESSAGES.has(text.toLocaleLowerCase("es-ES"));
}

export function playerFacingMessages(messages: readonly string[]): string[] {
  return unique(messages.map(sanitizePlayerFacingMessage).filter(Boolean));
}

function visibleConsequence(before: GameState, after: GameState, path: string): VisibleConsequence | undefined {
  const meta = metaForPath(path);
  if (!meta) return undefined;
  const from = getPath(before, path);
  const to = getPath(after, path);
  if (typeof from !== "number" || typeof to !== "number") return undefined;
  const delta = to - from;
  if (!Number.isFinite(delta) || delta === 0) return undefined;
  const direction = delta > 0 ? "up" : "down";
  const favorable = meta.higherIsBetter === null ? null : (delta > 0) === meta.higherIsBetter;
  return { category: meta.category, label: meta.label, delta, direction, favorable };
}

function resolutionParts(event: EventDefinition, choiceId: string, outcomeId: string) {
  const choice = event.choices.find(candidate => candidate.id === choiceId);
  const outcome = event.outcomes.find(candidate => candidate.id === outcomeId);
  if (!choice || !outcome) throw new Error(`Unknown resolution ${event.id}/${choiceId}/${outcomeId}`);
  return { choice, outcome };
}

export function buildDecisionConsequences(
  before: GameState,
  after: GameState,
  event: EventDefinition,
  choiceId: string,
  outcomeId: string,
  messages: readonly string[]
): DecisionConsequences {
  const { choice, outcome } = resolutionParts(event, choiceId, outcomeId);
  const declaredEffects = [...(choice.immediateEffects ?? []), ...(outcome.effects ?? [])];
  const visiblePaths = unique(
    declaredEffects
      .map(effectPath)
      .filter((path): path is string => Boolean(path && metaForPath(path)))
  );
  const visibleEffects = visiblePaths
    .map(path => visibleConsequence(before, after, path))
    .filter((effect): effect is VisibleConsequence => Boolean(effect));

  const narrativeEffects = unique(
    playerFacingMessages(messages).filter(isMeaningfulFeedbackMessage)
  );

  const hasHiddenEffect =
    (choice.hiddenCosts?.length ?? 0) > 0
    || (choice.followUps?.length ?? 0) > 0
    || (outcome.seedTransitions?.length ?? 0) > 0
    || declaredEffects.some(effect => {
      const path = effectPath(effect);
      return !path || !metaForPath(path);
    });

  const hiddenEffects: string[] = [];
  if (hasHiddenEffect) hiddenEffects.push(DEFERRED_CONSEQUENCE_MESSAGE);
  else if (visibleEffects.length === 0 && narrativeEffects.length === 0) hiddenEffects.push(NO_IMMEDIATE_CHANGE_MESSAGE);

  return { visibleEffects, narrativeEffects, hiddenEffects };
}

export function normalizeConsequenceFields(value: Partial<DecisionConsequences> & { messages: readonly string[] }): DecisionConsequences {
  const visibleEffects = Array.isArray(value.visibleEffects) ? structuredClone(value.visibleEffects) : [];
  const narrativeEffects = Array.isArray(value.narrativeEffects)
    ? unique(value.narrativeEffects.map(sanitizePlayerFacingMessage).filter(isMeaningfulFeedbackMessage))
    : unique(playerFacingMessages(value.messages).filter(isMeaningfulFeedbackMessage));
  const hiddenEffects = Array.isArray(value.hiddenEffects)
    ? unique(value.hiddenEffects.map(sanitizePlayerFacingMessage).filter(Boolean))
    : [];
  if (visibleEffects.length === 0 && narrativeEffects.length === 0 && hiddenEffects.length === 0) {
    hiddenEffects.push(NO_IMMEDIATE_CHANGE_MESSAGE);
  }
  return { visibleEffects, narrativeEffects, hiddenEffects };
}

export function consequencesFromStructuredSportDeltas(deltas: StructuredSportDeltas): DecisionConsequences {
  const visibleEffects: VisibleConsequence[] = [];
  const add = (label: string, category: ConsequenceCategory, delta: number | undefined, higherIsBetter: boolean | null) => {
    if (delta === undefined || delta === 0 || !Number.isFinite(delta)) return;
    visibleEffects.push({
      category,
      label,
      delta,
      direction: delta > 0 ? "up" : "down",
      favorable: higherIsBetter === null ? null : (delta > 0) === higherIsBetter
    });
  };
  add("Forma", "sport", deltas.formDelta, true);
  add("Fatiga", "body", deltas.fatigueDelta, false);
  add("Estado físico", "body", deltas.fitnessDelta, true);
  add("Confianza del entrenador", "relationship", deltas.coachTrustDelta, true);

  const narrativeEffects = [deltas.roleChange, deltas.careerMilestone]
    .filter((value): value is string => typeof value === "string")
    .map(sanitizePlayerFacingMessage)
    .filter(isMeaningfulFeedbackMessage);

  const hiddenEffects = visibleEffects.length || narrativeEffects.length ? [] : [NO_IMMEDIATE_CHANGE_MESSAGE];
  return { visibleEffects, narrativeEffects: unique(narrativeEffects), hiddenEffects };
}

export interface FeedbackAudit {
  choices: number;
  resolutions: number;
  resolutionsWithVisiblePotential: number;
  resolutionsWithNarrativeFeedback: number;
  resolutionsWithDeferredOrNoChangeFallback: number;
  rawJargonMessages: number;
  playerFacingJargonLeaks: number;
  missing: string[];
}

export function auditDecisionFeedback(events: readonly EventDefinition[]): FeedbackAudit {
  const audit: FeedbackAudit = {
    choices: 0,
    resolutions: 0,
    resolutionsWithVisiblePotential: 0,
    resolutionsWithNarrativeFeedback: 0,
    resolutionsWithDeferredOrNoChangeFallback: 0,
    rawJargonMessages: 0,
    playerFacingJargonLeaks: 0,
    missing: []
  };

  for (const event of events) {
    audit.choices += event.choices.length;
    for (const choice of event.choices) {
      for (const outcomeId of choice.outcomeIds) {
        audit.resolutions += 1;
        const outcome = event.outcomes.find(candidate => candidate.id === outcomeId);
        if (!outcome) {
          audit.missing.push(`${event.id}/${choice.id}/${outcomeId}: outcome inexistente`);
          continue;
        }
        const effects = [...(choice.immediateEffects ?? []), ...(outcome.effects ?? [])];
        const visiblePotential = effects.some(effect => {
          const path = effectPath(effect);
          return Boolean(path && metaForPath(path));
        });
        const rawMessages = outcome.messages ?? [];
        const safeMessages = playerFacingMessages(rawMessages);
        const narrativeFeedback = safeMessages.some(isMeaningfulFeedbackMessage);
        const hiddenOrFallback =
          !visiblePotential && !narrativeFeedback
          || (choice.hiddenCosts?.length ?? 0) > 0
          || (choice.followUps?.length ?? 0) > 0
          || (outcome.seedTransitions?.length ?? 0) > 0;

        if (visiblePotential) audit.resolutionsWithVisiblePotential += 1;
        if (narrativeFeedback) audit.resolutionsWithNarrativeFeedback += 1;
        if (hiddenOrFallback) audit.resolutionsWithDeferredOrNoChangeFallback += 1;
        audit.rawJargonMessages += rawMessages.filter(containsInternalJargon).length;
        audit.playerFacingJargonLeaks += safeMessages.filter(containsInternalJargon).length;

        if (!visiblePotential && !narrativeFeedback && !hiddenOrFallback) {
          audit.missing.push(`${event.id}/${choice.id}/${outcomeId}: sin feedback`);
        }
      }
    }
  }
  return audit;
}
