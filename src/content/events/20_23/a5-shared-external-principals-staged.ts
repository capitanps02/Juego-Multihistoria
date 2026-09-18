import type { EventDefinition, SeedTransition } from "../../../core/types.js";
import { ambiguousEvent, n, seedCreate } from "../18_20/helpers.js";

const intensify = (seedId: string, intensity: number): SeedTransition => ({ seedId, action: "intensify", intensity });

/** Remaining non-agent/non-market/non-medical/non-sport owner-ready principals. */
export const A5_SHARED_EXTERNAL_PRINCIPAL_REQUIREMENTS = Object.freeze({
  EVT_21_MONEY_001: { owner:"world/family", facts:["real family debt/request","amount/provenance"], forbidden:["cash threshold as family debt"] },
  EVT_21_CCH_002: { owner:"A1/shared-coach", facts:["actual current-club coach transition","new tactical-role assignment"], forbidden:["COACH_FIRED history as current change","fixed coach after club change"] },
  EVT_22_LOCK_001: { owner:"A1/world", facts:["specific teammate sale case","salary conflict","participants","knowledge provenance"], forbidden:["lockerPower as sale fact","invented teammate"] }
});

const EVT_21_MONEY_001=ambiguousEvent({
 id:"EVT_21_MONEY_001",ageWindow:[21,21],phase:"20_23",family:"money",title:"El primer contrato que cambia a tu familia",
 body:"Una petición familiar importante llega cuando tus ingresos ya pueden resolverla. La deuda o necesidad debe ser un hecho familiar real; tener dinero no la inventa.",
 visible:["Conoces el importe solicitado y tus ingresos cuando el world/family owner lo materializa."],uncertain:["No sabes si la ayuda será puntual ni qué expectativa creará."],weight:10,
 choices:[
  {id:"PAY_ALL",label:"Pagar la deuda completa",intentTags:["family","money"],primaryMessage:"El problema inmediato desaparece y cambia el equilibrio de ayuda familiar.",secondaryMessage:"Resolverlo todo puede aliviar y también crear la expectativa de que siempre podrás hacerlo.",primaryEffects:[n("professional.moneyComfort",-6),n("rel.NPC_FAM_01.trust",5)],secondaryEffects:[n("professional.moneyComfort",-8),n("rel.NPC_FAM_02.leverage",4)],primarySeedTransitions:[seedCreate("SEED_FAMILY_MONEY",64,{stance:"pay_all"})],secondarySeedTransitions:[seedCreate("SEED_FAMILY_MONEY",70,{stance:"pay_all",dependency_risk:true})]},
  {id:"PART_LIMIT",label:"Ayudar con una parte y fijar límite",intentTags:["family","boundary"],primaryMessage:"Ayudas sin convertir tus ingresos en una obligación abierta.",secondaryMessage:"El límite protege sostenibilidad y puede sentirse frío en un momento de necesidad.",primaryEffects:[n("professional.moneyComfort",-3),n("control.career",3)],secondaryEffects:[n("rel.NPC_FAM_01.affinity",-2)],primarySeedTransitions:[seedCreate("SEED_FAMILY_MONEY",58,{stance:"partial_limit"})],secondarySeedTransitions:[seedCreate("SEED_FAMILY_MONEY",62,{stance:"partial_limit",friction:true})]},
  {id:"NO_MONEY",label:"No intervenir económicamente",intentTags:["family","autonomy"],primaryMessage:"Mantienes separadas carrera y responsabilidad económica familiar.",secondaryMessage:"La frontera preserva autonomía y puede dejar crecer un problema real.",primaryEffects:[n("control.career",4)],secondaryEffects:[n("rel.NPC_FAM_01.trust",-4)],primarySeedTransitions:[seedCreate("SEED_FAMILY_MONEY",50,{stance:"decline"})],secondarySeedTransitions:[seedCreate("SEED_FAMILY_MONEY",56,{stance:"decline",problem_persists:true})]},
  {id:"ASK_DOCUMENTS",label:"Pedir documentos y entender primero el problema",intentTags:["family","information"],primaryMessage:"Decides desde datos en vez de desde culpa o abundancia.",secondaryMessage:"La prudencia aclara el problema y puede sentirse humillante para quien pidió ayuda.",primaryEffects:[n("control.career",5)],secondaryEffects:[n("rel.NPC_FAM_02.affinity",-2)],primarySeedTransitions:[seedCreate("SEED_FAMILY_MONEY",54,{stance:"ask_documents"})],secondarySeedTransitions:[seedCreate("SEED_FAMILY_MONEY",58,{stance:"ask_documents",felt_distrusted:true})]}
 ],seedsWrite:["SEED_FAMILY_MONEY"],npcRefs:["NPC_FAM_01","NPC_FAM_02"],tags:["family","money","a5_ready_external_blocker"],canonStatus:"verified"
});

