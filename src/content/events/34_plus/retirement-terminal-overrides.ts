import type { ChoiceDefinition, EventDefinition, OutcomeDefinition } from "../../../core/types.js";
import type { EventWithOfferBridge } from "../../../narrative/offer-bridge.js";

const n=(path:string,delta:number,min=0,max=100)=>({kind:"numeric" as const,path,delta,min,max});
const s=(path:string,value:any)=>({kind:"set" as const,path,value});
const f=(flag:string,value=true)=>({kind:"flag" as const,flag,value});
const c=(id:string,label:string,effects:any[]=[]):ChoiceDefinition=>({id,label,intentTags:[id.toLowerCase()],immediateEffects:effects,outcomeIds:[`${id}_OUT`]});
const o=(id:string,effects:any[]=[],message="La decisión queda registrada para el cierre de tu carrera."):OutcomeDefinition=>({id:`${id}_OUT`,baseWeight:1,effects,messages:[message]});
const outcomes=(choices:ChoiceDefinition[],message?:string)=>choices.map(choice=>o(choice.id,[],message));

function addSeedCreates(event:EventDefinition,byChoice:Record<string,readonly string[]>):void{
  const writes=new Set(event.seedsWrite??[]);
  for(const [choiceId,seedIds] of Object.entries(byChoice)){
    const outcome=event.outcomes.find(row=>row.id===`${choiceId}_OUT`);
    if(!outcome)throw new Error(`Missing outcome ${event.id}/${choiceId}_OUT for terminal seed producer`);
    outcome.seedTransitions=[
      ...(outcome.seedTransitions??[]),
      ...seedIds.map(seedId=>({seedId,action:"create" as const}))
    ];
    for(const seedId of seedIds)writes.add(seedId);
  }
  event.seedsWrite=[...writes];
}

function terminal(event:EventDefinition):void{
  event.tags=[...(event.tags??[]).filter(tag=>tag!=="t536_terminal"),"t536_terminal"];
}
function alias(event:EventDefinition,canonicalId:string):void{
  event.tags=[...(event.tags??[]).filter(tag=>!tag.startsWith("canonical_alias:")&&tag!=="t536_terminal"),`canonical_alias:${canonicalId}`,"t536_terminal"];
  event.canonStatus="verified";
}
function verified(event:EventDefinition):void{
  terminal(event);
  event.canonStatus="verified";
}

/**
 * T5.36 owns only the terminal retirement semantics. These overrides deliberately mutate
 * the existing catalogue objects instead of replacing the ordinary 34+ career owned by
 * the veteran-career workstream.
 *
 * IMPORTANT: several legacy IDs keep their physical ID while changing semantic identity.
 * Content migration must therefore compare frozen fingerprints/sourceContentIdentity; ID
 * equality alone is not equivalence (especially CEVT_RET_RECONSIDER and the last-match IDs).
 */
