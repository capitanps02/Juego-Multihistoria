import type { EndingFamily, GameState, HistoryEntry } from "../core/types.js";
import { retirementLastAppearanceFact, retirementStorybookLastGoalFact } from "../simulation/retirement-authority.js";

const num=(x:unknown,f=0)=>typeof x==="number"?x:f;
const has=(state:GameState,flag:string)=>state.flags[flag]===true;

export const ENDING_FAMILIES:EndingFamily[]=[
  "END_WORLD_LEGEND","END_ONE_CLUB_MYTH","END_HOME_PRODIGAL","END_GREAT_PRO","END_TACTICAL_SECOND_CAREER",
  "END_JOURNEYMAN_VETERAN","END_MARKET_SILENCE","END_BODY_CLOSED_DOOR","END_ELITE_SPECIALIST","END_NEW_MARKET_ICON",
  "END_EARLY_VOLUNTARY","END_TOO_LONG","END_RETIRE_ON_HIGH","END_COMEBACK_FINAL","END_POLARIZING_WINNER",
  "END_WEALTH_OVER_GLORY","END_UNFINISHED_FEELING","END_STORYBOOK_FAREWELL","END_NATIONAL_CAPTAIN","END_CONTRACT_KING"
];

export interface EndingFamilyAuditRule{
  positive:string[];
  negative:string[];
  conflicts:EndingFamily[];
  priority:number;
}

const conflictKey=(a:EndingFamily,b:EndingFamily)=>[a,b].sort().join("|");
const CONFLICT_PAIRS:[EndingFamily,EndingFamily][]=[
  ["END_ONE_CLUB_MYTH","END_JOURNEYMAN_VETERAN"],
  ["END_ONE_CLUB_MYTH","END_HOME_PRODIGAL"],
  ["END_EARLY_VOLUNTARY","END_TOO_LONG"],
  ["END_MARKET_SILENCE","END_STORYBOOK_FAREWELL"],
  ["END_BODY_CLOSED_DOOR","END_STORYBOOK_FAREWELL"],
  ["END_RETIRE_ON_HIGH","END_UNFINISHED_FEELING"],
  ["END_STORYBOOK_FAREWELL","END_UNFINISHED_FEELING"]
];
const HARD_CONFLICTS=new Set(CONFLICT_PAIRS.map(([a,b])=>conflictKey(a,b)));
const conflictsFor=(id:EndingFamily)=>CONFLICT_PAIRS.flatMap(([a,b])=>a===id?[b]:b===id?[a]:[]);

