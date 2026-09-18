import type { EventDefinition, SeedTransition } from "../../../core/types.js";
import { ambiguousEvent, n, seedCreate } from "../18_20/helpers.js";

const intensify = (seedId: string, intensity: number): SeedTransition => ({ seedId, action: "intensify", intensity });

export const A5_SPORT_EXTERNAL_REQUIREMENTS = Object.freeze({
  EVT_20_MATCH_003: {
    owner: "A4",
    awaiting: ["live match score/state", "player on pitch", "coach tactical instruction at minute 65"],
    forbidden: ["role/form as match fact", "invented score", "narrative RNG for football execution"]
  },
  EVT_21_NAT_001: {
    owner: "A4/shared-selection",
    awaiting: ["official concrete selection list", "player absent from that list", "selection window identity"],
    forbidden: ["nationalStanding as call-up", "caps as current list", "tournament-cycle aggregate as roster"]
  },
  EVT_22_HOME_001: {
    owner: "A4/world",
    awaiting: ["real fixture against UDV/former home context", "player participation context"],
    forbidden: ["month as fixture", "SEED_EXIT_STYLE_UDV as proof of opponent", "invented goal"]
  },
  EVT_22_TACT_001: {
    owner: "A4",
    awaiting: ["real high-value fixture", "starting-role decision", "specific tactical assignment"],
    optional: ["certified active agent for scout-context route"],
    forbidden: ["roleScore as start", "marketHeat as scout fact", "invented knockout fixture"]
  }
});

const EVT_20_MATCH_003 = ambiguousEvent({
  id:"EVT_20_MATCH_003",ageWindow:[20,20],phase:"20_23",family:"sport",
  title:"El minuto 65",
  body:"Vas ganando y el técnico te pide bajar diez metros y reducir el uno contra uno. El marcador, tu presencia en el campo y la orden deben proceder del partido real; A5 no fabrica ninguno de esos hechos.",
  visible:["Conoces el marcador y la instrucción solo cuando A4 los produce.","Sabes que llevas semanas intentando consolidar tu rol, pero eso no demuestra que este partido exista."],
  uncertain:["No sabes qué valoran más los observadores: producción ofensiva o disciplina táctica.","Cumplir, adaptar o desobedecer pueden tener costes distintos para equipo, entrenador y mercado."],
  weight:13,
  choices:[
    {id:"STRICT",label:"Cumplir de forma estricta",intentTags:["tactical","discipline"],primaryMessage:"Priorizas la orden y reduces exposición ofensiva para proteger la estructura del equipo.",secondaryMessage:"La disciplina puede reforzar confianza del técnico y dejar menos acciones visibles en el tramo final.",primaryEffects:[n("professional.institutionalTrust",4),n("sport.roleScore",2)],secondaryEffects:[n("reputation.marketHeat",-1),n("professional.institutionalTrust",3)]},
    {id:"HYBRID",label:"Cumplir sin renunciar a atacar cuando el contexto lo permita",intentTags:["tactical","balance"],primaryMessage:"Respetas la altura defensiva y eliges momentos concretos para atacar sin convertirlos en desobediencia automática.",secondaryMessage:"El equilibrio ofrece techo, pero un mal momento puede parecer incumplimiento de una orden clara.",primaryEffects:[n("professional.tacticalReading",4),n("sport.roleScore",2)],secondaryEffects:[n("professional.institutionalTrust",-1),n("reputation.marketHeat",2)]},
    {id:"OWN_GAME",label:"Mantener tu juego y asumir el riesgo",intentTags:["tactical","risk","attack"],primaryMessage:"Priorizas tu perfil ofensivo sabiendo que una acción buena no convierte la decisión en correcta retrospectivamente.",secondaryMessage:"La desobediencia puede producir una jugada útil o una sustitución; el resultado deportivo debe resolverlo A4.",primaryEffects:[n("reputation.marketHeat",3),n("professional.institutionalTrust",-3)],secondaryEffects:[n("sport.roleScore",-4),n("professional.institutionalTrust",-5)]}
  ],
  seedsRead:["SEED_MENA_EARLY_READ"],
  tags:["sport","tactical_instruction","a5_ready_external_blocker"],canonStatus:"verified"
});

