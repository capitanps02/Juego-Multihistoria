export type { ClubArchetype, EuropeanCountryCode, FootballClub, FootballDivision } from "./types.js";
export { EUROPEAN_CLUBS, EUROPEAN_DIVISIONS, EUROPEAN_FOOTBALL_CATALOG_VERSION } from "./europe.js";

import { EUROPEAN_CLUBS, EUROPEAN_DIVISIONS } from "./europe.js";
import type { EuropeanCountryCode, FootballClub } from "./types.js";

export function clubById(id: string): FootballClub | null {
  return EUROPEAN_CLUBS.find(club => club.id === id) ?? null;
}

export function clubsForDivision(divisionId: string): FootballClub[] {
  return EUROPEAN_CLUBS.filter(club => club.divisionId === divisionId);
}

export function clubsForCountry(countryCode: EuropeanCountryCode): FootballClub[] {
  return EUROPEAN_CLUBS.filter(club => club.countryCode === countryCode);
}

export function divisionById(id: string) {
  return EUROPEAN_DIVISIONS.find(division => division.id === id) ?? null;
}
