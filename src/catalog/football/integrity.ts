import type {
  ClubArchetype,
  FootballCatalogIssue,
  FootballClub,
  FootballConfederation,
  FootballCountryCode,
  FootballDivision
} from "./types.js";
import { FOOTBALL_CATALOG_CLUB_ID_PATTERN } from "./identity.js";

export const FOOTBALL_COUNTRY_CODES = Object.freeze([
  "ESP","ENG","ITA","DEU","FRA","PRT","NLD","BEL","USA","MEX","ARG","JPN","CHN","TUR","NOR","MAR","ZAF"
] as const satisfies readonly FootballCountryCode[]);

export const FOOTBALL_CONFEDERATIONS = Object.freeze([
  "UEFA","CONCACAF","CONMEBOL","AFC","CAF"
] as const satisfies readonly FootballConfederation[]);

export const FOOTBALL_CLUB_ARCHETYPES = Object.freeze([
  "continental","development","selling","historic","high_pressure","community","technical","physical"
] as const satisfies readonly ClubArchetype[]);

export const FOOTBALL_CLEARANCE_STATUSES = Object.freeze(["working_name_unchecked"] as const);

const COUNTRY_SET = new Set<string>(FOOTBALL_COUNTRY_CODES);
const CONFEDERATION_SET = new Set<string>(FOOTBALL_CONFEDERATIONS);
const ARCHETYPE_SET = new Set<string>(FOOTBALL_CLUB_ARCHETYPES);
const CLEARANCE_SET = new Set<string>(FOOTBALL_CLEARANCE_STATUSES);
const DIVISION_ID_PATTERN = /^[A-Z]{3}_D[1-9][0-9]*$/;

function issue(issues: FootballCatalogIssue[], path: string, reason: string): void {
  issues.push(Object.freeze({ path, reason }));
}

function boundedInteger(value: unknown): boolean {
  return Number.isInteger(value) && Number(value) >= 0 && Number(value) <= 100;
}

