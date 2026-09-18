import type { GameState } from "../core/types.js";

export const FORMAL_RENEWAL_REASON = "Renovación de contrato";

export interface CareerTerms {
  club: string; tier: number; months: number; salary: number; releaseClause: number | null;
  ownerClub: string; registrationClub: string; leagueTier: number;
  prestigeTier: number; prestigeScore: number; route: GameState["professional"]["route"];
  abroad: boolean; loan: boolean; bigClub: boolean;
}
/**
 * Optional frozen narrative context carried by a formal offer.
 *
 * This is deliberately explicit instead of being inferred later from salary, league,
 * reputation or seeds. Historical offers may omit it. New context kinds must be added
 * here rather than smuggled through arbitrary save payloads.
 */
export interface LateRichOfferContext {
  kind: "late_rich_offer";
  housing: string;
  calendar: string;
  commercialRole: string;
}
export type CareerOfferContext = LateRichOfferContext;
export interface CareerOffer { id: string; date: string; reason: string; before: CareerTerms; terms: CareerTerms; context?: CareerOfferContext; }
export type CareerOfferKind = "renewal" | "transfer" | "loan" | "loan_return" | "loan_conversion";
export type ContractEmploymentStatus = "active_contract" | "expiring" | "unattached" | "retired";
/** Direct player actions exposed by the ordinary offer screen and persisted in market.history.action. */
export type OfferAction = "accept" | "reject" | "delegate";
/** Narrative decisions may close an offer without changing the persisted action enum. */
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
  /** Absent for ordinary offer commands; present when a narrative choice consumed the offer. */
  source?: NarrativeOfferSource;
}
export interface MarketState { version: 1; sequence: number; pending: CareerOffer | null; history: OfferDecision[]; }
export function marketState(s: GameState): MarketState {
  return s.market ??= { version: 1, sequence: 0, pending: null, history: [] };
}
export function careerTerms(s: GameState): CareerTerms {
  const p=s.professional;
  return {club:s.club,tier:s.tier,months:Number(s.contract.monthsRemaining),salary:Number(s.contract.salaryMonthly),releaseClause:typeof s.contract.releaseClause==="number"?s.contract.releaseClause:null,
    ownerClub:p.ownerClub,registrationClub:p.registrationClub,leagueTier:p.leagueTier,
    prestigeTier:p.clubPrestigeTier,prestigeScore:p.clubPrestigeScore,route:p.route,
    abroad:!!s.flags.ABROAD_ROUTE,loan:!!s.flags.LOAN_ACTIVE,bigClub:!!s.flags.BIG_CLUB};
}
function sameTerms(a: CareerTerms, b: CareerTerms): boolean {
  return JSON.stringify(a)===JSON.stringify(b);
}
function boundedContextText(value: unknown): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= 500;
}
/** Fail-closed runtime guard for optional persisted offer context. */
export function isCareerOfferContext(value: unknown): value is CareerOfferContext {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const context = value as Record<string, unknown>;
  if (Object.keys(context).sort().join() !== "calendar,commercialRole,housing,kind") return false;
  return context.kind === "late_rich_offer"
    && boundedContextText(context.housing)
    && boundedContextText(context.calendar)
    && boundedContextText(context.commercialRole);
}

/**
 * Read-only semantic classification over the persisted CareerOffer shape.
 * No extra offer type is persisted: historical saves remain schema-compatible.
 */
export function careerOfferKind(offer: CareerOffer): CareerOfferKind {
  const { before, terms } = offer;
  if (terms.loan) return "loan";
  if (before.loan && !terms.loan && terms.club === before.ownerClub && terms.ownerClub === before.ownerClub) return "loan_return";
  if (before.loan && !terms.loan && terms.club === before.registrationClub && terms.ownerClub === before.registrationClub) return "loan_conversion";
  if (terms.club !== before.club || terms.ownerClub !== before.ownerClub || terms.registrationClub !== before.registrationClub) return "transfer";
  return "renewal";
}

