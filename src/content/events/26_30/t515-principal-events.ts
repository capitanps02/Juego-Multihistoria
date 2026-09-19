import type { EventDefinition } from "../../../core/types.js";
import { ambiguousEvent, n, seedCreate } from "../18_20/helpers.js";

const roleSecurityHigh = [{
  id: "ROLE_SECURITY_HIGH",
  conditions: [{ path: "professional.roleSecurity", op: "gte" as const, value: 60 }],
  multiply: 1.16,
  reason: "Un rol previo fuerte hace más probable que la reunión produzca una definición deportiva concreta."
}];

const contractPowerHigh = [{
  id: "CONTRACT_POWER_HIGH",
  conditions: [{ path: "professional.contractPower", op: "gte" as const, value: 60 }],
  multiply: 1.16,
  reason: "El poder contractual previo mejora la capacidad de convertir el marco económico en información útil."
}];

const institutionalPowerHigh = [{
  id: "INSTITUTIONAL_POWER_HIGH",
  conditions: [{ path: "professional.institutionalPower", op: "gte" as const, value: 55 }],
  multiply: 1.15,
  reason: "El peso institucional acumulado aumenta la probabilidad de recibir una respuesta franca sobre la sucesión."
}];

const marketHeatHigh = [{
  id: "MARKET_HEAT_HIGH",
  conditions: [{ path: "reputation.marketHeat", op: "gte" as const, value: 60 }],
  multiply: 1.15,
  reason: "Un mercado ya activo hace más creíble que guardar silencio funcione como palanca en lugar de desconexión."
}];

