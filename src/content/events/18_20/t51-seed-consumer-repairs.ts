import type { EventDefinition, OutcomeModifier } from "../../../core/types.js";

const m = (id: string, path: string, value: string, multiply: number, reason: string): OutcomeModifier => ({
  id,
  conditions: [{ path, op: "eq", value }],
  multiply,
  reason
});

type Patch = Record<string, OutcomeModifier[]>;

const PATCHES: Record<string, Patch> = {
  CEVT_18_BRUNO_01: {
    ASK_ROLE__PRIMARY: [
      m("BRUNO_HELPED", "facts.brunoFavorStance", "helped", 1.35, "Bruno recuerda una ayuda razonable y deja una recomendación más favorable."),
      m("BRUNO_NO_PROMISE", "facts.brunoFavorStance", "no_promise", 1.1, "Los límites claros conservaron la relación sin crear una deuda falsa.")
    ],
    ASK_ROLE__SECONDARY: [
      m("BRUNO_BETRAYED", "facts.brunoFavorStance", "betrayed", 1.4, "Bruno recuerda una promesa que sintió traicionada."),
      m("BRUNO_CODE_BROKEN", "facts.brunoFavorStance", "code_broken", 1.35, "Bruno recuerda que una conversación privada llegó al staff."),
      m("BRUNO_REFUSED", "facts.brunoFavorStance", "refused", 1.15, "La negativa previa enfría la despedida sin convertirla en enemistad automática.")
    ]
  },
  CEVT_18_CCH_01: {
    MENA__PRIMARY: [
      m("MENA_OBEDIENT", "facts.menaEarlyRead", "obedient", 1.2, "Mena recuerda una ejecución disciplinada."),
      m("MENA_ADAPTIVE", "facts.menaEarlyRead", "adaptive", 1.35, "Mena ya vio una lectura táctica útil bajo instrucciones contradictorias."),
      m("COACH_DEFENDED", "facts.coachPublicStance", "defended", 1.12, "La postura pública previa hace más coherente una recepción institucional favorable.")
    ],
    MENA__SECONDARY: [
      m("MENA_DISOBEDIENT", "facts.menaEarlyRead", "disobedient", 1.35, "Mena conserva una lectura previa de desobediencia táctica."),
      m("MENA_OVERPLAYED", "facts.menaEarlyRead", "overplayed", 1.25, "Mena recuerda una adaptación que pareció no obedecer a nadie."),
      m("COACH_OPPORTUNIST", "facts.coachPublicStance", "opportunist_read", 1.15, "La postura pública anterior deja un coste político visible.")
    ]
  },
  CEVT_18_RELEG_01: {
    STAY_ROLE__PRIMARY: [
      m("EXIT_STAY_JAN", "facts.exitStyleJanuary", "stay", 1.2, "La permanencia previa hace más creíble reconstruir desde dentro."),
      m("EXIT_WAIT_END", "facts.exitStyleEnd", "wait", 1.15, "La espera previa conserva margen institucional para quedarse.")
    ],
    EXIT__PRIMARY: [
      m("EXIT_TRANSFER_JAN", "facts.exitStyleJanuary", "transfer", 1.25, "La ruta previa ya había normalizado una salida negociada."),
      m("EXIT_PRESSURE_END", "facts.exitStyleEnd", "pressure", 1.15, "La presión previa hace más probable una negociación de salida activa.")
    ],
    EXIT__SECONDARY: [
      m("EXIT_TRANSFER_CONTESTED", "facts.exitStyleJanuary", "transfer_contested", 1.3, "Una salida previamente discutida endurece la nueva negociación."),
      m("EXIT_PRESSURE_COST", "facts.exitStyleEnd", "pressure_cost", 1.25, "El coste institucional de la presión previa reaparece tras el descenso.")
    ]
  },
  CEVT_19_INJ_01: {
    CONSERVATIVE__PRIMARY: [
      m("BODY_MANAGED", "facts.bodyPrecedentPattern", "managed", 1.2, "La gestión previa de cargas favorece una rehabilitación disciplinada."),
      m("BODY_PROTECT", "facts.bodyPrecedentPattern", "protect", 1.25, "La memoria corporal previa refuerza una vuelta conservadora."),
      m("PHYSIO_FOLLOWED", "facts.physioConfidencePattern", "followed", 1.2, "La confianza previa en fisioterapia mejora la adherencia al plan.")
    ],
    CONSERVATIVE__SECONDARY: [
      m("BODY_OVERLOAD", "facts.bodyPrecedentPattern", "overload", 1.22, "El precedente de sobrecarga mantiene incertidumbre incluso con un plan prudente."),
      m("BODY_PUSHED_RETURN", "facts.bodyPrecedentReturn19", "pushed", 1.25, "Haber forzado una vuelta anterior aumenta el coste probable de la recuperación.")
    ],
    SECOND_OPINION__PRIMARY: [
      m("PHYSIO_TESTS", "facts.physioConfidenceReturn19", "tests", 1.18, "La experiencia previa con pruebas objetivas hace útil contrastar el plan."),
      m("PHYSIO_FOLLOWED_COST", "facts.physioConfidencePattern", "followed_cost", 1.12, "Seguir el plan tuvo coste de minutos y justifica contrastar sin romper confianza.")
    ]
  },
  CEVT_19_RETURN_01: {
    ROLE_MEETING__PRIMARY: [
      m("RETURN_LOAN_CLEAN", "facts.exitStyleJanuary", "loan", 1.25, "Una cesión acordada deja una vía más limpia para recalibrar el rol al volver."),
      m("RETURN_WAITED", "facts.exitStyleEnd", "wait", 1.12, "La salida sin choque conserva interlocución institucional.")
    ],
    ROLE_MEETING__SECONDARY: [
      m("RETURN_LOAN_DISTANCE", "facts.exitStyleJanuary", "loan_distance", 1.2, "La cesión había aumentado la distancia con el plan inmediato del club."),
      m("RETURN_CONTESTED", "facts.exitStyleJanuary", "transfer_contested", 1.3, "El historial de salida discutida dificulta restaurar jerarquía por defecto."),
      m("RETURN_PRESSURE_COST", "facts.exitStyleEnd", "pressure_cost", 1.25, "La presión previa sigue pesando en la relación institucional al regresar.")
    ]
  }
};

export function applyT51SeedConsumerRepairs(events: readonly EventDefinition[]): EventDefinition[] {
  return events.map(event => {
    const eventPatch = PATCHES[event.id];
    if (!eventPatch) return event;
    return {
      ...event,
      outcomes: event.outcomes.map(outcome => {
        const additions = eventPatch[outcome.id];
        return additions?.length ? { ...outcome, modifiers: [...(outcome.modifiers ?? []), ...additions] } : outcome;
      })
    };
  });
}
