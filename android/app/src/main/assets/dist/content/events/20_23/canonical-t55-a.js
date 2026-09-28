import { ambiguousEvent, n, seedCreate } from "../18_20/helpers.js";
const intensify = (seedId, intensity) => ({ seedId, action: "intensify", intensity });
const EVT_20_LIFE_001 = ambiguousEvent({
    id: "EVT_20_LIFE_001",
    ageWindow: [20, 20],
    phase: "20_23",
    family: "life",
    title: "Las llaves",
    body: "Por primera vez puedes pagar de verdad dónde vivir. En casa te recuerdan que ahorrar ahora puede darte margen más adelante; si el club te ha movido, también sabes que otra mudanza podría llegar antes de sentir este lugar como propio.",
    visible: [
        "Conoces tu salario actual, tu club y si tu carrera ya te ha obligado a vivir fuera.",
        "Tu familia participa en la conversación y sabe qué alternativa eliges."
    ],
    uncertain: [
        "No sabes cuánto durará tu estabilidad deportiva ni si el próximo mercado te obligará a mudarte.",
        "Tampoco sabes cuánto cambiará la convivencia tu relación con el vestuario o con tu familia."
    ],
    gateAlternatives: [
        [{ path: "contract.salaryMonthly", op: "gt", value: 0 }],
        [{ path: "flags.ABROAD_ROUTE", op: "eq", value: true }]
    ],
    timeWindow: { months: [7, 8, 9] },
    weight: 18,
    choices: [
        {
            id: "STAY_HOME",
            label: "Seguir en casa y ahorrar",
            intentTags: ["stability", "savings", "family"],
            primaryMessage: "Conservas margen financiero y una red cotidiana estable, aunque retrasas parte de tu independencia.",
            secondaryMessage: "El ahorro funciona, pero empiezas a notar que familia y carrera ocupan el mismo espacio de decisión.",
            primaryEffects: [n("professional.moneyComfort", 7), n("professional.environmentStability", 4)],
            secondaryEffects: [n("professional.moneyComfort", 6), n("professional.environmentStability", 1), n("professional.agentControl", 1)],
            primarySeedTransitions: [seedCreate("SEED_FIRST_BIG_MONEY", 54, { housing: "family_home" })],
            secondarySeedTransitions: [seedCreate("SEED_FIRST_BIG_MONEY", 58, { housing: "family_home", friction: true })]
        },
        {
            id: "RENT_NEAR_CLUB",
            label: "Alquilar cerca del club",
            intentTags: ["independence", "performance", "cost"],
            primaryMessage: "Ganas autonomía y reduces fricción diaria con el fútbol, a cambio de asumir un coste fijo que antes no existía.",
            secondaryMessage: "La independencia llega, pero una mala racha o un cambio de club hace que el alquiler se sienta menos reversible de lo esperado.",
            primaryEffects: [n("professional.environmentStability", 6), n("professional.moneyComfort", -5)],
            secondaryEffects: [n("professional.environmentStability", 2), n("professional.moneyComfort", -7), n("professional.contractPower", -1)],
            primarySeedTransitions: [seedCreate("SEED_FIRST_BIG_MONEY", 58, { housing: "rent_near_club" })],
            secondarySeedTransitions: [seedCreate("SEED_FIRST_BIG_MONEY", 62, { housing: "rent_near_club", mobility_cost: true })]
        },
        {
            id: "SHARE_TEAMMATE",
            label: "Compartir piso con un compañero",
            intentTags: ["locker", "savings", "privacy"],
            primaryMessage: "Compartes costes y te integras más rápido en el día a día del vestuario.",
            secondaryMessage: "La convivencia fortalece el vínculo, pero reduce la separación entre trabajo, rumores y vida privada.",
            primaryEffects: [n("professional.moneyComfort", 3), n("professional.lockerPower", 3), n("professional.environmentStability", 2)],
            secondaryEffects: [n("professional.moneyComfort", 2), n("professional.lockerPower", 2), n("reputation.mediaHeat", 1)],
            primarySeedTransitions: [seedCreate("SEED_FIRST_BIG_MONEY", 52, { housing: "share_teammate" })],
            secondarySeedTransitions: [seedCreate("SEED_FIRST_BIG_MONEY", 56, { housing: "share_teammate", privacy_cost: true })]
        },
        {
            id: "CLUB_TEMPORARY",
            label: "Usar alojamiento temporal del club",
            intentTags: ["mobility", "caution", "club_support"],
            primaryMessage: "Mantienes flexibilidad si el proyecto cambia y evitas comprometer dinero antes de conocer tu situación real.",
            secondaryMessage: "La flexibilidad protege tu bolsillo, pero hace más difícil sentir que la ciudad y el club son realmente tuyos.",
            primaryEffects: [n("professional.moneyComfort", 4), n("professional.contractPower", 2), n("professional.environmentStability", -1)],
            secondaryEffects: [n("professional.moneyComfort", 3), n("professional.environmentStability", -4), n("professional.foreignAdaptation", -1)],
            primarySeedTransitions: [seedCreate("SEED_FIRST_BIG_MONEY", 50, { housing: "club_temporary" })],
            secondarySeedTransitions: [seedCreate("SEED_FIRST_BIG_MONEY", 54, { housing: "club_temporary", rooted: false })]
        }
    ],
    seedsWrite: ["SEED_FIRST_BIG_MONEY"],
    npcRefs: ["NPC_FAM_01", "NPC_FAM_02"],
    tags: ["life", "housing", "family", "money", "canonical_t55_a"],
    canonStatus: "verified"
});
const EVT_20_ABR_001 = ambiguousEvent({
    id: "EVT_20_ABR_001",
    ageWindow: [20, 20],
    phase: "20_23",
    family: "social",
    title: "La ciudad que no habla tu idioma",
    body: "Fuera del campo puedes sobrevivir con gestos, traducciones y el idioma puente del vestuario. El problema es que entrenar, descansar, hacer trámites y construir una vida no son la misma cosa que sobrevivir una semana.",
    visible: [
        "Estás en una ruta extranjera y conoces tu nivel actual de adaptación.",
        "El club puede ayudarte con logística básica, pero el método de integración lo eliges tú."
    ],
    uncertain: [
        "No sabes qué parte de la adaptación será decisiva para rendir ni cuánto dependerás de otras personas.",
        "Aprender más rápido consume tiempo y energía que también compiten con recuperación y fútbol."
    ],
    gates: [{ path: "flags.ABROAD_ROUTE", op: "eq", value: true }],
    timeWindow: { months: [7, 8, 9, 10] },
    weight: 19,
    choices: [
        {
            id: "INTENSIVE_CLASSES",
            label: "Apuntarte a clases intensivas",
            intentTags: ["language", "autonomy", "workload"],
            primaryMessage: "La inversión de tiempo acelera tu autonomía fuera del club y reduce errores cotidianos.",
            secondaryMessage: "Aprendes rápido, pero el esfuerzo añadido pesa durante semanas de entrenamiento y viajes.",
            primaryEffects: [n("professional.foreignAdaptation", 10), n("professional.environmentStability", 3), n("professional.moneyComfort", -2)],
            secondaryEffects: [n("professional.foreignAdaptation", 7), n("professional.bodyLoad", 2), n("professional.moneyComfort", -2)],
            primarySeedTransitions: [seedCreate("SEED_FOREIGN_ADAPT", 62, { method: "intensive_classes" })],
            secondarySeedTransitions: [seedCreate("SEED_FOREIGN_ADAPT", 58, { method: "intensive_classes", workload: true })]
        },
        {
            id: "BILINGUAL_TEAMMATE",
            label: "Apoyarte en un compañero bilingüe",
            intentTags: ["locker", "support", "dependency"],
            primaryMessage: "El vestuario se convierte en puente social y avanzas sin aislarte del grupo.",
            secondaryMessage: "La ayuda funciona, pero dependes demasiado de una persona para conversaciones que deberías dominar tú.",
            primaryEffects: [n("professional.foreignAdaptation", 7), n("professional.lockerPower", 3), n("professional.environmentStability", 3)],
            secondaryEffects: [n("professional.foreignAdaptation", 5), n("professional.lockerPower", 2), n("professional.environmentStability", 1)],
            primarySeedTransitions: [seedCreate("SEED_FOREIGN_ADAPT", 58, { method: "bilingual_teammate" })],
            secondarySeedTransitions: [seedCreate("SEED_FOREIGN_ADAPT", 55, { method: "bilingual_teammate", dependency: true })]
        },
        {
            id: "BRIDGE_LANGUAGE",
            label: "Usar un idioma puente y aprender sobre la marcha",
            intentTags: ["football_first", "improvisation", "risk"],
            primaryMessage: "Mantienes el foco en el fútbol y aprendes lo suficiente para moverte sin convertir el idioma en otra obligación diaria.",
            secondaryMessage: "La solución práctica basta hasta que una instrucción, un trámite o un matiz importante no se traduce bien.",
            primaryEffects: [n("professional.foreignAdaptation", 4), n("sport.roleScore", 2)],
            secondaryEffects: [n("professional.foreignAdaptation", 2), n("professional.institutionalTrust", -2), n("professional.environmentStability", -2)],
            primarySeedTransitions: [seedCreate("SEED_FOREIGN_ADAPT", 50, { method: "bridge_language" })],
            secondarySeedTransitions: [seedCreate("SEED_FOREIGN_ADAPT", 55, { method: "bridge_language", misunderstanding: true })]
        },
        {
            id: "CLUB_MENTOR",
            label: "Pedir al club un mentor local para tu día a día",
            intentTags: ["club_support", "integration", "privacy"],
            primaryMessage: "El apoyo local resuelve problemas prácticos y te integra sin depender solo del vestuario.",
            secondaryMessage: "La ayuda institucional facilita la vida, aunque una parte de tu rutina queda más cerca de la estructura del club.",
            primaryEffects: [n("professional.foreignAdaptation", 7), n("professional.institutionalTrust", 4), n("professional.environmentStability", 4)],
            secondaryEffects: [n("professional.foreignAdaptation", 5), n("professional.institutionalTrust", 2), n("professional.agentControl", 1)],
            primarySeedTransitions: [seedCreate("SEED_FOREIGN_ADAPT", 57, { method: "club_mentor" })],
            secondarySeedTransitions: [seedCreate("SEED_FOREIGN_ADAPT", 54, { method: "club_mentor", club_dependency: true })]
        }
    ],
    seedsWrite: ["SEED_FOREIGN_ADAPT"],
    tags: ["social", "abroad", "adaptation", "canonical_t55_a"],
    canonStatus: "verified"
});
const EVT_21_RIV_001 = ambiguousEvent({
    id: "EVT_21_RIV_001",
    ageWindow: [21, 21],
    phase: "20_23",
    family: "legacy",
    title: "Adrián ya no es «el otro»",
    body: "Una comparación mediática vuelve a unir tu nombre al de Adrián Costa. Esta vez ya no sois dos promesas del mismo sitio: cada uno tiene carrera, números y gente interesada en convertir la comparación en relato.",
    visible: [
        "La comparación es pública y sabes que Adrián puede verla.",
        "Existe un antecedente real entre ambos conservado por SEED_ADRIAN_MIRROR."
    ],
    uncertain: [
        "No sabes si Adrián vive la comparación como reconocimiento, provocación o simple ruido.",
        "Tampoco sabes qué parte del titular nace de periodistas, agencias o del interés de terceros."
    ],
    gates: [
        { path: "flags.HAS_SEED_ADRIAN_MIRROR", op: "eq", value: true },
        { path: "professional.nationalHeat", op: "gte", value: 18 }
    ],
    timeWindow: { months: [10, 11, 2, 3] },
    weight: 16,
    choices: [
        {
            id: "PRAISE_ADRIAN",
            label: "Elogiar a Adrián y separar las carreras",
            intentTags: ["respect", "public", "deescalate"],
            primaryMessage: "Tu respuesta baja el tono competitivo sin negar que ambos estáis creciendo.",
            secondaryMessage: "El elogio se interpreta como diplomacia, pero algunos medios lo convierten en otra forma de compararos.",
            primaryEffects: [n("professional.environmentStability", 3), n("reputation.mediaHeat", -1)],
            secondaryEffects: [n("professional.environmentStability", 2), n("reputation.mediaHeat", 2)],
            primarySeedTransitions: [intensify("SEED_ADRIAN_MIRROR", 3)],
            secondarySeedTransitions: [intensify("SEED_ADRIAN_MIRROR", 5)]
        },
        {
            id: "END_COMPARISONS",
            label: "Decir que estás cansado de las comparaciones",
            intentTags: ["boundary", "public", "privacy"],
            primaryMessage: "Marcas un límite claro y el foco vuelve durante un tiempo a tu propio rendimiento.",
            secondaryMessage: "El límite es razonable, pero el cansancio se convierte en un titular nuevo sobre vuestra relación.",
            primaryEffects: [n("reputation.mediaHeat", -2), n("professional.environmentStability", 2)],
            secondaryEffects: [n("reputation.mediaHeat", 3), n("professional.environmentStability", -1)],
            primarySeedTransitions: [intensify("SEED_ADRIAN_MIRROR", 2)],
            secondarySeedTransitions: [intensify("SEED_ADRIAN_MIRROR", 6)]
        },
        {
            id: "SPORTING_RIVALRY",
            label: "Aceptar el pique como rivalidad deportiva",
            intentTags: ["rivalry", "ambition", "public"],
            primaryMessage: "El relato competitivo aumenta el interés sin necesidad de atacar a Adrián personalmente.",
            secondaryMessage: "La rivalidad vende, pero cada tropiezo futuro queda más expuesto a la comparación directa.",
            primaryEffects: [n("reputation.marketHeat", 4), n("reputation.mediaHeat", 3), n("professional.environmentStability", -1)],
            secondaryEffects: [n("reputation.marketHeat", 3), n("reputation.mediaHeat", 5), n("professional.environmentStability", -3)],
            primarySeedTransitions: [intensify("SEED_ADRIAN_MIRROR", 8)],
            secondarySeedTransitions: [intensify("SEED_ADRIAN_MIRROR", 12)]
        },
        {
            id: "PRIVATE_MESSAGE",
            label: "Escribirle en privado y no responder públicamente",
            intentTags: ["private", "relationship", "silence"],
            primaryMessage: "Adrián recibe tu mensaje directamente y la conversación deja de depender del titular.",
            secondaryMessage: "El contacto privado reduce la tensión entre vosotros, pero el silencio público permite que otros sigan escribiendo el relato.",
            primaryEffects: [n("professional.environmentStability", 4), n("reputation.mediaHeat", -1)],
            secondaryEffects: [n("professional.environmentStability", 3), n("reputation.mediaHeat", 2)],
            primarySeedTransitions: [intensify("SEED_ADRIAN_MIRROR", 4)],
            secondarySeedTransitions: [intensify("SEED_ADRIAN_MIRROR", 5)]
        }
    ],
    seedsRead: ["SEED_ADRIAN_MIRROR"],
    seedsWrite: ["SEED_ADRIAN_MIRROR"],
    npcRefs: ["NPC_PLR_15"],
    tags: ["legacy", "adrian", "media", "distinct_scene", "canonical_t55_a"],
    canonStatus: "verified"
});
const CEVT_21_ABR_01 = ambiguousEvent({
    id: "CEVT_21_ABR_01",
    ageWindow: [21, 22],
    phase: "20_23",
    family: "conditional",
    title: "Navidad solo",
    body: "El calendario deja unos pocos días libres. Estás fuera, tu adaptación todavía no es completa y por primera vez la distancia pesa justo cuando casi todo el mundo alrededor vuelve a casa.",
    visible: [
        "Sigues en una ruta extranjera y tu adaptación está por debajo de un nivel cómodo.",
        "Sabes exactamente cuántos días de descanso tienes; no es una ventana larga."
    ],
    uncertain: [
        "No sabes si viajar te devolverá energía o hará más dura la vuelta.",
        "Tampoco sabes cuánto cambiará tu integración si te quedas cuando el vestuario se vacía."
    ],
    gates: [
        { path: "flags.ABROAD_ROUTE", op: "eq", value: true },
        { path: "professional.foreignAdaptation", op: "lt", value: 60 }
    ],
    timeWindow: { months: [12, 1] },
    weight: 14,
    choices: [
        {
            id: "GO_HOME",
            label: "Volver a casa aunque sean pocos días",
            intentTags: ["family", "recovery", "travel"],
            primaryMessage: "La visita te devuelve una sensación de normalidad y apoyo que echabas de menos.",
            secondaryMessage: "El viaje ayuda emocionalmente, pero la ida y vuelta comprimida te deja menos descanso del que imaginabas.",
            primaryEffects: [n("professional.environmentStability", 6), n("professional.foreignAdaptation", -1), n("professional.bodyLoad", 1)],
            secondaryEffects: [n("professional.environmentStability", 3), n("professional.foreignAdaptation", -2), n("professional.bodyLoad", 3)],
            primarySeedTransitions: [intensify("SEED_FOREIGN_ADAPT", 2)],
            secondarySeedTransitions: [intensify("SEED_FOREIGN_ADAPT", 4)]
        },
        {
            id: "STAY_INTEGRATE",
            label: "Quedarte y usar los días para integrarte",
            intentTags: ["adaptation", "sacrifice", "local_life"],
            primaryMessage: "La ciudad deja de ser solo el lugar donde entrenas y ganas autonomía para el resto de la temporada.",
            secondaryMessage: "Avanzas en adaptación, pero la decisión pesa más de lo esperado cuando ves a tu entorno volver con sus familias.",
            primaryEffects: [n("professional.foreignAdaptation", 8), n("professional.environmentStability", 2)],
            secondaryEffects: [n("professional.foreignAdaptation", 6), n("professional.environmentStability", -2)],
            primarySeedTransitions: [intensify("SEED_FOREIGN_ADAPT", 5)],
            secondarySeedTransitions: [intensify("SEED_FOREIGN_ADAPT", 6)]
        },
        {
            id: "CREATE_LOCAL_COMPANY",
            label: "Invitar a alguien cercano o crear compañía local",
            intentTags: ["support", "adaptation", "initiative"],
            primaryMessage: "No eliges entre origen e integración: construyes una pequeña red propia para esos días.",
            secondaryMessage: "La compañía ayuda, aunque organizarla añade coste y no resuelve por sí sola la sensación de estar entre dos lugares.",
            primaryEffects: [n("professional.foreignAdaptation", 5), n("professional.environmentStability", 5), n("professional.moneyComfort", -1)],
            secondaryEffects: [n("professional.foreignAdaptation", 4), n("professional.environmentStability", 2), n("professional.moneyComfort", -3)],
            primarySeedTransitions: [intensify("SEED_FOREIGN_ADAPT", 4)],
            secondarySeedTransitions: [intensify("SEED_FOREIGN_ADAPT", 5)]
        }
    ],
    seedsRead: ["SEED_FOREIGN_ADAPT"],
    seedsWrite: ["SEED_FOREIGN_ADAPT"],
    tags: ["conditional", "abroad", "family", "canonical_t55_a"],
    canonStatus: "verified"
});
const CEVT_21_MEDIA_01 = ambiguousEvent({
    id: "CEVT_21_MEDIA_01",
    ageWindow: [21, 22],
    phase: "20_23",
    family: "conditional",
    title: "La frase recortada",
    body: "Una respuesta larga aparece convertida en una frase más dura de lo que dijiste. El recorte ya circula. Si conservas canal con Clara, puedes darle contexto directamente; si no, todavía puedes responder por tus propios medios o dejar que el ciclo pase.",
    visible: [
        "Puedes comparar lo que dijiste con el titular que se está difundiendo.",
        "Sabes si conservas un canal previo con Clara Beltrán."
    ],
    uncertain: [
        "No sabes si el recorte nació de una edición agresiva, de una fuente interesada o de una simplificación sin intención.",
        "Tampoco sabes si corregirlo reducirá el ruido o le dará una segunda vida."
    ],
    gateAlternatives: [
        [{ path: "flags.HAS_SEED_CLARA_CHANNEL", op: "eq", value: true }],
        [{ path: "reputation.mediaHeat", op: "gte", value: 42 }],
        [{ path: "professional.nationalHeat", op: "gte", value: 40 }]
    ],
    timeWindow: { months: [8, 9, 10, 11, 12, 1, 2, 3, 4] },
    weight: 13,
    choices: [
        {
            id: "ASK_CLARA_CONTEXT",
            label: "Pedir a Clara que publique el contexto completo",
            intentTags: ["media", "context", "trusted_channel"],
            eligibility: [{ path: "flags.HAS_SEED_CLARA_CHANNEL", op: "eq", value: true }],
            primaryMessage: "Clara reconstruye la respuesta con contexto suficiente para enfriar el titular sin convertirla en una defensa tuya.",
            secondaryMessage: "El contexto aparece, pero la corrección también confirma que el titular te ha afectado y prolonga el ciclo.",
            primaryEffects: [n("reputation.mediaHeat", -4), n("professional.environmentStability", 2)],
            secondaryEffects: [n("reputation.mediaHeat", 1), n("professional.environmentStability", 1)],
            primarySeedTransitions: [intensify("SEED_CLARA_CHANNEL", 4)],
            secondarySeedTransitions: [intensify("SEED_CLARA_CHANNEL", 7)]
        },
        {
            id: "PUBLIC_CORRECTION",
            label: "Corregir públicamente la frase sin atacar al medio",
            intentTags: ["public", "boundary", "clarity"],
            primaryMessage: "Tu versión queda registrada y reduces el margen para que la frase recortada sea la única referencia.",
            secondaryMessage: "La corrección es clara, pero enfrenta dos versiones y aumenta durante unos días la atención.",
            primaryEffects: [n("reputation.mediaHeat", -2), n("professional.institutionalTrust", 1)],
            secondaryEffects: [n("reputation.mediaHeat", 4), n("professional.environmentStability", -1)]
        },
        {
            id: "CLARA_OFF_RECORD",
            label: "Dar a Clara contexto off the record y no responder aún",
            intentTags: ["private", "media", "information"],
            eligibility: [{ path: "flags.HAS_SEED_CLARA_CHANNEL", op: "eq", value: true }],
            primaryMessage: "Clara entiende mejor la situación y el siguiente contacto parte de información menos deformada, aunque no publique una rectificación inmediata.",
            secondaryMessage: "Compartes contexto útil, pero pierdes control sobre cuándo y cómo puede reaparecer en una pieza futura.",
            primaryEffects: [n("professional.environmentStability", 3), n("reputation.mediaHeat", -1)],
            secondaryEffects: [n("professional.environmentStability", 1), n("reputation.mediaHeat", 2)],
            primarySeedTransitions: [intensify("SEED_CLARA_CHANNEL", 5)],
            secondarySeedTransitions: [intensify("SEED_CLARA_CHANNEL", 8)]
        },
        {
            id: "LET_CYCLE_PASS",
            label: "No responder y dejar pasar el ciclo",
            intentTags: ["silence", "focus", "risk"],
            primaryMessage: "El titular pierde espacio cuando no encuentra una segunda declaración con la que alimentarse.",
            secondaryMessage: "El silencio evita otra polémica, pero deja la versión recortada como referencia para quien no busque más contexto.",
            primaryEffects: [n("reputation.mediaHeat", -3), n("professional.environmentStability", 2)],
            secondaryEffects: [n("reputation.mediaHeat", 1), n("professional.publicPolarization", 2)]
        }
    ],
    seedsRead: ["SEED_CLARA_CHANNEL"],
    seedsWrite: ["SEED_CLARA_CHANNEL"],
    npcRefs: ["NPC_PRS_01"],
    tags: ["conditional", "media", "clara", "gate_or", "distinct_scene", "canonical_t55_a"],
    canonStatus: "verified"
});
export const T55A_PRINCIPALS = [EVT_20_LIFE_001, EVT_20_ABR_001, EVT_21_RIV_001];
export const T55A_CONDITIONALS = [CEVT_21_ABR_01, CEVT_21_MEDIA_01];
export const T55A_IDS = [...T55A_PRINCIPALS, ...T55A_CONDITIONALS].map(event => event.id);
