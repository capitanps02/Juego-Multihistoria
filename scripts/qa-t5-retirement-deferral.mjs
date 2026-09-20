const PLAYING_CONTINUE_CHOICES = new Map([
  // Final active A9 retirement-decision surfaces.
  ['EVT_37_ANNOUNCE_001', new Set(['WAIT_END', 'TRIBUTE_NO_RETIREMENT', 'LOCKER_ONLY'])],
  ['EVT_38_MKT_001', new Set(['LOWER_PAY', 'LOWER_LEVEL', 'WAIT_SEPTEMBER', 'CALL_HOME'])],
  ['EVT_RET_FAM_001', new Set(['LAST_SEASON', 'NO_DATE', 'WAIT_OFFERS'])],
  ['EVT_RET_BODY_001', new Set(['REHAB_RETURN', 'SURGERY_WAIT'])],
  ['EVT_RET_HIGH_001', new Set(['ONE_MORE', 'WAIT_OFFERS', 'SAME_CLUB_ONLY'])],
  ['EVT_RET_LOW_001', new Set(['OTHER_CLUB', 'LOWER_LEVEL', 'WAIT_PRESEASON'])],

  // Frozen historical compatibility only. These IDs/choices are not active final canon.
  ['EVT_RET_HOME_001', new Set(['KEEP'])],
  ['EVT_RET_BODY_001_LEGACY', new Set(['ONE_MORE'])],
  ['EVT_RET_HIGH_001_LEGACY', new Set(['CONTINUE'])],
  ['EVT_RET_LOW_001_LEGACY', new Set(['FIGHT'])]
]);

const LEGACY_CHOICE_COMPAT = new Map([
  ['EVT_RET_BODY_001', new Set(['ONE_MORE'])],
  ['EVT_RET_HIGH_001', new Set(['CONTINUE'])],
  ['EVT_RET_LOW_001', new Set(['FIGHT'])]
]);

function continuationChoices(eventId) {
  const active = PLAYING_CONTINUE_CHOICES.get(eventId);
  const legacy = LEGACY_CHOICE_COMPAT.get(eventId);
  if (!active) return legacy ?? null;
  if (!legacy) return active;
  return new Set([...active, ...legacy]);
}

function latestRetirementDecision(history = []) {
  for (let i = history.length - 1; i >= 0; i--) {
    const entry = history[i];
    if (continuationChoices(entry?.eventId)) return entry;
  }
  return null;
}

export function agencyDeferredRetirement(state) {
  const status = state.retirement?.status;
  const history = state.history ?? [];

  if (status === 'decided') {
    const decidedDate = state.retirement?.decidedDate;
    if (!decidedDate) return false;
    return history.some(entry =>
      entry.eventId === 'EVT_RET_ANNOUNCE_001' &&
      entry.choiceId === 'WAIT' &&
      entry.date >= decidedDate
    );
  }

  if (status !== 'playing') return false;
  const latest = latestRetirementDecision(history);
  if (!latest) return false;
  return continuationChoices(latest.eventId)?.has(latest.choiceId) === true;
}
