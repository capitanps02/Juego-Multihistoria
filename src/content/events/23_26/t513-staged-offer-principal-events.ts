import type { EventDefinition } from "../../../core/types.js";
import type { CareerOfferKind, OfferDisposition } from "../../../simulation/offers.js";
import type { EventWithOfferBridge } from "../../../narrative/offer-bridge.js";
import { ambiguousEvent, n, seedCreate } from "../18_20/helpers.js";

function formalOfferEvent(
  event: EventDefinition,
  offerKinds: CareerOfferKind[],
  choiceActions: Record<string, OfferDisposition>
): EventWithOfferBridge {
  if (offerKinds.length !== 1) {
    throw new Error(`A6 formal offer event ${event.id} must declare exactly one CareerOffer kind`);
  }
  const [offerKind] = offerKinds;
  return Object.assign(
    {
      ...event,
      gates: [
        ...(event.gates ?? []),
        { path: "facts.pendingCareerOfferKind", op: "eq", value: offerKind }
      ]
    },
    { offerBridge: { choiceActions } }
  );
}

const MKT23 = formalOfferEvent(ambiguousEvent({
  id: "EVT_23_MKT_001",
  ageWindow: [23, 23],
  phase: "23_26",
  family: "market",
  title: "El club que te quiere para competir",
  body: "Hay una oferta formal de un club claramente superior. El contrato mejora la escala de tu carrera, pero nadie promete titularidad: te ofrecen una oportunidad real de competir por el puesto.",
  visible: [
    "La propuesta formal contiene club, salario, duración y condiciones registradas en la CareerOffer pendiente.",
    "La plantilla y las competiciones del destino son conocidas; no existe una garantía contractual de titularidad."
  ],
  uncertain: [
    "Tu agente cree que puede salir un jugador de tu posición, pero el club no lo confirma.",
    "No sabes si el entrenador seguirá estable ni cuánto cambiará el plan si ese competidor permanece."
  ],
  choices: [
    {
      id: "ACCEPT_JUMP",
      label: "Aceptar el salto",
      intentTags: ["formal_offer", "accept_competition"],
      primaryMessage: "Aceptas competir en una escala superior sin convertir una expectativa deportiva en una promesa inexistente.",
      secondaryMessage: "El salto abre techo deportivo, pero también te expone a una jerarquía que todavía no controlas.",
      primaryEffects: [n("professional.careerControl", 1), n("reputation.marketHeat", 2)],
      secondaryEffects: [n("professional.roleSecurity", -3), n("professional.environmentStability", -1)],
      primarySeedTransitions: [seedCreate("SEED_ELITE_ROLE_BARGAIN", 66, { stance: "accept_competition", guarantee: "none" })],
      secondarySeedTransitions: [seedCreate("SEED_ELITE_ROLE_BARGAIN", 70, { stance: "accept_competition", guarantee: "none" })]
    },
    {
      id: "REJECT_ROLE",
      label: "Rechazar y proteger un rol alto actual",
      intentTags: ["formal_offer", "protect_role"],
      primaryMessage: "Rechazas la propuesta y priorizas la jerarquía que ya has ganado. La oferta desaparece sin alterar tus condiciones actuales.",
      secondaryMessage: "Proteges minutos conocidos, aunque una oportunidad de mayor escala puede no repetirse pronto.",
      primaryEffects: [n("professional.roleSecurity", 3), n("professional.careerControl", 2)],
      secondaryEffects: [n("reputation.marketHeat", -2), n("professional.careerControl", 1)],
      primarySeedTransitions: [seedCreate("SEED_ELITE_ROLE_BARGAIN", 62, { stance: "reject_for_role", guarantee: "current_role" })],
      secondarySeedTransitions: [seedCreate("SEED_ELITE_ROLE_BARGAIN", 65, { stance: "reject_for_role", guarantee: "current_role" })]
    },
    {
      id: "COUNTER_EXIT",
      label: "Pedir cláusula de cesión o salida si no alcanzas ciertos minutos",
      intentTags: ["formal_offer", "counter", "role_protection"],
      primaryMessage: "Planteas una contraoferta sobre protección futura. No se añade ninguna cláusula por narrativa: la propuesta actual se cierra y cualquier condición nueva necesitará otra CareerOffer formal.",
      secondaryMessage: "El club entiende el riesgo que quieres limitar, pero no queda obligado a responder con una nueva propuesta.",
      primaryEffects: [n("professional.careerControl", 4), n("professional.contractPower", 2)],
      secondaryEffects: [n("professional.careerControl", 2), n("reputation.marketHeat", -1)],
      primarySeedTransitions: [seedCreate("SEED_ELITE_ROLE_BARGAIN", 72, { stance: "counter_exit_if_low_minutes", guarantee: "requested_not_signed" })],
      secondarySeedTransitions: [seedCreate("SEED_ELITE_ROLE_BARGAIN", 68, { stance: "counter_exit_if_low_minutes", guarantee: "requested_not_signed" })]
    },
    {
      id: "DEFER_COMPETITOR",
      label: "Esperar a que salga el competidor antes de firmar",
      intentTags: ["formal_offer", "defer", "squad_uncertainty"],
      primaryMessage: "Aplazas la firma para pedir una señal de plantilla. La CareerOffer actual se cierra sin aplicar términos.",
      secondaryMessage: "Esperar puede aclarar la jerarquía, pero el destino también puede cubrir su necesidad con otro jugador.",
      primaryEffects: [n("professional.careerControl", 3)],
      secondaryEffects: [n("reputation.marketHeat", -2), n("professional.careerControl", 1)],
      primarySeedTransitions: [seedCreate("SEED_ELITE_ROLE_BARGAIN", 64, { stance: "defer_for_competitor_exit", guarantee: "none" })],
      secondarySeedTransitions: [seedCreate("SEED_ELITE_ROLE_BARGAIN", 67, { stance: "defer_for_competitor_exit", guarantee: "none" })]
    }
  ],
  timeWindow: { months: [7, 8, 1] },
  weight: 20,
  cooldown: 99999,
  seedsRead: ["SEED_DEADLINE_DAY", "SEED_ELITE_ROLE_BARGAIN"],
  seedsWrite: ["SEED_ELITE_ROLE_BARGAIN"],
  tags: ["market", "formal_offer", "t5_13", "staged_candidate"],
  canonStatus: "verified"
}), ["transfer"], {
  ACCEPT_JUMP: "accept",
  REJECT_ROLE: "reject",
  COUNTER_EXIT: "counter",
  DEFER_COMPETITOR: "defer"
});

