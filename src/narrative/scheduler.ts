import { conditionsPass } from "../core/conditions.js";
import { npcKnows } from "../core/npc-knowledge.js";
import { DeterministicRng } from "../core/rng.js";
import type { EventDefinition, GameState, ScheduledEvent, WeightedCandidate } from "../core/types.js";
import { knowledgeRequirementsFor } from "../catalog/npc-knowledge-rules.js";
import { EventIndex } from "./event-index.js";
import { eligibleChoices, eventWithEligibleChoices } from "./choice-eligibility.js";

export interface SchedulerOptions { qa?: boolean; currentTick?: number; ignoreRhythmGate?: boolean; }
type Period = { key: string; cap: number };
interface TickContext {
  month: number;
  recent3: GameState["history"];
  recent6: GameState["history"];
  conditionalCount: number;
  conditionalCap: number;
  currentPeriod: Period;
  periodCount: number;
  activeSeedIds: Set<string>;
  relationMax: Map<string, number>;
  finalPrincipalCount: number;
  agePrincipalCount: number;
}

function monthOf(date: string): number { return Number(date.slice(5, 7)); }
function phaseAges(state: GameState): string[] {
  return state.phase === "18_20" ? ["18","19"] : state.phase === "20_23" ? ["20","21","22"] : state.phase === "23_26" ? ["23","24","25"] : state.phase === "26_30" ? ["26","27","28","29"] : state.phase === "30_34" ? ["30","31","32","33"] : state.phase === "34_plus" ? ["34+"] : [];
}
function conditionalCap(state: GameState): number {
  return state.phase === "18_20" ? 7 : state.phase === "20_23" ? 8 : state.phase === "23_26" ? 9 : state.phase === "26_30" ? 10 : state.phase === "30_34" ? 9 : state.phase === "34_plus" ? 15 : 10;
}
function periodFor(age:number,m:number,seed=0):Period {
  if(age===18){ if(m===7||m===8)return{key:"18_JA",cap:4}; if(m===9||m===10)return{key:"18_SO",cap:1}; if(m===11||m===12)return{key:"18_ND",cap:1}; if(m===1||m===2)return{key:"18_JF",cap:2}; if(m===3||m===4)return{key:"18_MA",cap:1}; if(m===5)return{key:"18_MAY",cap:2}; return{key:"18_JUN",cap:0}; }
  if(age===19){ if(m===7||m===8)return{key:"19_JA",cap:2}; if(m>=9&&m<=11)return{key:"19_SON",cap:1}; if(m===12||m===1||m===2)return{key:"19_DJF",cap:2}; if(m>=3&&m<=5)return{key:"19_MAM",cap:1}; return{key:"19_JUN",cap:0}; }
  if(age>=20&&age<=22){ if(m===7||m===8)return{key:`${age}_JA`,cap:2}; if(m>=9&&m<=11)return{key:`${age}_SON`,cap:1}; if(m===12||m===1||m===2)return{key:`${age}_DJF`,cap:2}; if(m>=3&&m<=5)return{key:`${age}_MAM`,cap:1}; return{key:`${age}_JUN`,cap:1}; }
  if(age>=23&&age<=25){ if(m===7||m===8)return{key:`${age}_JA`,cap:2}; if(m>=9&&m<=11)return{key:`${age}_SON`,cap:1}; if(m===12||m===1||m===2)return{key:`${age}_DJF`,cap:2}; if(m>=3&&m<=5)return{key:`${age}_MAM`,cap:2}; return{key:`${age}_JUN`,cap:1}; }
  if(age>=26&&age<=29){ if(m===7||m===8)return{key:`${age}_JA`,cap:1}; if(m>=9&&m<=11)return{key:`${age}_SON`,cap:1}; if(m===12)return{key:`${age}_DEC`,cap:1}; if(m===1||m===2)return{key:`${age}_JF`,cap:1}; if(m>=3&&m<=5)return{key:`${age}_MAM`,cap:2}; return{key:`${age}_JUN`,cap:0}; }
  if(age>=30&&age<=33){
    const code=m===7||m===8?"JA":m===9?"SEP":m===10||m===11?"ON":m===12||m===1||m===2?"DJF":m>=3&&m<=5?"MAM":"JUN";
    if(code==="JUN")return{key:`${age}_JUN`,cap:0};
    // Cada temporada madura reserva solo cuatro de cinco ventanas ordinarias.
    // La ventana omitida depende de seed+edad: reduce saturación sin condenar siempre los eventos tardíos.
    const windows=["JA","SEP","ON","DJF","MAM"]; const mixed=((seed>>>0)^Math.imul(age,0x9E3779B1))>>>0;
    const skipped=windows[mixed%windows.length]; return{key:`${age}_${code}`,cap:code===skipped?0:1};
  }
  if(age>=34){ return {key:`${age}_M${String(m).padStart(2,"0")}`,cap:1}; }
  return {key:"other",cap:Infinity};
}
function buildContext(state:GameState):TickContext {
  const ages=phaseAges(state), cap=conditionalCap(state), month=monthOf(state.date), seed=state.rngState.narrative.seed, currentPeriod=periodFor(state.age,month,seed);
  let conditionalCount=0, periodCount=0, finalPrincipalCount=0, agePrincipalCount=0;
  for(const h of state.history){
    if(h.eventId.startsWith("CEVT_")){
      if(state.phase==="34_plus"){ if(Number(h.snapshot.age??0)>=34) conditionalCount++; }
      else if(ages.some(a=>h.eventId.startsWith(`CEVT_${a}_`))) conditionalCount++;
    }
    const hAge=Number(h.snapshot.age??0);
    const principal34Plus=hAge>=34&&!h.eventId.startsWith("CEVT_")&&!String(h.eventId).startsWith("EVT_RET_");
    if(principal34Plus) finalPrincipalCount++;
    if(principal34Plus&&hAge===state.age) agePrincipalCount++;
    if(!h.eventId.startsWith("CEVT_")&&h.snapshot.age===state.age&&periodFor(state.age,Number(h.date.slice(5,7)),seed).key===currentPeriod.key) periodCount++;
  }
  const activeSeedIds=new Set(state.seeds.filter(s=>s.state==="active"||s.state==="dormant"||s.state==="transformed").map(s=>s.id));
  const relationMax=new Map(state.relationships.map(r=>[r.npcId,Math.max(r.trust,r.affinity,r.respect,r.resentment,r.leverage)]));
  return {month,recent3:state.history.slice(-3),recent6:state.history.slice(-6),conditionalCount,conditionalCap:cap,currentPeriod,periodCount,activeSeedIds,relationMax,finalPrincipalCount,agePrincipalCount};
}
function inTimeWindow(state:GameState,event:EventDefinition,ctx:TickContext):boolean {
  const w=event.timeWindow; if(!w)return true; if(w.months&&!w.months.includes(ctx.month))return false; if(w.minSeasonDay!==undefined&&state.runtime.seasonDay<w.minSeasonDay)return false; if(w.maxSeasonDay!==undefined&&state.runtime.seasonDay>w.maxSeasonDay)return false; return true;
}
function knowledgePass(state:GameState,event:EventDefinition):boolean {
  return knowledgeRequirementsFor(event.id).every(requirement=>npcKnows(state,requirement.npcId,requirement.factId));
}
function rhythmPass(state:GameState,event:EventDefinition,options:SchedulerOptions,ctx:TickContext):boolean {
  if(options.ignoreRhythmGate||(event.tags??[]).includes("hard_deadline"))return true;
  if((event.tags??[]).includes("retirement_terminal")) return state.runtime.daysSinceNarrative>=1;
  const minGap=event.family==="sport"?3:5; if(state.runtime.daysSinceNarrative<minGap)return false;
  if(event.family==="conditional"&&ctx.recent3.at(-1)?.snapshot.family==="conditional")return false;
  const sameHeavy=ctx.recent3.filter(h=>h.snapshot.family===event.family).length; if((event.family==="medical"||event.family==="contract")&&sameHeavy>=2)return false; return true;
}
function isEligible(state:GameState,event:EventDefinition,options:SchedulerOptions,ctx:TickContext):boolean {
  const maxAge=event.ageWindow[1]??Infinity; if(state.age<event.ageWindow[0]||state.age>maxAge||state.phase!==event.phase)return false;
  if(state.phase==="34_plus" && event.family!=="conditional" && !(event.tags??[]).includes("retirement_terminal")){
    if(ctx.finalPrincipalCount>=20)return false;
    const ageCap=state.age===34?6:state.age===35?5:state.age===36?4:state.age===37?3:2;
    if(ctx.agePrincipalCount>=ageCap)return false;
    const m=monthOf(state.date); const q=m>=7&&m<=9?0:m>=10&&m<=12?1:m>=1&&m<=3?2:3;
    const quarterSlots=state.age===34?[2,1,1,2]:state.age===35?[1,1,1,2]:state.age===36?[1,1,1,1]:state.age===37?[1,0,1,1]:[1,0,1,0];
    const slots=quarterSlots[q]!; if(slots===0)return false;
    const months=q===0?[7,8,9]:q===1?[10,11,12]:q===2?[1,2,3]:[4,5,6];
    const mixed=((state.rngState.narrative.seed>>>0)^Math.imul(state.age+q*17,0x9E3779B1))>>>0;
    const closed=months[mixed%3]!;
    const openMonths=slots>=3?months:slots===2?months.filter(x=>x!==closed):[months[mixed%3]!];
    if(!openMonths.includes(m))return false;
  }
  if((state.eventCooldowns[event.id]??0)>0||(!event.repeatable&&state.flags[`SEEN_${event.id}`]===true))return false;
  if(event.family==="conditional"&&ctx.conditionalCount>=ctx.conditionalCap)return false;
  const budgetExempt=(event.tags??[]).includes("hard_deadline")||["EVT_19_FIN_001","EVT_18_SUM_001","EVT_22_END_001","EVT_22_DDL_001","EVT_25_END_001","EVT_23_JAN_001","EVT_29_FIN_001","EVT_30_FINAL_001","EVT_31_RETURN_001","EVT_31_FINAL_001","EVT_32_BOS_001","EVT_33_RET_001","EVT_33_END_001"].includes(event.id);
  if(event.family!=="conditional"&&!budgetExempt&&ctx.periodCount>=ctx.currentPeriod.cap)return false;
  if(!inTimeWindow(state,event,ctx)||!conditionsPass(state,event.gates)||!knowledgePass(state,event))return false;
  if(event.exclusions&&event.exclusions.some(c=>conditionsPass(state,[c])))return false;
  if(eligibleChoices(state,event).length===0)return false;
  return rhythmPass(state,event,options,ctx);
}
function contentNeed(state:GameState,event:EventDefinition,tick:number):number { const last=state.familyLastSeen[event.family]; if(last===undefined)return 1.22; const gap=Math.max(0,tick-last); return Math.min(1.45,.78+gap/35); }
function relevance(event:EventDefinition,ctx:TickContext):number { const seedHits=(event.seedsRead??[]).filter(id=>ctx.activeSeedIds.has(id)).length; const npcHits=(event.npcRefs??[]).filter(id=>(ctx.relationMax.get(id)??0)>=60).length; return 1+seedHits*.30+npcHits*.10; }
function novelty(event:EventDefinition,ctx:TickContext):number { const repeatedNpc=(event.npcRefs??[]).some(id=>ctx.recent6.some(h=>Array.isArray(h.snapshot.npcRefs)&&h.snapshot.npcRefs.includes(id))); const sameFamilyCount=ctx.recent6.filter(h=>h.snapshot.family===event.family).length; let factor=1; if(repeatedNpc)factor*=.76; factor*=Math.max(.42,1-sameFamilyCount*.17); return factor; }
function arcPressure(state:GameState,event:EventDefinition):number { const keys=event.tags??[]; if(!keys.length)return 1; const p=keys.reduce((sum,k)=>sum+(state.narrativePressure[k]??0),0)/keys.length; return 1+Math.min(.6,Math.max(-.4,p/100)); }
function routeCoverage(state:GameState,event:EventDefinition):number { const prestige=Number(state.reputation.prestige??0), elite=(event.tags??[]).includes("elite"), modest=(event.tags??[]).includes("modest_route"); if(prestige>=80&&elite)return .72; if(prestige<45&&modest)return 1.32; return 1; }
function conditionalDensity(state:GameState,event:EventDefinition,ctx:TickContext):number {
  if(event.family!=="conditional")return 1; const count=ctx.conditionalCount, cap=ctx.conditionalCap; if(count>=cap)return .08;
  if(state.phase==="20_23"){if(count<2)return 2.8;if(count<5)return 2.15;if(count<8)return 1.25;}
  if(state.phase==="23_26"){if(count<3)return 2.7;if(count<6)return 2.0;if(count<9)return 1.18;}
  if(state.phase==="26_30"){if(count<4)return 2.15;if(count<7)return 1.55;if(count<10)return .95;}
  if(state.phase==="30_34"){if(count<3)return 2.35;if(count<6)return 1.65;if(count<9)return 1.0;}
  if(state.phase==="34_plus"){if(count<4)return 2.15;if(count<9)return 1.45;if(count<15)return .95;return .2;}
  if(count<2)return 2.35; if(count<4)return state.age>=19?2.15:1.85; if(count<cap)return 1.15; return .82;
}

