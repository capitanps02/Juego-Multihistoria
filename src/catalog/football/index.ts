export type {
  ClubArchetype,
  FootballCatalogIssue,
  FootballClubReferenceClassification,
  FootballClubReferenceContext,
  FootballClubReferenceKind,
  FootballConfederation,
  FootballCountryCode,
  FootballClub,
  FootballDivision
} from "./types.js";
export type {
  FootballBalanceAttribute,
  FootballClubBand,
  FootballLeagueGroup,
  FootballSelectorProfile
} from "./balance.js";
export {
  FOOTBALL_CLUB_BANDS,
  FOOTBALL_SELECTOR_PROFILES,
  FOOTBALL_SELECTOR_PROFILE_CONTRACT,
  footballBandAttributeModifier,
  footballClubBalanceMetadata,
  footballClubBandFor,
  footballClubSelectorProfile,
  footballLeagueGroupForStrength,
  footballStructuralCoefficient
} from "./balance.js";
export { FOOTBALL_CLUBS, FOOTBALL_DIVISIONS, FOOTBALL_CATALOG_VERSION } from "./world.js";
export {
  FOOTBALL_CATALOG_CLUB_ID_PATTERN,
  catalogMultiClubIdentityKey,
  defaultCatalogClubId,
  stableCatalogClubId
} from "./identity.js";
export {
  FOOTBALL_CLEARANCE_STATUSES,
  FOOTBALL_CLUB_ARCHETYPES,
  FOOTBALL_CONFEDERATIONS,
  FOOTBALL_COUNTRY_CODES,
  assertFootballCatalogData,
  footballCatalogStructuralFingerprint,
  inspectFootballCatalogData
} from "./integrity.js";

import { FOOTBALL_CLUBS, FOOTBALL_DIVISIONS } from "./world.js";
import { inspectFootballCatalogData } from "./integrity.js";
import type {
  FootballCatalogIssue,
  FootballClubReferenceClassification,
  FootballClubReferenceContext,
  FootballClubReferenceKind,
  FootballCountryCode,
  FootballClub,
  FootballDivision
} from "./types.js";

const CLUB_BY_ID = new Map(FOOTBALL_CLUBS.map(club => [club.id, club] as const));
const DIVISION_BY_ID = new Map(FOOTBALL_DIVISIONS.map(division => [division.id, division] as const));
const EMPTY_CLUBS: readonly FootballClub[] = Object.freeze([]);
const EMPTY_DIVISIONS: readonly FootballDivision[] = Object.freeze([]);

const CANONICAL_SPECIAL_CLUB_IDS = Object.freeze(["UDV"] as const);
const NARRATIVE_CLUB_ALIASES = Object.freeze([
  "NEW_CLUB",
  "DEVELOPMENT_CLUB",
  "DEVELOPMENT_CLUB_2",
  "HIGHER_CLUB",
  "BIG_CLUB",
  "FOREIGN_DEV_CLUB"
] as const);
const LEGACY_NAMED_CLUB_IDS = Object.freeze(["Aurora CF"] as const);

const CANONICAL_SPECIAL_SET = new Set<string>(CANONICAL_SPECIAL_CLUB_IDS);
const NARRATIVE_ALIAS_SET = new Set<string>(NARRATIVE_CLUB_ALIASES);
const LEGACY_NAMED_SET = new Set<string>(LEGACY_NAMED_CLUB_IDS);
const LEGACY_PATTERNS: readonly RegExp[] = Object.freeze([
  /^SIM_OPP_(?:\d+_(?:\d+|TEST)|TEST)$/i,
  /^(?:Development|Domestic|Summer|Foreign|Loan)_\d+_\d+$/i,
  /^Club \d+ · \d+$/
]);

const ALLOWED_REFERENCE_KINDS: Readonly<Record<FootballClubReferenceContext, ReadonlySet<FootballClubReferenceKind>>> =
  Object.freeze({
    new_production: new Set<FootballClubReferenceKind>(["catalog", "canonical_special"]),
    historical_read: new Set<FootballClubReferenceKind>(["catalog", "canonical_special", "legacy_compat"]),
    canonical_content: new Set<FootballClubReferenceKind>(["catalog", "canonical_special", "narrative_alias"])
  });

