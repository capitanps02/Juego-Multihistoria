import type { GameState } from "../core/types.js";
import {
  activateEmploymentFromAcceptedTermsInPlace,
  employmentStatus
} from "./employment.js";

export const FORMAL_RENEWAL_REASON = "Renovación de contrato";

export interface CareerTerms {
  club: string; tier: number; months: number; salary: number; releaseClause: number | null;
  ownerClub: string; registrationClub: string; leagueTier: number;
  prestigeTier: number; prestigeScore: number; route: GameState["professional"]["route"];
  abroad: boolean; loan: boolean; bigClub: boolean;
}

export interface LateRichOfferContext {
  kind: "late_rich_offer";
  housing: string;
  calendar: string;
  commercialRole: string;
}
export interface VeteranOfferContext {
  kind: "veteran_offer";
  opportunity: "renewal" | "transfer" | "lower_level" | "home_return" | "high_value" | "short_term" | "leadership_project";
  sportingRole: string | null;
  ancillaryRole: string | null;
}
export type CareerOfferContext = LateRichOfferContext | VeteranOfferContext;

export interface CareerOffer {
  id: string;
  date: string;
  reason: string;
  before: CareerTerms;
  terms: CareerTerms;
  context?: CareerOfferContext;
  /** Optional deterministic deadline. Offers without it retain the established blocking-decision policy. */
  validThrough?: string;
}
export type CareerOfferKind = "renewal" | "transfer" | "loan" | "loan_return" | "loan_conversion";
export type ContractEmploymentStatus = "active_contract" | "expiring" | "unattached" | "expired_pending_resolution" | "retired";
export type OfferAction = "accept" | "reject" | "delegate";
export type OfferDisposition = OfferAction | "counter" | "defer";

export interface NarrativeOfferSource {
  kind: "narrative_choice";
  historyIndex: number;
  eventId: string;
  choiceId: string;
  disposition: OfferDisposition;
}
export interface OfferDecision {
  offer: CareerOffer;
  action: OfferAction;
  accepted: boolean;
  explanation: string;
  source?: NarrativeOfferSource;
}

export type SystemOfferCloseReason = "expired" | "withdrawn" | "superseded";
export interface SystemOfferClosure {
  offer: CareerOffer;
  reason: SystemOfferCloseReason;
  date: string;
  source: "calendar" | "producer" | "system";
}

export type FutureNegotiationStatus = "open" | "rejected" | "withdrawn" | "superseded" | "signed";
export interface FutureEmploymentNegotiation {
  id: string;
  date: string;
  reason: string;
  destination: string;
  /** Current-employment snapshot when formal negotiations opened. */
  before: CareerTerms;
  terms: CareerTerms;
  status: FutureNegotiationStatus;
  closedDate: string | null;
}
export interface FutureCareerAgreement {
  negotiationId: string;
  terms: CareerTerms;
  signedDate: string;
  effectiveDate: string;
  status: "signed_future" | "activated";
  activatedDate: string | null;
  source?: NarrativeOfferSource;
}

export interface MarketState {
  version: 1;
  sequence: number;
  pending: CareerOffer | null;
  history: OfferDecision[];
  /** Optional extensions keep schema-8 historical saves valid. */
  systemClosures?: SystemOfferClosure[];
  negotiationSequence?: number;
  futureNegotiations?: FutureEmploymentNegotiation[];
  futureAgreements?: FutureCareerAgreement[];
}

const clone=<T>(value:T):T=>structuredClone(value);

export function marketState(s: GameState): MarketState {
  return s.market ??= { version: 1, sequence: 0, pending: null, history: [] };
}
function closures(m:MarketState):SystemOfferClosure[]{return m.systemClosures??=[];}
function negotiations(m:MarketState):FutureEmploymentNegotiation[]{return m.futureNegotiations??=[];}
function agreements(m:MarketState):FutureCareerAgreement[]{return m.futureAgreements??=[];}

