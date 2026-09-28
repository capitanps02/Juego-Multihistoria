import { ambiguousEvent, n, seedCreate } from "../18_20/helpers.js";
const BRIDGE = ambiguousEvent({
    id: "EVT_23_BRIDGE_001",
    ageWindow: [23, 23],
    phase: "23_26",
    family: "legacy",
    title: "Ya no eres proyecto",
    body: "La primera reunión del verano ya no habla de potencial: el club actual o un comprador te presenta rol, duración y objetivos y exige rendimiento desde ahora.",
    visible: [
        "Conoces tu contrato, los minutos del año anterior y la posición declarada del club."
    ],
    uncertain: [
        "No sabes si el entrenador seguirá todo el año ni qué fichajes cerrará la dirección."
    ],
    choices: [
        {
            id: "A",
            label: "Pedir garantías deportivas concretas antes de hablar de dinero",
            intentTags: ["role_clarity", "career_control"],
            primaryMessage: "El club concreta mejor el rol que imagina para ti. Ganas claridad, aunque la conversación no convierte esa promesa en una garantía contractual.",
            secondaryMessage: "La respuesta sigue siendo deliberadamente ambigua: sabes qué quieren hoy, pero no obtienes protección real frente a un cambio de entrenador o de plantilla.",
            primaryEffects: [n("professional.roleSecurity", 5), n("professional.careerControl", 3)],
            secondaryEffects: [n("professional.roleSecurity", 2), n("professional.careerControl", 2), n("professional.institutionalTrust", -1)],
            primarySeedTransitions: [seedCreate("SEED_ELITE_ROLE_BARGAIN", 60, { stance: "role_guarantees" })],
            secondarySeedTransitions: [seedCreate("SEED_ELITE_ROLE_BARGAIN", 52, { stance: "role_guarantees" })]
        },
        {
            id: "B",
            label: "Priorizar salario y duración, aceptando competir",
            intentTags: ["security", "contract_power"],
            primaryMessage: "La negociación gana estructura económica y duración, pero el club evita blindar tu jerarquía deportiva.",
            secondaryMessage: "El dinero domina la conversación y sales con menos claridad sobre minutos de la que tenías al entrar.",
            primaryEffects: [n("professional.contractPower", 5), n("professional.roleSecurity", -2)],
            secondaryEffects: [n("professional.contractPower", 3), n("professional.roleSecurity", -4)],
            primarySeedTransitions: [seedCreate("SEED_ELITE_ROLE_BARGAIN", 61, { stance: "security_over_role" })],
            secondarySeedTransitions: [seedCreate("SEED_ELITE_ROLE_BARGAIN", 54, { stance: "security_over_role" })]
        },
        {
            id: "C",
            label: "Mantener contrato actual y esperar un mercado mejor",
            intentTags: ["patience", "optionality"],
            primaryMessage: "Mantienes margen y evitas comprometerte antes de conocer mejor el mercado.",
            secondaryMessage: "La espera conserva libertad, pero parte del interés pierde temperatura mientras otros clubes mueven ficha.",
            primaryEffects: [n("professional.careerControl", 4), n("reputation.marketHeat", 2)],
            secondaryEffects: [n("professional.careerControl", 3), n("reputation.marketHeat", -3)],
            primarySeedTransitions: [seedCreate("SEED_ELITE_ROLE_BARGAIN", 57, { stance: "wait_market" })],
            secondarySeedTransitions: [seedCreate("SEED_ELITE_ROLE_BARGAIN", 50, { stance: "wait_market" })]
        },
        {
            id: "D",
            label: "Pedir que tu agente escuche todo sin comprometerte",
            intentTags: ["information", "delegation"],
            primaryMessage: "Tu agente amplía la información disponible sin cerrar ninguna puerta y la conversación sigue siendo exploratoria.",
            secondaryMessage: "Aparecen más contactos y versiones de la negociación, pero pierdes parte del control sobre el ritmo y sobre quién sabe que estás escuchando.",
            primaryEffects: [n("professional.contractPower", 2), n("professional.agentControl", -3), n("professional.careerControl", 1)],
            secondaryEffects: [n("professional.agentControl", -5), n("reputation.mediaHeat", 2), n("professional.environmentStability", -1)],
            primarySeedTransitions: [seedCreate("SEED_ELITE_ROLE_BARGAIN", 55, { stance: "agent_listens" })],
            secondarySeedTransitions: [seedCreate("SEED_ELITE_ROLE_BARGAIN", 49, { stance: "agent_listens" })]
        }
    ],
    timeWindow: { months: [7] },
    weight: 96,
    cooldown: 99999,
    seedsRead: ["SEED_AGENT_POWER"],
    seedsWrite: ["SEED_ELITE_ROLE_BARGAIN"],
    tags: ["adult_consolidation", "transition23", "hard_deadline", "t5_10"],
    canonStatus: "verified"
});
const AGENT = ambiguousEvent({
    id: "EVT_23_AGT_001",
    ageWindow: [23, 23],
    phase: "23_26",
    family: "agent",
    title: "La videollamada sin tu agente",
    body: "Un entrenador o director de otro club te escribe directamente para una videollamada de fútbol, no de contrato. Tu agente todavía no sabe nada.",
    visible: [
        "Sabes quién llama y qué club representa."
    ],
    uncertain: [
        "No sabes si es iniciativa personal, una táctica de reclutamiento o una conversación sin poder ejecutivo."
    ],
    choices: [
        {
            id: "A",
            label: "Aceptar y avisar al agente después",
            intentTags: ["direct_contact", "career_control"],
            primaryMessage: "La conversación te da información deportiva de primera mano y después la trasladas a tu agente sin convertirla en una oferta.",
            secondaryMessage: "Obtienes información útil, pero tu agente recibe tarde un contacto que habría preferido gestionar desde el principio.",
            primaryEffects: [n("professional.careerControl", 5), n("professional.agentControl", 3)],
            secondaryEffects: [n("professional.careerControl", 3), n("professional.agentControl", 1), n("professional.environmentStability", -2)],
            primarySeedTransitions: [seedCreate("SEED_DIRECT_RECRUIT", 62, { handling: "direct_then_inform" })],
            secondarySeedTransitions: [seedCreate("SEED_DIRECT_RECRUIT", 55, { handling: "direct_then_inform" })]
        },
        {
            id: "B",
            label: "Reenviar el contacto al agente antes de responder",
            intentTags: ["agent_process", "caution"],
            primaryMessage: "El contacto pasa por tu agente y el proceso queda más ordenado, aunque recibes menos información espontánea del interlocutor.",
            secondaryMessage: "La intermediación protege el proceso, pero la conversación pierde velocidad y parte de la oportunidad informal se enfría.",
            primaryEffects: [n("professional.agentControl", -3), n("professional.environmentStability", 2)],
            secondaryEffects: [n("professional.agentControl", -4), n("reputation.marketHeat", -2), n("professional.environmentStability", 1)],
            primarySeedTransitions: [seedCreate("SEED_DIRECT_RECRUIT", 54, { handling: "forward_before_reply" })],
            secondarySeedTransitions: [seedCreate("SEED_DIRECT_RECRUIT", 47, { handling: "forward_before_reply" })]
        },
        {
            id: "C",
            label: "Aceptar con tu agente presente",
            intentTags: ["shared_control", "information"],
            primaryMessage: "Hablas de fútbol con el interlocutor y tu agente escucha el mismo contexto, manteniendo separada la charla de cualquier negociación formal.",
            secondaryMessage: "La presencia del agente evita malentendidos, pero vuelve la llamada más rígida y el interlocutor comparte menos de lo esperado.",
            primaryEffects: [n("professional.careerControl", 2), n("professional.contractPower", 2), n("professional.agentControl", -1)],
            secondaryEffects: [n("professional.careerControl", 1), n("professional.agentControl", -2)],
            primarySeedTransitions: [seedCreate("SEED_DIRECT_RECRUIT", 58, { handling: "agent_present" })],
            secondarySeedTransitions: [seedCreate("SEED_DIRECT_RECRUIT", 51, { handling: "agent_present" })]
        },
        {
            id: "D",
            label: "No responder hasta que haya oferta formal",
            intentTags: ["boundaries", "patience"],
            primaryMessage: "Mantienes un límite claro: sin oferta ni mandato formal no asumes compromiso alguno.",
            secondaryMessage: "Proteges el proceso, pero el contacto informal no vuelve y pierdes una fuente de información real.",
            primaryEffects: [n("professional.careerControl", 3), n("professional.environmentStability", 1)],
            secondaryEffects: [n("professional.careerControl", 2), n("reputation.marketHeat", -3)],
            primarySeedTransitions: [seedCreate("SEED_DIRECT_RECRUIT", 44, { handling: "wait_for_formal_offer" })],
            secondarySeedTransitions: [seedCreate("SEED_DIRECT_RECRUIT", 38, { handling: "wait_for_formal_offer" })]
        }
    ],
    gates: [{ path: "reputation.marketHeat", op: "gte", value: 30 }],
    timeWindow: { months: [7, 8, 9, 10] },
    weight: 20,
    cooldown: 99999,
    seedsRead: ["SEED_AGENT_POWER"],
    seedsWrite: ["SEED_DIRECT_RECRUIT"],
    tags: ["agent", "adult_consolidation", "informal_recruitment", "t5_10"],
    canonStatus: "verified"
});
const BODY = ambiguousEvent({
    id: "EVT_23_BODY_001",
    ageWindow: [23, 23],
    phase: "23_26",
    family: "medical",
    title: "El GPS",
    body: "Los datos muestran picos de carga por encima del grupo. El preparador propone reducir una sesión semanal aunque tú te sientes bien.",
    visible: [
        "Conoces los datos de carga, tus sensaciones y el plan preventivo propuesto."
    ],
    uncertain: [
        "La correlación individual con lesión es imperfecta y el entrenador también observa tu disponibilidad para entrenar."
    ],
    choices: [
        {
            id: "A",
            label: "Seguir el plan preventivo",
            intentTags: ["prevention", "availability"],
            primaryMessage: "La reducción de carga mejora margen de recuperación sin convertir la prevención en una promesa de ausencia de lesiones.",
            secondaryMessage: "Proteges carga, pero pierdes algo de ritmo y el cuerpo técnico necesita comprobar que sigues llegando preparado.",
            primaryEffects: [n("professional.bodyLoad", -7), n("professional.recoveryMargin", 5), n("body.risk", -2)],
            secondaryEffects: [n("professional.bodyLoad", -5), n("professional.recoveryMargin", 3), n("professional.roleSecurity", -1)],
            primarySeedTransitions: [seedCreate("SEED_LOAD_MANAGEMENT", 64, { plan: "weekly_prevention" })],
            secondarySeedTransitions: [seedCreate("SEED_LOAD_MANAGEMENT", 58, { plan: "weekly_prevention" })]
        },
        {
            id: "B",
            label: "Entrenar todo mientras no haya dolor",
            intentTags: ["full_load", "short_term_role"],
            primaryMessage: "Toleras la carga inmediata y mantienes continuidad de entrenamiento, sin demostrar que el riesgo haya desaparecido.",
            secondaryMessage: "La acumulación empieza a reducir tu margen de recuperación aunque todavía no exista una lesión diagnosticada.",
            primaryEffects: [n("professional.bodyLoad", 3), n("professional.roleSecurity", 2)],
            secondaryEffects: [n("professional.bodyLoad", 7), n("professional.recoveryMargin", -5), n("body.risk", 4)],
            primarySeedTransitions: [seedCreate("SEED_LOAD_MANAGEMENT", 57, { plan: "full_load_until_pain" })],
            secondarySeedTransitions: [seedCreate("SEED_LOAD_MANAGEMENT", 66, { plan: "full_load_until_pain" })]
        },
        {
            id: "C",
            label: "Reducir carga solo después de partidos completos",
            intentTags: ["targeted_management", "balance"],
            primaryMessage: "La gestión selectiva reduce parte de la carga cuando más se acumula y conserva la rutina en semanas ligeras.",
            secondaryMessage: "El criterio funciona de forma irregular: evita recortar de más, pero algunos picos llegan antes de que actives la reducción.",
            primaryEffects: [n("professional.bodyLoad", -4), n("professional.recoveryMargin", 3), n("professional.roleSecurity", 1)],
            secondaryEffects: [n("professional.bodyLoad", -1), n("professional.recoveryMargin", 1)],
            primarySeedTransitions: [seedCreate("SEED_LOAD_MANAGEMENT", 61, { plan: "post_full_match" })],
            secondarySeedTransitions: [seedCreate("SEED_LOAD_MANAGEMENT", 53, { plan: "post_full_match" })]
        },
        {
            id: "D",
            label: "Pedir segunda valoración externa y aplazar el cambio",
            intentTags: ["second_opinion", "information"],
            primaryMessage: "La segunda valoración añade información y pospone el cambio sin declarar que el staff interno estuviera equivocado.",
            secondaryMessage: "Ganas otra opinión, pero la demora mantiene la carga actual y genera una pequeña tensión con el equipo médico del club.",
            primaryEffects: [n("professional.careerControl", 3), n("professional.recoveryMargin", 1)],
            secondaryEffects: [n("professional.careerControl", 2), n("professional.institutionalTrust", -2), n("professional.bodyLoad", 2)],
            primarySeedTransitions: [seedCreate("SEED_LOAD_MANAGEMENT", 52, { plan: "external_review_first" })],
            secondarySeedTransitions: [seedCreate("SEED_LOAD_MANAGEMENT", 48, { plan: "external_review_first" })]
        }
    ],
    gates: [],
    gateAlternatives: [
        [{ path: "professional.bodyLoad", op: "gte", value: 28 }],
        [{ path: "flags.HAS_SEED_BODY_PRECEDENT", op: "eq", value: true }]
    ],
    timeWindow: { months: [8, 9, 10, 11] },
    weight: 20,
    cooldown: 99999,
    seedsRead: ["SEED_BODY_PRECEDENT"],
    seedsWrite: ["SEED_LOAD_MANAGEMENT"],
    npcRefs: ["NPC_MED_01"],
    tags: ["medical", "adult_consolidation", "load_management", "t5_10"],
    canonStatus: "verified"
});
export const T510_PRINCIPAL_EVENTS_23 = [BRIDGE, AGENT, BODY];
