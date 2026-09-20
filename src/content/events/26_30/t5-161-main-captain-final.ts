import type { EventDefinition } from "../../../core/types.js";

/**
 * #161 canonical closure.
 *
 * The audited canon had factual captaincy consumers but no explicit main-club
 * captain producer. This scene never infers the role from reputation, locker
 * power, age, seeds, relationships, npcRefs or a future promise.
 */
export const T5_161_MAIN_CAPTAIN_APPOINTMENT: EventDefinition = {
  id: "EVT_29_CAP_001",
  ageWindow: [29, 29],
  phase: "26_30",
  family: "captaincy",
  gates: [{ path: "facts.employmentStatus", op: "eq", value: "contracted" }],
  cooldown: 99999,
  repeatable: false,
  weight: 12,
  timeWindow: { months: [7, 8, 9, 10] },
  text: {
    title: "El brazalete principal",
    body: "El club te comunica formalmente que quiere nombrarte capitán principal del primer equipo desde este momento. No es una promesa futura, una entrada en el grupo de capitanes ni una votación pendiente: la decisión solo se convierte en tu capitanía si aceptas el cargo."
  },
  intel: {
    visible: [
      "El club identifica explícitamente el cargo como capitán principal del primer equipo.",
      "Conoces las responsabilidades institucionales y deportivas asociadas antes de decidir."
    ],
    uncertain: [
      "No sabes cuánto durará el cargo ni cómo cambiará tu autoridad si cambia el entrenador o el club.",
      "Aceptar el brazalete no garantiza minutos, contrato futuro ni poder sobre decisiones deportivas."
    ]
  },
  choices: [
    {
      id: "ACCEPT_MAIN_CAPTAIN",
      label: "Aceptar ser capitán principal",
      intentTags: ["captaincy", "main_captain", "accept_formal_appointment"],
      outcomeIds: ["ACCEPT_MAIN_CAPTAIN_OUT"]
    },
    {
      id: "DECLINE_MAIN_CAPTAIN",
      label: "Rechazar el cargo y seguir centrado en jugar",
      intentTags: ["captaincy", "decline_formal_appointment"],
      outcomeIds: ["DECLINE_MAIN_CAPTAIN_OUT"]
    },
    {
      id: "DEFER_MAIN_CAPTAIN",
      label: "Pedir tiempo antes de aceptar el nombramiento",
      intentTags: ["captaincy", "defer_formal_appointment"],
      outcomeIds: ["DEFER_MAIN_CAPTAIN_OUT"]
    }
  ],
  outcomes: [
    {
      id: "ACCEPT_MAIN_CAPTAIN_OUT",
      baseWeight: 1,
      effects: [],
      messages: ["Aceptas el nombramiento formal y, desde hoy, eres el capitán principal de tu club."]
    },
    {
      id: "DECLINE_MAIN_CAPTAIN_OUT",
      baseWeight: 1,
      effects: [],
      messages: ["Rechazas el nombramiento. El club deberá resolver la capitanía sin convertir tu decisión en una aceptación implícita."]
    },
    {
      id: "DEFER_MAIN_CAPTAIN_OUT",
      baseWeight: 1,
      effects: [],
      messages: ["No aceptas todavía. El nombramiento queda sin certificar hasta que exista una decisión factual posterior."]
    }
  ],
  npcRefs: [],
  tags: ["t5_161_canon_closure", "explicit_main_club_captain_appointment"],
  canonStatus: "verified"
};
