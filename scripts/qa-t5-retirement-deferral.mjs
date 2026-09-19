const PLAYING_CONTINUE_CHOICES = new Map([
  ['EVT_RET_HOME_001', 'KEEP'],
  ['EVT_RET_BODY_001', 'ONE_MORE'],
  ['EVT_RET_HIGH_001', 'CONTINUE'],
  ['EVT_RET_LOW_001', 'FIGHT']
]);

function latestRetirementDecision(history = []) {
  for (let i = history.length - 1; i >= 0; i--) {
    const entry = history[i];
    if (PLAYING_CONTINUE_CHOICES.has(entry?.eventId)) return entry;
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
  return PLAYING_CONTINUE_CHOICES.get(latest.eventId) === latest.choiceId;
}
