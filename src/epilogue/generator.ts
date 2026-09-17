import type { EndingFamily, GameState, HistoryEntry } from "../core/types.js";

const num=(x:unknown,f=0)=>typeof x==="number"?x:f;

export const ENDING_FAMILIES: EndingFamily[] = [
  "END_WORLD_LEGEND","END_ONE_CLUB_MYTH","END_HOME_PRODIGAL","END_GREAT_PRO","END_TACTICAL_SECOND_CAREER",
  "END_JOURNEYMAN_VETERAN","END_MARKET_SILENCE","END_BODY_CLOSED_DOOR","END_ELITE_SPECIALIST","END_NEW_MARKET_ICON",
  "END_EARLY_VOLUNTARY","END_TOO_LONG","END_RETIRE_ON_HIGH","END_COMEBACK_FINAL","END_POLARIZING_WINNER",
  "END_WEALTH_OVER_GLORY","END_UNFINISHED_FEELING","END_STORYBOOK_FAREWELL","END_NATIONAL_CAPTAIN","END_CONTRACT_KING"
];

type Scored={id:EndingFamily;score:number};
const conflictKey=(a:EndingFamily,b:EndingFamily)=>[a,b].sort().join("|");
const HARD_CONFLICTS=new Set<string>([
  conflictKey("END_ONE_CLUB_MYTH","END_JOURNEYMAN_VETERAN"),
  conflictKey("END_ONE_CLUB_MYTH","END_HOME_PRODIGAL"),
  conflictKey("END_EARLY_VOLUNTARY","END_TOO_LONG"),
  conflictKey("END_MARKET_SILENCE","END_STORYBOOK_FAREWELL"),
  conflictKey("END_BODY_CLOSED_DOOR","END_STORYBOOK_FAREWELL"),
  conflictKey("END_RETIRE_ON_HIGH","END_UNFINISHED_FEELING"),
  conflictKey("END_STORYBOOK_FAREWELL","END_UNFINISHED_FEELING")
]);

function careerClubs(state:GameState):Set<string>{
  const clubs=new Set(state.history.map(h=>h.club).filter(Boolean));
  if(state.club)clubs.add(state.club);
  return clubs;
}
function titleEvidence(state:GameState):boolean{
  if(state.flags.RETIRE_ON_HIGH||String(state.world.finalOutcome)==="win")return true;
  return state.history.some(h=>
    /FINAL|TITLE|CUP|EUR|CHAMP/i.test(h.eventId)&&
    /WIN|WON|TITLE|CHAMP|LIFT|VICT/i.test(`${h.choiceId} ${h.outcomeId}`)
  );
}

function modestOrUnfinishedEvidence(state:GameState,won:boolean,role:number,market:number):boolean{
  const p=state.professional;
  const explicit=state.flags.RETIRE_ON_LOW===true||state.retirement.reason==="retire_on_low"||state.flags.UNFINISHED_RETIREMENT_FEELING===true;
  if(explicit)return true;
  // The canonical ending matrix includes a modest/discreet career as a valid secondary
  // dimension. Keep the legacy technical id but derive it only from objective career facts,
  // never from an invented feeling: no title evidence, low legacy/public achievement and
  // either a reduced sporting role or weak external market at closure.
  return !won&&p.trophyCapital<30&&p.publicMyth<45&&p.legacyCapital<50&&(role<60||market<50);
}

export function endingFamiliesCompatible(a:EndingFamily,b:EndingFamily):boolean{
  return a===b||!HARD_CONFLICTS.has(conflictKey(a,b));
}

