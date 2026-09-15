import type { GameState, State26Tag } from "../core/types.js";

export interface State26Classification {
  tags: State26Tag[];
  primary: State26Tag;
  signature: string;
  reasons: Partial<Record<State26Tag,string[]>>;
}
const num=(x:unknown,f=0)=>typeof x==="number"?x:f;

export function classifyState26(state:GameState):State26Classification {
  const p=state.professional;
  const role=num(state.sport.roleScore); const minutes=num(state.sport.minutesShare);
  const market=num(state.reputation.marketHeat); const media=num(state.reputation.mediaHeat);
  const prestige=num(state.reputation.prestige); const months=num(state.contract.monthsRemaining);
  const salary=num(state.contract.salaryMonthly); const risk=num(state.body.risk);
  const tags:State26Tag[]=[]; const reasons:Partial<Record<State26Tag,string[]>>={};
  const add=(t:State26Tag,why:string[])=>{if(!tags.includes(t))tags.push(t);reasons[t]=why};

  if(p.leagueTier===1 && p.clubPrestigeTier>=5 && role>=70 && market>=62 && prestige>=75) add("STATE26_WORLD_ELITE",["élite real","rol dominante","mercado y prestigio altos"]);
  if(p.leagueTier===1 && p.clubPrestigeTier>=5 && role>=48 && role<76) add("STATE26_ELITE_ROTATION",["club élite","rol no dominante"]);
  if(p.leagueTier===1 && p.clubPrestigeTier<5 && role>=66 && market>=52) add("STATE26_TOP_STARTER",["alta liga","titularidad sólida","mercado fuerte"]);
  if(p.leagueTier>=2 && p.leagueTier<=3 && role>=70 && minutes>=55) add("STATE26_SECOND_STAR",["segunda línea profesional","rol alto"]);
  if(p.nationalRole==="regular" || (p.nationalCaps>=12 && p.nationalStanding>=68)) add("STATE26_NATIONAL_REGULAR",["continuidad con absoluta"]);
  if((p.nationalCaps>0 || state.flags.NATIONAL_CALLED) && p.nationalRole!=="regular") add("STATE26_NATIONAL_FRINGE",["convocatorias sin rol estable"]);
  if(p.route==="abroad" && p.foreignAdaptation>=68 && role>=52) add("STATE26_ABROAD_ESTABLISHED",["ruta exterior","adaptación alta","rol útil"]);
  if((p.route==="home" || p.ownerClub==="UDV") && p.lockerPower>=62 && role>=58) add("STATE26_HOME_LEADER",["arraigo","poder de vestuario","rol"]);
  if((state.flags.WEALTHY_EXIT_ACCEPTED || salary>=36000) && p.roleSecurity<62 && p.contractPower<72) add("STATE26_BIG_CONTRACT_TRAP",["contrato alto","poco control/rol"]);
  if((months<=14 || p.route==="free_agent") && market>=58 && p.contractPower>=65) add("STATE26_CONTRACT_POWER",["mercado real","horizonte contractual corto","palanca alta"]);
  if((state.flags.HAS_SEED_CHRONIC_BODY && p.bodyLoad>=62) || p.injuryMinutesImpact>=30 || (p.bodyLoad>=74 && risk>=38)) add("STATE26_INJURY_MANAGEMENT",["carga/antecedente crónico","gestión activa"]);
  const jumped=p.leagueTierAt23>=2 && p.leagueTier<p.leagueTierAt23 && role>=60 && market>=50;
  if(jumped || (p.roleScoreAt23<48 && role>=66 && market>=52)) add("STATE26_LATE_BREAKTHROUGH",["salto 23-26","rol crece tarde"]);
  if(months<=1 && market>=35) add("STATE26_FREE_AGENT",["fin de contrato","mercado abierto"]);
  if(p.commercialPower>=60 && media>=50 && p.publicPolarization>=18) add("STATE26_MEDIA_POWER",["marca fuerte","exposición/polarización"]);

  if(!tags.length){
    if(p.leagueTier===1 && role>=55) add("STATE26_TOP_STARTER",["fallback de continuidad en alta liga"]);
    else if(p.leagueTier<=3 && role>=48) add("STATE26_SECOND_STAR",["fallback profesional competitivo"]);
    else add("STATE26_CONTRACT_POWER",["fallback: carrera abierta mediante control contractual"]);
  }
  const priority:State26Tag[]=["STATE26_WORLD_ELITE","STATE26_ELITE_ROTATION","STATE26_TOP_STARTER","STATE26_SECOND_STAR","STATE26_NATIONAL_REGULAR","STATE26_NATIONAL_FRINGE","STATE26_ABROAD_ESTABLISHED","STATE26_HOME_LEADER","STATE26_BIG_CONTRACT_TRAP","STATE26_CONTRACT_POWER","STATE26_INJURY_MANAGEMENT","STATE26_LATE_BREAKTHROUGH","STATE26_FREE_AGENT","STATE26_MEDIA_POWER"];
  const primary=priority.find(t=>tags.includes(t))??tags[0]!;
  return {tags,primary,signature:[...tags].sort().join("+"),reasons};
}
