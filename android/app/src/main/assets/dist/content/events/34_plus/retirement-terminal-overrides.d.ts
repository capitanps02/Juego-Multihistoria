import type { EventDefinition } from "../../../core/types.js";
/**
 * T5.36 owns only the terminal retirement semantics. These overrides deliberately mutate
 * the existing catalogue objects instead of replacing the ordinary 34+ career owned by
 * the veteran-career workstream.
 *
 * IMPORTANT: several legacy IDs keep their physical ID while changing semantic identity.
 * Content migration must therefore compare frozen fingerprints/sourceContentIdentity; ID
 * equality alone is not equivalence (especially CEVT_RET_RECONSIDER and the last-match IDs).
 */
export declare function applyRetirementTerminalOverrides(principal: EventDefinition[], conditional: EventDefinition[]): void;
