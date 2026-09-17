import type { GameState } from "../core/types.js";
import { type EarlyCareerSeedFacts } from "../narrative/seed-memory.js";
import { type PlayerClubLeadershipRole } from "./player-leadership-authority.js";
import { FORMAL_RENEWAL_REASON, type CareerOfferKind, type CareerTerms } from "./offers.js";
import { type CurrentMatchContext, type SportContext } from "./sport-context.js";
export { FORMAL_RENEWAL_REASON };
export declare const CLUB_WANTS_RENEWAL_FACT: "facts.clubWantsRenewal";
export declare const LOCKER_CAPTAIN_AFFINITY_FACT: "facts.lockerCaptainAffinity";
export declare const LOCKER_STAR_AFFINITY_FACT: "facts.lockerStarAffinity";
export declare const ROLE_DROP_SINCE_23_FACT: "facts.roleDropSince23";
export declare const ROLE_GUARANTEE_AT_23_FACT: "facts.roleGuaranteeAt23";
export declare const PENDING_CAREER_OFFER_KIND_FACT: "facts.pendingCareerOfferKind";
export declare const PENDING_CAREER_OFFER_FACT: "facts.pendingCareerOffer";
export declare const PLAYER_CLUB_LEADERSHIP_ROLE_FACT: "facts.playerClubLeadership.currentRole";
export declare const PLAYER_CLUB_MAIN_CAPTAIN_HISTORY_FACT: "facts.playerClubLeadership.hasCertifiedMainCaptainHistory";
export declare const CLUB_RENEWAL_INTENT_MAX_MONTHS = 24;
export declare const CLUB_RENEWAL_INTENT_THRESHOLD = 0.5;
export declare function clubRenewalPropensity(state: GameState): number;
export declare function hasFormalClubRenewalOffer(state: GameState): boolean;
export declare function clubWantsRenewal(state: GameState): boolean;
export declare function roleDropSince23(state: GameState): number;
export declare function hasRoleGuaranteeAt23(state: GameState): boolean;
export interface PlayerClubLeadershipFacts {
    currentRole: PlayerClubLeadershipRole | null;
    hasCertifiedMainCaptainHistory: boolean;
}
export declare function playerClubLeadershipFacts(state: GameState): PlayerClubLeadershipFacts;
export interface PendingCareerOfferFacts {
    id: string;
    kind: CareerOfferKind;
    date: string;
    reason: string;
    terms: Readonly<CareerTerms>;
}
export declare function pendingCareerOfferFacts(state: GameState): PendingCareerOfferFacts | null;
export interface NarrativeCausalFacts extends EarlyCareerSeedFacts {
    clubWantsRenewal: boolean;
    lockerCaptainAffinity: number | null;
    lockerStarAffinity: number | null;
    roleDropSince23: number;
    roleGuaranteeAt23: boolean;
    pendingCareerOfferKind: CareerOfferKind | null;
    pendingCareerOffer: PendingCareerOfferFacts | null;
    playerClubLeadership: PlayerClubLeadershipFacts;
    sport: SportContext;
    match: CurrentMatchContext;
}
export declare function narrativeCausalFacts(state: GameState): NarrativeCausalFacts;
export declare function narrativeConditionRoot(state: GameState): GameState & {
    facts: NarrativeCausalFacts;
};
