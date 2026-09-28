import {
  FOOTBALL_DIVISIONS,
  FOOTBALL_SELECTOR_PROFILE_CONTRACT,
  clubsForCountry,
  clubsForDivision,
  divisionById,
  footballClubBalanceMetadata,
  footballClubSelectorProfile,
  nearestDivisionForCountry
} from "./index.js";
import type { FootballClub, FootballCountryCode } from "./types.js";

export type MarketDestinationProfile = "development" | "balanced" | "ambitious";

export interface MarketDestinationRequest {
  countryCode: FootballCountryCode;
  leagueTier: number;
  roll: number;
  profile: MarketDestinationProfile;
  excludeClubIds?: readonly string[];
}

const BAND_RANK = Object.freeze({
  development: 0,
  lower: 1,
  mid: 2,
  upper: 3,
  continental: 4,
  elite: 5
} as const);

function ambitionComposite(club: FootballClub): number {
  return (club.prestige + club.financialPower + club.internationalAttraction) / 3;
}

function divisionFor(club: FootballClub) {
  const division = divisionById(club.divisionId);
  if (!division) throw new Error(`Football catalog club ${club.id} references unknown division ${club.divisionId}.`);
  return division;
}

function profileScore(club: FootballClub, profile: MarketDestinationProfile): number {
  if (profile === "development") {
    return club.developmentBias * 0.45
      + club.youthQuality * 0.35
      + (100 - club.pressure) * 0.15
      + (100 - club.prestige) * 0.05;
  }
  if (profile === "ambitious") {
    return club.prestige * 0.45
      + club.financialPower * 0.30
      + club.internationalAttraction * 0.25;
  }
  return club.prestige * 0.30
    + club.developmentBias * 0.25
    + club.financialPower * 0.20
    + club.youthQuality * 0.20
    + (100 - club.pressure) * 0.05;
}

function deterministicPick(
  pool: readonly FootballClub[],
  roll: number,
  score?: (club: FootballClub) => number
): FootballClub {
  if (pool.length === 0) throw new Error("No football-catalog destination candidates.");
  const ranked = [...pool].sort((a, b) => {
    if (score) {
      const delta = score(b) - score(a);
      if (delta !== 0) return delta;
    }
    return a.id.localeCompare(b.id);
  });
  return ranked[(roll >>> 0) % ranked.length]!;
}

function eligibleProfilePool(
  pool: readonly FootballClub[],
  profile: MarketDestinationProfile
): readonly FootballClub[] {
  if (profile === "development") {
    const strict = pool.filter(club => {
      const division = divisionFor(club);
      const meta = footballClubBalanceMetadata(club, division);
      return meta.band === "development";
    });
    if (strict.length > 0) return strict;

    const profileMatches = pool.filter(club =>
      footballClubSelectorProfile(club, divisionFor(club)) === "development"
    );
    return profileMatches.length > 0 ? profileMatches : pool;
  }

  if (profile === "ambitious") {
    const minimum = FOOTBALL_SELECTOR_PROFILE_CONTRACT.AMBITIOUS.minAmbitionComposite;
    const strict = pool.filter(club => {
      const division = divisionFor(club);
      const meta = footballClubBalanceMetadata(club, division);
      return (
        meta.selectorProfile === "ambitious"
        && (meta.band === "continental" || meta.band === "upper")
        && ambitionComposite(club) >= minimum
        && !isBigClubCandidate(club)
      );
    });
    if (strict.length > 0) return strict;

    const semanticFallback = pool.filter(club => {
      const meta = footballClubBalanceMetadata(club, divisionFor(club));
      return (
        (meta.band === "continental" || meta.band === "upper")
        && ambitionComposite(club) >= minimum
        && !isBigClubCandidate(club)
      );
    });
    return semanticFallback.length > 0 ? semanticFallback : pool.filter(club => !isBigClubCandidate(club));
  }

  const balanced = pool.filter(club =>
    footballClubSelectorProfile(club, divisionFor(club)) === "balanced"
  );
  return balanced.length > 0 ? balanced : pool;
}

