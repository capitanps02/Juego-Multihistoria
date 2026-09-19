import type { EventDefinition, OutcomeModifier } from "../../../core/types.js";
import { ambiguousEvent, n } from "../18_20/helpers.js";

const prior=(id:string,value:string,reason:string,multiply:number):OutcomeModifier=>({
  id,conditions:[{path:"facts.privateChatChoice",op:"eq",value}],multiply,reason
});

const AGENT23=ambiguousEvent({
  id:"CEVT_23_AGENT_03",ageWindow:[23,25],phase:"23_26",family:"conditional",title:"El otro agente llama a tu familia",
  body:"Un agente distinto al que gestiona hoy tu carrera contacta a tu familia con una propuesta de representación y afirma tener acceso a oportunidades concretas.",
  visible:["Sabes quién ha llamado, qué canal familiar usó y qué afirma poder aportar."],
  uncertain:["No sabes si el acceso que promete es real ni si el contacto busca información, presión o una futura representación."],
  choices:[
    {id:"A",label:"Pedir a tu familia que corte el contacto y avisar a tu agente",intentTags:["agent","boundary"],primaryMessage:"Cierras el canal paralelo y haces visible el intento de captación.",secondaryMessage:"Proteges la gobernanza actual, aunque tu agente puede interpretar el episodio como señal de mercado más que como simple intrusión.",primaryEffects:[n("professional.environmentStability",3),n("professional.agentControl",2)],secondaryEffects:[n("reputation.marketHeat",1)]},
    {id:"B",label:"Escuchar una sola vez sin hablar de contrato",intentTags:["agent","information"],primaryMessage:"Recoges información sin tratar el contacto como una oferta ni como un cambio de representante.",secondaryMessage:"Obtienes contexto y abres un canal que puede tensar la relación con tu agente actual si se conoce.",primaryEffects:[n("professional.careerControl",3)],secondaryEffects:[n("professional.environmentStability",-2),n("reputation.marketHeat",2)]},
    {id:"C",label:"Pedir que cualquier propuesta llegue por un canal profesional verificable",intentTags:["agent","proof"],primaryMessage:"Exiges identidad, mandato y propuesta verificables antes de seguir.",secondaryMessage:"La petición filtra ruido y puede hacer desaparecer una oportunidad que dependía de informalidad.",primaryEffects:[n("professional.careerControl",4),n("professional.agentControl",2)],secondaryEffects:[n("reputation.marketHeat",-1)]},
    {id:"D",label:"Hablar primero con tu familia sobre límites de acceso",intentTags:["family","boundary"],primaryMessage:"Tratas el problema como uno de gobernanza del círculo cercano antes de convertirlo en conflicto entre agentes.",secondaryMessage:"Mejoras límites internos, pero el agente externo ya sabe que consiguió llegar hasta tu entorno.",primaryEffects:[n("professional.environmentStability",4)],secondaryEffects:[n("professional.publicPolarization",1)]}
  ],
  gates:[{path:"flags.HAS_SEED_FIRST_AGENT",op:"eq",value:true},{path:"facts.activeAgentFamilyChannelContact",op:"eq",value:true}],
  weight:12,cooldown:99999,seedsRead:["SEED_FIRST_AGENT"],
  tags:["conditional","agent","a6_ready_external_blocker","needs_a1_active_agent_and_verified_family_contact","t5_41"],canonStatus:"verified"
});

