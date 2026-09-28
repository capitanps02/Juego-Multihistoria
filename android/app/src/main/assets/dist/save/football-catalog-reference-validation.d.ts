export interface FootballCatalogReferenceIssue {
    path: string;
    reason: string;
}
/**
 * Referential integrity is intentionally version-gated. Missing/pre-catalog saves
 * retain frozen legacy semantics; current V2 saves fail closed on every active/new
 * football identity while historical provenance may retain explicit legacy IDs.
 */
export declare function inspectFootballCatalogSaveReferences(value: unknown): FootballCatalogReferenceIssue | null;
