import { EVENTS } from "./events/index.js";
import type { MediaAssetDefinition } from "../core/types.js";

const familyFallbacks = [...new Set(EVENTS.map(e => e.family))].map(family => ({
  id: `generic_${family}`,
  type: "image" as const,
  uri: `/assets/generic/${family}.webp`,
  bytesHint: 120_000
}));

const eventHeroes = EVENTS.map(e => ({
  id: `hero_${e.id.toLowerCase()}`,
  type: "image" as const,
  uri: `/assets/events/18_20/${e.id.toLowerCase()}.webp`,
  bytesHint: 180_000,
  fallbackId: `generic_${e.family}`
}));

export const MEDIA_MANIFEST: MediaAssetDefinition[] = [
  ...familyFallbacks,
  ...eventHeroes,
  {
    id: "cutscene_evt_18_match_001_debut",
    type: "video",
    uri: "/assets/events/18_20/evt_18_match_001_debut.webm",
    bytesHint: 1_800_000,
    fallbackId: "hero_evt_18_match_001"
  },
  {
    id: "cutscene_evt_18_sum_001_contract",
    type: "video",
    uri: "/assets/events/18_20/evt_18_sum_001_contract.webm",
    bytesHint: 2_200_000,
    fallbackId: "hero_evt_18_sum_001"
  }
];
