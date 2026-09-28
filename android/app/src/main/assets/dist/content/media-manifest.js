import { EVENT_CUTSCENES, PROLOGUE_CUTSCENE } from "./event-cutscenes.js";
import { EVENTS } from "./events/index.js";
const familyFallbacks = [...new Set(EVENTS.map(e => e.family))].map(family => ({
    id: `generic_${family}`,
    type: "image",
    uri: `/assets/generic/${family}.webp`,
    bytesHint: 120_000
}));
const eventHeroes = EVENTS.map(e => ({
    id: `hero_${e.id.toLowerCase()}`,
    type: "image",
    uri: `/assets/events/18_20/${e.id.toLowerCase()}.webp`,
    bytesHint: 180_000,
    fallbackId: `generic_${e.family}`
}));
export const MEDIA_MANIFEST = [
    ...familyFallbacks,
    ...eventHeroes,
    ...[PROLOGUE_CUTSCENE, ...EVENT_CUTSCENES].map(clip => ({
        id: clip.file.replace(/\.webm$/, ""), type: "video",
        uri: `/web/assets/cutscenes/${clip.file}`,
        fallbackId: EVENTS.some(event => event.id === clip.eventId) ? `hero_${clip.eventId.toLowerCase()}` : "generic_life"
    })),
    {
        id: "cutscene_evt_18_sum_001_contract",
        type: "video",
        uri: "/assets/events/18_20/evt_18_sum_001_contract.webm",
        bytesHint: 2_200_000,
        fallbackId: "hero_evt_18_sum_001"
    }
];
