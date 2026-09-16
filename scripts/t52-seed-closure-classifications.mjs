export const CLOSURE_DISPOSITIONS = [
  'canonical_chain',
  'intentional_persistent',
  'canonical_expiry',
  'retired_compatible'
];

const supportedDispositions = new Set(CLOSURE_DISPOSITIONS);

function nonEmptyStrings(values) {
  return Array.isArray(values)
    && values.length > 0
    && values.every(value => typeof value === 'string' && value.trim().length > 0);
}

export function validateSeedClosureClassifications(classifications = [], rows = []) {
  const rowById = new Map(rows.map(row => [row.id, row]));
  const accepted = [];
  const errors = [];
  const seen = new Set();

  for (const entry of classifications) {
    const prefix = entry?.seedId ?? '<missing-seed-id>';
    if (!entry || typeof entry !== 'object') {
      errors.push({ seedId: prefix, code: 'invalid_entry' });
      continue;
    }
    if (typeof entry.seedId !== 'string' || !entry.seedId) {
      errors.push({ seedId: prefix, code: 'missing_seed_id' });
      continue;
    }
    if (seen.has(entry.seedId)) {
      errors.push({ seedId: entry.seedId, code: 'duplicate_classification' });
      continue;
    }
    seen.add(entry.seedId);

    const row = rowById.get(entry.seedId);
    if (!row) {
      errors.push({ seedId: entry.seedId, code: 'unknown_seed' });
      continue;
    }
    if (entry.owner !== row.owner) {
      errors.push({ seedId: entry.seedId, code: 'owner_mismatch', expected: row.owner, actual: entry.owner ?? null });
      continue;
    }
    if (!supportedDispositions.has(entry.disposition)) {
      errors.push({ seedId: entry.seedId, code: 'unsupported_disposition', disposition: entry.disposition ?? null });
      continue;
    }
    if (typeof entry.rationale !== 'string' || entry.rationale.trim().length < 20) {
      errors.push({ seedId: entry.seedId, code: 'insufficient_rationale' });
      continue;
    }
    if (!nonEmptyStrings(entry.evidenceRefs)) {
      errors.push({ seedId: entry.seedId, code: 'missing_evidence_refs' });
      continue;
    }

    if (entry.disposition === 'canonical_chain') {
      if (typeof entry.producerEventId !== 'string' || typeof entry.consumerEventId !== 'string') {
        errors.push({ seedId: entry.seedId, code: 'canonical_chain_missing_endpoints' });
        continue;
      }
      const pair = (row.verifiedFeasiblePairs ?? []).find(candidate => (
        candidate.producerEventId === entry.producerEventId
        && candidate.consumerEventId === entry.consumerEventId
      ));
      if (!pair) {
        errors.push({
          seedId: entry.seedId,
          code: 'canonical_chain_not_verified',
          producerEventId: entry.producerEventId,
          consumerEventId: entry.consumerEventId
        });
        continue;
      }
    }

    if (entry.disposition === 'intentional_persistent' && !row.openEndedWithoutTerminalTransition) {
      errors.push({ seedId: entry.seedId, code: 'persistent_disposition_requires_open_ended_memory' });
      continue;
    }

    if (entry.disposition === 'canonical_expiry') {
      const basis = entry.expiryBasis;
      const basisSupported = (
        (basis === 'age' && row.finiteAgeWindow)
        || (basis === 'date' && row.explicitExpiryAssignments > 0)
        || (basis === 'club' && row.clubScoped)
        || (basis === 'season' && row.seasonScoped)
      );
      if (!basisSupported) {
        errors.push({ seedId: entry.seedId, code: 'canonical_expiry_basis_not_supported_by_runtime_evidence', expiryBasis: basis ?? null });
        continue;
      }
    }

    if (entry.disposition === 'retired_compatible') {
      if (row.topology !== 'unwired') {
        errors.push({ seedId: entry.seedId, code: 'retired_compatible_requires_unwired_active_catalog' });
        continue;
      }
      if (entry.evidenceRefs.length < 2) {
        errors.push({ seedId: entry.seedId, code: 'retired_compatible_requires_compatibility_and_canonical_evidence' });
        continue;
      }
    }

    accepted.push({ ...entry });
  }

  return {
    accepted,
    errors,
    valid: errors.length === 0
  };
}