/** Strong labels need direct facts, not merely a high aggregate score. */
export function endingFamilySupported(state:GameState,id:EndingFamily):boolean{
  const p=state.professional, clubs=careerClubs(state), closure=String(state.retirement.closureType??""), reason=String(state.retirement.reason??""), role=num(state.sport.roleScore), market=num(state.reputation.marketHeat);
  const has=(flag:string)=>state.flags[flag]===true;
  const tags=new Set(state.careerStateTags.map(String));
  const won=titleEvidence(state);
  switch(id){
    case "END_WORLD_LEGEND": return won&&p.publicMyth>=75&&p.trophyCapital>=55&&p.legacyCapital>=70;
    case "END_ONE_CLUB_MYTH": return clubs.size===1&&p.legacyCapital>=55&&(tags.has("STATE34_ONE_CLUB_ICON")||p.publicMyth>=55);
    case "END_HOME_PRODIGAL": return state.club==="UDV"&&(has("HOME_RETURN_30")||[...clubs].some(c=>c!=="UDV"));
    case "END_TACTICAL_SECOND_CAREER": return has("ROLE_REINVENTED_30")||tags.has("STATE34_REINVENTED_CREATOR");
    case "END_JOURNEYMAN_VETERAN": return clubs.size>=3||tags.has("STATE34_JOURNEYMAN_VETERAN");
    case "END_MARKET_SILENCE": return reason==="no_market"||closure==="no_market"||has("NO_MARKET_RETIREMENT_CHOSEN");
    case "END_BODY_CLOSED_DOOR": return reason==="health"||has("NO_MEDICAL_CLEARANCE_CONTEXT");
    case "END_ELITE_SPECIALIST": return tags.has("STATE34_ELITE_SPECIALIST")||(p.clubPrestigeTier>=3&&role>=28&&role<65&&p.legacyCapital>=35);
    case "END_NEW_MARKET_ICON": return has("TRANSATLANTIC_PROJECT")||has("RICH_LEAGUE_ROUTE");
    case "END_EARLY_VOLUNTARY": return closure==="early_retirement"||(reason==="voluntary"&&state.retirement.decisionAge!==null&&state.retirement.decisionAge<=34);
    case "END_TOO_LONG": return state.age>=41&&role<35&&market<30&&p.motivationReserve<55;
    case "END_RETIRE_ON_HIGH": return won&&(reason==="retire_on_high"||has("RETIRE_ON_HIGH"));
    case "END_COMEBACK_FINAL": return has("LATE_MAJOR_COMEBACK")||has("RETIREMENT_RECONSIDERED")||state.retirement.reversals>0;
    case "END_POLARIZING_WINNER": return won&&p.trophyCapital>=30&&p.publicPolarization>=25;
    case "END_WEALTH_OVER_GLORY": return has("WEALTHY_EXIT_ACCEPTED")||has("RICH_LEAGUE_ROUTE");
    case "END_UNFINISHED_FEELING": return modestOrUnfinishedEvidence(state,won,role,market);
    case "END_STORYBOOK_FAREWELL": return has("STORYBOOK_LAST_GOAL")||closure==="storybook"||(closure==="planned_last_match"&&has("LAST_MATCH_PLAYED")&&p.legacyCapital>=65&&p.publicMyth>=55);
    case "END_NATIONAL_CAPTAIN": return has("HAS_SEED_NATIONAL_CAPTAINCY")||has("NATIONAL_CAPTAINCY_CONFIRMED");
    case "END_CONTRACT_KING": return tags.has("STATE30_CONTRACT_KINGMAKER")||(p.contractPower>=75&&p.careerControl>=70);
    case "END_GREAT_PRO": return true;
    default: return true;
  }
}