export function inspectFootballCatalogData(
  clubs: readonly FootballClub[],
  divisions: readonly FootballDivision[]
): readonly FootballCatalogIssue[] {
  const issues: FootballCatalogIssue[] = [];
  const divisionIds = new Set<string>();
  const clubIds = new Set<string>();
  const clubNames = new Set<string>();
  const divisionById = new Map<string, FootballDivision>();
  const countryConfederation = new Map<string, string>();

  for (const [index, division] of divisions.entries()) {
    const path = `divisions[${index}]`;

    if (typeof division.id !== "string" || division.id.length === 0) issue(issues, `${path}.id`, "division id must be non-empty");
    else if (!DIVISION_ID_PATTERN.test(division.id)) issue(issues, `${path}.id`, "malformed division id");
    if (divisionIds.has(division.id)) issue(issues, `${path}.id`, "duplicate division id");
    divisionIds.add(division.id);
    divisionById.set(division.id, division);

    if (!COUNTRY_SET.has(division.countryCode)) issue(issues, `${path}.countryCode`, "unknown country code");
    if (typeof division.country !== "string" || division.country.trim().length === 0) issue(issues, `${path}.country`, "country label must be non-empty");
    if (!CONFEDERATION_SET.has(division.confederation)) issue(issues, `${path}.confederation`, "unknown confederation");
    if (typeof division.name !== "string" || division.name.trim().length === 0) issue(issues, `${path}.name`, "division name must be non-empty");
    if (!Number.isInteger(division.tier) || division.tier < 1) issue(issues, `${path}.tier`, "invalid tier");
    if (!Number.isInteger(division.clubCount) || division.clubCount < 1) issue(issues, `${path}.clubCount`, "invalid clubCount");
    if (!boundedInteger(division.strength)) issue(issues, `${path}.strength`, "strength must be integer 0..100");

    const priorConfederation = countryConfederation.get(division.countryCode);
    if (priorConfederation && priorConfederation !== division.confederation) {
      issue(issues, `${path}.confederation`, "country maps to multiple confederations");
    } else {
      countryConfederation.set(division.countryCode, division.confederation);
    }
  }

  for (const [index, club] of clubs.entries()) {
    const path = `clubs[${index}]`;

    if (typeof club.id !== "string" || club.id.length === 0) issue(issues, `${path}.id`, "club id must be non-empty");
    else if (!FOOTBALL_CATALOG_CLUB_ID_PATTERN.test(club.id)) issue(issues, `${path}.id`, "malformed club id");
    if (clubIds.has(club.id)) issue(issues, `${path}.id`, "duplicate club id");
    clubIds.add(club.id);

    if (typeof club.name !== "string" || club.name.trim().length === 0) issue(issues, `${path}.name`, "club name must be non-empty");
    else if (clubNames.has(club.name)) issue(issues, `${path}.name`, "duplicate club name");
    clubNames.add(club.name);

    if (typeof club.shortName !== "string" || club.shortName.length < 1 || club.shortName.length > 22) {
      issue(issues, `${path}.shortName`, "shortName must be 1..22 characters");
    }
    if (typeof club.city !== "string" || club.city.trim().length === 0) issue(issues, `${path}.city`, "city must be non-empty");
    if (!COUNTRY_SET.has(club.countryCode)) issue(issues, `${path}.countryCode`, "unknown country code");
    if (typeof club.country !== "string" || club.country.trim().length === 0) issue(issues, `${path}.country`, "country label must be non-empty");
    if (!CONFEDERATION_SET.has(club.confederation)) issue(issues, `${path}.confederation`, "unknown confederation");
    if (!Number.isInteger(club.tier) || club.tier < 1) issue(issues, `${path}.tier`, "invalid tier");

    const division = divisionById.get(club.divisionId);
    if (!division) {
      issue(issues, `${path}.divisionId`, "unknown division");
    } else {
      if (club.countryCode !== division.countryCode) issue(issues, `${path}.countryCode`, "country mismatch");
      if (club.country !== division.country) issue(issues, `${path}.country`, "country label mismatch");
      if (club.confederation !== division.confederation) issue(issues, `${path}.confederation`, "confederation mismatch");
      if (club.tier !== division.tier) issue(issues, `${path}.tier`, "division tier mismatch");
    }

    for (const field of ["prestige","financialPower","youthQuality","developmentBias","pressure","internationalAttraction"] as const) {
      if (!boundedInteger(club[field])) issue(issues, `${path}.${field}`, "club coefficient must be integer 0..100");
    }

    if (!Array.isArray(club.archetypes) || club.archetypes.length === 0) {
      issue(issues, `${path}.archetypes`, "archetypes must be a non-empty array");
    } else {
      const seen = new Set<string>();
      for (const archetype of club.archetypes as readonly string[]) {
        if (!ARCHETYPE_SET.has(archetype)) issue(issues, `${path}.archetypes`, `invalid archetype: ${archetype}`);
        if (seen.has(archetype)) issue(issues, `${path}.archetypes`, `duplicate archetype: ${archetype}`);
        seen.add(archetype);
      }
    }

    if (!CLEARANCE_SET.has(club.clearanceStatus)) {
      issue(issues, `${path}.clearanceStatus`, "invalid clearance status");
    }
  }

  const indexedClubCounts = new Map<string, number>();
  for (const club of clubs) indexedClubCounts.set(club.divisionId, (indexedClubCounts.get(club.divisionId) ?? 0) + 1);
  for (const division of divisions) {
    if ((indexedClubCounts.get(division.id) ?? 0) !== division.clubCount) {
      issue(issues, `division:${division.id}.clubCount`, "clubCount does not match clubs");
    }
  }

  return Object.freeze(issues);
}

export function assertFootballCatalogData(
  clubs: readonly FootballClub[],
  divisions: readonly FootballDivision[],
  label = "Football catalog"
): void {
  const issues = inspectFootballCatalogData(clubs, divisions);
  if (issues.length === 0) return;
  const details = issues.slice(0, 12).map(item => `${item.path}: ${item.reason}`).join("; ");
  throw new Error(`${label} integrity failure (${issues.length} issue${issues.length === 1 ? "" : "s"}): ${details}`);
}

function fnv1a(value: string): string {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

export function footballCatalogStructuralFingerprint(
  clubs: readonly FootballClub[],
  divisions: readonly FootballDivision[]
): string {
  const payload = JSON.stringify({
    divisions: divisions.map(division => ({
      id: division.id,
      countryCode: division.countryCode,
      country: division.country,
      confederation: division.confederation,
      name: division.name,
      tier: division.tier,
      clubCount: division.clubCount,
      strength: division.strength
    })),
    clubs: clubs.map(club => ({
      id: club.id,
      name: club.name,
      shortName: club.shortName,
      city: club.city,
      countryCode: club.countryCode,
      country: club.country,
      confederation: club.confederation,
      divisionId: club.divisionId,
      tier: club.tier,
      prestige: club.prestige,
      financialPower: club.financialPower,
      youthQuality: club.youthQuality,
      developmentBias: club.developmentBias,
      pressure: club.pressure,
      internationalAttraction: club.internationalAttraction,
      archetypes: [...club.archetypes],
      clearanceStatus: club.clearanceStatus
    }))
  });
  return fnv1a(payload);
}
