const EXPLICIT_CONTINUE_CHOICES = new Set([
  'EVT_RET_HOME_001:KEEP',
  'EVT_RET_BODY_001:ONE_MORE',
  'EVT_RET_HIGH_001:CONTINUE',
  'EVT_RET_LOW_001:FIGHT'
]);

export function agencyDeferredRetirement(state) {
  const history = state.history ?? [];

  if (state.retirement?.status === 'decided') {
    const decidedDate = state.retirement?.decidedDate;
    if (!decidedDate) return false;
    return history.some(entry =>
      entry.eventId === 'EVT_RET_ANNOUNCE_001' &&
      entry.choiceId === 'WAIT' &&
      entry.date >= decidedDate
    );
  }

  if (state.retirement?.status === 'playing') {
    return history.some(entry => EXPLICIT_CONTINUE_CHOICES.has(`${entry.eventId}:${entry.choiceId}`));
  }

  return false;
}
