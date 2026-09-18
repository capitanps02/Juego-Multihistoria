import type { GameState } from "../core/types.js";
import { employmentStatus } from "./employment.js";
import {
  proposeCareerChange,
  proposePostAnnouncementCareerChange,
  type CareerOffer,
  type VeteranOfferContext
} from "./offers.js";

const num=(x:unknown,f=0)=>typeof x==="number"&&Number.isFinite(x)?x:f;
const clamp=(x:number,min=0,max=100)=>Math.min(max,Math.max(min,x));

function addDays(iso:string,days:number):string{
  const d=new Date(`${iso}T00:00:00Z`);d.setUTCDate(d.getUTCDate()+days);return d.toISOString().slice(0,10);
}
function stableRoll(state:GameState,salt:string):number{
  let h=(state.rngState.football.seed>>>0)^0x9e3779b9;
  const input=`${state.date}|${state.age}|${state.club}|${salt}`;
  for(let i=0;i<input.length;i++){h^=input.charCodeAt(i);h=Math.imul(h,16777619)>>>0;}
  return h/0x100000000;
}
export function veteranMarketDemand(state:GameState):number{
  const p=state.professional;
  const agePenalty=Math.max(0,state.age-34)*2.2;
  return clamp(
    num(state.reputation.marketHeat)*.36
    +num(state.sport.roleScore)*.24
    +num(p.veteranLeverage)*.18
    +num(p.legacyCapital)*.12
    +num(p.availability)*.10
    -agePenalty
  );
}


export type VeteranMedicalEvaluationResult = "cleared" | "cleared_with_conditions" | "failed";
export interface VeteranMarketApproach {
  id:string;
  club:string;
  date:string;
  context:string;
  medicalEvaluation:{ occurred:boolean; result:VeteranMedicalEvaluationResult|null; date:string|null };
}

const validText=(value:unknown,max=500)=>typeof value==="string"&&value.length>0&&value.length<=max;
const validDate=(value:unknown)=>typeof value==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&!Number.isNaN(Date.parse(value+"T00:00:00Z"));
export function isVeteranMarketApproach(value:unknown):value is VeteranMarketApproach{
  if(value===null||typeof value!=="object"||Array.isArray(value))return false;
  const row=value as Record<string,unknown>;
  if(Object.keys(row).sort().join()!=="club,context,date,id,medicalEvaluation")return false;
  if(!validText(row.id,200)||!validText(row.club,200)||!validDate(row.date)||!validText(row.context))return false;
  if(row.medicalEvaluation===null||typeof row.medicalEvaluation!=="object"||Array.isArray(row.medicalEvaluation))return false;
  const medical=row.medicalEvaluation as Record<string,unknown>;
  if(Object.keys(medical).sort().join()!=="date,occurred,result")return false;
  if(typeof medical.occurred!=="boolean")return false;
  if(medical.result!==null&&!["cleared","cleared_with_conditions","failed"].includes(String(medical.result)))return false;
  if(medical.date!==null&&!validDate(medical.date))return false;
  return medical.occurred ? medical.result!==null&&medical.date!==null : medical.result===null&&medical.date===null;
}
function veteranApproaches(state:GameState):VeteranMarketApproach[]{
  const raw=state.world.veteranMarketApproaches;
  if(!Array.isArray(raw)){state.world.veteranMarketApproaches=[];return state.world.veteranMarketApproaches as unknown as VeteranMarketApproach[];}
  if(!raw.every(isVeteranMarketApproach))throw Error("Historial de mercado veterano no válido.");
  return raw as unknown as VeteranMarketApproach[];
}
export function getVeteranMarketApproaches(state:GameState):readonly VeteranMarketApproach[]{
  const raw=state.world.veteranMarketApproaches;
  if(!Array.isArray(raw)||!raw.every(isVeteranMarketApproach))return [];
  return structuredClone(raw) as unknown as VeteranMarketApproach[];
}
export function recordVeteranMarketApproachInPlace(
  state:GameState,
  input:{id:string;club:string;context:string}
):VeteranMarketApproach|null{
  if(state.age<34||state.retirement.status==="closed"||!input.id||!input.club||!input.context)return null;
  const rows=veteranApproaches(state);
  const existing=rows.find(row=>row.id===input.id);
  if(existing){
    if(existing.club!==input.club||existing.context!==input.context)throw Error("El identificador de acercamiento veterano ya pertenece a otro hecho.");
    return structuredClone(existing);
  }
  const row:VeteranMarketApproach={
    id:input.id,club:input.club,date:state.date,context:input.context,
    medicalEvaluation:{occurred:false,result:null,date:null}
  };
  rows.push(row);return structuredClone(row);
}
export function recordVeteranMedicalEvaluationInPlace(
  state:GameState,
  approachId:string,
  result:VeteranMedicalEvaluationResult
):VeteranMarketApproach{
  const row=veteranApproaches(state).find(candidate=>candidate.id===approachId);
  if(!row)throw Error("El acercamiento de mercado veterano no existe.");
  if(row.medicalEvaluation.occurred){
    if(row.medicalEvaluation.result!==result)throw Error("La evaluación médica ya quedó registrada con otro resultado.");
    return structuredClone(row);
  }
  row.medicalEvaluation={occurred:true,result,date:state.date};
  return structuredClone(row);
}

