import type { EventDefinition, GameState } from "../../../core/types.js";

export interface StagedCanonicalConditional {
  event: EventDefinition;
  status: "AWAITING_EXTERNAL_FACT";
  canonicalTrigger: string;
  canonicalMeaning: string;
}

const ALL_SPECS=[
  {
    "id": "CEVT_34_LATE_BALLON_WIN",
    "trigger": "Pico tardío + premio plausible",
    "premise": "Ganas por primera vez un gran premio individual a los 34-36 y el mercado interpreta que todavía debes ser titular.",
    "meaning": "PATTERN_LATE_PEAK: reconocimiento y envejecimiento pueden ir en direcciones opuestas.",
    "choices": [
      [
        "OWN_STARTER_CASE",
        "Usar el premio para pedir más rol"
      ],
      [
        "KEEP_SPECIALIST_ROLE",
        "Mantener el rol que funciona"
      ],
      [
        "OPEN_MARKET",
        "Escuchar mercado sin exigir nada"
      ],
      [
        "SEPARATE_PRIZE_ROLE",
        "Separar premio individual y jerarquía"
      ]
    ]
  },
  {
    "id": "CEVT_34_MAJOR_COMEBACK",
    "trigger": "Lesión grave + rehab exitosa",
    "premise": "Vuelves tras 7-10 meses y rindes mejor de lo esperado durante semanas.",
    "meaning": "PATTERN_INJURY_COMEBACK: el retorno no prueba que el cuerpo aguante una temporada completa.",
    "choices": [
      [
        "PUSH_LOAD",
        "Aumentar carga aprovechando el regreso"
      ],
      [
        "PROTECT_RETURN",
        "Mantener recuperación gradual"
      ],
      [
        "WAIT_EIGHT_WEEKS",
        "Esperar ocho semanas antes de juzgar"
      ],
      [
        "USE_RETURN_IN_MARKET",
        "Usar la vuelta como señal de mercado"
      ]
    ]
  },
  {
    "id": "CEVT_34_COACH_BECOMES_DIRECTOR",
    "trigger": "NPC entrenador antiguo + relación relevante",
    "premise": "Un técnico de etapas anteriores llega a dirección deportiva de un club que te considera.",
    "meaning": "Memoria diferida: una conversación de los 20 puede pesar más que tu fama actual.",
    "choices": [
      [
        "HEAR_PROJECT",
        "Escuchar su proyecto"
      ],
      [
        "ASK_FORMAL_TERMS",
        "Pedir condiciones formales"
      ],
      [
        "KEEP_PERSONAL_DISTANCE",
        "Separar relación antigua y negociación"
      ],
      [
        "DECLINE_MEMORY_LEVERAGE",
        "No usar la relación pasada"
      ]
    ]
  },
  {
    "id": "CEVT_34_RIVAS_RETURNS",
    "trigger": "SEED_RIVAS_TRUST activo",
    "premise": "Julián Rivas reaparece como técnico/asesor y te ofrece un rol que otros no ven.",
    "meaning": "Cerrar círculo sin garantizar que su lectura sea correcta.",
    "choices": [
      [
        "TRUST_READ",
        "Aceptar su lectura del rol"
      ],
      [
        "ASK_EVIDENCE",
        "Pedir pruebas deportivas concretas"
      ],
      [
        "KEEP_OPTION_OPEN",
        "Mantenerlo como opción sin comprometerte"
      ],
      [
        "DECLINE_CIRCLE",
        "Cerrar el círculo sin fichar"
      ]
    ]
  },
  {
    "id": "CEVT_34_CLARA_EXCLUSIVE",
    "trigger": "CLARA_CHANNEL alto + retirada cerca",
    "premise": "Clara pide la exclusiva del anuncio final y ofrece respetar embargo.",
    "meaning": "Confianza de dos décadas vs control institucional.",
    "choices": [
      [
        "GRANT_EMBARGO",
        "Dar exclusiva con embargo"
      ],
      [
        "SHARE_WITH_CLUB",
        "Coordinar cualquier anuncio con el club"
      ],
      [
        "DELAY_EXCLUSIVE",
        "Pedir que espere a que exista decisión"
      ],
      [
        "DECLINE_EXCLUSIVE",
        "No conceder exclusiva"
      ]
    ]
  },
  {
    "id": "CEVT_34_NANO_DIRECTOR",
    "trigger": "NANO_SHADOW/OLD_NETWORK_FAVOR",
    "premise": "Nano trabaja en un club y participa en una posible oferta para ti.",
    "meaning": "Amistad antigua se convierte en poder profesional invertido.",
    "choices": [
      [
        "HEAR_NANO",
        "Escuchar la propuesta"
      ],
      [
        "ASK_OTHER_CONTACT",
        "Pedir que otro directivo formalice"
      ],
      [
        "SEPARATE_FRIENDSHIP",
        "Separar amistad y negociación"
      ],
      [
        "DECLINE_NETWORK",
        "No activar la vía personal"
      ]
    ]
  },
  {
    "id": "CEVT_34_ADRIAN_LAST_DERBY",
    "trigger": "ADRIAN_MIRROR activo + ambos siguen",
    "premise": "Te enfrentas quizá por última vez a Adrián; la prensa intenta convertirlo en cierre de rivalidad.",
    "meaning": "El rival puede haber sido más importante en tu vida que en el palmarés.",
    "choices": [
      [
        "EMBRACE_RIVALRY",
        "Aceptar el relato de último derbi"
      ],
      [
        "TEAM_ONLY",
        "Hablar solo del partido"
      ],
      [
        "PRIVATE_CONTACT",
        "Hablar con Adrián en privado"
      ],
      [
        "IGNORE_FRAME",
        "No alimentar el cierre mediático"
      ]
    ]
  },
  {
    "id": "CEVT_34_FAMILY_CLUB_BUYIN",
    "trigger": "HOME_OWNERSHIP o familia negocio",
    "premise": "Tu entorno propone invertir en un proyecto deportivo mientras aún juegas.",
    "meaning": "Conflicto de interés y preparación poscarrera.",
    "choices": [
      [
        "INVEST_SMALL",
        "Aceptar una inversión limitada"
      ],
      [
        "WAIT_RETIREMENT",
        "Esperar al final de la carrera"
      ],
      [
        "INDEPENDENT_ADVICE",
        "Pedir evaluación independiente"
      ],
      [
        "DECLINE_CONFLICT",
        "Rechazar por conflicto de interés"
      ]
    ]
  },
  {
    "id": "CEVT_34_CLUB_RELEGATION",
    "trigger": "Club actual desciende",
    "premise": "Puedes ejecutar salida o quedarte en segunda categoría.",
    "meaning": "Lealtad con coste real; no bonus moral.",
    "choices": [
      [
        "STAY_DOWN",
        "Quedarte en segunda categoría"
      ],
      [
        "REQUEST_EXIT",
        "Pedir una salida"
      ],
      [
        "WAIT_PROJECT",
        "Escuchar el proyecto antes de decidir"
      ],
      [
        "NEGOTIATE_ROLE",
        "Vincular la decisión al rol real"
      ]
    ]
  },
  {
    "id": "CEVT_34_CLUB_PROMOTION",
    "trigger": "Club menor asciende",
    "premise": "El proyecto que elegiste por minutos alcanza máxima categoría inesperadamente.",
    "meaning": "Una decisión \"de bajar\" puede abrir subida tardía.",
    "choices": [
      [
        "STAY_PROJECT",
        "Seguir con el proyecto ascendido"
      ],
      [
        "TEST_TOP_LEVEL",
        "Dar una temporada al nuevo nivel"
      ],
      [
        "LISTEN_MARKET",
        "Escuchar mercado tras el ascenso"
      ],
      [
        "ASK_ROLE_CLARITY",
        "Pedir claridad de rol"
      ]
    ]
  },
  {
    "id": "CEVT_34_MANAGER_SACKED_AFTER_PROMISE",
    "trigger": "Promesa de rol + cambio de técnico",
    "premise": "El entrenador que justificó tu renovación es despedido antes de noviembre.",
    "meaning": "Los contratos sobreviven a personas; las promesas no siempre.",
    "choices": [
      [
        "HONOR_CONTRACT",
        "Mantener el contrato"
      ],
      [
        "ASK_NEW_COACH",
        "Pedir reunión con el nuevo técnico"
      ],
      [
        "OPEN_EXIT",
        "Abrir una salida"
      ],
      [
        "WAIT_PRESEASON",
        "Esperar a ver la nueva jerarquía"
      ]
    ]
  },
  {
    "id": "CEVT_34_SUCCESSOR_INJURED",
    "trigger": "Sucesor consolidado + lesión ajena",
    "premise": "La lesión del joven te devuelve una titularidad que ya habías aceptado perder.",
    "meaning": "Azar externo crea segunda oportunidad sin mérito/culpa.",
    "choices": [
      [
        "TAKE_START",
        "Aceptar la titularidad sin cambiar discurso"
      ],
      [
        "PROTECT_SUCCESSOR",
        "Apoyar al joven y competir"
      ],
      [
        "ASK_LONGER_ROLE",
        "Pedir que el rol no dependa de su lesión"
      ],
      [
        "KEEP_PLAN",
        "Mantener el plan de carga anterior"
      ]
    ]
  },
  {
    "id": "CEVT_35_UDV_FINANCIAL_CRISIS",
    "trigger": "HOME route + UDV",
    "premise": "UDV necesita recortar y te pide renegociar salario o aceptar venta de otro jugador.",
    "meaning": "El hogar también tiene política y dinero.",
    "choices": [
      [
        "RENEGOTIATE",
        "Aceptar renegociar salario"
      ],
      [
        "PROTECT_TERMS",
        "Mantener tus condiciones"
      ],
      [
        "ACCEPT_SALE_PATH",
        "Aceptar que el club busque otra venta"
      ],
      [
        "ASK_SHARED_SOLUTION",
        "Pedir una solución compartida"
      ]
    ]
  },
  {
    "id": "CEVT_35_UDV_CUP_RUN",
    "trigger": "UDV + copa",
    "premise": "El club humilde encadena una copa histórica y tu carga se dispara.",
    "meaning": "Últimos grandes partidos pueden aparecer fuera de la élite.",
    "choices": [
      [
        "PLAY_ALL",
        "Priorizar la copa"
      ],
      [
        "ROTATE_LOAD",
        "Mantener el plan de carga"
      ],
      [
        "SELECT_ROUNDS",
        "Elegir eliminatorias concretas"
      ],
      [
        "LET_STAFF_DECIDE",
        "Dejar la gestión al staff"
      ]
    ]
  },
  {
    "id": "CEVT_35_NT_TOURNAMENT_INJURY",
    "trigger": "Convocado último torneo + lesión menor",
    "premise": "Llegas tocado al torneo que puede ser el último.",
    "meaning": "Reedición de BODY/NATIONAL con horizonte final.",
    "choices": [
      [
        "PLAY_TOUCHED",
        "Intentar competir tocado"
      ],
      [
        "ACCEPT_LIMITED_ROLE",
        "Aceptar un rol limitado"
      ],
      [
        "WITHDRAW",
        "Renunciar al torneo por el cuerpo"
      ],
      [
        "REASSESS_DAILY",
        "Reevaluar cada día con el cuerpo médico"
      ]
    ]
  },
  {
    "id": "CEVT_35_NT_FINAL_GOAL",
    "trigger": "Selección + final + rol plausible",
    "premise": "Marcas o asistes decisivamente en una final internacional tardía.",
    "meaning": "Heroísmo tardío no obliga a continuar.",
    "choices": [
      [
        "OWN_MOMENT",
        "Disfrutar el momento sin prometer futuro"
      ],
      [
        "TEAM_FRAME",
        "Hablar solo del equipo"
      ],
      [
        "KEEP_AVAILABLE",
        "Seguir disponible para selección"
      ],
      [
        "END_NT_HIGH",
        "Plantear cierre internacional, no de club"
      ]
    ]
  },
  {
    "id": "CEVT_35_NT_FINAL_BENCH",
    "trigger": "Selección + final + rol secundario",
    "premise": "Tu selección gana una final sin que juegues.",
    "meaning": "Palmarés y experiencia personal divergen.",
    "choices": [
      [
        "CELEBRATE_FULLY",
        "Celebrar el título sin matices"
      ],
      [
        "PROCESS_PRIVATE",
        "Procesar en privado no haber jugado"
      ],
      [
        "ASK_ROLE_AFTER",
        "Pedir claridad para el siguiente ciclo"
      ],
      [
        "END_NT_ROLE",
        "Cerrar etapa internacional sin retirar carrera"
      ]
    ]
  },
  {
    "id": "CEVT_35_PUBLIC_FEUD_RETURNS",
    "trigger": "PUBLIC_RIVALRY antigua",
    "premise": "Un excompañero/reactor reabre una polémica años después justo en tu despedida.",
    "meaning": "El pasado puede contaminar el relato final sin cambiar la carrera.",
    "choices": [
      [
        "ANSWER_FACTS",
        "Responder solo con hechos"
      ],
      [
        "PRIVATE_CONTACT",
        "Contactar en privado"
      ],
      [
        "IGNORE_RETURN",
        "No reabrir la disputa"
      ],
      [
        "ASK_MEDIATION",
        "Buscar una voz común que cierre el tema"
      ]
    ]
  },
  {
    "id": "CEVT_35_SPONSOR_EXIT",
    "trigger": "Marca global + declive comercial",
    "premise": "Un patrocinador no renueva pese a seguir jugando.",
    "meaning": "La retirada comercial puede llegar antes que la deportiva.",
    "choices": [
      [
        "ACCEPT_END",
        "Aceptar el fin del patrocinio"
      ],
      [
        "ASK_REFRAME",
        "Proponer otra campaña"
      ],
      [
        "SEEK_OTHER_BRANDS",
        "Escuchar otras marcas"
      ],
      [
        "KEEP_SPORT_SEPARATE",
        "Separar totalmente lo comercial del fútbol"
      ]
    ]
  },
  {
    "id": "CEVT_35_SPONSOR_LATE_BOOM",
    "trigger": "Momento viral/mercado nuevo",
    "premise": "Una campaña inesperada te convierte en imagen de un mercado nuevo.",
    "meaning": "Fama tardía puede financiar libertad o arrastrar compromisos.",
    "choices": [
      [
        "TAKE_CAMPAIGN",
        "Aceptar la campaña"
      ],
      [
        "LIMIT_COMMITMENT",
        "Limitar duración y exposición"
      ],
      [
        "USE_FOR_FREEDOM",
        "Usar ingresos para ganar libertad deportiva"
      ],
      [
        "DECLINE_BOOM",
        "Rechazar el auge tardío"
      ]
    ]
  },
  {
    "id": "CEVT_36_YOUTH_ASSIST",
    "trigger": "Mentoría alta + joven titular",
    "premise": "El canterano al que enseñaste te da la asistencia de un gol decisivo tardío.",
    "meaning": "Semilla positiva sin recompensa garantizada.",
    "choices": [
      [
        "CREDIT_YOUTH",
        "Dar todo el crédito al joven"
      ],
      [
        "SHARE_CREDIT",
        "Hablar de sociedad deportiva"
      ],
      [
        "KEEP_PRIVATE",
        "Celebrarlo sin convertirlo en relato"
      ],
      [
        "MENTOR_MORE",
        "Profundizar la mentoría"
      ]
    ]
  },
  {
    "id": "CEVT_36_YOUTH_REPLACES_YOU",
    "trigger": "Mentoría alta + rol cae",
    "premise": "El mismo joven te quita el puesto de forma estable.",
    "meaning": "Ayudar y perder espacio pueden coexistir.",
    "choices": [
      [
        "SUPPORT_SUCCESSOR",
        "Apoyar al joven"
      ],
      [
        "COMPETE_ROLE",
        "Competir por recuperar el puesto"
      ],
      [
        "ASK_DIFFERENT_ROLE",
        "Pedir otro rol útil"
      ],
      [
        "OPEN_MARKET",
        "Explorar una salida"
      ]
    ]
  },
  {
    "id": "CEVT_36_RECORD_BROKEN_BY_OTHER",
    "trigger": "Récord activo",
    "premise": "Otro jugador supera una marca que estabas persiguiendo antes de que puedas alcanzarla.",
    "meaning": "Los objetivos pueden desaparecer sin error del protagonista.",
    "choices": [
      [
        "CONGRATULATE",
        "Felicitar al nuevo récord"
      ],
      [
        "KEEP_OWN_GOAL",
        "Mantener tu objetivo personal"
      ],
      [
        "DROP_PURSUIT",
        "Dejar de perseguir la marca"
      ],
      [
        "REFRAME_LEGACY",
        "Reformular el legado fuera del récord"
      ]
    ]
  },
  {
    "id": "CEVT_36_NO_MEDICAL_CLEARANCE",
    "trigger": "BODY_REDLINE extremo",
    "premise": "Un club interesado no supera tu reconocimiento médico o pide condiciones especiales.",
    "meaning": "El mercado puede terminar por evaluación externa, no por decisión.",
    "choices": [
      [
        "ACCEPT_ASSESSMENT",
        "Aceptar la evaluación"
      ],
      [
        "SECOND_MEDICAL",
        "Pedir segunda evaluación"
      ],
      [
        "ASK_SPECIAL_TERMS",
        "Escuchar condiciones especiales"
      ],
      [
        "END_NEGOTIATION",
        "Cerrar esa negociación"
      ]
    ]
  },
  {
    "id": "CEVT_36_ONE_LAST_CHAMPIONS_RUN",
    "trigger": "Club continental + rol útil",
    "premise": "El equipo llega inesperadamente a semifinal/final continental y pospones decisiones de futuro.",
    "meaning": "Un torneo puede cambiar el significado de una temporada.",
    "choices": [
      [
        "PRIORITIZE_RUN",
        "Priorizar la eliminatoria continental"
      ],
      [
        "KEEP_LOAD_PLAN",
        "Mantener el plan físico"
      ],
      [
        "DEFER_FUTURE",
        "Posponer conversaciones de futuro"
      ],
      [
        "SEPARATE_TOURNAMENT",
        "No dejar que el torneo decida tu contrato"
      ]
    ]
  },
  {
    "id": "CEVT_37_PLAYER_COACH_EMERGENCY",
    "trigger": "Club pequeño + staff crisis",
    "premise": "Durante semanas asumes funciones tácticas informales por ausencia del cuerpo técnico.",
    "meaning": "Transición poscarrera sin obligar a ser entrenador.",
    "choices": [
      [
        "HELP_TACTICALLY",
        "Asumir ayuda táctica informal"
      ],
      [
        "PLAYER_ONLY",
        "Mantenerte solo como jugador"
      ],
      [
        "LIMIT_ROLE",
        "Ayudar solo en sesiones concretas"
      ],
      [
        "ASK_FORMAL_STAFF",
        "Pedir solución formal de staff"
      ]
    ]
  },
  {
    "id": "CEVT_37_EMPTY_STADIUM_FAREWELL",
    "trigger": "Sanción/obra/causa externa",
    "premise": "Tu último partido potencial se juega sin el ambiente esperado.",
    "meaning": "La despedida perfecta depende de factores externos.",
    "choices": [
      [
        "ACCEPT_IMPERFECT",
        "Aceptar una despedida imperfecta"
      ],
      [
        "DELAY_CEREMONY",
        "Separar partido y ceremonia"
      ],
      [
        "PRIVATE_FAREWELL",
        "Priorizar despedida privada"
      ],
      [
        "NO_SCRIPT",
        "No intentar compensar el ambiente"
      ]
    ]
  },
  {
    "id": "CEVT_37_LAST_DERBY",
    "trigger": "Club histórico + rivalidad",
    "premise": "El calendario ofrece un último derbi tras anunciar retirada.",
    "meaning": "Tensión competitiva vs relato emocional.",
    "choices": [
      [
        "PLAY_COMPETE",
        "Jugarlo como partido competitivo"
      ],
      [
        "EMBRACE_FAREWELL",
        "Aceptar el componente emocional"
      ],
      [
        "KEEP_ANNOUNCEMENT_OUT",
        "Separar anuncio y derbi"
      ],
      [
        "TALK_RIVAL_PRIVATE",
        "Cerrar la rivalidad en privado"
      ]
    ]
  }
] as const;
const MEMORY_COMPLETED_IDS=new Set(["CEVT_34_FAMILY_CLUB_BUYIN","CEVT_34_CLARA_EXCLUSIVE","CEVT_35_PUBLIC_FEUD_RETURNS","CEVT_35_UDV_FINANCIAL_CRISIS"]);
const SPECS=ALL_SPECS.filter(spec=>!MEMORY_COMPLETED_IDS.has(spec.id));