const EVT_21_CCH_002=ambiguousEvent({
 id:"EVT_21_CCH_002",ageWindow:[21,21],phase:"20_23",family:"tactical",title:"Otro entrenador, otra versión de ti",
 body:"Un cambio real de técnico trae un rol táctico distinto. La transición y el entrenador actual deben venir de autoridad de coach; no de un COACH_FIRED histórico.",
 visible:["La nueva posición y tareas son visibles cuando existe un cambio actual acreditado."],uncertain:["No sabes si el cambio durará ni cómo lo leerán scouts y mercado."],weight:10,
 choices:[
  {id:"EMBRACE",label:"Abrazar el rol",intentTags:["tactical","adapt"],primaryMessage:"Te comprometes con el perfil nuevo y das margen para que funcione.",secondaryMessage:"La adaptación puede elevar tu utilidad y reducir producción visible.",primaryEffects:[n("professional.roleAdaptability",5),n("professional.roleSecurity",3)],secondaryEffects:[n("reputation.marketHeat",-1)],primarySeedTransitions:[seedCreate("SEED_TACTICAL_SACRIFICE",58,{stance:"embrace"})],secondarySeedTransitions:[seedCreate("SEED_TACTICAL_SACRIFICE",64,{stance:"embrace",production_cost:true})]},
  {id:"FREEDOM",label:"Aceptarlo y pedir libertad en ciertos partidos",intentTags:["tactical","negotiate"],primaryMessage:"Aceptas la idea con un margen concreto para conservar fortalezas.",secondaryMessage:"La negociación puede mejorar el plan o parecer resistencia anticipada.",primaryEffects:[n("professional.roleAdaptability",4),n("control.career",3)],secondaryEffects:[n("professional.roleSecurity",-2)],primarySeedTransitions:[seedCreate("SEED_TACTICAL_SACRIFICE",60,{stance:"conditional_freedom"})],secondarySeedTransitions:[seedCreate("SEED_TACTICAL_SACRIFICE",65,{stance:"conditional_freedom",coach_friction:true})]},
  {id:"RESIST",label:"Resistirte y competir por tu perfil anterior",intentTags:["identity","resist"],primaryMessage:"Proteges el perfil que te trajo hasta aquí.",secondaryMessage:"Mantener identidad puede sostener mercado o dejarte fuera del nuevo plan.",primaryEffects:[n("control.career",4)],secondaryEffects:[n("professional.roleSecurity",-5)],primarySeedTransitions:[seedCreate("SEED_TACTICAL_SACRIFICE",68,{stance:"resist"})],secondarySeedTransitions:[seedCreate("SEED_TACTICAL_SACRIFICE",72,{stance:"resist",role_cost:true})]},
  {id:"SOUND_MARKET",label:"Pedir a tu agente que sondee mercado antes de decidir",intentTags:["agent","market"],eligibility:[{path:"facts.activeAgentNpcId",op:"exists"}],primaryMessage:"Contrastas alternativas sin convertir el sondeo en oferta.",secondaryMessage:"El movimiento aporta contexto y puede alterar confianza antes de que pruebes el nuevo rol.",primaryEffects:[n("control.career",5)],secondaryEffects:[n("professional.environmentStability",-3)],primarySeedTransitions:[seedCreate("SEED_TACTICAL_SACRIFICE",62,{stance:"sound_market"})],secondarySeedTransitions:[seedCreate("SEED_TACTICAL_SACRIFICE",68,{stance:"sound_market",trust_cost:true})]}
 ],seedsWrite:["SEED_TACTICAL_SACRIFICE"],tags:["coach_change","tactical","a5_ready_external_blocker"],canonStatus:"verified"
});

