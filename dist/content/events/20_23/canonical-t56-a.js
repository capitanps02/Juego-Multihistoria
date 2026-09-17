import { ambiguousEvent, n, seedCreate } from "../18_20/helpers.js";
const EVT_20_STATUS_001 = ambiguousEvent({
    id: "EVT_20_STATUS_001",
    ageWindow: [20, 20],
    phase: "20_23",
    family: "team",
    title: "El dorsal libre",
    body: "Material confirma que un dorsal con peso simbólico queda libre esta temporada. Tu rol ya permite pedirlo, pero un veterano del vestuario cree que ese número debería conservar una jerarquía que todavía no has ganado.",
    visible: [
        "El dorsal está realmente disponible; no se trata de un rumor ni de quitárselo a un jugador inscrito.",
        "Tu rol deportivo actual te permite plantear la petición, pero el club no te ha prometido el número."
    ],
    uncertain: [
        "No sabes si el veterano habla por una parte amplia del vestuario o solo expresa una preferencia personal.",
        "Tampoco sabes si pedir el dorsal se leerá como ambición normal o como una declaración de estatus prematura."
    ],
    gates: [{ path: "sport.roleScore", op: "gte", value: 35 }],
    timeWindow: { months: [7, 8] },
    weight: 17,
    choices: [
        {
            id: "ASK_NUMBER",
            label: "Pedir el dorsal directamente",
            intentTags: ["status", "ambition", "direct"],
            primaryMessage: "Tratas el dorsal como una decisión deportiva y administrativa, no como un permiso social. Si el club acepta, asumes también la exposición que representa.",
            secondaryMessage: "La petición es legítima, pero una parte del grupo la interpreta como una forma de acelerar una jerarquía que todavía está en disputa.",
            primaryEffects: [n("professional.roleSecurity", 2), n("professional.lockerPower", 4)],
            secondaryEffects: [n("professional.lockerPower", -3), n("professional.environmentStability", -2)]
        },
        {
            id: "COACH_FIRST",
            label: "Aceptarlo solo si el técnico lo propone",
            intentTags: ["status", "coach", "caution"],
            primaryMessage: "Trasladas el coste simbólico al criterio deportivo del técnico y evitas convertir el número en una reivindicación personal.",
            secondaryMessage: "La prudencia reduce fricción, aunque también deja que otros definan cuándo estás preparado para ocupar ese espacio.",
            primaryEffects: [n("professional.institutionalTrust", 3), n("professional.environmentStability", 2)],
            secondaryEffects: [n("professional.roleSecurity", 1), n("professional.lockerPower", -1)]
        },
        {
            id: "KEEP_NUMBER",
            label: "Mantener tu dorsal actual",
            intentTags: ["continuity", "identity", "stability"],
            primaryMessage: "Renuncias a usar el dorsal como señal de ascenso y conviertes la continuidad en parte de tu identidad dentro del equipo.",
            secondaryMessage: "Evitas una batalla pequeña, pero también dejas pasar una oportunidad de hacer visible que tu rol ya ha cambiado.",
            primaryEffects: [n("professional.environmentStability", 4), n("professional.lockerPower", 1)],
            secondaryEffects: [n("professional.environmentStability", 2), n("professional.lockerPower", -1)]
        },
        {
            id: "SPEAK_VETERAN",
            label: "Hablar antes con el veterano que se opone",
            intentTags: ["status", "locker", "dialogue"],
            primaryMessage: "No le concedes veto, pero buscas saber qué representa realmente su objeción antes de decidir. La conversación puede separar tradición de simple territorialidad.",
            secondaryMessage: "El gesto reduce tensión si hay buena fe; si el veterano buscaba marcar jerarquía, también le confirma que su opinión pesa sobre tu decisión.",
            primaryEffects: [n("professional.lockerPower", 3), n("professional.environmentStability", 3)],
            secondaryEffects: [n("professional.lockerPower", 1), n("professional.environmentStability", -1)]
        }
    ],
    tags: ["status", "shirt_number", "locker", "canonical_t56_a"],
    canonStatus: "verified"
});
const EVT_20_LOCK_001 = ambiguousEvent({
    id: "EVT_20_LOCK_001",
    ageWindow: [20, 20],
    phase: "20_23",
    family: "team",
    title: "Un golpe de entrenamiento",
    body: "En un ejercicio competitivo, un compañero llega tarde y fuerte dos veces seguidas. El segundo golpe no te lesiona, pero ya no parece accidental. El entrenador deja seguir la tarea y el resto del grupo mira cómo respondes.",
    visible: [
        "Los contactos han ocurrido delante del grupo y el segundo es claramente evitable.",
        "No estás lesionado y puedes continuar la sesión; la decisión no es médica sino de límites y jerarquía."
    ],
    uncertain: [
        "No sabes si el compañero intenta probarte, está frustrado contigo o simplemente compite mal ese día.",
        "No sabes qué respuesta respetará más el vestuario: aguantar, devolver intensidad o marcar un límite sin escalar."
    ],
    gates: [{ path: "professional.lockerPower", op: "lte", value: 55 }],
    timeWindow: { months: [8, 9, 10, 11, 1, 2, 3] },
    weight: 18,
    choices: [
        {
            id: "PLAY_ON",
            label: "Seguir sin decir nada",
            intentTags: ["restraint", "training", "absorb"],
            primaryMessage: "No alimentas el choque y mantienes el ejercicio en lo deportivo. Algunos interpretan que no necesitas responder para competir.",
            secondaryMessage: "Si el golpe era una prueba de límites, el silencio puede convertirse en una invitación a repetirla.",
            primaryEffects: [n("professional.environmentStability", 3), n("professional.lockerPower", 1)],
            secondaryEffects: [n("professional.lockerPower", -3), n("professional.environmentStability", -1)]
        },
        {
            id: "MATCH_INTENSITY",
            label: "Devolver la intensidad dentro del ejercicio",
            intentTags: ["competition", "boundary", "physical"],
            primaryMessage: "Respondes en el mismo lenguaje competitivo sin parar la sesión. El grupo entiende que no rehúyes el contacto.",
            secondaryMessage: "La frontera entre competir y ajustar cuentas se vuelve más estrecha y cualquier tercer choque puede escalar el problema.",
            primaryEffects: [n("professional.lockerPower", 5), n("professional.environmentStability", -1)],
            secondaryEffects: [n("professional.lockerPower", 2), n("professional.environmentStability", -4)]
        },
        {
            id: "PUBLIC_BOUNDARY",
            label: "Parar y marcar el límite delante del grupo",
            intentTags: ["boundary", "public", "leadership"],
            primaryMessage: "Nombras el problema sin devolver el golpe y haces visible qué intensidad aceptas. Ganas claridad, aunque conviertes un roce en asunto de grupo.",
            secondaryMessage: "Si el compañero se siente expuesto, el límite público puede protegerte hoy y abrir una fricción más larga mañana.",
            primaryEffects: [n("professional.lockerPower", 6), n("professional.environmentStability", -1)],
            secondaryEffects: [n("professional.lockerPower", 3), n("professional.environmentStability", -5)]
        },
        {
            id: "PRIVATE_AFTER",
            label: "Hablar a solas al terminar",
            intentTags: ["boundary", "private", "deescalation"],
            primaryMessage: "Mantienes la sesión limpia y después preguntas directamente qué estaba pasando. Proteges la dignidad de ambos sin renunciar al límite.",
            secondaryMessage: "La vía privada reduce espectáculo, pero el grupo no ve la conversación y puede construir su propia lectura del silencio inicial.",
            primaryEffects: [n("professional.environmentStability", 4), n("professional.lockerPower", 3)],
            secondaryEffects: [n("professional.environmentStability", 2), n("professional.lockerPower", 1)]
        }
    ],
    tags: ["locker", "training", "boundary", "canonical_t56_a"],
    canonStatus: "verified"
});
const EVT_20_LOCK_002 = ambiguousEvent({
    id: "EVT_20_LOCK_002",
    ageWindow: [20, 20],
    phase: "20_23",
    family: "team",
    title: "Cubre a Marcos",
    body: "Marcos, un compañero con el que has hecho buenas migas, llega tarde a una actividad interna y te pide que confirmes una versión concreta. Tú viste lo ocurrido y sabes que uno de los detalles que quiere que repitas es falso. La infracción es menor; mentir por él no lo es tanto.",
    visible: [
        "Conoces de primera mano qué parte de la versión de Marcos es falsa.",
        "El incidente es disciplinario y menor; no estás encubriendo una lesión, delito, dopaje ni una obligación contractual."
    ],
    uncertain: [
        "No sabes qué intenta proteger Marcos con ese detalle ni si existe una razón que todavía no te ha contado.",
        "Tampoco sabes si negarte dañará una amistad real o evitará convertir un favor pequeño en una deuda mayor."
    ],
    timeWindow: { months: [9, 10, 11, 1, 2, 3] },
    weight: 17,
    choices: [
        {
            id: "CONFIRM_STORY",
            label: "Confirmar su versión",
            intentTags: ["loyalty", "cover", "risk"],
            primaryMessage: "Priorizas la lealtad inmediata y asumes como propia una parte del relato que sabes falsa.",
            secondaryMessage: "El favor acerca a Marcos, pero si el detalle se comprueba después, tu credibilidad queda ligada a una mentira que no necesitabas contar.",
            primaryEffects: [n("professional.lockerPower", 4), n("professional.environmentStability", 1)],
            secondaryEffects: [n("professional.lockerPower", 1), n("professional.institutionalTrust", -4)],
            primarySeedTransitions: [seedCreate("SEED_TEAMMATE_COVER", 70, { stance: "confirm_story", truth: "known_false_detail" })],
            secondarySeedTransitions: [seedCreate("SEED_TEAMMATE_COVER", 76, { stance: "confirm_story", credibility_risk: true })]
        },
        {
            id: "REFUSE_NO_EXPOSE",
            label: "Negarte sin delatarlo",
            intentTags: ["loyalty", "truth", "boundary"],
            primaryMessage: "No confirmas una falsedad y tampoco entregas información adicional. Intentas conservar a la vez tu credibilidad y la dignidad de Marcos.",
            secondaryMessage: "La frontera es limpia, pero Marcos puede sentir que en el momento concreto en que pidió ayuda elegiste protegerte a ti mismo.",
            primaryEffects: [n("professional.institutionalTrust", 3), n("professional.environmentStability", 1)],
            secondaryEffects: [n("professional.lockerPower", -2), n("professional.environmentStability", -1)],
            primarySeedTransitions: [seedCreate("SEED_TEAMMATE_COVER", 58, { stance: "refuse_without_exposing" })],
            secondarySeedTransitions: [seedCreate("SEED_TEAMMATE_COVER", 62, { stance: "refuse_without_exposing", friendship_cost: true })]
        },
        {
            id: "SAY_DONT_KNOW",
            label: "Decir que no sabes qué pasó",
            intentTags: ["avoidance", "cover", "ambiguity"],
            primaryMessage: "Evitas repetir el detalle falso y tampoco contradices a Marcos. Compras distancia a costa de fingir menos conocimiento del que realmente tienes.",
            secondaryMessage: "La ambigüedad te saca del centro hoy, pero deja una pequeña contradicción disponible si alguien sabe que estabas presente.",
            primaryEffects: [n("professional.environmentStability", 2), n("professional.institutionalTrust", -1)],
            secondaryEffects: [n("professional.environmentStability", -1), n("professional.institutionalTrust", -2)],
            primarySeedTransitions: [seedCreate("SEED_TEAMMATE_COVER", 54, { stance: "claim_not_to_know" })],
            secondarySeedTransitions: [seedCreate("SEED_TEAMMATE_COVER", 58, { stance: "claim_not_to_know", contradiction_risk: true })]
        },
        {
            id: "ASK_WHAT_HIDES",
            label: "Preguntar primero qué intenta ocultar",
            intentTags: ["information", "loyalty", "delay"],
            primaryMessage: "No prometes cubrirle. Exiges entender por qué te pide mentir antes de decidir si existe otra forma de ayudar.",
            secondaryMessage: "La pregunta puede revelar una razón atendible o confirmar que solo busca trasladarte parte del riesgo disciplinario.",
            primaryEffects: [n("professional.lockerPower", 2), n("professional.environmentStability", 2)],
            secondaryEffects: [n("professional.lockerPower", 1)],
            primarySeedTransitions: [seedCreate("SEED_TEAMMATE_COVER", 60, { stance: "ask_before_cover" })],
            secondarySeedTransitions: [seedCreate("SEED_TEAMMATE_COVER", 60, { stance: "ask_before_cover", motive_unclear: true })]
        }
    ],
    seedsWrite: ["SEED_TEAMMATE_COVER"],
    npcRefs: [],
    tags: ["locker", "truth", "loyalty", "canonical_t56_a"],
    canonStatus: "verified"
});
export const T56A_PRINCIPALS = [
    EVT_20_STATUS_001,
    EVT_20_LOCK_001,
    EVT_20_LOCK_002
];
