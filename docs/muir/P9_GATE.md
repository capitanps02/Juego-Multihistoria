# MUIR P9 Gate

P9_GATE: READY_FOR_GATE
P8_CERTIFIED_SHA: ecc72b9abebbc64533c86b1f3cf7009a127c0c02
P9_1_FROZEN_SHA: 7db5d9ded08e0b020fc4a2f916fd974fa4091cbf
P9_2_CERTIFIED_SHA: 8308794aa5734a2b06c5b952925aba07c5cc9f68
P9_3_CERTIFIED_SHA: 5993f90f9e4eba9d1fb1029258f23b9a4589396b
P9_4_CERTIFIED_SHA: 998e8e0b493f3db52b16df9088bd6878c6ec5f79
P9_5_CERTIFIED_SHA: 8f104808e0c6bc8ac7a0697406add7a5c2731853

ANDROID_BACK_WIRING: PASS
ANDROID_SPA_BACK_ROUTING: READY_FOR_GATE
ANDROID_EMULATOR_BACK: READY_FOR_GATE
ANDROID_PHYSICAL_BACK: NOT_EXECUTABLE

Final P9 PASS requires a SUCCESS run of MUIR P9 Immersive on the exact containing HEAD with:
- all P9 static contracts;
- full session/save/persistence regressions;
- full PlayCanvas package tests;
- Android offline package test;
- Decision/Result/Offer/Cinematic browser matrices;
- AXE serious/critical = 0;
- zero horizontal overflow;
- src/** byte-identical to certified P8;
- MUIR RTM P9 rows all PASS.

Physical-device Android Back remains outside CI. Android API 35 instrumentation demonstrated that WebView.canGoBack() can be false while SPA history.length is 2. P9.6 therefore permits one presentation-only Android product change: MainActivity falls back to SPA history.back() before exiting the Activity. The emulator gate must verify pending Decision and Result remain byte-identical across native Back.