export function careerTerms(s: GameState): CareerTerms {
  const p=s.professional;
  return {club:s.club,tier:s.tier,months:Number(s.contract.monthsRemaining),salary:Number(s.contract.salaryMonthly),releaseClause:typeof s.contract.releaseClause==="number"?s.contract.releaseClause:null,
    ownerClub:p.ownerClub,registrationClub:p.registrationClub,leagueTier:p.leagueTier,
    prestigeTier:p.clubPrestigeTier,prestigeScore:p.clubPrestigeScore,route:p.route,
    abroad:!!s.flags.ABROAD_ROUTE,loan:!!s.flags.LOAN_ACTIVE,bigClub:!!s.flags.BIG_CLUB};
}
export function sameCareerTerms(a:CareerTerms,b:CareerTerms):boolean{return JSON.stringify(a)===JSON.stringify(b);}
function boundedContextText(value:unknown):value is string{return typeof value==="string"&&value.length>0&&value.length<=500;}
export function isCareerOfferContext(value:unknown):value is CareerOfferContext{
  if(value===null||typeof value!=="object"||Array.isArray(value))return false;
  const context=value as Record<string,unknown>;
  if(context.kind==="late_rich_offer"){
    if(Object.keys(context).sort().join()!=="calendar,commercialRole,housing,kind")return false;
    return boundedContextText(context.housing)&&boundedContextText(context.calendar)&&boundedContextText(context.commercialRole);
  }
  if(context.kind==="veteran_offer"){
    if(Object.keys(context).sort().join()!=="ancillaryRole,kind,opportunity,sportingRole")return false;
    if(!["renewal","transfer","lower_level","home_return","high_value","short_term","leadership_project"].includes(String(context.opportunity)))return false;
    return (context.sportingRole===null||boundedContextText(context.sportingRole))
      &&(context.ancillaryRole===null||boundedContextText(context.ancillaryRole));
  }
  return false;
}

export function careerOfferKind(offer:CareerOffer):CareerOfferKind{
  const {before,terms}=offer;
  if(terms.loan)return "loan";
  if(before.loan&&!terms.loan&&terms.club===before.ownerClub&&terms.ownerClub===before.ownerClub)return "loan_return";
  if(before.loan&&!terms.loan&&terms.club===before.registrationClub&&terms.ownerClub===before.registrationClub)return "loan_conversion";
  if(terms.club!==before.club||terms.ownerClub!==before.ownerClub||terms.registrationClub!==before.registrationClub)return "transfer";
  return "renewal";
}
export function getActiveCareerOffers(s:GameState):readonly CareerOffer[]{const p=s.market?.pending;return p?[clone(p)]:[];}
export function getEligibleCareerOffers(s:GameState):readonly CareerOffer[]{const current=careerTerms(s);return getActiveCareerOffers(s).filter(o=>sameCareerTerms(current,o.before));}
export function getEligibleLateRichOffers(s:GameState):readonly CareerOffer[]{return getEligibleCareerOffers(s).filter(o=>isCareerOfferContext(o.context)&&o.context.kind==="late_rich_offer");}
export function eligibleCareerOfferKind(s:GameState):CareerOfferKind|null{const o=getEligibleCareerOffers(s)[0];return o?careerOfferKind(o):null;}
export function getEligibleTransferOffers(s:GameState):readonly CareerOffer[]{return getEligibleCareerOffers(s).filter(o=>careerOfferKind(o)==="transfer");}
export function getEligibleLoanOffers(s:GameState):readonly CareerOffer[]{return getEligibleCareerOffers(s).filter(o=>careerOfferKind(o)==="loan");}
export function getEligibleRenewalOffers(s:GameState):readonly CareerOffer[]{return getEligibleCareerOffers(s).filter(o=>careerOfferKind(o)==="renewal");}

