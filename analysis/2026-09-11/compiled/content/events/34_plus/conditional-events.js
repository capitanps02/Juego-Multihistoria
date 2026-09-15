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
export const CONDITIONAL_EVENTS_34_PLUS = e;
