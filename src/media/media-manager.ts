import type { MediaAssetDefinition, MediaAssetRef, PresentationSpec } from "../core/types.js";

export interface ResolvedMedia {
  ref: MediaAssetRef;
  asset: MediaAssetDefinition | null;
  fallbackChain: MediaAssetDefinition[];
}

export function resolvePresentation(spec: PresentationSpec | undefined, manifest: MediaAssetDefinition[]): ResolvedMedia[] {
  if (!spec?.assets?.length) return [];
  const byId = new Map(manifest.map(x => [x.id, x]));
  return spec.assets.map(ref => {
    const asset = byId.get(ref.id) ?? null;
    const chain: MediaAssetDefinition[] = [];
    let fallback = ref.fallbackId ?? asset?.fallbackId;
    const visited = new Set<string>();
    while (fallback && !visited.has(fallback)) {
      visited.add(fallback);
      const hit = byId.get(fallback);
      if (!hit) break;
      chain.push(hit);
      fallback = hit.fallbackId;
    }
    return { ref, asset, fallbackChain: chain };
  });
}

export function makePreloadPlan(specs: Array<PresentationSpec | undefined>, manifest: MediaAssetDefinition[], maxBytes = 5_000_000): MediaAssetDefinition[] {
  const byId = new Map(manifest.map(x => [x.id, x]));
  const priority = { high: 3, normal: 2, low: 1 } as const;
  const candidates = specs.flatMap(spec => (spec?.assets ?? []).map(ref => ({ ref, p: priority[spec?.preloadPriority ?? "normal"] })));
  candidates.sort((a, b) => b.p - a.p);
  const out: MediaAssetDefinition[] = []; const seen = new Set<string>(); let bytes = 0;
  for (const c of candidates) {
    if (seen.has(c.ref.id)) continue;
    const asset = byId.get(c.ref.id); if (!asset) continue;
    const size = asset.bytesHint ?? 0; if (bytes + size > maxBytes) continue;
    seen.add(asset.id); out.push(asset); bytes += size;
  }
  return out;
}
