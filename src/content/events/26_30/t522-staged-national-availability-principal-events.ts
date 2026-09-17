import type { EventDefinition } from "../../../core/types.js";
import { ambiguousEvent, seedCreate } from "../18_20/helpers.js";

const NATIONAL_AVAILABILITY_29 = ambiguousEvent({
  id: "EVT_29_NAT_002",
  ageWindow: [29, 29],
  phase: "26_30",
  family: "selection",
  title: "¿Seguir con la selección a cualquier precio?",
  body: "Después de varias temporadas dentro del entorno de la absoluta, el descanso empieza a competir con las ventanas internacionales. Tu entorno plantea definir una política de disponibilidad antes de que una decisión aislada termine pareciendo una regla que nunca elegiste.",
  visible: [
    "Tu historial internacional agregado y la carga internacional previa son hechos persistidos.",
    "La decisión define una postura futura; no crea ni cancela una convocatoria concreta."
  ],
  uncertain: [
    "No sabes si el seleccionador aceptaría flexibilidad ni si reducir disponibilidad permitiría que otro jugador consolidase tu sitio.",
    "Tampoco sabes qué futuras ventanas coincidirán con partidos o momentos decisivos del club."
  ],
  choices: [
    {
      id: "ALWAYS_AVAILABLE",
      label: "Seguir disponible siempre",
      intentTags: ["national_availability", "always_available"],
      primaryMessage: "Mantienes disponibilidad total como principio. La postura no garantiza futuras convocatorias ni minutos.",
      secondaryMessage: "La continuidad protege la señal de compromiso, aunque conserva el conflicto de carga que abrió el debate.",
      primarySeedTransitions: [seedCreate("SEED_NATIONAL_AVAILABILITY_30", 66, { policy: "always_available", advisory: true })],
      secondarySeedTransitions: [seedCreate("SEED_NATIONAL_AVAILABILITY_30", 70, { policy: "always_available", advisory: true })]
    },
    {
      id: "MANAGE_FRIENDLIES",
      label: "Pedir gestión de amistosos y concentraciones",
      intentTags: ["national_availability", "manage_friendlies", "load_management"],
      primaryMessage: "Pides gestionar las ventanas de menor valor competitivo sin convertir la petición en una retirada parcial automática.",
      secondaryMessage: "La petición deja clara tu prioridad de carga, pero la selección no queda obligada a aceptar cada excepción futura.",
      primarySeedTransitions: [seedCreate("SEED_NATIONAL_AVAILABILITY_30", 72, { policy: "manage_friendlies", advisory: true })],
      secondarySeedTransitions: [seedCreate("SEED_NATIONAL_AVAILABILITY_30", 76, { policy: "manage_friendlies", advisory: true })]
    },
    {
      id: "OFFICIAL_PRIORITY",
      label: "Comunicar que priorizarás torneos y partidos oficiales",
      intentTags: ["national_availability", "official_priority", "selective_load"],
      primaryMessage: "Comunicas que quieres priorizar competición oficial. Es una política declarada, no una baja automática de futuras listas.",
      secondaryMessage: "La frontera es comprensible, aunque puede cambiar cómo el cuerpo técnico planifica continuidad y jerarquías.",
      primarySeedTransitions: [seedCreate("SEED_NATIONAL_AVAILABILITY_30", 74, { policy: "official_priority", advisory: true })],
      secondarySeedTransitions: [seedCreate("SEED_NATIONAL_AVAILABILITY_30", 78, { policy: "official_priority", advisory: true })]
    },
    {
      id: "WINDOW_BY_WINDOW",
      label: "No fijar una política general y decidir ventana a ventana",
      intentTags: ["national_availability", "window_by_window", "optionality"],
      primaryMessage: "Conservas flexibilidad para decidir con el contexto real de cada ventana, sin prometer disponibilidad ni ausencia por adelantado.",
      secondaryMessage: "La opcionalidad evita una regla rígida, pero obliga a renegociar expectativas cada vez que el calendario vuelva a apretar.",
      primarySeedTransitions: [seedCreate("SEED_NATIONAL_AVAILABILITY_30", 64, { policy: "window_by_window", advisory: true })],
      secondarySeedTransitions: [seedCreate("SEED_NATIONAL_AVAILABILITY_30", 68, { policy: "window_by_window", advisory: true })]
    }
  ],
  gates: [
    { path: "professional.nationalCaps", op: "gte", value: 6 },
    { path: "professional.nationalStanding", op: "gte", value: 52 },
    { path: "flags.HAS_SEED_INTERNATIONAL_LOAD", op: "eq", value: true }
  ],
  exclusions: [{ path: "flags.NATIONAL_RETIRED", op: "eq", value: true }],
  weight: 18,
  cooldown: 99999,
  seedsRead: ["SEED_INTERNATIONAL_LOAD"],
  seedsWrite: ["SEED_NATIONAL_AVAILABILITY_30"],
  npcRefs: [],
  tags: ["selection", "availability_policy", "load_management", "t5_22", "staged_candidate", "blocked_seed_catalog"],
  canonStatus: "verified"
});

/**
 * Gate-complete against aggregate national-team authority. The canonical output seed is
 * not yet registered globally, so activation/resolution remains integration-owned.
 */
export const T522_STAGED_NATIONAL_AVAILABILITY_EVENTS_29: EventDefinition[] = [NATIONAL_AVAILABILITY_29];
