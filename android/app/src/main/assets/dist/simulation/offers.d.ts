import type { GameState } from "../core/types.js";
export declare const FORMAL_RENEWAL_REASON = "Renovaci\u00F3n de contrato";
export interface CareerTerms {
    club: string;
    tier: number;
    months: number;
    salary: number;
    releaseClause: number | null;
    ownerClub: string;
    registrationClub: string;
    leagueTier: number;
    prestigeTier: number;
    prestigeScore: number;
    route: GameState["professional"]["route"];
    abroad: boolean;
    loan: boolean;
    bigClub: boolean;
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
    /** Factual market-approach provenance for external offers; null for same-club renewal authority. */
    approachId: string | null;
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
    /** Legacy/UI projection of the first live formal offer. */
    pending: CareerOffer | null;
    /** Authoritative 0..N live formal-offer collection. Absent in historical saves. */
    openOffers?: CareerOffer[];
    history: OfferDecision[];
    /** Optional extensions keep schema-8 historical saves valid. */
    systemClosures?: SystemOfferClosure[];
    negotiationSequence?: number;
    futureNegotiations?: FutureEmploymentNegotiation[];
    futureAgreements?: FutureCareerAgreement[];
}
export declare function marketState(s: GameState): MarketState;
export declare function careerTerms(s: GameState): CareerTerms;
export declare function sameCareerTerms(a: CareerTerms, b: CareerTerms): boolean;
export declare function isCareerOfferContext(value: unknown): value is CareerOfferContext;
export declare function careerOfferKind(offer: CareerOffer): CareerOfferKind;
export declare function getActiveCareerOffers(s: GameState): readonly CareerOffer[];
export declare function getEligibleCareerOffers(s: GameState): readonly CareerOffer[];
export declare function getEligibleLateRichOffers(s: GameState): readonly CareerOffer[];
export declare function eligibleCareerOfferKind(s: GameState): CareerOfferKind | null;
export declare function getEligibleTransferOffers(s: GameState): readonly CareerOffer[];
export declare function getEligibleLoanOffers(s: GameState): readonly CareerOffer[];
export declare function getEligibleRenewalOffers(s: GameState): readonly CareerOffer[];
export declare function contractEmploymentStatus(s: GameState): ContractEmploymentStatus;
export declare function applyTerms(s: GameState, t: CareerTerms): void;
export interface CareerOfferOptions {
    context?: CareerOfferContext;
    validThrough?: string; /** Internal veteran exception; never inferred from age alone. */
    allowVeteranShortTerm?: boolean;
}
export declare function proposeCareerChange(s: GameState, reason: string, propose: (draft: GameState) => void, contextOrOptions?: CareerOfferContext | CareerOfferOptions): CareerOffer | null;
/** Explicit exceptional producer for a formal offer after public retirement announcement. */
export declare function proposePostAnnouncementCareerChange(s: GameState, reason: string, propose: (draft: GameState) => void, contextOrOptions?: CareerOfferContext | CareerOfferOptions): CareerOffer | null;
export declare function proposeLateRichCareerOffer(s: GameState, reason: string, propose: (draft: GameState) => void, context: LateRichOfferContext, validThrough?: string): CareerOffer | null;
export declare function closeCareerOfferBySystem(s: GameState, id: string, reason: SystemOfferCloseReason, source?: SystemOfferClosure["source"]): SystemOfferClosure;
export declare function closePendingOfferBySystem(s: GameState, reason: SystemOfferCloseReason, source?: SystemOfferClosure["source"]): SystemOfferClosure;
export declare function withdrawCareerOffer(s: GameState, id: string): SystemOfferClosure;
export declare function expireCareerOfferInPlace(s: GameState): SystemOfferClosure | null;
export declare function supersedePendingCareerOffer(s: GameState, reason: string, propose: (draft: GameState) => void, contextOrOptions?: CareerOfferContext | CareerOfferOptions): CareerOffer | null;
export declare function offerLifecycleStatus(s: GameState, id: string): "open" | "accepted" | "rejected" | "countered" | "deferred" | "expired" | "withdrawn" | "superseded" | null;
export declare function respondToOffer(s: GameState, id: string, disposition: OfferDisposition, source?: Omit<NarrativeOfferSource, "disposition">): OfferDecision;
export interface BosmanEligibility {
    eligible: boolean;
    effectiveDate: string | null;
    reason: "eligible" | "not_playing" | "not_employed" | "not_january" | "outside_final_six_months" | "future_employment_already_signed";
}
export declare function bosmanEligibility(s: GameState): BosmanEligibility;
export declare function registerBosmanNegotiation(s: GameState, reason: string, destination: string, propose: (draft: GameState) => void): FutureEmploymentNegotiation;
/** Bosman/future-employment negotiation layer. These are not current-employment offers and cannot mutate live CareerTerms. */
export declare function registerFutureEmploymentNegotiation(s: GameState, reason: string, destination: string, propose: (draft: GameState) => void): FutureEmploymentNegotiation;
export declare function getOpenFutureEmploymentNegotiations(s: GameState): readonly FutureEmploymentNegotiation[];
export declare function closeFutureEmploymentNegotiation(s: GameState, id: string, reason: "rejected" | "withdrawn" | "superseded"): FutureEmploymentNegotiation;
export declare function signFutureEmploymentAgreement(s: GameState, negotiationId: string, effectiveDate: string, source?: Omit<NarrativeOfferSource, "disposition">): FutureCareerAgreement;
export declare function getFutureCareerAgreements(s: GameState): readonly FutureCareerAgreement[];
export declare function activateFutureCareerAgreementsInPlace(s: GameState): FutureCareerAgreement[];
