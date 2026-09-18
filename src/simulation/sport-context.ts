import type { GameState } from "../core/types.js";
import { hasActiveClubEmployment } from "./employment.js";
import {
  currentOfficialMatch,
  getSportMatchModelStore,
  isTrainingDay,
  nextScheduledFixture,
  nextScheduledTrainingDate,
  previousOfficialMatch,
  remainingLeagueFixtures,
  type LeagueObjectiveStatus,
  type MatchCompetition,
  type OfficialMatchRecord,
  type ScheduledFixture,
  type SquadStatus
} from "./match-model.js";

export type SportFactAvailability = "known" | "unavailable";
export type MatchContextStatus = "authoritative" | "no_current_match";
export type LastPlayerAppearanceStatus = "authoritative" | "historical_match_store_not_initialized";

export interface SportContextAvailability {
  currentSeason: SportFactAvailability;
  sportingClub: SportFactAvailability;
  ownerClub: SportFactAvailability;
  careerAppearances: SportFactAvailability;
  officialDebutRecorded: SportFactAvailability;
  currentCompetition: SportFactAvailability;
  nextFixture: SportFactAvailability;
  previousFixture: SportFactAvailability;
  hoursToNextFixture: SportFactAvailability;
  isMatchDay: SportFactAvailability;
  isTrainingWindow: SportFactAvailability;
  nextTrainingDate: SportFactAvailability;
  remainingOfficialMatches: SportFactAvailability;
  remainingLeagueMatches: SportFactAvailability;
  seasonObjectiveStatus: SportFactAvailability;
  currentStanding: SportFactAvailability;
  currentSquadStatus: SportFactAvailability;
  firstMatchSquadCall: SportFactAvailability;
  firstBench: SportFactAvailability;
  firstAppearance: SportFactAvailability;
  firstStart: SportFactAvailability;
  firstFullMatch: SportFactAvailability;
  firstGoal: SportFactAvailability;
}

export interface SportContext {
  currentSeason: string;
  /** Registration club is the sporting authority during transfers and loans. */
  sportingClub: string | null;
  ownerClub: string | null;
  leagueTier: number | null;
  careerAppearances: number;
  /** Legacy coarse fact retained for compatibility; prefer match-model milestones for new content. */
  officialDebutRecorded: boolean;
  currentCompetition: MatchCompetition | null;
  nextFixture: ScheduledFixture | null;
  previousFixture: OfficialMatchRecord | null;
  hoursToNextFixture: number | null;
  isMatchDay: boolean;
  isTrainingWindow: boolean;
  nextTrainingDate: string | null;
  remainingOfficialMatches: number;
  remainingLeagueMatches: number;
  seasonObjectiveStatus: LeagueObjectiveStatus | null;
  currentStanding: null;
  currentSquadStatus: SquadStatus | null;
  firstMatchSquadCall: string | null;
  firstBench: string | null;
  firstAppearance: string | null;
  firstStart: string | null;
  firstFullMatch: string | null;
  firstGoal: null;
  availability: SportContextAvailability;
  unavailableReason: "standing_and_goal_model_not_implemented" | "historical_match_store_not_initialized" | null;
}

export interface CurrentMatchContext {
  status: MatchContextStatus;
  fixtureId: string | null;
  competition: MatchCompetition | null;
  opponent: string | null;
  homeAway: "home" | "away" | null;
  dateTime: null;
  result: null;
  playerCalledUp: boolean | null;
  playerOnBench: boolean | null;
  playerStarted: boolean | null;
  playerAppeared: boolean | null;
  minutes: number | null;
  goals: null;
  assists: null;
  cards: null;
  injury: boolean | null;
  decisionMinute: number | null;
  scoreAtDecision: { home: number; away: number } | null;
  debutDecisionContext: boolean;
}

export interface LastPlayerAppearanceContext {
  status: LastPlayerAppearanceStatus;
  match: OfficialMatchRecord | null;
}

const unavailable = (): SportFactAvailability => "unavailable";
const known = (): SportFactAvailability => "known";

function finiteNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function squadStatus(record: OfficialMatchRecord | null): SquadStatus | null {
  if (!record) return null;
  if (record.player.started) return "starter";
  if (record.player.appeared) return "substitute";
  if (record.player.onBench) return "bench";
  return "not_called";
}

function hoursUntilFixture(state: GameState, fixture: ScheduledFixture | null): number | null {
  if (!fixture) return null;
  const from = Date.parse(`${state.date}T00:00:00Z`);
  const to = Date.parse(`${fixture.date}T00:00:00Z`);
  return Math.round((to - from) / 3_600_000);
}

/**
 * Read-only sporting projection over the simulation-owned weekly fixture model.
 * Calendar facts are derived from the same seven-day cadence used by footballWeek;
 * match/squad facts come only from persisted rows produced by that simulation.
 * No RNG is consumed and narrative flags/roleScore are never used here to fabricate facts.
 */
