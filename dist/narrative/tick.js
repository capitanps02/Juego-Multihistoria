export function advanceNarrativeTick(state) {
    const next = structuredClone(state);
    for (const id of Object.keys(next.eventCooldowns)) {
        next.eventCooldowns[id] = Math.max(0, next.eventCooldowns[id] - 1);
    }
    return next;
}
