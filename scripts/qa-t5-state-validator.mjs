const LIVE_SEED_STATES = new Set(['dormant', 'active', 'transformed']);
const TERMINAL_SEED_STATES = new Set(['resolved', 'expired']);
const ALL_SEED_STATES = new Set([...LIVE_SEED_STATES, ...TERMINAL_SEED_STATES]);

export const expectedPhaseForAge = age => age < 20 ? '18_20' : age < 23 ? '20_23' : age < 26 ? '23_26' : age < 30 ? '26_30' : age < 34 ? '30_34' : '34_plus';

function violation(code, detail = {}) {
  return { code, ...detail };
}

function finiteNonNegative(value) {
  return Number.isFinite(Number(value)) && Number(value) >= 0;
}

function inspectTerms(issues, offerId, side, terms) {
  if (!terms || typeof terms !== 'object') {
    issues.push(violation('market_terms_missing', { offerId, side }));
    return;
  }
  if (terms.registrationClub !== terms.club) issues.push(violation('market_registration_club_mismatch', { offerId, side, club: terms.club, registrationClub: terms.registrationClub }));
  if (terms.tier !== terms.leagueTier) issues.push(violation('market_tier_mismatch', { offerId, side, tier: terms.tier, leagueTier: terms.leagueTier }));
  if (!finiteNonNegative(terms.salary)) issues.push(violation('market_salary_invalid', { offerId, side, salary: terms.salary }));
  if (!finiteNonNegative(terms.months)) issues.push(violation('market_months_invalid', { offerId, side, months: terms.months }));
  if (!terms.loan && terms.ownerClub !== terms.club) issues.push(violation('market_owner_club_mismatch', { offerId, side, club: terms.club, ownerClub: terms.ownerClub }));
}

/**
 * QA-only, read-only invariant validator. It intentionally checks structural/systemic
 * impossibilities, not balance or route frequency. It must never mutate GameState or RNG.
 */
export function validateGameStateQa(state) {
  const issues = [];

  if (!state || typeof state !== 'object') return [violation('state_missing')];

  if (Number.isFinite(Number(state.age))) {
    const expected = expectedPhaseForAge(Number(state.age));
    if (state.phase !== expected) issues.push(violation('phase_age_mismatch', { age: state.age, phase: state.phase, expected }));
  }

  if (!finiteNonNegative(state.contract?.monthsRemaining)) issues.push(violation('contract_months_invalid', { months: state.contract?.monthsRemaining }));
  if (!finiteNonNegative(state.contract?.salaryMonthly)) issues.push(violation('contract_salary_invalid', { salary: state.contract?.salaryMonthly }));

  if (state.professional?.registrationClub !== state.club) {
    issues.push(violation('live_registration_club_mismatch', { club: state.club, registrationClub: state.professional?.registrationClub }));
  }
  if (state.world?.ownerClub !== state.professional?.ownerClub) {
    issues.push(violation('live_owner_club_mismatch', { worldOwnerClub: state.world?.ownerClub, professionalOwnerClub: state.professional?.ownerClub }));
  }

  if (state.flags?.LOAN_ACTIVE === true) {
    if (state.professional?.route !== 'loan') issues.push(violation('loan_active_without_loan_route', { route: state.professional?.route }));
    if (!state.professional?.ownerClub || state.professional.ownerClub === state.professional?.registrationClub) {
      issues.push(violation('loan_without_distinct_parent_club', { ownerClub: state.professional?.ownerClub, registrationClub: state.professional?.registrationClub }));
    }
  }

  if (state.epilogue?.generated && state.retirement?.status !== 'closed') {
    issues.push(violation('epilogue_before_retirement_closed', { retirementStatus: state.retirement?.status }));
  }
  if (state.market?.pending && state.retirement?.status === 'closed') {
    issues.push(violation('pending_offer_after_retirement_closed', { offerId: state.market.pending.id }));
  }

  const liveBySeed = new Map();
  for (const seed of state.seeds ?? []) {
    if (!ALL_SEED_STATES.has(seed.state)) issues.push(violation('seed_state_unknown', { seedId: seed.id, state: seed.state }));
    if (seed.state === 'resolved' && !seed.consumedBy) issues.push(violation('resolved_seed_without_consumer', { seedId: seed.id }));
    if (LIVE_SEED_STATES.has(seed.state)) liveBySeed.set(seed.id, (liveBySeed.get(seed.id) ?? 0) + 1);
  }
  for (const [seedId, count] of liveBySeed) {
    if (count > 1) issues.push(violation('duplicate_live_seed', { seedId, count }));
  }

  const decidedOfferIds = new Set();
  for (const decision of state.market?.history ?? []) {
    const id = decision?.offer?.id;
    if (!id) {
      issues.push(violation('market_history_offer_missing_id'));
      continue;
    }
    if (decidedOfferIds.has(id)) issues.push(violation('market_duplicate_decision_offer', { offerId: id }));
    decidedOfferIds.add(id);
    inspectTerms(issues, id, 'before', decision.offer.before);
    inspectTerms(issues, id, 'terms', decision.offer.terms);
  }
  if (state.market?.pending?.id && decidedOfferIds.has(state.market.pending.id)) {
    issues.push(violation('market_pending_offer_already_decided', { offerId: state.market.pending.id }));
  }
  if (state.market?.pending) {
    inspectTerms(issues, state.market.pending.id ?? 'pending-without-id', 'before', state.market.pending.before);
    inspectTerms(issues, state.market.pending.id ?? 'pending-without-id', 'terms', state.market.pending.terms);
  }

  return issues;
}
