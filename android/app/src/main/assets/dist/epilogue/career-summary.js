import { retirementLastAppearanceFact } from "../simulation/retirement-authority.js";
const num = (value, fallback = 0) => typeof value === "number" ? value : fallback;
const text = (value) => typeof value === "string" && value.length > 0 ? value : null;
function collectCareerClubs(state) {
    const clubs = new Set();
    for (const entry of state.history)
        if (entry.club)
            clubs.add(entry.club);
    if (state.club)
        clubs.add(state.club);
    if (state.professional.ownerClub)
        clubs.add(state.professional.ownerClub);
    if (state.professional.registrationClub)
        clubs.add(state.professional.registrationClub);
    const marketHistory = state.market?.history;
    if (Array.isArray(marketHistory)) {
        for (const decision of marketHistory) {
            if (decision?.accepted === true && typeof decision?.offer?.terms?.club === "string")
                clubs.add(decision.offer.terms.club);
            if (typeof decision?.offer?.before?.club === "string")
                clubs.add(decision.offer.before.club);
        }
    }
    return [...clubs];
}
function firstRecordedClub(state) {
    const historyClub = state.history.find(entry => typeof entry.club === "string" && entry.club.length > 0)?.club;
    return text(historyClub) ?? text(state.professional.ownerClub) ?? text(state.club);
}
function lastRecordedClub(state) {
    return text(state.professional.registrationClub) ?? text(state.club) ?? text(state.professional.ownerClub);
}
export function buildLastProfessionalAppearanceFact(state) {
    const factual = retirementLastAppearanceFact(state);
    if (factual.status === "authoritative") {
        return {
            observed: true, authority: "sport.match_history", fixtureId: factual.fixtureId, fixture: factual.fixtureId,
            date: factual.date, competition: factual.competition, opponent: factual.opponent, homeAway: factual.homeAway,
            club: factual.club, started: factual.started, appeared: factual.appeared, minutes: factual.minutes,
            result: factual.result, goals: factual.goals, assists: factual.assists, cards: factual.cards,
            postAnnouncement: factual.postAnnouncement
        };
    }
    if (factual.status === "authoritative_none") {
        return {
            observed: false, authority: "sport.match_history", fixtureId: null, fixture: null, date: null,
            competition: null, opponent: null, homeAway: null, club: null, started: null, appeared: null,
            minutes: null, result: null, goals: null, assists: null, cards: null, postAnnouncement: null
        };
    }
    const observed = state.flags.LAST_MATCH_PLAYED === true;
    return {
        observed, authority: observed ? "sport.appearances_delta" : "none", fixtureId: null, fixture: null,
        date: observed ? text(state.world.retirementLastAppearanceDate) : null, competition: null, opponent: null,
        homeAway: null, club: observed ? lastRecordedClub(state) : null, started: null, appeared: observed ? true : null,
        minutes: null, result: null, goals: null, assists: null, cards: null, postAnnouncement: observed ? true : null
    };
}
export function buildCareerSummary(state) {
    const lastAppearance = buildLastProfessionalAppearanceFact(state);
    const factualFixture = lastAppearance.authority === "sport.match_history" && lastAppearance.fixtureId !== null;
    const missing = ["career goals", "structured trophy history", "structured captaincy history", "most-important-club authority"];
    if (!factualFixture) {
        missing.unshift("fixture identity", "opponent", "competition", "appearance minutes", "starter/bench status", "match result", "last-appearance goals/assists/cards");
    }
    else {
        if (lastAppearance.result === null)
            missing.unshift("match result");
        if (lastAppearance.goals === null || lastAppearance.assists === null || lastAppearance.cards === null) {
            missing.unshift("last-appearance goals/assists/cards");
        }
    }
    return {
        terminal: state.retirement.status === "closed", retirementStatus: state.retirement.status,
        retirementReason: text(state.retirement.reason), retirementClosureType: text(state.retirement.closureType),
        decisionAge: state.retirement.decisionAge, decidedDate: state.retirement.decidedDate,
        announcedDate: state.retirement.announcedDate, closedDate: state.retirement.closedDate,
        careerAgeAtSnapshot: state.age, firstClub: firstRecordedClub(state), lastClub: lastRecordedClub(state),
        careerClubs: collectCareerClubs(state), careerAppearances: num(state.sport.appearances), careerGoals: null,
        majorTrophies: null, mostImportantClub: null, clubWithMostSeasons: null, clubWithMostSuccess: null,
        nationalCaps: num(state.professional.nationalCaps), majorLongInjuries: num(state.world.maturityLongInjuryCount),
        lastProfessionalAppearance: lastAppearance, missingAuthoritativeFacts: missing
    };
}
