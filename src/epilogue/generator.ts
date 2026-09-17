import type { EndingFamily, GameState, HistoryEntry } from "../core/types.js";

const num=(x:unknown,f=0)=>typeof x==="number"?x:f;

export const ENDING_FAMILIES: EndingFamily[] = [
  "END_WORLD_LEGEND","END_ONE_CLUB_MYTH","END_HOME_PRODIGAL","END_GREAT_PRO","END_TACTICAL_SECOND_CAREER",
  "END_JOURNEYMAN_VETERAN","END_MARKET_SILENCE","END_BODY_CLOSED_DOOR","END_ELITE_SPECIALIST","END_NEW_MARKET_ICON",
  "END_EARLY_VOLUNTARY","END_TOO_LONG","END_RETIRE_ON_HIGH","END_COMEBACK_FINAL","END_POLARIZING_WINNER",
  "END_WEALTH_OVER_GLORY","END_UNFINISHED_FEELING","END_STORYBOOK_FAREWELL","END_NATIONAL_CAPTAIN","END_CONTRACT_KING"
];

type Scored={id:EndingFamily;score:number};
function scoreFamilies(state:GameState):Scored[]{
  const p=state.professional, role=num(state.sport.roleScore), market=num(state.reputation.marketHeat), salary=num(state.contract.salaryMonthly), age=state.age;
  const closure=String(state.retirement.closureType??"");
  const has=(id:string)=>state.flags[id]===true;
  const tags=new Set(state.careerStateTags.map(String));
  const scores:Scored[]=[
    {id:"END_WORLD_LEGEND",score:p.publicMyth*.30+p.trophyCapital*.30+p.legacyCapital*.25+p.nationalPower*.15},
    {id:"END_ONE_CLUB_MYTH",score:(p.ownerClub==="UDV"?62:0)+(tags.has("STATE34_ONE_CLUB_ICON")?42:0)+p.legacyCapital*.2},
    {id:"END_HOME_PRODIGAL",score:(p.route==="home"||has("HOME_RETURN_30")?58:0)+p.homePull*.3+(p.ownerClub==="UDV"?20:0)},
    {id:"END_GREAT_PRO",score:48+p.legacyCapital*.24+p.composure*.18-Math.max(0,p.publicPolarization-60)*.12},
    {id:"END_TACTICAL_SECOND_CAREER",score:(has("ROLE_REINVENTED_30")?60:0)+p.tacticalReading*.32+p.roleAdaptability*.18},
    {id:"END_JOURNEYMAN_VETERAN",score:(tags.has("STATE34_JOURNEYMAN_VETERAN")?72:0)+(p.route!=="home"?18:0)+state.history.filter(h=>h.snapshot.age!==undefined&&Number(h.snapshot.age)>=30&&/MKT|HOME/.test(h.eventId)).length*2},
    {id:"END_MARKET_SILENCE",score:(closure==="no_market"?100:0)+state.retirement.noMarketWindows*16+(market<25?22:0)},
    {id:"END_BODY_CLOSED_DOOR",score:(state.retirement.reason==="health"?115:0)+p.recoveryDebt*.45+(p.availability<50?28:0)},
    {id:"END_ELITE_SPECIALIST",score:(tags.has("STATE34_ELITE_SPECIALIST")?72:0)+p.clubPrestigeTier*6+(role>=28&&role<60?24:0)},
    {id:"END_NEW_MARKET_ICON",score:(has("TRANSATLANTIC_PROJECT")||has("RICH_LEAGUE_ROUTE")?55:0)+p.commercialPower*.45},
    {id:"END_EARLY_VOLUNTARY",score:(closure==="early_retirement"||state.retirement.decisionAge!==null&&state.retirement.decisionAge<=34?82:0)+p.careerControl*.15},
    {id:"END_TOO_LONG",score:(age>=41?65+(age-41)*6:0)+(role<30?20:0)+(market<25?12:0)},
    {id:"END_RETIRE_ON_HIGH",score:(has("RETIRE_ON_HIGH")?95:0)+(String(state.world.finalOutcome)==="win"?24:0)+num(state.sport.form,50)*.18},
    {id:"END_COMEBACK_FINAL",score:(has("LATE_MAJOR_COMEBACK")?72:0)+(state.retirement.reversals>0?28:0)+(has("RETIREMENT_RECONSIDERED")?18:0)},
    {id:"END_POLARIZING_WINNER",score:p.trophyCapital*.68+p.publicPolarization*.82+(p.trophyCapital>=28&&p.publicPolarization>=20?58:0)},
    {id:"END_WEALTH_OVER_GLORY",score:(has("WEALTHY_EXIT_ACCEPTED")||has("RICH_LEAGUE_ROUTE")?46:0)+Math.min(52,salary/900)+p.moneyComfort*.18-p.trophyCapital*.10},
    {id:"END_UNFINISHED_FEELING",score:(has("RETIRE_ON_LOW")?78:0)+(role<42?24:0)+(p.publicMyth<35?16:0)+(state.retirement.reason==="no_market"?22:0)+(closure==="no_last_match"?10:0)},
    {id:"END_STORYBOOK_FAREWELL",score:(has("STORYBOOK_LAST_GOAL")?100:0)+(closure==="storybook"?40:0)},
    {id:"END_NATIONAL_CAPTAIN",score:(has("HAS_SEED_NATIONAL_CAPTAINCY")?52:0)+p.nationalPower*.55+Math.min(30,p.nationalCaps/2)},
    {id:"END_CONTRACT_KING",score:p.contractPower*.42+p.careerControl*.34+(tags.has("STATE30_CONTRACT_KINGMAKER")?36:0)+(state.retirement.reversals>0?8:0)}
  ];
  return scores;
}

function milestoneText(h:HistoryEntry):string{return `${h.season} · ${h.eventId} · ${h.choiceId}`;}

export function generateEpilogue(state:GameState):void{
  if(state.epilogue.generated||state.retirement.status!=="closed") return;
  const scores=scoreFamilies(state).sort((a,b)=>b.score-a.score);
  const count=2+((state.rngState.narrative.seed + state.age + state.history.length) % 4); // 2–5
  const selected=scores.filter(x=>x.score>=30).slice(0,count);
  if(selected.length<2) selected.push(...scores.filter(x=>!selected.includes(x)).slice(0,2-selected.length));
  const salient=state.history.filter(h=>h.salience>=60);
  const desired=12+((state.rngState.narrative.seed>>>3)%9); // 12–20
  const step=Math.max(1,Math.floor(salient.length/Math.max(1,desired)));
  const milestones:string[]=[];
  for(let i=0;i<salient.length&&milestones.length<desired;i+=step) milestones.push(milestoneText(salient[i]!));
  if(milestones.length<12){ for(const h of state.history){ if(milestones.length>=12)break; const t=milestoneText(h); if(!milestones.includes(t))milestones.push(t); } }
  state.epilogue={generated:true,families:selected.map(x=>x.id),milestones:milestones.slice(0,20),summaryKey:selected.map(x=>x.id).join("+")};
}
