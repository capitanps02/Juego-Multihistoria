import { ambiguousEvent, flag, n, seedCreate, set } from "../18_20/helpers.js";
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
export const PRINCIPAL_EVENTS_30_34 = rows.map(make);
