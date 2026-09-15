// Mulberry32-like deterministic stream, persisted as part of the save.
export class DeterministicRng {
    stream;
    constructor(stream) {
        this.stream = stream;
    }
    next() {
        let t = this.stream.state += 0x6D2B79F5;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        const out = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        this.stream.draws++;
        return out;
    }
    pickWeighted(items) {
        const valid = items.filter(x => Number.isFinite(x.weight) && x.weight > 0);
        if (!valid.length)
            throw new Error("No weighted candidates available");
        const total = valid.reduce((s, x) => s + x.weight, 0);
        const draw = this.next();
        let cursor = draw * total;
        for (const x of valid) {
            cursor -= x.weight;
            if (cursor <= 0)
                return { item: x.item, draw };
        }
        return { item: valid[valid.length - 1].item, draw };
    }
}
export function makeRngStream(seed, salt) {
    const mixed = (seed ^ salt ^ 0x9E3779B9) >>> 0;
    return { seed, state: mixed || 1, draws: 0 };
}
