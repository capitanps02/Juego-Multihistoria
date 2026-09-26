import type { PlayerActionDefinition } from "./types.js";

export const PLAYER_ACTION_CATALOG: readonly PlayerActionDefinition[] = [
  {
    id: "PA_TRAIN_EXTRA",
    category: "training",
    label: "Entrenamiento extra",
    description: "Añade una sesión corta de trabajo técnico fuera de la simulación normal.",
    targetKind: "none",
    cooldown: { scope: "action", days: 7 },
    eligibilityKey: "active_career",
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
    category: "life",
    label: "Descansar",
    description: "Prioriza recuperación ligera sin alterar lesiones ni decisiones médicas.",
    targetKind: "none",
    cooldown: { scope: "action", days: 1 },
    eligibilityKey: "active_career",
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
    label: "Hablar con el entrenador",
    description: "Mantén una conversación voluntaria con el entrenador actual sin cambiar tu rol por decreto.",
    targetKind: "coach",
    cooldown: { scope: "action_target", days: 14 },
    eligibilityKey: "active_career",
    options: [
      {
        id: "MORE_MINUTES",
        label: "Quiero más minutos",
        effectKey: "coach_request_more_minutes",
        publicResult: "Trasladas al entrenador que quieres competir por más minutos."
      },
      {
        id: "WHAT_TO_IMPROVE",
        label: "¿Qué debo mejorar?",
        effectKey: "coach_request_feedback",
        publicResult: "Pides una referencia concreta sobre qué debes mejorar."
      },
      {
        id: "COMFORTABLE_ROLE",
        label: "Estoy cómodo con mi rol",
        effectKey: "coach_acknowledge_role",
        publicResult: "Comunicas que aceptas el rol actual y sigues trabajando."
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