export function applyRetirementTerminalOverrides(principal:EventDefinition[],conditional:EventDefinition[]):void{
  const farewellTiming=principal.find(event=>event.id==="EVT_37_ANNOUNCE_001");
  if(farewellTiming){
    addSeedCreates(farewellTiming,Object.fromEntries(farewellTiming.choices.map(choice=>[choice.id,["SEED_FAREWELL_ANNOUNCEMENT_TIMING"]])));
    terminal(farewellTiming);
  }

  const noMarket=principal.find(event=>event.id==="EVT_38_MKT_001");
  if(noMarket){
    noMarket.ageWindow=[34,null];
    noMarket.family="market";
    noMarket.gates=[
      {path:"retirement.status",op:"eq",value:"playing"},
      {path:"flags.NO_MARKET_END_CONTEXT",op:"eq",value:true},
      {path:"flags.NO_MARKET_DECISION_PENDING",op:"eq",value:true}
    ];
    noMarket.timeWindow={months:[7,8,9]};
    noMarket.cooldown=45;
    noMarket.repeatable=true;
    noMarket.weight=8;
    noMarket.text={
      title:"Nadie llama en julio",
      body:"El contrato ha terminado y no aparece una oferta profesional compatible. El silencio del mercado es un hecho; retirarte sigue siendo una decisión tuya."
    };
    noMarket.intel={
      visible:["contrato terminado","mercado sin oferta compatible","condiciones que todavía puedes cambiar"],
      uncertain:["si aparecerá una oportunidad más tarde","qué concesión sería necesaria"]
    };
    noMarket.choices=[
      c("LOWER_PAY","Bajar tus exigencias salariales",[n("reputation.marketHeat",4),n("professional.contractPower",-5),f("VETERAN_MARKET_CONCESSION"),f("NO_MARKET_END_CONTEXT",false),f("NO_MARKET_DECISION_PENDING",false)]),
      c("LOWER_LEVEL","Aceptar buscar un nivel inferior",[n("reputation.marketHeat",6),n("professional.careerControl",-2),f("VETERAN_LEVEL_DROP_OPEN"),f("NO_MARKET_END_CONTEXT",false),f("NO_MARKET_DECISION_PENDING",false)]),
      c("WAIT_SEPTEMBER","Esperar hasta septiembre",[n("professional.motivationReserve",-2),f("VETERAN_MARKET_WAIT"),f("NO_MARKET_END_CONTEXT",false),f("NO_MARKET_DECISION_PENDING",false)]),
      c("RETIRE","Decidir retirarte",[s("retirement.status","decided"),s("retirement.reason","no_market"),f("NO_MARKET_RETIREMENT_CHOSEN"),f("NO_MARKET_END_CONTEXT",false),f("NO_MARKET_DECISION_PENDING",false)]),
      c("CALL_HOME","Llamar tú a un club concreto",[n("professional.homePull",5),n("reputation.marketHeat",2),f("VETERAN_HOME_CALL_ACTIVE"),f("NO_MARKET_END_CONTEXT",false),f("NO_MARKET_DECISION_PENDING",false)])
    ];
    noMarket.outcomes=[
      o("LOWER_PAY"),o("LOWER_LEVEL"),o("WAIT_SEPTEMBER"),
      o("RETIRE",[],"La falta de mercado se convierte en motivo de retirada únicamente porque tú tomas esa decisión."),
      o("CALL_HOME")
    ];
    terminal(noMarket);
    noMarket.canonStatus="technical_adaptation";
  }

  const family=principal.find(event=>event.id==="EVT_RET_HOME_001");
  if(family){
    family.id="EVT_RET_FAM_001";
    family.ageWindow=[34,null];
    family.family="family";
    family.gates=[{path:"retirement.status",op:"eq",value:"playing"},{path:"professional.retirementDistance",op:"gte",value:30}];
    family.repeatable=true;
    family.cooldown=540;
    family.weight=3.4;
    family.text={title:"La conversación en casa",body:"En casa hablan de lo que implicaría otra temporada. La familia puede cambiar tus prioridades, pero no decide por ti."};
    family.intel={visible:["situación familiar","cuerpo","contrato"],uncertain:["qué oportunidades existirán después"]};
    family.choices=[
      c("LAST_SEASON","Preparar una última temporada",[f("FINAL_SEASON_INTENT"),n("professional.motivationReserve",2)]),
      c("RETIRE_NOW","Decidir retirarte",[s("retirement.status","decided"),s("retirement.reason","voluntary")]),
      c("NO_DATE","Seguir sin fijar fecha",[f("RETIREMENT_NO_DATE"),n("professional.retirementDistance",-5)]),
      c("WAIT_OFFERS","Esperar ofertas antes de decidir",[f("RETIREMENT_WAITS_FOR_OFFERS"),n("professional.careerControl",1)])
    ];
    family.outcomes=outcomes(family.choices);
    addSeedCreates(family,Object.fromEntries(family.choices.map(choice=>[choice.id,["SEED_FINAL_FAMILY_CONVERSATION"]])));
    verified(family);
  }

  const body=principal.find(event=>event.id==="EVT_RET_BODY_001");
  if(body){
    body.ageWindow=[34,null];
    body.family="medical";
    body.gates=[{path:"retirement.status",op:"eq",value:"playing"},{path:"flags.LATE_BODY_REDLINE",op:"eq",value:true}];
    body.repeatable=true;
    body.cooldown=365;
    body.weight=5.2;
    body.text={title:"El cuerpo dice basta, quizá",body:"Tu estado físico entra en zona roja. El diagnóstico condiciona la decisión, pero no ejecuta la retirada por sí solo."};
    body.intel={visible:["estado físico","disponibilidad","riesgo"],uncertain:["si una rehabilitación permitirá volver a competir"]};
    body.choices=[
      c("REHAB_RETURN","Rehabilitar para intentar volver",[f("LAST_REHAB_RETURN_ATTEMPT"),n("professional.motivationReserve",-2)]),
      c("SURGERY_WAIT","Tratarte y decidir después",[f("LAST_REHAB_DECISION_DEFERRED"),n("professional.matchSelectivity",5)]),
      c("RETIRE_HEALTH","Decidir retirarte por salud",[s("retirement.status","decided"),s("retirement.reason","health"),f("HEALTH_RETIREMENT_CONTEXT")]),
      c("REHAB_HEALTH_ONLY","Rehabilitar para tu salud y dejar la competición",[s("retirement.status","decided"),s("retirement.reason","health"),f("HEALTH_FIRST_RETIREMENT")])
    ];
    body.outcomes=outcomes(body.choices);
    addSeedCreates(body,Object.fromEntries(body.choices.map(choice=>[choice.id,["SEED_LAST_REHAB_DECISION"]])));
    verified(body);
  }

  const high=principal.find(event=>event.id==="EVT_RET_HIGH_001");
  if(high){
    high.gates=[{path:"retirement.status",op:"eq",value:"playing"},{path:"flags.RETIRE_AFTER_WIN_CONTEXT",op:"eq",value:true}];
    high.repeatable=true;
    high.cooldown=365;
    high.weight=4.7;
    high.text={title:"Retirarte después de ganar",body:"Vienes de un resultado importante. Irte ahora es una opción narrativa, no una consecuencia automática de haber ganado."};
    high.choices=[
      c("RETIRE","Decidir retirarte",[s("retirement.status","decided"),s("retirement.reason","retire_on_high"),f("RETIRE_ON_HIGH")]),
      c("ONE_MORE","Seguir una temporada",[n("professional.motivationReserve",3)]),
      c("WAIT_OFFERS","Esperar ofertas",[f("RETIRE_HIGH_WAITS_FOR_OFFERS"),n("professional.careerControl",1)]),
      c("SAME_CLUB_ONLY","Seguir solo si el mismo club te quiere",[f("RETIRE_HIGH_SAME_CLUB_ONLY"),n("professional.environmentStability",2)])
    ];
    high.outcomes=outcomes(high.choices);
    addSeedCreates(high,{RETIRE:["SEED_RETIRE_ON_HIGH_CHOICE"]});
    verified(high);
  }

  const low=principal.find(event=>event.id==="EVT_RET_LOW_001");
  if(low){
    low.gates=[{path:"retirement.status",op:"eq",value:"playing"},{path:"flags.RETIRE_AFTER_LOW_CONTEXT",op:"eq",value:true}];
    low.repeatable=true;
    low.cooldown=365;
    low.weight=4.8;
    low.text={title:"Retirarte después de caer",body:"Terminas con menos peso deportivo. Puede ser el final o simplemente un contexto equivocado; la decisión sigue siendo tuya."};
    low.choices=[
      c("RETIRE","Decidir retirarte",[s("retirement.status","decided"),s("retirement.reason","retire_on_low"),f("RETIRE_ON_LOW")]),
      c("OTHER_CLUB","Buscar otro club",[f("LOW_END_SEARCH_OTHER_CLUB"),n("reputation.marketHeat",2)]),
      c("LOWER_LEVEL","Bajar de nivel",[f("VETERAN_LEVEL_DROP_OPEN"),n("professional.motivationReserve",2)]),
      c("WAIT_PRESEASON","Esperar a pretemporada",[f("LOW_END_WAIT_PRESEASON"),n("professional.careerControl",1)])
    ];
    low.outcomes=outcomes(low.choices);
    addSeedCreates(low,{
      RETIRE:["SEED_RETIRE_AFTER_LOW"],
      OTHER_CLUB:["SEED_DISCARDED_REBIRTH_FINAL"],
      LOWER_LEVEL:["SEED_DISCARDED_REBIRTH_FINAL"],
      WAIT_PRESEASON:["SEED_DISCARDED_REBIRTH_FINAL"]
    });
    verified(low);
  }

  const announce=principal.find(event=>event.id==="EVT_RET_ANNOUNCE_001");
  if(announce){
    announce.family="press";
    announce.gates=[{path:"retirement.status",op:"eq",value:"decided"}];
    announce.repeatable=true;
    announce.cooldown=14;
    announce.weight=9;
    announce.text={title:"Quién se entera primero",body:"La decisión todavía es privada. Puedes anunciarla o posponer el anuncio; hasta que sea pública sigue existiendo margen para reconsiderarla de forma explícita."};
    announce.intel={visible:["decisión privada","club","familia","canales públicos"],uncertain:["cómo reaccionará cada entorno al anuncio"]};
    announce.choices=[
      c("LOCKER_CLUB_FAMILY_PUBLIC","Vestuario → club → familia ampliada → público",[s("retirement.status","announced"),f("RETIREMENT_PUBLIC"),f("RETIREMENT_PATH_LOCKER_FIRST")]),
      c("FAMILY_CLUB_PUBLIC","Familia → club → público",[s("retirement.status","announced"),f("RETIREMENT_PUBLIC"),f("RETIREMENT_PATH_FAMILY_FIRST")]),
      c("DIRECT_VIDEO","Anunciarlo con un vídeo directo",[s("retirement.status","announced"),f("RETIREMENT_PUBLIC"),f("RETIREMENT_PATH_DIRECT_VIDEO")]),
      c("TRUSTED_JOURNALIST","Anunciarlo con un periodista de confianza",[s("retirement.status","announced"),f("RETIREMENT_PUBLIC"),f("RETIREMENT_PATH_TRUSTED_JOURNALIST")]),
      c("CLUB_ORGANIZES","Dejar que el club organice el anuncio",[s("retirement.status","announced"),f("RETIREMENT_PUBLIC"),f("RETIREMENT_PATH_CLUB")]),
      c("WAIT","No anunciarlo todavía",[f("RETIREMENT_ANNOUNCEMENT_DEFERRED"),f("RECONSIDERATION_WINDOW")])
    ];
    announce.outcomes=outcomes(announce.choices);
    addSeedCreates(announce,{
      LOCKER_CLUB_FAMILY_PUBLIC:["SEED_RETIREMENT_ANNOUNCEMENT_PATH"],
      FAMILY_CLUB_PUBLIC:["SEED_RETIREMENT_ANNOUNCEMENT_PATH"],
      DIRECT_VIDEO:["SEED_RETIREMENT_ANNOUNCEMENT_PATH"],
      TRUSTED_JOURNALIST:["SEED_RETIREMENT_ANNOUNCEMENT_PATH"],
      CLUB_ORGANIZES:["SEED_RETIREMENT_ANNOUNCEMENT_PATH"]
    });
    verified(announce);
  }

  const last=principal.find(event=>event.id==="EVT_RET_LAST_001");
  if(last){
    last.id="EVT_RET_LASTMATCH_001";
    last.family="sport";
    last.gates=[{path:"retirement.status",op:"eq",value:"announced"},{path:"flags.LAST_MATCH_WINDOW",op:"eq",value:true}];
    last.timeWindow={months:[4,5,6]};
    last.repeatable=false;
    last.cooldown=99999;
    last.weight=8;
    last.text={title:"El último partido no está garantizado",body:"Tras el anuncio, puedes expresar cómo quieres afrontar el cierre. La elección no concede minutos: el partido, el cuerpo y la decisión técnica siguen mandando."};
    last.intel={visible:["disponibilidad","rol","necesidades del equipo"],uncertain:["si habrá minutos","qué permitirá el marcador"]};
    last.choices=[
      c("REQUEST_PLAY","Pedir jugar si estás médicamente apto",[f("LAST_MATCH_REQUESTED")]),
      c("ACCEPT_TECHNICAL","Aceptar la decisión técnica",[f("LAST_MATCH_TECHNICAL_ACCEPTED")]),
      c("LIMITED_MINUTES","Pedir unos minutos solo si el marcador lo permite",[f("LAST_MATCH_LIMITED_REQUEST")]),
      c("PROTECT_BODY","No arriesgar lesión por ceremonia",[f("LAST_MATCH_BODY_FIRST")])
    ];
    last.outcomes=outcomes(last.choices,"La petición queda registrada; no fabrica aparición, minutos, gol ni resultado.");
    addSeedCreates(last,Object.fromEntries(last.choices.map(choice=>[choice.id,["SEED_LAST_MATCH_SHAPE","SEED_FAREWELL_CONTROL_FINAL"]])));
    verified(last);
  }

  const postAnnounceOffer=conditional.find(event=>event.id==="CEVT_38_OFFER_AFTER_RETIREMENT_ANNOUNCED");
  if(postAnnounceOffer){
    postAnnounceOffer.gates=[{path:"retirement.status",op:"eq",value:"announced"},{path:"flags.POST_ANNOUNCE_OFFER",op:"eq",value:true}];
    postAnnounceOffer.text={title:"Una oferta después del anuncio",body:"Existe una propuesta formal materializada después de que la retirada se hiciera pública. Puedes aplazarla o rechazarla, pero el anuncio no se deshace."};
    postAnnounceOffer.intel={visible:["CareerOffer formal pendiente","retirada ya anunciada"],uncertain:["cómo se interpretará haberla escuchado"]};
    postAnnounceOffer.choices=[
      c("ACKNOWLEDGE","Escucharla sin reabrir la retirada",[f("POST_ANNOUNCE_OFFER",false),f("RECONSIDERATION_WINDOW",false)]),
      c("DECLINE","Rechazarla y mantener el anuncio",[f("POST_ANNOUNCE_OFFER",false),f("RECONSIDERATION_WINDOW",false)])
    ];
    postAnnounceOffer.outcomes=outcomes(postAnnounceOffer.choices,"El estado permanece announced y la oferta se cierra mediante la autoridad CareerOffer.");
    (postAnnounceOffer as EventWithOfferBridge).offerBridge={choiceActions:{ACKNOWLEDGE:"defer",DECLINE:"reject"}};
    terminal(postAnnounceOffer);
    postAnnounceOffer.canonStatus="technical_adaptation";
  }

  const reconsider=conditional.find(event=>event.id==="CEVT_RET_RECONSIDER");
  if(reconsider){
    reconsider.gates=[
      {path:"retirement.status",op:"eq",value:"decided"},
      {path:"flags.RECONSIDERATION_WINDOW",op:"eq",value:true},
      {path:"flags.RETIREMENT_ANNOUNCEMENT_DEFERRED",op:"eq",value:true}
    ];
    reconsider.text={title:"Todavía no lo has anunciado",body:"La decisión sigue siendo privada. Si quieres continuar, este es el momento de cambiarla explícitamente; después del anuncio ya no habrá vuelta silenciosa."};
    reconsider.intel={visible:["decisión privada","anuncio pospuesto"],uncertain:["cómo cambiarán mercado, rol y cuerpo si continúas"]};
    reconsider.choices=[
      c("RETURN","Reconsiderar y seguir jugando",[s("retirement.status","playing"),f("RETIREMENT_RECONSIDERATION_REASON")]),
      c("KEEP","Mantener la decisión y preparar el anuncio",[f("RECONSIDERATION_WINDOW",false),f("RETIREMENT_ANNOUNCEMENT_DEFERRED",false)])
    ];
    reconsider.outcomes=outcomes(reconsider.choices,"La reconsideración solo existe antes del anuncio público.");
    terminal(reconsider);
    reconsider.canonStatus="technical_adaptation";
  }

  const noLastMatch=conditional.find(event=>event.id==="CEVT_RET_NO_LAST_MATCH");
  if(noLastMatch){
    noLastMatch.gates=[
      {path:"retirement.status",op:"eq",value:"announced"},
      {path:"retirement.daysInStatus",op:"gte",value:60},
      {path:"flags.LAST_MATCH_PLAYED",op:"neq",value:true}
    ];
    noLastMatch.text={title:"No habrá un último partido ceremonial",body:"La retirada sigue adelante y la simulación no ha registrado una aparición posterior al anuncio. La carrera puede cerrarse sin inventar una despedida sobre el césped."};
    noLastMatch.choices=[
      c("ACCEPT","Aceptar el cierre sin aparición",[s("retirement.status","closed"),s("retirement.closureType","no_last_match")]),
      c("PRIVATE_FAREWELL","Cerrar la etapa sin ceremonia deportiva",[s("retirement.status","closed"),s("retirement.closureType","no_last_match"),f("FAREWELL_PRIVATE")])
    ];
    noLastMatch.outcomes=outcomes(noLastMatch.choices,"La carrera se cierra administrativamente sin fabricar un partido.");
    verified(noLastMatch);
  }

  const storybook=conditional.find(event=>event.id==="CEVT_RET_STORYBOOK_LAST_GOAL");
  if(storybook){
    storybook.gates=[
      {path:"retirement.status",op:"eq",value:"announced"},
      {path:"flags.LAST_MATCH_PLAYED",op:"eq",value:true},
      {path:"flags.LAST_MATCH_GOAL_FACT",op:"eq",value:true}
    ];
    storybook.text={title:"El último gol ocurrió de verdad",body:"El sistema de partido ha registrado un gol en una aparición posterior al anuncio. Esta escena solo reconoce ese hecho; nunca lo crea."};
    storybook.intel={visible:["aparición registrada","gol registrado por el sistema de partido"],uncertain:["cómo se recordará el cierre"]};
    storybook.choices=[
      c("ACKNOWLEDGE","Cerrar la carrera con ese hecho registrado",[s("retirement.status","closed"),s("retirement.closureType","last_match_goal_factual")]),
      c("TEAM","Cerrar sin convertir el gol en ceremonia",[s("retirement.status","closed"),s("retirement.closureType","last_match_goal_factual"),f("FAREWELL_TEAM_FIRST")])
    ];
    storybook.outcomes=outcomes(storybook.choices,"El cierre conserva un gol que ya existía como hecho de simulación.");
    terminal(storybook);
    storybook.canonStatus="technical_adaptation";
  }
}
