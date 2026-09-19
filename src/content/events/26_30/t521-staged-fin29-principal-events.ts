import type { ChoiceDefinition, EventDefinition, OutcomeDefinition } from "../../../core/types.js";
import { seedCreate, set } from "../18_20/helpers.js";

type Age30Priority = "maximum" | "minutes" | "body" | "freedom" | "legacy";

type PriorityRow = {
  id: string;
  label: string;
  token: Age30Priority;
  intentTags: string[];
  message: string;
};

const priorities: PriorityRow[] = [
  {
    id: "MAXIMUM",
    label: "Quiero seguir compitiendo por lo máximo aunque juegue menos",
    token: "maximum",
    intentTags: ["age30_priority", "maximum_competition", "elite_ambition"],
    message: "Tu prioridad al entrar en los treinta es seguir buscando el máximo nivel competitivo, incluso si eso reduce minutos o jerarquía inmediata."
  },
  {
    id: "WEEKLY_IMPORTANCE",
    label: "Quiero ser importante cada semana",
    token: "minutes",
    intentTags: ["age30_priority", "weekly_importance", "role"],
    message: "Tu prioridad al entrar en los treinta es conservar importancia deportiva semanal y un rol visible en el campo."
  },
  {
    id: "BODY_FAMILY_STABILITY",
    label: "Quiero proteger cuerpo, familia y estabilidad",
    token: "body",
    intentTags: ["age30_priority", "body", "family", "stability"],
    message: "Tu prioridad al entrar en los treinta es proteger disponibilidad física, familia y estabilidad sin convertirlo en una renuncia automática a competir."
  },
  {
    id: "FREEDOM_REINVENTION",
    label: "Quiero libertad para moverme y reinventarme",
    token: "freedom",
    intentTags: ["age30_priority", "freedom", "reinvention"],
    message: "Tu prioridad al entrar en los treinta es mantener libertad contractual y táctica para cambiar de contexto o reinventarte."
  },
  {
    id: "LEGACY",
    label: "Quiero que mi siguiente decisión tenga sentido para mi legado, aunque no maximice otra variable",
    token: "legacy",
    intentTags: ["age30_priority", "legacy"],
    message: "Tu prioridad al entrar en los treinta es dar coherencia al legado de la carrera, aunque eso no maximice salario, minutos o prestigio inmediato."
  }
];

const choices: ChoiceDefinition[] = priorities.map(priority => ({
  id: priority.id,
  label: priority.label,
  intentTags: priority.intentTags,
  immediateEffects: [set("world.age30Priority", priority.token)],
  outcomeIds: [`${priority.id}_OUT`]
}));

const outcomes: OutcomeDefinition[] = priorities.map(priority => ({
  id: `${priority.id}_OUT`,
  baseWeight: 1,
  effects: [],
  messages: [priority.message],
  seedTransitions: [seedCreate("SEED_AGE30_PRIORITY", 70, { priority: priority.token, advisory: true })],
  historyTags: priority.intentTags
}));

const FIN29: EventDefinition = {
  id: "EVT_29_FIN_001",
  ageWindow: [29, 29],
  phase: "26_30",
  family: "legacy",
  gates: [],
  cooldown: 99999,
  repeatable: false,
  weight: 100,
  timeWindow: { months: [5, 6] },
  text: {
    title: "Cumples 30",
    body: "La carrera hasta aquí no se resume en una nota: club, títulos, selección, cuerpo, dinero, poder, relaciones y puertas abiertas apuntan en direcciones distintas. Antes de entrar en la siguiente etapa decides qué quieres proteger durante los próximos años."
  },
  intel: {
    visible: [
      "Ves tu carrera acumulada hasta los 30 y las principales puertas que siguen abiertas.",
      "La prioridad que declares orientará lenguaje y futuras recomendaciones, pero no bloqueará decisiones posteriores."
    ],
    uncertain: [
      "No sabes qué entrenador, lesión, oferta, relación o crisis cambiará tus prioridades entre los 30 y los 34.",
      "Podrás contradecir esta declaración si las circunstancias cambian."
    ]
  },
  choices,
  outcomes,
  seedsRead: ["SEED_AGE26_PRIORITY"],
  seedsWrite: ["SEED_AGE30_PRIORITY"],
  npcRefs: [],
  tags: ["hard_deadline", "age30_priority", "pasada5_close", "t5_21", "staged_candidate"],
  presentation: {
    layoutHint: "decision",
    preloadPriority: "high",
    assets: [{ id: "hero_evt_29_fin_001", type: "image", role: "hero", fallbackId: "generic_legacy" }]
  },
  canonStatus: "verified"
};

/**
 * Semantic replacement candidate for the active four-choice placeholder.
 * The canonical seed origin already points at EVT_29_FIN_001; only active content
 * identity/replacement migration remains integration-owned.
 */
export const T521_STAGED_FIN29_PRINCIPAL_EVENTS: EventDefinition[] = [FIN29];
