import type { GameState } from "../core/types.js";
import { earlyCareerSeedFacts, type EarlyCareerSeedFacts } from "../narrative/seed-memory.js";
import { lockerSlotAffinity } from "./locker-leadership.js";
import {
  listCertifiedPlayerClubLeadership,
  resolveCurrentPlayerClubLeadership,
  type PlayerClubLeadershipRole
} from "./player-leadership-authority.js";
import {
  careerOfferKind,
  eligibleCareerOfferKind,
  FORMAL_RENEWAL_REASON,
  getEligibleCareerOffers,
  type CareerOfferKind,
  type CareerTerms
} from "./offers.js";
import { getCurrentMatchContext, getSportContext, type CurrentMatchContext, type SportContext } from "./sport-context.js";

export { FORMAL_RENEWAL_REASON };
export const CLUB_WANTS_RENEWAL_FACT = "facts.clubWantsRenewal" as const;
export const LOCKER_CAPTAIN_AFFINITY_FACT = "facts.lockerCaptainAffinity" as const;
export const LOCKER_STAR_AFFINITY_FACT = "facts.lockerStarAffinity" as const;
export const ROLE_DROP_SINCE_23_FACT = "facts.roleDropSince23" as const;
export const ROLE_GUARANTEE_AT_23_FACT = "facts.roleGuaranteeAt23" as const;
export const PENDING_CAREER_OFFER_KIND_FACT = "facts.pendingCareerOfferKind" as const;
export const PENDING_CAREER_OFFER_FACT = "facts.pendingCareerOffer" as const;
export const PLAYER_CLUB_LEADERSHIP_ROLE_FACT = "facts.playerClubLeadership.currentRole" as const;
export const PLAYER_CLUB_MAIN_CAPTAIN_HISTORY_FACT = "facts.playerClubLeadership.hasCertifiedMainCaptainHistory" as const;
export const CLUB_RENEWAL_INTENT_MAX_MONTHS = 24;
export const CLUB_RENEWAL_INTENT_THRESHOLD = 0.50;

const clamp = (x: number, min = 0, max = 1) => Math.min(max, Math.max(min, x));
const num = (x: unknown, fallback = 0) => typeof x === "number" ? x : fallback;

export function clubRenewalPropensity(state: GameState): number {
  const p = state.professional;
  return clamp(
    0.20
      + num(p.institutionalTrust) / 220
      + num(p.roleSecurity) / 280
      - Math.max(0, num(p.contractPower) - 65) / 230,
    0.16,
    0.68
  );
}

export function hasFormalClubRenewalOffer(state: GameState): boolean {
  const offer = state.market?.pending;
  if (!offer || offer.reason !== FORMAL_RENEWAL_REASON || eligibleCareerOfferKind(state) !== "renewal") return false;
  return offer.before.club === offer.terms.club
    && offer.before.ownerClub === offer.terms.ownerClub;
}

export function clubWantsRenewal(state: GameState): boolean {
  if (hasFormalClubRenewalOffer(state)) return true;
  if (state.retirement.status !== "playing") return false;
  if (state.age < 20 || state.age >= 34) return false;
  if (state.flags.CONTRACT_DISPUTE) return false;

  const months = num(state.contract.monthsRemaining);
  if (months <= 0 || months > CLUB_RENEWAL_INTENT_MAX_MONTHS) return false;

  return clubRenewalPropensity(state) >= CLUB_RENEWAL_INTENT_THRESHOLD;
}

export function roleDropSince23(state: GameState): number {
  if (state.age < 23 || !state.professional.initializedAt23) return 0;
  return Math.max(0, num(state.professional.roleScoreAt23) - num(state.sport.roleScore));
}

export function hasRoleGuaranteeAt23(state: GameState): boolean {
  if (state.age < 23) return false;
  return state.seeds.some(seed =>
    seed.id === "SEED_ELITE_ROLE_BARGAIN"
    && seed.originEvent === "EVT_23_BRIDGE_001"
    && seed.payload.stance === "role_guarantees"
  );
}

export interface PlayerClubLeadershipFacts {
  currentRole: PlayerClubLeadershipRole | null;
  hasCertifiedMainCaptainHistory: boolean;
}

export function playerClubLeadershipFacts(state: GameState): PlayerClubLeadershipFacts {
  const current = resolveCurrentPlayerClubLeadership(state);
  return {
    currentRole: current?.role ?? null,
    hasCertifiedMainCaptainHistory: listCertifiedPlayerClubLeadership(state)
      .some(row => row.role === "captain")
  };
}

export interface PendingCareerOfferFacts {
  id: string;
  kind: CareerOfferKind;
  date: string;
  reason: string;
  terms: Readonly<CareerTerms>;
}

export function pendingCareerOfferFacts(state: GameState): PendingCareerOfferFacts | null {
  const offer = getEligibleCareerOffers(state)[0];
  if (!offer) return null;
  return {
    id: offer.id,
    kind: careerOfferKind(offer),
    date: offer.date,
    reason: offer.reason,
    terms: structuredClone(offer.terms)
  };
}

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

export function narrativeCausalFacts(state: GameState): NarrativeCausalFacts {
  return {
    ...earlyCareerSeedFacts(state),
    clubWantsRenewal: clubWantsRenewal(state),
    lockerCaptainAffinity: lockerSlotAffinity(state, "captain"),
    lockerStarAffinity: lockerSlotAffinity(state, "star"),
    roleDropSince23: roleDropSince23(state),
    roleGuaranteeAt23: hasRoleGuaranteeAt23(state),
    pendingCareerOfferKind: eligibleCareerOfferKind(state),
    pendingCareerOffer: pendingCareerOfferFacts(state),
    playerClubLeadership: playerClubLeadershipFacts(state),
    sport: getSportContext(state),
    match: getCurrentMatchContext(state)
  };
}

export function narrativeConditionRoot(state: GameState): GameState & { facts: NarrativeCausalFacts } {
  return Object.assign({}, state, { facts: narrativeCausalFacts(state) });
}