export const ENDING_FAMILY_RULES:Record<EndingFamily,EndingFamilyAuditRule>={
  END_WORLD_LEGEND:{positive:["victoria/título registrado","publicMyth >= 75","trophyCapital >= 55","legacyCapital >= 70"],negative:["sin evidencia de victoria/título"],conflicts:conflictsFor("END_WORLD_LEGEND"),priority:100},
  END_ONE_CLUB_MYTH:{positive:["un solo club registrado","permanencia larga o tag canónico","legado/mito suficiente"],negative:["más de un club registrado"],conflicts:conflictsFor("END_ONE_CLUB_MYTH"),priority:94},
  END_HOME_PRODIGAL:{positive:["regreso factual a UDV","existió otro club antes"],negative:["sin regreso factual","carrera de un solo club"],conflicts:conflictsFor("END_HOME_PRODIGAL"),priority:86},
  END_GREAT_PRO:{positive:["carrera profesional cerrada","ocho temporadas registradas o al menos veinte hechos de carrera"],negative:["trayectoria demasiado breve sin evidencia equivalente"],conflicts:conflictsFor("END_GREAT_PRO"),priority:25},
  END_TACTICAL_SECOND_CAREER:{positive:["reinvención táctica registrada"],negative:["sin reinvención"],conflicts:conflictsFor("END_TACTICAL_SECOND_CAREER"),priority:78},
  END_JOURNEYMAN_VETERAN:{positive:["tres o más clubes registrados o tag canónico"],negative:["un solo club"],conflicts:conflictsFor("END_JOURNEYMAN_VETERAN"),priority:82},
  END_MARKET_SILENCE:{positive:["NO_MARKET_RETIREMENT_CHOSEN"],negative:["simple ausencia temporal de oferta"],conflicts:conflictsFor("END_MARKET_SILENCE"),priority:90},
  END_BODY_CLOSED_DOOR:{positive:["retirada por salud","evidencia física real"],negative:["estabilidad física sin decisión médica"],conflicts:conflictsFor("END_BODY_CLOSED_DOOR"),priority:91},
  END_ELITE_SPECIALIST:{positive:["especialista con contexto élite o tag canónico"],negative:["sin contexto élite/especialista"],conflicts:conflictsFor("END_ELITE_SPECIALIST"),priority:72},
  END_NEW_MARKET_ICON:{positive:["ruta transatlántica o liga rica registrada"],negative:["sin ruta de nuevo mercado"],conflicts:conflictsFor("END_NEW_MARKET_ICON"),priority:70},
  END_EARLY_VOLUNTARY:{positive:["decisión voluntaria temprana explícita"],negative:["retirada tardía o forzada"],conflicts:conflictsFor("END_EARLY_VOLUNTARY"),priority:84},
  END_TOO_LONG:{positive:["longevidad extrema","rol/mercado/motivación bajos"],negative:["edad alta por sí sola"],conflicts:conflictsFor("END_TOO_LONG"),priority:67},
  END_RETIRE_ON_HIGH:{positive:["RETIRE_ON_HIGH","victoria/título registrado"],negative:["ganar sin decidir retirarse"],conflicts:conflictsFor("END_RETIRE_ON_HIGH"),priority:96},
  END_COMEBACK_FINAL:{positive:["comeback o reconsideración pre-anuncio registrada"],negative:["duda post-anuncio"],conflicts:conflictsFor("END_COMEBACK_FINAL"),priority:76},
  END_POLARIZING_WINNER:{positive:["victoria/título","trophyCapital y polarización suficientes"],negative:["polarización sin éxito deportivo"],conflicts:conflictsFor("END_POLARIZING_WINNER"),priority:74},
  END_WEALTH_OVER_GLORY:{positive:["ruta económica explícita"],negative:["salario alto aislado"],conflicts:conflictsFor("END_WEALTH_OVER_GLORY"),priority:68},
  END_UNFINISHED_FEELING:{positive:["retire-low, cierre sin partido o ausencia factual de otra familia especializada"],negative:["final factual de alto/storybook incompatible"],conflicts:conflictsFor("END_UNFINISHED_FEELING"),priority:20},
  END_STORYBOOK_FAREWELL:{positive:["última aparición factual posterior al anuncio","gol factual en esa fixture","cierre factual de último gol"],negative:["flags legacy sin fila deportiva rica"],conflicts:conflictsFor("END_STORYBOOK_FAREWELL"),priority:98},
  END_NATIONAL_CAPTAIN:{positive:["capitanía de selección confirmada"],negative:["internacionalidades sin capitanía"],conflicts:conflictsFor("END_NATIONAL_CAPTAIN"),priority:80},
  END_CONTRACT_KING:{positive:["tag canónico o contractPower/careerControl altos"],negative:["contrato rico aislado"],conflicts:conflictsFor("END_CONTRACT_KING"),priority:65}
};

type Scored={id:EndingFamily;score:number};

function careerClubs(state:GameState):Set<string>{
  const clubs=new Set<string>();
  for(const h of state.history)if(h.club)clubs.add(h.club);
  if(state.club)clubs.add(state.club);
  if(state.professional.ownerClub)clubs.add(state.professional.ownerClub);
  if(state.professional.registrationClub)clubs.add(state.professional.registrationClub);
  const history=(state.market as any)?.history;
  if(Array.isArray(history))for(const decision of history){
    if(decision?.accepted===true&&typeof decision?.offer?.terms?.club==="string")clubs.add(decision.offer.terms.club);
    if(typeof decision?.offer?.before?.club==="string")clubs.add(decision.offer.before.club);
  }
  return clubs;
}

const recordedSeasons=(state:GameState)=>new Set(state.history.map(h=>h.season));

function titleEvidence(state:GameState):boolean{
  if(String(state.world.finalOutcome)==="win"&&state.professional.trophyCapital>0)return true;
  return state.history.some(h=>/FINAL|TITLE|CUP|CHAMP|TROPHY/i.test(h.eventId)&&/WIN|WON|TITLE|CHAMP|LIFT|VICT/i.test(`${h.choiceId} ${h.outcomeId}`));
}

