function compareBoolean(actual, condition) {
  switch (condition.op) {
    case 'exists': return actual !== undefined && actual !== null;
    case 'eq': return actual === condition.value;
    case 'neq': return actual !== condition.value;
    case 'gt': return typeof condition.value === 'number' && Number(actual) > condition.value;
    case 'gte': return typeof condition.value === 'number' && Number(actual) >= condition.value;
    case 'lt': return typeof condition.value === 'number' && Number(actual) < condition.value;
    case 'lte': return typeof condition.value === 'number' && Number(actual) <= condition.value;
    case 'in': return Array.isArray(condition.value) && condition.value.includes(actual);
    case 'notIn': return Array.isArray(condition.value) && !condition.value.includes(actual);
    default: return false;
  }
}

/**
 * Classify how a boolean HAS_SEED_* condition depends on seed presence.
 *
 * positive: the condition passes when the seed is present (true) and fails when absent (false).
 * negative: the condition passes when absent and fails when present.
 * neutral: both values pass or both fail, so it must not create a positive producer→consumer edge.
 */
export function seedPresencePolarity(condition) {
  const whenPresent = compareBoolean(true, condition);
  const whenAbsent = compareBoolean(false, condition);

  if (whenPresent && !whenAbsent) return 'positive';
  if (!whenPresent && whenAbsent) return 'negative';
  return 'neutral';
}
