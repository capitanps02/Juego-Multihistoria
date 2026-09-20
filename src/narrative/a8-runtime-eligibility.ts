import type { EventDefinition, GameState } from "../core/types.js";
import {
  STAGED_PRINCIPAL_WAVE_A,
  isStagedWaveAEligible
} from "../content/events/34_plus/staged-principal-wave-a.js";
import {
  STAGED_PRINCIPAL_SPORT_BATCH,
  isStagedSportBatchEligible
} from "../content/events/34_plus/staged-principal-sport-batch.js";
import {
  STAGED_PRINCIPAL_ROLE_BATCH,
  isStagedRoleBatchEligible
} from "../content/events/34_plus/staged-principal-role-batch.js";
import {
  STAGED_MARKET_BATCH_1,
  isStagedMarketBatch1Eligible
} from "../content/events/34_plus/staged-principal-market-batch-1.js";
import {
  STAGED_MARKET_BATCH_2,
  isStagedMarketBatch2Eligible
} from "../content/events/34_plus/staged-principal-market-batch-2.js";
import {
  STAGED_SHARED_BATCH_3,
  isStagedSharedBatch3Eligible
} from "../content/events/34_plus/staged-principal-shared-batch-3.js";
import {
  STAGED_SHARED_BATCH_4,
  isStagedSharedBatch4Eligible
} from "../content/events/34_plus/staged-principal-shared-batch-4.js";
import {
  STAGED_MEMORY_CONDITIONALS,
  isMemoryConditionalEligible
} from "../content/events/34_plus/staged-conditional-memory.js";
import {
  CEVT_35_UDV_FINANCIAL_CRISIS,
  isUdvFinancialCrisisEligible
} from "../content/events/34_plus/staged-conditional-udv-crisis.js";
import {
  CEVT_35_SPONSOR_LATE_BOOM,
  isSponsorLateBoomEligible
} from "../content/events/34_plus/staged-conditional-sponsor-boom.js";
import { STAGED_ORDINARY_CANONICAL_CONDITIONALS } from "../content/events/34_plus/staged-conditional-ordinary.js";

const ids = (events: readonly EventDefinition[]) => new Set(events.map(event => event.id));

const WAVE_A = ids(STAGED_PRINCIPAL_WAVE_A);
const SPORT = ids(STAGED_PRINCIPAL_SPORT_BATCH);
const ROLE = ids(STAGED_PRINCIPAL_ROLE_BATCH);
const MARKET_1 = ids(STAGED_MARKET_BATCH_1);
const MARKET_2 = ids(STAGED_MARKET_BATCH_2);
const SHARED_3 = ids(STAGED_SHARED_BATCH_3);
const SHARED_4 = ids(STAGED_SHARED_BATCH_4);
const MEMORY_CONDITIONALS = ids(STAGED_MEMORY_CONDITIONALS);
const EXTERNAL_CONDITIONALS = new Set(
  STAGED_ORDINARY_CANONICAL_CONDITIONALS.map(row => row.event.id)
);

/**
 * A8 runtime accreditation boundary.
 *
 * Owner definitions are active in the final ordinary catalog, but a canonical
 * scene may schedule only when its factual adapter is authoritative. Existing
 * owner helpers with self-contained facts are consumed directly. Batches whose
 * helper still requires an explicit external-fact boolean remain fail-closed
 * until that exact adapter exists; no age/reputation/locker/seed proxy upgrades
 * the boolean to true.
 */
export function a8CanonicalRuntimeEligible(state: GameState, event: EventDefinition): boolean {
  if (state.phase !== "34_plus") return true;
  const id = event.id;

  if (WAVE_A.has(id)) return isStagedWaveAEligible(state, id as any);
  if (SPORT.has(id)) return isStagedSportBatchEligible(state, id as any);
  if (ROLE.has(id)) return isStagedRoleBatchEligible(state, id as any);

  // These owner helpers deliberately require an explicit factual adapter.
  // Keep them closed rather than fabricating evidence from broad proxies.
  if (MARKET_1.has(id)) return isStagedMarketBatch1Eligible(state, id as any, false);
  if (MARKET_2.has(id)) return isStagedMarketBatch2Eligible(state, id, false);
  if (SHARED_3.has(id)) return isStagedSharedBatch3Eligible(state, id, false);
  if (SHARED_4.has(id)) return isStagedSharedBatch4Eligible(state, id, false);

  if (MEMORY_CONDITIONALS.has(id)) return isMemoryConditionalEligible(state, id as any);
  if (id === CEVT_35_UDV_FINANCIAL_CRISIS.id) return isUdvFinancialCrisisEligible(state);
  if (id === CEVT_35_SPONSOR_LATE_BOOM.id) return isSponsorLateBoomEligible(state);

  // Generic canonical conditionals are exact content definitions but their
  // factual trigger adapters are intentionally unsupported/fail-closed.
  if (EXTERNAL_CONDITIONALS.has(id)) return false;

  // A9 terminal content and all non-A8 content keep their existing contracts.
  return true;
}