function physicalRetirementEvidence(state:GameState):boolean{
  const p=state.professional;
  return has(state,"LATE_BODY_REDLINE")||has(state,"NO_MEDICAL_CLEARANCE_CONTEXT")||num(state.world.maturityLongInjuryCount)>0||p.recoveryDebt>=55||p.availability<=50;
}

function specializedFamilySupported(state:GameState):boolean{
  const p=state.professional;
  const clubs=careerClubs(state);
  const tags=new Set(state.careerStateTags.map(String));
  const role=num(state.sport.roleScore), market=num(state.reputation.marketHeat), won=titleEvidence(state);
  const reason=String(state.retirement.reason??""), closure=String(state.retirement.closureType??"");
  const seasons=recordedSeasons(state).size;
  return (
    (won&&p.publicMyth>=75&&p.trophyCapital>=55&&p.legacyCapital>=70)||
    (clubs.size===1&&(tags.has("STATE34_ONE_CLUB_ICON")||(seasons>=10&&p.legacyCapital>=50)||(seasons>=14&&p.publicMyth>=45)))||
    (state.club==="UDV"&&has(state,"HOME_RETURN_30")&&[...clubs].some(club=>club!=="UDV"))||
    has(state,"ROLE_REINVENTED_30")||tags.has("STATE34_REINVENTED_CREATOR")||
    clubs.size>=3||tags.has("STATE34_JOURNEYMAN_VETERAN")||
    has(state,"NO_MARKET_RETIREMENT_CHOSEN")||
    (reason==="health"&&physicalRetirementEvidence(state))||
    tags.has("STATE34_ELITE_SPECIALIST")||(p.clubPrestigeTier>=3&&role>=28&&role<65&&p.legacyCapital>=35)||
    has(state,"TRANSATLANTIC_PROJECT")||has(state,"RICH_LEAGUE_ROUTE")||
    (reason==="voluntary"&&state.retirement.decisionAge!==null&&state.retirement.decisionAge<=34)||
    (state.age>=41&&role<35&&market<30&&p.motivationReserve<55)||
    (won&&reason==="retire_on_high"&&has(state,"RETIRE_ON_HIGH"))||
    has(state,"LATE_MAJOR_COMEBACK")||has(state,"RETIREMENT_RECONSIDERED")||state.retirement.reversals>0||
    (won&&p.trophyCapital>=30&&p.publicPolarization>=25)||
    has(state,"WEALTHY_EXIT_ACCEPTED")||
    (closure==="last_match_goal_factual"&&retirementStorybookLastGoalFact(state).eligible)||
    has(state,"HAS_SEED_NATIONAL_CAPTAINCY")||has(state,"NATIONAL_CAPTAINCY_CONFIRMED")||
    tags.has("STATE30_CONTRACT_KINGMAKER")||(p.contractPower>=75&&p.careerControl>=70)
  );
}

export function endingFamiliesCompatible(a:EndingFamily,b:EndingFamily):boolean{
  return a===b||!HARD_CONFLICTS.has(conflictKey(a,b));
}

