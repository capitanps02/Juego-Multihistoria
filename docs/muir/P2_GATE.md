# MUIR P2 — Final gate checklist

P1 certified predecessor: `dcd9087cb68a73ed9a20db85e1ee96b434942826`.

Implementation evidence run: #31 / `36541438067` on `1a4d18ae9d784c0573ab40e2617764dec5c21ec3` — SUCCESS.

- [x] P1 formal gate is PASS.
- [x] P2 branch starts from the exact P1 certified SHA.
- [x] Shared shell consumes top/right/bottom/left safe-area insets.
- [x] Safe-area handling covers portrait, compact landscape, tablet and shell status overlays.
- [x] Mobile navigation labels are at least 10 px.
- [x] Primary shell controls meet at least 48 px touch height.
- [x] Auto-sim topbar Pausar/Reanudar and Tu partida are 48 px and non-overlapping at 360/390/412.
- [x] 360x800, 390x844 and 412x915 deterministic browser captures have no horizontal overflow.
- [x] 844x390 compact landscape and 768x1024 tablet checks pass.
- [x] Keyboard navigation, focus-visible and aria-current behavior pass.
- [x] Scoped AXE audit reports zero serious/critical shell violations.
- [x] VDR-NAV-001 is ACCEPTED with six direct destinations preserved.
- [x] Web, PlayCanvas and Android offline share the same shell presentation authority.
- [x] Android offline preserves viewport-fit=cover and byte-identical shared game-ui.css.
- [x] P2 changes no gameplay, RNG, persistence, DB, Player Actions, GameSession or PlayerView authority.
- [x] web/game-ui.js remains unchanged from P1 certified authority.
- [x] MUIR-RTM records all 11 P2 requirements as PASS.
- [x] Visual evidence is retained as a GitHub Actions artifact.

**P2_GATE: PASS**, subject to executable exact-head verification by `scripts/test-muir-p2-final-gate.mjs`.
