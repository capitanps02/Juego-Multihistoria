# Canon 34+ — conditional-event reconciliation

## Finding

Pasada 7 contains an explicit canonical table: **25.13 — Baraja condicional, 32 eventos que pueden alterar el final**. Therefore the previous Agent-8 wording that the 34+ conditional corpus had “no canonical conditional-ID inventory” was too conservative.

The current engine also contains 32 `family:"conditional"` rows, but count equality is misleading:

- canonical IDs: **32**;
- engine IDs: **32**;
- exact ID overlap: **5**;
- exact-ID rows already semantically accredited: **0**;
- canonical exact IDs missing from engine: **27**;
- engine technical exact IDs absent from canon: **27**.

Machine-readable evidence: `CONDITIONAL_RECONCILIATION.json`.

## Why the current 32 are not canonical coverage

`src/content/events/34_plus/conditional-events.ts` builds **29/32** rows through one `generic(...)` helper. Those rows share:

- generic body copy;
- generic choices A–D;
- generic effects on `careerControl`, `statusInertia`, `recoveryDebt`, `environmentStability`;
- `canonStatus:"technical_adaptation"`.

Many gates also use proxies that the current shared-authority work has explicitly rejected as sufficient truth, including `sport.roleScore`, `agentControl`, `nationalCaps`, narrative offer flags and generic market/retirement flags.

Therefore these 29 rows are useful historical/technical content, not evidence that the 32 Pasada-7 conditional identities were implemented.

## Exact-ID overlap — all five still need reimplementation

### `CEVT_34_MAJOR_COMEBACK`
Canon requires a real major injury, successful rehab, 7–10 month return and unexpectedly strong weeks. The engine uses a `MAJOR_COMEBACK_CONTEXT` flag and the generic choice shell. Same ID, different implementation contract.

### `CEVT_36_NO_MEDICAL_CLEARANCE`
Canon requires a real interested club plus a medical evaluation that fails or yields special conditions. The engine gates on `LATE_BODY_REDLINE` and generic choices. The scene needs both market and medical authority.

### `CEVT_38_OFFER_AFTER_RETIREMENT_ANNOUNCED`
Canon requires an announced retirement plus an actual market emergency and concrete club approach. The engine uses `POST_ANNOUNCE_OFFER`. A flag is not a formal `CareerOffer`. The terminal reconsideration boundary belongs to Agent 9/shared retirement authority.

### `CEVT_RET_NO_LAST_MATCH`
Canon requires retirement plus injury/suspension causing the career to end without an on-field last match. The engine closes after `daysInStatus >= 60`. Elapsed time cannot fabricate the sporting reason for no last match.

### `CEVT_RET_STORYBOOK_LAST_GOAL`
Canon allows a goal in a real last match when a plausible goal window exists; it must never be forced. The engine `TAKE` choice writes `STORYBOOK_LAST_GOAL` and closes the career. A narrative choice cannot fabricate the goal.

## `canonStatus:"verified"` audit

Three current engine rows are labelled `verified`:

- `CEVT_RET_RECONSIDER`;
- `CEVT_RET_STORYBOOK_LAST_GOAL`;
- `CEVT_RET_NO_LAST_MATCH`.

That metadata must not be treated as accreditation:

- `CEVT_RET_RECONSIDER` is **not** one of the 32 canonical Pasada-7 IDs;
- `CEVT_RET_STORYBOOK_LAST_GOAL` is exact-ID but semantically/authoritatively mismatched;
- `CEVT_RET_NO_LAST_MATCH` is exact-ID but semantically/authoritatively mismatched.

The canonical reconsideration identity is `CEVT_38_RETIREMENT_REVERSAL`. `CEVT_RET_RECONSIDER` may be a semantic predecessor/candidate replacement, but no alias or migration mapping is approved. Agent 9/shared retirement must decide that explicitly with save/provenance evidence.

## Canonical IDs absent from engine

The 27 missing exact IDs are listed in `CONDITIONAL_RECONCILIATION.json`. They cover late peak, returning NPCs, Clara/Nano/Adrián memory, family ownership, club relegation/promotion, manager promise failure, successor injury, UDV crisis/cup run, late national-team outcomes, sponsor/public-rivalry outcomes, youth mentor consequences, records, last continental run, player-coach emergency, farewell environment, last derby and retirement reversal.

These are not interchangeable with similarly themed engine rows. No fuzzy title matching is allowed.

## Engine technical extras

The 27 engine IDs absent from canon remain historical technical content until a specific decision says otherwise. Examples include `CEVT_34_RENEWAL_GHOST`, `CEVT_35_NT_EXCLUSION`, `CEVT_36_MARKET_SILENCE`, `CEVT_37_NO_LAST_DERBY`, `CEVT_38_MEDIA_FAREWELL` and `CEVT_RET_RECONSIDER`.

Do not delete them merely to make counts match. Their eventual treatment must use the same content-lineage rules as principal scenes:

1. determine whether a row is retired, retained as non-canonical compatibility content, or replaced by a specific canonical identity;
2. preserve historical journal/history and frozen pending definitions;
3. add explicit migration/evidence only when approved;
4. never reinterpret a historical technical ID as a canonical event by name similarity.

## Ownership boundary

Four canonical conditional identities are explicitly terminal/reconsideration/last-match domain and must be coordinated with Agent 9:

- `CEVT_38_OFFER_AFTER_RETIREMENT_ANNOUNCED`;
- `CEVT_38_RETIREMENT_REVERSAL`;
- `CEVT_RET_NO_LAST_MATCH`;
- `CEVT_RET_STORYBOOK_LAST_GOAL`.

The remaining 28 canonical conditionals belong to ordinary/pre-terminal 34+ or shared-authority space, but their exact runtime owner should follow the factual domain in `SHARED_OWNER_ROUTING.json`. Agent 8 must not use that count to bypass market, sport, national, NPC, medical or lineage owners.

## Codex rule

Do **not** implement “32 conditionals” as a numerical target. Implement exact canonical identities from section 25.13 only when their factual trigger can be proven. For every row:

- exact canonical ID;
- factual trigger producer;
- scene-specific content, not the generic A–D shell;
- exact seed/NPC memory dependencies where present;
- save/pending/contentIdentity lineage treatment;
- no proxy substitution;
- terminal ownership respected.

Until that work lands, 34+ conditional runtime completion is **0/32 accredited**, even though 32 technical conditional rows currently exist.
