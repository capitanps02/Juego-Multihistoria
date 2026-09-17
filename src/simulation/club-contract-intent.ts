import type { GameState } from "../core/types.js";
import { lockerSlotAffinity } from "./locker-leadership.js";
import { getCurrentMatchContext, getSportContext, type CurrentMatchContext, type SportContext } from "./sport-context.js";

export const CLUB_WANTS_RENEWAL_FACT = "facts.clubWantsRenewal" as const;
export const LOCKER_CAPTAIN_AFFINITY_FACT = "facts.lockerCaptainAffinity" as const;
export const LOCKER_STAR_AFFINITY_FACT = "facts.lockerStarAffinity" as const;
export const CLUB_RENEWAL_INTENT_MAX_MONTHS = 24;
export const CLUB_RENEWAL_INTENT_THRESHOLD = 0.50;
export const FORMAL_RENEWAL_REASON = "Renovación de contrato";

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

/** A materialised same-club renewal offer is direct evidence of club renewal intent. */
export function hasFormalClubRenewalOffer(state: GameState): boolean {
  const offer = state.market?.pending;
  if (!offer || offer.reason !== FORMAL_RENEWAL_REASON) return false;
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

export interface NarrativeCausalFacts {
  clubWantsRenewal: boolean;
  lockerCaptainAffinity: number | null;
  lockerStarAffinity: number | null;
  /** Authoritative/read-only sporting projection. Unavailable sporting facts are null. */
  sport: SportContext;
  /** Current match projection. Fails closed until a real match producer exists. */
  match: CurrentMatchContext;
}

export function narrativeCausalFacts(state: GameState): NarrativeCausalFacts {
  return {
    clubWantsRenewal: clubWantsRenewal(state),
    lockerCaptainAffinity: lockerSlotAffinity(state, "captain"),
    lockerStarAffinity: lockerSlotAffinity(state, "star"),
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