export function contractEmploymentStatus(s:GameState):ContractEmploymentStatus{
  if(s.retirement.status!=="playing")return "retired";
  const status=employmentStatus(s);
  if(status==="unattached")return "unattached";
  if(status==="expired_pending_resolution")return "expired_pending_resolution";
  const months=Number(s.contract.monthsRemaining);
  if(months<=0)return "expired_pending_resolution";
  return months<=6?"expiring":"active_contract";
}

function renewalWasRejectedFromSameTerms(market:MarketState,reason:string,before:CareerTerms):boolean{
  if(reason!==FORMAL_RENEWAL_REASON)return false;
  return market.history.some(decision=>{
    const disposition=decision.source?.disposition??decision.action;
    return !decision.accepted&&disposition==="reject"&&decision.offer.reason===reason&&sameCareerTerms(decision.offer.before,before);
  });
}
export function applyTerms(s:GameState,t:CareerTerms):void{
  s.club=t.club;s.tier=t.tier;s.contract.monthsRemaining=t.months;s.contract.salaryMonthly=t.salary;s.contract.releaseClause=t.releaseClause;
  Object.assign(s.professional,{ownerClub:t.ownerClub,registrationClub:t.registrationClub,leagueTier:t.leagueTier,clubPrestigeTier:t.prestigeTier,clubPrestigeScore:t.prestigeScore,route:t.route});
  s.world.ownerClub=t.ownerClub;
  Object.assign(s.flags,{ABROAD_ROUTE:t.abroad,LOAN_ACTIVE:t.loan,BIG_CLUB:t.bigClub});
}

export interface CareerOfferOptions { context?: CareerOfferContext; validThrough?: string; /** Internal veteran exception; never inferred from age alone. */ allowVeteranShortTerm?: boolean; }
function normalizeOptions(value?:CareerOfferContext|CareerOfferOptions):CareerOfferOptions{
  if(!value)return {};
  return "kind" in value?{context:value}:value;
}
function validDateText(value:string):boolean{return /^\d{4}-\d{2}-\d{2}$/.test(value)&&!Number.isNaN(Date.parse(value+"T00:00:00Z"));}
function materializeCareerOffer(
  s:GameState,
  reason:string,
  propose:(draft:GameState)=>void,
  contextOrOptions:CareerOfferContext|CareerOfferOptions|undefined,
  allowAnnounced:boolean
):CareerOffer|null{
  const market=marketState(s);
  const retirementAllowed=s.retirement.status==="playing"||(allowAnnounced&&s.retirement.status==="announced");
  if(market.pending||!retirementAllowed)return null;
  const options=normalizeOptions(contextOrOptions);
  if(options.context!==undefined&&!isCareerOfferContext(options.context))throw Error("Contexto formal de oferta no válido.");
  if(options.validThrough!==undefined&&(!validDateText(options.validThrough)||options.validThrough<s.date))throw Error("Fecha límite de oferta no válida.");
  if(options.allowVeteranShortTerm&&s.age<34)throw Error("La excepción de contrato corto es exclusivamente veterana.");
  const draft=clone(s),before=careerTerms(s);
  propose(draft);
  const terms=careerTerms(draft);
  if(sameCareerTerms(before,terms))return null;
  if(renewalWasRejectedFromSameTerms(market,reason,before))return null;
  if(terms.club===before.club&&(terms.leagueTier!==before.leagueTier||terms.prestigeTier!==before.prestigeTier)){
    terms.club=`Club ${terms.leagueTier} · ${terms.prestigeTier}`;terms.ownerClub=terms.registrationClub=terms.club;terms.loan=false;terms.abroad=false;terms.route="domestic";
  }
  if(terms.club!==before.club){
    terms.registrationClub=terms.club;
    if(!terms.loan)terms.ownerClub=terms.club;
    const minimumMonths=options.allowVeteranShortTerm?1:(terms.loan?12:24);
    terms.months=Math.max(minimumMonths,terms.months);
    if(!terms.loan)terms.releaseClause=null;
  }
  terms.registrationClub=terms.club;if(!terms.loan)terms.ownerClub=terms.club;terms.tier=terms.leagueTier;
  const offer:CareerOffer={id:`offer:${++market.sequence}`,date:s.date,reason,before,terms,...(options.context?{context:clone(options.context)}:{}),...(options.validThrough?{validThrough:options.validThrough}:{})};
  market.pending=offer;
  return clone(offer);
}
export function proposeCareerChange(
  s:GameState,
  reason:string,
  propose:(draft:GameState)=>void,
  contextOrOptions?:CareerOfferContext|CareerOfferOptions
):CareerOffer|null{
  return materializeCareerOffer(s,reason,propose,contextOrOptions,false);
}
/** Explicit exceptional producer for a formal offer after public retirement announcement. */
export function proposePostAnnouncementCareerChange(
  s:GameState,
  reason:string,
  propose:(draft:GameState)=>void,
  contextOrOptions?:CareerOfferContext|CareerOfferOptions
):CareerOffer|null{
  if(s.retirement.status!=="announced")return null;
  return materializeCareerOffer(s,reason,propose,contextOrOptions,true);
}
export function proposeLateRichCareerOffer(
  s:GameState,reason:string,propose:(draft:GameState)=>void,context:LateRichOfferContext,validThrough?:string
):CareerOffer|null{
  return proposeCareerChange(s,reason,propose,{context,validThrough});
}

