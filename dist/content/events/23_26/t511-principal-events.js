import { ambiguousEvent, n, seedCreate } from "../18_20/helpers.js";
const MONEY = ambiguousEvent({
    id: "EVT_23_MONEY_001",
    ageWindow: [23, 23],
    phase: "23_26",
    family: "money",
    title: "El asesor de tu padre",
    body: "Tu padre propone una inversión inmobiliaria de un conocido. Irene Bosch cree que puede funcionar, pero insiste en que el dinero quedaría poco líquido y que la relación familiar puede contaminar la decisión.",
    visible: [
        "Conoces el importe, la rentabilidad estimada, las garantías ofrecidas y que el proyecto llega por una relación personal de tu padre."
    ],
    uncertain: [
        "No sabes cómo evolucionará el mercado ni cuánto de tu confianza en la propuesta procede de la relación familiar y no de la calidad real del proyecto."
    ],
    choices: [
        {
            id: "A",
            label: "Invertir la cantidad completa",
            intentTags: ["family_trust", "full_exposure"],
            primaryMessage: "Aceptas la propuesta completa. La relación familiar se refuerza por la confianza depositada, pero una parte importante de tu patrimonio queda menos disponible.",
            secondaryMessage: "La decisión concentra demasiado riesgo para tu comodidad. No sabes todavía si la inversión saldrá bien, pero sí notas que dinero y familia quedan más entrelazados.",
            primaryEffects: [n("professional.moneyComfort", -5), n("rel.NPC_FAM_02.trust", 3), n("professional.careerControl", -1)],
            secondaryEffects: [n("professional.moneyComfort", -9), n("rel.NPC_FAM_02.trust", 1), n("professional.careerControl", -3)],
            primarySeedTransitions: [seedCreate("SEED_FAMILY_BUSINESS", 68, { structure: "full_investment", familyExposure: "high" })],
            secondarySeedTransitions: [seedCreate("SEED_FAMILY_BUSINESS", 74, { structure: "full_investment", familyExposure: "high" })]
        },
        {
            id: "B",
            label: "Entrar con una fracción",
            intentTags: ["risk_limit", "family_trust"],
            primaryMessage: "Participas sin comprometer una parte dominante de tu patrimonio. Tu padre lo lee como apoyo y tú mantienes margen si el proyecto tarda en devolver liquidez.",
            secondaryMessage: "La entrada parcial reduce el impacto de un mal escenario, aunque no elimina la mezcla entre confianza familiar y decisión financiera.",
            primaryEffects: [n("professional.moneyComfort", -2), n("rel.NPC_FAM_02.trust", 2), n("professional.careerControl", 1)],
            secondaryEffects: [n("professional.moneyComfort", -4), n("rel.NPC_FAM_02.trust", 1)],
            primarySeedTransitions: [seedCreate("SEED_FAMILY_BUSINESS", 56, { structure: "partial_investment", familyExposure: "medium" })],
            secondarySeedTransitions: [seedCreate("SEED_FAMILY_BUSINESS", 60, { structure: "partial_investment", familyExposure: "medium" })]
        },
        {
            id: "C",
            label: "Rechazar y contratar a Irene para ordenar patrimonio",
            intentTags: ["professional_advice", "independence"],
            primaryMessage: "Separar asesoramiento y familia te da una estructura más profesional para futuras decisiones. Tu padre acepta el límite aunque la propuesta no salga adelante contigo.",
            secondaryMessage: "Ganas control financiero, pero tu padre interpreta que has confiado más en una asesora externa que en su criterio y la conversación queda algo fría.",
            primaryEffects: [n("professional.moneyComfort", 4), n("professional.careerControl", 4), n("rel.NPC_FAM_02.trust", -1)],
            secondaryEffects: [n("professional.moneyComfort", 3), n("professional.careerControl", 3), n("rel.NPC_FAM_02.trust", -4)],
            primarySeedTransitions: [seedCreate("SEED_FAMILY_BUSINESS", 46, { structure: "professional_adviser", familyExposure: "low" })],
            secondarySeedTransitions: [seedCreate("SEED_FAMILY_BUSINESS", 50, { structure: "professional_adviser", familyExposure: "low" })]
        },
        {
            id: "D",
            label: "No invertir pero prestar dinero a tu padre para que él decida",
            intentTags: ["family_support", "indirect_exposure"],
            primaryMessage: "No entras como inversor, pero ayudas a tu padre a decidir por su cuenta. La separación jurídica es mayor que la emocional.",
            secondaryMessage: "El préstamo evita que figures en el proyecto, aunque sigues asumiendo riesgo económico y ahora una eventual pérdida también puede convertirse en deuda familiar.",
            primaryEffects: [n("professional.moneyComfort", -4), n("rel.NPC_FAM_02.trust", 4), n("professional.careerControl", -2)],
            secondaryEffects: [n("professional.moneyComfort", -7), n("rel.NPC_FAM_02.trust", 2), n("professional.careerControl", -3)],
            primarySeedTransitions: [seedCreate("SEED_FAMILY_BUSINESS", 62, { structure: "family_loan", familyExposure: "medium" })],
            secondarySeedTransitions: [seedCreate("SEED_FAMILY_BUSINESS", 68, { structure: "family_loan", familyExposure: "medium" })]
        }
    ],
    gateAlternatives: [
        [{ path: "professional.moneyComfort", op: "gte", value: 36 }],
        [{ path: "flags.HAS_SEED_FIRST_BIG_MONEY", op: "eq", value: true }]
    ],
    timeWindow: { months: [8, 9, 10, 11] },
    weight: 18,
    cooldown: 99999,
    seedsRead: ["SEED_FIRST_BIG_MONEY", "SEED_FAMILY_MONEY"],
    seedsWrite: ["SEED_FAMILY_BUSINESS"],
    npcRefs: ["NPC_FAM_02"],
    tags: ["money", "family", "adult_consolidation", "t5_11"],
    canonStatus: "verified"
});
const HOME = ambiguousEvent({
    id: "EVT_23_HOME_001",
    ageWindow: [23, 23],
    phase: "23_26",
    family: "family",
    title: "Tu nombre en Cerro Alto",
    body: "UDV propone poner tu nombre a un campus de verano o a un sector juvenil. El homenaje puede parecer natural después de tu trayectoria o prematuro si tu relación con el club quedó dañada.",
    visible: [
        "Conoces la propuesta concreta y cómo quiere usar el club tu nombre e imagen."
    ],
    uncertain: [
        "No sabes si la iniciativa nace de un homenaje genuino, de una campaña comercial o de una disputa interna por apropiarse de tu vínculo con Cerro Alto."
    ],
    choices: [
        {
            id: "A",
            label: "Aceptar sin cobrar",
            intentTags: ["home_symbol", "pro_bono"],
            primaryMessage: "Cedes el nombre sin cobrar y el gesto se interpreta como cercanía con el lugar donde empezaste.",
            secondaryMessage: "La gratuidad genera buena voluntad, aunque también facilita que el club use tu imagen como si vuestra relación institucional fuese más simple de lo que realmente es.",
            primaryEffects: [n("professional.homePull", 6), n("professional.publicMyth", 4), n("professional.institutionalTrust", 2)],
            secondaryEffects: [n("professional.homePull", 4), n("professional.publicMyth", 2), n("professional.careerControl", -2)],
            primarySeedTransitions: [seedCreate("SEED_HOME_SYMBOL", 65, { stance: "pro_bono", commercialUse: false })],
            secondarySeedTransitions: [seedCreate("SEED_HOME_SYMBOL", 58, { stance: "pro_bono", commercialUse: false })]
        },
        {
            id: "B",
            label: "Aceptar con una aportación a cantera",
            intentTags: ["academy", "shared_value"],
            primaryMessage: "Vinculas el uso de tu nombre a recursos para cantera. El gesto gana contenido deportivo y no queda reducido a una campaña de imagen.",
            secondaryMessage: "La condición protege el sentido del proyecto, aunque parte de la directiva la interpreta como una forma de supervisar cómo deben homenajearte.",
            primaryEffects: [n("professional.homePull", 5), n("professional.legacyCapital", 3), n("professional.institutionalTrust", 1)],
            secondaryEffects: [n("professional.homePull", 3), n("professional.legacyCapital", 2), n("professional.institutionalTrust", -1)],
            primarySeedTransitions: [seedCreate("SEED_HOME_SYMBOL", 68, { stance: "academy_contribution", commercialUse: false })],
            secondarySeedTransitions: [seedCreate("SEED_HOME_SYMBOL", 62, { stance: "academy_contribution", commercialUse: false })]
        },
        {
            id: "C",
            label: "Pedir que no usen tu nombre todavía",
            intentTags: ["distance", "timing"],
            primaryMessage: "Aplazas el homenaje para no convertir una relación todavía abierta en una pieza de legado cerrada.",
            secondaryMessage: "Conservas control sobre tu nombre, pero en Cerro Alto algunos leen la decisión como distancia respecto al club y al barrio.",
            primaryEffects: [n("professional.careerControl", 4), n("professional.homePull", -1), n("professional.publicMyth", -1)],
            secondaryEffects: [n("professional.careerControl", 3), n("professional.homePull", -4), n("professional.publicPolarization", 2)],
            primarySeedTransitions: [seedCreate("SEED_HOME_SYMBOL", 45, { stance: "defer_name", commercialUse: false })],
            secondarySeedTransitions: [seedCreate("SEED_HOME_SYMBOL", 50, { stance: "defer_name", commercialUse: false })]
        },
        {
            id: "D",
            label: "Ceder imagen cobrando como cualquier campaña",
            intentTags: ["commercial_boundary", "professionalism"],
            primaryMessage: "Tratas el uso de tu imagen como un acuerdo profesional y evitas fingir que toda relación con el club debe ser sentimental.",
            secondaryMessage: "La frontera comercial es clara, pero una parte del entorno considera frío cobrar por un símbolo ligado a tus orígenes.",
            primaryEffects: [n("professional.commercialPower", 4), n("professional.careerControl", 2), n("professional.publicPolarization", 1)],
            secondaryEffects: [n("professional.commercialPower", 3), n("professional.homePull", -2), n("professional.publicPolarization", 4)],
            primarySeedTransitions: [seedCreate("SEED_HOME_SYMBOL", 57, { stance: "commercial_license", commercialUse: true })],
            secondarySeedTransitions: [seedCreate("SEED_HOME_SYMBOL", 63, { stance: "commercial_license", commercialUse: true })]
        }
    ],
    gateAlternatives: [
        [{ path: "professional.publicMyth", op: "gte", value: 28 }],
        [{ path: "professional.homePull", op: "gte", value: 32 }],
        [{ path: "flags.HAS_SEED_HOME_DISTANCE", op: "eq", value: true }]
    ],
    timeWindow: { months: [9, 10, 11, 12] },
    weight: 16,
    cooldown: 99999,
    seedsRead: ["SEED_HOME_DISTANCE"],
    seedsWrite: ["SEED_HOME_SYMBOL"],
    tags: ["home", "image", "legacy", "t5_11"],
    canonStatus: "verified"
});
const EUROPE = ambiguousEvent({
    id: "EVT_23_EUR_001",
    ageWindow: [23, 23],
    phase: "23_26",
    family: "sport",
    title: "La lista continental",
    body: "El cuerpo técnico debe cerrar la inscripción continental con más jugadores útiles que plazas disponibles. Una lesión de un compañero cambia el cálculo, pero nadie te confirma todavía si entrarás.",
    visible: [
        "Conoces las reglas de inscripción, la fecha de cierre y tu situación contractual."
    ],
    uncertain: [
        "El entrenador dice que cuenta contigo para la temporada, pero no confirma la lista ni cuánto pesará la lesión de otro jugador en la decisión final."
    ],
    choices: [
        {
            id: "A",
            label: "Pedir respuesta antes del cierre",
            intentTags: ["clarity", "career_control"],
            primaryMessage: "Pides una respuesta concreta antes del plazo y obtienes más claridad sobre cómo te está valorando el cuerpo técnico.",
            secondaryMessage: "La presión no cambia necesariamente la lista y el staff interpreta la insistencia como una señal de inquietud por tu estatus.",
            primaryEffects: [n("professional.careerControl", 4), n("professional.institutionalTrust", 1)],
            secondaryEffects: [n("professional.careerControl", 2), n("professional.institutionalTrust", -2), n("professional.roleSecurity", -1)],
            primarySeedTransitions: [seedCreate("SEED_EURO_REGISTRATION", 58, { stance: "ask_before_deadline", registrationOutcome: "unknown" })],
            secondarySeedTransitions: [seedCreate("SEED_EURO_REGISTRATION", 54, { stance: "ask_before_deadline", registrationOutcome: "unknown" })]
        },
        {
            id: "B",
            label: "No presionar y confiar",
            intentTags: ["trust", "patience"],
            primaryMessage: "No conviertes la inscripción en un pulso público o interno y das margen al entrenador para decidir.",
            secondaryMessage: "La confianza evita fricción, pero llegas al cierre con menos información y con menos margen para reaccionar si quedas fuera.",
            primaryEffects: [n("professional.institutionalTrust", 3), n("professional.careerControl", -1)],
            secondaryEffects: [n("professional.institutionalTrust", 1), n("professional.careerControl", -3)],
            primarySeedTransitions: [seedCreate("SEED_EURO_REGISTRATION", 50, { stance: "trust_staff", registrationOutcome: "unknown" })],
            secondarySeedTransitions: [seedCreate("SEED_EURO_REGISTRATION", 53, { stance: "trust_staff", registrationOutcome: "unknown" })]
        },
        {
            id: "C",
            label: "Si quedas fuera, pedir salida o cesión inmediata",
            intentTags: ["exit_if_excluded", "optionality"],
            primaryMessage: "Dejas claro el límite sin fingir que la exclusión ya ocurrió. El club entiende que una lista sin ti abriría una conversación de mercado.",
            secondaryMessage: "La postura protege tu opción de competir en otro sitio, pero también reduce la comodidad del club para tratarte como una pieza de rotación doméstica.",
            primaryEffects: [n("professional.careerControl", 5), n("reputation.marketHeat", 2), n("professional.institutionalTrust", -2)],
            secondaryEffects: [n("professional.careerControl", 3), n("reputation.marketHeat", 1), n("professional.roleSecurity", -3)],
            primarySeedTransitions: [seedCreate("SEED_EURO_REGISTRATION", 65, { stance: "exit_if_unregistered", registrationOutcome: "unknown" })],
            secondarySeedTransitions: [seedCreate("SEED_EURO_REGISTRATION", 68, { stance: "exit_if_unregistered", registrationOutcome: "unknown" })]
        },
        {
            id: "D",
            label: "Aceptar quedar fuera si prometen rol doméstico alto",
            intentTags: ["domestic_role", "tradeoff"],
            primaryMessage: "Aceptas que la competición doméstica pueda compensar una ausencia continental si el club concreta un rol alto de verdad.",
            secondaryMessage: "La promesa doméstica mejora el encaje inmediato, pero sigue sin ser una garantía y quedar fuera podría reducir tu credibilidad continental.",
            primaryEffects: [n("professional.roleSecurity", 4), n("professional.institutionalTrust", 2), n("professional.continentalCred", -1)],
            secondaryEffects: [n("professional.roleSecurity", 2), n("professional.institutionalTrust", 1), n("professional.continentalCred", -3)],
            primarySeedTransitions: [seedCreate("SEED_EURO_REGISTRATION", 59, { stance: "domestic_role_tradeoff", registrationOutcome: "unknown" })],
            secondarySeedTransitions: [seedCreate("SEED_EURO_REGISTRATION", 63, { stance: "domestic_role_tradeoff", registrationOutcome: "unknown" })]
        }
    ],
    gates: [
        { path: "flags.CONTINENTAL_CONTEXT", op: "eq", value: true },
        { path: "professional.roleSecurity", op: "lte", value: 70 }
    ],
    timeWindow: { months: [8, 9] },
    weight: 20,
    cooldown: 99999,
    seedsRead: ["SEED_ELITE_ROLE_BARGAIN"],
    seedsWrite: ["SEED_EURO_REGISTRATION"],
    tags: ["continental", "role_uncertainty", "adult_consolidation", "t5_11"],
    canonStatus: "verified"
});
export const T511_PRINCIPAL_EVENTS_23 = [MONEY, HOME, EUROPE];