export function endingFamilySupported(state:GameState,id:EndingFamily):boolean{
  if(state.retirement.status!=="closed")return false;
  const p=state.professional, clubs=careerClubs(state), closure=String(state.retirement.closureType??""), reason=String(state.retirement.reason??"");
  const role=num(state.sport.roleScore), market=num(state.reputation.marketHeat), tags=new Set(state.careerStateTags.map(String));
  const won=titleEvidence(state), seasons=recordedSeasons(state).size;
  switch(id){
    case "END_WORLD_LEGEND":return won&&p.publicMyth>=75&&p.trophyCapital>=55&&p.legacyCapital>=70;
    case "END_ONE_CLUB_MYTH":return clubs.size===1&&(tags.has("STATE34_ONE_CLUB_ICON")||(seasons>=10&&p.legacyCapital>=50)||(seasons>=14&&p.publicMyth>=45));
    case "END_HOME_PRODIGAL":return state.club==="UDV"&&has(state,"HOME_RETURN_30")&&[...clubs].some(club=>club!=="UDV");
    case "END_GREAT_PRO":return seasons>=8||state.history.length>=20;
    case "END_TACTICAL_SECOND_CAREER":return has(state,"ROLE_REINVENTED_30")||tags.has("STATE34_REINVENTED_CREATOR");
    case "END_JOURNEYMAN_VETERAN":return clubs.size>=3||tags.has("STATE34_JOURNEYMAN_VETERAN");
    case "END_MARKET_SILENCE":return has(state,"NO_MARKET_RETIREMENT_CHOSEN");
    case "END_BODY_CLOSED_DOOR":return reason==="health"&&physicalRetirementEvidence(state);
    case "END_ELITE_SPECIALIST":return tags.has("STATE34_ELITE_SPECIALIST")||(p.clubPrestigeTier>=3&&role>=28&&role<65&&p.legacyCapital>=35);
    case "END_NEW_MARKET_ICON":return has(state,"TRANSATLANTIC_PROJECT")||has(state,"RICH_LEAGUE_ROUTE");
    case "END_EARLY_VOLUNTARY":return reason==="voluntary"&&state.retirement.decisionAge!==null&&state.retirement.decisionAge<=34;
    case "END_TOO_LONG":return state.age>=41&&role<35&&market<30&&p.motivationReserve<55;
    case "END_RETIRE_ON_HIGH":return won&&reason==="retire_on_high"&&has(state,"RETIRE_ON_HIGH");
    case "END_COMEBACK_FINAL":return has(state,"LATE_MAJOR_COMEBACK")||has(state,"RETIREMENT_RECONSIDERED")||state.retirement.reversals>0;
    case "END_POLARIZING_WINNER":return won&&p.trophyCapital>=30&&p.publicPolarization>=25;
    case "END_WEALTH_OVER_GLORY":return has(state,"WEALTHY_EXIT_ACCEPTED")||has(state,"RICH_LEAGUE_ROUTE");
    case "END_UNFINISHED_FEELING":return reason==="retire_on_low"||has(state,"RETIRE_ON_LOW")||closure==="no_last_match"||(!specializedFamilySupported(state)&&closure!=="last_match_goal_factual");
    case "END_STORYBOOK_FAREWELL":return closure==="last_match_goal_factual"&&retirementStorybookLastGoalFact(state).eligible;
    case "END_NATIONAL_CAPTAIN":return has(state,"HAS_SEED_NATIONAL_CAPTAINCY")||has(state,"NATIONAL_CAPTAINCY_CONFIRMED");
    case "END_CONTRACT_KING":return tags.has("STATE30_CONTRACT_KINGMAKER")||(p.contractPower>=75&&p.careerControl>=70);
    default:return false;
  }
}