/**
 * A2's BIG_CLUB semantic contract. A3 consumes it; it does not redefine it.
 */
export function isBigClubCandidate(club: FootballClub): boolean {
  const division = divisionFor(club);
  if (club.tier !== 1) return false;
  const meta = footballClubBalanceMetadata(club, division);
  if (meta.band === "elite") return true;
  if (meta.band !== "continental") return false;

  const top = FOOTBALL_SELECTOR_PROFILE_CONTRACT.BIG_CLUB.topContinental;
  return (
    club.prestige >= top.minPrestige
    && club.internationalAttraction >= top.minInternationalAttraction
    && division.strength >= top.minDivisionStrength
  );
}

/**
 * Identity projection only. Opportunity existence, live tier, contract terms and
 * acceptance remain owned by the calling market authority.
 */
export function selectMarketDestination(request: MarketDestinationRequest): FootballClub {
  const division = nearestDivisionForCountry(request.countryCode, request.leagueTier);
  if (!division) throw new Error(`No football-catalog division for ${request.countryCode}.`);

  const excluded = new Set(request.excludeClubIds ?? []);
  const basePool = clubsForDivision(division.id).filter(club => !excluded.has(club.id));
  if (basePool.length === 0) throw new Error(`No football-catalog market destination for ${division.id}.`);

  const pool = eligibleProfilePool(basePool, request.profile);
  if (pool.length === 0) throw new Error(`No ${request.profile} market destination for ${division.id}.`);
  return deterministicPick(pool, request.roll, club => profileScore(club, request.profile));
}

export interface BigClubDestinationRequest {
  countryCode: FootballCountryCode;
  roll: number;
  excludeClubIds?: readonly string[];
}

export function selectBigClubDestination(request: BigClubDestinationRequest): FootballClub {
  const excluded = new Set(request.excludeClubIds ?? []);
  const pool = clubsForCountry(request.countryCode)
    .filter(club => !excluded.has(club.id))
    .filter(isBigClubCandidate);
  if (pool.length === 0) throw new Error(`No A2 BIG_CLUB candidate for ${request.countryCode}.`);
  return deterministicPick(
    pool,
    request.roll,
    club => club.prestige * 0.50 + club.internationalAttraction * 0.30 + club.financialPower * 0.20
  );
}

export interface HigherClubDestinationRequest {
  countryCode: FootballCountryCode;
  currentClubId: string;
  currentLeagueTier: number;
  targetLeagueTier: number;
  roll: number;
  excludeClubIds?: readonly string[];
}

/**
 * HIGHER_CLUB is relative by A2 contract: >=5 prestige improvement, or a stronger
 * competitive band backed by a stronger league/tier context.
 */
export function selectHigherClubDestination(request: HigherClubDestinationRequest): FootballClub {
  const targetDivision = nearestDivisionForCountry(request.countryCode, request.targetLeagueTier);
  if (!targetDivision) throw new Error(`No target division for HIGHER_CLUB in ${request.countryCode}.`);

  const excluded = new Set(request.excludeClubIds ?? []);
  const currentClub = clubsForCountry(request.countryCode).find(club => club.id === request.currentClubId) ?? null;
  const currentDivision = currentClub
    ? divisionFor(currentClub)
    : nearestDivisionForCountry(request.countryCode, request.currentLeagueTier);
  const currentMeta = currentClub && currentDivision
    ? footballClubBalanceMetadata(currentClub, currentDivision)
    : null;

  const allowedBands = new Set<string>(FOOTBALL_SELECTOR_PROFILE_CONTRACT.HIGHER_CLUB.expectedBands);
  const minPrestigeDelta = FOOTBALL_SELECTOR_PROFILE_CONTRACT.HIGHER_CLUB.minPrestigeDelta;

  const pool = clubsForDivision(targetDivision.id)
    .filter(club => !excluded.has(club.id))
    .filter(club => {
      const meta = footballClubBalanceMetadata(club, targetDivision);
      if (!allowedBands.has(meta.band)) return false;

      const prestigeImprovement = currentClub
        ? club.prestige >= currentClub.prestige + minPrestigeDelta
        : false;
      const strongerBand = currentMeta
        ? BAND_RANK[meta.band] > BAND_RANK[currentMeta.band]
        : false;
      const strongerLeagueContext = currentDivision
        ? targetDivision.tier < request.currentLeagueTier || targetDivision.strength > currentDivision.strength
        : targetDivision.tier < request.currentLeagueTier;

      return prestigeImprovement || (strongerBand && strongerLeagueContext) || (!currentClub && strongerLeagueContext);
    });

  if (pool.length === 0) {
    throw new Error(
      `No A2 HIGHER_CLUB candidate improves ${request.currentClubId} at ${request.countryCode}/tier ${request.targetLeagueTier}.`
    );
  }

  return deterministicPick(pool, request.roll, club => {
    const meta = footballClubBalanceMetadata(club, targetDivision);
    const bandGain = currentMeta ? BAND_RANK[meta.band] - BAND_RANK[currentMeta.band] : 1;
    const prestigeGain = currentClub ? club.prestige - currentClub.prestige : club.prestige;
    return bandGain * 20 + prestigeGain + targetDivision.strength * 0.10;
  });
}