const CHAT24=ambiguousEvent({
  id:"CEVT_24_CHAT_01",ageWindow:[24,25],phase:"23_26",family:"conditional",title:"La captura existe",
  body:"Una captura del chat privado aparece fuera del vestuario. Lo que hiciste entonces —escribir, bajar el tono, callar o salir— condiciona cuánto puede atribuirte la filtración.",
  visible:["Ves la captura publicada y sabes exactamente qué hiciste en el chat original."],
  uncertain:["No sabes quién filtró la imagen, qué fragmentos adicionales existen ni cuánto conoce el club."],
  choices:[
    {id:"A",label:"Reconocer tu participación y explicar el contexto",intentTags:["chat","acknowledge"],primaryMessage:"La respuesta es coherente con una captura que muestra actividad tuya y limita contradicciones futuras.",secondaryMessage:"Reconocer participación amplifica tu vínculo con el chat aunque el contenido fuese moderador.",primaryEffects:[n("professional.careerControl",3),n("reputation.mediaHeat",2)],secondaryEffects:[n("professional.publicPolarization",3)],primaryModifiers:[prior("chat-wrote-a","A","Haber criticado también hace más costoso negar contexto.",1.35),prior("chat-moderated-b","B","Haber intervenido para bajar el tono hace más defendible contextualizar.",1.25)],secondaryModifiers:[prior("chat-silent-c","C","Si no escribiste, atribuirte participación activa empeora la interpretación.",1.7),prior("chat-left-d","D","Si saliste del grupo, asumir participación activa crea una contradicción.",1.8)]},
    {id:"B",label:"Aportar solo el mensaje exacto que escribiste",intentTags:["chat","evidence"],primaryMessage:"Centras la respuesta en evidencia verificable y separas tu conducta del resto del grupo.",secondaryMessage:"Publicar más contexto puede demostrar tu postura o alimentar otra ronda de titulares.",primaryEffects:[n("professional.careerControl",4)],secondaryEffects:[n("reputation.mediaHeat",3)],primaryModifiers:[prior("chat-evidence-b","B","La memoria de moderación hace especialmente informativo mostrar el mensaje exacto.",1.5),prior("chat-evidence-a","A","Mostrar literalmente una crítica también evita una negación insostenible.",1.2)]},
    {id:"C",label:"Negar haber escrito si la memoria demuestra silencio o salida",intentTags:["chat","deny_authorship"],primaryMessage:"La negación encaja con un historial donde no dejaste mensajes atribuibles.",secondaryMessage:"Si la memoria contiene texto tuyo, una negación absoluta convierte la captura en un problema de credibilidad.",primaryEffects:[n("professional.careerControl",3),n("reputation.mediaHeat",-1)],secondaryEffects:[n("professional.publicPolarization",5),n("professional.institutionalTrust",-3)],primaryModifiers:[prior("chat-silent-proof-c","C","El silencio registrado respalda la negación de autoría.",2.0),prior("chat-left-proof-d","D","La salida registrada respalda que no siguieras participando.",1.8)],secondaryModifiers:[prior("chat-wrote-conflict-a","A","La crítica registrada contradice una negación absoluta.",2.4),prior("chat-wrote-conflict-b","B","El mensaje moderador sigue siendo un mensaje y contradice negar autoría.",2.2)]},
    {id:"D",label:"Pedir al club una investigación de la filtración y no discutir el contenido",intentTags:["chat","leak_investigation"],primaryMessage:"Desplazas la cuestión inmediata hacia privacidad y origen de la captura sin reescribir lo que hiciste.",secondaryMessage:"La estrategia protege procedimiento, pero el silencio público deja que otros definan el significado de la conversación.",primaryEffects:[n("professional.institutionalTrust",2),n("professional.careerControl",2)],secondaryEffects:[n("reputation.mediaHeat",2)],primaryModifiers:[prior("chat-left-investigation-d","D","Haber salido del grupo hace especialmente coherente centrarte en la filtración.",1.25)]}
  ],
  gates:[{path:"flags.HAS_SEED_PRIVATE_CHAT",op:"eq",value:true}],
  gateAlternatives:[
    [{path:"facts.privateChatChoice",op:"eq",value:"A"}],
    [{path:"facts.privateChatChoice",op:"eq",value:"B"}],
    [{path:"facts.privateChatChoice",op:"eq",value:"C"}],
    [{path:"facts.privateChatChoice",op:"eq",value:"D"}]
  ],
  weight:14,cooldown:99999,seedsRead:["SEED_PRIVATE_CHAT"],
  tags:["conditional","chat","a6_ready_external_blocker","needs_a2_private_chat_choice_fact_origin_club_scoped","exact_source_copy_unavailable_semantics_owner_complete","t5_41"],canonStatus:"verified"
});

