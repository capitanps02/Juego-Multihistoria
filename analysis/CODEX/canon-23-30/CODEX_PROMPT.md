# Codex prompt — Agent 6 canon 23–30

Work on `t51/canon-23-30`, never directly on `main`. Refresh and compare before changes.

Current staged implementations: LOCK23, MKT23, CON23, CON25, MKT25, age-26 bridge and DOC26. Do not activate them by changing global lineage/migrations from this workstream.

Next execution order:

1. Run build and all present `scripts/test-t51-agent6-*.mjs` tests.
2. Audit and implement `EVT_26_CAP_001` only if an authoritative captain/locker target is available; fail closed otherwise.
3. Audit `EVT_26_TEAM_002`; institutional actors must belong to the current club.
4. Keep `EVT_26_MED_001` blocked until authoritative schedule density exists; `recoveryMargin` alone is insufficient.
5. Keep `EVT_26_RIV_001` blocked until Adrián's compatible competitive level is persisted; `SEED_ADRIAN_MIRROR` alone is insufficient.
6. Keep MATCH/FINAL/NAT scenes blocked until their sport/national authorities exist.

DOC26 rule: the event only negotiates access. Its seed payload records `published=false`; private/unpublished facts must not become public or global NPC knowledge without a later transmission/publication event.

Always preserve: no synthetic CareerOffer, no direct club mutation, no narrative RNG for football outcomes, no invented NPC authority, no historical seed-origin rewrite. Every new candidate needs deterministic focal tests for canonical choices, eligibility, fail-closed behavior, unauthorized mutations and read-path RNG consumption where applicable.