export function closePendingOfferBySystem(
  s:GameState,reason:SystemOfferCloseReason,source:SystemOfferClosure["source"]="system"
):SystemOfferClosure{
  const market=marketState(s),offer=market.pending;
  if(!offer)throw Error("Esta oferta ya no está pendiente.");
  market.pending=null;
  const row:SystemOfferClosure={offer:clone(offer),reason,date:s.date,source};
  closures(market).push(row);
  return clone(row);
}
export function withdrawCareerOffer(s:GameState,id:string):SystemOfferClosure{
  if(s.market?.pending?.id!==id)throw Error("Esta oferta ya no está pendiente.");
  return closePendingOfferBySystem(s,"withdrawn","producer");
}
export function expireCareerOfferInPlace(s:GameState):SystemOfferClosure|null{
  const offer=s.market?.pending;
  if(!offer?.validThrough||offer.validThrough>=s.date)return null;
  return closePendingOfferBySystem(s,"expired","calendar");
}
export function supersedePendingCareerOffer(
  s:GameState,
  reason:string,
  propose:(draft:GameState)=>void,
  contextOrOptions?:CareerOfferContext|CareerOfferOptions
):CareerOffer|null{
  const current=s.market?.pending;
  if(!current)return proposeCareerChange(s,reason,propose,contextOrOptions);
  const preview=clone(s);
  if(preview.market)preview.market.pending=null;
  const candidate=proposeCareerChange(preview,reason,propose,contextOrOptions);
  if(!candidate)return null;
  closePendingOfferBySystem(s,"superseded","producer");
  return proposeCareerChange(s,reason,propose,contextOrOptions);
}
export function offerLifecycleStatus(s:GameState,id:string):"open"|"accepted"|"rejected"|"countered"|"deferred"|"expired"|"withdrawn"|"superseded"|null{
  const market=s.market;if(!market)return null;
  if(market.pending?.id===id)return "open";
  const d=market.history.find(x=>x.offer.id===id);
  if(d){if(d.accepted)return "accepted";const disposition=d.source?.disposition??d.action;return disposition==="counter"?"countered":disposition==="defer"?"deferred":"rejected";}
  return market.systemClosures?.find(x=>x.offer.id===id)?.reason??null;
}