const EVT_21_NAT_001 = ambiguousEvent({
  id:"EVT_21_NAT_001",ageWindow:[21,21],phase:"20_23",family:"national",
  title:"La ausencia",
  body:"Tu nombre aparece en quinielas, pero una lista oficial concreta no te incluye. La ausencia solo existe cuando la autoridad de selección certifica esa lista; standing, heat y caps no demuestran una convocatoria actual.",
  visible:["La lista es oficial y tu ausencia es verificable cuando A4/shared-selection lo acredita.","No conoces por qué el seleccionador tomó la decisión."],
  uncertain:["No sabes si estuviste cerca, si pesa tu club o si nunca fuiste considerado.","Investigar puede aportar datos o fabricar falsas certezas si la fuente no sabe."],
  gates:[{path:"professional.nationalHeat",op:"gte",value:25}],weight:12,
  choices:[
    {id:"DO_MORE",label:"Decir que debes hacer más",intentTags:["national","humility"],primaryMessage:"Respondes sobre tu propio rendimiento sin inventar la causa de la ausencia.",secondaryMessage:"La humildad reduce conflicto y puede dejar el tema sin más información.",primaryEffects:[n("professional.environmentStability",3),n("reputation.mediaHeat",-1)],secondaryEffects:[n("reputation.mediaHeat",-2)],primarySeedTransitions:[seedCreate("SEED_SELECTION_SNUB",54,{stance:"do_more"})],secondarySeedTransitions:[seedCreate("SEED_SELECTION_SNUB",56,{stance:"do_more",quiet:true})]},
    {id:"MERIT_FIELD",label:"Decir que los méritos deberían medirse en el campo",intentTags:["national","public","challenge"],primaryMessage:"Defiendes un criterio deportivo sin afirmar que conoces las razones del seleccionador.",secondaryMessage:"La frase puede proyectar hambre o leerse como crítica a una decisión cuyo proceso desconoces.",primaryEffects:[n("reputation.mediaHeat",3),n("professional.nationalHeat",2)],secondaryEffects:[n("reputation.mediaHeat",5),n("professional.environmentStability",-2)],primarySeedTransitions:[seedCreate("SEED_SELECTION_SNUB",62,{stance:"merit_field"})],secondarySeedTransitions:[seedCreate("SEED_SELECTION_SNUB",68,{stance:"merit_field",friction:true})]},
    {id:"NO_SELECTION_TALK",label:"No hablar de selección",intentTags:["national","silence"],primaryMessage:"Evitas atribuir motivos y devuelves el foco a tu club.",secondaryMessage:"El silencio no aporta información y deja que otros interpreten tu reacción.",primaryEffects:[n("professional.environmentStability",3)],secondaryEffects:[n("reputation.mediaHeat",1)],primarySeedTransitions:[seedCreate("SEED_SELECTION_SNUB",48,{stance:"silence"})],secondarySeedTransitions:[seedCreate("SEED_SELECTION_SNUB",52,{stance:"silence_interpreted"})]},
    {id:"AGENT_PRIVATE",label:"Llamar a tu agente para averiguar por vías privadas antes de responder",intentTags:["national","agent","information"],eligibility:[{path:"facts.activeAgentNpcId",op:"exists"}],primaryMessage:"Pides contexto privado sin convertir rumores de agencia en explicación oficial.",secondaryMessage:"La consulta puede aportar señales parciales y también una confianza excesiva en fuentes indirectas.",primaryEffects:[n("control.career",4)],secondaryEffects:[n("control.career",2)],primarySeedTransitions:[seedCreate("SEED_SELECTION_SNUB",58,{stance:"agent_check"})],secondarySeedTransitions:[seedCreate("SEED_SELECTION_SNUB",64,{stance:"agent_check",uncertain_source:true})]}
  ],
  seedsRead:["SEED_CLARA_CHANNEL"],seedsWrite:["SEED_SELECTION_SNUB"],
  tags:["national","official_list","a5_ready_external_blocker"],canonStatus:"verified"
});

