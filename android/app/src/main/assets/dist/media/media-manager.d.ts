import type { MediaAssetDefinition, MediaAssetRef, PresentationSpec } from "../core/types.js";
export interface ResolvedMedia {
    ref: MediaAssetRef;
    asset: MediaAssetDefinition | null;
    fallbackChain: MediaAssetDefinition[];
}
export declare function resolvePresentation(spec: PresentationSpec | undefined, manifest: MediaAssetDefinition[]): ResolvedMedia[];
export declare function makePreloadPlan(specs: Array<PresentationSpec | undefined>, manifest: MediaAssetDefinition[], maxBytes?: number): MediaAssetDefinition[];
