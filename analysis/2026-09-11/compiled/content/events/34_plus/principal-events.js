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
export const PRINCIPAL_EVENTS_34_PLUS = principal;