function freezeGrouped<K, V>(rows: readonly V[], keyOf: (row: V) => K): Map<K, readonly V[]> {
  const mutable = new Map<K, V[]>();
  for (const row of rows) {
    const key = keyOf(row);
    const bucket = mutable.get(key);
    if (bucket) bucket.push(row);
    else mutable.set(key, [row]);
  }
  const indexed = new Map<K, readonly V[]>();
  for (const [key, bucket] of mutable) indexed.set(key, Object.freeze(bucket.slice()));
  return indexed;
}

const CLUBS_BY_DIVISION = freezeGrouped(FOOTBALL_CLUBS, club => club.divisionId);
const CLUBS_BY_COUNTRY = freezeGrouped(FOOTBALL_CLUBS, club => club.countryCode);
const DIVISIONS_BY_COUNTRY = freezeGrouped(FOOTBALL_DIVISIONS, division => division.countryCode);

const NEAREST_DIVISION = new Map<string, FootballDivision>();
for (const [countryCode, divisions] of DIVISIONS_BY_COUNTRY) {
  for (let requested = 1; requested <= 9; requested += 1) {
    let selected: FootballDivision | null = null;
    for (const division of divisions) {
      if (!selected) {
        selected = division;
        continue;
      }
      const distance = Math.abs(division.tier - requested) - Math.abs(selected.tier - requested);
      if (distance < 0 || (distance === 0 && division.tier > selected.tier)) selected = division;
    }
    if (selected) NEAREST_DIVISION.set(`${countryCode}:${requested}`, selected);
  }
}

export function clubById(id: string): FootballClub | null {
  return CLUB_BY_ID.get(id) ?? null;
}

export function clubsForDivision(divisionId: string): readonly FootballClub[] {
  return CLUBS_BY_DIVISION.get(divisionId) ?? EMPTY_CLUBS;
}

export function clubsForCountry(countryCode: FootballCountryCode): readonly FootballClub[] {
  return CLUBS_BY_COUNTRY.get(countryCode) ?? EMPTY_CLUBS;
}

export function divisionsForCountry(countryCode: FootballCountryCode): readonly FootballDivision[] {
  return DIVISIONS_BY_COUNTRY.get(countryCode) ?? EMPTY_DIVISIONS;
}

export function nearestDivisionForCountry(countryCode: FootballCountryCode, leagueTier: number): FootballDivision | null {
  const requested = Number.isFinite(leagueTier) ? Math.max(1, Math.min(9, Math.trunc(leagueTier))) : 3;
  return NEAREST_DIVISION.get(`${countryCode}:${requested}`) ?? null;
}

export function divisionById(id: string): FootballDivision | null {
  return DIVISION_BY_ID.get(id) ?? null;
}

export function canonicalSpecialClubIds(): readonly string[] {
  return CANONICAL_SPECIAL_CLUB_IDS;
}

export function narrativeClubAliasIds(): readonly string[] {
  return NARRATIVE_CLUB_ALIASES;
}

export function legacyNamedClubIds(): readonly string[] {
  return LEGACY_NAMED_CLUB_IDS;
}

export function classifyFootballClubReference(value: unknown): FootballClubReferenceClassification {
  if (typeof value !== "string" || value.length === 0) {
    return Object.freeze({
      value: typeof value === "string" ? value : String(value ?? ""),
      kind: "invalid",
      club: null,
      reason: "club reference must be a non-empty string"
    });
  }

  const catalog = CLUB_BY_ID.get(value);
  if (catalog) return Object.freeze({ value, kind: "catalog", club: catalog, reason: "catalog identity" });
  if (CANONICAL_SPECIAL_SET.has(value)) {
    return Object.freeze({ value, kind: "canonical_special", club: null, reason: "canonical special identity" });
  }
  if (NARRATIVE_ALIAS_SET.has(value)) {
    return Object.freeze({ value, kind: "narrative_alias", club: null, reason: "canonical narrative alias" });
  }
  if (LEGACY_NAMED_SET.has(value) || LEGACY_PATTERNS.some(pattern => pattern.test(value))) {
    return Object.freeze({ value, kind: "legacy_compat", club: null, reason: "historical compatibility identity" });
  }
  return Object.freeze({ value, kind: "invalid", club: null, reason: "unknown football club identity" });
}

