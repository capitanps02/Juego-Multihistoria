# MUIR K-02 — Cinematic resolution audit

Baseline: `36d3d1b0750b0ded877e55953f223e2de1169a46`

Status: **SOURCE_GRAPH_REPAIRED / EXECUTION_PENDING**

## Public authority

`PlayerView.cutscene` is an optional `EventCutscene`. The session resolves it from exact event identity / prologue / epilogue presentation state. Playback is presentation-only: `web/cutscene-player.js` dispatches no career command and writes no save.

## Resolution matrix

| Platform/path | Resolution | Missing media behavior | P0 finding |
|---|---|---|---|
| Web | default `/web/assets/cutscenes/<file>` | player remains usable; explicit fallback copy | DEFINED |
| PlayCanvas | `app.assets.find(clip.file)?.getFileUrl() ?? null` | null means player omitted; no invented URL | DEFINED |
| Android offline | production `mountGame` default path would resolve against packaged local origin | builder now copies `cutscene-player.js`; exact-head clean build/runtime execution remains pending | REPAIRED_PENDING_EXECUTION |
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

K-01 source graph has been repaired by packaging the already-required `cutscene-player.js` module and guarding it in the Android offline test. K-02 remains short of PASS until exact-head clean build/runtime execution confirms the packaged path. P0 must not generate narrative video or change story content.
