import type { EventDefinition } from "../../../core/types.js";
import { ambiguousEvent, n, seedCreate } from "../18_20/helpers.js";

const seed = (seedId: string, choice: string, approach: string) => [
  seedCreate(seedId, 60, { choice, approach })
];

const ROLE_COMMUNICATION = ambiguousEvent({
  id: "EVT_30_CCH_001",
  ageWindow: [30, 30],
  phase: "30_34",
  family: "captaincy",
  title: "Te enteras por la pizarra",
  body: "Después de años de jerarquía, descubres una rotación importante al ver el once en la charla. No hubo conversación previa.",
  visible: [
    "Ves el once oficial y recibes una explicación táctica breve."
  ],
  uncertain: [
    "No sabes si fue olvido, una decisión deliberada para evitar presión o una nueva política del técnico."
  ],
  gates: [
    { path: "facts.playerClubLeadership.currentRole", op: "eq", value: "captain" }
  ],
  seedsWrite: ["SEED_ROLE_COMMUNICATION"],
  choices: [
    {
      id: "A",
      label: "Hablar con el entrenador después del partido",
      intentTags: ["role_communication", "direct_private"],
      primaryMessage: "Separáis la decisión deportiva de la forma en que se comunicó y acordáis un canal más claro.",
      secondaryMessage: "La conversación aclara posiciones, pero el entrenador interpreta la petición como presión sobre su autonomía.",
      primaryEffects: [n("professional.careerControl", 3), n("professional.institutionalTrust", 2)],
      secondaryEffects: [n("professional.careerControl", 1), n("professional.institutionalTrust", -2)],
      primarySeedTransitions: seed("SEED_ROLE_COMMUNICATION", "A", "direct_after_match"),
      secondarySeedTransitions: seed("SEED_ROLE_COMMUNICATION", "A", "direct_after_match")
    },
    {
      id: "B",
      label: "Preguntar antes de salir al calentamiento",
      intentTags: ["role_communication", "immediate_clarity"],
      primaryMessage: "Obtienes una explicación inmediata y sales a calentar sabiendo qué espera el técnico.",
      secondaryMessage: "La urgencia de la pregunta se lee como una discusión de jerarquía en un momento poco adecuado.",
      primaryEffects: [n("professional.careerControl", 2)],
      secondaryEffects: [n("professional.institutionalTrust", -2)],
      primarySeedTransitions: seed("SEED_ROLE_COMMUNICATION", "B", "ask_before_warmup"),
      secondarySeedTransitions: seed("SEED_ROLE_COMMUNICATION", "B", "ask_before_warmup")
    },
    {
      id: "C",
      label: "No decir nada y responder en el campo cuando toque",
      intentTags: ["role_communication", "silent_response"],
      primaryMessage: "No conviertes la suplencia en un conflicto y mantienes el foco competitivo.",
      secondaryMessage: "El silencio evita fricción hoy, pero deja intacto el problema de enterarte de cambios importantes sin conversación previa.",
      primaryEffects: [n("professional.motivationReserve", 2)],
      secondaryEffects: [n("professional.careerControl", -2)],
      primarySeedTransitions: seed("SEED_ROLE_COMMUNICATION", "C", "silent_response"),
      secondarySeedTransitions: seed("SEED_ROLE_COMMUNICATION", "C", "silent_response")
    },
    {
      id: "D",
      label: "Pedir a un líder del vestuario que aclare el criterio general",
      intentTags: ["role_communication", "locker_process"],
      primaryMessage: "La cuestión se convierte en una regla general de comunicación para el vestuario y no solo en tu queja.",
      secondaryMessage: "Involucrar al vestuario puede parecer una maniobra de poder aunque el problema de proceso sea real.",
      primaryEffects: [n("professional.lockerPower", 3), n("professional.careerControl", 1)],
      secondaryEffects: [n("professional.institutionalTrust", -2), n("professional.lockerPower", 1)],
      primarySeedTransitions: seed("SEED_ROLE_COMMUNICATION", "D", "locker_process"),
      secondarySeedTransitions: seed("SEED_ROLE_COMMUNICATION", "D", "locker_process")
    }
  ],
  tags: [
    "t51_canonical_missing_addition",
    "t51_captain_route_authoritative",
    "t51_status_inertia_route_pending_canon_threshold"
  ],
  canonStatus: "technical_adaptation"
});

export const CANONICAL_ADDITIONS_30_34: EventDefinition[] = [
  ROLE_COMMUNICATION
];