/** Returns detached formal offers so callers cannot mutate market.pending accidentally. */
export function getActiveCareerOffers(s: GameState): readonly CareerOffer[] {
  const pending = s.market?.pending;
  return pending ? [structuredClone(pending)] : [];
}
/**
 * Returns only formal offers whose persisted `before` snapshot still matches the live
 * CareerTerms. Results are detached through getActiveCareerOffers(), so callers may
 * inspect exact destination/financial terms without acquiring mutation authority.
 */
export function getEligibleCareerOffers(s: GameState): readonly CareerOffer[] {
  const current = careerTerms(s);
  return getActiveCareerOffers(s).filter(offer => sameTerms(current, offer.before));
}
/**
 * Returns formal late-rich offers only when the producer explicitly froze the canonical
 * side-term context. Salary, league, reputation and seeds never upgrade an ordinary
 * CareerOffer into a rich offer at read time.
 */
export function getEligibleLateRichOffers(s: GameState): readonly CareerOffer[] {
  return getEligibleCareerOffers(s).filter(offer => isCareerOfferContext(offer.context) && offer.context.kind === "late_rich_offer");
}
/**
 * Read-only kind of the one formal offer that is still compatible with the live
 * CareerTerms. A stale pending offer remains inspectable through getActiveCareerOffers
 * but intentionally projects null here so narrative eligibility fails closed.
 */
export function eligibleCareerOfferKind(s: GameState): CareerOfferKind | null {
  const offer = getEligibleCareerOffers(s)[0];
  return offer ? careerOfferKind(offer) : null;
}
export function getEligibleTransferOffers(s: GameState): readonly CareerOffer[] {
  return getEligibleCareerOffers(s).filter(offer => careerOfferKind(offer) === "transfer");
}
export function getEligibleLoanOffers(s: GameState): readonly CareerOffer[] {
  return getEligibleCareerOffers(s).filter(offer => careerOfferKind(offer) === "loan");
}
export function getEligibleRenewalOffers(s: GameState): readonly CareerOffer[] {
  return getEligibleCareerOffers(s).filter(offer => careerOfferKind(offer) === "renewal");
}

/**
 * Read-only employment authority over the existing save schema.
 *
 * A zero-month contract means the player is no longer employed. Club/owner/registration
 * strings remain untouched as historical provenance instead of being rewritten to a
 * fake sentinel, so historical saves resolve immediately without a heuristic migration.
 */
export function contractEmploymentStatus(s: GameState): ContractEmploymentStatus {
  if (s.retirement.status !== "playing") return "retired";
  const months = Number(s.contract.monthsRemaining);
  if (months <= 0) return "unattached";
  if (months <= 6) return "expiring";
  return "active_contract";
}

/** Current club authority; provenance strings do not authorize club behavior when unattached. */
export function currentEmploymentClub(s: GameState): string | null {
  const status = contractEmploymentStatus(s);
  return status === "active_contract" || status === "expiring" ? s.club : null;
}

