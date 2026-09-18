import type { EventDefinition } from "../../../core/types.js";
import { STAGED_PRINCIPAL_WAVE_A } from "./staged-principal-wave-a.js";
import { STAGED_PRINCIPAL_SPORT_BATCH } from "./staged-principal-sport-batch.js";
import { STAGED_PRINCIPAL_ROLE_BATCH } from "./staged-principal-role-batch.js";
import { STAGED_EXTERNAL_PRINCIPALS } from "./staged-principal-awaiting-external.js";
import { STAGED_ORDINARY_CANONICAL_CONDITIONALS } from "./staged-conditional-ordinary.js";
import { TERMINAL_CONDITIONAL_HANDOFFS } from "./terminal-conditional-handoff.js";

export const A8_STAGED_PRINCIPALS: readonly EventDefinition[] = [
  ...STAGED_PRINCIPAL_WAVE_A,
  ...STAGED_PRINCIPAL_SPORT_BATCH,
  ...STAGED_PRINCIPAL_ROLE_BATCH,
  ...STAGED_EXTERNAL_PRINCIPALS.map(row=>row.event)
];

export const A8_STAGED_ORDINARY_CONDITIONALS: readonly EventDefinition[] =
  STAGED_ORDINARY_CANONICAL_CONDITIONALS.map(row=>row.event);

export const A8_TERMINAL_CONDITIONAL_HANDOFFS = TERMINAL_CONDITIONAL_HANDOFFS;

export interface A8SeedWriter {
  seedId: string;
  producerEventId: string;
}

/** Exact ordinary Pasada-7 writer surface. Resolver creation will stamp originEvent=producerEventId. */
export const A8_ORDINARY_SEED_WRITERS: readonly A8SeedWriter[] =
  A8_STAGED_PRINCIPALS.flatMap(event=>(event.seedsWrite??[]).map(seedId=>({
    seedId,
    producerEventId:event.id
  })));