export function endingFamilyEvidence(state:GameState,id:EndingFamily):string[]{
  if(!endingFamilySupported(state,id))return [];
  const p=state.professional, clubs=careerClubs(state), closure=String(state.retirement.closureType??""), reason=String(state.retirement.reason??"");
  switch(id){
    case "END_WORLD_LEGEND":return ["title_evidence",`publicMyth=${p.publicMyth}`,`trophyCapital=${p.trophyCapital}`,`legacyCapital=${p.legacyCapital}`];
    case "END_ONE_CLUB_MYTH":return [`clubs=${[...clubs].join(",")}`,`seasons=${recordedSeasons(state).size}`,`legacyCapital=${p.legacyCapital}`];
    case "END_HOME_PRODIGAL":return ["HOME_RETURN_30",`finalClub=${state.club}`,`clubs=${[...clubs].join(",")}`];
    case "END_GREAT_PRO":return ["retirement.status=closed",`recordedSeasons=${recordedSeasons(state).size}`,`historyEntries=${state.history.length}`];
    case "END_TACTICAL_SECOND_CAREER":return [has(state,"ROLE_REINVENTED_30")?"ROLE_REINVENTED_30":"STATE34_REINVENTED_CREATOR"];
    case "END_JOURNEYMAN_VETERAN":return [`clubs=${[...clubs].join(",")}`];
    case "END_MARKET_SILENCE":return ["NO_MARKET_RETIREMENT_CHOSEN"];
    case "END_BODY_CLOSED_DOOR":return [`reason=${reason}`,`longInjuries=${num(state.world.maturityLongInjuryCount)}`,`recoveryDebt=${p.recoveryDebt}`,`availability=${p.availability}`];
    case "END_ELITE_SPECIALIST":return [`clubPrestigeTier=${p.clubPrestigeTier}`,`role=${num(state.sport.roleScore)}`];
    case "END_NEW_MARKET_ICON":return [has(state,"TRANSATLANTIC_PROJECT")?"TRANSATLANTIC_PROJECT":"RICH_LEAGUE_ROUTE"];
    case "END_EARLY_VOLUNTARY":return [`reason=${reason}`,`decisionAge=${state.retirement.decisionAge}`];
    case "END_TOO_LONG":return [`age=${state.age}`,`role=${num(state.sport.roleScore)}`,`market=${num(state.reputation.marketHeat)}`,`motivation=${p.motivationReserve}`];
    case "END_RETIRE_ON_HIGH":return ["RETIRE_ON_HIGH","title_evidence"];
    case "END_COMEBACK_FINAL":return [has(state,"RETIREMENT_RECONSIDERED")?"RETIREMENT_RECONSIDERED":"LATE_MAJOR_COMEBACK",`reversals=${state.retirement.reversals}`];
    case "END_POLARIZING_WINNER":return ["title_evidence",`publicPolarization=${p.publicPolarization}`,`trophyCapital=${p.trophyCapital}`];
    case "END_WEALTH_OVER_GLORY":return [has(state,"WEALTHY_EXIT_ACCEPTED")?"WEALTHY_EXIT_ACCEPTED":"RICH_LEAGUE_ROUTE"];
    case "END_UNFINISHED_FEELING":return [`reason=${reason||"none"}`,`closure=${closure||"none"}`,specializedFamilySupported(state)?"explicit_low_or_no_last_match":"no_specialized_family_supported"];
    case "END_STORYBOOK_FAREWELL":{const goal=retirementStorybookLastGoalFact(state);return [`fixture=${goal.fixtureId}`,`goals=${goal.goals}`,`closure=${closure}`];}
    case "END_NATIONAL_CAPTAIN":return [has(state,"NATIONAL_CAPTAINCY_CONFIRMED")?"NATIONAL_CAPTAINCY_CONFIRMED":"HAS_SEED_NATIONAL_CAPTAINCY"];
    case "END_CONTRACT_KING":return [`contractPower=${p.contractPower}`,`careerControl=${p.careerControl}`];
    default:return [];
  }
}

function familyScore(state:GameState,id:EndingFamily):number{
  const p=state.professional, role=num(state.sport.roleScore), market=num(state.reputation.marketHeat);
  const base=ENDING_FAMILY_RULES[id].priority;
  switch(id){
    case "END_WORLD_LEGEND":return base+p.publicMyth*.2+p.trophyCapital*.2+p.legacyCapital*.2;
    case "END_ONE_CLUB_MYTH":return base+p.legacyCapital*.25+p.publicMyth*.15;
    case "END_GREAT_PRO":return base+Math.min(25,recordedSeasons(state).size);
    case "END_JOURNEYMAN_VETERAN":return base+careerClubs(state).size*4;
    case "END_BODY_CLOSED_DOOR":return base+p.recoveryDebt*.2+num(state.world.maturityLongInjuryCount)*4;
    case "END_TOO_LONG":return base+Math.max(0,state.age-40)*5+Math.max(0,35-role)*.3+Math.max(0,30-market)*.2;
    case "END_CONTRACT_KING":return base+p.contractPower*.15+p.careerControl*.12;
    default:return base;
  }
}

const candidateScores=(state:GameState):Scored[]=>ENDING_FAMILIES.filter(id=>endingFamilySupported(state,id)).map(id=>({id,score:familyScore(state,id)})).sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id));

export function selectEndingFamilies(state:GameState):EndingFamily[]{
  if(state.retirement.status!=="closed")return [];
  const candidates=candidateScores(state);
  const selected:EndingFamily[]=[];
  for(const candidate of candidates){
    if(selected.length>=3)break;
    if(selected.every(existing=>endingFamiliesCompatible(existing,candidate.id)))selected.push(candidate.id);
  }

  // Long-form careers can use GREAT_PRO as a factual baseline; otherwise UNFINISHED is the
  // neutral fallback when no specialized family is supported. Neither is granted by age alone.
  for(const fallback of ["END_GREAT_PRO","END_UNFINISHED_FEELING"] as EndingFamily[]){
    if(selected.length>=2)break;
    if(endingFamilySupported(state,fallback)&&!selected.includes(fallback)&&selected.every(existing=>endingFamiliesCompatible(existing,fallback)))selected.push(fallback);
  }

  // Defensive totality: do not throw or invent. If a malformed synthetic state has fewer than
  // two supported families, return only the supported facts rather than manufacturing a label.
  for(const candidate of candidates){
    if(selected.length>=2)break;
    if(!selected.includes(candidate.id)&&selected.every(existing=>endingFamiliesCompatible(existing,candidate.id)))selected.push(candidate.id);
  }
  return selected.slice(0,5);
}

