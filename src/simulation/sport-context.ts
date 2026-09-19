import type { GameState } from "../core/types.js";
import { hasActiveClubEmployment } from "./employment.js";
import {
  getCompetitionSchedule,
  getCurrentCompetitionContext,
  getFixtureCongestionContext,
  latestCompetitionMoment,
  type CompetitionContext,
  type CompetitionMoment,
  type CompetitionScheduleFixture,
  type FixtureCongestionContext
} from "./competition-context.js";
import {
  careerGoalHistoryComplete,
  careerSportMilestones,
  currentOfficialMatch,
  getSportMatchModelStore,
  hoursToNextScheduledFixture,
  isTrainingDay,
  lastPlayerAppearance,
  nextScheduledFixture,
  nextScheduledTrainingDate,
  previousOfficialMatch,
  remainingLeagueFixtures,
  seasonPlayerStats,
  type CareerSportMilestones,
  type LeagueObjectiveStatus,
  type MatchCompetition,
  type MatchResultFact,
  type OfficialMatchRecord,
  type SeasonPlayerStats,
  type ScheduledFixture,
  type SquadStatus
} from "./match-model.js";
import { currentPenaltyDecisionSetup } from "./match-penalty-context.js";

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
  currentCompetitionStage: SportFactAvailability;
  latestCompetitionMoment: SportFactAvailability;
  nextCompetitionFixture: SportFactAvailability;
  competitionSchedule14: SportFactAvailability;
  fixtureCongestion: SportFactAvailability;
  nextFixture: SportFactAvailability;
  previousFixture: SportFactAvailability;
  lastPlayerAppearance: SportFactAvailability;
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
  currentSeasonPlayerStats: SportFactAvailability;
  careerMilestones: SportFactAvailability;
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
  currentCompetitionStage: CompetitionContext;
  latestCompetitionMoment: CompetitionMoment | null;
  nextCompetitionFixture: CompetitionScheduleFixture | null;
  competitionSchedule14: CompetitionScheduleFixture[];
  fixtureCongestion: FixtureCongestionContext;
  nextFixture: ScheduledFixture | null;
  previousFixture: OfficialMatchRecord | null;
  /** Latest factual official row where the player actually appeared, across clubs. */
  lastPlayerAppearance: OfficialMatchRecord | null;
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
  firstGoal: string | null;
  currentSeasonPlayerStats: SeasonPlayerStats | null;
  /** Exact career aggregates only when the persisted appearance/stat ledger is complete. */
  careerMilestones: CareerSportMilestones | null;
  availability: SportContextAvailability;
  unavailableReason: "standing_model_not_implemented" | "historical_match_store_not_initialized" | "historical_player_stats_incomplete" | null;
}

export interface CurrentMatchContext {
  status: MatchContextStatus;
  fixtureId: string | null;
  competition: MatchCompetition | null;
  opponent: string | null;
  homeAway: "home" | "away" | null;
  dateTime: null;
  result: MatchResultFact | null;
  playerCalledUp: boolean | null;
  playerOnBench: boolean | null;
  playerStarted: boolean | null;
  playerAppeared: boolean | null;
  minutes: number | null;
  goals: number | null;
  assists: number | null;
  cards: { yellow: number; red: number } | null;
  injury: boolean | null;
  decisionMinute: number | null;
  scoreAtDecision: { home: number; away: number } | null;
  debutDecisionContext: boolean;
  highProfileMatch: boolean | null;
  penaltyDecisionContext: boolean;
  designatedPenaltyTakerRef: string | null;
  designatedTakerMissedEarlier: boolean;
  priorPenaltyMinute: number | null;
  penaltyDecisionMinute: number | null;
  penaltyScoreAtDecision: { home: number; away: number } | null;
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
  const competitionContext = getCurrentCompetitionContext(state);
  const latestCompetition = employed ? latestCompetitionMoment(state) : null;
  const combinedSchedule = employed ? getCompetitionSchedule(state, 14) : [];
  const congestion = getFixtureCongestionContext(state);
  const next = employed ? nextScheduledFixture(state) : null;
  const previous = employed ? previousOfficialMatch(state) : null;
  const lastAppearance = employed ? lastPlayerAppearance(state) : null;
  const objective = store?.objective && store.objective.season === state.season && store.objective.club === state.professional.registrationClub
    ? store.objective
    : null;
  const milestonesKnown = store !== null;
  const goalHistoryKnown = employed && careerGoalHistoryComplete(state);
  const seasonStats = employed ? seasonPlayerStats(state) : null;
  const careerMilestones = careerSportMilestones(state);

