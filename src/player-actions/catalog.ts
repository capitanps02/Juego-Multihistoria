import type { PlayerActionDefinition, PlayerActionEligibilityPredicate } from "./types.js";
import { PLAYER_ACTION_ELIGIBILITY_SPECS } from "./content-eligibility.js";

function eligibilityFor(actionId: string): readonly PlayerActionEligibilityPredicate[] {
  return PLAYER_ACTION_ELIGIBILITY_SPECS.find(row => row.actionId === actionId)?.all ?? [];
}

export const PLAYER_ACTION_CATALOG: readonly PlayerActionDefinition[] = [
  {
    id: "PA_TRAIN_EXTRA",
    category: "training",
    label: "Entrenamiento extra",
    description: "Añade una sesión corta de trabajo técnico fuera de la simulación normal.",
    targetKind: "none",
    cooldown: { scope: "action", days: 35 },
    eligibilityKey: "active_career",
    eligibility: eligibilityFor("PA_TRAIN_EXTRA"),
    options: [
      {
        id: "TECHNIQUE",
        label: "Trabajo técnico",
        effectKey: "train_extra",
        publicResult: "Completas una sesión técnica adicional."
      }
    ]
  },
  {
    id: "PA_REST",
    category: "health",
    label: "Descansar",
    description: "Prioriza recuperación ligera sin alterar lesiones ni decisiones médicas.",
    targetKind: "none",
    cooldown: { scope: "action", days: 21 },
    eligibilityKey: "active_career",
    eligibility: eligibilityFor("PA_REST"),
    options: [
      {
        id: "RECOVER",
        label: "Recuperar",
        effectKey: "rest",
        publicResult: "Reduces carga y recuperas sensaciones."
      }
    ]
  },
  {
    id: "PA_COACH_TALK",
    category: "career",
    label: "Hablar con entrenador",
    description: "Habla con el entrenador actual para expresar una postura sin cambiar tu rol por decreto.",
    targetKind: "coach",
    cooldown: { scope: "action_target", days: 31 },
    eligibilityKey: "active_career",
    eligibility: eligibilityFor("PA_COACH_TALK"),
    options: [
      {
        id: "MORE_MINUTES",
        label: "Quiero más minutos",
        effectKey: "coach_request_more_minutes",
        publicResult: "Has dejado claro que quieres competir por más minutos."
      },
      {
        id: "WHAT_TO_IMPROVE",
        label: "¿Qué debo mejorar?",
        effectKey: "coach_request_feedback",
        publicResult: "Has pedido una referencia concreta sobre qué debes mejorar."
      },
      {
        id: "COMFORTABLE_ROLE",
        label: "Acepto mi rol",
        effectKey: "coach_acknowledge_role",
        publicResult: "Has comunicado que aceptas el rol actual y sigues trabajando."
      }
    ]
  },
  {
    id: "PA_REQUEST_TRANSFER",
    category: "career",
    label: "Solicitar salida",
    description: "Comunica que quieres explorar una salida del club sin crear ofertas ni cambiar de equipo.",
    targetKind: "none",
    cooldown: { scope: "action", days: 121 },
    eligibilityKey: "active_career",
    eligibility: eligibilityFor("PA_REQUEST_TRANSFER"),
    options: [
      {
        id: "REQUEST",
        label: "Pedir salir",
        effectKey: "request_transfer",
        publicResult: "Has comunicado que quieres explorar una salida."
      }
    ]
  },
  {
    id: "PA_REQUEST_RENEWAL",
    category: "representative",
    label: "Pedir renovación",
    description: "Expresa que quieres abrir una conversación de renovación sin modificar tu contrato.",
    targetKind: "none",
    cooldown: { scope: "action", days: 91 },
    eligibilityKey: "active_career",
    eligibility: eligibilityFor("PA_REQUEST_RENEWAL"),
    options: [
      {
        id: "REQUEST",
        label: "Abrir conversación",
        effectKey: "request_renewal",
        publicResult: "Has expresado que quieres abrir una conversación de renovación."
      }
    ]
  },
  {
    id: "PA_AGENT_MARKET",
    category: "representative",
    label: "Preguntar por mercado",
    description: "Pide a tu representante una lectura del mercado sin fabricar interés ni ofertas.",
    targetKind: "agent",
    cooldown: { scope: "action_target", days: 31 },
    eligibilityKey: "active_career",
    eligibility: eligibilityFor("PA_AGENT_MARKET"),
    options: [
      {
        id: "ASK",
        label: "Consultar mercado",
        effectKey: "ask_agent_market",
        publicResult: "Has pedido a tu representante una lectura del mercado."
      }
    ]
  }
] as const;

export function findPlayerActionDefinition(
  actionId: string,
  catalog: readonly PlayerActionDefinition[] = PLAYER_ACTION_CATALOG
): PlayerActionDefinition | null {
  return catalog.find(definition => definition.id === actionId) ?? null;
}
