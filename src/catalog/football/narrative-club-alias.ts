import type { GameState } from "../../core/types.js";
import { selectMarketDestination, type MarketDestinationProfile } from "./market-destination.js";

export type NarrativeClubAlias = "NEW_CLUB" | "DEVELOPMENT_CLUB" | "HIGHER_CLUB" | "BIG_CLUB";

const ALIASES = new Set<NarrativeClubAlias>([
  "NEW_CLUB",
  "DEVELOPMENT_CLUB",
  "HIGHER_CLUB",
  "BIG_CLUB"
]);

export function isNarrativeClubAlias(value: unknown): value is NarrativeClubAlias {
  return typeof value === "string" && ALIASES.has(value as NarrativeClubAlias);
}

function hashString(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function aliasProfile(alias: NarrativeClubAlias): MarketDestinationProfile {
  if (alias === "DEVELOPMENT_CLUB") return "development";
  if (alias === "HIGHER_CLUB" || alias === "BIG_CLUB") return "ambitious";
  return "balanced";
}

function aliasTier(state: GameState, alias: NarrativeClubAlias, requestedTier: number | null): number {
  if (requestedTier !== null && Number.isFinite(requestedTier)) {
    return Math.max(1, Math.min(9, Math.trunc(requestedTier)));
  }
  if (alias === "BIG_CLUB") return 1;
  if (alias === "HIGHER_CLUB") return Math.max(1, Math.trunc(state.tier) - 1);
  if (alias === "DEVELOPMENT_CLUB") return Math.min(4, Math.max(1, Math.trunc(state.tier) + 1));
  return Math.max(1, Math.min(9, Math.trunc(state.tier)));
}

export interface NarrativeClubAliasContext {
  eventId: string;
  choiceId: string;
  targetTier: number | null;
}

/**
 * Compatibility materializer for canonical legacy event aliases.
 *
 * Event definitions remain untouched, so contentIdentity/fingerprints do not change.
 * Selection is a pure hash projection and consumes zero narrative/football RNG draws.
 */
export function materializeNarrativeClubAlias(
  state: GameState,
  alias: NarrativeClubAlias,
  context: NarrativeClubAliasContext
): string {
  const tier = aliasTier(state, alias, context.targetTier);
  const roll = hashString([
    state.rngState.narrative.seed,
    state.date,
    state.season,
    context.eventId,
    context.choiceId,
    alias
  ].join("|"));

  return selectMarketDestination({
    countryCode: "ESP",
    leagueTier: tier,
    roll,
    profile: aliasProfile(alias),
    excludeClubIds: [
      state.club,
      state.professional.ownerClub,
      state.professional.registrationClub
    ]
  }).id;
}
