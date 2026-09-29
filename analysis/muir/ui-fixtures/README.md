# MUIR P0 deterministic UI fixtures

These files are test-only evidence infrastructure. Production Web, PlayCanvas and Android entrypoints do not import this directory.

Rules:

- Frozen authority: `main@36d3d1b0750b0ded877e55953f223e2de1169a46`.
- Fixtures use production `GameSession` commands and consume public `PlayerView`.
- No private GameState field may be projected directly into UI evidence.
- No visual fixture may invent a product feature or a public field.
- Animations may be disabled only by the future visual-test page/runner.
- Variable video frames are never pixel-perfect goldens.
- Cinematic evidence must use container/poster/stub/controls/missing-asset/fallback checks.
- `cinematic-fallback` and `epilogue-retirement` deliberately remain fail-closed until dedicated adapters can reproduce them without fabricating state.

Required screenshot naming contract:

`<BASE_SHA_12>__<fixture-id>__<width>x<height>__<sha256-12>.png`

Primary viewport: 390x844. Required phone matrix: 360x800, 390x844, 412x915.
