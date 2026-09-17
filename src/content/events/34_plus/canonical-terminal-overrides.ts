import type { ChoiceDefinition, EventDefinition, OutcomeDefinition } from "../../../core/types.js";

const n=(path:string,delta:number,min=0,max=100)=>({kind:"numeric" as const,path,delta,min,max});
const s=(path:string,value:any)=>({kind:"set" as const,path,value});
const f=(flag:string,value=true)=>({kind:"flag" as const,flag,value});
const c=(id:string,label:string,effects:any[]=[]):ChoiceDefinition=>({id,label,intentTags:[id.toLowerCase()],immediateEffects:effects,outcomeIds:[`${id}_OUT`]});
const o=(id:string,effects:any[]=[],message="La decisión queda registrada para el cierre de tu carrera."):OutcomeDefinition=>({id:`${id}_OUT`,baseWeight:1,effects,messages:[message]});
const outcomes=(choices:ChoiceDefinition[],message?:string)=>choices.map(choice=>o(choice.id,[],message));

function alias(event:EventDefinition,canonicalId:string):void{
  event.tags=[...(event.tags??[]).filter(tag=>!tag.startsWith("canonical_alias:")),`canonical_alias:${canonicalId}`,"t51_canonical"];
  event.canonStatus="verified";
}
function verified(event:EventDefinition):void{
  event.tags=[...(event.tags??[]).filter(tag=>tag!=="t51_canonical"),"t51_canonical"];
  event.canonStatus="verified";
}

/**
 * T5.1 preserves legacy catalogue IDs where changing identity would create a save/content
 * migration problem. Only identities that are unambiguous in the Documento Maestro are
 * repaired here. Broader 34+ content stays explicitly unreconciled for later T5 batches.
 */
