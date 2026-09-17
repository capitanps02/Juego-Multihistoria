import { FORMAL_RENEWAL_REASON } from "./club-contract-intent.js";
export function marketState(s) {
    return s.market ??= { version: 1, sequence: 0, pending: null, history: [] };
}
export function careerTerms(s) {
    const p = s.professional;
    return { club: s.club, tier: s.tier, months: Number(s.contract.monthsRemaining), salary: Number(s.contract.salaryMonthly), releaseClause: typeof s.contract.releaseClause === "number" ? s.contract.releaseClause : null,
        ownerClub: p.ownerClub, registrationClub: p.registrationClub, leagueTier: p.leagueTier,
        prestigeTier: p.clubPrestigeTier, prestigeScore: p.clubPrestigeScore, route: p.route,
        abroad: !!s.flags.ABROAD_ROUTE, loan: !!s.flags.LOAN_ACTIVE, bigClub: !!s.flags.BIG_CLUB };
}
function sameTerms(a, b) {
    return JSON.stringify(a) === JSON.stringify(b);
}
function renewalWasRejectedFromSameTerms(market, reason, before) {
    if (reason !== FORMAL_RENEWAL_REASON)
        return false;
    return market.history.some(decision => {
        const disposition = decision.source?.disposition ?? decision.action;
        return !decision.accepted
            && disposition === "reject"
            && decision.offer.reason === reason
            && sameTerms(decision.offer.before, before);
    });
}
export function applyTerms(s, t) {
    s.club = t.club;
    s.tier = t.tier;
    s.contract.monthsRemaining = t.months;
    s.contract.salaryMonthly = t.salary;
    s.contract.releaseClause = t.releaseClause;
    Object.assign(s.professional, { ownerClub: t.ownerClub, registrationClub: t.registrationClub, leagueTier: t.leagueTier,
        clubPrestigeTier: t.prestigeTier, clubPrestigeScore: t.prestigeScore, route: t.route });
    s.world.ownerClub = t.ownerClub;
    Object.assign(s.flags, { ABROAD_ROUTE: t.abroad, LOAN_ACTIVE: t.loan, BIG_CLUB: t.bigClub });
}
/** Run the world's proposal on a detached state. No signature or destination leaks. */
export function proposeCareerChange(s, reason, propose) {
    const market = marketState(s);
    if (market.pending || s.retirement.status !== "playing")
        return;
    const draft = structuredClone(s), before = careerTerms(s);
    propose(draft);
    const terms = careerTerms(draft);
    if (sameTerms(before, terms))
        return;
    // A direct rejection closes this exact renewal negotiation state. The club may
    // approach again only after the player's current CareerTerms change (for example
    // when another contract month elapses). We evaluate this after the detached
    // proposal so world RNG consumption remains stable even when the reoffer is suppressed.
    if (renewalWasRejectedFromSameTerms(market, reason, before))
        return;
    // Old market code sometimes only changed prestige. Give that offer an actual destination.
    if (terms.club === before.club && (terms.leagueTier !== before.leagueTier || terms.prestigeTier !== before.prestigeTier)) {
        terms.club = `Club ${terms.leagueTier} · ${terms.prestigeTier}`;
        terms.ownerClub = terms.registrationClub = terms.club;
        terms.loan = false;
        terms.abroad = false;
        terms.route = "domestic";
    }
    if (terms.club !== before.club) {
        terms.registrationClub = terms.club;
        if (!terms.loan)
            terms.ownerClub = terms.club;
        terms.months = Math.max(terms.loan ? 12 : 24, terms.months);
        if (!terms.loan)
            terms.releaseClause = null;
    }
    terms.registrationClub = terms.club;
    if (!terms.loan)
        terms.ownerClub = terms.club;
    terms.tier = terms.leagueTier;
    market.pending = { id: `offer:${++market.sequence}`, date: s.date, reason, before, terms };
}
/**
 * Single authority for closing an offer. Narrative choices may counter/defer, but only
 * accept/delegate are ever allowed to apply CareerTerms. Counter/defer normalize to the
 * persisted reject action while retaining their exact semantics in source.disposition.
 */
export function respondToOffer(s, id, disposition, source) {
    const m = marketState(s), offer = m.pending;
    if (!offer || offer.id !== id)
        throw Error("Esta oferta ya no está pendiente.");
    if (!["accept", "reject", "delegate", "counter", "defer"].includes(disposition))
        throw Error("Respuesta de oferta no válida.");
    if ((disposition === "counter" || disposition === "defer") && !source)
        throw Error("Contraofertar o aplazar requiere una decisión narrativa identificada.");
    if (!sameTerms(careerTerms(s), offer.before))
        throw Error("Las condiciones han cambiado; la oferta ya no corresponde a esta partida.");
    const action = disposition === "counter" || disposition === "defer" ? "reject" : disposition;
    const accepted = action === "accept" || (action === "delegate" && offer.terms.salary >= offer.before.salary && offer.terms.months >= 12 && offer.terms.leagueTier <= offer.before.leagueTier);
    const explanation = disposition === "delegate"
        ? `Delegación para esta oferta: ${accepted ? "aceptada" : "rechazada"}. Criterio: no bajar salario ni categoría y asegurar al menos 12 meses.`
        : disposition === "counter"
            ? "Has planteado una contraoferta. El contrato actual sigue vigente hasta que exista una nueva propuesta formal."
            : disposition === "defer"
                ? "Has aplazado la firma. El contrato actual sigue vigente y esta propuesta deja de estar pendiente."
                : accepted
                    ? "Has aceptado la oferta. Las nuevas condiciones ya están en vigor."
                    : "Has rechazado la oferta. Conservas tus condiciones actuales.";
    if (accepted)
        applyTerms(s, offer.terms);
    const narrativeSource = source ? { ...structuredClone(source), disposition } : undefined;
    const decision = { offer: structuredClone(offer), action, accepted, explanation, ...(narrativeSource ? { source: narrativeSource } : {}) };
    m.history.push(decision);
    m.pending = null;
    return decision;
}
