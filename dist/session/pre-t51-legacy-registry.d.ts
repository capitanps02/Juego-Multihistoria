export interface LegacyEventEvidence {
    fingerprint: string;
    journalDigests: Readonly<Record<string, Readonly<Record<string, string>>>>;
}
export declare const PRE_T51_CONTENT_IDENTITY = "2e07efd2ea99c4e9ec4c2b20ae89664204f76db2c55a72d567208799c01bccff";
export declare const PRE_T51_EVENT_COUNT = 388;
export declare const PRE_T51_EVENT_EVIDENCE: Readonly<Record<string, LegacyEventEvidence>>;