function lateOpportunity(state:GameState,event:EventDefinition):number {
  if(state.phase!=="34_plus"||(event.tags??[]).includes("retirement_terminal")) return 1;
  if(state.flags[`SEEN_${event.id}`]===true) return 1;
  const overdue=Math.max(0,state.age-event.ageWindow[0]);
  return Math.min(3.2,1+overdue*.42);
}

function density(state:GameState):number { if(state.runtime.daysSinceNarrative>=28)return 1.3;if(state.runtime.daysSinceNarrative>=14)return 1.15;if(state.runtime.daysSinceNarrative<=6)return .72;return 1; }
export function scheduleEvent(state:GameState,source:EventDefinition[]|EventIndex,options:SchedulerOptions={}):ScheduledEvent|null {
  const tick=options.currentTick??state.runtime.day, pool=source instanceof EventIndex?source.candidates(state):source, ctx=buildContext(state);
  const eligible=pool.filter(e=>isEligible(state,e,options,ctx)); if(!eligible.length)return null;
  const weighted:WeightedCandidate<EventDefinition>[]=eligible.map(event=>{const factors={base:event.weight,contentNeed:contentNeed(state,event,tick),relevance:relevance(event,ctx),arcPressure:arcPressure(state,event),routeCoverage:routeCoverage(state,event),novelty:novelty(event,ctx),density:density(state),conditionalDensity:conditionalDensity(state,event,ctx),lateOpportunity:lateOpportunity(state,event)}; return {item:event,weight:Object.values(factors).reduce((a,b)=>a*b,1),factors};});
  const rng=new DeterministicRng(state.rngState.narrative), picked=rng.pickWeighted(weighted);
  return {event:eventWithEligibleChoices(state,picked.item),debug:options.qa?{candidates:weighted.map(x=>({id:x.item.id,weight:x.weight,factors:x.factors})),rngDraw:picked.draw}:undefined};
}