export interface ForeignMarketDestinationRequest {
  leagueTier: number;
  roll: number;
  profile: MarketDestinationProfile;
  excludeClubIds?: readonly string[];
}

function mix32(value: number): number {
  let x = value >>> 0;
  x ^= x >>> 16;
  x = Math.imul(x, 0x7feb352d);
  x ^= x >>> 15;
  x = Math.imul(x, 0x846ca68b);
  x ^= x >>> 16;
  return x >>> 0;
}

/**
 * Equal-weight the represented country contexts first, so countries with more
 * catalog clubs/divisions do not dominate merely because their arrays are larger.
 */
export function selectForeignMarketDestination(request: ForeignMarketDestinationRequest): FootballClub {
  const requestedTier = Number.isFinite(request.leagueTier)
    ? Math.max(1, Math.min(9, Math.trunc(request.leagueTier)))
    : 3;
  const countryCodes = [...new Set(
    FOOTBALL_DIVISIONS
      .filter(division => division.countryCode !== "ESP")
      .map(division => division.countryCode)
  )].sort();

  const contexts = countryCodes
    .map(countryCode => ({ countryCode, division: nearestDivisionForCountry(countryCode, requestedTier) }))
    .filter((row): row is { countryCode: FootballCountryCode; division: NonNullable<typeof row.division> } => row.division !== null);
  if (contexts.length === 0) throw new Error("Football catalog has no foreign market destinations.");

  const minimumDistance = Math.min(...contexts.map(row => Math.abs(row.division.tier - requestedTier)));
  const candidates = contexts.filter(row => Math.abs(row.division.tier - requestedTier) === minimumDistance);
  const selectedCountry = candidates[mix32(request.roll ^ 0x9e3779b9) % candidates.length]!.countryCode;

  return selectMarketDestination({
    countryCode: selectedCountry,
    leagueTier: requestedTier,
    roll: mix32(request.roll ^ 0x85ebca6b),
    profile: request.profile,
    excludeClubIds: request.excludeClubIds
  });
}

export interface ForeignBigClubDestinationRequest {
  roll: number;
  excludeClubIds?: readonly string[];
}

export function selectForeignBigClubDestination(request: ForeignBigClubDestinationRequest): FootballClub {
  const excluded = new Set(request.excludeClubIds ?? []);
  const countries = [...new Set(
    FOOTBALL_DIVISIONS
      .filter(division => division.countryCode !== "ESP")
      .map(division => division.countryCode)
  )]
    .filter(countryCode =>
      clubsForCountry(countryCode).some(club => !excluded.has(club.id) && isBigClubCandidate(club))
    )
    .sort();
  if (countries.length === 0) throw new Error("Football catalog has no foreign BIG_CLUB candidates.");

  const countryCode = countries[mix32(request.roll ^ 0x27d4eb2f) % countries.length]!;
  return selectBigClubDestination({
    countryCode,
    roll: mix32(request.roll ^ 0x165667b1),
    excludeClubIds: request.excludeClubIds
  });
}