export interface VeteranMarketOpportunity {
  id:string;
  reason:string;
  opportunity:VeteranOfferContext["opportunity"];
  club:string;
  leagueTier:number;
  months:number;
  salary:number;
  route:GameState["professional"]["route"];
  abroad:boolean;
  bigClub?:boolean;
  releaseClause?:number|null;
  sportingRole?:string|null;
  ancillaryRole?:string|null;
  validThrough?:string;
}

/**
 * Explicit market-owned materializer for factual veteran opportunities.
 * It never invents a destination: callers must provide the concrete opportunity.
 */
export function materializeVeteranCareerOfferFromOpportunity(
  state:GameState,
  opportunity:VeteranMarketOpportunity
):CareerOffer|null{
  if(state.age<34||state.retirement.status!=="playing"||state.market?.pending)return null;
  const employment=employmentStatus(state);
  if(employment==="expired_pending_resolution")return null;
  if(opportunity.opportunity==="short_term"&&employment!=="unattached")return null;
  if(!opportunity.id||!opportunity.reason||!opportunity.club)return null;
  if(opportunity.leagueTier<1||opportunity.leagueTier>5||opportunity.months<=0||opportunity.salary<0)return null;
  const currentClub=state.professional.registrationClub;
  const external=opportunity.club!==currentClub;
  const approach=external?getVeteranMarketApproaches(state).find(row=>row.id===opportunity.id&&row.club===opportunity.club):undefined;
  if(external&&!approach)return null;
  if(approach?.medicalEvaluation.occurred&&approach.medicalEvaluation.result==="failed")return null;
  if(opportunity.opportunity==="renewal"&&opportunity.club!==currentClub)return null;
  if(opportunity.opportunity==="transfer"&&opportunity.club===currentClub)return null;
  if(opportunity.opportunity==="short_term"&&opportunity.months>6)return null;
  if(opportunity.opportunity==="lower_level"&&opportunity.leagueTier<=state.professional.leagueTier)return null;
  if(opportunity.opportunity==="high_value"&&opportunity.salary<=num(state.contract.salaryMonthly))return null;
  if(opportunity.opportunity==="home_return"){
    const priorClubs=new Set(state.history.map(row=>row.club));
    const former=state.employment?.previous?.registrationClub;
    if(former)priorClubs.add(former);
    if(opportunity.club===currentClub||!priorClubs.has(opportunity.club))return null;
  }
  const context:VeteranOfferContext={
    kind:"veteran_offer",
    opportunity:opportunity.opportunity,
    approachId:approach?.id??null,
    sportingRole:opportunity.sportingRole??null,
    ancillaryRole:opportunity.ancillaryRole??null
  };
  return proposeCareerChange(state,opportunity.reason,draft=>{
    draft.club=opportunity.club;
    draft.tier=opportunity.leagueTier;
    draft.professional.registrationClub=opportunity.club;
    draft.professional.ownerClub=opportunity.club;
    draft.professional.leagueTier=opportunity.leagueTier;
    draft.professional.route=opportunity.route;
    draft.contract.monthsRemaining=opportunity.months;
    draft.contract.salaryMonthly=opportunity.salary;
    draft.contract.releaseClause=opportunity.releaseClause??null;
    draft.flags.LOAN_ACTIVE=false;
    draft.flags.ABROAD_ROUTE=opportunity.abroad;
    draft.flags.BIG_CLUB=opportunity.bigClub??false;
  },{
    context,
    ...(opportunity.validThrough?{validThrough:opportunity.validThrough}:{}),
    allowVeteranShortTerm:opportunity.opportunity==="short_term"
  });
}

