/**
 * Multihistoria Engine v0.8 — PlayCanvas Bundle
 * Generated: 2026-09-14T11:28:36.164Z
 * Modules: 62
 */
var MultihistoriaEngine = (function() {

// ═══ core/types.js ═══


// ═══ core/build.js ═══
var ENGINE_BUILD = "0.8.0-t2.2";


// ═══ core/rng.js ═══
// Mulberry32-like deterministic stream, persisted as part of the save.
class DeterministicRng {
    stream;
    constructor(stream) {
        this.stream = stream;
    }
    next() {
        let t = this.stream.state += 0x6D2B79F5;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        const out = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        this.stream.draws++;
        return out;
    }
    pickWeighted(items) {
        const valid = items.filter(x => Number.isFinite(x.weight) && x.weight > 0);
        if (!valid.length)
            throw new Error("No weighted candidates available");
        const total = valid.reduce((s, x) => s + x.weight, 0);
        const draw = this.next();
        let cursor = draw * total;
        for (const x of valid) {
            cursor -= x.weight;
            if (cursor <= 0)
                return { item: x.item, draw };
        }
        return { item: valid[valid.length - 1].item, draw };
    }
}
function makeRngStream(seed, salt) {
    const mixed = (seed ^ salt ^ 0x9E3779B9) >>> 0;
    return { seed, state: mixed || 1, draws: 0 };
}


// ═══ core/path.js ═══
function relationshipLookup(root, path) {
    if (!path.startsWith("rel."))
        return undefined;
    const [, npcId, axis] = path.split(".");
    if (!npcId || !axis || !root || typeof root !== "object")
        return undefined;
    const relationships = root.relationships;
    if (!Array.isArray(relationships))
        return undefined;
    const relation = relationships.find(r => r.npcId === npcId);
    return relation ? relation[axis] : undefined;
}
function getPath(root, path) {
    if (path.startsWith("rel."))
        return relationshipLookup(root, path);
    return path.split(".").reduce((acc, key) => {
        if (acc && typeof acc === "object" && key in acc) {
            return acc[key];
        }
        return undefined;
    }, root);
}
function setPath(root, path, value) {
    if (path.startsWith("rel.")) {
        const [, npcId, axis] = path.split(".");
        const relationships = root.relationships;
        if (!npcId || !axis || !Array.isArray(relationships))
            throw new Error(`Invalid relationship path: ${path}`);
        const relation = relationships.find(r => r.npcId === npcId);
        if (!relation)
            throw new Error(`Unknown relationship target: ${npcId}`);
        relation[axis] = value;
        return;
    }
    const keys = path.split(".");
    let cursor = root;
    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (!cursor[key] || typeof cursor[key] !== "object")
            cursor[key] = {};
        cursor = cursor[key];
    }
    cursor[keys[keys.length - 1]] = value;
}


// ═══ core/conditions.js ═══
function compare(actual, c) {
    switch (c.op) {
        case "exists": return actual !== undefined && actual !== null;
        case "eq": return actual === c.value;
        case "neq": return actual !== c.value;
        case "gt": return typeof actual === "number" && typeof c.value === "number" && actual > c.value;
        case "gte": return typeof actual === "number" && typeof c.value === "number" && actual >= c.value;
        case "lt": return typeof actual === "number" && typeof c.value === "number" && actual < c.value;
        case "lte": return typeof actual === "number" && typeof c.value === "number" && actual <= c.value;
        case "in": return Array.isArray(c.value) && c.value.includes(actual);
        case "notIn": return Array.isArray(c.value) && !c.value.includes(actual);
    }
}
function conditionsPass(root, conditions = []) {
    return conditions.every(c => compare(getPath(root, c.path), c));
}


// ═══ core/composites.js ═══
const clamp = (n) => Math.max(0, Math.min(100, n));
const num = (v, fallback = 0) => typeof v === "number" ? v : fallback;
const rel = (s, id) => s.relationships.find(r => r.npcId === id);
function calculateCompositeMetrics(state) {
    const coach = rel(state, "NPC_CCH_01");
    const mena = rel(state, "NPC_CCH_02");
    const vela = rel(state, "NPC_PLR_10");
    const bruno = rel(state, "NPC_PLR_12");
    const role = num(state.sport.roleScore, 18);
    const market = num(state.reputation.marketHeat, 5);
    const prestige = num(state.reputation.prestige, 8);
    const cash = num(state.finances.cash, 1200);
    return {
        ROLE: clamp(role),
        TRUST_CCH: clamp(((coach?.trust ?? 50) * 0.65) + ((mena?.trust ?? 50) * 0.35)),
        MARKET_HEAT: clamp(market),
        LEVERAGE: clamp(num(state.control.career, 8) * 0.5 + market * 0.3 + Math.min(30, cash / 10000) + prestige * 0.2),
        BODY_RISK: clamp(num(state.body.risk, 18)),
        PUBLIC_HEAT: clamp(num(state.reputation.mediaHeat, 3)),
        LOCKER_WEIGHT: clamp(((vela?.respect ?? 50) + (bruno?.respect ?? 50)) / 2 + num(state.sport.minutesShare, 0) * 0.25)
    };
}


// ═══ catalog/npcs.js ═══
var NPC_CATALOG = [
    { id: "NPC_DIR_01", name: "Marta Valcárcel", role: "Presidenta UDV", visibleGoal: "Modernizar sin perder control.", privateAgenda: "Necesita cerrar el agujero financiero sin admitir debilidad; puede vender proyecto de cantera y a la vez monetizarla.", evolution: "Protectora, rival institucional o salida del club.", initialClub: "UDV" },
    { id: "NPC_DIR_02", name: "Óscar Ferrer", role: "Director deportivo", visibleGoal: "Plantilla barata que sobreviva.", privateAgenda: "Su posición mejora con balance positivo de traspasos; tenderá a valorar ventas más de lo que reconoce.", evolution: "Puede llegar a un club mayor y recordar negociaciones.", initialClub: "UDV" },
    { id: "NPC_CCH_01", name: "Darío Montalbán", role: "Entrenador", visibleGoal: "Permanencia y control.", privateAgenda: "Su renovación depende del resultado inmediato; desconfía del riesgo táctico de los jóvenes.", evolution: "Puede consolidar, bloquear o reencontrar al jugador.", initialClub: "UDV" },
    { id: "NPC_CCH_02", name: "Sergio Mena", role: "Segundo entrenador", visibleGoal: "Demostrar que puede dirigir.", privateAgenda: "Ve valor en datos y jóvenes, pero no quiere quemar su carrera contradiciendo al jefe.", evolution: "Entrenador principal futuro plausible.", initialClub: "UDV" },
    { id: "NPC_ACA_01", name: "Julián Rivas", role: "Técnico de cantera", visibleGoal: "Oportunidades reales para canteranos.", privateAgenda: "Resentimiento hacia agentes y directivos que, según él, venden demasiado pronto.", evolution: "Mentor sincero pero sesgado.", initialClub: "UDV" },
    { id: "NPC_MED_01", name: "Paula Requena", role: "Fisioterapeuta", visibleGoal: "Proteger salud y disponibilidad.", privateAgenda: "Su reputación depende de no forzar jugadores; puede chocar con técnico o futbolista.", evolution: "Clave en lesiones y confidencialidad.", initialClub: "UDV" },
    { id: "NPC_PLR_10", name: "Tomás Vela", role: "Central y capitán", visibleGoal: "Cerrar su carrera con dignidad.", privateAgenda: "Valora licencias de entrenador y sospecha que quieren apartarlo para liberar salario.", evolution: "Mentor, antagonista, técnico o director años después.", initialClub: "UDV" },
    { id: "NPC_PLR_11", name: "Leo Barreiro", role: "Portero y vicecapitán", visibleGoal: "Estabilidad del grupo.", privateAgenda: "Evita guerras públicas, pero guarda memoria de quien rompe códigos de vestuario.", evolution: "Influencia interna y posible veterano de referencia.", initialClub: "UDV" },
    { id: "NPC_PLR_12", name: "Bruno Leal", role: "Extremo derecho titular", visibleGoal: "Lograr un último salto.", privateAgenda: "Compite con el protagonista y tiene una promesa privada de salida si llega una oferta razonable.", evolution: "Mentor, bloqueo, venta o rival futuro.", initialClub: "UDV" },
    { id: "NPC_PLR_13", name: "Mamadou Diarra", role: "Centrocampista", visibleGoal: "Jugar y progresar.", privateAgenda: "Observador social; comparte información si confía y evita bandos hasta que le afectan.", evolution: "Puente de vestuario y extranjero.", initialClub: "UDV" },
    { id: "NPC_PLR_14", name: "Iván «Nano» Serrano", role: "Delantero canterano", visibleGoal: "Debutar junto a su amigo.", privateAgenda: "Impulsivo; teme quedarse atrás si el protagonista despega.", evolution: "Amistad, rivalidad, caída o carrera paralela.", initialClub: "UDV" },
    { id: "NPC_PLR_15", name: "Adrián Costa", role: "Mediapunta/extremo canterano", visibleGoal: "Ser la verdadera joya de Cerro Alto.", privateAgenda: "Percibe trato desigual; una gran agencia también lo observa.", evolution: "Rival espejo o aliado inesperado.", initialClub: "UDV" },
    { id: "NPC_AGT_01", name: "Héctor Salvatierra", role: "Agente local", visibleGoal: "Conseguir un cliente bandera.", privateAgenda: "Tiene relación comercial fuerte con un club de Segunda; su mejor consejo puede beneficiarle también.", evolution: "Primer agente plausible.", initialClub: null },
    { id: "NPC_AGT_02", name: "Lucía Falcón", role: "Agente, Prisma Sports", visibleGoal: "Captar talento antes de que se encarezca.", privateAgenda: "Solo invertirá recursos fuertes en uno de los dos jóvenes; usa prensa y contactos con agresividad.", evolution: "Ruta de poder y menor cercanía.", initialClub: null },
    { id: "NPC_PRS_01", name: "Clara Beltrán", role: "Periodista local", visibleGoal: "Saltar a prensa nacional.", privateAgenda: "Necesita exclusivas; puede respetar al jugador y publicar algo que le perjudique.", evolution: "Aliada informativa o relación transaccional.", initialClub: null },
    { id: "NPC_PRS_02", name: "Raúl Carrión", role: "Locutor deportivo", visibleGoal: "Audiencia e influencia.", privateAgenda: "Premia conflicto y cambia de tono según el sentir de la afición.", evolution: "Amplificador de reputación.", initialClub: null },
    { id: "NPC_FAM_01", name: "Elena", role: "Madre", visibleGoal: "Futuro y estabilidad.", privateAgenda: "Desconfía de promesas; valora formación y contratos seguros.", evolution: "Su prudencia puede salvar o cerrar oportunidades.", initialClub: null },
    { id: "NPC_FAM_02", name: "Julián", role: "Padre", visibleGoal: "Que aproveche la oportunidad.", privateAgenda: "Exjugador regional; proyecta parte de su arrepentimiento.", evolution: "Apoyo, presión o conflicto.", initialClub: null },
    { id: "NPC_FAM_03", name: "Mara", role: "Hermana menor", visibleGoal: "Relación normal con su hermano.", privateAgenda: "Entiende redes y detecta cambios de fama que los adultos no ven.", evolution: "Termómetro social/familiar.", initialClub: null },
    { id: "NPC_SOC_01", name: "Dani Lucas", role: "Amigo de infancia", visibleGoal: "Que no desaparezca la amistad.", privateAgenda: "Busca normalidad y diversión incluso cuando el calendario lo hace arriesgado.", evolution: "Apoyo, distracción o vínculo con Valdoria.", initialClub: null }
];
const BASAL = {
    NPC_CCH_01: { trust: 42, affinity: 45, respect: 45, leverage: 65 },
    NPC_CCH_02: { trust: 52, affinity: 52, respect: 55, leverage: 45 },
    NPC_ACA_01: { trust: 68, affinity: 65, respect: 76, leverage: 30 },
    NPC_PLR_10: { trust: 48, affinity: 48, respect: 50, leverage: 45 },
    NPC_PLR_12: { trust: 47, affinity: 52, respect: 52, leverage: 35 },
    NPC_PLR_14: { trust: 74, affinity: 82, respect: 58, leverage: 10 },
    NPC_PLR_15: { trust: 42, affinity: 45, respect: 54, resentment: 8, leverage: 10 },
    NPC_AGT_01: { trust: 35, affinity: 40, respect: 42, leverage: 20 },
    NPC_AGT_02: { trust: 30, affinity: 35, respect: 50, leverage: 20 },
    NPC_PRS_01: { trust: 35, affinity: 40, respect: 42, leverage: 15 },
    NPC_FAM_01: { trust: 82, affinity: 90, respect: 75, leverage: 35 },
    NPC_FAM_02: { trust: 78, affinity: 88, respect: 70, leverage: 38 },
    NPC_FAM_03: { trust: 82, affinity: 92, respect: 68, leverage: 8 },
    NPC_SOC_01: { trust: 78, affinity: 88, respect: 60, leverage: 8 }
};
function instantiateNpcStates() {
    return NPC_CATALOG.map(n => ({
        id: n.id,
        role: n.role,
        club: n.initialClub ?? null,
        careerState: "active",
        trustAxes: {},
        agenda: [n.privateAgenda],
        knowledge: {},
        reliability: 50,
        access: n.initialClub === "UDV" ? 65 : 35,
        memories: []
    }));
}
function instantiateRelationships() {
    return NPC_CATALOG.map(n => ({
        npcId: n.id,
        trust: BASAL[n.id]?.trust ?? 50,
        affinity: BASAL[n.id]?.affinity ?? 50,
        respect: BASAL[n.id]?.respect ?? 50,
        resentment: BASAL[n.id]?.resentment ?? 0,
        leverage: BASAL[n.id]?.leverage ?? 20,
        memories: []
    }));
}


// ═══ catalog/seeds.js ═══
var SEED_CATALOG_18_20 = [
    { id: "SEED_RIVAS_TRUST", originEvents: ["EVT_18_PRE_001", "EVT_18_PRE_002"], npcRefs: ["NPC_ACA_01"], ageWindow: [18, null], description: "Confianza temprana en Rivas como mentor y fuente de contexto." },
    { id: "SEED_MENA_EARLY_READ", originEvents: ["EVT_18_PRE_003", "EVT_18_MATCH_001"], npcRefs: ["NPC_CCH_02"], ageWindow: [18, 30], description: "Primera lectura de Mena sobre la inteligencia táctica y competitiva del protagonista." },
    { id: "SEED_BRUNO_FAVOR", originEvents: ["EVT_18_TEAM_001"], npcRefs: ["NPC_PLR_12"], ageWindow: [18, 32], description: "Favor, negativa o uso oportunista de una noche con ojeadores." },
    { id: "SEED_VELA_STANCE", originEvents: ["EVT_18_CAP_001"], npcRefs: ["NPC_PLR_10"], ageWindow: [18, null], description: "Posición adoptada cuando el capitán choca con la dirección." },
    { id: "SEED_CLARA_CHANNEL", originEvents: ["EVT_18_PRS_001", "EVT_18_PRS_002"], npcRefs: ["NPC_PRS_01"], ageWindow: [18, null], description: "Canal de información mutuo; acceso y riesgo de filtraciones." },
    { id: "SEED_FIRST_AGENT", originEvents: ["EVT_18_AGT_001"], npcRefs: ["NPC_AGT_01", "NPC_AGT_02"], ageWindow: [18, 35], description: "Quién entró primero en la carrera y cómo se negoció." },
    { id: "SEED_FIRST_LEAK", originEvents: ["EVT_18_MKT_001", "EVT_18_JAN_001", "EVT_18_CAP_001"], npcRefs: ["NPC_PRS_01", "NPC_DIR_02"], ageWindow: [18, 30], description: "Primera vez que el jugador usa o tolera una filtración como palanca." },
    { id: "SEED_PHYSIO_CONFIDENCE", originEvents: ["EVT_18_MED_001"], npcRefs: ["NPC_MED_01"], ageWindow: [18, 35], description: "Confidencialidad y sinceridad sobre molestias." },
    { id: "SEED_DANI_NORMALITY", originEvents: ["EVT_18_SOC_001", "EVT_19_SUM_001"], npcRefs: ["NPC_SOC_01"], ageWindow: [18, 30], description: "Cómo cambia la amistad cuando aparecen fama y disciplina profesional." },
    { id: "SEED_COACH_PUBLIC", originEvents: ["EVT_18_END_001", "EVT_18_END_002"], npcRefs: ["NPC_CCH_01"], ageWindow: [18, 32], description: "Apoyo, distancia o silencio cuando el técnico está cuestionado." },
    { id: "SEED_EXIT_STYLE_UDV", originEvents: ["EVT_18_SUM_001", "EVT_19_MKT_001"], npcRefs: ["NPC_DIR_02"], ageWindow: [19, null], description: "No importa solo irse o quedarse, sino cómo se negoció y comunicó." },
    { id: "SEED_ADRIAN_MIRROR", originEvents: ["EVT_19_RIV_001", "EVT_19_MEDIA_001"], npcRefs: ["NPC_PLR_15"], ageWindow: [19, 31], description: "Competencia, alianza o humillación mutua entre dos canteranos." },
    { id: "SEED_NANO_SHADOW", originEvents: ["EVT_18_PRE_001", "EVT_19_TEAM_001"], npcRefs: ["NPC_PLR_14"], ageWindow: [18, 35], description: "El amigo puede sentirse protegido, eclipsado o utilizado." },
    { id: "SEED_AGENT_OMISSION", originEvents: ["EVT_19_AGENT_001"], npcRefs: ["NPC_AGT_01", "NPC_AGT_02"], ageWindow: [19, 35], description: "Respuesta al descubrir que una información no llegó a tiempo." },
    { id: "SEED_BODY_PRECEDENT", originEvents: ["EVT_18_PRE_002", "EVT_18_MED_001", "EVT_19_BODY_001"], npcRefs: ["NPC_MED_01"], ageWindow: [18, 35], description: "Patrón de ocultar, comunicar o sobreproteger molestias; modifica riesgos futuros." },
    { id: "SEED_FIRST_BIG_MONEY", originEvents: ["EVT_20_LIFE_001", "EVT_21_MONEY_001"], npcRefs: ["NPC_FAM_01", "NPC_FAM_02"], ageWindow: [20, null], description: "Primer salto salarial y patrón de gasto, ahorro o apoyo familiar." },
    { id: "SEED_AGENT_POWER", originEvents: ["EVT_20_AGT_001", "EVT_21_AGT_002"], npcRefs: ["NPC_AGT_01", "NPC_AGT_02"], ageWindow: [20, 35], description: "Cuánto control cedió el jugador sobre llamadas, filtraciones y negociación." },
    { id: "SEED_FOREIGN_ADAPT", originEvents: ["EVT_20_ABR_001", "EVT_21_ABR_001"], npcRefs: [], ageWindow: [20, 32], description: "Idioma, red social, adaptación y forma de pedir ayuda fuera." },
    { id: "SEED_MEDICAL_DISCLOSURE", originEvents: ["EVT_20_MED_001", "EVT_22_MED_001"], npcRefs: ["NPC_MED_01"], ageWindow: [20, 35], description: "Patrón de transparencia médica en fichajes y disponibilidad." },
    { id: "SEED_TEAMMATE_COVER", originEvents: ["EVT_20_LOCK_002"], npcRefs: [], ageWindow: [20, 34], description: "Mentir, callar o desmarcarse para proteger a un compañero." },
    { id: "SEED_FIRST_CAPTAIN_ROOM", originEvents: ["EVT_21_CAP_001"], npcRefs: ["NPC_PLR_11"], ageWindow: [21, 36], description: "Primera entrada real en una decisión de jerarquía adulta." },
    { id: "SEED_PUBLIC_CONTRACT", originEvents: ["EVT_21_PRS_001"], npcRefs: ["NPC_PRS_01"], ageWindow: [21, 32], description: "Uso público o negación de cifras y condiciones contractuales." },
    { id: "SEED_FAMILY_MONEY", originEvents: ["EVT_21_MONEY_001"], npcRefs: ["NPC_FAM_01", "NPC_FAM_02"], ageWindow: [21, null], description: "Dinero y dependencia económica cambian el equilibrio familiar." },
    { id: "SEED_SELECTION_SNUB", originEvents: ["EVT_21_NAT_001"], npcRefs: [], ageWindow: [21, 30], description: "Reacción a una convocatoria o ausencia importante." },
    { id: "SEED_SPONSOR_IMAGE", originEvents: ["EVT_21_IMG_001"], npcRefs: [], ageWindow: [21, 35], description: "Primera cesión consciente de imagen y contradicciones futuras." },
    { id: "SEED_TACTICAL_SACRIFICE", originEvents: ["EVT_21_CCH_002", "EVT_22_TACT_001"], npcRefs: ["NPC_CCH_02"], ageWindow: [21, 34], description: "Aceptar un rol útil que reduce números o rechazarlo para proteger perfil." },
    { id: "SEED_DEADLINE_DAY", originEvents: ["EVT_22_DDL_001"], npcRefs: ["NPC_AGT_01", "NPC_AGT_02"], ageWindow: [22, 35], description: "Conducta del jugador cuando solo quedan horas de mercado." },
    { id: "SEED_LOCKER_VOTE", originEvents: ["EVT_22_LOCK_001"], npcRefs: ["NPC_PLR_11"], ageWindow: [22, 36], description: "Posición en una disputa interna sobre primas, disciplina o capitanía." },
    { id: "SEED_HOME_DISTANCE", originEvents: ["EVT_21_IMG_001", "EVT_22_HOME_001"], npcRefs: ["NPC_SOC_01"], ageWindow: [21, null], description: "Grado de vínculo real con el lugar de origen tras años fuera." },
    { id: "SEED_FIRST_FREE_AGENCY", originEvents: ["EVT_22_CON_001", "EVT_22_CON_002"], npcRefs: ["NPC_AGT_01", "NPC_AGT_02"], ageWindow: [22, 35], description: "Precedente de agotar contrato, renovar tarde o aceptar venta controlada." },
    { id: "SEED_CONTRACT_HARDLINE", originEvents: ["EVT_18_SUM_001", "EVT_19_MKT_001"], npcRefs: ["NPC_DIR_02"], ageWindow: [18, 30], description: "Precedente de negociación dura sobre duración, cláusula y control contractual." }
];
var SEED_CATALOG_23_26 = [
    { id: "SEED_ELITE_ROLE_BARGAIN", originEvents: ["EVT_23_BRIDGE_001", "EVT_23_MKT_001"], npcRefs: [], ageWindow: [23, 30], description: "Techo deportivo frente a rol real en operaciones de alto nivel." },
    { id: "SEED_CONTRACT_CEILING", originEvents: ["EVT_23_CON_001", "EVT_25_CON_001"], npcRefs: ["NPC_AGT_01", "NPC_AGT_02"], ageWindow: [23, 32], description: "Cuánto techo salarial y libertad se sacrifica por seguridad contractual." },
    { id: "SEED_DIRECT_RECRUIT", originEvents: ["EVT_23_AGT_001", "EVT_25_MKT_001"], npcRefs: ["NPC_AGT_01", "NPC_AGT_02"], ageWindow: [23, 32], description: "Interés directo de estructuras deportivas y agencias de mayor alcance." },
    { id: "SEED_LOAD_MANAGEMENT", originEvents: ["EVT_23_BODY_001"], npcRefs: ["NPC_MED_01"], ageWindow: [23, null], description: "Patrón adulto de gestión de carga y disponibilidad." },
    { id: "SEED_FAMILY_BUSINESS", originEvents: ["EVT_23_MONEY_001", "EVT_25_FAM_001"], npcRefs: ["NPC_FAM_01", "NPC_FAM_02"], ageWindow: [23, null], description: "Capital, límites y responsabilidades dentro de un proyecto familiar." },
    { id: "SEED_HOME_SYMBOL", originEvents: ["EVT_23_HOME_001"], npcRefs: [], ageWindow: [23, null], description: "El jugador se convierte, o evita convertirse, en símbolo de su club/origen." },
    { id: "SEED_EURO_REGISTRATION", originEvents: ["EVT_23_EUR_001"], npcRefs: [], ageWindow: [23, 32], description: "Registro, rol y credibilidad acumulada en competición continental." },
    { id: "SEED_FIRST_ABSOLUTE_CALL", originEvents: ["EVT_23_NAT_001"], npcRefs: [], ageWindow: [23, null], description: "Primera llamada de la selección absoluta sin presuponer minutos ni continuidad." },
    { id: "SEED_CLUB_NATIONAL_CONFLICT", originEvents: ["EVT_23_MED_001"], npcRefs: ["NPC_MED_01"], ageWindow: [23, 32], description: "Conflicto de incentivos entre disponibilidad para club y selección." },
    { id: "SEED_IMAGE_RIGHTS", originEvents: ["EVT_24_CON_001"], npcRefs: [], ageWindow: [24, null], description: "Control y cesión de derechos de imagen en contratos de alto valor." },
    { id: "SEED_PERSONAL_STAFF", originEvents: ["EVT_24_LIFE_001"], npcRefs: ["NPC_SOC_01"], ageWindow: [24, null], description: "Quién gestiona agenda, logística y vida profesional del jugador." },
    { id: "SEED_STAR_COMPETITION", originEvents: ["EVT_24_CCH_001"], npcRefs: [], ageWindow: [24, 32], description: "Competencia directa con una inversión estrella en la misma zona." },
    { id: "SEED_PENALTY_HIERARCHY", originEvents: ["EVT_24_MATCH_001"], npcRefs: [], ageWindow: [24, 34], description: "Jerarquía de penaltis y conducta bajo conflicto competitivo." },
    { id: "SEED_PRIVATE_CHAT", originEvents: ["EVT_24_LOCK_001"], npcRefs: [], ageWindow: [24, 34], description: "Participación, silencio o salida de un chat privado susceptible de filtración." },
    { id: "SEED_MAJOR_TOURNAMENT", originEvents: ["EVT_24_NAT_001"], npcRefs: [], ageWindow: [24, null], description: "Preparación y posición respecto a un gran torneo de selección." },
    { id: "SEED_BIG_MATCH_BODY", originEvents: ["EVT_24_MED_001"], npcRefs: ["NPC_MED_01"], ageWindow: [24, null], description: "Precedente físico antes de una final o partido de máximo valor." },
    { id: "SEED_WEALTHY_EXIT", originEvents: ["EVT_24_JAN_001"], npcRefs: ["NPC_AGT_01", "NPC_AGT_02"], ageWindow: [24, null], description: "Oferta de riqueza extraordinaria a cambio de exposición competitiva." },
    { id: "SEED_YOUNG_MENTOR", originEvents: ["EVT_25_TEAM_001"], npcRefs: [], ageWindow: [25, null], description: "Relación con un joven que también puede convertirse en competidor real." },
    { id: "SEED_CAPTAINCY_STYLE", originEvents: ["EVT_25_CAP_001"], npcRefs: [], ageWindow: [25, null], description: "Forma de ejercer, compartir o rechazar liderazgo formal." },
    { id: "SEED_CHRONIC_BODY", originEvents: ["EVT_25_MED_001"], npcRefs: ["NPC_MED_01"], ageWindow: [25, null], description: "Patrón físico recurrente que exige gestión sin implicar declive automático." },
    { id: "SEED_AGENT_PROOF", originEvents: ["EVT_25_AGT_001"], npcRefs: ["NPC_AGT_01", "NPC_AGT_02"], ageWindow: [25, 34], description: "Evidencia real sobre promesas, omisiones o capacidad de representación." },
    { id: "SEED_AGE26_PRIORITY", originEvents: ["EVT_25_END_001"], npcRefs: [], ageWindow: [25, null], description: "Prioridad declarada al cerrar los 26: techo, rol, cuerpo/estabilidad o libertad." }
];
var SEED_CATALOG_26_30 = [
    { id: "SEED_PEAK_IDENTITY", originEvents: ["EVT_26_IDN_001"], npcRefs: [], ageWindow: [26, 34], description: "Cómo reacciona a ser tratado como activo maduro y reemplazable." },
    { id: "SEED_SHADOW_ESCAPE", originEvents: ["EVT_26_MKT_001"], npcRefs: [], ageWindow: [26, 34], description: "Si prefiere protagonismo a permanecer en una máquina ganadora." },
    { id: "SEED_PROJECT_FACE", originEvents: ["EVT_26_CLB_001"], npcRefs: [], ageWindow: [26, 36], description: "Aceptación de ser centro deportivo y comercial de un proyecto." },
    { id: "SEED_PEAK_CONTRACT", originEvents: ["EVT_26_CON_001"], npcRefs: ["NPC_AGT_01", "NPC_AGT_02"], ageWindow: [26, 36], description: "Contrato estructural firmado en el pico." },
    { id: "SEED_GLOBAL_IMAGE", originEvents: ["EVT_26_IMG_001"], npcRefs: ["NPC_PRS_01"], ageWindow: [26, null], description: "Expansión de imagen a escala máxima." },
    { id: "SEED_SELF_OPTIMIZATION", originEvents: ["EVT_26_BODY_001"], npcRefs: ["NPC_MED_01"], ageWindow: [26, null], description: "Profesionalización y control del rendimiento." },
    { id: "SEED_YOUNG_SUCCESSOR", originEvents: ["EVT_26_TEAM_001"], npcRefs: [], ageWindow: [26, null], description: "Primera convivencia con un sucesor real." },
    { id: "SEED_INTERNATIONAL_LOAD", originEvents: ["EVT_26_NAT_001"], npcRefs: [], ageWindow: [26, 36], description: "Cómo reparte disponibilidad entre club, selección y descanso." },
    { id: "SEED_HOME_INSTITUTION", originEvents: ["EVT_26_HOME_001"], npcRefs: ["NPC_DIR_02"], ageWindow: [26, null], description: "Vínculo institucional con UDV y Valdoria." },
    { id: "SEED_BIG_GAME_BENCH", originEvents: ["EVT_27_FINAL_001"], npcRefs: [], ageWindow: [27, 36], description: "Reacción a suplencia en cita máxima." },
    { id: "SEED_RECORD_CHASE", originEvents: ["EVT_27_REC_001"], npcRefs: [], ageWindow: [27, null], description: "Peso dado a récords y su persecución." },
    { id: "SEED_LOCKER_ENDORSEMENT", originEvents: ["EVT_27_LOCK_001"], npcRefs: [], ageWindow: [27, 36], description: "Uso del poder en conflictos colectivos." },
    { id: "SEED_PEAK_LOAD", originEvents: ["EVT_27_BODY_001"], npcRefs: ["NPC_MED_01"], ageWindow: [27, null], description: "Patrón de descanso en máxima densidad." },
    { id: "SEED_DOCUMENTARY_ACCESS", originEvents: ["EVT_27_PRS_001"], npcRefs: ["NPC_PRS_01"], ageWindow: [27, null], description: "Acceso concedido a vida y vestuario." },
    { id: "SEED_AGENT_CONFLICT_PEAK", originEvents: ["EVT_27_AGT_001"], npcRefs: ["NPC_AGT_01", "NPC_AGT_02"], ageWindow: [27, 36], description: "Conflictos de incentivo con la agencia en máximo mercado." },
    { id: "SEED_PUBLIC_RIVALRY", originEvents: ["EVT_27_RIV_001"], npcRefs: ["NPC_PLR_15"], ageWindow: [27, null], description: "Grado de rivalidad pública con el espejo generacional." },
    { id: "SEED_MENTOR_ADVICE", originEvents: ["EVT_27_MENT_001"], npcRefs: [], ageWindow: [27, null], description: "Consejo dado a un joven sobre su carrera." },
    { id: "SEED_NATIONAL_ROLE", originEvents: ["EVT_27_NAT_001"], npcRefs: [], ageWindow: [27, 36], description: "Cómo acepta o disputa jerarquía internacional madura." },
    { id: "SEED_FINAL_BENCH", originEvents: ["EVT_28_FINAL_001"], npcRefs: [], ageWindow: [28, 36], description: "Ganar o perder una final sin controlar el rol." },
    { id: "SEED_MEGA_TRANSFER", originEvents: ["EVT_28_MKT_001"], npcRefs: [], ageWindow: [28, 36], description: "Primer movimiento o propuesta transformadora." },
    { id: "SEED_PUBLIC_EXIT_PRESSURE", originEvents: ["EVT_28_PRS_001"], npcRefs: ["NPC_PRS_01"], ageWindow: [28, 36], description: "Uso público de presión para salir." },
    { id: "SEED_WEALTH_STRUCTURE", originEvents: ["EVT_28_MONEY_001"], npcRefs: ["NPC_FAM_01", "NPC_FAM_02"], ageWindow: [28, null], description: "Profesionalización del patrimonio." },
    { id: "SEED_HOME_OWNERSHIP", originEvents: ["EVT_28_HOME_001"], npcRefs: ["NPC_DIR_02"], ageWindow: [28, null], description: "Entrada económica o institucional en el origen." },
    { id: "SEED_PERSONAL_BRAND_INDEPENDENCE", originEvents: ["EVT_28_IMG_001"], npcRefs: [], ageWindow: [28, null], description: "Separación de marca personal y club." },
    { id: "SEED_SECOND_STAR", originEvents: ["EVT_28_TEAM_001"], npcRefs: [], ageWindow: [28, 36], description: "Convivencia con otra superestrella equivalente." },
    { id: "SEED_POSITIONAL_REINVENTION", originEvents: ["EVT_28_TACT_001"], npcRefs: [], ageWindow: [28, null], description: "Aceptación inicial de adaptación táctica del pico." },
    { id: "SEED_GLOBAL_AWARD_BEHAVIOR", originEvents: ["EVT_28_GALA_001"], npcRefs: ["NPC_PRS_01"], ageWindow: [28, null], description: "Cómo gestiona candidatura, derrota o victoria pública." },
    { id: "SEED_MANAGER_POWER", originEvents: ["EVT_29_CCH_001"], npcRefs: [], ageWindow: [29, 36], description: "Uso de influencia sobre el futuro del entrenador." },
    { id: "SEED_FAN_FRACTURE", originEvents: ["EVT_29_FAN_001"], npcRefs: [], ageWindow: [29, null], description: "Primera fractura seria con la afición propia." },
    { id: "SEED_SURGERY_TIMING", originEvents: ["EVT_29_MED_001"], npcRefs: ["NPC_MED_01"], ageWindow: [29, null], description: "Elección de calendario ante dolencia persistente." },
    { id: "SEED_NATIONAL_CAPTAINCY", originEvents: ["EVT_29_NAT_001"], npcRefs: [], ageWindow: [29, null], description: "Aceptación y estilo de capitanía internacional." },
    { id: "SEED_ELITE_SACRIFICE", originEvents: ["EVT_29_EUR_001"], npcRefs: [], ageWindow: [29, 36], description: "Sacrificio estadístico en cita de máximo nivel." },
    { id: "SEED_RECORD_PUBLIC_TONE", originEvents: ["EVT_29_REC_001"], npcRefs: ["NPC_PRS_01"], ageWindow: [29, null], description: "Cómo comunica un récord en contexto colectivo." },
    { id: "SEED_WEALTHY_PEAK_EXIT", originEvents: ["EVT_29_MKT_001"], npcRefs: ["NPC_AGT_01", "NPC_AGT_02"], ageWindow: [29, null], description: "Salida de la máxima exposición a cambio de riqueza y control." },
    { id: "SEED_EARLY_HOME_RETURN", originEvents: ["EVT_29_HOME_001"], npcRefs: ["NPC_DIR_02"], ageWindow: [29, null], description: "Regreso competitivo al origen antes del declive." },
    { id: "SEED_FIRST_PEAK_DIP", originEvents: ["EVT_29_FORM_001"], npcRefs: [], ageWindow: [29, null], description: "Primer descenso relevante de forma o rol durante el pico." },
    { id: "SEED_AGE30_PRIORITY", originEvents: ["EVT_29_FIN_001"], npcRefs: [], ageWindow: [29, null], description: "Prioridad declarada al entrar en la etapa 30-34." }
];
var SEED_CATALOG_30_34 = [
    { id: "SEED_VETERAN_LABEL", originEvents: ["PASADA_6_30_34"], npcRefs: [], ageWindow: [30, null], description: "Memoria canónica de madurez 30-34: veteran label." },
    { id: "SEED_AGE30_CONTRACT", originEvents: ["PASADA_6_30_34"], npcRefs: [], ageWindow: [30, null], description: "Memoria canónica de madurez 30-34: age30 contract." },
    { id: "SEED_MATCH_SELECTIVITY", originEvents: ["PASADA_6_30_34"], npcRefs: [], ageWindow: [30, null], description: "Memoria canónica de madurez 30-34: match selectivity." },
    { id: "SEED_LAST_BIG_MOVE_WINDOW", originEvents: ["PASADA_6_30_34"], npcRefs: [], ageWindow: [30, null], description: "Memoria canónica de madurez 30-34: last big move window." },
    { id: "SEED_AGENT_LAST_CONTRACT", originEvents: ["PASADA_6_30_34"], npcRefs: [], ageWindow: [30, null], description: "Memoria canónica de madurez 30-34: agent last contract." },
    { id: "SEED_NATIONAL_PHASEDOWN", originEvents: ["PASADA_6_30_34"], npcRefs: [], ageWindow: [30, null], description: "Memoria canónica de madurez 30-34: national phasedown." },
    { id: "SEED_DORSAL_SUCCESSION", originEvents: ["PASADA_6_30_34"], npcRefs: [], ageWindow: [30, null], description: "Memoria canónica de madurez 30-34: dorsal succession." },
    { id: "SEED_FAMILY_ANCHOR", originEvents: ["PASADA_6_30_34"], npcRefs: [], ageWindow: [30, null], description: "Memoria canónica de madurez 30-34: family anchor." },
    { id: "SEED_RELOCATION_LIMIT", originEvents: ["PASADA_6_30_34"], npcRefs: [], ageWindow: [30, null], description: "Memoria canónica de madurez 30-34: relocation limit." },
    { id: "SEED_MEDICAL_AUTHORITY", originEvents: ["PASADA_6_30_34"], npcRefs: [], ageWindow: [30, null], description: "Memoria canónica de madurez 30-34: medical authority." },
    { id: "SEED_BIG_GAME_ROTATION_30", originEvents: ["PASADA_6_30_34"], npcRefs: [], ageWindow: [30, null], description: "Memoria canónica de madurez 30-34: big game rotation 30." },
    { id: "SEED_FALSE_RESURGENCE", originEvents: ["PASADA_6_30_34"], npcRefs: [], ageWindow: [30, null], description: "Memoria canónica de madurez 30-34: false resurgence." },
    { id: "SEED_ROLE_COMMUNICATION", originEvents: ["PASADA_6_30_34"], npcRefs: [], ageWindow: [30, null], description: "Memoria canónica de madurez 30-34: role communication." },
    { id: "SEED_CAPTAIN_HANDOVER", originEvents: ["PASADA_6_30_34"], npcRefs: [], ageWindow: [30, null], description: "Memoria canónica de madurez 30-34: captain handover." },
    { id: "SEED_MILESTONE_CHASE_500", originEvents: ["PASADA_6_30_34"], npcRefs: [], ageWindow: [30, null], description: "Memoria canónica de madurez 30-34: milestone chase 500." },
    { id: "SEED_PAIN_WITHOUT_SCAN", originEvents: ["PASADA_6_30_34"], npcRefs: [], ageWindow: [30, null], description: "Memoria canónica de madurez 30-34: pain without scan." },
    { id: "SEED_OLD_NETWORK_FAVOR", originEvents: ["PASADA_6_30_34"], npcRefs: [], ageWindow: [30, null], description: "Memoria canónica de madurez 30-34: old network favor." },
    { id: "SEED_FALSE_ULTIMATUM", originEvents: ["PASADA_6_30_34"], npcRefs: [], ageWindow: [30, null], description: "Memoria canónica de madurez 30-34: false ultimatum." },
    { id: "SEED_NATIONAL_ABSENCE", originEvents: ["PASADA_6_30_34"], npcRefs: [], ageWindow: [30, null], description: "Memoria canónica de madurez 30-34: national absence." },
    { id: "SEED_SPECIALIST_BIGCLUB", originEvents: ["PASADA_6_30_34"], npcRefs: [], ageWindow: [30, null], description: "Memoria canónica de madurez 30-34: specialist bigclub." },
    { id: "SEED_SURGERY_31", originEvents: ["PASADA_6_30_34"], npcRefs: [], ageWindow: [31, null], description: "Memoria canónica de madurez 30-34: surgery 31." },
    { id: "SEED_LAST_BIG_MOVE_31", originEvents: ["PASADA_6_30_34"], npcRefs: [], ageWindow: [31, null], description: "Memoria canónica de madurez 30-34: last big move 31." },
    { id: "SEED_HOME_RETURN_31", originEvents: ["PASADA_6_30_34"], npcRefs: [], ageWindow: [31, null], description: "Memoria canónica de madurez 30-34: home return 31." },
    { id: "SEED_SELF_REPRESENTATION_PREP", originEvents: ["PASADA_6_30_34"], npcRefs: [], ageWindow: [31, null], description: "Memoria canónica de madurez 30-34: self representation prep." },
    { id: "SEED_FORMAL_MENTOR", originEvents: ["PASADA_6_30_34"], npcRefs: [], ageWindow: [31, null], description: "Memoria canónica de madurez 30-34: formal mentor." },
    { id: "SEED_LEGACY_ACADEMY", originEvents: ["PASADA_6_30_34"], npcRefs: [], ageWindow: [31, null], description: "Memoria canónica de madurez 30-34: legacy academy." },
    { id: "SEED_COMEBACK_PACING", originEvents: ["PASADA_6_30_34"], npcRefs: [], ageWindow: [31, null], description: "Memoria canónica de madurez 30-34: comeback pacing." },
    { id: "SEED_ROLE_REINVENTION_32", originEvents: ["PASADA_6_30_34"], npcRefs: [], ageWindow: [31, null], description: "Memoria canónica de madurez 30-34: role reinvention 32." },
    { id: "SEED_NEW_COACH_RESET", originEvents: ["PASADA_6_30_34"], npcRefs: [], ageWindow: [31, null], description: "Memoria canónica de madurez 30-34: new coach reset." },
    { id: "SEED_SQUAD_YOUTH_WAVE", originEvents: ["PASADA_6_30_34"], npcRefs: [], ageWindow: [31, null], description: "Memoria canónica de madurez 30-34: squad youth wave." },
    { id: "SEED_CLUB_NT_LOAD_TENSION", originEvents: ["PASADA_6_30_34"], npcRefs: [], ageWindow: [31, null], description: "Memoria canónica de madurez 30-34: club nt load tension." },
    { id: "SEED_MANAGED_FINAL_ROLE", originEvents: ["PASADA_6_30_34"], npcRefs: [], ageWindow: [31, null], description: "Memoria canónica de madurez 30-34: managed final role." },
    { id: "SEED_BUSINESS_REPUTATION_SHOCK", originEvents: ["PASADA_6_30_34"], npcRefs: [], ageWindow: [31, null], description: "Memoria canónica de madurez 30-34: business reputation shock." },
    { id: "SEED_ROLLING_CONTRACT", originEvents: ["PASADA_6_30_34"], npcRefs: [], ageWindow: [32, null], description: "Memoria canónica de madurez 30-34: rolling contract." },
    { id: "SEED_LATE_RICH_OFFER", originEvents: ["PASADA_6_30_34"], npcRefs: [], ageWindow: [32, null], description: "Memoria canónica de madurez 30-34: late rich offer." },
    { id: "SEED_LATE_CONTENDER_BENCH", originEvents: ["PASADA_6_30_34"], npcRefs: [], ageWindow: [32, null], description: "Memoria canónica de madurez 30-34: late contender bench." },
    { id: "SEED_HOME_CAPTAIN_OFFER", originEvents: ["PASADA_6_30_34"], npcRefs: [], ageWindow: [32, null], description: "Memoria canónica de madurez 30-34: home captain offer." },
    { id: "SEED_SELF_REPRESENTATION", originEvents: ["PASADA_6_30_34"], npcRefs: [], ageWindow: [32, null], description: "Memoria canónica de madurez 30-34: self representation." },
    { id: "SEED_LOW_STATS_HIGH_IMPACT", originEvents: ["PASADA_6_30_34"], npcRefs: [], ageWindow: [32, null], description: "Memoria canónica de madurez 30-34: low stats high impact." },
    { id: "SEED_REPLACEMENT_BREAKOUT", originEvents: ["PASADA_6_30_34"], npcRefs: [], ageWindow: [32, null], description: "Memoria canónica de madurez 30-34: replacement breakout." },
    { id: "SEED_FAN_LEGACY_BUFFER", originEvents: ["PASADA_6_30_34"], npcRefs: [], ageWindow: [32, null], description: "Memoria canónica de madurez 30-34: fan legacy buffer." },
    { id: "SEED_TRAVEL_LOAD", originEvents: ["PASADA_6_30_34"], npcRefs: [], ageWindow: [32, null], description: "Memoria canónica de madurez 30-34: travel load." },
    { id: "SEED_FINAL_NT_SQUAD", originEvents: ["PASADA_6_30_34"], npcRefs: [], ageWindow: [32, null], description: "Memoria canónica de madurez 30-34: final nt squad." },
    { id: "SEED_BOSMAN_33", originEvents: ["PASADA_6_30_34"], npcRefs: [], ageWindow: [32, null], description: "Memoria canónica de madurez 30-34: bosman 33." },
    { id: "SEED_72H_LIMIT", originEvents: ["PASADA_6_30_34"], npcRefs: [], ageWindow: [33, null], description: "Memoria canónica de madurez 30-34: 72h limit." },
    { id: "SEED_RECORD_VS_BODY", originEvents: ["PASADA_6_30_34"], npcRefs: [], ageWindow: [33, null], description: "Memoria canónica de madurez 30-34: record vs body." },
    { id: "SEED_VETERAN_LEADERSHIP_FINAL", originEvents: ["PASADA_6_30_34"], npcRefs: [], ageWindow: [33, null], description: "Memoria canónica de madurez 30-34: veteran leadership final." },
    { id: "SEED_FINAL_FOUR_WAYS", originEvents: ["PASADA_6_30_34"], npcRefs: [], ageWindow: [33, null], description: "Memoria canónica de madurez 30-34: final four ways." },
    { id: "SEED_AGE34_PRIORITY", originEvents: ["PASADA_6_30_34"], npcRefs: [], ageWindow: [33, null], description: "Memoria canónica de madurez 30-34: age34 priority." },
    { id: "SEED_RETIREMENT_PUBLIC_TONE", originEvents: ["PASADA_6_30_34"], npcRefs: [], ageWindow: [33, null], description: "Memoria canónica de madurez 30-34: retirement public tone." },
    { id: "SEED_HOME_PULL_PUBLIC", originEvents: ["PASADA_6_30_34"], npcRefs: [], ageWindow: [33, null], description: "Memoria canónica de madurez 30-34: home pull public." },
    { id: "SEED_RETIREMENT_DISTANCE_PROFILE", originEvents: ["PASADA_6_30_34"], npcRefs: [], ageWindow: [33, null], description: "Memoria canónica de madurez 30-34: retirement distance profile." }
];
var SEED_CATALOG_34_PLUS = [
    { id: "SEED_FORM_VS_PLAN", originEvents: ["PASADA_7_34_PLUS"], npcRefs: [], ageWindow: [34, null], description: "Memoria canónica/técnica de cierre de carrera: form vs plan." },
    { id: "SEED_PEAK_BODY_MEMORY", originEvents: ["PASADA_7_34_PLUS"], npcRefs: [], ageWindow: [34, null], description: "Memoria canónica/técnica de cierre de carrera: peak body memory." },
    { id: "SEED_PEAK_ROLE_LEGACY", originEvents: ["PASADA_7_34_PLUS"], npcRefs: [], ageWindow: [34, null], description: "Memoria canónica/técnica de cierre de carrera: peak role legacy." },
    { id: "SEED_CONTRACT_REPUTATION", originEvents: ["PASADA_7_34_PLUS"], npcRefs: [], ageWindow: [34, null], description: "Memoria canónica/técnica de cierre de carrera: contract reputation." },
    { id: "SEED_PUBLIC_POLARIZATION", originEvents: ["PASADA_7_34_PLUS"], npcRefs: [], ageWindow: [34, null], description: "Memoria canónica/técnica de cierre de carrera: public polarization." },
    { id: "SEED_CLUB_POWER_MEMORY", originEvents: ["PASADA_7_34_PLUS"], npcRefs: [], ageWindow: [34, null], description: "Memoria canónica/técnica de cierre de carrera: club power memory." },
    { id: "SEED_FINALS_MEMORY", originEvents: ["PASADA_7_34_PLUS"], npcRefs: [], ageWindow: [34, null], description: "Memoria canónica/técnica de cierre de carrera: finals memory." },
    { id: "SEED_NATIONAL_LEGACY", originEvents: ["PASADA_7_34_PLUS"], npcRefs: [], ageWindow: [34, null], description: "Memoria canónica/técnica de cierre de carrera: national legacy." },
    { id: "SEED_WEALTH_LEGACY", originEvents: ["PASADA_7_34_PLUS"], npcRefs: [], ageWindow: [34, null], description: "Memoria canónica/técnica de cierre de carrera: wealth legacy." },
    { id: "SEED_AGENT_ENDGAME", originEvents: ["PASADA_7_34_PLUS"], npcRefs: [], ageWindow: [34, null], description: "Memoria canónica/técnica de cierre de carrera: agent endgame." },
    { id: "SEED_FAMILY_RELOCATION", originEvents: ["PASADA_7_34_PLUS"], npcRefs: [], ageWindow: [34, null], description: "Memoria canónica/técnica de cierre de carrera: family relocation." },
    { id: "SEED_VETERAN_MARKET_SIGNAL", originEvents: ["PASADA_7_34_PLUS"], npcRefs: [], ageWindow: [34, null], description: "Memoria canónica/técnica de cierre de carrera: veteran market signal." },
    { id: "SEED_MEDICAL_LONG_MEMORY", originEvents: ["PASADA_7_34_PLUS"], npcRefs: [], ageWindow: [34, null], description: "Memoria canónica/técnica de cierre de carrera: medical long memory." },
    { id: "SEED_HOME_RETURN_SIGNAL", originEvents: ["PASADA_7_34_PLUS"], npcRefs: [], ageWindow: [34, null], description: "Memoria canónica/técnica de cierre de carrera: home return signal." },
    { id: "SEED_34_MARKET_SILENCE", originEvents: ["PASADA_7_34_PLUS"], npcRefs: [], ageWindow: [34, null], description: "Memoria canónica/técnica de cierre de carrera: 34 market silence." },
    { id: "SEED_34_ROLE_FLOOR", originEvents: ["PASADA_7_34_PLUS"], npcRefs: [], ageWindow: [34, null], description: "Memoria canónica/técnica de cierre de carrera: 34 role floor." },
    { id: "SEED_34_BODY_NEGOTIATION", originEvents: ["PASADA_7_34_PLUS"], npcRefs: [], ageWindow: [34, null], description: "Memoria canónica/técnica de cierre de carrera: 34 body negotiation." },
    { id: "SEED_34_CONTRACT_FLEX", originEvents: ["PASADA_7_34_PLUS"], npcRefs: [], ageWindow: [34, null], description: "Memoria canónica/técnica de cierre de carrera: 34 contract flex." },
    { id: "SEED_34_LAST_SELECTION", originEvents: ["PASADA_7_34_PLUS"], npcRefs: [], ageWindow: [34, null], description: "Memoria canónica/técnica de cierre de carrera: 34 last selection." },
    { id: "SEED_34_MENTORSHIP", originEvents: ["PASADA_7_34_PLUS"], npcRefs: [], ageWindow: [34, null], description: "Memoria canónica/técnica de cierre de carrera: 34 mentorship." },
    { id: "SEED_34_FAMILY_WEIGHT", originEvents: ["PASADA_7_34_PLUS"], npcRefs: [], ageWindow: [34, null], description: "Memoria canónica/técnica de cierre de carrera: 34 family weight." },
    { id: "SEED_34_MEDIA_TONE", originEvents: ["PASADA_7_34_PLUS"], npcRefs: [], ageWindow: [34, null], description: "Memoria canónica/técnica de cierre de carrera: 34 media tone." },
    { id: "SEED_34_HOME_PULL", originEvents: ["PASADA_7_34_PLUS"], npcRefs: [], ageWindow: [34, null], description: "Memoria canónica/técnica de cierre de carrera: 34 home pull." },
    { id: "SEED_34_MEDICAL_REDLINE", originEvents: ["PASADA_7_34_PLUS"], npcRefs: [], ageWindow: [34, null], description: "Memoria canónica/técnica de cierre de carrera: 34 medical redline." },
    { id: "SEED_34_FINAL_OUTSIDE", originEvents: ["PASADA_7_34_PLUS"], npcRefs: [], ageWindow: [34, null], description: "Memoria canónica/técnica de cierre de carrera: 34 final outside." },
    { id: "SEED_34_COMEBACK", originEvents: ["PASADA_7_34_PLUS"], npcRefs: [], ageWindow: [34, null], description: "Memoria canónica/técnica de cierre de carrera: 34 comeback." },
    { id: "SEED_34_NO_CLEARANCE", originEvents: ["PASADA_7_34_PLUS"], npcRefs: [], ageWindow: [34, null], description: "Memoria canónica/técnica de cierre de carrera: 34 no clearance." },
    { id: "SEED_34_LATE_OFFER", originEvents: ["PASADA_7_34_PLUS"], npcRefs: [], ageWindow: [34, null], description: "Memoria canónica/técnica de cierre de carrera: 34 late offer." },
    { id: "SEED_34_LEAGUE_DOWNGRADE", originEvents: ["PASADA_7_34_PLUS"], npcRefs: [], ageWindow: [34, null], description: "Memoria canónica/técnica de cierre de carrera: 34 league downgrade." },
    { id: "SEED_34_STATUS_SACRIFICE", originEvents: ["PASADA_7_34_PLUS"], npcRefs: [], ageWindow: [34, null], description: "Memoria canónica/técnica de cierre de carrera: 34 status sacrifice." },
    { id: "SEED_35_YEAR_OPTION", originEvents: ["PASADA_7_34_PLUS"], npcRefs: [], ageWindow: [34, null], description: "Memoria canónica/técnica de cierre de carrera: 35 year option." },
    { id: "SEED_35_FINAL_ROLE", originEvents: ["PASADA_7_34_PLUS"], npcRefs: [], ageWindow: [34, null], description: "Memoria canónica/técnica de cierre de carrera: 35 final role." },
    { id: "SEED_35_BODY_PLAN", originEvents: ["PASADA_7_34_PLUS"], npcRefs: [], ageWindow: [34, null], description: "Memoria canónica/técnica de cierre de carrera: 35 body plan." },
    { id: "SEED_35_MARKET_CALL", originEvents: ["PASADA_7_34_PLUS"], npcRefs: [], ageWindow: [34, null], description: "Memoria canónica/técnica de cierre de carrera: 35 market call." },
    { id: "SEED_35_NATIONAL_GOODBYE", originEvents: ["PASADA_7_34_PLUS"], npcRefs: [], ageWindow: [34, null], description: "Memoria canónica/técnica de cierre de carrera: 35 national goodbye." },
    { id: "SEED_35_FAMILY_DECISION", originEvents: ["PASADA_7_34_PLUS"], npcRefs: [], ageWindow: [34, null], description: "Memoria canónica/técnica de cierre de carrera: 35 family decision." },
    { id: "SEED_35_CLUB_FAREWELL", originEvents: ["PASADA_7_34_PLUS"], npcRefs: [], ageWindow: [34, null], description: "Memoria canónica/técnica de cierre de carrera: 35 club farewell." },
    { id: "SEED_35_HOME_LAST_WINDOW", originEvents: ["PASADA_7_34_PLUS"], npcRefs: [], ageWindow: [34, null], description: "Memoria canónica/técnica de cierre de carrera: 35 home last window." },
    { id: "SEED_36_CONTRACT_MINUTES", originEvents: ["PASADA_7_34_PLUS"], npcRefs: [], ageWindow: [34, null], description: "Memoria canónica/técnica de cierre de carrera: 36 contract minutes." },
    { id: "SEED_36_MEDICAL_CLEARANCE", originEvents: ["PASADA_7_34_PLUS"], npcRefs: [], ageWindow: [34, null], description: "Memoria canónica/técnica de cierre de carrera: 36 medical clearance." },
    { id: "SEED_36_COMEBACK_FINAL", originEvents: ["PASADA_7_34_PLUS"], npcRefs: [], ageWindow: [34, null], description: "Memoria canónica/técnica de cierre de carrera: 36 comeback final." },
    { id: "SEED_36_MENTOR_ROLE", originEvents: ["PASADA_7_34_PLUS"], npcRefs: [], ageWindow: [34, null], description: "Memoria canónica/técnica de cierre de carrera: 36 mentor role." },
    { id: "SEED_36_RICH_LEAGUE_LAST", originEvents: ["PASADA_7_34_PLUS"], npcRefs: [], ageWindow: [34, null], description: "Memoria canónica/técnica de cierre de carrera: 36 rich league last." },
    { id: "SEED_36_NO_MARKET", originEvents: ["PASADA_7_34_PLUS"], npcRefs: [], ageWindow: [34, null], description: "Memoria canónica/técnica de cierre de carrera: 36 no market." },
    { id: "SEED_37_ANNOUNCEMENT_CONTROL", originEvents: ["PASADA_7_34_PLUS"], npcRefs: [], ageWindow: [34, null], description: "Memoria canónica/técnica de cierre de carrera: 37 announcement control." },
    { id: "SEED_37_LAST_PRESEASON", originEvents: ["PASADA_7_34_PLUS"], npcRefs: [], ageWindow: [34, null], description: "Memoria canónica/técnica de cierre de carrera: 37 last preseason." },
    { id: "SEED_37_LAST_DERBY", originEvents: ["PASADA_7_34_PLUS"], npcRefs: [], ageWindow: [34, null], description: "Memoria canónica/técnica de cierre de carrera: 37 last derby." },
    { id: "SEED_37_PRIVATE_RETIREMENT", originEvents: ["PASADA_7_34_PLUS"], npcRefs: [], ageWindow: [34, null], description: "Memoria canónica/técnica de cierre de carrera: 37 private retirement." },
    { id: "SEED_38_POST_ANNOUNCE_OFFER", originEvents: ["PASADA_7_34_PLUS"], npcRefs: [], ageWindow: [34, null], description: "Memoria canónica/técnica de cierre de carrera: 38 post announce offer." },
    { id: "SEED_38_RECONSIDERATION", originEvents: ["PASADA_7_34_PLUS"], npcRefs: [], ageWindow: [34, null], description: "Memoria canónica/técnica de cierre de carrera: 38 reconsideration." },
    { id: "SEED_38_LAST_CONTRACT", originEvents: ["PASADA_7_34_PLUS"], npcRefs: [], ageWindow: [34, null], description: "Memoria canónica/técnica de cierre de carrera: 38 last contract." },
    { id: "SEED_38_MARKET_SILENCE", originEvents: ["PASADA_7_34_PLUS"], npcRefs: [], ageWindow: [34, null], description: "Memoria canónica/técnica de cierre de carrera: 38 market silence." },
    { id: "SEED_RET_HOME_CONVERSATION", originEvents: ["PASADA_7_34_PLUS"], npcRefs: [], ageWindow: [34, null], description: "Memoria canónica/técnica de cierre de carrera: ret home conversation." },
    { id: "SEED_RET_BODY_DECISION", originEvents: ["PASADA_7_34_PLUS"], npcRefs: [], ageWindow: [34, null], description: "Memoria canónica/técnica de cierre de carrera: ret body decision." },
    { id: "SEED_RET_HIGH", originEvents: ["PASADA_7_34_PLUS"], npcRefs: [], ageWindow: [34, null], description: "Memoria canónica/técnica de cierre de carrera: ret high." },
    { id: "SEED_RET_LOW", originEvents: ["PASADA_7_34_PLUS"], npcRefs: [], ageWindow: [34, null], description: "Memoria canónica/técnica de cierre de carrera: ret low." },
    { id: "SEED_RET_ANNOUNCEMENT", originEvents: ["PASADA_7_34_PLUS"], npcRefs: [], ageWindow: [34, null], description: "Memoria canónica/técnica de cierre de carrera: ret announcement." },
    { id: "SEED_RET_LAST_MATCH", originEvents: ["PASADA_7_34_PLUS"], npcRefs: [], ageWindow: [34, null], description: "Memoria canónica/técnica de cierre de carrera: ret last match." },
    { id: "SEED_RET_NO_LAST_MATCH", originEvents: ["PASADA_7_34_PLUS"], npcRefs: [], ageWindow: [34, null], description: "Memoria canónica/técnica de cierre de carrera: ret no last match." },
    { id: "SEED_RET_STORYBOOK", originEvents: ["PASADA_7_34_PLUS"], npcRefs: [], ageWindow: [34, null], description: "Memoria canónica/técnica de cierre de carrera: ret storybook." },
    { id: "SEED_RET_RECONSIDERED", originEvents: ["PASADA_7_34_PLUS"], npcRefs: [], ageWindow: [34, null], description: "Memoria canónica/técnica de cierre de carrera: ret reconsidered." },
    { id: "SEED_RET_MARKET_END", originEvents: ["PASADA_7_34_PLUS"], npcRefs: [], ageWindow: [34, null], description: "Memoria canónica/técnica de cierre de carrera: ret market end." },
    { id: "SEED_RET_HEALTH_END", originEvents: ["PASADA_7_34_PLUS"], npcRefs: [], ageWindow: [34, null], description: "Memoria canónica/técnica de cierre de carrera: ret health end." },
    { id: "SEED_RET_FAMILY_END", originEvents: ["PASADA_7_34_PLUS"], npcRefs: [], ageWindow: [34, null], description: "Memoria canónica/técnica de cierre de carrera: ret family end." },
    { id: "SEED_RET_PUBLIC_TONE", originEvents: ["PASADA_7_34_PLUS"], npcRefs: [], ageWindow: [34, null], description: "Memoria canónica/técnica de cierre de carrera: ret public tone." },
    { id: "SEED_RET_PRIVATE_TONE", originEvents: ["PASADA_7_34_PLUS"], npcRefs: [], ageWindow: [34, null], description: "Memoria canónica/técnica de cierre de carrera: ret private tone." },
    { id: "SEED_EPILOGUE_LEGACY", originEvents: ["PASADA_7_34_PLUS"], npcRefs: [], ageWindow: [34, null], description: "Memoria canónica/técnica de cierre de carrera: epilogue legacy." },
    { id: "SEED_EPILOGUE_UNFINISHED", originEvents: ["PASADA_7_34_PLUS"], npcRefs: [], ageWindow: [34, null], description: "Memoria canónica/técnica de cierre de carrera: epilogue unfinished." }
];
var SEED_CATALOG = [...SEED_CATALOG_18_20, ...SEED_CATALOG_23_26, ...SEED_CATALOG_26_30, ...SEED_CATALOG_30_34, ...SEED_CATALOG_34_PLUS];
var SEED_IDS = new Set(SEED_CATALOG.map(s => s.id));


// ═══ content/initial-state.js ═══
function createInitialState(saveSeed = 20260910) {
    return {
        schemaVersion: 8,
        date: "2026-07-01",
        age: 18,
        season: "2026-27",
        phase: "18_20",
        club: "UDV",
        tier: 3,
        role: "academy_callup",
        careerStateTags: [],
        contract: { monthsRemaining: 12, salaryMonthly: 900, releaseClause: null },
        professional: {
            ownerClub: "UDV", registrationClub: "UDV", leagueTier: 3, clubPrestigeTier: 1, clubPrestigeScore: 18,
            contractPower: 18, roleSecurity: 24, agentControl: 100, environmentStability: 72, moneyComfort: 8,
            lockerPower: 12, foreignAdaptation: 0, nationalHeat: 2, nationalStanding: 0, nationalCaps: 0, nationalRole: "none",
            continentalCred: 0, bodyLoad: 12, commercialPower: 2, publicPolarization: 0, institutionalTrust: 58, injuryMinutesImpact: 0,
            peakStatus: 8, institutionalPower: 8, trophyCapital: 0, publicMyth: 3, careerControl: 10, nationalPower: 0, recoveryMargin: 82, successionPressure: 0, roleAdaptability: 35, veteranLeverage: 8, statusInertia: 5, recoveryDebt: 4, matchSelectivity: 10, explosiveness: 82, matchEndurance: 78, recoveryBetweenMatches: 84, technique: 62, tacticalReading: 48, composure: 52, availability: 90, gameSpeedPerception: 70, retirementDistance: 0, motivationReserve: 88, legacyCapital: 2, homePull: 25, relocationTolerance: 80, initializedAt30: false, initializedAt26: false,
            leagueTierAt23: 3, clubPrestigeTierAt23: 1, roleScoreAt23: 18, route: "home", initializedAt20: false, initializedAt23: false
        },
        finances: { cash: 1200 },
        body: { risk: 18, fatigue: 12, fitness: 78, acuteInjury: false },
        selection: { level: "none" },
        reputation: { prestige: 8, mediaHeat: 3, marketHeat: 5 },
        control: { career: 8, agentDependency: 0 },
        sport: { roleScore: 18, minutesShare: 0, form: 50, positionIdentity: "winger", appearances: 0 },
        world: { udvCashGap: 1100000, clubPressure: 42, coachSecurity: 48, marketWindowOpen: false, ownerClub: "UDV", nextCyclePriority: null, udvSeasonResolved: false },
        personality: { reserve: 50, impulsivity: 50, ambition: 55, professionalism: 55 },
        relationships: instantiateRelationships(),
        npcs: instantiateNpcStates(),
        flags: {
            PRESEASON_FIRST_TEAM_CALL: true,
            PRESEASON_STARTED: false,
            NANO_CALLED_UP: false,
            WIN_AGENT: false,
            FIRST_TEAM_ATTENTION: false,
            OFFICIAL_DEBUT: false,
            FORMATION_532: true,
            VELA_BOARD_TENSION: true,
            BODY_WINDOW: false,
            BRUNO_SCOUTS: false,
            SET_PIECE_WINDOW: false,
            CLARA_CONTACTED: false,
            WIN_DEBUT: false,
            AGENT_ACTIVE: false,
            EARLY_BREAKOUT: false,
            JAN_NO_DEBUT: false,
            BRUNO_EXIT: false,
            VELA_SEPARATED: false,
            COACH_FIRED: false,
            UDV_RELEGATED: false,
            UDV_PLAYOFF: false,
            BIG_CLUB_INTEREST: false,
            AGENT_SECOND_DISCREPANCY: false,
            RECOVERING_INJURY: false,
            LONG_INJURY: false,
            FOREIGN_DEV_INTEREST: false,
            NIGHT_PHOTO: false,
            LOAN_ACTIVE: false,
            LOAN_RETURN: false,
            CONFLICT_EXIT: false,
            BIG_CLUB: false,
            ABROAD_ROUTE: false,
            ABROAD_STRONG: false,
            LOWER_REBUILD: false,
            PROFESSIONAL_ADAPTED: false,
            CONTRACT_DISPUTE: false,
            CLUB_RELATION_DAMAGED: false,
            MEDIA_PROFILE: false,
            NATIONAL_RADAR: false,
            FOREIGN_STABLE: false,
            ROLE_PROMISE_BROKEN: false,
            TEAMMATE_COVER_CONTEXT: false,
            DEADLINE_CONTEXT: false,
            CAPTAIN_ROOM_CONTEXT: false,
            ADULT_23_ADAPTED: false,
            NATIONAL_GATE_OPEN: false,
            NATIONAL_CALLED: false,
            NATIONAL_REGULAR: false,
            NATIONAL_TOURNAMENT_CYCLE: false,
            CONTINENTAL_CONTEXT: false,
            CONTINENTAL_REGISTERED: false,
            HIGH_PROFILE_MATCH: false,
            STAR_COMPETITION: false,
            SUPER_AGENT: false,
            CLUB_OWNER_CHANGE: false,
            PUBLIC_PROMISE: false,
            FINAL_CONTEXT: false,
            CAPTAINCY_WINDOW: false,
            FAMILY_BUSINESS_ACTIVE: false,
            PERSONAL_STAFF_ACTIVE: false,
            WEALTHY_EXIT_ACCEPTED: false,
            MATURE_30_ADAPTED: false, NATIONAL_RETIRED: false, EARLY_RETIRED_30_34: false, RICH_LEAGUE_ROUTE: false, TRANSATLANTIC_PROJECT: false, SPECIALIST_ROLE: false, ROLE_REINVENTED_30: false, CAPTAIN_MENTOR: false, HOME_RETURN_30: false, ROLLING_CONTRACT: false
        },
        seeds: [],
        history: [],
        microfeeds: [],
        eventCooldowns: {},
        familyLastSeen: {},
        narrativePressure: { origin: 20, friendship: 15, body: 10, market: 8 },
        runtime: { day: 0, seasonDay: 0, daysSinceNarrative: 999, eventsThisSeason: 0 },
        retirement: { status: "playing", decidedDate: null, announcedDate: null, closedDate: null, decisionAge: null, reason: null, reversals: 0, noMarketWindows: 0, daysInStatus: 0, closureType: null },
        epilogue: { generated: false, families: [], milestones: [], summaryKey: null },
        rngState: {
            narrative: makeRngStream(saveSeed, 0xA11CE),
            football: makeRngStream(saveSeed, 0xF007BA11),
            microfeed: makeRngStream(saveSeed, 0xFEED2026),
            qa: makeRngStream(saveSeed, 0x0A51A51)
        }
    };
}


// ═══ content/events/18_20/helpers.js ═══
function ambiguousEvent(spec) {
    return {
        id: spec.id,
        ageWindow: spec.ageWindow,
        phase: spec.phase ?? "18_20",
        family: spec.family,
        gates: spec.gates ?? [],
        exclusions: spec.exclusions,
        timeWindow: spec.timeWindow,
        cooldown: spec.cooldown ?? 99999,
        repeatable: false,
        weight: spec.weight ?? 10,
        text: { title: spec.title, body: spec.body },
        intel: { visible: spec.visible, uncertain: spec.uncertain },
        choices: spec.choices.map(c => ({
            id: c.id,
            label: c.label,
            intentTags: c.intentTags,
            immediateEffects: c.immediateEffects,
            outcomeIds: [`${c.id}__PRIMARY`, `${c.id}__SECONDARY`]
        })),
        outcomes: spec.choices.flatMap(c => ([
            {
                id: `${c.id}__PRIMARY`,
                baseWeight: 55,
                modifiers: c.primaryModifiers,
                effects: c.primaryEffects ?? [],
                messages: [c.primaryMessage],
                seedTransitions: c.primarySeedTransitions,
                historyTags: [...c.intentTags, "primary_interpretation"]
            },
            {
                id: `${c.id}__SECONDARY`,
                baseWeight: 45,
                modifiers: c.secondaryModifiers,
                effects: c.secondaryEffects ?? [],
                messages: [c.secondaryMessage],
                seedTransitions: c.secondarySeedTransitions,
                historyTags: [...c.intentTags, "secondary_interpretation"]
            }
        ])),
        seedsRead: spec.seedsRead,
        seedsWrite: spec.seedsWrite,
        npcRefs: spec.npcRefs,
        tags: spec.tags,
        presentation: spec.presentation ?? {
            layoutHint: "decision",
            preloadPriority: "normal",
            assets: [{ id: `hero_${spec.id.toLowerCase()}`, type: "image", role: "hero", fallbackId: `generic_${spec.family}` }]
        },
        canonStatus: spec.canonStatus ?? "technical_adaptation"
    };
}
var n = (path, delta, min = 0, max = 100) => ({ kind: "numeric", path, delta, min, max });
var flag = (name, value = true) => ({ kind: "flag", flag: name, value });
var set = (path, value) => ({ kind: "set", path, value });
var seedCreate = (seedId, intensity, payload = {}) => ({ seedId, action: "create", intensity, payload });


// ═══ content/events/18_20/canonical-events.js ═══
const coachTrustHigh = [{ id: "COACH_TRUST", conditions: [{ path: "rel.NPC_CCH_01.trust", op: "gte", value: 55 }], multiply: 1.18, reason: "La confianza previa del técnico facilita una lectura favorable." }];
const proHigh = [{ id: "PRO_HIGH", conditions: [{ path: "personality.professionalism", op: "gte", value: 60 }], multiply: 1.15, reason: "La profesionalidad previa hace más coherente esta interpretación." }];
var EVENTS_18_20 = [
    E({
        id: "EVT_18_PRE_001", ageWindow: [18, 18], family: "preseason", title: "La lista de 26",
        body: "El móvil vibra mientras desayunas. El delegado del primer equipo te cita para la pretemporada. Nano no ha recibido la llamada.",
        visible: ["La convocatoria es real.", "No existe promesa de quedarse con el primer equipo."],
        uncertain: ["No sabes si eres proyecto real o un número para completar entrenamientos."],
        gates: [{ path: "flags.PRESEASON_FIRST_TEAM_CALL", op: "eq", value: true }], timeWindow: { months: [7] }, weight: 100,
        npcRefs: ["NPC_PLR_14", "NPC_ACA_01"], seedsWrite: ["SEED_RIVAS_TRUST", "SEED_NANO_SHADOW"], tags: ["origin", "friendship", "mentor"],
        choices: [
            { id: "CALL_NANO", label: "Llamar a Nano y contarle exactamente lo que sabes", intentTags: ["friendship", "openness"], immediateEffects: [flag("PRESEASON_STARTED")], primaryMessage: "Nano agradece que se lo cuentes directamente.", secondaryMessage: "Nano responde bien, pero la diferencia entre ambos le duele más de lo que admite.", primaryEffects: [n("rel.NPC_PLR_14.trust", 5)], secondaryEffects: [n("rel.NPC_PLR_14.resentment", 7)], primarySeedTransitions: [seedCreate("SEED_NANO_SHADOW", 25, { earlyTone: "trusted" })], secondarySeedTransitions: [seedCreate("SEED_NANO_SHADOW", 38, { earlyTone: "shadow" })] },
            { id: "CALL_RIVAS", label: "Llamar a Rivas para saber qué espera realmente el primer equipo", intentTags: ["information", "mentor"], immediateEffects: [flag("PRESEASON_STARTED")], primaryMessage: "Rivas te da contexto útil sin venderte certezas.", secondaryMessage: "Rivas ayuda, pero refuerza su papel como filtro de tu carrera.", primaryEffects: [n("rel.NPC_ACA_01.trust", 5), n("control.career", 2)], secondaryEffects: [n("rel.NPC_ACA_01.leverage", 6)], primarySeedTransitions: [seedCreate("SEED_RIVAS_TRUST", 35, { firstCall: "context" })], secondarySeedTransitions: [seedCreate("SEED_RIVAS_TRUST", 42, { firstCall: "dependency" })] },
            { id: "CALL_NO_ONE", label: "No llamar a nadie y tratarlo como una convocatoria más", intentTags: ["autonomy", "reserve"], immediateEffects: [flag("PRESEASON_STARTED")], primaryMessage: "La discreción se lee como autonomía y concentración.", secondaryMessage: "Descubres después que había contexto útil que podrías haber conocido.", primaryEffects: [n("control.career", 4)], secondaryEffects: [n("control.career", -2)] }
        ]
    }),
    E({
        id: "EVT_18_PRE_002", ageWindow: [18, 18], family: "preseason", title: "Cinco minutos más",
        body: "Tras una sesión dura, Vela y Bruno se quedan cruzando balones. Paula te recuerda que ya has llegado a la carga prevista.",
        visible: ["La sesión oficial ha terminado.", "Paula considera suficiente la carga de hoy."],
        uncertain: ["No sabes si Vela está probándote o simplemente necesita otro cuerpo para el ejercicio."],
        gates: [{ path: "flags.PRESEASON_STARTED", op: "eq", value: true }], timeWindow: { months: [7, 8] },
        npcRefs: ["NPC_PLR_10", "NPC_PLR_12", "NPC_MED_01"], seedsWrite: ["SEED_BODY_PRECEDENT"], tags: ["body", "locker"],
        choices: [
            { id: "MAX_INTENSITY", label: "Quedarte y entrenar a máxima intensidad", intentTags: ["effort", "risk"], primaryMessage: "Vela valora que te quedes y el trabajo sale limpio.", secondaryMessage: "La carga extra se nota más de lo esperado y nadie garantiza que haya impresionado a quien importa.", primaryEffects: [n("rel.NPC_PLR_10.respect", 5), n("sport.roleScore", 3), n("body.risk", 4)], secondaryEffects: [n("body.risk", 9), n("body.fatigue", 7)], primarySeedTransitions: [seedCreate("SEED_BODY_PRECEDENT", 35, { pattern: "push" })], secondarySeedTransitions: [seedCreate("SEED_BODY_PRECEDENT", 52, { pattern: "overload" })] },
            { id: "TECHNICAL_ONLY", label: "Quedarte, pero hacer trabajo técnico sin sprints", intentTags: ["balance", "communication"], primaryMessage: "La moderación se interpreta como criterio profesional.", secondaryMessage: "Vela entiende el límite como falta de hambre en un momento de jerarquías.", primaryEffects: [n("rel.NPC_MED_01.trust", 4), n("rel.NPC_PLR_10.respect", 3)], secondaryEffects: [n("rel.NPC_PLR_10.respect", -3)], primarySeedTransitions: [seedCreate("SEED_BODY_PRECEDENT", 28, { pattern: "managed" })], secondarySeedTransitions: [seedCreate("SEED_BODY_PRECEDENT", 30, { pattern: "managed_questioned" })], primaryModifiers: proHigh },
            { id: "RECOVER", label: "Irte a recuperar siguiendo el plan de Paula", intentTags: ["recovery", "discipline"], primaryMessage: "Nadie le da importancia y llegas fresco al siguiente entrenamiento.", secondaryMessage: "Un veterano recuerda que fuiste el primero en marcharte, aunque no exista reproche abierto.", primaryEffects: [n("body.risk", -6), n("rel.NPC_MED_01.trust", 5)], secondaryEffects: [n("body.risk", -5), n("rel.NPC_PLR_10.respect", -2)], primarySeedTransitions: [seedCreate("SEED_BODY_PRECEDENT", 24, { pattern: "protect" })], secondarySeedTransitions: [seedCreate("SEED_BODY_PRECEDENT", 27, { pattern: "protect_seen" })] }
        ]
    }),
    E({
        id: "EVT_18_PRE_003", ageWindow: [18, 18], family: "preseason", title: "Dos órdenes",
        body: "Mena te pide atacar por dentro. Segundos después Bruno te exige abrir el campo. La siguiente jugada nace por tu banda.",
        visible: ["Las dos instrucciones son incompatibles en esa jugada concreta."], uncertain: ["No sabes si Mena está probando comprensión táctica ni si Bruno conoce el plan completo."],
        gates: [{ path: "flags.PRESEASON_STARTED", op: "eq", value: true }], timeWindow: { months: [7, 8] }, npcRefs: ["NPC_CCH_02", "NPC_PLR_12", "NPC_CCH_01"], seedsWrite: ["SEED_MENA_EARLY_READ"], tags: ["tactical", "hierarchy"],
        choices: [
            { id: "OBEY_MENA", label: "Cumplir literalmente la orden de Mena y meterte dentro", intentTags: ["coach", "discipline"], primaryMessage: "Mena aprecia que ejecutes la instrucción y la jugada conserva estructura.", secondaryMessage: "Bruno pierde espacio y te lo hace saber: obedecer también ha tenido coste.", primaryEffects: [n("rel.NPC_CCH_02.trust", 5)], secondaryEffects: [n("rel.NPC_PLR_12.resentment", 5)], primarySeedTransitions: [seedCreate("SEED_MENA_EARLY_READ", 30, { read: "obedient" })], secondarySeedTransitions: [seedCreate("SEED_MENA_EARLY_READ", 27, { read: "literal" })] },
            { id: "OBEY_BRUNO", label: "Hacer caso a Bruno y abrirte", intentTags: ["teammate", "pragmatic"], primaryMessage: "La amplitud libera a Bruno y la acción funciona.", secondaryMessage: "Mena anota que priorizaste una instrucción lateral sobre la del cuerpo técnico.", primaryEffects: [n("rel.NPC_PLR_12.respect", 5)], secondaryEffects: [n("rel.NPC_CCH_02.trust", -4)], primarySeedTransitions: [seedCreate("SEED_MENA_EARLY_READ", 25, { read: "pragmatic" })], secondarySeedTransitions: [seedCreate("SEED_MENA_EARLY_READ", 31, { read: "disobedient" })] },
            { id: "ADAPTIVE", label: "Empezar abierto y atacar dentro cuando cambie el balón", intentTags: ["reading", "risk"], primaryMessage: "El timing sale bien y ambos entienden por qué alteraste la jugada.", secondaryMessage: "El timing falla y parece que no obedeciste a ninguno.", primaryEffects: [n("rel.NPC_CCH_02.respect", 6), n("sport.roleScore", 5)], secondaryEffects: [n("rel.NPC_CCH_02.trust", -4), n("rel.NPC_PLR_12.respect", -3)], primarySeedTransitions: [seedCreate("SEED_MENA_EARLY_READ", 44, { read: "adaptive" })], secondarySeedTransitions: [seedCreate("SEED_MENA_EARLY_READ", 36, { read: "overplayed" })] }
        ]
    }),
    E({
        id: "EVT_18_AGT_001", ageWindow: [18, 18], family: "agent", title: "Dos tarjetas sobre la mesa",
        body: "Héctor Salvatierra aparece con una carpeta gastada. Esa tarde Prisma Sports pide una videollamada. Ambos quieren ser el primero al que escuches.",
        visible: ["Héctor conoce la zona; Prisma tiene más red.", "No hay contrato firmado."], uncertain: ["Héctor dice tener interés real de Segunda; Lucía habla de gente preguntando sin nombrar club."],
        gates: [{ path: "flags.WIN_AGENT", op: "eq", value: true }], timeWindow: { months: [7, 8, 9] }, npcRefs: ["NPC_AGT_01", "NPC_AGT_02", "NPC_PLR_15"], seedsWrite: ["SEED_FIRST_AGENT"], tags: ["agent", "market", "control"],
        choices: [
            { id: "HECTOR_FIRST", label: "Escuchar primero a Héctor y permitirle una consulta sin exclusividad", intentTags: ["local", "information"], immediateEffects: [flag("AGENT_CONTACT_HECTOR")], primaryMessage: "El contacto de Héctor existe y obtienes información útil sin firmar.", secondaryMessage: "La consulta empieza a moverte en el mercado antes de que controles del todo el relato.", primaryEffects: [n("control.career", 2), n("reputation.marketHeat", 5)], secondaryEffects: [n("control.agentDependency", 5), n("reputation.marketHeat", 7)], primarySeedTransitions: [seedCreate("SEED_FIRST_AGENT", 38, { first: "hector", permission: "limited" })], secondarySeedTransitions: [seedCreate("SEED_FIRST_AGENT", 46, { first: "hector", permission: "agenda_started" })] },
            { id: "LUCIA_FIRST", label: "Escuchar primero a Lucía y aceptar un informe de mercado", intentTags: ["network", "information"], immediateEffects: [flag("AGENT_CONTACT_PRISMA")], primaryMessage: "Prisma aporta una lectura de mercado más amplia y todavía no exige exclusividad.", secondaryMessage: "El informe te compara con Adrián y deja claro que la agencia no invertirá igual en ambos.", primaryEffects: [n("reputation.marketHeat", 6), n("control.career", 2)], secondaryEffects: [n("rel.NPC_PLR_15.resentment", 3), n("control.agentDependency", 4)], primarySeedTransitions: [seedCreate("SEED_FIRST_AGENT", 40, { first: "prisma", permission: "report" })], secondarySeedTransitions: [seedCreate("SEED_FIRST_AGENT", 45, { first: "prisma", permission: "comparison" })] },
            { id: "COMPARE", label: "Hablar con ambos sin autorizar contactos todavía", intentTags: ["comparison", "control"], primaryMessage: "Comparar mejora tu información y mantiene el control en tus manos.", secondaryMessage: "Ambos perciben que no son exclusivos y reducen el esfuerzo inmediato.", primaryEffects: [n("control.career", 6)], secondaryEffects: [n("reputation.marketHeat", -2)], primarySeedTransitions: [seedCreate("SEED_FIRST_AGENT", 30, { first: "both", permission: "none" })], secondarySeedTransitions: [seedCreate("SEED_FIRST_AGENT", 26, { first: "both", permission: "cold" })] },
            { id: "WAIT", label: "Rechazar representación hasta tener minutos oficiales", intentTags: ["autonomy", "patience"], immediateEffects: [flag("NO_AGENT")], primaryMessage: "Mantienes independencia y el mercado sigue abierto.", secondaryMessage: "Una ventana real se enfría antes de que llegue el debut.", primaryEffects: [n("control.career", 7)], secondaryEffects: [n("reputation.marketHeat", -5)], primarySeedTransitions: [seedCreate("SEED_FIRST_AGENT", 22, { first: "none", permission: "wait" })], secondarySeedTransitions: [seedCreate("SEED_FIRST_AGENT", 27, { first: "none", permission: "missed_window" })] }
        ]
    }),
    E({
        id: "EVT_18_MATCH_001", ageWindow: [18, 18], family: "sport", title: "Minuto 78",
        body: "Debutas con 1–1. Mena te pide cerrar dentro y atacar al lateral al recuperar. Recibes aislado contra un defensor cansado.",
        visible: ["Conoces la instrucción táctica y el estado del partido."], uncertain: ["No sabes cuánto tolerará Montalbán un error ni cuánto valorará una acción de impacto."],
        gates: [{ path: "flags.OFFICIAL_DEBUT", op: "eq", value: true }], timeWindow: { months: [8, 9, 10, 11, 12, 1, 2, 3, 4, 5] }, npcRefs: ["NPC_CCH_01", "NPC_CCH_02"], seedsWrite: ["SEED_MENA_EARLY_READ"], tags: ["match", "tactical", "debut"],
        choices: [
            { id: "TAKE_ON", label: "Atacar el uno contra uno inmediatamente", intentTags: ["bold", "risk"], primaryMessage: "Superas al lateral y la acción cambia el tono de tu debut.", secondaryMessage: "Pierdes el duelo, pero el staff distingue entre una ventana real y un error gratuito.", primaryEffects: [n("sport.roleScore", 8), n("reputation.mediaHeat", 4)], secondaryEffects: [n("sport.roleScore", -2)], primarySeedTransitions: [seedCreate("SEED_MENA_EARLY_READ", 42, { tag: "atrevido" })], secondarySeedTransitions: [seedCreate("SEED_MENA_EARLY_READ", 31, { tag: "atrevido_failed" })] },
            { id: "SAFE", label: "Jugar seguro y conservar la posesión", intentTags: ["safe", "structure"], primaryMessage: "El pase simple preserva estructura y el técnico lo valora.", secondaryMessage: "La grada y parte del staff leen la seguridad como una oportunidad desaprovechada.", primaryEffects: [n("rel.NPC_CCH_01.trust", 4)], secondaryEffects: [n("sport.roleScore", -2)], primarySeedTransitions: [seedCreate("SEED_MENA_EARLY_READ", 28, { tag: "fiable" })], secondarySeedTransitions: [seedCreate("SEED_MENA_EARLY_READ", 25, { tag: "cautious" })], primaryModifiers: coachTrustHigh },
            { id: "READ_DEFENDER", label: "Amagar, esperar apoyo y decidir según la reacción del lateral", intentTags: ["reading", "adaptive"], primaryMessage: "Lees la reacción y creas una ventaja sin desordenarte.", secondaryMessage: "La ventana se agota mientras esperas y la jugada pierde peligro.", primaryEffects: [n("sport.roleScore", 6), n("rel.NPC_CCH_02.respect", 4)], secondaryEffects: [n("sport.roleScore", -1)], primarySeedTransitions: [seedCreate("SEED_MENA_EARLY_READ", 40, { tag: "reader" })], secondarySeedTransitions: [seedCreate("SEED_MENA_EARLY_READ", 27, { tag: "hesitant" })] }
        ]
    }),
    E({
        id: "EVT_18_PRS_001", ageWindow: [18, 18], family: "press", title: "Tres líneas",
        body: "Tras el partido, Clara te pide tres líneas sobre si estabas preparado y si los jóvenes merecen más oportunidades.",
        visible: ["Clara es periodista local y publicará algo si respondes."], uncertain: ["Todavía no existe confianza suficiente para saber cómo tratará un off the record."],
        gates: [{ path: "flags.FIRST_TEAM_ATTENTION", op: "eq", value: true }], timeWindow: { months: [8, 9, 10, 11, 12, 1, 2, 3, 4, 5] }, npcRefs: ["NPC_PRS_01", "NPC_CCH_01"], seedsWrite: ["SEED_CLARA_CHANNEL"], tags: ["media", "control"],
        choices: [
            { id: "PRUDENT_QUOTE", label: "«Estoy para ayudar cuando el míster decida»", intentTags: ["prudent", "public"], immediateEffects: [flag("CLARA_CONTACTED")], primaryMessage: "La frase se lee como madurez.", secondaryMessage: "La frase suena prefabricada y no cambia tu posición.", primaryEffects: [n("rel.NPC_CCH_01.trust", 3)], secondaryEffects: [], primarySeedTransitions: [seedCreate("SEED_CLARA_CHANNEL", 24, { mode: "quote_prudent" })], secondarySeedTransitions: [seedCreate("SEED_CLARA_CHANNEL", 20, { mode: "quote_cold" })] },
            { id: "YOUTH_QUOTE", label: "«Los jóvenes necesitamos oportunidades para demostrar»", intentTags: ["assertive", "public"], immediateEffects: [flag("CLARA_CONTACTED")], primaryMessage: "La frase genera presión útil y atención.", secondaryMessage: "Montalbán entiende la frase como una presión innecesaria.", primaryEffects: [n("reputation.mediaHeat", 7), n("reputation.marketHeat", 3)], secondaryEffects: [n("rel.NPC_CCH_01.trust", -5), n("reputation.mediaHeat", 6)], primarySeedTransitions: [seedCreate("SEED_CLARA_CHANNEL", 34, { mode: "assertive" })], secondarySeedTransitions: [seedCreate("SEED_CLARA_CHANNEL", 38, { mode: "friction" })] },
            { id: "CONTEXT_ONLY", label: "Hablar con Clara como contexto, sin cita", intentTags: ["information", "private"], immediateEffects: [flag("CLARA_CONTACTED")], primaryMessage: "Clara respeta el contexto y empieza un canal útil.", secondaryMessage: "Obtienes información, pero también has abierto una relación que puede volverse transaccional.", primaryEffects: [n("rel.NPC_PRS_01.trust", 7), n("control.career", 2)], secondaryEffects: [n("rel.NPC_PRS_01.leverage", 6)], primarySeedTransitions: [seedCreate("SEED_CLARA_CHANNEL", 44, { mode: "context" })], secondarySeedTransitions: [seedCreate("SEED_CLARA_CHANNEL", 48, { mode: "transactional" })] },
            { id: "NO_REPLY", label: "No responder", intentTags: ["silence", "control"], primaryMessage: "El silencio te protege y la noticia muere rápido.", secondaryMessage: "Otros llenan el vacío y pierdes control sobre el relato.", primaryEffects: [n("reputation.mediaHeat", -2)], secondaryEffects: [n("control.career", -2)] }
        ]
    }),
    E({
        id: "EVT_18_SOC_001", ageWindow: [18, 18], family: "social", title: "02:13",
        body: "Dani cumple años. A las 02:13 alguien hace una foto de grupo. No estás borracho, pero al día siguiente hay recuperación y quizá convocatoria.",
        visible: ["Conoces el horario y tu estado físico."], uncertain: ["No sabes quién hizo la foto ni si la publicará."],
        gates: [{ path: "reputation.mediaHeat", op: "gte", value: 5 }], timeWindow: { months: [9, 10, 11, 12, 1, 2, 3, 4] }, npcRefs: ["NPC_SOC_01"], seedsWrite: ["SEED_DANI_NORMALITY"], tags: ["social", "image", "body"],
        choices: [
            { id: "DELETE_AND_LEAVE", label: "Pedir que borren la foto y marcharte", intentTags: ["control", "caution"], primaryMessage: "La foto desaparece y Dani acepta que te marches.", secondaryMessage: "Pedir que la borren hace que alguien pregunte por qué te preocupa tanto.", primaryEffects: [n("body.fatigue", -2)], secondaryEffects: [n("reputation.mediaHeat", 3)], primarySeedTransitions: [seedCreate("SEED_DANI_NORMALITY", 28, { pattern: "limits" })], secondarySeedTransitions: [seedCreate("SEED_DANI_NORMALITY", 35, { pattern: "limits_tension" })] },
            { id: "STAY", label: "Quedarte: no estás haciendo nada prohibido", intentTags: ["normality", "risk"], primaryMessage: "No pasa absolutamente nada y la noche queda en una anécdota.", secondaryMessage: "La foto circula justo cuando el siguiente entrenamiento sale mal.", primaryEffects: [n("rel.NPC_SOC_01.affinity", 5)], secondaryEffects: [n("reputation.mediaHeat", 9), n("body.fatigue", 5)], primarySeedTransitions: [seedCreate("SEED_DANI_NORMALITY", 32, { pattern: "normality" })], secondarySeedTransitions: [seedCreate("SEED_DANI_NORMALITY", 45, { pattern: "night_photo" })] },
            { id: "LEAVE_SILENT", label: "Marcharte sin decir nada sobre la foto", intentTags: ["quiet", "balance"], primaryMessage: "Te vas, descansas y la foto no cobra importancia.", secondaryMessage: "La imagen aparece igualmente; no haber intentado controlarla te deja sin contexto público.", primaryEffects: [n("body.risk", -2)], secondaryEffects: [n("reputation.mediaHeat", 5)], primarySeedTransitions: [seedCreate("SEED_DANI_NORMALITY", 24, { pattern: "quiet_exit" })], secondarySeedTransitions: [seedCreate("SEED_DANI_NORMALITY", 30, { pattern: "quiet_exposed" })] },
            { id: "CONTROL_STORY", label: "Subir tú mismo una foto anterior y controlar el relato", intentTags: ["image", "proactive"], primaryMessage: "Controlas el encuadre y reduces el interés de la foto de madrugada.", secondaryMessage: "El intento de controlar el relato aumenta tu visibilidad y convierte una noche normal en contenido.", primaryEffects: [n("control.career", 3)], secondaryEffects: [n("reputation.mediaHeat", 7)], primarySeedTransitions: [seedCreate("SEED_DANI_NORMALITY", 31, { pattern: "image_control" })], secondarySeedTransitions: [seedCreate("SEED_DANI_NORMALITY", 36, { pattern: "overexposure" })] }
        ]
    }),
    E({
        id: "EVT_18_TACT_001", ageWindow: [18, 18], family: "tactical", title: "Un puesto que no es el tuyo",
        body: "Montalbán propone entrenarte como carrilero en un 5-3-2: ahí tiene hueco; de extremo no promete nada.",
        visible: ["Existe una posibilidad real de minutos en otra posición."], uncertain: ["No sabes si será una adaptación temporal o una etiqueta permanente."],
        gates: [{ path: "sport.roleScore", op: "lte", value: 55 }, { path: "flags.FORMATION_532", op: "eq", value: true }], timeWindow: { months: [8, 9, 10, 11, 12, 1, 2, 3] }, npcRefs: ["NPC_CCH_01", "NPC_ACA_01"], tags: ["role", "reinvention"],
        choices: [
            { id: "ACCEPT", label: "Aceptar sin condiciones y aprender el puesto", intentTags: ["adapt", "minutes"], immediateEffects: [flag("POSITION_CONVERSION")], primaryMessage: "La adaptación abre minutos que no existían de extremo.", secondaryMessage: "Juegas más, pero el mercado empieza a verte en un perfil que no elegiste.", primaryEffects: [n("sport.roleScore", 9)], secondaryEffects: [n("sport.roleScore", 5), set("sport.positionIdentity", "wingback")], primaryModifiers: coachTrustHigh },
            { id: "NEGOTIATE", label: "Aceptar, pero pedir sesiones extra para mantener trabajo ofensivo", intentTags: ["adapt", "identity"], immediateEffects: [flag("POSITION_CONVERSION")], primaryMessage: "Montalbán interpreta la petición como profesionalidad y acepta el equilibrio.", secondaryMessage: "La petición parece poner condiciones sin haber ganado todavía estatus.", primaryEffects: [n("sport.roleScore", 6), n("rel.NPC_CCH_01.respect", 4)], secondaryEffects: [n("rel.NPC_CCH_01.trust", -3)] },
            { id: "REFUSE", label: "Preferir competir por tu posición natural aunque tardes más", intentTags: ["identity", "patience"], primaryMessage: "Proteges tu perfil y aparece otra ventana como extremo más adelante.", secondaryMessage: "La ventana alternativa no llega y tu ROLE se congela durante semanas.", primaryEffects: [set("sport.positionIdentity", "winger")], secondaryEffects: [n("sport.roleScore", -6)] }
        ]
    }),
    E({
        id: "EVT_18_CAP_001", ageWindow: [18, 18], family: "captaincy", title: "El papel de Vela",
        body: "Vela cree que la dirección filtra que su salario bloquea fichajes y quiere un mensaje colectivo pidiendo respeto a los códigos del club.",
        visible: ["Vela te pide apoyo y no sabes si habrá comunicado público."], uncertain: ["Leo prefiere no escalar; Bruno cree que la directiva solo entiende presión."],
        gates: [{ path: "flags.VELA_BOARD_TENSION", op: "eq", value: true }], timeWindow: { months: [10, 11, 12, 1, 2, 3] }, npcRefs: ["NPC_PLR_10", "NPC_PLR_11", "NPC_PLR_12", "NPC_CCH_02", "NPC_DIR_01"], seedsWrite: ["SEED_VELA_STANCE", "SEED_FIRST_LEAK"], tags: ["locker", "institution", "confidentiality"],
        choices: [
            { id: "PUBLIC_SUPPORT", label: "Apoyar el texto y permitir que figure tu nombre", intentTags: ["solidarity", "public"], primaryMessage: "Vela recuerda el apoyo y el vestuario te integra más.", secondaryMessage: "La dirección toma nota de tu nombre en una disputa que no controlas.", primaryEffects: [n("rel.NPC_PLR_10.trust", 7)], secondaryEffects: [n("rel.NPC_DIR_01.trust", -6)], primarySeedTransitions: [seedCreate("SEED_VELA_STANCE", 45, { stance: "public" })], secondarySeedTransitions: [seedCreate("SEED_VELA_STANCE", 52, { stance: "public_cost" })] },
            { id: "PRIVATE_SUPPORT", label: "Apoyar a Vela en privado pero pedir que tu nombre no aparezca", intentTags: ["solidarity", "caution"], primaryMessage: "Vela acepta el límite y valora la conversación privada.", secondaryMessage: "Vela entiende la reserva como apoyo insuficiente cuando más lo necesitaba.", primaryEffects: [n("rel.NPC_PLR_10.trust", 5)], secondaryEffects: [n("rel.NPC_PLR_10.respect", -2)], primarySeedTransitions: [seedCreate("SEED_VELA_STANCE", 36, { stance: "private" })], secondarySeedTransitions: [seedCreate("SEED_VELA_STANCE", 32, { stance: "private_doubt" })] },
            { id: "NEUTRAL", label: "Decir que no conoces suficiente información y no participar", intentTags: ["neutral", "information"], primaryMessage: "La neutralidad se entiende como sensatez de un jugador joven.", secondaryMessage: "Parte del vestuario la interpreta como falta de compromiso.", primaryEffects: [n("control.career", 2)], secondaryEffects: [n("rel.NPC_PLR_10.respect", -3)], primarySeedTransitions: [seedCreate("SEED_VELA_STANCE", 25, { stance: "neutral" })], secondarySeedTransitions: [seedCreate("SEED_VELA_STANCE", 29, { stance: "neutral_coward" })] },
            { id: "WARN_MENA", label: "Avisar discretamente a Mena de que el vestuario está a punto de moverse", intentTags: ["prevention", "confidentiality"], primaryMessage: "Mena evita que la situación escale y nadie identifica la fuente.", secondaryMessage: "La información regresa al vestuario y tu gesto se lee como ruptura de código.", primaryEffects: [n("rel.NPC_CCH_02.trust", 7)], secondaryEffects: [n("rel.NPC_PLR_10.trust", -9), n("rel.NPC_PLR_11.trust", -5)], primarySeedTransitions: [seedCreate("SEED_VELA_STANCE", 42, { stance: "warned_staff" })], secondarySeedTransitions: [seedCreate("SEED_FIRST_LEAK", 48, { source: "locker_to_staff" }), seedCreate("SEED_VELA_STANCE", 50, { stance: "betrayal_suspected" })] }
        ]
    }),
    E({
        id: "EVT_18_MED_001", ageWindow: [18, 18], family: "medical", title: "El aductor",
        body: "El jueves notas un pinchazo pequeño. Paula recomienda 48 horas de descarga. El domingo podría abrirse una oportunidad porque Bruno está sancionado.",
        visible: ["Paula recomienda descarga; no ordena baja médica."], uncertain: ["No sabes si la oportunidad del domingo llegará realmente."],
        gates: [{ path: "flags.BODY_WINDOW", op: "eq", value: true }], timeWindow: { months: [9, 10, 11, 12, 1, 2, 3, 4, 5] }, npcRefs: ["NPC_MED_01", "NPC_CCH_01", "NPC_PLR_12", "NPC_FAM_02"], seedsWrite: ["SEED_PHYSIO_CONFIDENCE", "SEED_BODY_PRECEDENT"], tags: ["body", "opportunity"],
        choices: [
            { id: "FOLLOW_PAULA", label: "Seguir exactamente el plan de Paula", intentTags: ["health", "trust"], primaryMessage: "La descarga funciona y sigues disponible con mejor información.", secondaryMessage: "Pierdes la ventana deportiva aunque el cuerpo hubiera tolerado entrenar.", primaryEffects: [n("body.risk", -8), n("rel.NPC_MED_01.trust", 7)], secondaryEffects: [n("body.risk", -6), n("sport.roleScore", -3)], primarySeedTransitions: [seedCreate("SEED_PHYSIO_CONFIDENCE", 45, { pattern: "followed" }), seedCreate("SEED_BODY_PRECEDENT", 35, { pattern: "protect" })], secondarySeedTransitions: [seedCreate("SEED_PHYSIO_CONFIDENCE", 40, { pattern: "followed_cost" }), seedCreate("SEED_BODY_PRECEDENT", 37, { pattern: "protect_cost" })] },
            { id: "TEST_SATURDAY", label: "Pedir una prueba el sábado y decidir entonces", intentTags: ["information", "balance"], primaryMessage: "La prueba añade información suficiente para ajustar el riesgo.", secondaryMessage: "Esperar a la prueba te deja fuera de una convocatoria decidida antes.", primaryEffects: [n("body.risk", -4), n("rel.NPC_MED_01.trust", 5)], secondaryEffects: [n("sport.roleScore", -2)], primarySeedTransitions: [seedCreate("SEED_PHYSIO_CONFIDENCE", 42, { pattern: "test" }), seedCreate("SEED_BODY_PRECEDENT", 32, { pattern: "test" })], secondarySeedTransitions: [seedCreate("SEED_BODY_PRECEDENT", 35, { pattern: "test_missed" })] },
            { id: "TRAIN_NORMAL", label: "Quitar importancia y entrenar normal", intentTags: ["risk", "opportunity"], primaryMessage: "El aductor responde y mantienes abierta la oportunidad.", secondaryMessage: "La molestia empeora y el coste de haber ocultado información pesa más que el pinchazo inicial.", primaryEffects: [n("sport.roleScore", 3), n("body.risk", 5)], secondaryEffects: [n("body.risk", 16), n("rel.NPC_MED_01.trust", -9)], primarySeedTransitions: [seedCreate("SEED_BODY_PRECEDENT", 48, { pattern: "played_through" })], secondarySeedTransitions: [seedCreate("SEED_BODY_PRECEDENT", 68, { pattern: "hidden_recurrence" }), seedCreate("SEED_PHYSIO_CONFIDENCE", 58, { pattern: "withheld" })] },
            { id: "TELL_COACH", label: "Contárselo solo a Montalbán y dejar que él decida", intentTags: ["hierarchy", "delegation"], primaryMessage: "Montalbán valora que se lo comuniques y coordina con Paula.", secondaryMessage: "Paula descubre que la dejaste fuera de una decisión médica y reduce su confianza.", primaryEffects: [n("rel.NPC_CCH_01.trust", 5)], secondaryEffects: [n("rel.NPC_MED_01.trust", -6)], primarySeedTransitions: [seedCreate("SEED_BODY_PRECEDENT", 38, { pattern: "delegated_coach" })], secondarySeedTransitions: [seedCreate("SEED_PHYSIO_CONFIDENCE", 50, { pattern: "bypassed" })] }
        ]
    }),
    E({
        id: "EVT_18_PRS_002", ageWindow: [18, 18], family: "press", title: "Lo que Clara sabe",
        body: "Clara te dice que el club necesita una venta antes del verano y pregunta si Vela discutió con Ferrer.",
        visible: ["Clara afirma tener información financiera concreta."], uncertain: ["No sabes cuánto sabe ya sobre Vela ni qué parte publicará."],
        gates: [{ path: "flags.CLARA_CONTACTED", op: "eq", value: true }], timeWindow: { months: [11, 12, 1, 2, 3, 4] }, npcRefs: ["NPC_PRS_01", "NPC_PLR_10", "NPC_DIR_02"], seedsRead: ["SEED_CLARA_CHANNEL"], seedsWrite: ["SEED_CLARA_CHANNEL", "SEED_FIRST_LEAK"], tags: ["information", "press", "confidentiality"],
        choices: [
            { id: "KEEP_LOCKER", label: "No confirmar lo de Vela y quedarte con el dato financiero", intentTags: ["locker", "information"], primaryMessage: "Proteges el vestuario y Clara acepta el límite.", secondaryMessage: "Clara interpreta que solo quieres recibir información, no compartirla.", primaryEffects: [n("rel.NPC_PLR_10.trust", 3)], secondaryEffects: [n("rel.NPC_PRS_01.trust", -3)] },
            { id: "DENY", label: "Negar el conflicto aunque sabes que ocurrió", intentTags: ["protect", "lie"], primaryMessage: "La negación protege temporalmente a Vela.", secondaryMessage: "Clara ya conocía parte de la discusión y tu credibilidad cae.", primaryEffects: [n("rel.NPC_PLR_10.trust", 4)], secondaryEffects: [n("rel.NPC_PRS_01.trust", -9)] },
            { id: "TRADE_INFO", label: "Dar una versión mínima de Vela a cambio de detalles financieros", intentTags: ["transaction", "leverage"], primaryMessage: "El intercambio mejora tu conocimiento y Clara respeta el acuerdo.", secondaryMessage: "La versión mínima aparece deformada en otro canal y ya existe un precedente de filtración.", primaryEffects: [n("control.career", 6), n("rel.NPC_PRS_01.trust", 5)], secondaryEffects: [n("reputation.mediaHeat", 7), n("rel.NPC_PLR_10.trust", -5)], primarySeedTransitions: [seedCreate("SEED_CLARA_CHANNEL", 55, { mode: "trade" })], secondarySeedTransitions: [seedCreate("SEED_FIRST_LEAK", 52, { mode: "trade_leaked" })] },
            { id: "FORWARD", label: "Cortar la conversación y reenviar el mensaje a tu agente o familia", intentTags: ["delegate", "contract"], primaryMessage: "La pista se convierte en información útil para tu siguiente negociación.", secondaryMessage: "El dato circula por más manos y pierdes trazabilidad sobre su origen.", primaryEffects: [n("control.career", 4)], secondaryEffects: [n("reputation.marketHeat", 5)], secondarySeedTransitions: [seedCreate("SEED_FIRST_LEAK", 36, { mode: "forwarded" })] }
        ]
    }),
    E({
        id: "EVT_18_JAN_001", ageWindow: [18, 18], family: "market", title: "Enero no espera",
        body: "Llega enero y UDV quiere ordenar la segunda vuelta. Tu rol, contrato y mercado hacen que quedarse, salir cedido o esperar tengan costes distintos.",
        visible: ["Conoces las ofertas formales que existan y tu situación contractual."], uncertain: ["No sabes qué oportunidad seguirá viva en la última semana del mercado."],
        timeWindow: { months: [1] }, npcRefs: ["NPC_DIR_02", "NPC_AGT_01", "NPC_AGT_02", "NPC_CCH_01"], seedsWrite: ["SEED_EXIT_STYLE_UDV", "SEED_FIRST_LEAK", "SEED_CONTRACT_HARDLINE"], tags: ["market", "contract", "route"],
        choices: [
            { id: "STAY_WITH_ROLE", label: "Priorizar quedarse si el club concreta un rol razonable", intentTags: ["stability", "role"], primaryMessage: "UDV concreta un plan y quedarse conserva una ventana real.", secondaryMessage: "El plan queda en palabras y la segunda vuelta no cambia tu rol.", primaryEffects: [n("sport.roleScore", 5)], secondaryEffects: [n("control.career", -3)], primarySeedTransitions: [seedCreate("SEED_EXIT_STYLE_UDV", 28, { january: "stay" })], secondarySeedTransitions: [seedCreate("SEED_EXIT_STYLE_UDV", 35, { january: "stay_promises" })] },
            { id: "LOAN", label: "Aceptar una cesión con minutos probables aunque bajes de contexto", intentTags: ["minutes", "ladder"], primaryMessage: "La cesión te da continuidad y cambia tu valor deportivo.", secondaryMessage: "Juegas más, pero el contexto te aleja del plan inmediato de UDV.", primaryEffects: [n("sport.roleScore", 12), set("role", "loan_rotation"), set("club", "DEVELOPMENT_CLUB"), set("tier", 4), flag("LOAN_ACTIVE", true)], secondaryEffects: [n("sport.roleScore", 7), n("reputation.prestige", -2), set("club", "DEVELOPMENT_CLUB"), set("tier", 4), flag("LOAN_ACTIVE", true)], primarySeedTransitions: [seedCreate("SEED_EXIT_STYLE_UDV", 42, { january: "loan" })], secondarySeedTransitions: [seedCreate("SEED_EXIT_STYLE_UDV", 38, { january: "loan_distance" })] },
            { id: "TRANSFER", label: "Aceptar traspaso definitivo si existe comprador y términos mínimos", intentTags: ["exit", "control"], primaryMessage: "La salida se negocia con términos claros y abre una ruta nueva.", secondaryMessage: "UDV necesita caja y acepta, pero parte del entorno interpreta la salida como prematura.", primaryEffects: [n("control.career", 8), n("reputation.marketHeat", 6), set("club", "NEW_CLUB"), set("world.ownerClub", "NEW_CLUB"), set("tier", 3)], secondaryEffects: [n("reputation.mediaHeat", 5), set("club", "NEW_CLUB"), set("world.ownerClub", "NEW_CLUB"), set("tier", 3), flag("CONFLICT_EXIT", true)], primarySeedTransitions: [seedCreate("SEED_EXIT_STYLE_UDV", 58, { january: "transfer" })], secondarySeedTransitions: [seedCreate("SEED_EXIT_STYLE_UDV", 64, { january: "transfer_contested" })] },
            { id: "WAIT_DEADLINE", label: "Esperar a los últimos días por una opción mejor", intentTags: ["patience", "risk"], primaryMessage: "La espera mejora la opción disponible en los últimos días.", secondaryMessage: "El mercado se cierra y una alternativa ficha a otro jugador.", primaryEffects: [n("reputation.marketHeat", 7)], secondaryEffects: [n("reputation.marketHeat", -8), n("control.career", -3)] }
        ]
    }),
    E({
        id: "EVT_18_TEAM_001", ageWindow: [18, 18], family: "team", title: "Una noche para Bruno",
        body: "Bruno te dice que habrá ojeadores y te pide que le busques si jugáis juntos: necesita números para salir; si sale, tú tendrás espacio.",
        visible: ["Bruno tiene interés en marcharse y tu posición se beneficiaría de su salida."], uncertain: ["No sabes cuánto pesa realmente ese partido para los ojeadores."],
        gates: [{ path: "flags.BRUNO_SCOUTS", op: "eq", value: true }], timeWindow: { months: [1, 2, 3, 4] }, npcRefs: ["NPC_PLR_12", "NPC_CCH_02"], seedsWrite: ["SEED_BRUNO_FAVOR"], tags: ["locker", "market", "conflict"],
        choices: [
            { id: "HELP_REASONABLE", label: "Aceptar y buscarle cuando sea razonable", intentTags: ["team", "favor"], primaryMessage: "La cooperación mejora al equipo y Bruno recuerda el gesto.", secondaryMessage: "Forzar una búsqueda en una jugada dudosa empeora una posesión y deja preguntas.", primaryEffects: [n("rel.NPC_PLR_12.trust", 7)], secondaryEffects: [n("sport.roleScore", -2)], primarySeedTransitions: [seedCreate("SEED_BRUNO_FAVOR", 46, { stance: "helped" })], secondarySeedTransitions: [seedCreate("SEED_BRUNO_FAVOR", 42, { stance: "overhelped" })] },
            { id: "NO_PROMISE", label: "Decir que harás la mejor jugada, sin prometer", intentTags: ["team", "boundaries"], primaryMessage: "Bruno acepta el límite y la relación queda limpia.", secondaryMessage: "Bruno oye una negativa elegante en un momento que para él era importante.", primaryEffects: [n("rel.NPC_PLR_12.respect", 4)], secondaryEffects: [n("rel.NPC_PLR_12.affinity", -3)], primarySeedTransitions: [seedCreate("SEED_BRUNO_FAVOR", 30, { stance: "no_promise" })], secondarySeedTransitions: [seedCreate("SEED_BRUNO_FAVOR", 34, { stance: "refused" })] },
            { id: "AGREE_BUT_SELF", label: "Aceptar verbalmente pero decidir en el partido por ti mismo", intentTags: ["opportunism", "self"], primaryMessage: "La contradicción nunca sale a la luz y juegas según la situación.", secondaryMessage: "Bruno detecta que prometiste algo que no pensabas cumplir.", primaryEffects: [n("control.career", 3)], secondaryEffects: [n("rel.NPC_PLR_12.trust", -10), n("rel.NPC_PLR_12.resentment", 7)], primarySeedTransitions: [seedCreate("SEED_BRUNO_FAVOR", 40, { stance: "hidden_self" })], secondarySeedTransitions: [seedCreate("SEED_BRUNO_FAVOR", 62, { stance: "betrayed" })] },
            { id: "TELL_MENA", label: "Contárselo a Mena para evitar una agenda privada en el partido", intentTags: ["coach", "code"], primaryMessage: "Mena agradece saberlo y la preparación táctica queda protegida.", secondaryMessage: "Bruno descubre que llevaste una conversación privada al cuerpo técnico.", primaryEffects: [n("rel.NPC_CCH_02.trust", 7)], secondaryEffects: [n("rel.NPC_PLR_12.trust", -9)], primarySeedTransitions: [seedCreate("SEED_BRUNO_FAVOR", 35, { stance: "staff" })], secondarySeedTransitions: [seedCreate("SEED_BRUNO_FAVOR", 55, { stance: "code_broken" })] }
        ]
    }),
    E({
        id: "EVT_18_MATCH_002", ageWindow: [18, 18], family: "sport", title: "El balón parado",
        body: "Minuto 89. El lanzador habitual está fuera y un veterano tiene el balón. Tú entrenas faltas directas.",
        visible: ["Sabes quién suele lanzar y que tú has trabajado esa acción."], uncertain: ["No sabes cómo leerá el grupo una iniciativa tan visible."],
        gates: [{ path: "flags.SET_PIECE_WINDOW", op: "eq", value: true }], timeWindow: { months: [2, 3, 4, 5] }, npcRefs: ["NPC_PLR_10", "NPC_PLR_11"], tags: ["match", "initiative", "hierarchy"],
        choices: [
            { id: "ASK_DIRECT", label: "Pedir el balón directamente", intentTags: ["initiative", "bold"], primaryMessage: "La iniciativa se convierte en liderazgo porque la ejecución justifica la petición.", secondaryMessage: "La jerarquía interpreta el gesto como ego antes de que el resultado importe.", primaryEffects: [n("sport.roleScore", 5), n("rel.NPC_PLR_10.respect", 4)], secondaryEffects: [n("rel.NPC_PLR_10.respect", -5)] },
            { id: "ASK_VETERAN", label: "Preguntar al veterano si quiere que la tires", intentTags: ["initiative", "respect"], primaryMessage: "El veterano cede y la petición parece segura, no invasiva.", secondaryMessage: "El momento pasa mientras negociáis y otro jugador asume la acción.", primaryEffects: [n("rel.NPC_PLR_10.respect", 5)], secondaryEffects: [] },
            { id: "DO_NOT_INTERVENE", label: "No intervenir", intentTags: ["hierarchy", "patience"], primaryMessage: "Respetar la jerarquía se entiende como lectura del grupo.", secondaryMessage: "El staff se pregunta si faltó iniciativa en una ventana real.", primaryEffects: [n("rel.NPC_PLR_11.trust", 3)], secondaryEffects: [n("sport.roleScore", -2)] }
        ]
    }),
    E({
        id: "EVT_18_END_001", ageWindow: [18, 18], family: "contract", title: "Quedan cuatro partidos",
        body: "UDV llega al final con el objetivo abierto. Montalbán reduce rotaciones y tu futuro también empieza a decidirse.",
        visible: ["Conoces la clasificación, tu rol y carga aproximada."], uncertain: ["No sabes si el técnico mantendrá el plan tras el siguiente resultado."],
        timeWindow: { months: [4, 5] }, npcRefs: ["NPC_CCH_01", "NPC_MED_01", "NPC_AGT_01", "NPC_AGT_02"], seedsWrite: ["SEED_COACH_PUBLIC", "SEED_EXIT_STYLE_UDV"], tags: ["contract", "coach", "endseason"],
        choices: [
            { id: "WAIT", label: "Aceptar cualquier rol y no abrir conversaciones hasta el final", intentTags: ["team", "patience"], primaryMessage: "El silencio encaja con el momento colectivo y no te cuesta posición.", secondaryMessage: "Al acabar descubres que otros ya habían movido sus piezas.", primaryEffects: [n("rel.NPC_CCH_01.trust", 3)], secondaryEffects: [n("control.career", -4)], primarySeedTransitions: [seedCreate("SEED_EXIT_STYLE_UDV", 24, { end: "wait" })], secondarySeedTransitions: [seedCreate("SEED_EXIT_STYLE_UDV", 30, { end: "late" })] },
            { id: "PRIVATE_ROLE", label: "Pedir una conversación privada para conocer tu lugar exacto", intentTags: ["direct", "information"], primaryMessage: "La conversación aporta claridad sin salir del vestuario.", secondaryMessage: "Montalbán se cierra y entiende que la pregunta llega en mal momento.", primaryEffects: [n("control.career", 5)], secondaryEffects: [n("rel.NPC_CCH_01.trust", -3)] },
            { id: "EXTERNAL_PRESSURE", label: "Usar agente o círculo para recordar al club que tu futuro se decide ahora", intentTags: ["leverage", "external"], primaryMessage: "La presión abre una negociación que estaba parada.", secondaryMessage: "La dirección la considera inoportuna mientras el equipo se juega el objetivo.", primaryEffects: [n("reputation.marketHeat", 5), n("control.career", 4)], secondaryEffects: [n("rel.NPC_DIR_02.trust", -5)], primarySeedTransitions: [seedCreate("SEED_EXIT_STYLE_UDV", 40, { end: "pressure" })], secondarySeedTransitions: [seedCreate("SEED_EXIT_STYLE_UDV", 44, { end: "pressure_cost" })] }
        ]
    }),
    E({
        id: "EVT_18_END_002", ageWindow: [18, 18], family: "press", title: "El pasillo vacío",
        body: "Tras una derrota, Clara te encuentra solo y pregunta: «¿Tú confías en Montalbán?». Su continuidad no está decidida.",
        visible: ["No sabes si Montalbán seguirá."], uncertain: ["Un cambio de técnico podría beneficiarte o perjudicarte y nadie puede asegurarlo."],
        gates: [{ path: "reputation.mediaHeat", op: "gte", value: 8 }], timeWindow: { months: [5] }, npcRefs: ["NPC_PRS_01", "NPC_PRS_02", "NPC_CCH_01", "NPC_PLR_10"], seedsWrite: ["SEED_COACH_PUBLIC"], tags: ["coach", "press", "uncertainty"],
        choices: [
            { id: "DEFEND", label: "Defenderlo de forma clara", intentTags: ["loyalty", "public"], primaryMessage: "Montalbán continúa y recuerda que lo defendiste cuando estaba débil.", secondaryMessage: "El técnico sale y tu frase acompaña la llegada del siguiente entrenador.", primaryEffects: [n("rel.NPC_CCH_01.trust", 9)], secondaryEffects: [n("reputation.mediaHeat", 4)], primarySeedTransitions: [seedCreate("SEED_COACH_PUBLIC", 55, { stance: "defended" })], secondarySeedTransitions: [seedCreate("SEED_COACH_PUBLIC", 62, { stance: "defended_then_left" })] },
            { id: "CLUB_DECIDES", label: "Decir que las decisiones corresponden al club", intentTags: ["neutral", "public"], primaryMessage: "La distancia se percibe como prudencia institucional.", secondaryMessage: "La respuesta se interpreta como falta de apoyo al técnico.", primaryEffects: [n("control.career", 2)], secondaryEffects: [n("rel.NPC_CCH_01.trust", -3)], primarySeedTransitions: [seedCreate("SEED_COACH_PUBLIC", 32, { stance: "neutral" })], secondarySeedTransitions: [seedCreate("SEED_COACH_PUBLIC", 36, { stance: "distance" })] },
            { id: "NEED_DIFFERENT_ROLE", label: "Decir que personalmente necesitas un rol distinto", intentTags: ["self", "public"], primaryMessage: "La frase empuja al club a definir mejor tu encaje.", secondaryMessage: "El comentario parece aprovechar la debilidad del técnico para negociar públicamente.", primaryEffects: [n("control.career", 5)], secondaryEffects: [n("reputation.mediaHeat", 6), n("rel.NPC_CCH_01.trust", -6)], primarySeedTransitions: [seedCreate("SEED_COACH_PUBLIC", 48, { stance: "role_claim" })], secondarySeedTransitions: [seedCreate("SEED_COACH_PUBLIC", 55, { stance: "opportunist_read" })] },
            { id: "SILENCE", label: "No contestar y marcharte", intentTags: ["silence", "control"], primaryMessage: "Clara no fuerza una cita y el silencio queda como silencio.", secondaryMessage: "Otros interpretan tu gesto y el silencio adquiere un significado que no elegiste.", primaryEffects: [], secondaryEffects: [n("reputation.mediaHeat", 3)], primarySeedTransitions: [seedCreate("SEED_COACH_PUBLIC", 25, { stance: "silence" })], secondarySeedTransitions: [seedCreate("SEED_COACH_PUBLIC", 30, { stance: "silence_interpreted" })] }
        ]
    }),
    E({
        id: "EVT_18_SUM_001", ageWindow: [18, 18], family: "contract", title: "Tu primera firma de verdad",
        body: "La temporada termina. Ferrer ofrece una renovación. Puede haber salida, cesión o nada; salario, duración y cláusula compiten con minutos y libertad.",
        visible: ["Salario, duración, cláusula y ofertas formales son hechos."], uncertain: ["Las promesas de minutos y planes de plantilla siguen siendo palabras."],
        timeWindow: { months: [6] }, npcRefs: ["NPC_DIR_02", "NPC_CCH_01", "NPC_AGT_01", "NPC_AGT_02"], seedsRead: ["SEED_EXIT_STYLE_UDV"], seedsWrite: ["SEED_EXIT_STYLE_UDV", "SEED_CONTRACT_HARDLINE"], tags: ["contract", "market", "control"],
        choices: [
            { id: "STABILITY", label: "Firmar estabilidad aunque la cláusula de salida quede alta", intentTags: ["security", "club"], primaryMessage: "La estabilidad protege tu situación y el club invierte en ti.", secondaryMessage: "La seguridad contractual reduce tu libertad justo cuando el mercado empieza a crecer.", primaryEffects: [set("contract.monthsRemaining", 36), n("sport.roleScore", 4)], secondaryEffects: [set("contract.monthsRemaining", 36), n("control.career", -7)], primarySeedTransitions: [seedCreate("SEED_EXIT_STYLE_UDV", 42, { summer: "renew_stable" })], secondarySeedTransitions: [seedCreate("SEED_EXIT_STYLE_UDV", 48, { summer: "renew_locked" })] },
            { id: "FLEXIBILITY", label: "Pedir menos duración o una cláusula asumible aunque mejores menos salario", intentTags: ["control", "negotiation"], primaryMessage: "El club acepta una estructura que preserva parte de tu movilidad.", secondaryMessage: "Ferrer endurece la negociación y la renovación se enfría.", primaryEffects: [set("contract.monthsRemaining", 24), n("control.career", 7)], secondaryEffects: [n("rel.NPC_DIR_02.trust", -5), n("reputation.marketHeat", 3)], primarySeedTransitions: [seedCreate("SEED_CONTRACT_HARDLINE", 45, { style: "flexibility" }), seedCreate("SEED_EXIT_STYLE_UDV", 40, { summer: "renew_flexible" })], secondarySeedTransitions: [seedCreate("SEED_CONTRACT_HARDLINE", 58, { style: "hard_standoff" })] },
            { id: "WAIT", label: "Rechazar por ahora y entrar en verano con más riesgo contractual", intentTags: ["risk", "market"], primaryMessage: "El mercado mejora y aparecen alternativas más fuertes.", secondaryMessage: "Una mala pretemporada reduce la palanca que esperabas ganar.", primaryEffects: [n("reputation.marketHeat", 8), n("control.career", 5)], secondaryEffects: [n("reputation.marketHeat", -7), n("control.career", -5)], primarySeedTransitions: [seedCreate("SEED_EXIT_STYLE_UDV", 50, { summer: "wait_market" })], secondarySeedTransitions: [seedCreate("SEED_EXIT_STYLE_UDV", 55, { summer: "wait_lost" })] },
            { id: "REQUEST_EXIT", label: "Si hay oferta real, pedir al club que negocie salida", intentTags: ["exit", "direct"], primaryMessage: "La necesidad de caja hace que UDV acepte negociar sin guerra pública.", secondaryMessage: "El club rechaza el momento y la petición tensiona una relación que aún necesitas.", primaryEffects: [n("control.career", 8), n("reputation.marketHeat", 6)], secondaryEffects: [n("rel.NPC_DIR_02.trust", -9), n("reputation.mediaHeat", 4)], primarySeedTransitions: [seedCreate("SEED_EXIT_STYLE_UDV", 65, { summer: "requested_exit" })], secondarySeedTransitions: [seedCreate("SEED_EXIT_STYLE_UDV", 70, { summer: "exit_conflict" })] }
        ]
    }),
    E({
        id: "EVT_19_SUM_001", ageWindow: [19, 19], family: "life", title: "El verano que sí cuenta",
        body: "Con 19 años ya no eres anónimo. Rivas propone trabajo específico, Dani un viaje y tu agente —si existe— una aparición de marca.",
        visible: ["Conoces las fechas de pretemporada y tus compromisos."], uncertain: ["No sabes qué parte del trabajo individual o comercial tendrá retorno real."],
        timeWindow: { months: [6, 7] }, npcRefs: ["NPC_ACA_01", "NPC_SOC_01", "NPC_AGT_01", "NPC_AGT_02"], seedsRead: ["SEED_DANI_NORMALITY", "SEED_RIVAS_TRUST"], seedsWrite: ["SEED_DANI_NORMALITY"], tags: ["summer", "body", "image"],
        choices: [
            { id: "REST_TRIP", label: "Priorizar descanso y viaje, siguiendo solo el plan mínimo", intentTags: ["rest", "social"], primaryMessage: "El descanso mejora recuperación y llegas fresco a la pretemporada.", secondaryMessage: "Llegas por debajo del ritmo esperado y el descanso se reinterpreta como falta de preparación.", primaryEffects: [n("body.risk", -8), n("rel.NPC_SOC_01.affinity", 5)], secondaryEffects: [n("sport.roleScore", -5)], primarySeedTransitions: [seedCreate("SEED_DANI_NORMALITY", 38, { summer19: "trip" })], secondarySeedTransitions: [seedCreate("SEED_DANI_NORMALITY", 34, { summer19: "trip_cost" })] },
            { id: "INTENSIVE", label: "Hacer un bloque físico/técnico intensivo", intentTags: ["training", "ambition"], primaryMessage: "El trabajo adelanta tu forma y amplía opciones deportivas.", secondaryMessage: "La carga acumulada sube antes de que empiece una temporada larga.", primaryEffects: [n("sport.roleScore", 8), n("body.fitness", 6)], secondaryEffects: [n("body.risk", 9), n("body.fatigue", 7)] },
            { id: "BALANCED_BRAND", label: "Combinar descanso, aparición comercial y entrenamiento moderado", intentTags: ["balance", "image"], primaryMessage: "La combinación funciona: ganas exposición sin llegar peor físicamente.", secondaryMessage: "La aparición comercial consume tiempo y no produce retorno claro.", primaryEffects: [n("reputation.mediaHeat", 5), n("finances.cash", 2500, 0, 100000000)], secondaryEffects: [n("body.fatigue", 3)] }
        ]
    })
];
const debutEvent = EVENTS_18_20.find(e => e.id === "EVT_18_MATCH_001");
if (debutEvent)
    debutEvent.presentation = {
        layoutHint: "cinematic", preloadPriority: "high",
        assets: [
            { id: "cutscene_evt_18_match_001_debut", type: "video", role: "cutscene", optional: true, fallbackId: "hero_evt_18_match_001" },
            { id: "hero_evt_18_match_001", type: "image", role: "hero", fallbackId: "generic_sport" }
        ]
    };
const contractEvent = EVENTS_18_20.find(e => e.id === "EVT_18_SUM_001");
if (contractEvent)
    contractEvent.presentation = {
        layoutHint: "cinematic", preloadPriority: "high",
        assets: [
            { id: "cutscene_evt_18_sum_001_contract", type: "video", role: "cutscene", optional: true, fallbackId: "hero_evt_18_sum_001" },
            { id: "hero_evt_18_sum_001", type: "image", role: "hero", fallbackId: "generic_contract" }
        ]
    };


// ═══ content/events/18_20/principal-additions.js ═══
const verified = { canonStatus: "verified" };
var PRINCIPAL_ADDITIONS_18_20 = [
    E({
        ...verified, id: "EVT_18_LOCK_001", ageWindow: [18, 18], family: "team", title: "La cena de los mayores",
        body: "En la primera cena de pretemporada, Leo te avisa de una costumbre: los nuevos pagan una parte desproporcionada. No es una norma y nadie aclara cuánto importa el ritual.",
        visible: ["El coste es asumible pero relevante para un canterano.", "No existe una norma formal del club."],
        uncertain: ["No sabes si Vela espera que sigas el ritual ni cómo leerán los veteranos cualquier límite."],
        gates: [{ path: "flags.PRESEASON_STARTED", op: "eq", value: true }], timeWindow: { months: [7, 8] },
        npcRefs: ["NPC_PLR_10", "NPC_PLR_11", "NPC_PLR_12", "NPC_PLR_14"], seedsWrite: ["SEED_VELA_STANCE"], tags: ["locker", "ritual", "boundaries"], weight: 13,
        choices: [
            { id: "PAY", label: "Pagar sin discutir", intentTags: ["belonging", "quiet"], primaryMessage: "El gesto compra comodidad y nadie vuelve a mencionarlo.", secondaryMessage: "La facilidad con la que aceptas el ritual te coloca, por ahora, abajo en la jerarquía informal.", primaryEffects: [n("rel.NPC_PLR_10.affinity", 5), n("rel.NPC_PLR_11.affinity", 4)], secondaryEffects: [n("rel.NPC_PLR_10.respect", -3)] },
            { id: "JOKE", label: "Pagar tu parte normal y bromear con que el resto llegará cuando cobres como ellos", intentTags: ["humor", "boundary"], primaryMessage: "La broma funciona y marcas un límite sin romper el ambiente.", secondaryMessage: "El comentario suena más desafiante de lo que pretendías.", primaryEffects: [n("rel.NPC_PLR_10.respect", 5), n("rel.NPC_PLR_11.affinity", 3)], secondaryEffects: [n("rel.NPC_PLR_10.affinity", -4)], primarySeedTransitions: [seedCreate("SEED_VELA_STANCE", 22, { dinner: "joke_worked" })], secondarySeedTransitions: [seedCreate("SEED_VELA_STANCE", 28, { dinner: "joke_bad" })] },
            { id: "ASK_VELA", label: "Preguntar en privado a Vela si de verdad espera que lo hagas", intentTags: ["direct", "hierarchy"], primaryMessage: "Vela aprecia que se lo preguntes a él y no conviertas el ritual en un debate público.", secondaryMessage: "Vela cree que has hecho demasiado grande una costumbre que para él era trivial.", primaryEffects: [n("rel.NPC_PLR_10.trust", 5)], secondaryEffects: [n("rel.NPC_PLR_10.affinity", -3)], primarySeedTransitions: [seedCreate("SEED_VELA_STANCE", 26, { dinner: "direct" })] },
            { id: "SKIP", label: "No ir a la cena alegando un compromiso familiar", intentTags: ["avoid", "family"], primaryMessage: "La ausencia no tiene coste: el vestuario sigue con su vida.", secondaryMessage: "Evitas el conflicto, pero pierdes una pequeña oportunidad de pertenecer al grupo.", primaryEffects: [], secondaryEffects: [n("rel.NPC_PLR_11.affinity", -3), n("rel.NPC_PLR_12.affinity", -2)] }
        ]
    }),
    E({
        ...verified, id: "EVT_18_OPP_001", ageWindow: [18, 18], family: "sport", title: "La primera ventana",
        body: "Bruno termina una sesión tocándose el isquio. Montalbán te pregunta si estás para veinte minutos mañana. Tienes las piernas cargadas, pero no existe lesión diagnosticada.",
        visible: ["La convocatoria todavía no está confirmada.", "No tienes dolor concreto."],
        uncertain: ["Paula cree que la carga es alta y Montalbán no promete que vayas a jugar."],
        gates: [{ path: "flags.FIRST_TEAM_ATTENTION", op: "eq", value: true }, { path: "flags.OFFICIAL_DEBUT", op: "eq", value: false }], timeWindow: { months: [8, 9, 10, 11, 12] },
        npcRefs: ["NPC_CCH_01", "NPC_CCH_02", "NPC_MED_01", "NPC_PLR_12"], seedsWrite: ["SEED_BODY_PRECEDENT", "SEED_MENA_EARLY_READ"], tags: ["debut", "body", "opportunity"], weight: 16,
        choices: [
            { id: "HUNDRED", label: "Decir que estás al cien por cien", intentTags: ["ambition", "conceal"], primaryMessage: "La respuesta abre la convocatoria y tu cuerpo tolera la carga.", secondaryMessage: "La oportunidad sigue viva, pero el precedente de ocultar carga complica cómo se interpretan tus molestias futuras.", primaryEffects: [n("sport.roleScore", 7), flag("WIN_DEBUT", true)], secondaryEffects: [n("body.risk", 8), flag("WIN_DEBUT", true)], primarySeedTransitions: [seedCreate("SEED_BODY_PRECEDENT", 38, { early: "said_100" })], secondarySeedTransitions: [seedCreate("SEED_BODY_PRECEDENT", 50, { early: "concealed_load" })] },
            { id: "AVAILABLE_LOADED", label: "Decir que estás disponible, pero contar que vienes cargado", intentTags: ["transparent", "professional"], primaryMessage: "Montalbán valora que le des información útil y mantiene abierta la convocatoria.", secondaryMessage: "El técnico prefiere a otro jugador más fresco para una oportunidad que quizá no vuelva pronto.", primaryEffects: [n("rel.NPC_CCH_01.trust", 6), flag("WIN_DEBUT", true)], secondaryEffects: [n("sport.roleScore", -3), n("body.risk", -4)], primarySeedTransitions: [seedCreate("SEED_BODY_PRECEDENT", 28, { early: "transparent" })] },
            { id: "ASK_ROLE", label: "Preguntar primero qué papel imagina para ti antes de contestar sobre sensaciones", intentTags: ["information", "negotiation"], primaryMessage: "La pregunta se interpreta como lectura madura de la oportunidad y Mena te explica el plan.", secondaryMessage: "Montalbán cree que estás negociando antes de ganarte el sitio.", primaryEffects: [n("rel.NPC_CCH_02.trust", 7), n("control.career", 3), flag("WIN_DEBUT", true)], secondaryEffects: [n("rel.NPC_CCH_01.trust", -5)], primarySeedTransitions: [seedCreate("SEED_MENA_EARLY_READ", 34, { early: "asked_role" })] }
        ]
    }),
    E({
        ...verified, id: "EVT_18_MKT_001", ageWindow: [18, 18], family: "market", title: "La oferta que no existe",
        body: "Te llega que un club de Segunda preguntaría seriamente por ti si UDV abre la puerta. No existe documento, cifra ni llamada oficial.",
        visible: ["Existe una pista informal plausible, no una oferta formal."],
        uncertain: ["La fuente puede estar inflando el interés y el comprador puede desaparecer antes de que UDV reaccione."],
        gates: [{ path: "reputation.marketHeat", op: "gte", value: 10 }], timeWindow: { months: [11, 12] },
        npcRefs: ["NPC_AGT_01", "NPC_AGT_02", "NPC_ACA_01", "NPC_PRS_01", "NPC_DIR_02"], seedsRead: ["SEED_FIRST_AGENT"], seedsWrite: ["SEED_FIRST_LEAK", "SEED_FIRST_AGENT", "SEED_EXIT_STYLE_UDV"], tags: ["market", "rumor", "leverage"], weight: 14,
        choices: [
            { id: "MOVE_NAME", label: "Autorizar a la fuente a mover tu nombre discretamente", intentTags: ["market", "discreet"], primaryMessage: "El tanteo convierte el interés en una conversación real.", secondaryMessage: "El posible comprador interpreta que el entorno está subastando un jugador todavía verde y enfría el interés.", primaryEffects: [n("reputation.marketHeat", 10), n("control.career", 3), flag("FORMAL_INTEREST", true)], secondaryEffects: [n("reputation.marketHeat", -4)], primarySeedTransitions: [seedCreate("SEED_FIRST_AGENT", 40, { market18: "authorized" })] },
            { id: "SOFT_LEVERAGE", label: "Usar el interés para preguntar a Ferrer por renovación y minutos sin nombrar al club", intentTags: ["leverage", "private"], primaryMessage: "La palanca suave consigue información y mejora tu posición negociadora.", secondaryMessage: "Ferrer detecta la maniobra, pero sin una oferta real no cambia su postura.", primaryEffects: [n("control.career", 7), n("rel.NPC_DIR_02.respect", 4)], secondaryEffects: [n("rel.NPC_DIR_02.trust", -3)] },
            { id: "WAIT_WRITTEN", label: "No hablar hasta que exista una oferta por escrito", intentTags: ["patience", "certainty"], primaryMessage: "Esperar protege tu credibilidad y el interés sobrevive hasta formalizarse.", secondaryMessage: "El club interesado cubre la vacante antes de dar el paso formal.", primaryEffects: [n("rel.NPC_DIR_02.trust", 3), flag("FORMAL_INTEREST", true)], secondaryEffects: [n("reputation.marketHeat", -5)] },
            { id: "LEAK", label: "Filtrar que un club de Segunda sigue al canterano para medir la reacción", intentTags: ["leak", "pressure"], primaryMessage: "La filtración genera competencia y aumenta tu palanca.", secondaryMessage: "UDV sospecha de tu entorno y el comprador no quiere aparecer en una operación pública tan pronto.", primaryEffects: [n("reputation.marketHeat", 12), n("reputation.mediaHeat", 8)], secondaryEffects: [n("rel.NPC_DIR_02.trust", -9), n("reputation.mediaHeat", 10)], primarySeedTransitions: [seedCreate("SEED_FIRST_LEAK", 58, { first: "useful" })], secondarySeedTransitions: [seedCreate("SEED_FIRST_LEAK", 72, { first: "costly" }), seedCreate("SEED_EXIT_STYLE_UDV", 42, { market18: "leak" })] }
        ]
    }),
    E({
        ...verified, id: "EVT_19_MKT_001", ageWindow: [19, 19], family: "market", title: "La cláusula y el salto",
        body: "Un club superior pregunta condiciones. No garantiza titularidad y UDV aún controla precio y tiempos.",
        visible: ["El interés está confirmado, pero todavía puede no existir oferta final."], uncertain: ["El rol real oscila entre primer equipo, rotación y proyecto; las fuentes no coinciden."],
        gates: [{ path: "reputation.marketHeat", op: "gte", value: 20 }], timeWindow: { months: [7, 8] }, npcRefs: ["NPC_DIR_02", "NPC_AGT_01", "NPC_AGT_02"], seedsWrite: ["SEED_EXIT_STYLE_UDV", "SEED_FIRST_LEAK", "SEED_CONTRACT_HARDLINE"], tags: ["market", "jump", "control"], weight: 16,
        choices: [
            { id: "PRIVATE_FACILITATE", label: "Pedir a UDV que facilite la negociación en privado", intentTags: ["private", "exit"], primaryMessage: "La discreción mantiene a todas las partes dentro y el salto se vuelve negociable.", secondaryMessage: "UDV utiliza el silencio para endurecer precio y la ventana se estrecha.", primaryEffects: [n("control.career", 7), flag("HIGHER_CLUB_ROUTE", true)], secondaryEffects: [n("reputation.marketHeat", -3)], primarySeedTransitions: [seedCreate("SEED_EXIT_STYLE_UDV", 48, { year19: "private" })] },
            { id: "PUBLIC_LISTEN", label: "Decir que estás feliz, pero escucharías un proyecto superior", intentTags: ["public", "market"], primaryMessage: "La frase abre mercado sin romper del todo con UDV.", secondaryMessage: "La exposición convierte una consulta en ruido y endurece a la dirección.", primaryEffects: [n("reputation.mediaHeat", 8), n("reputation.marketHeat", 8), flag("HIGHER_CLUB_ROUTE", true)], secondaryEffects: [n("rel.NPC_DIR_02.trust", -7), n("reputation.mediaHeat", 10)], primarySeedTransitions: [seedCreate("SEED_FIRST_LEAK", 48, { year19: "public_listen" })] },
            { id: "GUARANTEE", label: "No moverte sin una garantía contractual/deportiva fuerte", intentTags: ["guarantee", "control"], primaryMessage: "Un destino acepta proteger parte de tu rol y reduce incertidumbre.", secondaryMessage: "La exigencia elimina compradores que sí ofrecían un salto plausible, aunque sin garantías.", primaryEffects: [n("control.career", 9), flag("HIGHER_CLUB_ROUTE", true)], secondaryEffects: [n("reputation.marketHeat", -6)] },
            { id: "CREATE_BIDDING", label: "Autorizar al agente a crear competencia con otros clubes", intentTags: ["agent", "bidding"], primaryMessage: "La competencia mejora condiciones y aparecen dos rutas reales.", secondaryMessage: "Un club de desarrollo se retira al percibir una subasta que no quiere pagar.", primaryEffects: [n("reputation.marketHeat", 13), n("control.career", 5), flag("BIG_CLUB_INTEREST", true)], secondaryEffects: [n("reputation.marketHeat", -5)], primarySeedTransitions: [seedCreate("SEED_FIRST_LEAK", 42, { year19: "bidding" })] }
        ]
    }),
    E({
        ...verified, id: "EVT_19_RIV_001", ageWindow: [19, 19], family: "team", title: "Adrián entra en la foto",
        body: "Adrián Costa hace una pretemporada excelente y Rivas empieza a llamarlo otra joya de Cerro Alto. La comparación ya existe aunque ninguno la haya pedido.",
        visible: ["Adrián está rindiendo bien y recibe atención."], uncertain: ["No sabes si el club, la agencia o la prensa acabará tratándoos como competencia directa."],
        timeWindow: { months: [7, 8, 9] }, npcRefs: ["NPC_PLR_15", "NPC_ACA_01", "NPC_AGT_02"], seedsWrite: ["SEED_ADRIAN_MIRROR"], tags: ["rival", "academy", "comparison"], weight: 13,
        choices: [
            { id: "TRAIN_TOGETHER", label: "Felicitarle y proponer entrenar juntos", intentTags: ["cooperate", "rival"], primaryMessage: "La cooperación eleva el nivel de ambos sin borrar la competencia.", secondaryMessage: "Adrián agradece el gesto, pero sospecha que quieres vigilar de cerca su progreso.", primaryEffects: [n("rel.NPC_PLR_15.affinity", 7), n("sport.roleScore", 3)], secondaryEffects: [n("rel.NPC_PLR_15.trust", -2)], primarySeedTransitions: [seedCreate("SEED_ADRIAN_MIRROR", 38, { start: "cooperative" })], secondarySeedTransitions: [seedCreate("SEED_ADRIAN_MIRROR", 43, { start: "guarded" })] },
            { id: "CORDIAL_FOCUS", label: "Ser cordial y centrarte en tu trabajo", intentTags: ["distance", "focus"], primaryMessage: "La distancia evita fabricar una rivalidad que todavía no existe.", secondaryMessage: "El silencio deja que otros definan la comparación por vosotros.", primaryEffects: [n("sport.roleScore", 2)], secondaryEffects: [n("reputation.mediaHeat", 3)], primarySeedTransitions: [seedCreate("SEED_ADRIAN_MIRROR", 30, { start: "parallel" })] },
            { id: "OWN_NUMBERS", label: "Dejar que tu entorno destaque públicamente tus números y experiencia", intentTags: ["image", "competitive"], primaryMessage: "La comparación te favorece a corto plazo y refuerza tu estatus.", secondaryMessage: "Adrián siente que has convertido una competencia deportiva en campaña de entorno.", primaryEffects: [n("reputation.mediaHeat", 6), n("reputation.marketHeat", 4)], secondaryEffects: [n("rel.NPC_PLR_15.resentment", 8)], primarySeedTransitions: [seedCreate("SEED_ADRIAN_MIRROR", 58, { start: "public_competition" })] },
            { id: "ASK_AGENCY", label: "Preguntar a tu agente si Prisma está priorizando a Adrián antes de reaccionar", intentTags: ["information", "agent"], primaryMessage: "Consigues contexto útil antes de convertir la sospecha en conflicto.", secondaryMessage: "La consulta vuelve a la agencia y alimenta la idea de que ya estás compitiendo por recursos.", primaryEffects: [n("control.career", 5)], secondaryEffects: [n("rel.NPC_PLR_15.trust", -3)], primarySeedTransitions: [seedCreate("SEED_ADRIAN_MIRROR", 44, { start: "agency_question" })] }
        ]
    }),
    E({
        ...verified, id: "EVT_19_CCH_001", ageWindow: [19, 19], family: "tactical", title: "El jefe del segundo año",
        body: "El entrenador del segundo año puede ser Montalbán o alguien nuevo. Dice que todos empiezan de cero, aunque la jerarquía real nunca parte de cero.",
        visible: ["Conoces al técnico actual y la plantilla."], uncertain: ["No sabes cuánto pesan realmente la temporada anterior, los fichajes ni los informes del staff."],
        timeWindow: { months: [7, 8, 9] }, npcRefs: ["NPC_CCH_01", "NPC_CCH_02", "NPC_DIR_02"], tags: ["coach", "role", "hierarchy"], weight: 13,
        choices: [
            { id: "ADAPT", label: "Adaptarte sin hablar de las semanas anteriores", intentTags: ["adapt", "quiet"], primaryMessage: "El técnico valora que compitas sin pedir créditos del pasado.", secondaryMessage: "La ausencia de conversación hace que tu mejor rol tarde en aparecer.", primaryEffects: [n("rel.NPC_CCH_01.trust", 4)], secondaryEffects: [n("sport.roleScore", -3)] },
            { id: "ROLE_TALK", label: "Pedir pronto una conversación y explicar dónde rindes mejor", intentTags: ["direct", "role"], primaryMessage: "La charla ayuda al staff a usarte mejor y mejora tu encaje.", secondaryMessage: "El técnico la lee como necesidad de estatus demasiado pronto.", primaryEffects: [n("sport.roleScore", 7), n("control.career", 3)], secondaryEffects: [n("rel.NPC_CCH_01.trust", -5)] },
            { id: "AGENT_CLARITY", label: "Pedir al agente que aclare tu jerarquía con el club antes del cierre de mercado", intentTags: ["agent", "leverage"], primaryMessage: "El club responde y obtienes información antes de que cierre el mercado.", secondaryMessage: "La intervención externa irrita al cuerpo técnico y convierte el rol en negociación institucional.", primaryEffects: [n("control.career", 6)], secondaryEffects: [n("rel.NPC_CCH_01.trust", -7), n("rel.NPC_DIR_02.trust", -3)] }
        ]
    }),
    E({
        ...verified, id: "EVT_19_MEDIA_001", ageWindow: [19, 19], family: "press", title: "¿Quién es mejor?",
        body: "Raúl publica una encuesta comparándote con Adrián y Clara te pregunta por ella. La comparación ya circula aunque decidas no participar.",
        visible: ["La encuesta y sus respuestas son públicas."], uncertain: ["No sabes si la comparación durará días o definirá la narrativa de la temporada."],
        gates: [{ path: "reputation.mediaHeat", op: "gte", value: 8 }], timeWindow: { months: [8, 9, 10, 11] }, npcRefs: ["NPC_PLR_15", "NPC_PRS_01", "NPC_PRS_02"], seedsRead: ["SEED_ADRIAN_MIRROR"], seedsWrite: ["SEED_ADRIAN_MIRROR"], tags: ["media", "rival", "public"], weight: 11,
        choices: [
            { id: "PRAISE", label: "Quitar importancia y elogiar a Adrián", intentTags: ["deescalate", "public"], primaryMessage: "La respuesta enfría el marco de rivalidad y Adrián lo aprecia.", secondaryMessage: "El titular se recorta como si evitaras compararte porque no te sientes superior.", primaryEffects: [n("rel.NPC_PLR_15.affinity", 5)], secondaryEffects: [n("reputation.mediaHeat", 3)] },
            { id: "PROVE_BETTER", label: "Decir que la competencia te motiva y quieres demostrar que eres mejor", intentTags: ["competitive", "public"], primaryMessage: "La ambición encaja con tu rendimiento y eleva interés.", secondaryMessage: "La frase convierte cualquier mala semana en material para la comparación.", primaryEffects: [n("reputation.marketHeat", 6), n("reputation.mediaHeat", 5)], secondaryEffects: [n("reputation.mediaHeat", 9), n("rel.NPC_PLR_15.resentment", 5)] },
            { id: "JOKE_TOGETHER", label: "Bromear públicamente con Adrián si hay confianza suficiente", intentTags: ["humor", "rival"], primaryMessage: "La broma compartida le quita gravedad a la comparación.", secondaryMessage: "La ironía no se entiende igual fuera del vestuario y la rivalidad se amplifica.", primaryEffects: [n("rel.NPC_PLR_15.trust", 5)], secondaryEffects: [n("reputation.mediaHeat", 6)] },
            { id: "NO_FEED", label: "No entrar y pedir a tu entorno que tampoco alimente la comparación", intentTags: ["silence", "control"], primaryMessage: "Sin combustible nuevo, la encuesta pierde fuerza.", secondaryMessage: "Otros llenan el vacío y la comparación sigue sin tu versión.", primaryEffects: [n("reputation.mediaHeat", -3)], secondaryEffects: [n("control.career", -1)] }
        ]
    }),
    E({
        ...verified, id: "EVT_19_BODY_001", ageWindow: [19, 19], family: "medical", title: "Volver antes",
        body: "Una lesión muscular te deja fuera varias semanas. Cinco días antes de la fecha prevista casi te encuentras normal, mientras otro jugador aprovecha tus minutos.",
        visible: ["Conoces diagnóstico, evolución y fecha médica prevista."], uncertain: ["No sabes si adelantar cinco días será irrelevante o suficiente para provocar una recaída."],
        gates: [{ path: "flags.RECOVERING_INJURY", op: "eq", value: true }], npcRefs: ["NPC_MED_01", "NPC_CCH_01"], seedsRead: ["SEED_BODY_PRECEDENT"], seedsWrite: ["SEED_BODY_PRECEDENT", "SEED_PHYSIO_CONFIDENCE"], tags: ["injury", "return", "role"], weight: 15,
        choices: [
            { id: "FULL_DATE", label: "Respetar la fecha completa", intentTags: ["medical", "patience"], primaryMessage: "La recuperación termina limpia y vuelves con margen físico.", secondaryMessage: "El sustituto consolida parte de tu sitio mientras tú sigues fuera.", primaryEffects: [n("body.risk", -10), flag("RECOVERING_INJURY", false)], secondaryEffects: [n("sport.roleScore", -6), flag("RECOVERING_INJURY", false)], primarySeedTransitions: [seedCreate("SEED_PHYSIO_CONFIDENCE", 45, { return19: "full_date" })] },
            { id: "EXTRA_TESTS", label: "Pedir alta anticipada si superas pruebas adicionales", intentTags: ["information", "risk"], primaryMessage: "Las pruebas aportan información útil y permiten adelantar sin empeorar.", secondaryMessage: "Las pruebas son aceptables pero no perfectas; el regreso temprano deja más riesgo residual.", primaryEffects: [n("body.risk", -5), n("sport.roleScore", 4), flag("RECOVERING_INJURY", false)], secondaryEffects: [n("body.risk", 7), flag("RECOVERING_INJURY", false)], primarySeedTransitions: [seedCreate("SEED_PHYSIO_CONFIDENCE", 40, { return19: "tests" })] },
            { id: "TELL_READY", label: "Decir al entrenador que estás listo aunque Paula prefiera esperar", intentTags: ["ambition", "staff_conflict"], primaryMessage: "El cuerpo aguanta y recuperas una ventana competitiva antes de lo previsto.", secondaryMessage: "La precipitación aumenta la deuda física y tensiona la confianza con Paula.", primaryEffects: [n("sport.roleScore", 8), flag("RECOVERING_INJURY", false)], secondaryEffects: [n("body.risk", 15), n("rel.NPC_MED_01.trust", -8), flag("RECOVERING_INJURY", false)], secondarySeedTransitions: [seedCreate("SEED_BODY_PRECEDENT", 68, { return19: "pushed" })] }
        ]
    }),
    E({
        ...verified, id: "EVT_19_AGENT_001", ageWindow: [19, 19], family: "agent", title: "El correo que faltaba",
        body: "Una fuente independiente demuestra que un club preguntó por ti semanas atrás y tu representante no te lo contó. Su explicación puede ser razonable o interesada.",
        visible: ["La consulta existió."], uncertain: ["No sabes si era realmente seria ni si tu agente la descartó por criterio deportivo, comercial o por descuido."],
        gates: [{ path: "flags.AGENT_ACTIVE", op: "eq", value: true }], npcRefs: ["NPC_AGT_01", "NPC_AGT_02", "NPC_PRS_01"], seedsRead: ["SEED_FIRST_AGENT"], seedsWrite: ["SEED_AGENT_OMISSION", "SEED_FIRST_AGENT"], tags: ["agent", "information", "control"], weight: 13,
        choices: [
            { id: "REQUIRE_ALL", label: "Aceptar la explicación, pero exigir que desde ahora te lleguen todas las consultas serias", intentTags: ["boundary", "agent"], primaryMessage: "La regla mejora el flujo de información sin romper una relación útil.", secondaryMessage: "El agente acepta, pero la definición de 'seria' sigue dejándole margen para filtrar.", primaryEffects: [n("control.career", 6), n("rel.NPC_AGT_01.trust", 2)], secondaryEffects: [n("control.career", 2)], primarySeedTransitions: [seedCreate("SEED_AGENT_OMISSION", 45, { reaction: "boundary" })] },
            { id: "AUDIT", label: "Pedir documentos y mensajes para auditar qué ocurrió", intentTags: ["audit", "control"], primaryMessage: "Los documentos aclaran el episodio y descubres que el descarte tenía argumentos reales.", secondaryMessage: "La revisión descubre más lagunas y el problema deja de parecer aislado.", primaryEffects: [n("control.career", 8)], secondaryEffects: [n("rel.NPC_AGT_01.trust", -7), flag("AGENT_SECOND_DISCREPANCY", true)], primarySeedTransitions: [seedCreate("SEED_AGENT_OMISSION", 55, { reaction: "audit_clean" })], secondarySeedTransitions: [seedCreate("SEED_AGENT_OMISSION", 78, { reaction: "audit_more" })] },
            { id: "SOUND_OTHER", label: "Hablar discretamente con otro agente sin romper todavía", intentTags: ["parallel", "agent"], primaryMessage: "El contraste mejora tu información y crea una alternativa real.", secondaryMessage: "La conversación se filtra y tu representante empieza a proteger su posición.", primaryEffects: [n("control.career", 8)], secondaryEffects: [n("rel.NPC_AGT_01.trust", -8), n("reputation.mediaHeat", 3)], primarySeedTransitions: [seedCreate("SEED_AGENT_OMISSION", 62, { reaction: "parallel" })] },
            { id: "BREAK", label: "Romper la relación si el contrato lo permite", intentTags: ["break", "control"], primaryMessage: "La ruptura recupera control y deja espacio para una representación distinta.", secondaryMessage: "Pierdes una red útil justo cuando el mercado empieza a moverse.", primaryEffects: [n("control.career", 12), flag("AGENT_ACTIVE", false)], secondaryEffects: [n("reputation.marketHeat", -6), flag("AGENT_ACTIVE", false)], primarySeedTransitions: [seedCreate("SEED_AGENT_OMISSION", 85, { reaction: "break" })] }
        ]
    }),
    E({
        ...verified, id: "EVT_19_JAN_001", ageWindow: [19, 19], family: "market", title: "El segundo enero",
        body: "El segundo mercado de invierno llega con más información y más coste de oportunidad: continuidad, préstamo, salto sin minutos garantizados o salida forzada pueden ser reales a la vez.",
        visible: ["Ves ofertas formales, contrato y rol actual."], uncertain: ["No conoces qué huecos seguirán abiertos al cierre del mercado."],
        timeWindow: { months: [1] }, npcRefs: ["NPC_DIR_02", "NPC_AGT_01", "NPC_AGT_02"], seedsRead: ["SEED_EXIT_STYLE_UDV", "SEED_AGENT_OMISSION"], seedsWrite: ["SEED_EXIT_STYLE_UDV"], tags: ["market", "route", "january"], weight: 18,
        choices: [
            { id: "CONTINUITY", label: "Continuidad para terminar la temporada", intentTags: ["stability", "club"], primaryMessage: "La estabilidad coincide con una mejora de rol y quedarte tiene valor deportivo.", secondaryMessage: "El mercado cierra y la jerarquía permanece casi igual.", primaryEffects: [n("sport.roleScore", 8)], secondaryEffects: [n("control.career", -4)] },
            { id: "CLEAR_ROLE_LOWER", label: "Ir a un proyecto de menor prestigio con función clara", intentTags: ["minutes", "ladder"], primaryMessage: "El nuevo contexto te da continuidad y responsabilidad real.", secondaryMessage: "Juegas más, pero el cambio reduce exposición y el proyecto no es tan estable como prometía.", primaryEffects: [set("club", "DEVELOPMENT_CLUB"), set("tier", 3), set("role", "loan_starter"), flag("LOAN_ACTIVE", true), n("sport.roleScore", 18)], secondaryEffects: [set("club", "DEVELOPMENT_CLUB"), set("tier", 4), flag("LOAN_ACTIVE", true), n("reputation.prestige", -4), n("sport.roleScore", 10)] },
            { id: "LEVEL_JUMP", label: "Saltar de nivel sin minutos garantizados", intentTags: ["jump", "risk"], primaryMessage: "El salto abre una oportunidad real y encuentras minutos antes de lo esperado.", secondaryMessage: "El nivel de entrenamiento sube, pero quedas atrapado en una rotación profunda.", primaryEffects: [set("club", "HIGHER_CLUB"), set("world.ownerClub", "HIGHER_CLUB"), set("tier", 2), set("role", "rotation"), n("sport.roleScore", 12), n("reputation.prestige", 10), flag("BIG_CLUB", true)], secondaryEffects: [set("club", "HIGHER_CLUB"), set("world.ownerClub", "HIGHER_CLUB"), set("tier", 2), set("role", "reserve"), n("sport.roleScore", -8), n("reputation.prestige", 10), flag("BIG_CLUB", true)] },
            { id: "FORCE_EXIT", label: "Forzar la salida si estás bloqueado y hay destino real", intentTags: ["force", "conflict"], primaryMessage: "La presión desbloquea la operación y el destino te da un rol útil.", secondaryMessage: "Sales, pero el conflicto deja memoria institucional y el nuevo sitio no compensa todo el coste.", primaryEffects: [set("club", "NEW_CLUB"), set("world.ownerClub", "NEW_CLUB"), set("tier", 3), n("sport.roleScore", 10), flag("CONFLICT_EXIT", true)], secondaryEffects: [set("club", "NEW_CLUB"), set("world.ownerClub", "NEW_CLUB"), set("tier", 4), n("rel.NPC_DIR_02.trust", -15), flag("CONFLICT_EXIT", true)], primarySeedTransitions: [seedCreate("SEED_EXIT_STYLE_UDV", 72, { year19: "forced_worked" })], secondarySeedTransitions: [seedCreate("SEED_EXIT_STYLE_UDV", 84, { year19: "forced_cost" })] }
        ]
    }),
    E({
        ...verified, id: "EVT_19_TEAM_001", ageWindow: [19, 19], family: "social", title: "Nano no celebra",
        body: "Tras un gran partido tuyo, Nano te felicita tarde y seco. Él vuelve a quedarse fuera. La asimetría de vuestras carreras ya pesa aunque nadie la nombre.",
        visible: ["Nano atraviesa un momento deportivo peor que el tuyo."], uncertain: ["No sabes si el tono tiene que ver contigo o simplemente con su propia frustración."],
        npcRefs: ["NPC_PLR_14"], seedsRead: ["SEED_NANO_SHADOW"], seedsWrite: ["SEED_NANO_SHADOW"], tags: ["friendship", "status", "nano"], weight: 12,
        choices: [
            { id: "ASK_DIRECT", label: "Preguntarle directamente si le pasa algo contigo", intentTags: ["direct", "friendship"], primaryMessage: "La conversación aclara una parte de la tensión y os permite hablar sin fingir.", secondaryMessage: "La pregunta obliga a Nano a verbalizar una comparación que todavía podía diluirse sola.", primaryEffects: [n("rel.NPC_PLR_14.trust", 6)], secondaryEffects: [n("rel.NPC_PLR_14.resentment", 7)], primarySeedTransitions: [seedCreate("SEED_NANO_SHADOW", 50, { year19: "talked" })] },
            { id: "NORMAL", label: "No hacer de su mal momento una conversación sobre ti y mantener el trato normal", intentTags: ["normality", "friendship"], primaryMessage: "La normalidad es exactamente lo que Nano necesitaba.", secondaryMessage: "La distancia deportiva sigue creciendo sin que ninguno encuentre cómo hablarla.", primaryEffects: [n("rel.NPC_PLR_14.affinity", 5)], secondaryEffects: [n("rel.NPC_PLR_14.resentment", 4)], primarySeedTransitions: [seedCreate("SEED_NANO_SHADOW", 42, { year19: "normal" })] },
            { id: "MOVE_CONTACT", label: "Mover discretamente un contacto para ayudarle con una cesión o prueba", intentTags: ["help", "unsolicited"], primaryMessage: "El contacto abre una oportunidad real para Nano y el favor tiene valor deportivo.", secondaryMessage: "Nano se entera y siente que has empezado a tratar su carrera como un problema que debes arreglar.", primaryEffects: [n("rel.NPC_PLR_14.trust", 7), flag("NANO_OPPORTUNITY", true)], secondaryEffects: [n("rel.NPC_PLR_14.resentment", 12), flag("UNSOLICITED_NANO_HELP", true)], primarySeedTransitions: [seedCreate("SEED_NANO_SHADOW", 58, { year19: "help_worked" })], secondarySeedTransitions: [seedCreate("SEED_NANO_SHADOW", 76, { year19: "paternalistic" })] },
            { id: "DISTANCE", label: "Tomar distancia: no puedes gestionar también su carrera", intentTags: ["distance", "self"], primaryMessage: "La distancia reduce fricción inmediata y ambos recuperáis espacio.", secondaryMessage: "Nano interpreta la retirada como confirmación de que ya vivís mundos distintos.", primaryEffects: [n("rel.NPC_PLR_14.affinity", -3)], secondaryEffects: [n("rel.NPC_PLR_14.affinity", -8), n("rel.NPC_PLR_14.resentment", 6)] }
        ]
    }),
    E({
        ...verified, id: "EVT_19_FIN_001", ageWindow: [19, 19], family: "life", title: "Cumples 20",
        body: "Dos años después del primer día con el primer equipo, el juego no pregunta si vas bien: reconstruye qué puertas existen ahora y qué quieres priorizar en el siguiente ciclo.",
        visible: ["Se muestran estadísticas, contrato, club, posición, lesiones, relaciones relevantes y ofertas existentes."], uncertain: ["Entrenadores, mercado y desarrollo futuro siguen siendo inciertos."],
        timeWindow: { months: [6], minSeasonDay: 350 }, tags: ["bridge", "state20", "priority"], weight: 95,
        choices: [
            { id: "MINUTES", label: "Priorizar minutos", intentTags: ["priority", "minutes"], primaryMessage: "Tu siguiente ciclo dará más peso a oportunidades con función deportiva clara.", secondaryMessage: "Priorizar minutos puede llevarte a contextos de menor exposición sin que eso sea un fracaso.", primaryEffects: [set("world.nextCyclePriority", "minutes")], secondaryEffects: [set("world.nextCyclePriority", "minutes")] },
            { id: "LEVEL", label: "Priorizar nivel competitivo", intentTags: ["priority", "level"], primaryMessage: "Tu siguiente ciclo buscará primero contextos de mayor exigencia.", secondaryMessage: "Aceptar mayor nivel también puede significar menos control inmediato del rol.", primaryEffects: [set("world.nextCyclePriority", "level")], secondaryEffects: [set("world.nextCyclePriority", "level")] },
            { id: "STABILITY", label: "Priorizar estabilidad contractual y económica", intentTags: ["priority", "security"], primaryMessage: "Tu siguiente ciclo valorará especialmente duración y seguridad.", secondaryMessage: "La estabilidad puede reducir movilidad futura sin convertirla en mala decisión.", primaryEffects: [set("world.nextCyclePriority", "stability")], secondaryEffects: [set("world.nextCyclePriority", "stability")] },
            { id: "RECOVERY", label: "Priorizar recuperación y desarrollo", intentTags: ["priority", "development"], primaryMessage: "Tu siguiente ciclo colocará cuerpo y desarrollo por delante de la exposición inmediata.", secondaryMessage: "El coste puede ser dejar pasar una ventana deportiva que no espere.", primaryEffects: [set("world.nextCyclePriority", "recovery")], secondaryEffects: [set("world.nextCyclePriority", "recovery")] },
            { id: "OPEN_MARKET", label: "Mantener máxima apertura al mercado", intentTags: ["priority", "open"], primaryMessage: "No cierras ninguna familia de oportunidades y aceptas más incertidumbre.", secondaryMessage: "Más opciones también significan más ruido y menos capacidad de planificar con un solo club.", primaryEffects: [set("world.nextCyclePriority", "open_market")], secondaryEffects: [set("world.nextCyclePriority", "open_market")] }
        ]
    })
];


// ═══ content/events/18_20/conditional-events.js ═══
/**
 * Baraja condicional 18–20. Los disparadores/títulos/función proceden del canon.
 * Las opciones son adaptaciones técnicas cuando la tabla canónica describe la escena
 * pero no enumera botones jugables completos.
 */
var CONDITIONAL_EVENTS_18_20 = [
    E({
        id: "CEVT_18_EARLY_01", ageWindow: [18, 18], family: "conditional", title: "Demasiado pronto",
        body: "Una cuenta nacional recorta una de tus primeras acciones y, de repente, el club recibe llamadas por un jugador que apenas ha empezado.",
        visible: ["Tu acción está circulando fuera del entorno local."], uncertain: ["No sabes cuánto interés es real ni cuánto desaparecerá en días."],
        gates: [{ path: "flags.EARLY_BREAKOUT", op: "eq", value: true }], exclusions: [{ path: "reputation.mediaHeat", op: "lt", value: 12 }],
        tags: ["early", "media", "market"], weight: 5, cooldown: 99999,
        choices: [
            { id: "FEED", label: "Alimentar la ola con alguna aparición", intentTags: ["exposure"], primaryMessage: "La exposición convierte parte del ruido en interés concreto.", secondaryMessage: "La ola crece más rápido que tus minutos y eleva expectativas antes de tiempo.", primaryEffects: [n("reputation.marketHeat", 10), n("reputation.mediaHeat", 7)], secondaryEffects: [n("reputation.mediaHeat", 13), n("narrativePressure.market", 8)] },
            { id: "SHIELD", label: "Blindarte y centrarte en entrenar", intentTags: ["focus"], primaryMessage: "El ruido pierde fuerza sin perjudicar el interés serio.", secondaryMessage: "También desaparecen llamadas que solo existían mientras estabas de moda.", primaryEffects: [n("reputation.mediaHeat", -5)], secondaryEffects: [n("reputation.marketHeat", -4), n("reputation.mediaHeat", -4)] },
            { id: "CLUB", label: "Dejar que el club gestione cualquier contacto", intentTags: ["delegate"], primaryMessage: "El club filtra el ruido y te transmite una oportunidad plausible.", secondaryMessage: "Cedes parte del relato y Ferrer utiliza la atención para reforzar su propia posición.", primaryEffects: [n("reputation.marketHeat", 5)], secondaryEffects: [n("control.career", -4)] }
        ]
    }),
    E({
        id: "CEVT_18_NODEBUT_01", ageWindow: [18, 18], family: "conditional", title: "Enero sin estreno",
        body: "Llega enero sin debut oficial. Rivas te pregunta si entrenar arriba sigue teniendo sentido si no compites de verdad.",
        visible: ["No has debutado y tu rol sigue siendo muy bajo."], uncertain: ["No sabes si una oportunidad puede abrirse justo después del mercado."],
        gates: [{ path: "flags.JAN_NO_DEBUT", op: "eq", value: true }], timeWindow: { months: [1] }, npcRefs: ["NPC_ACA_01", "NPC_CCH_01"], seedsRead: ["SEED_RIVAS_TRUST"], tags: ["no_debut", "route", "modest_route"], weight: 8,
        choices: [
            { id: "LOWER_LOAN", label: "Buscar una cesión donde competir ya", intentTags: ["minutes", "loan"], primaryMessage: "Encuentras un contexto con minutos reales y conservas margen de desarrollo.", secondaryMessage: "Bajas de foco y tardas en adaptarte, aunque al menos vuelves a competir.", primaryEffects: [set("club", "DEVELOPMENT_CLUB"), set("tier", 4), flag("LOAN_ACTIVE", true), n("sport.roleScore", 18)], secondaryEffects: [set("club", "DEVELOPMENT_CLUB"), set("tier", 4), flag("LOAN_ACTIVE", true), n("sport.roleScore", 7), n("reputation.prestige", -3)] },
            { id: "ROLE_TALK", label: "Pedir una conversación clara con Montalbán", intentTags: ["clarity"], primaryMessage: "La conversación concreta qué necesitas para acercarte al equipo.", secondaryMessage: "La respuesta confirma que no hay hueco inmediato y aumenta tu frustración.", primaryEffects: [n("rel.NPC_CCH_01.trust", 4), n("sport.roleScore", 5)], secondaryEffects: [n("rel.NPC_CCH_01.trust", -4)] },
            { id: "PATIENT", label: "Mantener la apuesta hasta final de temporada", intentTags: ["patience"], primaryMessage: "Una baja posterior abre la ventana que enero no ofrecía.", secondaryMessage: "La temporada sigue avanzando sin que la paciencia se convierta en minutos.", primaryEffects: [n("sport.roleScore", 8)], secondaryEffects: [n("control.career", -5)] }
        ]
    }),
    E({
        id: "CEVT_18_BRUNO_01", ageWindow: [18, 19], family: "conditional", title: "La taquilla vacía",
        body: "Bruno se marcha. Su taquilla vacía parece liberar tu sitio, pero el club ya estudia fichar otro extremo.",
        visible: ["Bruno ha sido vendido o cedido."], uncertain: ["No sabes si heredarás minutos o si llegará un sustituto."],
        gates: [{ path: "flags.BRUNO_EXIT", op: "eq", value: true }], npcRefs: ["NPC_PLR_12", "NPC_DIR_02"], seedsRead: ["SEED_BRUNO_FAVOR"], tags: ["bruno", "role", "market"], weight: 6,
        choices: [
            { id: "ASK_ROLE", label: "Preguntar si la salida cambia tu rol", intentTags: ["clarity"], primaryMessage: "El club admite que tendrás una primera oportunidad.", secondaryMessage: "Ferrer evita comprometerse porque ya negocia con otro jugador.", primaryEffects: [n("sport.roleScore", 10)], secondaryEffects: [n("rel.NPC_DIR_02.trust", -2)] },
            { id: "EARN", label: "No pedir nada y competir por el hueco", intentTags: ["competition"], primaryMessage: "El hueco llega al campo y aprovechas parte de él.", secondaryMessage: "Llega un sustituto antes de que la jerarquía cambie de verdad.", primaryEffects: [n("sport.roleScore", 12)], secondaryEffects: [n("sport.roleScore", -3)] },
            { id: "MARKET", label: "Usar el cambio para explorar también tu mercado", intentTags: ["market"], primaryMessage: "La incertidumbre del club te da una pequeña palanca externa.", secondaryMessage: "El mercado interpreta que sigues sin un rol consolidado.", primaryEffects: [n("reputation.marketHeat", 7), n("control.career", 5)], secondaryEffects: [n("reputation.marketHeat", -2)] }
        ]
    }),
    E({
        id: "CEVT_18_VELA_01", ageWindow: [18, 19], family: "conditional", title: "Entrenar aparte",
        body: "El conflicto entre Vela y la dirección escala. El capitán entrena parcialmente aparte y el vestuario observa quién se acerca.",
        visible: ["Vela ha sido apartado parcialmente."], uncertain: ["No conoces todos los motivos ni cuánto durará."],
        gates: [{ path: "flags.VELA_SEPARATED", op: "eq", value: true }], npcRefs: ["NPC_PLR_10", "NPC_PLR_11", "NPC_DIR_02"], seedsRead: ["SEED_VELA_STANCE"], seedsWrite: ["SEED_VELA_STANCE"], tags: ["vela", "locker", "conflict"], weight: 5,
        choices: [
            { id: "PRIVATE", label: "Hablar con Vela en privado sin hacer bandera", intentTags: ["private", "loyalty"], primaryMessage: "Vela aprecia el gesto sin exigirte que tomes partido.", secondaryMessage: "La cercanía llega a dirección y te sitúa en un conflicto que no controlas.", primaryEffects: [n("rel.NPC_PLR_10.trust", 8)], secondaryEffects: [n("rel.NPC_DIR_02.trust", -5)], primarySeedTransitions: [seedCreate("SEED_VELA_STANCE", 62, { separated: "private" })] },
            { id: "DISTANCE", label: "Mantenerte al margen", intentTags: ["distance"], primaryMessage: "El conflicto no te arrastra y nadie exige una postura pública.", secondaryMessage: "Vela guarda la distancia como una pequeña memoria de vestuario.", primaryEffects: [], secondaryEffects: [n("rel.NPC_PLR_10.affinity", -6)], secondarySeedTransitions: [seedCreate("SEED_VELA_STANCE", 58, { separated: "distance" })] },
            { id: "GROUP", label: "Preguntar a Leo cómo está leyendo el grupo la situación", intentTags: ["information"], primaryMessage: "Leo te da contexto suficiente para no actuar a ciegas.", secondaryMessage: "La consulta se interpreta como búsqueda de bando y añade ruido.", primaryEffects: [n("rel.NPC_PLR_11.trust", 6)], secondaryEffects: [n("rel.NPC_PLR_11.trust", -3)] }
        ]
    }),
    E({
        id: "CEVT_18_CCH_01", ageWindow: [18, 19], family: "conditional", title: "Lunes sin entrenador",
        body: "Los malos resultados terminan con Montalbán fuera. Mena puede asumir provisionalmente o puede llegar un técnico externo.",
        visible: ["Montalbán ya no dirige al equipo."], uncertain: ["No sabes si Mena tendrá poder real ni qué idea traerá un sustituto."],
        gates: [{ path: "flags.COACH_FIRED", op: "eq", value: true }], npcRefs: ["NPC_CCH_01", "NPC_CCH_02"], seedsRead: ["SEED_COACH_PUBLIC", "SEED_MENA_EARLY_READ"], tags: ["coach", "change", "role"], weight: 7,
        choices: [
            { id: "MENA", label: "Acercarte a Mena para entender el plan provisional", intentTags: ["information"], primaryMessage: "Mena te explica qué puede cambiar y te da una oportunidad concreta.", secondaryMessage: "La interinidad dura poco y el nuevo técnico reinicia la jerarquía.", primaryEffects: [n("rel.NPC_CCH_02.trust", 6), n("sport.roleScore", 6)], secondaryEffects: [n("sport.roleScore", -2)] },
            { id: "DIRECTOR", label: "Pedir al club claridad sobre el cambio", intentTags: ["institution"], primaryMessage: "Ferrer comparte el calendario real de la búsqueda.", secondaryMessage: "La dirección evita respuestas y tu rol queda más incierto.", primaryEffects: [n("control.career", 4)], secondaryEffects: [n("rel.NPC_DIR_02.trust", -3)] },
            { id: "WAIT", label: "Entrenar y esperar al nuevo técnico", intentTags: ["patience"], primaryMessage: "Llegas al cambio sin haberte atado a ningún bando.", secondaryMessage: "Otros jugadores aprovechan antes la ventana de comunicación.", primaryEffects: [n("reputation.prestige", 1)], secondaryEffects: [n("sport.roleScore", -4)] }
        ]
    }),
    E({
        id: "CEVT_18_RELEG_01", ageWindow: [18, 19], family: "conditional", title: "El día después",
        body: "UDV desciende. El presupuesto cambia, algunos veteranos salen y quedarse puede darte un rol enorme o atraparte un año abajo.",
        visible: ["El descenso es oficial y el club necesita ajustar plantilla."], uncertain: ["No sabes qué jugadores aceptarán salir ni cuál será el proyecto real."],
        gates: [{ path: "flags.UDV_RELEGATED", op: "eq", value: true }], timeWindow: { months: [5, 6, 7] }, npcRefs: ["NPC_DIR_01", "NPC_DIR_02"], seedsRead: ["SEED_EXIT_STYLE_UDV"], tags: ["relegation", "route", "modest_route"], weight: 8,
        choices: [
            { id: "STAY_ROLE", label: "Quedarte si te ofrecen un rol central", intentTags: ["home", "minutes"], primaryMessage: "El descenso abre espacio y te conviertes en una pieza importante.", secondaryMessage: "El rol es mayor, pero el equipo tarda en estabilizarse y pierdes exposición.", primaryEffects: [set("tier", 4), n("sport.roleScore", 18)], secondaryEffects: [set("tier", 4), n("sport.roleScore", 10), n("reputation.prestige", -7)] },
            { id: "EXIT", label: "Buscar salida aprovechando la necesidad de vender", intentTags: ["exit", "market"], primaryMessage: "La necesidad económica facilita una salida limpia a un contexto superior.", secondaryMessage: "El club pide más de lo esperado y el mercado se enfría.", primaryEffects: [set("club", "NEW_CLUB"), set("world.ownerClub", "NEW_CLUB"), set("tier", 3), n("reputation.marketHeat", 7)], secondaryEffects: [n("reputation.marketHeat", -5)] },
            { id: "WAIT", label: "Esperar a ver qué plantilla queda", intentTags: ["wait"], primaryMessage: "Esperar te permite comprobar que el proyecto conserva más nivel del previsto.", secondaryMessage: "Los destinos que tenían hueco cierran antes y reduces tus alternativas.", primaryEffects: [n("control.career", 3)], secondaryEffects: [n("control.career", -5)] }
        ]
    }),
    E({
        id: "CEVT_18_PLAYOFF_01", ageWindow: [18, 19], family: "conditional", title: "Nadie lo esperaba",
        body: "UDV se mete contra pronóstico en un playoff. El éxito colectivo cambia de golpe el valor de quedarse, vender y asumir riesgos.",
        visible: ["El playoff es real y el calendario está definido."], uncertain: ["No sabes si el rendimiento alterará la política de ventas del verano."],
        gates: [{ path: "flags.UDV_PLAYOFF", op: "eq", value: true }], timeWindow: { months: [5, 6] }, tags: ["playoff", "club", "market"], weight: 7,
        choices: [
            { id: "COMMIT", label: "Cerrar cualquier conversación y centrarte en el playoff", intentTags: ["team"], primaryMessage: "El compromiso coincide con una fase final que mejora tu posición interna.", secondaryMessage: "El playoff termina pronto y algunas ventanas externas ya han avanzado.", primaryEffects: [n("sport.roleScore", 10), n("reputation.prestige", 5)], secondaryEffects: [n("reputation.marketHeat", -3)] },
            { id: "QUIET_MARKET", label: "Permitir que tu agente escuche sin interferir", intentTags: ["parallel"], primaryMessage: "Mantienes el foco y llegas al verano con información útil.", secondaryMessage: "Un contacto se conoce y genera preguntas en el peor momento.", primaryEffects: [n("control.career", 5)], secondaryEffects: [n("reputation.mediaHeat", 5)] },
            { id: "DELAY", label: "No decidir nada hasta saber cómo termina", intentTags: ["wait"], primaryMessage: "El resultado del equipo aclara después cuál es tu mejor palanca.", secondaryMessage: "La incertidumbre conserva libertad, pero no conserva todas las ofertas.", primaryEffects: [n("control.career", 2)], secondaryEffects: [n("reputation.marketHeat", -4)] }
        ]
    }),
    E({
        id: "CEVT_19_BIG_01", ageWindow: [19, 19], family: "conditional", title: "El escudo en el móvil",
        body: "Un club grande pregunta por ti. La propuesta habla del futuro y de desarrollo, pero no incluye promesa de primer equipo.",
        visible: ["El interés procede de un club de nivel superior."], uncertain: ["No sabes dónde jugarías realmente la próxima temporada."],
        gates: [{ path: "flags.BIG_CLUB_INTEREST", op: "eq", value: true }, { path: "reputation.marketHeat", op: "gte", value: 42 }], tags: ["elite", "bigearly", "market"], weight: 7,
        choices: [
            { id: "ACCEPT_MODEL", label: "Aceptar el proyecto aunque el primer destino no esté cerrado", intentTags: ["ambition", "bigearly"], primaryMessage: "El club encuentra una cesión coherente y el salto amplía tu techo.", secondaryMessage: "Entras en una estructura potente pero tu camino hacia minutos se vuelve difuso.", primaryEffects: [set("club", "BIG_CLUB"), set("world.ownerClub", "BIG_CLUB"), set("tier", 1), flag("BIG_CLUB", true), flag("LOAN_ACTIVE", true), n("reputation.prestige", 15)], secondaryEffects: [set("club", "BIG_CLUB"), set("world.ownerClub", "BIG_CLUB"), set("tier", 1), set("role", "reserve"), flag("BIG_CLUB", true), n("sport.roleScore", -8), n("reputation.prestige", 12)] },
            { id: "LOAN_PLAN", label: "Exigir un plan de cesión antes de firmar", intentTags: ["clarity", "loan"], primaryMessage: "Aparece un destino claro y decides con mucha más información.", secondaryMessage: "El club no acepta condicionar la operación y mira a otro jugador.", primaryEffects: [n("control.career", 10), flag("BIG_CLUB", true)], secondaryEffects: [n("reputation.marketHeat", -5)] },
            { id: "DECLINE", label: "Rechazar mientras no exista una ruta de minutos", intentTags: ["minutes", "control"], primaryMessage: "Mantienes control y otro proyecto te ofrece una función más concreta.", secondaryMessage: "La gran oportunidad desaparece y no surge una equivalente de inmediato.", primaryEffects: [n("control.career", 10), n("sport.roleScore", 4)], secondaryEffects: [n("reputation.prestige", -2)] }
        ]
    }),
    E({
        id: "CEVT_19_AGENT_01", ageWindow: [19, 19], family: "conditional", title: "Dos versiones del mismo martes",
        body: "Tu agente y otra fuente describen de forma incompatible qué ocurrió con un club interesado. Ninguna versión tiene por qué ser una mentira consciente.",
        visible: ["Las versiones no encajan."], uncertain: ["No sabes si hubo cambio de condiciones, mala comunicación o una omisión interesada."],
        gates: [{ path: "flags.HAS_SEED_AGENT_OMISSION", op: "eq", value: true }, { path: "flags.AGENT_SECOND_DISCREPANCY", op: "eq", value: true }], npcRefs: ["NPC_AGT_01", "NPC_AGT_02", "NPC_PRS_01"], seedsRead: ["SEED_AGENT_OMISSION"], seedsWrite: ["SEED_AGENT_OMISSION"], tags: ["agent", "information", "trust"], weight: 7,
        choices: [
            { id: "AGENT", label: "Aceptar la explicación del agente y seguir", intentTags: ["trust"], primaryMessage: "La explicación resulta compatible con lo que ocurrió y el vínculo se estabiliza.", secondaryMessage: "Más tarde aparece un dato que confirma que faltaba una parte importante.", primaryEffects: [n("control.agentDependency", 4)], secondaryEffects: [n("control.career", -5)], secondarySeedTransitions: [seedCreate("SEED_AGENT_OMISSION", 82, { conditional: "trusted_wrong" })] },
            { id: "SOURCE", label: "Dar más credibilidad a la otra fuente", intentTags: ["skeptic"], primaryMessage: "La duda te permite recuperar información y renegociar límites.", secondaryMessage: "La fuente también había simplificado una negociación que cambió varias veces.", primaryEffects: [n("control.career", 6)], secondaryEffects: [n("rel.NPC_PRS_01.trust", -3)] },
            { id: "EVIDENCE", label: "Pedir cronología y mensajes antes de decidir", intentTags: ["evidence"], primaryMessage: "Los registros aclaran qué sabía cada parte y cuándo.", secondaryMessage: "No obtienes certeza completa, pero dejas claro que el flujo de información será auditado.", primaryEffects: [n("control.career", 8)], secondaryEffects: [n("control.career", 5)] }
        ]
    }),
    E({
        id: "CEVT_19_INJ_01", ageWindow: [19, 19], family: "conditional", title: "El mes que se convierte en cuatro",
        body: "Una lesión que parecía menor evoluciona peor de lo previsto. El historial hacía posible la complicación, pero nadie podía garantizarla.",
        visible: ["La recuperación se ha alargado."], uncertain: ["No sabes cuándo recuperarás el nivel ni cómo reaccionará el mercado."],
        gates: [{ path: "flags.LONG_INJURY", op: "eq", value: true }], npcRefs: ["NPC_MED_01"], seedsRead: ["SEED_BODY_PRECEDENT", "SEED_PHYSIO_CONFIDENCE"], seedsWrite: ["SEED_BODY_PRECEDENT"], tags: ["injury", "rebuild", "body"], weight: 8,
        choices: [
            { id: "CONSERVATIVE", label: "Aceptar una rehabilitación conservadora", intentTags: ["recovery"], primaryMessage: "La progresión lenta reduce riesgo y recuperas estabilidad física.", secondaryMessage: "La recuperación es correcta, pero pierdes una parte importante de la temporada.", primaryEffects: [n("body.risk", -18), n("body.fitness", 8)], secondaryEffects: [n("body.risk", -10), n("sport.roleScore", -7)] },
            { id: "SECOND_OPINION", label: "Buscar una segunda opinión especializada", intentTags: ["information"], primaryMessage: "La revisión modifica el plan y evita seguir una carga que no te convenía.", secondaryMessage: "El diagnóstico esencial coincide y solo has ganado información, no tiempo.", primaryEffects: [n("body.risk", -12), n("control.career", 4)], secondaryEffects: [n("body.risk", -6)] },
            { id: "PUSH_TESTS", label: "Intentar acelerar solo si superas pruebas objetivas", intentTags: ["conditional_risk"], primaryMessage: "Los tests progresan bien y adelantas parte de la vuelta sin recaer.", secondaryMessage: "Los tests muestran que todavía no estás listo y el calendario no se puede forzar.", primaryEffects: [n("body.fitness", 12), n("sport.roleScore", 5)], secondaryEffects: [n("body.risk", -4)] }
        ]
    }),
    E({
        id: "CEVT_19_ABROAD_01", ageWindow: [19, 19], family: "conditional", title: "Tres días fuera",
        body: "Un club de desarrollo extranjero propone una visita de tres días o una negociación acelerada. El rol parece interesante; idioma y distancia son incógnitas reales.",
        visible: ["Conoces club, país y marco deportivo general."], uncertain: ["No sabes cómo encajarás ni si la oportunidad sobrevivirá una negociación lenta."],
        gates: [{ path: "flags.FOREIGN_DEV_INTEREST", op: "eq", value: true }], tags: ["abroad", "market", "journey"], weight: 6,
        choices: [
            { id: "VISIT", label: "Viajar y evaluar el entorno antes de decidir", intentTags: ["information", "abroad"], primaryMessage: "La visita te da información que no aparecía en el dossier y el proyecto encaja.", secondaryMessage: "Descubres fricciones reales y vuelves sin cerrar, pero con más criterio.", primaryEffects: [set("club", "FOREIGN_DEV_CLUB"), set("world.ownerClub", "FOREIGN_DEV_CLUB"), set("tier", 3), flag("ABROAD_ROUTE", true), n("control.career", 5)], secondaryEffects: [n("control.career", 7)] },
            { id: "WRITTEN_ROLE", label: "Pedir primero una definición escrita del rol", intentTags: ["clarity"], primaryMessage: "El club concreta el plan y la propuesta gana credibilidad.", secondaryMessage: "La exigencia enfría una operación que todavía era exploratoria.", primaryEffects: [n("control.career", 7), n("reputation.marketHeat", 3)], secondaryEffects: [n("reputation.marketHeat", -4)] },
            { id: "DECLINE", label: "Descartar la vía extranjera por ahora", intentTags: ["stability"], primaryMessage: "La decisión conserva estabilidad y el mercado doméstico sigue vivo.", secondaryMessage: "La ventana extranjera se cierra y tardará en reaparecer otra similar.", primaryEffects: [n("sport.roleScore", 3)], secondaryEffects: [n("reputation.marketHeat", -3)] }
        ]
    }),
    E({
        id: "CEVT_19_SOCIAL_01", ageWindow: [19, 19], family: "conditional", title: "La captura",
        body: "Una foto o mensaje antiguo reaparece justo cuando tienes más exposición. La imagen no ha cambiado; el contexto sí.",
        visible: ["El contenido es auténtico y antiguo."], uncertain: ["No sabes quién lo ha recuperado ni cuánto recorrido tendrá."],
        gates: [{ path: "flags.NIGHT_PHOTO", op: "eq", value: true }, { path: "reputation.mediaHeat", op: "gte", value: 15 }], npcRefs: ["NPC_PRS_01", "NPC_SOC_01"], seedsRead: ["SEED_DANI_NORMALITY", "SEED_CLARA_CHANNEL"], tags: ["social", "media", "context"], weight: 5,
        choices: [
            { id: "CONTEXT", label: "Dar contexto tú mismo", intentTags: ["public"], primaryMessage: "La explicación limita el recorrido y evita versiones peores.", secondaryMessage: "Responder amplifica una historia que todavía era pequeña.", primaryEffects: [n("reputation.mediaHeat", -4)], secondaryEffects: [n("reputation.mediaHeat", 8)] },
            { id: "IGNORE", label: "No reaccionar", intentTags: ["silence"], primaryMessage: "El tema se consume sin convertirse en noticia mayor.", secondaryMessage: "El vacío deja espacio para una interpretación más agresiva.", primaryEffects: [n("reputation.mediaHeat", -3)], secondaryEffects: [n("reputation.mediaHeat", 7)] },
            { id: "CHANNEL", label: "Pedir a Clara o al club que contraste antes de publicar", intentTags: ["channel"], primaryMessage: "El canal aporta contexto sin ponerte en primer plano.", secondaryMessage: "El intento de ordenar la historia se convierte en parte de la propia noticia.", primaryEffects: [n("rel.NPC_PRS_01.trust", 5)], secondaryEffects: [n("reputation.mediaHeat", 5)] }
        ]
    }),
    E({
        id: "CEVT_19_NANO_01", ageWindow: [19, 19], family: "conditional", title: "No me llames para arreglarme la vida",
        body: "Nano descubre que moviste un contacto por él sin pedir permiso. La oportunidad puede ser buena y, aun así, el gesto puede dolerle.",
        visible: ["Nano sabe que el contacto salió de ti."], uncertain: ["No sabes si su enfado pesa más que el valor profesional de la oportunidad."],
        gates: [{ path: "flags.UNSOLICITED_NANO_HELP", op: "eq", value: true }, { path: "flags.HAS_SEED_NANO_SHADOW", op: "eq", value: true }], npcRefs: ["NPC_PLR_14"], seedsRead: ["SEED_NANO_SHADOW"], seedsWrite: ["SEED_NANO_SHADOW"], tags: ["nano", "friendship", "help"], weight: 7,
        choices: [
            { id: "APOLOGIZE", label: "Explicar por qué lo hiciste y pedir disculpas por no preguntar", intentTags: ["repair"], primaryMessage: "Nano separa el enfado del contacto y acepta que la relación necesita nuevos límites.", secondaryMessage: "La disculpa llega, pero para él confirma que asumiste que sabías qué necesitaba.", primaryEffects: [n("rel.NPC_PLR_14.trust", 8), n("rel.NPC_PLR_14.resentment", -8)], secondaryEffects: [n("rel.NPC_PLR_14.resentment", 4)], primarySeedTransitions: [seedCreate("SEED_NANO_SHADOW", 70, { help: "repaired" })] },
            { id: "DEFEND", label: "Defender que era una oportunidad y no una humillación", intentTags: ["defend"], primaryMessage: "El contacto acaba funcionando y Nano reconoce que la ayuda tenía valor.", secondaryMessage: "Que funcione profesionalmente no arregla la sensación de haber perdido autonomía.", primaryEffects: [flag("NANO_OPPORTUNITY", true), n("rel.NPC_PLR_14.affinity", 3)], secondaryEffects: [flag("NANO_OPPORTUNITY", true), n("rel.NPC_PLR_14.resentment", 10)] },
            { id: "WITHDRAW", label: "Retirar el contacto si todavía es posible y dejar que decida él", intentTags: ["autonomy"], primaryMessage: "Recuperar su control rebaja el conflicto.", secondaryMessage: "Nano aprecia el límite, pero la oportunidad desaparece con él.", primaryEffects: [n("rel.NPC_PLR_14.trust", 6), flag("UNSOLICITED_NANO_HELP", false)], secondaryEffects: [n("rel.NPC_PLR_14.trust", 3), flag("NANO_OPPORTUNITY", false)] }
        ]
    }),
    E({
        id: "CEVT_19_RETURN_01", ageWindow: [19, 19], family: "conditional", title: "Vuelves y nada está igual",
        body: "Termina una cesión y regresas a UDV. Tú has cambiado y la plantilla también; volver no restaura automáticamente la jerarquía anterior.",
        visible: ["Tu préstamo ha terminado y sigues vinculado al club propietario."], uncertain: ["No sabes cómo te compara ahora el cuerpo técnico con quienes ocuparon tu sitio."],
        gates: [{ path: "flags.LOAN_RETURN", op: "eq", value: true }], npcRefs: ["NPC_DIR_02", "NPC_CCH_01", "NPC_CCH_02"], seedsRead: ["SEED_EXIT_STYLE_UDV"], tags: ["return", "loan", "role"], weight: 8,
        choices: [
            { id: "ROLE_MEETING", label: "Pedir una reunión de rol antes de empezar pretemporada", intentTags: ["clarity"], primaryMessage: "La reunión reconoce tu progreso y abre una función distinta.", secondaryMessage: "El club te sigue viendo como activo de rotación y la claridad no mejora el diagnóstico.", primaryEffects: [set("club", "UDV"), flag("LOAN_ACTIVE", false), n("sport.roleScore", 10)], secondaryEffects: [set("club", "UDV"), flag("LOAN_ACTIVE", false), n("sport.roleScore", -2)] },
            { id: "EARN", label: "Volver sin exigir nada y ganarte el sitio", intentTags: ["competition"], primaryMessage: "Tu evolución se nota en el campo y la jerarquía empieza a moverse.", secondaryMessage: "La ausencia creó una estructura nueva y no basta con haber jugado fuera.", primaryEffects: [set("club", "UDV"), flag("LOAN_ACTIVE", false), n("sport.roleScore", 13)], secondaryEffects: [set("club", "UDV"), flag("LOAN_ACTIVE", false), n("sport.roleScore", -4)] },
            { id: "NEW_LOAN", label: "Pedir otra salida si no existe un hueco claro", intentTags: ["loan", "minutes"], primaryMessage: "El club acepta que seguir compitiendo fuera es coherente.", secondaryMessage: "La cadena de préstamos mantiene minutos pero difumina tu lugar institucional.", primaryEffects: [set("club", "DEVELOPMENT_CLUB_2"), flag("LOAN_ACTIVE", true), n("sport.roleScore", 8)], secondaryEffects: [set("club", "DEVELOPMENT_CLUB_2"), flag("LOAN_ACTIVE", true), n("control.career", -4)] }
        ]
    })
];


// ═══ content/events/20_23/principal-events.js ═══
const rows = [
    { id: "EVT_20_LIFE_001", title: "La primera casa que pagas tú", age: 20, family: "life", months: [7, 8], seed: "SEED_FIRST_BIG_MONEY" },
    { id: "EVT_20_AGT_001", title: "Ahora llama por ti", age: 20, family: "agent", months: [7, 8, 9], seed: "SEED_AGENT_POWER" },
    { id: "EVT_20_ABR_001", title: "Un idioma dentro del vestuario", age: 20, family: "social", months: [7, 8, 9, 10], seed: "SEED_FOREIGN_ADAPT", gates: [{ path: "flags.ABROAD_ROUTE", op: "eq", value: true }] },
    { id: "EVT_20_MED_001", title: "Lo que dices en la revisión", age: 20, family: "medical", months: [7, 8, 9, 1, 2], seed: "SEED_MEDICAL_DISCLOSURE" },
    { id: "EVT_20_STATUS_001", title: "El dorsal libre", age: 20, family: "team", months: [7, 8], verified: true, gates: [{ path: "sport.roleScore", op: "gte", value: 35 }], body: "Queda libre un dorsal simbólico. El club te lo ofrece o te deja pedirlo, pero un veterano cree que debería ir a otro jugador." },
    { id: "EVT_20_CCH_001", title: "La promesa de agosto", age: 20, family: "tactical", months: [8, 9], verified: true, body: "El entrenador te dice en privado que vas a jugar mucho si mantienes el nivel. Dos semanas después el club ficha a un futbolista en tu zona." },
    { id: "EVT_20_LOCK_001", title: "Un golpe de entrenamiento", age: 20, family: "team", months: [9, 10, 11], verified: true, body: "Un veterano te entra durísimo después de que le hayas ganado dos veces. El entrenador deja seguir." },
    { id: "EVT_20_LOCK_002", title: "El compañero al que cubres", age: 20, family: "team", months: [10, 11, 12], seed: "SEED_TEAMMATE_COVER" },
    { id: "EVT_20_BRUNO_001", title: "La llamada de Bruno", age: 20, family: "market", months: [11, 12, 1, 2], verified: true, read: ["SEED_BRUNO_FAVOR"], gates: [{ path: "flags.HAS_SEED_BRUNO_FAVOR", op: "eq", value: true }], body: "Bruno te llama: su director deportivo busca un jugador de tu perfil. Puede decir tu nombre, pero no garantizar nada." },
    { id: "EVT_20_MKT_001", title: "Una oferta que cambia el mapa", age: 20, family: "market", months: [12, 1], gates: [{ path: "reputation.marketHeat", op: "gte", value: 28 }] },
    { id: "EVT_20_MATCH_001", title: "Tres partidos que pesan más", age: 20, family: "sport", months: [2, 3, 4, 5] },
    { id: "EVT_21_MONEY_001", title: "El primer contrato que cambia a tu familia", age: 21, family: "money", months: [7, 8], seed: "SEED_FAMILY_MONEY", verified: true, body: "Llega un contrato que multiplica tus ingresos —o, en una ruta modesta, el primer sueldo que permite ayudar de verdad en casa—." },
    { id: "EVT_21_AGT_001", title: "La comisión que ahora importa", age: 21, family: "agent", months: [7, 8, 9], seed: "SEED_AGENT_POWER" },
    { id: "EVT_21_AGT_002", title: "Una llamada que no escuchaste", age: 21, family: "agent", months: [9, 10, 11], seed: "SEED_AGENT_POWER", read: ["SEED_AGENT_OMISSION"] },
    { id: "EVT_21_ABR_001", title: "Navidad lejos", age: 21, family: "social", months: [11, 12, 1], seed: "SEED_FOREIGN_ADAPT", gates: [{ path: "flags.ABROAD_ROUTE", op: "eq", value: true }] },
    { id: "EVT_21_IMG_001", title: "La campaña", age: 21, family: "image", months: [7, 8, 9, 10], seed: "SEED_SPONSOR_IMAGE", verified: true, gates: [{ path: "reputation.mediaHeat", op: "gte", value: 18 }], body: "Una marca deportiva ofrece una campaña pequeña pero visible y quiere presentar tu historia de origen como parte del producto." },
    { id: "EVT_21_CAP_001", title: "El grupo de capitanes", age: 21, family: "captaincy", months: [9, 10, 11, 2, 3], seed: "SEED_FIRST_CAPTAIN_ROOM", verified: true, gates: [{ path: "professional.lockerPower", op: "gte", value: 28 }], body: "Tras una lesión o salida de un veterano, te invitan a una reunión de jugadores que decide primas internas, multas y mensajes al entrenador." },
    { id: "EVT_21_PRS_001", title: "La cifra publicada", age: 21, family: "press", months: [9, 10, 11, 12], seed: "SEED_PUBLIC_CONTRACT", verified: true, gates: [{ path: "reputation.mediaHeat", op: "gte", value: 20 }], body: "Un medio publica tu salario con una cifra inflada. El club no desmiente porque la noticia puede convenirle." },
    { id: "EVT_21_NAT_001", title: "Tu nombre no está", age: 21, family: "selection", months: [9, 10, 3, 4], seed: "SEED_SELECTION_SNUB", gates: [{ path: "flags.NATIONAL_RADAR", op: "eq", value: true }] },
    { id: "EVT_21_RIV_001", title: "Rivas vuelve a llamar", age: 21, family: "legacy", months: [10, 11, 2, 3], read: ["SEED_RIVAS_TRUST"], gates: [{ path: "flags.HAS_SEED_RIVAS_TRUST", op: "eq", value: true }] },
    { id: "EVT_21_CCH_001", title: "Un banquillo después de una promesa", age: 21, family: "tactical", months: [10, 11, 12, 1], gates: [{ path: "professional.roleSecurity", op: "lt", value: 52 }] },
    { id: "EVT_21_CCH_002", title: "Otro entrenador, otra versión de ti", age: 21, family: "tactical", months: [1, 2, 3, 4], seed: "SEED_TACTICAL_SACRIFICE", verified: true, body: "Llega un técnico nuevo y te ve en un rol más trabajador y menos vistoso. Tu agente teme que desaparezcan tus números." },
    { id: "EVT_21_MED_001", title: "Jugar no significa estar bien", age: 21, family: "medical", months: [2, 3, 4, 5], read: ["SEED_BODY_PRECEDENT"] },
    { id: "EVT_22_CON_001", title: "Veintidós y dieciocho meses", age: 22, family: "contract", months: [7, 8, 9], seed: "SEED_FIRST_FREE_AGENCY", verified: true, body: "Te quedan aproximadamente dieciocho meses de contrato. El club quiere hablar ahora; tu agente insiste en que el próximo verano tendrás más poder." },
    { id: "EVT_22_CON_002", title: "La puerta de la libertad", age: 22, family: "contract", months: [10, 11, 12, 1], seed: "SEED_FIRST_FREE_AGENCY" },
    { id: "EVT_22_TACT_001", title: "Ser útil puede cambiar tu mercado", age: 22, family: "tactical", months: [8, 9, 10, 11], seed: "SEED_TACTICAL_SACRIFICE" },
    { id: "EVT_22_DDL_001", title: "Quedan horas", age: 22, family: "market", months: [8, 1], seed: "SEED_DEADLINE_DAY", gates: [{ path: "reputation.marketHeat", op: "gte", value: 30 }] },
    { id: "EVT_22_LOCK_001", title: "La votación que divide el vestuario", age: 22, family: "captaincy", months: [10, 11, 12, 2], seed: "SEED_LOCKER_VOTE", gates: [{ path: "professional.lockerPower", op: "gte", value: 30 }] },
    { id: "EVT_22_HOME_001", title: "Volver ya no significa volver igual", age: 22, family: "family", months: [12, 1, 5, 6], seed: "SEED_HOME_DISTANCE" },
    { id: "EVT_22_MED_001", title: "Lo que el nuevo club pregunta", age: 22, family: "medical", months: [7, 8, 1], seed: "SEED_MEDICAL_DISCLOSURE" },
    { id: "EVT_22_MKT_001", title: "Dos proyectos, dos versiones de ti", age: 22, family: "market", months: [6, 7, 8, 1], gates: [{ path: "reputation.marketHeat", op: "gte", value: 36 }] },
    { id: "EVT_22_LIFE_001", title: "Tu entorno ya es una decisión", age: 22, family: "life", months: [9, 10, 3, 4] },
    { id: "EVT_22_END_001", title: "Cumples 23", age: 22, family: "legacy", months: [5, 6] }
];
const familyEffects = {
    contract: [[n("professional.contractPower", 8), n("professional.institutionalTrust", -4)], [n("professional.contractPower", 3), n("professional.institutionalTrust", 4)], [n("professional.contractPower", 6), n("professional.roleSecurity", -3)], [n("professional.contractPower", -3), n("professional.institutionalTrust", 6)]],
    market: [[n("reputation.marketHeat", 7), n("professional.environmentStability", -4)], [n("professional.roleSecurity", 5), n("reputation.marketHeat", -2)], [n("professional.contractPower", 5), n("reputation.mediaHeat", 3)], [n("professional.environmentStability", 5), n("professional.contractPower", -2)]],
    medical: [[n("body.risk", 6), n("professional.roleSecurity", 3)], [n("body.risk", -5), n("professional.roleSecurity", -2)], [n("professional.institutionalTrust", 4), n("body.risk", -2)], [n("professional.contractPower", 2), n("professional.injuryMinutesImpact", 4)]],
    team: [[n("professional.lockerPower", 5), n("professional.environmentStability", -2)], [n("professional.lockerPower", 2), n("professional.environmentStability", 4)], [n("professional.lockerPower", -2), n("professional.roleSecurity", 3)], [n("professional.lockerPower", 4), n("professional.institutionalTrust", 2)]],
    captaincy: [[n("professional.lockerPower", 7)], [n("professional.lockerPower", 3), n("professional.environmentStability", 3)], [n("professional.lockerPower", 5), n("professional.environmentStability", -4)], [n("professional.lockerPower", -2), n("professional.roleSecurity", 2)]],
    press: [[n("reputation.mediaHeat", 8), n("professional.contractPower", 3)], [n("reputation.mediaHeat", 3), n("professional.institutionalTrust", 2)], [n("reputation.mediaHeat", -2), n("professional.contractPower", 2)], [n("professional.institutionalTrust", 4), n("reputation.mediaHeat", 1)]],
    image: [[n("reputation.mediaHeat", 9), n("professional.moneyComfort", 4)], [n("reputation.mediaHeat", 4), n("professional.moneyComfort", 2)], [n("reputation.mediaHeat", -3)], [n("reputation.mediaHeat", 7), n("professional.moneyComfort", 2)]],
    agent: [[n("professional.agentControl", -7), n("professional.contractPower", 5)], [n("professional.agentControl", 3), n("professional.contractPower", 2)], [n("professional.agentControl", 7), n("reputation.marketHeat", -2)], [n("professional.agentControl", -2), n("professional.environmentStability", 3)]],
    social: [[n("professional.foreignAdaptation", 7), n("professional.environmentStability", 3)], [n("professional.foreignAdaptation", 4), n("professional.roleSecurity", 2)], [n("professional.foreignAdaptation", -1), n("professional.environmentStability", 5)], [n("professional.foreignAdaptation", 5), n("professional.moneyComfort", -1)]],
    tactical: [[n("sport.roleScore", 5), n("professional.roleSecurity", 4)], [n("sport.roleScore", 2), n("reputation.marketHeat", 3)], [n("sport.roleScore", -2), n("reputation.marketHeat", 5)], [n("professional.contractPower", 3), n("professional.institutionalTrust", -2)]],
    sport: [[n("sport.form", 5), n("body.risk", 4)], [n("sport.form", 2), n("body.risk", -2)], [n("sport.roleScore", 4), n("sport.form", -1)], [n("professional.roleSecurity", 3), n("sport.form", 1)]],
    money: [[n("professional.moneyComfort", 8), n("professional.environmentStability", -2)], [n("professional.moneyComfort", 4), n("professional.environmentStability", 4)], [n("professional.moneyComfort", 1), n("professional.environmentStability", 2)], [n("professional.moneyComfort", 3), n("professional.agentControl", 2)]],
    family: [[n("professional.environmentStability", 5), n("professional.moneyComfort", -2)], [n("professional.environmentStability", 3)], [n("professional.environmentStability", -2), n("professional.agentControl", 2)], [n("professional.environmentStability", 4), n("reputation.mediaHeat", -1)]],
    life: [[n("professional.environmentStability", 5), n("professional.moneyComfort", -2)], [n("professional.moneyComfort", 5), n("professional.environmentStability", -2)], [n("professional.agentControl", 3), n("professional.environmentStability", 2)], [n("professional.environmentStability", 1), n("body.risk", -2)]],
    selection: [[n("professional.nationalHeat", 7), n("reputation.mediaHeat", 3)], [n("professional.nationalHeat", 3), n("professional.environmentStability", 2)], [n("professional.nationalHeat", 5), n("reputation.mediaHeat", -1)], [n("professional.nationalHeat", 2), n("professional.agentControl", 2)]],
    legacy: [[n("reputation.prestige", 4), n("professional.environmentStability", 2)], [n("professional.lockerPower", 4)], [n("professional.contractPower", 3), n("reputation.mediaHeat", 2)], [n("professional.environmentStability", 4), n("reputation.prestige", 1)]]
};
function make(row) {
    const ef = familyEffects[row.family] ?? familyEffects.life;
    const seed = row.seed;
    const choices = [
        { id: "A", label: "Tomar la iniciativa", intentTags: ["initiative"], primaryMessage: "La iniciativa abre margen, pero también hace visible tu posición.", secondaryMessage: "La misma iniciativa es interpretada como precipitación por parte del entorno.", primaryEffects: ef[0], secondaryEffects: [...ef[0], n("professional.environmentStability", -2)], primarySeedTransitions: seed ? [seedCreate(seed, 55, { choice: "A" })] : undefined, secondarySeedTransitions: seed ? [seedCreate(seed, 48, { choice: "A" })] : undefined },
        { id: "B", label: "Esperar y reunir información", intentTags: ["patience"], primaryMessage: "Esperar aporta información que cambia la lectura del problema.", secondaryMessage: "El tiempo también consume parte de la ventana disponible.", primaryEffects: ef[1], secondaryEffects: [...ef[1], n("professional.contractPower", -1)], primarySeedTransitions: seed ? [seedCreate(seed, 48, { choice: "B" })] : undefined, secondarySeedTransitions: seed ? [seedCreate(seed, 42, { choice: "B" })] : undefined },
        { id: "C", label: "Proteger tu posición", intentTags: ["self_protection"], primaryMessage: "Proteges tu margen de decisión y el coste inmediato queda contenido.", secondaryMessage: "Otros leen la cautela como distancia o falta de compromiso.", primaryEffects: ef[2], secondaryEffects: [...ef[2], n("professional.institutionalTrust", -2)], primarySeedTransitions: seed ? [seedCreate(seed, 52, { choice: "C" })] : undefined, secondarySeedTransitions: seed ? [seedCreate(seed, 46, { choice: "C" })] : undefined },
        { id: "D", label: "Buscar una solución intermedia", intentTags: ["compromise"], primaryMessage: "La solución intermedia conserva varias puertas abiertas.", secondaryMessage: "Intentar conservar todas las puertas reduce la claridad de tu postura.", primaryEffects: ef[3], secondaryEffects: [...ef[3], n("professional.roleSecurity", -1)], primarySeedTransitions: seed ? [seedCreate(seed, 50, { choice: "D" })] : undefined, secondarySeedTransitions: seed ? [seedCreate(seed, 44, { choice: "D" })] : undefined }
    ];
    return ambiguousEvent({
        id: row.id, ageWindow: [row.age, row.age], phase: "20_23", family: row.family, title: row.title,
        body: row.body ?? "La carrera profesional te obliga a elegir entre objetivos compatibles en teoría, pero difíciles de conservar a la vez.",
        visible: ["Conoces los hechos formales de la situación y las condiciones que ya se han producido."],
        uncertain: ["No conoces la agenda completa de terceros ni cómo cambiará el contexto durante las próximas semanas."],
        choices, gates: row.gates, timeWindow: { months: row.months }, weight: row.id === "EVT_22_END_001" ? 95 : row.id === "EVT_22_DDL_001" ? 34 : 12,
        cooldown: 99999, seedsRead: row.read, seedsWrite: seed ? [seed] : undefined,
        tags: [row.family, row.age === 22 ? "transition23" : "professionalization"], canonStatus: row.verified ? "verified" : "technical_adaptation"
    });
}
var PRINCIPAL_EVENTS_20_23 = rows.map(make);


// ═══ content/events/20_23/conditional-events.js ═══
const rows = [
    { id: "CEVT_20_LOAN_01", title: "El propietario pregunta por ti", age: [20, 22], gates: [{ path: "flags.LOAN_ACTIVE", op: "eq", value: true }] },
    { id: "CEVT_20_ABR_01", title: "La primera semana de verdad fuera", age: [20, 22], gates: [{ path: "flags.ABROAD_ROUTE", op: "eq", value: true }] },
    { id: "CEVT_20_AGENT_01", title: "Tu agente responde antes que tú", age: [20, 22], gates: [{ path: "professional.agentControl", op: "lt", value: 95 }] },
    { id: "CEVT_20_BODY_01", title: "La señal que nadie ve en el resumen", age: [20, 22], gates: [{ path: "body.risk", op: "gte", value: 38 }] },
    { id: "CEVT_20_HOME_01", title: "En Valdoria todavía opinan", age: [20, 22], gates: [{ path: "flags.HAS_SEED_EXIT_STYLE_UDV", op: "eq", value: true }] },
    { id: "CEVT_20_BRUNO_01", title: "Bruno cumple —o no— su palabra", age: [20, 22], gates: [{ path: "flags.HAS_SEED_BRUNO_FAVOR", op: "eq", value: true }] },
    { id: "CEVT_21_CAPTAIN_01", title: "Tu nombre aparece en una decisión interna", age: [21, 22], gates: [{ path: "professional.lockerPower", op: "gte", value: 42 }] },
    { id: "CEVT_21_NAT_01", title: "Una lista que te coloca cerca", age: [21, 22], gates: [{ path: "flags.NATIONAL_RADAR", op: "eq", value: true }] },
    { id: "CEVT_21_MEDIA_01", title: "La fama llega antes que el siguiente partido", age: [21, 22], gates: [{ path: "reputation.mediaHeat", op: "gte", value: 42 }] },
    { id: "CEVT_21_CONTRACT_01", title: "El club escucha un rumor que tú no lanzaste", age: [21, 22], gates: [{ path: "professional.contractPower", op: "gte", value: 52 }] },
    { id: "CEVT_21_ABR_01", title: "Navidad solo", age: [21, 22], months: [12, 1], gates: [{ path: "flags.ABROAD_ROUTE", op: "eq", value: true }, { path: "professional.foreignAdaptation", op: "lt", value: 60 }] },
    { id: "CEVT_21_ADRIAN_01", title: "La comparación vuelve", age: [21, 22], gates: [{ path: "flags.HAS_SEED_ADRIAN_MIRROR", op: "eq", value: true }] },
    { id: "CEVT_21_FAMILY_01", title: "Ayudar cambia la siguiente petición", age: [21, 22], gates: [{ path: "flags.HAS_SEED_FAMILY_MONEY", op: "eq", value: true }] },
    { id: "CEVT_22_DEADLINE_01", title: "La llamada de las 22:47", age: [22, 22], months: [8, 1], gates: [{ path: "reputation.marketHeat", op: "gte", value: 34 }] },
    { id: "CEVT_22_INJ_01", title: "El mes que amenaza con ser cuatro", age: [22, 22], gates: [{ path: "professional.injuryMinutesImpact", op: "gte", value: 18 }] },
    { id: "CEVT_22_LOANBUY_01", title: "Comprar al cedido", age: [22, 22], gates: [{ path: "flags.LOAN_ACTIVE", op: "eq", value: true }, { path: "sport.roleScore", op: "gte", value: 48 }] },
    { id: "CEVT_22_RETURN_01", title: "Volver al propietario", age: [22, 22], gates: [{ path: "flags.LOAN_ACTIVE", op: "eq", value: true }] },
    { id: "CEVT_22_FREE_01", title: "El mercado espera que cedas", age: [22, 22], gates: [{ path: "contract.monthsRemaining", op: "lte", value: 7 }] }
];
function make(row) {
    const effects = row.effects ?? [[n("professional.contractPower", 4), n("professional.environmentStability", -2)], [n("professional.environmentStability", 4), n("professional.roleSecurity", 1)], [n("professional.agentControl", 3), n("reputation.mediaHeat", 2)]];
    return ambiguousEvent({
        id: row.id, ageWindow: row.age, phase: "20_23", family: "conditional", title: row.title,
        body: "Una consecuencia del historial previo vuelve a abrir una decisión que no existiría en todas las carreras.",
        visible: ["El acontecimiento tiene una causa previa reconocible en tu carrera."],
        uncertain: ["No sabes cuánto peso conserva esa causa ni qué busca exactamente la otra parte."],
        gates: row.gates, timeWindow: row.months ? { months: row.months } : undefined, weight: 9, cooldown: 99999,
        choices: [
            { id: "A", label: "Actuar ahora", intentTags: ["react"], primaryMessage: "La reacción cambia el equilibrio inmediatamente.", secondaryMessage: "La reacción acelera una consecuencia que todavía podía evolucionar.", primaryEffects: effects[0], secondaryEffects: [...effects[0], n("professional.institutionalTrust", -2)] },
            { id: "B", label: "Esperar", intentTags: ["wait"], primaryMessage: "La espera aporta contexto adicional.", secondaryMessage: "La ventana pierde valor mientras esperas.", primaryEffects: effects[1], secondaryEffects: [...effects[1], n("professional.contractPower", -2)] },
            { id: "C", label: "Moverlo por otro canal", intentTags: ["channel"], primaryMessage: "Cambiar el canal reduce un riesgo y abre otro.", secondaryMessage: "El nuevo canal introduce a más gente en el conflicto.", primaryEffects: effects[2], secondaryEffects: [...effects[2], n("reputation.mediaHeat", 2)] }
        ],
        tags: ["conditional", "causal_callback"], canonStatus: "technical_adaptation"
    });
}
var CONDITIONAL_EVENTS_20_23 = rows.map(make);


// ═══ content/events/20_23/index.js ═══
var EVENTS_20_23 = [...PRINCIPAL_EVENTS_20_23, ...CONDITIONAL_EVENTS_20_23];


// ═══ content/events/23_26/principal-events.js ═══
const rows = [
    { id: "EVT_23_BRIDGE_001", title: "Lo que significan tus 23", age: 23, family: "legacy", months: [7], seed: "SEED_ELITE_ROLE_BARGAIN" },
    { id: "EVT_23_MKT_001", title: "El salto que promete más de lo que firma", age: 23, family: "market", months: [7, 8], seed: "SEED_ELITE_ROLE_BARGAIN", gates: [{ path: "reputation.marketHeat", op: "gte", value: 34 }] },
    { id: "EVT_23_CON_001", title: "El contrato que pone techo", age: 23, family: "contract", months: [7, 8, 9], seed: "SEED_CONTRACT_CEILING" },
    { id: "EVT_23_AGT_001", title: "Ya no llaman solo a tu agente", age: 23, family: "agent", months: [8, 9, 10], seed: "SEED_DIRECT_RECRUIT" },
    { id: "EVT_23_BODY_001", title: "El calendario ya pesa distinto", age: 23, family: "medical", months: [8, 9, 10, 11], seed: "SEED_LOAD_MANAGEMENT" },
    { id: "EVT_23_MONEY_001", title: "Invertir ya no es comprar", age: 23, family: "money", months: [8, 9, 10, 11], seed: "SEED_FAMILY_BUSINESS" },
    { id: "EVT_23_HOME_001", title: "Tu nombre en una pared", age: 23, family: "family", months: [9, 10, 11, 12], seed: "SEED_HOME_SYMBOL" },
    { id: "EVT_23_EUR_001", title: "La lista europea", age: 23, family: "sport", months: [8, 9, 1, 2], seed: "SEED_EURO_REGISTRATION", gates: [{ path: "flags.CONTINENTAL_CONTEXT", op: "eq", value: true }], common: [flag("CONTINENTAL_REGISTERED", true)], weight: 24 },
    { id: "EVT_23_LOCK_001", title: "Cúbreme diez minutos", age: 23, family: "team", months: [9, 10, 11, 12], read: ["SEED_TEAMMATE_COVER"] },
    { id: "EVT_23_MATCH_001", title: "El partido que cambia el radar", age: 23, family: "sport", months: [9, 10, 11, 2, 3, 4], verified: true, body: "Llega un partido de alto escaparate. El técnico te ofrece un rol muy conservador para neutralizar la banda rival, mientras tu agente asegura que habrá ojeadores y gente de selección.", labels: ["Ejecutar el plan al milímetro", "Pedir licencia para atacar tras recuperación", "Jugar el rol pero asumir más riesgos si el marcador lo permite", "Decir al técnico que tu mejor impacto es ofensivo"] },
    { id: "EVT_23_NAT_001", title: "La primera llamada", age: 23, family: "selection", months: [9, 10, 11, 3, 4, 5], seed: "SEED_FIRST_ABSOLUTE_CALL", gates: [{ path: "flags.NATIONAL_GATE_OPEN", op: "eq", value: true }], verified: true, body: "Álvaro Sanz te convoca por primera vez con la selección absoluta o te incluye como reserva inmediata. En la primera charla deja claro que no promete minutos.", labels: ["Aceptar cualquier rol y observar", "Preguntar qué necesitas para jugar", "Mantener perfil bajo y acercarte a los veteranos", "Pedir a tu agente que reduzca prensa y marcas durante la concentración"], common: [flag("NATIONAL_CALLED", true), set("professional.nationalRole", "fringe"), n("professional.nationalStanding", 8)] },
    { id: "EVT_23_PRS_001", title: "Decisión técnica", age: 23, family: "press", months: [10, 11, 12, 1, 2], read: ["SEED_FIRST_LEAK"], labels: ["Autorizar una filtración", "Pedir una reunión interna", "Decir públicamente que competirás sin dar detalles", "Guardar silencio tres partidos"] },
    { id: "EVT_23_CAP_001", title: "El capitán quiere una frase", age: 23, family: "captaincy", months: [10, 11, 12, 1, 2], verified: true, body: "El capitán critica en privado la planificación del club y pide a tres jugadores que, al pasar por zona mixta, repitan una idea: «la plantilla necesita ayuda».", labels: ["Repetir la frase", "Hablar de mejorar sin pedir fichajes", "Negarte a coordinar mensajes", "Pedir que el capitán lo plantee primero en reunión formal"] },
    { id: "EVT_23_MED_001", title: "Club o selección", age: 23, family: "medical", months: [10, 11, 3, 4], seed: "SEED_CLUB_NATIONAL_CONFLICT", gates: [{ path: "flags.NATIONAL_GATE_OPEN", op: "eq", value: true }], verified: true, body: "Tienes una sobrecarga pequeña antes de una ventana internacional. El club recomienda quedarte y recuperar; la selección puede evaluarte allí sin comprometerte a jugar.", labels: ["Viajar y dejar que selección decida", "Quedarte con el club", "Pedir pruebas externas y decidir con el resultado", "Viajar dejando claro que no aceptarás medicación para jugar"] },
    { id: "EVT_23_JAN_001", title: "Enero: seis meses para convencerles", age: 23, family: "market", months: [1], seed: "SEED_ELITE_ROLE_BARGAIN", verified: true, weight: 24, body: "Si juegas poco, aparece una cesión de seis meses con opción de compra; si juegas mucho, un club mayor ofrece ficharte y dejarte cedido donde estás hasta verano.", labels: ["Moverte ya", "Quedarte hasta verano", "Aceptar solo con las condiciones de propiedad que prefieres", "Usar la propuesta para renegociar tu rol actual"] },
    { id: "EVT_24_MKT_001", title: "Tres ofertas, ninguna completa", age: 24, family: "market", months: [7, 8], seed: "SEED_ELITE_ROLE_BARGAIN", gates: [{ path: "reputation.marketHeat", op: "gte", value: 38 }], verified: true, choiceEffects: [[n("professional.clubPrestigeTier", 1, 1, 5), n("professional.roleSecurity", -8)], [n("professional.roleSecurity", 8)], [set("professional.route", "abroad"), flag("ABROAD_ROUTE", true), n("professional.foreignAdaptation", 20)], [n("professional.contractPower", 6)]], body: "Tras una temporada fuerte llegan tres perfiles de oferta: un club mayor con rol incierto, un club parecido donde serías pieza central y un destino extranjero con mejor salario y competición continental.", labels: ["Elegir el mayor techo deportivo", "Elegir el rol más claro", "Elegir el proyecto extranjero", "Pedir tiempo para provocar una mejora y arriesgar las tres"] },
    { id: "EVT_24_CON_001", title: "Tus derechos de imagen", age: 24, family: "contract", months: [7, 8, 9], seed: "SEED_IMAGE_RIGHTS", verified: true, body: "Una renovación o fichaje incluye un aumento salarial importante si cedes al club parte del control comercial de tu imagen durante el contrato.", labels: ["Ceder el porcentaje por salario", "Mantener control y cobrar menos", "Ceder solo en campañas del club", "Pedir una prima variable si imagen supera un umbral"] },
    { id: "EVT_24_AGT_001", title: "Exclusividad mundial", age: 24, family: "agent", months: [7, 8, 9, 10], seed: "SEED_DIRECT_RECRUIT", gates: [{ path: "reputation.marketHeat", op: "gte", value: 42 }], verified: true, common: [flag("SUPER_AGENT", true)], body: "Samuel Ordóñez ofrece incorporarte a su agencia internacional. Promete acceso a clubes mayores, pero exige exclusividad amplia y una comisión superior.", labels: ["Cambiar a Ordóñez", "Renovar con tu agente actual", "Pedir al actual que iguale servicios, no comisión", "Negociar con Ordóñez exclusividad corta o limitada"] },
    { id: "EVT_24_IMG_001", title: "La campaña que quiere una promesa", age: 24, family: "image", months: [7, 8, 9], seed: "SEED_SPONSOR_IMAGE", gates: [{ path: "professional.commercialPower", op: "gte", value: 28 }], verified: true, body: "Una marca te ofrece una campaña nacional basada en la frase «voy a quedarme para hacer historia», mientras tu contrato todavía permite salir.", labels: ["Aceptar el lema", "Pedir un mensaje sin promesa de futuro", "Rechazar la campaña", "Aceptar solo si se publica tras cerrar mercado"] },
    { id: "EVT_24_LIFE_001", title: "Quién trabaja para ti", age: 24, family: "life", months: [8, 9, 10], seed: "SEED_PERSONAL_STAFF", verified: true, body: "Entre viajes, prensa y contratos necesitas ayuda para agenda y asuntos diarios. Dani quiere encargarse de parte; tu agencia ofrece un profesional; tu familia prefiere a alguien conocido.", labels: ["Contratar a Dani", "Elegir profesional de la agencia", "Contratar a un independiente", "Repartir tareas entre alguien cercano y un profesional"] },
    { id: "EVT_24_ABR_001", title: "Volver no es retroceder", age: 24, family: "market", months: [7, 8, 1], read: ["SEED_FOREIGN_ADAPT"], gates: [{ path: "flags.ABROAD_ROUTE", op: "eq", value: true }], verified: true, body: "Si llevas años fuera, aparece una oferta española de nivel similar. En el extranjero ya tienes rol y vida montada; volver mejora cercanía familiar y visibilidad doméstica.", labels: ["Volver", "Renovar fuera", "Esperar otra temporada", "Usar la oferta española para mejorar el contrato exterior"] },
    { id: "EVT_24_FREE_001", title: "La prima por llegar libre", age: 24, family: "contract", months: [7, 8, 1], seed: "SEED_CONTRACT_CEILING", gates: [{ path: "contract.monthsRemaining", op: "lte", value: 14 }], verified: true, body: "Si llegas libre o cerca de libertad, el nuevo club ofrece una prima alta, pero pide salario algo menor y contrato largo. Tu agente cobra parte de la prima." },
    { id: "EVT_24_CCH_001", title: "Han fichado al de 70 millones", age: 24, family: "tactical", months: [7, 8, 9], seed: "SEED_STAR_COMPETITION", gates: [{ path: "professional.clubPrestigeTier", op: "gte", value: 4 }], verified: true, body: "Un fichaje estrella ocupa tu posición o una zona cercana. El entrenador insiste en que «los buenos juegan», pero el club necesita justificar una inversión enorme.", common: [flag("STAR_COMPETITION", true)] },
    { id: "EVT_24_MATCH_001", title: "El penalti no tiene dueño", age: 24, family: "sport", months: [9, 10, 11, 2, 3], seed: "SEED_PENALTY_HIERARCHY", labels: ["Entregarle el balón", "Decir que lo tiras tú", "Preguntar al capitán o técnico desde el campo", "Proponer decidirlo con una regla rápida entre ambos"] },
    { id: "EVT_24_LOCK_001", title: "El chat privado", age: 24, family: "team", months: [10, 11, 12, 1], seed: "SEED_PRIVATE_CHAT", verified: true, body: "Un grupo de jugadores comenta de forma dura decisiones del entrenador en un chat privado. Tú puedes intervenir, leer sin escribir o salir. Semanas después existe riesgo de captura filtrada.", labels: ["Criticar también", "Intentar bajar el tono", "No escribir nada", "Salir del grupo"] },
    { id: "EVT_24_EUR_001", title: "El lateral no llega", age: 24, family: "sport", months: [2, 3, 4, 5], read: ["SEED_EURO_REGISTRATION"], gates: [{ path: "flags.CONTINENTAL_REGISTERED", op: "eq", value: true }], verified: true, body: "Antes de una eliminatoria continental, el lateral titular es baja. El técnico quiere usar un sistema en el que tú recorras toda la banda.", labels: ["Aceptar", "Aceptar con límite de minutos si sube la carga", "Proponer otro sistema que te mantenga arriba", "Aceptar el partido pero no fijar esa posición"] },
    { id: "EVT_24_NAT_001", title: "La lista de 26", age: 24, family: "selection", months: [3, 4, 5, 6], seed: "SEED_MAJOR_TOURNAMENT", gates: [{ path: "flags.NATIONAL_TOURNAMENT_CYCLE", op: "eq", value: true }], verified: true, body: "Se acerca un gran torneo internacional. Álvaro Sanz tiene más candidatos que plazas. Te convoca a la concentración previa, pero no garantiza la lista final.", labels: ["Mantener tu preparación habitual", "Subir carga para llegar en pico de forma", "Pedir al club que gestione minutos previos", "Hablar con Sanz para entender qué rol compites realmente"] },
    { id: "EVT_24_MED_001", title: "La final y el isquio", age: 24, family: "medical", months: [4, 5], seed: "SEED_BIG_MATCH_BODY", gates: [{ path: "flags.FINAL_CONTEXT", op: "eq", value: true }], verified: true, body: "Tienes una lesión muscular de bajo grado o una señal compatible con riesgo justo antes de una final o eliminatoria y, potencialmente, un torneo internacional cercano.", labels: ["No jugar", "Intentar llegar con tratamiento conservador y test final", "Aceptar analgesia permitida si el médico la considera segura", "Jugar solo si pasas una prueba funcional definida"] },
    { id: "EVT_24_PRS_001", title: "El precio que nadie pidió", age: 24, family: "press", months: [9, 10, 11, 12, 1], seed: "SEED_PUBLIC_CONTRACT", gates: [{ path: "reputation.marketHeat", op: "gte", value: 48 }], verified: true, body: "Un medio publica que tu club no escuchará ofertas por debajo de una cifra enorme. Nadie te había informado de ese precio.", labels: ["Preguntar internamente y no hablar", "Negar públicamente que exista precio acordado", "Autorizar a tu agente a decir que escucharías proyectos", "Llamar a Clara para intentar conocer la fuente"] },
    { id: "EVT_24_JAN_001", title: "El cheque imposible", age: 24, family: "money", months: [1], seed: "SEED_WEALTHY_EXIT", gates: [{ path: "reputation.marketHeat", op: "gte", value: 46 }], verified: true, choiceEffects: [[flag("WEALTHY_EXIT_ACCEPTED", true), n("contract.salaryMonthly", 26000, 0, 150000), n("professional.moneyComfort", 18), n("professional.roleSecurity", -9), n("professional.contractPower", -6)], [n("reputation.marketHeat", 4), n("professional.contractPower", 3)], [n("contract.salaryMonthly", 12000, 0, 150000), n("professional.contractPower", 4)], [n("contract.salaryMonthly", 7000, 0, 150000), n("professional.institutionalTrust", -4)]], body: "Un club de una liga menos prestigiosa pero financieramente poderosa ofrece triplicar o cuadruplicar tu salario en enero.", labels: ["Aceptar", "Rechazar para competir al máximo nivel", "Pedir contrato más corto o cláusula de retorno", "Usar la oferta para renovar o mejorar en tu club"] },
    { id: "EVT_25_TEAM_001", title: "El joven que viene detrás", age: 25, family: "team", months: [7, 8, 9], seed: "SEED_YOUNG_MENTOR", verified: true, body: "Un canterano de 18-19 años empieza a entrenar contigo y ocupa tu misma zona. Te admira, pero el club lo presenta como futuro activo estratégico.", labels: ["Ayudarle abiertamente", "Tratarlo como a cualquier competidor", "Darle consejos fuera de campo, no tácticos de tu posición", "Pedir a tu agente que averigüe por qué lo promocionan"] },
    { id: "EVT_25_CAP_001", title: "El brazalete", age: 25, family: "captaincy", months: [7, 8, 9, 10], seed: "SEED_CAPTAINCY_STYLE", gates: [{ path: "flags.CAPTAINCY_WINDOW", op: "eq", value: true }], verified: true, labels: ["Aceptar", "Rechazar para centrarte en jugar", "Aceptar como capitán secundario", "Pedir que el vestuario vote"] },
    { id: "EVT_25_TACT_001", title: "De extremo a interior", age: 25, family: "tactical", months: [8, 9, 10, 11], read: ["SEED_TACTICAL_SACRIFICE"], verified: true, body: "Un entrenador propone una reconversión más estable hacia interior o mediapunta de trabajo mixto porque tus datos físicos y lectura han cambiado.", labels: ["Abrazar la reconversión", "Probarla solo en ciertos partidos", "Rechazar y proteger rol ofensivo", "Aceptar mientras el agente sondea clubes que te quieran arriba"] },
    { id: "EVT_25_MED_001", title: "La molestia que vuelve", age: 25, family: "medical", months: [9, 10, 11, 12, 1, 2], seed: "SEED_CHRONIC_BODY", gates: [{ path: "professional.bodyLoad", op: "gte", value: 34 }], verified: true, body: "La misma zona muscular o articular empieza a dar avisos repetidos. No es una lesión catastrófica, pero ya existe patrón.", labels: ["Rediseñar entrenamiento", "Mantener rutina hasta una lesión clara", "Cambiar solo fuera de temporada", "Consultar otro especialista antes de tocar el plan"] },
    { id: "EVT_25_CON_001", title: "La renovación que define el siguiente pico", age: 25, family: "contract", months: [9, 10, 11, 12, 1], seed: "SEED_CONTRACT_CEILING", labels: ["Renovar ahora", "Esperar al verano", "Firmar solo con cláusula de salida razonable", "Acordar seguir negociando sin firmar"] },
    { id: "EVT_25_NAT_001", title: "Ser internacional no es tener sitio", age: 25, family: "selection", months: [9, 10, 11, 3, 4, 5], read: ["SEED_FIRST_ABSOLUTE_CALL"], gates: [{ path: "flags.NATIONAL_CALLED", op: "eq", value: true }] },
    { id: "EVT_25_AGT_001", title: "Enséñame la oferta", age: 25, family: "agent", months: [10, 11, 12, 1], seed: "SEED_AGENT_PROOF" },
    { id: "EVT_25_MKT_001", title: "La llamada directa", age: 25, family: "market", months: [1, 5, 6], seed: "SEED_DIRECT_RECRUIT", gates: [{ path: "reputation.marketHeat", op: "gte", value: 44 }] },
    { id: "EVT_25_FAM_001", title: "El negocio ya no es pequeño", age: 25, family: "family", months: [2, 3, 4, 5], seed: "SEED_FAMILY_BUSINESS", verified: true, body: "La inversión o proyecto familiar de años anteriores ha crecido, necesita capital adicional o atraviesa una mala fase. La cantidad solicitada ya no es simbólica.", labels: ["Aportar capital", "Prestar con contrato y calendario", "No poner más dinero", "Financiar solo si entra un gestor externo"] },
    { id: "EVT_25_END_001", title: "A los 26, ¿qué estás protegiendo?", age: 25, family: "legacy", months: [5, 6], seed: "SEED_AGE26_PRIORITY", verified: true, choiceEffects: [[set("world.nextCyclePriority", "ceiling")], [set("world.nextCyclePriority", "role")], [set("world.nextCyclePriority", "body_stability")], [set("world.nextCyclePriority", "freedom")]], body: "Al cerrar la tercera temporada del bloque, tu agente o persona de confianza te pide ordenar prioridades antes del siguiente contrato.", labels: ["Proteger techo deportivo", "Proteger minutos e identidad", "Proteger cuerpo y estabilidad", "Proteger libertad"] }
];
const familyFx = {
    market: [[n("reputation.marketHeat", 7), n("professional.roleSecurity", -4)], [n("professional.roleSecurity", 6), n("reputation.marketHeat", -1)], [n("professional.contractPower", 5), n("professional.environmentStability", -2)], [n("professional.contractPower", 4), n("professional.institutionalTrust", -3)]],
    contract: [[n("professional.contractPower", 7), n("professional.institutionalTrust", -3)], [n("professional.contractPower", 2), n("professional.institutionalTrust", 4)], [n("professional.contractPower", 5), n("professional.roleSecurity", -2)], [n("professional.institutionalTrust", 5), n("professional.contractPower", -2)]],
    agent: [[n("professional.agentControl", -7), n("professional.contractPower", 5)], [n("professional.agentControl", 5), n("professional.environmentStability", 2)], [n("professional.agentControl", 8), n("reputation.marketHeat", -2)], [n("professional.agentControl", 1), n("professional.contractPower", 3)]],
    medical: [[n("professional.bodyLoad", 7), n("sport.roleScore", 3)], [n("professional.bodyLoad", -6), n("professional.roleSecurity", -2)], [n("professional.bodyLoad", -3), n("professional.institutionalTrust", 3)], [n("body.risk", -3), n("professional.bodyLoad", -2)]],
    money: [[n("professional.moneyComfort", 10), n("professional.environmentStability", -2)], [n("professional.moneyComfort", 5), n("professional.environmentStability", 4)], [n("professional.moneyComfort", 2), n("professional.contractPower", 3)], [n("professional.moneyComfort", 4), n("professional.agentControl", 2)]],
    family: [[n("professional.environmentStability", 6), n("professional.moneyComfort", -2)], [n("professional.environmentStability", 4)], [n("professional.environmentStability", -2), n("professional.contractPower", 2)], [n("professional.environmentStability", 5), n("professional.moneyComfort", -1)]],
    sport: [[n("professional.continentalCred", 7), n("professional.bodyLoad", 4)], [n("professional.continentalCred", 4), n("professional.bodyLoad", 1)], [n("sport.roleScore", 5), n("professional.bodyLoad", 3)], [n("professional.roleSecurity", 4), n("professional.continentalCred", 2)]],
    selection: [[n("professional.nationalStanding", 8), n("professional.bodyLoad", 3)], [n("professional.nationalStanding", 5), n("professional.environmentStability", 2)], [n("professional.nationalStanding", 4), n("professional.commercialPower", 2)], [n("professional.nationalStanding", 3), n("professional.agentControl", 2)]],
    press: [[n("reputation.mediaHeat", 8), n("professional.publicPolarization", 5)], [n("professional.institutionalTrust", 3), n("reputation.mediaHeat", 2)], [n("professional.contractPower", 3), n("professional.publicPolarization", 2)], [n("reputation.mediaHeat", 4), n("professional.commercialPower", 2)]],
    image: [[n("professional.commercialPower", 9), n("professional.publicPolarization", 4)], [n("professional.commercialPower", 5), n("professional.publicPolarization", -1)], [n("professional.commercialPower", -2), n("professional.environmentStability", 2)], [n("professional.commercialPower", 6), n("professional.contractPower", 2)]],
    life: [[n("professional.environmentStability", 4), n("professional.commercialPower", 2)], [n("professional.agentControl", -3), n("professional.environmentStability", 3)], [n("professional.agentControl", 5), n("professional.environmentStability", 2)], [n("professional.environmentStability", 5), n("professional.moneyComfort", -1)]],
    team: [[n("professional.lockerPower", 6), n("professional.environmentStability", -2)], [n("professional.lockerPower", 3), n("professional.environmentStability", 4)], [n("professional.roleSecurity", 4), n("professional.lockerPower", -1)], [n("professional.lockerPower", 4), n("professional.institutionalTrust", 2)]],
    captaincy: [[n("professional.lockerPower", 8), n("professional.publicPolarization", 2)], [n("professional.lockerPower", 2), n("professional.environmentStability", 4)], [n("professional.lockerPower", 5), n("professional.institutionalTrust", -2)], [n("professional.lockerPower", 6), n("professional.environmentStability", 1)]],
    tactical: [[n("sport.roleScore", 5), n("professional.bodyLoad", 2)], [n("professional.roleSecurity", 5), n("professional.continentalCred", 2)], [n("reputation.marketHeat", 5), n("professional.roleSecurity", -3)], [n("professional.contractPower", 3), n("sport.roleScore", 2)]],
    legacy: [[n("professional.contractPower", 3), n("reputation.prestige", 3)], [n("professional.roleSecurity", 4), n("professional.environmentStability", 2)], [n("professional.bodyLoad", -3), n("professional.environmentStability", 4)], [n("professional.contractPower", 5), n("professional.agentControl", 4)]]
};
function make(r) {
    const fx = familyFx[r.family] ?? familyFx.legacy;
    const labels = r.labels ?? ["Tomar la iniciativa", "Esperar y reunir información", "Proteger tu posición", "Buscar una solución intermedia"];
    const common = r.common ?? [];
    const choiceExtra = r.choiceEffects ?? [[], [], [], []];
    const cs = labels.map((label, i) => ({ id: String.fromCharCode(65 + i), label, intentTags: [["ceiling"], ["patience"], ["control"], ["balance"]][i], primaryMessage: ["La decisión abre una oportunidad sin eliminar sus costes.", "La espera mejora una parte de la información, pero consume tiempo.", "Proteges una dimensión de la carrera y aceptas perder margen en otra.", "Mantienes varias puertas abiertas, a cambio de una postura menos nítida."][i], secondaryMessage: ["El mismo movimiento produce una lectura menos favorable de la esperada.", "Mientras esperas, un tercero mueve primero.", "La protección funciona, pero cambia cómo te leen club, mercado o vestuario.", "El compromiso reduce el conflicto inmediato sin resolver toda la tensión."][i], immediateEffects: [...common, ...choiceExtra[i]], primaryEffects: fx[i], secondaryEffects: [...fx[i], n("professional.environmentStability", i === 1 ? 1 : -1)], primarySeedTransitions: r.seed ? [seedCreate(r.seed, 54, { choice: String.fromCharCode(65 + i) })] : undefined, secondarySeedTransitions: r.seed ? [seedCreate(r.seed, 46, { choice: String.fromCharCode(65 + i) })] : undefined }));
    return ambiguousEvent({ id: r.id, ageWindow: [r.age, r.age], phase: "23_26", family: r.family, title: r.title, body: r.body ?? "La etapa adulta de la carrera enfrenta objetivos compatibles en teoría, pero difíciles de conservar a la vez.", visible: ["Conoces las condiciones formales y tu situación deportiva actual."], uncertain: ["No conoces la agenda completa de terceros ni cómo evolucionará el contexto."], choices: cs, gates: r.gates, timeWindow: { months: r.months }, weight: r.weight ?? (r.id === "EVT_25_END_001" ? 96 : r.id === "EVT_23_BRIDGE_001" ? 28 : 12), cooldown: 99999, seedsRead: r.read, seedsWrite: r.seed ? [r.seed] : undefined, tags: [r.family, r.age === 25 ? "transition26" : "adult_consolidation"], canonStatus: r.verified ? "verified" : "technical_adaptation" });
}
var PRINCIPAL_EVENTS_23_26 = rows.map(make);


// ═══ content/events/23_26/conditional-events.js ═══
const rows = [
    { id: "CEVT_23_RIVAS_02", title: "Rivas firma la recomendación", age: [23, 25], gates: [{ path: "flags.HAS_SEED_RIVAS_TRUST", op: "eq", value: true }] },
    { id: "CEVT_23_MENA_02", title: "Mena enfrente", age: [23, 25], gates: [{ path: "flags.HAS_SEED_MENA_EARLY_READ", op: "eq", value: true }, { path: "flags.HIGH_PROFILE_MATCH", op: "eq", value: true }] },
    { id: "CEVT_23_VELA_02", title: "El curso de Vela", age: [23, 25], gates: [{ path: "flags.HAS_SEED_VELA_STANCE", op: "eq", value: true }] },
    { id: "CEVT_23_BRUNO_03", title: "Bruno necesita club", age: [23, 25], gates: [{ path: "flags.HAS_SEED_BRUNO_FAVOR", op: "eq", value: true }] },
    { id: "CEVT_23_ADR_03", title: "Los dos en la absoluta", age: [23, 25], gates: [{ path: "flags.HAS_SEED_ADRIAN_MIRROR", op: "eq", value: true }, { path: "flags.NATIONAL_CALLED", op: "eq", value: true }] },
    { id: "CEVT_23_NANO_02", title: "Nano te pide que no llames", age: [23, 25], gates: [{ path: "flags.HAS_SEED_NANO_SHADOW", op: "eq", value: true }] },
    { id: "CEVT_23_CLARA_03", title: "La exclusiva antes de la lista", age: [23, 25], gates: [{ path: "flags.HAS_SEED_CLARA_CHANNEL", op: "eq", value: true }, { path: "flags.NATIONAL_GATE_OPEN", op: "eq", value: true }] },
    { id: "CEVT_23_AGENT_03", title: "El otro agente llama a tu familia", age: [23, 25], gates: [{ path: "flags.HAS_SEED_FIRST_AGENT", op: "eq", value: true }, { path: "professional.commercialPower", op: "gte", value: 24 }] },
    { id: "CEVT_23_MED_02", title: "Paula pide todos los informes", age: [23, 25], gates: [{ path: "flags.HAS_SEED_PHYSIO_CONFIDENCE", op: "eq", value: true }, { path: "professional.bodyLoad", op: "gte", value: 28 }] },
    { id: "CEVT_23_UDV_02", title: "UDV elimina a un grande", age: [23, 25], gates: [{ path: "flags.HAS_SEED_HOME_DISTANCE", op: "eq", value: true }] },
    { id: "CEVT_24_CHAT_01", title: "La captura existe", age: [24, 25], gates: [{ path: "flags.HAS_SEED_PRIVATE_CHAT", op: "eq", value: true }] },
    { id: "CEVT_24_TOURN_01", title: "Entraste por una lesión", age: [24, 25], months: [4, 5, 6], gates: [{ path: "flags.NATIONAL_CALLED", op: "eq", value: true }, { path: "professional.nationalStanding", op: "gte", value: 32 }] },
    { id: "CEVT_24_TOURN_02", title: "Te quedaste fuera por uno", age: [24, 25], months: [4, 5, 6], gates: [{ path: "flags.NATIONAL_CALLED", op: "eq", value: true }, { path: "professional.nationalStanding", op: "gte", value: 35 }] },
    { id: "CEVT_24_OWNER_02", title: "El propietario quiere una estrella", age: [24, 25], gates: [{ path: "flags.CLUB_OWNER_CHANGE", op: "eq", value: true }] },
    { id: "CEVT_24_SPONSOR_02", title: "La campaña envejeció mal", age: [24, 25], gates: [{ path: "flags.HAS_SEED_SPONSOR_IMAGE", op: "eq", value: true }, { path: "professional.commercialPower", op: "gte", value: 38 }] },
    { id: "CEVT_24_FAM_02", title: "El negocio pierde dinero", age: [24, 25], gates: [{ path: "flags.HAS_SEED_FAMILY_BUSINESS", op: "eq", value: true }] },
    { id: "CEVT_25_STAR_01", title: "El fichaje estrella se lesiona", age: [25, 25], gates: [{ path: "flags.STAR_COMPETITION", op: "eq", value: true }, { path: "sport.roleScore", op: "lt", value: 78 }] },
    { id: "CEVT_25_AGENT_04", title: "Ordóñez sí tenía club", age: [25, 25], gates: [{ path: "flags.SUPER_AGENT", op: "eq", value: true }] },
    { id: "CEVT_25_BODY_02", title: "Recaída sin culpable", age: [25, 25], gates: [{ path: "professional.bodyLoad", op: "gte", value: 50 }, { path: "flags.HAS_SEED_LOAD_MANAGEMENT", op: "eq", value: true }] },
    { id: "CEVT_25_SHOCK_02", title: "El entrenador cae antes de la final", age: [25, 25], months: [4, 5], gates: [{ path: "flags.FINAL_CONTEXT", op: "eq", value: true }] }
];
const fx = [[n("professional.contractPower", 3), n("professional.publicPolarization", 2)], [n("professional.environmentStability", 4), n("professional.institutionalTrust", 2)], [n("professional.agentControl", 3), n("reputation.mediaHeat", 2)]];
function make(r) {
    return ambiguousEvent({ id: r.id, ageWindow: r.age, phase: "23_26", family: "conditional", title: r.title, body: "Una causa previa de la carrera reaparece bajo un contexto adulto distinto. El callback solo existe porque el guardado conserva esa memoria.", visible: ["Reconoces la causa o relación que ha traído esta situación hasta el presente."], uncertain: ["No sabes cuánto ha cambiado la otra parte ni qué habría ocurrido sin intervenir."], gates: r.gates, timeWindow: r.months ? { months: r.months } : undefined, weight: 11, cooldown: 99999, choices: [
            { id: "A", label: "Intervenir directamente", intentTags: ["direct"], primaryMessage: "La intervención mueve el conflicto, pero no determina su lectura final.", secondaryMessage: "Intervenir expone más de lo previsto.", primaryEffects: fx[0], secondaryEffects: [...fx[0], n("professional.environmentStability", -2)] },
            { id: "B", label: "Mantener distancia", intentTags: ["distance"], primaryMessage: "La distancia conserva margen y deja actuar a terceros.", secondaryMessage: "No actuar también es interpretado por el entorno.", primaryEffects: fx[1], secondaryEffects: [...fx[1], n("professional.contractPower", -1)] },
            { id: "C", label: "Usar un canal intermedio", intentTags: ["channel"], primaryMessage: "El canal intermedio reduce fricción directa.", secondaryMessage: "Introducir otro actor cambia los incentivos del problema.", primaryEffects: fx[2], secondaryEffects: [...fx[2], n("professional.publicPolarization", 2)] }
        ], tags: ["conditional", "causal_callback", "adult"], canonStatus: "technical_adaptation" });
}
var CONDITIONAL_EVENTS_23_26 = rows.map(make);


// ═══ content/events/23_26/index.js ═══
var EVENTS_23_26 = [...PRINCIPAL_EVENTS_23_26, ...CONDITIONAL_EVENTS_23_26];


// ═══ content/events/26_30/principal-events.js ═══
const rows = [
    { id: "EVT_26_IDN_001", title: "Ahora te compran por lo que ya eres", age: 26, family: "legacy", months: [7, 8], seed: "SEED_PEAK_IDENTITY", verified: true },
    { id: "EVT_26_MKT_001", title: "Quieren construir alrededor de ti", age: 26, family: "market", months: [7, 8], seed: "SEED_SHADOW_ESCAPE", read: ["SEED_ELITE_ROLE_BARGAIN"], verified: true, gates: [{ path: "reputation.marketHeat", op: "gte", value: 42 }] },
    { id: "EVT_26_CLB_001", title: "Ser la cara del proyecto", age: 26, family: "team", months: [7, 8, 9], seed: "SEED_PROJECT_FACE", seedChoices: ["A", "B", "D"], gates: [{ path: "professional.clubPrestigeTier", op: "gte", value: 3 }] },
    { id: "EVT_26_CON_001", title: "El contrato del pico", age: 26, family: "contract", months: [7, 8, 9], seed: "SEED_PEAK_CONTRACT" },
    { id: "EVT_26_IMG_001", title: "Tu nombre fuera del fútbol", age: 26, family: "image", months: [8, 9, 10], seed: "SEED_GLOBAL_IMAGE", gates: [{ path: "professional.commercialPower", op: "gte", value: 35 }] },
    { id: "EVT_26_BODY_001", title: "Optimizarlo todo", age: 26, family: "medical", months: [8, 9, 10, 11], seed: "SEED_SELF_OPTIMIZATION" },
    { id: "EVT_26_TEAM_001", title: "El chico que han fichado para tu sitio", age: 26, family: "team", months: [8, 9, 10, 11], seed: "SEED_YOUNG_SUCCESSOR" },
    { id: "EVT_26_NAT_001", title: "Club, selección y descanso", age: 26, family: "selection", months: [9, 10, 11, 3, 4, 5], seed: "SEED_INTERNATIONAL_LOAD", gates: [{ path: "flags.NATIONAL_CALLED", op: "eq", value: true }] },
    { id: "EVT_26_HOME_001", title: "UDV quiere algo más que una foto", age: 26, family: "family", months: [9, 10, 11, 12], seed: "SEED_HOME_INSTITUTION" },
    { id: "EVT_26_EUR_001", title: "Europa ya no es una novedad", age: 26, family: "sport", months: [9, 10, 11, 2, 3, 4], read: ["SEED_EURO_REGISTRATION"], gates: [{ path: "flags.CONTINENTAL_REGISTERED", op: "eq", value: true }] },
    { id: "EVT_26_AGT_001", title: "Tu agente ya no es el único teléfono", age: 26, family: "agent", months: [10, 11, 12, 1], read: ["SEED_DIRECT_RECRUIT"], gates: [{ path: "reputation.marketHeat", op: "gte", value: 45 }] },
    { id: "EVT_26_PRS_001", title: "La entrevista del pico", age: 26, family: "press", months: [10, 11, 12, 1, 2], gates: [{ path: "reputation.mediaHeat", op: "gte", value: 30 }] },
    { id: "EVT_26_JAN_001", title: "Enero: comprar tu siguiente versión", age: 26, family: "market", months: [1], gates: [{ path: "world.marketWindowOpen", op: "eq", value: true }] },
    { id: "EVT_27_REC_001", title: "El récord empieza a estar cerca", age: 27, family: "legacy", months: [7, 8, 9], seed: "SEED_RECORD_CHASE" },
    { id: "EVT_27_LOCK_001", title: "El vestuario te mira antes de hablar", age: 27, family: "captaincy", months: [7, 8, 9, 10], seed: "SEED_LOCKER_ENDORSEMENT", gates: [{ path: "professional.lockerPower", op: "gte", value: 45 }] },
    { id: "EVT_27_BODY_001", title: "Descansar cuando mejor estás", age: 27, family: "medical", months: [8, 9, 10, 11], seed: "SEED_PEAK_LOAD" },
    { id: "EVT_27_PRS_001", title: "El documental", age: 27, family: "press", months: [8, 9, 10, 11], seed: "SEED_DOCUMENTARY_ACCESS", gates: [{ path: "professional.publicMyth", op: "gte", value: 35 }] },
    { id: "EVT_27_AGT_001", title: "Tu agencia gana más si te mueves", age: 27, family: "agent", months: [8, 9, 10, 1], seed: "SEED_AGENT_CONFLICT_PEAK", gates: [{ path: "reputation.marketHeat", op: "gte", value: 50 }] },
    { id: "EVT_27_RIV_001", title: "Otra vez comparados", age: 27, family: "press", months: [9, 10, 11, 12], seed: "SEED_PUBLIC_RIVALRY", read: ["SEED_ADRIAN_MIRROR"] },
    { id: "EVT_27_MENT_001", title: "¿Qué le dirías al de 19?", age: 27, family: "team", months: [9, 10, 11, 12], seed: "SEED_MENTOR_ADVICE" },
    { id: "EVT_27_NAT_001", title: "Tu sitio en la selección ya pesa", age: 27, family: "selection", months: [9, 10, 11, 3, 4, 5], seed: "SEED_NATIONAL_ROLE", gates: [{ path: "professional.nationalCaps", op: "gte", value: 2 }] },
    { id: "EVT_27_MED_001", title: "La final y el isquio", age: 27, family: "medical", months: [4, 5], read: ["SEED_BIG_MATCH_BODY"], gates: [{ path: "flags.FINAL_CONTEXT", op: "eq", value: true }, { path: "professional.bodyLoad", op: "gte", value: 30 }], verified: true, weight: 22 },
    { id: "EVT_27_FINAL_001", title: "La final empieza en el banquillo", age: 27, family: "sport", months: [4, 5], seed: "SEED_BIG_GAME_BENCH", gates: [{ path: "flags.FINAL_CONTEXT", op: "eq", value: true }, { path: "sport.roleScore", op: "lt", value: 72 }], verified: true, weight: 24 },
    { id: "EVT_27_MKT_001", title: "Una oferta que cambia tu escala", age: 27, family: "market", months: [1, 5, 6], weight: 18, gates: [{ path: "reputation.marketHeat", op: "gte", value: 55 }] },
    { id: "EVT_27_TACT_001", title: "Cambiar para seguir arriba", age: 27, family: "tactical", months: [2, 3, 4], verified: true },
    { id: "EVT_27_MONEY_001", title: "El patrimonio ya necesita estructura", age: 27, family: "money", months: [2, 3, 4, 5] },
    { id: "EVT_28_MKT_001", title: "El mega-traspaso", age: 28, family: "market", months: [7, 8], seed: "SEED_MEGA_TRANSFER", gates: [{ path: "reputation.marketHeat", op: "gte", value: 58 }] },
    { id: "EVT_28_PRS_001", title: "La presión pública para salir", age: 28, family: "press", months: [7, 8, 9], seed: "SEED_PUBLIC_EXIT_PRESSURE", gates: [{ path: "professional.careerControl", op: "gte", value: 45 }] },
    { id: "EVT_28_MONEY_001", title: "Tu dinero ya es una empresa", age: 28, family: "money", months: [7, 8, 9], seed: "SEED_WEALTH_STRUCTURE" },
    { id: "EVT_28_HOME_001", title: "Entrar en UDV sin volver", age: 28, family: "family", months: [8, 9, 10], seed: "SEED_HOME_OWNERSHIP" },
    { id: "EVT_28_IMG_001", title: "Tu marca ya no quiere llevar el escudo", age: 28, family: "image", months: [8, 9, 10], seed: "SEED_PERSONAL_BRAND_INDEPENDENCE", gates: [{ path: "professional.commercialPower", op: "gte", value: 45 }] },
    { id: "EVT_28_TEAM_001", title: "Dos estrellas, un foco", age: 28, family: "team", months: [8, 9, 10, 11], seed: "SEED_SECOND_STAR", gates: [{ path: "professional.clubPrestigeTier", op: "gte", value: 4 }] },
    { id: "EVT_28_TACT_001", title: "Tu nueva posición", age: 28, family: "tactical", months: [9, 10, 11, 12], seed: "SEED_POSITIONAL_REINVENTION", seedChoices: ["A", "B"], labels: ["Aceptar la reconversión completa", "Adaptarte solo en determinados partidos", "Defender tu posición habitual", "Probar el cambio antes de comprometerte"] },
    { id: "EVT_28_GALA_001", title: "La gala", age: 28, family: "image", months: [10, 11, 12], seed: "SEED_GLOBAL_AWARD_BEHAVIOR", gates: [{ path: "professional.peakStatus", op: "gte", value: 58 }, { path: "professional.publicMyth", op: "gte", value: 45 }], verified: true },
    { id: "EVT_28_NAT_001", title: "La lista de 26", age: 28, family: "selection", months: [5, 6], read: ["SEED_MAJOR_TOURNAMENT"], gates: [{ path: "flags.NATIONAL_TOURNAMENT_CYCLE", op: "eq", value: true }, { path: "professional.nationalStanding", op: "gte", value: 45 }], verified: true },
    { id: "EVT_28_FINAL_001", title: "Una final no garantiza protagonismo", age: 28, family: "sport", months: [4, 5], seed: "SEED_FINAL_BENCH", gates: [{ path: "flags.FINAL_CONTEXT", op: "eq", value: true }], weight: 22 },
    { id: "EVT_28_CON_001", title: "El último contrato realmente largo", age: 28, family: "contract", months: [7, 8, 9, 1] },
    { id: "EVT_28_BODY_001", title: "La recuperación tarda un día más", age: 28, family: "medical", months: [10, 11, 12, 1, 2], gates: [{ path: "professional.bodyLoad", op: "gte", value: 38 }] },
    { id: "EVT_28_JAN_001", title: "El invierno del segundo gran proyecto", age: 28, family: "market", months: [1], weight: 20, gates: [{ path: "world.marketWindowOpen", op: "eq", value: true }] },
    { id: "EVT_29_CCH_001", title: "El entrenador y tu poder", age: 29, family: "captaincy", months: [7, 8, 9], seed: "SEED_MANAGER_POWER", gates: [{ path: "professional.institutionalPower", op: "gte", value: 48 }] },
    { id: "EVT_29_FAN_001", title: "El estadio ya no está de acuerdo contigo", age: 29, family: "press", months: [7, 8, 9, 10], seed: "SEED_FAN_FRACTURE", gates: [{ path: "reputation.mediaHeat", op: "gte", value: 38 }] },
    { id: "EVT_29_MED_001", title: "Operarte ahora o convivir con ello", age: 29, family: "medical", months: [8, 9, 10, 11], seed: "SEED_SURGERY_TIMING", gates: [{ path: "professional.bodyLoad", op: "gte", value: 45 }] },
    { id: "EVT_29_NAT_001", title: "El brazalete de la selección", age: 29, family: "selection", months: [9, 10, 11, 3, 4], seed: "SEED_NATIONAL_CAPTAINCY", gates: [{ path: "professional.nationalPower", op: "gte", value: 55 }] },
    { id: "EVT_29_EUR_001", title: "Sacrificar números para ganar", age: 29, family: "sport", months: [2, 3, 4, 5], seed: "SEED_ELITE_SACRIFICE", gates: [{ path: "flags.CONTINENTAL_CONTEXT", op: "eq", value: true }] },
    { id: "EVT_29_REC_001", title: "El récord y el mal día del equipo", age: 29, family: "legacy", months: [2, 3, 4, 5], seed: "SEED_RECORD_PUBLIC_TONE" },
    { id: "EVT_29_MKT_001", title: "La oferta financieramente absurda", age: 29, family: "market", months: [7, 8, 1], seed: "SEED_WEALTHY_PEAK_EXIT", seedChoices: ["A"], labels: ["Aceptar el contrato y salir del máximo escaparate", "Rechazarlo para mantener el nivel competitivo", "Negociar una estructura que preserve una salida futura", "No cerrar nada todavía"], gates: [{ path: "reputation.marketHeat", op: "gte", value: 55 }], verified: true },
    { id: "EVT_29_HOME_001", title: "Volver antes de que sea una despedida", age: 29, family: "family", months: [7, 8, 1, 5], seed: "SEED_EARLY_HOME_RETURN", seedChoices: ["A"], read: ["SEED_HOME_INSTITUTION"], gates: [{ path: "flags.HAS_SEED_HOME_INSTITUTION", op: "eq", value: true }], labels: ["Volver ahora mientras todavía puedes competir arriba", "Aplazar el regreso un año", "Abrir conversaciones sin comprometerte", "Descartar el regreso deportivo por ahora"], choiceEffects: [[set("professional.route", "home"), set("professional.ownerClub", "UDV"), set("professional.registrationClub", "UDV"), set("club", "UDV")], [], [], []] },
    { id: "EVT_29_FORM_001", title: "Tu primer bajón que no dura dos semanas", age: 29, family: "sport", months: [10, 11, 12, 1, 2], seed: "SEED_FIRST_PEAK_DIP", gates: [{ path: "sport.form", op: "lt", value: 58 }] },
    { id: "EVT_29_PRS_001", title: "Clara pregunta por el vestuario", age: 29, family: "press", months: [10, 11, 12, 1], read: ["SEED_PRIVATE_CHAT"], verified: true },
    { id: "EVT_29_CON_001", title: "El último contrato máximo", age: 29, family: "contract", months: [1, 2, 3], verified: true },
    { id: "EVT_29_FIN_001", title: "A los 30, ¿qué estás protegiendo ahora?", age: 29, family: "legacy", months: [5, 6], seed: "SEED_AGE30_PRIORITY", verified: true, weight: 26, tags: ["hard_deadline"], choiceEffects: [[set("world.age30Priority", "legacy")], [set("world.age30Priority", "minutes")], [set("world.age30Priority", "body")], [set("world.age30Priority", "freedom")]] }
];
const familyFx = {
    market: [[n("reputation.marketHeat", 6), n("professional.careerControl", -2)], [n("professional.careerControl", 5), n("professional.roleSecurity", 2)], [n("professional.clubPrestigeTier", 1, 1, 5), n("professional.roleSecurity", -5)], [n("professional.contractPower", 5), n("professional.institutionalTrust", -3)]],
    contract: [[n("professional.contractPower", 7), n("professional.careerControl", 4)], [n("professional.roleSecurity", 6), n("professional.careerControl", -2)], [n("professional.careerControl", 7), n("professional.institutionalTrust", -3)], [n("professional.moneyComfort", 6), n("professional.contractPower", -2)]],
    medical: [[n("professional.bodyLoad", 5), n("sport.roleScore", 3)], [n("professional.recoveryMargin", 6), n("sport.roleScore", -2)], [n("professional.recoveryMargin", 3), n("professional.bodyLoad", -3)], [n("professional.roleAdaptability", 3), n("professional.recoveryMargin", 2)]],
    selection: [[n("professional.nationalPower", 6), n("professional.bodyLoad", 3)], [n("professional.nationalPower", 3), n("professional.recoveryMargin", 2)], [n("professional.nationalStanding", 5), n("professional.publicMyth", 2)], [n("professional.nationalPower", 2), n("professional.careerControl", 2)]],
    sport: [[n("professional.peakStatus", 6), n("professional.bodyLoad", 3)], [n("professional.trophyCapital", 5), n("professional.peakStatus", 2)], [n("sport.roleScore", 5), n("professional.recoveryMargin", -2)], [n("professional.careerControl", 3), n("professional.trophyCapital", 2)]],
    team: [[n("professional.institutionalPower", 6), n("professional.successionPressure", 3)], [n("professional.institutionalPower", 3), n("professional.environmentStability", 4)], [n("professional.successionPressure", -3), n("professional.roleAdaptability", 3)], [n("professional.careerControl", 3), n("professional.institutionalTrust", 2)]],
    captaincy: [[n("professional.institutionalPower", 7), n("professional.publicMyth", 2)], [n("professional.institutionalPower", 3), n("professional.environmentStability", 4)], [n("professional.careerControl", 4), n("professional.institutionalTrust", -2)], [n("professional.institutionalPower", 4), n("professional.careerControl", 2)]],
    press: [[n("reputation.mediaHeat", 7), n("professional.publicMyth", 5), n("professional.publicPolarization", 3)], [n("professional.publicMyth", 2), n("professional.institutionalTrust", 3)], [n("professional.careerControl", 4), n("professional.publicPolarization", 2)], [n("professional.publicMyth", 4), n("professional.commercialPower", 3)]],
    image: [[n("professional.publicMyth", 7), n("professional.commercialPower", 6)], [n("professional.commercialPower", 4), n("professional.publicPolarization", -2)], [n("professional.careerControl", 4), n("professional.commercialPower", -2)], [n("professional.commercialPower", 5), n("professional.careerControl", 3)]],
    tactical: [[n("professional.roleAdaptability", 7), n("sport.roleScore", 2)], [n("professional.roleAdaptability", 4), n("professional.roleSecurity", 3)], [n("sport.roleScore", 4), n("professional.roleAdaptability", -2)], [n("professional.roleAdaptability", 5), n("professional.careerControl", 2)]],
    money: [[n("professional.moneyComfort", 8), n("professional.careerControl", 2)], [n("professional.moneyComfort", 5), n("professional.environmentStability", 3)], [n("professional.careerControl", 4), n("professional.moneyComfort", 2)], [n("professional.moneyComfort", 4), n("professional.publicMyth", 2)]],
    family: [[n("professional.environmentStability", 6), n("professional.publicMyth", 2)], [n("professional.careerControl", 3), n("professional.environmentStability", 3)], [n("professional.moneyComfort", -2), n("professional.environmentStability", 5)], [n("professional.publicMyth", 3), n("professional.careerControl", 2)]],
    legacy: [[n("professional.publicMyth", 5), n("professional.trophyCapital", 2)], [n("professional.careerControl", 5), n("professional.peakStatus", 1)], [n("professional.recoveryMargin", 4), n("professional.publicMyth", 1)], [n("professional.contractPower", 4), n("professional.careerControl", 4)]],
    agent: [[n("professional.agentControl", -5), n("professional.contractPower", 5)], [n("professional.agentControl", 5), n("professional.careerControl", 2)], [n("professional.agentControl", 8), n("reputation.marketHeat", -2)], [n("professional.agentControl", 2), n("professional.contractPower", 3)]]
};
function make(r) {
    const fx = familyFx[r.family] ?? familyFx.legacy;
    const labels = r.labels ?? ["Apostar por el máximo techo", "Proteger la posición actual", "Ganar control aunque pierdas algo de techo", "Mantener varias puertas abiertas"];
    const choiceExtra = r.choiceEffects ?? [[], [], [], []];
    const choices = labels.map((label, i) => ({ id: String.fromCharCode(65 + i), label, intentTags: [["ceiling"], ["stability"], ["control"], ["balance"]][i], primaryMessage: ["El movimiento funciona, pero eleva también las expectativas.", "La estabilidad protege una parte de la carrera sin congelar el entorno.", "Ganas margen de decisión a costa de otra ventaja inmediata.", "El compromiso mantiene opciones abiertas, aunque nadie obtiene exactamente lo que quería."][i], secondaryMessage: ["El techo prometido resulta menos controlable de lo esperado.", "Mientras proteges estabilidad, el contexto cambia alrededor.", "El control adicional tiene un coste deportivo o relacional.", "La solución intermedia aplaza parte del conflicto en lugar de resolverlo."][i], immediateEffects: choiceExtra[i], primaryEffects: fx[i], secondaryEffects: [...fx[i], n("professional.environmentStability", i === 1 ? 1 : -1)], primarySeedTransitions: r.seed && (!r.seedChoices || r.seedChoices.includes(String.fromCharCode(65 + i))) ? [seedCreate(r.seed, 55, { choice: String.fromCharCode(65 + i) })] : undefined, secondarySeedTransitions: r.seed && (!r.seedChoices || r.seedChoices.includes(String.fromCharCode(65 + i))) ? [seedCreate(r.seed, 45, { choice: String.fromCharCode(65 + i) })] : undefined }));
    return ambiguousEvent({ id: r.id, ageWindow: [r.age, r.age], phase: "26_30", family: r.family, title: r.title, body: "En la cima o cerca de ella, prestigio, títulos, dinero, minutos y control ya no avanzan necesariamente juntos.", visible: ["Conoces tu rol, contrato y contexto competitivo inmediato."], uncertain: ["No conoces por completo las prioridades de club, mercado, selección o entorno."], choices, gates: r.gates, timeWindow: { months: r.months }, weight: r.weight ?? 13, cooldown: 99999, seedsRead: r.read, seedsWrite: r.seed ? [r.seed] : undefined, tags: [r.family, "peak", ...(r.tags ?? [])], canonStatus: r.verified ? "verified" : "technical_adaptation" });
}
var PRINCIPAL_EVENTS_26_30 = rows.map(make);


// ═══ content/events/26_30/conditional-events.js ═══
const rows = [
    { id: "CEVT_26_RIVAS_01", title: "Rivas vuelve con poder", age: 26, months: [7, 8, 9, 10], gates: [{ path: "flags.HAS_SEED_RIVAS_TRUST", op: "eq", value: true }], read: ["SEED_RIVAS_TRUST"] },
    { id: "CEVT_26_ELITE_01", title: "El club ficha a otro nombre", age: 26, months: [7, 8, 9], gates: [{ path: "professional.clubPrestigeTier", op: "gte", value: 4 }, { path: "sport.roleScore", op: "gte", value: 55 }] },
    { id: "CEVT_26_BODY_01", title: "La carga de dos calendarios", age: 26, months: [9, 10, 11, 3, 4], gates: [{ path: "flags.NATIONAL_CALLED", op: "eq", value: true }, { path: "professional.bodyLoad", op: "gte", value: 42 }] },
    { id: "CEVT_26_HOME_01", title: "Un niño lleva tu dorsal en Valdoria", age: 26, months: [10, 11, 12], gates: [{ path: "flags.HAS_SEED_HOME_SYMBOL", op: "eq", value: true }], read: ["SEED_HOME_SYMBOL"] },
    { id: "CEVT_26_AGENT_01", title: "Dos agencias cuentan versiones distintas", age: 26, months: [11, 12, 1], gates: [{ path: "flags.HAS_SEED_AGENT_PROOF", op: "eq", value: true }], read: ["SEED_AGENT_PROOF"] },
    { id: "CEVT_26_EUR_01", title: "Te dejan fuera de un partido europeo", age: 26, months: [2, 3, 4], gates: [{ path: "flags.CONTINENTAL_REGISTERED", op: "eq", value: true }, { path: "sport.roleScore", op: "lt", value: 68 }] },
    { id: "CEVT_27_SUCCESSOR_01", title: "El sucesor acelera", age: 27, months: [7, 8, 9, 10], gates: [{ path: "flags.HAS_SEED_YOUNG_SUCCESSOR", op: "eq", value: true }], read: ["SEED_YOUNG_SUCCESSOR"] },
    { id: "CEVT_27_NANO_01", title: "Nano te pide que no intervengas", age: 27, months: [8, 9, 10, 11], gates: [{ path: "flags.HAS_SEED_NANO_SHADOW", op: "eq", value: true }], read: ["SEED_NANO_SHADOW"] },
    { id: "CEVT_27_FINAL_01", title: "La final se gana sin ti", age: 27, months: [4, 5], gates: [{ path: "flags.FINAL_CONTEXT", op: "eq", value: true }, { path: "sport.roleScore", op: "lt", value: 66 }] },
    { id: "CEVT_27_MEDIA_01", title: "Una frase del documental se recorta", age: 27, months: [10, 11, 12, 1], gates: [{ path: "flags.HAS_SEED_DOCUMENTARY_ACCESS", op: "eq", value: true }], read: ["SEED_DOCUMENTARY_ACCESS"] },
    { id: "CEVT_27_CLUB_01", title: "El propietario cambia de entrenador", age: 27, months: [1, 2, 3], gates: [{ path: "flags.CLUB_OWNER_CHANGE", op: "eq", value: true }] },
    { id: "CEVT_27_RECORD_01", title: "Adrián alcanza tu cifra", age: 27, months: [2, 3, 4, 5], gates: [{ path: "flags.HAS_SEED_PUBLIC_RIVALRY", op: "eq", value: true }], read: ["SEED_PUBLIC_RIVALRY"] },
    { id: "CEVT_28_PROJECT_01", title: "El proyecto deja de girar alrededor de ti", age: 28, months: [7, 8, 9, 10], gates: [{ path: "flags.HAS_SEED_PROJECT_FACE", op: "eq", value: true }, { path: "professional.successionPressure", op: "gte", value: 35 }], read: ["SEED_PROJECT_FACE"] },
    { id: "CEVT_28_NAT_01", title: "Un suplente te adelanta en la selección", age: 28, months: [9, 10, 11, 3, 4], gates: [{ path: "professional.nationalStanding", op: "gte", value: 45 }, { path: "professional.nationalRole", op: "neq", value: "none" }] },
    { id: "CEVT_28_BODY_01", title: "Una resonancia no explica del todo el dolor", age: 28, months: [10, 11, 12, 1, 2], gates: [{ path: "professional.bodyLoad", op: "gte", value: 55 }] },
    { id: "CEVT_28_MKT_01", title: "La oferta desaparece en 48 horas", age: 28, months: [7, 8, 1], gates: [{ path: "reputation.marketHeat", op: "gte", value: 58 }] },
    { id: "CEVT_28_GALA_01", title: "Pierdes el premio que creías cercano", age: 28, months: [10, 11, 12], gates: [{ path: "professional.publicMyth", op: "gte", value: 55 }, { path: "professional.peakStatus", op: "gte", value: 55 }] },
    { id: "CEVT_28_HOME_01", title: "UDV usa tu nombre en una campaña", age: 28, months: [8, 9, 10, 11], gates: [{ path: "flags.HAS_SEED_HOME_INSTITUTION", op: "eq", value: true }], read: ["SEED_HOME_INSTITUTION"] },
    { id: "CEVT_29_NAT_02", title: "Cambia el seleccionador", age: 29, months: [7, 8, 9, 10], gates: [{ path: "professional.nationalStanding", op: "gte", value: 42 }], verified: true },
    { id: "CEVT_29_HOME_03", title: "UDV vive su mejor temporada", age: 29, months: [3, 4, 5], gates: [{ path: "flags.HAS_SEED_HOME_SYMBOL", op: "eq", value: true }], read: ["SEED_HOME_SYMBOL"], verified: true },
    { id: "CEVT_29_BODY_04", title: "Recuperas mejor de lo esperado", age: 29, months: [2, 3, 4, 5], gates: [{ path: "professional.bodyLoad", op: "gte", value: 45 }], verified: true },
    { id: "CEVT_29_RECORD_02", title: "Adrián o el sucesor rompe tu récord", age: 29, months: [2, 3, 4, 5], gates: [{ path: "flags.HAS_SEED_RECORD_CHASE", op: "eq", value: true }], read: ["SEED_RECORD_CHASE"], verified: true },
    { id: "CEVT_29_PROJECT_02", title: "El proyecto gira hacia otro", age: 29, months: [7, 8, 9, 10], gates: [{ path: "flags.HAS_SEED_PROJECT_FACE", op: "eq", value: true }, { path: "flags.CLUB_OWNER_CHANGE", op: "eq", value: true }], read: ["SEED_PROJECT_FACE"], verified: true },
    { id: "CEVT_29_WEALTH_01", title: "El gran contrato empieza a aislarte", age: 29, months: [10, 11, 12, 1], gates: [{ path: "flags.HAS_SEED_WEALTHY_PEAK_EXIT", op: "eq", value: true }], read: ["SEED_WEALTHY_PEAK_EXIT"] }
];
function make(r) {
    return ambiguousEvent({ id: r.id, ageWindow: [r.age, r.age], phase: "26_30", family: "conditional", title: r.title, body: "Una consecuencia del contexto previo reaparece sin convertir el pasado en un destino obligatorio.", visible: ["El hecho actual es visible."], uncertain: ["Su importancia futura sigue siendo incierta."], choices: [
            { id: "A", label: "Intervenir", intentTags: ["act"], primaryMessage: "Intervienes y desplazas el equilibrio.", secondaryMessage: "La intervención produce una reacción distinta a la prevista.", primaryEffects: [n("professional.careerControl", 3)], secondaryEffects: [n("professional.publicPolarization", 2)] },
            { id: "B", label: "Esperar", intentTags: ["wait"], primaryMessage: "Esperas y obtienes algo más de información.", secondaryMessage: "La espera permite que otro actor se adelante.", primaryEffects: [n("professional.environmentStability", 2)], secondaryEffects: [n("professional.careerControl", -1)] },
            { id: "C", label: "Proteger tu posición", intentTags: ["protect"], primaryMessage: "Proteges tu posición inmediata.", secondaryMessage: "La protección tiene un coste en otra relación.", primaryEffects: [n("professional.roleSecurity", 3)], secondaryEffects: [n("professional.institutionalTrust", -2)] }
        ], gates: r.gates, timeWindow: { months: r.months }, weight: 9, cooldown: 99999, seedsRead: r.read, tags: ["conditional", "peak_callback"], canonStatus: r.verified ? "verified" : "technical_adaptation" });
}
var CONDITIONAL_EVENTS_26_30 = rows.map(make);


// ═══ content/events/26_30/index.js ═══
var EVENTS_26_30 = [...PRINCIPAL_EVENTS_26_30, ...CONDITIONAL_EVENTS_26_30];


// ═══ content/events/30_34/principal-events.js ═══
const rows = [
    { id: "EVT_30_IDN_001", title: "La palabra veterano", age: 30, family: "legacy", months: [7, 8], seed: "SEED_VETERAN_LABEL", gates: [], verified: true, tags: ["maturity"] },
    { id: "EVT_30_CON_001", title: "Uno más o tres", age: 30, family: "contract", months: [7, 8], seed: "SEED_AGE30_CONTRACT", gates: [], verified: true, tags: ["maturity"] },
    { id: "EVT_30_BODY_001", title: "El plan de 45 partidos", age: 30, family: "medical", months: [8, 9], seed: "SEED_MATCH_SELECTIVITY", gates: [], verified: true, tags: ["maturity"] },
    { id: "EVT_30_MKT_001", title: "¿El último mercado grande?", age: 30, family: "market", months: [7, 8, 1], seed: "SEED_LAST_BIG_MOVE_WINDOW", gates: [], verified: true, tags: ["maturity"] },
    { id: "EVT_30_AGT_001", title: "El incentivo del último gran contrato", age: 30, family: "agent", months: [8, 9, 1], seed: "SEED_AGENT_LAST_CONTRACT", gates: [], verified: false, tags: ["maturity"] },
    { id: "EVT_30_NAT_001", title: "La selección empieza a mirar al siguiente", age: 30, family: "selection", months: [9, 10, 3, 4], seed: "SEED_NATIONAL_PHASEDOWN", gates: [{ "path": "professional.nationalStanding", "op": "gte", "value": 20 }], verified: false, tags: ["maturity"] },
    { id: "EVT_30_TEAM_001", title: "Tu dorsal ya tiene heredero", age: 30, family: "team", months: [9, 10], seed: "SEED_DORSAL_SUCCESSION", gates: [], verified: false, tags: ["maturity"] },
    { id: "EVT_30_FAM_001", title: "La mudanza que ya no da igual", age: 30, family: "family", months: [10, 11], seed: "SEED_FAMILY_ANCHOR", gates: [], verified: false, tags: ["maturity"] },
    { id: "EVT_30_LIFE_001", title: "Otra ciudad ya no cuesta lo mismo", age: 30, family: "life", months: [10, 11, 12], seed: "SEED_RELOCATION_LIMIT", gates: [], verified: false, tags: ["maturity"] },
    { id: "EVT_30_MED_001", title: "Dos médicos, dos calendarios", age: 30, family: "medical", months: [10, 11, 12], seed: "SEED_MEDICAL_AUTHORITY", gates: [], verified: false, tags: ["maturity"] },
    { id: "EVT_30_FINAL_001", title: "La gran noche desde otro rol", age: 30, family: "sport", months: [4, 5], seed: "SEED_BIG_GAME_ROTATION_30", gates: [{ "path": "flags.FINAL_CONTEXT", "op": "eq", "value": true }], verified: false, tags: ["maturity"] },
    { id: "EVT_30_FORM_001", title: "Tres meses como si tuvieras 25", age: 30, family: "sport", months: [2, 3, 4], seed: "SEED_FALSE_RESURGENCE", gates: [], verified: false, tags: ["maturity"] },
    { id: "EVT_30_CAP_001", title: "El brazalete cambia de manos", age: 30, family: "captaincy", months: [3, 4, 5], seed: "SEED_CAPTAIN_HANDOVER", gates: [], verified: false, tags: ["maturity"] },
    { id: "EVT_31_REC_001", title: "Quinientos partidos", age: 31, family: "legacy", months: [7, 8, 9], seed: "SEED_MILESTONE_CHASE_500", gates: [], verified: false, tags: ["maturity"] },
    { id: "EVT_31_MED_001", title: "Operarse en marzo", age: 31, family: "medical", months: [2, 3], seed: "SEED_SURGERY_31", gates: [], verified: false, tags: ["maturity"] },
    { id: "EVT_31_MKT_001", title: "El último salto a un gigante", age: 31, family: "market", months: [7, 8, 1], seed: "SEED_LAST_BIG_MOVE_31", gates: [], verified: false, tags: ["maturity"] },
    { id: "EVT_31_HOME_001", title: "Volver para competir", age: 31, family: "family", months: [7, 8, 1], seed: "SEED_HOME_RETURN_31", gates: [], verified: false, tags: ["maturity"] },
    { id: "EVT_31_AGT_001", title: "Negociar sin intermediario", age: 31, family: "agent", months: [8, 9, 1], seed: "SEED_SELF_REPRESENTATION_PREP", gates: [], verified: false, tags: ["maturity"] },
    { id: "EVT_31_MENT_001", title: "Mentor por contrato", age: 31, family: "team", months: [9, 10], seed: "SEED_FORMAL_MENTOR", gates: [], verified: false, tags: ["maturity"] },
    { id: "EVT_31_LEGACY_001", title: "Tu nombre en una academia", age: 31, family: "legacy", months: [9, 10, 11], seed: "SEED_LEGACY_ACADEMY", gates: [], verified: true, tags: ["maturity"] },
    { id: "EVT_31_RETURN_001", title: "Volver sin ritmo", age: 31, family: "medical", months: [9, 10, 11, 2, 3], seed: "SEED_COMEBACK_PACING", gates: [{ "path": "flags.RECOVERING_INJURY", "op": "eq", "value": true }], verified: true, tags: ["maturity"] },
    { id: "EVT_31_TACT_001", title: "El mediapunta que no eras", age: 31, family: "tactical", months: [10, 11, 12], seed: "SEED_ROLE_REINVENTION_32", gates: [], verified: false, tags: ["maturity"] },
    { id: "EVT_31_CCH_001", title: "Entrenador nuevo, privilegios cero", age: 31, family: "captaincy", months: [7, 8, 9], seed: "SEED_NEW_COACH_RESET", gates: [], verified: false, tags: ["maturity"] },
    { id: "EVT_31_TEAM_001", title: "Llegan tres de 21", age: 31, family: "team", months: [7, 8, 9, 10], seed: "SEED_SQUAD_YOUTH_WAVE", gates: [], verified: false, tags: ["maturity"] },
    { id: "EVT_31_NAT_001", title: "Club o selección, otra vez", age: 31, family: "selection", months: [9, 10, 3, 4], seed: "SEED_CLUB_NT_LOAD_TENSION", gates: [{ "path": "professional.nationalStanding", "op": "gte", "value": 20 }], verified: false, tags: ["maturity"] },
    { id: "EVT_31_FINAL_001", title: "Plan de minutos para la final", age: 31, family: "sport", months: [4, 5], seed: "SEED_MANAGED_FINAL_ROLE", gates: [{ "path": "flags.FINAL_CONTEXT", "op": "eq", "value": true }], verified: false, tags: ["maturity"] },
    { id: "EVT_32_IMG_001", title: "La crisis de tu socio", age: 32, family: "image", months: [7, 8, 9], seed: "SEED_BUSINESS_REPUTATION_SHOCK", gates: [], verified: false, tags: ["maturity"] },
    { id: "EVT_32_CON_001", title: "Un año, si rindes", age: 32, family: "contract", months: [7, 8, 9], seed: "SEED_ROLLING_CONTRACT", gates: [], verified: false, tags: ["maturity"] },
    { id: "EVT_32_MKT_001", title: "La oferta que paga por tu nombre", age: 32, family: "market", months: [7, 8, 1], seed: "SEED_LATE_RICH_OFFER", gates: [], verified: false, tags: ["maturity"] },
    { id: "EVT_32_CLB_001", title: "Rotación en un candidato", age: 32, family: "team", months: [8, 9, 10], seed: "SEED_LATE_CONTENDER_BENCH", gates: [], verified: false, tags: ["maturity"] },
    { id: "EVT_32_HOME_001", title: "Capitán en Valdoria", age: 32, family: "captaincy", months: [7, 8, 1], seed: "SEED_HOME_CAPTAIN_OFFER", gates: [], verified: false, tags: ["maturity"] },
    { id: "EVT_32_AGT_001", title: "Firmar tú mismo", age: 32, family: "agent", months: [8, 9, 1], seed: "SEED_SELF_REPRESENTATION", gates: [], verified: false, tags: ["maturity"] },
    { id: "EVT_32_TACT_001", title: "Menos números, más juego", age: 32, family: "tactical", months: [9, 10, 11], seed: "SEED_LOW_STATS_HIGH_IMPACT", gates: [], verified: false, tags: ["maturity"] },
    { id: "EVT_32_TEAM_001", title: "Tu sustituto despega", age: 32, family: "team", months: [9, 10, 11], seed: "SEED_REPLACEMENT_BREAKOUT", gates: [], verified: false, tags: ["maturity"] },
    { id: "EVT_32_FAN_001", title: "La grada te perdona antes que el entrenador", age: 32, family: "press", months: [10, 11, 12], seed: "SEED_FAN_LEGACY_BUFFER", gates: [], verified: false, tags: ["maturity"] },
    { id: "EVT_32_BODY_001", title: "El viaje pesa dos días", age: 32, family: "medical", months: [10, 11, 12, 2], seed: "SEED_TRAVEL_LOAD", gates: [], verified: false, tags: ["maturity"] },
    { id: "EVT_32_NAT_001", title: "La última lista ya no es automática", age: 32, family: "selection", months: [3, 4, 5], seed: "SEED_FINAL_NT_SQUAD", gates: [{ "path": "professional.nationalStanding", "op": "gte", "value": 20 }], verified: false, tags: ["maturity"] },
    { id: "EVT_32_BOS_001", title: "Enero con seis meses", age: 32, family: "contract", months: [1], seed: "SEED_BOSMAN_33", gates: [{ "path": "contract.monthsRemaining", "op": "lte", "value": 8 }], verified: false, tags: ["maturity"] },
    { id: "EVT_33_BODY_001", title: "Setenta y dos horas ya no bastan", age: 33, family: "medical", months: [8, 9, 10, 11], seed: "SEED_72H_LIMIT", gates: [], verified: false, tags: ["maturity"] },
    { id: "EVT_33_REC_001", title: "El récord o el descanso", age: 33, family: "legacy", months: [9, 10, 11, 3, 4], seed: "SEED_RECORD_VS_BODY", gates: [], verified: false, tags: ["maturity"] },
    { id: "EVT_33_CAP_001", title: "El último reparto de poder", age: 33, family: "captaincy", months: [9, 10, 11], seed: "SEED_VETERAN_LEADERSHIP_FINAL", gates: [], verified: false, tags: ["maturity"] },
    { id: "EVT_33_MKT_001", title: "Cuatro caminos", age: 33, family: "market", months: [7, 8, 1], seed: "SEED_FINAL_FOUR_WAYS", gates: [], verified: false, tags: ["maturity"] },
    { id: "EVT_33_NAT_001", title: "El último torneo", age: 33, family: "selection", months: [3, 4, 5], seed: "SEED_RETIREMENT_DISTANCE_PROFILE", gates: [{ "path": "professional.nationalStanding", "op": "gte", "value": 20 }], verified: false, tags: ["maturity"] },
    { id: "EVT_33_PRS_001", title: "¿Cuándo te retiras?", age: 33, family: "press", months: [9, 10, 11, 12], seed: "SEED_RETIREMENT_PUBLIC_TONE", gates: [], verified: false, tags: ["maturity"] },
    { id: "EVT_33_HOME_001", title: "Prometer Valdoria", age: 33, family: "family", months: [7, 8, 1, 5], seed: "SEED_HOME_PULL_PUBLIC", gates: [], verified: false, tags: ["maturity"] },
    { id: "EVT_33_CON_001", title: "El contrato que puede ser el último", age: 33, family: "contract", months: [1, 2, 3], seed: "SEED_AGE34_PRIORITY", gates: [], verified: false, tags: ["maturity"] },
    { id: "EVT_33_MED_001", title: "Dolor sin imagen", age: 33, family: "medical", months: [10, 11, 12, 1, 2], seed: "SEED_PAIN_WITHOUT_SCAN", gates: [], verified: false, tags: ["maturity"] },
    { id: "EVT_33_NET_001", title: "Una llamada de hace quince años", age: 33, family: "agent", months: [10, 11, 12, 1], seed: "SEED_OLD_NETWORK_FAVOR", gates: [], verified: false, tags: ["maturity"] },
    { id: "EVT_33_RET_001", title: "Parar todavía siendo futbolista", age: 33, family: "life", months: [4, 5, 6], seed: undefined, gates: [{ "path": "professional.retirementDistance", "op": "gte", "value": 30 }], verified: false, tags: ["maturity", "retirement_terminal_candidate"] },
    { id: "EVT_33_END_001", title: "A los 34, ¿qué estás protegiendo?", age: 33, family: "legacy", months: [5, 6], seed: "SEED_AGE34_PRIORITY", gates: [], verified: false, tags: ["maturity", "hard_deadline"] }
];
function specialEffects(r, id) {
    const out = [];
    if (r.id === "EVT_31_TACT_001" && id === "C")
        out.push(flag("ROLE_REINVENTED_30", true), n("professional.roleAdaptability", 8), n("professional.tacticalReading", 6));
    if (r.id === "EVT_31_MENT_001" && (id === "A" || id === "C"))
        out.push(flag("CAPTAIN_MENTOR", true), n("professional.legacyCapital", 5));
    if (r.id === "EVT_32_MKT_001" && id === "A")
        out.push(flag("RICH_LEAGUE_ROUTE", true), set("professional.route", "abroad"), n("professional.moneyComfort", 10));
    if (r.id === "EVT_32_MKT_001" && id === "C")
        out.push(flag("TRANSATLANTIC_PROJECT", true), set("professional.route", "abroad"), n("professional.commercialPower", 8));
    if (r.id === "EVT_32_CLB_001" && (id === "B" || id === "C"))
        out.push(flag("SPECIALIST_ROLE", true), n("sport.roleScore", -7), n("professional.statusInertia", 4));
    if (r.id === "EVT_32_HOME_001" && id === "A")
        out.push(flag("HOME_RETURN_30", true), set("professional.route", "home"), set("professional.ownerClub", "UDV"), set("professional.registrationClub", "UDV"), set("club", "UDV"), n("professional.homePull", 14));
    if (r.id === "EVT_32_CON_001" && id === "A")
        out.push(flag("ROLLING_CONTRACT", true), n("professional.contractPower", 4));
    if (r.id === "EVT_32_CON_001" && id === "B")
        out.push(flag("CONTRACT_TRAP_30", true), n("contract.salaryMonthly", 8000), n("contract.monthsRemaining", 24), n("sport.roleScore", -10), n("professional.roleSecurity", -8));
    if (r.id === "EVT_33_NAT_001" && id === "B")
        out.push(flag("NATIONAL_RETIRED", true), n("professional.recoveryDebt", -5), n("professional.motivationReserve", 3));
    if (r.id === "EVT_30_FORM_001" && id === "A")
        out.push(flag("LATE_BLOOM_30_34", true), n("professional.peakStatus", 4));
    return out;
}
function normalChoices(r) {
    const seed = (id) => r.seed ? [seedCreate(r.seed, id === "B" ? 48 : id === "C" ? 55 : 60, { choice: id })] : [];
    return [
        { id: "A", label: "Proteger el nivel competitivo", intentTags: ["competition"], immediateEffects: specialEffects(r, "A"), primaryMessage: "Priorizas competir ahora; el coste puede aparecer después.", secondaryMessage: "La apuesta sostiene estatus, pero consume margen.", primaryEffects: [n("professional.veteranLeverage", 3), n("professional.motivationReserve", 2)], secondaryEffects: [n("professional.recoveryDebt", 3)], primarySeedTransitions: seed("A"), secondarySeedTransitions: seed("A") },
        { id: "B", label: "Proteger cuerpo y estabilidad", intentTags: ["stability"], immediateEffects: specialEffects(r, "B"), primaryMessage: "Compras margen físico y previsibilidad.", secondaryMessage: "El descanso protege el cuerpo, pero alguien ocupa parte de tu espacio.", primaryEffects: [n("professional.matchSelectivity", 5), n("professional.recoveryDebt", -4)], secondaryEffects: [n("professional.statusInertia", -2)], primarySeedTransitions: seed("B"), secondarySeedTransitions: seed("B") },
        { id: "C", label: "Adaptar rol y condiciones", intentTags: ["adapt"], immediateEffects: specialEffects(r, "C"), primaryMessage: "Redefines utilidad en vez de defender una versión antigua.", secondaryMessage: "La adaptación abre un nicho, aunque no garantiza jerarquía.", primaryEffects: [n("professional.roleAdaptability", 4), n("professional.tacticalReading", 3)], secondaryEffects: [n("professional.careerControl", 2)], primarySeedTransitions: seed("C"), secondarySeedTransitions: seed("C") },
        { id: "D", label: "Esperar más información", intentTags: ["wait"], immediateEffects: specialEffects(r, "D"), primaryMessage: "Evitas cerrar una puerta demasiado pronto.", secondaryMessage: "Mientras esperas, el mercado y el club también se mueven.", primaryEffects: [n("professional.careerControl", 1)], secondaryEffects: [n("professional.veteranLeverage", -2)], primarySeedTransitions: seed("D"), secondarySeedTransitions: seed("D") }
    ];
}
function retirementEvent(r) {
    return ambiguousEvent({ id: r.id, ageWindow: [33, 33], phase: "30_34", family: "life", title: r.title, body: "Por primera vez, detenerte ahora es una opción real sin que el fútbol te haya expulsado todavía.", visible: ["Tu cuerpo, motivación, contrato y mercado ya no apuntan en la misma dirección."], uncertain: ["Seguir puede reconstruir el deseo o consumir el margen que queda."], choices: [
            { id: "A", label: "Cerrar la carrera al final de temporada", intentTags: ["retire"], immediateEffects: [flag("EARLY_RETIRED_30_34", true), set("world.retirementReason", "voluntary_30_34")], primaryMessage: "Decides controlar el cierre.", secondaryMessage: "El anuncio llega antes de lo que muchos esperaban, pero sigue siendo tu decisión.", primaryEffects: [n("professional.retirementDistance", 10)], secondaryEffects: [n("professional.legacyCapital", 3)] },
            { id: "B", label: "Buscar un año más con límites", intentTags: ["continue"], primaryMessage: "Continuarás solo si el proyecto respeta tus límites.", secondaryMessage: "El mercado acepta parte de tus condiciones, no todas.", primaryEffects: [n("professional.matchSelectivity", 6), n("professional.motivationReserve", 4)], secondaryEffects: [n("professional.careerControl", 2)] },
            { id: "C", label: "Esperar al mercado antes de decidir", intentTags: ["wait"], primaryMessage: "Dejas que las oportunidades respondan primero.", secondaryMessage: "Algunas desaparecen y la decisión se vuelve menos voluntaria.", primaryEffects: [n("professional.veteranLeverage", 2)], secondaryEffects: [n("professional.retirementDistance", 3)] },
            { id: "D", label: "No hablar todavía de retirada", intentTags: ["resist"], primaryMessage: "Apartas la conversación y vuelves a competir.", secondaryMessage: "La pregunta seguirá ahí aunque no la respondas hoy.", primaryEffects: [n("professional.motivationReserve", 2)], secondaryEffects: [n("professional.recoveryDebt", 2)] }
        ], gates: r.gates, timeWindow: { months: r.months }, weight: 5, cooldown: 99999, tags: r.tags, canonStatus: "technical_adaptation" });
}
function make(r) { if (r.id === "EVT_33_RET_001")
    return retirementEvent(r); return ambiguousEvent({ id: r.id, ageWindow: [r.age, r.age], phase: "30_34", family: r.family, title: r.title, body: "La madurez separa reputación, minutos, cuerpo, contrato y deseo. Ninguna opción protege todo a la vez.", visible: ["Conoces tu situación deportiva y contractual actual."], uncertain: ["No sabes cuánto durarán mercado, cuerpo ni paciencia institucional."], choices: normalChoices(r), gates: r.gates, timeWindow: { months: r.months }, weight: r.id === "EVT_33_END_001" ? 18 : 10, cooldown: 99999, seedsWrite: r.seed ? [r.seed] : undefined, tags: r.tags, canonStatus: r.verified ? "verified" : "technical_adaptation" }); }
var PRINCIPAL_EVENTS_30_34 = rows.map(make);


// ═══ content/events/30_34/conditional-events.js ═══
const rows = [
    { id: "CEVT_30_BODY_01", title: "La deuda que venía del pico", age: 30, months: [7, 8, 9, 10, 11, 12, 1, 2, 3, 4, 5], gates: [{ "path": "flags.HAS_SEED_PEAK_LOAD", "op": "eq", "value": true }] },
    { id: "CEVT_30_PROJECT_01", title: "El club empieza a planificar sin depender de ti", age: 30, months: [7, 8, 9, 10, 11, 12, 1, 2, 3, 4, 5], gates: [{ "path": "flags.HAS_SEED_PROJECT_FACE", "op": "eq", "value": true }] },
    { id: "CEVT_30_HOME_01", title: "Valdoria pregunta sin hacer oferta", age: 30, months: [7, 8, 9, 10, 11, 12, 1, 2, 3, 4, 5], gates: [{ "path": "flags.HAS_SEED_HOME_INSTITUTION", "op": "eq", "value": true }] },
    { id: "CEVT_30_NAT_01", title: "La selección gana sin ti", age: 30, months: [7, 8, 9, 10, 11, 12, 1, 2, 3, 4, 5], gates: [{ "path": "professional.nationalCaps", "op": "gte", "value": 5 }] },
    { id: "CEVT_30_AGENT_01", title: "Tu agente llama contrato de legado a una comisión", age: 30, months: [7, 8, 9, 10, 11, 12, 1, 2, 3, 4, 5], gates: [{ "path": "flags.HAS_SEED_AGENT_CONFLICT_PEAK", "op": "eq", "value": true }] },
    { id: "CEVT_30_RIVAL_01", title: "Adrián sigue siendo un espejo incómodo", age: 30, months: [7, 8, 9, 10, 11, 12, 1, 2, 3, 4, 5], gates: [{ "path": "flags.HAS_SEED_PUBLIC_RIVALRY", "op": "eq", "value": true }] },
    { id: "CEVT_30_FAN_01", title: "La grada recuerda el pico mejor que el presente", age: 30, months: [7, 8, 9, 10, 11, 12, 1, 2, 3, 4, 5], gates: [{ "path": "professional.publicMyth", "op": "gte", "value": 45 }] },
    { id: "CEVT_31_SURGERY_01", title: "La operación cambia el calendario", age: 31, months: [7, 8, 9, 10, 11, 12, 1, 2, 3, 4, 5], gates: [{ "path": "flags.HAS_SEED_SURGERY_31", "op": "eq", "value": true }] },
    { id: "CEVT_31_SUCCESSOR_01", title: "El sucesor ya no necesita permiso", age: 31, months: [7, 8, 9, 10, 11, 12, 1, 2, 3, 4, 5], gates: [{ "path": "flags.HAS_SEED_YOUNG_SUCCESSOR", "op": "eq", "value": true }] },
    { id: "CEVT_31_COACH_01", title: "El técnico nuevo borra jerarquías", age: 31, months: [7, 8, 9, 10, 11, 12, 1, 2, 3, 4, 5], gates: [{ "path": "flags.HAS_SEED_NEW_COACH_RESET", "op": "eq", "value": true }] },
    { id: "CEVT_31_NTLOAD_01", title: "El club pide que faltes a una ventana internacional", age: 31, months: [7, 8, 9, 10, 11, 12, 1, 2, 3, 4, 5], gates: [{ "path": "flags.HAS_SEED_CLUB_NT_LOAD_TENSION", "op": "eq", "value": true }] },
    { id: "CEVT_31_FINAL_01", title: "Ganar sin ser imprescindible", age: 31, months: [7, 8, 9, 10, 11, 12, 1, 2, 3, 4, 5], gates: [{ "path": "flags.HAS_SEED_MANAGED_FINAL_ROLE", "op": "eq", "value": true }] },
    { id: "CEVT_31_BUSINESS_01", title: "Una crisis ajena lleva tu nombre", age: 31, months: [7, 8, 9, 10, 11, 12, 1, 2, 3, 4, 5], gates: [{ "path": "flags.HAS_SEED_WEALTH_STRUCTURE", "op": "eq", "value": true }] },
    { id: "CEVT_31_RIVAS_01", title: "Rivas vuelve con poder real", age: 31, months: [7, 8, 9, 10, 11, 12, 1, 2, 3, 4, 5], gates: [{ "path": "flags.HAS_SEED_RIVAS_TRUST", "op": "eq", "value": true }] },
    { id: "CEVT_32_RICH_01", title: "La liga rica mejora la oferta", age: 32, months: [7, 8, 9, 10, 11, 12, 1, 2, 3, 4, 5], gates: [{ "path": "reputation.marketHeat", "op": "gte", "value": 45 }] },
    { id: "CEVT_32_REPLACE_01", title: "Tu sustituto encadena seis partidos", age: 32, months: [7, 8, 9, 10, 11, 12, 1, 2, 3, 4, 5], gates: [{ "path": "flags.HAS_SEED_REPLACEMENT_BREAKOUT", "op": "eq", "value": true }] },
    { id: "CEVT_32_HOME_01", title: "UDV ofrece el brazalete antes que el salario", age: 32, months: [7, 8, 9, 10, 11, 12, 1, 2, 3, 4, 5], gates: [{ "path": "flags.HAS_SEED_HOME_INSTITUTION", "op": "eq", "value": true }] },
    { id: "CEVT_32_BOSMAN_01", title: "El precontrato se filtra", age: 32, months: [7, 8, 9, 10, 11, 12, 1, 2, 3, 4, 5], gates: [{ "path": "flags.HAS_SEED_BOSMAN_33", "op": "eq", "value": true }] },
    { id: "CEVT_32_NT_01", title: "La lista sale y tu nombre está al final", age: 32, months: [7, 8, 9, 10, 11, 12, 1, 2, 3, 4, 5], gates: [{ "path": "professional.nationalStanding", "op": "gte", "value": 25 }] },
    { id: "CEVT_32_FAN_01", title: "Los silbidos van al que te sustituye", age: 32, months: [7, 8, 9, 10, 11, 12, 1, 2, 3, 4, 5], gates: [{ "path": "flags.HAS_SEED_FAN_LEGACY_BUFFER", "op": "eq", "value": true }] },
    { id: "CEVT_33_RECOVERY_01", title: "Dos partidos en 72 horas", age: 33, months: [7, 8, 9, 10, 11, 12, 1, 2, 3, 4, 5], gates: [{ "path": "professional.recoveryDebt", "op": "gte", "value": 18 }] },
    { id: "CEVT_33_RECORD_01", title: "El récord cae el día que debes descansar", age: 33, months: [7, 8, 9, 10, 11, 12, 1, 2, 3, 4, 5], gates: [{ "path": "flags.HAS_SEED_RECORD_CHASE", "op": "eq", "value": true }] },
    { id: "CEVT_33_RET_01", title: "Un titular anuncia tu retirada por ti", age: 33, months: [7, 8, 9, 10, 11, 12, 1, 2, 3, 4, 5], gates: [{ "path": "professional.retirementDistance", "op": "gte", "value": 18 }] },
    { id: "CEVT_33_HOME_01", title: "La pancarta dice que vuelvas", age: 33, months: [7, 8, 9, 10, 11, 12, 1, 2, 3, 4, 5], gates: [{ "path": "professional.homePull", "op": "gte", "value": 45 }] },
    { id: "CEVT_33_CONTRACT_01", title: "Tu salario bloquea la salida", age: 33, months: [7, 8, 9, 10, 11, 12, 1, 2, 3, 4, 5], gates: [{ "path": "flags.CONTRACT_TRAP_30", "op": "eq", "value": true }, { "path": "contract.monthsRemaining", "op": "gte", "value": 12 }] },
    { id: "CEVT_33_MARKET_01", title: "La oferta desaparece por otro fichaje", age: 33, months: [7, 8, 9, 10, 11, 12, 1, 2, 3, 4, 5], gates: [{ "path": "professional.veteranLeverage", "op": "lt", "value": 55 }] }
];
function make(r) {
    return ambiguousEvent({ id: r.id, ageWindow: [r.age, r.age], phase: "30_34", family: "conditional", title: r.title, body: "Una consecuencia previa reaparece, pero el pasado solo cambia probabilidades: no dicta el desenlace.", visible: ["La situación actual es real."], uncertain: ["Su origen puede interpretarse de varias formas."], choices: [
            { id: "A", label: "Intervenir ahora", intentTags: ["act"], primaryMessage: "Intervienes y recuperas iniciativa.", secondaryMessage: "La intervención expone un coste que estaba oculto.", primaryEffects: [n("professional.careerControl", 3)], secondaryEffects: [n("professional.publicPolarization", 2)] },
            { id: "B", label: "Aceptar el cambio de contexto", intentTags: ["adapt"], primaryMessage: "Aceptas que el equilibrio ya es distinto.", secondaryMessage: "La adaptación protege una parte de la carrera y cede otra.", primaryEffects: [n("professional.roleAdaptability", 3)], secondaryEffects: [n("professional.statusInertia", -1)] },
            { id: "C", label: "Ganar tiempo", intentTags: ["wait"], primaryMessage: "Esperas y recoges más información.", secondaryMessage: "Otro actor aprovecha el hueco.", primaryEffects: [n("professional.environmentStability", 2)], secondaryEffects: [n("professional.veteranLeverage", -2)] }
        ], gates: r.gates, timeWindow: { months: r.months }, weight: 8, cooldown: 99999, tags: ["conditional", "maturity_callback"], canonStatus: "technical_adaptation" });
}
var CONDITIONAL_EVENTS_30_34 = rows.map(make);


// ═══ content/events/30_34/index.js ═══
var EVENTS_30_34 = [...PRINCIPAL_EVENTS_30_34, ...CONDITIONAL_EVENTS_30_34];


// ═══ content/events/34_plus/principal-events.js ═══
const c = (id, label, effects = []) => ({ id, label, intentTags: [id.toLowerCase()], immediateEffects: effects, outcomeIds: [`${id}_OUT`] });
const o = (id, effects = [], messages = []) => ({ id: `${id}_OUT`, baseWeight: 1, effects, messages: messages.length ? messages : ["La decisión cambia el equilibrio de tu tramo final."] });
const n = (path, delta, min = 0, max = 100) => ({ kind: "numeric", path, delta, min, max });
const s = (path, value) => ({ kind: "set", path, value });
const f = (flag, value = true) => ({ kind: "flag", flag, value });
function generic(id, age, title, family, months, weight = 1) {
    const choices = [
        c("A", "Proteger el rol", [n("professional.careerControl", 3), n("professional.motivationReserve", 1)]),
        c("B", "Aceptar una adaptación", [n("professional.roleAdaptability", 4), n("professional.statusInertia", -2)]),
        c("C", "Priorizar el cuerpo", [n("professional.matchSelectivity", 5), n("professional.recoveryDebt", -4)]),
        c("D", "Explorar el mercado", [n("reputation.marketHeat", 3), n("professional.environmentStability", -2)])
    ];
    return { id, ageWindow: [age, null], phase: "34_plus", family, gates: [{ path: "retirement.status", op: "eq", value: "playing" }], timeWindow: { months }, cooldown: 99999, weight, text: { title, body: "La carrera ya no gira solo alrededor del nivel: cada decisión modifica cuánto quieres jugar, cuánto puedes jugar y bajo qué condiciones." }, intel: { visible: ["rol actual", "estado físico", "situación contractual"], uncertain: ["demanda real", "planes del club"] }, choices, outcomes: choices.map(x => o(x.id)), tags: ["late_career"], canonStatus: "technical_adaptation" };
}
const principal = [
    generic("EVT_34_PRE_001", 34, "La pretemporada ya no es igual", "preseason", [7, 8], 1.3),
    generic("EVT_34_CON_001", 34, "Un año o dos", "contract", [7, 8, 9], 1.15),
    generic("EVT_34_ROLE_001", 34, "El entrenador habla de administrar minutos", "sport", [8, 9], 1.1),
    generic("EVT_34_BODY_001", 34, "El calendario pesa diferente", "medical", [9, 10], 1.1),
    generic("EVT_34_MKT_001", 34, "Todavía llaman", "market", [7, 8, 1], 1.05),
    generic("EVT_34_NAT_001", 34, "La selección ya mira al siguiente ciclo", "selection", [9, 10, 11], .9),
    generic("EVT_34_TEAM_001", 34, "El vestuario tiene otra generación", "team", [10, 11], 1),
    generic("EVT_34_FAM_001", 34, "Mover a todos otra vez", "family", [11, 12], .95),
    generic("EVT_34_IMG_001", 34, "Tu nombre vale más que algunos minutos", "image", [12, 1], .9),
    generic("EVT_34_HOME_001", 34, "Valdoria vuelve a preguntar", "legacy", [1, 2], .9),
    generic("EVT_34_MED_001", 34, "La recuperación tarda un día más", "medical", [1, 2], 1),
    generic("EVT_34_MAR_001", 34, "Marzo: el club no llama", "contract", [3], 1.25),
    generic("EVT_34_COM_001", 34, "Una racha que nadie esperaba", "sport", [3, 4], .9),
    generic("EVT_34_LEG_001", 34, "Qué dejar en el vestuario", "legacy", [4], .9),
    generic("EVT_34_END_001", 34, "Otro verano por delante", "life", [5, 6], 1.1),
    generic("EVT_34_PRS_001", 34, "Te preguntan cuánto te queda", "press", [5], .8),
    generic("EVT_35_PRE_001", 35, "Una pretemporada más corta", "preseason", [7, 8], 1.25),
    generic("EVT_35_OPT_001", 35, "Opción unilateral", "contract", [7, 8], 1.05),
    generic("EVT_35_BODY_001", 35, "Dos partidos por semana", "medical", [9, 10], 1.1),
    generic("EVT_35_ROLE_001", 35, "Titular ya no significa siempre empezar", "sport", [9, 10], 1),
    generic("EVT_35_MKT_001", 35, "Una liga distinta", "market", [11, 12, 1], 1),
    generic("EVT_35_NAT_001", 35, "El último ciclo internacional", "selection", [9, 10, 11], .8),
    generic("EVT_35_FAM_001", 35, "La familia también tiene calendario", "family", [12, 1], .9),
    generic("EVT_35_HOME_001", 35, "La última ventana para volver", "legacy", [1, 2], .85),
    generic("EVT_35_MENT_001", 35, "El joven quiere tu sitio y tu consejo", "team", [2, 3], 1),
    generic("EVT_35_MED_001", 35, "El parte médico cambia el lenguaje", "medical", [2, 3], 1.05),
    generic("EVT_35_FINAL_001", 35, "La final que miras desde fuera", "sport", [4, 5], 1.1),
    generic("EVT_35_PRS_001", 35, "¿Te irás arriba?", "press", [4, 5], .8),
    generic("EVT_35_END_001", 35, "Otra decisión de junio", "life", [5, 6], 1.05),
    generic("EVT_35_BUS_001", 35, "El patrimonio empieza a hablar por ti", "money", [3, 4], .75),
    generic("EVT_35_CAP_001", 35, "Capitán sin jugar todos los minutos", "captaincy", [3, 4], .9),
    generic("EVT_36_CON_001", 36, "Contrato por objetivos", "contract", [7, 8], 1.15),
    generic("EVT_36_MED_001", 36, "El reconocimiento dura más", "medical", [8, 9], 1.1),
    generic("EVT_36_COM_001", 36, "Volver a sentirte jugador", "sport", [9, 10], .9),
    generic("EVT_36_MENT_001", 36, "El vestuario ya te escucha distinto", "team", [11, 12], .85),
    generic("EVT_36_RICH_001", 36, "Una última oferta enorme", "market", [1, 2], .9),
    generic("EVT_36_HOME_001", 36, "Volver para competir, no para homenajes", "legacy", [2, 3], .85),
    generic("EVT_36_END_001", 36, "Seguir no es automático", "life", [5, 6], 1),
    generic("EVT_37_PRE_001", 37, "La pretemporada número veinte", "preseason", [7, 8], 1),
    generic("EVT_37_DERBY_001", 37, "El derbi todavía importa", "sport", [9, 10, 11], .8),
    generic("EVT_37_ANNOUNCE_001", 37, "Te piden que anuncies antes del último partido", "press", [2, 3, 4], .9),
    generic("EVT_37_PRIVATE_001", 37, "Una conversación que no sale en prensa", "family", [3, 4], .8),
    generic("EVT_38_MKT_001", 38, "El teléfono todavía suena", "market", [7, 8, 1], .8),
    generic("EVT_38_CON_001", 38, "Seis meses más", "contract", [1, 2, 3], .8),
];
for (const id of ["EVT_34_TEAM_001", "EVT_34_HOME_001", "EVT_34_MED_001", "EVT_34_LEG_001", "EVT_34_PRS_001", "EVT_35_HOME_001", "EVT_35_FINAL_001", "EVT_35_PRS_001", "EVT_36_RICH_001"]) {
    const ev = principal.find(x => x.id === id);
    if (ev)
        ev.weight *= 1.35;
}
const veteranMarket = principal.find(x => x.id === "EVT_34_MKT_001");
veteranMarket.gates = [{ path: "retirement.status", op: "eq", value: "playing" }, { path: "flags.VETERAN_OFFER_AVAILABLE", op: "eq", value: true }];
veteranMarket.repeatable = true;
veteranMarket.cooldown = 180;
veteranMarket.weight = 2.2;
veteranMarket.choices = [
    c("ACCEPT_SHORT", "Aceptar un año y competir", [s("contract.monthsRemaining", 12), f("VETERAN_OFFER_AVAILABLE", false), n("professional.environmentStability", 3)]),
    c("ACCEPT_ROLE", "Aceptar dos años con rol menor", [s("contract.monthsRemaining", 24), f("VETERAN_OFFER_AVAILABLE", false), n("professional.roleSecurity", -5), n("professional.careerControl", 2)]),
    c("REJECT", "Rechazar: no encaja", [f("VETERAN_OFFER_AVAILABLE", false), n("professional.careerControl", 2)]),
    c("WAIT", "Esperar otra llamada", [n("professional.motivationReserve", -1)])
];
veteranMarket.outcomes = veteranMarket.choices.map(x => o(x.id));
function retirementEvent(id, title, gates, choices, outcomes, months, repeatable = false, weight = 2) {
    return { id, ageWindow: [34, null], phase: "34_plus", family: "life", gates, timeWindow: months ? { months } : undefined, cooldown: repeatable ? 45 : 99999, repeatable, weight, text: { title, body: "La retirada deja de ser una idea abstracta y se convierte en una decisión concreta." }, intel: { visible: ["cuerpo", "rol", "mercado", "familia"], uncertain: ["cómo recordarás este momento"] }, choices, outcomes, tags: ["retirement_terminal"], canonStatus: "verified" };
}
principal.push(retirementEvent("EVT_RET_HOME_001", "La conversación en casa", [{ path: "retirement.status", op: "eq", value: "playing" }, { path: "professional.retirementDistance", op: "gte", value: 30 }], [c("KEEP", "Quiero seguir", [n("professional.motivationReserve", 4)]), c("DECIDE", "Creo que ha llegado", [s("retirement.status", "decided"), s("retirement.decidedDate", null), s("retirement.reason", "voluntary")])], [o("KEEP"), o("DECIDE", [f("RETIREMENT_DECISION_CONTEXT")])], undefined, false, 1.4), retirementEvent("EVT_RET_BODY_001", "El cuerpo dice basta, quizá", [{ path: "retirement.status", op: "eq", value: "playing" }, { path: "flags.LATE_BODY_REDLINE", op: "eq", value: true }], [c("HEALTH", "Parar por salud", [s("retirement.status", "decided"), s("retirement.reason", "health"), f("HEALTH_RETIREMENT_CONTEXT")]), c("ONE_MORE", "Intentar una temporada más", [n("professional.motivationReserve", -4), n("professional.matchSelectivity", 8)])], [o("HEALTH"), o("ONE_MORE")], undefined, false, 1.8), retirementEvent("EVT_RET_HIGH_001", "Retirarte después de ganar", [{ path: "retirement.status", op: "eq", value: "playing" }, { path: "flags.RETIRE_AFTER_WIN_CONTEXT", op: "eq", value: true }], [c("HIGH", "Irme arriba", [s("retirement.status", "decided"), s("retirement.reason", "retire_on_high"), f("RETIRE_ON_HIGH")]), c("CONTINUE", "Seguir", [n("professional.motivationReserve", 3)])], [o("HIGH"), o("CONTINUE")], undefined, false, 1.5), retirementEvent("EVT_RET_LOW_001", "Retirarte después de caer", [{ path: "retirement.status", op: "eq", value: "playing" }, { path: "flags.RETIRE_AFTER_LOW_CONTEXT", op: "eq", value: true }], [c("LOW", "Aceptar el final", [s("retirement.status", "decided"), s("retirement.reason", "retire_on_low"), f("RETIRE_ON_LOW")]), c("FIGHT", "Buscar otro sitio", [n("professional.motivationReserve", 2), n("reputation.marketHeat", 2)])], [o("LOW"), o("FIGHT")], undefined, false, 1.6), retirementEvent("EVT_RET_ANNOUNCE_001", "Quién se entera primero", [{ path: "retirement.status", op: "eq", value: "decided" }], [c("PUBLIC", "Anunciarlo", [s("retirement.status", "announced"), f("RETIREMENT_ANNOUNCED")]), c("PRIVATE", "Decírselo primero a los tuyos", [s("retirement.status", "announced"), f("RETIREMENT_ANNOUNCED")]), c("WAIT", "Esperar un poco más", [])], [o("PUBLIC", [f("RETIREMENT_PUBLIC")]), o("PRIVATE", [f("RETIREMENT_PRIVATE")]), o("WAIT")], undefined, true, 3.2), retirementEvent("EVT_RET_LAST_001", "El último partido no está garantizado", [{ path: "retirement.status", op: "eq", value: "announced" }, { path: "flags.LAST_MATCH_WINDOW", op: "eq", value: true }], [c("PLAY", "Jugar si el cuerpo y el entrenador lo permiten", [f("LAST_MATCH_PLAYED"), s("retirement.status", "closed"), s("retirement.closureType", "planned_last_match")]), c("NO_MATCH", "Aceptar que quizá no haya despedida", [s("retirement.status", "closed"), s("retirement.closureType", "no_last_match")])], [o("PLAY"), o("NO_MATCH")], [4, 5, 6], false, 6));
var PRINCIPAL_EVENTS_34_PLUS = principal;


// ═══ content/events/34_plus/conditional-events.js ═══
const c = (id, label, effects = []) => ({ id, label, intentTags: [id.toLowerCase()], immediateEffects: effects, outcomeIds: [`${id}_OUT`] });
const o = (id, effects = [], messages = []) => ({ id: `${id}_OUT`, baseWeight: 1, effects, messages: messages.length ? messages : ["El contexto tardío cambia el siguiente tramo de la carrera."] });
const n = (path, delta, min = 0, max = 100) => ({ kind: "numeric", path, delta, min, max });
const s = (path, value) => ({ kind: "set", path, value });
const f = (flag, value = true) => ({ kind: "flag", flag, value });
function generic(id, minAge, title, gates = [], months, weight = .9) {
    const choices = [c("A", "Aceptar el nuevo contexto", [n("professional.careerControl", 2)]), c("B", "Proteger tu posición", [n("professional.statusInertia", 2)]), c("C", "Priorizar el cuerpo", [n("professional.recoveryDebt", -3)]), c("D", "No precipitar nada", [n("professional.environmentStability", 2)])];
    return { id, ageWindow: [minAge, null], phase: "34_plus", family: "conditional", gates: [{ path: "retirement.status", op: "neq", value: "closed" }, ...gates], timeWindow: months ? { months } : undefined, cooldown: 99999, weight, text: { title, body: "No era una escena programada: aparece porque lo que hiciste antes ha creado esta posibilidad." }, intel: { visible: ["contexto inmediato"], uncertain: ["coste a medio plazo"] }, choices, outcomes: choices.map(x => o(x.id)), tags: ["late_conditional"], canonStatus: "technical_adaptation" };
}
const e = [
    generic("CEVT_34_MAJOR_COMEBACK", 34, "Te daban por terminado", [{ path: "flags.MAJOR_COMEBACK_CONTEXT", op: "eq", value: true }], [9, 10, 11, 2, 3], 1.3),
    generic("CEVT_34_RENEWAL_GHOST", 34, "La promesa de renovación se enfría", [{ path: "flags.INFORMAL_RENEWAL_PROMISE", op: "eq", value: true }], [2, 3, 4], 1.1),
    generic("CEVT_34_ROLE_COLLAPSE", 34, "Dos suplencias se convierten en seis", [{ path: "sport.roleScore", op: "lt", value: 50 }], undefined, 1),
    generic("CEVT_34_HOME_CALL", 34, "Valdoria llama sin campaña", [{ path: "professional.homePull", op: "gte", value: 45 }], undefined, .9),
    generic("CEVT_34_FAMILY_STOP", 34, "En casa dicen que no a otra mudanza", [{ path: "professional.relocationTolerance", op: "lt", value: 65 }], undefined, .9),
    generic("CEVT_34_MEDIA_END", 34, "Un titular te retira antes de tiempo", [{ path: "reputation.mediaHeat", op: "gte", value: 48 }], undefined, .8),
    generic("CEVT_34_CAPTAIN_WITHOUT_MINUTES", 34, "Sigues siendo referente sin empezar", [{ path: "professional.institutionalPower", op: "gte", value: 58 }, { path: "sport.roleScore", op: "lt", value: 50 }], undefined, .9),
    generic("CEVT_34_MARKET_DOWNGRADE", 34, "La única oferta implica bajar un escalón", [{ path: "flags.VETERAN_OFFER_AVAILABLE", op: "eq", value: true }], undefined, 1),
    generic("CEVT_35_BODY_SETBACK", 35, "La recuperación ya no respeta plazos", [{ path: "professional.recoveryDebt", op: "gte", value: 30 }], undefined, 1),
    generic("CEVT_35_YOUNG_STARTER", 35, "El joven ya no es proyecto", [{ path: "professional.successionPressure", op: "gte", value: 30 }], undefined, .9),
    generic("CEVT_35_NT_EXCLUSION", 35, "La lista llega sin tu nombre", [{ path: "professional.nationalCaps", op: "gte", value: 8 }], undefined, .8),
    generic("CEVT_35_LATE_FINAL", 35, "Llegas a otra final con otro rol", [{ path: "flags.FINAL_CONTEXT", op: "eq", value: true }], [4, 5], 1.2),
    generic("CEVT_35_AGENT_SPLIT", 35, "Tu agente quiere una última comisión", [{ path: "professional.agentControl", op: "gte", value: 20 }], undefined, .8),
    generic("CEVT_35_CLUB_LEGACY", 35, "El club propone un papel después del fútbol", [{ path: "professional.legacyCapital", op: "gte", value: 48 }], undefined, .8),
    generic("CEVT_35_RICH_LAST", 35, "La oferta rica vuelve con menos fútbol", [{ path: "professional.moneyComfort", op: "gte", value: 45 }], undefined, .8),
    generic("CEVT_35_INJURY_RETURN", 35, "Vuelves antes de lo previsto", [{ path: "flags.RECOVERING_INJURY", op: "eq", value: false }, { path: "world.maturityLongInjuryCount", op: "gte", value: 1 }], undefined, .9),
    generic("CEVT_36_NO_MEDICAL_CLEARANCE", 36, "Esta vez no hay alta", [{ path: "flags.LATE_BODY_REDLINE", op: "eq", value: true }], undefined, 1.8),
    generic("CEVT_36_COMEBACK_FINAL", 36, "Un último renacimiento", [{ path: "world.maturityLongInjuryCount", op: "gte", value: 1 }], undefined, 1.4),
    generic("CEVT_36_MARKET_SILENCE", 36, "Nadie llama en julio", [{ path: "retirement.noMarketWindows", op: "gte", value: 1 }], [7, 8], 1.2),
    generic("CEVT_36_MENTOR_CONFLICT", 36, "El chico que ayudabas quiere tus minutos", [{ path: "professional.successionPressure", op: "gte", value: 35 }], undefined, .9),
    generic("CEVT_36_FAMILY_RETURN", 36, "Volver a casa deja de ser romántico", [{ path: "professional.homePull", op: "gte", value: 55 }], undefined, .8),
    generic("CEVT_36_SELECTION_GOODBYE", 36, "La llamada de despedida", [{ path: "professional.nationalCaps", op: "gte", value: 12 }], undefined, .8),
    generic("CEVT_37_NO_LAST_DERBY", 37, "El entrenador te deja fuera del derbi", [{ path: "sport.roleScore", op: "lt", value: 55 }], undefined, .8),
    generic("CEVT_37_RECORD_WINDOW", 37, "Un récord está a dos partidos", [{ path: "professional.legacyCapital", op: "gte", value: 55 }], undefined, .8),
    generic("CEVT_37_HOME_CROWD", 37, "La grada empieza a despedirse sin anuncio", [{ path: "professional.publicMyth", op: "gte", value: 50 }], undefined, .8),
    generic("CEVT_37_PRIVATE_DOUBT", 37, "En privado dices que quizá sea el final", [{ path: "professional.retirementDistance", op: "gte", value: 30 }], undefined, 1),
    generic("CEVT_38_OFFER_AFTER_RETIREMENT_ANNOUNCED", 36, "Una oferta después de anunciar la retirada", [{ path: "retirement.status", op: "eq", value: "announced" }, { path: "flags.POST_ANNOUNCE_OFFER", op: "eq", value: true }], undefined, 2),
    generic("CEVT_38_MEDIA_FAREWELL", 38, "La despedida se convierte en campaña", [{ path: "retirement.status", op: "eq", value: "announced" }, { path: "reputation.mediaHeat", op: "gte", value: 35 }], undefined, .9),
    generic("CEVT_38_FAMILY_REVERSAL", 34, "En casa no quieren que vuelvas", [{ path: "retirement.status", op: "eq", value: "announced" }, { path: "retirement.reversals", op: "gte", value: 1 }], undefined, .8),
    { id: "CEVT_RET_RECONSIDER", ageWindow: [34, null], phase: "34_plus", family: "conditional", gates: [{ path: "retirement.status", op: "eq", value: "announced" }, { path: "flags.RECONSIDERATION_WINDOW", op: "eq", value: true }], cooldown: 99999, weight: 5, text: { title: "¿Y si todavía queda una temporada?", body: "La oferta existe de verdad. Volver tendría un coste, pero la retirada anunciada aún no está cerrada." }, intel: { visible: ["oferta real", "retirada anunciada"], uncertain: ["si el regreso tendrá minutos"] }, choices: [c("RETURN", "Reconsiderar y volver", [s("retirement.status", "playing"), n("retirement.reversals", 1, 0, 10), f("RETIREMENT_RECONSIDERED"), f("RETIREMENT_ANNOUNCED", false), f("POST_ANNOUNCE_OFFER", false), n("professional.statusInertia", -5), n("reputation.marketHeat", -4)]), c("NO", "Mantener la retirada", [f("POST_ANNOUNCE_OFFER", false)])], outcomes: [o("RETURN"), o("NO")], tags: ["retirement_terminal"], canonStatus: "verified" },
    { id: "CEVT_RET_STORYBOOK_LAST_GOAL", ageWindow: [34, null], phase: "34_plus", family: "conditional", gates: [{ path: "retirement.status", op: "eq", value: "announced" }, { path: "flags.LAST_MATCH_WINDOW", op: "eq", value: true }, { path: "sport.roleScore", op: "gte", value: 25 }], timeWindow: { months: [4, 5, 6] }, cooldown: 99999, weight: 5.5, text: { title: "El último balón", body: "Hay una ventana real para una despedida perfecta. No estaba escrita." }, intel: { visible: ["último partido plausible"], uncertain: ["si el fútbol permitirá el final perfecto"] }, choices: [c("TAKE", "Jugar el momento", [f("STORYBOOK_LAST_GOAL"), s("retirement.status", "closed"), s("retirement.closureType", "storybook")]), c("TEAM", "No convertir el partido en ti", [s("retirement.status", "closed"), s("retirement.closureType", "planned_last_match")])], outcomes: [o("TAKE"), o("TEAM")], tags: ["retirement_terminal"], canonStatus: "verified" },
    { id: "CEVT_RET_NO_LAST_MATCH", ageWindow: [34, null], phase: "34_plus", family: "conditional", gates: [{ path: "retirement.status", op: "eq", value: "announced" }, { path: "retirement.daysInStatus", op: "gte", value: 60 }], cooldown: 99999, weight: 3.6, text: { title: "No habrá último partido", body: "El calendario y tu situación deportiva no garantizan una despedida sobre el césped." }, intel: { visible: ["retirada anunciada"], uncertain: ["cómo cerrará públicamente"] }, choices: [c("ACCEPT", "Aceptar el cierre", [s("retirement.status", "closed"), s("retirement.closureType", "no_last_match")]), c("ASK", "Pedir una despedida simbólica", [n("professional.institutionalPower", -2), s("retirement.status", "closed"), s("retirement.closureType", "no_last_match")])], outcomes: [o("ACCEPT"), o("ASK")], tags: ["retirement_terminal"], canonStatus: "verified" }
];
const postOffer = e.find(x => x.id === "CEVT_38_OFFER_AFTER_RETIREMENT_ANNOUNCED");
postOffer.choices = [
    c("LISTEN", "Escuchar la propuesta", [f("POST_ANNOUNCE_OFFER", false), f("RECONSIDERATION_WINDOW")]),
    c("DECLINE", "Mantener la retirada", [f("POST_ANNOUNCE_OFFER", false), f("RECONSIDERATION_WINDOW", false)])
];
postOffer.outcomes = postOffer.choices.map(x => o(x.id));
postOffer.weight = 7;
postOffer.tags = [...(postOffer.tags ?? []), "retirement_terminal"];
var CONDITIONAL_EVENTS_34_PLUS = e;


// ═══ content/events/34_plus/index.js ═══
var EVENTS_34_PLUS = [...PRINCIPAL_EVENTS_34_PLUS, ...CONDITIONAL_EVENTS_34_PLUS];


// ═══ content/events/index.js ═══
var EVENTS_18_20 = [
    ...BASE_EVENTS_18_20,
    ...PRINCIPAL_ADDITIONS_18_20,
    ...CONDITIONAL_EVENTS_18_20
];
var EVENTS = [...EVENTS_18_20, ...EVENTS_20_23, ...EVENTS_23_26, ...EVENTS_26_30, ...EVENTS_30_34, ...EVENTS_34_PLUS];


// ═══ content/media-manifest.js ═══
const familyFallbacks = [...new Set(EVENTS.map(e => e.family))].map(family => ({
    id: `generic_${family}`,
    type: "image",
    uri: `/assets/generic/${family}.webp`,
    bytesHint: 120_000
}));
const eventHeroes = EVENTS.map(e => ({
    id: `hero_${e.id.toLowerCase()}`,
    type: "image",
    uri: `/assets/events/18_20/${e.id.toLowerCase()}.webp`,
    bytesHint: 180_000,
    fallbackId: `generic_${e.family}`
}));
var MEDIA_MANIFEST = [
    ...familyFallbacks,
    ...eventHeroes,
    {
        id: "cutscene_evt_18_match_001_debut",
        type: "video",
        uri: "/assets/events/18_20/evt_18_match_001_debut.webm",
        bytesHint: 1_800_000,
        fallbackId: "hero_evt_18_match_001"
    },
    {
        id: "cutscene_evt_18_sum_001_contract",
        type: "video",
        uri: "/assets/events/18_20/evt_18_sum_001_contract.webm",
        bytesHint: 2_200_000,
        fallbackId: "hero_evt_18_sum_001"
    }
];


// ═══ catalog/canon-coverage.js ═══
const EXPECTED = {
    "18_20": { principal: 30, conditional: 14 }, "20_23": { principal: 33, conditional: 18 }, "23_26": { principal: 40, conditional: 20 }, "26_30": { principal: 51, conditional: 24 }, "30_34": { principal: 50, conditional: 26 }, "34_plus": { principal: 50, conditional: 32 }
};
function phaseCoverage(phase) {
    const expected = EXPECTED[phase] ?? { principal: 0, conditional: 0 };
    const ev = EVENTS.filter(e => e.phase === phase);
    return { sourceVersion: "Documento Maestro v0.9 · 10/09/2026", phase, expectedPrincipal: expected.principal, expectedConditional: expected.conditional, implementedPrincipal: ev.filter(e => e.family !== "conditional").length, implementedConditional: ev.filter(e => e.family === "conditional").length, verifiedNpcDefinitions: NPC_CATALOG.length, expectedNpcDefinitions: 20, verifiedSeedDefinitions: SEED_CATALOG.length, expectedGlobalSeedDefinitions: 210 };
}
function getCanonCoverage() { return phaseCoverage("18_20"); }
function getCanonCoverageAll() { return [phaseCoverage("18_20"), phaseCoverage("20_23"), phaseCoverage("23_26"), phaseCoverage("26_30"), phaseCoverage("30_34"), phaseCoverage("34_plus")]; }


// ═══ content/microfeeds/26_30.js ═══
const f = (id, family, text, weight = 1, gates) => ({ id, ageWindow: [26, 29], family, text, weight, gates });
var MICROFEEDS_26_30 = [
    f("FEED_26_30_LOCK_01", "locker", "Cena de capitanes después de una semana difícil."),
    f("FEED_26_30_LOCK_02", "locker", "Un joven llega tarde y todos miran a los veteranos."),
    f("FEED_26_30_LOCK_03", "locker", "Cambian los asientos del vestuario y alguien hace una broma sobre jerarquías."),
    f("FEED_26_30_LOCK_04", "locker", "El grupo de jugadores organiza un regalo colectivo sin avisar al club."),
    f("FEED_26_30_PRS_01", "press", "Un ranking te coloca entre los mejores de tu posición."),
    f("FEED_26_30_PRS_02", "press", "Un programa debate si ya has alcanzado tu pico."),
    f("FEED_26_30_PRS_03", "press", "Circula un rumor de salario que nadie confirma."),
    f("FEED_26_30_PRS_04", "press", "Un clip de una respuesta tuya circula sin el contexto completo."),
    f("FEED_26_30_BRAND_01", "brand", "Sesión de fotos para una campaña internacional."),
    f("FEED_26_30_BRAND_02", "brand", "Una marca cancela una activación a última hora."),
    f("FEED_26_30_BRAND_03", "brand", "Te ofrecen aparecer en un videojuego ficticio."),
    f("FEED_26_30_BRAND_04", "brand", "Una cláusula de exclusividad bloquea otra campaña."),
    f("FEED_26_30_BODY_01", "body", "El fisio recomienda un masaje extra después del viaje."),
    f("FEED_26_30_BODY_02", "body", "Los datos de sueño salen peores de lo habitual."),
    f("FEED_26_30_BODY_03", "body", "Notas una rigidez pequeña que desaparece durante el calentamiento."),
    f("FEED_26_30_BODY_04", "body", "El gimnasio reduce tu carga de fuerza esta semana."),
    f("FEED_26_30_CLUB_01", "club", "El club anuncia un nuevo director deportivo."),
    f("FEED_26_30_CLUB_02", "club", "Comienzan obras en una parte del estadio."),
    f("FEED_26_30_CLUB_03", "club", "Una leyenda visita el entrenamiento."),
    f("FEED_26_30_CLUB_04", "club", "La plantilla recibe un nuevo bonus colectivo."),
    f("FEED_26_30_NAT_01", "selection", "Te reencuentras con compañeros de selección en un viaje largo.", 1, [{ path: "flags.NATIONAL_CALLED", op: "eq", value: true }]),
    f("FEED_26_30_NAT_02", "selection", "Te asignan una habitación distinta en la concentración.", 1, [{ path: "flags.NATIONAL_CALLED", op: "eq", value: true }]),
    f("FEED_26_30_NAT_03", "selection", "Sales como capitán de uno de los equipos en el entrenamiento.", 1, [{ path: "professional.nationalStanding", op: "gte", value: 45 }]),
    f("FEED_26_30_FAM_01", "family", "Un cumpleaños familiar coincide con un partido."),
    f("FEED_26_30_FAM_02", "family", "Una inversión pequeña paga su primer dividendo."),
    f("FEED_26_30_FAM_03", "family", "En casa discuten cuánto de vuestra vida debe seguir siendo privada."),
    f("FEED_26_30_ORG_01", "origin", "Llega un mensaje de la academia de UDV."),
    f("FEED_26_30_ORG_02", "origin", "Una foto antigua de cantera vuelve a hacerse viral."),
    f("FEED_26_30_ORG_03", "origin", "Un niño aparece en Valdoria con tu dorsal."),
    f("FEED_26_30_MKT_01", "market", "Un ojeador de otro club aparece en la grada."),
    f("FEED_26_30_MKT_02", "market", "Tu entorno recibe una llamada sin oferta formal."),
    f("FEED_26_30_MKT_03", "market", "Un rumor de traspaso desaparece tan rápido como llegó."),
    f("FEED_26_30_RIV_01", "rivalry", "Adrián marca el mismo día que tú."),
    f("FEED_26_30_RIV_02", "rivalry", "Adrián te menciona positivamente en una entrevista."),
    f("FEED_26_30_RIV_03", "rivalry", "Una estadística os vuelve a comparar en televisión.")
];


// ═══ content/microfeeds/30_34.js ═══
var MICROFEEDS_30_34 = [
    { id: "MF30_001", ageWindow: [30, 33], family: "body", text: "El fisio propone diez minutos extra de descarga.", weight: 9 },
    { id: "MF30_002", ageWindow: [30, 33], family: "body", text: "Dormiste bien, pero las piernas tardan más en responder.", weight: 10 },
    { id: "MF30_003", ageWindow: [30, 33], family: "body", text: "Un test de recuperación contradice tus sensaciones.", weight: 11 },
    { id: "MF30_004", ageWindow: [30, 33], family: "body", text: "El staff reduce una sesión sin llamarlo descanso.", weight: 12 },
    { id: "MF30_005", ageWindow: [30, 33], family: "body", text: "El viaje europeo deja una mañana de recuperación perdida.", weight: 8 },
    { id: "MF30_006", ageWindow: [30, 33], family: "market", text: "Un club pregunta condiciones sin presentar oferta.", weight: 9 },
    { id: "MF30_007", ageWindow: [30, 33], family: "market", text: "Un exentrenador llama para saber si escucharías un proyecto corto.", weight: 10 },
    { id: "MF30_008", ageWindow: [30, 33], family: "market", text: "Tu agente menciona una liga que hace tres años habrías descartado.", weight: 11 },
    { id: "MF30_009", ageWindow: [30, 33], family: "market", text: "Un rumor de regreso a Valdoria dura una tarde.", weight: 12 },
    { id: "MF30_010", ageWindow: [30, 33], family: "market", text: "Una posible oferta desaparece tras el fichaje de otro veterano.", weight: 8 },
    { id: "MF30_011", ageWindow: [30, 33], family: "selection", text: "Una foto oficial te coloca junto a la nueva generación.", weight: 9 },
    { id: "MF30_012", ageWindow: [30, 33], family: "selection", text: "Un compañero joven bate uno de tus récords de precocidad.", weight: 10 },
    { id: "MF30_013", ageWindow: [30, 33], family: "selection", text: "Te liberan de un amistoso y nadie explica si es descanso o jerarquía.", weight: 11 },
    { id: "MF30_014", ageWindow: [30, 33], family: "selection", text: "Otro jugador lleva el brazalete durante veinte minutos.", weight: 12 },
    { id: "MF30_015", ageWindow: [30, 33], family: "selection", text: "La prensa pregunta si el próximo torneo será el último.", weight: 8 },
    { id: "MF30_016", ageWindow: [30, 33], family: "family", text: "Un evento familiar coincide con una concentración.", weight: 9 },
    { id: "MF30_017", ageWindow: [30, 33], family: "family", text: "Por primera vez celebráis no tener que mudaros.", weight: 10 },
    { id: "MF30_018", ageWindow: [30, 33], family: "origin", text: "Una visita breve a Valdoria se convierte en noticia local.", weight: 11 },
    { id: "MF30_019", ageWindow: [30, 33], family: "family", text: "Tus vacaciones se alargan tres días por decisión del staff.", weight: 12 },
    { id: "MF30_020", ageWindow: [30, 33], family: "family", text: "En casa se empieza a valorar más un calendario previsible.", weight: 8 },
    { id: "MF30_021", ageWindow: [30, 33], family: "brand", text: "Una campaña utiliza la palabra leyenda antes de que te guste oírla.", weight: 9 },
    { id: "MF30_022", ageWindow: [30, 33], family: "brand", text: "Una editorial pregunta por una autobiografía que no quieres escribir aún.", weight: 10 },
    { id: "MF30_023", ageWindow: [30, 33], family: "brand", text: "Un sponsor presenta una campaña centrada en jugadores más jóvenes.", weight: 11 },
    { id: "MF30_024", ageWindow: [30, 33], family: "brand", text: "Te invitan a un evento exactamente en tu único día libre.", weight: 12 },
    { id: "MF30_025", ageWindow: [30, 33], family: "origin", text: "Un canterano te pide la camiseta de tu primer dorsal.", weight: 8 },
    { id: "MF30_026", ageWindow: [30, 33], family: "origin", text: "Aparece un mural con una versión de ti de hace diez años.", weight: 9 },
    { id: "MF30_027", ageWindow: [30, 33], family: "origin", text: "Una academia local propone poner tu nombre a un campo.", weight: 10 },
    { id: "MF30_028", ageWindow: [30, 33], family: "press", text: "Te invitan a entregar un premio a un jugador sub-19.", weight: 11 },
    { id: "MF30_029", ageWindow: [30, 33], family: "press", text: "Un documental recupera imágenes de tu convocatoria con 18.", weight: 12 },
    { id: "MF30_030", ageWindow: [30, 33], family: "family", text: "El asesor pide revisar inversiones que ya no caben en una llamada.", weight: 8 },
    { id: "MF30_031", ageWindow: [30, 33], family: "family", text: "Un familiar propone entrar en uno de tus negocios.", weight: 9 },
    { id: "MF30_032", ageWindow: [30, 33], family: "club", text: "Te ofrecen participar económicamente en un proyecto deportivo.", weight: 10 },
    { id: "MF30_033", ageWindow: [30, 33], family: "club", text: "En un entrenamiento pruebas como interior durante veinte minutos.", weight: 11 },
    { id: "MF30_034", ageWindow: [30, 33], family: "body", text: "Tu sesión contiene menos sprints y nadie lo presenta como declive.", weight: 12 },
    { id: "MF30_035", ageWindow: [30, 33], family: "club", text: "Empiezas a ejecutar más balón parado que hace cinco años.", weight: 8 },
    { id: "MF30_036", ageWindow: [30, 33], family: "club", text: "El entrenador te pide dirigir la presión en vez de iniciarla.", weight: 9 },
    { id: "MF30_037", ageWindow: [30, 33], family: "press", text: "Un análisis destaca pases previos al gol que antes nadie medía.", weight: 10 },
    { id: "MF30_038", ageWindow: [30, 33], family: "press", text: "Reaparece un cántico de tus primeras temporadas.", weight: 11 },
    { id: "MF30_039", ageWindow: [30, 33], family: "press", text: "Un niño lleva el dorsal con el que debutaste.", weight: 12 },
    { id: "MF30_040", ageWindow: [30, 33], family: "press", text: "Parte de la grada silba al jugador que entra por ti.", weight: 8 },
    { id: "MF30_041", ageWindow: [30, 33], family: "press", text: "Una pancarta pide que te retires en este club.", weight: 9 },
    { id: "MF30_042", ageWindow: [30, 33], family: "origin", text: "Nano manda una foto antigua de la cantera sin ningún comentario.", weight: 10 }
];


// ═══ content/microfeeds/34_plus.js ═══
var MICROFEEDS_34_PLUS = [
    { id: "MF34_001", ageWindow: [34, null], family: "locker", text: "Señal tardía #1: el entorno cambia sin pedirte una decisión inmediata.", weight: 0.55 },
    { id: "MF34_002", ageWindow: [34, null], family: "press", text: "Señal tardía #2: el entorno cambia sin pedirte una decisión inmediata.", weight: 0.63 },
    { id: "MF34_003", ageWindow: [34, null], family: "brand", text: "Señal tardía #3: el entorno cambia sin pedirte una decisión inmediata.", weight: 0.71 },
    { id: "MF34_004", ageWindow: [34, null], family: "body", text: "Señal tardía #4: el entorno cambia sin pedirte una decisión inmediata.", weight: 0.79 },
    { id: "MF34_005", ageWindow: [34, null], family: "club", text: "Señal tardía #5: el entorno cambia sin pedirte una decisión inmediata.", weight: 0.87 },
    { id: "MF34_006", ageWindow: [34, null], family: "selection", text: "Señal tardía #6: el entorno cambia sin pedirte una decisión inmediata.", weight: 0.55 },
    { id: "MF34_007", ageWindow: [34, null], family: "family", text: "Señal tardía #7: el entorno cambia sin pedirte una decisión inmediata.", weight: 0.63 },
    { id: "MF34_008", ageWindow: [34, null], family: "origin", text: "Señal tardía #8: el entorno cambia sin pedirte una decisión inmediata.", weight: 0.71 },
    { id: "MF34_009", ageWindow: [34, null], family: "market", text: "Señal tardía #9: el entorno cambia sin pedirte una decisión inmediata.", weight: 0.79 },
    { id: "MF34_010", ageWindow: [34, null], family: "rivalry", text: "Señal tardía #10: el entorno cambia sin pedirte una decisión inmediata.", weight: 0.87 },
    { id: "MF34_011", ageWindow: [34, null], family: "locker", text: "Señal tardía #11: el entorno cambia sin pedirte una decisión inmediata.", weight: 0.55 },
    { id: "MF34_012", ageWindow: [34, null], family: "press", text: "Señal tardía #12: el entorno cambia sin pedirte una decisión inmediata.", weight: 0.63 },
    { id: "MF34_013", ageWindow: [34, null], family: "brand", text: "Señal tardía #13: el entorno cambia sin pedirte una decisión inmediata.", weight: 0.71 },
    { id: "MF34_014", ageWindow: [34, null], family: "body", text: "Señal tardía #14: el entorno cambia sin pedirte una decisión inmediata.", weight: 0.79 },
    { id: "MF34_015", ageWindow: [34, null], family: "club", text: "Señal tardía #15: el entorno cambia sin pedirte una decisión inmediata.", weight: 0.87 },
    { id: "MF34_016", ageWindow: [34, null], family: "selection", text: "Señal tardía #16: el entorno cambia sin pedirte una decisión inmediata.", weight: 0.55 },
    { id: "MF34_017", ageWindow: [34, null], family: "family", text: "Señal tardía #17: el entorno cambia sin pedirte una decisión inmediata.", weight: 0.63 },
    { id: "MF34_018", ageWindow: [34, null], family: "origin", text: "Señal tardía #18: el entorno cambia sin pedirte una decisión inmediata.", weight: 0.71 },
    { id: "MF34_019", ageWindow: [34, null], family: "market", text: "Señal tardía #19: el entorno cambia sin pedirte una decisión inmediata.", weight: 0.79 },
    { id: "MF34_020", ageWindow: [34, null], family: "rivalry", text: "Señal tardía #20: el entorno cambia sin pedirte una decisión inmediata.", weight: 0.87 },
    { id: "MF34_021", ageWindow: [34, null], family: "locker", text: "Señal tardía #21: el entorno cambia sin pedirte una decisión inmediata.", weight: 0.55 },
    { id: "MF34_022", ageWindow: [34, null], family: "press", text: "Señal tardía #22: el entorno cambia sin pedirte una decisión inmediata.", weight: 0.63 },
    { id: "MF34_023", ageWindow: [34, null], family: "brand", text: "Señal tardía #23: el entorno cambia sin pedirte una decisión inmediata.", weight: 0.71 },
    { id: "MF34_024", ageWindow: [34, null], family: "body", text: "Señal tardía #24: el entorno cambia sin pedirte una decisión inmediata.", weight: 0.79 },
    { id: "MF34_025", ageWindow: [34, null], family: "club", text: "Señal tardía #25: el entorno cambia sin pedirte una decisión inmediata.", weight: 0.87 },
    { id: "MF34_026", ageWindow: [34, null], family: "selection", text: "Señal tardía #26: el entorno cambia sin pedirte una decisión inmediata.", weight: 0.55 },
    { id: "MF34_027", ageWindow: [34, null], family: "family", text: "Señal tardía #27: el entorno cambia sin pedirte una decisión inmediata.", weight: 0.63 },
    { id: "MF34_028", ageWindow: [34, null], family: "origin", text: "Señal tardía #28: el entorno cambia sin pedirte una decisión inmediata.", weight: 0.71 },
    { id: "MF34_029", ageWindow: [34, null], family: "market", text: "Señal tardía #29: el entorno cambia sin pedirte una decisión inmediata.", weight: 0.79 },
    { id: "MF34_030", ageWindow: [34, null], family: "rivalry", text: "Señal tardía #30: el entorno cambia sin pedirte una decisión inmediata.", weight: 0.87 },
    { id: "MF34_031", ageWindow: [34, null], family: "locker", text: "Señal tardía #31: el entorno cambia sin pedirte una decisión inmediata.", weight: 0.55 },
    { id: "MF34_032", ageWindow: [34, null], family: "press", text: "Señal tardía #32: el entorno cambia sin pedirte una decisión inmediata.", weight: 0.63 },
    { id: "MF34_033", ageWindow: [34, null], family: "brand", text: "Señal tardía #33: el entorno cambia sin pedirte una decisión inmediata.", weight: 0.71 },
    { id: "MF34_034", ageWindow: [34, null], family: "body", text: "Señal tardía #34: el entorno cambia sin pedirte una decisión inmediata.", weight: 0.79 },
    { id: "MF34_035", ageWindow: [34, null], family: "club", text: "Señal tardía #35: el entorno cambia sin pedirte una decisión inmediata.", weight: 0.87 },
    { id: "MF34_036", ageWindow: [34, null], family: "selection", text: "Señal tardía #36: el entorno cambia sin pedirte una decisión inmediata.", weight: 0.55 },
    { id: "MF34_037", ageWindow: [34, null], family: "family", text: "Señal tardía #37: el entorno cambia sin pedirte una decisión inmediata.", weight: 0.63 },
    { id: "MF34_038", ageWindow: [34, null], family: "origin", text: "Señal tardía #38: el entorno cambia sin pedirte una decisión inmediata.", weight: 0.71 },
    { id: "MF34_039", ageWindow: [34, null], family: "market", text: "Señal tardía #39: el entorno cambia sin pedirte una decisión inmediata.", weight: 0.79 },
    { id: "MF34_040", ageWindow: [34, null], family: "rivalry", text: "Señal tardía #40: el entorno cambia sin pedirte una decisión inmediata.", weight: 0.87 },
    { id: "MF34_041", ageWindow: [34, null], family: "locker", text: "Señal tardía #41: el entorno cambia sin pedirte una decisión inmediata.", weight: 0.55 },
    { id: "MF34_042", ageWindow: [34, null], family: "press", text: "Señal tardía #42: el entorno cambia sin pedirte una decisión inmediata.", weight: 0.63 },
    { id: "MF34_043", ageWindow: [34, null], family: "brand", text: "Señal tardía #43: el entorno cambia sin pedirte una decisión inmediata.", weight: 0.71 },
    { id: "MF34_044", ageWindow: [34, null], family: "body", text: "Señal tardía #44: el entorno cambia sin pedirte una decisión inmediata.", weight: 0.79 },
    { id: "MF34_045", ageWindow: [34, null], family: "club", text: "Señal tardía #45: el entorno cambia sin pedirte una decisión inmediata.", weight: 0.87 },
    { id: "MF34_046", ageWindow: [34, null], family: "selection", text: "Señal tardía #46: el entorno cambia sin pedirte una decisión inmediata.", weight: 0.55 },
    { id: "MF34_047", ageWindow: [34, null], family: "family", text: "Señal tardía #47: el entorno cambia sin pedirte una decisión inmediata.", weight: 0.63 },
    { id: "MF34_048", ageWindow: [34, null], family: "origin", text: "Señal tardía #48: el entorno cambia sin pedirte una decisión inmediata.", weight: 0.71 },
    { id: "MF34_049", ageWindow: [34, null], family: "market", text: "Señal tardía #49: el entorno cambia sin pedirte una decisión inmediata.", weight: 0.79 },
    { id: "MF34_050", ageWindow: [34, null], family: "rivalry", text: "Señal tardía #50: el entorno cambia sin pedirte una decisión inmediata.", weight: 0.87 },
    { id: "MF34_051", ageWindow: [34, null], family: "locker", text: "Señal tardía #51: el entorno cambia sin pedirte una decisión inmediata.", weight: 0.55 },
    { id: "MF34_052", ageWindow: [34, null], family: "press", text: "Señal tardía #52: el entorno cambia sin pedirte una decisión inmediata.", weight: 0.63 },
    { id: "MF34_053", ageWindow: [34, null], family: "brand", text: "Señal tardía #53: el entorno cambia sin pedirte una decisión inmediata.", weight: 0.71 },
    { id: "MF34_054", ageWindow: [34, null], family: "body", text: "Señal tardía #54: el entorno cambia sin pedirte una decisión inmediata.", weight: 0.79 },
    { id: "MF34_055", ageWindow: [34, null], family: "club", text: "Señal tardía #55: el entorno cambia sin pedirte una decisión inmediata.", weight: 0.87 },
    { id: "MF34_056", ageWindow: [34, null], family: "selection", text: "Señal tardía #56: el entorno cambia sin pedirte una decisión inmediata.", weight: 0.55 },
    { id: "MF34_057", ageWindow: [34, null], family: "family", text: "Señal tardía #57: el entorno cambia sin pedirte una decisión inmediata.", weight: 0.63 },
    { id: "MF34_058", ageWindow: [34, null], family: "origin", text: "Señal tardía #58: el entorno cambia sin pedirte una decisión inmediata.", weight: 0.71 },
    { id: "MF34_059", ageWindow: [34, null], family: "market", text: "Señal tardía #59: el entorno cambia sin pedirte una decisión inmediata.", weight: 0.79 },
    { id: "MF34_060", ageWindow: [34, null], family: "rivalry", text: "Señal tardía #60: el entorno cambia sin pedirte una decisión inmediata.", weight: 0.87 },
    { id: "MF34_061", ageWindow: [34, null], family: "locker", text: "Señal tardía #61: el entorno cambia sin pedirte una decisión inmediata.", weight: 0.55 },
    { id: "MF34_062", ageWindow: [34, null], family: "press", text: "Señal tardía #62: el entorno cambia sin pedirte una decisión inmediata.", weight: 0.63 },
    { id: "MF34_063", ageWindow: [34, null], family: "brand", text: "Señal tardía #63: el entorno cambia sin pedirte una decisión inmediata.", weight: 0.71 },
    { id: "MF34_064", ageWindow: [34, null], family: "body", text: "Señal tardía #64: el entorno cambia sin pedirte una decisión inmediata.", weight: 0.79 }
];


// ═══ media/media-manager.js ═══
function resolvePresentation(spec, manifest) {
    if (!spec?.assets?.length)
        return [];
    const byId = new Map(manifest.map(x => [x.id, x]));
    return spec.assets.map(ref => {
        const asset = byId.get(ref.id) ?? null;
        const chain = [];
        let fallback = ref.fallbackId ?? asset?.fallbackId;
        const visited = new Set();
        while (fallback && !visited.has(fallback)) {
            visited.add(fallback);
            const hit = byId.get(fallback);
            if (!hit)
                break;
            chain.push(hit);
            fallback = hit.fallbackId;
        }
        return { ref, asset, fallbackChain: chain };
    });
}
function makePreloadPlan(specs, manifest, maxBytes = 5_000_000) {
    const byId = new Map(manifest.map(x => [x.id, x]));
    const priority = { high: 3, normal: 2, low: 1 };
    const candidates = specs.flatMap(spec => (spec?.assets ?? []).map(ref => ({ ref, p: priority[spec?.preloadPriority ?? "normal"] })));
    candidates.sort((a, b) => b.p - a.p);
    const out = [];
    const seen = new Set();
    let bytes = 0;
    for (const c of candidates) {
        if (seen.has(c.ref.id))
            continue;
        const asset = byId.get(c.ref.id);
        if (!asset)
            continue;
        const size = asset.bytesHint ?? 0;
        if (bytes + size > maxBytes)
            continue;
        seen.add(asset.id);
        out.push(asset);
        bytes += size;
    }
    return out;
}


// ═══ save/save.js ═══
var CURRENT_SCHEMA_VERSION = 8;
function serializeSave(state, pretty = false) {
    assertGameState(state);
    return JSON.stringify(state, null, pretty ? 2 : 0);
}
function v3to4(parsed) {
    const club = String(parsed.club ?? "UDV");
    const tier = typeof parsed.tier === "number" ? parsed.tier : 3;
    const world = (parsed.world && typeof parsed.world === "object" ? parsed.world : {});
    const flags = (parsed.flags && typeof parsed.flags === "object" ? parsed.flags : {});
    return { ...parsed, schemaVersion: 4, professional: { ownerClub: String(world.ownerClub ?? club), registrationClub: club, leagueTier: tier, clubPrestigeTier: tier <= 1 ? 3 : tier === 2 ? 2 : 1, clubPrestigeScore: tier <= 1 ? 60 : tier === 2 ? 44 : 28, contractPower: 30, roleSecurity: 35, agentControl: 75, environmentStability: 60, moneyComfort: 12, lockerPower: 18, foreignAdaptation: flags.ABROAD_ROUTE ? 30 : 0, nationalHeat: 8, institutionalTrust: 55, injuryMinutesImpact: flags.LONG_INJURY ? 30 : 0, route: flags.ABROAD_ROUTE ? "abroad" : flags.LOAN_ACTIVE ? "loan" : club === "UDV" ? "home" : "domestic", initializedAt20: Number(parsed.age ?? 18) >= 20 }, flags: { ...flags, PROFESSIONAL_ADAPTED: Number(parsed.age ?? 18) >= 20, CONTRACT_DISPUTE: false, CLUB_RELATION_DAMAGED: false, MEDIA_PROFILE: false, NATIONAL_RADAR: false, FOREIGN_STABLE: false, ROLE_PROMISE_BROKEN: false, TEAMMATE_COVER_CONTEXT: false, DEADLINE_CONTEXT: false, CAPTAIN_ROOM_CONTEXT: false } };
}
function v2to4(parsed) {
    const world = (parsed.world && typeof parsed.world === "object" ? parsed.world : {});
    const flags = (parsed.flags && typeof parsed.flags === "object" ? parsed.flags : {});
    const v3 = { ...parsed, schemaVersion: 3, careerStateTags: [], world: { ...world, ownerClub: typeof world.ownerClub === "string" ? world.ownerClub : String(parsed.club ?? "UDV"), nextCyclePriority: world.nextCyclePriority ?? null, udvSeasonResolved: world.udvSeasonResolved ?? false }, flags: { ...flags, AGENT_ACTIVE: flags.AGENT_ACTIVE ?? false, LOAN_ACTIVE: flags.LOAN_ACTIVE ?? false, LOAN_RETURN: flags.LOAN_RETURN ?? false, CONFLICT_EXIT: flags.CONFLICT_EXIT ?? false, BIG_CLUB: flags.BIG_CLUB ?? false, ABROAD_ROUTE: flags.ABROAD_ROUTE ?? false, ABROAD_STRONG: flags.ABROAD_STRONG ?? false, LOWER_REBUILD: flags.LOWER_REBUILD ?? false, RECOVERING_INJURY: flags.RECOVERING_INJURY ?? false, LONG_INJURY: flags.LONG_INJURY ?? false } };
    return v3to4(v3);
}
function v4to5(parsed) {
    const professional = (parsed.professional && typeof parsed.professional === "object" ? parsed.professional : {});
    const flags = (parsed.flags && typeof parsed.flags === "object" ? parsed.flags : {});
    const age = Number(parsed.age ?? 18);
    const role = Number((parsed.sport?.roleScore) ?? 35);
    const risk = Number((parsed.body?.risk) ?? 20);
    const fatigue = Number((parsed.body?.fatigue) ?? 15);
    const media = Number((parsed.reputation?.mediaHeat) ?? 0);
    const prestige = Number((parsed.reputation?.prestige) ?? 0);
    const market = Number((parsed.reputation?.marketHeat) ?? 0);
    const nationalHeat = Number(professional.nationalHeat ?? 8);
    const migrated = { ...parsed, schemaVersion: 5, professional: { ...professional,
            nationalStanding: Number(professional.nationalStanding ?? Math.max(0, Math.min(100, nationalHeat * 0.55))),
            nationalCaps: Number(professional.nationalCaps ?? 0), nationalRole: String(professional.nationalRole ?? "none"),
            continentalCred: Number(professional.continentalCred ?? 0), bodyLoad: Number(professional.bodyLoad ?? Math.max(0, Math.min(100, risk * .55 + fatigue * .45))),
            commercialPower: Number(professional.commercialPower ?? Math.max(0, Math.min(100, media * .55 + prestige * .30 + market * .15))),
            publicPolarization: Number(professional.publicPolarization ?? Math.max(0, media - market * .45)),
            leagueTierAt23: Number(professional.leagueTierAt23 ?? professional.leagueTier ?? parsed.tier ?? 3),
            clubPrestigeTierAt23: Number(professional.clubPrestigeTierAt23 ?? professional.clubPrestigeTier ?? 1), roleScoreAt23: Number(professional.roleScoreAt23 ?? role),
            initializedAt23: Boolean(professional.initializedAt23 ?? age >= 23)
        }, flags: { ...flags, ADULT_23_ADAPTED: flags.ADULT_23_ADAPTED ?? age >= 23, NATIONAL_GATE_OPEN: flags.NATIONAL_GATE_OPEN ?? false, NATIONAL_CALLED: flags.NATIONAL_CALLED ?? false, NATIONAL_REGULAR: flags.NATIONAL_REGULAR ?? false, NATIONAL_TOURNAMENT_CYCLE: flags.NATIONAL_TOURNAMENT_CYCLE ?? false, CONTINENTAL_CONTEXT: flags.CONTINENTAL_CONTEXT ?? false, CONTINENTAL_REGISTERED: flags.CONTINENTAL_REGISTERED ?? false, HIGH_PROFILE_MATCH: flags.HIGH_PROFILE_MATCH ?? false, STAR_COMPETITION: flags.STAR_COMPETITION ?? false, SUPER_AGENT: flags.SUPER_AGENT ?? false, CLUB_OWNER_CHANGE: flags.CLUB_OWNER_CHANGE ?? false, PUBLIC_PROMISE: flags.PUBLIC_PROMISE ?? false, FINAL_CONTEXT: flags.FINAL_CONTEXT ?? false, CAPTAINCY_WINDOW: flags.CAPTAINCY_WINDOW ?? false, FAMILY_BUSINESS_ACTIVE: flags.FAMILY_BUSINESS_ACTIVE ?? false, PERSONAL_STAFF_ACTIVE: flags.PERSONAL_STAFF_ACTIVE ?? false, WEALTHY_EXIT_ACCEPTED: flags.WEALTHY_EXIT_ACCEPTED ?? false } };
    return migrated;
}
function v5to6(parsed) {
    const professional = (parsed.professional && typeof parsed.professional === "object" ? parsed.professional : {});
    const rng = (parsed.rngState && typeof parsed.rngState === "object" ? parsed.rngState : {});
    const narrative = (rng.narrative && typeof rng.narrative === "object" ? rng.narrative : {});
    const age = Number(parsed.age ?? 18);
    const role = Number((parsed.sport?.roleScore) ?? 35);
    const market = Number((parsed.reputation?.marketHeat) ?? 20);
    const prestige = Number((parsed.reputation?.prestige) ?? 20);
    const media = Number((parsed.reputation?.mediaHeat) ?? 5);
    const bodyLoad = Number(professional.bodyLoad ?? 20);
    const risk = Number((parsed.body?.risk) ?? 20);
    const fatigue = Number((parsed.body?.fatigue) ?? 15);
    const nationalStanding = Number(professional.nationalStanding ?? 0), continental = Number(professional.continentalCred ?? 0), locker = Number(professional.lockerPower ?? 20), instTrust = Number(professional.institutionalTrust ?? 50), contractPower = Number(professional.contractPower ?? 30), agentControl = Number(professional.agentControl ?? 70), roleSecurity = Number(professional.roleSecurity ?? 35), env = Number(professional.environmentStability ?? 55), commercial = Number(professional.commercialPower ?? 5);
    const clamp = (x) => Math.max(0, Math.min(100, x));
    const seed = Number(narrative.seed ?? 20260910);
    const migrated = { ...parsed, schemaVersion: 6, professional: { ...professional,
            peakStatus: Number(professional.peakStatus ?? clamp(role * .34 + market * .25 + prestige * .20 + continental * .12 + nationalStanding * .09)),
            institutionalPower: Number(professional.institutionalPower ?? clamp(locker * .45 + instTrust * .30 + role * .25)),
            trophyCapital: Number(professional.trophyCapital ?? clamp(continental * .38 + nationalStanding * .20 + Math.max(0, Number(professional.clubPrestigeTier ?? 1) - 2) * 8)),
            publicMyth: Number(professional.publicMyth ?? clamp(commercial * .40 + media * .32 + prestige * .28)),
            careerControl: Number(professional.careerControl ?? clamp(contractPower * .42 + agentControl * .28 + roleSecurity * .18 + env * .12)),
            nationalPower: Number(professional.nationalPower ?? clamp(nationalStanding * .70)),
            recoveryMargin: Number(professional.recoveryMargin ?? clamp(100 - bodyLoad * .52 - risk * .30 - fatigue * .18)),
            successionPressure: Number(professional.successionPressure ?? 10), roleAdaptability: Number(professional.roleAdaptability ?? 35), initializedAt26: Boolean(professional.initializedAt26 ?? age >= 26)
        }, rngState: { ...rng, microfeed: (rng.microfeed ?? makeRngStream(seed, 0xFEED2026)) }, microfeeds: Array.isArray(parsed.microfeeds) ? parsed.microfeeds : [] };
    return migrated;
}
function v6to7(parsed) {
    const professional = (parsed.professional && typeof parsed.professional === "object" ? parsed.professional : {});
    const flags = (parsed.flags && typeof parsed.flags === "object" ? parsed.flags : {});
    const age = Number(parsed.age ?? 18), clamp = (x) => Math.max(0, Math.min(100, x));
    const recoveryMargin = Number(professional.recoveryMargin ?? 70), bodyLoad = Number(professional.bodyLoad ?? 20), roleAdaptability = Number(professional.roleAdaptability ?? 35), peak = Number(professional.peakStatus ?? 20), inst = Number(professional.institutionalPower ?? 15), trophy = Number(professional.trophyCapital ?? 0), myth = Number(professional.publicMyth ?? 5), nPower = Number(professional.nationalPower ?? 0);
    const migrated = { ...parsed, schemaVersion: 7, professional: { ...professional, veteranLeverage: Number(professional.veteranLeverage ?? 20), statusInertia: Number(professional.statusInertia ?? peak), recoveryDebt: Number(professional.recoveryDebt ?? clamp(bodyLoad * .55 + (100 - recoveryMargin) * .25)), matchSelectivity: Number(professional.matchSelectivity ?? 25), explosiveness: Number(professional.explosiveness ?? 75), matchEndurance: Number(professional.matchEndurance ?? 74), recoveryBetweenMatches: Number(professional.recoveryBetweenMatches ?? 78), technique: Number(professional.technique ?? clamp(58 + peak * .20)), tacticalReading: Number(professional.tacticalReading ?? clamp(50 + roleAdaptability * .25)), composure: Number(professional.composure ?? clamp(55 + trophy * .15)), availability: Number(professional.availability ?? recoveryMargin), gameSpeedPerception: Number(professional.gameSpeedPerception ?? 68), retirementDistance: Number(professional.retirementDistance ?? 0), motivationReserve: Number(professional.motivationReserve ?? 82), legacyCapital: Number(professional.legacyCapital ?? clamp(trophy * .34 + myth * .28 + inst * .22 + nPower * .16)), homePull: Number(professional.homePull ?? 25), relocationTolerance: Number(professional.relocationTolerance ?? 70), initializedAt30: Boolean(professional.initializedAt30 ?? age >= 30) }, flags: { ...flags, MATURE_30_ADAPTED: flags.MATURE_30_ADAPTED ?? age >= 30, NATIONAL_RETIRED: flags.NATIONAL_RETIRED ?? false, EARLY_RETIRED_30_34: flags.EARLY_RETIRED_30_34 ?? false, RICH_LEAGUE_ROUTE: flags.RICH_LEAGUE_ROUTE ?? false, TRANSATLANTIC_PROJECT: flags.TRANSATLANTIC_PROJECT ?? false, SPECIALIST_ROLE: flags.SPECIALIST_ROLE ?? false, ROLE_REINVENTED_30: flags.ROLE_REINVENTED_30 ?? false, CAPTAIN_MENTOR: flags.CAPTAIN_MENTOR ?? false, HOME_RETURN_30: flags.HOME_RETURN_30 ?? false, ROLLING_CONTRACT: flags.ROLLING_CONTRACT ?? false } };
    return migrated;
}
function v7to8(parsed) {
    const retirement = (parsed.retirement && typeof parsed.retirement === "object" ? parsed.retirement : {});
    const epilogue = (parsed.epilogue && typeof parsed.epilogue === "object" ? parsed.epilogue : {});
    const flags = (parsed.flags && typeof parsed.flags === "object" ? parsed.flags : {});
    const early = flags.EARLY_RETIRED_30_34 === true;
    return { ...parsed, schemaVersion: 8,
        retirement: { status: String(retirement.status ?? (early ? "closed" : "playing")), decidedDate: retirement.decidedDate ?? null, announcedDate: retirement.announcedDate ?? null, closedDate: retirement.closedDate ?? (early ? String(parsed.date ?? null) : null), decisionAge: retirement.decisionAge ?? (early ? Number(parsed.age ?? null) : null), reason: retirement.reason ?? (early ? "early_retirement_30_34" : null), reversals: Number(retirement.reversals ?? 0), noMarketWindows: Number(retirement.noMarketWindows ?? 0), daysInStatus: Number(retirement.daysInStatus ?? 0), closureType: retirement.closureType ?? (early ? "early_retirement" : null) },
        epilogue: { generated: Boolean(epilogue.generated ?? false), families: Array.isArray(epilogue.families) ? epilogue.families : [], milestones: Array.isArray(epilogue.milestones) ? epilogue.milestones : [], summaryKey: epilogue.summaryKey ?? null }
    };
}
function loadSave(raw) {
    const parsed = record(parseSaveJson(raw), "state");
    const version = parsed.schemaVersion;
    ensure(typeof version === "number" && Number.isInteger(version) && version >= 2 && version <= CURRENT_SCHEMA_VERSION, "schemaVersion", "versión no compatible (2–8)");
    validateGameSave(parsed, version);
    let state;
    if (version === 2)
        state = v7to8(v6to7(v5to6(v4to5(v2to4(parsed)))));
    else if (version === 3)
        state = v7to8(v6to7(v5to6(v4to5(v3to4(parsed)))));
    else if (version === 4)
        state = v7to8(v6to7(v5to6(v4to5(parsed))));
    else if (version === 5)
        state = v7to8(v6to7(v5to6(parsed)));
    else if (version === 6)
        state = v7to8(v6to7(parsed));
    else if (version === 7)
        state = v7to8(parsed);
    else
        state = parsed;
    assertGameState(state);
    return state;
}


// ═══ save/validation.js ═══
var MAX_SAVE_BYTES = 8 * 1024 * 1024;
class SaveValidationError extends Error {
    path;
    code = "INVALID_SAVE";
    constructor(path, reason) {
        super(`Guardado no válido en ${path}: ${reason}.`);
        this.path = path;
        this.name = "SaveValidationError";
    }
}
function ensure(ok, path, reason) {
    if (!ok)
        throw new SaveValidationError(path, reason);
}
function record(value, path) {
    ensure(value !== null && typeof value === "object" && !Array.isArray(value), path, "se esperaba un objeto");
    return value;
}
function string(value, path, empty = false) {
    ensure(typeof value === "string" && (empty || value.length > 0) && value.length <= 100_000, path, "se esperaba texto válido");
}
function number(value, path, min = -Number.MAX_VALUE, max = Number.MAX_VALUE) {
    ensure(typeof value === "number" && Number.isFinite(value) && value >= min && value <= max, path, "número ausente, no finito o fuera de rango");
}
function integer(value, path, min = 0, max = Number.MAX_SAFE_INTEGER) {
    number(value, path, min, max);
    ensure(Number.isSafeInteger(value), path, "se esperaba un entero seguro");
}
function boolean(value, path) { ensure(typeof value === "boolean", path, "se esperaba un booleano"); }
function list(value, path) {
    ensure(Array.isArray(value) && value.length <= 50_000, path, "lista ausente o excesiva");
    return value;
}
function strings(value, path) { list(value, path).forEach((x, i) => string(x, `${path}[${i}]`)); }
function oneOf(value, options, path) {
    ensure(typeof value === "string" && options.includes(value), path, "valor desconocido");
}
function date(value, path) {
    string(value, path);
    ensure(/^\d{4}-\d{2}-\d{2}$/.test(value), path, "fecha ISO incorrecta");
    const parsed = new Date(value + "T00:00:00Z");
    ensure(Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value, path, "fecha inexistente");
}
/** Reject non-JSON values, excessive nesting, cycles and dangerous dictionary keys. */
function validateData(value) {
    let nodes = 0;
    const ancestors = new Set();
    const visit = (x, path, depth) => {
        ensure(++nodes <= 300_000 && depth <= 64, path, "estructura demasiado grande o profunda");
        if (x === null || typeof x === "boolean" || x === undefined)
            return; // optional object fields
        if (typeof x === "string") {
            string(x, path, true);
            return;
        }
        if (typeof x === "number") {
            number(x, path);
            return;
        }
        ensure(typeof x === "object", path, "tipo de dato no admitido");
        ensure(!ancestors.has(x), path, "referencia circular");
        ensure(Array.isArray(x) || Object.getPrototypeOf(x) === Object.prototype || Object.getPrototypeOf(x) === null, path, "objeto no serializable");
        ancestors.add(x);
        if (Array.isArray(x)) {
            list(x, path);
            for (let i = 0; i < x.length; i++) {
                const d = Object.getOwnPropertyDescriptor(x, String(i));
                ensure(d && "value" in d && d.value !== undefined, `${path}[${i}]`, "elemento ausente o ejecutable");
                visit(d.value, `${path}[${i}]`, depth + 1);
            }
        }
        else {
            for (const [key, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(x))) {
                ensure(!["__proto__", "constructor", "prototype"].includes(key), path, "clave reservada");
                ensure("value" in descriptor, path, "propiedad ejecutable no admitida");
                visit(descriptor.value, `${path}.${key}`, depth + 1);
            }
        }
        ancestors.delete(x);
    };
    visit(value, "save", 0);
}
function parseSaveJson(raw) {
    ensure(typeof raw === "string" && raw.length <= MAX_SAVE_BYTES, "save", "archivo demasiado grande");
    ensure(new TextEncoder().encode(raw).byteLength <= MAX_SAVE_BYTES, "save", "archivo demasiado grande");
    let parsed;
    try {
        parsed = JSON.parse(raw);
    }
    catch {
        throw new SaveValidationError("save", "JSON incompleto o incorrecto");
    }
    validateData(parsed);
    return parsed;
}
const phases = ["18_20", "20_23", "23_26", "26_30", "30_34", "34_plus"];
const families = ["preseason", "sport", "team", "captaincy", "press", "agent", "market", "medical", "social", "tactical", "contract", "money", "family", "selection", "image", "life", "legacy", "conditional"];
const proGroups = [
    [4, "leagueTier clubPrestigeTier clubPrestigeScore contractPower roleSecurity agentControl environmentStability moneyComfort lockerPower foreignAdaptation nationalHeat institutionalTrust injuryMinutesImpact".split(" ")],
    [5, "nationalStanding nationalCaps continentalCred bodyLoad commercialPower publicPolarization leagueTierAt23 clubPrestigeTierAt23 roleScoreAt23".split(" ")],
    [6, "peakStatus institutionalPower trophyCapital publicMyth careerControl nationalPower recoveryMargin successionPressure roleAdaptability".split(" ")],
    [7, "veteranLeverage statusInertia recoveryDebt matchSelectivity explosiveness matchEndurance recoveryBetweenMatches technique tacticalReading composure availability gameSpeedPerception retirementDistance motivationReserve legacyCapital homePull relocationTolerance".split(" ")]
];
function numericMap(value, path, min = -Number.MAX_VALUE) {
    for (const [key, x] of Object.entries(record(value, path)))
        number(x, `${path}.${key}`, min);
}
function uniqueIds(rows, key, path) {
    const ids = new Set();
    rows.forEach((x, i) => {
        const r = record(x, `${path}[${i}]`);
        string(r[key], `${path}[${i}].${key}`);
        ensure(!ids.has(r[key]), path, "identificador duplicado");
        ids.add(r[key]);
    });
    return ids;
}
function season(value, path) { string(value, path); ensure(/^\d{4}-\d{2}$/.test(value), path, "temporada incorrecta"); }
/** Validate the input schema BEFORE migration can supply defaults or coerce values. */
function validateGameSave(value, version) {
    validateData(value);
    const s = record(value, "state");
    ensure(s.schemaVersion === version && Number.isInteger(version) && version >= 2 && version <= 8, "schemaVersion", "versión no compatible (2–8)");
    date(s.date, "date");
    integer(s.age, "age", 18);
    season(s.season, "season");
    oneOf(s.phase, phases, "phase");
    const expectedPhase = s.age < 20 ? 0 : s.age < 23 ? 1 : s.age < 26 ? 2 : s.age < 30 ? 3 : s.age < 34 ? 4 : 5;
    ensure(s.phase === phases[expectedPhase], "phase", "no corresponde a la edad");
    for (const key of ["club", "role"])
        string(s[key], key);
    integer(s.tier, "tier", 1);
    if (version >= 3 || s.careerStateTags !== undefined)
        strings(s.careerStateTags, "careerStateTags");
    for (const key of ["contract", "finances", "body", "selection", "reputation", "control", "sport", "world", "personality", "flags", "eventCooldowns", "familyLastSeen", "narrativePressure"])
        record(s[key], key);
    const requiredNumbers = {
        contract: ["monthsRemaining", "salaryMonthly"], finances: ["cash"], body: ["risk", "fatigue", "fitness"],
        reputation: ["prestige", "mediaHeat", "marketHeat"], control: ["career", "agentDependency"],
        sport: ["roleScore", "minutesShare", "form", "appearances"], personality: ["reserve", "impulsivity", "ambition", "professionalism"]
    };
    for (const [group, keys] of Object.entries(requiredNumbers)) {
        const r = record(s[group], group);
        for (const k of keys)
            number(r[k], `${group}.${k}`, group === "finances" ? -Number.MAX_VALUE : 0, ["body", "reputation", "control", "personality", "sport"].includes(group) && k !== "appearances" ? 100 : Number.MAX_VALUE);
    }
    const contract = record(s.contract, "contract");
    integer(contract.monthsRemaining, "contract.monthsRemaining");
    number(contract.salaryMonthly, "contract.salaryMonthly", 0);
    if (contract.releaseClause !== undefined && contract.releaseClause !== null)
        number(contract.releaseClause, "contract.releaseClause", 0);
    boolean(record(s.body, "body").acuteInjury, "body.acuteInjury");
    string(record(s.sport, "sport").positionIdentity, "sport.positionIdentity");
    integer(record(s.sport, "sport").appearances, "sport.appearances");
    numericMap(s.personality, "personality");
    numericMap(s.narrativePressure, "narrativePressure");
    for (const [k, x] of Object.entries(record(s.flags, "flags")))
        boolean(x, `flags.${k}`);
    for (const [k, x] of Object.entries(record(s.eventCooldowns, "eventCooldowns")))
        integer(x, `eventCooldowns.${k}`);
    for (const [k, x] of Object.entries(record(s.familyLastSeen, "familyLastSeen"))) {
        oneOf(k, families, "familyLastSeen");
        integer(x, `familyLastSeen.${k}`);
    }
    const runtime = record(s.runtime, "runtime");
    for (const k of ["day", "seasonDay", "daysSinceNarrative", "eventsThisSeason"])
        integer(runtime[k], `runtime.${k}`);
    const rng = record(s.rngState, "rngState");
    for (const name of ["narrative", "football", "qa", ...(version >= 6 || rng.microfeed !== undefined ? ["microfeed"] : [])]) {
        const r = record(rng[name], `rngState.${name}`);
        integer(r.seed, `rngState.${name}.seed`, -Number.MAX_SAFE_INTEGER);
        // Existing streams accumulate beyond uint32; never truncate or reseed them.
        integer(r.state, `rngState.${name}.state`);
        integer(r.draws, `rngState.${name}.draws`);
    }
    if (version >= 4 || s.professional !== undefined) {
        const p = record(s.professional, "professional");
        for (const k of ["ownerClub", "registrationClub"])
            string(p[k], `professional.${k}`);
        oneOf(p.route, ["home", "loan", "abroad", "domestic", "free_agent"], "professional.route");
        for (const [introduced, keys] of proGroups)
            for (const k of keys)
                if (version >= introduced || p[k] !== undefined) {
                    if (k === "nationalCaps")
                        integer(p[k], `professional.${k}`);
                    else if (["leagueTier", "clubPrestigeTier", "leagueTierAt23", "clubPrestigeTierAt23"].includes(k))
                        integer(p[k], `professional.${k}`, 1, 5);
                    else
                        number(p[k], `professional.${k}`, 0, 100);
                }
        for (const [introduced, k] of [[4, "initializedAt20"], [5, "initializedAt23"], [6, "initializedAt26"], [7, "initializedAt30"]])
            if (version >= introduced || p[k] !== undefined)
                boolean(p[k], `professional.${k}`);
        if (version >= 5 || p.nationalRole !== undefined)
            oneOf(p.nationalRole, ["none", "fringe", "rotation", "regular"], "professional.nationalRole");
    }
    const relations = list(s.relationships, "relationships"), npcs = list(s.npcs, "npcs");
    const relIds = uniqueIds(relations, "npcId", "relationships"), npcIds = uniqueIds(npcs, "id", "npcs");
    for (const npc of NPC_CATALOG)
        ensure(relIds.has(npc.id) && npcIds.has(npc.id), "npcs/relationships", `falta ${npc.id}`);
    relations.forEach((x, i) => {
        const r = record(x, `relationships[${i}]`);
        for (const k of ["trust", "affinity", "respect", "resentment", "leverage"])
            number(r[k], `relationships[${i}].${k}`, 0, 100);
        strings(r.memories, `relationships[${i}].memories`);
    });
    npcs.forEach((x, i) => {
        const r = record(x, `npcs[${i}]`), path = `npcs[${i}]`;
        string(r.role, path + ".role");
        string(r.careerState, path + ".careerState");
        if (r.club !== null)
            string(r.club, path + ".club");
        numericMap(r.trustAxes, path + ".trustAxes");
        record(r.knowledge, path + ".knowledge");
        strings(r.agenda, path + ".agenda");
        strings(r.memories, path + ".memories");
        number(r.reliability, path + ".reliability", 0, 100);
        number(r.access, path + ".access", 0, 100);
    });
    list(s.seeds, "seeds").forEach((x, i) => {
        const r = record(x, `seeds[${i}]`), path = `seeds[${i}]`;
        for (const k of ["id", "originEvent"])
            string(r[k], path + "." + k);
        season(r.originSeason, path + ".originSeason");
        oneOf(r.state, ["dormant", "active", "transformed", "resolved", "expired"], path + ".state");
        number(r.intensity, path + ".intensity", 0, 100);
        strings(r.npcRefs, path + ".npcRefs");
        record(r.payload, path + ".payload");
        for (const k of ["expiresAfter", "lastTouchedDate"])
            if (r[k] !== undefined)
                date(r[k], path + "." + k);
        if (r.consumedBy !== undefined)
            string(r.consumedBy, path + ".consumedBy");
    });
    let previousDate = "";
    list(s.history, "history").forEach((x, i) => {
        const r = record(x, `history[${i}]`), path = `history[${i}]`;
        for (const k of ["eventId", "choiceId", "outcomeId", "club"])
            string(r[k], path + "." + k);
        date(r.date, path + ".date");
        ensure(r.date >= previousDate && r.date <= s.date, path + ".date", "historial fuera de orden o en el futuro");
        previousDate = r.date;
        season(r.season, path + ".season");
        record(r.snapshot, path + ".snapshot");
        number(r.salience, path + ".salience", 0, 100);
        oneOf(r.visibility, ["public", "private", "hidden"], path + ".visibility");
    });
    if (version >= 6 || s.microfeeds !== undefined)
        list(s.microfeeds, "microfeeds").forEach((x, i) => {
            const r = record(x, `microfeeds[${i}]`), path = `microfeeds[${i}]`;
            for (const k of ["id", "text", "family"])
                string(r[k], path + "." + k);
            date(r.date, path + ".date");
            if (r.mediaId !== undefined)
                string(r.mediaId, path + ".mediaId");
        });
    if (version >= 8 || s.retirement !== undefined) {
        const r = record(s.retirement, "retirement");
        oneOf(r.status, ["playing", "decided", "announced", "closed"], "retirement.status");
        for (const k of ["decidedDate", "announcedDate", "closedDate"])
            if (r[k] !== null) {
                date(r[k], `retirement.${k}`);
                ensure(r[k] <= s.date, `retirement.${k}`, "fecha futura");
            }
        for (const k of ["reversals", "noMarketWindows", "daysInStatus"])
            integer(r[k], `retirement.${k}`);
        if (r.decisionAge !== null)
            integer(r.decisionAge, "retirement.decisionAge", 18, s.age);
        for (const k of ["reason", "closureType"])
            if (r[k] !== null)
                string(r[k], `retirement.${k}`);
        if (r.status === "closed")
            ensure(r.closedDate !== null && r.closureType !== null, "retirement", "cierre sin fecha o tipo");
        else
            ensure(r.closedDate === null, "retirement.closedDate", "carrera abierta con fecha de cierre");
    }
    if (version >= 8 || s.epilogue !== undefined) {
        const e = record(s.epilogue, "epilogue");
        boolean(e.generated, "epilogue.generated");
        strings(e.families, "epilogue.families");
        strings(e.milestones, "epilogue.milestones");
        if (e.summaryKey !== null)
            string(e.summaryKey, "epilogue.summaryKey");
        if (e.generated)
            ensure(record(s.retirement, "retirement").status === "closed" && e.families.length >= 2, "epilogue", "epílogo sin carrera cerrada o familias");
    }
}
function assertGameState(value) { validateGameSave(value, 8); }


// ═══ save/validate-save.js ═══
/**
 * T2.2 · Structural validation for saves and session snapshots.
 *
 * Rejects corrupt, truncated, future-version and structurally invalid data
 * with descriptive error codes. Never modifies the incoming object.
 * Migration is handled by save.ts; this module validates *after* migration.
 */
class SaveValidationError extends Error {
    code;
    constructor(code, message) {
        super(message);
        this.code = code;
        this.name = "SaveValidationError";
    }
}
function fail(code, message) {
    throw new SaveValidationError(code, message);
}
function isObj(x) {
    return x !== null && typeof x === "object" && !Array.isArray(x);
}
function isFiniteNumber(x) {
    return typeof x === "number" && Number.isFinite(x);
}
function requireFinite(value, label) {
    if (!isFiniteNumber(value)) {
        fail("INVALID_FIELD", `${label} debe ser un número finito, recibido: ${String(value)}`);
    }
}
function requireString(value, label) {
    if (typeof value !== "string" || value.length === 0) {
        fail("INVALID_FIELD", `${label} debe ser una cadena no vacía.`);
    }
}
function requireArray(value, label) {
    if (!Array.isArray(value)) {
        fail("INVALID_FIELD", `${label} debe ser un array.`);
    }
}
// ── RNG stream ──────────────────────────────────────────────────────────
function validateRngStream(stream, label) {
    if (!isObj(stream))
        fail("INVALID_RNG", `${label}: stream RNG ausente o no es objeto.`);
    const { seed, state, draws } = stream;
    requireFinite(seed, `${label}.seed`);
    requireFinite(state, `${label}.state`);
    requireFinite(draws, `${label}.draws`);
    if (draws < 0)
        fail("INVALID_RNG", `${label}.draws no puede ser negativo.`);
}
// ── GameState ───────────────────────────────────────────────────────────
const VALID_PHASES = ["18_20", "20_23", "23_26", "26_30", "30_34", "34_plus"];
const RETIREMENT_STATUSES = ["playing", "decided", "announced", "closed"];
function validateGameState(s) {
    if (!isObj(s))
        fail("INVALID_SAVE", "El estado del juego no es un objeto válido.");
    // ── Schema version ──
    const version = s.schemaVersion;
    if (!isFiniteNumber(version))
        fail("INVALID_SAVE", "Falta schemaVersion o no es un número.");
    if (version > CURRENT_SCHEMA_VERSION)
        fail("FUTURE_VERSION", `Schema ${version} es posterior al soportado (${CURRENT_SCHEMA_VERSION}).`);
    if (version !== CURRENT_SCHEMA_VERSION)
        fail("INCOMPATIBLE_SCHEMA", `Schema ${version} no es la versión actual (${CURRENT_SCHEMA_VERSION}). Usa loadSave para migrar antes de validar.`);
    // ── Top-level scalars ──
    const state = s;
    requireString(state.date, "date");
    requireFinite(state.age, "age");
    if (state.age < 0 || state.age > 100)
        fail("INVALID_FIELD", "age fuera de rango razonable (0–100).");
    requireString(state.season, "season");
    if (!VALID_PHASES.includes(state.phase))
        fail("INVALID_FIELD", `phase '${String(state.phase)}' no es una fase válida.`);
    requireString(state.club, "club");
    requireFinite(state.tier, "tier");
    requireString(state.role, "role");
    // ── Required objects ──
    if (!isObj(state.professional))
        fail("INVALID_SAVE", "Falta el objeto professional.");
    if (!isObj(state.runtime))
        fail("INVALID_SAVE", "Falta el objeto runtime.");
    if (!isObj(state.retirement))
        fail("INVALID_SAVE", "Falta el objeto retirement.");
    if (!isObj(state.epilogue))
        fail("INVALID_SAVE", "Falta el objeto epilogue.");
    if (!isObj(state.contract))
        fail("INVALID_SAVE", "Falta el objeto contract.");
    if (!isObj(state.finances))
        fail("INVALID_SAVE", "Falta el objeto finances.");
    if (!isObj(state.body))
        fail("INVALID_SAVE", "Falta el objeto body.");
    if (!isObj(state.selection))
        fail("INVALID_SAVE", "Falta el objeto selection.");
    if (!isObj(state.reputation))
        fail("INVALID_SAVE", "Falta el objeto reputation.");
    if (!isObj(state.control))
        fail("INVALID_SAVE", "Falta el objeto control.");
    if (!isObj(state.sport))
        fail("INVALID_SAVE", "Falta el objeto sport.");
    if (!isObj(state.world))
        fail("INVALID_SAVE", "Falta el objeto world.");
    if (!isObj(state.personality))
        fail("INVALID_SAVE", "Falta el objeto personality.");
    if (!isObj(state.flags))
        fail("INVALID_SAVE", "Falta el objeto flags.");
    if (!isObj(state.eventCooldowns))
        fail("INVALID_SAVE", "Falta el objeto eventCooldowns.");
    if (!isObj(state.narrativePressure))
        fail("INVALID_SAVE", "Falta el objeto narrativePressure.");
    // ── Required arrays ──
    requireArray(state.careerStateTags, "careerStateTags");
    requireArray(state.relationships, "relationships");
    requireArray(state.npcs, "npcs");
    requireArray(state.seeds, "seeds");
    requireArray(state.history, "history");
    requireArray(state.microfeeds, "microfeeds");
    // ── Runtime ──
    const rt = state.runtime;
    requireFinite(rt.day, "runtime.day");
    requireFinite(rt.seasonDay, "runtime.seasonDay");
    requireFinite(rt.daysSinceNarrative, "runtime.daysSinceNarrative");
    requireFinite(rt.eventsThisSeason, "runtime.eventsThisSeason");
    // ── Retirement ──
    const ret = state.retirement;
    if (!RETIREMENT_STATUSES.includes(ret.status))
        fail("INVALID_FIELD", `retirement.status '${String(ret.status)}' no es válido.`);
    requireFinite(ret.reversals, "retirement.reversals");
    requireFinite(ret.noMarketWindows, "retirement.noMarketWindows");
    requireFinite(ret.daysInStatus, "retirement.daysInStatus");
    // ── Epilogue ──
    const epi = state.epilogue;
    if (typeof epi.generated !== "boolean")
        fail("INVALID_FIELD", "epilogue.generated debe ser booleano.");
    requireArray(epi.families, "epilogue.families");
    requireArray(epi.milestones, "epilogue.milestones");
    // ── RNG state ──
    if (!isObj(state.rngState))
        fail("INVALID_RNG", "Falta rngState.");
    const rng = state.rngState;
    validateRngStream(rng.narrative, "rngState.narrative");
    validateRngStream(rng.football, "rngState.football");
    validateRngStream(rng.microfeed, "rngState.microfeed");
    validateRngStream(rng.qa, "rngState.qa");
    // ── Professional: spot-check key numeric fields for NaN/Infinity ──
    const pro = state.professional;
    for (const key of [
        "leagueTier", "clubPrestigeTier", "clubPrestigeScore", "contractPower",
        "roleSecurity", "bodyLoad", "recoveryMargin", "motivationReserve",
        "retirementDistance", "legacyCapital", "explosiveness", "matchEndurance"
    ]) {
        requireFinite(pro[key], `professional.${key}`);
    }
    // ── History entries: spot-check structure ──
    const history = state.history;
    for (let i = 0; i < Math.min(history.length, 5); i++) {
        const h = history[i];
        if (!isObj(h))
            fail("CORRUPT_SAVE", `history[${i}] no es un objeto válido.`);
        const entry = h;
        requireString(entry.eventId, `history[${i}].eventId`);
        requireString(entry.date, `history[${i}].date`);
        requireString(entry.choiceId, `history[${i}].choiceId`);
        requireString(entry.outcomeId, `history[${i}].outcomeId`);
    }
    // Also spot-check the last few entries for long histories
    if (history.length > 5) {
        for (let i = Math.max(5, history.length - 3); i < history.length; i++) {
            const h = history[i];
            if (!isObj(h))
                fail("CORRUPT_SAVE", `history[${i}] no es un objeto válido.`);
            const entry = h;
            requireString(entry.eventId, `history[${i}].eventId`);
            requireString(entry.date, `history[${i}].date`);
        }
    }
}
function validateSnapshotEnvelope(raw) {
    if (!isObj(raw))
        fail("CORRUPT_SAVE", "El snapshot no es un objeto válido.");
    const snap = raw;
    // ── Envelope fields ──
    requireFinite(snap.sessionVersion, "sessionVersion");
    requireString(snap.build, "build");
    requireString(snap.contentIdentity, "contentIdentity");
    requireString(snap.sessionId, "sessionId");
    requireFinite(snap.revision, "revision");
    if (snap.revision < 0)
        fail("INVALID_FIELD", "revision no puede ser negativa.");
    if (typeof snap.microfeeds !== "boolean")
        fail("INVALID_FIELD", "microfeeds debe ser booleano.");
    if (typeof snap.needsWorldAdvance !== "boolean")
        fail("INVALID_FIELD", "needsWorldAdvance debe ser booleano.");
    // ── Pending state coherence ──
    if (snap.pendingDecision !== null && snap.pendingDecision !== undefined && !isObj(snap.pendingDecision)) {
        fail("INVALID_SAVE", "pendingDecision debe ser null o un objeto válido.");
    }
    if (snap.pendingResult !== null && snap.pendingResult !== undefined && !isObj(snap.pendingResult)) {
        fail("INVALID_SAVE", "pendingResult debe ser null o un objeto válido.");
    }
    if (snap.pendingDecision && snap.pendingResult) {
        fail("INVALID_SAVE", "No puede haber decisión y resultado pendientes simultáneamente.");
    }
    // ── Arrays ──
    requireArray(snap.receipts, "receipts");
    requireArray(snap.journal, "journal");
    // ── Inner GameState ──
    validateGameState(snap.state);
}
// ── Raw JSON parsing with corruption detection ──────────────────────
function parseSaveJson(raw) {
    if (typeof raw !== "string" || raw.length === 0) {
        fail("CORRUPT_SAVE", "Datos de guardado vacíos.");
    }
    try {
        return JSON.parse(raw);
    }
    catch (e) {
        fail("CORRUPT_SAVE", `JSON no válido: ${e.message}`);
    }
}


// ═══ narrative/event-index.js ═══
class EventIndex {
    events;
    byPhase = new Map();
    byFamily = new Map();
    byAge = new Map();
    constructor(events) {
        this.events = events;
        for (const e of events) {
            this.byPhase.set(e.phase, [...(this.byPhase.get(e.phase) ?? []), e]);
            this.byFamily.set(e.family, [...(this.byFamily.get(e.family) ?? []), e]);
            const max = Math.min(45, e.ageWindow[1] ?? 45);
            for (let age = e.ageWindow[0]; age <= max; age++) {
                this.byAge.set(age, [...(this.byAge.get(age) ?? []), e]);
            }
        }
    }
    candidates(state) {
        const phaseEvents = this.byPhase.get(state.phase) ?? [];
        return phaseEvents.filter(e => state.age >= e.ageWindow[0] && state.age <= (e.ageWindow[1] ?? Infinity));
    }
    family(family) {
        return this.byFamily.get(family) ?? [];
    }
}


// ═══ narrative/validate.js ═══
function validateEvents(events) {
    const issues = [];
    const ids = new Set();
    for (const e of events) {
        if (ids.has(e.id))
            issues.push({ level: "error", eventId: e.id, message: "Duplicate event ID" });
        ids.add(e.id);
        if (e.choices.length < 2)
            issues.push({ level: "warning", eventId: e.id, message: "Important narrative event has fewer than two choices" });
        const outcomeIds = new Set(e.outcomes.map(o => o.id));
        for (const c of e.choices) {
            for (const id of c.outcomeIds)
                if (!outcomeIds.has(id))
                    issues.push({ level: "error", eventId: e.id, message: `Choice ${c.id} references missing outcome ${id}` });
        }
        for (const o of e.outcomes) {
            if (o.baseWeight < 0)
                issues.push({ level: "error", eventId: e.id, message: `Outcome ${o.id} has negative baseWeight` });
        }
    }
    return issues;
}


// ═══ narrative/tick.js ═══
function advanceNarrativeTick(state) {
    const next = structuredClone(state);
    for (const id of Object.keys(next.eventCooldowns)) {
        next.eventCooldowns[id] = Math.max(0, next.eventCooldowns[id] - 1);
    }
    return next;
}


// ═══ narrative/scheduler.js ═══
function monthOf(date) { return Number(date.slice(5, 7)); }
function phaseAges(state) {
    return state.phase === "18_20" ? ["18", "19"] : state.phase === "20_23" ? ["20", "21", "22"] : state.phase === "23_26" ? ["23", "24", "25"] : state.phase === "26_30" ? ["26", "27", "28", "29"] : state.phase === "30_34" ? ["30", "31", "32", "33"] : state.phase === "34_plus" ? ["34+"] : [];
}
function conditionalCap(state) {
    return state.phase === "18_20" ? 7 : state.phase === "20_23" ? 8 : state.phase === "23_26" ? 9 : state.phase === "26_30" ? 10 : state.phase === "30_34" ? 9 : state.phase === "34_plus" ? 15 : 10;
}
function periodFor(age, m, seed = 0) {
    if (age === 18) {
        if (m === 7 || m === 8)
            return { key: "18_JA", cap: 4 };
        if (m === 9 || m === 10)
            return { key: "18_SO", cap: 1 };
        if (m === 11 || m === 12)
            return { key: "18_ND", cap: 1 };
        if (m === 1 || m === 2)
            return { key: "18_JF", cap: 2 };
        if (m === 3 || m === 4)
            return { key: "18_MA", cap: 1 };
        if (m === 5)
            return { key: "18_MAY", cap: 2 };
        return { key: "18_JUN", cap: 0 };
    }
    if (age === 19) {
        if (m === 7 || m === 8)
            return { key: "19_JA", cap: 2 };
        if (m >= 9 && m <= 11)
            return { key: "19_SON", cap: 1 };
        if (m === 12 || m === 1 || m === 2)
            return { key: "19_DJF", cap: 2 };
        if (m >= 3 && m <= 5)
            return { key: "19_MAM", cap: 1 };
        return { key: "19_JUN", cap: 0 };
    }
    if (age >= 20 && age <= 22) {
        if (m === 7 || m === 8)
            return { key: `${age}_JA`, cap: 2 };
        if (m >= 9 && m <= 11)
            return { key: `${age}_SON`, cap: 1 };
        if (m === 12 || m === 1 || m === 2)
            return { key: `${age}_DJF`, cap: 2 };
        if (m >= 3 && m <= 5)
            return { key: `${age}_MAM`, cap: 1 };
        return { key: `${age}_JUN`, cap: 1 };
    }
    if (age >= 23 && age <= 25) {
        if (m === 7 || m === 8)
            return { key: `${age}_JA`, cap: 2 };
        if (m >= 9 && m <= 11)
            return { key: `${age}_SON`, cap: 1 };
        if (m === 12 || m === 1 || m === 2)
            return { key: `${age}_DJF`, cap: 2 };
        if (m >= 3 && m <= 5)
            return { key: `${age}_MAM`, cap: 2 };
        return { key: `${age}_JUN`, cap: 1 };
    }
    if (age >= 26 && age <= 29) {
        if (m === 7 || m === 8)
            return { key: `${age}_JA`, cap: 1 };
        if (m >= 9 && m <= 11)
            return { key: `${age}_SON`, cap: 1 };
        if (m === 12)
            return { key: `${age}_DEC`, cap: 1 };
        if (m === 1 || m === 2)
            return { key: `${age}_JF`, cap: 1 };
        if (m >= 3 && m <= 5)
            return { key: `${age}_MAM`, cap: 2 };
        return { key: `${age}_JUN`, cap: 0 };
    }
    if (age >= 30 && age <= 33) {
        const code = m === 7 || m === 8 ? "JA" : m === 9 ? "SEP" : m === 10 || m === 11 ? "ON" : m === 12 || m === 1 || m === 2 ? "DJF" : m >= 3 && m <= 5 ? "MAM" : "JUN";
        if (code === "JUN")
            return { key: `${age}_JUN`, cap: 0 };
        // Cada temporada madura reserva solo cuatro de cinco ventanas ordinarias.
        // La ventana omitida depende de seed+edad: reduce saturación sin condenar siempre los eventos tardíos.
        const windows = ["JA", "SEP", "ON", "DJF", "MAM"];
        const mixed = ((seed >>> 0) ^ Math.imul(age, 0x9E3779B1)) >>> 0;
        const skipped = windows[mixed % windows.length];
        return { key: `${age}_${code}`, cap: code === skipped ? 0 : 1 };
    }
    if (age >= 34) {
        return { key: `${age}_M${String(m).padStart(2, "0")}`, cap: 1 };
    }
    return { key: "other", cap: Infinity };
}
function buildContext(state) {
    const ages = phaseAges(state), cap = conditionalCap(state), month = monthOf(state.date), seed = state.rngState.narrative.seed, currentPeriod = periodFor(state.age, month, seed);
    let conditionalCount = 0, periodCount = 0, finalPrincipalCount = 0, agePrincipalCount = 0;
    for (const h of state.history) {
        if (h.eventId.startsWith("CEVT_")) {
            if (state.phase === "34_plus") {
                if (Number(h.snapshot.age ?? 0) >= 34)
                    conditionalCount++;
            }
            else if (ages.some(a => h.eventId.startsWith(`CEVT_${a}_`)))
                conditionalCount++;
        }
        const hAge = Number(h.snapshot.age ?? 0);
        const principal34Plus = hAge >= 34 && !h.eventId.startsWith("CEVT_") && !String(h.eventId).startsWith("EVT_RET_");
        if (principal34Plus)
            finalPrincipalCount++;
        if (principal34Plus && hAge === state.age)
            agePrincipalCount++;
        if (!h.eventId.startsWith("CEVT_") && h.snapshot.age === state.age && periodFor(state.age, Number(h.date.slice(5, 7)), seed).key === currentPeriod.key)
            periodCount++;
    }
    const activeSeedIds = new Set(state.seeds.filter(s => s.state === "active" || s.state === "dormant" || s.state === "transformed").map(s => s.id));
    const relationMax = new Map(state.relationships.map(r => [r.npcId, Math.max(r.trust, r.affinity, r.respect, r.resentment, r.leverage)]));
    return { month, recent3: state.history.slice(-3), recent6: state.history.slice(-6), conditionalCount, conditionalCap: cap, currentPeriod, periodCount, activeSeedIds, relationMax, finalPrincipalCount, agePrincipalCount };
}
function inTimeWindow(state, event, ctx) {
    const w = event.timeWindow;
    if (!w)
        return true;
    if (w.months && !w.months.includes(ctx.month))
        return false;
    if (w.minSeasonDay !== undefined && state.runtime.seasonDay < w.minSeasonDay)
        return false;
    if (w.maxSeasonDay !== undefined && state.runtime.seasonDay > w.maxSeasonDay)
        return false;
    return true;
}
function rhythmPass(state, event, options, ctx) {
    if (options.ignoreRhythmGate || (event.tags ?? []).includes("hard_deadline"))
        return true;
    if ((event.tags ?? []).includes("retirement_terminal"))
        return state.runtime.daysSinceNarrative >= 1;
    const minGap = event.family === "sport" ? 3 : 5;
    if (state.runtime.daysSinceNarrative < minGap)
        return false;
    if (event.family === "conditional" && ctx.recent3.at(-1)?.snapshot.family === "conditional")
        return false;
    const sameHeavy = ctx.recent3.filter(h => h.snapshot.family === event.family).length;
    if ((event.family === "medical" || event.family === "contract") && sameHeavy >= 2)
        return false;
    return true;
}
function isEligible(state, event, options, ctx) {
    const maxAge = event.ageWindow[1] ?? Infinity;
    if (state.age < event.ageWindow[0] || state.age > maxAge || state.phase !== event.phase)
        return false;
    if (state.phase === "34_plus" && event.family !== "conditional" && !(event.tags ?? []).includes("retirement_terminal")) {
        if (ctx.finalPrincipalCount >= 20)
            return false;
        const ageCap = state.age === 34 ? 6 : state.age === 35 ? 5 : state.age === 36 ? 4 : state.age === 37 ? 3 : 2;
        if (ctx.agePrincipalCount >= ageCap)
            return false;
        const m = monthOf(state.date);
        const q = m >= 7 && m <= 9 ? 0 : m >= 10 && m <= 12 ? 1 : m >= 1 && m <= 3 ? 2 : 3;
        const quarterSlots = state.age === 34 ? [2, 1, 1, 2] : state.age === 35 ? [1, 1, 1, 2] : state.age === 36 ? [1, 1, 1, 1] : state.age === 37 ? [1, 0, 1, 1] : [1, 0, 1, 0];
        const slots = quarterSlots[q];
        if (slots === 0)
            return false;
        const months = q === 0 ? [7, 8, 9] : q === 1 ? [10, 11, 12] : q === 2 ? [1, 2, 3] : [4, 5, 6];
        const mixed = ((state.rngState.narrative.seed >>> 0) ^ Math.imul(state.age + q * 17, 0x9E3779B1)) >>> 0;
        const closed = months[mixed % 3];
        const openMonths = slots >= 3 ? months : slots === 2 ? months.filter(x => x !== closed) : [months[mixed % 3]];
        if (!openMonths.includes(m))
            return false;
    }
    if ((state.eventCooldowns[event.id] ?? 0) > 0 || (!event.repeatable && state.flags[`SEEN_${event.id}`] === true))
        return false;
    if (event.family === "conditional" && ctx.conditionalCount >= ctx.conditionalCap)
        return false;
    const budgetExempt = (event.tags ?? []).includes("hard_deadline") || ["EVT_19_FIN_001", "EVT_18_SUM_001", "EVT_22_END_001", "EVT_22_DDL_001", "EVT_25_END_001", "EVT_23_JAN_001", "EVT_29_FIN_001", "EVT_30_FINAL_001", "EVT_31_RETURN_001", "EVT_31_FINAL_001", "EVT_32_BOS_001", "EVT_33_RET_001", "EVT_33_END_001"].includes(event.id);
    if (event.family !== "conditional" && !budgetExempt && ctx.periodCount >= ctx.currentPeriod.cap)
        return false;
    if (!inTimeWindow(state, event, ctx) || !conditionsPass(state, event.gates))
        return false;
    if (event.exclusions && event.exclusions.some(c => conditionsPass(state, [c])))
        return false;
    return rhythmPass(state, event, options, ctx);
}
function contentNeed(state, event, tick) { const last = state.familyLastSeen[event.family]; if (last === undefined)
    return 1.22; const gap = Math.max(0, tick - last); return Math.min(1.45, .78 + gap / 35); }
function relevance(event, ctx) { const seedHits = (event.seedsRead ?? []).filter(id => ctx.activeSeedIds.has(id)).length; const npcHits = (event.npcRefs ?? []).filter(id => (ctx.relationMax.get(id) ?? 0) >= 60).length; return 1 + seedHits * .30 + npcHits * .10; }
function novelty(event, ctx) { const repeatedNpc = (event.npcRefs ?? []).some(id => ctx.recent6.some(h => Array.isArray(h.snapshot.npcRefs) && h.snapshot.npcRefs.includes(id))); const sameFamilyCount = ctx.recent6.filter(h => h.snapshot.family === event.family).length; let factor = 1; if (repeatedNpc)
    factor *= .76; factor *= Math.max(.42, 1 - sameFamilyCount * .17); return factor; }
function arcPressure(state, event) { const keys = event.tags ?? []; if (!keys.length)
    return 1; const p = keys.reduce((sum, k) => sum + (state.narrativePressure[k] ?? 0), 0) / keys.length; return 1 + Math.min(.6, Math.max(-.4, p / 100)); }
function routeCoverage(state, event) { const prestige = Number(state.reputation.prestige ?? 0), elite = (event.tags ?? []).includes("elite"), modest = (event.tags ?? []).includes("modest_route"); if (prestige >= 80 && elite)
    return .72; if (prestige < 45 && modest)
    return 1.32; return 1; }
function conditionalDensity(state, event, ctx) {
    if (event.family !== "conditional")
        return 1;
    const count = ctx.conditionalCount, cap = ctx.conditionalCap;
    if (count >= cap)
        return .08;
    if (state.phase === "20_23") {
        if (count < 2)
            return 2.8;
        if (count < 5)
            return 2.15;
        if (count < 8)
            return 1.25;
    }
    if (state.phase === "23_26") {
        if (count < 3)
            return 2.7;
        if (count < 6)
            return 2.0;
        if (count < 9)
            return 1.18;
    }
    if (state.phase === "26_30") {
        if (count < 4)
            return 2.15;
        if (count < 7)
            return 1.55;
        if (count < 10)
            return .95;
    }
    if (state.phase === "30_34") {
        if (count < 3)
            return 2.35;
        if (count < 6)
            return 1.65;
        if (count < 9)
            return 1.0;
    }
    if (state.phase === "34_plus") {
        if (count < 4)
            return 2.15;
        if (count < 9)
            return 1.45;
        if (count < 15)
            return .95;
        return .2;
    }
    if (count < 2)
        return 2.35;
    if (count < 4)
        return state.age >= 19 ? 2.15 : 1.85;
    if (count < cap)
        return 1.15;
    return .82;
}
function lateOpportunity(state, event) {
    if (state.phase !== "34_plus" || (event.tags ?? []).includes("retirement_terminal"))
        return 1;
    if (state.flags[`SEEN_${event.id}`] === true)
        return 1;
    const overdue = Math.max(0, state.age - event.ageWindow[0]);
    return Math.min(3.2, 1 + overdue * .42);
}
function density(state) { if (state.runtime.daysSinceNarrative >= 28)
    return 1.3; if (state.runtime.daysSinceNarrative >= 14)
    return 1.15; if (state.runtime.daysSinceNarrative <= 6)
    return .72; return 1; }
function scheduleEvent(state, source, options = {}) {
    const tick = options.currentTick ?? state.runtime.day, pool = source instanceof EventIndex ? source.candidates(state) : source, ctx = buildContext(state);
    const eligible = pool.filter(e => isEligible(state, e, options, ctx));
    if (!eligible.length)
        return null;
    const weighted = eligible.map(event => { const factors = { base: event.weight, contentNeed: contentNeed(state, event, tick), relevance: relevance(event, ctx), arcPressure: arcPressure(state, event), routeCoverage: routeCoverage(state, event), novelty: novelty(event, ctx), density: density(state), conditionalDensity: conditionalDensity(state, event, ctx), lateOpportunity: lateOpportunity(state, event) }; return { item: event, weight: Object.values(factors).reduce((a, b) => a * b, 1), factors }; });
    const rng = new DeterministicRng(state.rngState.narrative), picked = rng.pickWeighted(weighted);
    return { event: picked.item, debug: options.qa ? { candidates: weighted.map(x => ({ id: x.item.id, weight: x.weight, factors: x.factors })), rngDraw: picked.draw } : undefined };
}


// ═══ narrative/resolver.js ═══
function cloneState(state) { return structuredClone(state); }
function applyEffect(state, effect) {
    if (effect.kind === "flag") {
        state.flags[effect.flag] = effect.value;
        return;
    }
    if (effect.kind === "set") {
        setPath(state, effect.path, effect.value);
        return;
    }
    const current = getPath(state, effect.path);
    if (typeof current !== "number")
        throw new Error(`Numeric effect targets non-number: ${effect.path}`);
    const next = current + effect.delta;
    setPath(state, effect.path, Math.min(effect.max ?? Infinity, Math.max(effect.min ?? -Infinity, next)));
}
function applySeedTransition(state, t, event) {
    const existing = state.seeds.find(s => s.id === t.seedId && !["resolved", "expired"].includes(s.state));
    const presenceFlag = `HAS_${t.seedId}`;
    if (t.action === "create") {
        if (!existing)
            state.seeds.push({
                id: t.seedId, state: "dormant", intensity: t.intensity ?? 50,
                originEvent: event.id, originSeason: state.season, npcRefs: event.npcRefs ?? [],
                payload: t.payload ?? {}, lastTouchedDate: state.date
            });
        else {
            existing.intensity = Math.max(existing.intensity, t.intensity ?? existing.intensity);
            Object.assign(existing.payload, t.payload ?? {});
            existing.lastTouchedDate = state.date;
        }
        state.flags[presenceFlag] = true;
        return;
    }
    if (!existing)
        return;
    existing.lastTouchedDate = state.date;
    if (t.action === "activate")
        existing.state = "active";
    if (t.action === "intensify")
        existing.intensity = Math.max(0, Math.min(100, existing.intensity + (t.intensity ?? 10)));
    if (t.action === "transform") {
        existing.state = "transformed";
        Object.assign(existing.payload, t.payload ?? {});
    }
    if (t.action === "resolve") {
        existing.state = "resolved";
        existing.consumedBy = event.id;
        state.flags[presenceFlag] = false;
    }
    if (t.action === "expire") {
        existing.state = "expired";
        state.flags[presenceFlag] = false;
    }
    if (!["resolve", "expire"].includes(t.action))
        state.flags[presenceFlag] = true;
}
function outcomeWeight(state, outcome) {
    let weight = outcome.baseWeight;
    const reasons = [];
    for (const m of outcome.modifiers ?? []) {
        if (!conditionsPass(state, m.conditions))
            continue;
        if (m.multiply !== undefined)
            weight *= m.multiply;
        if (m.add !== undefined)
            weight += m.add;
        reasons.push(`${m.id}: ${m.reason}`);
    }
    return { weight: Math.max(0, weight), modifiers: reasons };
}
function resolveChoiceCore(next, event, choiceId, qa = false) {
    const previousRetirementStatus = next.retirement?.status ?? "playing";
    const choice = event.choices.find(c => c.id === choiceId);
    if (!choice)
        throw new Error(`Unknown choice ${choiceId} for ${event.id}`);
    for (const e of choice.immediateEffects ?? [])
        applyEffect(next, e);
    const possible = event.outcomes
        .filter(o => choice.outcomeIds.includes(o.id))
        .filter(o => conditionsPass(next, o.conditions ?? []))
        .map(o => ({ outcome: o, ...outcomeWeight(next, o) }))
        .filter(o => o.weight > 0);
    if (!possible.length)
        throw new Error(`No plausible outcomes for ${event.id}/${choiceId}`);
    const rng = new DeterministicRng(next.rngState.narrative);
    const picked = rng.pickWeighted(possible.map(x => ({ item: x, weight: x.weight })));
    const selected = picked.item.outcome;
    for (const e of selected.effects)
        applyEffect(next, e);
    for (const e of choice.hiddenCosts ?? [])
        applyEffect(next, e);
    for (const t of selected.seedTransitions ?? [])
        applySeedTransition(next, t, event);
    next.eventCooldowns[event.id] = event.cooldown;
    next.flags[`SEEN_${event.id}`] = true;
    next.familyLastSeen[event.family] = next.runtime.day;
    next.runtime.daysSinceNarrative = 0;
    next.runtime.eventsThisSeason += 1;
    syncRetirementState(next, previousRetirementStatus);
    next.history.push({
        eventId: event.id, date: next.date, season: next.season, choiceId,
        outcomeId: selected.id, club: next.club,
        snapshot: { family: event.family, npcRefs: event.npcRefs ?? [], tags: event.tags ?? [], age: next.age },
        salience: 70, visibility: "private"
    });
    return {
        state: next, eventId: event.id, choiceId, outcomeId: selected.id,
        messages: selected.messages, presentation: event.presentation,
        debug: qa ? {
            outcomeWeights: possible.map(x => ({ id: x.outcome.id, weight: x.weight, modifiers: x.modifiers })),
            rngDraw: picked.draw
        } : undefined
    };
}
/** Immutable API for UI / interactive callers. */
function resolveChoice(state, event, choiceId, qa = false) {
    return resolveChoiceCore(cloneState(state), event, choiceId, qa);
}
/** Fast path for headless simulation. Mutates the supplied GameState intentionally. */
function resolveChoiceInPlace(state, event, choiceId, qa = false) {
    return resolveChoiceCore(state, event, choiceId, qa);
}


// ═══ simulation/ageing-engine.js ═══
const clamp = (x, min = 0, max = 100) => Math.min(max, Math.max(min, x));
const num = (x, f = 0) => typeof x === "number" ? x : f;
function jitter(rng, span) { return (rng.next() - .5) * span; }
/** Canon v0.9: age never subtracts a fixed rating. Dimensions drift separately. */
function runMaturityPreseason(state) {
    if (state.age < 30 || state.age >= 35 || !state.professional.initializedAt30)
        return;
    const p = state.professional, rng = new DeterministicRng(state.rngState.football);
    const risk = num(state.body.risk, 20), fatigue = num(state.body.fatigue, 15), form = num(state.sport.form, 50), role = num(state.sport.roleScore, 50);
    const longevity = num(state.world.longevityProfile, 55);
    const longevityBias = (longevity - 55) / 35;
    const loadPressure = clamp(p.recoveryDebt * .52 + risk * .28 + p.bodyLoad * .20);
    const optimization = state.flags.HAS_SEED_SELF_OPTIMIZATION ? 5 : 0;
    const reinvention = state.flags.HAS_SEED_POSITIONAL_REINVENTION || state.flags.ROLE_REINVENTED_30 ? 1 : 0;
    p.explosiveness = clamp(p.explosiveness + jitter(rng, 5) + optimization * .20 + longevityBias * 1.15 - Math.max(0, loadPressure - 48) * .035);
    p.matchEndurance = clamp(p.matchEndurance + jitter(rng, 4) + (form - 50) * .025 - Math.max(0, p.recoveryDebt - 55) * .025);
    p.recoveryBetweenMatches = clamp(p.recoveryBetweenMatches + jitter(rng, 3.5) + longevityBias * .9 - Math.max(0, p.recoveryDebt - 42) * .04 + optimization * .14);
    p.technique = clamp(p.technique + .4 + jitter(rng, 2.2) - Math.max(0, p.recoveryDebt - 80) * .015);
    p.tacticalReading = clamp(p.tacticalReading + .8 + reinvention * .7 + jitter(rng, 2.4));
    p.composure = clamp(p.composure + .45 + jitter(rng, 2));
    p.gameSpeedPerception = clamp(p.gameSpeedPerception + .35 + p.tacticalReading * .006 - Math.max(0, p.recoveryDebt - 65) * .025 + jitter(rng, 2));
    p.availability = clamp(96 - risk * .30 - p.recoveryDebt * .36 - p.injuryMinutesImpact * .16 + jitter(rng, 5));
    p.statusInertia = clamp(p.statusInertia * .91 + p.peakStatus * .09 + jitter(rng, 2));
    p.veteranLeverage = clamp(p.contractPower * .34 + num(state.reputation.marketHeat, 30) * .24 + p.statusInertia * .18 + p.institutionalPower * .14 + role * .10);
    p.recoveryDebt = clamp(p.recoveryDebt * .72 + p.bodyLoad * .18 + risk * .10 - (p.matchSelectivity - 45) * .06 + jitter(rng, 3));
    p.motivationReserve = clamp(p.motivationReserve + (role >= 45 ? 1.5 : -2.0) + (form - 50) * .03 - (p.recoveryDebt > 70 ? 2.5 : 0) + jitter(rng, 3));
    const market = num(state.reputation.marketHeat, 30);
    p.retirementDistance = clamp(p.retirementDistance + Math.max(0, p.recoveryDebt - 62) * .05 + Math.max(0, 42 - role) * .05 + Math.max(0, 35 - market) * .035 - Math.max(0, p.motivationReserve - 65) * .025 + jitter(rng, 2));
}
function maturityWeek(state) {
    if (state.age < 30 || state.age >= 34 || !state.professional.initializedAt30)
        return;
    const p = state.professional, role = num(state.sport.roleScore, 50), risk = num(state.body.risk, 20), fatigue = num(state.body.fatigue, 15), market = num(state.reputation.marketHeat, 30);
    const longevity = num(state.world.longevityProfile, 55);
    // Deuda de recuperación: equilibrio dinámico entre carga, riesgo y capacidad real de recuperar.
    // Evita que el mero paso de semanas la empuje inevitablemente a 100.
    const debtTarget = clamp(p.bodyLoad * .42 + risk * .28 + fatigue * .16 + p.injuryMinutesImpact * .14 - p.matchSelectivity * .16 - p.recoveryBetweenMatches * .10 + Math.max(0, 55 - longevity) * .18);
    p.recoveryDebt = clamp(p.recoveryDebt * .965 + debtTarget * .035);
    const availabilityTarget = clamp(96 - risk * .34 - p.recoveryDebt * .30 - p.injuryMinutesImpact * .18);
    p.availability = clamp(p.availability * .975 + availabilityTarget * .025);
    p.veteranLeverage = clamp(p.veteranLeverage * .985 + (p.contractPower * .35 + market * .28 + p.statusInertia * .22 + role * .15) * .015);
    p.legacyCapital = clamp(p.legacyCapital * .995 + (p.trophyCapital * .35 + p.publicMyth * .25 + p.institutionalPower * .25 + p.nationalPower * .15) * .005);
    const injuryCount = num(state.world.maturityInjuryCount, 0), longInjuries = num(state.world.maturityLongInjuryCount, 0);
    const state30Tags = state.world.state30Tags ?? [];
    const priorDecline = state30Tags.includes("STATE30_EARLY_DECLINE_RISK") ? 18 : 0;
    const priorTrap = state30Tags.includes("STATE30_BIG_CONTRACT_TRAP") ? 8 : 0;
    const retirementTarget = clamp(priorDecline + priorTrap + Math.max(0, p.recoveryDebt - 44) * 1.05 +
        Math.max(0, 50 - role) * 1.10 +
        Math.max(0, 44 - market) * .70 +
        Math.max(0, 58 - p.motivationReserve) * .95 +
        Math.max(0, 54 - p.availability) * .60 +
        Math.max(0, 45 - longevity) * .70 + injuryCount * 3.5 + longInjuries * 8);
    p.retirementDistance = clamp(p.retirementDistance * .982 + retirementTarget * .018);
    // El rol veterano responde a utilidad actual: técnica y lectura pueden compensar físico; sucesión y baja disponibilidad pueden reducir minutos.
    const utility = clamp(p.technique * .20 + p.tacticalReading * .24 + p.gameSpeedPerception * .14 + p.composure * .12 + p.explosiveness * .13 + p.matchEndurance * .09 + p.availability * .08);
    const matureRoleTarget = clamp(18 + p.roleSecurity * .34 + (num(state.sport.form, 50) - 50) * .22 + (utility - 55) * .42 - Math.max(0, p.successionPressure - 38) * .22 - Math.max(0, 58 - p.availability) * .26);
    state.sport.roleScore = Math.round(clamp(role * .982 + matureRoleTarget * .018) * 10) / 10;
    if (p.recoveryDebt > 64)
        state.flags.RECOVERY_DEBT_HIGH = true;
    else if (p.recoveryDebt < 50)
        state.flags.RECOVERY_DEBT_HIGH = false;
    state.flags.RETIREMENT_WINDOW = state.age >= 32 && p.retirementDistance >= 54;
}


// ═══ simulation/late-career-engine.js ═══
const clamp = (x, min = 0, max = 100) => Math.min(max, Math.max(min, x));
const num = (x, f = 0) => typeof x === "number" ? x : f;
function setStatus(state, status, reason, closureType) {
    state.retirement.status = status;
    state.retirement.daysInStatus = 0;
    if (status === "decided") {
        state.retirement.decidedDate = state.date;
        state.retirement.decisionAge = state.age;
        if (reason)
            state.retirement.reason = reason;
        state.flags.RETIREMENT_DECISION_CONTEXT = true;
    }
    else if (status === "announced") {
        state.retirement.announcedDate = state.date;
        state.flags.RETIREMENT_ANNOUNCED = true;
        state.flags.RETIREMENT_DECISION_CONTEXT = false;
    }
    else if (status === "closed") {
        state.retirement.closedDate = state.date;
        if (closureType)
            state.retirement.closureType = closureType;
        state.flags.RETIRED = true;
        state.flags.RETIREMENT_ANNOUNCED = false;
        state.flags.RETIREMENT_DECISION_CONTEXT = false;
    }
}
function syncRetirementState(state, previous) {
    const current = state.retirement.status;
    if (current === previous)
        return;
    state.retirement.daysInStatus = 0;
    if (current === "decided") {
        state.retirement.decidedDate = state.retirement.decidedDate ?? state.date;
        state.retirement.decisionAge = state.retirement.decisionAge ?? state.age;
        state.flags.RETIREMENT_DECISION_CONTEXT = true;
    }
    if (current === "announced") {
        state.retirement.announcedDate = state.date;
        state.flags.RETIREMENT_ANNOUNCED = true;
        state.flags.RETIREMENT_DECISION_CONTEXT = false;
    }
    if (current === "playing") {
        state.flags.RETIREMENT_ANNOUNCED = false;
        state.flags.RETIREMENT_DECISION_CONTEXT = false;
    }
    if (current === "closed") {
        state.retirement.closedDate = state.date;
        state.flags.RETIRED = true;
        state.flags.RETIREMENT_ANNOUNCED = false;
        state.flags.RETIREMENT_DECISION_CONTEXT = false;
        generateEpilogue(state);
    }
}
function closeCareer(state, reason, closureType) {
    if (state.retirement.status === "closed")
        return;
    state.retirement.reason = state.retirement.reason ?? reason;
    setStatus(state, "closed", reason, closureType);
    generateEpilogue(state);
}
function reverseRetirement(state) {
    if (state.retirement.status !== "announced" && state.retirement.status !== "decided")
        return;
    state.retirement.status = "playing";
    state.retirement.daysInStatus = 0;
    state.retirement.reversals += 1;
    state.flags.RETIREMENT_ANNOUNCED = false;
    state.flags.RETIREMENT_DECISION_CONTEXT = false;
    state.flags.RETIREMENT_RECONSIDERED = true;
    state.professional.careerControl = clamp(state.professional.careerControl - 5);
    state.professional.statusInertia = clamp(state.professional.statusInertia - 4);
    state.reputation.marketHeat = clamp(num(state.reputation.marketHeat) - 5);
}
function lateCareerPreseason(state) {
    if (state.age < 34 || state.retirement.status === "closed")
        return;
    const p = state.professional, rng = new DeterministicRng(state.rngState.football);
    const role = num(state.sport.roleScore), market = num(state.reputation.marketHeat), motivation = p.motivationReserve;
    const months = num(state.contract.monthsRemaining);
    const agePenalty = Math.max(0, state.age - 34) * 2.2;
    const demand = clamp(market * .36 + role * .24 + p.veteranLeverage * .18 + p.legacyCapital * .12 + p.availability * .10 - agePenalty);
    state.world.veteranMarketDemand = Math.round(demand * 10) / 10;
    state.flags.VETERAN_OFFER_AVAILABLE = false;
    state.flags.INFORMAL_RENEWAL_PROMISE = false;
    if (months <= 2 && state.retirement.status === "playing") {
        const offerP = clamp(0.12 + demand / 155 - agePenalty / 150, 0.05, 0.72);
        if (rng.next() < offerP) {
            state.flags.VETERAN_OFFER_AVAILABLE = true;
            state.retirement.noMarketWindows = 0;
            state.world.veteranOfferRole = Math.round(clamp(role - 6 + rng.next() * 20));
            state.world.veteranOfferMonths = 6 + Math.floor(rng.next() * 19);
            state.world.veteranOfferSalary = Math.max(900, Math.round(num(state.contract.salaryMonthly, 900) * (0.55 + rng.next() * .8)));
        }
        else {
            state.retirement.noMarketWindows += 1;
            if (demand >= 38 && rng.next() < 0.32)
                state.flags.INFORMAL_RENEWAL_PROMISE = true;
        }
    }
    // A veteran can choose to continue but eventually run out of compatible market.
    if (state.retirement.status === "playing" && months <= 0 && !state.flags.VETERAN_OFFER_AVAILABLE && ((state.retirement.noMarketWindows >= 2 && demand < 20) || (state.retirement.noMarketWindows >= 3 && demand < 35))) {
        setStatus(state, "decided", "no_market");
        state.flags.NO_MARKET_END_CONTEXT = true;
    }
    const physicalRedline = p.recoveryDebt >= 55 || p.availability <= 50 || num(state.world.maturityLongInjuryCount) >= 1;
    state.flags.LATE_BODY_REDLINE = physicalRedline;
    if (state.retirement.status === "playing" && physicalRedline && motivation < 48 && rng.next() < .22) {
        state.flags.HEALTH_RETIREMENT_CONTEXT = true;
    }
}
function lateCareerWeek(state) {
    if (state.age < 34 || state.retirement.status === "closed")
        return;
    const p = state.professional, rng = new DeterministicRng(state.rngState.football);
    const role = num(state.sport.roleScore), market = num(state.reputation.marketHeat), form = num(state.sport.form, 50);
    const ageDrift = Math.max(0, state.age - 34);
    // Open-ended aging: role and physical dimensions respond to body/utility, never to a fixed retirement age.
    p.recoveryDebt = clamp(p.recoveryDebt * .982 + (p.bodyLoad * .33 + num(state.body.risk) * .26 + num(state.body.fatigue) * .14 + ageDrift * 2.2 - p.matchSelectivity * .10 - p.recoveryBetweenMatches * .08) * .018);
    p.availability = clamp(p.availability * .985 + clamp(96 - num(state.body.risk) * .30 - p.recoveryDebt * .38 - ageDrift * 1.25) * .015);
    p.explosiveness = clamp(p.explosiveness + (rng.next() - .55) * .55 - Math.max(0, p.recoveryDebt - 62) * .008);
    p.tacticalReading = clamp(p.tacticalReading + .025 + (rng.next() - .5) * .18);
    p.technique = clamp(p.technique + .01 + (rng.next() - .5) * .14);
    const utility = clamp(p.technique * .22 + p.tacticalReading * .27 + p.composure * .14 + p.gameSpeedPerception * .13 + p.explosiveness * .08 + p.matchEndurance * .07 + p.availability * .09);
    const roleTarget = clamp(10 + p.roleSecurity * .30 + (form - 50) * .18 + (utility - 52) * .44 - p.successionPressure * .18 - ageDrift * 1.75);
    state.sport.roleScore = Math.round(clamp(role * .982 + roleTarget * .018) * 10) / 10;
    const marketTarget = clamp(role * .32 + p.statusInertia * .20 + p.legacyCapital * .20 + p.commercialPower * .12 + p.availability * .10 - ageDrift * 3.0);
    state.reputation.marketHeat = Math.round(clamp(market * .985 + marketTarget * .015) * 10) / 10;
    const motivationTarget = clamp(42 + role * .28 + market * .12 + p.legacyCapital * .08 - ageDrift * 1.75 - (p.recoveryDebt > 65 ? 8 : 0));
    p.motivationReserve = clamp(p.motivationReserve * .985 + motivationTarget * .015 + (rng.next() - .5) * .18);
    p.retirementDistance = clamp(p.retirementDistance * .985 + clamp(Math.max(0, 48 - role) * .8 + Math.max(0, 40 - market) * .5 + Math.max(0, p.recoveryDebt - 55) * .55 + Math.max(0, 50 - p.motivationReserve) * .8 + ageDrift * 4.3) * .015);
    if (state.retirement.status !== "playing")
        state.retirement.daysInStatus += 7;
    // Real world contexts feeding retirement stories.
    state.flags.RETIRE_AFTER_WIN_CONTEXT = String(state.world.finalOutcome) === "win" && form >= 55 && state.retirement.status === "playing";
    state.flags.RETIRE_AFTER_LOW_CONTEXT = state.age >= 36 && role < 50 && p.motivationReserve < 58 && state.retirement.status === "playing";
    state.flags.MAJOR_COMEBACK_CONTEXT = state.flags.LONG_INJURY === false && num(state.world.maturityLongInjuryCount) >= 1 && form >= 58 && role >= 38;
    if (state.flags.MAJOR_COMEBACK_CONTEXT)
        state.flags.LATE_MAJOR_COMEBACK = true;
    state.flags.NO_MEDICAL_CLEARANCE_CONTEXT = p.recoveryDebt >= 70 && p.availability <= 40 && state.age >= 36;
    // Post-announcement offer can open one rare reversal; it never auto-reverses.
    if (state.retirement.status === "announced" && state.age >= 36 && state.retirement.reversals < 2 && market >= 30 && !state.flags.POST_ANNOUNCE_OFFER && !state.flags.RECONSIDERATION_WINDOW && rng.next() < .10) {
        state.flags.POST_ANNOUNCE_OFFER = true;
    }
    // Deadlock guard: after a firm decision, communication becomes administrative.
    if (state.retirement.status === "decided" && state.retirement.daysInStatus >= 45) {
        setStatus(state, "announced");
        state.flags.ADMIN_ANNOUNCEMENT_FALLBACK = true;
    }
    // An announced retirement cannot remain open forever. Give narrative last-match windows first.
    if (state.retirement.status === "announced") {
        const month = Number(state.date.slice(5, 7));
        state.flags.LAST_MATCH_WINDOW = [2, 3, 4, 5, 6].includes(month) && state.retirement.daysInStatus >= 21;
        if (state.retirement.daysInStatus >= 120 || (num(state.contract.monthsRemaining) <= 0 && state.retirement.daysInStatus >= 90)) {
            closeCareer(state, state.retirement.reason ?? "administrative_close", "no_last_match");
        }
    }
}


// ═══ simulation/world-simulator.js ═══
const clamp = (x, min = 0, max = 100) => Math.min(max, Math.max(min, x));
const num = (x, fallback = 0) => typeof x === "number" ? x : fallback;
function addDays(iso, days) {
    const d = new Date(`${iso}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() + days);
    return d.toISOString().slice(0, 10);
}
function seasonLabel(year) { return `${year}-${String((year + 1) % 100).padStart(2, "0")}`; }
function phaseForAge(age) {
    if (age < 20)
        return "18_20";
    if (age < 23)
        return "20_23";
    if (age < 26)
        return "23_26";
    if (age < 30)
        return "26_30";
    if (age < 34)
        return "30_34";
    return "34_plus";
}
function monthlyContractTick(state, oldDate) {
    if (oldDate.slice(0, 7) === state.date.slice(0, 7))
        return;
    const months = num(state.contract.monthsRemaining, 0);
    state.contract.monthsRemaining = Math.max(0, months - 1);
}
function updateContextFlags(state, rng) {
    const month = Number(state.date.slice(5, 7));
    const role = num(state.sport.roleScore, 0);
    const media = num(state.reputation.mediaHeat, 0);
    const market = num(state.reputation.marketHeat, 0);
    const form = num(state.sport.form, 50);
    const risk = num(state.body.risk, 18);
    const history = state.history;
    const hasEvent = (id) => history.some(h => h.eventId === id);
    const eventChoice = (id) => history.find(h => h.eventId === id)?.choiceId;
    if (hasEvent("EVT_18_PRE_001"))
        state.flags.PRESEASON_STARTED = true;
    if (state.runtime.seasonDay > 14 || role >= 22)
        state.flags.FIRST_TEAM_ATTENTION = true;
    if (!hasEvent("EVT_18_AGT_001") && state.flags.FIRST_TEAM_ATTENTION && state.runtime.seasonDay >= 21)
        state.flags.WIN_AGENT = true;
    const firstAgentChoice = eventChoice("EVT_18_AGT_001");
    if (!state.flags.NO_AGENT && !state.flags.AGENT_ACTIVE && firstAgentChoice && firstAgentChoice !== "WAIT") {
        const p = firstAgentChoice === "COMPARE" ? 0.10 : 0.20;
        if (rng.next() < p)
            state.flags.AGENT_ACTIVE = true;
    }
    const seasonMonths = month >= 8 || month <= 5;
    if (seasonMonths && !state.flags.OFFICIAL_DEBUT && role >= 22 && rng.next() < 0.18) {
        state.flags.OFFICIAL_DEBUT = true;
        state.flags.FIRST_TEAM_ATTENTION = true;
        state.flags.WIN_DEBUT = false;
        state.sport.appearances = num(state.sport.appearances) + 1;
        state.reputation.mediaHeat = clamp(media + 5);
    }
    if (state.age === 18 && state.flags.OFFICIAL_DEBUT && state.runtime.seasonDay < 150 && form >= 60 && num(state.reputation.mediaHeat) >= 9) {
        if (rng.next() < 0.18)
            state.flags.EARLY_BREAKOUT = true;
    }
    if (state.age === 18 && month === 1 && !state.flags.OFFICIAL_DEBUT && role < 24)
        state.flags.JAN_NO_DEBUT = true;
    if (seasonMonths && (risk >= 28 || rng.next() < 0.055))
        state.flags.BODY_WINDOW = true;
    if ([1, 2, 3, 4].includes(month) && rng.next() < 0.09)
        state.flags.BRUNO_SCOUTS = true;
    if (state.flags.BRUNO_SCOUTS && !state.flags.BRUNO_EXIT && [1, 2, 3, 4, 5].includes(month) && rng.next() < 0.045)
        state.flags.BRUNO_EXIT = true;
    if (state.flags.VELA_BOARD_TENSION && !state.flags.VELA_SEPARATED && state.runtime.seasonDay > 90 && rng.next() < 0.025)
        state.flags.VELA_SEPARATED = true;
    if ([2, 3, 4, 5].includes(month) && state.flags.OFFICIAL_DEBUT && rng.next() < 0.10)
        state.flags.SET_PIECE_WINDOW = true;
    // El club original evoluciona con su propia incertidumbre, aunque el protagonista salga cedido.
    if (state.age === 18 && [5, 6].includes(month) && state.world.udvSeasonResolved !== true) {
        const pressure = num(state.world.clubPressure, 42);
        const relegationP = clamp(0.12 + pressure / 260, 0.12, 0.42);
        const playoffP = clamp(0.10 + Math.max(0, form - 52) / 120, 0.10, 0.32);
        const draw = rng.next();
        if (draw < relegationP) {
            state.flags.UDV_RELEGATED = true;
            state.world.udvTier = 4;
            if (state.club === "UDV")
                state.tier = 4;
        }
        else if (draw < relegationP + playoffP) {
            state.flags.UDV_PLAYOFF = true;
        }
        state.world.udvSeasonResolved = true;
    }
    const coachSecurity = num(state.world.coachSecurity, 48);
    if (!state.flags.COACH_FIRED && coachSecurity < 24 && rng.next() < 0.18)
        state.flags.COACH_FIRED = true;
    if (state.age === 19 && market >= 42 && !state.flags.BIG_CLUB_INTEREST && rng.next() < 0.055)
        state.flags.BIG_CLUB_INTEREST = true;
    if (state.age === 19 && state.flags.AGENT_ACTIVE && state.flags.HAS_SEED_AGENT_OMISSION && !state.flags.AGENT_SECOND_DISCREPANCY && rng.next() < 0.035)
        state.flags.AGENT_SECOND_DISCREPANCY = true;
    if (state.age === 19 && market >= 30 && (state.flags.AGENT_ACTIVE || state.flags.HAS_SEED_FIRST_AGENT) && !state.flags.FOREIGN_DEV_INTEREST && rng.next() < 0.035)
        state.flags.FOREIGN_DEV_INTEREST = true;
    const social = history.find(h => h.eventId === "EVT_18_SOC_001");
    if (social && !state.flags.NIGHT_PHOTO) {
        const exposed = social.outcomeId.endsWith("__SECONDARY") || social.choiceId === "STAY" || social.choiceId === "CONTROL_STORY";
        if (exposed && rng.next() < 0.08)
            state.flags.NIGHT_PHOTO = true;
    }
    if (state.age === 19 && state.flags.LOAN_ACTIVE && [5, 6].includes(month))
        state.flags.LOAN_RETURN = true;
    if ([12, 1].includes(month))
        state.world.marketWindowOpen = true;
    else
        state.world.marketWindowOpen = false;
}
function footballWeek(state) {
    const rng = new DeterministicRng(state.rngState.football);
    const form = clamp(num(state.sport.form, 50) * 0.82 + 50 * 0.18 + (rng.next() - 0.5) * 11);
    const trust = state.relationships.find(r => r.npcId === "NPC_CCH_01")?.trust ?? 45;
    const currentRole = num(state.sport.roleScore, 18);
    const role = state.age >= 20 && state.professional.initializedAt20
        ? clamp(currentRole * 0.90 + (22 + form * 0.42 + state.professional.roleSecurity * 0.28 + Math.max(0, 4 - state.professional.leagueTier) * 2.2) * 0.10 + (rng.next() - 0.5) * 2.8)
        : clamp(currentRole + (form - 50) / 16 + (trust - 45) / 40 + (rng.next() - 0.5) * 3);
    const risk = clamp(num(state.body.risk, 18) * 0.94 + 18 * 0.06 + Math.max(0, role - 55) / 45 + (rng.next() - 0.53) * 3.2);
    // Fatiga y fitness son estados con inercia, no random walks acumulativos.
    // Un rol alto eleva la carga media, pero el descanso semanal empuja de vuelta hacia un rango sostenible.
    const fatigueTarget = clamp(12 + role * 0.42 + (state.age >= 20 ? state.professional.bodyLoad * 0.10 : 0));
    const fatigue = clamp(num(state.body.fatigue, 12) * 0.84 + fatigueTarget * 0.16 + (rng.next() - 0.5) * 5);
    const fitnessTarget = clamp(88 - fatigue * 0.22 - risk * 0.12, 45, 92);
    const fitness = clamp(num(state.body.fitness, 78) * 0.90 + fitnessTarget * 0.10 + (rng.next() - 0.5) * 2.2);
    state.sport.form = Math.round(form * 10) / 10;
    state.sport.roleScore = Math.round(role * 10) / 10;
    state.body.risk = Math.round(risk * 10) / 10;
    state.body.fatigue = Math.round(fatigue * 10) / 10;
    state.body.fitness = Math.round(fitness * 10) / 10;
    const currentSecurity = num(state.world.coachSecurity, 48);
    state.world.coachSecurity = Math.round(clamp(currentSecurity + (form - 50) / 12 + (rng.next() - 0.55) * 8) * 10) / 10;
    let injuryWeeks = num(state.world.injuryWeeksRemaining, 0);
    if (injuryWeeks > 0) {
        injuryWeeks -= 1;
        state.world.injuryWeeksRemaining = injuryWeeks;
        state.flags.RECOVERING_INJURY = true;
        state.body.acuteInjury = true;
        state.sport.roleScore = Math.max(0, num(state.sport.roleScore) - 1.8);
        if (injuryWeeks <= 0) {
            state.flags.RECOVERING_INJURY = false;
            state.flags.LONG_INJURY = false;
            state.body.acuteInjury = false;
            state.body.risk = Math.max(12, num(state.body.risk) - 12);
        }
    }
    else if (risk >= 43) {
        const injuryP = clamp(0.015 + (risk - 43) / 650, 0.015, 0.11);
        if (rng.next() < injuryP) {
            const long = risk >= 58 && rng.next() < 0.32;
            state.world.injuryWeeksRemaining = long ? 12 + Math.floor(rng.next() * 7) : 3 + Math.floor(rng.next() * 5);
            state.flags.RECOVERING_INJURY = true;
            state.flags.LONG_INJURY = long;
            state.body.acuteInjury = true;
            state.body.fitness = Math.max(25, num(state.body.fitness) - (long ? 22 : 10));
            if (state.age >= 30 && state.professional.initializedAt30) {
                state.world.maturityInjuryCount = num(state.world.maturityInjuryCount, 0) + 1;
                if (long)
                    state.world.maturityLongInjuryCount = num(state.world.maturityLongInjuryCount, 0) + 1;
                state.professional.motivationReserve = clamp(state.professional.motivationReserve - (long ? 8 : 2));
                state.professional.retirementDistance = clamp(state.professional.retirementDistance + (long ? 10 : 3));
            }
        }
    }
    else if (state.age >= 30 && state.professional.initializedAt30) {
        const p = state.professional, longevity = num(state.world.longevityProfile, 55);
        const matureInjuryP = clamp(0.0015 + Math.max(0, 55 - longevity) / 6500 + Math.max(0, p.recoveryDebt - 42) / 4200 + (state.flags.HAS_SEED_CHRONIC_BODY ? 0.0012 : 0), 0.0015, 0.018);
        if (rng.next() < matureInjuryP) {
            const long = (p.recoveryDebt >= 58 || longevity < 38) && rng.next() < 0.34;
            state.world.injuryWeeksRemaining = long ? 8 + Math.floor(rng.next() * 10) : 2 + Math.floor(rng.next() * 6);
            state.flags.RECOVERING_INJURY = true;
            state.flags.LONG_INJURY = long;
            state.body.acuteInjury = true;
            state.body.fitness = Math.max(30, num(state.body.fitness) - (long ? 18 : 8));
            p.recoveryDebt = clamp(p.recoveryDebt + (long ? 14 : 6));
            p.availability = clamp(p.availability - (long ? 16 : 7));
            p.motivationReserve = clamp(p.motivationReserve - (long ? 8 : 2));
            p.retirementDistance = clamp(p.retirementDistance + (long ? 10 : 3));
            state.world.maturityInjuryCount = num(state.world.maturityInjuryCount, 0) + 1;
            if (long)
                state.world.maturityLongInjuryCount = num(state.world.maturityLongInjuryCount, 0) + 1;
        }
    }
    const month = Number(state.date.slice(5, 7));
    if ((month >= 8 || month <= 5) && role > 24) {
        const appearanceChance = clamp((role - 15) / 85, 0.08, 0.92);
        if (rng.next() < appearanceChance) {
            state.sport.appearances = num(state.sport.appearances) + 1;
            const minutes = clamp(num(state.sport.minutesShare) + (rng.next() * 4 + role / 40), 0, 100);
            state.sport.minutesShare = Math.round(minutes * 10) / 10;
            if (form > 64 && rng.next() < 0.22)
                state.reputation.mediaHeat = clamp(num(state.reputation.mediaHeat) + 2);
        }
    }
    const market = clamp(num(state.reputation.marketHeat) * 0.82 + role * 0.10 + num(state.reputation.mediaHeat) * 0.08 + (rng.next() - 0.5) * 5);
    state.reputation.marketHeat = Math.round(market * 10) / 10;
    updateContextFlags(state, rng);
}
function professionalWeek(state, rng) {
    if (state.age < 20 || !state.professional.initializedAt20)
        return;
    const p = state.professional;
    const role = num(state.sport.roleScore, 35);
    const form = num(state.sport.form, 50);
    const market = num(state.reputation.marketHeat, 25);
    const media = num(state.reputation.mediaHeat, 8);
    const month = Number(state.date.slice(5, 7));
    const roleTarget = clamp(role + (form - 50) * 0.22 + (p.environmentStability - 50) * 0.08);
    p.roleSecurity = clamp(p.roleSecurity * 0.93 + roleTarget * 0.07 + (rng.next() - 0.5) * 2.1);
    const lockerTarget = clamp(12 + role * 0.58 + num(state.reputation.prestige, 0) * 0.15);
    p.lockerPower = clamp(p.lockerPower * 0.975 + lockerTarget * 0.025 + (rng.next() - 0.5) * 1.2);
    const monthsNow = num(state.contract.monthsRemaining, 0);
    const contractTarget = clamp(18 + market * 0.62 + (monthsNow <= 18 ? 12 : 0) + (state.flags.CONTRACT_DISPUTE ? 8 : 0));
    p.contractPower = clamp(p.contractPower * 0.96 + contractTarget * 0.04 + (rng.next() - 0.5) * 1.2);
    p.moneyComfort = clamp(p.moneyComfort + Math.max(0, num(state.contract.salaryMonthly, 0) - 2500) / 85000);
    p.nationalHeat = clamp(p.nationalHeat * 0.965 + media * 0.0175 + market * 0.0175 + (rng.next() - 0.5) * 1.5);
    const trustTarget = clamp(34 + p.roleSecurity * 0.42 + p.environmentStability * 0.16 - (state.flags.CONTRACT_DISPUTE ? 15 : 0));
    p.institutionalTrust = clamp(p.institutionalTrust * 0.96 + trustTarget * 0.04 + (rng.next() - 0.5) * 1.0);
    if (p.route === "abroad") {
        p.foreignAdaptation = clamp(p.foreignAdaptation + 1.4 + (rng.next() - 0.5) * 3);
        p.environmentStability = clamp(p.environmentStability + (p.foreignAdaptation - 45) / 70 + (rng.next() - 0.5) * 2);
        if (p.foreignAdaptation >= 55)
            state.flags.FOREIGN_STABLE = true;
    }
    // Una lesión real deja impacto de minutos; una simple alerta de riesgo no activa recuperación.
    if (state.body.acuteInjury === true || state.flags.LONG_INJURY) {
        p.injuryMinutesImpact = clamp(p.injuryMinutesImpact + 2.4);
    }
    else {
        p.injuryMinutesImpact = clamp(p.injuryMinutesImpact - 0.45);
    }
    // Renovaciones: la agencia libre es una posibilidad, no el destino por defecto.
    const months = num(state.contract.monthsRemaining, 0);
    if (state.age < 34 && months <= 5 && !state.flags.CONTRACT_DISPUTE) {
        const renewalP = clamp(0.20 + p.institutionalTrust / 220 + p.roleSecurity / 280 - Math.max(0, p.contractPower - 65) / 230, 0.16, 0.68);
        if (rng.next() < renewalP) {
            state.contract.monthsRemaining = 24 + Math.floor(rng.next() * 25);
            state.contract.salaryMonthly = Math.round(num(state.contract.salaryMonthly, 3000) * (1.08 + rng.next() * 0.35));
            p.contractPower = clamp(p.contractPower - 8 + rng.next() * 8);
            p.institutionalTrust = clamp(p.institutionalTrust + 4);
        }
        else if (p.contractPower >= 60 && rng.next() < 0.22) {
            state.flags.CONTRACT_DISPUTE = true;
            p.institutionalTrust = clamp(p.institutionalTrust - 8);
        }
    }
    // Cierre o continuidad de cesiones al final de temporada.
    if (p.ownerClub !== p.registrationClub && [5, 6].includes(month) && rng.next() < 0.12) {
        const buyP = clamp(0.12 + role / 180 + p.environmentStability / 300, 0.12, 0.62);
        if (rng.next() < buyP) {
            p.ownerClub = p.registrationClub;
            state.world.ownerClub = p.ownerClub;
            p.route = p.registrationClub.includes("Foreign") ? "abroad" : "domestic";
            state.flags.LOAN_ACTIVE = false;
        }
        else if (rng.next() < 0.55) {
            p.registrationClub = p.ownerClub;
            state.club = p.ownerClub;
            state.flags.LOAN_ACTIVE = false;
            p.route = p.ownerClub === "UDV" ? "home" : "domestic";
        }
        else {
            state.flags.LOAN_ACTIVE = true;
        }
    }
    // Ventana de verano: movimientos plausibles y separados entre nivel y prestigio.
    if ([7, 8].includes(month) && state.runtime.day % 14 === 0 && market >= 38 && rng.next() < 0.09) {
        const upward = market >= 62 && role >= 48 && rng.next() < 0.52;
        const abroad = rng.next() < 0.24;
        if (upward) {
            p.leagueTier = Math.max(1, p.leagueTier - (rng.next() < 0.45 ? 1 : 0));
            p.clubPrestigeTier = Math.min(5, p.clubPrestigeTier + 1);
            p.clubPrestigeScore = clamp(p.clubPrestigeScore + 12 + rng.next() * 12);
            if (p.clubPrestigeTier >= 5)
                state.flags.BIG_CLUB = true;
        }
        else if (role < 42 && p.clubPrestigeTier >= 4 && rng.next() < 0.45) {
            p.leagueTier = Math.min(4, p.leagueTier + 1);
            p.clubPrestigeTier = Math.max(2, p.clubPrestigeTier - 1);
            p.clubPrestigeScore = clamp(p.clubPrestigeScore - 10);
        }
        if (abroad) {
            p.route = "abroad";
            const destination = `Foreign_${p.leagueTier}_${Math.floor(rng.next() * 20)}`;
            p.registrationClub = destination;
            state.club = destination;
            p.foreignAdaptation = Math.max(p.foreignAdaptation, 20);
            state.flags.ABROAD_ROUTE = true;
            // Ir al extranjero puede ser un traspaso o una cesión; no asumimos propiedad ajena por defecto.
            if (rng.next() < 0.68) {
                p.ownerClub = destination;
                state.world.ownerClub = destination;
                state.flags.LOAN_ACTIVE = false;
            }
            else {
                state.flags.LOAN_ACTIVE = true;
            }
        }
        else if (rng.next() < 0.32 && p.clubPrestigeTier >= 4 && role < 55) {
            // Cesión desde propietario prestigioso a un entorno con más minutos.
            p.ownerClub = state.club;
            p.registrationClub = `Loan_${Math.max(1, p.leagueTier)}_${Math.floor(rng.next() * 20)}`;
            state.club = p.registrationClub;
            p.route = "loan";
            p.environmentStability = clamp(42 + rng.next() * 24);
            state.flags.LOAN_ACTIVE = true;
        }
        state.tier = p.leagueTier;
    }
    if (p.clubPrestigeTier >= 5)
        state.reputation.prestige = clamp(Math.max(num(state.reputation.prestige), 72 + p.clubPrestigeScore / 5));
    else
        state.reputation.prestige = clamp(num(state.reputation.prestige) * 0.985 + p.clubPrestigeScore * 0.015);
    if (media >= 64 && media > market + 8)
        state.flags.MEDIA_PROFILE = true;
    if (p.nationalHeat >= 45 || (p.leagueTier === 1 && role >= 62))
        state.flags.NATIONAL_RADAR = true;
    if (state.age >= 23 && p.initializedAt23) {
        p.bodyLoad = clamp(p.bodyLoad * 0.94 + num(state.body.fatigue, 15) * 0.035 + num(state.body.risk, 18) * 0.025 + (rng.next() - 0.52) * 2.2);
        p.commercialPower = clamp(p.commercialPower * 0.97 + media * 0.018 + num(state.reputation.prestige, 0) * 0.012 + (rng.next() - 0.5) * 1.3);
        p.publicPolarization = clamp(p.publicPolarization * 0.96 + Math.max(0, media - market * 0.55) * 0.025 + (rng.next() - 0.5) * 1.5);
        const nationalGate = p.nationalHeat >= 38 && (p.leagueTier === 1 || role >= 67) && form >= 48;
        state.flags.NATIONAL_GATE_OPEN = nationalGate;
        if (!state.flags.NATIONAL_CALLED && nationalGate && rng.next() < 0.028) {
            state.flags.NATIONAL_CALLED = true;
            p.nationalRole = "fringe";
            p.nationalStanding = clamp(Math.max(p.nationalStanding, 34));
        }
        if (state.flags.NATIONAL_CALLED) {
            const campP = clamp(0.05 + p.nationalStanding / 800 + p.nationalHeat / 1000, 0.05, 0.25);
            if (rng.next() < campP) {
                const caps = 1 + (rng.next() < 0.18 ? 1 : 0);
                p.nationalCaps += caps;
                p.nationalStanding = clamp(p.nationalStanding + (form - 48) / 18 + (rng.next() - 0.45) * 5);
                if (p.nationalCaps >= 6 && p.nationalStanding >= 52)
                    p.nationalRole = "rotation";
                if (p.nationalCaps >= 12 && p.nationalStanding >= 68) {
                    p.nationalRole = "regular";
                    state.flags.NATIONAL_REGULAR = true;
                }
            }
        }
        state.flags.NATIONAL_TOURNAMENT_CYCLE = [3, 4, 5, 6].includes(month) && [24, 28, 32].includes(state.age) && p.nationalStanding >= 38;
        const continentalBase = p.leagueTier === 1 && p.clubPrestigeTier >= 3;
        state.flags.CONTINENTAL_CONTEXT = continentalBase && ([8, 9, 10, 11, 2, 3, 4, 5].includes(month));
        if (continentalBase && !state.flags.CONTINENTAL_REGISTERED && rng.next() < 0.06)
            state.flags.CONTINENTAL_REGISTERED = true;
        if (state.flags.CONTINENTAL_REGISTERED && state.flags.CONTINENTAL_CONTEXT)
            p.continentalCred = clamp(p.continentalCred + (form - 50) / 45 + (role - 50) / 90 + (rng.next() - 0.52) * 2);
        state.flags.HIGH_PROFILE_MATCH = state.flags.CONTINENTAL_CONTEXT || (p.leagueTier === 1 && p.clubPrestigeTier >= 4 && rng.next() < 0.08);
        state.flags.CAPTAINCY_WINDOW = p.lockerPower >= 54 && role >= 55;
        if (p.clubPrestigeTier >= 4 && role < 62 && !state.flags.STAR_COMPETITION && rng.next() < 0.015)
            state.flags.STAR_COMPETITION = true;
        if (market >= 68 && !state.flags.SUPER_AGENT && rng.next() < 0.016)
            state.flags.SUPER_AGENT = true;
        if (p.clubPrestigeTier >= 3 && !state.flags.CLUB_OWNER_CHANGE && rng.next() < 0.0025)
            state.flags.CLUB_OWNER_CHANGE = true;
        // Una final es un hecho del mundo, no un privilegio del scheduler.
        // Se genera con una puerta competitiva real y vive unos pocos días.
        const finalExpires = num(state.world.finalContextExpiresDay, -1);
        if (![4, 5].includes(month)) {
            state.flags.FINAL_CONTEXT = false;
            state.world.finalContextExpiresDay = -1;
        }
        else if (finalExpires >= state.runtime.day) {
            state.flags.FINAL_CONTEXT = true;
        }
        else {
            state.flags.FINAL_CONTEXT = false;
            const cupPlausible = p.leagueTier <= 2 && p.clubPrestigeTier >= 2 && role >= 32;
            const continentalPlausible = state.flags.CONTINENTAL_REGISTERED && p.continentalCred >= 24;
            if (cupPlausible || continentalPlausible) {
                const finalP = clamp(0.018 + p.clubPrestigeTier * 0.008 + p.continentalCred / 1500 + p.trophyCapital / 2200, 0.025, 0.115);
                if (rng.next() < finalP) {
                    state.flags.FINAL_CONTEXT = true;
                    state.world.finalContextExpiresDay = state.runtime.day + 8;
                    const continental = continentalPlausible && rng.next() < 0.68;
                    state.world.finalCompetition = continental ? "continental" : "domestic_cup";
                    const winP = clamp(0.36 + role / 420 + p.clubPrestigeTier / 35, 0.38, 0.68);
                    const won = rng.next() < winP;
                    state.world.finalOutcome = won ? "win" : "loss";
                    if (won)
                        p.trophyCapital = clamp(p.trophyCapital + (continental ? 8 : 4));
                }
            }
        }
        if (state.age >= 26 && p.initializedAt26) {
            const peakTarget = clamp(role * .34 + market * .23 + num(state.reputation.prestige, 0) * .16 + p.continentalCred * .12 + p.nationalStanding * .08 + form * .07);
            p.peakStatus = clamp(p.peakStatus * .965 + peakTarget * .035 + (rng.next() - .5) * 1.0);
            const instTarget = clamp(p.lockerPower * .42 + p.institutionalTrust * .30 + p.roleSecurity * .18 + role * .10);
            p.institutionalPower = clamp(p.institutionalPower * .97 + instTarget * .03 + (rng.next() - .5) * .8);
            p.publicMyth = clamp(p.publicMyth * .97 + (p.commercialPower * .46 + media * .30 + num(state.reputation.prestige, 0) * .24) * .03 + (rng.next() - .5) * .7);
            p.careerControl = clamp(p.careerControl * .965 + (p.contractPower * .40 + p.agentControl * .24 + p.roleSecurity * .20 + p.environmentStability * .16) * .035 + (rng.next() - .5) * .7);
            p.nationalPower = clamp(p.nationalPower * .96 + (p.nationalStanding * .72 + (p.nationalRole === "regular" ? 22 : p.nationalRole === "rotation" ? 12 : p.nationalRole === "fringe" ? 5 : 0)) * .04);
            p.recoveryMargin = clamp(100 - p.bodyLoad * .45 - num(state.body.risk, 20) * .30 - num(state.body.fatigue, 15) * .18 - p.injuryMinutesImpact * .07);
            const successorBase = state.flags.HAS_SEED_YOUNG_SUCCESSOR ? 38 : 18;
            p.successionPressure = clamp(p.successionPressure * .97 + (successorBase + Math.max(0, 30 - role) * .4) * .03 + (rng.next() - .5) * .8);
            if (state.flags.HAS_SEED_POSITIONAL_REINVENTION)
                p.roleAdaptability = clamp(p.roleAdaptability + .22);
        }
    }
}
function advanceWorldDayInPlace(next) {
    const oldDate = next.date;
    next.date = addDays(next.date, 1);
    next.runtime.day += 1;
    next.runtime.seasonDay += 1;
    next.runtime.daysSinceNarrative += 1;
    for (const id of Object.keys(next.eventCooldowns))
        next.eventCooldowns[id] = Math.max(0, next.eventCooldowns[id] - 1);
    monthlyContractTick(next, oldDate);
    const oldMonthDay = oldDate.slice(5);
    const newMonthDay = next.date.slice(5);
    if (newMonthDay === "07-01" && oldMonthDay !== "07-01") {
        next.age += 1;
        const year = Number(next.date.slice(0, 4));
        next.season = seasonLabel(year);
        next.runtime.seasonDay = 0;
        next.runtime.eventsThisSeason = 0;
        next.phase = phaseForAge(next.age);
        if (next.age === 20 && !next.professional.initializedAt20) {
            const c20 = classifyState20(next);
            next.careerStateTags = c20.tags;
            adaptState20ToProfessional(next, c20.tags);
        }
        if (next.age === 23 && !next.professional.initializedAt23) {
            const c23 = classifyState23(next);
            next.careerStateTags = [...next.careerStateTags.filter(t => !String(t).startsWith("STATE23_")), ...c23.tags];
            next.world.state23Tags = c23.tags;
            next.world.state23Primary = c23.primary;
            next.world.state23Signature = c23.signature;
            adaptState23ToAdult(next, c23.tags);
        }
        if (next.age === 26) {
            const c26 = classifyState26(next);
            next.careerStateTags = [...next.careerStateTags.filter(t => !String(t).startsWith("STATE26_")), ...c26.tags];
            next.world.state26Tags = c26.tags;
            next.world.state26Primary = c26.primary;
            next.world.state26Signature = c26.signature;
            adaptState26ToPeak(next, c26.tags);
        }
        if (next.age === 30) {
            const c30 = classifyState30(next);
            next.careerStateTags = [...next.careerStateTags.filter(t => !String(t).startsWith("STATE30_")), ...c30.tags];
            next.world.state30Tags = c30.tags;
            next.world.state30Primary = c30.primary;
            next.world.state30Signature = c30.signature;
            adaptState30ToMaturity(next, c30.tags);
        }
        if (next.age >= 31 && next.age <= 33)
            runMaturityPreseason(next);
        if (next.age === 34) {
            runMaturityPreseason(next);
            const c34 = classifyState34(next);
            next.careerStateTags = [...next.careerStateTags.filter(t => !String(t).startsWith("STATE34_") && String(t) !== "STATE_EARLY_RETIRED_30_34"), ...c34.tags];
            next.world.state34Tags = c34.tags;
            next.world.state34Primary = c34.primary;
            next.world.state34Signature = c34.signature;
            lateCareerPreseason(next);
        }
        else if (next.age > 34 && next.retirement.status !== "closed")
            lateCareerPreseason(next);
    }
    if (next.runtime.day % 7 === 0) {
        footballWeek(next);
        const rng = new DeterministicRng(next.rngState.football);
        professionalWeek(next, rng);
        maturityWeek(next);
        lateCareerWeek(next);
    }
    if (next.flags.EARLY_RETIRED_30_34 && next.retirement.status !== "closed")
        closeCareer(next, "early_retirement_30_34", "early_retirement");
    return next;
}
function advanceWorldDay(state) {
    return advanceWorldDayInPlace(structuredClone(state));
}


// ═══ simulation/microfeed.js ═══
function maybeEmitMicroFeed(state, defs, enabled = true) {
    if (!enabled || state.age < 26)
        return null;
    // Check only every five days; feeds are texture, not a second narrative scheduler.
    if (state.runtime.day % 5 !== 0)
        return null;
    const rng = new DeterministicRng(state.rngState.microfeed);
    if (rng.next() > 0.075)
        return null;
    const seen = new Set(state.microfeeds.map(x => x.id));
    const eligible = defs.filter(d => state.age >= d.ageWindow[0] && state.age <= (d.ageWindow[1] ?? 99) && !seen.has(d.id) && conditionsPass(state, d.gates ?? []));
    if (!eligible.length)
        return null;
    const picked = rng.pickWeighted(eligible.map(item => ({ item, weight: item.weight })));
    const entry = { id: picked.item.id, date: state.date, family: picked.item.family, text: picked.item.text, mediaId: picked.item.mediaId };
    state.microfeeds.push(entry);
    return entry;
}


// ═══ simulation/state20-classifier.js ═══
function num(v, fallback = 0) { return typeof v === "number" ? v : fallback; }
function bool(v) { return v === true; }
/**
 * Adaptador canónico 18–20 → 20–23. Las etiquetas son combinables.
 * No puntúa el éxito: describe las puertas que existen al cumplir 20.
 */
function classifyState20(state) {
    const tags = [];
    const role = num(state.sport.roleScore);
    const trust = state.relationships.find(r => r.npcId === "NPC_CCH_01")?.trust ?? 45;
    const market = num(state.reputation.marketHeat);
    const risk = num(state.body.risk);
    const owner = typeof state.world.ownerClub === "string" ? state.world.ownerClub : state.club;
    const loan = bool(state.flags.LOAN_ACTIVE) || owner !== state.club;
    const bigContext = bool(state.flags.BIG_CLUB) || state.club === "BIG_CLUB" || state.tier <= 2;
    const conflict = bool(state.flags.CONFLICT_EXIT) || (state.club !== "UDV" && trust < 30);
    const injury = bool(state.flags.RECOVERING_INJURY) || bool(state.flags.LONG_INJURY) || state.body.acuteInjury === true || risk >= 65;
    const abroadStrong = bool(state.flags.ABROAD_STRONG) || (bool(state.flags.ABROAD_ROUTE) && state.tier <= 2);
    if (state.club === "UDV" && role >= 60)
        tags.push("STATE20_HOME_STARTER");
    if (state.club === "UDV" && role >= 18 && role < 60 && trust >= 25)
        tags.push("STATE20_HOME_ROTATION");
    if (loan)
        tags.push("STATE20_LOAN");
    if (bigContext && role < 45)
        tags.push("STATE20_BIG_RESERVE");
    if (conflict)
        tags.push("STATE20_CONFLICT_EXIT");
    if ((state.tier <= 2 || abroadStrong) && market >= 42)
        tags.push("STATE20_EARLY_ASCENT");
    if (injury)
        tags.push("STATE20_INJURY_REBUILD");
    if (state.tier >= 4 || bool(state.flags.LOWER_REBUILD))
        tags.push("STATE20_LOWER_REBUILD");
    if (!tags.length) {
        // Estado seguro de continuidad: una ruta intermedia nunca se interpreta como final.
        tags.push(state.club === "UDV" ? "STATE20_HOME_ROTATION" : "STATE20_LOWER_REBUILD");
    }
    // Orden primario por capacidad de alterar el próximo tramo, no por prestigio.
    const priority = [
        "STATE20_INJURY_REBUILD",
        "STATE20_CONFLICT_EXIT",
        "STATE20_LOAN",
        "STATE20_BIG_RESERVE",
        "STATE20_EARLY_ASCENT",
        "STATE20_LOWER_REBUILD",
        "STATE20_HOME_STARTER",
        "STATE20_HOME_ROTATION"
    ];
    const primary = priority.find(x => tags.includes(x)) ?? tags[0];
    return { tags, primary, signature: [...tags].sort().join("+") };
}


// ═══ simulation/state23-classifier.js ═══
const num = (x, fallback = 0) => typeof x === "number" ? x : fallback;
function classifyState23(state) {
    const p = state.professional;
    const role = num(state.sport.roleScore);
    const minutes = num(state.sport.minutesShare);
    const market = num(state.reputation.marketHeat);
    const media = num(state.reputation.mediaHeat);
    const risk = num(state.body.risk);
    const contractMonths = num(state.contract.monthsRemaining);
    const tags = [];
    const reasons = {};
    const add = (tag, why) => { if (!tags.includes(tag))
        tags.push(tag); reasons[tag] = why; };
    // Prestigio de club y nivel competitivo son deliberadamente dimensiones distintas.
    if (p.leagueTier === 1 && p.clubPrestigeTier >= 5 && role < 66)
        add("STATE23_ELITE_ROTATION", ["clubPrestigeTier>=5", "ROLE<66"]);
    if (p.leagueTier === 1 && p.clubPrestigeTier >= 5 && role >= 66)
        add("STATE23_ELITE_STARTER", ["clubPrestigeTier>=5", "ROLE>=66"]);
    if (p.leagueTier === 1 && p.clubPrestigeTier < 5 && role >= 63 && market >= 48)
        add("STATE23_TOP_STARTER", ["leagueTier=1", "club no élite", "ROLE alto", "mercado fuerte"]);
    if (p.leagueTier >= 2 && p.leagueTier <= 3 && role >= 68 && minutes >= 48)
        add("STATE23_SECOND_STAR", ["tier inferior", "producción/rol alto"]);
    if (p.ownerClub !== p.registrationClub && p.environmentStability <= 68)
        add("STATE23_LOAN_PROPERTY", ["propietario distinto", "estabilidad baja/media"]);
    if (p.route === "abroad" && p.foreignAdaptation >= 45)
        add("STATE23_ABROAD_BUILD", ["ruta extranjera", "adaptación suficiente"]);
    if (p.route === "home" && p.lockerPower >= 57 && (media >= 38 || num(state.reputation.prestige) >= 42))
        add("STATE23_HOME_ICON", ["ruta local", "peso de vestuario/reputación local"]);
    if ((state.flags.CONTRACT_DISPUTE || contractMonths <= 6) && p.institutionalTrust <= 42)
        add("STATE23_CONTRACT_WAR", ["poder contractual en disputa", "relación institucional dañada"]);
    if ((state.flags.LONG_INJURY || p.injuryMinutesImpact >= 30) && (risk >= 35 || minutes < 42))
        add("STATE23_INJURY_CROSSROADS", ["lesión relevante", "minutos alterados"]);
    if (p.leagueTier >= 3 && minutes >= 25 && role >= 38)
        add("STATE23_LATE_PRO", ["tier medio-bajo", "minutos profesionales suficientes"]);
    if (contractMonths <= 4 && market < 48)
        add("STATE23_FREE_AGENT_RISK", ["contrato casi finalizado", "mercado incierto"]);
    if (media >= 62 && media > market + 10)
        add("STATE23_MEDIA_PROFILE", ["exposición superior al mercado deportivo"]);
    if (!tags.length) {
        if (p.leagueTier === 1 && role >= 48)
            add("STATE23_TOP_STARTER", ["fallback de continuidad en alta liga"]);
        else
            add("STATE23_LATE_PRO", ["fallback de carrera profesional abierta"]);
    }
    const priority = [
        "STATE23_ELITE_STARTER", "STATE23_ELITE_ROTATION", "STATE23_TOP_STARTER", "STATE23_SECOND_STAR",
        "STATE23_LOAN_PROPERTY", "STATE23_ABROAD_BUILD", "STATE23_HOME_ICON", "STATE23_CONTRACT_WAR",
        "STATE23_INJURY_CROSSROADS", "STATE23_LATE_PRO", "STATE23_FREE_AGENT_RISK", "STATE23_MEDIA_PROFILE"
    ];
    const primary = priority.find(t => tags.includes(t)) ?? tags[0];
    return { tags, primary, signature: [...tags].sort().join("+"), reasons };
}


// ═══ simulation/state26-classifier.js ═══
const num = (x, f = 0) => typeof x === "number" ? x : f;
function classifyState26(state) {
    const p = state.professional;
    const role = num(state.sport.roleScore);
    const minutes = num(state.sport.minutesShare);
    const market = num(state.reputation.marketHeat);
    const media = num(state.reputation.mediaHeat);
    const prestige = num(state.reputation.prestige);
    const months = num(state.contract.monthsRemaining);
    const salary = num(state.contract.salaryMonthly);
    const risk = num(state.body.risk);
    const tags = [];
    const reasons = {};
    const add = (t, why) => { if (!tags.includes(t))
        tags.push(t); reasons[t] = why; };
    if (p.leagueTier === 1 && p.clubPrestigeTier >= 5 && role >= 70 && market >= 62 && prestige >= 75)
        add("STATE26_WORLD_ELITE", ["élite real", "rol dominante", "mercado y prestigio altos"]);
    if (p.leagueTier === 1 && p.clubPrestigeTier >= 5 && role >= 48 && role < 76)
        add("STATE26_ELITE_ROTATION", ["club élite", "rol no dominante"]);
    if (p.leagueTier === 1 && p.clubPrestigeTier < 5 && role >= 66 && market >= 52)
        add("STATE26_TOP_STARTER", ["alta liga", "titularidad sólida", "mercado fuerte"]);
    if (p.leagueTier >= 2 && p.leagueTier <= 3 && role >= 70 && minutes >= 55)
        add("STATE26_SECOND_STAR", ["segunda línea profesional", "rol alto"]);
    if (p.nationalRole === "regular" || (p.nationalCaps >= 12 && p.nationalStanding >= 68))
        add("STATE26_NATIONAL_REGULAR", ["continuidad con absoluta"]);
    if ((p.nationalCaps > 0 || state.flags.NATIONAL_CALLED) && p.nationalRole !== "regular")
        add("STATE26_NATIONAL_FRINGE", ["convocatorias sin rol estable"]);
    if (p.route === "abroad" && p.foreignAdaptation >= 68 && role >= 52)
        add("STATE26_ABROAD_ESTABLISHED", ["ruta exterior", "adaptación alta", "rol útil"]);
    if ((p.route === "home" || p.ownerClub === "UDV") && p.lockerPower >= 62 && role >= 58)
        add("STATE26_HOME_LEADER", ["arraigo", "poder de vestuario", "rol"]);
    if ((state.flags.WEALTHY_EXIT_ACCEPTED || salary >= 36000) && p.roleSecurity < 62 && p.contractPower < 72)
        add("STATE26_BIG_CONTRACT_TRAP", ["contrato alto", "poco control/rol"]);
    if ((months <= 14 || p.route === "free_agent") && market >= 58 && p.contractPower >= 65)
        add("STATE26_CONTRACT_POWER", ["mercado real", "horizonte contractual corto", "palanca alta"]);
    if ((state.flags.HAS_SEED_CHRONIC_BODY && p.bodyLoad >= 62) || p.injuryMinutesImpact >= 30 || (p.bodyLoad >= 74 && risk >= 38))
        add("STATE26_INJURY_MANAGEMENT", ["carga/antecedente crónico", "gestión activa"]);
    const jumped = p.leagueTierAt23 >= 2 && p.leagueTier < p.leagueTierAt23 && role >= 60 && market >= 50;
    if (jumped || (p.roleScoreAt23 < 48 && role >= 66 && market >= 52))
        add("STATE26_LATE_BREAKTHROUGH", ["salto 23-26", "rol crece tarde"]);
    if (months <= 1 && market >= 35)
        add("STATE26_FREE_AGENT", ["fin de contrato", "mercado abierto"]);
    if (p.commercialPower >= 60 && media >= 50 && p.publicPolarization >= 18)
        add("STATE26_MEDIA_POWER", ["marca fuerte", "exposición/polarización"]);
    if (!tags.length) {
        if (p.leagueTier === 1 && role >= 55)
            add("STATE26_TOP_STARTER", ["fallback de continuidad en alta liga"]);
        else if (p.leagueTier <= 3 && role >= 48)
            add("STATE26_SECOND_STAR", ["fallback profesional competitivo"]);
        else
            add("STATE26_CONTRACT_POWER", ["fallback: carrera abierta mediante control contractual"]);
    }
    const priority = ["STATE26_WORLD_ELITE", "STATE26_ELITE_ROTATION", "STATE26_TOP_STARTER", "STATE26_SECOND_STAR", "STATE26_NATIONAL_REGULAR", "STATE26_NATIONAL_FRINGE", "STATE26_ABROAD_ESTABLISHED", "STATE26_HOME_LEADER", "STATE26_BIG_CONTRACT_TRAP", "STATE26_CONTRACT_POWER", "STATE26_INJURY_MANAGEMENT", "STATE26_LATE_BREAKTHROUGH", "STATE26_FREE_AGENT", "STATE26_MEDIA_POWER"];
    const primary = priority.find(t => tags.includes(t)) ?? tags[0];
    return { tags, primary, signature: [...tags].sort().join("+"), reasons };
}


// ═══ simulation/state30-classifier.js ═══
const num = (x, f = 0) => typeof x === "number" ? x : f;
function classifyState30(state) {
    const p = state.professional, role = num(state.sport.roleScore), market = num(state.reputation.marketHeat), media = num(state.reputation.mediaHeat), salary = num(state.contract.salaryMonthly), months = num(state.contract.monthsRemaining), form = num(state.sport.form, 50);
    const tags = [];
    const reasons = {};
    const add = (t, why) => { if (!tags.includes(t))
        tags.push(t); reasons[t] = why; };
    if (p.peakStatus >= 76 && p.trophyCapital >= 48 && p.publicMyth >= 62 && p.nationalPower >= 45)
        add("STATE30_WORLD_ICON", ["pico máximo", "capital de títulos", "mito público e impacto internacional"]);
    if (p.leagueTier === 1 && p.clubPrestigeTier >= 4 && role >= 68 && market >= 60 && p.peakStatus >= 64)
        add("STATE30_GLOBAL_STAR", ["élite competitiva", "rol y mercado altos"]);
    if (p.clubPrestigeTier >= 4 && p.institutionalPower >= 63 && p.lockerPower >= 60)
        add("STATE30_ELITE_CAPTAIN", ["poder institucional", "peso de vestuario"]);
    if (p.clubPrestigeTier >= 4 && role >= 38 && role < 65 && salary >= 12000)
        add("STATE30_ELITE_ROTATION_LUXURY", ["gran club", "rol reducido", "salario alto"]);
    if (state.flags.HAS_SEED_PROJECT_FACE && (p.institutionalPower >= 45 || p.publicMyth >= 50))
        add("STATE30_PROJECT_FACE", ["proyecto construido alrededor del jugador"]);
    if (p.leagueTier === 1 && role >= 63 && p.peakStatus >= 52 && p.clubPrestigeTier < 5)
        add("STATE30_TOP_LEAGUE_STAR", ["alta liga", "producción fuerte sin estatus mundial obligatorio"]);
    if ((p.ownerClub === "UDV" || p.registrationClub === "UDV" || p.route === "home") && p.publicMyth >= 42 && p.institutionalPower >= 45)
        add("STATE30_ONE_CLUB_LEGEND", ["continuidad/origen", "mito institucional"]);
    if (p.nationalPower >= 62 || (p.nationalRole === "regular" && p.nationalCaps >= 16 && p.nationalStanding >= 65))
        add("STATE30_NATIONAL_ICON", ["peso central en selección"]);
    if (state.flags.HAS_SEED_POSITIONAL_REINVENTION && p.roleAdaptability >= 52 && role >= 48)
        add("STATE30_REINVENTED_VETERAN", ["adaptación táctica consolidada"]);
    if (p.peakStatus >= 48 && role >= 45 && (p.recoveryMargin <= 52 || state.flags.HAS_SEED_CHRONIC_BODY || state.flags.HAS_SEED_SURGERY_TIMING))
        add("STATE30_BODY_MANAGED_STAR", ["nivel alto", "gestión física imprescindible"]);
    if ((p.peakStatus < 48 && (role < 48 || form < 45)) || (p.recoveryMargin < 32 && role < 58) || (state.flags.HAS_SEED_FIRST_PEAK_DIP && p.peakStatus < 54 && form < 48))
        add("STATE30_EARLY_DECLINE_RISK", ["señales de descenso sin cierre definitivo"]);
    if ((state.flags.HAS_SEED_WEALTHY_PEAK_EXIT || salary >= 30000) && role < 64 && months >= 20 && market < 66)
        add("STATE30_BIG_CONTRACT_TRAP", ["contrato alto", "rol/control limitados"]);
    if ((months <= 14 || p.route === "free_agent") && market >= 55 && p.careerControl >= 58 && p.contractPower >= 58)
        add("STATE30_CONTRACT_KINGMAKER", ["mercado", "libertad contractual", "control"]);
    const lateFrom26 = (state.world.state26Tags ?? []).includes("STATE26_LATE_BREAKTHROUGH");
    if ((lateFrom26 && p.peakStatus >= 52 && role >= 55) || (p.roleScoreAt23 < 45 && role >= 67 && market >= 58))
        add("STATE30_LATE_PEAK", ["pico tardío todavía en expansión"]);
    if (p.publicMyth >= 52 && p.publicPolarization >= 24 && media >= 35)
        add("STATE30_MEDIA_POLARIZED", ["figura pública fuerte", "percepción dividida"]);
    if (state.flags.HAS_SEED_WEALTHY_PEAK_EXIT)
        add("STATE30_WEALTHY_EXIT", ["salida deliberada por contrato de riqueza"]);
    if (state.flags.HAS_SEED_EARLY_HOME_RETURN || (p.route === "home" && state.age >= 29 && p.ownerClub === "UDV"))
        add("STATE30_EARLY_HOME_RETURN", ["regreso competitivo al origen"]);
    if (!tags.length) {
        if (p.leagueTier === 1 && role >= 55)
            add("STATE30_TOP_LEAGUE_STAR", ["continuidad competitiva en alta liga"]);
        else if (p.roleAdaptability >= 52)
            add("STATE30_REINVENTED_VETERAN", ["carrera adulta abierta mediante adaptación"]);
        else
            add("STATE30_EARLY_DECLINE_RISK", ["estado abierto: nivel/rol por reconstruir"]);
    }
    const priority = ["STATE30_WORLD_ICON", "STATE30_GLOBAL_STAR", "STATE30_ELITE_CAPTAIN", "STATE30_PROJECT_FACE", "STATE30_TOP_LEAGUE_STAR", "STATE30_NATIONAL_ICON", "STATE30_ONE_CLUB_LEGEND", "STATE30_REINVENTED_VETERAN", "STATE30_BODY_MANAGED_STAR", "STATE30_ELITE_ROTATION_LUXURY", "STATE30_CONTRACT_KINGMAKER", "STATE30_LATE_PEAK", "STATE30_MEDIA_POLARIZED", "STATE30_WEALTHY_EXIT", "STATE30_EARLY_HOME_RETURN", "STATE30_BIG_CONTRACT_TRAP", "STATE30_EARLY_DECLINE_RISK"];
    const primary = priority.find(t => tags.includes(t)) ?? tags[0];
    return { tags, primary, signature: [...tags].sort().join("+"), reasons };
}


// ═══ simulation/state34-classifier.js ═══
const num = (x, f = 0) => typeof x === "number" ? x : f;
function classifyState34(state) {
    const p = state.professional, role = num(state.sport.roleScore), market = num(state.reputation.marketHeat), salary = num(state.contract.salaryMonthly), months = num(state.contract.monthsRemaining), form = num(state.sport.form, 50);
    const tags = [];
    const reasons = {};
    const add = (t, ...why) => { if (!tags.includes(t))
        tags.push(t); reasons[t] = why; };
    if (state.flags.EARLY_RETIRED_30_34)
        add("STATE_EARLY_RETIRED_30_34", "retirada anticipada elegida o condicionada de forma plausible");
    if (!state.flags.EARLY_RETIRED_30_34) {
        if (p.peakStatus >= 62 && role >= 60 && p.availability >= 52 && p.leagueTier === 1 && p.clubPrestigeTier >= 3)
            add("STATE34_WORLD_ELITE", "pico y rol altos", "cuerpo sostenible");
        if (p.clubPrestigeTier >= 4 && ((role >= 35 && role < 64) || state.flags.SPECIALIST_ROLE) && p.statusInertia >= 44)
            add("STATE34_ELITE_SPECIALIST", "gran club", "minutos selectivos");
        if (state.flags.ROLE_REINVENTED_30 && p.tacticalReading >= 60 && role >= 40)
            add("STATE34_REINVENTED_CREATOR", "reinvención táctica", "lectura alta");
        if ((state.flags.CAPTAIN_MENTOR || p.institutionalPower >= 68) && p.legacyCapital >= 42)
            add("STATE34_ELITE_CAPTAIN_MENTOR", "capital de legado", "poder de vestuario");
        if (p.route === "home" && p.publicMyth >= 42 && p.legacyCapital >= 40 && p.ownerClub === "UDV")
            add("STATE34_ONE_CLUB_ICON", "permanencia y mito institucional");
        if ((state.flags.HOME_RETURN_30 || p.route === "home") && p.ownerClub === "UDV" && role >= 45)
            add("STATE34_HOME_RETURN_LEADER", "regreso a Valdoria", "rol real");
        const late30 = (state.world.state30Tags ?? []).includes("STATE30_LATE_PEAK");
        if ((late30 || state.flags.LATE_BLOOM_30_34) && p.peakStatus >= 55 && role >= 55 && p.availability >= 48)
            add("STATE34_LATE_BLOOM_PEAK", "pico tardío", "forma y cuerpo suficientes");
        if (state.flags.RICH_LEAGUE_ROUTE && role >= 55)
            add("STATE34_RICH_LEAGUE_STAR", "liga rica", "rol alto");
        if (state.flags.TRANSATLANTIC_PROJECT && p.commercialPower >= 50)
            add("STATE34_TRANSATLANTIC_FACE", "proyecto global", "peso comercial");
        if (p.clubPrestigeTier >= 4 && ((role >= 28 && role < 56) || state.flags.SPECIALIST_ROLE) && salary >= 10000)
            add("STATE34_BIG_CLUB_LUXURY", "gran club y salario", "rol reducido");
        if ((state.flags.CONTRACT_TRAP_30 && role < 62 && months >= 12) || (salary >= 32000 && role < 48 && months >= 18 && market < 52))
            add("STATE34_CONTRACT_TRAP", "salario/contrato altos", "salida difícil");
        if (p.matchSelectivity >= 48 && p.availability >= 52 && p.recoveryDebt < 58)
            add("STATE34_BODY_MANAGED", "calendario selectivo", "cuerpo sostenible con restricciones");
        const matureInjuries = num(state.world.maturityInjuryCount, 0), matureLongInjuries = num(state.world.maturityLongInjuryCount, 0);
        if (p.recoveryDebt >= 62 || p.availability < 44 || matureInjuries >= 3 || (matureLongInjuries >= 1 && state.flags.HAS_SEED_CHRONIC_BODY) || (state.flags.HAS_SEED_CHRONIC_BODY && p.recoveryDebt >= 52))
            add("STATE34_BODY_FRAGILE", "deuda de recuperación o disponibilidad intermitente");
        if (!state.flags.NATIONAL_RETIRED && p.nationalPower >= 55 && p.nationalCaps >= 12)
            add("STATE34_NT_LEADER", "peso internacional todavía alto");
        if (state.flags.NATIONAL_RETIRED)
            add("STATE34_NT_RETIRED", "retirada internacional previa");
        if ((months <= 6 || p.route === "free_agent") && market >= 42 && p.contractPower >= 52)
            add("STATE34_FREE_AGENT_POWER", "libertad contractual", "demanda de mercado");
        const matureMoves = state.history.filter(h => /^EVT_3[0-3]_(MKT|HOME)_/.test(h.eventId) && ["A", "C"].includes(h.choiceId)).length;
        if (matureMoves >= 3 && p.route !== "home")
            add("STATE34_JOURNEYMAN_VETERAN", "múltiples clubes o mercados");
        if (p.retirementDistance >= 25 || p.motivationReserve < 45)
            add("STATE34_RETIREMENT_NEAR", "retirada ya considerada seriamente");
        if (!tags.length) {
            if (role >= 52 && p.leagueTier <= 2)
                add("STATE34_BODY_MANAGED", "continuidad competitiva con gestión veterana");
            else
                add("STATE34_RETIREMENT_NEAR", "mercado, rol o motivación exigen redefinir continuidad");
        }
    }
    const priority = ["STATE_EARLY_RETIRED_30_34", "STATE34_WORLD_ELITE", "STATE34_NT_LEADER", "STATE34_ELITE_CAPTAIN_MENTOR", "STATE34_LATE_BLOOM_PEAK", "STATE34_ONE_CLUB_ICON", "STATE34_HOME_RETURN_LEADER", "STATE34_RICH_LEAGUE_STAR", "STATE34_TRANSATLANTIC_FACE", "STATE34_ELITE_SPECIALIST", "STATE34_REINVENTED_CREATOR", "STATE34_FREE_AGENT_POWER", "STATE34_BODY_MANAGED", "STATE34_BIG_CLUB_LUXURY", "STATE34_CONTRACT_TRAP", "STATE34_JOURNEYMAN_VETERAN", "STATE34_NT_RETIRED", "STATE34_BODY_FRAGILE", "STATE34_RETIREMENT_NEAR"];
    const primary = priority.find(t => tags.includes(t)) ?? tags[0];
    return { tags, primary, signature: [...tags].sort().join("+"), reasons, terminal: state.flags.EARLY_RETIRED_30_34 === true };
}


// ═══ simulation/adult-adapter.js ═══
const clamp = (x, min = 0, max = 100) => Math.min(max, Math.max(min, x));
const num = (x, f = 0) => typeof x === "number" ? x : f;
/** Snapshots the state at 23 and opens the adult systems without granting success. */
function adaptState23ToAdult(state, tags) {
    if (state.professional.initializedAt23)
        return;
    const p = state.professional;
    p.leagueTierAt23 = p.leagueTier;
    p.clubPrestigeTierAt23 = p.clubPrestigeTier;
    p.roleScoreAt23 = num(state.sport.roleScore, 40);
    p.bodyLoad = clamp(num(state.body.risk, 20) * 0.55 + num(state.body.fatigue, 15) * 0.45 + p.injuryMinutesImpact * 0.25);
    p.commercialPower = clamp(num(state.reputation.mediaHeat, 0) * 0.55 + num(state.reputation.prestige, 0) * 0.30 + num(state.reputation.marketHeat, 0) * 0.15);
    p.publicPolarization = clamp(num(state.reputation.mediaHeat, 0) - num(state.reputation.marketHeat, 0) * 0.45);
    p.nationalStanding = clamp(p.nationalHeat * 0.55 + (state.flags.NATIONAL_RADAR ? 10 : 0));
    p.nationalRole = "none";
    p.nationalCaps = 0;
    p.continentalCred = clamp((p.leagueTier === 1 ? 12 : 0) + (p.clubPrestigeTier >= 4 ? 10 : 0));
    state.flags.ADULT_23_ADAPTED = true;
    state.flags.NATIONAL_TOURNAMENT_CYCLE = false;
    state.flags.CONTINENTAL_CONTEXT = false;
    state.flags.CONTINENTAL_REGISTERED = false;
    state.flags.STAR_COMPETITION = false;
    state.professional.initializedAt23 = true;
    // STATE23 tags influence plausibility, never guarantee the next tier.
    if (tags.includes("STATE23_ELITE_STARTER"))
        p.continentalCred = clamp(p.continentalCred + 12);
    if (tags.includes("STATE23_MEDIA_PROFILE"))
        p.commercialPower = clamp(p.commercialPower + 12);
    if (tags.includes("STATE23_INJURY_CROSSROADS"))
        p.bodyLoad = clamp(p.bodyLoad + 12);
}


// ═══ simulation/professional-adapter.js ═══
const clamp = (x, min = 0, max = 100) => Math.min(max, Math.max(min, x));
const num = (x, fallback = 0) => typeof x === "number" ? x : fallback;
function adaptState20ToProfessional(state, tags) {
    if (state.professional.initializedAt20)
        return;
    const has = (tag) => tags.includes(tag);
    let leagueTier = Math.max(1, Math.min(5, state.tier));
    let clubPrestigeTier = leagueTier === 1 ? 3 : leagueTier === 2 ? 2 : 1;
    let clubPrestigeScore = leagueTier === 1 ? 60 : leagueTier === 2 ? 44 : 28;
    let route = "domestic";
    if (has("STATE20_BIG_RESERVE") || has("STATE20_EARLY_ASCENT")) {
        leagueTier = 1;
        clubPrestigeTier = has("STATE20_BIG_RESERVE") ? 5 : 4;
        clubPrestigeScore = has("STATE20_BIG_RESERVE") ? 88 : 76;
        if (has("STATE20_BIG_RESERVE")) {
            state.club = "Aurora CF";
            state.professional.ownerClub = "Aurora CF";
            state.professional.registrationClub = "Aurora CF";
            state.flags.BIG_CLUB = true;
        }
    }
    else if (has("STATE20_LOAN")) {
        route = "loan";
        leagueTier = Math.min(3, Math.max(2, leagueTier));
        state.professional.ownerClub = String(state.world.ownerClub ?? "UDV");
        state.professional.registrationClub = state.club;
    }
    else if (has("STATE20_LOWER_REBUILD")) {
        leagueTier = Math.max(3, leagueTier);
        clubPrestigeTier = 1;
        clubPrestigeScore = 22;
    }
    else if (has("STATE20_HOME_STARTER") || has("STATE20_HOME_ROTATION")) {
        route = "home";
        state.club = "UDV";
        state.professional.ownerClub = "UDV";
        state.professional.registrationClub = "UDV";
    }
    if (state.flags.ABROAD_ROUTE)
        route = "abroad";
    if (state.flags.CONFLICT_EXIT)
        state.flags.CONTRACT_DISPUTE = true;
    const role = num(state.sport.roleScore, 30);
    const market = num(state.reputation.marketHeat, 20);
    state.professional = {
        ownerClub: state.professional.ownerClub || String(state.world.ownerClub ?? state.club),
        registrationClub: state.club,
        leagueTier,
        clubPrestigeTier,
        clubPrestigeScore,
        contractPower: clamp(28 + market * 0.35 + (has("STATE20_CONFLICT_EXIT") ? 18 : 0)),
        roleSecurity: clamp(role * 0.78 + (has("STATE20_HOME_STARTER") ? 18 : 0) - (has("STATE20_BIG_RESERVE") ? 18 : 0)),
        agentControl: clamp(100 - num(state.control.agentDependency, 0) * 0.7),
        environmentStability: clamp(has("STATE20_INJURY_REBUILD") ? 45 : has("STATE20_LOAN") ? 50 : 66),
        moneyComfort: clamp(num(state.finances.cash, 1200) / 1200 + clubPrestigeTier * 5),
        lockerPower: clamp(role * 0.45 + (has("STATE20_HOME_STARTER") ? 18 : 0)),
        foreignAdaptation: state.flags.ABROAD_ROUTE ? 38 : 0,
        nationalHeat: clamp(num(state.reputation.mediaHeat, 0) * 0.7 + market * 0.25),
        nationalStanding: 0,
        nationalCaps: 0,
        nationalRole: "none",
        continentalCred: 0,
        bodyLoad: clamp(num(state.body.risk, 18) * 0.55 + num(state.body.fatigue, 12) * 0.45),
        commercialPower: clamp(num(state.reputation.mediaHeat, 0) * 0.5 + num(state.reputation.prestige, 0) * 0.25),
        publicPolarization: 0,
        institutionalTrust: clamp(has("STATE20_CONFLICT_EXIT") ? 28 : 58 + role * 0.15),
        injuryMinutesImpact: has("STATE20_INJURY_REBUILD") ? 38 : 0,
        peakStatus: clamp(role * 0.35 + market * 0.25 + clubPrestigeScore * 0.20),
        institutionalPower: clamp(role * 0.25 + (has("STATE20_HOME_STARTER") ? 20 : 0)),
        trophyCapital: 0, publicMyth: clamp(num(state.reputation.mediaHeat, 0) * 0.5), careerControl: clamp(30 + market * 0.2),
        nationalPower: 0, recoveryMargin: clamp(100 - num(state.body.risk, 18) - num(state.body.fatigue, 12) * 0.5),
        successionPressure: 0, roleAdaptability: 35,
        veteranLeverage: 8, statusInertia: 5, recoveryDebt: clamp(num(state.body.risk, 18) * 0.18), matchSelectivity: 10,
        explosiveness: 82, matchEndurance: 78, recoveryBetweenMatches: 84, technique: 62, tacticalReading: 48,
        composure: 52, availability: clamp(100 - num(state.body.risk, 18) * 0.45 - num(state.body.fatigue, 12) * 0.25),
        gameSpeedPerception: 70, retirementDistance: 0, motivationReserve: 88, legacyCapital: 2, homePull: route === "home" ? 45 : 25,
        relocationTolerance: 80, initializedAt30: false, initializedAt26: false,
        leagueTierAt23: leagueTier, clubPrestigeTierAt23: clubPrestigeTier, roleScoreAt23: role,
        route,
        initializedAt20: true, initializedAt23: false
    };
    state.tier = leagueTier;
    state.world.ownerClub = state.professional.ownerClub;
    state.flags.PROFESSIONAL_ADAPTED = true;
    state.contract.monthsRemaining = Math.max(18, num(state.contract.monthsRemaining, 0));
    state.contract.salaryMonthly = Math.max(num(state.contract.salaryMonthly, 900), leagueTier === 1 ? 14000 : leagueTier === 2 ? 6500 : 3000);
}


// ═══ simulation/peak-adapter.js ═══
const clamp = (x, min = 0, max = 100) => Math.min(max, Math.max(min, x));
const num = (x, f = 0) => typeof x === "number" ? x : f;
function adaptState26ToPeak(state, tags) {
    if (state.professional.initializedAt26)
        return;
    const p = state.professional;
    const role = num(state.sport.roleScore, 50);
    const market = num(state.reputation.marketHeat, 30);
    const prestige = num(state.reputation.prestige, 30);
    p.peakStatus = clamp(role * .34 + market * .25 + prestige * .20 + p.continentalCred * .12 + p.nationalStanding * .09);
    p.institutionalPower = clamp(p.lockerPower * .45 + p.institutionalTrust * .30 + role * .25);
    p.trophyCapital = clamp(p.continentalCred * .38 + p.nationalStanding * .20 + Math.max(0, p.clubPrestigeTier - 2) * 8);
    p.publicMyth = clamp(p.commercialPower * .40 + num(state.reputation.mediaHeat, 0) * .32 + prestige * .28);
    p.careerControl = clamp(p.contractPower * .42 + p.agentControl * .28 + p.roleSecurity * .18 + p.environmentStability * .12);
    p.nationalPower = clamp(p.nationalStanding * .70 + (p.nationalRole === "regular" ? 22 : p.nationalRole === "rotation" ? 12 : 0));
    p.recoveryMargin = clamp(100 - p.bodyLoad * .52 - num(state.body.risk, 20) * .30 - num(state.body.fatigue, 15) * .18);
    p.successionPressure = clamp(tags.includes("STATE26_WORLD_ELITE") ? 25 : tags.includes("STATE26_TOP_STARTER") ? 18 : 10);
    p.roleAdaptability = clamp(35 + (state.flags.HAS_SEED_TACTICAL_SACRIFICE ? 15 : 0) + (state.flags.HAS_SEED_YOUNG_MENTOR ? 5 : 0));
    p.initializedAt26 = true;
    state.flags.PEAK_26_ADAPTED = true;
}


// ═══ simulation/maturity-adapter.js ═══
const clamp = (x, min = 0, max = 100) => Math.min(max, Math.max(min, x));
const num = (x, f = 0) => typeof x === "number" ? x : f;
function adaptState30ToMaturity(state, tags) {
    const p = state.professional;
    if (p.initializedAt30)
        return;
    const role = num(state.sport.roleScore, 50), form = num(state.sport.form, 50), risk = num(state.body.risk, 20), fatigue = num(state.body.fatigue, 15), market = num(state.reputation.marketHeat, 35);
    // Perfil físico oculto y reproducible. No es "potencial de retirada": solo modifica cómo responde el cuerpo a la carga.
    if (typeof state.world.longevityProfile !== "number") {
        const rng = new DeterministicRng(state.rngState.football);
        state.world.longevityProfile = Math.round(28 + rng.next() * 66);
    }
    p.veteranLeverage = clamp(p.contractPower * .36 + market * .25 + p.publicMyth * .16 + p.institutionalPower * .13 + role * .10);
    p.statusInertia = clamp(p.peakStatus * .50 + p.publicMyth * .25 + p.trophyCapital * .15 + p.institutionalPower * .10);
    p.recoveryDebt = clamp(p.bodyLoad * .46 + risk * .30 + fatigue * .24 - (p.recoveryMargin - 50) * .18);
    p.matchSelectivity = clamp((state.flags.HAS_SEED_PEAK_LOAD ? 55 : 25) + (state.flags.HAS_SEED_SELF_OPTIMIZATION ? 12 : 0) + (100 - p.recoveryMargin) * .18);
    p.explosiveness = clamp(78 - (risk * .20) - (p.recoveryDebt * .10) + (state.flags.HAS_SEED_SELF_OPTIMIZATION ? 6 : 0) + (form - 50) * .08);
    p.matchEndurance = clamp(76 - (p.recoveryDebt * .12) + (p.roleAdaptability - 50) * .08 + (form - 50) * .10);
    p.recoveryBetweenMatches = clamp(82 - (p.recoveryDebt * .35) - (risk * .12) + (state.flags.HAS_SEED_SELF_OPTIMIZATION ? 5 : 0));
    p.technique = clamp(60 + p.peakStatus * .22 + p.roleAdaptability * .12);
    p.tacticalReading = clamp(52 + p.roleAdaptability * .28 + p.institutionalPower * .10);
    p.composure = clamp(58 + p.trophyCapital * .16 + p.institutionalPower * .14);
    p.availability = clamp(96 - risk * .35 - p.recoveryDebt * .30 - p.injuryMinutesImpact * .18);
    p.gameSpeedPerception = clamp(64 + p.tacticalReading * .25 - p.recoveryDebt * .10);
    const longevity = num(state.world.longevityProfile, 55);
    p.retirementDistance = clamp((100 - p.recoveryMargin) * .18 + Math.max(0, 50 - role) * .12 + Math.max(0, 42 - longevity) * .45 + (tags.includes("STATE30_EARLY_DECLINE_RISK") ? 12 : 0));
    p.motivationReserve = clamp(82 - (tags.includes("STATE30_BIG_CONTRACT_TRAP") ? 10 : 0) - (tags.includes("STATE30_EARLY_DECLINE_RISK") ? 9 : 0) + (tags.includes("STATE30_LATE_PEAK") ? 8 : 0));
    p.legacyCapital = clamp(p.trophyCapital * .34 + p.publicMyth * .28 + p.institutionalPower * .22 + p.nationalPower * .16);
    p.homePull = clamp(28 + (state.flags.HAS_SEED_HOME_INSTITUTION ? 18 : 0) + (state.flags.HAS_SEED_EARLY_HOME_RETURN ? 30 : 0));
    p.relocationTolerance = clamp(76 - (p.environmentStability * .10) - (p.homePull * .22) + (p.route === "abroad" ? 10 : 0));
    p.initializedAt30 = true;
    state.flags.MATURE_30_ADAPTED = true;
}


// ═══ simulation/career-simulator.js ═══
function selectChoice(state, event, strategy) {
    if (strategy === "first")
        return event.choices[0].id;
    if (strategy === "balanced") {
        const center = Math.floor((event.choices.length - 1) / 2);
        return event.choices[center].id;
    }
    const rng = new DeterministicRng(state.rngState.qa);
    return event.choices[Math.floor(rng.next() * event.choices.length)].id;
}
function historySignature(history) {
    return history.map(h => `${h.date}:${h.eventId}:${h.choiceId}:${h.outcomeId}`).join("|");
}
function finalSignature(state, narrativeSignature, state20, state23, state26, state30, state34) {
    const final = [
        state20.signature,
        state23?.signature ?? "pre23",
        state26?.signature ?? "pre26",
        state30?.signature ?? "pre30",
        state34?.signature ?? "pre34",
        state.club,
        state.tier,
        Math.round(Number(state.sport.roleScore ?? 0) / 5) * 5,
        Math.round(Number(state.reputation.marketHeat ?? 0) / 5) * 5,
        Math.round(Number(state.body.risk ?? 0) / 5) * 5,
        String(state.world.nextCyclePriority ?? "none")
    ].join(":");
    return `${narrativeSignature}||${final}`;
}
function simulateCareer(options) {
    const source = options.events ?? EVENTS;
    const index = new EventIndex(source);
    const days = options.days ?? (options.untilRetirement ? 14000 : 1827);
    const strategy = options.choiceStrategy ?? "random";
    let state = createInitialState(options.seed);
    for (let day = 0; day < days; day++) {
        const scheduled = scheduleEvent(state, index, { qa: options.qa });
        if (scheduled) {
            const choiceId = selectChoice(state, scheduled.event, strategy);
            resolveChoiceInPlace(state, scheduled.event, choiceId, options.qa);
        }
        if (state.flags.EARLY_RETIRED_30_34 && state.retirement.status !== "closed")
            closeCareer(state, "early_retirement_30_34", "early_retirement");
        if (state.retirement.status === "closed") {
            generateEpilogue(state);
            break;
        }
        advanceWorldDayInPlace(state);
        if (state.age < 30)
            maybeEmitMicroFeed(state, MICROFEEDS_26_30, options.microfeeds ?? true);
        else if (state.age < 34)
            maybeEmitMicroFeed(state, MICROFEEDS_30_34, options.microfeeds ?? true);
        else
            maybeEmitMicroFeed(state, MICROFEEDS_34_PLUS, options.microfeeds ?? true);
        if (options.untilRetirement && state.age >= (options.maxAge ?? 55))
            break;
    }
    const state20 = classifyState20(state);
    const state23 = state.age >= 23 ? classifyState23(state) : undefined;
    const state26 = state.age >= 26 ? classifyState26(state) : undefined;
    const state30 = state.age >= 30 ? classifyState30(state) : undefined;
    const state34 = (state.age >= 34 || state.flags.EARLY_RETIRED_30_34) ? classifyState34(state) : undefined;
    state.careerStateTags = [...state20.tags, ...(state23?.tags ?? []), ...(state26?.tags ?? []), ...(state30?.tags ?? []), ...(state34?.tags ?? [])];
    const narrativeSignature = historySignature(state.history);
    return {
        seed: options.seed,
        state,
        history: state.history,
        narrativeSignature,
        signature: finalSignature(state, narrativeSignature, state20, state23, state26, state30, state34),
        state20,
        state23,
        state26,
        state30,
        state34
    };
}


// ═══ simulation/batch.js ═══
const round = (n, d = 2) => Math.round(n * 10 ** d) / 10 ** d;
function entropyBits(counts) { const total = counts.reduce((a, b) => a + b, 0); if (!total)
    return 0; return -counts.reduce((sum, c) => { if (!c)
    return sum; const p = c / total; return sum + p * Math.log2(p); }, 0); }
function hashString(value) { let h = 2166136261 >>> 0; for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
} return h.toString(16).padStart(8, "0"); }
function runBatch(options) {
    const runs = options.runs, days = options.days ?? 1827, startSeed = options.startSeed ?? 100000;
    const eventFrequency = {}, seedFrequency = {}, finalClubFrequency = {}, leagueTierFrequency = {}, clubPrestigeTierFrequency = {};
    const state20Frequency = {}, state23Frequency = {}, primaryState23Frequency = {}, state26Frequency = {}, primaryState26Frequency = {};
    const sequences = new Set(), finals = new Set();
    const eventCounts = [], cond20 = [], cond23 = [];
    let age23Reached = 0, age26Reached = 0, p20sum = 0, p23sum = 0;
    let role = 0, market = 0, risk = 0, prestige = 0, contractPower = 0, roleSecurity = 0, lockerPower = 0, foreignAdaptation = 0, nationalStanding = 0, nationalCaps = 0, continentalCred = 0, bodyLoad = 0, commercialPower = 0;
    const t0 = Date.now();
    for (let i = 0; i < runs; i++) {
        const r = simulateCareer({ seed: startSeed + i, days, choiceStrategy: options.choiceStrategy ?? "random" });
        eventCounts.push(r.history.length);
        sequences.add(hashString(r.narrativeSignature));
        finals.add(r.state26?.signature ?? r.state23?.signature ?? "pre23");
        if (r.state.age >= 23)
            age23Reached++;
        if (r.state.age >= 26)
            age26Reached++;
        const p20 = r.history.filter(h => /^EVT_(20|21|22)_/.test(h.eventId)).length, c20 = r.history.filter(h => /^CEVT_(20|21|22)_/.test(h.eventId)).length, p23 = r.history.filter(h => /^EVT_(23|24|25)_/.test(h.eventId)).length, c23 = r.history.filter(h => /^CEVT_(23|24|25)_/.test(h.eventId)).length;
        p20sum += p20;
        p23sum += p23;
        cond20.push(c20);
        cond23.push(c23);
        for (const h of r.history)
            eventFrequency[h.eventId] = (eventFrequency[h.eventId] ?? 0) + 1;
        for (const seed of r.state.seeds)
            seedFrequency[seed.id] = (seedFrequency[seed.id] ?? 0) + 1;
        for (const t of r.state20.tags)
            state20Frequency[t] = (state20Frequency[t] ?? 0) + 1;
        const stored23 = r.state.world.state23Tags ?? r.state23?.tags ?? [];
        for (const t of stored23)
            state23Frequency[t] = (state23Frequency[t] ?? 0) + 1;
        const p23tag = r.state.world.state23Primary ?? r.state23?.primary;
        if (p23tag)
            primaryState23Frequency[p23tag] = (primaryState23Frequency[p23tag] ?? 0) + 1;
        if (r.state26) {
            for (const t of r.state26.tags)
                state26Frequency[t] = (state26Frequency[t] ?? 0) + 1;
            primaryState26Frequency[r.state26.primary] = (primaryState26Frequency[r.state26.primary] ?? 0) + 1;
        }
        finalClubFrequency[r.state.club] = (finalClubFrequency[r.state.club] ?? 0) + 1;
        leagueTierFrequency[String(r.state.professional.leagueTier)] = (leagueTierFrequency[String(r.state.professional.leagueTier)] ?? 0) + 1;
        clubPrestigeTierFrequency[String(r.state.professional.clubPrestigeTier)] = (clubPrestigeTierFrequency[String(r.state.professional.clubPrestigeTier)] ?? 0) + 1;
        role += Number(r.state.sport.roleScore ?? 0);
        market += Number(r.state.reputation.marketHeat ?? 0);
        risk += Number(r.state.body.risk ?? 0);
        prestige += Number(r.state.reputation.prestige ?? 0);
        contractPower += r.state.professional.contractPower;
        roleSecurity += r.state.professional.roleSecurity;
        lockerPower += r.state.professional.lockerPower;
        foreignAdaptation += r.state.professional.foreignAdaptation;
        nationalStanding += r.state.professional.nationalStanding;
        nationalCaps += r.state.professional.nationalCaps;
        continentalCred += r.state.professional.continentalCred;
        bodyLoad += r.state.professional.bodyLoad;
        commercialPower += r.state.professional.commercialPower;
    }
    const elapsedMs = Math.max(1, Date.now() - t0), sum = eventCounts.reduce((a, b) => a + b, 0), c20sum = cond20.reduce((a, b) => a + b, 0), c23sum = cond23.reduce((a, b) => a + b, 0);
    return { runs, daysPerRun: days, elapsedMs, careersPerSecond: round(runs / (elapsedMs / 1000), 1), age23Reached, age26Reached, avgEvents: round(sum / runs), minEvents: Math.min(...eventCounts), maxEvents: Math.max(...eventCounts), avgPrincipal20_23: round(p20sum / runs), avgConditional20_23: round(c20sum / runs), minConditional20_23: Math.min(...cond20), maxConditional20_23: Math.max(...cond20), avgPrincipal23_26: round(p23sum / runs), avgConditional23_26: round(c23sum / runs), minConditional23_26: Math.min(...cond23), maxConditional23_26: Math.max(...cond23), uniqueSequences: sequences.size, uniqueFinalStateSignatures: finals.size, state23EntropyBits: round(entropyBits(Object.values(primaryState23Frequency)), 3), state26EntropyBits: round(entropyBits(Object.values(primaryState26Frequency)), 3), eventFrequency, seedFrequency, state20Frequency, state23Frequency, primaryState23Frequency, state26Frequency, primaryState26Frequency, finalClubFrequency, leagueTierFrequency, clubPrestigeTierFrequency,
        finalAverages: { role: round(role / runs), marketHeat: round(market / runs), bodyRisk: round(risk / runs), prestige: round(prestige / runs), contractPower: round(contractPower / runs), roleSecurity: round(roleSecurity / runs), lockerPower: round(lockerPower / runs), foreignAdaptation: round(foreignAdaptation / runs), nationalStanding: round(nationalStanding / runs), nationalCaps: round(nationalCaps / runs), continentalCred: round(continentalCred / runs), bodyLoad: round(bodyLoad / runs), commercialPower: round(commercialPower / runs) },
        totals: { events: sum, principal20_23: p20sum, conditional20_23: c20sum, principal23_26: p23sum, conditional23_26: c23sum, role, marketHeat: market, bodyRisk: risk, prestige, contractPower, roleSecurity, lockerPower, foreignAdaptation, nationalStanding, nationalCaps, continentalCred, bodyLoad, commercialPower }, ...(options.includeHashes ? { sequenceHashes: [...sequences], finalStateSignatures: [...finals] } : {}) };
}


// ═══ epilogue/generator.js ═══
const num = (x, f = 0) => typeof x === "number" ? x : f;
var ENDING_FAMILIES = [
    "END_WORLD_LEGEND", "END_ONE_CLUB_MYTH", "END_HOME_PRODIGAL", "END_GREAT_PRO", "END_TACTICAL_SECOND_CAREER",
    "END_JOURNEYMAN_VETERAN", "END_MARKET_SILENCE", "END_BODY_CLOSED_DOOR", "END_ELITE_SPECIALIST", "END_NEW_MARKET_ICON",
    "END_EARLY_VOLUNTARY", "END_TOO_LONG", "END_RETIRE_ON_HIGH", "END_COMEBACK_FINAL", "END_POLARIZING_WINNER",
    "END_WEALTH_OVER_GLORY", "END_UNFINISHED_FEELING", "END_STORYBOOK_FAREWELL", "END_NATIONAL_CAPTAIN", "END_CONTRACT_KING"
];
function scoreFamilies(state) {
    const p = state.professional, role = num(state.sport.roleScore), market = num(state.reputation.marketHeat), salary = num(state.contract.salaryMonthly), age = state.age;
    const closure = String(state.retirement.closureType ?? "");
    const has = (id) => state.flags[id] === true;
    const tags = new Set(state.careerStateTags.map(String));
    const scores = [
        { id: "END_WORLD_LEGEND", score: p.publicMyth * .30 + p.trophyCapital * .30 + p.legacyCapital * .25 + p.nationalPower * .15 },
        { id: "END_ONE_CLUB_MYTH", score: (p.ownerClub === "UDV" ? 62 : 0) + (tags.has("STATE34_ONE_CLUB_ICON") ? 42 : 0) + p.legacyCapital * .2 },
        { id: "END_HOME_PRODIGAL", score: (p.route === "home" || has("HOME_RETURN_30") ? 58 : 0) + p.homePull * .3 + (p.ownerClub === "UDV" ? 20 : 0) },
        { id: "END_GREAT_PRO", score: 48 + p.legacyCapital * .24 + p.composure * .18 - Math.max(0, p.publicPolarization - 60) * .12 },
        { id: "END_TACTICAL_SECOND_CAREER", score: (has("ROLE_REINVENTED_30") ? 60 : 0) + p.tacticalReading * .32 + p.roleAdaptability * .18 },
        { id: "END_JOURNEYMAN_VETERAN", score: (tags.has("STATE34_JOURNEYMAN_VETERAN") ? 72 : 0) + (p.route !== "home" ? 18 : 0) + state.history.filter(h => h.snapshot.age !== undefined && Number(h.snapshot.age) >= 30 && /MKT|HOME/.test(h.eventId)).length * 2 },
        { id: "END_MARKET_SILENCE", score: (closure === "no_market" ? 100 : 0) + state.retirement.noMarketWindows * 16 + (market < 25 ? 22 : 0) },
        { id: "END_BODY_CLOSED_DOOR", score: (state.retirement.reason === "health" ? 115 : 0) + p.recoveryDebt * .45 + (p.availability < 50 ? 28 : 0) },
        { id: "END_ELITE_SPECIALIST", score: (tags.has("STATE34_ELITE_SPECIALIST") ? 72 : 0) + p.clubPrestigeTier * 6 + (role >= 28 && role < 60 ? 24 : 0) },
        { id: "END_NEW_MARKET_ICON", score: (has("TRANSATLANTIC_PROJECT") || has("RICH_LEAGUE_ROUTE") ? 55 : 0) + p.commercialPower * .45 },
        { id: "END_EARLY_VOLUNTARY", score: (closure === "early_retirement" || state.retirement.decisionAge !== null && state.retirement.decisionAge <= 34 ? 82 : 0) + p.careerControl * .15 },
        { id: "END_TOO_LONG", score: (age >= 41 ? 65 + (age - 41) * 6 : 0) + (role < 30 ? 20 : 0) + (market < 25 ? 12 : 0) },
        { id: "END_RETIRE_ON_HIGH", score: (has("RETIRE_ON_HIGH") ? 95 : 0) + (String(state.world.finalOutcome) === "win" ? 24 : 0) + num(state.sport.form, 50) * .18 },
        { id: "END_COMEBACK_FINAL", score: (has("LATE_MAJOR_COMEBACK") ? 72 : 0) + (state.retirement.reversals > 0 ? 28 : 0) + (has("RETIREMENT_RECONSIDERED") ? 18 : 0) },
        { id: "END_POLARIZING_WINNER", score: p.trophyCapital * .68 + p.publicPolarization * .82 + (p.trophyCapital >= 28 && p.publicPolarization >= 20 ? 58 : 0) },
        { id: "END_WEALTH_OVER_GLORY", score: (has("WEALTHY_EXIT_ACCEPTED") || has("RICH_LEAGUE_ROUTE") ? 46 : 0) + Math.min(52, salary / 900) + p.moneyComfort * .18 - p.trophyCapital * .10 },
        { id: "END_UNFINISHED_FEELING", score: (has("RETIRE_ON_LOW") ? 78 : 0) + (role < 42 ? 24 : 0) + (p.publicMyth < 35 ? 16 : 0) + (state.retirement.reason === "no_market" ? 22 : 0) + (closure === "no_last_match" ? 10 : 0) },
        { id: "END_STORYBOOK_FAREWELL", score: (has("STORYBOOK_LAST_GOAL") ? 100 : 0) + (closure === "storybook" ? 40 : 0) },
        { id: "END_NATIONAL_CAPTAIN", score: (has("HAS_SEED_NATIONAL_CAPTAINCY") ? 52 : 0) + p.nationalPower * .55 + Math.min(30, p.nationalCaps / 2) },
        { id: "END_CONTRACT_KING", score: p.contractPower * .42 + p.careerControl * .34 + (tags.has("STATE30_CONTRACT_KINGMAKER") ? 36 : 0) + (state.retirement.reversals > 0 ? 8 : 0) }
    ];
    return scores;
}
function milestoneText(h) { return `${h.season} · ${h.eventId} · ${h.choiceId}`; }
function generateEpilogue(state) {
    if (state.epilogue.generated || state.retirement.status !== "closed")
        return;
    const scores = scoreFamilies(state).sort((a, b) => b.score - a.score);
    const count = 2 + ((state.rngState.narrative.seed + state.age + state.history.length) % 4); // 2–5
    const selected = scores.filter(x => x.score >= 30).slice(0, count);
    if (selected.length < 2)
        selected.push(...scores.filter(x => !selected.includes(x)).slice(0, 2 - selected.length));
    const salient = state.history.filter(h => h.salience >= 60);
    const desired = 12 + ((state.rngState.narrative.seed >>> 3) % 9); // 12–20
    const step = Math.max(1, Math.floor(salient.length / Math.max(1, desired)));
    const milestones = [];
    for (let i = 0; i < salient.length && milestones.length < desired; i += step)
        milestones.push(milestoneText(salient[i]));
    if (milestones.length < 12) {
        for (const h of state.history) {
            if (milestones.length >= 12)
                break;
            const t = milestoneText(h);
            if (!milestones.includes(t))
                milestones.push(t);
        }
    }
    state.epilogue = { generated: true, families: selected.map(x => x.id), milestones: milestones.slice(0, 20), summaryKey: selected.map(x => x.id).join("+") };
}


// ═══ validation/build-validation.js ═══
function duplicateIds(ids) {
    const seen = new Set();
    const dup = new Set();
    for (const id of ids) {
        if (seen.has(id))
            dup.add(id);
        seen.add(id);
    }
    return [...dup];
}
function validateBuild(events = EVENTS) {
    const issues = [];
    for (const id of duplicateIds(events.map(e => e.id)))
        issues.push({ level: "error", code: "uniqueEventIds", subject: id, message: "ID de evento duplicado." });
    for (const id of duplicateIds(SEED_CATALOG.map(s => s.id)))
        issues.push({ level: "error", code: "uniqueSeedIds", subject: id, message: "ID de seed duplicado." });
    if (SEED_CATALOG.length !== 210)
        issues.push({ level: "error", code: "canonSeedCount", subject: "global", message: `Se esperaban 210 seeds; hay ${SEED_CATALOG.length}.` });
    if (ENDING_FAMILIES.length !== 20)
        issues.push({ level: "error", code: "canonEndingFamilyCount", subject: "epilogue", message: `Se esperaban 20 familias; hay ${ENDING_FAMILIES.length}.` });
    for (const id of duplicateIds(NPC_CATALOG.map(n => n.id)))
        issues.push({ level: "error", code: "uniqueNpcIds", subject: id, message: "ID de NPC duplicado." });
    const phase18 = events.filter(e => e.phase === "18_20");
    const principal = phase18.filter(e => e.family !== "conditional");
    const conditional = phase18.filter(e => e.family === "conditional");
    if (principal.length !== 30)
        issues.push({ level: "error", code: "canonPrincipalCount18_20", subject: "18_20", message: `Se esperaban 30 eventos principales; hay ${principal.length}.` });
    if (conditional.length !== 14)
        issues.push({ level: "error", code: "canonConditionalCount18_20", subject: "18_20", message: `Se esperaban 14 condicionales; hay ${conditional.length}.` });
    const phase20 = events.filter(e => e.phase === "20_23");
    const principal20 = phase20.filter(e => e.family !== "conditional");
    const conditional20 = phase20.filter(e => e.family === "conditional");
    if (principal20.length !== 33)
        issues.push({ level: "error", code: "canonPrincipalCount20_23", subject: "20_23", message: `Se esperaban 33 eventos principales; hay ${principal20.length}.` });
    if (conditional20.length !== 18)
        issues.push({ level: "error", code: "canonConditionalCount20_23", subject: "20_23", message: `Se esperaban 18 condicionales; hay ${conditional20.length}.` });
    const phase23 = events.filter(e => e.phase === "23_26");
    const principal23 = phase23.filter(e => e.family !== "conditional");
    const conditional23 = phase23.filter(e => e.family === "conditional");
    if (principal23.length !== 40)
        issues.push({ level: "error", code: "canonPrincipalCount23_26", subject: "23_26", message: `Se esperaban 40 eventos principales; hay ${principal23.length}.` });
    if (conditional23.length !== 20)
        issues.push({ level: "error", code: "canonConditionalCount23_26", subject: "23_26", message: `Se esperaban 20 condicionales; hay ${conditional23.length}.` });
    const phase26 = events.filter(e => e.phase === "26_30");
    const principal26 = phase26.filter(e => e.family !== "conditional");
    const conditional26 = phase26.filter(e => e.family === "conditional");
    if (principal26.length !== 51)
        issues.push({ level: "error", code: "canonPrincipalCount26_30", subject: "26_30", message: `Se esperaban 51 eventos principales; hay ${principal26.length}.` });
    if (conditional26.length !== 24)
        issues.push({ level: "error", code: "canonConditionalCount26_30", subject: "26_30", message: `Se esperaban 24 condicionales; hay ${conditional26.length}.` });
    if (MICROFEEDS_26_30.length !== 35)
        issues.push({ level: "error", code: "canonMicrofeedCount26_30", subject: "26_30", message: `Se esperaban 35 microfeeds; hay ${MICROFEEDS_26_30.length}.` });
    for (const id of duplicateIds(MICROFEEDS_26_30.map(f => f.id)))
        issues.push({ level: "error", code: "uniqueMicrofeedIds", subject: id, message: "ID de microfeed duplicado." });
    const phase30 = events.filter(e => e.phase === "30_34");
    const principal30 = phase30.filter(e => e.family !== "conditional");
    const conditional30 = phase30.filter(e => e.family === "conditional");
    if (principal30.length !== 50)
        issues.push({ level: "error", code: "canonPrincipalCount30_34", subject: "30_34", message: `Se esperaban 50 eventos principales; hay ${principal30.length}.` });
    if (conditional30.length !== 26)
        issues.push({ level: "error", code: "canonConditionalCount30_34", subject: "30_34", message: `Se esperaban 26 condicionales; hay ${conditional30.length}.` });
    if (MICROFEEDS_30_34.length < 40)
        issues.push({ level: "error", code: "canonMicrofeedCount30_34", subject: "30_34", message: `Se esperaban al menos 40 microfeeds; hay ${MICROFEEDS_30_34.length}.` });
    for (const id of duplicateIds([...MICROFEEDS_26_30, ...MICROFEEDS_30_34].map(f => f.id)))
        issues.push({ level: "error", code: "uniqueMicrofeedIds", subject: id, message: "ID de microfeed duplicado." });
    const phase34 = events.filter(e => e.phase === "34_plus");
    const principal34 = phase34.filter(e => e.family !== "conditional");
    const conditional34 = phase34.filter(e => e.family === "conditional");
    if (principal34.length !== 50)
        issues.push({ level: "error", code: "canonPrincipalCount34Plus", subject: "34_plus", message: `Se esperaban 50 eventos principales; hay ${principal34.length}.` });
    if (conditional34.length !== 32)
        issues.push({ level: "error", code: "canonConditionalCount34Plus", subject: "34_plus", message: `Se esperaban 32 condicionales; hay ${conditional34.length}.` });
    if (MICROFEEDS_34_PLUS.length < 50)
        issues.push({ level: "error", code: "canonMicrofeedCount34Plus", subject: "34_plus", message: `Se esperaban al menos 50 microfeeds; hay ${MICROFEEDS_34_PLUS.length}.` });
    for (const id of duplicateIds([...MICROFEEDS_26_30, ...MICROFEEDS_30_34, ...MICROFEEDS_34_PLUS].map(f => f.id)))
        issues.push({ level: "error", code: "uniqueMicrofeedIds", subject: id, message: "ID de microfeed duplicado." });
    if (events.filter(e => e.family !== "conditional").length !== 254)
        issues.push({ level: "error", code: "globalPrincipalCount", subject: "global", message: `Se esperaban 254 principales; hay ${events.filter(e => e.family !== "conditional").length}.` });
    if (events.filter(e => e.family === "conditional").length !== 134)
        issues.push({ level: "error", code: "globalConditionalCount", subject: "global", message: `Se esperaban 134 condicionales; hay ${events.filter(e => e.family === "conditional").length}.` });
    const allPrincipal = events.filter(e => e.family !== "conditional");
    const allConditional = events.filter(e => e.family === "conditional");
    for (const e of allPrincipal)
        if (e.id.startsWith("CEVT_"))
            issues.push({ level: "error", code: "principalIdPrefix", subject: e.id, message: "Un principal no puede usar prefijo CEVT_." });
    for (const e of allConditional)
        if (!e.id.startsWith("CEVT_"))
            issues.push({ level: "error", code: "conditionalIdPrefix", subject: e.id, message: "Un condicional debe usar prefijo CEVT_." });
    const seeds = new Set(SEED_CATALOG.map(s => s.id));
    const npcs = new Set(NPC_CATALOG.map(n => n.id));
    for (const e of events) {
        if (e.choices.length < 2)
            issues.push({ level: "warning", code: "choiceDepth", subject: e.id, message: "Evento con menos de dos elecciones." });
        const outcomeIds = new Set(e.outcomes.map(o => o.id));
        for (const c of e.choices)
            for (const oid of c.outcomeIds)
                if (!outcomeIds.has(oid))
                    issues.push({ level: "error", code: "knownOutcomeRefs", subject: e.id, message: `${c.id} referencia outcome inexistente ${oid}.` });
        for (const oid of duplicateIds(e.outcomes.map(o => o.id)))
            issues.push({ level: "error", code: "uniqueOutcomeIds", subject: e.id, message: `Outcome duplicado ${oid}.` });
        for (const sid of [...(e.seedsRead ?? []), ...(e.seedsWrite ?? [])])
            if (!seeds.has(sid))
                issues.push({ level: "error", code: "knownSeedRefs", subject: e.id, message: `Seed no registrada: ${sid}.` });
        for (const n of e.npcRefs ?? [])
            if (!npcs.has(n))
                issues.push({ level: "error", code: "knownNpcRefs", subject: e.id, message: `NPC no registrado: ${n}.` });
        for (const o of e.outcomes) {
            if (o.baseWeight < 0)
                issues.push({ level: "error", code: "nonNegativeWeights", subject: e.id, message: `${o.id} tiene peso negativo.` });
            for (const t of o.seedTransitions ?? [])
                if (!seeds.has(t.seedId))
                    issues.push({ level: "error", code: "knownSeedRefs", subject: e.id, message: `${o.id} modifica seed no registrada: ${t.seedId}.` });
        }
    }
    return issues;
}


// ═══ session/validate-session.js ═══
function assertSessionSnapshot(value, events) {
    validateData(value);
    const s = record(value, "session");
    ensure(s.sessionVersion === 1, "sessionVersion", "versión de sesión no compatible");
    oneOf(s.build, ["0.8.0-t2.1", "0.8.0-t2.2"], "build");
    string(s.contentIdentity, "contentIdentity");
    ensure(/^[a-f0-9]{64}$/.test(s.contentIdentity), "contentIdentity", "identidad incorrecta");
    string(s.sessionId, "sessionId");
    ensure(s.sessionId.length <= 200, "sessionId", "identificador demasiado largo");
    integer(s.revision, "revision");
    boolean(s.microfeeds, "microfeeds");
    boolean(s.needsWorldAdvance, "needsWorldAdvance");
    assertGameState(s.state);
    const state = s.state, receipts = list(s.receipts, "receipts"), journal = list(s.journal, "journal");
    ensure(receipts.length === s.revision, "receipts", "la revisión no coincide con los comandos confirmados");
    const ids = new Set();
    let previousType = null, choiceIndex = 0;
    receipts.forEach((x, i) => {
        const r = record(x, `receipts[${i}]`), path = `receipts[${i}]`;
        string(r.commandId, path + ".commandId");
        ensure(r.commandId.length <= 200 && !ids.has(r.commandId), path, "identificador excesivo o duplicado");
        ids.add(r.commandId);
        integer(r.revision, path + ".revision", 1);
        ensure(r.revision === i + 1, path + ".revision", "orden de revisiones incorrecto");
        oneOf(r.type, ["continue", "choose", "acknowledge"], path + ".type");
        string(r.fingerprint, path + ".fingerprint");
        const f = list(parseSaveJson(r.fingerprint), path + ".fingerprint");
        ensure(f[0] === r.type && f[1] === i, path + ".fingerprint", "comando y revisión no coinciden");
        if (r.type === "continue") {
            ensure(previousType !== "choose", path, "avance sin leer el resultado anterior");
            ensure(f.length === 3, path, "comando incorrecto");
            integer(f[2], path + ".maxDays", 1, 366);
        }
        if (r.type === "choose") {
            ensure(f.length === 4, path, "comando incorrecto");
            string(f[2], path + ".instanceId");
            string(f[3], path + ".choiceId");
            ensure(f[2].length <= 200 && f[3].length <= 200, path, "identificador excesivo");
            ensure(previousType === "continue" && f[2] === `${s.sessionId}:${i}`, path, "elección sin escena de la revisión anterior");
            ensure(state.history[choiceIndex]?.choiceId === f[3], path, "elección distinta de la registrada en el historial");
            choiceIndex++;
        }
        if (r.type === "acknowledge") {
            ensure(previousType === "choose", path, "lectura sin resultado anterior");
            ensure(f.length === 2, path, "comando incorrecto");
        }
        ensure(JSON.stringify(f) === r.fingerprint, path + ".fingerprint", "formato de recibo no canónico");
        previousType = r.type;
    });
    ensure(journal.length === state.history.length, "journal", "el recorrido no coincide con el historial");
    ensure(receipts.filter(x => record(x, "receipt").type === "choose").length === journal.length, "receipts", "faltan confirmaciones de decisiones");
    const byId = new Map(events.map(e => [e.id, e]));
    journal.forEach((x, i) => {
        const r = record(x, `journal[${i}]`), path = `journal[${i}]`, h = state.history[i];
        date(r.date, path + ".date");
        string(r.title, path + ".title");
        string(r.choiceLabel, path + ".choiceLabel");
        strings(r.messages, path + ".messages");
        const event = byId.get(h.eventId), choice = event?.choices.find(c => c.id === h.choiceId), outcome = event?.outcomes.find(o => o.id === h.outcomeId);
        ensure(event && choice && outcome && choice.outcomeIds.includes(outcome.id), path, "decisión no reconocida por este catálogo");
        ensure(r.date === h.date && r.title === event.text.title && r.choiceLabel === choice.label && JSON.stringify(r.messages) === JSON.stringify(outcome.messages), path, "el texto no corresponde a la decisión registrada");
    });
    ensure(s.pendingDecision !== undefined && s.pendingResult !== undefined && !(s.pendingDecision && s.pendingResult), "session", "pantallas pendientes incompatibles");
    const last = receipts.length ? record(receipts.at(-1), "lastReceipt") : null;
    if (s.pendingDecision !== null) {
        const p = record(s.pendingDecision, "pendingDecision"), e = record(p.event, "pendingDecision.event");
        string(p.instanceId, "pendingDecision.instanceId");
        ensure(p.instanceId === `${s.sessionId}:${s.revision}`, "pendingDecision.instanceId", "la escena pertenece a otra revisión");
        ensure(state.retirement.status !== "closed" && !s.needsWorldAdvance && last?.type === "continue", "pendingDecision", "escena incompatible con estado o comando");
        const canonical = byId.get(e.id);
        ensure(canonical && JSON.stringify(canonical) === JSON.stringify(e), "pendingDecision.event", "la escena no coincide con el catálogo");
        ensure(!state.flags[`SEEN_${canonical.id}`] || canonical.repeatable, "pendingDecision", "escena única ya resuelta");
    }
    if (s.pendingResult !== null) {
        const r = record(s.pendingResult, "pendingResult"), tail = record(journal.at(-1), "journal.last");
        ensure(last?.type === "choose" && s.needsWorldAdvance, "pendingResult", "resultado sin decisión pendiente de lectura");
        ensure(r.title === tail.title && r.choiceLabel === tail.choiceLabel && JSON.stringify(r.messages) === JSON.stringify(tail.messages), "pendingResult", "resultado distinto al registrado");
    }
    if (last?.type === "choose")
        ensure(s.pendingResult !== null, "pendingResult", "falta resultado de la última elección");
    if (last?.type === "acknowledge")
        ensure(s.pendingDecision === null && s.pendingResult === null && s.needsWorldAdvance, "session", "lectura de resultado incoherente");
    if (last?.type === "continue")
        ensure(s.pendingResult === null && !s.needsWorldAdvance, "session", "avance incoherente");
    if (!last)
        ensure(s.pendingDecision === null && s.pendingResult === null && !s.needsWorldAdvance && journal.length === 0, "session", "sesión inicial incoherente");
}


// ═══ session/game-session.js ═══
var SESSION_VERSION = 1;
var SESSION_BUILD = ENGINE_BUILD;
class SessionError extends Error {
    code;
    constructor(code, message) {
        super(message);
        this.code = code;
        this.name = "SessionError";
    }
}
function requireThat(condition, code, message) {
    if (!condition)
        throw new SessionError(code, message);
}
function validId(value) { return typeof value === "string" && value.length > 0 && value.length <= 200; }
async function contentIdentity(events) {
    const bytes = new TextEncoder().encode(JSON.stringify(events));
    const hash = await globalThis.crypto.subtle.digest("SHA-256", bytes);
    return Array.from(new Uint8Array(hash), b => b.toString(16).padStart(2, "0")).join("");
}
function commandFingerprint(c) {
    requireThat(c && validId(c.commandId) && Number.isSafeInteger(c.expectedRevision) && c.expectedRevision >= 0, "INVALID_COMMAND", "Comando o revisión no válidos.");
    if (c.type === "continue") {
        const days = c.maxDays ?? 90;
        requireThat(Number.isInteger(days) && days >= 1 && days <= 366, "INVALID_COMMAND", "El avance debe ser de 1 a 366 días como máximo.");
        return JSON.stringify([c.type, c.expectedRevision, days]);
    }
    if (c.type === "choose") {
        requireThat(validId(c.pendingInstanceId) && validId(c.choiceId), "INVALID_COMMAND", "Falta la escena o elección.");
        return JSON.stringify([c.type, c.expectedRevision, c.pendingInstanceId, c.choiceId]);
    }
    requireThat(c.type === "acknowledge", "INVALID_COMMAND", "Tipo de comando desconocido.");
    return JSON.stringify([c.type, c.expectedRevision]);
}
/**
 * Interactive single-writer boundary. Reads never schedule, resolve or draw RNG.
 * The low-level simulator remains available for headless QA.
 */
class GameSession {
    #snapshot;
    #index;
    #commit;
    #queue = Promise.resolve();
    constructor(snapshot, events, commit) {
        this.#snapshot = structuredClone(snapshot);
        this.#index = new EventIndex(structuredClone(events));
        this.#commit = commit ?? (async () => { });
    }
    static async create(seed, options = {}) {
        requireThat(Number.isSafeInteger(seed) && seed >= 0 && seed <= 0xffffffff, "INVALID_SEED", "La semilla debe ser un entero entre 0 y 4294967295.");
        const sessionId = options.sessionId ?? globalThis.crypto.randomUUID();
        requireThat(validId(sessionId), "INVALID_SESSION", "Identificador de partida no válido.");
        const events = structuredClone(options.events ?? EVENTS);
        const snapshot = {
            sessionVersion: SESSION_VERSION, build: SESSION_BUILD, contentIdentity: await contentIdentity(events),
            sessionId, revision: 0, microfeeds: options.microfeeds ?? true, state: createInitialState(seed),
            pendingDecision: null, pendingResult: null, receipts: [], journal: [], needsWorldAdvance: false
        };
        const session = new GameSession(snapshot, events, options.commit);
        await session.#commit(structuredClone(snapshot), null);
        return session;
    }
    /** Validates before use; restoring is read-only until a command is committed. */
    static async resume(snapshot, options = {}) {
        validateData(snapshot);
        snapshot = structuredClone(snapshot);
        const events = structuredClone(options.events ?? EVENTS);
        const header = record(snapshot, "session");
        requireThat(typeof header.contentIdentity === "string", "INVALID_SAVE", "Falta la identidad del contenido.");
        requireThat(header.contentIdentity === await contentIdentity(events), "CONTENT_CHANGED", "El contenido cambió; conserva la partida para migrarla antes de continuar.");
        assertSessionSnapshot(snapshot, events);
        snapshot.build = SESSION_BUILD; // T2.1 → T2.2: same schema/content/RNG, stricter validation.
        return new GameSession(snapshot, events, options.commit);
    }
    static async fromSave(raw, options = {}) {
        return GameSession.resume(parseSaveJson(raw), options);
    }
    /** Full snapshot for persistence/QA, never feed this object to the player UI. */
    exportSnapshot() { return structuredClone(this.#snapshot); }
    getView() {
        const { state: s, pendingDecision: p, pendingResult: result } = this.#snapshot;
        return structuredClone({
            sessionId: this.#snapshot.sessionId, revision: this.#snapshot.revision,
            screen: result ? "result" : p ? "decision" : s.retirement.status === "closed" ? "epilogue" : "career",
            date: s.date, age: s.age, club: s.club, appearances: Number(s.sport.appearances ?? 0),
            salaryMonthly: Number(s.contract.salaryMonthly ?? 0), decisionsMade: s.history.length,
            season: s.season, position: String(s.sport.positionIdentity), fitness: Number(s.body.fitness),
            fatigue: Number(s.body.fatigue), form: Number(s.sport.form), contractMonths: Number(s.contract.monthsRemaining),
            news: s.microfeeds.map(n => ({ date: n.date, text: n.text })),
            contacts: NPC_CATALOG.map(n => ({ id: n.id, name: n.name, role: n.role })),
            decision: p ? { instanceId: p.instanceId, family: p.event.family, title: p.event.text.title, body: p.event.text.body,
                visible: p.event.intel.visible, uncertain: p.event.intel.uncertain,
                choices: p.event.choices.map(c => ({ id: c.id, label: c.label })) } : null,
            result, journal: this.#snapshot.journal
        });
    }
    dispatch(command) {
        // Capture caller-owned data before joining the queue.
        const captured = structuredClone(command);
        const task = this.#queue.then(() => this.#execute(captured));
        this.#queue = task.then(() => { }, () => { });
        return task;
    }
    async #execute(command) {
        const fingerprint = commandFingerprint(command);
        const existing = this.#snapshot.receipts.find(r => r.commandId === command.commandId);
        if (existing) {
            requireThat(existing.fingerprint === fingerprint, "COMMAND_ID_REUSED", "El identificador de comando ya se usó con otra acción.");
            return { receipt: structuredClone(existing), replayed: true, view: this.getView() };
        }
        requireThat(command.expectedRevision === this.#snapshot.revision, "STALE_REVISION", "La partida ha cambiado; vuelve a cargar la pantalla.");
        const next = structuredClone(this.#snapshot);
        if (command.type === "continue") {
            requireThat(!next.pendingDecision && !next.pendingResult, "PENDING_SCREEN", "Resuelve la escena o continúa después del resultado.");
            requireThat(next.state.retirement.status !== "closed", "CAREER_CLOSED", "La carrera ya ha terminado.");
            this.#advance(next, command.maxDays ?? 90);
        }
        else if (command.type === "choose") {
            const pending = next.pendingDecision;
            requireThat(pending && pending.instanceId === command.pendingInstanceId, "STALE_DECISION", "Esta escena ya no está pendiente.");
            const choice = pending.event.choices.find(c => c.id === command.choiceId);
            requireThat(choice, "INVALID_CHOICE", "La elección no pertenece a esta escena.");
            const result = resolveChoiceInPlace(next.state, pending.event, choice.id);
            next.pendingResult = { title: pending.event.text.title, choiceLabel: choice.label, messages: result.messages };
            next.journal.push({ date: next.state.date, ...structuredClone(next.pendingResult) });
            next.pendingDecision = null;
            next.needsWorldAdvance = true;
            generateEpilogue(next.state);
        }
        else {
            requireThat(next.pendingResult, "NO_RESULT", "No hay resultado pendiente.");
            next.pendingResult = null;
        }
        next.revision++;
        const receipt = { commandId: command.commandId, fingerprint, revision: next.revision, type: command.type };
        next.receipts.push(receipt);
        assertGameState(next.state);
        // Publish only after storage confirms. A rejected write leaves state and RNG untouched.
        await this.#commit(structuredClone(next), { sessionId: this.#snapshot.sessionId, revision: this.#snapshot.revision });
        this.#snapshot = next;
        return { receipt: structuredClone(receipt), replayed: false, view: this.getView() };
    }
    #worldDay(next) {
        advanceWorldDayInPlace(next.state);
        const feeds = next.state.age < 30 ? MICROFEEDS_26_30 : next.state.age < 34 ? MICROFEEDS_30_34 : MICROFEEDS_34_PLUS;
        maybeEmitMicroFeed(next.state, feeds, next.microfeeds);
        generateEpilogue(next.state);
    }
    #advance(next, maxDays) {
        let days = 0;
        if (next.needsWorldAdvance) {
            this.#worldDay(next);
            next.needsWorldAdvance = false;
            days++;
        }
        // No unbounded autoplay. If no event appears, commit progress and let the UI yield.
        while (next.state.retirement.status !== "closed") {
            const scheduled = scheduleEvent(next.state, this.#index);
            if (scheduled) {
                next.pendingDecision = { instanceId: `${next.sessionId}:${next.revision + 1}`, event: structuredClone(scheduled.event) };
                return;
            }
            if (days >= maxDays)
                return;
            this.#worldDay(next);
            days++;
        }
    }
}


return {
  GameSession: typeof GameSession !== 'undefined' ? GameSession : undefined,
  EVENTS: typeof EVENTS !== 'undefined' ? EVENTS : undefined,
  createInitialState: typeof createInitialState !== 'undefined' ? createInitialState : undefined,
  simulateCareer: typeof simulateCareer !== 'undefined' ? simulateCareer : undefined,
  loadSave: typeof loadSave !== 'undefined' ? loadSave : undefined,
  serializeSave: typeof serializeSave !== 'undefined' ? serializeSave : undefined,
  CURRENT_SCHEMA_VERSION: typeof CURRENT_SCHEMA_VERSION !== 'undefined' ? CURRENT_SCHEMA_VERSION : undefined,
  EventIndex: typeof EventIndex !== 'undefined' ? EventIndex : undefined,
  validateBuild: typeof validateBuild !== 'undefined' ? validateBuild : undefined,
  ENGINE_BUILD: typeof ENGINE_BUILD !== 'undefined' ? ENGINE_BUILD : undefined,
};
})();

if (typeof console !== 'undefined') {
  console.log('[Multihistoria] Engine loaded. Build:', MultihistoriaEngine.ENGINE_BUILD,
    '| Events:', MultihistoriaEngine.EVENTS ? MultihistoriaEngine.EVENTS.length : 0);
}
