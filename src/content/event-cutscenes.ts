import type { GameState } from "../core/types.js";
import { resolveCurrentPlayerClubLeadership } from "../simulation/player-leadership-authority.js";

export interface EventCutscene { eventId: string; file: string; title: string; }
export const PROLOGUE_CUTSCENE: EventCutscene = { eventId: "PROLOGUE", file: "prologo_multihistoria_v3.webm", title: "Prólogo · Multihistoria" };

// Presentation only: exact event identity, never a family/age fallback.
export const EVENT_CUTSCENES: readonly EventCutscene[] = [
  ["EVT_18_MATCH_001", "18_match_001_debut", "El debut"],
  ["EVT_18_AGT_001", "18_agt_001_agente", "Dos tarjetas sobre la mesa"],
  ["EVT_18_MED_001", "18_med_001_aductor", "El aductor"],
  ["EVT_20_ABR_001", "20_abr_001_vestuario_idioma_v2", "La ciudad que no habla tu idioma"],
  ["EVT_20_LIFE_001", "20_life_001_primera_casa_v2", "Las llaves"],
  ["EVT_21_MONEY_001", "21_money_001_contrato_familia", "El primer contrato que cambia a tu familia"],
  ["EVT_21_CCH_002", "21_cch_002_otro_entrenador", "Otro entrenador, otra versión de ti"],
  ["EVT_22_DDL_001", "22_ddl_001_deadline_intro", "Quedan horas"],
  ["EVT_24_MKT_001", "24_mkt_001_tres_ofertas", "Tres ofertas, ninguna completa"],
  ["EVT_25_CAP_001", "25_cap_001_brazalete", "El brazalete"],
  ["EVT_18_PRS_001", "18_prs_001_primera_prensa_v2", "Tres líneas"],
  ["EVT_23_MATCH_001", "23_match_001_partido_radar_v3", "El partido que cambia el radar"],
  ["EVT_23_NAT_001", "23_nat_001_primera_llamada_v2", "La primera llamada"],
  ["EVT_24_MED_001", "24_med_001_isquio_v2", "La final y el isquio"],
  ["EVT_26_CLB_001", "26_clb_001_cara_proyecto_v2", "Ser la cara del proyecto"],
  ["EVT_27_PRS_001", "27_prs_001_documental", "El documental"],
  ["EVT_28_GALA_001", "28_gala_001_gala", "La gala"],
  ["EVT_31_MED_001", "31_med_001_operacion_regreso", "La operación y agosto"],
  ["EVT_31_REC_001", "31_rec_001_500_partidos", "Quinientos partidos"],
  ["EVT_33_PRS_001", "33_prs_001_cuando_retiras_v2", "¿Estás pensando en retirarte?"],
  ["EVT_34_CON_001", "34_con_001_contrato_ultimo", "La cláusula de salida digna"],
  ["EVT_34_DORSAL_001", "34_dorsal_001_heredero", "Tu dorsal en la tienda"],
  ["EVT_34_HOME_001", "34_home_001_volver_casa", "Volver a casa"],
  ["EVT_37_ANNOUNCE_001", "37_announce_001_retirada", "El anuncio"],
  ["EVT_RET_LASTMATCH_001", "ret_last_001_ultimo_tunel", "El último túnel"],
  ["EPILOGUE", "ret_epilogue_despues_ruido", "Después del ruido"],
  ["EVT_24_EUR_001", "generic_europe_noche_europea_01", "Noche europea"],
  ["EVT_18_MATCH_001", "generic_match_primera_accion_01", "La primera acción"],
  ["CEVT_35_NT_TOURNAMENT_INJURY", "generic_selection_ultimo_torneo_01", "El torneo que puede ser el último"]
].map(([eventId, file, title]) => ({ eventId, file: `cutscene_${file.startsWith("generic_") ? file : "evt_" + file}.webm`, title }));

export function eventCutscene(state: GameState, screen: string, pendingEventId?: string): EventCutscene | null {
  if (screen === "prologue" && state.history.length === 0 && state.retirement.status === "playing") return { ...PROLOGUE_CUTSCENE };
  const last = state.history.at(-1);
  const eventId = screen === "epilogue" && state.retirement.status === "closed" ? "EPILOGUE" : screen === "decision" ? pendingEventId : screen === "result" ? last?.eventId : undefined;
  const clip = EVENT_CUTSCENES.find(item => item.eventId === eventId &&
    (eventId !== "EVT_18_MATCH_001" || item.file.includes("generic_") === (screen === "result")));
  if (eventId === "EVT_18_MATCH_001" && screen === "result") {
    return clip && last?.choiceId === "TAKE_ON" ? { ...clip } : null;
  }
  if (!clip) return null;
  // These images assert facts the active narrative definition does not certify yet.
  if (["EVT_26_CLB_001", "EVT_28_GALA_001", "EVT_RET_LASTMATCH_001"].includes(eventId ?? "")) return null;
  if (eventId === "EPILOGUE") return { ...clip };
  if (eventId === "EVT_18_PRS_001") {
    if (screen !== "result" || !["PRUDENT_QUOTE", "YOUTH_QUOTE"].includes(last?.choiceId ?? "")) return null;
  } else if (eventId === "EVT_31_REC_001") {
    if (screen !== "decision" || Number(state.sport.appearances ?? 0) < 500) return null;
  } else if (eventId === "EVT_34_DORSAL_001") {
    if (screen !== "result" || last?.choiceId !== "A") return null;
  } else if (eventId === "EVT_34_HOME_001") {
    if (screen !== "result" || last?.choiceId !== "A" || state.club !== "UDV") return null;
  } else if (eventId === "EVT_34_CON_001") {
    // A narrative willingness to sign cannot substitute for an accepted formal offer.
    const accepted = state.market?.history.at(-1);
    if (screen !== "result" || last?.choiceId !== "A" || !accepted?.accepted || accepted.source?.eventId !== eventId || accepted.source?.choiceId !== last?.choiceId || accepted.source?.historyIndex !== state.history.length - 1) return null;
  } else if (eventId === "EVT_37_ANNOUNCE_001") {
    if (screen !== "result" || last?.choiceId !== "ANNOUNCE_NOW" || state.retirement.status !== "announced") return null;
  } else if (eventId === "EVT_20_LIFE_001") {
    if (screen !== "result" || last?.choiceId !== "RENT_NEAR_CLUB") return null;
  } else if (eventId === "EVT_25_CAP_001") {
    // This clip actually awards the armband. Narrative influence alone is not captaincy.
    const leadership = resolveCurrentPlayerClubLeadership(state);
    if (screen !== "result" || !["A", "C"].includes(last?.choiceId ?? "")
      || !leadership || !["captain", "secondary_captain"].includes(leadership.role)
      || leadership.sourceEventId !== eventId || leadership.sourceChoiceId !== last?.choiceId) return null;
  } else if (screen !== "decision") return null;
  return { ...clip };
}
