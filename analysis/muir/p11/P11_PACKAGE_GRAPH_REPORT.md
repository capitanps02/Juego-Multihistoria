# MUIR P11 — Package graph / platform packaging report

PREDECESSOR: 512730e8e1830935e841751c72419daf82e84ca9
STATUS: PASS_CONDITIONAL_EXACT_HEAD

## Android offline closure
- 436 packaged files on the certified package candidate.
- 65,295,811 packaged bytes on the candidate.
- 33/33 WebM cutscene assets present.
- web/cutscene-player.js present.
- club-name and semantic helper modules resolved transitively.
- WebViewAssetLoader origin: https://appassets.androidplatform.net/assets/
- INTERNET permission: absent.
- CSP connect-src: none.
- external network URLs: none.

## Graph gates
- Full transitive shared UI + engine graph: PASS.
- Missing required module negative test: PASS (gate fails as intended).
- Missing cutscene asset negative test: PASS (gate fails as intended).
- PlayCanvas transitive shared UI graph: PASS.

## PlayCanvas
- Generated modules: 171.
- Candidate generated bundle: 17,731,199 B.
- Candidate SHA-256: a3fd6bcd74693c3fcb49817181a1514ff0c03835935717632e510c90a091b6ce.
- Engine/RNG/state package regression: PASS.
- Generated adapter Chromium smoke: PASS.
- Summary/Decision/Result/Offer/Epilogue state matrix: PASS.
- Remote editor/scene 2593315: NOT_EXECUTABLE_IN_CURRENT_ENVIRONMENT.

## Cutscenes
- 29 unique event clips bind only to valid events/files.
- Android local cinematic closure is byte-for-byte checked.
- Missing-media fallback remains mandatory and tested separately.

Final certification remains conditional on the exact closing HEAD package workflow.
