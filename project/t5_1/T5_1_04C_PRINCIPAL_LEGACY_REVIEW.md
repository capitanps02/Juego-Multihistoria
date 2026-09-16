# T5.1 — Batch 04C semantic review of ages 36–38 runtime-only principal IDs

Generated: 2026-09-16  
Branch: `chore/chatgpt-codex-workflow`

## Result

Batch entries reviewed: **10/10**.  
New unique dispositions in this pass: **9**.  
Previously reviewed and reaffirmed: `EVT_36_RICH_001`.  
Approved same-scene migrations: **0/10**.

Every legacy entry remains `retire_technical_keep_history_only`.

## Structural evidence

The baseline late-career implementation builds every 04C legacy row through the same `generic(...)` adapter. The adapter only changes ID, age, family, months and weight; it supplies the same broad late-career text and the same four choices:

- protect role;
- accept adaptation;
- prioritize body;
- explore market.

Canonical 36–38 content is instead driven by concrete football and life facts: recovery pattern, a younger coach, a real appearance milestone, a veteran peer retiring, a lower-league offer, a three-month emergency contract, a ten-match home return, an actual farewell-context penalty, or genuine market silence.

## Key identity decisions

### `EVT_36_RICH_001`

Previously reviewed as the exact-title candidate for canonical `EVT_38_RICH_001`. The shared title “Una última oferta enorme” does not establish identity: baseline starts at age 36 with generic market choices; canon is an age-37+ huge-offer/retirement tradeoff with explicit terms, minimum role and a distinct six-month route.

Disposition remains `retire_technical_keep_history_only`.

### `EVT_38_MKT_001`

This is especially important because another workstream proposed keeping it as an alias for canonical `EVT_38_MARKET_001`.

Baseline engine scene:
- title: **El teléfono todavía suena**;
- generic late-career market body;
- generic protect/adapt/body/market choices.

Canonical scene:
- ID `EVT_38_MARKET_001`;
- title: **Nadie llama en julio**;
- trigger: free agent 37+ + low market floor;
- visible fact: real market silence and informal contacts;
- five specific choices: lower salary, lower level, wait to September, retire, or proactively call UDV/a specific club;
- creates `SEED_MARKET_SILENCE_END` and reads `SEED_MARKET_FLOOR_FINAL`.

Those are different historical scenes. Repairing `EVT_38_MKT_001` in place for future sessions cannot retroactively make old `EVT_38_MKT_001` history canonical.

Disposition: `retire_technical_keep_history_only`. Future canonical scheduling must use `EVT_38_MARKET_001`.

## Representative canonical contrasts

- `EVT_36_BODY_001`: Sunday–Wednesday–Sunday recovery limitation and competition-selection choices.
- `EVT_36_CCH_001`: arrival of a younger coach and authority/load negotiation.
- `EVT_36_RECORD_001`: real match-700 milestone versus rest.
- `EVT_36_PEER_001`: a veteran peer retires and becomes a mirror for the player's own retirement distance.
- `EVT_36_LOWER_001`: low market floor plus an actual lower-division starting offer.
- `EVT_37_SHORT_001`: three-month emergency contract for a free agent.
- `EVT_37_HOME_001`: Valdoria offers exactly a limited ten-match closure role.
- `EVT_37_PEN_001`: an actual penalty in a possible farewell context; the game must not manufacture a cinematic finish.
- `EVT_38_MARKET_001`: real silence rather than a generic veteran market event.

## Migration implications

- completed legacy history stays under its legacy ID;
- pending legacy choices retain the definition the player saw;
- no canonical `SEEN_*` is created from title/theme similarity;
- compatibility-only legacy definitions may resolve old pending content, but never schedule in the canonical catalog;
- canonical IDs must be active for new canonical scenes;
- seed ownership moves prospectively to canonical creators and does not rewrite historical `originEvent` without separately proven equivalence.

## Status

**04C_LEGACY_REVIEW_COMPLETE — 10/10 REVIEWED — 9 NEW UNIQUE — 0 SAME-SCENE MIGRATIONS**
