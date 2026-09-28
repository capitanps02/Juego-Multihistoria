import type { EventDefinition } from "../../../core/types.js";
/**
 * Canonical accreditation ratchet for terminal conditionals.
 *
 * Runtime compatibility may intentionally be safer than the historical generic rows while
 * still lacking the exact Pasada-7 factual trigger. That must never be promoted to
 * canonStatus="verified" merely because the physical ID overlaps canon.
 */
export declare function enforceRetirementTerminalCanonicalAccreditation(conditional: EventDefinition[]): void;
