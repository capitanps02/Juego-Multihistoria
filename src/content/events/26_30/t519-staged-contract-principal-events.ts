import type { EventDefinition } from "../../../core/types.js";
import type { CareerOfferKind, OfferDisposition } from "../../../simulation/offers.js";
import type { EventWithOfferBridge } from "../../../narrative/offer-bridge.js";
import { ambiguousEvent, n, seedCreate } from "../18_20/helpers.js";

function formalOfferEvent(
  event: EventDefinition,
  offerKinds: CareerOfferKind[],
  choiceActions: Record<string, OfferDisposition>
): EventWithOfferBridge {
  return Object.assign(event, { offerBridge: { offerKinds, choiceActions } });
}

const CONTRACT_CLAUSE = formalOfferEvent(ambiguousEvent({
  id: "EVT_27_CON_001",
  ageWindow: [27, 27],
  phase: "26_30",
  family: "contract",
  title: "La cláusula que sí puede pagarse",
  body: "Una renovación formal propone una cláusula alta pero realista para unos pocos compradores. Por primera vez, la cifra puede funcionar como una salida sin depender de que el club quiera negociar ese día.",
  visible: [
    "La CareerOffer pendiente contiene la cifra exacta de la cláusula, el salario y la duración ofrecidos.",
    "Conoces tu mercado actual, pero ninguna estimación obliga a que aparezca un comprador cuando quieras salir."
  ],
  uncertain: [
    "No sabes si los clubes que hoy podrían pagar la cláusula seguirán interesados o tendrán margen cuando llegue el momento.",
    "Tampoco sabes si el club aceptaría menor salario, ausencia de cláusula o una ventana temporal: esas alternativas todavía no son ofertas."
  ],
  choices: [
    {
      id: "ACCEPT_CLAUSE",
      label: "Aceptar la cláusula",
      intentTags: ["renewal", "accept", "release_clause"],
      primaryMessage: "Aceptas exactamente la renovación formal disponible, incluida la cláusula que figura en la CareerOffer.",
      secondaryMessage: "La puerta contractual queda clara, aunque su utilidad futura dependerá de que exista un comprador real dispuesto a usarla.",
      primaryEffects: [n("professional.environmentStability", 3), n("professional.careerControl", 1)],
      secondaryEffects: [n("professional.environmentStability", 2)],
      primarySeedTransitions: [seedCreate("SEED_CONTRACT_CEILING", 74, { stance: "accept_payable_clause", signed: true })],
      secondarySeedTransitions: [seedCreate("SEED_CONTRACT_CEILING", 76, { stance: "accept_payable_clause", signed: true })]
    },
    {
      id: "COUNTER_LOWER_CLAUSE",
      label: "Pedir una cifra menor y renunciar a salario",
      intentTags: ["renewal", "counter", "lower_clause"],
      primaryMessage: "Propones rebajar la cláusula a cambio de salario. La oferta actual se cierra como contraoferta: ni salario ni cláusula cambian hasta que exista otra CareerOffer formal.",
      secondaryMessage: "Priorizas una salida más ejecutable, pero el club puede considerar que ya cedió suficiente en la propuesta original.",
      primaryEffects: [n("professional.careerControl", 4), n("professional.contractPower", 2)],
      secondaryEffects: [n("professional.institutionalTrust", -1)],
      primarySeedTransitions: [seedCreate("SEED_CONTRACT_CEILING", 80, { stance: "counter_lower_clause_for_salary", signed: false })],
      secondarySeedTransitions: [seedCreate("SEED_CONTRACT_CEILING", 78, { stance: "counter_lower_clause_for_salary", signed: false })]
    },
    {
      id: "COUNTER_NO_CLAUSE",
      label: "Preferir no tener cláusula y negociar",
      intentTags: ["renewal", "counter", "no_clause"],
      primaryMessage: "Pides eliminar la cláusula y negociar una futura salida caso por caso. No se borra la cláusula de tu contrato actual ni se firma la renovación pendiente.",
      secondaryMessage: "Evitas convertir una cifra en destino automático, pero dependes más de la voluntad negociadora futura del club.",
      primaryEffects: [n("professional.careerControl", 3), n("professional.contractPower", 3)],
      secondaryEffects: [n("professional.environmentStability", -1)],
      primarySeedTransitions: [seedCreate("SEED_CONTRACT_CEILING", 72, { stance: "counter_no_clause", signed: false })],
      secondarySeedTransitions: [seedCreate("SEED_CONTRACT_CEILING", 75, { stance: "counter_no_clause", signed: false })]
    },
    {
      id: "COUNTER_WINDOW",
      label: "Añadir ventana temporal de activación",
      intentTags: ["renewal", "counter", "activation_window"],
      primaryMessage: "Pides que la cláusula solo pueda activarse en una ventana definida. El motor no inventa esa condición: queda como petición hasta una nueva CareerOffer que pueda representarla formalmente.",
      secondaryMessage: "Intentas proteger el timing deportivo, pero añades complejidad a una renovación que ya tenía términos concretos.",
      primaryEffects: [n("professional.careerControl", 4), n("professional.contractPower", 2)],
      secondaryEffects: [n("professional.institutionalTrust", -1)],
      primarySeedTransitions: [seedCreate("SEED_CONTRACT_CEILING", 77, { stance: "counter_activation_window", signed: false, requestedWindow: true })],
      secondarySeedTransitions: [seedCreate("SEED_CONTRACT_CEILING", 79, { stance: "counter_activation_window", signed: false, requestedWindow: true })]
    }
  ],
  gates: [
    { path: "professional.contractPower", op: "gte", value: 65 },
    { path: "facts.pendingCareerOfferKind", op: "eq", value: "renewal" },
    { path: "facts.pendingCareerOffer.terms.releaseClause", op: "gte", value: 1 }
  ],
  weight: 20,
  cooldown: 99999,
  seedsRead: ["SEED_CONTRACT_CEILING"],
  seedsWrite: ["SEED_CONTRACT_CEILING"],
  npcRefs: [],
  tags: ["contract", "formal_renewal", "release_clause", "t5_19", "staged_candidate"],
  canonStatus: "verified"
}), ["renewal"], {
  ACCEPT_CLAUSE: "accept",
  COUNTER_LOWER_CLAUSE: "counter",
  COUNTER_NO_CLAUSE: "counter",
  COUNTER_WINDOW: "counter"
});

/** Candidate only; active catalog/content lineage remains integrator-owned. */
export const T519_STAGED_CONTRACT_PRINCIPAL_EVENTS_27: EventDefinition[] = [CONTRACT_CLAUSE];
