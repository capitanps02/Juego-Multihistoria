import type { GameState } from "../core/types.js";
import { earlyCareerSeedFacts, type EarlyCareerSeedFacts } from "../narrative/seed-memory.js";
import { lockerSlotAffinity } from "./locker-leadership.js";
import {
  careerOfferKind,
  eligibleCareerOfferKind,
  FORMAL_RENEWAL_REASON,
  getEligibleCareerOffers,
  isCareerOfferContext,
  type CareerOfferContext,
  type CareerOfferKind,
  type CareerTerms
} from "./offers.js";
import { getCurrentMatchContext, getSportContext, type CurrentMatchContext, type SportContext } from "./sport-context.js";
import { getSportMatchModelStore } from "./match-model.js";
import { resolveActiveAgent, resolveCurrentClubInstitutionalNpc } from "./npc-authority.js";

export { FORMAL_RENEWAL_REASON };
export const CLUB_WANTS_RENEWAL_FACT = "facts.clubWantsRenewal" as const;
export const LOCKER_CAPTAIN_AFFINITY_FACT = "facts.lockerCaptainAffinity" as const;
export const LOCKER_STAR_AFFINITY_FACT = "facts.lockerStarAffinity" as const;
export const ROLE_DROP_SINCE_23_FACT = "facts.roleDropSince23" as const;
export const ROLE_GUARANTEE_AT_23_FACT = "facts.roleGuaranteeAt23" as const;
export const PENDING_CAREER_OFFER_KIND_FACT = "facts.pendingCareerOfferKind" as const;
export const PENDING_CAREER_OFFER_FACT = "facts.pendingCareerOffer" as const;
export const CLUB_RENEWAL_INTENT_MAX_MONTHS = 24;
export const CLUB_RENEWAL_INTENT_THRESHOLD = 0.50;

const clamp = (x: number, min = 0, max = 1) => Math.min(max, Math.max(min, x));
const num = (x: unknown, fallback = 0) => typeof x === "number" ? x : fallback;

/**
 * Club-side renewal propensity already used by the world simulation when a formal
 * renewal can be materialised. Keeping the policy in this domain module gives the
 * narrative layer a causal fact instead of asking content to infer club intent from
 * unrelated flags or player-facing outcomes.
 */
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

/** A materialised, still-compatible same-club renewal is direct evidence of club renewal intent. */
export function hasFormalClubRenewalOffer(state: GameState): boolean {
  const offer = state.market?.pending;
  if (!offer || offer.reason !== FORMAL_RENEWAL_REASON || eligibleCareerOfferKind(state) !== "renewal") return false;
  return offer.before.club === offer.terms.club
    && offer.before.ownerClub === offer.terms.ownerClub;
}

/**
 * Authoritative read-only club fact for canonical narrative gates.
 *
 * It is true when a formal same-club renewal is already pending, or when the club's
 * existing renewal policy has crossed the explicit intent threshold while the player
 * is within an early-renewal horizon. It consumes no RNG and mutates no GameState.
 */
export function clubWantsRenewal(state: GameState): boolean {
  if (hasFormalClubRenewalOffer(state)) return true;
  if (state.retirement.status !== "playing") return false;
  if (state.age < 20 || state.age >= 34) return false;
  if (state.flags.CONTRACT_DISPUTE) return false;

  const months = num(state.contract.monthsRemaining);
  if (months <= 0 || months > CLUB_RENEWAL_INTENT_MAX_MONTHS) return false;

  return clubRenewalPropensity(state) >= CLUB_RENEWAL_INTENT_THRESHOLD;
}

/**
 * Raw factual drop from the role snapshot captured when the age-23 professional
 * state is initialized. This shared fact deliberately does not define how large a
 * drop must be before a narrative scene considers it material.
 */
export function roleDropSince23(state: GameState): number {
  if (state.age < 23 || !state.professional.initializedAt23) return 0;
  return Math.max(0, num(state.professional.roleScoreAt23) - num(state.sport.roleScore));
}

