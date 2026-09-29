# MUIR P0 — Package graph certification

Frozen product baseline: `main@36d3d1b0750b0ded877e55953f223e2de1169a46`  
P0 branch: `ui-a0/muir-p0-baseline`

## Shared graph

```
GameSession / PlayerView
        |
        +--> web/game-ui.js
              |--> web/cutscene-player.js
              |--> web/club-names.js
              |--> web/indexed-save-store.js
        |
        +--> Web direct mount
        +--> PlayCanvas generated bundle
        +--> Android offline copied ESM graph
```

## K-01 finding

Original baseline Android packaging copied `web/game-ui.js` but omitted its direct runtime dependency
`web/cutscene-player.js`.

This was a packaging defect, not a separate Android implementation and not a gameplay defect.

## P0 repair

P0 adds only the already-required transitive module to the Android offline package:

- `scripts/build-android-offline.mjs` copies `web/cutscene-player.js`.
- `scripts/test-android-offline.mjs` requires that module in the offline manifest.
- the Android test also checks the `game-ui.js -> cutscene-player.js` dependency and exported player implementation.
- `scripts/test-muir-package-graph.mjs` protects the shared dependency graph.

No UI, gameplay, RNG, state schema, narrative, market, contract, selection or Player Actions authority changed.

## Execution evidence

GitHub Actions run `36483205844` on P0 head `aa93c4a8706e7a4cf3b5db795d8970c7502271db`:

- MUIR fixture contracts — PASS
- MUIR package graph — PASS
- PlayCanvas — PASS
- Android offline test — PASS
- Football platform parity — PASS

The separate step labelled Android offline clean package failed because the workflow invoked the nonexistent npm alias
`build:android:offline`. The repository's canonical builder alias is `android:offline`.
That workflow-only command has been corrected. A later clean execution is required before final K-01 PASS.

## Gate state

Current K-01 state: **IN_PROGRESS — SOURCE REPAIR + GRAPH TEST PASS, CLEAN BUILD RECONFIRMATION PENDING**.