export function respondToOffer(
  s:GameState,id:string,disposition:OfferDisposition,source?:Omit<NarrativeOfferSource,"disposition">
):OfferDecision{
  const market=marketState(s),offer=market.pending;
  if(!offer||offer.id!==id)throw Error("Esta oferta ya no está pendiente.");
  if(!["accept","reject","delegate","counter","defer"].includes(disposition))throw Error("Respuesta de oferta no válida.");
  if((disposition==="counter"||disposition==="defer")&&!source)throw Error("Contraofertar o aplazar requiere una decisión narrativa identificada.");
  if(!sameCareerTerms(careerTerms(s),offer.before))throw Error("Las condiciones han cambiado; la oferta ya no corresponde a esta partida.");
  const action:OfferAction=disposition==="counter"||disposition==="defer"?"reject":disposition;
  const accepted=action==="accept"||(action==="delegate"&&offer.terms.salary>=offer.before.salary&&offer.terms.months>=12&&offer.terms.leagueTier<=offer.before.leagueTier);
  const explanation=disposition==="delegate"?`Delegación para esta oferta: ${accepted?"aceptada":"rechazada"}. Criterio: no bajar salario ni categoría y asegurar al menos 12 meses.`
    :disposition==="counter"?"Has planteado una contraoferta. El contrato actual sigue vigente hasta que exista una nueva propuesta formal."
    :disposition==="defer"?"Has aplazado la firma. El contrato actual sigue vigente y esta propuesta deja de estar pendiente."
    :accepted?"Has aceptado la oferta. Las nuevas condiciones ya están en vigor.":"Has rechazado la oferta. Conservas tus condiciones actuales.";
  if(accepted){applyTerms(s,offer.terms);activateEmploymentFromAcceptedTermsInPlace(s);}
  const narrativeSource=source?{...clone(source),disposition}:undefined;
  const decision:OfferDecision={offer:clone(offer),action,accepted,explanation,...(narrativeSource?{source:narrativeSource}:{})};
  market.history.push(decision);market.pending=null;
  return clone(decision);
}

export interface BosmanEligibility {
  eligible: boolean;
  effectiveDate: string | null;
  reason: "eligible" | "not_playing" | "not_employed" | "not_january" | "outside_final_six_months" | "future_employment_already_signed";
}
export function bosmanEligibility(s:GameState):BosmanEligibility{
  if(s.retirement.status!=="playing")return {eligible:false,effectiveDate:null,reason:"not_playing"};
  const status=employmentStatus(s);
  if(status!=="contracted"&&status!=="loaned")return {eligible:false,effectiveDate:null,reason:"not_employed"};
  if(s.date.slice(5,7)!=="01")return {eligible:false,effectiveDate:null,reason:"not_january"};
  const months=Number(s.contract.monthsRemaining);
  if(months<1||months>6)return {eligible:false,effectiveDate:null,reason:"outside_final_six_months"};
  if((s.market?.futureAgreements??[]).some(x=>x.status==="signed_future"))return {eligible:false,effectiveDate:null,reason:"future_employment_already_signed"};
  return {eligible:true,effectiveDate:`${s.date.slice(0,4)}-07-01`,reason:"eligible"};
}
export function registerBosmanNegotiation(
  s:GameState,
  reason:string,
  destination:string,
  propose:(draft:GameState)=>void
):FutureEmploymentNegotiation{
  const eligibility=bosmanEligibility(s);
  if(!eligibility.eligible)throw Error(`Bosman no elegible: ${eligibility.reason}.`);
  return registerFutureEmploymentNegotiation(s,reason,destination,propose);
}

