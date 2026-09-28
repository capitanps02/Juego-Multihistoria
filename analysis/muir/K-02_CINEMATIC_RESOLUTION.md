# MUIR K-02 — Cinematic resolution audit

Baseline: `36d3d1b0750b0ded877e55953f223e2de1169a46`

Status: **BLOCKED_BY_K01_ANDROID / WEB_AND_PLAYCANVAS_PATHS_DEFINED**

## Public authority

`PlayerView.cutscene` is an optional `EventCutscene`. The session resolves it from exact event identity / prologue / epilogue presentation state. Playback is presentation-only: `web/cutscene-player.js` dispatches no career command and writes no save.

## Resolution matrix

| Platform/path | Resolution | Missing media behavior | P0 finding |
|---|---|---|---|
| Web | default `/web/assets/cutscenes/<file>` | player remains usable; explicit fallback copy | DEFINED |
| PlayCanvas | `app.assets.find(clip.file)?.getFileUrl() ?? null` | null means player omitted; no invented URL | DEFINED |
| Android offline | production `mountGame` default path would resolve against packaged local origin | cannot execute because imported `cutscene-player.js` is absent from Android builder graph | BLOCKED K-01 |
| MUIR visual harness | injectable `cutsceneUrl` | dedicated missing-asset URL planned | IN_PROGRESS |

## Player behavior

Normal event:
- video is muted initially;
- controls and `playsInline` are enabled;
- explicit `Saltar escena`;
- Escape can stop the scene;
- media error copy: user can continue with the decision.

Prologue:
- modal player;
- explicit play with sound;
- explicit skip;
- media error changes continuation to `Empezar historia`;
- Escape finishes presentation.

Disposal pauses video, removes src and reloads the media element.

## Asset authority

`scripts/test-event-cutscenes.mjs` verifies the catalog and reads every declared WEBM from `web/assets/cutscenes/`. This is source/package evidence, not current-head execution evidence for P0.

## Gate consequence

K-02 cannot be PASS for Android until K-01 is fixed and the offline package contains the transitive cinematic module and media strategy required by the product. P0 must not generate narrative video or change story content.