const EVT_22_HOME_001 = ambiguousEvent({
  id:"EVT_22_HOME_001",ageWindow:[22,22],phase:"20_23",family:"legacy",
  title:"El partido contra casa",
  body:"Por primera vez desde tu salida existe un partido real contra UDV o un contexto equivalente certificado. Tu historia de salida condiciona el gesto; no crea por sí sola el rival, el estadio ni un gol.",
  visible:["Conoces cómo fue tu salida y el partido concreto cuando A4 lo materializa.","Puedes decidir gestos previos; una eventual celebración solo se ejecuta si el partido produce un gol tuyo."],
  uncertain:["No sabes cómo reaccionará la mayoría de la grada.","Un mismo gesto puede leerse de forma distinta por tu afición actual y por la de origen."],
  gates:[{path:"facts.exitStyleYear19",op:"exists"}],weight:12,
  choices:[
    {id:"GREET",label:"Saludar a la grada antes del partido",intentTags:["home","respect","public"],primaryMessage:"Reconoces el vínculo antes de competir sin prometer una reconciliación que quizá no exista.",secondaryMessage:"El gesto puede ser bien recibido o parecer calculado según la historia de salida.",primaryEffects:[n("professional.environmentStability",3),n("reputation.mediaHeat",1)],secondaryEffects:[n("reputation.mediaHeat",3)],primarySeedTransitions:[seedCreate("SEED_HOME_DISTANCE",56,{stance:"greet"}),intensify("SEED_EXIT_STYLE_UDV",2)],secondarySeedTransitions:[seedCreate("SEED_HOME_DISTANCE",61,{stance:"greet",calculated_read:true}),intensify("SEED_EXIT_STYLE_UDV",3)]},
    {id:"ROUTINE",label:"Mantener rutina y no teatralizar",intentTags:["home","routine","focus"],primaryMessage:"Tratas el partido como competición y evitas fabricar una escena ceremonial.",secondaryMessage:"La normalidad protege foco y puede leerse como distancia frente a un lugar que fue importante.",primaryEffects:[n("professional.environmentStability",4)],secondaryEffects:[n("reputation.mediaHeat",2)],primarySeedTransitions:[seedCreate("SEED_HOME_DISTANCE",52,{stance:"routine"}),intensify("SEED_EXIT_STYLE_UDV",2)],secondarySeedTransitions:[seedCreate("SEED_HOME_DISTANCE",57,{stance:"routine",distance_read:true}),intensify("SEED_EXIT_STYLE_UDV",3)]},
    {id:"NO_CELEBRATE_IF_GOAL",label:"Si marcas, no celebrar",intentTags:["home","conditional_goal","respect"],primaryMessage:"Fijas tu intención simbólica, pero no se afirma que marques: la ejecución depende del partido real.",secondaryMessage:"Si llega el gol, no celebrar puede respetar origen y molestar a parte de tu afición actual.",primaryEffects:[n("control.career",2)],secondaryEffects:[n("professional.publicPolarization",3)],primarySeedTransitions:[seedCreate("SEED_HOME_DISTANCE",60,{stance:"no_celebrate_if_goal"}),intensify("SEED_EXIT_STYLE_UDV",3)],secondarySeedTransitions:[seedCreate("SEED_HOME_DISTANCE",64,{stance:"no_celebrate_if_goal",polarized:true}),intensify("SEED_EXIT_STYLE_UDV",4)]},
    {id:"DECIDE_LIVE",label:"Decidir la celebración solo en el momento según el ambiente",intentTags:["home","adaptive","conditional_goal"],primaryMessage:"No preescribes un gesto para un gol que quizá no exista y conservas margen para leer el ambiente real.",secondaryMessage:"La flexibilidad evita una promesa previa y puede producir una reacción más ambigua si el momento llega.",primaryEffects:[n("control.career",4)],secondaryEffects:[n("reputation.mediaHeat",1)],primarySeedTransitions:[seedCreate("SEED_HOME_DISTANCE",54,{stance:"decide_live"}),intensify("SEED_EXIT_STYLE_UDV",2)],secondarySeedTransitions:[seedCreate("SEED_HOME_DISTANCE",58,{stance:"decide_live",ambiguous:true}),intensify("SEED_EXIT_STYLE_UDV",3)]}
  ],
  seedsRead:["SEED_EXIT_STYLE_UDV"],seedsWrite:["SEED_HOME_DISTANCE","SEED_EXIT_STYLE_UDV"],
  tags:["home","former_club_fixture","a5_ready_external_blocker"],canonStatus:"verified"
});