const CON23 = formalOfferEvent(ambiguousEvent({
  id: "EVT_23_CON_001",
  ageWindow: [23, 23],
  phase: "23_26",
  family: "contract",
  title: "Cuatro años y una puerta",
  body: "Tu club presenta una renovación formal: mejora fuerte, horizonte largo y una cláusula de salida alta. La propuesta existe de verdad; las alternativas que pidas todavía no.",
  visible: [
    "La CareerOffer pendiente fija club, salario, duración y cláusula de salida.",
    "La propuesta es del mismo club y tu contrato vigente sigue intacto hasta que aceptes."
  ],
  uncertain: [
    "No sabes si tu mercado crecerá tanto como espera tu entorno ni si el club aceptaría rebajar la cláusula o acortar la duración."
  ],
  choices: [
    {
      id: "SIGN_SECURITY",
      label: "Firmar por seguridad",
      intentTags: ["renewal", "security"],
      primaryMessage: "Aceptas exactamente la renovación formal que tienes delante; la firma la ejecuta la autoridad de CareerOffer.",
      secondaryMessage: "La seguridad contractual aumenta, aunque una salida futura puede resultar más cara o compleja.",
      primaryEffects: [n("professional.environmentStability", 3)],
      secondaryEffects: [n("professional.careerControl", -2)],
      primarySeedTransitions: [seedCreate("SEED_CONTRACT_CEILING", 68, { stance: "sign_security" })],
      secondarySeedTransitions: [seedCreate("SEED_CONTRACT_CEILING", 72, { stance: "sign_security" })]
    },
    {
      id: "COUNTER_CLAUSE",
      label: "Pedir cláusula más baja a cambio de menor salario",
      intentTags: ["renewal", "counter", "exit_optionality"],
      primaryMessage: "Contraofertas una estructura distinta. No se rebaja la cláusula ni el salario hasta que el club emita otra propuesta formal.",
      secondaryMessage: "La petición deja clara tu prioridad por conservar salida, pero el club puede no reabrir la negociación en esos términos.",
      primaryEffects: [n("professional.contractPower", 3), n("professional.careerControl", 3)],
      secondaryEffects: [n("professional.institutionalTrust", -1)],
      primarySeedTransitions: [seedCreate("SEED_CONTRACT_CEILING", 74, { stance: "counter_lower_clause", signed: false })],
      secondarySeedTransitions: [seedCreate("SEED_CONTRACT_CEILING", 70, { stance: "counter_lower_clause", signed: false })]
    },
    {
      id: "COUNTER_DURATION",
      label: "Pedir duración menor con salario parecido",
      intentTags: ["renewal", "counter", "shorter_term"],
      primaryMessage: "Pides menos años manteniendo una escala salarial parecida. La CareerOffer actual se cierra como contraoferta, no como contrato editado.",
      secondaryMessage: "Aumentas opcionalidad futura, pero también asumes más riesgo de tener que negociar antes.",
      primaryEffects: [n("professional.contractPower", 3), n("professional.careerControl", 4)],
      secondaryEffects: [n("professional.environmentStability", -1)],
      primarySeedTransitions: [seedCreate("SEED_CONTRACT_CEILING", 72, { stance: "counter_shorter_duration", signed: false })],
      secondarySeedTransitions: [seedCreate("SEED_CONTRACT_CEILING", 69, { stance: "counter_shorter_duration", signed: false })]
    },
    {
      id: "REJECT_RISK",
      label: "Rechazar y asumir el riesgo del contrato restante",
      intentTags: ["renewal", "reject", "optionality"],
      primaryMessage: "Rechazas la oferta y mantienes exactamente tu contrato vigente. Conservas libertad futura a cambio de perder seguridad inmediata.",
      secondaryMessage: "El mercado puede crecer, pero también puede enfriarse antes de tu siguiente negociación.",
      primaryEffects: [n("professional.careerControl", 4), n("professional.environmentStability", -2)],
      secondaryEffects: [n("reputation.marketHeat", -1)],
      primarySeedTransitions: [seedCreate("SEED_CONTRACT_CEILING", 66, { stance: "reject_for_optionality", signed: false })],
      secondarySeedTransitions: [seedCreate("SEED_CONTRACT_CEILING", 70, { stance: "reject_for_optionality", signed: false })]
    }
  ],
  gates: [
    { path: "contract.monthsRemaining", op: "gt", value: 0 },
    { path: "contract.monthsRemaining", op: "lte", value: 24 }
  ],
  timeWindow: { months: [7, 8, 9, 1] },
  weight: 20,
  cooldown: 99999,
  seedsRead: ["SEED_FIRST_FREE_AGENCY", "SEED_CONTRACT_CEILING"],
  seedsWrite: ["SEED_CONTRACT_CEILING"],
  tags: ["contract", "formal_renewal", "t5_13", "staged_candidate"],
  canonStatus: "verified"
}), ["renewal"], {
  SIGN_SECURITY: "accept",
  COUNTER_CLAUSE: "counter",
  COUNTER_DURATION: "counter",
  REJECT_RISK: "reject"
});