const TOURN02=ambiguousEvent({
  id:"CEVT_24_TOURN_02",ageWindow:[24,25],phase:"23_26",family:"conditional",title:"Te quedaste fuera por uno",
  body:"Después de formar parte del proceso previo, te quedas fuera de la lista final del torneo por una plaza. El seleccionador te explica que la decisión fue de equilibrio de plantilla, no una baja médica.",
  visible:["Sabes que no estás en la lista final, quién ocupa la última plaza y la explicación deportiva comunicada."],
  uncertain:["No sabes si la jerarquía cambiará después del torneo ni cuánto pesará la omisión en tu club o mercado."],
  choices:[
    {id:"A",label:"Aceptar la decisión y seguir disponible",intentTags:["national","accept"],primaryMessage:"Mantienes la relación con la selección sin convertir una omisión concreta en ruptura.",secondaryMessage:"La calma preserva continuidad y no garantiza volver en la siguiente lista.",primaryEffects:[n("professional.nationalPower",1),n("professional.environmentStability",2)],secondaryEffects:[n("professional.nationalStanding",-1)]},
    {id:"B",label:"Pedir una explicación técnica más precisa",intentTags:["national","feedback"],primaryMessage:"Solicitas criterios concretos para entender qué debes cambiar.",secondaryMessage:"Obtienes información parcial y también haces visible que la decisión te afecta.",primaryEffects:[n("professional.careerControl",3)],secondaryEffects:[n("professional.publicPolarization",1)]},
    {id:"C",label:"Usar el verano para recuperar carga",intentTags:["national","recovery"],primaryMessage:"Conviertes la ausencia en margen de recuperación sin fingir que fue voluntaria.",secondaryMessage:"Proteges cuerpo y pierdes presencia durante un torneo que puede reorganizar jerarquías.",primaryEffects:[n("professional.recoveryMargin",5),n("professional.bodyLoad",-3)],secondaryEffects:[n("professional.nationalPower",-1)]},
    {id:"D",label:"Pedir a tu agente que no convierta la omisión en campaña pública",intentTags:["national","media_boundary"],primaryMessage:"Evitas usar mercado o prensa para discutir una decisión de selección.",secondaryMessage:"Reduces ruido y renuncias a una palanca de relato que otros jugadores sí pueden usar.",primaryEffects:[n("professional.careerControl",2),n("reputation.mediaHeat",-2)],secondaryEffects:[n("reputation.marketHeat",-1)]}
  ],
  gates:[{path:"flags.HAS_SEED_MAJOR_TOURNAMENT",op:"eq",value:true},{path:"facts.currentTournamentFinalSquadOmission",op:"eq",value:true}],
  timeWindow:{months:[4,5,6]},weight:13,cooldown:99999,seedsRead:["SEED_MAJOR_TOURNAMENT"],
  tags:["conditional","selection","a6_ready_external_blocker","needs_concrete_final_squad_omission_not_national_called_proxy","t5_41"],canonStatus:"verified"
});

const OWNER24=ambiguousEvent({
  id:"CEVT_24_OWNER_02",ageWindow:[24,25],phase:"23_26",family:"conditional",title:"El propietario quiere una estrella",
  body:"El nuevo propietario de tu club quiere acelerar el proyecto fichando una estrella de tu zona y te pide posicionarte sobre la operación.",
  visible:["Sabes que el cambio de propiedad es real, quién toma la decisión y qué rol público te piden asumir."],
  uncertain:["No sabes si el fichaje llegará, si jugaréis juntos ni cuánto cambiará el proyecto deportivo."],
  choices:[
    {id:"A",label:"Respaldar públicamente el fichaje",intentTags:["owner","support"],primaryMessage:"Prestás tu capital público al nuevo proyecto sin controlar si la operación se cerrará.",secondaryMessage:"El respaldo puede facilitar integración o quedar como una promesa asociada a un fichaje fallido.",primaryEffects:[n("professional.institutionalPower",2),n("reputation.mediaHeat",2)],secondaryEffects:[n("professional.publicPolarization",2)]},
    {id:"B",label:"Apoyar el proyecto sin valorar nombres",intentTags:["owner","neutral"],primaryMessage:"Respaldas ambición institucional y mantienes distancia sobre una operación concreta.",secondaryMessage:"La prudencia protege opciones y puede parecer falta de entusiasmo ante el nuevo propietario.",primaryEffects:[n("professional.careerControl",3),n("professional.institutionalTrust",1)],secondaryEffects:[n("professional.institutionalTrust",-1)]},
    {id:"C",label:"Pedir primero el plan para tu rol",intentTags:["owner","role_clarity"],primaryMessage:"Separas apoyo institucional de tu necesidad de entender cómo encaja el nuevo jugador.",secondaryMessage:"Ganas información y el propietario puede interpretar la pregunta como resistencia personal.",primaryEffects:[n("professional.careerControl",4),n("professional.roleSecurity",1)],secondaryEffects:[n("professional.environmentStability",-1)]},
    {id:"D",label:"Negarte a participar en la comunicación del mercado",intentTags:["owner","boundary"],primaryMessage:"Dejas la operación en manos de dirección y proteges tu frontera con decisiones de fichajes.",secondaryMessage:"Evitas comprometerte y reduces utilidad política para la nueva propiedad.",primaryEffects:[n("professional.careerControl",4)],secondaryEffects:[n("professional.institutionalPower",-2)]}
  ],
  gates:[{path:"facts.currentClubOwnerChanged",op:"eq",value:true},{path:"facts.ownerStarProjectRequest",op:"eq",value:true}],
  weight:12,cooldown:99999,
  tags:["conditional","club_owner","a6_ready_external_blocker","needs_a1_current_club_owner_chronology_and_request","t5_41"],canonStatus:"verified"
});

