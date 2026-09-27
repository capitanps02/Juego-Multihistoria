import { EVENT_CUTSCENES } from "./event-cutscenes.js";
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
  ...EVENT_CUTSCENES.map(clip => ({
    id: clip.file.replace(/\.webm$/, ""), type: "video" as const,
    uri: `/web/assets/cutscenes/${clip.file}`,
    fallbackId: `hero_${clip.eventId.toLowerCase()}`
  })),
  {
    id: "cutscene_evt_18_sum_001_contract",
    type: "video",
    uri: "/assets/events/18_20/evt_18_sum_001_contract.webm",
    bytesHint: 2_200_000,
    fallbackId: "hero_evt_18_sum_001"
  }
];