export function isCatalogClubId(value: unknown): value is string {
  return classifyFootballClubReference(value).kind === "catalog";
}

export function isCanonicalSpecialClubId(value: unknown): value is string {
  return classifyFootballClubReference(value).kind === "canonical_special";
}

export function isNarrativeClubAlias(value: unknown): value is string {
  return classifyFootballClubReference(value).kind === "narrative_alias";
}

export function isLegacyClubReference(value: unknown): value is string {
  return classifyFootballClubReference(value).kind === "legacy_compat";
}

export function isFootballClubReferenceAllowed(
  value: unknown,
  context: FootballClubReferenceContext
): value is string {
  const kind = classifyFootballClubReference(value).kind;
  return ALLOWED_REFERENCE_KINDS[context].has(kind);
}

export function assertFootballClubReferenceForContext(
  value: unknown,
  context: FootballClubReferenceContext,
  path = "club"
): asserts value is string {
  const classification = classifyFootballClubReference(value);
  if (!ALLOWED_REFERENCE_KINDS[context].has(classification.kind)) {
    throw new Error(
      `${path}: football club reference ${classification.value} classified as ${classification.kind} is not allowed in ${context}`
    );
  }
}

export function isLoadableFootballClubReference(value: unknown): value is string {
  return isFootballClubReferenceAllowed(value, "historical_read");
}

export function isNewFootballClubReference(value: unknown): value is string {
  return isFootballClubReferenceAllowed(value, "new_production");
}

export function assertLoadableFootballClubReference(value: unknown, path = "club"): asserts value is string {
  assertFootballClubReferenceForContext(value, "historical_read", path);
}

export function assertNewFootballClubReference(value: unknown, path = "club"): asserts value is string {
  assertFootballClubReferenceForContext(value, "new_production", path);
}

export function inspectFootballCatalog(): readonly FootballCatalogIssue[] {
  const issues = [...inspectFootballCatalogData(FOOTBALL_CLUBS, FOOTBALL_DIVISIONS)];

  for (const [index, club] of FOOTBALL_CLUBS.entries()) {
    if (!Object.isFrozen(club)) issues.push({ path: `FOOTBALL_CLUBS[${index}]`, reason: "club object must be frozen" });
    if (!Object.isFrozen(club.archetypes)) issues.push({ path: `FOOTBALL_CLUBS[${index}].archetypes`, reason: "archetypes must be frozen" });
  }
  for (const [index, division] of FOOTBALL_DIVISIONS.entries()) {
    if (!Object.isFrozen(division)) issues.push({ path: `FOOTBALL_DIVISIONS[${index}]`, reason: "division object must be frozen" });
  }
  if (!Object.isFrozen(FOOTBALL_CLUBS)) issues.push({ path: "FOOTBALL_CLUBS", reason: "catalog array must be frozen" });
  if (!Object.isFrozen(FOOTBALL_DIVISIONS)) issues.push({ path: "FOOTBALL_DIVISIONS", reason: "division array must be frozen" });

  for (const value of [...CANONICAL_SPECIAL_CLUB_IDS, ...NARRATIVE_CLUB_ALIASES, ...LEGACY_NAMED_CLUB_IDS]) {
    if (CLUB_BY_ID.has(value)) issues.push({ path: `identity:${value}`, reason: "compatibility identity collides with catalog id" });
  }

  return Object.freeze(issues.map(item => Object.freeze(item)));
}
