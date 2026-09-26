export type { ClubArchetype, EuropeanCountryCode, FootballClub, FootballDivision } from "./types.js";
export { EUROPEAN_CLUBS, EUROPEAN_DIVISIONS, EUROPEAN_FOOTBALL_CATALOG_VERSION } from "./europe.js";

import { EUROPEAN_CLUBS, EUROPEAN_DIVISIONS } from "./europe.js";
import type { EuropeanCountryCode, FootballClub, FootballDivision } from "./types.js";

const CLUB_BY_ID = new Map(EUROPEAN_CLUBS.map(club => [club.id, club] as const));
const DIVISION_BY_ID = new Map(EUROPEAN_DIVISIONS.map(division => [division.id, division] as const));

export function clubById(id: string): FootballClub | null {
  return CLUB_BY_ID.get(id) ?? null;
}

export function clubsForDivision(divisionId: string): readonly FootballClub[] {
  return EUROPEAN_CLUBS.filter(club => club.divisionId === divisionId);
}

export function clubsForCountry(countryCode: EuropeanCountryCode): readonly FootballClub[] {
  return EUROPEAN_CLUBS.filter(club => club.countryCode === countryCode);
}

export function divisionById(id: string): FootballDivision | null {
  return DIVISION_BY_ID.get(id) ?? null;
}
