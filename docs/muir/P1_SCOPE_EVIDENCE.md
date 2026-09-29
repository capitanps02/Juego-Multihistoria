# MUIR P1 — Scope and non-redesign evidence

P0 certified base: `c5b6d0d6d18802a62d174bf450c95ebf1d0403c0`.

P1 branch: `ui-a0/muir-p1-design-contract`.

## What P1 changed

Documentation/design-contract artifacts only:

- visual inventory;
- surface protection contract;
- semantic token reference (not imported by production);
- design contract;
- component semantic matrix;
- copy contract;
- icon contract;
- A/B rubric;
- VDR template and four PROPOSED VDRs;
- RTM traceability.

## What P1 did not change

- `web/game-ui.js`
- `web/game-ui.css`
- GameSession
- PlayerView
- RNG
- persistence/save schema
- market/contracts/selection
- Football Database
- Player Actions authority
- any production screen layout
- navigation behavior
- gameplay
- public data fields

## Screen redesign evidence

No complete screen was redesigned in P1. No production CSS/JS is imported from `docs/muir/tokens.css`; it is a reference artifact only.

The first visual implementation changes remain deferred to later authorized MUIR passes.

## Feature authority evidence

P1 explicitly preserves the P0 absent-feature list: no editable name, GRL, detailed attributes, standings, tactics, dedicated market screen, cloud save, predictive choices/effects or private relationship/Player Action internals.

## Gate interpretation

A design contract may be PASS while implementation remains unchanged. P1 PASS authorizes later visual implementation to use these contracts; it does not authorize new gameplay or P2 unless the user separately authorizes P2.
