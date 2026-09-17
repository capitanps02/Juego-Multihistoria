# Codex prompt — Agent 6 canon 23–30

Work on `t51/canon-23-30`, never directly on `main`.

Before each change, refresh `main`, compare the branch and inspect the exact shared authority that the scene needs. Preserve branch isolation and do not activate staged exact-ID replacements by changing global lineage/migrations; that belongs to the integrator.

Execution order:

1. Run build plus `scripts/test-t51-agent6-*.mjs` currently present.
2. Audit current authority for `EVT_26_MED_001`; implement only if injury/history facts are authoritative and persisted.
3. Implement `EVT_26_DOC_001` with NPC knowledge/publication/privacy rules. Unpublished/private facts must not become global knowledge.
4. Implement `EVT_26_RIV_001` only from real prior rivalry/conflict relationship or seed evidence. A fixture alone cannot create the rivalry.
5. Implement `EVT_26_CAP_001` only if a real captain/locker target exists; otherwise fail closed. Never infer captaincy from age, status or reputation.
6. Re-audit `EVT_26_TEAM_002`; institutional actors must belong to the current club.
7. Leave MATCH/FINAL/NAT scenes blocked until the corresponding sport/national authorities exist.

Always preserve: no synthetic CareerOffer, no direct club mutation, no narrative RNG for football outcomes, no invented NPC authority, no historical seed-origin rewrite.

For every implemented scene add a deterministic focal test that proves eligibility, fail-closed behavior, no unauthorized state mutation, and no RNG consumption by read/gate logic where applicable. Update `CURRENT_STATUS.json`, `AGE26_STATUS.json`, `implementation-ready.json` and blockers in the same branch.
