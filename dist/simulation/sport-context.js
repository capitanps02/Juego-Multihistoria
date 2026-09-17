const unavailable = () => "unavailable";
const known = () => "known";
function finiteNumber(value, fallback = 0) {
    return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}
/**
 * Read-only sporting projection.
 *
 * Important: current main has no authoritative fixture, competition, match,
 * squad-call or per-match statistics store. Those facts therefore remain null.
 * This function intentionally refuses to infer them from age, roleScore, form,
 * reputation, coach trust, seasonDay, month or narrative flags.
 */
export function getSportContext(state) {
    return {
        currentSeason: state.season,
        sportingClub: state.professional.registrationClub,
        ownerClub: state.professional.ownerClub,
        leagueTier: finiteNumber(state.professional.leagueTier, state.tier),
        careerAppearances: finiteNumber(state.sport.appearances),
        officialDebutRecorded: state.flags.OFFICIAL_DEBUT === true,
        currentCompetition: null,
        nextFixture: null,
        previousFixture: null,
        hoursToNextFixture: null,
        isMatchDay: null,
        isTrainingWindow: null,
        remainingOfficialMatches: null,
        remainingLeagueMatches: null,
        seasonObjectiveStatus: null,
        currentStanding: null,
        currentSquadStatus: null,
        firstMatchSquadCall: null,
        firstBench: null,
        firstAppearance: null,
        firstStart: null,
        firstFullMatch: null,
        firstGoal: null,
        availability: {
            currentSeason: known(),
            sportingClub: known(),
            ownerClub: known(),
            careerAppearances: known(),
            officialDebutRecorded: known(),
            currentCompetition: unavailable(),
            nextFixture: unavailable(),
            previousFixture: unavailable(),
            hoursToNextFixture: unavailable(),
            isMatchDay: unavailable(),
            isTrainingWindow: unavailable(),
            remainingOfficialMatches: unavailable(),
            remainingLeagueMatches: unavailable(),
            seasonObjectiveStatus: unavailable(),
            currentStanding: unavailable(),
            currentSquadStatus: unavailable(),
            firstMatchSquadCall: unavailable(),
            firstBench: unavailable(),
            firstAppearance: unavailable(),
            firstStart: unavailable(),
            firstFullMatch: unavailable(),
            firstGoal: unavailable()
        },
        unavailableReason: "no_authoritative_fixture_match_or_squad_store"
    };
}
/**
 * Current-match projection. Fail closed until the simulation owns an actual
 * match store; narrative code must not turn aggregate career state into a match.
 */
export function getCurrentMatchContext(_state) {
    return {
        status: "no_authoritative_match_model",
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
        injury: null
    };
}
