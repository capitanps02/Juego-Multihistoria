import { classifyFootballClubReference } from "../catalog/football/index.js";
import { CURRENT_FOOTBALL_CATALOG_VERSION, PRE_FOOTBALL_CATALOG_VERSION, footballCatalogVersionOf } from "./football-catalog-version.js";
function plainRecord(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
}
function rows(value) {
    return Array.isArray(value) ? value : [];
}
const NEW_KINDS = ["catalog", "canonical_special"];
const HISTORICAL_KINDS = ["catalog", "canonical_special", "legacy_compat"];
function referenceIssue(value, path, allowed) {
    const classified = classifyFootballClubReference(value);
    if (allowed.includes(classified.kind))
        return null;
    return {
        path,
        reason: `football reference ${classified.value} is ${classified.kind}: ${classified.reason}`
    };
}
const newReference = (value, path) => referenceIssue(value, path, NEW_KINDS);
const historicalReference = (value, path) => referenceIssue(value, path, HISTORICAL_KINDS);
function catalogOpponent(value, path) {
    const classified = classifyFootballClubReference(value);
    return classified.kind === "catalog"
        ? null
        : { path, reason: `V2 fixture opponent must be catalog identity, got ${classified.kind}: ${classified.value}` };
}
function termsIssue(value, path, historical) {
    if (!plainRecord(value))
        return null;
    const inspect = historical ? historicalReference : newReference;
    for (const key of ["club", "ownerClub", "registrationClub"]) {
        const issue = inspect(value[key], `${path}.${key}`);
        if (issue)
            return issue;
    }
    return null;
}
function offerIssue(value, path, historical) {
    if (!plainRecord(value))
        return null;
    return termsIssue(value.before, `${path}.before`, historical)
        ?? termsIssue(value.terms, `${path}.terms`, historical);
}
function marketIssue(value) {
    if (!plainRecord(value))
        return null;
    if (value.pending !== null && value.pending !== undefined) {
        const issue = offerIssue(value.pending, "market.pending", false);
        if (issue)
            return issue;
    }
    for (const [index, offer] of rows(value.openOffers).entries()) {
        const issue = offerIssue(offer, `market.openOffers[${index}]`, false);
        if (issue)
            return issue;
    }
    for (const [index, decision] of rows(value.history).entries()) {
        if (!plainRecord(decision))
            continue;
        const issue = offerIssue(decision.offer, `market.history[${index}].offer`, true);
        if (issue)
            return issue;
    }
    for (const [index, closure] of rows(value.systemClosures).entries()) {
        if (!plainRecord(closure))
            continue;
        const issue = offerIssue(closure.offer, `market.systemClosures[${index}].offer`, true);
        if (issue)
            return issue;
    }
    for (const [index, negotiation] of rows(value.futureNegotiations).entries()) {
        if (!plainRecord(negotiation))
            continue;
        const destination = newReference(negotiation.destination, `market.futureNegotiations[${index}].destination`);
        if (destination)
            return destination;
        const before = termsIssue(negotiation.before, `market.futureNegotiations[${index}].before`, false);
        if (before)
            return before;
        const terms = termsIssue(negotiation.terms, `market.futureNegotiations[${index}].terms`, false);
        if (terms)
            return terms;
    }
    for (const [index, agreement] of rows(value.futureAgreements).entries()) {
        if (!plainRecord(agreement))
            continue;
        const issue = termsIssue(agreement.terms, `market.futureAgreements[${index}].terms`, false);
        if (issue)
            return issue;
    }
    return null;
}
function historicalIssue(state) {
    for (const [index, entry] of rows(state.history).entries()) {
        if (!plainRecord(entry))
            continue;
        const issue = historicalReference(entry.club, `history[${index}].club`);
        if (issue)
            return issue;
    }
    for (const [index, milestone] of rows(state.ageMilestones).entries()) {
        if (!plainRecord(milestone))
            continue;
        const issue = historicalReference(milestone.club, `ageMilestones[${index}].club`);
        if (issue)
            return issue;
    }
    if (plainRecord(state.employment) && plainRecord(state.employment.previous)) {
        for (const key of ["club", "ownerClub", "registrationClub"]) {
            const issue = historicalReference(state.employment.previous[key], `employment.previous.${key}`);
            if (issue)
                return issue;
        }
    }
    for (const [npcIndex, npc] of rows(state.npcs).entries()) {
        if (!plainRecord(npc) || !plainRecord(npc.knowledge))
            continue;
        for (const [factId, fact] of Object.entries(npc.knowledge)) {
            if (!plainRecord(fact))
                continue;
            const issue = historicalReference(fact.club, `npcs[${npcIndex}].knowledge.${factId}.club`);
            if (issue)
                return issue;
        }
    }
    return null;
}
function worldIssue(world) {
    const matchStore = plainRecord(world.sportMatchModel) ? world.sportMatchModel : null;
    if (matchStore) {
        for (const [index, fixture] of rows(matchStore.fixtures).entries()) {
            if (!plainRecord(fixture))
                continue;
            const club = historicalReference(fixture.club, `world.sportMatchModel.fixtures[${index}].club`);
            if (club)
                return club;
            if (fixture.opponentClubId !== undefined) {
                const opponent = catalogOpponent(fixture.opponentClubId, `world.sportMatchModel.fixtures[${index}].opponentClubId`);
                if (opponent)
                    return opponent;
            }
        }
        if (plainRecord(matchStore.objective)) {
            const issue = newReference(matchStore.objective.club, "world.sportMatchModel.objective.club");
            if (issue)
                return issue;
        }
    }
    const competition = plainRecord(world.sportCompetitionMoments) ? world.sportCompetitionMoments : null;
    if (competition)
        for (const [index, moment] of rows(competition.moments).entries()) {
            if (!plainRecord(moment))
                continue;
            const issue = newReference(moment.club, `world.sportCompetitionMoments.moments[${index}].club`);
            if (issue)
                return issue;
        }
    const penalties = plainRecord(world.sportPenaltySetups) ? world.sportPenaltySetups : null;
    if (penalties)
        for (const [index, setup] of rows(penalties.contexts).entries()) {
            if (!plainRecord(setup))
                continue;
            const issue = newReference(setup.club, `world.sportPenaltySetups.contexts[${index}].club`);
            if (issue)
                return issue;
        }
    for (const [index, approach] of rows(world.veteranMarketApproaches).entries()) {
        if (!plainRecord(approach))
            continue;
        const issue = newReference(approach.club, `world.veteranMarketApproaches[${index}].club`);
        if (issue)
            return issue;
    }
    const leadership = plainRecord(world.playerClubLeadershipAuthority) ? world.playerClubLeadershipAuthority : null;
    if (leadership) {
        if (plainRecord(leadership.currentLeadership)) {
            const issue = newReference(leadership.currentLeadership.clubId, "world.playerClubLeadershipAuthority.currentLeadership.clubId");
            if (issue)
                return issue;
        }
        for (const [index, row] of rows(leadership.history).entries()) {
            if (!plainRecord(row))
                continue;
            const issue = historicalReference(row.clubId, `world.playerClubLeadershipAuthority.history[${index}].clubId`);
            if (issue)
                return issue;
        }
        if (plainRecord(leadership.successor)) {
            const issue = newReference(leadership.successor.clubId, "world.playerClubLeadershipAuthority.successor.clubId");
            if (issue)
                return issue;
        }
    }
    const coachChanges = plainRecord(world.coachChangeAuthority) ? world.coachChangeAuthority : null;
    if (coachChanges)
        for (const [index, row] of rows(coachChanges.history).entries()) {
            if (!plainRecord(row))
                continue;
            const issue = historicalReference(row.clubId, `world.coachChangeAuthority.history[${index}].clubId`);
            if (issue)
                return issue;
        }
    const injuries = plainRecord(world.injuryEpisodes) ? world.injuryEpisodes : null;
    if (injuries)
        for (const [index, episode] of rows(injuries.episodes).entries()) {
            if (!plainRecord(episode))
                continue;
            const issue = newReference(episode.registrationClub, `world.injuryEpisodes.episodes[${index}].registrationClub`);
            if (issue)
                return issue;
        }
    return null;
}
function playerActionsIssue(value) {
    if (!plainRecord(value))
        return null;
    for (const [index, fact] of rows(value.facts).entries()) {
        if (!plainRecord(fact) || !plainRecord(fact.payload) || fact.payload.club === undefined)
            continue;
        const issue = newReference(fact.payload.club, `playerActions.facts[${index}].payload.club`);
        if (issue)
            return issue;
    }
    return null;
}
const COMPATIBILITY_REFERENCE_KEYS = new Set([
    "club",
    "ownerClub",
    "registrationClub",
    "clubId",
    "destination"
]);
function compatibilityGenerationIssue(value) {
    let nodes = 0;
    const ancestors = new Set();
    const visit = (node, path, depth) => {
        if (++nodes > 300_000 || depth > 64) {
            return { path, reason: "football reference graph is too large or deep" };
        }
        if (node === null || typeof node !== "object")
            return null;
        if (ancestors.has(node))
            return { path, reason: "football reference graph contains a cycle" };
        ancestors.add(node);
        try {
            if (Array.isArray(node)) {
                for (let index = 0; index < node.length; index += 1) {
                    const issue = visit(node[index], `${path}[${index}]`, depth + 1);
                    if (issue)
                        return issue;
                }
                return null;
            }
            if (!plainRecord(node))
                return { path, reason: "football reference graph contains a non-plain object" };
            for (const [key, child] of Object.entries(node)) {
                const childPath = path ? `${path}.${key}` : key;
                if (COMPATIBILITY_REFERENCE_KEYS.has(key) && child !== null && child !== undefined) {
                    const issue = historicalReference(child, childPath);
                    if (issue)
                        return issue;
                }
                else if (key === "opponentClubId" && child !== null && child !== undefined) {
                    const issue = catalogOpponent(child, childPath);
                    if (issue)
                        return issue;
                }
                if (child !== null && typeof child === "object") {
                    const issue = visit(child, childPath, depth + 1);
                    if (issue)
                        return issue;
                }
            }
            return null;
        }
        finally {
            ancestors.delete(node);
        }
    };
    return visit(value, "", 0);
}
/**
 * Referential integrity is intentionally version-gated. Missing/pre-catalog saves
 * retain frozen legacy semantics; current V2 saves fail closed on every active/new
 * football identity while historical provenance may retain explicit legacy IDs.
 */
export function inspectFootballCatalogSaveReferences(value) {
    if (!plainRecord(value))
        return null;
    const version = footballCatalogVersionOf(value.footballCatalogVersion);
    if (version === PRE_FOOTBALL_CATALOG_VERSION)
        return null;
    if (version !== CURRENT_FOOTBALL_CATALOG_VERSION)
        return compatibilityGenerationIssue(value);
    const professional = plainRecord(value.professional) ? value.professional : {};
    const world = plainRecord(value.world) ? value.world : {};
    for (const [path, reference] of [
        ["club", value.club],
        ["professional.ownerClub", professional.ownerClub],
        ["professional.registrationClub", professional.registrationClub],
        ["world.ownerClub", world.ownerClub]
    ]) {
        const issue = newReference(reference, path);
        if (issue)
            return issue;
    }
    for (const [index, npc] of rows(value.npcs).entries()) {
        if (!plainRecord(npc) || npc.club === null || npc.club === undefined)
            continue;
        const issue = newReference(npc.club, `npcs[${index}].club`);
        if (issue)
            return issue;
    }
    return historicalIssue(value)
        ?? marketIssue(value.market)
        ?? worldIssue(world)
        ?? playerActionsIssue(value.playerActions);
}
