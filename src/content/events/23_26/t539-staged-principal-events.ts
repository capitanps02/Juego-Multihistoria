import type { EventDefinition, SeedTransition } from "../../../core/types.js";
import { ambiguousEvent, n, seedCreate } from "../18_20/helpers.js";

const transformSeed=(seedId:string,payload:Record<string,string|number|boolean|null>):SeedTransition=>({seedId,action:"transform",payload});

const MATCH24=ambiguousEvent({
  id:"EVT_24_MATCH_001",ageWindow:[24,24],phase:"23_26",family:"sport",title:"El penalti",
  body:"El lanzador designado falla un penalti. Cuando llega otro, tú coges el balón y él reclama que le toca: la jerarquía existe, pero el siguiente lanzamiento todavía no tiene dueño.",
  visible:["Conoces la orden previa, el marcador, el minuto, quién falló el penalti anterior y quién está autorizado para lanzar."],
  uncertain:["No sabes si el técnico toleraría cambiar el lanzador ni cómo responderá el compañero después. El resultado del nuevo penalti no depende de esta elección narrativa."],
  choices:[
    {id:"A",label:"Entregarle el balón",intentTags:["penalty","hierarchy","cede"],primaryMessage:"Respetas la jerarquía previa y dejas que el lanzador designado vuelva a asumir la responsabilidad.",secondaryMessage:"Ceder evita una disputa inmediata, pero no garantiza gratitud ni resuelve por sí solo la relación competitiva.",primaryEffects:[n("professional.lockerPower",2),n("professional.environmentStability",2)],secondaryEffects:[n("professional.lockerPower",1)],primarySeedTransitions:[seedCreate("SEED_PENALTY_HIERARCHY",64,{decision24:"cede"})],secondarySeedTransitions:[seedCreate("SEED_PENALTY_HIERARCHY",58,{decision24:"cede"})]},
    {id:"B",label:"Decir que lo tiras tú",intentTags:["penalty","claim","responsibility"],primaryMessage:"Reclamas el lanzamiento y haces visible que interpretas la situación como una nueva decisión de jerarquía.",secondaryMessage:"La petición puede ser aceptada o discutida; incluso si terminas lanzando, marcar o fallar pertenece al resolver futbolístico autorizado.",primaryEffects:[n("professional.careerControl",3),n("professional.publicPolarization",1)],secondaryEffects:[n("professional.lockerPower",-2),n("professional.publicPolarization",2)],primarySeedTransitions:[seedCreate("SEED_PENALTY_HIERARCHY",68,{decision24:"claim"})],secondarySeedTransitions:[seedCreate("SEED_PENALTY_HIERARCHY",72,{decision24:"claim"})]},
    {id:"C",label:"Preguntar al capitán o técnico desde el campo",intentTags:["penalty","authority","clarify"],primaryMessage:"Pides una decisión explícita a la autoridad deportiva disponible antes de lanzar.",secondaryMessage:"La consulta reduce ambigüedad, aunque puede hacer visible un conflicto que hasta ese momento era interno.",primaryEffects:[n("professional.careerControl",2),n("professional.institutionalTrust",2)],secondaryEffects:[n("professional.environmentStability",1)],primarySeedTransitions:[seedCreate("SEED_PENALTY_HIERARCHY",61,{decision24:"ask_authority"})],secondarySeedTransitions:[seedCreate("SEED_PENALTY_HIERARCHY",57,{decision24:"ask_authority"})]},
    {id:"D",label:"Proponer decidirlo con una regla rápida entre ambos",intentTags:["penalty","shared_rule","team"],primaryMessage:"Intentas convertir la disputa en una regla verificable entre los dos sin fabricar el resultado deportivo.",secondaryMessage:"El acuerdo puede proteger la convivencia o parecer una negociación impropia en pleno partido.",primaryEffects:[n("professional.lockerPower",2),n("professional.careerControl",2)],secondaryEffects:[n("professional.environmentStability",1),n("professional.publicPolarization",1)],primarySeedTransitions:[seedCreate("SEED_PENALTY_HIERARCHY",63,{decision24:"shared_rule"})],secondarySeedTransitions:[seedCreate("SEED_PENALTY_HIERARCHY",59,{decision24:"shared_rule"})]}
  ],
  gates:[{path:"facts.penaltyHierarchyMoment",op:"eq",value:true}],
  timeWindow:{months:[9,10,11,2,3]},weight:20,cooldown:99999,
  seedsWrite:["SEED_PENALTY_HIERARCHY"],
  tags:["sport","penalty","a6_ready_external_blocker","needs_a4_fixture_appearance_designated_taker_prior_miss_score_minute_profile_and_penalty_resolver","t5_39"],
  canonStatus:"verified"
});

