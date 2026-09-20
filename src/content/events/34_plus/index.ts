import type { EventDefinition } from "../../../core/types.js";
import { PRINCIPAL_EVENTS_34_PLUS } from "./principal-events.js";
import { CONDITIONAL_EVENTS_34_PLUS } from "./conditional-events.js";
import { STAGED_PRINCIPAL_WAVE_A } from "./staged-principal-wave-a.js";

const A8_WAVE_A_IDS = new Set(STAGED_PRINCIPAL_WAVE_A.map(event=>event.id));
const A8_WAVE_A_RETIRED_TECHNICAL = new Set(["EVT_34_MKT_001"]);

const ordinaryWaveABase = PRINCIPAL_EVENTS_34_PLUS.filter(event =>
  !A8_WAVE_A_IDS.has(event.id)
  && !A8_WAVE_A_RETIRED_TECHNICAL.has(event.id)
);

export const PRINCIPAL_EVENTS_34_PLUS_WAVE_A: EventDefinition[] = [
  ...ordinaryWaveABase,
  ...STAGED_PRINCIPAL_WAVE_A
];

export const EVENTS_34_PLUS=[...PRINCIPAL_EVENTS_34_PLUS_WAVE_A,...CONDITIONAL_EVENTS_34_PLUS];
