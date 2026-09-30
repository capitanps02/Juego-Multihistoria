# MUIR P12 — manual physical/external evidence

Do not create `analysis/muir/p12/manual-device-evidence.json` until the checks were actually executed.

The final gate accepts it only when it is tied to the exact P12 HEAD and a concrete Android build hash.

Required shape:

```json
{
  "sha": "<exact P12 HEAD>",
  "buildHash": "<tested Android build hash>",
  "device": {
    "model": "<physical device>",
    "androidVersion": "<version>",
    "resolution": "<resolution>",
    "navModes": ["gesture", "3-button"]
  },
  "talkBack": "PASS",
  "gestureNavigation": "PASS",
  "threeButtonNavigation": "PASS",
  "physicalCutout": "PASS",
  "nativePickerRoundtrip": "PASS",
  "androidSummary": "PASS",
  "androidOffer": "PASS",
  "androidCinematicFallback": "PASS",
  "androidEpilogue": "PASS",
  "remotePlayCanvasScene2593315": "PASS",
  "evidence": ["<logs/screenshots/run IDs>"],
  "approval": {"owner":"<human owner>","date":"<date>"}
}
```

Browser/emulator evidence must never be relabelled as physical TalkBack, cutout, navigation-mode or native-picker evidence.
