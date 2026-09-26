export type {
  ClubArchetype,
  FootballConfederation,
  FootballCountryCode,
  FootballClub,
  FootballDivision
} from "./types.js";
export { FOOTBALL_CLUBS, FOOTBALL_DIVISIONS, FOOTBALL_CATALOG_VERSION } from "./world.js";

import { FOOTBALL_CLUBS, FOOTBALL_DIVISIONS } from "./world.js";
import type { FootballCountryCode, FootballClub, FootballDivision } from "./types.js";

const CLUB_BY_ID = new Map(FOOTBALL_CLUBS.map(club => [club.id, club] as const));
const DIVISION_BY_ID = new Map(FOOTBALL_DIVISIONS.map(division => [division.id, division] as const));
const EMPTY_CLUBS: readonly FootballClub[] = Object.freeze([]);
const EMPTY_DIVISIONS: readonly FootballDivision[] = Object.freeze([]);

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
