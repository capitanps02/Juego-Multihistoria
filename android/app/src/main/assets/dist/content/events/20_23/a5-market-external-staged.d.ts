import type { EventDefinition } from "../../../core/types.js";
export declare const A5_MARKET_EXTERNAL_REQUIREMENTS: Readonly<{
    EVT_20_MKT_001: {
        owner: string;
        facts: string[];
        forbidden: string[];
    };
    EVT_20_JAN_001: {
        owner: string;
        facts: string[];
        forbidden: string[];
    };
    EVT_21_MKT_001: {
        owner: string;
        facts: string[];
        forbidden: string[];
    };
    EVT_21_IMG_001: {
        owner: string;
        facts: string[];
        forbidden: string[];
    };
    EVT_22_MKT_001: {
        owner: string;
        facts: string[];
        forbidden: string[];
    };
    EVT_22_DDL_001: {
        owner: string;
        facts: string[];
        forbidden: string[];
    };
}>;
export declare const A5_MARKET_OWNER_READY_PRINCIPALS: EventDefinition[];
/** A0/A5 post-authority handoff: only EVT_20_MKT_001 is formally offer-ready in this file. */
export declare const A5_MARKET_READY_EVENTS: EventDefinition[];
