import { FORMAL_RENEWAL_REASON, careerOfferKind, proposeCareerChange } from "./offers.js";
export const AGE18_JAN_OFFER_MONTH_DAY = "01-08";
export const AGE18_SUMMER_OFFER_MONTH_DAY = "06-04";
const num = (value, fallback = 0) => typeof value === "number" ? value : fallback;
function hashString(value) {
    let hash = 2166136261;
    for (let i = 0; i < value.length; i += 1) {
        hash ^= value.charCodeAt(i);
        hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
}
function avalanche32(value) {
    let x = value >>> 0;
    x ^= x >>> 16;
    x = Math.imul(x, 0x7feb352d);
    x ^= x >>> 15;
    x = Math.imul(x, 0x846ca68b);
    x ^= x >>> 16;
    return x >>> 0;
}
/** Stable producer channel: deterministic and consumes zero RNG draws. */
function producerRoll(state, channel) {
    return avalanche32(hashString(`${state.rngState.narrative.seed}|${state.date}|${state.season}|${state.professional.ownerClub}|${channel}`));
}
function seen(state, eventId) {
    return state.flags[`SEEN_${eventId}`] === true;
}
function destinationId(prefix, tier, roll) {
    return `${prefix}_${tier}_${String((roll % 30) + 1).padStart(2, "0")}`;
}
function materializeJanuary(state) {
    if (seen(state, "EVT_18_JAN_001"))
        return null;
    if (state.professional.ownerClub !== "UDV" || state.professional.registrationClub !== "UDV")
        return null;
    if (state.flags.LOAN_ACTIVE)
        return null;
    const role = num(state.sport.roleScore, 18);
    const market = num(state.reputation.marketHeat, 5);
    const appearances = num(state.sport.appearances, 0);
    const debuted = state.flags.OFFICIAL_DEBUT === true || appearances > 0;
    const loanPlausible = role <= 44 || !debuted || appearances < 4;
    const transferPlausible = market >= 26 && (debuted || appearances >= 2);
    if (!loanPlausible && !transferPlausible)
        return null;
    // One deterministic January attempt. Absence remains a stable world fact for this window.
    if (producerRoll(state, "age18:january:available") % 100 >= 78)
        return null;
    const kind = loanPlausible && transferPlausible
        ? (producerRoll(state, "age18:january:kind") % 100 < 58 ? "loan" : "transfer")
        : loanPlausible ? "loan" : "transfer";
    if (kind === "loan") {
        const tier = Math.min(4, Math.max(3, state.professional.leagueTier + 1));
        const destination = destinationId("Development", tier, producerRoll(state, "age18:january:loan-destination"));
        proposeCareerChange(state, "Cesión formal de enero", draft => {
            draft.club = destination;
            draft.tier = tier;
            draft.professional.registrationClub = destination;
            draft.professional.leagueTier = tier;
            draft.professional.clubPrestigeTier = Math.max(1, draft.professional.clubPrestigeTier - 1);
            draft.professional.clubPrestigeScore = Math.max(8, draft.professional.clubPrestigeScore - 5);
            draft.professional.route = "loan";
            draft.flags.LOAN_ACTIVE = true;
            draft.flags.ABROAD_ROUTE = false;
        });
    }
    else {
        const tier = market >= 52 ? Math.max(2, state.professional.leagueTier - 1) : state.professional.leagueTier;
        const destination = destinationId("Domestic", tier, producerRoll(state, "age18:january:transfer-destination"));
        const salary = Math.max(1200, Math.round(num(state.contract.salaryMonthly, 900) * (1.18 + (producerRoll(state, "age18:january:salary") % 16) / 100)));
        const months = 30 + (producerRoll(state, "age18:january:months") % 19);
        proposeCareerChange(state, "Oferta formal de traspaso en enero", draft => {
            draft.club = destination;
            draft.tier = tier;
            draft.contract.monthsRemaining = months;
            draft.contract.salaryMonthly = salary;
            draft.contract.releaseClause = null;
            draft.professional.registrationClub = destination;
            draft.professional.ownerClub = destination;
            draft.professional.leagueTier = tier;
            draft.professional.clubPrestigeTier = Math.max(1, Math.min(5, tier === 2 ? 2 : draft.professional.clubPrestigeTier + 1));
            draft.professional.clubPrestigeScore = Math.min(100, draft.professional.clubPrestigeScore + 8);
            draft.professional.route = "domestic";
            draft.flags.LOAN_ACTIVE = false;
            draft.flags.ABROAD_ROUTE = false;
        });
    }
    return state.market?.pending ? careerOfferKind(state.market.pending) : null;
}
function materializeSummer(state) {
    if (seen(state, "EVT_18_SUM_001"))
        return null;
    // The first-signing scene is a UDV employment negotiation. An active loan has its own
    // return/continuity lifecycle and must not be reclassified as a renewal merely because
    // UDV still owns the player.
    if (state.professional.ownerClub !== "UDV" || state.professional.registrationClub !== "UDV")
        return null;
    if (state.flags.LOAN_ACTIVE)
        return null;
    const market = num(state.reputation.marketHeat, 5);
    const externalPlausible = market >= 34 && (state.flags.OFFICIAL_DEBUT === true || num(state.sport.appearances) >= 3);
    const external = externalPlausible && producerRoll(state, "age18:summer:kind") % 100 < 38;
    if (external) {
        const tier = market >= 58 ? Math.max(2, state.professional.leagueTier - 1) : Math.max(2, state.professional.leagueTier);
        const destination = destinationId("Summer", tier, producerRoll(state, "age18:summer:transfer-destination"));
        const salary = Math.max(1350, Math.round(num(state.contract.salaryMonthly, 900) * (1.28 + (producerRoll(state, "age18:summer:salary") % 18) / 100)));
        const months = 36 + (producerRoll(state, "age18:summer:months") % 13);
        proposeCareerChange(state, "Oferta formal de salida en verano", draft => {
            draft.club = destination;
            draft.tier = tier;
            draft.contract.monthsRemaining = months;
            draft.contract.salaryMonthly = salary;
            draft.contract.releaseClause = null;
            draft.professional.registrationClub = destination;
            draft.professional.ownerClub = destination;
            draft.professional.leagueTier = tier;
            draft.professional.clubPrestigeTier = Math.max(2, Math.min(5, draft.professional.clubPrestigeTier + 1));
            draft.professional.clubPrestigeScore = Math.min(100, draft.professional.clubPrestigeScore + 10);
            draft.professional.route = "domestic";
            draft.flags.LOAN_ACTIVE = false;
            draft.flags.ABROAD_ROUTE = false;
        });
    }
    else {
        const months = 24 + 12 * (producerRoll(state, "age18:summer:renewal-months") % 3);
        const salary = Math.max(1100, Math.round(num(state.contract.salaryMonthly, 900) * (1.12 + (producerRoll(state, "age18:summer:renewal-salary") % 17) / 100)));
        const releaseClause = Math.round(salary * (48 + producerRoll(state, "age18:summer:renewal-clause") % 37));
        proposeCareerChange(state, FORMAL_RENEWAL_REASON, draft => {
            draft.contract.monthsRemaining = months;
            draft.contract.salaryMonthly = salary;
            draft.contract.releaseClause = releaseClause;
        });
    }
    return state.market?.pending ? careerOfferKind(state.market.pending) : null;
}
/**
 * Materialize the one formal proposal that the canonical age-18 market scene may consume.
 * Exactly one calendar date is eligible in each window, so a failed/no-offer roll cannot
 * silently reroll on every subsequent world day. The function consumes zero RNG draws.
 *
 * This function is intentionally not wired into the world loop by this staging module.
 * Activation must land atomically with the JAN/SUM offerBridge content generation so the
 * generic offer UI can never consume the proposal before its canonical scene.
 */
export function materializeAge18MarketOfferInPlace(state) {
    if (state.age !== 18 || state.retirement.status !== "playing" || state.market?.pending)
        return null;
    const monthDay = state.date.slice(5);
    if (monthDay === AGE18_JAN_OFFER_MONTH_DAY)
        return materializeJanuary(state);
    if (monthDay === AGE18_SUMMER_OFFER_MONTH_DAY)
        return materializeSummer(state);
    return null;
}
