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

## Execution constraint discovered

The repository currently has no Playwright/Puppeteer/Chromium screenshot dependency or screenshot runner. Existing project documentation also records that prior UI certification environments did not include a graphical browser.

Therefore P0 must not claim screenshots as captured merely because a browser fixture page exists.

The next reproducible step is to add a test-only screenshot runner/tooling dependency or run the harness in an environment that supplies a browser. This decision belongs to P0 infrastructure and must remain excluded from release packaging.

## Required evidence before Pass 2 can close

1. Run fixture contract tests at the exact P0 branch head.
2. Run K-01 package graph probe.
3. Serve the repository after build.
4. Open the MUIR harness for every required fixture/viewport.
5. Wait for `window.__MUIR_READY__.ready === true`.
6. Capture PNG.
7. SHA-256 every PNG.
8. Record dimensions, fixture id, baseline SHA and tool versions.
9. Capture primary surfaces at all three required phone widths.
10. Record landscape/tablet severe-breakage checks.

Until those exist, screenshot status is `NOT_CAPTURED`, not PASS.
