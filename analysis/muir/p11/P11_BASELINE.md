# MUIR P11 — Pass 1 baseline / platform preflight

P10_CERTIFIED_SHA: 512730e8e1830935e841751c72419daf82e84ca9
P11_BASE_SHA: 512730e8e1830935e841751c72419daf82e84ca9
P11_BRANCH: ui-a7/muir-p11-performance-platforms
P10_GATE: PASS

## Certified predecessor evidence
- Exact P10 workflow: 36707193460 = SUCCESS on 512730e8e1830935e841751c72419daf82e84ca9.
- P0 frozen product baseline: 36d3d1b0750b0ded877e55953f223e2de1169a46.
- P0 exact certification branch head: c5b6d0d6d18802a62d174bf450c95ebf1d0403c0.
- P5 certified candidate: c104d292b0f168ff913d746e9635e52dc6799757.

## Pass 1 finding — Android cutscenes
At the P10-certified base, web/game-ui.js defaults cutscene URLs to /web/assets/cutscenes/<file>.
The Android offline builder packaged web/cutscene-player.js but packaged zero web/assets/cutscenes/*.webm files.
That means build green did not prove offline cinematic asset availability.

P11 repair is packaging-only:
- copy the shared cutscene asset directory into the Android offline package;
- resolve Android cutscene URLs from web/local.js via import.meta.url;
- validate the full transitive web UI + engine graph;
- add negative graph tests for a missing module and missing cutscene asset.

Gameplay, RNG, PlayerView, DB authority and save schema are unchanged.