const PEAK_IDENTITY_BRIDGE = ambiguousEvent({
  id: "EVT_26_BRIDGE_001",
  ageWindow: [26, 26],
  phase: "26_30",
  family: "contract",
  title: "Ya no te pagan por potencial",
  body: "El director deportivo te enseña una presentación interna con objetivos, minutos esperados, valor de mercado y coste salarial. Por primera vez el club te compara abiertamente con futbolistas más jóvenes y más baratos.",
  visible: [
    "Conoces tu contrato actual, el rol de la temporada anterior, los objetivos del club y la comparación económica general.",
    "La presentación trata tu rendimiento y tu coste como partes de una misma decisión de plantilla."
  ],
  uncertain: [
    "No sabes cuánto de la comparación es presión negociadora y cuánto responde a un plan real de sucesión.",
    "Tampoco sabes si dirección deportiva y entrenador comparten exactamente la misma lectura de tu futuro."
  ],
  choices: [
    {
      id: "ROLE_NOT_PRICE",
      label: "Pedir que definan tu rol, no tu precio",
      intentTags: ["role_clarity", "sporting_identity"],
      primaryMessage: "La conversación sale del coste y entra en minutos, jerarquía y uso deportivo. Obtienes una definición más concreta de lo que esperan de ti.",
      secondaryMessage: "Al pedir una definición descubres que dirección y cuerpo técnico no usan exactamente el mismo lenguaje sobre tu rol. Tienes más información, pero menos certeza.",
      primaryEffects: [n("professional.careerControl", 4), n("professional.roleSecurity", 3), n("professional.institutionalTrust", 1)],
      secondaryEffects: [n("professional.careerControl", 2), n("professional.roleSecurity", -3), n("professional.institutionalTrust", -1)],
      primarySeedTransitions: [seedCreate("SEED_PEAK_IDENTITY", 62, { stance: "role_not_price", reading: "role_defined" })],
      secondarySeedTransitions: [seedCreate("SEED_PEAK_IDENTITY", 68, { stance: "role_not_price", reading: "internal_disagreement" })],
      primaryModifiers: roleSecurityHigh
    },
    {
      id: "NEGOTIATE_MONEY",
      label: "Aceptar el marco y negociar dinero",
      intentTags: ["contract_power", "economic_value"],
      primaryMessage: "Aceptas que el club piense en coste y valor y utilizas ese mismo lenguaje para reforzar tu posición económica sin convertir la charla en una firma.",
      secondaryMessage: "La dirección entra en la discusión salarial, pero evita comprometer el rol. Ganas palanca económica a costa de dejar abierta la pregunta deportiva.",
      primaryEffects: [n("professional.contractPower", 4), n("professional.moneyComfort", 2), n("professional.careerControl", 1)],
      secondaryEffects: [n("professional.contractPower", 2), n("professional.roleSecurity", -2), n("professional.careerControl", -1)],
      primarySeedTransitions: [seedCreate("SEED_PEAK_IDENTITY", 60, { stance: "negotiate_money", reading: "economic_leverage" })],
      secondarySeedTransitions: [seedCreate("SEED_PEAK_IDENTITY", 66, { stance: "negotiate_money", reading: "role_left_open" })],
      primaryModifiers: contractPowerHigh
    },
    {
      id: "ASK_SIGNINGS",
      label: "Preguntar por fichajes previstos en tu posición",
      intentTags: ["succession_intel", "squad_planning"],
      primaryMessage: "La pregunta obliga a hablar de plantilla futura. Recibes información concreta sobre perfiles y competencia sin que eso garantice quién acabará llegando.",
      secondaryMessage: "La dirección confirma que estudia alternativas, pero no aclara si son competencia, cobertura o una futura sucesión. La incertidumbre cambia de forma, no desaparece.",
      primaryEffects: [n("professional.careerControl", 4), n("professional.institutionalPower", 2), n("professional.roleSecurity", -1)],
      secondaryEffects: [n("professional.careerControl", 2), n("professional.roleSecurity", -4), n("reputation.marketHeat", 2)],
      primarySeedTransitions: [seedCreate("SEED_PEAK_IDENTITY", 64, { stance: "ask_signings", reading: "succession_intel" })],
      secondarySeedTransitions: [seedCreate("SEED_PEAK_IDENTITY", 70, { stance: "ask_signings", reading: "succession_ambiguous" })],
      primaryModifiers: institutionalPowerHigh
    },
    {
      id: "LET_MARKET_SPEAK",
      label: "No reaccionar y dejar que el mercado hable",
      intentTags: ["silence", "market_leverage"],
      primaryMessage: "No conviertes la presentación en un pulso. El club lee tu silencio como seguridad y sabe que tu valor también puede expresarse fuera de esa sala.",
      secondaryMessage: "Guardas margen, pero la falta de respuesta permite que otros definan el relato interno durante unas semanas. El silencio también tiene coste.",
      primaryEffects: [n("reputation.marketHeat", 4), n("professional.careerControl", 2), n("professional.institutionalTrust", 1)],
      secondaryEffects: [n("reputation.marketHeat", 2), n("professional.careerControl", -2), n("professional.roleSecurity", -3)],
      primarySeedTransitions: [seedCreate("SEED_PEAK_IDENTITY", 58, { stance: "let_market_speak", reading: "silence_as_confidence" })],
      secondarySeedTransitions: [seedCreate("SEED_PEAK_IDENTITY", 65, { stance: "let_market_speak", reading: "silence_as_distance" })],
      primaryModifiers: marketHeatHigh
    }
  ],
  timeWindow: { months: [7, 8] },
  weight: 100,
  cooldown: 99999,
  seedsRead: ["SEED_STAR_COMPETITION"],
  seedsWrite: ["SEED_PEAK_IDENTITY"],
  tags: ["peak_identity", "succession", "adult_peak", "mandatory_transition", "t5_15", "staged_candidate"],
  canonStatus: "verified"
});

/**
 * Candidate only. It intentionally remains outside EVENTS_26_30 until the
 * integration owner lands the adjacent content generation and reconciles the
 * new canonical seed origin without rewriting old SeedInstance.originEvent.
 */
export const T515_STAGED_PRINCIPAL_EVENTS_26: EventDefinition[] = [PEAK_IDENTITY_BRIDGE];