const EVT_22_LOCK_001=ambiguousEvent({
 id:"EVT_22_LOCK_001",ageWindow:[22,22],phase:"20_23",family:"team",title:"El compañero al que quieren vender",
 body:"Un compañero concreto está en una disputa salarial y parte del vestuario te pide posición. La venta, el conflicto y quién conoce qué deben ser hechos del mundo/NPC, no una lectura de lockerPower.",
 visible:["Conoces la petición y la parte de cifras colectivas realmente compartida."],uncertain:["No conoces todas sus condiciones ni la urgencia financiera real del club."],weight:10,
 choices:[
  {id:"SUPPORT",label:"Apoyar la medida",intentTags:["locker","solidarity"],primaryMessage:"Te alineas con una posición colectiva concreta.",secondaryMessage:"La solidaridad puede reforzar al grupo y tensionar tu relación institucional.",primaryEffects:[n("professional.lockerPower",5)],secondaryEffects:[n("professional.institutionalTrust",-4)],primarySeedTransitions:[seedCreate("SEED_LOCKER_VOTE",62,{stance:"support"})],secondarySeedTransitions:[seedCreate("SEED_LOCKER_VOTE",68,{stance:"support",club_cost:true})]},
  {id:"OPPOSE",label:"Oponerte y separar primas colectivas de su caso",intentTags:["locker","boundary"],primaryMessage:"Defiendes que el caso individual no decida automáticamente la política colectiva.",secondaryMessage:"La distinción puede ser razonable y leerse como ruptura de código.",primaryEffects:[n("control.career",4)],secondaryEffects:[n("professional.lockerPower",-4)],primarySeedTransitions:[seedCreate("SEED_LOCKER_VOTE",58,{stance:"oppose"})],secondarySeedTransitions:[seedCreate("SEED_LOCKER_VOTE",64,{stance:"oppose",locker_cost:true})]},
  {id:"MEETING",label:"Proponer una reunión con dirección sin amenaza",intentTags:["locker","institution"],primaryMessage:"Intentas llevar el conflicto a un canal donde ambas partes puedan aportar datos.",secondaryMessage:"La reunión puede desbloquear contexto o solo ganar tiempo para la dirección.",primaryEffects:[n("professional.lockerPower",3),n("professional.institutionalTrust",2)],secondaryEffects:[n("control.career",1)],primarySeedTransitions:[seedCreate("SEED_LOCKER_VOTE",56,{stance:"meeting"})],secondarySeedTransitions:[seedCreate("SEED_LOCKER_VOTE",60,{stance:"meeting",delay:true})]},
  {id:"MAJORITY",label:"No tomar posición y aceptar lo que decida la mayoría",intentTags:["locker","wait"],primaryMessage:"Evitas personalizar un conflicto con información incompleta.",secondaryMessage:"La neutralidad reduce exposición y también tu influencia en una decisión colectiva.",primaryEffects:[n("professional.environmentStability",2)],secondaryEffects:[n("professional.lockerPower",-2)],primarySeedTransitions:[seedCreate("SEED_LOCKER_VOTE",48,{stance:"majority"})],secondarySeedTransitions:[seedCreate("SEED_LOCKER_VOTE",52,{stance:"majority",low_influence:true})]}
 ],seedsWrite:["SEED_LOCKER_VOTE"],tags:["locker","sale_conflict","a5_ready_external_blocker"],canonStatus:"verified"
});

export const A5_SHARED_EXTERNAL_OWNER_READY_PRINCIPALS: EventDefinition[] = [
  EVT_21_MONEY_001, EVT_21_CCH_002, EVT_22_LOCK_001
];
