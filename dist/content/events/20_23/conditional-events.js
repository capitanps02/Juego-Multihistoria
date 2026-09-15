import { ambiguousEvent, n } from "../18_20/helpers.js";
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
export const CONDITIONAL_EVENTS_20_23 = rows.map(make);