function toConditional(spec:typeof ALL_SPECS[number]):EventDefinition{
  const choices=spec.choices.map(([id,label])=>({
    id,label,intentTags:["conditional","canonical_34plus"],
    outcomeIds:[`${spec.id}__${id}__PRIMARY`]
  }));
  const outcomes=spec.choices.map(([id,label])=>({
    id:`${spec.id}__${id}__PRIMARY`,
    baseWeight:1,
    effects:[],
    messages:[`${label}. La consecuencia se registra solo cuando el trigger factual canónico está acreditado.`],
    historyTags:["canonical_34plus_conditional",`choice_${id}`]
  }));
  const rawAge=Number(spec.id.split("_")[1]);
  return {
    id:spec.id,
    ageWindow:[Number.isFinite(rawAge)?rawAge:34,null],
    phase:"34_plus",
    family:"conditional",
    gates:[{path:"flags.__A8_EXTERNAL_CONDITIONAL_FACT_NEVER_SYNTHESIZE",op:"eq",value:true}],
    cooldown:99999,repeatable:false,weight:1,
    text:{title:spec.id,body:spec.premise},
    intel:{visible:[spec.canonicalTrigger],uncertain:[spec.meaning]},
    choices,outcomes,
    tags:["canonical_34plus","conditional","staged_not_registered","awaiting_external_fact","no_generic_shell"],
    canonStatus:"verified"
  };
}

export const STAGED_ORDINARY_CANONICAL_CONDITIONALS:readonly StagedCanonicalConditional[]=SPECS.map(spec=>({
  event:toConditional(spec),
  status:"AWAITING_EXTERNAL_FACT" as const,
  canonicalTrigger:spec.trigger,
  canonicalMeaning:spec.meaning
}));

export function stagedCanonicalConditional(id:string):StagedCanonicalConditional|null{
  return STAGED_ORDINARY_CANONICAL_CONDITIONALS.find(row=>row.event.id===id)??null;
}

export function stagedCanonicalConditionalEligible(state:GameState,id:string,authoritativeTriggerSatisfied:boolean):boolean{
  const row=stagedCanonicalConditional(id);
  if(!row||!authoritativeTriggerSatisfied) return false;
  return state.retirement.status==="playing" && state.age>=row.event.ageWindow[0];
}