/**
 * Historical evidence that the canonical age-23 bridge established a concrete role
 * expectation. This is intentionally a persisted-history read: terminality or later
 * consumption does not erase that the conversation happened. Generic seed presence,
 * other origins and the other three bridge stances are not sufficient.
 */
export function hasRoleGuaranteeAt23(state: GameState): boolean {
  if (state.age < 23) return false;
  return state.seeds.some(seed =>
    seed.id === "SEED_ELITE_ROLE_BARGAIN"
    && seed.originEvent === "EVT_23_BRIDGE_001"
    && seed.payload.stance === "role_guarantees"
  );
}

/**
 * Exact, detached projection of the one formal offer that is still compatible with
 * live CareerTerms. Narrative conditions can inspect destination, salary, duration,
 * release clause, registration semantics and explicitly frozen narrative context
 * without receiving mutation authority. Stale offers fail closed to null.
 */
export interface PendingCareerOfferFacts {
  id: string;
  kind: CareerOfferKind;
  date: string;
  reason: string;
  terms: Readonly<CareerTerms>;
  context?: Readonly<CareerOfferContext>;
}
export function pendingCareerOfferFacts(state: GameState): PendingCareerOfferFacts | null {
  const offer = getEligibleCareerOffers(state)[0];
  if (!offer) return null;
  return {
    id: offer.id,
    kind: careerOfferKind(offer),
    date: offer.date,
    reason: offer.reason,
    terms: structuredClone(offer.terms),
    ...(isCareerOfferContext(offer.context) ? { context: structuredClone(offer.context) } : {})
  };
}

export interface CoachPromiseWaitFacts {
  choiceDate: string;
  club: string;
  officialMatchesElapsed: number;
  complete: boolean;
}

export function coachPromiseWaitFacts(state: GameState): CoachPromiseWaitFacts | null {
  let choice: GameState["history"][number] | null = null;
  for (let i = state.history.length - 1; i >= 0; i -= 1) {
    const row = state.history[i]!;
    if (row.eventId === "EVT_20_CCH_001" && row.choiceId === "WAIT_THREE_MATCHES") {
      choice = row;
      break;
    }
  }
  if (!choice) return null;
  const store = getSportMatchModelStore(state);
  const elapsed = store
    ? store.fixtures.filter(row => row.official === true && row.date > choice!.date && row.date <= state.date && row.club === choice!.club).length
    : 0;
  return { choiceDate: choice.date, club: choice.club, officialMatchesElapsed: elapsed, complete: elapsed >= 3 };
}

export interface NarrativeCausalFacts extends EarlyCareerSeedFacts {
  clubWantsRenewal: boolean;
  lockerCaptainAffinity: number | null;
  lockerStarAffinity: number | null;
  roleDropSince23: number;
  roleGuaranteeAt23: boolean;
  activeAgentNpcId: string | null;
  currentClubInstitutionalNpcId: string | null;
  /** Compatible formal offer kind for deterministic event/choice gating; null includes stale offers. */
  pendingCareerOfferKind: CareerOfferKind | null;
  /** Exact detached formal-offer projection; null includes no offer and stale offers. */
  pendingCareerOffer: PendingCareerOfferFacts | null;
  coachPromiseWait: CoachPromiseWaitFacts | null;
  /** Authoritative/read-only sporting projection. Unavailable sporting facts are null. */
  sport: SportContext;
  /** Current match projection. Fails closed until a real match producer exists. */
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
    activeAgentNpcId: resolveActiveAgent(state),
    currentClubInstitutionalNpcId: resolveCurrentClubInstitutionalNpc(state),
    pendingCareerOfferKind: eligibleCareerOfferKind(state),
    pendingCareerOffer: pendingCareerOfferFacts(state),
    coachPromiseWait: coachPromiseWaitFacts(state),
    sport: getSportContext(state),
    match: getCurrentMatchContext(state)
  };
}

/**
 * Shallow read-only projection used only for Condition resolution. Nested GameState
 * objects are not cloned or mutated; the synthetic `facts` namespace is never saved.
 */
export function narrativeConditionRoot(state: GameState): GameState & { facts: NarrativeCausalFacts } {
  return Object.assign({}, state, { facts: narrativeCausalFacts(state) });
}