/** Bosman/future-employment negotiation layer. These are not current-employment offers and cannot mutate live CareerTerms. */
export function registerFutureEmploymentNegotiation(
  s:GameState,
  reason:string,
  destination:string,
  propose:(draft:GameState)=>void
):FutureEmploymentNegotiation{
  const market=marketState(s);
  if(!destination||!reason)throw Error("Negociación futura sin identidad suficiente.");
  const before=careerTerms(s);
  const draft=clone(s);propose(draft);
  const terms=careerTerms(draft);
  if(sameCareerTerms(before,terms))throw Error("Negociación futura sin términos distintos.");
  if(terms.loan||terms.route==="loan"||terms.route==="free_agent")throw Error("Un precontrato futuro no puede ser cesión ni agente libre.");
  // Future employment is permanent at the destination; callers still own factual
  // league/route/salary inputs, but owner/registration never remain at the old club.
  terms.club=destination;terms.registrationClub=destination;terms.ownerClub=destination;terms.loan=false;terms.tier=terms.leagueTier;
  if(terms.months<=0)throw Error("Un precontrato futuro necesita duración positiva.");
  const sequence=(market.negotiationSequence??0)+1;market.negotiationSequence=sequence;
  const row:FutureEmploymentNegotiation={id:`negotiation:${sequence}`,date:s.date,reason,destination,before:clone(before),terms:clone(terms),status:"open",closedDate:null};
  negotiations(market).push(row);return clone(row);
}
export function getOpenFutureEmploymentNegotiations(s:GameState):readonly FutureEmploymentNegotiation[]{
  return (s.market?.futureNegotiations??[]).filter(x=>x.status==="open").map(clone);
}
export function closeFutureEmploymentNegotiation(s:GameState,id:string,reason:"rejected"|"withdrawn"|"superseded"):FutureEmploymentNegotiation{
  const row=negotiations(marketState(s)).find(x=>x.id===id&&x.status==="open");
  if(!row)throw Error("La negociación futura ya no está abierta.");
  row.status=reason;row.closedDate=s.date;return clone(row);
}
export function signFutureEmploymentAgreement(
  s:GameState,
  negotiationId:string,
  effectiveDate:string,
  source?:Omit<NarrativeOfferSource,"disposition">
):FutureCareerAgreement{
  if(!validDateText(effectiveDate)||effectiveDate<=s.date)throw Error("Fecha efectiva futura no válida.");
  const status=employmentStatus(s);
  if(status!=="contracted"&&status!=="loaned")throw Error("Un precontrato requiere empleo actual vigente.");
  const market=marketState(s),row=negotiations(market).find(x=>x.id===negotiationId&&x.status==="open");
  if(!row)throw Error("La negociación futura ya no está abierta.");
  const current=careerTerms(s);
  if(current.club!==row.before.club||current.ownerClub!==row.before.ownerClub||current.registrationClub!==row.before.registrationClub||current.salary!==row.before.salary){
    throw Error("El empleo actual cambió; la negociación futura ya no corresponde a esta partida.");
  }
  if(agreements(market).some(x=>x.status==="signed_future"))throw Error("Ya existe un empleo futuro firmado.");
  row.status="signed";row.closedDate=s.date;
  const agreement:FutureCareerAgreement={
    negotiationId:row.id,terms:clone(row.terms),signedDate:s.date,effectiveDate,status:"signed_future",activatedDate:null,
    ...(source?{source:{...clone(source),disposition:"accept"}}:{})
  };
  agreements(market).push(agreement);
  for(const other of negotiations(market))if(other.status==="open"){other.status="superseded";other.closedDate=s.date;}
  return clone(agreement);
}
export function getFutureCareerAgreements(s:GameState):readonly FutureCareerAgreement[]{return (s.market?.futureAgreements??[]).map(clone);}
export function activateFutureCareerAgreementsInPlace(s:GameState):FutureCareerAgreement[]{
  const activated:FutureCareerAgreement[]=[];
  for(const agreement of agreements(marketState(s))){
    if(agreement.status!=="signed_future"||agreement.effectiveDate>s.date)continue;
    const status=employmentStatus(s);
    if(status!=="unattached"&&Number(s.contract.monthsRemaining)>0)continue;
    applyTerms(s,agreement.terms);activateEmploymentFromAcceptedTermsInPlace(s);agreement.status="activated";agreement.activatedDate=s.date;activated.push(clone(agreement));
  }
  return activated;
}
