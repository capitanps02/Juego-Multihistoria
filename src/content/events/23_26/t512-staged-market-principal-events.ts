import type { EventDefinition } from "../../../core/types.js";
import { ambiguousEvent, n } from "../18_20/helpers.js";

const DIRECT_RECRUIT = ambiguousEvent({
  id: "EVT_25_MKT_001",
  ageWindow: [25, 25],
  phase: "23_26",
  family: "market",
  title: "El entrenador te llama directamente",
  body: "Un entrenador prestigioso te explica personalmente cómo te usaría. Habla de posición, responsabilidades y encaje, pero no existe una oferta formal y su propio puesto depende de una decisión interna del club.",
  visible: [
    "Conoces el plan táctico que te describe y la situación pública del entrenador.",
    "La llamada es interés concreto, no una CareerOffer."
  ],
  uncertain: [
    "No sabes si el entrenador seguirá cuando cierre el mercado ni si la dirección comparte su prioridad por ficharte."
  ],
  choices: [
    {
      id: "GREENLIGHT",
      label: "Dar luz verde para negociar ya",
      intentTags: ["direct_recruit", "open_negotiation"],
      primaryMessage: "Autorizas que el interés pase a una negociación formal si el club decide materializarlo. La llamada sigue sin ser una oferta.",
      secondaryMessage: "El entrenador interpreta tu apertura como respaldo, pero la dirección todavía puede no convertir ese interés en propuesta.",
      primaryEffects: [n("reputation.marketHeat", 3), n("professional.careerControl", 1)],
      secondaryEffects: [n("reputation.marketHeat", 2), n("professional.environmentStability", -1)]
    },
    {
      id: "WAIT_COACH",
      label: "Esperar a que el entrenador renueve o sea confirmado",
      intentTags: ["direct_recruit", "wait_authority"],
      primaryMessage: "Separás el atractivo del plan de la autoridad real para ejecutarlo. Mantienes el contacto sin tratarlo como una operación cerrada.",
      secondaryMessage: "La prudencia evita comprometerte con una estructura inestable, aunque el interés puede enfriarse antes de que llegue una confirmación.",
      primaryEffects: [n("professional.careerControl", 3), n("reputation.marketHeat", -1)],
      secondaryEffects: [n("professional.careerControl", 1), n("reputation.marketHeat", -2)]
    },
    {
      id: "CONFIRM_DIRECTOR",
      label: "Pedir que el director deportivo confirme el plan por separado",
      intentTags: ["direct_recruit", "institutional_confirmation"],
      primaryMessage: "Pides una segunda fuente institucional antes de avanzar. El objetivo es distinguir el deseo del entrenador de una prioridad real del club.",
      secondaryMessage: "La petición de confirmación descubre que la operación tiene más actores y condiciones de las que sugería la llamada inicial.",
      primaryEffects: [n("professional.careerControl", 4), n("professional.institutionalPower", 1)],
      secondaryEffects: [n("professional.careerControl", 2), n("reputation.marketHeat", 1)]
    },
    {
      id: "WRITTEN_OFFER_ONLY",
      label: "No avanzar sin oferta escrita",
      intentTags: ["direct_recruit", "formal_offer_boundary"],
      primaryMessage: "Agradeces el plan, pero no conviertes una llamada en compromiso. Si el club quiere avanzar, tendrá que generar una oferta formal por la autoridad de mercado.",
      secondaryMessage: "El límite protege tus condiciones actuales, aunque reduce el valor negociador inmediato de una conversación que todavía no obliga a nadie.",
      primaryEffects: [n("professional.careerControl", 4), n("reputation.marketHeat", -1)],
      secondaryEffects: [n("professional.careerControl", 2), n("professional.environmentStability", 1)]
    }
  ],
  gates: [
    { path: "flags.HAS_SEED_DIRECT_RECRUIT", op: "eq", value: true },
    { path: "reputation.marketHeat", op: "gte", value: 45 }
  ],
  timeWindow: { months: [7, 8, 1] },
  weight: 18,
  cooldown: 99999,
  seedsRead: ["SEED_DIRECT_RECRUIT"],
  seedsWrite: [],
  tags: ["market", "direct_recruit", "interest_not_offer", "t5_12", "staged_candidate"],
  canonStatus: "verified"
});

/** Candidate only; activating the exact-ID semantic collision is an integration/lineage action. */
export const T512_STAGED_MARKET_PRINCIPAL_EVENTS_25: EventDefinition[] = [DIRECT_RECRUIT];
