export function resolvePresentation(spec, manifest) {
    if (!spec?.assets?.length)
        return [];
    const byId = new Map(manifest.map(x => [x.id, x]));
    return spec.assets.map(ref => {
        const asset = byId.get(ref.id) ?? null;
        const chain = [];
        let fallback = ref.fallbackId ?? asset?.fallbackId;
        const visited = new Set();
        while (fallback && !visited.has(fallback)) {
            visited.add(fallback);
            const hit = byId.get(fallback);
            if (!hit)
                break;
            chain.push(hit);
            fallback = hit.fallbackId;
        }
        return { ref, asset, fallbackChain: chain };
    });
}
export function makePreloadPlan(specs, manifest, maxBytes = 5_000_000) {
    const byId = new Map(manifest.map(x => [x.id, x]));
    const priority = { high: 3, normal: 2, low: 1 };
    const candidates = specs.flatMap(spec => (spec?.assets ?? []).map(ref => ({ ref, p: priority[spec?.preloadPriority ?? "normal"] })));
    candidates.sort((a, b) => b.p - a.p);
    const out = [];
    const seen = new Set();
    let bytes = 0;
    for (const c of candidates) {
        if (seen.has(c.ref.id))
            continue;
        const asset = byId.get(c.ref.id);
        if (!asset)
            continue;
        const size = asset.bytesHint ?? 0;
        if (bytes + size > maxBytes)
            continue;
        seen.add(asset.id);
        out.push(asset);
        bytes += size;
    }
    return out;
}
