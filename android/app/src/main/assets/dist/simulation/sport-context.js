import { hasActiveClubEmployment } from "./employment.js";
import { getCompetitionSchedule, getCurrentCompetitionContext, getFixtureCongestionContext, latestCompetitionMoment } from "./competition-context.js";
import { careerGoalHistoryComplete, careerSportMilestones, currentOfficialMatch, getSportMatchModelStore, hoursToNextScheduledFixture, isTrainingDay, lastPlayerAppearance, nextScheduledFixture, nextScheduledTrainingDate, previousOfficialMatch, priorClubPlayerMatchStats, recentClubPlayerMatchStats, remainingLeagueFixtures, seasonPlayerStats } from "./match-model.js";
import { currentPenaltyDecisionSetup } from "./match-penalty-context.js";
const unavailable = () => "unavailable";
const known = () => "known";
function finiteNumber(value, fallback = 0) {
    return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}
function squadStatus(record) {
    if (!record)
        return null;
    if (record.player.started)
        return "starter";
    if (record.player.appeared)
        return "substitute";
    if (record.player.onBench)
        return "bench";
    return "not_called";
}
/**
 * Read-only sporting projection over the simulation-owned weekly fixture model.
 * Calendar facts are derived from the same seven-day cadence used by footballWeek;
 * match/squad facts come only from persisted rows produced by that simulation.
 * No RNG is consumed and narrative flags/roleScore are never used here to fabricate facts.
 */
export function getSportContext(state) {
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
    const recentSix = employed ? recentClubPlayerMatchStats(state, 6) : null;
    const priorTwo = employed ? priorClubPlayerMatchStats(state, 2) : null;
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
        recentSixMatchStats: recentSix,
        priorTwoMatchStats: priorTwo,
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
            recentSixMatchStats: recentSix ? known() : unavailable(),
            priorTwoMatchStats: priorTwo ? known() : unavailable(),
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
export function getLastPlayerAppearanceContext(state) {
    const store = getSportMatchModelStore(state);
    if (!store)
        return { status: "historical_match_store_not_initialized", match: null };
    return { status: "authoritative", match: lastPlayerAppearance(state) };
}
/** Current-match projection over persisted sporting rows for today's football cycle. */
export function getCurrentMatchContext(state) {
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
