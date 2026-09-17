import { currentOfficialMatch, getSportMatchModelStore, hoursToNextScheduledFixture, isTrainingDay, nextScheduledFixture, nextScheduledTrainingDate, previousOfficialMatch, remainingLeagueFixtures } from "./match-model.js";
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
    const store = getSportMatchModelStore(state);
    const current = currentOfficialMatch(state);
    const next = nextScheduledFixture(state);
    const previous = previousOfficialMatch(state);
    const objective = store?.objective && store.objective.season === state.season && store.objective.club === state.professional.registrationClub
        ? store.objective
        : null;
    const milestonesKnown = store !== null;
    return {
        currentSeason: state.season,
        sportingClub: state.professional.registrationClub,
        ownerClub: state.professional.ownerClub,
        leagueTier: finiteNumber(state.professional.leagueTier, state.tier),
        careerAppearances: finiteNumber(state.sport.appearances),
        officialDebutRecorded: state.flags.OFFICIAL_DEBUT === true,
        currentCompetition: current?.competition ?? next?.competition ?? null,
        nextFixture: next,
        previousFixture: previous,
        hoursToNextFixture: hoursToNextScheduledFixture(state),
        isMatchDay: current !== null,
        isTrainingWindow: isTrainingDay(state),
        nextTrainingDate: nextScheduledTrainingDate(state),
        remainingOfficialMatches: remainingLeagueFixtures(state),
        remainingLeagueMatches: remainingLeagueFixtures(state),
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
            sportingClub: known(),
            ownerClub: known(),
            careerAppearances: known(),
            officialDebutRecorded: known(),
            currentCompetition: known(),
            nextFixture: known(),
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
/** Current-match projection over the persisted match row for today's football cycle. */
export function getCurrentMatchContext(state) {
    const match = currentOfficialMatch(state);
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
