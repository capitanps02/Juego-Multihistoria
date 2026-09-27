export type {
  ClubArchetype,
  FootballCatalogIssue,
  FootballClubReferenceClassification,
  FootballClubReferenceKind,
  FootballConfederation,
  FootballCountryCode,
  FootballClub,
  FootballDivision
} from "./types.js";
export { FOOTBALL_CLUBS, FOOTBALL_DIVISIONS, FOOTBALL_CATALOG_VERSION } from "./world.js";

import { FOOTBALL_CLUBS, FOOTBALL_DIVISIONS } from "./world.js";
import type {
  FootballCatalogIssue,
  FootballClubReferenceClassification,
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
  /^SIM_OPP_\d+_(?:\d+|TEST)$/i,
  /^(?:Development|Domestic|Summer|Foreign|Loan)_\d+_\d+$/i,
  /^Club \d+ · \d+$/
]);

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

export function isLoadableFootballClubReference(value: unknown): value is string {
  return classifyFootballClubReference(value).kind !== "invalid";
}

export function isNewFootballClubReference(value: unknown): value is string {
  const kind = classifyFootballClubReference(value).kind;
  return kind === "catalog" || kind === "canonical_special";
}

export function assertLoadableFootballClubReference(value: unknown, path = "club"): asserts value is string {
  const classification = classifyFootballClubReference(value);
  if (classification.kind === "invalid") {
    throw new Error(`${path}: ${classification.reason}: ${classification.value}`);
  }
}

export function assertNewFootballClubReference(value: unknown, path = "club"): asserts value is string {
  const classification = classifyFootballClubReference(value);
  if (classification.kind !== "catalog" && classification.kind !== "canonical_special") {
    throw new Error(`${path}: new V2 production requires catalog/canonical identity, got ${classification.kind}: ${classification.value}`);
  }
}

export function inspectFootballCatalog(): readonly FootballCatalogIssue[] {
  const issues: FootballCatalogIssue[] = [];
  const divisionIds = new Set<string>();
  const clubIds = new Set<string>();
  const clubNames = new Set<string>();

  for (const [index, division] of FOOTBALL_DIVISIONS.entries()) {
    const path = `FOOTBALL_DIVISIONS[${index}]`;
    if (divisionIds.has(division.id)) issues.push({ path: `${path}.id`, reason: "duplicate division id" });
    divisionIds.add(division.id);
    if (!Number.isInteger(division.tier) || division.tier < 1) issues.push({ path: `${path}.tier`, reason: "invalid tier" });
    if (!Number.isInteger(division.clubCount) || division.clubCount < 1) issues.push({ path: `${path}.clubCount`, reason: "invalid clubCount" });
    if (!Number.isInteger(division.strength) || division.strength < 0 || division.strength > 100) {
      issues.push({ path: `${path}.strength`, reason: "strength must be integer 0..100" });
    }
  }

  for (const [index, club] of FOOTBALL_CLUBS.entries()) {
    const path = `FOOTBALL_CLUBS[${index}]`;
    if (clubIds.has(club.id)) issues.push({ path: `${path}.id`, reason: "duplicate club id" });
    clubIds.add(club.id);
    if (clubNames.has(club.name)) issues.push({ path: `${path}.name`, reason: "duplicate working club name" });
    clubNames.add(club.name);
    const division = DIVISION_BY_ID.get(club.divisionId);
    if (!division) {
      issues.push({ path: `${path}.divisionId`, reason: "unknown division" });
      continue;
    }
    if (club.countryCode !== division.countryCode) issues.push({ path: `${path}.countryCode`, reason: "country mismatch" });
    if (club.country !== division.country) issues.push({ path: `${path}.country`, reason: "country label mismatch" });
    if (club.confederation !== division.confederation) issues.push({ path: `${path}.confederation`, reason: "confederation mismatch" });
    if (club.tier !== division.tier) issues.push({ path: `${path}.tier`, reason: "division tier mismatch" });
    if (club.shortName.length > 22 || club.shortName.length === 0) issues.push({ path: `${path}.shortName`, reason: "shortName must be 1..22 characters" });
    for (const field of ["prestige","financialPower","youthQuality","developmentBias","pressure","internationalAttraction"] as const) {
      const value = club[field];
      if (!Number.isInteger(value) || value < 0 || value > 100) {
        issues.push({ path: `${path}.${field}`, reason: "club coefficient must be integer 0..100" });
      }
    }
  }

  for (const division of FOOTBALL_DIVISIONS) {
    if (clubsForDivision(division.id).length !== division.clubCount) {
      issues.push({ path: `division:${division.id}.clubCount`, reason: "clubCount does not match indexed clubs" });
    }
  }

  for (const value of [...CANONICAL_SPECIAL_CLUB_IDS, ...NARRATIVE_CLUB_ALIASES, ...LEGACY_NAMED_CLUB_IDS]) {
    if (CLUB_BY_ID.has(value)) issues.push({ path: `identity:${value}`, reason: "compatibility identity collides with catalog id" });
  }

  if (!Object.isFrozen(FOOTBALL_CLUBS)) issues.push({ path: "FOOTBALL_CLUBS", reason: "catalog array must be frozen" });
  if (!Object.isFrozen(FOOTBALL_DIVISIONS)) issues.push({ path: "FOOTBALL_DIVISIONS", reason: "division array must be frozen" });

  return Object.freeze(issues.map(issue => Object.freeze(issue)));
}
