import type { EventDefinition } from "../../../core/types.js";

const CANONICAL_INTEL: Readonly<Record<string, EventDefinition["intel"]>> = {
  EVT_18_MED_001: {
    visible: ["Paula recomienda descarga; no ordena baja médica."],
    uncertain: ["Tu padre recuerda que las oportunidades “no esperan”. Rivas te diría lo contrario si le preguntas."]
  },
  EVT_18_TEAM_001: {
    visible: ["Si Bruno sale, puede liberarse tu puesto."],
    uncertain: ["No sabes si el ojeador viene realmente por él ni si Bruno cumpliría luego algún favor."]
  },
  EVT_18_MATCH_002: {
    visible: ["Sabes tu confianza y quién está en el campo."],
    uncertain: ["No sabes si el cuerpo técnico te considera siguiente lanzador."]
  }
};

/**
 * T5.1 B1a: restore only the player-facing information certified by the
 * Documento Maestro for three stable-ID 18–20 scenes.
 *
 * Options, outcomes, effects, seeds, gates, timing and IDs remain untouched.
 * Returning fresh objects prevents the repair layer from mutating the frozen
 * base definitions used as pre-T5.1 compatibility evidence.
 */
export function applyT51B1aIntelRepairs(events: EventDefinition[]): EventDefinition[] {
  const found = new Set<string>();
  const repaired = events.map(event => {
    const intel = CANONICAL_INTEL[event.id];
    if (!intel) return event;
    found.add(event.id);
    return {
      ...event,
      intel: {
        visible: [...intel.visible],
        uncertain: [...intel.uncertain]
      }
    };
  });

  const missing = Object.keys(CANONICAL_INTEL).filter(id => !found.has(id));
  if (missing.length) throw new Error(`T5.1 B1a missing expected 18-20 event(s): ${missing.join(", ")}`);
  return repaired;
}

export const T51_B1A_INTEL_EVENT_IDS = Object.freeze(Object.keys(CANONICAL_INTEL));
