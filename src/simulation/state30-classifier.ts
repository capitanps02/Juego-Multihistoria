import type { GameState, State30Tag } from "../core/types.js";

export interface State30Classification {
  tags: State30Tag[];
  primary: State30Tag;
  signature: string;
  reasons: Partial<Record<State30Tag,string[]>>;
}
const num=(x:unknown,f=0)=>typeof x==="number"?x:f;
export function classifyState30(state:GameState):State30Classification{
  const p=state.professional, role=num(state.sport.roleScore), market=num(state.reputation.marketHeat), media=num(state.reputation.mediaHeat), salary=num(state.contract.salaryMonthly), months=num(state.contract.monthsRemaining), form=num(state.sport.form,50);
  const tags:State30Tag[]=[]; const reasons:Partial<Record<State30Tag,string[]>>={};
  const add=(t:State30Tag,why:string[])=>{if(!tags.includes(t))tags.push(t);reasons[t]=why};
  if(p.peakStatus>=76 && p.trophyCapital>=48 && p.publicMyth>=62 && p.nationalPower>=45) add("STATE30_WORLD_ICON",["pico máximo","capital de títulos","mito público e impacto internacional"]);
  if(p.leagueTier===1 && p.clubPrestigeTier>=4 && role>=68 && market>=60 && p.peakStatus>=64) add("STATE30_GLOBAL_STAR",["élite competitiva","rol y mercado altos"]);
  if(p.clubPrestigeTier>=4 && p.institutionalPower>=63 && p.lockerPower>=60) add("STATE30_ELITE_CAPTAIN",["poder institucional","peso de vestuario"]);
  if(p.clubPrestigeTier>=4 && role>=38 && role<65 && salary>=12000) add("STATE30_ELITE_ROTATION_LUXURY",["gran club","rol reducido","salario alto"]);
  if(state.flags.HAS_SEED_PROJECT_FACE && (p.institutionalPower>=45 || p.publicMyth>=50)) add("STATE30_PROJECT_FACE",["proyecto construido alrededor del jugador"]);
  if(p.leagueTier===1 && role>=63 && p.peakStatus>=52 && p.clubPrestigeTier<5) add("STATE30_TOP_LEAGUE_STAR",["alta liga","producción fuerte sin estatus mundial obligatorio"]);
  if((p.ownerClub==="UDV"||p.registrationClub==="UDV"||p.route==="home") && p.publicMyth>=42 && p.institutionalPower>=45) add("STATE30_ONE_CLUB_LEGEND",["continuidad/origen","mito institucional"]);
  if(p.nationalPower>=62 || (p.nationalRole==="regular" && p.nationalCaps>=16 && p.nationalStanding>=65)) add("STATE30_NATIONAL_ICON",["peso central en selección"]);
  if(state.flags.HAS_SEED_POSITIONAL_REINVENTION && p.roleAdaptability>=52 && role>=48) add("STATE30_REINVENTED_VETERAN",["adaptación táctica consolidada"]);
  if(p.peakStatus>=48 && role>=45 && (p.recoveryMargin<=52 || state.flags.HAS_SEED_CHRONIC_BODY || state.flags.HAS_SEED_SURGERY_TIMING)) add("STATE30_BODY_MANAGED_STAR",["nivel alto","gestión física imprescindible"]);
  if((p.peakStatus<48 && (role<48||form<45)) || (p.recoveryMargin<32 && role<58) || (state.flags.HAS_SEED_FIRST_PEAK_DIP && p.peakStatus<54 && form<48)) add("STATE30_EARLY_DECLINE_RISK",["señales de descenso sin cierre definitivo"]);
  if((state.flags.HAS_SEED_WEALTHY_PEAK_EXIT || salary>=30000) && role<64 && months>=20 && market<66) add("STATE30_BIG_CONTRACT_TRAP",["contrato alto","rol/control limitados"]);
  if((months<=14 || p.route==="free_agent") && market>=55 && p.careerControl>=58 && p.contractPower>=58) add("STATE30_CONTRACT_KINGMAKER",["mercado","libertad contractual","control"]);
  const lateFrom26=((state.world.state26Tags as string[]|undefined)??[]).includes("STATE26_LATE_BREAKTHROUGH");
  if((lateFrom26 && p.peakStatus>=52 && role>=55) || (p.roleScoreAt23<45 && role>=67 && market>=58)) add("STATE30_LATE_PEAK",["pico tardío todavía en expansión"]);
  if(p.publicMyth>=52 && p.publicPolarization>=24 && media>=35) add("STATE30_MEDIA_POLARIZED",["figura pública fuerte","percepción dividida"]);
  if(state.flags.HAS_SEED_WEALTHY_PEAK_EXIT) add("STATE30_WEALTHY_EXIT",["salida deliberada por contrato de riqueza"]);
  if(state.flags.HAS_SEED_EARLY_HOME_RETURN || (p.route==="home" && state.age>=29 && p.ownerClub==="UDV")) add("STATE30_EARLY_HOME_RETURN",["regreso competitivo al origen"]);
  if(!tags.length){
    if(p.leagueTier===1 && role>=55) add("STATE30_TOP_LEAGUE_STAR",["continuidad competitiva en alta liga"]);
    else if(p.roleAdaptability>=52) add("STATE30_REINVENTED_VETERAN",["carrera adulta abierta mediante adaptación"]);
    else add("STATE30_EARLY_DECLINE_RISK",["estado abierto: nivel/rol por reconstruir"]);
  }
  const priority:State30Tag[]=["STATE30_WORLD_ICON","STATE30_GLOBAL_STAR","STATE30_ELITE_CAPTAIN","STATE30_PROJECT_FACE","STATE30_TOP_LEAGUE_STAR","STATE30_NATIONAL_ICON","STATE30_ONE_CLUB_LEGEND","STATE30_REINVENTED_VETERAN","STATE30_BODY_MANAGED_STAR","STATE30_ELITE_ROTATION_LUXURY","STATE30_CONTRACT_KINGMAKER","STATE30_LATE_PEAK","STATE30_MEDIA_POLARIZED","STATE30_WEALTHY_EXIT","STATE30_EARLY_HOME_RETURN","STATE30_BIG_CONTRACT_TRAP","STATE30_EARLY_DECLINE_RISK"];
  const primary=priority.find(t=>tags.includes(t))??tags[0]!;
  return {tags,primary,signature:[...tags].sort().join("+"),reasons};
}