function renewalWasRejectedFromSameTerms(market: MarketState, reason: string, before: CareerTerms): boolean {
  if(reason!==FORMAL_RENEWAL_REASON)return false;
  return market.history.some(decision=>{
    const disposition=decision.source?.disposition??decision.action;
    return !decision.accepted
      && disposition==="reject"
      && decision.offer.reason===reason
      && sameTerms(decision.offer.before,before);
  });
}
export function applyTerms(s: GameState, t: CareerTerms): void {
  s.club=t.club; s.tier=t.tier; s.contract.monthsRemaining=t.months; s.contract.salaryMonthly=t.salary;s.contract.releaseClause=t.releaseClause;
  Object.assign(s.professional,{ownerClub:t.ownerClub,registrationClub:t.registrationClub,leagueTier:t.leagueTier,
    clubPrestigeTier:t.prestigeTier,clubPrestigeScore:t.prestigeScore,route:t.route});
  s.world.ownerClub=t.ownerClub;
  Object.assign(s.flags,{ABROAD_ROUTE:t.abroad,LOAN_ACTIVE:t.loan,BIG_CLUB:t.bigClub});
}
/** Run the world's proposal on a detached state. No signature or destination leaks. */
export function proposeCareerChange(
  s: GameState,
  reason: string,
  propose: (draft: GameState)=>void,
  context?: CareerOfferContext
): void {
  const market=marketState(s);
  if(market.pending || s.retirement.status!=="playing")return;
  if(context !== undefined && !isCareerOfferContext(context))throw Error("Contexto formal de oferta no válido.");
  const draft=structuredClone(s),before=careerTerms(s);
  propose(draft);
  const terms=careerTerms(draft);
  if(sameTerms(before,terms))return;
  // A direct rejection closes this exact renewal negotiation state. The club may
  // approach again only after the player's current CareerTerms change (for example
  // when another contract month elapses). We evaluate this after the detached
  // proposal so world RNG consumption remains stable even when the reoffer is suppressed.
  if(renewalWasRejectedFromSameTerms(market,reason,before))return;
  // Old market code sometimes only changed prestige. Give that offer an actual destination.
  if(terms.club===before.club && (terms.leagueTier!==before.leagueTier || terms.prestigeTier!==before.prestigeTier)){
    terms.club=`Club ${terms.leagueTier} · ${terms.prestigeTier}`;
    terms.ownerClub=terms.registrationClub=terms.club;terms.loan=false;terms.abroad=false;terms.route="domestic";
  }
  if(terms.club!==before.club){
    terms.registrationClub=terms.club;
    if(!terms.loan)terms.ownerClub=terms.club;
    terms.months=Math.max(terms.loan?12:24,terms.months);
    if(!terms.loan)terms.releaseClause=null;
  }
  terms.registrationClub=terms.club;
  if(!terms.loan)terms.ownerClub=terms.club;
  terms.tier=terms.leagueTier;
  market.pending={id:`offer:${++market.sequence}`,date:s.date,reason,before,terms,...(context?{context:structuredClone(context)}:{})};
}
/**
 * Single authority for closing an offer. Narrative choices may counter/defer, but only
 * accept/delegate are ever allowed to apply CareerTerms. Counter/defer normalize to the
 * persisted reject action while retaining their exact semantics in source.disposition.
 */
export function respondToOffer(
  s: GameState,
  id: string,
  disposition: OfferDisposition,
  source?: Omit<NarrativeOfferSource, "disposition">
): OfferDecision {
  const m=marketState(s),offer=m.pending;
  if(!offer || offer.id!==id)throw Error("Esta oferta ya no está pendiente.");
  if(!["accept","reject","delegate","counter","defer"].includes(disposition))throw Error("Respuesta de oferta no válida.");
  if((disposition==="counter"||disposition==="defer")&&!source)throw Error("Contraofertar o aplazar requiere una decisión narrativa identificada.");
  if(!sameTerms(careerTerms(s),offer.before))throw Error("Las condiciones han cambiado; la oferta ya no corresponde a esta partida.");
  const action: OfferAction = disposition==="counter"||disposition==="defer" ? "reject" : disposition;
  const accepted=action==="accept" || (action==="delegate" && offer.terms.salary>=offer.before.salary && offer.terms.months>=12 && offer.terms.leagueTier<=offer.before.leagueTier);
  const explanation=disposition==="delegate"
    ? `Delegación para esta oferta: ${accepted?"aceptada":"rechazada"}. Criterio: no bajar salario ni categoría y asegurar al menos 12 meses.`
    : disposition==="counter"
      ? "Has planteado una contraoferta. El contrato actual sigue vigente hasta que exista una nueva propuesta formal."
      : disposition==="defer"
        ? "Has aplazado la firma. El contrato actual sigue vigente y esta propuesta deja de estar pendiente."
        : accepted
          ? "Has aceptado la oferta. Las nuevas condiciones ya están en vigor."
          : "Has rechazado la oferta. Conservas tus condiciones actuales.";
  if(accepted)applyTerms(s,offer.terms);
  const narrativeSource = source ? { ...structuredClone(source), disposition } : undefined;
  const decision: OfferDecision={offer:structuredClone(offer),action,accepted,explanation,...(narrativeSource?{source:narrativeSource}:{})};
  m.history.push(decision);m.pending=null;
  return decision;
}
