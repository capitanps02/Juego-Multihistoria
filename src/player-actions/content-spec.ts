export interface PlayerActionContentOptionSpec {
  id: string;
  label: string;
  publicResult: string;
}

export interface PlayerActionContentSpec {
  id: string;
  label: string;
  description: string;
  options: readonly PlayerActionContentOptionSpec[];
}

/**
 * Public-facing content for the complete A5 V1 catalog.
 *
 * This is intentionally NOT a PlayerActionDefinition registry. Blocked actions
 * live here so copy/options can be certified without pretending A1 already owns
 * the required health, eligibility, effect or target-predicate contracts.
 */
export const PLAYER_ACTION_CONTENT_SPECS: readonly PlayerActionContentSpec[] = [
  {
    id: "PA_COACH_TALK",
    label: "Hablar con entrenador",
    description: "Habla con el entrenador actual para expresar una postura sin cambiar tu rol por decreto.",
    options: [
      { id: "MORE_MINUTES", label: "Quiero más minutos", publicResult: "Has dejado claro que quieres competir por más minutos." },
      { id: "WHAT_TO_IMPROVE", label: "¿Qué debo mejorar?", publicResult: "Has pedido una referencia concreta sobre qué debes mejorar." },
      { id: "COMFORTABLE_ROLE", label: "Acepto mi rol", publicResult: "Has comunicado que aceptas el rol actual y sigues trabajando." }
    ]
  },
  {
    id: "PA_ROLE_CHECK",
    label: "Preguntar por mi rol",
    description: "Pide una lectura de tu situación actual sin exigir minutos ni alterar el reparto deportivo.",
    options: [
      { id: "ASK_ROLE", label: "Consultar mi situación", publicResult: "Has preguntado cómo encaja tu rol en el plan actual." }
    ]
  },
  {
    id: "PA_POSITION_CHANGE",
    label: "Explorar otra posición",
    description: "Plantea al entrenador una posible adaptación posicional sin imponer un cambio deportivo.",
    options: [
      { id: "EXPLORE", label: "Hablar de una adaptación", publicResult: "Has planteado una posible adaptación de tu posición." }
    ]
  },
  {
    id: "PA_REQUEST_TRANSFER",
    label: "Solicitar salida",
    description: "Comunica que quieres explorar una salida del club sin crear ofertas ni cambiar de equipo.",
    options: [
      { id: "REQUEST", label: "Pedir salir", publicResult: "Has comunicado que quieres explorar una salida." }
    ]
  },
  {
    id: "PA_WITHDRAW_TRANSFER",
    label: "Retirar petición",
    description: "Retira tu petición activa sin borrar el hecho de que anteriormente pediste salir.",
    options: [
      { id: "WITHDRAW", label: "Retirar la petición", publicResult: "Has comunicado que ya no mantienes activa tu petición de salida." }
    ]
  },
  {
    id: "PA_TRAIN_EXTRA",
    label: "Entrenamiento extra",
    description: "Añade una sesión corta de trabajo técnico fuera de la simulación normal.",
    options: [
      { id: "TECHNIQUE", label: "Trabajo técnico", publicResult: "Completas una sesión técnica adicional." },
      { id: "PHYSICAL", label: "Trabajo físico", publicResult: "Has completado una sesión extra de carga física controlada." },
      { id: "TACTICAL", label: "Trabajo táctico", publicResult: "Has completado una sesión extra centrada en lectura táctica." }
    ]
  },
  {
    id: "PA_VIDEO_STUDY",
    label: "Analizar partidos",
    description: "Dedica una sesión a revisar juego y decisiones sin convertir el análisis en una mejora instantánea.",
    options: [
      { id: "STUDY", label: "Sesión de vídeo", publicResult: "Has dedicado tiempo a revisar situaciones de juego." }
    ]
  },
  {
    id: "PA_RECOVERY_SESSION",
    label: "Sesión de recuperación",
    description: "Prioriza recuperación cuando aumenta el riesgo físico, sin curar lesiones ni sustituir al cuerpo médico.",
    options: [
      { id: "RECOVER", label: "Priorizar recuperación", publicResult: "Has hecho una sesión de recuperación para reducir carga y riesgo." }
    ]
  },
  {
    id: "PA_REST",
    label: "Descansar",
    description: "Prioriza recuperación ligera sin alterar lesiones ni decisiones médicas.",
    options: [
      { id: "RECOVER", label: "Recuperar", publicResult: "Reduces carga y recuperas sensaciones." }
    ]
  },
  {
    id: "PA_AGENT_MARKET",
    label: "Preguntar por mercado",
    description: "Pide a tu representante una lectura del mercado sin fabricar interés ni ofertas.",
    options: [
      { id: "ASK", label: "Consultar mercado", publicResult: "Has pedido a tu representante una lectura del mercado." }
    ]
  },
  {
    id: "PA_REQUEST_RENEWAL",
    label: "Pedir renovación",
    description: "Expresa que quieres abrir una conversación de renovación sin modificar tu contrato.",
    options: [
      { id: "REQUEST", label: "Abrir conversación", publicResult: "Has expresado que quieres abrir una conversación de renovación." }
    ]
  },
  {
    id: "PA_DISCUSS_FUTURE",
    label: "Hablar sobre mi futuro",
    description: "Fija con tu representante una prioridad de carrera sin crear ofertas ni promesas contractuales.",
    options: [
      { id: "MINUTES", label: "Priorizar minutos", publicResult: "Has señalado que los minutos son tu prioridad." },
      { id: "SALARY", label: "Priorizar salario", publicResult: "Has señalado que el salario pesa más en tu próxima decisión." },
      { id: "STABILITY", label: "Priorizar estabilidad", publicResult: "Has señalado que buscas continuidad y estabilidad." },
      { id: "CLUB_LEVEL", label: "Priorizar nivel del club", publicResult: "Has señalado que quieres dar prioridad al nivel deportivo del club." }
    ]
  },
  {
    id: "PA_TALK_TEAMMATE",
    label: "Hablar con un compañero",
    description: "Dedica tiempo a un compañero actual sin garantizar amistad, jerarquía ni consecuencias deportivas.",
    options: [
      { id: "CONNECT", label: "Compartir un rato", publicResult: "Has dedicado tiempo a reforzar el contacto con un compañero." }
    ]
  },
  {
    id: "PA_CLEAR_AIR",
    label: "Aclarar las cosas",
    description: "Habla con un compañero cuando existe tensión sin borrar automáticamente el conflicto entre vosotros.",
    options: [
      { id: "TALK", label: "Hablarlo de frente", publicResult: "Habéis intentado rebajar la tensión mediante una conversación." }
    ]
  },
  {
    id: "PA_LEADER_ADVICE",
    label: "Pedir consejo a un líder",
    description: "Pide orientación a un compañero con liderazgo reconocido sin convertirla en una mejora automática.",
    options: [
      { id: "ASK_ADVICE", label: "Escuchar su experiencia", publicResult: "Has pedido consejo a un líder del vestuario." }
    ]
  },
  {
    id: "PA_MENTOR_TEAMMATE",
    label: "Compartir experiencia",
    description: "En la madurez de tu carrera, dedica tiempo a orientar a un compañero sin alterar su rol ni sus minutos.",
    options: [
      { id: "MENTOR", label: "Orientar a un compañero", publicResult: "Has compartido experiencia con un compañero del vestuario." }
    ]
  },
  {
    id: "PA_INTERVIEW",
    label: "Conceder entrevista",
    description: "Elige el tono de una entrevista sin provocar automáticamente una polémica o una reacción concreta.",
    options: [
      { id: "HUMBLE", label: "Tono humilde", publicResult: "Has concedido una entrevista con un tono prudente." },
      { id: "AMBITIOUS", label: "Tono ambicioso", publicResult: "Has mostrado ambición sin convertirla en una promesa." },
      { id: "TEAM_FIRST", label: "Poner al equipo primero", publicResult: "Has centrado el mensaje público en el equipo." }
    ]
  },
  {
    id: "PA_SOCIAL_POST",
    label: "Publicar en redes",
    description: "Comparte algo breve sin convertir las redes sociales en una fuente automática de fama o mercado.",
    options: [
      { id: "PROFESSIONAL", label: "Contenido profesional", publicResult: "Has compartido una publicación relacionada con tu trabajo." },
      { id: "PERSONAL", label: "Contenido personal", publicResult: "Has compartido algo personal con un tono discreto." }
    ]
  },
  {
    id: "PA_PERSONAL_TIME",
    label: "Tiempo personal",
    description: "Reserva tiempo fuera del fútbol cuando acumulas carga, sin convertirlo en una recompensa diaria obligatoria.",
    options: [
      { id: "PEOPLE", label: "Familia o amigos", publicResult: "Has reservado tiempo para gente cercana." },
      { id: "HOBBY", label: "Hobby tranquilo", publicResult: "Has dedicado un rato a una actividad fuera del fútbol." }
    ]
  },
  {
    id: "PA_DISCONNECT",
    label: "Desconectar del ruido",
    description: "Tómate un respiro cuando el desgaste se acumula, sin abandonar tus obligaciones profesionales.",
    options: [
      { id: "DISCONNECT", label: "Bajar el ritmo", publicResult: "Has reducido durante unos días el ruido alrededor de tu carrera." }
    ]
  }
] as const;
