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

export function clubById(id: string): FootballClub | null {
  return CLUB_BY_ID.get(id) ?? null;
}

export function clubsForDivision(divisionId: string): readonly FootballClub[] {
  return FOOTBALL_CLUBS.filter(club => club.divisionId === divisionId);
}

export function clubsForCountry(countryCode: FootballCountryCode): readonly FootballClub[] {
  return FOOTBALL_CLUBS.filter(club => club.countryCode === countryCode);
}

export function divisionById(id: string): FootballDivision | null {
  return DIVISION_BY_ID.get(id) ?? null;
}