const CON25 = formalOfferEvent(ambiguousEvent({
  id: "EVT_25_CON_001",
  ageWindow: [25, 25],
  phase: "23_26",
  family: "contract",
  title: "Renovar antes del verano internacional",
  body: "Tu club quiere renovar antes de un verano que puede cambiar tu mercado. La oferta es formal y completa; el torneo, tu papel y tu estado físico futuro siguen siendo inciertos.",
  visible: [
    "Conoces todos los términos de la CareerOffer de renovación y los meses que quedan de tu contrato actual."
  ],
  uncertain: [
    "No sabes si entrarás en el torneo, cuánto jugarás, cómo rendirás ni si llegarás sano.",
    "Esperar puede mejorar tu escala o dejarte negociando con menos margen."
  ],
  choices: [
    {
      id: "RENEW_NOW",
      label: "Renovar ya",
      intentTags: ["renewal", "accept_now"],
      primaryMessage: "Aceptas exactamente los términos formales disponibles y eliminas parte de la incertidumbre contractual antes del verano.",
      secondaryMessage: "Aseguras contrato ahora, aunque renuncias a comprobar cuánto habría cambiado tu mercado después del verano.",
      primaryEffects: [n("professional.environmentStability", 3)],
      secondaryEffects: [n("professional.careerControl", -1)],
      primarySeedTransitions: [seedCreate("SEED_CONTRACT_CEILING", 70, { stance: "renew_before_summer", timing: "now" })],
      secondarySeedTransitions: [seedCreate("SEED_CONTRACT_CEILING", 73, { stance: "renew_before_summer", timing: "now" })]
    },
    {
      id: "WAIT_SUMMER",
      label: "Esperar al verano",
      intentTags: ["renewal", "defer", "market_timing"],
      primaryMessage: "Aplazas la firma. La oferta actual deja de estar pendiente y el contrato vigente no cambia.",
      secondaryMessage: "Conservas la opción de medir tu mercado más tarde, aceptando que la siguiente propuesta puede no ser igual.",
      primaryEffects: [n("professional.careerControl", 4)],
      secondaryEffects: [n("professional.environmentStability", -1)],
      primarySeedTransitions: [seedCreate("SEED_CONTRACT_CEILING", 64, { stance: "wait_summer", verbalExpectation: false })],
      secondarySeedTransitions: [seedCreate("SEED_CONTRACT_CEILING", 67, { stance: "wait_summer", verbalExpectation: false })]
    },
    {
      id: "COUNTER_EXIT",
      label: "Firmar solo si añaden una salida razonable",
      intentTags: ["renewal", "counter", "exit_optionality"],
      primaryMessage: "Pides una nueva estructura con salida razonable. No se añade ninguna cláusula hasta que exista una nueva CareerOffer que la contenga.",
      secondaryMessage: "La contraoferta protege tu intención, pero puede enfriar una propuesta que ya era concreta.",
      primaryEffects: [n("professional.contractPower", 3), n("professional.careerControl", 3)],
      secondaryEffects: [n("professional.institutionalTrust", -1)],
      primarySeedTransitions: [seedCreate("SEED_CONTRACT_CEILING", 72, { stance: "counter_exit_clause", signed: false })],
      secondarySeedTransitions: [seedCreate("SEED_CONTRACT_CEILING", 69, { stance: "counter_exit_clause", signed: false })]
    },
    {
      id: "VERBAL_CONTINUE",
      label: "Acordar verbalmente continuar negociando sin firmar",
      intentTags: ["renewal", "defer", "verbal_expectation"],
      primaryMessage: "Dejas una expectativa verbal de seguir hablando, no una obligación contractual. La oferta se aplaza sin aplicar términos.",
      secondaryMessage: "La relación queda abierta, pero ninguna de las partes posee una firma que garantice el siguiente paso.",
      primaryEffects: [n("professional.institutionalTrust", 2), n("professional.careerControl", 2)],
      secondaryEffects: [n("professional.environmentStability", 1)],
      primarySeedTransitions: [seedCreate("SEED_CONTRACT_CEILING", 66, { stance: "verbal_continue", verbalExpectation: true, signed: false })],
      secondarySeedTransitions: [seedCreate("SEED_CONTRACT_CEILING", 68, { stance: "verbal_continue", verbalExpectation: true, signed: false })]
    }
  ],
  gates: [
    { path: "contract.monthsRemaining", op: "gte", value: 12 },
    { path: "contract.monthsRemaining", op: "lte", value: 30 }
  ],
  gateAlternatives: [
    [{ path: "professional.nationalStanding", op: "gte", value: 45 }],
    [{ path: "reputation.marketHeat", op: "gte", value: 50 }]
  ],
  timeWindow: { months: [1, 2, 3, 4, 5] },
  weight: 22,
  cooldown: 99999,
  seedsRead: ["SEED_CONTRACT_CEILING", "SEED_FIRST_FREE_AGENCY", "SEED_PUBLIC_CONTRACT"],
  seedsWrite: ["SEED_CONTRACT_CEILING"],
  tags: ["contract", "formal_renewal", "international_summer", "t5_13", "staged_candidate"],
  canonStatus: "verified"
}), ["renewal"], {
  RENEW_NOW: "accept",
  WAIT_SUMMER: "defer",
  COUNTER_EXIT: "counter",
  VERBAL_CONTINUE: "defer"
});

/** Staged candidates; activation and content lineage belong to the integrator. */
export const T513_STAGED_OFFER_PRINCIPAL_EVENTS_23_25: EventDefinition[] = [MKT23, CON23, CON25];