/** Deterministic same-club producer used by the late-career world simulation. */
export function materializeVeteranRenewalInPlace(state:GameState):CareerOffer|null{
  if(state.age<34||state.retirement.status!=="playing"||state.market?.pending)return null;
  if(!["contracted","loaned"].includes(employmentStatus(state)))return null;
  const months=num(state.contract.monthsRemaining);
  if(months<=0||months>6)return null;
  const demand=veteranMarketDemand(state);
  if(demand<28)return null;
  const threshold=clamp(.18+demand/160,0.18,0.72);
  if(stableRoll(state,"renewal")>=threshold)return null;
  const duration=demand>=62?24:12;
  const factor=clamp(.62+demand/180,.62,1.08);
  const salary=Math.max(900,Math.round(num(state.contract.salaryMonthly,900)*factor));
  return materializeVeteranCareerOfferFromOpportunity(state,{
    id:`renewal:${state.date}:${state.club}`,
    reason:"Oferta veterana de continuidad",
    opportunity:demand>=58?"leadership_project":"renewal",
    club:state.club,
    leagueTier:state.professional.leagueTier,
    months:duration,
    salary,
    route:state.professional.route,
    abroad:state.flags.ABROAD_ROUTE===true,
    bigClub:state.flags.BIG_CLUB===true,
    releaseClause:typeof state.contract.releaseClause==="number"?state.contract.releaseClause:null,
    sportingRole:demand>=58?"Referente veterano del vestuario":null,
    ancillaryRole:null,
    validThrough:addDays(state.date,14)
  });
}

/**
 * Narrow post-announcement emergency producer. Market can create the offer; retirement
 * state remains owned elsewhere and is never reversed here.
 */
export function materializePostAnnouncementEmergencyOffer(
  state:GameState,
  opportunity:VeteranMarketOpportunity
):CareerOffer|null{
  if(state.age<34||state.retirement.status!=="announced"||state.retirement.closedDate!==null||state.market?.pending)return null;
  if(!opportunity.id||!opportunity.club||opportunity.opportunity==="short_term")return null;
  const approach=getVeteranMarketApproaches(state).find(row=>row.id===opportunity.id&&row.club===opportunity.club);
  if(!approach||approach.medicalEvaluation.result==="failed")return null;
  const context:VeteranOfferContext={
    kind:"veteran_offer",
    opportunity:opportunity.opportunity,
    approachId:approach.id,
    sportingRole:opportunity.sportingRole??null,
    ancillaryRole:opportunity.ancillaryRole??null
  };
  return proposePostAnnouncementCareerChange(state,opportunity.reason,draft=>{
    draft.club=opportunity.club;
    draft.tier=opportunity.leagueTier;
    draft.professional.registrationClub=opportunity.club;
    draft.professional.ownerClub=opportunity.club;
    draft.professional.leagueTier=opportunity.leagueTier;
    draft.professional.route=opportunity.route;
    draft.contract.monthsRemaining=opportunity.months;
    draft.contract.salaryMonthly=opportunity.salary;
    draft.contract.releaseClause=opportunity.releaseClause??null;
    draft.flags.LOAN_ACTIVE=false;
    draft.flags.ABROAD_ROUTE=opportunity.abroad;
    draft.flags.BIG_CLUB=opportunity.bigClub??false;
  },{
    context,
    ...(opportunity.validThrough?{validThrough:opportunity.validThrough}:{})
  });
}