export function applyCanonical34PlusTerminalOverrides(principal:EventDefinition[],conditional:EventDefinition[]):void{
  const noMarket=principal.find(event=>event.id==="EVT_38_MKT_001");
  if(noMarket){
    noMarket.ageWindow=[37,null];
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
      body:"Termina tu contrato y pasan semanas sin una oferta profesional que cumpla tus condiciones. El silencio es real, pero todavía puedes decidir qué concesiones estás dispuesto a hacer y cuánto quieres esperar."
    };
    noMarket.intel={
      visible:["contrato terminado","silencio real del mercado","contactos informales"],
      uncertain:["si aparecerá una lesión o necesidad en agosto","si el mercado ya se ha terminado para tus condiciones actuales"]
    };
    noMarket.choices=[
      c("LOWER_PAY","Bajar tus exigencias salariales",[n("reputation.marketHeat",4),n("professional.contractPower",-5),f("VETERAN_MARKET_CONCESSION"),f("NO_MARKET_END_CONTEXT",false),f("NO_MARKET_DECISION_PENDING",false)]),
      c("LOWER_LEVEL","Aceptar buscar un nivel inferior",[n("reputation.marketHeat",6),n("professional.careerControl",-2),f("VETERAN_LEVEL_DROP_OPEN"),f("NO_MARKET_END_CONTEXT",false),f("NO_MARKET_DECISION_PENDING",false)]),
      c("WAIT_SEPTEMBER","Esperar hasta septiembre",[n("professional.motivationReserve",-2),f("VETERAN_MARKET_WAIT"),f("NO_MARKET_END_CONTEXT",false),f("NO_MARKET_DECISION_PENDING",false)]),
      c("RETIRE","Retirarte",[s("retirement.status","decided"),s("retirement.reason","no_market"),f("NO_MARKET_RETIREMENT_CHOSEN"),f("NO_MARKET_END_CONTEXT",false),f("NO_MARKET_DECISION_PENDING",false)]),
      c("CALL_HOME","Llamar tú a Valdoria u otro club concreto",[n("professional.homePull",5),n("reputation.marketHeat",2),f("VETERAN_HOME_CALL_ACTIVE"),f("NO_MARKET_END_CONTEXT",false),f("NO_MARKET_DECISION_PENDING",false)])
    ];
    noMarket.outcomes=[
      o("LOWER_PAY"),o("LOWER_LEVEL"),o("WAIT_SEPTEMBER"),
      o("RETIRE",[],"La falta de mercado se convierte en retirada porque tú decides que ya no quieres seguir ampliando las condiciones de búsqueda."),
      o("CALL_HOME")
    ];
    alias(noMarket,"EVT_38_MARKET_001");
  }

  const family=principal.find(event=>event.id==="EVT_RET_HOME_001");
  if(family){
    family.ageWindow=[34,null]; family.family="family";
    family.gates=[{path:"retirement.status",op:"eq",value:"playing"},{path:"professional.retirementDistance",op:"gte",value:30}];
    // This is a life conversation, not a one-shot collectible. If the player defers or
    // reconsiders before announcement, the question may honestly return in a later season.
    family.repeatable=true; family.cooldown=540; family.weight=3.4;
    family.text={title:"La conversación en casa",body:"Tras una temporada exigente, en casa te preguntan qué te queda por conseguir realmente. La conversación cambia prioridades; no dicta el final."};
    family.intel={visible:["estado familiar","cuerpo","objetivos visibles"],uncertain:["si una buena pretemporada te hará cambiar de idea"]};
    family.choices=[
      c("LAST_SEASON","Preparar una última temporada",[f("FINAL_SEASON_INTENT"),n("professional.motivationReserve",2)]),
      c("RETIRE_NOW","Retirarte ahora",[s("retirement.status","decided"),s("retirement.reason","voluntary")]),
      c("NO_DATE","Seguir sin fecha",[f("RETIREMENT_NO_DATE"),n("professional.retirementDistance",-5)]),
      c("WAIT_OFFERS","Esperar ofertas antes de decidir",[f("RETIREMENT_WAITS_FOR_OFFERS"),n("professional.careerControl",1)])
    ];
    family.outcomes=outcomes(family.choices);
    alias(family,"EVT_RET_FAM_001");
  }

  const body=principal.find(event=>event.id==="EVT_RET_BODY_001");
  if(body){
    body.ageWindow=[36,null];
    body.family="medical";
    body.gates=[
      {path:"retirement.status",op:"eq",value:"playing"},
      {path:"flags.LATE_BODY_REDLINE",op:"eq",value:true}
    ];
    // Chronic physical redlines can recur without requiring a fabricated long-injury fact.
    // A long cooldown avoids spam while preserving a new decision after rehab/pre-announcement reconsideration.
    body.repeatable=true; body.cooldown=365; body.weight=5.2;
    body.text={title:"El cuerpo dice basta, quizá",body:"Tu estado físico vuelve a entrar en zona roja. Recuperarte para la vida diaria y volver a competir ya no son la misma decisión."};
    body.intel={visible:["estado físico","disponibilidad","riesgos cualitativos"],uncertain:["si volverás al nivel necesario","si el mercado esperará"]};
    body.choices=[
      c("REHAB_RETURN","Rehabilitar para volver",[f("LAST_REHAB_RETURN_ATTEMPT"),n("professional.motivationReserve",-2)]),
      c("SURGERY_WAIT","Tratarte y decidir después",[f("LAST_REHAB_DECISION_DEFERRED"),n("professional.matchSelectivity",5)]),
      c("RETIRE_HEALTH","Retirarte",[s("retirement.status","decided"),s("retirement.reason","health"),f("HEALTH_RETIREMENT_CONTEXT")]),
      c("REHAB_HEALTH_ONLY","Rehabilitar solo para tu salud, no para competir",[s("retirement.status","decided"),s("retirement.reason","health"),f("HEALTH_FIRST_RETIREMENT")])
    ];
    body.outcomes=outcomes(body.choices);
    verified(body);
  }

  const high=principal.find(event=>event.id==="EVT_RET_HIGH_001");
  if(high){
    high.gates=[{path:"retirement.status",op:"eq",value:"playing"},{path:"flags.RETIRE_AFTER_WIN_CONTEXT",op:"eq",value:true}];
    high.repeatable=true; high.cooldown=365; high.weight=4.7;
    high.text={title:"Retirarte después de ganar",body:"Acabas de cerrar una temporada excelente. Irse arriba es una narrativa posible, no una obligación."};
    high.intel={visible:["forma reciente","éxito deportivo","contrato","mercado"],uncertain:["si el próximo año será mejor, peor o simplemente distinto"]};
    high.choices=[
      c("RETIRE","Retirarte",[s("retirement.status","decided"),s("retirement.reason","retire_on_high"),f("RETIRE_ON_HIGH")]),
      c("ONE_MORE","Seguir un año",[n("professional.motivationReserve",3)]),
      c("WAIT_OFFERS","Esperar ofertas",[f("RETIRE_HIGH_WAITS_FOR_OFFERS"),n("professional.careerControl",1)]),
      c("SAME_CLUB_ONLY","Seguir solo si el mismo club te quiere",[f("RETIRE_HIGH_SAME_CLUB_ONLY"),n("professional.environmentStability",2)])
    ];
    high.outcomes=outcomes(high.choices);
    verified(high);
  }

  const low=principal.find(event=>event.id==="EVT_RET_LOW_001");
  if(low){
    low.gates=[{path:"retirement.status",op:"eq",value:"playing"},{path:"flags.RETIRE_AFTER_LOW_CONTEXT",op:"eq",value:true}];
    low.repeatable=true; low.cooldown=365; low.weight=4.8;
    low.text={title:"Retirarte después de caer",body:"Terminas con pocos minutos y sensación de desconexión. Una mala temporada puede ser el final o solo el contexto equivocado."};
    low.intel={visible:["minutos","feedback","mercado inicial"],uncertain:["si estás acabado o simplemente en el club equivocado"]};
    low.choices=[
      c("RETIRE","Retirarte",[s("retirement.status","decided"),s("retirement.reason","retire_on_low"),f("RETIRE_ON_LOW")]),
      c("OTHER_CLUB","Buscar otro club",[f("LOW_END_SEARCH_OTHER_CLUB"),n("reputation.marketHeat",2)]),
      c("LOWER_LEVEL","Bajar nivel",[f("VETERAN_LEVEL_DROP_OPEN"),n("professional.motivationReserve",2)]),
      c("WAIT_PRESEASON","Esperar a pretemporada",[f("LOW_END_WAIT_PRESEASON"),n("professional.careerControl",1)])
    ];
    low.outcomes=outcomes(low.choices);
    verified(low);
  }

  const announce=principal.find(event=>event.id==="EVT_RET_ANNOUNCE_001");
  if(announce){
    announce.family="press";
    announce.gates=[{path:"retirement.status",op:"eq",value:"decided"}];
    announce.repeatable=false; announce.cooldown=99999; announce.weight=7.2;
    announce.text={title:"Quién se entera primero",body:"Has decidido retirarte. Falta decidir cómo comunicarlo y quién recibe la noticia antes de que se convierta en relato público."};
    announce.intel={visible:["relaciones","club","canales disponibles"],uncertain:["qué filtraciones ocurrirán aunque intentes controlar el orden"]};
    announce.choices=[
      c("LOCKER_CLUB_FAMILY_PUBLIC","Vestuario → club → familia ampliada → público",[s("retirement.status","announced"),f("RETIREMENT_PATH_LOCKER_FIRST")]),
      c("FAMILY_CLUB_PUBLIC","Familia → club → público",[s("retirement.status","announced"),f("RETIREMENT_PATH_FAMILY_FIRST")]),
      c("DIRECT_VIDEO","Vídeo directo sin exclusiva",[s("retirement.status","announced"),f("RETIREMENT_PATH_DIRECT_VIDEO")]),
      c("TRUSTED_JOURNALIST","Entrevista con periodista de confianza",[s("retirement.status","announced"),f("RETIREMENT_PATH_TRUSTED_JOURNALIST")]),
      c("CLUB_ORGANIZES","Dejar al club organizar",[s("retirement.status","announced"),f("RETIREMENT_PATH_CLUB")])
    ];
    announce.outcomes=outcomes(announce.choices);
    verified(announce);
  }

  const last=principal.find(event=>event.id==="EVT_RET_LAST_001");
  if(last){
    last.family="sport";
    last.gates=[{path:"retirement.status",op:"eq",value:"announced"},{path:"flags.LAST_MATCH_WINDOW",op:"eq",value:true}];
    last.timeWindow={months:[4,5,6]}; last.repeatable=false; last.cooldown=99999; last.weight=8;
    last.text={title:"El último partido no está garantizado",body:"Tras anunciar la retirada, una molestia, una sanción, la decisión técnica o el contexto competitivo ponen en duda que juegues el último partido."};
    last.intel={visible:["disponibilidad","necesidades del equipo","decisión técnica"],uncertain:["si forzar la escena perjudicará al equipo","si habrá otra oportunidad"]};
    last.choices=[
      c("REQUEST_PLAY","Pedir jugar si estás médicamente apto",[f("LAST_MATCH_REQUESTED")]),
      c("ACCEPT_TECHNICAL","Aceptar la decisión técnica",[f("LAST_MATCH_TECHNICAL_ACCEPTED")]),
      c("LIMITED_MINUTES","Pedir unos minutos solo si el marcador lo permite",[f("LAST_MATCH_LIMITED_REQUEST")]),
      c("PROTECT_BODY","No arriesgar lesión por ceremonia",[f("LAST_MATCH_BODY_FIRST")])
    ];
    last.outcomes=outcomes(last.choices,"El último partido sigue dependiendo del fútbol real; esta elección no fabrica el cierre.");
    alias(last,"EVT_RET_LASTMATCH_001");
  }

  // A late offer may still be narrated after the announcement, but the announcement itself
  // is not reopened. This conditional therefore cannot create a reconsideration window.
  const postAnnounceOffer=conditional.find(event=>event.id==="CEVT_38_OFFER_AFTER_RETIREMENT_ANNOUNCED");
  if(postAnnounceOffer){
    postAnnounceOffer.text={
      title:"Una oferta después del anuncio",
      body:"Llega una propuesta cuando tu retirada ya es pública. Puedes escucharla o rechazarla, pero el anuncio no vuelve a convertirse en una decisión privada."
    };
    postAnnounceOffer.intel={visible:["oferta real","retirada anunciada"],uncertain:["qué lectura pública tendrá haberla escuchado"]};
    postAnnounceOffer.choices=[
      c("ACKNOWLEDGE","Escuchar la propuesta sin reabrir la retirada",[f("POST_ANNOUNCE_OFFER",false),f("RECONSIDERATION_WINDOW",false)]),
      c("DECLINE","Rechazarla y mantener el cierre anunciado",[f("POST_ANNOUNCE_OFFER",false),f("RECONSIDERATION_WINDOW",false)])
    ];
    postAnnounceOffer.outcomes=outcomes(postAnnounceOffer.choices,"La retirada sigue anunciada; una oferta tardía no reabre la máquina de estados.");
    postAnnounceOffer.tags=[...(postAnnounceOffer.tags??[]).filter(tag=>tag!=="t51_canon_guard"),"t51_canon_guard"];
    postAnnounceOffer.canonStatus="technical_adaptation";
  }

  // Compatibility cleanup for a stale RECONSIDERATION_WINDOW from pre-fix sessions on this
  // branch. Both responses consume the stale flag but neither offers announced -> playing.
  const reconsider=conditional.find(event=>event.id==="CEVT_RET_RECONSIDER");
  if(reconsider){
    reconsider.text={
      title:"El anuncio ya es firme",
      body:"La duda puede existir y una oferta puede llegar, pero una retirada ya anunciada no se reabre sin una escena canónica que lo autorice."
    };
    reconsider.intel={visible:["retirada ya anunciada"],uncertain:["cómo terminará la despedida deportiva"]};
    reconsider.choices=[
      c("CONFIRM","Confirmar que mantienes la retirada anunciada",[f("RECONSIDERATION_WINDOW",false),f("POST_ANNOUNCE_OFFER",false)]),
      c("ACKNOWLEDGE_DOUBT","Admitir la duda sin retirar el anuncio",[f("RECONSIDERATION_WINDOW",false),f("POST_ANNOUNCE_OFFER",false),f("POST_ANNOUNCE_DOUBT_ACKNOWLEDGED")])
    ];
    reconsider.outcomes=outcomes(reconsider.choices,"El estado permanece announced y continúa hacia su cierre normal.");
    reconsider.tags=[...(reconsider.tags??[]).filter(tag=>tag!=="t51_canon_guard"),"t51_canon_guard"];
    reconsider.canonStatus="technical_adaptation";
  }

  const lastWindow=conditional.find(event=>event.id==="CEVT_RET_STORYBOOK_LAST_GOAL");
  if(lastWindow){
    lastWindow.text={
      title:"La última ventana",
      body:"Hay una posibilidad real de jugar una última vez, pero ni los minutos ni un final perfecto están escritos de antemano."
    };
    lastWindow.intel={
      visible:["retirada anunciada","último partido plausible"],
      uncertain:["si entrarás","qué permitirá el marcador","si habrá una escena memorable"]
    };
    lastWindow.choices=[
      {id:"PLAY",label:"Pedir jugar si el partido lo permite",intentTags:["play"],outcomeIds:["PLAYED_OUT","NO_APPEARANCE_OUT"]},
      {id:"TEAM",label:"Aceptar que el equipo decida sin fabricar una despedida",intentTags:["team"],outcomeIds:["TEAM_OUT"]}
    ];
    lastWindow.outcomes=[
      {id:"PLAYED_OUT",baseWeight:3,effects:[f("LAST_MATCH_PLAYED"),s("retirement.status","closed"),s("retirement.closureType","planned_last_match")],messages:["Juegas una última vez. El partido, no el guion, decide cómo se recuerda."]},
      {id:"NO_APPEARANCE_OUT",baseWeight:1,effects:[s("retirement.status","closed"),s("retirement.closureType","no_last_match")],messages:["Pediste estar disponible, pero el partido termina sin darte minutos."]},
      {id:"TEAM_OUT",baseWeight:1,effects:[s("retirement.status","closed"),s("retirement.closureType","no_last_match")],messages:["La carrera se cierra sin forzar una escena que el contexto deportivo no garantizaba."]}
    ];
    lastWindow.canonStatus="technical_adaptation";
  }
}