  return {
    currentSeason: state.season,
    sportingClub: employed ? state.professional.registrationClub : null,
    ownerClub: employed ? state.professional.ownerClub : null,
    leagueTier: employed ? finiteNumber(state.professional.leagueTier, state.tier) : null,
    careerAppearances: finiteNumber(state.sport.appearances),
    officialDebutRecorded: state.flags.OFFICIAL_DEBUT === true,
    currentCompetition: current?.competition ?? next?.competition ?? null,
    currentCompetitionStage: competitionContext,
    latestCompetitionMoment: latestCompetition,
    nextCompetitionFixture: combinedSchedule[0] ?? null,
    competitionSchedule14: combinedSchedule,
    fixtureCongestion: congestion,
    nextFixture: next,
    previousFixture: previous,
    lastPlayerAppearance: lastAppearance,
    hoursToNextFixture: employed ? hoursToNextScheduledFixture(state) : null,
    isMatchDay: current !== null,
    isTrainingWindow: employed ? isTrainingDay(state) : false,
    nextTrainingDate: employed ? nextScheduledTrainingDate(state) : null,
    remainingOfficialMatches: employed ? remainingLeagueFixtures(state) : 0,
    remainingLeagueMatches: employed ? remainingLeagueFixtures(state) : 0,
    seasonObjectiveStatus: objective?.status ?? null,
    currentStanding: null,
    currentSquadStatus: squadStatus(current),
    firstMatchSquadCall: store?.milestones.firstMatchSquadCall ?? null,
    firstBench: store?.milestones.firstBench ?? null,
    firstAppearance: store?.milestones.firstAppearance ?? null,
    firstStart: store?.milestones.firstStart ?? null,
    firstFullMatch: store?.milestones.firstFullMatch ?? null,
    firstGoal: goalHistoryKnown ? (store?.milestones.firstGoal ?? null) : null,
    currentSeasonPlayerStats: seasonStats,
    careerMilestones: careerMilestones.historyComplete ? careerMilestones : null,
    availability: {
      currentSeason: known(),
      sportingClub: employed ? known() : unavailable(),
      ownerClub: employed ? known() : unavailable(),
      careerAppearances: known(),
      officialDebutRecorded: known(),
      currentCompetition: employed ? known() : unavailable(),
      currentCompetitionStage: competitionContext.status === "authoritative" ? known() : unavailable(),
      latestCompetitionMoment: latestCompetition ? known() : unavailable(),
      nextCompetitionFixture: employed ? known() : unavailable(),
      competitionSchedule14: employed ? known() : unavailable(),
      fixtureCongestion: congestion.status === "authoritative" ? known() : unavailable(),
      nextFixture: employed ? known() : unavailable(),
      previousFixture: milestonesKnown ? known() : unavailable(),
      lastPlayerAppearance: milestonesKnown ? known() : unavailable(),
      hoursToNextFixture: employed ? known() : unavailable(),
      isMatchDay: employed ? known() : unavailable(),
      isTrainingWindow: employed ? known() : unavailable(),
      nextTrainingDate: employed ? known() : unavailable(),
      remainingOfficialMatches: employed ? known() : unavailable(),
      remainingLeagueMatches: employed ? known() : unavailable(),
      seasonObjectiveStatus: objective ? known() : unavailable(),
      currentStanding: unavailable(),
      currentSquadStatus: milestonesKnown ? known() : unavailable(),
      firstMatchSquadCall: milestonesKnown ? known() : unavailable(),
      firstBench: milestonesKnown ? known() : unavailable(),
      firstAppearance: milestonesKnown ? known() : unavailable(),
      firstStart: milestonesKnown ? known() : unavailable(),
      firstFullMatch: milestonesKnown ? known() : unavailable(),
      firstGoal: goalHistoryKnown ? known() : unavailable(),
      currentSeasonPlayerStats: seasonStats ? known() : unavailable(),
      careerMilestones: careerMilestones.historyComplete ? known() : unavailable()
    },
    unavailableReason: !milestonesKnown
      ? "historical_match_store_not_initialized"
      : !goalHistoryKnown
        ? "historical_player_stats_incomplete"
        : "standing_model_not_implemented"
  };
}

/**
 * Latest factual on-field appearance. Historical saves without the match store
 * remain explicitly unavailable rather than being interpreted as zero games.
 */
export function getLastPlayerAppearanceContext(state: GameState): LastPlayerAppearanceContext {
  const store = getSportMatchModelStore(state);
  if (!store) return { status: "historical_match_store_not_initialized", match: null };
  return { status: "authoritative", match: lastPlayerAppearance(state) };
}

/** Current-match projection over persisted sporting rows for today's football cycle. */
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
      debutDecisionContext: false,
      highProfileMatch: null,
      penaltyDecisionContext: false,
      designatedPenaltyTakerRef: null,
      designatedTakerMissedEarlier: false,
      priorPenaltyMinute: null,
      penaltyDecisionMinute: null,
      penaltyScoreAtDecision: null
    };
  }
  const canonicalDebutDecision = match.player.debut === true
    && match.player.started === false
    && match.decisionContext?.kind === "debut_substitution"
    && match.decisionContext.minute === 78
    && match.decisionContext.scoreHome === 1
    && match.decisionContext.scoreAway === 1;
  const penalty = currentPenaltyDecisionSetup(state);
  const canonicalPenaltyDecision = match.player.appeared === true && penalty !== null;
  return {
    status: "authoritative",
    fixtureId: match.id,
    competition: match.competition,
    opponent: match.opponent,
    homeAway: match.homeAway,
    dateTime: null,
    result: match.result ?? null,
    playerCalledUp: match.player.calledUp,
    playerOnBench: match.player.onBench,
    playerStarted: match.player.started,
    playerAppeared: match.player.appeared,
    minutes: match.player.minutes,
    goals: match.stats?.goals ?? null,
    assists: match.stats?.assists ?? null,
    cards: match.stats ? { yellow: match.stats.yellowCards, red: match.stats.redCards } : null,
    injury: match.player.injuryUnavailable,
    decisionMinute: match.decisionContext?.minute ?? null,
    scoreAtDecision: match.decisionContext ? { home: match.decisionContext.scoreHome, away: match.decisionContext.scoreAway } : null,
    debutDecisionContext: canonicalDebutDecision,
    highProfileMatch: penalty?.highProfile ?? null,
    penaltyDecisionContext: canonicalPenaltyDecision,
    designatedPenaltyTakerRef: penalty?.designatedTakerRef ?? null,
    designatedTakerMissedEarlier: penalty !== null,
    priorPenaltyMinute: penalty?.priorMissMinute ?? null,
    penaltyDecisionMinute: penalty?.decisionMinute ?? null,
    penaltyScoreAtDecision: penalty ? { home: penalty.scoreHome, away: penalty.scoreAway } : null
  };
}
