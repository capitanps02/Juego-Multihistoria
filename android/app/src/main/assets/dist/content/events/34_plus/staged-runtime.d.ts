import type { EventDefinition } from "../../../core/types.js";
export declare const A8_STAGED_PRINCIPALS: readonly EventDefinition[];
export declare const A8_STAGED_ORDINARY_CONDITIONALS: readonly EventDefinition[];
export declare const A8_TERMINAL_CONDITIONAL_HANDOFFS: readonly import("./terminal-conditional-handoff.js").TerminalConditionalHandoff[];
export interface A8SeedWriter {
    seedId: string;
    producerEventId: string;
}
/** Exact ordinary Pasada-7 writer surface. Resolver creation will stamp originEvent=producerEventId. */
export declare const A8_ORDINARY_SEED_WRITERS: readonly A8SeedWriter[];
