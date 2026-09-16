import type { EventDefinition } from "../../../core/types.js";
import { ambiguousEvent, n } from "../18_20/helpers.js";

const PRESS = ambiguousEvent({
  id: "EVT_23_PRS_001",
  ageWindow: [23, 23],
  phase: "23_26",
  family: "press",
  title: "Decisión técnica",
  body: "Tras varias suplencias, el club comunica que sigues disponible y que la ausencia responde a una decisión técnica. Tu agente propone filtrar a prensa que, según su versión, al llegar se habló de un volumen de minutos que ahora no se está cumpliendo.",
  visible: [
    "Conoces tus minutos reales, las declaraciones oficiales y lo que figura en tu contrato; no existe una garantía contractual de minutos."
  ],
  uncertain: [
    "No sabes si el entrenador planea recuperarte ni si la dirección comparte su criterio; tampoco puedes demostrar que la conversación que recuerda tu agente fuera una promesa vinculante."
  ],
  choices: [
    {
      id: "A",
      label: "Autorizar la filtración",
      intentTags: ["media_pressure", "agent_leverage"],
      primaryMessage: "Autorizas a tu agente a trasladar a prensa su versión de la conversación sobre minutos. La presión aumenta y el club pide hablar internamente, sin que la filtración convierta esa versión en una obligación contractual.",
      secondaryMessage: "La filtración gana volumen y el cuerpo técnico la interpreta como un intento de condicionar una decisión deportiva. El relato se endurece, pero la supuesta promesa sigue sin ser un hecho contractual demostrado.",
      primaryEffects: [n("reputation.mediaHeat", 6), n("professional.careerControl", 2), n("professional.institutionalTrust", -3), n("professional.agentControl", -2)],
      secondaryEffects: [n("reputation.mediaHeat", 9), n("professional.institutionalTrust", -6), n("professional.roleSecurity", -3), n("professional.agentControl", -3)]
    },
    {
      id: "B",
      label: "Pedir una reunión interna primero",
      intentTags: ["internal_process", "role_clarity"],
      primaryMessage: "Antes de mover el relato fuera, pides una reunión con club y cuerpo técnico. Obtienes una explicación más concreta del descenso de rol sin fabricar garantías que el contrato no contiene.",
      secondaryMessage: "La reunión revela que dirección y entrenador no describen tu situación exactamente igual. Ganas información, aunque no una promesa de minutos ni una solución inmediata.",
      primaryEffects: [n("professional.careerControl", 4), n("professional.institutionalTrust", 3), n("reputation.mediaHeat", -1)],
      secondaryEffects: [n("professional.careerControl", 3), n("professional.institutionalTrust", -1), n("professional.roleSecurity", -2)]
    },
    {
      id: "C",
      label: "Declarar públicamente que competirás sin entrar en detalles",
      intentTags: ["public_composure", "competition"],
      primaryMessage: "Dices que competirás por recuperar sitio y evitas confirmar versiones privadas. El mensaje reduce el espacio para una guerra de relatos y mantiene abierta la relación con el técnico.",
      secondaryMessage: "La declaración se interpreta como disciplina pública, pero no cambia por sí sola la jerarquía deportiva. Sigues necesitando recuperar minutos en el campo.",
      primaryEffects: [n("professional.institutionalTrust", 2), n("professional.careerControl", 2), n("reputation.mediaHeat", 1), n("professional.publicMyth", 1)],
      secondaryEffects: [n("professional.careerControl", 1), n("reputation.mediaHeat", 3), n("professional.roleSecurity", -1)]
    },
    {
      id: "D",
      label: "Guardar silencio y esperar tres partidos",
      intentTags: ["patience", "private_response"],
      primaryMessage: "No alimentas el conflicto y te das un margen corto para comprobar si la rotación cambia. El ruido baja, aunque sacrificas capacidad de presionar ahora.",
      secondaryMessage: "Los tres partidos no devuelven automáticamente el sitio. El silencio evita una escalada pública, pero si la tendencia continúa llegas más tarde a la siguiente decisión.",
      primaryEffects: [n("reputation.mediaHeat", -3), n("professional.environmentStability", 3), n("professional.careerControl", -1)],
      secondaryEffects: [n("reputation.mediaHeat", -2), n("professional.roleSecurity", -2), n("reputation.marketHeat", -2), n("professional.careerControl", -2)]
    }
  ],
  gates: [
    { path: "sport.roleScore", op: "lte", value: 48 },
    { path: "professional.roleSecurity", op: "lte", value: 55 },
    { path: "flags.HAS_SEED_ELITE_ROLE_BARGAIN", op: "eq", value: true }
  ],
  timeWindow: { months: [10, 11, 12, 1, 2] },
  weight: 20,
  cooldown: 99999,
  seedsRead: ["SEED_FIRST_LEAK", "SEED_ELITE_ROLE_BARGAIN"],
  tags: ["press", "role_crisis", "adult_consolidation", "t5_11_prs"],
  canonStatus: "verified"
});

export const T511_PRS_PRINCIPAL_EVENTS_23: EventDefinition[] = [PRESS];