const AGT25=ambiguousEvent({
  id:"EVT_25_AGT_001",ageWindow:[25,25],phase:"23_26",family:"agent",title:"El correo reenviado",
  body:"Una cadena de correos demuestra que existió interés concreto de un club que tu agente nunca te comunicó. Él sostiene que nunca llegó a oferta formal.",
  visible:["Ves fecha, remitente, contenido del contacto y qué agente estaba gestionando tu carrera en ese momento."],
  uncertain:["No sabes si el interés habría terminado en oferta ni qué otros contactos fueron descartados legítimamente por rutina."],
  choices:[
    {id:"A",label:"Romper con el agente",intentTags:["agent","break"],primaryMessage:"Tratas la omisión demostrada como una ruptura de gobernanza y cierras la relación de representación.",secondaryMessage:"Recuperas control inmediato y pierdes una red y una relación que todavía podían aportar valor.",primaryEffects:[n("professional.agentControl",8),n("professional.environmentStability",-4)],secondaryEffects:[n("professional.careerControl",4),n("reputation.marketHeat",-1)],primarySeedTransitions:[seedCreate("SEED_AGENT_PROOF",76,{decision25:"break",evidence:"omitted_contact"})],secondarySeedTransitions:[seedCreate("SEED_AGENT_PROOF",72,{decision25:"break",evidence:"omitted_contact"})]},
    {id:"B",label:"Exigir acceso a todo contacto futuro y seguir",intentTags:["agent","transparency"],primaryMessage:"Mantienes la representación, pero conviertes la transparencia de contactos en una condición explícita.",secondaryMessage:"La gobernanza mejora si se cumple; también aumenta fricción y carga de información.",primaryEffects:[n("professional.agentControl",5),n("professional.careerControl",4)],secondaryEffects:[n("professional.environmentStability",-1),n("professional.agentControl",3)],primarySeedTransitions:[seedCreate("SEED_AGENT_PROOF",72,{decision25:"full_visibility",evidence:"omitted_contact"})],secondarySeedTransitions:[seedCreate("SEED_AGENT_PROOF",68,{decision25:"full_visibility",evidence:"omitted_contact"})]},
    {id:"C",label:"Pedir explicación documental antes de decidir",intentTags:["agent","evidence"],primaryMessage:"Pides reconstruir por qué el contacto se descartó antes de juzgar la relación completa.",secondaryMessage:"La explicación puede justificar parte del proceso o revelar que el problema era mayor de lo que parecía.",primaryEffects:[n("professional.careerControl",5),n("professional.agentControl",2)],secondaryEffects:[n("professional.environmentStability",-1),n("professional.careerControl",3)],primarySeedTransitions:[seedCreate("SEED_AGENT_PROOF",70,{decision25:"document_review",evidence:"omitted_contact"})],secondarySeedTransitions:[seedCreate("SEED_AGENT_PROOF",74,{decision25:"document_review",evidence:"omitted_contact"})]},
    {id:"D",label:"Usar la información para renegociar comisión o representación",intentTags:["agent","renegotiate"],primaryMessage:"Conviertes la omisión en una negociación sobre incentivos, comisión y reglas de representación.",secondaryMessage:"El nuevo equilibrio puede ser más sano o transformar una relación de confianza en una relación puramente contractual.",primaryEffects:[n("professional.contractPower",4),n("professional.agentControl",4)],secondaryEffects:[n("professional.environmentStability",-2),n("professional.careerControl",2)],primarySeedTransitions:[seedCreate("SEED_AGENT_PROOF",74,{decision25:"renegotiate_terms",evidence:"omitted_contact"})],secondarySeedTransitions:[seedCreate("SEED_AGENT_PROOF",70,{decision25:"renegotiate_terms",evidence:"omitted_contact"})]}
  ],
  gates:[{path:"facts.activeAgentOmissionEvidence",op:"eq",value:true}],
  gateAlternatives:[
    [{path:"flags.HAS_SEED_AGENT_OMISSION",op:"eq",value:true}],
    [{path:"professional.agentControl",op:"gte",value:55}]
  ],
  timeWindow:{months:[10,11,12,1]},weight:18,cooldown:99999,
  seedsRead:["SEED_AGENT_OMISSION"],seedsWrite:["SEED_AGENT_PROOF"],
  npcRefs:["NPC_AGT_01","NPC_AGT_02"],
  tags:["agent","governance","a6_ready_external_blocker","needs_a1_certified_active_agent_identity_and_omission_evidence","t5_39"],
  canonStatus:"verified"
});