const EVT_22_TACT_001 = ambiguousEvent({
  id:"EVT_22_TACT_001",ageWindow:[22,22],phase:"20_23",family:"tactical",
  title:"Noventa minutos que no te favorecen",
  body:"El técnico ofrece titularidad en un partido de alto valor a cambio de una tarea táctica que reduce tus zonas ofensivas. El partido, la titularidad y la asignación deben ser facts deportivas reales.",
  visible:["Conoces la tarea concreta y su coste probable en producción ofensiva cuando A4 la certifica.","Aceptar una función no garantiza que el plan funcione ni que el mercado la valore."],
  uncertain:["No sabes cómo leerán los observadores una actuación con pocos highlights.","Negociar una libertad puede mejorar el plan o alterar la confianza del técnico."],
  weight:13,
  choices:[
    {id:"ACCEPT",label:"Aceptar sin discutir",intentTags:["tactical","team","sacrifice"],primaryMessage:"Aceptas el trabajo específico y priorizas utilidad colectiva sobre visibilidad estadística.",secondaryMessage:"El sacrificio puede reforzar confianza o fijarte en un rol menos brillante.",primaryEffects:[n("professional.institutionalTrust",5),n("professional.tacticalReading",4)],secondaryEffects:[n("reputation.marketHeat",-2),n("professional.institutionalTrust",3)],primarySeedTransitions:[seedCreate("SEED_TACTICAL_SACRIFICE",62,{stance:"accept"})],secondarySeedTransitions:[seedCreate("SEED_TACTICAL_SACRIFICE",68,{stance:"accept",profile_cost:true})]},
    {id:"OFFENSIVE_FREEDOM",label:"Aceptar y pedir una libertad ofensiva concreta",intentTags:["tactical","negotiate","balance"],primaryMessage:"Aceptas la función y propones una excepción concreta que el técnico puede incorporar o rechazar.",secondaryMessage:"Negociar mejora encaje si hay confianza y puede sonar a resistencia si el plan necesita disciplina total.",primaryEffects:[n("professional.tacticalReading",4),n("control.career",3)],secondaryEffects:[n("professional.institutionalTrust",-2)],primarySeedTransitions:[seedCreate("SEED_TACTICAL_SACRIFICE",58,{stance:"accept_with_freedom"})],secondarySeedTransitions:[seedCreate("SEED_TACTICAL_SACRIFICE",64,{stance:"accept_with_freedom",friction:true})]},
    {id:"MORE_WITH_BALL",label:"Decir que puedes ayudar más con balón",intentTags:["tactical","challenge","identity"],primaryMessage:"Defiendes tu perfil con balón sin afirmar que el plan del técnico vaya a fallar.",secondaryMessage:"La objeción puede abrir una conversación táctica o reducir confianza para este partido concreto.",primaryEffects:[n("control.career",4),n("professional.tacticalReading",2)],secondaryEffects:[n("sport.roleScore",-3),n("professional.institutionalTrust",-3)],primarySeedTransitions:[seedCreate("SEED_TACTICAL_SACRIFICE",60,{stance:"argue_ball"})],secondarySeedTransitions:[seedCreate("SEED_TACTICAL_SACRIFICE",66,{stance:"argue_ball",role_cost:true})]},
    {id:"AGENT_CONTEXT",label:"Aceptar y pedir al agente que prepare contexto para scouts",intentTags:["tactical","agent","context"],eligibility:[{path:"facts.activeAgentNpcId",op:"exists"}],primaryMessage:"Aceptas la tarea y pides que el contexto deportivo se explique sin inventar estadísticas ni scouts concretos.",secondaryMessage:"Gestionar el relato puede proteger lectura externa y también parecer una preocupación prematura por la imagen.",primaryEffects:[n("professional.agentControl",2),n("control.career",2)],secondaryEffects:[n("reputation.mediaHeat",2)],primarySeedTransitions:[seedCreate("SEED_TACTICAL_SACRIFICE",62,{stance:"agent_context"})],secondarySeedTransitions:[seedCreate("SEED_TACTICAL_SACRIFICE",67,{stance:"agent_context",image_risk:true})]}
  ],
  seedsWrite:["SEED_TACTICAL_SACRIFICE"],tags:["tactical","high_value_fixture","a5_ready_external_blocker"],canonStatus:"verified"
});

export const A5_SPORT_OWNER_READY_PRINCIPALS: EventDefinition[] = [
  EVT_20_MATCH_003, EVT_21_NAT_001, EVT_22_HOME_001, EVT_22_TACT_001
];
