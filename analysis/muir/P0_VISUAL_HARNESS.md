# MUIR P0 — Visual harness status

Baseline: `36d3d1b0750b0ded877e55953f223e2de1169a46`

## Implemented

- 21 named fixture targets.
- Required 360x800, 390x844 and 412x915 phone matrix.
- Landscape and tablet check targets.
- Session recipes use production GameSession/public PlayerView.
- Browser harness mounts the production `web/game-ui.js` rather than a cloned UI.
- Player Actions menu/category/detail/result are reached through real UI controls.
- Motion suppression exists only inside the MUIR test page.
- Screenshot filename/hash contract is defined.
- Epilogue uses the same terminal-state recipe already exercised by T5.5 tests.
- Cinematic missing-asset remains fail-closed until the browser path can inject a real cutscene-bearing public view without fabricating state.

## Browser capture runner

The canonical test-only runner is `scripts/capture-muir-browser.mjs`. CI installs Playwright Chromium only inside the certification job, serves repository files from an ephemeral localhost port, opens a fresh browser context per target, captures viewport-sized PNGs, verifies exact PNG dimensions, and writes metrics to `analysis/muir/evidence/browser-baseline.json`.

The runner never ships in Web, PlayCanvas or Android product bundles. `cinematic-fallback` is recorded as `N/A_JUSTIFIED` for screenshot capture because its session recipe deliberately fails closed rather than fabricating a public view; K-02 package/source probes stay authoritative for the missing/fallback path.

Execution on the exact P0 head is still required before screenshot or performance requirements can be marked PASS.

## Required evidence before Pass 2 can close

1. Run fixture contract tests at the exact P0 branch head.
2. Run K-01 package graph probe.
3. Run `node scripts/capture-muir-browser.mjs` on the exact head.
4. Verify `window.__MUIR_READY__.ready === true` directly in Playwright before every capture.
5. Capture PNG and verify its exact pixel dimensions.
6. SHA-256 every PNG and rename it with the evidence hash.
7. Record dimensions, fixture id, baseline SHA and Chrome version.
8. Capture the primary 390x844 matrix plus representative primary surfaces at 360x800 and 412x915.
9. Record landscape/tablet severe-breakage checks.
10. Persist aggregate render, DOM, Long Task, auto-sim update, focus, scroll, touch-target and overflow metrics.

Until those exist, screenshot status is `NOT_CAPTURED`, not PASS.
