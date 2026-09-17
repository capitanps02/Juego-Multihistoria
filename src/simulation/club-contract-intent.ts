import type { GameState } from "../core/types.js";
import { lockerSlotAffinity } from "./locker-leadership.js";

export const CLUB_WANTS_RENEWAL_FACT = "facts.clubWantsRenewal" as const;
export const LOCKER_CAPTAIN_AFFINITY_FACT = "facts.lockerCaptainAffinity" as const;
export const LOCKER_STAR_AFFINITY_FACT = "facts.lockerStarAffinity" as const;
export const ROLE_DROP_SINCE_23_FACT = "facts.roleDropSince23" as const;
export const ROLE_GUARANTEE_AT_23_FACT = "facts.roleGuaranteeAt23" as const;
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

/**
 * Raw factual drop from the role snapshot captured on entering age 23.
 * The shared fact deliberately does not decide what drop is narratively material.
 */
export function roleDropSince23(state: GameState): number {
  if (state.age < 23 || !state.professional.initializedAt23) return 0;
  return Math.max(0, num(state.professional.roleScoreAt23) - num(state.sport.roleScore));
}

/**
 * Exact persisted evidence that the canonical age-23 bridge established a concrete
 * sporting-role expectation. This is a historical-instance read: terminal seed state
 * does not erase that conversation, while generic seed presence is insufficient.
 */
export function hasRoleGuaranteeAt23(state: GameState): boolean {
  if (state.age < 23) return false;
  return state.seeds.some(seed =>
    seed.id === "SEED_ELITE_ROLE_BARGAIN"
    && seed.originEvent === "EVT_23_BRIDGE_001"
    && seed.payload.stance === "role_guarantees"
  );
}

export interface NarrativeCausalFacts {
  clubWantsRenewal: boolean;
  lockerCaptainAffinity: number | null;
  lockerStarAffinity: number | null;
  roleDropSince23: number;
  roleGuaranteeAt23: boolean;
}

export function narrativeCausalFacts(state: GameState): NarrativeCausalFacts {
  return {
    clubWantsRenewal: clubWantsRenewal(state),
    lockerCaptainAffinity: lockerSlotAffinity(state, "captain"),
    lockerStarAffinity: lockerSlotAffinity(state, "star"),
    roleDropSince23: roleDropSince23(state),
    roleGuaranteeAt23: hasRoleGuaranteeAt23(state)
  };
}

/**
 * Shallow read-only projection used only for Condition resolution. Nested GameState
 * objects are not cloned or mutated; the synthetic `facts` namespace is never saved.
 */
export function narrativeConditionRoot(state: GameState): GameState & { facts: NarrativeCausalFacts } {
  return Object.assign({}, state, { facts: narrativeCausalFacts(state) });
}
