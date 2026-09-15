import { conditionsPass } from "../core/conditions.js";
import { DeterministicRng } from "../core/rng.js";
export function maybeEmitMicroFeed(state, defs, enabled = true) {
    if (!enabled || state.age < 26)
        return null;
    // Check only every five days; feeds are texture, not a second narrative scheduler.
    if (state.runtime.day % 5 !== 0)
        return null;
    const rng = new DeterministicRng(state.rngState.microfeed);
    if (rng.next() > 0.075)
        return null;
    const seen = new Set(state.microfeeds.map(x => x.id));
    const eligible = defs.filter(d => state.age >= d.ageWindow[0] && state.age <= (d.ageWindow[1] ?? 99) && !seen.has(d.id) && conditionsPass(state, d.gates ?? []));
    if (!eligible.length)
        return null;
    const picked = rng.pickWeighted(eligible.map(item => ({ item, weight: item.weight })));
    const entry = { id: picked.item.id, date: state.date, family: picked.item.family, text: picked.item.text, mediaId: picked.item.mediaId };
    state.microfeeds.push(entry);
    return entry;
}
