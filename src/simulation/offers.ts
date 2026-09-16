import type { GameState } from "../core/types.js";

export interface CareerTerms {
  club: string; tier: number; months: number; salary: number; releaseClause: number | null;
  ownerClub: string; registrationClub: string; leagueTier: number;
  prestigeTier: number; prestigeScore: number; route: GameState["professional"]["route"];
  abroad: boolean; loan: boolean; bigClub: boolean;
}
export interface CareerOffer { id: string; date: string; reason: string; before: CareerTerms; terms: CareerTerms; }
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
export function applyTerms(s: GameState, t: CareerTerms): void {
  s.club=t.club; s.tier=t.tier; s.contract.monthsRemaining=t.months; s.contract.salaryMonthly=t.salary;s.contract.releaseClause=t.releaseClause;
  Object.assign(s.professional,{ownerClub:t.ownerClub,registrationClub:t.registrationClub,leagueTier:t.leagueTier,
    clubPrestigeTier:t.prestigeTier,clubPrestigeScore:t.prestigeScore,route:t.route});
  s.world.ownerClub=t.ownerClub;
  Object.assign(s.flags,{ABROAD_ROUTE:t.abroad,LOAN_ACTIVE:t.loan,BIG_CLUB:t.bigClub});
}
/** Run the world's proposal on a detached state. No signature or destination leaks. */
export function proposeCareerChange(s: GameState, reason: string, propose: (draft: GameState)=>void): void {
  const market=marketState(s);
  if(market.pending || s.retirement.status!=="playing")return;
  const draft=structuredClone(s),before=careerTerms(s);
  propose(draft);
  const terms=careerTerms(draft);
  if(JSON.stringify(before)===JSON.stringify(terms))return;
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
  market.pending={id:`offer:${++market.sequence}`,date:s.date,reason,before,terms};
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
  if(JSON.stringify(careerTerms(s))!==JSON.stringify(offer.before))throw Error("Las condiciones han cambiado; la oferta ya no corresponde a esta partida.");
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