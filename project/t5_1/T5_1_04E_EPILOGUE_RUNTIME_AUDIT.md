# T5.1 Batch 04E — epilogue runtime truthfulness audit

Generated: 2026-09-16  
Baseline: `chore/chatgpt-codex-workflow`  
Canonical authority: `T5_1_COMPLETION_GATE.md` and retirement semantic map.

## Executive result

The current epilogue generator has one important correct invariant:

- `generateEpilogue()` returns unless `retirement.status === "closed"`.

That satisfies the **timing guard** but does not by itself satisfy epilogue truthfulness. The current generator can still summarize terminal state produced by non-canonical retirement shortcuts, and several ending-family scores use proxy flags/state that need stronger terminal-fact validation.

04E status: **NOT READY / depends on truthful 04D + 05E terminal state**.

## Current generator model

`src/epilogue/generator.ts`:
- scores 20 ending families from the closed game state;
- deterministically selects 2–5 families;
- chooses 12–20 salient history milestones;
- stores `generated`, selected families, milestone strings and a summary key.

Selection is deterministic from state/narrative seed/age/history length and does not appear to draw RNG directly during epilogue generation.

## Positive findings

### EPI-01 — correct status guard
The generator does not generate before `closed`.

Preserve this invariant. Do not solve upstream FSM problems by weakening it.

### EPI-02 — milestone source is actual history
Milestones are derived from recorded `HistoryEntry` values (`season`, `eventId`, `choiceId`) rather than invented canonical aliases.

This is compatible with migration truthfulness as long as old historical IDs remain preserved.

### EPI-03 — deterministic family selection
Family count and milestone sampling are computed from existing state/seed/history rather than advancing an RNG stream inside the generator.

This is directionally compatible with read/determinism requirements, subject to final tests after upstream reconciliation.

## Truthfulness risks / gaps

### EPI-04 — upstream invalid terminal facts contaminate epilogue
Current runtime can reach `closed` via non-canonical paths (documented in `T5_1_04D_RETIREMENT_RUNTIME_AUDIT.md`).

Examples:
- direct early-retirement close;
- administrative no-last-match close;
- storybook flag/closure manufactured by choice;
- noncanonical reversal history.

The epilogue guard cannot distinguish a truthful closed state from one produced by those shortcuts.

Therefore Gate F cannot PASS before Gate E/05E.

### EPI-05 — home ending may confuse pull/route with actual final club truth
`END_HOME_PRODIGAL` receives score from:
- `professional.route === "home"` **or** `HOME_RETURN_30`;
- `homePull`;
- plus bonus if `ownerClub === "UDV"`.

Canonical completion rules require distinguishing:
- wanting/pulling toward home;
- having returned at some earlier point;
- actually finishing the career at home.

A home-route/history flag may be valid context, but must not make the final epilogue state that the player **finished at home** unless final club/closure facts prove it.

### EPI-06 — market-silence family depends on inconsistent closure/reason conventions
`END_MARKET_SILENCE` checks `closureType === "no_market"` plus no-market windows/low market.

Current late-career engine can set retirement **reason** `no_market` and later auto-close with closure type `no_last_match`.

This mixes reason and closure shape. Canon requires them to be separate facts:
- why retirement was decided;
- how the sporting career closed.

04E should read explicit reason for market-silence identity and explicit last-match/closure shape separately.

### EPI-07 — early-voluntary ending inherits direct-close technical shortcut
`END_EARLY_VOLUNTARY` scores `closureType === "early_retirement"` or decision age <=34.

Current headless simulation can set closure `early_retirement` by calling `closeCareer()` directly from `EARLY_RETIRED_30_34`, bypassing decision/announcement semantics.

After 04D repair, the epilogue family must be driven by truthful decision origin/reason, not the legacy shortcut closure label.

### EPI-08 — comeback ending currently depends on noncanonical reversal state
`END_COMEBACK_FINAL` scores `retirement.reversals > 0` and `RETIREMENT_RECONSIDERED`.

The canonical status of retirement reversal is currently unresolved. This ending family cannot be fully certified until the state-model decision is explicit and migration behavior is defined.

### EPI-09 — storybook family trusts a currently forceable flag
`END_STORYBOOK_FAREWELL` strongly scores `STORYBOOK_LAST_GOAL` and `closureType === "storybook"`.

Current conditional implementation can set those facts directly from a player narrative choice. 05E must first make them reflect an actual sporting last-match result.

04E should then consume those immutable facts; it must not infer or create them.

### EPI-10 — required terminal inputs are not represented as an explicit validated epilogue contract
Completion gate requires the epilogue to consume truthful facts including:
- retirement age and primary reason;
- decision origin;
- announcement path;
- closure/last-match shape;
- final club/route;
- body/health context;
- national-team final posture;
- home-return truth;
- succession/mentor state;
- records/legacy;
- wealth/brand/business;
- agent/self-representation;
- family/post-career readiness;
- public/fan relationship.

Current generator reads many professional/flag proxies directly but has no explicit validation layer proving the terminal fact set is coherent before family scoring.

This does not require inventing a huge new epilogue schema, but 04E must make the dependency contract auditable and test contradictions.

## Required 04E truth rules

1. Epilogue remains inaccessible before `closed`.
2. Generation never changes terminal sporting facts.
3. Retirement **reason** and **closure shape** are distinct inputs.
4. Announcement style can change public/media/family texture, not sporting facts.
5. Home-finish copy/family requires actual final-home truth; home pull alone is insufficient.
6. `no_last_match` and storybook/played-last-match shapes are mutually exclusive.
7. Accepted playable late offer cannot coexist immediately with terminal epilogue.
8. Marketing/farewell flags are context, not proof of retirement.
9. Milestones preserve actual historical IDs/choices.
10. Legacy migration cannot upgrade an old ending into a more cinematic canonical one.
11. Generator/read path consumes no RNG.
12. Re-generating from identical closed state yields identical epilogue.

## Recommended implementation pattern

After 04D/05E produce canonical terminal facts, add a small validated terminal-facts projection used by epilogue scoring, for example conceptually:

- decision facts;
- announcement facts;
- closure facts;
- final sporting facts;
- final route/club facts;
- longitudinal legacy/context facts.

The exact type/API is implementation-specific. The important requirement is that family scorers cannot silently substitute a thematic proxy for a required terminal fact.

## Required tests

### Timing/immutability
- not generated in `playing`, `decided`, `announced`;
- generated exactly once in `closed`;
- generating does not mutate retirement/club/body/history/RNG facts.

### Contradiction fixtures
Reject or avoid false family classification for:
- high `homePull` but final club is not home;
- prior home return but career ends elsewhere;
- retirement reason `no_market` + closure `no_last_match` (both facts retained distinctly);
- storybook flag absent with no-last-match closure;
- storybook flag present with no-last-match closure (invalid upstream state should fail validation/audit);
- accepted late contract while still playing;
- announcement marketing flag without actual retirement decision.

### Determinism
- same closed state -> identical families/milestones/summary key;
- microfeeds on/off cannot alter epilogue if strong narrative/terminal facts are otherwise identical;
- save/reload closed state -> identical epilogue output.

### Migration/history
- legacy history milestones keep legacy IDs;
- no canonical `SEEN_*`/milestone is manufactured from a thematic old event;
- old imperfect/no-last-match endings are not rewritten as storybook endings.

## Dependency status

04E runtime work must wait for:
- principal retirement FSM 04D;
- conditional 05E;
- final canonical terminal facts and migration rules.

## Status

**04E_EPILOGUE_AUDIT_COMPLETE / IMPLEMENTATION_BLOCKED_BY_04D_AND_05E**