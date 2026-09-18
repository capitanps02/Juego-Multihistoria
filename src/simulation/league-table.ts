import type { GameState } from "../core/types.js";
import { getSportMatchModelStore, remainingLeagueFixtures } from "./match-model.js";

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

function hashString(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function avalanche32(value: number): number {
  let x = value >>> 0;
  x ^= x >>> 16;
  x = Math.imul(x, 0x7feb352d);
  x ^= x >>> 15;
  x = Math.imul(x, 0x846ca68b);
  x ^= x >>> 16;
  return x >>> 0;
}

function goalCount(roll: number): number {
  const goals = [0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 3, 3, 4, 5];
  return goals[roll % goals.length]!;
}

function syntheticGoals(seed: number, season: string, club: string, round: number, side: "for" | "against"): number {
  return goalCount(avalanche32(hashString(`${seed}|${season}|${club}|round:${round}|${side}`)));
}

function emptyRow(club: string): Omit<LeagueTableRow, "position"> {
  return {
    club,
    played: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    points: 0
  };
}

function applyScore(row: Omit<LeagueTableRow, "position">, goalsFor: number, goalsAgainst: number): void {
  row.played += 1;
  row.goalsFor += goalsFor;
  row.goalsAgainst += goalsAgainst;
  if (goalsFor > goalsAgainst) {
    row.wins += 1;
    row.points += 3;
  } else if (goalsFor === goalsAgainst) {
    row.draws += 1;
    row.points += 1;
  } else {
    row.losses += 1;
  }
  row.goalDifference = row.goalsFor - row.goalsAgainst;
}

function syntheticClubs(state: GameState): string[] {
  const tier = state.professional.leagueTier;
  return Array.from({ length: 20 }, (_, index) => `SIM_OPP_${tier}_${String(index + 1).padStart(2, "0")}`);
}

function sortedTable(rows: Array<Omit<LeagueTableRow, "position">>): LeagueTableRow[] {
  return [...rows]
    .sort((a, b) =>
      b.points - a.points
      || b.goalDifference - a.goalDifference
      || b.goalsFor - a.goalsFor
      || a.club.localeCompare(b.club)
    )
    .map((row, index) => ({ ...row, position: index + 1 }));
}

/**
 * Deterministic league-table authority.
 *
 * The registered club uses its persisted authoritative match results. Synthetic
 * league peers are produced only from football.seed + season + peer + round.
 * Aggregate form, roleScore, reputation, month and narrative flags never enter
 * the calculation. Historical gaps in the registered club result ledger fail
 * the whole table closed rather than backfilling invented results.
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

  const current = emptyRow(club);
  for (const fixture of clubRows) {
    const result = fixture.result!;
    const goalsFor = fixture.homeAway === "home" ? result.homeGoals : result.awayGoals;
    const goalsAgainst = fixture.homeAway === "home" ? result.awayGoals : result.homeGoals;
    applyScore(current, goalsFor, goalsAgainst);
  }

  const peerRows = syntheticClubs(state)
    .filter(peer => peer !== club)
    .map(peer => {
      const row = emptyRow(peer);
      for (let round = 0; round < clubRows.length; round += 1) {
        applyScore(
          row,
          syntheticGoals(state.rngState.football.seed, state.season, peer, round, "for"),
          syntheticGoals(state.rngState.football.seed, state.season, peer, round, "against")
        );
      }
      return row;
    });

  const table = sortedTable([current, ...peerRows]);
  const row = table.find(entry => entry.club === club);
  if (!row) return unavailable;

  const leader = table[0]!;
  const europeCutoff = table[Math.min(6, table.length - 1)]!;
  const safetyIndex = Math.max(0, table.length - 3 - 1);
  const safety = table[safetyIndex]!;
  const remaining = remainingLeagueFixtures(state);
  const maxSwing = remaining * 3;
  const gapToLeader = Math.max(0, leader.points - row.points);
  const gapToEurope = Math.max(0, europeCutoff.points - row.points);
  const gapToSafety = Math.max(0, safety.points - row.points);

  return {
    status: "authoritative",
    season: state.season,
    club,
    teamCount: table.length,
    currentPosition: row.position,
    points: row.points,
    matchesPlayed: row.played,
    race: {
      titleRace: remaining > 0 && gapToLeader <= Math.min(9, maxSwing),
      europeRace: remaining > 0 && gapToEurope <= Math.min(9, maxSwing),
      relegationBattle: remaining > 0 && row.position >= table.length - 5 && gapToSafety <= Math.min(9, maxSwing)
    },
    table
  };
}
