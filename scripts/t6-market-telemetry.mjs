function increment(record, key, amount = 1) {
  record[key] = (record[key] ?? 0) + amount;
}

function stableTerms(value) {
  if (!value || typeof value !== 'object') return null;
  const source = value;
  return {
    club: source.club ?? null,
    tier: source.tier ?? null,
    months: source.months ?? null,
    salary: source.salary ?? null,
    releaseClause: source.releaseClause ?? null,
    ownerClub: source.ownerClub ?? null,
    registrationClub: source.registrationClub ?? null,
    leagueTier: source.leagueTier ?? null,
    prestigeTier: source.prestigeTier ?? null,
    prestigeScore: source.prestigeScore ?? null,
    route: source.route ?? null,
    abroad: Boolean(source.abroad),
    loan: Boolean(source.loan),
    bigClub: Boolean(source.bigClub)
  };
}

function logicalKey(reason, before) {
  return JSON.stringify([reason ?? 'unknown', stableTerms(before)]);
}

function exactKey(reason, before, terms) {
  return JSON.stringify([reason ?? 'unknown', stableTerms(before), stableTerms(terms)]);
}

export function createMarketTelemetry() {
  return {
    bySegment: {},
    byReason: {},
    byAction: {},
    byDate: {},
    offerIds: new Set(),
    logicalSourceStates: new Map(),
    exactOfferVariants: new Map(),
    accepted: 0,
    rejected: 0,
    firstOfferDate: null,
    lastOfferDate: null,
    total: 0
  };
}

export function recordMarketDecision(telemetry, { phase, action, decision, fallbackDate = null }) {
  const offer = decision?.offer;
  if (!offer) throw new Error('market decision without offer');
  const reason = offer.reason ?? 'unknown';
  const date = offer.date ?? fallbackDate ?? null;
  increment(telemetry.bySegment, phase ?? 'unknown');
  increment(telemetry.byReason, reason);
  increment(telemetry.byAction, action ?? decision.action ?? 'unknown');
  increment(telemetry.byDate, date ?? 'unknown');
  telemetry.offerIds.add(offer.id);
  telemetry.total++;
  if (decision.accepted) telemetry.accepted++;
  else telemetry.rejected++;
  telemetry.firstOfferDate ??= date;
  telemetry.lastOfferDate = date;

  const sourceKey = logicalKey(reason, offer.before);
  if (!telemetry.logicalSourceStates.has(sourceKey)) {
    telemetry.logicalSourceStates.set(sourceKey, { reason, before: stableTerms(offer.before), count: 0 });
  }
  telemetry.logicalSourceStates.get(sourceKey).count++;

  const variantKey = exactKey(reason, offer.before, offer.terms);
  if (!telemetry.exactOfferVariants.has(variantKey)) {
    telemetry.exactOfferVariants.set(variantKey, { reason, before: stableTerms(offer.before), terms: stableTerms(offer.terms), count: 0 });
  }
  telemetry.exactOfferVariants.get(variantKey).count++;
}

export function finalizeMarketTelemetry(telemetry) {
  const dateCounts = Object.values(telemetry.byDate);
  const sourceRows = [...telemetry.logicalSourceStates.values()]
    .sort((a, b) => b.count - a.count || a.reason.localeCompare(b.reason));
  const exactRows = [...telemetry.exactOfferVariants.values()]
    .sort((a, b) => b.count - a.count || a.reason.localeCompare(b.reason));

  return {
    bySegment: telemetry.bySegment,
    byReason: telemetry.byReason,
    byAction: telemetry.byAction,
    accepted: telemetry.accepted,
    rejected: telemetry.rejected,
    uniqueOfferIds: telemetry.offerIds.size,
    duplicateOfferIds: Math.max(0, telemetry.total - telemetry.offerIds.size),
    uniqueLogicalSourceStates: sourceRows.length,
    repeatedLogicalSourceOffers: Math.max(0, telemetry.total - sourceRows.length),
    maxOffersFromSameSourceState: sourceRows[0]?.count ?? 0,
    topRepeatedSourceStates: sourceRows.filter(row => row.count > 1).slice(0, 20),
    uniqueExactOfferVariants: exactRows.length,
    repeatedExactOfferVariants: Math.max(0, telemetry.total - exactRows.length),
    maxExactOfferVariantRepeats: exactRows[0]?.count ?? 0,
    topRepeatedExactOfferVariants: exactRows.filter(row => row.count > 1).slice(0, 20),
    uniqueOfferDates: Object.keys(telemetry.byDate).length,
    maxDecisionsSameDate: dateCounts.length ? Math.max(...dateCounts) : 0,
    firstOfferDate: telemetry.firstOfferDate,
    lastOfferDate: telemetry.lastOfferDate
  };
}
