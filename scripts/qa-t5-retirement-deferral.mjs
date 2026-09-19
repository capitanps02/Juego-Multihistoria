export function agencyDeferredRetirement(state) {
  const decidedDate = state.retirement?.decidedDate;
  if (state.retirement?.status !== 'decided' || !decidedDate) return false;
  return (state.history ?? []).some(entry =>
    entry.eventId === 'EVT_RET_ANNOUNCE_001' &&
    entry.choiceId === 'WAIT' &&
    entry.date >= decidedDate
  );
}
