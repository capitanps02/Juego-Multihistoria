import type { EventDefinition } from "../../../core/types.js";
export declare const A5_AGENT_EXTERNAL_REQUIREMENTS: Readonly<{
    EVT_20_AGT_001: {
        owner: string;
        awaiting: string[];
        forbidden: string[];
    };
    EVT_20_BRUNO_001: {
        owner: string;
        awaiting: string[];
        optional: string[];
        forbidden: string[];
    };
    EVT_21_AGT_001: {
        owner: string;
        awaiting: string[];
        forbidden: string[];
    };
}>;
export declare const A5_AGENT_READY_EXTERNAL_EVENTS: EventDefinition[];
/** A0/A5 post-authority handoff: only EVT_20_AGT_001 is externally complete after representation bridge. */
export declare const A5_REPRESENTATION_READY_EVENTS: EventDefinition[];