const milestoneText=(h:HistoryEntry)=>`${h.season} · ${h.eventId} · ${h.choiceId}`;
function selectMilestones(state:GameState):string[]{
  const salient=state.history.filter(h=>h.salience>=60);
  if(salient.length<=20)return salient.map(milestoneText);
  return [...salient.slice(0,10),...salient.slice(-10)].map(milestoneText);
}

export function buildEpilogueText(state:GameState):string[]{
  if(state.retirement.status!=="closed")return [];
  const lines:string[]=[];
  const clubs=[...careerClubs(state)];
  lines.push(`La carrera profesional terminó a los ${state.age} años y quedó cerrada el ${state.retirement.closedDate??state.date}.`);

  if(clubs.length===1)lines.push(`En los hechos registrados de la carrera aparece un único club: ${clubs[0]}.`);
  else if(clubs.length>1)lines.push(`Los hechos registrados recogen ${clubs.length} clubes: ${clubs.join(", ")}.`);

  if(has(state,"NATIONAL_RETIRED"))lines.push(`La retirada de la selección consta como un hecho separado del cierre profesional; se registran ${state.professional.nationalCaps} internacionalidades.`);
  else if(state.professional.nationalCaps>0)lines.push(`La trayectoria internacional registra ${state.professional.nationalCaps} internacionalidades.`);

  const longInjuries=num(state.world.maturityLongInjuryCount);
  if(longInjuries>0)lines.push(`En el tramo de madurez quedaron registradas ${longInjuries} lesiones largas.`);

  if(has(state,"NO_MARKET_RETIREMENT_CHOSEN"))lines.push("La falta de una oferta compatible influyó en el contexto y la retirada llegó después de una decisión explícita del jugador.");
  else if(state.retirement.reason==="health")lines.push("La decisión de retirada quedó registrada por motivos de salud.");
  else if(state.retirement.reason==="retire_on_high"&&has(state,"RETIRE_ON_HIGH"))lines.push("La decisión de retirarse quedó registrada en una ruta de cierre tras un contexto deportivo ganador.");
  else if(state.retirement.reason==="retire_on_low"&&has(state,"RETIRE_ON_LOW"))lines.push("La decisión de retirarse llegó después de un tramo de menor peso deportivo registrado.");
  else if(state.retirement.reason==="voluntary")lines.push("La retirada fue una decisión voluntaria registrada antes del anuncio público.");

  const lastAppearance=retirementLastAppearanceFact(state);
  if(lastAppearance.status==="authoritative"&&lastAppearance.postAnnouncement===true){
    lines.push(`Después del anuncio, Sport registró la última aparición factual el ${lastAppearance.date} ante ${lastAppearance.opponent}.`);
    const goal=retirementStorybookLastGoalFact(state);
    if(goal.eligible)lines.push(`La misma fixture registra ${goal.goals} gol${goal.goals===1?"":"es"} del protagonista; el epílogo conserva ese hecho sin inventarlo.`);
  }else if(lastAppearance.status==="authoritative_none"){
    lines.push("La autoridad deportiva no registra ninguna aparición profesional en la store disponible.");
  }else{
    lines.push("La autoridad deportiva rica no permite afirmar una última aparición; el epílogo no la inventa.");
  }
  return lines;
}

export function generateEpilogue(state:GameState):void{
  if(state.epilogue.generated||state.retirement.status!=="closed")return;
  const families=selectEndingFamilies(state);
  const evidence=Object.fromEntries(families.map(id=>[id,endingFamilyEvidence(state,id)]));
  state.epilogue={
    generated:true,
    families,
    milestones:selectMilestones(state),
    summaryKey:families.join("+"),
    evidence,
    finalText:buildEpilogueText(state)
  } as any;
}