export function getSportContext(state: GameState): SportContext {
  const employed = hasActiveClubEmployment(state);
  const store = employed ? getSportMatchModelStore(state) : null;
  const current = employed ? currentOfficialMatch(state) : null;
  const next = employed ? nextScheduledFixture(state) : null;
  const previous = employed ? previousOfficialMatch(state) : null;
  const remaining = employed ? remainingLeagueFixtures(state) : 0;
  const objective = store?.objective && store.objective.season === state.season && store.objective.club === state.professional.registrationClub
    ? store.objective
    : null;
  const milestonesKnown = store !== null;

  return {
    currentSeason: state.season,
    sportingClub: employed ? state.professional.registrationClub : null,
    ownerClub: employed ? state.professional.ownerClub : null,
    leagueTier: employed ? finiteNumber(state.professional.leagueTier, state.tier) : null,
    careerAppearances: finiteNumber(state.sport.appearances),
    officialDebutRecorded: state.flags.OFFICIAL_DEBUT === true,
    currentCompetition: current?.competition ?? next?.competition ?? null,
    nextFixture: next,
    previousFixture: previous,
    hoursToNextFixture: employed ? hoursUntilFixture(state, next) : null,
    isMatchDay: employed && current !== null,
    isTrainingWindow: employed ? isTrainingDay(state) : false,
    nextTrainingDate: employed ? nextScheduledTrainingDate(state) : null,
    remainingOfficialMatches: remaining,
    remainingLeagueMatches: remaining,
    seasonObjectiveStatus: objective?.status ?? null,
    currentStanding: null,
    currentSquadStatus: squadStatus(current),
    firstMatchSquadCall: store?.milestones.firstMatchSquadCall ?? null,
    firstBench: store?.milestones.firstBench ?? null,
    firstAppearance: store?.milestones.firstAppearance ?? null,
    firstStart: store?.milestones.firstStart ?? null,
    firstFullMatch: store?.milestones.firstFullMatch ?? null,
    firstGoal: null,
    availability: {
      currentSeason: known(),
      sportingClub: employed ? known() : unavailable(),
      ownerClub: employed ? known() : unavailable(),
      careerAppearances: known(),
      officialDebutRecorded: known(),
      currentCompetition: employed ? known() : unavailable(),
      nextFixture: employed ? known() : unavailable(),
      previousFixture: milestonesKnown ? known() : unavailable(),
      hoursToNextFixture: known(),
      isMatchDay: known(),
      isTrainingWindow: known(),
      nextTrainingDate: known(),
      remainingOfficialMatches: known(),
      remainingLeagueMatches: known(),
      seasonObjectiveStatus: objective ? known() : unavailable(),
      currentStanding: unavailable(),
      currentSquadStatus: milestonesKnown ? known() : unavailable(),
      firstMatchSquadCall: milestonesKnown ? known() : unavailable(),
      firstBench: milestonesKnown ? known() : unavailable(),
      firstAppearance: milestonesKnown ? known() : unavailable(),
      firstStart: milestonesKnown ? known() : unavailable(),
      firstFullMatch: milestonesKnown ? known() : unavailable(),
      firstGoal: unavailable()
    },
    unavailableReason: !milestonesKnown
      ? "historical_match_store_not_initialized"
      : "standing_and_goal_model_not_implemented"
  };
}

/**
 * Read-only career-history projection for the latest factual on-field appearance.
 * A valid initialized store with no appearance is authoritative `match:null`; a historical
 * save without the store remains explicitly unavailable instead of being treated as zero games.
 */
export function getLastPlayerAppearanceContext(state: GameState): LastPlayerAppearanceContext {
  const store = getSportMatchModelStore(state);
  if (!store) return { status: "historical_match_store_not_initialized", match: null };
  for (let index = store.fixtures.length - 1; index >= 0; index -= 1) {
    const row = store.fixtures[index]!;
    if (row.player.appeared) return { status: "authoritative", match: row };
  }
  return { status: "authoritative", match: null };
}

/** Current-match projection over the persisted match row for today's football cycle. */
export function getCurrentMatchContext(state: GameState): CurrentMatchContext {
  const match = hasActiveClubEmployment(state) ? currentOfficialMatch(state) : null;
  if (!match) {
    return {
      status: "no_current_match",
      fixtureId: null,
      competition: null,
      opponent: null,
      homeAway: null,
      dateTime: null,
      result: null,
      playerCalledUp: null,
      playerOnBench: null,
      playerStarted: null,
      playerAppeared: null,
      minutes: null,
      goals: null,
      assists: null,
      cards: null,
      injury: null,
      decisionMinute: null,
      scoreAtDecision: null,
      debutDecisionContext: false
    };
  }
  const canonicalDebutDecision = match.player.debut === true
    && match.player.started === false
    && match.decisionContext?.kind === "debut_substitution"
    && match.decisionContext.minute === 78
    && match.decisionContext.scoreHome === 1
    && match.decisionContext.scoreAway === 1;
  return {
    status: "authoritative",
    fixtureId: match.id,
    competition: match.competition,
    opponent: match.opponent,
    homeAway: match.homeAway,
    dateTime: null,
    result: null,
    playerCalledUp: match.player.calledUp,
    playerOnBench: match.player.onBench,
    playerStarted: match.player.started,
    playerAppeared: match.player.appeared,
    minutes: match.player.minutes,
    goals: null,
    assists: null,
    cards: null,
    injury: match.player.injuryUnavailable,
    decisionMinute: match.decisionContext?.minute ?? null,
    scoreAtDecision: match.decisionContext ? { home: match.decisionContext.scoreHome, away: match.decisionContext.scoreAway } : null,
    debutDecisionContext: canonicalDebutDecision
  };
}
