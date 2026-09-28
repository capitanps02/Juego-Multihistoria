import type { EventDefinition, GameState } from "../core/types.js";
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
export declare function a8CanonicalRuntimeEligible(state: GameState, event: EventDefinition): boolean;