const NAT25=ambiguousEvent({
  id:"EVT_25_NAT_001",ageWindow:[25,25],phase:"23_26",family:"selection",title:"No eres titular aquí",
  body:"Sanz te considera parte estable de su grupo, pero otro jugador parte por delante en tu posición mientras tu club te presenta públicamente como internacional importante.",
  visible:["Conoces tu rol comunicado en la convocatoria actual y quién compite directamente por la posición."],
  uncertain:["No sabes si una lesión, un cambio táctico o el siguiente partido alterarán la jerarquía."],
  choices:[
    {id:"A",label:"Aceptar rol sin ruido",intentTags:["national","accept_role"],primaryMessage:"Aceptas la jerarquía actual y te concentras en estar disponible para el rol que te toque.",secondaryMessage:"La fiabilidad puede consolidarte en el grupo y no garantiza que avances en la jerarquía.",primaryEffects:[n("professional.nationalPower",2),n("professional.environmentStability",2)],secondaryEffects:[n("professional.nationalStanding",1)],primarySeedTransitions:[transformSeed("SEED_FIRST_ABSOLUTE_CALL",{age25Role:"accept_nonstarter"})],secondarySeedTransitions:[transformSeed("SEED_FIRST_ABSOLUTE_CALL",{age25Role:"accept_nonstarter"})]},
    {id:"B",label:"Preguntar qué debes cambiar para adelantarle",intentTags:["national","role_feedback"],primaryMessage:"Pides criterios deportivos concretos para competir por el puesto.",secondaryMessage:"Obtienes una referencia útil, pero el seleccionador no convierte esa conversación en una promesa de titularidad.",primaryEffects:[n("professional.careerControl",3),n("professional.nationalPower",2)],secondaryEffects:[n("professional.nationalStanding",1)],primarySeedTransitions:[transformSeed("SEED_FIRST_ABSOLUTE_CALL",{age25Role:"ask_feedback"})],secondarySeedTransitions:[transformSeed("SEED_FIRST_ABSOLUTE_CALL",{age25Role:"ask_feedback"})]},
    {id:"C",label:"Pedir probar otra posición",intentTags:["national","adapt_role"],primaryMessage:"Buscas otra vía de minutos sin afirmar que el nuevo rol vaya a encajar.",secondaryMessage:"La adaptación puede abrir espacio o diluir la identidad que te llevó a la selección.",primaryEffects:[n("professional.roleAdaptability",4),n("professional.nationalPower",1)],secondaryEffects:[n("professional.roleSecurity",-1),n("professional.roleAdaptability",2)],primarySeedTransitions:[transformSeed("SEED_FIRST_ABSOLUTE_CALL",{age25Role:"try_other_position"})],secondarySeedTransitions:[transformSeed("SEED_FIRST_ABSOLUTE_CALL",{age25Role:"try_other_position"})]},
    {id:"D",label:"Dejar que tu agente use el estatus internacional en mercado aunque juegues poco",intentTags:["national","market_status"],primaryMessage:"Permites que tu condición de internacional forme parte del relato de mercado sin afirmar que seas titular.",secondaryMessage:"El estatus puede mejorar percepción comercial y aumentar la distancia entre relato público y rol real.",primaryEffects:[n("reputation.marketHeat",3),n("professional.publicPolarization",1)],secondaryEffects:[n("reputation.mediaHeat",2),n("professional.careerControl",1)],primarySeedTransitions:[transformSeed("SEED_FIRST_ABSOLUTE_CALL",{age25Role:"market_status"})],secondarySeedTransitions:[transformSeed("SEED_FIRST_ABSOLUTE_CALL",{age25Role:"market_status"})]}
  ],
  gates:[
    {path:"flags.HAS_SEED_FIRST_ABSOLUTE_CALL",op:"eq",value:true},
    {path:"professional.nationalCaps",op:"gte",value:2},
    {path:"facts.currentNationalSquadNonStarterRole",op:"eq",value:true}
  ],
  timeWindow:{months:[9,10,11,3,4,5]},weight:18,cooldown:99999,
  seedsRead:["SEED_FIRST_ABSOLUTE_CALL"],seedsWrite:["SEED_FIRST_ABSOLUTE_CALL"],
  tags:["selection","national_role","a6_ready_external_blocker","needs_concrete_current_squad_role_not_standing_or_history_proxy","t5_39"],
  canonStatus:"verified"
});

export const T539_STAGED_PRINCIPAL_EVENTS:EventDefinition[]=[MATCH24,AGT25,NAT25];