function scoreFamilies(state:GameState):Scored[]{
  const p=state.professional, role=num(state.sport.roleScore), market=num(state.reputation.marketHeat), salary=num(state.contract.salaryMonthly), age=state.age;
  const closure=String(state.retirement.closureType??"");
  const has=(id:string)=>state.flags[id]===true;
  const tags=new Set(state.careerStateTags.map(String));
  const clubs=careerClubs(state);
  const scores:Scored[]=[
    {id:"END_WORLD_LEGEND",score:p.publicMyth*.30+p.trophyCapital*.30+p.legacyCapital*.25+p.nationalPower*.15},
    {id:"END_ONE_CLUB_MYTH",score:(clubs.size===1?45:0)+(tags.has("STATE34_ONE_CLUB_ICON")?42:0)+p.legacyCapital*.2},
    {id:"END_HOME_PRODIGAL",score:(p.route==="home"||has("HOME_RETURN_30")?58:0)+p.homePull*.3+(state.club==="UDV"?20:0)},
    {id:"END_GREAT_PRO",score:48+p.legacyCapital*.24+p.composure*.18-Math.max(0,p.publicPolarization-60)*.12},
    {id:"END_TACTICAL_SECOND_CAREER",score:(has("ROLE_REINVENTED_30")?60:0)+p.tacticalReading*.32+p.roleAdaptability*.18},
    {id:"END_JOURNEYMAN_VETERAN",score:(tags.has("STATE34_JOURNEYMAN_VETERAN")?72:0)+Math.max(0,clubs.size-1)*18+state.history.filter(h=>h.snapshot.age!==undefined&&Number(h.snapshot.age)>=30&&/MKT|HOME/.test(h.eventId)).length*2},
    {id:"END_MARKET_SILENCE",score:(state.retirement.reason==="no_market"||closure==="no_market"?100:0)+state.retirement.noMarketWindows*16+(market<25?22:0)},
    {id:"END_BODY_CLOSED_DOOR",score:(state.retirement.reason==="health"?115:0)+p.recoveryDebt*.45+(p.availability<50?28:0)},
    {id:"END_ELITE_SPECIALIST",score:(tags.has("STATE34_ELITE_SPECIALIST")?72:0)+p.clubPrestigeTier*6+(role>=28&&role<65?24:0)},
    {id:"END_NEW_MARKET_ICON",score:(has("TRANSATLANTIC_PROJECT")||has("RICH_LEAGUE_ROUTE")?55:0)+p.commercialPower*.45},
    {id:"END_EARLY_VOLUNTARY",score:(closure==="early_retirement"||state.retirement.reason==="voluntary"&&state.retirement.decisionAge!==null&&state.retirement.decisionAge<=34?82:0)+p.careerControl*.15},
    {id:"END_TOO_LONG",score:(age>=41?65+(age-41)*6:0)+(role<30?20:0)+(market<25?12:0)},
    {id:"END_RETIRE_ON_HIGH",score:(has("RETIRE_ON_HIGH")||state.retirement.reason==="retire_on_high"?95:0)+(String(state.world.finalOutcome)==="win"?24:0)+num(state.sport.form,50)*.18},
    {id:"END_COMEBACK_FINAL",score:(has("LATE_MAJOR_COMEBACK")?72:0)+(state.retirement.reversals>0?28:0)+(has("RETIREMENT_RECONSIDERED")?18:0)},
    {id:"END_POLARIZING_WINNER",score:p.trophyCapital*.68+p.publicPolarization*.82+(p.trophyCapital>=28&&p.publicPolarization>=20?58:0)},
    {id:"END_WEALTH_OVER_GLORY",score:(has("WEALTHY_EXIT_ACCEPTED")||has("RICH_LEAGUE_ROUTE")?46:0)+Math.min(52,salary/900)+p.moneyComfort*.18-p.trophyCapital*.10},
    {id:"END_UNFINISHED_FEELING",score:(has("RETIRE_ON_LOW")?78:0)+(role<42?24:0)+(p.publicMyth<35?16:0)+(state.retirement.reason==="no_market"?22:0)+(closure==="no_last_match"?10:0)},
    {id:"END_STORYBOOK_FAREWELL",score:(has("STORYBOOK_LAST_GOAL")?100:0)+(closure==="storybook"?40:0)+(closure==="planned_last_match"&&has("LAST_MATCH_PLAYED")?28:0)},
    {id:"END_NATIONAL_CAPTAIN",score:(has("HAS_SEED_NATIONAL_CAPTAINCY")||has("NATIONAL_CAPTAINCY_CONFIRMED")?70:0)+p.nationalPower*.35+Math.min(20,p.nationalCaps/3)},
    {id:"END_CONTRACT_KING",score:p.contractPower*.42+p.careerControl*.34+(tags.has("STATE30_CONTRACT_KINGMAKER")?36:0)+(state.retirement.reversals>0?8:0)}
  ];
  return scores;
}

function milestoneText(h:HistoryEntry):string{
  return `${h.season} · ${h.eventId} · ${h.choiceId}`;
}

export function selectEndingFamilies(state:GameState):EndingFamily[]{
  const scores=scoreFamilies(state).sort((a,b)=>b.score-a.score);
  const count=2+((state.rngState.narrative.seed + state.age + state.history.length) % 4); // canonical 2–5
  const selected:Scored[]=[];
  const canAdd=(candidate:Scored)=>endingFamilySupported(state,candidate.id)&&selected.every(existing=>endingFamiliesCompatible(existing.id,candidate.id));
  for(const candidate of scores){
    if(selected.length>=count)break;
    if(candidate.score>=30&&canAdd(candidate))selected.push(candidate);
  }
  // Canon B1517 requires 2–5 compatible labels. Backfill only fact-supported labels.
  for(const candidate of scores){
    if(selected.length>=2)break;
    if(!selected.some(x=>x.id===candidate.id)&&canAdd(candidate))selected.push(candidate);
  }
  if(!selected.some(x=>x.id==="END_GREAT_PRO")&&selected.length<2){
    const generic=scores.find(x=>x.id==="END_GREAT_PRO")!;
    if(canAdd(generic))selected.push(generic);
  }
  if(selected.length<2){
    throw new Error(`Canonical epilogue requires 2–5 compatible fact-supported families; found ${selected.map(x=>x.id).join(",")||"none"}`);
  }
  return selected.slice(0,count).map(x=>x.id);
}

export function generateEpilogue(state:GameState):void{
  if(state.epilogue.generated||state.retirement.status!=="closed") return;
  const families=selectEndingFamilies(state);
  const salient=state.history.filter(h=>h.salience>=60);
  const desired=12+((state.rngState.narrative.seed>>>3)%9); // 12–20
  const step=Math.max(1,Math.floor(salient.length/Math.max(1,desired)));
  const milestones:string[]=[];
  for(let i=0;i<salient.length&&milestones.length<desired;i+=step) milestones.push(milestoneText(salient[i]!));
  if(milestones.length<12){ for(const h of state.history){ if(milestones.length>=12)break; const t=milestoneText(h); if(!milestones.includes(t))milestones.push(t); } }
  state.epilogue={generated:true,families,milestones:milestones.slice(0,20),summaryKey:families.join("+")};
}