const SPONSOR24=ambiguousEvent({
  id:"CEVT_24_SPONSOR_02",ageWindow:[24,25],phase:"23_26",family:"conditional",title:"La campaña envejeció mal",
  body:"Una campaña de patrocinio basada en una promesa pública anterior entra en conflicto con tu nuevo contexto de club. La marca quiere reutilizar la pieza original.",
  visible:["Conoces el contrato de campaña, la promesa pública previa y qué ha cambiado desde que se grabó."],
  uncertain:["No sabes si corregir la campaña reducirá alcance ni cómo reaccionarán marca, afición o club actual."],
  choices:[
    {id:"A",label:"Autorizar la campaña tal como estaba",intentTags:["sponsor","honor_old"],primaryMessage:"Mantienes continuidad contractual aunque el mensaje haya perdido parte de su contexto original.",secondaryMessage:"La pieza conserva valor comercial y puede parecer desconectada de tu situación actual.",primaryEffects:[n("professional.commercialPower",3),n("professional.publicPolarization",1)],secondaryEffects:[n("reputation.mediaHeat",2)]},
    {id:"B",label:"Pedir una versión actualizada",intentTags:["sponsor","update"],primaryMessage:"Intentas conservar la campaña corrigiendo lo que ya no describe tu situación.",secondaryMessage:"La actualización reduce contradicción y obliga a renegociar tiempos, costes o creatividad.",primaryEffects:[n("professional.careerControl",3),n("professional.commercialPower",2)],secondaryEffects:[n("professional.environmentStability",-1)]},
    {id:"C",label:"Retirarte de esa pieza concreta",intentTags:["sponsor","withdraw"],primaryMessage:"Proteges coherencia actual aunque renuncies a exposición y parte del valor comercial de la campaña.",secondaryMessage:"La retirada evita una contradicción pública y puede generar fricción contractual.",primaryEffects:[n("professional.careerControl",4),n("professional.commercialPower",-2)],secondaryEffects:[n("professional.institutionalTrust",-1)]},
    {id:"D",label:"Dejar que club y marca negocien una salida conjunta",intentTags:["sponsor","mediate"],primaryMessage:"Buscas una solución institucional sin afirmar que ambos intereses sean compatibles.",secondaryMessage:"La mediación puede cerrar el problema o multiplicar actores con veto.",primaryEffects:[n("professional.environmentStability",2),n("professional.careerControl",2)],secondaryEffects:[n("reputation.mediaHeat",1)]}
  ],
  gates:[
    {path:"flags.HAS_SEED_SPONSOR_IMAGE",op:"eq",value:true},
    {path:"facts.sponsorPriorPublicPromise",op:"eq",value:true},
    {path:"facts.sponsorCampaignConflictAfterClubChange",op:"eq",value:true}
  ],
  weight:12,cooldown:99999,seedsRead:["SEED_SPONSOR_IMAGE"],
  tags:["conditional","sponsor","a6_ready_external_blocker","needs_a2_prior_promise_fact_and_a1_current_club_change","t5_41"],canonStatus:"verified"
});

export const T541_STAGED_CONDITIONAL_EVENTS:EventDefinition[]=[AGENT23,CHAT24,TOURN02,OWNER24,SPONSOR24];
