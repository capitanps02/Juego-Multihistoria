import type { GameState } from "../core/types.js";
import { getSportMatchModelStore } from "./match-model.js";

export interface LeagueTableRow {
  club: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  position: number;
}

export interface LeagueRaceStatus {
  titleRace: boolean;
  europeRace: boolean;
  relegationBattle: boolean;
  gapToLeader: number;
  gapToEurope: number;
  gapToSafety: number;
}

export interface LeagueStandingContext {
  status: "authoritative" | "unavailable";
  season: string;
  club: string;
  teamCount: number | null;
  currentPosition: number | null;
  points: number | null;
  matchesPlayed: number | null;
  race: LeagueRaceStatus | null;
  table: LeagueTableRow[] | null;
}

/**
 * Deterministic league-table authority.
 *
 * The registered club uses only its persisted authoritative match results.
 * Aggregate form, roleScore, reputation, month and narrative flags never enter
 * the calculation. Peer-club table/position/race fields stay unknown until a
 * peer-result producer exists. Historical gaps fail closed; no backfill.
 */
export function getLeagueStandingContext(state: GameState): LeagueStandingContext {
  const club = state.professional.registrationClub;
  const unavailable: LeagueStandingContext = {
    status: "unavailable",
    season: state.season,
    club,
    teamCount: null,
    currentPosition: null,
    points: null,
    matchesPlayed: null,
    race: null,
    table: null
  };

  const store = getSportMatchModelStore(state);
  if (!store) return unavailable;
  const clubRows = store.fixtures.filter(row => row.season === state.season && row.club === club);
  if (clubRows.length === 0 || clubRows.some(row => row.result === undefined)) return unavailable;

  let points = 0;
  for (const fixture of clubRows) {
    const result = fixture.result!;
    const goalsFor = fixture.homeAway === "home" ? result.homeGoals : result.awayGoals;
    const goalsAgainst = fixture.homeAway === "home" ? result.awayGoals : result.homeGoals;
    points += goalsFor > goalsAgainst ? 3 : goalsFor === goalsAgainst ? 1 : 0;
  }

  // We can prove only the registered club's own row from the persisted ledger.
  // Position/race/table require authoritative peer-club results; until that
  // producer exists they remain unknown rather than being synthesized.
  return {
    status: "authoritative",
    season: state.season,
    club,
    teamCount: null,
    currentPosition: null,
    points,
    matchesPlayed: clubRows.length,
    race: null,
    table: null
  };
}
