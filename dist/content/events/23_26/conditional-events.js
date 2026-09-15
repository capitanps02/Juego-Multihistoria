import { ambiguousEvent, n } from "../18_20/helpers.js";
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
export const CONDITIONAL_EVENTS_23_26 = rows.map(make);
